import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { createPrivateNote, encryptNoteBackup, noteHash, invoiceRoot, OperationJournal, type PrivateNote, type Policy } from '../../src/vendor/core-client/index.js';
import { fixture, issue, policy as basePolicy, vault } from './invoice-fixture';
const artifactRoot=process.env.CORE_PROVER_ARTIFACTS_DIR, notePassword='public checkout note fixture only', journalPassword='public checkout journal fixture only';
const sha=(bytes:Buffer|string)=>createHash('sha256').update(bytes).digest('hex');
let loaded:Promise<{policy:Policy;files:Buffer[]}>|undefined;
async function artifacts(){
  return loaded??= (async()=>{
    if(!artifactRoot)throw new Error('Actual proving files are required');
    const files=await Promise.all(['manifest.json','spend_js/spend.wasm','spend.zkey','verification_key.json'].map(file=>readFile(resolve(artifactRoot,file))));
    const vk=JSON.parse(files[3].toString()),values=[...vk.vk_alpha_1.slice(0,2),...vk.vk_beta_2.slice(0,2).flat(),...vk.vk_gamma_2.slice(0,2).flat(),...vk.vk_delta_2.slice(0,2).flat(),...vk.IC.flatMap((p:string[])=>p.slice(0,2))];
    const raw=Buffer.concat(values.map((value:string)=>Buffer.from(BigInt(value).toString(16).padStart(64,'0'),'hex').reverse()));
    return {policy:{...basePolicy,verifierSha256:sha(raw)},files};
  })();
}
async function setup(page:Page,options:{delayed?:boolean;lostResponse?:boolean;hidePending?:boolean;prerequisite?:boolean}={}){
  const data=await artifacts(), f=await fixture(page,{...options,policy:data.policy});
  const created=await issue(page,data.policy),notes=await Promise.all([createPrivateNote(data.policy),createPrivateNote(data.policy)]);
  let level=[...notes.map(n=>n.commitment),...Array<string>(254).fill('0')];
  for(let d=0;d<8;d++){const next:string[]=[];for(let i=0;i<level.length;i+=2)next.push(noteHash([level[i],level[i+1]]));level=next;}
  const contexts:unknown[]=[];
  await page.route('https://core-api.example/v1/proofs/context',async route=>{const body=route.request().postDataJSON();contexts.push(body);await route.fulfill({json:{version:1,policy:data.policy,vault,root:level[0],commitments:notes.map(n=>n.commitment),checkedAtBlock:{hash:'B'.repeat(44),height:200}}});});
  await page.evaluate(()=>localStorage.setItem('fixtureInvoiceAccount','payer.testnet'));await page.goto(created.link);
  await page.getByLabel('Payment service origin',{exact:true}).fill('https://core-api.example');
  await page.getByLabel('Trusted policy JSON',{exact:true}).setInputFiles({name:'policy.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data.policy))});
  await page.getByRole('button',{name:'Verify API policy',exact:true}).click();
  await page.getByRole('button',{name:'Connect payment wallet',exact:true}).click();await page.getByText('Invoice Fixture Wallet',{exact:true}).click();
  await page.getByLabel('Journal passphrase',{exact:true}).fill(journalPassword);await page.getByRole('button',{name:'Create journal',exact:true}).click();
  const form=page.getByLabel('Invoice note payment',{exact:true});await expect(form).toBeVisible();
  await form.getByText('Trusted proving files',{exact:true}).click();
  await form.getByLabel('Trusted proving manifest SHA-256',{exact:true}).fill(sha(data.files[0]));
  for(const [index,label] of ['Proving manifest JSON','Circuit WASM file','Proving key file','Verification key JSON'].entries())await form.getByLabel(label,{exact:true}).setInputFiles({name:['manifest.json','spend.wasm','spend.zkey','verification_key.json'][index],mimeType:'application/octet-stream',buffer:data.files[index]});
  await form.getByLabel('Payout vault',{exact:true}).fill(vault);
  const open=async(note:PrivateNote)=>{
    await form.getByLabel('Note passphrase',{exact:true}).fill(notePassword);
    await form.getByLabel('Select encrypted note',{exact:true}).setInputFiles({name:'encrypted-note.json',mimeType:'application/json',buffer:Buffer.from(await encryptNoteBackup(data.policy,note,notePassword))});
    await expect(form.locator('.note-commitment')).toHaveText(note.commitment);
  };
  const prove=async()=>{await form.getByRole('button',{name:'Generate invoice proof',exact:true}).click();await expect(form.getByRole('heading',{name:'Invoice proof ready',exact:true})).toBeVisible({timeout:90000});};
  const calls=()=>page.evaluate(()=>(window as any).fixturePaymentCalls as any[]);
  const journal=async()=>{
    const key=`core-live-journal-v1:${data.policy.network}:${data.policy.registry}`,envelope=await page.evaluate(key=>localStorage.getItem(key),key);
    return new OperationJournal({read:async()=>envelope,write:async()=>{throw new Error('read-only test');},exclusive:async action=>action()},journalPassword).list();
  };
  return {...f,...data,created,notes,form,open,prove,calls,journal,contexts,treeRoot:level[0]};
}
test.beforeEach(()=>{test.skip(!artifactRoot,'Integrated CI provides CORE_PROVER_ARTIFACTS_DIR for actual connected proofs.');test.setTimeout(120000);});

test('real note proof requires separate storage/payment approvals then observes finalized confirmation',async({page},info)=>{
  const f=await setup(page,{delayed:true,prerequisite:true});await page.getByRole('combobox',{name:'Payment unit',exact:true}).selectOption('1');
  await f.open(f.notes[0]);await f.prove();expect(await f.calls()).toHaveLength(0);
  await expect(f.form.locator('.invoice-note-quote')).toContainText('1000000');await expect(f.form.locator('.invoice-note-quote')).toContainText('1500');
  await expect(f.form.locator('.invoice-note-binding')).toContainText(await invoiceRoot(f.created.signed.invoice,1));
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await f.form.locator('.invoice-note-quote h3').first().scrollIntoViewIfNeeded();
  await page.screenshot({path:`/tmp/core-invoice-proof-review-${info.project.name}.png`});
  await f.form.getByRole('button',{name:'Review amount & fees',exact:true}).click();
  await page.getByRole('button',{name:'Approve prerequisite in wallet',exact:true}).click();await expect(page.getByRole('button',{name:'Approve payment in wallet',exact:true})).toBeEnabled();expect(await f.calls()).toHaveLength(1);expect(f.pending.size).toBe(0);
  await page.getByRole('button',{name:'Approve payment in wallet',exact:true}).click();await expect(page.locator('.live-review')).toContainText('processing');
  const calls=await f.calls();expect(calls).toHaveLength(2);
  const tx=calls[1],msg=JSON.parse(tx.actions[0].params.args.msg);expect(tx.receiverId).toBe(f.policy.tokenId);expect(tx.actions[0].params.args.amount).toBe('1500');expect(msg.recipient).toBe(f.created.signed.invoice.recipient);expect(msg.disclosure_root).toBe(await invoiceRoot(f.created.signed.invoice,1));expect(msg.public_inputs[2]).toBe(f.treeRoot);
  const snark=createRequire(resolve(artifactRoot!,'../package.json'))('snarkjs');
  (globalThis as any).curve_bn128=await snark.curves.getCurveFromName('bn128',{singleThread:true});
  const bytes=Buffer.from(msg.proof,'base64'),limbs=Array.from({length:8},(_,i)=>BigInt('0x'+Buffer.from(bytes.subarray(i*32,(i+1)*32)).reverse().toString('hex')).toString());
  expect(await snark.groth16.verify(JSON.parse(f.files[3].toString()),msg.public_inputs,{protocol:'groth16',curve:'bn128',pi_a:[...limbs.slice(0,2),'1'],pi_b:[limbs.slice(2,4),limbs.slice(4,6),['1','0']],pi_c:[...limbs.slice(6),'1']})).toBe(true);
  (globalThis as any).curve_bn128=null;
  f.confirmPending();await expect(page.locator('.invoice-payment-confirmed')).toBeVisible();await expect(page.locator('.invoice-status')).toContainText('Partially paid');
  expect(await page.getByRole('combobox',{name:'Payment unit',exact:true}).inputValue()).toBe('1');expect(await f.calls()).toHaveLength(2);
  const publicData=JSON.stringify(f.bodies)+JSON.stringify(calls)+await page.evaluate(()=>JSON.stringify({...localStorage,...sessionStorage}));
  for(const note of f.notes)for(const secret of [note.secret,note.nullifier,notePassword,journalPassword])expect(publicData).not.toContain(secret);
  expect(f.contexts).toEqual([{vault}]);expect((await f.journal())[0].outcome).toBe('complete');
  await page.locator('.invoice-payment-confirmed').scrollIntoViewIfNeeded();await page.screenshot({path:`/tmp/core-invoice-note-payment-${info.project.name}.png`});
});
test('two original-group notes cover two distinct invoice units and a reused note is blocked locally',async({page})=>{
  const f=await setup(page);await f.open(f.notes[0]);await f.prove();await f.form.getByRole('button',{name:'Review amount & fees',exact:true}).click();await page.getByRole('button',{name:'Approve payment in wallet',exact:true}).click();await expect(page.locator('.invoice-payment-confirmed')).toBeVisible();
  await page.getByRole('combobox',{name:'Payment unit',exact:true}).selectOption('1');await expect(f.form.getByLabel('Trusted proving manifest SHA-256',{exact:true})).toHaveValue(sha(f.files[0]));
  await f.open(f.notes[0]);await f.form.getByRole('button',{name:'Generate invoice proof',exact:true}).click();await expect(page.locator('.live-feedback[role="alert"]')).toContainText('local withdrawal');expect(await f.calls()).toHaveLength(1);
  await f.form.getByRole('button',{name:'Lock selected note',exact:true}).click();await f.open(f.notes[1]);await f.prove();await f.form.getByRole('button',{name:'Review amount & fees',exact:true}).click();await page.getByRole('button',{name:'Approve payment in wallet',exact:true}).click();
  await expect(page.locator('.invoice-status')).toContainText('Paid in indexed confirmations');expect(f.settled.size).toBe(2);expect(await f.calls()).toHaveLength(2);
  const calls=await f.calls(),references=calls.map(call=>JSON.parse(call.actions[0].params.args.msg).disclosure_root);expect(new Set(references).size).toBe(2);expect((await f.journal()).every(op=>op.outcome==='complete')).toBe(true);
});
test('merchant revocation blocks both proof import and the final payment approval',async({page})=>{
  const f=await setup(page);await f.open(f.notes[0]);await f.prove();
  const url='https://core-api.example/v1/invoices/verify',deny=(route:any)=>route.fulfill({status:409,json:{error:'MERCHANT_KEY_REVOKED'}});
  await page.route(url,deny);await f.form.getByRole('button',{name:'Review amount & fees',exact:true}).click();await expect(page.locator('.live-feedback[role="alert"]')).toContainText('409');expect(await f.journal()).toHaveLength(0);expect(await f.calls()).toHaveLength(0);
  await page.unroute(url,deny);await f.form.getByRole('button',{name:'Review amount & fees',exact:true}).click();await expect(page.getByRole('button',{name:'Approve payment in wallet',exact:true})).toBeEnabled();
  await page.route(url,deny);await page.getByRole('button',{name:'Approve payment in wallet',exact:true}).click();await expect(page.locator('.live-feedback[role="alert"]')).toContainText('409');expect(await f.calls()).toHaveLength(0);expect((await f.journal())[0].attempts).toHaveLength(0);
});
test('cancelling the real invoice prover leaves no operation and permits an explicit retry',async({page})=>{
  const f=await setup(page);await f.open(f.notes[0]);await f.form.getByRole('button',{name:'Generate invoice proof',exact:true}).click();await f.form.getByRole('button',{name:'Cancel proof',exact:true}).click();
  await expect(f.form).toContainText('cancelled');await expect(f.form.getByRole('button',{name:'Generate invoice proof',exact:true})).toBeEnabled();expect(await f.journal()).toHaveLength(0);expect(await f.calls()).toHaveLength(0);
  await f.prove();await expect(f.form.getByRole('button',{name:'Review amount & fees',exact:true})).toBeEnabled();
});
test('page-cache entry during proving locks the journal and discards private note state',async({page})=>{
  const f=await setup(page);await f.open(f.notes[0]);const started=page.waitForEvent('worker');await f.form.getByRole('button',{name:'Generate invoice proof',exact:true}).click();await started;
  const snapshot=await page.evaluate(()=>{window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true}));return{notes:document.querySelectorAll('.invoice-note-payment .note-commitment').length,passwords:[...document.querySelectorAll<HTMLInputElement>('input[type="password"]')].map(x=>x.value)};});
  expect(snapshot.notes).toBe(0);expect(snapshot.passwords.every(p=>p==='')).toBe(true);await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));
  await expect(page.getByRole('heading',{name:'Your journal is unlocked',exact:true})).toHaveCount(0);await expect(page.getByRole('heading',{name:'Invoice proof ready',exact:true})).toHaveCount(0);await expect.poll(()=>page.workers().length).toBe(0);expect(await f.calls()).toHaveLength(0);
});
test('a lost wallet response is observed without a second signature or automatic resend',async({page})=>{
  const f=await setup(page,{delayed:true,lostResponse:true,hidePending:true});await f.open(f.notes[0]);await f.prove();await f.form.getByRole('button',{name:'Review amount & fees',exact:true}).click();await page.getByRole('button',{name:'Approve payment in wallet',exact:true}).click();
  await expect(page.locator('.live-review')).toContainText('Signature outcome is unknown');expect(await f.calls()).toHaveLength(1);expect((await f.journal())[0].attempts[0].state).toBe('uncertain');
  f.confirmPending();await expect(page.locator('.invoice-payment-confirmed')).toBeVisible();expect(await f.calls()).toHaveLength(1);
});
test('switching invoice units discards an existing proof and selected note while retaining public assets',async({page})=>{
  const f=await setup(page);await f.open(f.notes[0]);await f.prove();await page.getByRole('combobox',{name:'Payment unit',exact:true}).selectOption('1');
  await expect(f.form.getByRole('heading',{name:'Invoice proof ready',exact:true})).toHaveCount(0);await expect(f.form.locator('.note-commitment')).toHaveCount(0);await expect(f.form.locator('.invoice-note-binding')).toContainText(await invoiceRoot(f.created.signed.invoice,1));
  await expect(f.form.getByLabel('Trusted proving manifest SHA-256',{exact:true})).toHaveValue(sha(f.files[0]));expect(await f.journal()).toHaveLength(0);expect(await f.calls()).toHaveLength(0);
});
test('an invoice expiring after review cannot dispatch a wallet payment',async({page})=>{
  const f=await setup(page);await f.open(f.notes[0]);await f.prove();await f.form.getByRole('button',{name:'Review amount & fees',exact:true}).click();
  await expect(page.getByRole('button',{name:'Approve payment in wallet',exact:true})).toBeEnabled();
  await page.evaluate(expiry=>{Date.now=()=>Date.parse(expiry)+1;},f.created.signed.invoice.expiresAt);
  await page.getByRole('button',{name:'Approve payment in wallet',exact:true}).click();await expect(page.locator('.live-feedback[role="alert"]')).toContainText('expired');expect(await f.calls()).toHaveLength(0);expect((await f.journal())[0].attempts).toHaveLength(0);
});
