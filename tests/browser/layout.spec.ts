import { test, expect } from '@playwright/test';

test('workspaces fit a narrow viewport and keep long-form actions reachable without scrolling the body', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  for (const path of ['/docs/', '/docs/sdk-api/', '/organization/', '/docs/organizations/', '/invoices/', '/live/', '/kyb/business/', '/kyb/documents/', '/kyb/status/', '/pay/']) {
    await page.goto(path);
    const size = await page.evaluate(() => ({ width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth, scrollHeight: document.documentElement.scrollHeight }));
    expect(size.scrollWidth, path).toBeLessThanOrEqual(size.width);
    expect(size.scrollHeight, path).toBeLessThanOrEqual(size.height + 1);
  }
  await page.goto('/kyb/business/');
  const main = page.getByRole('main');
  const box = (await main.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.wheel(0, 10000);
  await expect(page.getByRole('button', { name: 'Continue to people' })).toBeInViewport();
  await page.mouse.wheel(0, 10000);
  expect(await page.evaluate(() => scrollY)).toBe(0);
  await page.mouse.wheel(0, -10000);
  await expect(page.getByRole('heading', { name: 'Tell us about your business', exact: true })).toBeInViewport();
  expect(await page.evaluate(() => scrollY)).toBe(0);
});

test('KYB page navigation returns the reading area to the top', async ({ page }) => {
  await page.goto('/kyb/business/');
  const main = page.getByRole('main');
  await main.evaluate(node => { node.scrollTop = node.scrollHeight; });
  await expect.poll(() => main.evaluate(node => node.scrollTop)).toBeGreaterThan(0);
  await page.getByRole('navigation', { name: 'KYB steps' }).getByRole('link', { name: /People & ownership/ }).click();
  await expect(page.getByRole('heading', { name: 'Who owns and runs the business?', exact: true })).toBeVisible();
  await expect.poll(() => main.evaluate(node => node.scrollTop)).toBe(0);
  expect(await page.evaluate(() => scrollY)).toBe(0);
});
