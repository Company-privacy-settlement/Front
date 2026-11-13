"use client";
import { useEffect, useLayoutEffect, useRef, useState, type ChangeEvent } from 'react';
import { Check, LockKeyhole, Square } from 'lucide-react';
import { usePageHideLock } from '@/lib/page-hide-lock';
import { ProvingFilesFields, provingAssets, provingFilesReady, type ProvingFileSelection } from './proving-files';
import { BrowserProver, HttpGateway, feeQuote, invoiceRoot, openNoteBackup, prepareInvoiceProof,
  type Operation, type Policy, type PrivateNote, type ProofBundle, type ProverResult, type ProverStage, type SignedInvoice } from '@/vendor/core-client/index.js';

const stages: Record<ProverStage, string> = { assets: 'Checking proving files', tree: 'Rebuilding the original group tree', witness: 'Calculating your private witness', proving: 'Generating the invoice payment proof', verifying: 'Verifying your proof locally' };
async function read(event: ChangeEvent<HTMLInputElement>, limit: number) {
  const file = event.target.files?.[0]; event.target.value = '';
  if (!file || file.size < 1 || file.size > limit) throw new Error(`Choose a JSON file no larger than ${limit / 1000} KB`);
  return file.text();
}
export function InvoiceNotePayment({ signed, paymentIndex, policy, api, disabled, progress, run, onPrepared, getOperations }: {
  signed: SignedInvoice; paymentIndex: number; policy: Policy; api: string; disabled: boolean;
  progress: 'note' | 'review' | 'wallet' | 'confirmed';
  run(action: (check: () => void) => Promise<void>): Promise<void>;
  onPrepared(bundle: ProofBundle, index: number, check: () => void): Promise<void>;
  getOperations(): Promise<readonly Operation[]>;
}) {
  const [note, setNote] = useState<PrivateNote | null>(null), [password, setPassword] = useState('');
  const [files, setFiles] = useState<ProvingFileSelection>({}), [hash, setHash] = useState(''), [vault, setVault] = useState('');
  const [root, setRoot] = useState(''), [result, setResult] = useState<ProverResult | null>(null), [stage, setStage] = useState('');
  const [job, setJob] = useState<'open' | 'prove' | 'review' | null>(null), [notice, setNotice] = useState(''), [error, setError] = useState('');
  const generation = useRef(0), controller = useRef<AbortController | null>(null), current = useRef<PrivateNote | null>(null), pending = useRef(false);
  function clear() { generation.current++; controller.current?.abort(); controller.current = null; pending.current = false; current.current = null; setNote(null); setPassword(''); setResult(null); setJob(null); setStage(''); setNotice(''); setError(''); }
  usePageHideLock(clear);
  useLayoutEffect(() => { clear(); setRoot(''); let active = true; invoiceRoot(signed.invoice, paymentIndex).then(value => { if (active) setRoot(value); }).catch(e => { if (active) setError(e.message); }); return () => { active = false; }; }, [signed, paymentIndex]);
  useEffect(() => () => { generation.current++; controller.current?.abort(); current.current = null; }, []);
  function invalidate() { setResult(null); setNotice(''); setError(''); }
  async function task(kind: NonNullable<typeof job>, action: (check: () => void, signal: AbortSignal) => Promise<void>) {
    if (pending.current || disabled) return;
    pending.current = true; setJob(kind); setNotice(''); setError('');
    const mine = ++generation.current, abort = new AbortController(); controller.current = abort;
    try {
      await run(async checkParent => {
        const check = () => { checkParent(); if (mine !== generation.current) throw new DOMException('Invoice note changed', 'AbortError'); abort.signal.throwIfAborted(); };
        await action(check, abort.signal); check();
      });
    } finally { if (mine === generation.current) { pending.current = false; controller.current = null; setJob(null); setStage(''); } }
  }
  function cancel() { generation.current++; controller.current?.abort(); controller.current = null; pending.current = false; setJob(null); setStage(''); setResult(null); setNotice('Proof generation cancelled. No payment was sent.'); }
  async function open(event: ChangeEvent<HTMLInputElement>) {
    invalidate(); current.current = null; setNote(null); const contents = read(event, 16000); void contents.catch(() => {});
    await task('open', async check => { const text = await contents; check(); const opened = await openNoteBackup(text, password, policy); check(); current.current = opened.note; setNote(opened.note); setPassword(''); setNotice('Note opened locally. Its secret and passphrase stay on your device.'); });
  }
  async function prove() {
    const privateNote = current.current; if (!privateNote) return; invalidate();
    await task('prove', async (check, signal) => {
      const worker = () => new Worker(new URL('../vendor/core-client/prover-worker.js', import.meta.url), {type:'module',name:'core-invoice-prover'});
      const proof = await prepareInvoiceProof(new BrowserProver(worker), new HttpGateway(api), signed, paymentIndex, privateNote, provingAssets(files, hash), vault, { signal, getOperations, onProgress: next => { check(); setStage(stages[next]); } });
      check(); setResult(proof); setNotice('Proof verified for this invoice unit. Review the amount and fees before signing.');
    });
  }
  const quote = feeQuote(policy), step = progress === 'confirmed' ? 4 : progress === 'wallet' ? 3 : progress === 'review' ? 2 : result ? 2 : note ? 1 : 0;
  return <div className="invoice-note-payment" aria-label="Invoice note payment">
    <ol className="invoice-payment-steps" aria-label="Payment progress">{['Select note','Generate proof','Review amount & fees','Wallet approval','Confirmed'].map((label,index) => <li key={label} aria-current={index === step ? 'step' : undefined} className={index < step ? 'done' : ''}>{index < step ? <Check size={14}/> : <span>{index + 1}</span>}{label}</li>)}</ol>
    <h3>Pay with a private note</h3><p>Select an encrypted note from this invoice’s original group. The recipient, amount and payment reference come from the signed invoice.</p>
    <div className="live-policy invoice-note-binding"><span>Selected payment</span><strong>{signed.invoice.version === 2 ? `${paymentIndex + 1} of ${signed.invoice.units}` : 'Legacy shared reference'}</strong><span>Recipient</span><code>{signed.invoice.recipient}</code><span>Payment reference</span><code>{root || 'Loading signed reference…'}</code></div>
    <div className="invoice-note-grid"><div>
      <label className="form-label">Note passphrase<input type="password" autoComplete="off" value={password} disabled={disabled || !!note} onChange={e => setPassword(e.target.value)}/></label>
      <label className="form-label">Select encrypted note<input type="file" accept=".json,application/json" disabled={disabled || !!note || password.length < 12 || password.length > 1024} onChange={e => void open(e)}/></label>
      {note && <div className="invoice-open-note"><span>Selected public commitment</span><code className="note-commitment">{note.commitment}</code><button className="text-link" disabled={disabled && job !== 'prove'} onClick={clear}><LockKeyhole size={13}/> Lock selected note</button></div>}
      <label className="form-label">Payout vault<input value={vault} disabled={disabled} placeholder="A verified vault in the original group" onChange={e => { setVault(e.target.value); invalidate(); }}/></label>
      <details className="invoice-proving-files"><summary>Trusted proving files</summary><p>Import the release files and its artifact manifest SHA-256 from an independent trusted source. These public files stay in this tab for the next invoice unit.</p>
        <ProvingFilesFields files={files} hash={hash} disabled={disabled} onFiles={next => { setFiles(next); invalidate(); }} onHash={next => { setHash(next); invalidate(); }} onError={setError}/>
      </details>
      <div className="live-buttons"><button className="button button-dark" disabled={disabled || !note || !root || !vault || !provingFilesReady(files,hash)} onClick={() => void prove()}>Generate invoice proof</button>{job === 'prove' && <button className="button button-outline" onClick={cancel}><Square size={13}/> Cancel proof</button>}</div>
      {stage && <p className="notes-notice" role="status">{stage}</p>}
    </div><div className="invoice-note-quote">
      <h3>This payment unit</h3><p>{policy.tokenId} · amounts in token atomic units</p><div className="quote-lines"><div><span>Recipient receives</span><strong>{quote.principalTokens}</strong></div><div><span>Withdrawal protocol fee · 0.15% added</span><strong>{quote.feeTokens}</strong></div><div><span>Token charged to your fee payer wallet</span><strong>{quote.feeTokens}</strong></div><div><span>Principal source</span><strong>Your funded private note</strong></div></div>
      <p>The deposit fee was separate. NEAR gas, token registration, storage credit and first-use bonds are checked during review and approved individually.</p>
      {result && <div className="invoice-proof-ready"><h3>Invoice proof ready</h3><p>Generated and verified locally in {(result.metrics.elapsedMs/1000).toFixed(2)} seconds. No wallet signature or transaction has been sent.</p>{result.bundle.setup === 'UNSAFE_LOCAL_DEVELOPMENT_ONLY' && <p className="prover-development">Unsafe local development proving setup. Use test assets only.</p>}
        <button className="button button-dark" disabled={disabled} onClick={() => void task('review',async check => { await onPrepared(result.bundle,paymentIndex,check); check(); current.current = null; setNote(null); setPassword(''); setResult(null); setNotice('Public payment added to review. Keep the encrypted note backup until the withdrawal is confirmed.'); })}>Review amount & fees</button>
      </div>}
    </div></div>
    {error && <p className="error-text" role="alert">{error}</p>}{notice && <p className="notes-notice" role="status">{notice}</p>}
  </div>;
}
