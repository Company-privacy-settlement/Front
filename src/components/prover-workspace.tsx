"use client";
import {defaultApiOrigin} from '@/lib/deployment';
import Link from 'next/link';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { ArrowUpRight, Download, LockKeyhole, Square } from 'lucide-react';
import { MerchantShell } from './merchant-shell';
import { usePageHideLock } from '@/lib/page-hide-lock';
import { ProvingFilesFields, provingAssets, provingFilesReady, type ProvingFileSelection } from './proving-files';
import { BrowserProver, HttpGateway, feeQuote, openNoteBackup, parsePolicy, parseProofBundle, parseProvingContext,
  type Policy, type PrivateNote, type ProvingContext, type ProverResult, type ProverStage } from '@/vendor/core-client/index.js';

const labels: Record<ProverStage, string> = { assets: 'Checking proving files', tree: 'Rebuilding the original group tree', witness: 'Calculating the private witness', proving: 'Generating your proof', verifying: 'Verifying the proof locally' };
function download(value: unknown, name: string) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' })), a = document.createElement('a');
  a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function selected(event: ChangeEvent<HTMLInputElement>, limit: number): File {
  const file = event.target.files?.[0]; event.target.value = '';
  if (!file || file.size < 1 || file.size > limit) throw new Error(`Choose a file no larger than ${Math.round(limit / 1024)} KB`);
  return file;
}

