import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { canonical, sha256, createPrivateNote, encryptNoteBackup, noteHash, type Policy, type ProofBundle } from '../../src/vendor/core-client/index.js';
import { policy as basePolicy, vault } from './invoice-fixture';
const password = 'public browser proof fixture only', disclosureRoot = 'cd'.repeat(32);
const artifactRoot = process.env.CORE_PROVER_ARTIFACTS_DIR;
const digest = (value: Buffer | string) => createHash('sha256').update(value).digest('hex');
async function setup(page: Page, real = false) {
  let policy: Policy = {...basePolicy};
  let manifest = Buffer.from('{}'), wasm = Buffer.from('not a circuit'), zkey = Buffer.from('not a proving key'), key = Buffer.from('{}');
  if (real) {
    if (!artifactRoot) throw new Error('CORE_PROVER_ARTIFACTS_DIR is required for actual browser proving');
    [manifest,wasm,zkey,key] = await Promise.all(['manifest.json','spend_js/spend.wasm','spend.zkey','verification_key.json'].map(file => readFile(resolve(artifactRoot,file))));
    const vk=JSON.parse(key.toString()), values=[...vk.vk_alpha_1.slice(0,2),...vk.vk_beta_2.slice(0,2).flat(),...vk.vk_gamma_2.slice(0,2).flat(),...vk.vk_delta_2.slice(0,2).flat(),...vk.IC.flatMap((point:string[])=>point.slice(0,2))];
    const raw=Buffer.concat(values.map((value:string)=>Buffer.from(BigInt(value).toString(16).padStart(64,'0'),'hex').reverse()));
    policy={...policy,verifierSha256:digest(raw)};
  }
  const note=await createPrivateNote(policy), backup=await encryptNoteBackup(policy,note,password);
  let level=[note.commitment,...Array<string>(255).fill('0')];
  for(let d=0;d<8;d++){const next:string[]=[];for(let i=0;i<level.length;i+=2)next.push(noteHash([level[i],level[i+1]]));level=next;}
  const context={version:1,policy,root:level[0],commitments:[note.commitment],vault,checkedAtBlock:{hash:'B'.repeat(44),height:20}};
  await page.goto('/prove/');
  const upload=async(label:string,name:string,buffer:Buffer)=>page.getByLabel(label,{exact:true}).setInputFiles({name,mimeType:'application/octet-stream',buffer});
  await upload('Trusted FT policy JSON','policy.json',Buffer.from(JSON.stringify(policy)));
  await page.getByLabel('Note passphrase',{exact:true}).fill(password);
  await upload('Encrypted note backup','backup.json',Buffer.from(backup));
  await expect(page.locator('.note-commitment')).toHaveText(note.commitment);
  await page.getByLabel('Trusted proving manifest SHA-256',{exact:true}).fill(real?digest(manifest):'00'.repeat(32));
  for(const [label,name,data] of [['Proving manifest JSON','manifest.json',manifest],['Circuit WASM file','spend.wasm',wasm],['Proving key file','spend.zkey',zkey],['Verification key JSON','verification_key.json',key]] as const)await upload(label,name,data);
  await upload('Or import public group snapshot JSON','context.json',Buffer.from(JSON.stringify(context)));
  await expect(page.locator('.prover-snapshot')).toBeVisible();
  await page.getByLabel('Recipient account',{exact:true}).fill('receiver.testnet');
  await page.getByLabel('Disclosure root',{exact:true}).fill(disclosureRoot);
  return {note,policy,upload,context};
}
async function controlledWorker(page: Page) {
  await page.addInitScript(()=>{
    const w=window as unknown as {proverTerminations:number;proverRequests:number};w.proverTerminations=0;w.proverRequests=0;
    window.Worker=class extends EventTarget {
      postMessage(message:{id:string}){w.proverRequests++;queueMicrotask(()=>this.dispatchEvent(new MessageEvent('message',{data:{id:message.id,type:'progress',stage:'proving'}})));}
      terminate(){w.proverTerminations++;}
    } as unknown as typeof Worker;
  });
}
test('untrusted proving files fail before a witness or public plan can be produced',async({page})=>{
  const {note}=await setup(page), outgoing:string[]=[];
  page.on('request',request=>outgoing.push(request.url()+(request.postData()??'')));
  await page.getByRole('button',{name:'Generate local proof',exact:true}).click();
  await expect(page.getByRole('main').getByRole('alert')).toContainText('integrity or policy');
  await expect(page.locator('.prover-result')).toHaveCount(0);
  expect(outgoing.some(value=>value.includes(note.secret)||value.includes(note.nullifier)||value.includes(password))).toBe(false);
  await expect(page.locator('body')).not.toContainText(note.secret);
  await expect(page.locator('body')).not.toContainText(note.nullifier);
});
test('cancel stops the worker and leaves no downloadable result',async({page})=>{
  await controlledWorker(page);await setup(page);
  await page.getByRole('button',{name:'Generate local proof',exact:true}).click();
  await expect(page.getByRole('status')).toContainText('Generating your proof');
  await page.getByRole('button',{name:'Cancel operation',exact:true}).click();
  await expect(page.getByRole('status')).toContainText('Cancelled');
  expect(await page.evaluate(()=>(window as any).proverTerminations)).toBe(1);
  await expect(page.locator('.prover-result')).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Generate local proof',exact:true})).toBeEnabled();
});
test('page hide cancels proving and synchronously clears the open note',async({page})=>{
  await controlledWorker(page);await setup(page);
  await page.getByRole('button',{name:'Generate local proof',exact:true}).click();
  await expect(page.getByRole('status')).toContainText('Generating your proof');
  const snapshot=await page.evaluate(()=>{
    window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true}));
    return {commitment:document.querySelector('.note-commitment')?.textContent,terminations:(window as any).proverTerminations,password:(document.querySelector('input[type="password"]') as HTMLInputElement)?.value};
  });
  expect(snapshot).toEqual({commitment:undefined,terminations:1,password:''});
  await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));
  await expect(page.locator('.prover-result')).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Generate local proof',exact:true})).toBeDisabled();
});
test('a failed or changed public snapshot clears the previous proving context',async({page})=>{
  const {context,upload}=await setup(page);
  await upload('Or import public group snapshot JSON','too-large.json',Buffer.alloc(32001,32));
  await expect(page.locator('.prover-snapshot')).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Generate local proof',exact:true})).toBeDisabled();
  await page.getByLabel('Payment service origin',{exact:true}).fill('https://core-api.example');
  await page.route('https://core-api.example/v1/config',route=>route.fulfill({json:{policy:context.policy}}));
  await page.route('https://core-api.example/v1/proofs/context',route=>route.fulfill({json:{...context,vault:`v${'b'.repeat(32)}.${context.policy.registry}`}}));
  await expect(page.locator('.prover-snapshot')).toHaveCount(0);
  await page.getByRole('button',{name:'Load finalized group snapshot',exact:true}).click();
  await expect(page.getByRole('main').getByRole('alert')).toContainText('substituted');
  await expect(page.locator('.prover-snapshot')).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Generate local proof',exact:true})).toBeDisabled();
});
test('actual WASM proof exports, reopens and rejects a cryptographically altered file',async({page},info)=>{
  test.skip(!artifactRoot,'Set CORE_PROVER_ARTIFACTS_DIR; integrated CI requires actual proving artifacts.');
  test.setTimeout(120000);
  const {note,upload}=await setup(page,true);
  await page.getByRole('button',{name:'Generate local proof',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Proof verified locally',exact:true})).toBeVisible({timeout:90000});
  const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Download proof file',exact:true}).click();
  const file=info.outputPath('public-proof.json');await(await pending).saveAs(file);const contents=await readFile(file,'utf8'), bundle=JSON.parse(contents) as ProofBundle;
  expect(contents).not.toContain(note.secret);expect(contents).not.toContain(note.nullifier);expect(contents).not.toContain(password);
  await upload('Verify an existing proof file','proof.json',Buffer.from(contents));
  await expect(page.getByRole('status')).toContainText('Proof file integrity and Groth16 proof verified');
  await page.locator('.prover-result').scrollIntoViewIfNeeded();
  await page.screenshot({path:`/tmp/core-local-proofs-${info.project.name}.png`});
  await upload('Verify an existing proof file','too-large.json',Buffer.alloc(24001,32));
  await expect(page.locator('.prover-result')).toHaveCount(0);
  await expect(page.getByRole('main').getByRole('alert')).toContainText('no larger');
  bundle.spend.proof=(bundle.spend.proof[0]==='A'?'B':'A')+bundle.spend.proof.slice(1);
  const msg=JSON.parse(bundle.plan.tokenCall.args.msg as string);msg.proof=bundle.spend.proof;bundle.plan.tokenCall.args.msg=JSON.stringify(msg);
  const {digest:_,...payload}=bundle;bundle.digest=await sha256(canonical(payload));
  await upload('Verify an existing proof file','altered.json',Buffer.from(JSON.stringify(bundle)));
  await expect(page.getByRole('main').getByRole('alert')).toContainText('Proof verification failed');
  await expect(page.locator('.prover-result')).toHaveCount(0);
  expect(await page.evaluate(()=>JSON.stringify({...localStorage,...sessionStorage}))).not.toContain(note.secret);
  if(info.project.name==='mobile')await page.setViewportSize({width:320,height:740});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight+1)).toBe(true);
});
test('cancelling an actual prover worker allows a fresh operation',async({page})=>{
  test.skip(!artifactRoot,'Set CORE_PROVER_ARTIFACTS_DIR; integrated CI requires actual proving artifacts.');
  test.setTimeout(120000);await setup(page,true);
  await page.getByRole('button',{name:'Generate local proof',exact:true}).click();
  await expect(page.getByRole('button',{name:'Cancel operation',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Cancel operation',exact:true}).click();
  await expect(page.getByRole('status')).toContainText('Cancelled');
  await expect(page.locator('.prover-result')).toHaveCount(0);
  await page.getByRole('button',{name:'Generate local proof',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Proof verified locally',exact:true})).toBeVisible({timeout:90000});
});
