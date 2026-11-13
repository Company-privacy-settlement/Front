"use client";
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Download, FolderLock, LockKeyhole, Plus, Search, Trash2 } from 'lucide-react';
import { InvoiceLibrary, browserInvoiceLibraryStorage, invoiceQuote, type SignedInvoice, type StoredInvoice } from '@/vendor/core-client/index.js';
import { saveJson } from './invoice-summary';

async function backupFile(event: ChangeEvent<HTMLInputElement>) {
  const file = event.target.files?.[0]; event.target.value = '';
  if (!file || file.size > 3_000_000) throw new Error('Choose an encrypted library backup under 3 MB');
  return file.text();
}
export function InvoiceLibraryPanel({ merchant, current, disabled, onOpen, onHideOpened }: {
  merchant: string; current: SignedInvoice | null; disabled: boolean;
  onOpen(signed: SignedInvoice): void; onHideOpened(id?: string): void;
}) {
  const [passphrase, setPassphrase] = useState(''), [backupPassword, setBackupPassword] = useState(''), [opened, setOpened] = useState(false),
    [entries, setEntries] = useState<StoredInvoice[]>([]), [query, setQuery] = useState(''), [busy, setBusy] = useState(false),
    [error, setError] = useState(''), [notice, setNotice] = useState('');
  const book = useRef<InvoiceLibrary | null>(null), epoch = useRef(0), running = useRef(false);
  useEffect(() => () => { epoch.current++; book.current?.lock(); book.current = null; }, []);
  function lock() {
    epoch.current++; book.current?.lock(); book.current = null; running.current = false;
    setOpened(false); setEntries([]); setQuery(''); setPassphrase(''); setBackupPassword(''); setBusy(false); setError(''); setNotice('');
    onHideOpened();
  }
  async function run(action: (active: () => boolean) => Promise<void>) {
    if (disabled || running.current) return;
    const version = epoch.current, active = () => epoch.current === version;
    running.current = true; setBusy(true); setError(''); setNotice('');
    try { await action(active); }
    catch (e) { if (active()) setError(e instanceof Error ? e.message : 'Invoice library action failed'); }
    finally { if (active()) { running.current = false; setBusy(false); } }
  }
  async function open(create: boolean, active: () => boolean, backup?: string) {
    if (!active()) return;
    if (!merchant) throw new Error('Connect the merchant wallet first');
    const owner = { network: 'testnet' as const, accountId: merchant };
    const candidate = new InvoiceLibrary(browserInvoiceLibraryStorage(owner), passphrase, owner);
    book.current = candidate;
    try {
      if (backup !== undefined) await candidate.restore(backup);
      else if (create) await candidate.create();
      const list = await candidate.list();
      if (!active()) { candidate.lock(); return; }
      setEntries(list); setOpened(true); setPassphrase('');
      setNotice('Library unlocked in this tab. Export an encrypted backup to keep a separate copy.');
    } catch (e) { candidate.lock(); if (book.current === candidate) book.current = null; throw e; }
  }
  async function mutate(action: (library: InvoiceLibrary) => Promise<unknown>, message: string, active: () => boolean) {
    if (!active()) return;
    const library = book.current; if (!library) throw new Error('Unlock the invoice library first');
    await action(library); const list = await library.list();
    if (active()) { setEntries(list); setNotice(message); }
  }
  const filtered = entries.filter(e => `${e.signed.invoice.title} ${e.signed.invoice.reference}`.toLowerCase().includes(query.toLowerCase())), blocked = disabled || busy;
  return <section className="panel live-card invoice-library" id="invoice-library" aria-labelledby="invoice-library-title">
    <div className="invoice-library-heading"><div><h2 id="invoice-library-title">Your invoice library</h2><p>Keep signed requests encrypted in this browser, separate from the wallet operation journal.</p></div><FolderLock size={22}/></div>
    {!merchant ? <p>Connect your merchant wallet to choose its local library.</p> : <p className="invoice-library-owner">Merchant <code>{merchant}</code> · NEAR testnet · {opened ? `${entries.length} of 100 saved` : 'Locked'}</p>}
    {error && <p role="alert" className="live-feedback error-text">{error}</p>}
    {notice && <p role="status" className="live-feedback">{notice}</p>}
    {!opened ? <div className="invoice-library-unlock">
      <label className="form-label">Library passphrase<input type="password" maxLength={1024} autoComplete="off" aria-label="Library passphrase" value={passphrase} disabled={blocked || !merchant} onChange={e => setPassphrase(e.target.value)} placeholder="At least 12 characters"/></label>
      <div className="live-buttons">
        <button className="button button-dark" disabled={blocked || !merchant || passphrase.length < 12} onClick={() => void run(active => open(false, active))}>Unlock library</button>
        <button className="button button-outline" disabled={blocked || !merchant || passphrase.length < 12} onClick={() => void run(active => open(true, active))}>Create library</button>
      </div>
      <label className="live-file form-label">Restore encrypted library<input type="file" accept="application/json,.json" aria-label="Restore encrypted library" disabled={blocked || !merchant || passphrase.length < 12} onChange={e => void run(async active => open(false, active, await backupFile(e)))}/></label>
      <p className="library-note">Restore requires empty library storage for this merchant. Unlock an existing library to merge a backup. Keep your passphrase and backup: the service cannot recover them.</p>
    </div> : <>
      <div className="live-buttons">
        <button className="button button-dark" disabled={blocked || !current} onClick={() => void run(active => mutate(l => l.add(current), 'Displayed signed invoice saved. Payment status is checked only when you refresh it.', active))}><Plus size={15}/>Save displayed invoice</button>
        <button className="button button-outline" disabled={blocked} onClick={() => void run(async active => { const envelope = await book.current!.export(); if (active()) saveJson(JSON.parse(envelope), `core-invoice-library-${merchant}.encrypted.json`); })}><Download size={15}/>Export encrypted library</button>
        <button className="button button-outline" disabled={disabled} onClick={lock}><LockKeyhole size={15}/>Lock library</button>
      </div>
      <label className="form-label library-search"><Search size={15}/><span>Search saved invoices</span><input type="search" aria-label="Search saved invoices" value={query} disabled={blocked} onChange={e => setQuery(e.target.value)} placeholder="Title or reference"/></label>
      <div className="invoice-library-list" aria-label="Saved invoices">
        {filtered.length === 0 && <p>{entries.length ? 'No saved invoices match your search.' : 'No invoices saved. Create or open a signed invoice, then save it here.'}</p>}
        {filtered.map(entry => { const invoice = entry.signed.invoice; return <article className="invoice-library-entry" key={entry.hash} aria-label={`Saved invoice ${invoice.reference}`}>
          <div><h3>{invoice.title}</h3><p>{invoice.reference} · {invoiceQuote(invoice).principalTokens} token atomic units</p><code>{invoice.policy.registry}</code><small>Signed terms · payment status not stored</small></div>
          <div className="library-entry-actions">
            <button className="button button-outline" disabled={blocked} onClick={() => onOpen(entry.signed)}>Open {invoice.reference}</button>
            <button className="text-link" disabled={blocked} onClick={() => void run(async active => { await mutate(l => l.remove(entry.hash), 'Local copy removed. The signed request and any payment remain valid.', active); if (active()) onHideOpened(invoice.id); })}><Trash2 size={13}/>Remove local copy</button>
          </div>
        </article>; })}
      </div>
      <details className="library-merge"><summary>Merge an encrypted backup</summary>
        <label className="form-label">Backup passphrase, if different<input type="password" maxLength={1024} autoComplete="off" aria-label="Backup passphrase, if different" value={backupPassword} disabled={blocked} onChange={e => setBackupPassword(e.target.value)}/></label>
        <label className="live-file form-label">Merge encrypted library<input type="file" accept="application/json,.json" aria-label="Merge encrypted library" disabled={blocked} onChange={e => void run(async active => { const envelope = await backupFile(e); await mutate(l => l.merge(envelope, backupPassword || undefined), 'Backup merged without replacing existing signed terms.', active); if (active()) setBackupPassword(''); })}/></label>
      </details>
      <p className="library-note">Terms stay encrypted at rest. This library stores signed requests, not private notes or paid-status certificates. Open an invoice and refresh against its matching API for current indexed settlement.</p>
    </>}
  </section>;
}
