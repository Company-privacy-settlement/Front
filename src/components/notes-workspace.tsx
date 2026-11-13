"use client";
import Link from 'next/link';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { ArrowUpRight, Download, LockKeyhole, Plus } from 'lucide-react';
import { MerchantShell } from './merchant-shell';
import { canonical, parsePolicy, feeQuote, createPrivateNote, encryptNoteBackup, openNoteBackup, HttpGateway, type Policy, type PrivateNote, type DepositPlan } from '@/vendor/core-client/index.js';

type OpenNote = { policy: Policy; note: PrivateNote; backup: string };
function download(text: string, name: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' })), a = document.createElement('a');
  a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function file(event: ChangeEvent<HTMLInputElement>) {
  const selected = event.target.files?.[0]; event.target.value = '';
  if (!selected || selected.size > 16000) throw new Error('Choose a JSON file under 16 KB');
  return selected.text();
}
export function NotesWorkspace() {
  const [policy, setPolicy] = useState<Policy | null>(null), [api, setApi] = useState('http://localhost:3001');
  const [opened, setOpened] = useState<OpenNote | null>(null), [verified, setVerified] = useState(false);
  const [password, setPassword] = useState(''), [confirmation, setConfirmation] = useState(''), [restorePassword, setRestorePassword] = useState('');
  const [root, setRoot] = useState(''), [vault, setVault] = useState(''), [plan, setPlan] = useState<DepositPlan | null>(null);
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('');
  const generation = useRef(0), controller = useRef<AbortController | null>(null), current = useRef<OpenNote | null>(null), pending = useRef(false);
  useEffect(() => () => { generation.current++; controller.current?.abort(); current.current = null; }, []);
  function lock() {
    generation.current++; controller.current?.abort(); controller.current = null; pending.current = false; current.current = null;
    setOpened(null); setVerified(false); setPlan(null); setRoot(''); setVault(''); setBusy(false);
    setPassword(''); setConfirmation(''); setRestorePassword(''); setError(''); setNotice('Note locked. Reopen its encrypted backup to continue.');
  }
  async function run(action: (check: () => void, signal: AbortSignal) => Promise<void>) {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError(''); setNotice('');
    const version = ++generation.current, abort = new AbortController(); controller.current = abort;
    const check = () => { if (version !== generation.current || abort.signal.aborted) throw new Error('Note workspace changed'); };
    try { await action(check, abort.signal); }
    catch (e) { if (version === generation.current) setError(e instanceof Error ? e.message : 'Note operation failed'); }
    finally { if (version === generation.current) { controller.current = null; pending.current = false; setBusy(false); } }
  }
  async function importPolicy(event: ChangeEvent<HTMLInputElement>) {
    setPolicy(null); setPlan(null);
    const contents = file(event);
    await run(async check => {
      const parsed = parsePolicy(JSON.parse(await contents)); check();
      if (parsed.network !== 'testnet' || !parsed.tokenId) throw new Error('Choose a trusted testnet FT policy');
      feeQuote(parsed); setPolicy(parsed); setPlan(null);
    });
  }
  async function create() {
    if (!policy || opened) return;
    await run(async check => {
      if (password !== confirmation) throw new Error('Passphrases must match');
      const note = await createPrivateNote(policy); check();
      const backup = await encryptNoteBackup(policy, note, password); check();
      const next = { policy, note, backup }; current.current = next; setOpened(next); setVerified(false); setPlan(null);
      setPassword(''); setConfirmation(''); setNotice('Download the encrypted backup, then reopen that file to verify it before preparing a deposit.');
    });
  }
  async function restore(event: ChangeEvent<HTMLInputElement>) {
    const contents = file(event), expected = current.current;
    setVerified(false); setPlan(null);
    if (!policy) { void contents.catch(() => {}); return; }
    await run(async check => {
      const backup = await contents; check();
      const restored = await openNoteBackup(backup, restorePassword, policy); check();
      if (expected && canonical(expected.note) !== canonical(restored.note)) throw new Error('Lock the current note before opening a different backup');
      const next = { ...restored, backup }; current.current = next; setOpened(next); setVerified(true); setPlan(null); setRestorePassword('');
      setNotice('Encrypted backup verified. The note stays in this tab; it has not been deposited.');
    });
  }
  async function prepare() {
    const selected = current.current;
    if (!selected || !verified) return;
    setPlan(null);
    await run(async (check, signal) => {
      const result = await new HttpGateway(api).prepareDeposit(selected.policy, { commitment: selected.note.commitment, disclosureRoot: root, ...(vault ? { vault } : {}) }, { signal });
      check(); setPlan(result); setNotice('Public deposit plan prepared. Review it in Settlements; preparation does not reserve capacity or move funds.');
    });
  }
  const quote = policy ? feeQuote(policy) : null;
  return <MerchantShell section="Private notes">
    <div className="merchant-page-heading"><div><h1>Private notes</h1><p>Create a note locally, keep its encrypted backup, and prepare a deposit.</p></div><Link href="/docs/payments/#browser-notes" className="button button-outline">Read the guide <ArrowUpRight size={14}/></Link></div>
    <div className="notes-grid">
      <section className="panel live-card" aria-label="Private note backup">
        <h2>Keep control of your note</h2>
        <p>Secrets stay in this tab. Keep the backup and passphrase separately; the service cannot recover either. Creating a note does not fund it.</p>
        <label className="form-label">Trusted FT policy JSON<input type="file" accept="application/json,.json" disabled={busy || !!opened} onChange={e => void importPolicy(e)}/></label>
        {policy && <div className="live-policy"><span>Original group</span><code>{policy.registry}</code><span>Token</span><code>{policy.tokenId}</code><span>Principal (token atomic units)</span><strong>{quote?.principalTokens}</strong></div>}
        {!opened && <><label className="form-label">Create passphrase<input type="password" autoComplete="new-password" value={password} disabled={busy} onChange={e => setPassword(e.target.value)}/></label>
          <label className="form-label">Confirm passphrase<input type="password" autoComplete="new-password" value={confirmation} disabled={busy} onChange={e => setConfirmation(e.target.value)}/></label>
          <button className="button button-dark" disabled={busy || !policy || password.length < 12 || password.length > 1024 || password !== confirmation} onClick={() => void create()}><Plus size={14}/> Create encrypted note</button></>}
        {opened && <div className="note-public-result"><h3>Public commitment</h3><code className="note-commitment">{opened.note.commitment}</code><p>{verified ? 'Backup verified. No deposit status is stored here.' : 'Download and reopen this backup before preparing a deposit.'}</p>
          <div className="notes-actions"><button className="button button-outline" disabled={busy} onClick={() => download(opened.backup, 'core-private-note.json')}><Download size={14}/> Download encrypted note</button><button className="button button-outline" onClick={lock}><LockKeyhole size={14}/> Lock note</button></div>
        </div>}
        <div className="note-restore"><h3>{opened ? 'Verify your backup' : 'Open an existing backup'}</h3><p>Open a downloaded note file with its passphrase. Its complete policy must match the independently imported policy.</p>
          <label className="form-label">Backup passphrase<input type="password" autoComplete="off" value={restorePassword} disabled={busy} onChange={e => setRestorePassword(e.target.value)}/></label>
          <label className="form-label">Verify or open encrypted note backup<input type="file" accept="application/json,.json" disabled={busy || !policy || restorePassword.length < 12} onChange={e => void restore(e)}/></label>
        </div>
      </section>
      <section className="panel live-card" aria-label="Public deposit plan">
        <h2>Prepare your deposit</h2><p>The API receives only a public commitment, disclosure root and optional vault. Your wallet approves registration, storage and payment later in Settlements.</p>
        <label className="form-label">Core API origin<input value={api} disabled={busy} onChange={e => { setApi(e.target.value); setPlan(null); setNotice(''); setError(''); }}/></label>
        <label className="form-label">Disclosure root<input value={root} maxLength={64} disabled={busy || !opened} onChange={e => { setRoot(e.target.value); setPlan(null); setNotice(''); setError(''); }} placeholder="64 lowercase hexadecimal characters"/></label>
        <button className="button button-outline" disabled={busy || !opened} onClick={() => { setRoot([...crypto.getRandomValues(new Uint8Array(32))].map(b => b.toString(16).padStart(2,'0')).join('')); setPlan(null); setNotice(''); setError(''); }}>Use random reference</button>
        <p className="notes-help">Use your receipt root for selective evidence, or a random reference for a deposit without attached evidence. Keep receipt openings separately.</p>
        <label className="form-label">Deposit vault (optional)<input value={vault} disabled={busy || !opened} onChange={e => { setVault(e.target.value); setPlan(null); setNotice(''); setError(''); }} placeholder="Leave empty to check up to 20 vault records"/></label>
        <button className="button button-dark" disabled={busy || !opened || !verified || !/^[a-f0-9]{64}$/.test(root)} onClick={() => void prepare()}>{busy ? 'Working…' : 'Prepare public deposit plan'}</button>
        {!verified && <p className="notes-help">Verify the encrypted backup before preparing a deposit.</p>}
        {plan && <div className="note-plan-result"><h3>Ready for wallet review</h3><div className="live-policy"><span>Deposit vault</span><code>{String(plan.plan.tokenCall.args.receiver_id)}</code><span>Principal (token atomic units)</span><strong>{quote?.principalTokens}</strong><span>0.15% add-on fee</span><strong>{quote?.feeTokens}</strong><span>Total token transfer</span><strong>{quote?.depositTokens}</strong><span>Checked block</span><strong>{plan.checkedAtBlock.height}</strong></div>
          <p>{plan.remainingOutputs} output slots at this snapshot. Checked {plan.checkedVaults} vaults{plan.vaultScanComplete ? '.' : '; the scan is incomplete.'} Registration, NEAR storage and gas are separate.</p>
          <details><summary>Inspect public deposit call</summary><pre>{JSON.stringify(plan.plan, null, 2)}</pre></details>
          <div className="notes-actions"><button className="button button-dark" onClick={() => download(JSON.stringify(plan.plan, null, 2), 'core-public-deposit-plan.json')}><Download size={14}/> Download deposit plan</button><Link href="/live/" className="button button-outline">Open settlements <ArrowUpRight size={14}/></Link></div>
          <p className="notes-help">Import the public plan in Settlements. Keep the encrypted note to create a withdrawal proof with the Core CLI. A prepared plan is not a confirmed deposit.</p>
        </div>}
      </section>
    </div>
    {error && <p className="error-text" role="alert">{error}</p>}{notice && <p className="notes-notice" role="status">{notice}</p>}
  </MerchantShell>;
}
