"use client";
import Link from 'next/link';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { ArrowUpRight, Check, LoaderCircle, RefreshCw } from 'lucide-react';
import { HttpGateway, parseApprovedGroups, type ApprovedGroup, type ApprovedGroups, type GroupCapacity, type Policy } from '@/vendor/core-client/index.js';

type Row = { origin: string; capacity?: GroupCapacity; error?: string };
export type GroupSelection = { id: string; policy: Policy; api: string; allowNewDeposits: boolean };
export function GroupSelector({ disabled, onSelect, onInvalidate }: { disabled: boolean; onSelect(value: GroupSelection): void; onInvalidate(): void }) {
  const [directory, setDirectory] = useState<ApprovedGroups | null>(null), [rows, setRows] = useState<Record<string, Row>>({}),
    [checking, setChecking] = useState(''), [error, setError] = useState('');
  const generation = useRef(0), controller = useRef<AbortController | null>(null), blocked = useRef(disabled);
  blocked.current = disabled;
  function cancel() { generation.current++; controller.current?.abort(); controller.current = null; }
  useEffect(() => () => { generation.current++; controller.current?.abort(); }, []);
  useEffect(() => { if (disabled) { cancel(); setChecking(''); } }, [disabled]);

  async function importDirectory(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file || blocked.current) return;
    cancel(); const current = generation.current;
    setDirectory(null); setRows({}); setError(''); setChecking(''); onInvalidate();
    try {
      if (file.size > 32768) throw new Error('Directory must be at most 32 KiB');
      const approved = parseApprovedGroups(JSON.parse(await file.text()));
      if (approved.groups.some(g => g.policy.network !== 'testnet' || !g.policy.tokenId)) throw new Error('This workspace supports testnet FT groups');
      if (current !== generation.current || blocked.current) return;
      setDirectory(approved); setRows(Object.fromEntries(approved.groups.map(g => [g.id, { origin: '' }])));
    } catch (e) { if (current === generation.current) setError(e instanceof Error ? e.message : 'Invalid approved directory'); }
  }
  function editOrigin(id: string, origin: string) {
    cancel(); setChecking(''); setError(''); onInvalidate();
    setRows(previous => ({ ...previous, [id]: { origin } }));
  }
  async function check(group: ApprovedGroup, intent?: 'deposit' | 'recovery') {
    if (blocked.current || controller.current) return;
    cancel(); const current = generation.current, abort = new AbortController(); controller.current = abort;
    const origin = rows[group.id]?.origin ?? '';
    onInvalidate();
    setChecking(group.id); setError('');
    setRows(previous => ({ ...previous, [group.id]: { origin } }));
    try {
      const gateway = new HttpGateway(origin), capacity = await gateway.groupCapacity(group.policy, { signal: abort.signal });
      if (current !== generation.current || blocked.current) return;
      setRows(previous => ({ ...previous, [group.id]: { origin, capacity } }));
      if (intent === 'deposit' && (!group.depositsEnabled || !capacity.depositCapacityAvailable || !capacity.depositVaultObserved)) {
        setRows(previous => ({ ...previous, [group.id]: { origin, capacity, error: 'This group has no verified deposit capacity. Refresh or choose another approved group.' } })); return;
      }
      if (intent) onSelect({ id: group.id, policy: group.policy, api: gateway.url, allowNewDeposits: intent === 'deposit' && group.depositsEnabled });
    } catch (e) {
      if (current !== generation.current || blocked.current) return;
      const message = e instanceof Error ? e.message : 'Group check failed';
      // A failed refresh removes the previous snapshot and selection controls.
      setRows(previous => ({ ...previous, [group.id]: { origin, error: message } }));
    } finally { if (current === generation.current) { controller.current = null; setChecking(''); } }
  }
  return <details className="group-picker">
    <summary>Choose from approved groups</summary>
    <div className="group-picker-content">
      <p>Import your independently approved directory, then check each group against its own Core API. Private notes stay in the CLI.</p>
      <label className="live-file form-label">Approved group directory
        <input type="file" accept="application/json,.json" aria-label="Approved group directory" disabled={disabled} onChange={e => void importDirectory(e)}/>
      </label>
      {error && <p role="alert" className="error-text">{error}</p>}
      {directory && <div className="group-options" aria-label="Approved groups">
        {directory.groups.map(group => {
          const row = rows[group.id] ?? { origin: '' }, capacity = row.capacity, pending = checking === group.id;
          const canDeposit = group.depositsEnabled && !!capacity?.depositCapacityAvailable && capacity.depositVaultObserved;
          const state = !capacity ? 'Not checked' : !group.depositsEnabled ? 'Deposits disabled' : !capacity.depositCapacityAvailable ? 'Full' : capacity.depositVaultObserved ? 'Capacity available' : capacity.vaultScanComplete ? 'No deposit vault available' : 'Vault selection required';
          return <section className="group-option" key={group.id} aria-label={`Approved group ${group.id}`}>
            <div className="group-option-heading"><h3>{group.id}</h3><span className={canDeposit ? 'group-state available' : 'group-state'}>{state}</span></div>
            <code className="group-registry">{group.policy.registry}</code>
            <label className="form-label">Core API for {group.id}<input type="url" aria-label={`Core API for ${group.id}`} value={row.origin} disabled={disabled} placeholder="https://api.example.com" onChange={e => editOrigin(group.id, e.target.value)}/></label>
            <button className="button button-outline" disabled={disabled || !!checking || !row.origin} onClick={() => void check(group)}>
              {pending ? <LoaderCircle size={14} className="spin"/> : capacity ? <RefreshCw size={14}/> : <Check size={14}/>}{pending ? 'Checking group…' : capacity ? `Refresh ${group.id}` : `Check ${group.id}`}
            </button>
            {row.error && <p className="error-text group-error" role="alert">{row.error}</p>}
            {capacity && <>
              <div className="group-capacity"><span><strong>{capacity.remainingOutputs}</strong> of 256 output slots left</span><span>Block {capacity.checkedAtBlock.height}</span></div>
              <meter min={0} max={256} value={capacity.usedOutputs} aria-label={`Used outputs for ${group.id}`}>{capacity.usedOutputs} / 256</meter>
              {!capacity.depositVaultObserved && capacity.depositCapacityAvailable && <p className="group-explanation">{capacity.vaultScanComplete ? 'No eligible deposit vault was observed.' : 'The first member has no eligible deposit vault. Use the CLI for full member discovery.'}</p>}
              <div className="group-actions">
                <button className="button button-dark" disabled={disabled || !!checking || !canDeposit} onClick={() => void check(group, 'deposit')}>Use {group.id} for deposits <ArrowUpRight size={13}/></button>
                <button className="button button-outline" disabled={disabled || !!checking} onClick={() => void check(group, 'recovery')}>Use {group.id} for recovery</button>
              </div>
            </>}
          </section>;
        })}
      </div>}
      <p className="group-explanation">Each selection checks the API again. Capacity is not reserved. Choose the original group for existing notes; groups have separate privacy sets. Recovery mode blocks new deposit imports.</p>
      <Link href="/docs/groups/" className="text-link">Group selection guide <ArrowUpRight size={13}/></Link>
    </div>
  </details>;
}
