import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { InvoiceLibrary, createInvoice, invoiceHash, invoiceMessage, nonceBytes, INVOICE_SIGNING_RECIPIENT, verifySignedInvoice, type SignedInvoice } from '../../src/vendor/core-client/index.js';
import { fixture, issue } from './invoice-fixture';
const password = 'merchant invoice library test password', storageKey = 'core-invoice-library-v1:testnet:merchant.testnet';
const library = (page: Page) => page.getByRole('region', { name: 'Your invoice library', exact: true });
async function createLibrary(page: Page) {
  await library(page).getByLabel('Library passphrase').fill(password);
  await library(page).getByRole('button', { name: 'Create library', exact: true }).click();
  await expect(library(page).getByRole('button', { name: 'Lock library', exact: true })).toBeEnabled();
}
async function save(page: Page, count: number) {
  await expect(library(page).getByRole('button', { name: 'Save displayed invoice' })).toBeEnabled();
  await library(page).getByRole('button', { name: 'Save displayed invoice' }).click();
  await expect(library(page).locator('.invoice-library-entry')).toHaveCount(count);
  await expect(library(page).getByRole('button', { name: 'Save displayed invoice' })).toBeEnabled();
}
async function connect(page: Page) {
  await page.getByRole('button', { name: 'Connect merchant wallet', exact: true }).click();
  await page.getByText('Invoice Fixture Wallet', { exact: true }).click();
  await expect(page.getByRole('button', { name: 'merchant.testnet', exact: true })).toBeVisible();
}
async function encryptedBackup(signed: SignedInvoice, passphrase = password) {
  let value: string | null = null;
  const store = { read: async () => value, write: async (e: string) => { value = e; }, exclusive: async <T>(fn: () => Promise<T>) => fn() };
  const book = new InvoiceLibrary(store, passphrase, { network: 'testnet', accountId: signed.invoice.merchantAccount });
  await book.create(); await book.add(signed); return book.export();
}
async function resign(page: Page, signed: SignedInvoice) {
  const invoice = createInvoice({ ...signed.invoice, title: 'Second private milestone', reference: 'INV-SECOND' });
  const signature = await page.evaluate(payload => (window as any).fixtureInvoiceSign(payload), {
    message: invoiceMessage(await invoiceHash(invoice), invoice.policy.network), nonce: Array.from(nonceBytes(invoice.nonce)), recipient: INVOICE_SIGNING_RECIPIENT,
  });
  return verifySignedInvoice({ invoice, signature });
}

test('merchant library encrypts saved requests, restores after reload and hides an opened request on lock', async ({ page }, info) => {
  await fixture(page); const created = await issue(page);
  let reads = 0; page.on('request', request => { if (request.url().startsWith('https://core-api.example/')) reads++; });
  await createLibrary(page); await save(page, 1); await save(page, 1);
  expect(reads).toBe(0);
  const encrypted = await page.evaluate(key => localStorage.getItem(key), storageKey);
  expect(JSON.parse(encrypted!).format).toBe('core-invoice-library'); expect(encrypted).not.toContain(created.signed.invoice.title); expect(encrypted).not.toContain(created.signed.invoice.reference);
  const downloaded = page.waitForEvent('download'); await library(page).getByRole('button', { name: 'Export encrypted library' }).click();
  const file = await downloaded, backup = await readFile((await file.path())!, 'utf8');
  expect(file.suggestedFilename()).toContain('.encrypted.json'); expect(backup).not.toContain(created.signed.invoice.title); expect(JSON.parse(backup).format).toBe('core-invoice-library');
  await library(page).getByLabel('Search saved invoices').fill('no match');
  await expect(library(page).getByText('No saved invoices match your search.')).toBeVisible();
  await library(page).getByLabel('Search saved invoices').fill('INV-2026');
  await expect(library(page).locator('.invoice-library-entry')).toHaveCount(1);
  const viewport = page.viewportSize()!;
  if (info.project.name === 'mobile') await page.setViewportSize({ width: 320, height: 568 });
  await library(page).evaluate(node => node.scrollIntoView({ block: 'start' }));
  const bounds = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth, document.documentElement.scrollHeight, innerHeight]);
  expect(bounds[0]).toBeLessThanOrEqual(bounds[1]); expect(bounds[2]).toBeLessThanOrEqual(bounds[3] + 1);
  await page.screenshot({ path: info.outputPath('encrypted-invoice-library.png') });
  await page.setViewportSize(viewport);
  await page.reload(); await connect(page);
  await expect(library(page).locator('.invoice-library-entry')).toHaveCount(0);
  await library(page).getByLabel('Library passphrase').fill('wrong local passphrase');
  await library(page).getByRole('button', { name: 'Unlock library', exact: true }).click();
  await expect(library(page).getByRole('alert')).toContainText('Could not decrypt');
  await library(page).getByLabel('Library passphrase').fill(password);
  await library(page).getByRole('button', { name: 'Unlock library', exact: true }).click();
  await expect(library(page).locator('.invoice-library-entry')).toHaveCount(1);
  await library(page).getByRole('button', { name: 'Open INV-2026-007', exact: true }).click();
  await expect(page.locator('.invoice-summary h2')).toHaveText('Design milestone');
  expect(reads).toBe(0);
  await library(page).getByRole('button', { name: 'Lock library', exact: true }).click();
  await expect(library(page).locator('.invoice-library-entry')).toHaveCount(0); await expect(page.locator('.invoice-summary')).toHaveCount(0);
  expect(await page.evaluate(key => localStorage.getItem(key), storageKey)).toBe(encrypted);
});

