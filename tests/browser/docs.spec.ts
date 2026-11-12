import { test, expect, type Page } from '@playwright/test';
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
    await expect(page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'Testnet workspace' })).toHaveAttribute('href', '/live/');
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
  for (const [slug, title] of [['', 'Getting started'], ['architecture', 'Architecture'], ['payments', 'Payments & fees'], ['invoices', 'Invoices & checkout'], ['privacy', 'Privacy & evidence'], ['kyb', 'Business verification'], ['sdk-api', 'SDK & API'], ['recovery', 'Recovery & limits']]) {
    const response = await page.goto('/docs/' + (slug ? slug + '/' : ''));
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
    const size = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth, document.documentElement.scrollHeight, innerHeight]);
    expect(size[0], slug).toBeLessThanOrEqual(size[1]); expect(size[2], slug).toBeLessThanOrEqual(size[3] + 1);
  }
  expect(errors).toEqual([]);
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
