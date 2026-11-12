type Vector = { verificationKey: Record<string, unknown>; proof: string; publicSignals: string[]; case: string; source: string };
declare global { interface Window { snarkjs?: { groth16: { verify(key: unknown, inputs: string[], proof: unknown): Promise<boolean> } }; } }
let loading: Promise<void> | undefined;
async function loadVerifier() {
  if (window.snarkjs) return;
  await (loading ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script'); script.src = '/vendor/snarkjs.min.js';
    script.onload = () => resolve(); script.onerror = () => { loading = undefined; script.remove(); reject(new Error('Could not load the local proof verifier.')); };
    document.head.appendChild(script);
  }));
}
export async function verifyRecordedProof() {
  await loadVerifier();
  const response = await fetch('/data/proof-vector.json');
  if (!response.ok) throw new Error('Recorded proof could not be loaded.');
  const vector = await response.json() as Vector;
  const bytes = Uint8Array.from(atob(vector.proof), c => c.charCodeAt(0));
  if (bytes.length !== 256 || vector.publicSignals.length !== 5) throw new Error('Unexpected proof format.');
  const limb = (i: number) => BigInt(`0x${Array.from(bytes.slice(i * 32, (i + 1) * 32)).reverse().map(v => v.toString(16).padStart(2, '0')).join('')}`).toString();
  const proof = { protocol: 'groth16', curve: 'bn128', pi_a: [limb(0), limb(1), '1'], pi_b: [[limb(2), limb(3)], [limb(4), limb(5)], ['1', '0']], pi_c: [limb(6), limb(7), '1'] };
  const valid = await window.snarkjs!.groth16.verify(vector.verificationKey, vector.publicSignals, proof);
  if (!valid) throw new Error('The recorded proof did not verify.');
  return vector;
}
