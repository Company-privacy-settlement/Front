import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fees, initialState, near, readState, recipients, settle, YOCTO } from '../src/lib/demo';
import { createReceipt, verifyReceipt, type Field } from '../src/lib/receipts';
test('deposit and withdrawal add exact 0.15% fees without reducing principal', () => {
  const q = fees(); assert.equal(near(q.protocol), '0.0015'); assert.equal(near(q.deposit), '1.0215'); assert.equal(near(q.withdrawal), '0.0215');
  const start = initialState(), deposited = settle(start, 'deposit', 'a');
  assert.equal(deposited.notes, 4); assert.equal(deposited.vaults[0].balance, 5); assert.equal(deposited.outputs, 13);
  assert.equal(BigInt(deposited.wallet), BigInt(start.wallet) - q.deposit);
  const paid = settle(deposited, 'payment', 'b', recipients[1]);
  assert.equal(paid.notes, 3); assert.equal(paid.vaults[1].balance, 4); assert.equal(paid.outputs, 13);
  assert.equal(paid.activities[0].amount, YOCTO.toString()); assert.equal(paid.activities[0].name, 'Alex Morgan');
  assert.equal(BigInt(paid.wallet), BigInt(start.wallet) - q.deposit - q.withdrawal);
  assert.equal(start.notes, 3); assert.equal(start.vaults[0].balance, 4);
});
test('insufficient balance, empty vault, and full deposit tree reject without mutation', () => {
  const start = initialState(); assert.throws(() => settle({ ...start, notes: 0 }, 'payment', 'a'), /balance/);
  assert.throws(() => settle({ ...start, wallet: '0' }, 'deposit', 'a'), /wallet/);
  assert.throws(() => settle({ ...start, vaults: start.vaults.map(v => ({ ...v, balance: 0 })) }, 'payment', 'a'), /liquidity/);
  assert.throws(() => settle({ ...start, outputs: 256 }, 'deposit', 'a'), /full/);
  assert.equal(settle({ ...start, outputs: 256 }, 'payment', 'a').notes, 2);
});
test('corrupt persisted data resets; valid local state is restored', () => {
  assert.deepEqual(readState('{bad'), initialState()); assert.deepEqual(readState(JSON.stringify({ ...initialState(), wallet: '-1' })), initialState());
  const next = settle(initialState(), 'deposit', 'c'); assert.deepEqual(readState(JSON.stringify(next)), next);
  assert.deepEqual(readState(JSON.stringify({ ...next, activities: [{ ...next.activities[0], reference: null }] })), initialState());
});
test('selective receipt openings verify; tampering, wrong root and duplicate fields fail', async () => {
  const values = { sender: 'Private sender', recipient: 'Sample business', asset: 'NEAR', amount: YOCTO.toString(), purpose: 'Invoice', reference: 'INV-001', occurredAt: '2026-11-12', credentialHash: 'not-attested' };
  const receipt = await createReceipt(values); assert.equal(await verifyReceipt(receipt), true);
  const selected = { ...receipt, openings: receipt.openings.filter(o => ['asset','amount','reference'].includes(o.field)) };
  assert.equal(await verifyReceipt(selected), true); assert.ok(!JSON.stringify(selected).includes('Private sender'));
  assert.equal(await verifyReceipt({ ...selected, root: '0'.repeat(64) }), false);
  assert.equal(await verifyReceipt({ ...selected, openings: selected.openings.map((o,i) => i ? o : { ...o, value: 'TAMPERED' }) }), false);
  assert.equal(await verifyReceipt({ ...selected, openings: [selected.openings[0],selected.openings[0]] }), false);
  assert.equal(await verifyReceipt({ ...selected, openings: [{ ...selected.openings[0], field: 'unknown' as Field }] }), false);
  assert.equal(await verifyReceipt({ ...selected, openings: [] }), false);
});
