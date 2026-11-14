import { expect, type Page } from '@playwright/test';
import { generateKeyPairSync, randomUUID, sign } from 'node:crypto';
import { invoiceHash, invoicePaymentRoots, invoiceSigningDigest, ORGANIZATION_ROLE_PERMISSIONS, organizationLoginMessage, type Invoice, type OrganizationInvoice, type OrganizationRole } from '../../src/vendor/core-client/index.js';
import { policy } from './invoice-fixture';
export const api='https://organization-api.example',settlement='https://dashboard-core.example',org='11111111-1111-4111-8111-111111111111',other='22222222-2222-4222-8222-222222222222';
function base58(bytes:Buffer) {const a='123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';let n=BigInt('0x'+bytes.toString('hex')),s='';while(n){s=a[Number(n%58n)]+s;n/=58n;}for(const b of bytes){if(b)break;s='1'+s;}return s;}
export async function setupDashboard(page:Page,options:{role?:OrganizationRole;count?:number}={}) {
  const keys=generateKeyPairSync('ed25519'),publicKey='ed25519:'+base58(keys.publicKey.export({format:'der',type:'spki'}).subarray(-32)),now=Date.now();
  const records:OrganizationInvoice[]=[],hashes=new Map<string,{record:OrganizationInvoice;roots:string[];paid:number}>();
  for(let i=0;i<(options.count??3);i++) {
    const invoice:Invoice={version:2,id:randomUUID(),merchantAccount:'owner.testnet',recipient:'recipient.testnet',title:['Alpha services','Beta services','Gamma services'][i]??`Invoice ${i+1}`,reference:['INV-ALPHA','INV-BETA','INV-GAMMA'][i]??`INV-${i+1}`,policy,units:i===1?2:1,createdAt:new Date(now-86400000).toISOString(),expiresAt:new Date(now+86400000).toISOString(),nonce:(i+1).toString(16).padStart(64,'0'),paymentNonces:Array.from({length:i===1?2:1},(_,j)=>(i*32+j+100).toString(16).padStart(64,'0'))};
    const digest=await invoiceHash(invoice),signature=sign(null,await invoiceSigningDigest(digest,'testnet',invoice.nonce),keys.privateKey).toString('base64');
    const record={id:randomUUID(),organizationId:org,sequence:(options.count??3)-i,createdAt:new Date(now-i).toISOString(),createdBy:'owner.testnet',invoice:{invoice,signature:{accountId:'owner.testnet',publicKey,signature}}};records.push(record);hashes.set(digest,{record,roots:await invoicePaymentRoots(invoice),paid:i<2?1:0});
  }
  const state={role:options.role??'owner',revoked:false,other:false,statusFailure:false,stale:false,limited:false,wrongPolicy:false,delay:false,release:()=>{},statusReads:0,invoiceReads:0,verifyReads:0,saveRequests:[] as any[],records};
  await page.route('https://raw.githubusercontent.com/hot-dao/**/manifest.json',r=>r.fulfill({json:{wallets:[],version:'1'}}));
  await page.addInitScript(()=>{
    const wallet={manifest:{id:'dashboard-fixture',name:'Dashboard Fixture Wallet',type:'injected',platform:['web'],icon:'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>',permissions:{},features:{testnet:true,mainnet:false,signMessage:true,signAndSendTransaction:true,signInWithoutAddKey:true}},signIn:async()=>[{accountId:'owner.testnet'}],getAccounts:async()=>[{accountId:'owner.testnet'}],signOut:async()=>{},signMessage:async()=>({accountId:'owner.testnet',publicKey:'ed25519:'+'1'.repeat(32),signature:'a'.repeat(86)+'=='})};
    window.addEventListener('near-selector-ready',()=>window.dispatchEvent(new CustomEvent('near-wallet-injected',{detail:wallet})));
  });
  const organization=(id=org)=>({id,name:id===org?'Example organization':'Second organization',ownerAccount:'owner.testnet',version:1,membershipVersion:1,role:state.role,permissions:ORGANIZATION_ROLE_PERMISSIONS[state.role],createdAt:new Date(now).toISOString(),claims:{kybVerified:false,walletSigningAuthorityGranted:false}});
  await page.route(api+'/**',async route=>{
    const request=route.request(),url=new URL(request.url()),path=url.pathname,body=request.postData()?request.postDataJSON():undefined;let json:unknown={},status=200;
    if(path==='/v1/auth/challenge'){const fields={accountId:'owner.testnet',audience:api,origin:request.headers().origin,expiresAt:new Date(Date.now()+299000).toISOString()};json={...fields,id:other,network:'testnet',nonce:'ab'.repeat(32),recipient:new URL(api).host,message:organizationLoginMessage(fields)};}
    else if(path==='/v1/auth/login')json={accountId:'owner.testnet',token:'s'.repeat(43),expiresAt:new Date(Date.now()+3599000).toISOString()};
    else if(state.revoked){status=404;json={error:'ORGANIZATION_NOT_FOUND'};}
    else if(path==='/v1/organizations')json={items:[organization(),organization(other)]};
    else if(path==='/v1/me/invitations')json={items:[]};
    else if(path.endsWith('/invoices')){
      state.invoiceReads++;
      if(request.method()==='POST'){state.saveRequests.push(body);const existing=records.find(r=>r.invoice.invoice.id===body.invoice.invoice.id)!;json={invoice:existing,replayed:true};}
      else {const items=path.includes(other)?[]:records.filter(r=>!url.searchParams.has('before')||r.sequence<Number(url.searchParams.get('before')));json={items:items.slice(0,50),nextCursor:items.length>50?items[49].sequence:null};}
    }else if(path==='/v1/organizations/'+org)json=organization();else if(path==='/v1/organizations/'+other)json=organization(other);
    await route.fulfill({status,json,headers:{'access-control-allow-origin':request.headers().origin??'*'}}).catch(()=>{});
  });
  await page.route(settlement+'/**',async route=>{
    const request=route.request(),path=new URL(request.url()).pathname;let json:unknown={},status=200;
    if(path==='/v1/config')json={policy:state.wrongPolicy?{...policy,feeRecipient:'wrong.testnet'}:policy};
    else if(path==='/v1/invoices/verify'){state.verifyReads++;json={verified:false};}
    else if(path==='/v1/invoices/status'){
      state.statusReads++;if(state.delay)await new Promise<void>(resolve=>{state.release=resolve;});
      if(state.statusFailure){status=503;json={error:'INDEX_NOT_READY'};}
      else {const {record,roots,paid}=hashes.get(request.postDataJSON().invoiceHash)!,i=record.invoice.invoice,principal=BigInt(policy.denomination)*BigInt(i.units),amount=BigInt(policy.denomination)*BigInt(paid);
        json={invoiceHash:await invoiceHash(i),settlementRoot:null,settlementRoots:roots,reusedPaymentReferences:0,state:state.limited?'review_required':paid===0?'awaiting_payment':paid===i.units?'paid':'partial',expectedTokens:String(principal),paidTokens:String(amount),remainingTokens:String(principal-amount),overpaidTokens:'0',lateTokens:'0',confirmedPayments:paid,coverageLimited:state.limited,checkedAt:{hash:'B'.repeat(44),height:100,updatedAt:new Date(Date.now()-(state.stale?360000:0)).toISOString()},chainFreshnessChecked:false,confirmations:Array.from({length:paid},(_,j)=>({settlementRoot:roots[j],recordIndex:j,nullifier:String(j+1),blockHeight:90,late:false,transaction:{hash:'C'.repeat(44),signer:'payer.testnet'}}))};
      }
    }
    await route.fulfill({status,json,headers:{'access-control-allow-origin':request.headers().origin??'*'}}).catch(()=>{});
  });
  await page.goto('/organization/');await page.getByLabel('Organization API origin').fill(api);await page.getByRole('button',{name:'Sign in with testnet wallet'}).click();await page.getByText('Dashboard Fixture Wallet',{exact:true}).click();await page.getByRole('combobox',{name:'Active organization',exact:true}).selectOption(org);await expect(page.locator('.organization-current h2')).toHaveText('Example organization');await page.getByRole('button',{name:'Invoice payments',exact:true}).click();
  if(state.role!=='viewer')await expect(page.getByRole('button',{name:'Refresh invoices',exact:true})).toBeEnabled();
  return state;
}
export async function connectDashboard(page:Page) {
  await page.getByText('Settlement source',{exact:true}).click();await page.getByLabel('Dashboard settlement API origin').fill(settlement);await page.getByLabel('Trusted dashboard policy JSON').setInputFiles({name:'policy.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(policy))});await expect(page.getByRole('button',{name:'Check payments',exact:true})).toBeEnabled();
}
