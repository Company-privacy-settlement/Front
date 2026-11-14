import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { fixture, policy, hash, vault } from './invoice-fixture';
import { createPrivateNote, encryptNoteBackup, openNoteBackup } from '../../src/vendor/core-client/index.js';
const password = 'private note browser test passphrase', root = 'cd'.repeat(32);
async function setup(page: Page) {
  await fixture(page); await page.goto('/notes/');
  await page.getByLabel('Trusted FT policy JSON').setInputFiles({ name: 'policy.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(policy)) });
}
async function create(page: Page) {
  await page.getByLabel('Create passphrase', { exact: true }).fill(password);
  await page.getByLabel('Confirm passphrase', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Create encrypted note', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Public commitment', exact: true })).toBeVisible();
}
async function backup(page: Page, path: string) {
  const downloaded = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download encrypted note', exact: true }).click();
  await (await downloaded).saveAs(path); return readFile(path, 'utf8');
}
async function verify(page: Page, contents: string, pass = password) {
  await page.getByLabel('Backup passphrase', { exact: true }).fill(pass);
  await page.getByLabel('Verify or open encrypted note backup').setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: Buffer.from(contents) });
}
function response(commitment: string, receipt = root) {
  return { policy, checkedAtBlock: { hash, height: 200 }, remainingOutputs: 254, checkedVaults: 1, vaultScanComplete: true,
    plan: { checkedAtBlock: hash, tokenCall: { contract: policy.tokenId, method: 'ft_transfer_call', args: { receiver_id: vault, amount: '1001500', msg: JSON.stringify({ commitment, disclosure_root: receipt }) }, gas: '300000000000000', attachedYoctoNear: '1' } } };
}
test('browser creates a local encrypted note, verifies its downloaded backup and exports only a public deposit plan', async ({ page }, info) => {
  await setup(page); const requests: unknown[] = [];
  await page.route('https://core-api.example/v1/deposits/prepare', async route => {
    const body = route.request().postDataJSON(); requests.push(body);
    await route.fulfill({ json: response(body.commitment, body.disclosureRoot) });
  });
  await create(page); const contents = await backup(page, info.outputPath('private-note.json'));
  const opened = await openNoteBackup(contents, password, policy);
  await expect(page.locator('.note-commitment')).toHaveText(opened.note.commitment);
  for (const value of [opened.note.secret, opened.note.nullifier]) {
    expect(contents).not.toContain(value); await expect(page.locator('body')).not.toContainText(value);
  }
  await expect(page.getByLabel('Create passphrase', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Prepare public deposit plan', exact: true })).toBeDisabled();
  await verify(page, contents); await expect(page.getByRole('status')).toContainText('Encrypted backup verified');
  await expect(page.getByLabel('Backup passphrase', { exact: true })).toHaveValue('');
  await page.getByLabel('Payment service origin').fill('https://core-api.example');
  await page.getByRole('button', { name: 'Use random reference', exact: true }).click();
  const receipt = await page.getByLabel('Disclosure root', { exact: true }).inputValue(); expect(receipt).toMatch(/^[a-f0-9]{64}$/);
  await page.getByRole('button', { name: 'Prepare public deposit plan', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Ready for wallet review', exact: true })).toBeVisible();
  expect(requests).toEqual([{ commitment: opened.note.commitment, disclosureRoot: receipt }]);
  const planDownload = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download deposit plan', exact: true }).click();
  const target = info.outputPath('public-plan.json'); await (await planDownload).saveAs(target);
  const plan = await readFile(target, 'utf8'); expect(JSON.parse(plan).tokenCall.args.amount).toBe('1001500');
  for (const value of [opened.note.secret, opened.note.nullifier]) expect(plan).not.toContain(value);
  expect(await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }))).not.toContain(opened.note.secret);
  if (info.project.name === 'mobile') await page.setViewportSize({ width: 320, height: 740 });
  await page.getByText('Inspect public deposit call', { exact: true }).click();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.documentElement.scrollHeight <= innerHeight + 1)).toBe(true);
  await page.screenshot({ path: `/tmp/core-browser-notes-${info.project.name}.png` });
  await page.getByRole('link', { name: 'Open settlements', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Settlements', exact: true })).toBeVisible();
  await page.goto('/notes/'); await expect(page.locator('.note-commitment')).toHaveCount(0);
});
test('wrong passwords, substituted policies and invalid backups cannot unlock a note or enable preparation', async ({ page }) => {
  await setup(page); const note = await createPrivateNote(policy), contents = await encryptNoteBackup(policy, note, password);
  await verify(page, contents, 'wrong but sufficiently long passphrase'); await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
  await expect(page.locator('.note-commitment')).toHaveCount(0);
  const foreign = { ...policy, feeRecipient: 'other.testnet' };
  await verify(page, await encryptNoteBackup(foreign, note, password));
  await expect(page.getByRole('main').getByRole('alert')).toContainText('trusted policy'); await expect(page.locator('.note-commitment')).toHaveCount(0);
  await verify(page, contents); await expect(page.locator('.note-commitment')).toHaveText(note.commitment);
  await verify(page, contents, 'wrong but sufficiently long passphrase'); await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
  await page.getByLabel('Disclosure root', { exact: true }).fill(root);
  await expect(page.getByRole('button', { name: 'Prepare public deposit plan', exact: true })).toBeDisabled();
});
test('a delayed deposit response cannot reopen a locked note or retain a public plan', async ({ page }, info) => {
  await setup(page); await create(page); const contents = await backup(page, info.outputPath('note.json')); await verify(page, contents);
  await expect(page.getByRole('status')).toContainText('Encrypted backup verified');
  await page.getByLabel('Payment service origin').fill('https://core-api.example'); await page.getByLabel('Disclosure root', { exact: true }).fill(root);
  let release!: () => void, entered!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; }), started = new Promise<void>(resolve => { entered = resolve; });
  await page.route('https://core-api.example/v1/deposits/prepare', async route => {
    const body = route.request().postDataJSON(); entered(); await gate;
    await route.fulfill({ json: response(body.commitment, body.disclosureRoot) }).catch(() => {});
  });
  await page.getByRole('button', { name: 'Prepare public deposit plan', exact: true }).click(); await started;
  await page.getByRole('button', { name: 'Lock note', exact: true }).click(); release();
  await expect(page.locator('.note-commitment')).toHaveCount(0); await expect(page.locator('.note-plan-result')).toHaveCount(0);
  await expect(page.getByLabel('Backup passphrase', { exact: true })).toHaveValue('');
  await verify(page, contents); await expect(page.getByRole('status')).toContainText('Encrypted backup verified');
});
test('late file reads cannot unlock a note after locking', async ({ page }, info) => {
  await setup(page); await create(page); const contents = await backup(page, info.outputPath('note.json'));
  await page.evaluate(() => {
    const original = File.prototype.text;
    File.prototype.text = async function () {
      (window as any).noteReadStarted = true;
      await new Promise<void>(resolve => { (window as any).releaseNoteRead = resolve; });
      return original.call(this);
    };
  });
  await verify(page, contents); await page.waitForFunction(() => (window as any).noteReadStarted);
  await page.getByRole('button', { name: 'Lock note', exact: true }).click();
  await page.evaluate(() => (window as any).releaseNoteRead());
  await expect(page.getByRole('status')).toContainText('Note locked'); await expect(page.locator('.note-commitment')).toHaveCount(0);
});
test('page cache entry clears the open note synchronously and cached return requires its backup', async ({ page }, info) => {
  await setup(page); await create(page); const contents = await backup(page, info.outputPath('cache-note.json'));
  await page.getByLabel('Backup passphrase', { exact: true }).fill(password);
  const cached = await page.evaluate(() => {
    window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true }));
    return { commitment: document.querySelector('.note-commitment')?.textContent ?? null,
      passwords: [...document.querySelectorAll<HTMLInputElement>('input[type="password"]')].map(input => input.value) };
  });
  expect(cached.commitment).toBeNull(); expect(cached.passwords.every(value => value === '')).toBe(true);
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
  await expect(page.locator('.note-commitment')).toHaveCount(0);
  await verify(page, contents); await expect(page.getByRole('status')).toContainText('Encrypted backup verified');
});
test('page cache entry cancels note generation while encryption is still pending', async ({ page }) => {
  await setup(page);
  await page.evaluate(() => {
    const encrypt = crypto.subtle.encrypt.bind(crypto.subtle);
    crypto.subtle.encrypt = async (...args: Parameters<SubtleCrypto['encrypt']>) => {
      (window as any).noteEncryptionStarted = true;
      await new Promise<void>(resolve => { (window as any).finishNoteEncryption = resolve; });
      const result = await encrypt(...args); (window as any).noteEncryptionFinished = true; return result;
    };
  });
  await page.getByLabel('Create passphrase', { exact: true }).fill(password);
  await page.getByLabel('Confirm passphrase', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Create encrypted note', exact: true }).click();
  await page.waitForFunction(() => (window as any).noteEncryptionStarted);
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })));
  await expect(page.getByLabel('Create passphrase', { exact: true })).toHaveValue('');
  await page.evaluate(() => (window as any).finishNoteEncryption());
  await page.waitForFunction(() => (window as any).noteEncryptionFinished);
  await expect(page.locator('.note-commitment')).toHaveCount(0);
  await expect(page.getByRole('status')).toContainText('Note locked');
});
test('failed refreshes and substituted deposit plans clear previous wallet-review results', async ({ page }) => {
  await setup(page); const note = await createPrivateNote(policy), contents = await encryptNoteBackup(policy, note, password);
  await verify(page, contents); await expect(page.getByRole('status')).toContainText('Encrypted backup verified');
  await page.getByLabel('Payment service origin').fill('https://core-api.example'); await page.getByLabel('Disclosure root', { exact: true }).fill(root);
  let mode = 'good';
  await page.route('https://core-api.example/v1/deposits/prepare', async route => {
    if (mode === 'fail') await route.fulfill({ status: 409, json: { error: 'VAULT_NOT_READY' } });
    else await route.fulfill({ json: response(mode === 'substitute' ? '42' : note.commitment) });
  });
  const prepare = () => page.getByRole('button', { name: 'Prepare public deposit plan', exact: true }).click();
  await prepare(); await expect(page.locator('.note-plan-result')).toBeVisible();
  mode = 'substitute'; await prepare(); await expect(page.getByRole('main').getByRole('alert')).toContainText('requested note'); await expect(page.locator('.note-plan-result')).toHaveCount(0);
  mode = 'good'; await prepare(); await expect(page.locator('.note-plan-result')).toBeVisible();
  mode = 'fail'; await prepare(); await expect(page.getByRole('main').getByRole('alert')).toBeVisible(); await expect(page.locator('.note-plan-result')).toHaveCount(0);
  await expect(page.locator('.note-commitment')).toHaveText(note.commitment);
  mode = 'good'; await prepare(); await expect(page.locator('.note-plan-result')).toBeVisible();
  await page.getByLabel('Disclosure root', { exact: true }).fill('ab'.repeat(32)); await expect(page.locator('.note-plan-result')).toHaveCount(0);
});
