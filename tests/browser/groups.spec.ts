import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
const policy = (registry: string) => ({ network: 'testnet' as const, registry, denomination: '1000000', tokenId: 'usdc.testnet', feeRecipient: 'treasury.testnet', registryWasmSha256: 'aa'.repeat(32), vaultWasmSha256: 'bb'.repeat(32), verifierSha256: 'cc'.repeat(32) });
const old = policy('old.testnet'), next = policy('next.testnet');
const directory = { version: 1, groups: [{ id: 'old', depositsEnabled: false, policy: old }, { id: 'next', depositsEnabled: true, policy: next }] };
function capacity(p: typeof old, used = 2) {
  return { policy: p, checkedAtBlock: { hash: 'B'.repeat(44), height: 200 }, capacity: 256, usedOutputs: used, remainingOutputs: 256 - used, outstandingNotes: 1,
    depositCapacityAvailable: used < 256, depositVaultObserved: used < 256, checkedVaults: 1, vaultScanComplete: true, chainFreshnessChecked: false };
}
async function setup(page: Page) {
  const requests: string[] = [], state = { used: 2, fail: false, wrongPolicy: false, malformed: false };
  await page.route(/^https:\/\/(old|next)-api\.example\//, async route => {
    const url = new URL(route.request().url()), p = url.hostname.startsWith('old') ? old : next;
    requests.push(url.href);
    expect(route.request().method()).toBe('GET'); expect(route.request().postData()).toBeNull();
    if (url.pathname === '/v1/config') return route.fulfill({ json: { policy: state.wrongPolicy ? old : p }, headers: { 'access-control-allow-origin': '*' } });
    if (state.fail) return route.fulfill({ status: 503, json: { error: 'RPC_BUDGET_EXCEEDED' }, headers: { 'access-control-allow-origin': '*' } });
    const snapshot = capacity(p, p === old ? 256 : state.used);
    return route.fulfill({ json: state.malformed ? { ...snapshot, remainingOutputs: 999 } : snapshot, headers: { 'access-control-allow-origin': '*' } });
  });
  await page.goto('/live/'); await page.getByText('Choose from approved groups', { exact: true }).click();
  await page.getByLabel('Approved group directory').setInputFiles({ name: 'groups.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(directory)) });
  await expect(page.getByRole('region', { name: 'Approved group next', exact: true })).toBeVisible();
  expect(requests).toEqual([]);
  return { state, requests };
}
const row = (page: Page, id: string) => page.getByRole('region', { name: `Approved group ${id}`, exact: true });
async function check(page: Page, id: string) {
  await page.getByLabel(`Core API for ${id}`).fill(`https://${id}-api.example`);
  await row(page, id).getByRole('button', { name: `Check ${id}`, exact: true }).click();
  await expect(row(page, id).locator('.group-capacity')).toBeVisible();
}
async function wallet(page: Page) {
  await page.route('https://raw.githubusercontent.com/hot-dao/**/manifest.json', r => r.fulfill({ json: { wallets: [], version: '1' } }));
  await page.addInitScript(() => {
    const provider = {
      manifest: { id: 'groups-fixture', name: 'Groups Fixture Wallet', type: 'injected', platform: ['web'], icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>', permissions: {}, features: { testnet: true, mainnet: false, signAndSendTransaction: true, signInWithoutAddKey: true } },
      signIn: async () => [{ accountId: 'payer.testnet' }], getAccounts: async () => [{ accountId: 'payer.testnet' }], signOut: async () => {},
      signAndSendTransaction: async () => { throw new Error('No wallet signatures expected in group selection tests'); },
    };
    window.addEventListener('near-selector-ready', () => window.dispatchEvent(new CustomEvent('near-wallet-injected', { detail: provider })));
  });
}

test('approved groups show bounded capacity, apply verified selection, and preserve retired-group recovery', async ({ page }, info) => {
  await wallet(page); await setup(page); await check(page, 'old');
  await expect(row(page, 'old').getByText('Deposits disabled', { exact: true })).toBeVisible();
  await expect(row(page, 'old').getByRole('button', { name: 'Use old for deposits' })).toBeDisabled();
  await check(page, 'next');
  await expect(row(page, 'next').getByText('Capacity available', { exact: true })).toBeVisible();
  await page.setViewportSize(info.project.name === 'mobile' ? { width: 320, height: 568 } : { width: 1440, height: 1000 });
  const size = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth, document.documentElement.scrollHeight, innerHeight]);
  expect(size[0]).toBeLessThanOrEqual(size[1]); expect(size[2]).toBeLessThanOrEqual(size[3] + 1);
  await row(page, 'next').screenshot({ path: info.outputPath('approved-group.png') });
  await row(page, 'next').getByRole('button', { name: 'Use next for deposits' }).click();
  await expect(page.locator('.group-selected')).toContainText('New deposits enabled');
  await expect(page.getByLabel('Core API origin', { exact: true })).toHaveValue('https://next-api.example');
  await expect(page.getByRole('button', { name: 'Policy matches' })).toBeVisible();
  await row(page, 'old').getByRole('button', { name: 'Use old for recovery' }).click();
  await expect(page.locator('.group-selected')).toContainText('Withdrawals and recovery');
  const downloaded = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download selected policy' }).click();
  const file = await downloaded; expect(JSON.parse(await readFile((await file.path())!, 'utf8'))).toEqual(old);
  await page.getByRole('button', { name: 'Connect testnet wallet' }).click();
  await page.getByText('Groups Fixture Wallet', { exact: true }).click();
  await page.getByLabel('Journal passphrase').fill('group recovery test password');
  await page.getByRole('button', { name: 'Create journal' }).click();
  await expect(page.getByLabel('Public FT payment plan')).toBeEnabled();
  await expect(page.getByLabel('Approved group directory')).toBeDisabled();
  const plan = { tokenCall: { contract: old.tokenId, method: 'ft_transfer_call', args: { receiver_id: `v${'a'.repeat(32)}.${old.registry}`, amount: '1001500', msg: JSON.stringify({ commitment: '42', disclosure_root: 'ab'.repeat(32) }) }, attachedYoctoNear: '1', gas: '300000000000000' } };
  await page.getByLabel('Public FT payment plan').setInputFiles({ name: 'deposit.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(plan)) });
  await expect(page.locator('.live-feedback[role=alert]')).toContainText('New deposit imports are disabled');
  await expect(page.getByRole('button', { name: 'Approve payment in wallet' })).toHaveCount(0);
});

test('a group that fills before selection cannot apply a stale deposit snapshot', async ({ page }) => {
  const f = await setup(page); await check(page, 'next'); f.state.used = 256;
  await row(page, 'next').getByRole('button', { name: 'Use next for deposits' }).click();
  await expect(row(page, 'next').getByText('Full', { exact: true })).toBeVisible();
  await expect(row(page, 'next').getByRole('button', { name: 'Use next for deposits' })).toBeDisabled();
  await expect(row(page, 'next').getByRole('alert')).toContainText('no verified deposit capacity');
  await expect(page.locator('.group-selected')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Policy matches' })).toHaveCount(0);
});

test('wrong API policies and malformed or failed refreshes invalidate selection', async ({ page }) => {
  const f = await setup(page); f.state.wrongPolicy = true;
  await page.getByLabel('Core API for next').fill('https://next-api.example');
  await row(page, 'next').getByRole('button', { name: 'Check next', exact: true }).click();
  await expect(row(page, 'next').getByRole('alert')).toContainText('policy differs');
  expect(f.requests.some(url => url.endsWith('/v1/group/capacity'))).toBe(false);
  f.state.wrongPolicy = false; await row(page, 'next').getByRole('button', { name: 'Check next', exact: true }).click();
  await expect(row(page, 'next').locator('.group-capacity')).toBeVisible();
  await row(page, 'next').getByRole('button', { name: 'Use next for deposits' }).click();
  await expect(page.getByRole('button', { name: 'Policy matches' })).toBeVisible();
  f.state.malformed = true; await row(page, 'next').getByRole('button', { name: 'Refresh next', exact: true }).click();
  await expect(row(page, 'next').getByRole('alert')).toContainText('Inconsistent group capacity');
  await expect(page.getByRole('button', { name: 'Policy matches' })).toHaveCount(0);
  await expect(row(page, 'next').getByRole('button', { name: 'Use next for deposits' })).toHaveCount(0);
  f.state.malformed = false; f.state.fail = true;
  await row(page, 'next').getByRole('button', { name: 'Check next', exact: true }).click();
  await expect(row(page, 'next').getByRole('alert')).toContainText('RPC_BUDGET_EXCEEDED');
  await page.getByLabel('Approved group directory').setInputFiles({ name: 'unapproved.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ ...directory, api: 'https://untrusted.example' })) });
  await expect(page.locator('.group-picker').getByRole('alert')).toContainText('Unexpected group fields');
  await expect(page.getByRole('region', { name: 'Approved group next', exact: true })).toHaveCount(0);
});

test('editing an API while a capacity lookup is pending discards its old response', async ({ page }) => {
  await setup(page); let entered!: () => void, release!: () => void;
  const started = new Promise<void>(resolve => { entered = resolve; }), gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('https://next-api.example/v1/group/capacity', async route => { entered(); await gate; await route.fulfill({ json: capacity(next), headers: { 'access-control-allow-origin': '*' } }).catch(() => {}); });
  await page.getByLabel('Core API for next').fill('https://next-api.example');
  await row(page, 'next').getByRole('button', { name: 'Check next', exact: true }).click(); await started;
  await page.getByLabel('Core API for next').fill('https://replacement-api.example'); release();
  await expect(row(page, 'next').getByText('Not checked', { exact: true })).toBeVisible();
  await expect(row(page, 'next').locator('.group-capacity')).toHaveCount(0);
  await expect(row(page, 'next').getByRole('button', { name: 'Use next for deposits' })).toHaveCount(0);
});
