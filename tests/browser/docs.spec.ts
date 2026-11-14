import { test, expect, type Page } from '@playwright/test';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const reference=JSON.parse(readFileSync('public/deployments/native-near.json','utf8'));
async function navigation(page: Page, isMobile: boolean) {
  if (isMobile) await page.getByLabel('Open documentation navigation').click();
  return page.getByRole('navigation', { name: 'Documentation', exact: true });
}
test('landing routes to English documentation and the actual workspace without demo controls', async ({ page, isMobile }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: /demo/i })).toHaveCount(0);
  await expect(page.locator('a[href^="/app/"]')).toHaveCount(0);
  if (isMobile) {
    await page.locator('.landing-menu summary').click();
    await expect(page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'Open workspace' })).toHaveAttribute('href', '/live/');
    await page.locator('.landing-menu summary').click();
  } else await expect(page.getByRole('link', { name: 'Open workspace', exact: true })).toHaveAttribute('href', '/live/');
  await page.locator('.hero-actions').getByRole('link', { name: 'Read the docs' }).click();
  await expect(page).toHaveURL(/\/docs\/$/);
  await expect(page.getByRole('heading', { name: 'Getting started', exact: true })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('button', { name: 'Simulate payment' })).toHaveCount(0);
});
test('landing links open the requested documentation section', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Understand the fees' }).click();
  await expect(page).toHaveURL(/\/docs\/payments\/#fees$/);
  await expect(page.getByRole('heading', { name: '0.15% added on each side' })).toBeInViewport();
  expect(await page.evaluate(() => scrollY)).toBe(0);
});
test('all documentation pages render directly in a narrow bounded viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  for (const [slug, title] of [['', 'Getting started'], ['architecture', 'Architecture'], ['deployments','Contract addresses'], ['payments', 'Payments & fees'], ['invoices', 'Invoices & checkout'], ['groups', 'Groups & capacity'], ['privacy', 'Privacy & evidence'], ['kyb', 'Business verification'], ['sdk-api', 'SDK & API'], ['recovery', 'Recovery & limits'], ['organizations', 'Organizations & access']]) {
    const response = await page.goto('/docs/' + (slug ? slug + '/' : ''));
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
    const size = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth, document.documentElement.scrollHeight, innerHeight]);
    expect(size[0], slug).toBeLessThanOrEqual(size[1]); expect(size[2], slug).toBeLessThanOrEqual(size[3] + 1);
    const brand=await page.locator('.docs-header-brand').boundingBox(),actions=await page.locator('.docs-header-actions').boundingBox();expect(brand!.x+brand!.width,slug+' header overlap').toBeLessThanOrEqual(actions!.x);
  }
  expect(errors).toEqual([]);
});
test('landing exposes the verified native addresses with the correct explorer network and policy bytes',async({page})=>{
 await page.goto('/');await page.getByRole('link',{name:'Contract addresses',exact:true}).click();await expect(page).toHaveURL(/\/docs\/deployments\/#addresses$/);
 await expect(page.getByRole('heading',{level:1})).toHaveText('Contract addresses');await expect(page.locator('.docs-address-card')).toHaveCount(4);
 await expect(page.locator('.docs-deployment-context')).toHaveText('NEAR testnet · native NEAR · 0.1 NEAR per note');
 for(const c of [reference.registry,...reference.vaults]){const card=page.locator('.docs-address-card').filter({has:page.getByText(c.accountId,{exact:true})});await expect(card.locator('code')).toHaveText(c.accountId);await expect(card.getByRole('link')).toHaveAttribute('href','https://testnet.nearblocks.io/address/'+c.accountId);}
 const treasury=page.locator('.docs-address-card').filter({hasText:reference.feeRecipient.accountId});await expect(treasury.getByRole('heading')).toHaveText('Fee recipient account');
 const manifest=await page.request.get('/deployments/native-near.json');expect(manifest.status()).toBe(200);expect(await manifest.json()).toEqual(reference);
 const policy=await page.request.get('/deployments/native-policy.json');expect(policy.status()).toBe(200);expect(createHash('sha256').update(await policy.body()).digest('hex')).toBe(reference.policyFileSha256);expect(JSON.parse((await policy.body()).toString()).tokenId).toBeUndefined();
 await page.getByRole('heading',{name:'What this deployment establishes'}).scrollIntoViewIfNeeded();await expect(page.getByRole('cell',{name:'Not qualified. A separately funded token-bound v3 group and real wallet execution are still required.'})).toBeVisible();
});
test('addresses can be copied exactly and discovered by their full account ID',async({page,context,isMobile})=>{
 await context.grantPermissions(['clipboard-read','clipboard-write']);await page.goto('/docs/deployments/#addresses');await page.getByRole('button',{name:'Copy Vault A address',exact:true}).click();
 await expect(page.getByRole('status')).toHaveText('Copied Vault A address.');expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe(reference.vaults[0].accountId);
 const nav=await navigation(page,isMobile);await page.getByRole('searchbox',{name:'Search documentation'}).fill(reference.registry.accountId);await expect(nav.getByRole('link')).toHaveCount(1);await nav.getByRole('link',{name:'Contract addresses'}).click();await expect(page).toHaveURL(/\/docs\/deployments\/$/);
});
test('clipboard denial preserves selectable addresses without a false success',async({page})=>{
 await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{value:undefined}));await page.goto('/docs/deployments/#addresses');await page.getByRole('button',{name:'Copy Shared registry address',exact:true}).click();
 await expect(page.getByRole('status')).toHaveText('Copy unavailable. Select the address or hash manually.');await expect(page.getByText(reference.registry.accountId,{exact:true})).toBeVisible();
});
test('documentation search, mobile navigation and reading-position reset work together', async ({ page, isMobile }) => {
  await page.goto('/docs/');
  const nav = await navigation(page, isMobile);
  const search = page.getByRole('searchbox', { name: 'Search documentation' });
  await search.fill('does-not-exist-abcdef');
  await expect(page.getByRole('status')).toHaveText('No matching documentation.');
  await page.getByLabel('Clear documentation search').click();
  await search.fill('SDK & API');
  await expect(nav.getByRole('link')).toHaveCount(1);
  await nav.getByRole('link', { name: 'SDK & API' }).click();
  await expect(page).toHaveURL(/\/docs\/sdk-api\/$/);
  if (isMobile) await expect(page.locator('.docs-mobile-menu')).not.toHaveAttribute('open');
  const main = page.getByRole('main');
  if (!isMobile) await page.getByRole('navigation', { name: 'On this page' }).getByRole('link', { name: 'HTTP endpoints' }).click();
  else await page.getByRole('heading', { name: 'HTTP endpoints' }).scrollIntoViewIfNeeded();
  await expect.poll(() => main.evaluate(node => node.scrollTop)).toBeGreaterThan(0);
  await expect(page.getByRole('heading', { name: 'HTTP endpoints' })).toBeInViewport();
  expect(await page.evaluate(() => scrollY)).toBe(0);
  const nextNav = await navigation(page, isMobile);
  await nextNav.getByRole('link', { name: 'Privacy & evidence' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Privacy & evidence');
  await expect.poll(() => main.evaluate(node => node.scrollTop)).toBe(0);
});
test('legacy demo URLs land on related docs and workspace links stay operational', async ({ page, isMobile }) => {
  for (const [query, path] of [['', '/docs/'], ['?view=proofs', '/docs/privacy/'], ['?view=vaults', '/docs/architecture/'], ['?view=payments', '/docs/payments/']]) {
    await page.goto('/app/' + query);
    await expect(page).toHaveURL(new RegExp(path + '$'));
    await expect(page.locator('.docs-shell')).toBeVisible();
  }
  await page.getByRole('link', { name: 'Open workspace' }).click();
  await expect(page).toHaveURL(/\/live\/$/);
  if (isMobile) await page.getByLabel('Open merchant navigation').click();
  const nav = page.getByRole('navigation', { name: isMobile ? 'Mobile merchant navigation' : 'Merchant navigation' });
  await expect(nav.getByRole('link', { name: 'Payments', exact: true })).toHaveCount(0);
  await nav.getByRole('link', { name: 'Documentation', exact: true }).click();
  await expect(page).toHaveURL(/\/docs\/$/);
  await page.goto('/invoices/');
  await expect(page.getByRole('link', { name: 'Payment activity' })).toHaveAttribute('href', '/live/');
  await expect(page.locator('a[href^="/app/"]')).toHaveCount(0);
});
