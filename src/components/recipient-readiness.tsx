"use client";
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Check, Circle, LoaderCircle, RefreshCw } from 'lucide-react';
import { canonical, HttpGateway, type Policy, type RecipientReadiness as Readiness } from '@/vendor/core-client/index.js';

function near(value: string) {
  const amount = BigInt(value), unit = 10n ** 24n;
  return `${amount / unit}.${(amount % unit).toString().padStart(24, '0').replace(/0+$/, '') || '0'}`;
}
export function RecipientReadiness({ policy, recipient, api, disabled = false }: { policy: Policy | null; recipient: string; api: string; disabled?: boolean }) {
  const binding = canonical({ policy, recipient, api });
  const [snapshot, setSnapshot] = useState<{ binding: string; value: Readiness } | null>(null), [error, setError] = useState<{ binding: string; message: string } | null>(null), [busy, setBusy] = useState(false);
  const generation = useRef(0), controller = useRef<AbortController | null>(null), current = useRef(binding), blocked = useRef(disabled);
  current.current = binding; blocked.current = disabled;
  useEffect(() => {
    generation.current++; controller.current?.abort(); controller.current = null;
    setSnapshot(null); setError(null); setBusy(false);
    return () => { generation.current++; controller.current?.abort(); controller.current = null; };
  }, [binding]);
  useEffect(() => { if (disabled && controller.current) { generation.current++; controller.current.abort(); controller.current = null; setBusy(false); } }, [disabled]);
  async function check() {
    if (blocked.current || !policy?.tokenId || !recipient || controller.current) return;
    const version = ++generation.current, abort = new AbortController(), requested = binding;
    controller.current = abort; setSnapshot(null); setError(null); setBusy(true);
    const active = () => generation.current === version && current.current === requested && !blocked.current;
    try {
      const value = await new HttpGateway(api).recipientReadiness(policy, recipient, { signal: abort.signal });
      if (active()) setSnapshot({ binding: requested, value });
    } catch (e) { if (active()) setError({ binding: requested, message: e instanceof Error ? e.message : 'Recipient check failed' }); }
    finally { if (generation.current === version) { controller.current = null; setBusy(false); } }
  }
  const status = snapshot?.binding === binding ? snapshot.value : null, failure = error?.binding === binding ? error.message : '';
  return <div className="recipient-readiness" role="region" aria-label="Recipient preparation">
    <div className="recipient-readiness-heading"><h3>Recipient preparation</h3><button type="button" className="button button-outline" disabled={disabled || busy || !policy?.tokenId || !recipient} onClick={() => void check()}>{busy ? <LoaderCircle className="spin" size={13}/> : status ? <RefreshCw size={13}/> : <Check size={13}/>} {busy ? 'Checking recipient…' : status ? 'Refresh recipient' : 'Check recipient'}</button></div>
    {!status && !failure && <p>Check account activation and registration on the selected token before preparing a payout.</p>}
    {failure && <p role="alert" className="recipient-readiness-error">{failure}</p>}
    {status && <>
      <p className="recipient-address"><code>{status.recipient}</code></p>
      <p className="recipient-kind">{status.accountKind === 'near_implicit' ? 'NEAR implicit account · 64-character address' : status.accountKind === 'eth_implicit' ? 'Ethereum-style implicit account' : 'Named or other NEAR account'}</p>
      <ol className="recipient-steps">
        <li className={status.accountExists ? 'complete' : ''}>{status.accountExists ? <Check size={15}/> : <Circle size={15}/>}<div><strong>{status.accountExists ? 'Account active' : 'Account activation required'}</strong><p>{status.accountExists ? 'The receiving account exists at the checked block.' : 'Create or activate this exact account with a compatible NEAR wallet, then refresh. Activation is separate from the token payout.'}</p>{!status.accountExists && <a href="https://docs.near.org/integrations/accounts" target="_blank" rel="noreferrer">Account creation guide <ArrowUpRight size={12}/></a>}</div></li>
        <li className={status.tokenRegistered ? 'complete' : ''}>{status.tokenRegistered ? <Check size={15}/> : <Circle size={15}/>}<div><strong>{status.tokenRegistered ? 'Token registered' : 'Token registration required'}</strong><p>{status.tokenRegistered ? 'The recipient is registered on the pinned token contract.' : `${status.accountExists ? 'Registration requires' : 'After activation, registration requires'} ${near(status.storageMinimumYoctoNear)} NEAR at this snapshot. Gas is separate. Payment review can present a sponsored registration call for separate wallet approval.`}</p><code>{status.policy.tokenId}</code></div></li>
        <li className={status.canReceiveTokens ? 'complete' : ''}>{status.canReceiveTokens ? <Check size={15}/> : <Circle size={15}/>}<div><strong>{status.canReceiveTokens ? 'Ready for payment review' : 'Receiving preparation pending'}</strong><p>Payer balance, vault liquidity, protocol fees and finalized payout are checked in the payment flow.</p></div></li>
      </ol>
      <p className="recipient-checked">Checked at block {status.checkedAtBlock.height}. Snapshot only; no account-creation amount is estimated and no transaction is sent.</p>
      {status.registrationCall && <details className="recipient-registration-call"><summary>Inspect public registration call</summary><pre>{JSON.stringify(status.registrationCall, null, 2)}</pre></details>}
    </>}
  </div>;
}