test('encrypted restore and merge retain existing requests and reject corrupted backups', async ({ page }) => {
  await fixture(page); const first = await issue(page), second = await resign(page, first.signed), backup = await encryptedBackup(first.signed);
  await library(page).getByLabel('Library passphrase').fill(password);
  await library(page).getByLabel('Restore encrypted library', { exact: true }).setInputFiles({ name: 'library.encrypted.json', mimeType: 'application/json', buffer: Buffer.from(backup) });
  await expect(library(page).locator('.invoice-library-entry')).toHaveCount(1);
  await library(page).locator('.library-merge summary').click();
  const otherPassword = 'different backup library passphrase', incoming = await encryptedBackup(second, otherPassword);
  await library(page).getByLabel('Backup passphrase, if different').fill(otherPassword);
  await library(page).getByLabel('Merge encrypted library', { exact: true }).setInputFiles({ name: 'other.encrypted.json', mimeType: 'application/json', buffer: Buffer.from(incoming) });
  await expect(library(page).locator('.invoice-library-entry')).toHaveCount(2);
  await library(page).getByLabel('Backup passphrase, if different').fill(otherPassword);
  await library(page).getByLabel('Merge encrypted library', { exact: true }).setInputFiles({ name: 'other-again.encrypted.json', mimeType: 'application/json', buffer: Buffer.from(incoming) });
  await expect(library(page).getByRole('status')).toContainText('Backup merged'); await expect(library(page).locator('.invoice-library-entry')).toHaveCount(2);
  const before = await page.evaluate(key => localStorage.getItem(key), storageKey), corrupt = JSON.parse(incoming);
  corrupt.ciphertext = (corrupt.ciphertext[0] === 'A' ? 'B' : 'A') + corrupt.ciphertext.slice(1);
  await library(page).getByLabel('Backup passphrase, if different').fill(otherPassword);
  await library(page).getByLabel('Merge encrypted library', { exact: true }).setInputFiles({ name: 'corrupt.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(corrupt)) });
  await expect(library(page).getByRole('alert')).toContainText('Could not decrypt');
  expect(await page.evaluate(key => localStorage.getItem(key), storageKey)).toBe(before);
  const secondRow = library(page).getByRole('article', { name: 'Saved invoice INV-SECOND' });
  await secondRow.getByRole('button', { name: 'Remove local copy' }).click();
  await expect(library(page).locator('.invoice-library-entry')).toHaveCount(1);
  await library(page).getByRole('button', { name: 'Lock library', exact: true }).click();
  const existing = await page.evaluate(key => localStorage.getItem(key), storageKey);
  await library(page).getByLabel('Library passphrase').fill(password);
  await library(page).getByLabel('Restore encrypted library', { exact: true }).setInputFiles({ name: 'restore-over-existing.json', mimeType: 'application/json', buffer: Buffer.from(backup) });
  await expect(library(page).getByRole('alert')).toContainText('empty storage'); expect(await page.evaluate(key => localStorage.getItem(key), storageKey)).toBe(existing);
});

test('a merchant account change closes the previous library and keeps its encrypted namespace intact', async ({ page }) => {
  await fixture(page); await issue(page); await createLibrary(page); await save(page, 1);
  const before = await page.evaluate(key => localStorage.getItem(key), storageKey);
  await page.evaluate(() => localStorage.setItem('fixtureInvoiceAccount', 'other-merchant.testnet'));
  await page.getByRole('button', { name: 'merchant.testnet', exact: true }).click();
  await page.getByText('Invoice Fixture Wallet', { exact: true }).click();
  await expect(page.getByRole('button', { name: 'other-merchant.testnet', exact: true })).toBeVisible();
  await expect(page.getByLabel('Invoice title', { exact: true })).toHaveValue('');
  await expect(page.getByLabel('Invoice reference', { exact: true })).toHaveValue('');
  await expect(library(page).locator('.invoice-library-entry')).toHaveCount(0); await expect(page.getByLabel('Payment link')).toHaveCount(0);
  await createLibrary(page); await expect(library(page).locator('.invoice-library-entry')).toHaveCount(0);
  expect(await page.evaluate(key => localStorage.getItem(key), storageKey)).toBe(before);
  expect(await page.evaluate(() => localStorage.getItem('core-invoice-library-v1:testnet:other-merchant.testnet'))).not.toBeNull();
});

test('locking during encryption cancels a pending save without overwriting storage', async ({ page }) => {
  await fixture(page); await issue(page); await createLibrary(page);
  const before = await page.evaluate(key => localStorage.getItem(key), storageKey);
  await page.evaluate(() => {
    const encrypt = crypto.subtle.encrypt.bind(crypto.subtle); let hold = true;
    crypto.subtle.encrypt = async (...args: Parameters<typeof encrypt>) => {
      if (hold) { hold = false; await new Promise<void>(resolve => { (window as any).releaseLibraryEncryption = resolve; }); }
      return encrypt(...args);
    };
  });
  await library(page).getByRole('button', { name: 'Save displayed invoice' }).click();
  await page.waitForFunction(() => typeof (window as any).releaseLibraryEncryption === 'function');
  await library(page).getByRole('button', { name: 'Lock library', exact: true }).click();
  await page.evaluate(() => (window as any).releaseLibraryEncryption()); await page.evaluate(() => new Promise(requestAnimationFrame));
  expect(await page.evaluate(key => localStorage.getItem(key), storageKey)).toBe(before);
  await library(page).getByLabel('Library passphrase').fill(password); await library(page).getByRole('button', { name: 'Unlock library', exact: true }).click();
  await expect(library(page).getByRole('button', { name: 'Save displayed invoice' })).toBeEnabled();
  await expect(library(page).locator('.invoice-library-entry')).toHaveCount(0);
});

test('a delayed backup read cannot merge into a newly unlocked library after lock', async ({ page }) => {
  await fixture(page); const created = await issue(page); await createLibrary(page);
  const incoming = await encryptedBackup(created.signed), before = await page.evaluate(key => localStorage.getItem(key), storageKey);
  await page.evaluate(() => {
    const read = File.prototype.text, request = navigator.locks.request.bind(navigator.locks);
    (window as any).libraryLockCalls = 0;
    (navigator.locks as any).request = (...args: any[]) => { (window as any).libraryLockCalls++; return (request as any)(...args); };
    File.prototype.text = async function () {
      if (this.name === 'delayed-backup.json') await new Promise<void>(resolve => { (window as any).releaseBackupFileRead = resolve; });
      const text = await read.call(this);
      if (this.name === 'delayed-backup.json') (window as any).backupFileReadDone = true;
      return text;
    };
  });
  await library(page).locator('.library-merge summary').click();
  await library(page).getByLabel('Merge encrypted library', { exact: true }).setInputFiles({ name: 'delayed-backup.json', mimeType: 'application/json', buffer: Buffer.from(incoming) });
  await page.waitForFunction(() => typeof (window as any).releaseBackupFileRead === 'function');
  await library(page).getByRole('button', { name: 'Lock library', exact: true }).click();
  await library(page).getByLabel('Library passphrase').fill(password);
  await library(page).getByRole('button', { name: 'Unlock library', exact: true }).click();
  await expect(library(page).getByRole('button', { name: 'Save displayed invoice' })).toBeEnabled();
  const locks = await page.evaluate(() => (window as any).libraryLockCalls);
  await page.evaluate(() => (window as any).releaseBackupFileRead());
  await page.waitForFunction(() => (window as any).backupFileReadDone === true);
  await page.evaluate(() => new Promise(requestAnimationFrame));
  expect(await page.evaluate(() => (window as any).libraryLockCalls)).toBe(locks);
  expect(await page.evaluate(key => localStorage.getItem(key), storageKey)).toBe(before);
  await expect(library(page).locator('.invoice-library-entry')).toHaveCount(0);
});
