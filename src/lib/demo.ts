export const YOCTO = 10n ** 24n;
export const STORAGE = 2n * 10n ** 22n;
export function fees(amount: bigint = YOCTO) {
  if (amount <= 0n) throw new Error('Amount must be positive');
  const protocol = amount * 15n / 10_000n;
  return { principal: amount, protocol, storage: STORAGE, deposit: amount + protocol + STORAGE, withdrawal: protocol + STORAGE };
}
export function near(value: bigint | string, digits = 4) {
  const n = BigInt(value), whole = n / YOCTO;
  const fraction = (n % YOCTO).toString().padStart(24, '0').slice(0, digits);
  return `${whole.toLocaleString('en-US')}${digits ? `.${fraction}` : ''}`;
}
export type Vault = { id: string; name: string; balance: number; color: string };
export type Activity = { id: string; kind: 'payment' | 'deposit'; name: string; country: string; reference: string; time: string; vault: string; amount: string; fee: string; status: 'Simulated'; initials: string };
export type DemoState = { version: 1; wallet: string; notes: number; outputs: number; vaults: Vault[]; activities: Activity[] };
export const recipients = [
  { id: 'meridian', name: 'Meridian Studio', type: 'Business', country: 'Abu Dhabi, UAE', initials: 'MS', reference: 'INV-2026-018' },
  { id: 'alex', name: 'Alex Morgan', type: 'Employee', country: 'New York, US', initials: 'AM', reference: 'PAY-2026-011' },
  { id: 'atlas', name: 'Atlas Collective', type: 'Business', country: 'Delaware, US', initials: 'AC', reference: 'INV-2026-024' },
];
export function initialState(): DemoState {
  return { version: 1, wallet: (20n * YOCTO).toString(), notes: 3, outputs: 12,
    vaults: [{ id: 'a', name: 'Vault A', balance: 4, color: '#b8df89' }, { id: 'b', name: 'Vault B', balance: 5, color: '#8bafca' }, { id: 'c', name: 'Vault C', balance: 3, color: '#c2afe1' }],
    activities: [
      { id: 'DEMO-1024', kind: 'payment', name: 'Meridian Studio', country: 'Abu Dhabi, UAE', reference: 'INV-2026-017', time: '12 Nov, 09:41', vault: 'b', amount: YOCTO.toString(), fee: fees().protocol.toString(), status: 'Simulated', initials: 'MS' },
      { id: 'DEMO-1023', kind: 'deposit', name: 'Private balance', country: 'Your demo wallet', reference: 'DEP-2026-003', time: '12 Nov, 09:38', vault: 'a', amount: YOCTO.toString(), fee: fees().protocol.toString(), status: 'Simulated', initials: '↓' },
      { id: 'DEMO-1022', kind: 'payment', name: 'Alex Morgan', country: 'New York, US', reference: 'PAY-2026-010', time: '11 Nov, 16:20', vault: 'c', amount: YOCTO.toString(), fee: fees().protocol.toString(), status: 'Simulated', initials: 'AM' },
    ] };
}
export function settle(state: DemoState, kind: 'payment' | 'deposit', vault: string, recipient = recipients[0], now = new Date()): DemoState {
  const q = fees(), target = state.vaults.find(v => v.id === vault);
  if (!target) throw new Error('Select a vault');
  if (kind === 'deposit' && state.outputs >= 256) throw new Error('Demo tree is full. Reset the workspace to continue.');
  if (kind === 'payment' && (state.notes < 1 || target.balance < 1)) throw new Error('Not enough private balance or vault liquidity.');
  const charge = kind === 'deposit' ? q.deposit : q.withdrawal;
  if (BigInt(state.wallet) < charge) throw new Error('Not enough funds in the demo wallet.');
  const id = `DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const activity: Activity = { id, kind, name: kind === 'deposit' ? 'Private balance' : recipient.name,
    country: kind === 'deposit' ? 'Your demo wallet' : recipient.country, initials: kind === 'deposit' ? '↓' : recipient.initials,
    reference: kind === 'deposit' ? `DEP-${id.slice(5)}` : recipient.reference, time: now.toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
    vault, amount: YOCTO.toString(), fee: q.protocol.toString(), status: 'Simulated' };
  return { ...state, wallet: (BigInt(state.wallet) - charge).toString(), notes: state.notes + (kind === 'deposit' ? 1 : -1), outputs: state.outputs + (kind === 'deposit' ? 1 : 0),
    vaults: state.vaults.map(v => v.id === vault ? { ...v, balance: v.balance + (kind === 'deposit' ? 1 : -1) } : v), activities: [activity, ...state.activities].slice(0, 100) };
}
export function readState(raw: string | null): DemoState {
  try {
    if (!raw || raw.length > 200_000) return initialState();
    const s = JSON.parse(raw);
    if (s.version !== 1 || !/^\d+$/.test(s.wallet) || BigInt(s.wallet) > 100n * YOCTO || !Number.isInteger(s.notes) || s.notes < 0 || s.notes > 256 || !Number.isInteger(s.outputs) || s.outputs < 0 || s.outputs > 256) return initialState();
    if (!Array.isArray(s.vaults) || s.vaults.length !== 3 || s.vaults.some((v: Vault, i: number) => v.id !== ['a', 'b', 'c'][i] || !Number.isInteger(v.balance) || v.balance < 0 || v.balance > 256)) return initialState();
    if (!Array.isArray(s.activities) || s.activities.length > 100 || s.activities.some((a: Activity) => !a || !['payment', 'deposit'].includes(a.kind) || typeof a.name !== 'string' || a.name.length > 100 || a.amount !== YOCTO.toString() || typeof a.id !== 'string' || !['country', 'reference', 'time', 'initials'].every(k => typeof (a as unknown as Record<string, unknown>)[k] === 'string') || a.fee !== fees().protocol.toString() || a.status !== 'Simulated' || !['a','b','c'].includes(a.vault))) return initialState();
    if (s.notes > s.vaults.reduce((n: number, v: Vault) => n + v.balance, 0)) return initialState();
    return { ...s, vaults: initialState().vaults.map((v, i) => ({ ...v, balance: s.vaults[i].balance })) } as DemoState;
  } catch { return initialState(); }
}
export function download(value: unknown, filename: string) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }));
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
