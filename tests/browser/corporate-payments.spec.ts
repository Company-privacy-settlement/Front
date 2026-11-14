import { test,expect } from '@playwright/test';
import { corporateFixture } from './corporate-fixture';
test('creator → independent approval → exact storage/payment signatures → finalized confirmation',async({page,context},info)=>{
  const f=await corporateFixture();await f.ready(page,context);expect(await f.transactions(page)).toHaveLength(0);expect(f.state.decisions).toBe(1);
  const summary=page.getByLabel('Reviewed corporate payment',{exact:true});await expect(summary).toContainText('1000000');await expect(summary).toContainText('1500');await expect(summary).toContainText('0.15%');expect(await summary.locator('input:not([type=password])').count()).toBe(0);
  await page.getByRole('button',{name:'Sign approved prerequisite in wallet',exact:true}).click();await expect(page.getByRole('button',{name:'Sign approved payment in wallet',exact:true})).toBeEnabled();expect(f.state.reservations).toBe(1);
  await page.getByRole('button',{name:'Sign approved payment in wallet',exact:true}).click();await expect(page.getByRole('status')).toContainText('Corporate withdrawal confirmed by finalized contract state.');
  expect(f.state.reservations).toBe(2);const tx=await f.transactions(page);expect(tx).toHaveLength(2);expect(tx[1].actions[0].params.args.amount).toBe('1500');expect(f.state.payment!.state).toBe('dispatched');
  expect(JSON.stringify(f.state.bodies)).not.toContain('public corporate browser journal fixture');expect(await page.evaluate(()=>JSON.stringify({...localStorage,...sessionStorage}))).not.toContain('s'.repeat(43));
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.getByRole('heading',{name:'Supplier payment',exact:true}).scrollIntoViewIfNeeded();await page.screenshot({path:`/tmp/core-corporate-payments-${info.project.name}.png`});
});
test('a tampered approved amount is rejected before it can become a review or wallet call',async({page,context})=>{
  const f=await corporateFixture();await f.install(page);await f.create(page);const reviewer=await context.newPage();await f.approve(reviewer);await reviewer.close();f.state.tamper=true;
  await page.getByRole('button',{name:'Refresh payments',exact:true}).click();await expect(page.locator('.organization-workspace [role=alert]')).toBeVisible();await expect(page.locator('.organization-current')).toHaveCount(0);expect(await f.transactions(page)).toHaveLength(0);
});
test('a viewer cannot read corporate requests or prepare, approve or execute them',async({page})=>{
  const f=await corporateFixture();await f.install(page,'viewer.testnet');await expect(page.getByText('Your role does not include corporate payments.',{exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Request independent approval',exact:true})).toHaveCount(0);await expect(page.getByLabel('Reviewed corporate payment',{exact:true})).toHaveCount(0);
});
test('revocation during the final wallet identity await prevents provider dispatch',async({page,context})=>{
  const f=await corporateFixture();await f.ready(page,context);f.state.holdIdentity=true;
  await page.getByRole('button',{name:'Sign approved prerequisite in wallet',exact:true}).click();await expect.poll(()=>page.evaluate(()=>(window as any).corporateIdentityHeld===true)).toBe(true);f.state.revoked=true;await page.evaluate(()=>(window as any).releaseCorporateIdentity());
  await expect(page.locator('.organization-workspace [role=alert]')).toContainText('PAYMENT AUTHORITY CHANGED');expect(await f.transactions(page)).toHaveLength(0);expect(f.state.reservations).toBe(0);
});
test('a lost authorization response retains a reservation and never requests another signature',async({page,context})=>{
  const f=await corporateFixture();await f.ready(page,context);f.state.losePermit=true;await page.getByRole('button',{name:'Sign approved prerequisite in wallet',exact:true}).click();
  await expect(page.getByLabel('Approved corporate execution',{exact:true})).toContainText('Signature outcome is unknown');expect(f.state.reservations).toBe(1);expect(await f.transactions(page)).toHaveLength(0);await expect(page.getByRole('button',{name:'Sign approved prerequisite in wallet',exact:true})).toHaveCount(0);
});
test('page-cache entry clears sessions/journal and blocks a late reserved dispatch',async({page,context})=>{
  const f=await corporateFixture();await f.ready(page,context);f.state.holdPermit=true;await page.getByRole('button',{name:'Sign approved prerequisite in wallet',exact:true}).click();await expect.poll(()=>f.state.reservations).toBe(1);
  const snapshot=await page.evaluate(()=>{window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true}));return{details:document.querySelectorAll('.corporate-payment-summary').length,passwords:[...document.querySelectorAll<HTMLInputElement>('input[type=password]')].map(x=>x.value)};});expect(snapshot.details).toBe(0);expect(snapshot.passwords.every(p=>!p)).toBe(true);
  f.state.releasePermit!();await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));await expect(page.getByRole('button',{name:'Sign in with wallet',exact:true})).toBeVisible();expect(await f.transactions(page)).toHaveLength(0);
});
test('a changed storage charge needs a new approval even when preflight accepts it',async({page,context})=>{
  const f=await corporateFixture();await f.ready(page,context);f.state.changedPrerequisite=true;await page.getByRole('button',{name:'Refresh settlement',exact:true}).click();await expect(page.getByLabel('Approved corporate execution',{exact:true})).toContainText('20000000000000000000000');
  await page.getByRole('button',{name:'Sign approved prerequisite in wallet',exact:true}).click();await expect(page.locator('.organization-workspace [role=alert]')).toContainText('PAYMENT CALL CHANGED');expect(f.state.reservations).toBe(0);expect(await f.transactions(page)).toHaveLength(0);
});
test('a lost wallet response is reconciled against final state without resending',async({page,context})=>{
  const f=await corporateFixture();f.state.loseWallet=true;await f.ready(page,context);await page.getByRole('button',{name:'Sign approved prerequisite in wallet',exact:true}).click();await expect(page.getByRole('button',{name:'Sign approved payment in wallet',exact:true})).toBeEnabled();await page.getByRole('button',{name:'Sign approved payment in wallet',exact:true}).click();
  await expect(page.getByRole('status')).toContainText('Corporate withdrawal confirmed by finalized contract state.');expect(await f.transactions(page)).toHaveLength(2);expect(f.state.reservations).toBe(2);
});
