import { expect, type Page } from '@playwright/test';
import { createHash } from 'node:crypto';
import { canonical, corporateContent, organizationLoginMessage, ORGANIZATION_ROLE_PERMISSIONS, type CorporatePayment, type OrganizationRole } from '../../src/vendor/core-client/index.js';
import { policy, vault } from './invoice-fixture';
const api='https://organization-api.example',core='https://core-api.example',orgId='11111111-1111-4111-8111-111111111111',paymentId='22222222-2222-4222-8222-222222222222';
const maker='maker.testnet',approver='approver.testnet',recipient='recipient.testnet',reference='dd'.repeat(32),hash=(v:unknown)=>createHash('sha256').update(canonical(v)).digest('hex');
const field=(s:string)=>{const b=createHash('sha256').update(s).digest();b[0]&=0x1f;return BigInt('0x'+b.toString('hex')).toString();};
export async function corporateFixture(){
  const domain=field(`core:ft:v3|testnet|${policy.registry}|${policy.tokenId}|1000000`),context=field(`core:action:ft:v3|${domain}|withdraw|${vault}|${recipient}|${reference}`);
  const call={contract:policy.tokenId,method:'ft_transfer_call',gas:'300000000000000',attachedYoctoNear:'1',args:{receiver_id:policy.registry,amount:'1500',msg:JSON.stringify({vault,recipient,disclosure_root:reference,proof:Buffer.alloc(256).toString('base64'),public_inputs:['42','1','1',context,domain]})}};
  const prerequisite={contract:policy.registry,method:'prepay_storage',gas:'300000000000000',attachedYoctoNear:'25000000000000000000000',args:{account_id:maker}};
  const state={payment:null as CorporatePayment|null,credit:false,complete:false,revoked:false,tamper:false,losePermit:false,loseWallet:false,holdIdentity:false,holdPermit:false,changedPrerequisite:false,reservations:0,decisions:0,bodies:[] as unknown[],releasePermit:undefined as undefined|(()=>void)};
  function view(){if(!state.payment)return null;const p=structuredClone(state.payment);p.approvalValid=p.state==='approved'&&!state.revoked;if(state.tamper)p.payload.content.payment.args.amount='1';return p;}
  const role=(account:string):OrganizationRole=>account===maker?'operator':account===approver?'admin':'viewer';
  async function install(page:Page,actor=maker){
    await page.exposeFunction('corporateFixtureWalletCall',({method}:{method:string})=>{if(method==='prepay_storage')state.credit=true;else state.complete=true;});
    await page.route('https://raw.githubusercontent.com/hot-dao/**/manifest.json',r=>r.fulfill({json:{wallets:[],version:'1'}}));
    await page.addInitScript(({actor,lost})=>{
      const w=window as any;w.corporateTransactions=[];w.corporateSignatures=[];
      const wallet={manifest:{id:'corporate-fixture',name:'Corporate Fixture Wallet',type:'injected',platform:['web'],icon:'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>',permissions:{},features:{testnet:true,mainnet:false,signMessage:true,signAndSendTransaction:true,signInWithoutAddKey:true}},
        signIn:async()=>[{accountId:actor}],signOut:async()=>{},getAccounts:async()=>{if(w.holdCorporateIdentity){w.holdCorporateIdentity=false;w.corporateIdentityHeld=true;await new Promise<void>(r=>{w.releaseCorporateIdentity=r;});}return[{accountId:actor}];},
        signMessage:async(p:unknown)=>{w.corporateSignatures.push(p);return{accountId:actor,publicKey:'ed25519:'+'1'.repeat(32),signature:'a'.repeat(86)+'=='};},
        signAndSendTransaction:async(p:any)=>{w.corporateTransactions.push(p);await w.corporateFixtureWalletCall({method:p.actions[0].params.methodName});if(lost&&p.actions[0].params.methodName==='ft_transfer_call')throw new Error('Wallet response lost');return{transaction:{hash:'B'.repeat(44),signer_id:actor}};}};
      window.addEventListener('near-selector-ready',()=>window.dispatchEvent(new CustomEvent('near-wallet-injected',{detail:wallet})));
    },{actor,lost:state.loseWallet});
    const organization=()=>({id:orgId,name:'Corporate fixture company',ownerAccount:'owner.testnet',version:1,membershipVersion:1,createdAt:new Date().toISOString(),role:role(actor),permissions:ORGANIZATION_ROLE_PERMISSIONS[role(actor)],claims:{kybVerified:false,walletSigningAuthorityGranted:false}});
    await page.route(api+'/**',async route=>{
      const req=route.request(),path=new URL(req.url()).pathname,body=req.postData()?req.postDataJSON():undefined,method=req.method();if(body)state.bodies.push(body);
      let json:any={},status=200;
      if(path==='/v1/auth/challenge'){const fields={accountId:actor,audience:api,origin:req.headers().origin,expiresAt:new Date(Date.now()+299000).toISOString()};json={...fields,id:paymentId,network:'testnet',nonce:'ab'.repeat(32),recipient:new URL(api).host,message:organizationLoginMessage(fields)};}
      else if(path==='/v1/auth/login')json={accountId:actor,token:'s'.repeat(43),expiresAt:new Date(Date.now()+3599000).toISOString()};
      else if(path==='/v1/organizations')json={items:[organization()]};
      else if(path==='/v1/me/invitations')json={items:[]};
      else if(path===`/v1/organizations/${orgId}`)json=organization();
      else if(path.endsWith('/payments')&&method==='POST'){
        const content=await corporateContent(body),payload={format:'core-corporate-approval-v1' as const,organizationId:orgId,paymentId,creatorAccount:actor,creatorMembershipVersion:1,expiresAt:new Date(Date.now()+86400000).toISOString(),content};
        state.payment={payload,contentHash:hash(payload),state:'pending',version:1,approvedBy:null,approverMembershipVersion:null,approvedAt:null,approvalValid:false,dispatches:[]};json=view();status=201;
      }else if(path.endsWith('/payments'))json={items:state.payment?[view()]:[]};
      else if(path.endsWith('/approve')){state.decisions++;if(actor===maker||role(actor)!=='admin'){status=403;json={error:'PAYMENT_SELF_APPROVAL_DENIED'};}else if(!state.payment||body.contentHash!==state.payment.contentHash||body.version!==state.payment.version){status=409;json={error:'VERSION_CONFLICT'};}else{state.payment.state='approved';state.payment.version++;state.payment.approvedBy=actor;state.payment.approverMembershipVersion=1;state.payment.approvedAt=new Date().toISOString();json=view();}}
      else if(path.endsWith('/authorize')){
        const allowed=body.kind==='payment'?[state.payment!.payload.content.payment]:state.payment!.payload.content.prerequisites;
        if(state.revoked){status=409;json={error:'PAYMENT_AUTHORITY_CHANGED'};}
        else if(!allowed.some(c=>canonical(c)===canonical(body.call))){status=409;json={error:'PAYMENT_CALL_CHANGED'};}
        else{const callHash=hash(body.call);if(state.payment!.dispatches.some(d=>d.callHash===callHash)){status=409;json={error:'PAYMENT_CALL_RESERVED'};}else{state.reservations++;state.payment!.dispatches.push({callHash,kind:body.kind,createdAt:new Date().toISOString()});state.payment!.version++;if(body.kind==='payment')state.payment!.state='dispatched';json={contentHash:state.payment!.contentHash,callHash,expiresAt:new Date(Date.now()+15000).toISOString()};if(state.holdPermit)await new Promise<void>(r=>{state.releasePermit=r;});if(state.losePermit){await route.abort('failed');return;}}}
      }else if(path.endsWith('/'+paymentId)){
        json=view();if(state.holdIdentity){state.holdIdentity=false;await page.evaluate(()=>{(window as any).holdCorporateIdentity=true;});}
      }
      await route.fulfill({status,json,headers:{'access-control-allow-origin':req.headers().origin??'*'}}).catch(()=>{});
    });
    await page.route(core+'/**',async route=>{
      const path=new URL(route.request().url()).pathname,body=route.request().postData()?route.request().postDataJSON():undefined;if(body)state.bodies.push(body);let json:any;
      if(path==='/v1/config')json={policy};
      else if(path==='/v1/ft/preflight')json={canPrepare:true,prerequisitesSatisfied:state.credit,prerequisites:state.credit?[]:[state.changedPrerequisite?{...prerequisite,attachedYoctoNear:'20000000000000000000000'}:prerequisite],blockers:[],tokenAmountRequired:'1500',payerTokenBalance:'1000000',checkedAtBlock:{hash:'B'.repeat(44),height:200}};
      else if(path==='/v1/transactions/verify')json={status:'final',effect:'accepted',transaction:body.transaction};
      else if(path==='/v1/settlements/status')json={state:state.complete?'Complete':'NotFound',complete:state.complete,refunded:false,retryAvailable:false,refundAvailable:false,retryCall:null,refundCall:null,record:state.complete?{state:'Complete',vault:body.expectedVault,recipient:body.expectedRecipient,disclosure_root:body.expectedDisclosureRoot}:null,checkedAtBlock:{hash:'B'.repeat(44),height:200}};
      else json={};await route.fulfill({json,headers:{'access-control-allow-origin':'*'}});
    });
    await page.goto('/organization/');await page.getByLabel('Organization API origin',{exact:true}).fill(api);await page.getByRole('button',{name:'Sign in with wallet',exact:true}).click();await page.getByText('Corporate Fixture Wallet',{exact:true}).click();await page.getByRole('combobox',{name:'Active organization',exact:true}).selectOption(orgId);await page.getByRole('button',{name:'Payments',exact:true}).click();
  }
  async function trust(page:Page){await page.getByLabel('Core settlement API origin',{exact:true}).fill(core);await page.getByLabel('Trusted corporate policy JSON',{exact:true}).setInputFiles({name:'policy.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(policy))});}
  async function create(page:Page){await trust(page);await page.getByText('Prepare a new payment',{exact:true}).click();await page.getByLabel('Public corporate withdrawal plan',{exact:true}).setInputFiles({name:'public-plan.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({tokenCall:call}))});await expect(page.getByText('Public withdrawal plan loaded. No payment has been sent.',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Request independent approval',exact:true}).click();await expect(page.getByText('A different owner or admin must approve your payment.',{exact:true})).toBeVisible();}
  async function approve(page:Page){await install(page,approver);await trust(page);await page.locator('.corporate-request').click();await page.getByRole('button',{name:'Approve exact payment',exact:true}).click();await expect(page.locator('.corporate-payment-summary')).toContainText(approver);}
  async function ready(page:Page,context:Page['context'] extends (...args:any)=>infer T?T:never){await install(page);await create(page);const reviewer=await context.newPage();await approve(reviewer);await reviewer.close();await page.getByRole('button',{name:'Refresh payments',exact:true}).click();await page.getByLabel('Corporate journal passphrase',{exact:true}).fill('public corporate browser journal fixture');await page.getByRole('button',{name:'Create corporate journal',exact:true}).click();await expect(page.getByRole('button',{name:'Sign approved prerequisite in wallet',exact:true})).toBeEnabled();}
  return{state,install,trust,create,approve,ready,maker,approver,orgId,paymentId,transactions:(page:Page)=>page.evaluate(()=>(window as any).corporateTransactions as any[])};
}
