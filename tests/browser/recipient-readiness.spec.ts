import { test, expect, type Page } from '@playwright/test';
import { fixture, issue, policy, hash } from './invoice-fixture';

const implicit = 'a'.repeat(64), region = (page: Page) => page.getByRole('region', { name: 'Recipient preparation', exact: true });
function snapshot(recipient: string, exists = true, registered = false) {
  return { policy, recipient, checkedAtBlock: { hash, height: 200 },
    accountKind: /^[a-f0-9]{64}$/.test(recipient) ? 'near_implicit' : 'named_or_other',
    accountExists: exists, tokenRegistered: registered,
    state: !exists ? 'account_missing' : !registered ? 'registration_required' : 'ready',
    canReceiveTokens: exists && registered, storageMinimumYoctoNear: '1250000000000000000000',
    registrationCall: exists && !registered ? { contract: policy.tokenId, method: 'storage_deposit', args: { account_id: recipient, registration_only: true }, attachedYoctoNear: '1250000000000000000000', gas: '300000000000000' } : null,
    activationAmountYoctoNear: null, gasBudgetIncluded: false, chainFreshnessChecked: false };
}
async function draft(page: Page, recipient = implicit) {
  await page.goto('/invoices/');
  await page.getByLabel('Payment service origin').fill('https://core-api.example');
  await page.getByLabel('Trusted FT policy JSON').setInputFiles({ name: 'policy.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(policy)) });
  await page.getByLabel('Payout NEAR account').fill(recipient);
}
test('recipient check separates activation and token registration without signing or submitting an invoice', async ({ page }, info) => {
  const f = await fixture(page), requests: unknown[] = [];
  let exists = false, registered = false;
  await page.route('https://core-api.example/v1/recipients/readiness', async route => {
    const body = route.request().postDataJSON(); requests.push(body);
    await route.fulfill({ json: snapshot(body.recipient, exists, registered) });
  });
  await draft(page); await region(page).getByRole('button', { name: 'Check recipient', exact: true }).click();
  await expect(region(page).getByText('Account activation required', { exact: true })).toBeVisible();
  await expect(region(page).getByText('Receiving preparation pending', { exact: true })).toBeVisible();
  await expect(region(page).getByRole('link', { name: 'Account creation guide' })).toHaveAttribute('href', 'https://docs.near.org/integrations/accounts');
  exists = true;
  await region(page).getByRole('button', { name: 'Refresh recipient', exact: true }).click();
  await expect(region(page).getByText('Account active', { exact: true })).toBeVisible();
  await expect(region(page)).toContainText('0.00125 NEAR');
  await region(page).getByText('Inspect public registration call').click();
  await expect(region(page).locator('pre')).toContainText(implicit);
  await expect(region(page).locator('pre')).toContainText('storage_deposit');
  await expect(region(page).locator('pre')).not.toContainText('Transfer');
  registered = true;
  await region(page).getByRole('button', { name: 'Refresh recipient', exact: true }).click();
  await expect(region(page).getByText('Ready for payment review', { exact: true })).toBeVisible();
  await expect(region(page).locator('details')).toHaveCount(0);
  expect(requests).toEqual([{ recipient: implicit }, { recipient: implicit }, { recipient: implicit }]);
  expect(f.bodies).toEqual([]);
  await expect(page.getByRole('button', { name: 'Connect merchant wallet' })).toBeVisible();
  await expect(page.getByLabel('Payment link', { exact: true })).toHaveCount(0);
  if (info.project.name === 'mobile') await page.setViewportSize({ width: 320, height: 740 });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.documentElement.scrollHeight <= innerHeight + 1)).toBe(true);
  await region(page).screenshot({ path: `/tmp/core-recipient-${info.project.name}.png` });
});
test('failed or substituted readiness clears a previous ready snapshot and editing destination invalidates it', async ({ page }) => {
  await fixture(page); let mode = 'ready';
  await page.route('https://core-api.example/v1/recipients/readiness', async route => {
    const recipient = route.request().postDataJSON().recipient;
    if (mode === 'fail') await route.fulfill({ status: 502, json: { error: 'CHAIN_READ_FAILED' } });
    else await route.fulfill({ json: snapshot(mode === 'substitute' ? 'attacker.testnet' : recipient, true, true) });
  });
  await draft(page, 'recipient.testnet');
  const check = () => region(page).getByRole('button', { name: /^(Check|Refresh) recipient$/ }).click();
  await check(); await expect(region(page)).toContainText('Ready for payment review');
  mode = 'fail'; await check(); await expect(region(page).getByRole('alert')).toBeVisible();
  await expect(region(page)).not.toContainText('Ready for payment review');
  mode = 'substitute'; await check(); await expect(region(page).getByRole('alert')).toContainText('trusted destination');
  mode = 'ready'; await check(); await expect(region(page)).toContainText('Ready for payment review');
  await page.getByLabel('Payout NEAR account').fill('new-recipient.testnet');
  await expect(region(page)).not.toContainText('Ready for payment review');
  await expect(region(page).getByRole('button', { name: 'Check recipient', exact: true })).toBeEnabled();
  await check(); await expect(region(page)).toContainText('Ready for payment review');
  await page.getByLabel('Payment service origin').fill('https://other-api.example');
  await expect(region(page)).not.toContainText('Ready for payment review');
});
test('late recipient responses cannot repopulate an edited form and an untrusted API cannot propose registration', async ({ page }) => {
  await fixture(page); let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  let entered!: () => void; const started = new Promise<void>(resolve => { entered = resolve; });
  let calls = 0;
  await page.route('https://core-api.example/v1/recipients/readiness', async route => {
    calls++; const recipient = route.request().postDataJSON().recipient; entered(); await gate;
    await route.fulfill({ json: snapshot(recipient, true, true) }).catch(() => {});
  });
  await draft(page); await region(page).getByRole('button', { name: 'Check recipient', exact: true }).click();
  await started; await page.getByLabel('Payout NEAR account').fill('new.testnet'); release();
  await expect(region(page).getByRole('button', { name: 'Check recipient', exact: true })).toBeEnabled();
  await expect(region(page)).not.toContainText('Ready for payment review');
  await page.route('https://core-api.example/v1/config', route => route.fulfill({ json: { policy: { ...policy, tokenId: 'fake.testnet' }, signing: 'client-wallet' } }));
  await region(page).getByRole('button', { name: 'Check recipient', exact: true }).click();
  await expect(region(page).getByRole('alert')).toContainText('policy');
  expect(calls).toBe(1);
});
test('checkout readiness uses the signed invoice recipient only after independent policy verification', async ({ page }) => {
  await fixture(page); const { link, signed } = await issue(page), recipients: string[] = [];
  await page.route('https://core-api.example/v1/recipients/readiness', async route => {
    const recipient = route.request().postDataJSON().recipient; recipients.push(recipient);
    await route.fulfill({ json: snapshot(recipient, false, true) });
  });
  await page.goto(new URL(link).pathname + new URL(link).hash);
  await expect(region(page).getByRole('button', { name: 'Check recipient', exact: true })).toBeDisabled();
  await page.getByLabel('Payment service origin').fill('https://core-api.example');
  await page.getByLabel('Trusted policy JSON', { exact: true }).setInputFiles({ name: 'policy.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(policy)) });
  await page.getByRole('button', { name: 'Verify API policy', exact: true }).click();
  await expect(region(page).getByRole('button', { name: 'Check recipient', exact: true })).toBeEnabled();
  await region(page).getByRole('button', { name: 'Check recipient', exact: true }).click();
  await expect(region(page)).toContainText('Account activation required'); await expect(region(page)).toContainText('Token registered');
  await expect(region(page)).not.toContainText('Ready for payment review');
  expect(recipients).toEqual([signed.invoice.recipient]);
});
