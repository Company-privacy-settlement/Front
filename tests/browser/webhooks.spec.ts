import { test,expect,type Page } from '@playwright/test';
import { setupDashboard,api,org,other } from './invoice-dashboard-fixture';
import { webhookKeyId,type OrganizationRole } from '../../src/vendor/core-client/index.js';
const hookId='33333333-3333-4333-8333-333333333333',deliveryId='44444444-4444-4444-8444-444444444444',eventId='55555555-5555-4555-8555-555555555555';
const region=(page:Page)=>page.getByLabel('Payment webhook management',{exact:true});
async function setup(page:Page,options:{role?:OrganizationRole;empty?:boolean}={}) {
  const base=await setupDashboard(page,{role:options.role}),now=new Date().toISOString();
  const endpoint={id:hookId,url:'https://merchant.example/payments',state:'active',version:1,keyId:'whk_'+'ab'.repeat(8),createdAt:now};
  const delivery={id:deliveryId,sequence:1,eventId,endpointId:hookId,state:'dead',version:1,attempts:2,redrives:0,nextAttemptAt:null as string|null,lastError:'HTTP_400' as string|null,createdAt:now};
  const state={base,endpoints:options.empty?[]:[endpoint],delivery,reads:0,requests:[] as {path:string;body:any}[],delay:false,release:()=>{}};
  await page.route(api+'/**',async route=>{
    const request=route.request(),path=new URL(request.url()).pathname;if(!path.includes('/webhooks')){await route.fallback();return;}
    const body=request.postData()?request.postDataJSON():undefined;let json:unknown={},status=200;state.reads++;
    if(base.revoked){await route.fulfill({status:404,json:{error:'ORGANIZATION_NOT_FOUND'}});return;}
    if(request.method()==='POST')state.requests.push({path,body});
    if(path.endsWith('/webhooks')){
      if(request.method()==='POST'){
        if(state.delay)await new Promise<void>(resolve=>{state.release=resolve;});
        const replayed=state.endpoints.length>0;const item={...endpoint,url:body.url,keyId:await webhookKeyId(body.secret)};if(!replayed)state.endpoints.push(item);json={endpoint:state.endpoints[0],replayed};
      }else json={items:path.includes(other)?[]:state.endpoints};
    }else if(path.endsWith('/deliveries'))json={items:path.includes(other)||!state.endpoints.length?[]:[delivery],nextCursor:null};
    else if(path.endsWith('/retry')){delivery.state='pending';delivery.version++;delivery.redrives++;delivery.nextAttemptAt=now;json={...delivery};}
    else if(path.endsWith('/pause')||path.endsWith('/resume')||path.endsWith('/rotate')){endpoint.version++;if(path.endsWith('/pause'))endpoint.state='paused';if(path.endsWith('/resume'))endpoint.state='active';if(path.endsWith('/rotate'))endpoint.keyId=await webhookKeyId(body.secret);json={...endpoint};}
    else if(path.endsWith('/deliveries/'+deliveryId)){
      if(state.delay)await new Promise<void>(resolve=>{state.release=resolve;});
      json={delivery:{...delivery},event:{version:1,id:eventId,type:'invoice.payment_confirmed',organizationId:org,producer:api,createdAt:now,data:{invoiceRecordId:base.records[0].id,invoiceId:base.records[0].invoice.invoice.id,invoiceHash:'ab'.repeat(32),network:'testnet',registry:'forest.testnet',asset:'usdc.testnet',recipient:'recipient.testnet',amountTokens:'1000000',nullifier:'42',recordIndex:1,blockHeight:90,transaction:{hash:'B'.repeat(44),signer:'payer.testnet'},index:{hash:'C'.repeat(44),height:100,updatedAt:now}}},attempts:[{number:1,startedAt:now,finishedAt:now,outcome:'failed',httpStatus:500,error:'HTTP_500'},{number:2,startedAt:now,finishedAt:now,outcome:'failed',httpStatus:400,error:'HTTP_400'}]};
    }
    await route.fulfill({status,json}).catch(()=>{});
  });
  await page.getByRole('button',{name:'Webhooks',exact:true}).click();if(options.role!=='viewer')await expect(page.getByRole('button',{name:'Refresh webhooks',exact:true})).toBeEnabled();return state;
}
test('admin configures an idempotent callback without retaining the signing secret in browser storage',async({page})=>{
  const state=await setup(page,{empty:true});await page.getByText('Configure a callback',{exact:true}).click();await page.getByLabel('Callback URL',{exact:true}).fill('https://merchant.example/payments');await page.getByRole('button',{name:'Generate signing secret'}).click();const secret=await page.getByLabel('Webhook signing secret',{exact:true}).inputValue();expect(secret).toHaveLength(43);await page.getByRole('button',{name:'Show signing secret'}).click();await expect(page.getByLabel('Webhook signing secret',{exact:true})).toHaveAttribute('type','text');await page.getByRole('button',{name:'Create callback',exact:true}).click();await expect(region(page).getByText('https://merchant.example/payments',{exact:true})).toBeVisible();await expect(page.getByLabel('Webhook signing secret',{exact:true})).toHaveValue('');expect(state.requests[0].body.secret).toBe(secret);
  const cached=await page.evaluate(()=>JSON.stringify({...localStorage,...sessionStorage}));expect(cached).not.toContain(secret);expect(cached).not.toContain('s'.repeat(43));
  await page.getByLabel('Callback URL',{exact:true}).fill('https://merchant.example/payments');await page.getByLabel('Webhook signing secret',{exact:true}).fill(secret);await page.getByRole('button',{name:'Create callback',exact:true}).click();await expect(page.getByText('Callback already exists. No duplicate was created.')).toBeVisible();expect(state.endpoints).toHaveLength(1);
});
test('failure history supports an authorized versioned redrive while preserving the event ID',async({page})=>{
  const state=await setup(page);await region(page).getByRole('button',{name:/dead · 2 attempts/}).click();await expect(page.getByLabel('Webhook delivery details')).toBeVisible();await expect(page.getByText('Attempt 1 · failed',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Retry delivery',exact:true}).click();await expect(page.getByText('Delivery queued again with the same event ID.')).toBeVisible();expect(state.requests.at(-1)).toEqual({path:`/v1/organizations/${org}/webhooks/deliveries/${deliveryId}/retry`,body:{version:1}});expect(state.delivery.eventId).toBe(eventId);await expect(page.getByRole('button',{name:'Retry delivery',exact:true})).toHaveCount(0);
  const widths=await page.evaluate(()=>[document.documentElement.scrollWidth,innerWidth]);expect(widths[0]).toBeLessThanOrEqual(widths[1]);
});
test('pause, resume and key rotation use current endpoint versions and keep secrets transient',async({page})=>{
  const state=await setup(page);await page.getByRole('button',{name:'Pause callback',exact:true}).click();await expect(page.getByRole('button',{name:'Resume callback',exact:true})).toBeEnabled();await page.getByRole('button',{name:'Resume callback',exact:true}).click();await expect(page.getByRole('button',{name:'Pause callback',exact:true})).toBeEnabled();await page.getByText('Configure a callback',{exact:true}).click();await page.getByRole('button',{name:'Generate signing secret'}).click();await page.getByRole('button',{name:'Rotate secret',exact:true}).click();await expect(page.getByText('Signing secret rotated. Update the receiver with your saved secret.')).toBeVisible();expect(state.requests.map(r=>r.body.version)).toEqual([1,2,3]);await expect(page.getByLabel('Webhook signing secret',{exact:true})).toHaveValue('');
});
test('viewer cannot load webhooks and auditor can inspect failure history without mutation controls',async({page})=>{
  const state=await setup(page,{role:'viewer'});await expect(page.getByText('Your role does not include payment webhooks.')).toBeVisible();expect(state.reads).toBe(0);await page.getByRole('button',{name:'Overview',exact:true}).click();state.base.role='auditor';await page.getByRole('button',{name:'Webhooks',exact:true}).click();await expect(page.getByRole('button',{name:'Refresh webhooks',exact:true})).toBeEnabled();await expect(page.getByText('Configure a callback',{exact:true})).toHaveCount(0);await region(page).getByRole('button',{name:/dead · 2 attempts/}).click();await expect(page.getByText('Attempt 2 · failed',{exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Retry delivery',exact:true})).toHaveCount(0);await expect(page.getByRole('button',{name:'Pause callback',exact:true})).toHaveCount(0);
});
test('page-hide and organization switching cannot restore a late private delivery response',async({page})=>{
  const state=await setup(page);await page.getByRole('combobox',{name:'Active organization',exact:true}).selectOption(other);await page.getByRole('button',{name:'Webhooks',exact:true}).click();await expect(page.getByText('No callbacks configured.')).toBeVisible();await expect(region(page).getByText('https://merchant.example/payments',{exact:true})).toHaveCount(0);
  await page.getByRole('combobox',{name:'Active organization',exact:true}).selectOption(org);await page.getByRole('button',{name:'Webhooks',exact:true}).click();await expect(page.getByRole('button',{name:'Refresh webhooks',exact:true})).toBeEnabled();state.delay=true;await region(page).getByRole('button',{name:/dead · 2 attempts/}).click();await expect.poll(()=>state.reads).toBeGreaterThan(4);await page.evaluate(()=>window.dispatchEvent(new Event('pagehide')));state.release();await expect(page.getByRole('button',{name:'Sign in with testnet wallet'})).toBeVisible();await expect(region(page)).toHaveCount(0);
});
test('revoked organization access clears previously loaded callbacks and delivery history',async({page})=>{
  const state=await setup(page);state.base.revoked=true;await page.getByRole('button',{name:'Refresh webhooks',exact:true}).click();await expect(page.locator('.organization-workspace [role="alert"]')).toContainText('Organization access is unavailable');await expect(region(page)).toHaveCount(0);await expect(page.getByText('https://merchant.example/payments',{exact:true})).toHaveCount(0);
});
