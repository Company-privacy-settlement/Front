import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { createReceipt, discloseReceipt, verifyReceiptDisclosure, encryptReceiptBackup, openReceiptBackup, createPrivateNote, encryptNoteBackup } from '../../src/vendor/core-client/index.js';
import { fixture, policy, hash, vault } from './invoice-fixture';
const password = 'private receipt browser test passphrase';
const values = { sender: 'Private business Alpha', recipient: 'Private employee Beta', asset: 'nep141:usdc.testnet', amount: '1000000', purpose: 'Secret payroll purpose', reference: 'PAY-2026-SECRET', occurredAt: '2026-11-13T00:00:00.000Z', credentialHash: '' };
const privatePanel = (page: Page) => page.getByRole('region', { name: 'Private receipt backup', exact: true });
const selection = (page: Page) => page.getByRole('region', { name: 'Selective disclosure', exact: true });
const verification = (page: Page) => page.getByRole('region', { name: 'Receipt integrity verification', exact: true });
async function jsonInput(page: Page, name: string, value: unknown) {
  await page.getByLabel(name, { exact: true }).setInputFiles({ name: 'receipt.json', mimeType: 'application/json', buffer: Buffer.from(typeof value === 'string' ? value : JSON.stringify(value)) });
}
async function create(page: Page) {
  await privatePanel(page).getByLabel('Sender reference', { exact: true }).fill(values.sender);
  await privatePanel(page).getByLabel('Recipient reference', { exact: true }).fill(values.recipient);
  await privatePanel(page).getByLabel('Asset reference', { exact: true }).fill(values.asset);
  await privatePanel(page).getByLabel('Declared amount', { exact: true }).fill(values.amount);
  await privatePanel(page).getByLabel('Purpose', { exact: true }).fill(values.purpose);
  await privatePanel(page).getByLabel('Business reference', { exact: true }).fill(values.reference);
  await privatePanel(page).getByLabel('Occurred at (UTC)', { exact: true }).fill(values.occurredAt);
  await privatePanel(page).getByLabel('Receipt passphrase', { exact: true }).fill(password);
  await privatePanel(page).getByLabel('Confirm receipt passphrase', { exact: true }).fill(password);
  await privatePanel(page).getByRole('button', { name: 'Create encrypted receipt', exact: true }).click();
  await expect(privatePanel(page).locator('.receipt-root')).toBeVisible();
}
async function download(page: Page, label: string, path: string) {
  const event = page.waitForEvent('download'); await page.getByRole('button', { name: label, exact: true }).click();
  await (await event).saveAs(path); return readFile(path, 'utf8');
}
async function restore(page: Page, encrypted: string, pass = password) {
  await privatePanel(page).getByLabel('Receipt backup passphrase', { exact: true }).fill(pass);
  await jsonInput(page, 'Encrypted receipt backup', encrypted);
}
test('private receipt stays local, verified backup gates selective export and independent-root verification', async ({ page }, info) => {
  const bodies: string[] = []; page.on('request', request => { if (request.postData()) bodies.push(request.postData()!); });
  await page.goto('/evidence/'); await create(page);
  const encrypted = await download(page, 'Download encrypted receipt', info.outputPath('receipt.encrypted.json'));
  const opened = await openReceiptBackup(encrypted, password);
  expect(encrypted).not.toContain(values.purpose); expect(encrypted).not.toContain(values.sender);
  await expect(page.getByRole('main')).not.toContainText(values.purpose);
  await expect(selection(page).getByRole('checkbox').first()).toBeDisabled();
  await restore(page, encrypted); await expect(page.getByRole('status')).toContainText('Encrypted receipt backup verified');
  await expect(selection(page).getByRole('checkbox', { checked: true })).toHaveCount(0);
  await selection(page).getByRole('checkbox', { name: 'Asset reference', exact: true }).check();
  await selection(page).getByRole('checkbox', { name: 'Declared amount', exact: true }).check();
  await selection(page).getByRole('button', { name: 'Prepare selected disclosure', exact: true }).click();
  const disclosedText = await download(page, 'Download selected disclosure', info.outputPath('selected.json')), disclosed = JSON.parse(disclosedText);
  expect(disclosed.openings.map((o: any) => o.field)).toEqual(['asset', 'amount']);
  expect(disclosedText).not.toContain(values.purpose); expect(disclosedText).not.toContain(values.sender);
  await verifyReceiptDisclosure(disclosed, opened.root);
  await jsonInput(page, 'Disclosed receipt JSON', disclosed);
  await expect(verification(page).getByLabel('Expected receipt root', { exact: true })).toHaveValue('');
  await expect(verification(page).getByRole('button', { name: 'Verify receipt integrity', exact: true })).toBeDisabled();
  await verification(page).getByLabel('Expected receipt root', { exact: true }).fill(opened.root);
  await verification(page).getByRole('button', { name: 'Verify receipt integrity', exact: true }).click();
  await expect(verification(page).getByRole('heading', { name: 'Receipt integrity verified', exact: true })).toBeVisible();
  await expect(verification(page)).toContainText('No chain lookup was performed');
  expect(bodies).toEqual([]); expect(await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }))).not.toContain(values.sender);
  if (info.project.name === 'mobile') await page.setViewportSize({ width: 320, height: 740 });
  await selection(page).getByText('Inspect selected proof', { exact: true }).click();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.documentElement.scrollHeight <= innerHeight + 1)).toBe(true);
  await page.screenshot({ path: `/tmp/core-receipts-${info.project.name}.png` });
});
test('editing the independent root or loading a tampered field clears previous verification', async ({ page }) => {
  const receipt = await createReceipt(values), disclosed = await discloseReceipt(receipt, ['amount']);
  await page.goto('/evidence/'); await jsonInput(page, 'Disclosed receipt JSON', disclosed);
  await verification(page).getByLabel('Expected receipt root', { exact: true }).fill(receipt.root);
  const verify = () => verification(page).getByRole('button', { name: 'Verify receipt integrity', exact: true }).click();
  await verify(); await expect(page.getByRole('region', { name: 'Verified receipt disclosure', exact: true })).toBeVisible();
  await verification(page).getByLabel('Expected receipt root', { exact: true }).fill('ab'.repeat(32));
  await expect(page.getByRole('region', { name: 'Verified receipt disclosure', exact: true })).toHaveCount(0);
  await verify(); await expect(page.getByRole('main').getByRole('alert')).toContainText('expected root');
  await verification(page).getByLabel('Expected receipt root', { exact: true }).fill(receipt.root);
  await jsonInput(page, 'Disclosed receipt JSON', { ...disclosed, openings: [{ ...disclosed.openings[0], value: '9999999' }] });
  await verify(); await expect(page.getByRole('main').getByRole('alert')).toContainText('integrity check failed');
  await expect(page.getByRole('region', { name: 'Verified receipt disclosure', exact: true })).toHaveCount(0);
});
test('invalid passwords cannot open backups and opening another receipt requires an explicit lock', async ({ page }) => {
  const first = await createReceipt(values), encrypted = await encryptReceiptBackup(first, password);
  const second = await createReceipt({ ...values, reference: 'OTHER' }), other = await encryptReceiptBackup(second, password);
  await page.goto('/evidence/'); await restore(page, encrypted, 'wrong but sufficiently long password');
  await expect(page.getByRole('main').getByRole('alert')).toContainText('Could not decrypt'); await expect(privatePanel(page).locator('.receipt-root')).toHaveCount(0);
  await restore(page, encrypted); await expect(privatePanel(page).locator('.receipt-root')).toHaveText(first.root);
  await restore(page, other); await expect(page.getByRole('main').getByRole('alert')).toContainText('Lock the workspace');
  await expect(privatePanel(page).locator('.receipt-root')).toHaveText(first.root);
  await expect(selection(page).getByRole('checkbox').first()).toBeDisabled();
  await page.getByRole('button', { name: 'Clear & lock', exact: true }).click(); await restore(page, other);
  await expect(privatePanel(page).locator('.receipt-root')).toHaveText(second.root);
});
test('page cache locking clears receipt drafts and rejects a late encrypted file read', async ({ page }) => {
  const receipt = await createReceipt(values), encrypted = await encryptReceiptBackup(receipt, password);
  await page.goto('/evidence/');
  await privatePanel(page).getByLabel('Purpose', { exact: true }).fill(values.purpose);
  await page.evaluate(() => {
    const original = File.prototype.text;
    File.prototype.text = async function () { (window as any).receiptReadStarted = true; await new Promise<void>(resolve => { (window as any).finishReceiptRead = resolve; }); return original.call(this); };
  });
  await restore(page, encrypted); await page.waitForFunction(() => (window as any).receiptReadStarted);
  const draft = await page.evaluate(() => {
    window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true }));
    return [...document.querySelectorAll<HTMLInputElement>('input')].map(input => input.value);
  });
  expect(draft).not.toContain(values.purpose); expect(draft).not.toContain(password);
  await page.evaluate(() => (window as any).finishReceiptRead());
  await expect(page.getByRole('status')).toContainText('Private receipt cleared'); await expect(privatePanel(page).locator('.receipt-root')).toHaveCount(0);
});
test('clearing the workspace during encryption prevents a completed task from reopening the receipt', async ({ page }) => {
  await page.goto('/evidence/');
  await page.evaluate(() => {
    const encrypt = crypto.subtle.encrypt.bind(crypto.subtle);
    crypto.subtle.encrypt = async (...args: Parameters<SubtleCrypto['encrypt']>) => {
      (window as any).receiptEncryptionStarted = true;
      await new Promise<void>(resolve => { (window as any).finishReceiptEncryption = resolve; });
      const result = await encrypt(...args); (window as any).receiptEncryptionDone = true; return result;
    };
  });
  await privatePanel(page).getByLabel('Receipt passphrase', { exact: true }).fill(password);
  await privatePanel(page).getByLabel('Confirm receipt passphrase', { exact: true }).fill(password);
  await privatePanel(page).getByRole('button', { name: 'Create encrypted receipt', exact: true }).click();
  await page.waitForFunction(() => (window as any).receiptEncryptionStarted);
  await page.getByRole('button', { name: 'Clear & lock', exact: true }).click(); await page.evaluate(() => (window as any).finishReceiptEncryption());
  await page.waitForFunction(() => (window as any).receiptEncryptionDone);
  await expect(privatePanel(page).locator('.receipt-root')).toHaveCount(0); await expect(privatePanel(page).getByLabel('Receipt passphrase', { exact: true })).toHaveValue('');
});
test('deposit preparation receives only the imported receipt root and clears it after a failed import', async ({ page }) => {
  await fixture(page); const note = await createPrivateNote(policy), encrypted = await encryptNoteBackup(policy, note, password);
  const receipt = await createReceipt(values), disclosed = await discloseReceipt(receipt, ['asset', 'amount']), requests: unknown[] = [];
  await page.route('https://core-api.example/v1/deposits/prepare', async route => {
    const body = route.request().postDataJSON(); requests.push(body);
    await route.fulfill({ json: { policy, checkedAtBlock: { hash, height: 200 }, remainingOutputs: 254, checkedVaults: 1, vaultScanComplete: true,
      plan: { checkedAtBlock: hash, tokenCall: { contract: policy.tokenId, method: 'ft_transfer_call', args: { receiver_id: vault, amount: '1001500', msg: JSON.stringify({ commitment: body.commitment, disclosure_root: body.disclosureRoot }) }, attachedYoctoNear: '1', gas: '300000000000000' } } } });
  });
  await page.goto('/notes/'); await jsonInput(page, 'Trusted FT policy JSON', policy);
  await page.getByLabel('Backup passphrase', { exact: true }).fill(password); await jsonInput(page, 'Verify or open encrypted note backup', encrypted);
  await expect(page.getByRole('status')).toContainText('Encrypted backup verified');
  await jsonInput(page, 'Import receipt root from disclosure JSON', disclosed); await expect(page.getByLabel('Disclosure root', { exact: true })).toHaveValue(receipt.root);
  await page.getByLabel('Payment service origin').fill('https://core-api.example'); await page.getByRole('button', { name: 'Prepare public deposit plan', exact: true }).click();
  await expect(page.locator('.note-plan-result')).toBeVisible(); expect(requests).toEqual([{ commitment: note.commitment, disclosureRoot: receipt.root }]);
  await jsonInput(page, 'Import receipt root from disclosure JSON', { ...disclosed, openings: [] });
  await expect(page.getByRole('main').getByRole('alert')).toBeVisible(); await expect(page.getByLabel('Disclosure root', { exact: true })).toHaveValue('');
  await expect(page.locator('.note-plan-result')).toHaveCount(0); await expect(page.getByRole('button', { name: 'Prepare public deposit plan', exact: true })).toBeDisabled();
});
