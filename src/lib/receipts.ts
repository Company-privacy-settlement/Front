export const FIELDS = ['sender', 'recipient', 'asset', 'amount', 'purpose', 'reference', 'occurredAt', 'credentialHash'] as const;
export type Field = typeof FIELDS[number];
export type Opening = { field: Field; value: string; salt: string; siblings: string[] };
export type Receipt = { version: 1; root: string; openings: Opening[] };
const hex = (b: Uint8Array) => Array.from(b, v => v.toString(16).padStart(2, '0')).join('');
async function hash(s: string) { return hex(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))); }
const leaf = (f: Field, value: string, salt: string) => hash(JSON.stringify(['core:receipt:v1', f, value, salt]));
const branch = (l: string, r: string) => hash(`core:receipt:node:v1|${l}|${r}`);
export async function createReceipt(values: Record<Field, string>): Promise<Receipt> {
  if (FIELDS.some(f => typeof values[f] !== 'string' || values[f].length > 4096)) throw new Error('Invalid receipt value');
  const salts = FIELDS.map(() => hex(crypto.getRandomValues(new Uint8Array(32))));
  const levels = [await Promise.all(FIELDS.map((f, i) => leaf(f, values[f], salts[i])))];
  while (levels.at(-1)!.length > 1) {
    const last = levels.at(-1)!, next: string[] = [];
    for (let i = 0; i < last.length; i += 2) next.push(await branch(last[i], last[i + 1]));
    levels.push(next);
  }
  return { version: 1, root: levels.at(-1)![0], openings: FIELDS.map((field, i) => {
    let index = i; const siblings = levels.slice(0, -1).map(l => { const s = l[index ^ 1]; index >>= 1; return s; });
    return { field, value: values[field], salt: salts[i], siblings };
  }) };
}
export async function verifyReceipt(receipt: Receipt): Promise<boolean> {
  if (receipt.version !== 1 || !/^[a-f0-9]{64}$/.test(receipt.root) || !receipt.openings.length) return false;
  const seen = new Set<Field>();
  for (const o of receipt.openings) {
    let index = FIELDS.indexOf(o.field); if (index < 0 || seen.has(o.field) || typeof o.value !== 'string' || o.value.length > 4096 || o.siblings.length !== 3 || o.siblings.some(s => !/^[a-f0-9]{64}$/.test(s)) || !/^[a-f0-9]{64}$/.test(o.salt)) return false;
    seen.add(o.field); let h = await leaf(o.field, o.value, o.salt);
    for (const sibling of o.siblings) { h = index & 1 ? await branch(sibling, h) : await branch(h, sibling); index >>= 1; }
    if (h !== receipt.root) return false;
  }
  return true;
}
