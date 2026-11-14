import {test,expect,type Page} from '@playwright/test';
import {createHash} from 'node:crypto';
import {canonical} from '../../src/vendor/core-client/index.js';
import {policy,vault} from './invoice-fixture';
const sha=(s:string)=>createHash('sha256').update(s).digest('hex'),field=(s:string)=>(BigInt('0x'+sha(s))&((1n<<253n)-1n)).toString();
const disclosureRoot='cd'.repeat(32),recipient='receiver.testnet',domain=field(`core:ft:v3|testnet|${policy.registry}|${policy.tokenId}|${policy.denomination}`);
const request={format:'core-relay-withdrawal-v1',policyHash:sha(canonical(policy)),vault,recipient,disclosureRoot,spend:{proof:Buffer.alloc(256).toString('base64'),public_inputs:['42','43','44',field(`core:action:ft:v3|${domain}|withdraw|${vault}|${recipient}|${disclosureRoot}`),domain]}};
async function setup(page:Page,options:{lost?:boolean;immediate?:boolean}={}){
 let posts=0,controls:string[]=[],current:any=null;const id=sha(canonical(request));
 await page.route('https://relay.example/**',async route=>{const url=new URL(route.request().url()),path=url.pathname,body=route.request().postDataJSON();
  const send=(data:unknown,status=200)=>route.fulfill({status,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(data)});
  if(path.endsWith('/config'))return send({policyHash:request.policyHash,policy,sponsor:'sponsor.testnet',scheduling:{maxBatchSize:8}});
  if(route.request().method()==='GET')return current?send(current):send({error:'RELAY_NOT_FOUND'},404);
  if(path==='/v1/relay/schedules'||path==='/v1/relay/requests'){
   posts++;const now=Date.now();current={id,principal:policy.denomination,assetTokenId:policy.tokenId,waitingForReconciliation:false,schedule:path.endsWith('schedules')?{requestId:id,revision:1,state:'waiting',createdAt:now,readyAt:now+90000,expiresAt:now+600000,timing:body.timing,error:null}:null,executions:[],settlement:{state:'NotFound',complete:false,retryAvailable:false,record:null}};
   if(options.lost)return route.abort('failed');return send(current);
  }
  const action=path.split('/').pop()!;controls.push(action);
  if(action==='cancel')current.schedule.state='cancelled';
  if(action==='reschedule'){current.schedule.state='waiting';current.schedule.revision++;}
  if(action==='resume')current.schedule.state='waiting';
  if(action==='reconcile')current.executions[0].state='final';
  if(action==='retry'){current.settlement={state:'Complete',complete:true,retryAvailable:false,record:{attempt:2,vault,recipient,disclosure_root:disclosureRoot}};current.executions.push({sequence:1,state:'final',transactionHash:'C'.repeat(44)});}
  return send(current);
 });
 await page.goto('/relay/');
 const upload=(label:string,data:unknown)=>page.getByLabel(label,{exact:true}).setInputFiles({name:'public.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});
 await upload('Trusted group policy JSON',policy);await page.getByLabel('Relay origin',{exact:true}).fill('https://relay.example');await upload('Public proof file',request);
 await page.getByRole('combobox',{name:'Delivery timing',exact:true}).selectOption(options.immediate?'immediate':'short');
 await page.getByRole('button',{name:'Review delivery',exact:true}).click();await expect(page.getByText('sponsor.testnet',{exact:true})).toBeVisible();
 const downloadEvent=page.waitForEvent('download');await page.getByRole('button',{name:'Save recovery receipt'}).click();const download=await downloadEvent,path=await download.path();
 return {upload,receiptPath:path!,posts:()=>posts,controls,read:()=>current,set:(v:any)=>current=v,id};
}
test('optional window review, waiting, cancellation and rescheduling preserve a single delivery',async({page})=>{
 const f=await setup(page);await expect(page.getByText('1500 atomic units · 0.15% · sponsored')).toBeVisible();
 await page.getByRole('button',{name:'Confirm scheduled delivery'}).click();await expect(page.getByText('Waiting for execution window',{exact:true})).toBeVisible();expect(f.posts()).toBe(1);
 await page.getByRole('button',{name:'Cancel queued delivery'}).click();await expect(page.getByText('Delivery cancelled',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Reschedule original delivery'}).click();await expect(page.getByText('Waiting for execution window',{exact:true})).toBeVisible();expect(f.controls).toEqual(['cancel','reschedule']);expect(f.posts()).toBe(1);
 const size=await page.evaluate(()=>[document.documentElement.scrollWidth,innerWidth,document.documentElement.scrollHeight,innerHeight]);expect(size[0]).toBeLessThanOrEqual(size[1]);expect(size[2]).toBeLessThanOrEqual(size[3]+1);
 await page.screenshot({path:`test-results/relay-${test.info().project.name}.png`,fullPage:true});
});
test('lost response and reload recover the original request without posting again',async({page})=>{
 const f=await setup(page,{lost:true});await page.getByRole('button',{name:'Confirm scheduled delivery'}).click();await expect(page.getByText('Check original request',{exact:true}).first()).toBeVisible();expect(f.posts()).toBe(1);
 await page.reload();await f.upload('Trusted group policy JSON',policy);await page.getByLabel('Recovery receipt JSON',{exact:true}).setInputFiles(f.receiptPath);await page.getByRole('button',{name:'Check original request',exact:true}).click();await expect(page.getByText('Waiting for execution window',{exact:true})).toBeVisible();expect(f.posts()).toBe(1);await expect(page.getByRole('button',{name:'Confirm scheduled delivery'})).toHaveCount(0);
});
test('expiry, blocked preflight and uncertain signing each expose the correct recovery action',async({page})=>{
 const f=await setup(page);await page.getByRole('button',{name:'Confirm scheduled delivery'}).click();await expect(page.getByText('Waiting for execution window',{exact:true})).toBeVisible();
 f.read().schedule.state='expired';await page.getByRole('button',{name:'Check original request',exact:true}).click();await expect(page.getByText('Delivery window expired',{exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Reschedule original delivery'})).toBeVisible();
 f.read().schedule.state='blocked';f.read().schedule.error='RELAY_NO_LIQUIDITY';await page.getByRole('button',{name:'Check original request',exact:true}).click();await expect(page.getByText('RELAY_NO_LIQUIDITY')).toBeVisible();await page.getByRole('button',{name:'Resume original delivery'}).click();
 f.read().schedule.state='executing';f.read().executions=[{sequence:0,state:'uncertain',transactionHash:'B'.repeat(44)}];await page.getByRole('button',{name:'Check original request',exact:true}).click();await expect(page.getByRole('button',{name:'Cancel queued delivery'})).toHaveCount(0);await page.getByRole('button',{name:'Reconcile original transaction'}).click();expect(f.posts()).toBe(1);
 f.read().settlement={state:'Retryable',complete:false,retryAvailable:true,record:{attempt:1,vault,recipient,disclosure_root:disclosureRoot}};await page.getByRole('button',{name:'Check original request',exact:true}).click();await page.getByRole('button',{name:'Retry original payout'}).click();await expect(page.getByText('Payment confirmed',{exact:true})).toBeVisible();expect(f.controls).toEqual(['resume','reconcile','retry']);
});
test('immediate delivery remains opt-in and finalized status is separate from transaction acceptance',async({page})=>{const f=await setup(page,{immediate:true});await page.getByRole('button',{name:'Confirm immediate delivery'}).click();await expect(page.getByText('Awaiting finalized payout',{exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Cancel queued delivery'})).toHaveCount(0);expect(f.posts()).toBe(1);});
test('edited proof file is rejected before contacting the relay',async({page})=>{await page.goto('/relay/');await page.getByLabel('Trusted group policy JSON',{exact:true}).setInputFiles({name:'policy.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(policy))});await page.getByLabel('Public proof file',{exact:true}).setInputFiles({name:'proof.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({...request,recipient:'attacker.testnet'}))});await expect(page.locator('.live-error[role=alert]')).toHaveText('Proof does not bind this recipient and group');await expect(page.getByRole('button',{name:'Review delivery'})).toBeDisabled();});
test('a restored receipt with an explicit not-found result can resubmit only the saved request',async({page})=>{const f=await setup(page);await page.reload();await f.upload('Trusted group policy JSON',policy);await page.getByLabel('Recovery receipt JSON',{exact:true}).setInputFiles(f.receiptPath);await page.getByRole('button',{name:'Check original request',exact:true}).click();await expect(page.getByRole('button',{name:'Submit saved request'})).toBeVisible();expect(f.posts()).toBe(0);await page.getByRole('button',{name:'Submit saved request'}).click();await expect(page.getByText('Waiting for execution window',{exact:true})).toBeVisible();expect(f.posts()).toBe(1);});
