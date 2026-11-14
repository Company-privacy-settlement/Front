import { test,expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { setupDashboard,connectDashboard,other } from './invoice-dashboard-fixture';
const region=(page:import('@playwright/test').Page)=>page.getByLabel('Invoice payment dashboard',{exact:true});
const status=(page:import('@playwright/test').Page,label:string)=>region(page).locator('.invoice-dashboard-status').filter({hasText:new RegExp('^'+label+'$')});
async function checked(page:import('@playwright/test').Page){await page.getByRole('button',{name:'Check payments',exact:true}).click();await expect(region(page).getByText(/Payment check complete:/)).toBeVisible();}
test('organization dashboard searches, filters and exports verified finalized payment observations',async({page})=>{
  const state=await setupDashboard(page);await expect(status(page,'Unchecked')).toHaveCount(3);await connectDashboard(page);await checked(page);
  await expect(status(page,'Paid')).toHaveCount(1);await expect(status(page,'Partially paid')).toHaveCount(1);await expect(status(page,'Awaiting payment')).toHaveCount(1);expect(state.verifyReads).toBe(0);const widths=await page.evaluate(()=>[document.documentElement.scrollWidth,innerWidth]);expect(widths[0]).toBeLessThanOrEqual(widths[1]);
  await page.getByRole('button',{name:'View invoice INV-ALPHA'}).click();await expect(page.getByText('Finalized confirmations',{exact:true})).toBeVisible();await expect(page.getByText(/Transaction: C{44}/)).toBeVisible();
  await page.getByLabel('Search invoices',{exact:true}).fill('beta');await expect(region(page).getByText('Beta services',{exact:true})).toBeVisible();await expect(region(page).getByText('Gamma services',{exact:true})).toHaveCount(0);
  const downloaded=page.waitForEvent('download');await page.getByRole('button',{name:'Export JSON',exact:true}).click();const download=await downloaded,body=JSON.parse(await readFile((await download.path())!,'utf8'));expect(body.rows).toHaveLength(1);expect(body.rows[0]).toMatchObject({reference:'INV-BETA',state:'partial',paidTokens:'1000000',confirmedPayments:1,chainFreshnessChecked:false});
  await page.getByLabel('Search invoices',{exact:true}).fill('');await page.getByRole('combobox',{name:'Payment status',exact:true}).selectOption('paid');await expect(region(page).getByText('Alpha services',{exact:true})).toBeVisible();await expect(region(page).getByText('Beta services',{exact:true})).toHaveCount(0);
  const csvDownload=page.waitForEvent('download');await page.getByRole('button',{name:'Export CSV',exact:true}).click();expect(await readFile((await(await csvDownload).path())!,'utf8')).toContain('INV-ALPHA');
  await page.getByRole('combobox',{name:'Payment status',exact:true}).selectOption('all');await page.getByLabel('Issued from',{exact:true}).fill('2099-01-01');await page.getByLabel('Issued through',{exact:true}).fill('2026-11-12');await expect(page.locator('.organization-workspace [role="alert"]')).toContainText('Start date');
  const stored=await page.evaluate(()=>JSON.stringify({...localStorage,...sessionStorage}));expect(stored).not.toContain('INV-ALPHA');expect(stored).not.toContain('s'.repeat(43));expect(stored).not.toContain('Alpha services');
});
test('dashboard loads every organization page and exports filtered rows beyond the visible table page',async({page})=>{
  const state=await setupDashboard(page,{count:52});expect(state.invoiceReads).toBe(2);await expect(page.getByText('52 of 52 invoices · page 1 of 3')).toBeVisible();await page.getByRole('button',{name:'Next invoice page'}).click();await expect(page.getByText('52 of 52 invoices · page 2 of 3')).toBeVisible();
  const downloaded=page.waitForEvent('download');await page.getByRole('button',{name:'Export JSON'}).click();const body=JSON.parse(await readFile((await(await downloaded).path())!,'utf8'));expect(body.rows).toHaveLength(52);expect(body.rows.every((r:any)=>r.state==='unchecked'&&r.paidTokens===null)).toBe(true);
  await page.getByLabel('Search invoices',{exact:true}).fill('INV-52');await expect(page.getByText('Invoice 52',{exact:true})).toBeVisible();
});
test('failed or stale refresh replaces previous paid observations with explicit uncertainty',async({page})=>{
  const state=await setupDashboard(page);await connectDashboard(page);await checked(page);state.stale=true;await checked(page);await expect(status(page,'Stale index')).toHaveCount(3);state.stale=false;state.statusFailure=true;await checked(page);await expect(status(page,'Unavailable')).toHaveCount(3);await expect(status(page,'Paid')).toHaveCount(0);
});
test('limited index coverage never shows a definitive paid state',async({page})=>{
  const state=await setupDashboard(page);state.limited=true;await connectDashboard(page);await checked(page);await expect(status(page,'Needs review')).toHaveCount(3);await expect(status(page,'Paid')).toHaveCount(0);
});
test('viewer is denied invoice reads; auditor can reconcile and export without creation controls',async({page})=>{
  const state=await setupDashboard(page,{role:'viewer'});await expect(page.getByText('Your role does not include organization invoices.')).toBeVisible();expect(state.invoiceReads).toBe(0);
  await page.getByRole('button',{name:'Overview',exact:true}).click();state.role='auditor';await page.getByRole('button',{name:'Invoice payments',exact:true}).click();await expect(page.getByRole('button',{name:'Refresh invoices'})).toBeEnabled();await expect(page.getByText('Save a signed invoice',{exact:true})).toHaveCount(0);await expect(page.getByRole('button',{name:'Export CSV'})).toBeEnabled();
});
test('cancelling a pending status read leaves unchecked rows and rejects its late response',async({page})=>{
  const state=await setupDashboard(page);state.delay=true;await connectDashboard(page);await page.getByRole('button',{name:'Check payments',exact:true}).click();await expect.poll(()=>state.statusReads).toBe(1);await page.getByRole('button',{name:'Cancel payment check',exact:true}).click();await expect(page.getByText(/Payment check cancelled after 0/)).toBeVisible();state.delay=false;state.release();await expect(status(page,'Paid')).toHaveCount(0);await expect(status(page,'Unchecked')).toHaveCount(3);
});
test('revoked membership during public reconciliation clears the private dashboard before publishing paid',async({page})=>{
  const state=await setupDashboard(page);state.delay=true;await connectDashboard(page);await page.getByRole('button',{name:'Check payments',exact:true}).click();await expect.poll(()=>state.statusReads).toBe(1);state.revoked=true;state.release();await expect(page.locator('.organization-workspace [role="alert"]')).toContainText('Organization access is unavailable');await expect(region(page)).toHaveCount(0);await expect(page.getByText('Alpha services',{exact:true})).toHaveCount(0);
});
test('page-hide and organization switching clear rows and prevent delayed status restoration',async({page})=>{
  const state=await setupDashboard(page);await page.getByRole('combobox',{name:'Active organization',exact:true}).selectOption(other);await page.getByRole('button',{name:'Invoice payments',exact:true}).click();await expect(page.getByText('No matching organization invoices.')).toBeVisible();await expect(page.getByText('Alpha services',{exact:true})).toHaveCount(0);
  await page.getByRole('combobox',{name:'Active organization',exact:true}).selectOption('11111111-1111-4111-8111-111111111111');await page.getByRole('button',{name:'Invoice payments',exact:true}).click();await expect(page.getByRole('button',{name:'Refresh invoices'})).toBeEnabled();state.delay=true;await connectDashboard(page);await page.getByRole('button',{name:'Check payments',exact:true}).click();await expect.poll(()=>state.statusReads).toBe(1);await page.evaluate(()=>window.dispatchEvent(new Event('pagehide')));state.release();await expect(page.getByRole('button',{name:'Sign in with testnet wallet'})).toBeVisible();await expect(region(page)).toHaveCount(0);
});
test('signed invoice save uses stable idempotency and a mismatched Core policy cannot populate statuses',async({page})=>{
  const state=await setupDashboard(page);await page.getByText('Save a signed invoice',{exact:true}).click();await page.getByLabel('Organization signed invoice JSON').setInputFiles({name:'signed-invoice.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(state.records[0].invoice))});await expect(page.getByRole('button',{name:'Save to organization'})).toBeEnabled();await page.getByRole('button',{name:'Save to organization'}).click();await expect(page.getByText('Invoice already saved. No duplicate was created.')).toBeVisible();expect(state.saveRequests[0].requestId).toBe(state.records[0].invoice.invoice.id);
  state.wrongPolicy=true;await connectDashboard(page);await page.getByRole('button',{name:'Check payments',exact:true}).click();await expect(page.locator('.organization-workspace [role="alert"]')).toContainText('does not match your independently trusted policy');expect(state.statusReads).toBe(0);await expect(region(page)).toHaveCount(0);
});