export function ProverWorkspace() {
  const [policy, setPolicy] = useState<Policy | null>(null), [note, setNote] = useState<PrivateNote | null>(null), [password, setPassword] = useState('');
  const [assets, setAssets] = useState<ProvingFileSelection>({}), [manifestHash, setManifestHash] = useState('');
  const [api, setApi] = useState(defaultApiOrigin), [vault, setVault] = useState(''), [context, setContext] = useState<ProvingContext | null>(null);
  const [recipient, setRecipient] = useState(''), [root, setRoot] = useState(''), [result, setResult] = useState<ProverResult | null>(null);
  const [busy, setBusy] = useState(false), [stage, setStage] = useState(''), [error, setError] = useState(''), [notice, setNotice] = useState('');
  const generation = useRef(0), pending = useRef(false), controller = useRef<AbortController | null>(null), current = useRef<PrivateNote | null>(null);
  function invalidate() { setResult(null); setNotice(''); setError(''); }
  useEffect(() => () => { generation.current++; controller.current?.abort(); current.current = null; }, []);
  function cancel() {
    generation.current++; controller.current?.abort(); controller.current = null; pending.current = false;
    setBusy(false); setStage(''); setResult(null); setError(''); setNotice('Cancelled. No proof was saved or payment sent.');
  }
  function lock() {
    cancel(); current.current = null; setNote(null); setPassword(''); setContext(null); setRecipient(''); setRoot(''); setNotice('Note locked. Reopen its encrypted backup to continue.');
  }
  usePageHideLock(lock);
  async function run(action: (check: () => void, signal: AbortSignal) => Promise<void>) {
    if (pending.current) return;
    pending.current = true; setBusy(true); setResult(null); setError(''); setNotice('');
    const mine = ++generation.current, abort = new AbortController(); controller.current = abort;
    const check = () => { if (mine !== generation.current) throw new DOMException('Workspace changed', 'AbortError'); abort.signal.throwIfAborted(); };
    try { await action(check, abort.signal); }
    catch (e) { if (mine === generation.current) setError(e instanceof Error ? e.message : 'Local proving failed'); }
    finally { if (mine === generation.current) { pending.current = false; controller.current = null; setBusy(false); setStage(''); } }
  }
  async function importPolicy(event: ChangeEvent<HTMLInputElement>) {
    lock(); setPolicy(null);
    let file: File; try { file = selected(event, 16000); } catch (e) { setError((e as Error).message); return; }
    await run(async check => {
      const text = await file.text(); check(); const parsed = parsePolicy(JSON.parse(text));
      if (parsed.network !== 'testnet' || !parsed.tokenId) throw new Error('Choose a trusted token settlement policy');
      feeQuote(parsed); setPolicy(parsed); setVault(''); setNotice('Original group policy loaded.');
    });
  }
  async function openNote(event: ChangeEvent<HTMLInputElement>) {
    invalidate();
    let file: File; try { file = selected(event, 16000); } catch (e) { setError((e as Error).message); return; }
    current.current = null; setNote(null);
    if (!policy) return;
    await run(async check => {
      const text = await file.text(); check();
      const opened = await openNoteBackup(text, password, policy); check();
      current.current = opened.note; setNote(opened.note); setPassword(''); setNotice('Note opened locally. No secret was sent to the API.');
    });
  }
  async function loadContext() {
    if (!policy) return; setContext(null);
    await run(async (check, signal) => {
      const snapshot = await new HttpGateway(api).provingContext(policy, vault, { signal }); check(); setContext(snapshot);
      setNotice('Finalized group snapshot loaded. Its ordered commitments will be rebuilt locally before proving.');
    });
  }
  async function importContext(event: ChangeEvent<HTMLInputElement>) {
    invalidate(); setContext(null);
    let file: File; try { file = selected(event, 32000); } catch (e) { setError((e as Error).message); return; }
    if (!policy) return;
    await run(async check => {
      const text = await file.text(); check(); const parsed = parseProvingContext(JSON.parse(text), policy);
      setContext(parsed); setVault(parsed.vault); setNotice('Public snapshot imported. Its tree will be rebuilt locally; importing does not establish current chain readiness.');
    });
  }
  function worker() { return new Worker(new URL('../vendor/core-client/prover-worker.js', import.meta.url), { type: 'module', name: 'core-local-prover' }); }
  async function prove() {
    const privateNote = current.current; if (!policy || !privateNote || !context) return;
    await run(async (check, signal) => {
      const output = await new BrowserProver(worker).prove({ policy, note: privateNote, context, action: { recipient, disclosureRoot: root } }, provingAssets(assets, manifestHash), {
        signal, onProgress: next => { check(); setStage(labels[next]); },
      });
      check(); setResult(output); setNotice('Proof generated and verified locally. No payment has been sent.');
    });
  }
  async function verifyFile(event: ChangeEvent<HTMLInputElement>) {
    invalidate();
    let file: File; try { file = selected(event, 24000); } catch (e) { setError((e as Error).message); return; }
    if (!policy) return;
    await run(async (check, signal) => {
      const text = await file.text(); check(); const bundle = await parseProofBundle(JSON.parse(text), policy); check();
      const output = await new BrowserProver(worker).verify(bundle, policy, provingAssets(assets, manifestHash), { signal, onProgress: next => { check(); setStage(labels[next]); } });
      check(); setResult(output); setNotice('Proof file integrity and Groth16 proof verified locally. This does not confirm a payment or current chain readiness.');
    });
  }
  const ready = !!policy && provingFilesReady(assets, manifestHash);
  return <MerchantShell section="Local proofs">
    <div className="merchant-page-heading"><div><h1>Local proofs</h1><p>Generate a withdrawal proof on your device. Keep your note private.</p></div><Link href="/docs/payments/#browser-proving" className="button button-outline">Read the guide <ArrowUpRight size={14}/></Link></div>
    <div className="notes-grid prover-grid">
      <section className="panel live-card" aria-label="Local note and proving files">
        <h2>Open your original note</h2><p>Import its trusted group policy and encrypted backup. Your passphrase and note stay in this tab.</p>
        <label className="form-label">Trusted FT policy JSON<input type="file" accept=".json,application/json" disabled={busy} onChange={e => void importPolicy(e)}/></label>
        {policy && <div className="live-policy"><span>Original group</span><code>{policy.registry}</code><span>Token</span><code>{policy.tokenId}</code></div>}
        <label className="form-label">Note passphrase<input type="password" autoComplete="off" value={password} disabled={busy || !!note} onChange={e => setPassword(e.target.value)}/></label>
        <label className="form-label">Encrypted note backup<input type="file" accept=".json,application/json" disabled={busy || !policy || !!note || password.length < 12 || password.length > 1024} onChange={e => void openNote(e)}/></label>
        {note && <div className="note-public-result"><h3>Public commitment</h3><code className="note-commitment">{note.commitment}</code></div>}
        <div className="notes-actions"><button className="button button-outline" onClick={lock}><LockKeyhole size={14}/> Lock note</button><Link href="/notes/" className="button button-outline">Create or back up a note</Link></div>
        <div className="note-restore"><h2>Check your proving files</h2><p>Use files from a release you trust. Obtain the manifest hash separately; a hash supplied alongside untrusted files is insufficient.</p>
          <ProvingFilesFields files={assets} hash={manifestHash} disabled={busy} onFiles={next => { setAssets(next); invalidate(); }} onHash={next => { setManifestHash(next); invalidate(); }} onError={setError}/>
          <p className="notes-help">The circuit, proving key and verification key are checked before use. The verification key must also match the trusted group policy.</p>
          <label className="form-label">Verify an existing proof file<input type="file" accept=".json,application/json" disabled={busy || !ready} onChange={e => void verifyFile(e)}/></label>
        </div>
      </section>
      <section className="panel live-card" aria-label="Withdrawal proof">
        <h2>Choose the withdrawal</h2><p>Only the public group snapshot is requested from the API. Your wallet reviews and sends the payment later in Settlements.</p>
        <label className="form-label">Payment service origin<input value={api} disabled={busy} onChange={e => { setApi(e.target.value); setContext(null); invalidate(); }}/></label>
        <label className="form-label">Payout vault<input value={vault} disabled={busy} onChange={e => { setVault(e.target.value); setContext(null); invalidate(); }} placeholder="A verified vault in the original group"/></label>
        <button className="button button-outline" disabled={busy || !policy || !vault} onClick={() => void loadContext()}>Load finalized group snapshot</button>
        <label className="form-label">Or import public group snapshot JSON<input type="file" accept=".json,application/json" disabled={busy || !policy} onChange={e => void importContext(e)}/></label>
        {context && <div className="live-policy prover-snapshot"><span>Snapshot block</span><strong>{context.checkedAtBlock.height}</strong><span>Ordered commitments</span><strong>{context.commitments.length} / 256</strong><span>Group root</span><code>{context.root}</code></div>}
        <label className="form-label">Recipient account<input value={recipient} disabled={busy} onChange={e => { setRecipient(e.target.value); invalidate(); }} placeholder="recipient.testnet"/></label>
        <label className="form-label">Disclosure root<input value={root} maxLength={64} disabled={busy} onChange={e => { setRoot(e.target.value); invalidate(); }} placeholder="Receipt root or the exact selected invoice unit reference"/></label>
        <button className="button button-outline" disabled={busy} onClick={() => { setRoot([...crypto.getRandomValues(new Uint8Array(32))].map(b => b.toString(16).padStart(2, '0')).join('')); invalidate(); }}>Use random reference</button>
        <p className="notes-help">For an invoice, use its exact recipient and selected unit reference. A random reference does not pay an invoice. Proof generation reserves no funds and sends no transaction.</p>
        <div className="notes-actions"><button className="button button-dark" disabled={busy || !ready || !note || !context || !recipient || !/^[a-f0-9]{64}$/.test(root)} onClick={() => void prove()}>Generate local proof</button>
          {busy && <button className="button button-outline" onClick={cancel}><Square size={14}/> Cancel operation</button>}</div>
        {busy && <p className="prover-progress" role="status" aria-live="polite">{stage || 'Preparing local operation…'}</p>}
        {result && <div className="note-plan-result prover-result"><h3>Proof verified locally</h3><p>Completed in {(result.metrics.elapsedMs / 1000).toFixed(2)} seconds. Keep your note backup until the withdrawal is reconciled.</p>
          {result.bundle.setup === 'UNSAFE_LOCAL_DEVELOPMENT_ONLY' && <p className="prover-development">These files use an unsafe local development setup. This is a test artifact, not a production ceremony.</p>}
          <div className="live-policy"><span>Recipient</span><code>{result.bundle.action.recipient}</code><span>Payout vault</span><code>{result.bundle.action.vault}</code><span>Proof payload SHA-256</span><code>{result.bundle.digest}</code></div>
          <div className="notes-actions"><button className="button button-dark" onClick={() => download(result.bundle, 'core-withdrawal-proof.json')}><Download size={14}/> Download proof file</button><button className="button button-outline" onClick={() => download(result.bundle.plan, 'core-public-withdrawal-plan.json')}>Download public withdrawal plan</button><Link href="/relay/" className="button button-outline">Schedule delivery <ArrowUpRight size={14}/></Link><Link href="/live/" className="button button-outline">Open settlements <ArrowUpRight size={14}/></Link></div>
          <p className="notes-help">Import the public plan with the same trusted policy in Settlements. The wallet rechecks prerequisites; a verified proof is not a confirmed withdrawal.</p>
        </div>}
      </section>
    </div>
    {error && <p className="error-text" role="alert">{error}</p>}{notice && <p className="notes-notice" role="status">{notice}</p>}
  </MerchantShell>;
}
