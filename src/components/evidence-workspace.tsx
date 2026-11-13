"use client";
import Link from 'next/link';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Download, LockKeyhole, ArrowUpRight } from 'lucide-react';
import { MerchantShell } from './merchant-shell';
import { usePageHideLock } from '@/lib/page-hide-lock';
import { RECEIPT_FIELDS, canonical, createReceipt, discloseReceipt, verifyReceiptDisclosure, encryptReceiptBackup, openReceiptBackup, type Receipt, type ReceiptValues, type ReceiptField } from '@/vendor/core-client/index.js';

const labels: Record<ReceiptField, string> = { sender: 'Sender reference', recipient: 'Recipient reference', asset: 'Asset reference', amount: 'Declared amount', purpose: 'Purpose', reference: 'Business reference', occurredAt: 'Occurred at (UTC)', credentialHash: 'Credential hash (optional)' };
const empty = () => Object.fromEntries(RECEIPT_FIELDS.map(field => [field, ''])) as ReceiptValues;
function pick(event: ChangeEvent<HTMLInputElement>) { const file = event.target.files?.[0]; event.target.value = ''; return file; }
async function read(file?: File) {
  if (!file || file.size > 200_000) throw new Error('Choose a receipt JSON file under 200 KB');
  return file.text();
}
function download(text: string, name: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' })), a = document.createElement('a');
  a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
type Opened = { receipt: Receipt; encrypted: string };
export function EvidenceWorkspace() {
  const [values, setValues] = useState<ReceiptValues>(empty), [password, setPassword] = useState(''), [confirm, setConfirm] = useState(''), [restorePassword, setRestorePassword] = useState('');
  const [opened, setOpened] = useState<Opened | null>(null), [backupVerified, setBackupVerified] = useState(false), [selected, setSelected] = useState<ReceiptField[]>([]), [disclosure, setDisclosure] = useState<Receipt | null>(null);
  const [candidate, setCandidate] = useState<unknown>(null), [candidateName, setCandidateName] = useState(''), [expectedRoot, setExpectedRoot] = useState(''), [verified, setVerified] = useState<Receipt | null>(null);
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('');
  const epoch = useRef(0), running = useRef(false), current = useRef<Opened | null>(null);
  useEffect(() => () => { epoch.current++; current.current = null; }, []);
  function lock() {
    epoch.current++; running.current = false; current.current = null;
    setOpened(null); setValues(empty()); setPassword(''); setConfirm(''); setRestorePassword(''); setBackupVerified(false); setSelected([]); setDisclosure(null);
    setCandidate(null); setCandidateName(''); setExpectedRoot(''); setVerified(null); setBusy(false); setError(''); setNotice('Private receipt cleared. Reopen its encrypted backup to continue.');
  }
  usePageHideLock(lock);
  async function run(action: (check: () => void) => Promise<void>) {
    if (running.current) return;
    running.current = true; setBusy(true); setError(''); setNotice(''); const version = epoch.current;
    const check = () => { if (version !== epoch.current) throw new Error('Evidence workspace is locked'); };
    try { await action(check); }
    catch (e) { if (version === epoch.current) setError(e instanceof Error ? e.message : 'Receipt action failed'); }
    finally { if (version === epoch.current) { running.current = false; setBusy(false); } }
  }
  async function create() {
    if (current.current) return;
    await run(async check => {
      if (password !== confirm) throw new Error('Passphrases must match');
      const receipt = await createReceipt(values); check();
      const encrypted = await encryptReceiptBackup(receipt, password); check();
      const next = { receipt, encrypted }; current.current = next; setOpened(next); setValues(empty()); setPassword(''); setConfirm(''); setBackupVerified(false); setSelected([]); setDisclosure(null);
      setNotice('Download the encrypted receipt, then reopen that file to verify your backup before exporting fields.');
    });
  }
  async function restore(file?: File) {
    const previous = current.current;
    setBackupVerified(false); setDisclosure(null);
    await run(async check => {
      const encrypted = await read(file); check();
      const receipt = await openReceiptBackup(encrypted, restorePassword); check();
      if (previous && canonical(previous.receipt) !== canonical(receipt)) throw new Error('Lock the workspace before opening a different receipt');
      const next = { receipt, encrypted }; current.current = next; setOpened(next); setValues(empty()); setPassword(''); setConfirm(''); setRestorePassword(''); setBackupVerified(true); setSelected([]); setDisclosure(null);
      setNotice('Encrypted receipt backup verified. Select only the fields you intend to share.');
    });
  }
  async function prepareDisclosure() {
    const active = current.current; if (!active || !backupVerified) return;
    setDisclosure(null);
    await run(async check => { const result = await discloseReceipt(active.receipt, selected); check(); setDisclosure(result); });
  }
  async function importDisclosure(file?: File) {
    setVerified(null); setCandidate(null); setCandidateName('');
    await run(async check => { const contents = await read(file); check(); setCandidate(JSON.parse(contents)); setCandidateName(file!.name); });
  }
  async function verify() {
    setVerified(null);
    await run(async check => { const result = await verifyReceiptDisclosure(candidate, expectedRoot); check(); setVerified(result); });
  }
  return <MerchantShell section="Evidence">
    <div className="merchant-page-heading"><div><h1>Private receipts</h1><p>Keep the full receipt encrypted. Share selected fields with a verifiable commitment.</p></div><div className="evidence-actions"><Link href="/docs/privacy/#receipts" className="button button-outline">Read the guide <ArrowUpRight size={14}/></Link><button className="button button-outline" onClick={lock}><LockKeyhole size={14}/> Clear & lock</button></div></div>
    <div className="evidence-grid">
      <section className="panel live-card" aria-label="Private receipt backup">
        <h2>Create or open a receipt</h2><p>Values are declarations you provide. The receipt commits to them without establishing identity, legal compliance or payment completion.</p>
        {!opened && <><div className="receipt-values">{RECEIPT_FIELDS.map(field => <label className="form-label" key={field}>{labels[field]}<input maxLength={4096} value={values[field]} disabled={busy} onChange={e => setValues(previous => ({ ...previous, [field]: e.target.value }))}/></label>)}</div>
          <button className="button button-outline" disabled={busy} onClick={() => setValues(previous => ({ ...previous, occurredAt: new Date().toISOString() }))}>Use current UTC time</button>
          <label className="form-label">Receipt passphrase<input type="password" autoComplete="new-password" value={password} disabled={busy} onChange={e => setPassword(e.target.value)}/></label>
          <label className="form-label">Confirm receipt passphrase<input type="password" autoComplete="new-password" value={confirm} disabled={busy} onChange={e => setConfirm(e.target.value)}/></label>
          <button className="button button-dark" disabled={busy || password.length < 12 || password.length > 1024 || password !== confirm} onClick={() => void create()}>Create encrypted receipt</button>
        </>}
        {opened && <div className="receipt-created"><h3>Receipt commitment</h3><code className="receipt-root">{opened.receipt.root}</code><p>{backupVerified ? 'Backup verified. Your full receipt remains private.' : 'Download and reopen the encrypted backup before preparing a disclosure.'}</p>
          <button className="button button-outline" disabled={busy} onClick={() => download(opened.encrypted, `core-private-receipt-${opened.receipt.root.slice(0, 12)}.json`)}><Download size={14}/> Download encrypted receipt</button>
        </div>}
        <div className="receipt-restore"><h3>{opened ? 'Verify your receipt backup' : 'Open an encrypted receipt'}</h3>
          <label className="form-label">Receipt backup passphrase<input type="password" autoComplete="off" value={restorePassword} disabled={busy} onChange={e => setRestorePassword(e.target.value)}/></label>
          <label className="form-label">Encrypted receipt backup<input type="file" accept="application/json,.json" disabled={busy || restorePassword.length < 12} onChange={e => void restore(pick(e))}/></label>
        </div>
      </section>
      <section className="panel live-card" aria-label="Selective disclosure">
        <h2>Choose what to share</h2><p>Each selected field includes its value and salted Merkle proof. Other fields and their opening salts stay in your encrypted backup.</p>
        <fieldset className="receipt-fields" disabled={busy || !opened || !backupVerified}><legend>Fields to disclose</legend>{RECEIPT_FIELDS.map(field => <label key={field}><input type="checkbox" checked={selected.includes(field)} onChange={e => { setSelected(previous => e.target.checked ? [...previous, field] : previous.filter(value => value !== field)); setDisclosure(null); setError(''); setNotice(''); }}/><span>{labels[field]}</span></label>)}</fieldset>
        <button className="button button-dark" disabled={busy || !backupVerified || !selected.length} onClick={() => void prepareDisclosure()}>Prepare selected disclosure</button>
        {disclosure && <div className="receipt-disclosure"><h3>Review disclosed values</h3><dl>{disclosure.openings.map(opening => <div key={opening.field}><dt>{labels[opening.field]}</dt><dd>{opening.value || '(empty value)'}</dd></div>)}</dl><details><summary>Inspect selected proof</summary><pre>{JSON.stringify(disclosure, null, 2)}</pre></details>
          <button className="button button-dark" disabled={busy} onClick={() => download(JSON.stringify(disclosure, null, 2), `core-disclosure-${disclosure.root.slice(0,12)}.json`)}><Download size={14}/> Download selected disclosure</button>
          <p>Exported values are readable by anyone with this file. Review the selection before sharing through your own channel.</p>
        </div>}
        <p className="evidence-help">Keep the encrypted receipt separate from your private note and operation journal. Use its commitment as the disclosure root when preparing a deposit or withdrawal. Create a fresh receipt for each operation; reusing a root links public activity.</p><Link className="text-link" href="/notes/">Prepare a deposit <ArrowUpRight size={13}/></Link>
      </section>
    </div>
    <section className="panel live-card receipt-verifier" aria-label="Receipt integrity verification">
      <h2>Verify a disclosed receipt</h2><p>Supply a root independently observed in a trusted settlement or record. Verification checks field integrity against that root. Payment finality, identity and tax acceptance require separate checks.</p>
      <label className="form-label">Expected receipt root<input maxLength={64} value={expectedRoot} disabled={busy} onChange={e => { setExpectedRoot(e.target.value); setVerified(null); setError(''); setNotice(''); }} placeholder="Independently obtained 64-character root"/></label>
      <label className="form-label">Disclosed receipt JSON<input type="file" accept="application/json,.json" disabled={busy} onChange={e => void importDisclosure(pick(e))}/></label>{candidateName && <p className="receipt-import-name">Loaded {candidateName}</p>}
      <button className="button button-dark" disabled={busy || candidate === null || !/^[a-f0-9]{64}$/.test(expectedRoot)} onClick={() => void verify()}>Verify receipt integrity</button>
      {verified && <div className="receipt-verification" role="region" aria-label="Verified receipt disclosure"><h3>Receipt integrity verified</h3><p>{verified.openings.length} field openings match the expected root you supplied. No chain lookup was performed.</p><code className="receipt-root">{verified.root}</code><dl>{verified.openings.map(opening => <div key={opening.field}><dt>{labels[opening.field]}</dt><dd>{opening.value || '(empty value)'}</dd></div>)}</dl></div>}
    </section>
    {error && <p className="error-text" role="alert">{error}</p>}{notice && <p className="evidence-notice" role="status">{notice}</p>}
  </MerchantShell>;
}
