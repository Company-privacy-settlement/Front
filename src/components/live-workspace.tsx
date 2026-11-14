"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  ArrowUpRight,
  Check,
  Download,
  LockKeyhole,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { SettlementFrame } from "./merchant-shell";
import { IndexedActivityPanel } from "./indexed-activity";
import { InvoiceSummary } from "./invoice-summary";
import { InvoiceNotePayment } from './invoice-note-payment';
import { GroupSelector, type GroupSelection } from './group-selector';
import { RecipientReadiness } from './recipient-readiness';
import {
  OperationJournal,
  SettlementSession,
  HttpGateway,
  browserJournalStorage,
  canonical,
  feeQuote,
  parsePolicy,
  preparedPayment,
  type Policy,
  type Operation,
  type Review,
  type SignedInvoice,
  type InvoiceStatus,
  invoicePaymentRoots,
  invoiceRoot,
  invoiceSettlementGuards,
  matchInvoiceProof,
  type ProofBundle,
  matchInvoicePlan,
} from "@/vendor/core-client/index.js";
import { liveWallet, nearConnector, connectWallet } from "@/lib/wallet";
import {defaultApiOrigin,verifyDeployment} from '@/lib/deployment';
import {subscribeWallet,walletSnapshot} from '@/lib/wallet-state';
import { usePageHideLock } from '@/lib/page-hide-lock';

async function fileText(
  event: ChangeEvent<HTMLInputElement>,
  limit = 3_000_000,
) {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) throw new Error("Choose a JSON file");
  if (file.size > limit) throw new Error("File is too large");
  return file.text();
}
function download(text: string, name: string) {
  const url = URL.createObjectURL(
      new Blob([text], { type: "application/json" }),
    ),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const display = (value: string) => {
  const n = BigInt(value),
    unit = 10n ** 24n;
  return `${n / unit}.${(n % unit).toString().padStart(24, "0").replace(/0+$/, "") || "0"}`;
};
export function LiveWorkspace({ invoice }: { invoice?: SignedInvoice } = {}) {
  const [api, setApi] = useState(defaultApiOrigin),
    [policy, setPolicy] = useState<Policy | null>(null),
    [verified, setVerified] = useState(false),
    [payer, setPayer] = useState(""),
    [passphrase, setPassphrase] = useState(""),
    [unlocked, setUnlocked] = useState(false),
    [operations, setOperations] = useState<Operation[]>([]),
    [review, setReview] = useState<Review | null>(null),
    [selected, setSelected] = useState(""),
    [txHash, setTxHash] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [invoiceStatus, setInvoiceStatus] = useState<InvoiceStatus | null>(null);
  const [groupSelection, setGroupSelection] = useState<GroupSelection | null>(null);
  const [paymentIndex, setPaymentIndex] = useState(0);
  const unit = useRef(0), polls = useRef(new Map<string, number>());
  const journal = useRef<OperationJournal | null>(null),
    session = useRef<SettlementSession | null>(null), pendingJournal = useRef<OperationJournal | null>(null),
    epoch = useRef(0), running = useRef(false), manualDeployment = useRef(false);
  useEffect(() => () => {
    epoch.current++; pendingJournal.current?.lock(); pendingJournal.current = null;
    journal.current?.lock();
    journal.current = null;
    session.current = null;
  }, []);
  function lock() {
    epoch.current++; running.current = false; pendingJournal.current?.lock(); pendingJournal.current = null;
    journal.current?.lock();
    journal.current = null;
    session.current = null;
    setUnlocked(false);
    setOperations([]);
    setReview(null);
    setSelected("");
    setPassphrase("");
    setBusy(false); setTxHash(''); setInvoiceStatus(null); setNotice(''); setError('');
    polls.current.clear();
  }
  usePageHideLock(lock);
  useEffect(()=>{
    let previous=walletSnapshot().accountId;setPayer(previous);
    return subscribeWallet(()=>{const next=walletSnapshot().accountId;if(previous&&next!==previous)lock();previous=next;setPayer(next);setReview(null);});
  },[]);
  useEffect(()=>{let active=true;void verifyDeployment().then(async config=>{
    if(!config.policy||!active||manualDeployment.current)return;
    if(invoice&&canonical(invoice.invoice.policy)!==canonical(config.policy))return;
    const remote=await new HttpGateway(config.apiOrigin).policy();
    if(!active||manualDeployment.current)return;if(canonical(remote)!==canonical(config.policy))throw Error('Payment service differs from the independently reviewed deployment');
    setApi(config.apiOrigin);setPolicy(config.policy);setVerified(true);
  }).catch(()=>{if(active)setError('The payment service could not be verified. Review the connection before preparing a payment.');});return()=>{active=false;};},[invoice]);
  function invalidateGroup() {
    manualDeployment.current=true;
    setVerified(false); setInvoiceStatus(null); setPolicy(null); setGroupSelection(null);
    setReview(null); setSelected(''); setNotice('');
  }
  function useGroup(selection: GroupSelection) {
    manualDeployment.current=true;
    if (busy || unlocked || invoice) return;
    lock(); setPayer(''); setTxHash(''); setError('');
    setPolicy(selection.policy); setApi(selection.api); setVerified(true); setInvoiceStatus(null); setGroupSelection(selection);
    setNotice(`Using ${selection.id} ${selection.allowNewDeposits ? 'for new deposits' : 'for withdrawals and recovery'}. The API matches its independently approved policy.`);
  }
  async function run(fn: (check: () => void) => Promise<void>) {
    if (running.current) return;
    running.current = true;
    const version = epoch.current, active = () => version === epoch.current;
    const check = () => { if (!active()) throw new Error('Settlement workspace is locked'); };
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await fn(check); check();
    } catch (e) {
      if (active() && !(e instanceof Error && e.name === 'AbortError')) setError(e instanceof Error ? e.message : "Operation failed");
    } finally {
      if (active() && journal.current) {
        try {
          const all = await journal.current.list(); check();
          const roots = invoice ? await invoicePaymentRoots(invoice.invoice) : []; check();
          setOperations(
            invoice
              ? all.filter(
                  (o) =>
                    o.reference.kind === "withdrawal" &&
                    roots.includes(o.reference.expectedDisclosureRoot ?? "") &&
                    o.reference.expectedRecipient === invoice.invoice.recipient,
                )
              : all,
          );
        } catch {
          /* Keep the original operation error. */
        }
      }
      if (active()) { running.current = false; setBusy(false); }
    }
  }
  function storage() {
    if (!policy) throw new Error("Import a trusted policy first");
    return browserJournalStorage(
      `core-live-journal-v1:${policy.network}:${policy.registry}`,
    );
  }
  async function unlock(create: boolean, check: () => void, backup?: string) {
    check();
    if (!verified || !policy)
      throw new Error("Verify the API against your trusted policy first");
    const j = new OperationJournal(storage(), passphrase);
    pendingJournal.current = j;
    try {
      if (backup !== undefined) await j.restore(backup);
      else if (create) await j.create();
      check(); await j.list(); check();
    } catch (error) { j.lock(); if (pendingJournal.current === j) pendingJournal.current = null; throw error; }
    pendingJournal.current = null;
    journal.current = j;
    const gateway = new HttpGateway(api), version = epoch.current;
    const guardedGateway = { invoiceStatus: async (signed: SignedInvoice) => {
      try { const status = await gateway.invoiceStatus(signed); if (version === epoch.current) setInvoiceStatus(status); return status; }
      catch (error) { if (version === epoch.current) setInvoiceStatus(null); throw error; }
    } };
    session.current = new SettlementSession(
      j,
      gateway,
      liveWallet,
      policy,
      invoice ? invoiceSettlementGuards(guardedGateway, invoice) : undefined,
    );
    setPassphrase("");
    setUnlocked(true);
    setNotice(
      "Journal unlocked in this tab. Export an encrypted backup before moving devices.",
    );
  }
  async function refresh(id: string, check: () => void) {
    check(); const current = session.current;
    if (!current) throw new Error("Unlock the journal");
    let next: Review;
    try { next = await current.review(id); check(); }
    catch (error) { check(); setReview(null); throw error; }
    if (invoice && journal.current) {
      const all = await journal.current.list(); check();
      const operation = all.find(o => o.id === id), roots = await invoicePaymentRoots(invoice.invoice); check();
      const index = operation?.reference.kind === 'withdrawal' ? roots.indexOf(operation.reference.expectedDisclosureRoot ?? '') : -1;
      if (index >= 0 && index !== unit.current) { unit.current = index; setPaymentIndex(index); }
      if (next.action === 'complete') {
        try { const status = await new HttpGateway(api).invoiceStatus(invoice); check(); setInvoiceStatus(status); }
        catch { check(); setInvoiceStatus(null); setNotice('Withdrawal confirmed. Invoice indexing is not available yet; refresh the invoice separately.'); }
      }
    }
    setReview(next);
    setSelected(id);
  }
  function selectPaymentIndex(index: number) {
    if (running.current) return;
    unit.current = index; setPaymentIndex(index); setReview(null); setSelected(''); setNotice(''); setError('');
  }
  async function prepareInvoicePayment(bundle: ProofBundle, index: number, check: () => void) {
    if (!invoice || !session.current || !journal.current || index !== unit.current) throw new Error('Invoice payment selection changed');
    const matched = await matchInvoiceProof(bundle, invoice, index, payer); check();
    if (index !== unit.current) throw new Error('Invoice payment selection changed');
    const operation = await session.current.importPlan(matched.bundle.plan); check();
    polls.current.set(operation.id, 0); await refresh(operation.id, check);
  }
  const op = operations.find((o) => o.id === selected),
    quote = policy?.tokenId ? feeQuote(policy) : null;
  useEffect(() => {
    if (!invoice || !unlocked || !selected || !review || !['wait', 'reconcile'].includes(review.action)) return;
    const version = epoch.current; let active = true, timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      if (!active || version !== epoch.current) return;
      if (running.current) { timer = setTimeout(() => void tick(), 2000); return; }
      const count = polls.current.get(selected) ?? 0;
      if (count >= 10) return;
      polls.current.set(selected, count + 1);
      await run(check => refresh(selected, check));
      if (active && version === epoch.current) timer = setTimeout(() => void tick(), 2000);
    };
    timer = setTimeout(() => void tick(), 2000);
    return () => { active = false; clearTimeout(timer); };
  }, [invoice, unlocked, selected, review?.action]);
  return (
    <SettlementFrame checkout={!!invoice} summary={invoice && <InvoiceSummary key={invoice.invoice.id + api} signed={invoice} api={api} enabled={verified} onChecked={setInvoiceStatus} paymentIndex={paymentIndex} onPaymentIndexChange={selectPaymentIndex} disabled={busy} checkedStatus={invoiceStatus}/> }>
        <div className="merchant-page-heading">
          <div><h1>{invoice ? "Pay with your wallet" : "Settlements"}</h1><p>{invoice ? "Review the request, connect your wallet, and approve each payment step." : "Prepare transfers, review wallet approvals, and follow finalized settlement."}</p></div>
          {!invoice && <a href="#prepared-payment" className="button button-dark"><ArrowUpRight size={15}/> Review a payment</a>}
        </div>
        {invoice ? <div className="checkout-method"><span className="checkout-method-icon"><Wallet size={22}/></span><div><strong>Private token payment</strong><span>Your connected wallet</span></div><ShieldCheck size={19}/></div> : <>
          <div className="merchant-tabs" aria-label="Settlement workspace"><span aria-current="page">Overview</span><a href="#prepared-payment">Local operations</a><Link href="/invoices/">Invoices <ArrowUpRight size={13}/></Link><Link href="/relay/">Scheduled delivery <ArrowUpRight size={13}/></Link></div>
          <div className="settlement-readiness" aria-label="Settlement readiness">
            <a href="#settlement-group"><span>Payment group</span><strong>{verified ? "Verified" : policy ? "Ready to verify" : "Not configured"}</strong><small>{verified ? "API matches your trusted policy" : "Import an independently trusted policy"}</small></a>
            <a href="#settlement-wallet"><span>Wallet</span><strong>{payer ? "Connected" : "Not connected"}</strong><small>{payer || "Connect your wallet"}</small></a>
            <a href="#settlement-journal"><span>Local journal</span><strong>{unlocked ? `${operations.length} operation${operations.length === 1 ? "" : "s"}` : "Locked"}</strong><small>{unlocked ? "Encrypted records in this browser" : "Unlock to view your own operations"}</small></a>
          </div>
        </>}

        {error && (
          <p className="live-feedback error-text" role="alert">
            {error}
          </p>
        )}
        {notice && (
          <p className="live-feedback" role="status">
            <Check size={16} />
            {notice}
          </p>
        )}
        <details className="privacy-explainer"><summary>Privacy model & public information</summary><p>Principal remains in independent vaults. A shared ZK note proves the right to withdraw without naming the input note; funds are not forwarded through a chain of vaults. Payout accounts, fixed token amounts, timing and transaction signers remain public. Effective anonymity is not measured by the vault count.</p><p>KYB documents and business terms stay outside contract calls. The API can observe preparation and status requests. Share receipt openings only with the intended reviewer.</p></details>
        <div className="live-setup">
          <section className="panel live-card" id="settlement-group">

            <h2>Payment network</h2>
            <p>
              Use the policy file supplied independently by your group operator.
              The API must match every pinned value.
            </p>
            {!invoice && <GroupSelector disabled={busy || unlocked} onSelect={useGroup} onInvalidate={invalidateGroup}/>}
            {groupSelection && <p className="group-selected" role="status">Selected group: <strong>{groupSelection.id}</strong> · {groupSelection.allowNewDeposits ? 'New deposits enabled' : 'Withdrawals and recovery'}</p>}
            <label className="form-label">
              Payment service origin
              <input
                type="url"
                value={api}
                disabled={busy || unlocked}
                onChange={(e) => {
                  manualDeployment.current=true;setApi(e.target.value);
                  setVerified(false);
                  setInvoiceStatus(null);
                }}
                placeholder="https://api.example.com"
              />
            </label>
            <label className="live-file form-label">
              Trusted policy JSON
              <input
                type="file"
                accept="application/json,.json"
                aria-label="Trusted policy JSON"
                disabled={busy || unlocked}
                onChange={(e) => {
                  void run(async (check) => {
                    setVerified(false); setInvoiceStatus(null); setPolicy(null); setGroupSelection(null);
                    manualDeployment.current=true;const contents = await fileText(e, 8192); check();
                    const p = parsePolicy(JSON.parse(contents));
                    if (
                      invoice &&
                      canonical(p) !== canonical(invoice.invoice.policy)
                    )
                      throw new Error(
                        "Trusted group does not match this signed invoice",
                      );
                    if (p.network !== "testnet" || !p.tokenId)
                      throw new Error(
                        "Choose a token settlement group on the configured network",
                      );
                    feeQuote(p);
                    setPolicy(p);
                    setVerified(false);
                    setGroupSelection(null);
                    setInvoiceStatus(null);
                  });
                }}
              />
            </label>
            {policy && (
              <div className="live-policy">
                <span>Registry</span>
                <code>{policy.registry}</code>
                <span>Token</span>
                <code>{policy.tokenId}</code>
                <span>Principal · token atomic units</span>
                <strong>{policy.denomination}</strong>
                <span>0.15% fee · token atomic units</span>
                <strong>{quote?.feeTokens}</strong>
                <details>
                  <summary>Inspect all pinned values</summary>
                  <pre>{JSON.stringify(policy, null, 2)}</pre>
                </details>
                <button type="button" className="text-link" onClick={() => download(JSON.stringify(policy, null, 2), `core-policy-${policy.registry}.json`)}>Download selected policy <Download size={13}/></button>
              </div>
            )}
            <button
              className="button button-dark"
              disabled={busy || !policy || unlocked}
              onClick={() =>
                void run(async (check) => {
                  const remote = await new HttpGateway(api).policy(); check();
                  if (canonical(remote) !== canonical(policy))
                    throw new Error("API policy differs from the trusted file");
                  setVerified(true);
                  setNotice(
                    "The API matches the trusted policy. Chain readiness is checked when reviewing a payment.",
                  );
                })
              }
            >
              {verified ? (
                <>
                  <Check size={16} /> Policy matches
                </>
              ) : (
                "Verify API policy"
              )}
            </button>
            {invoice && <RecipientReadiness policy={policy} recipient={invoice.invoice.recipient} api={api} disabled={busy || !verified}/>}
          </section>
          <section className="panel live-card" id="settlement-wallet">

            <h2>A wallet you control</h2>
            <p>
              The wallet approves each function call. Signing keys stay with
              your wallet provider.
            </p>
            <div className="live-wallet">
              <Wallet size={24} />
              <div>
                <strong>{payer || "No wallet connected"}</strong>
                <span>Keys stay with your wallet</span>
              </div>
            </div>
            <button
              className="button button-outline"
              disabled={busy}
              aria-label="Connect payment wallet"
              onClick={() =>
                void run(async (check) => {
                  const identity = await connectWallet(); check(); setPayer(identity.accountId);
                })
              }
            >
              {payer ? "Reconnect wallet" : "Connect wallet"}
              <ArrowUpRight size={16} />
            </button>
            {payer && (
              <button
                className="text-link"
                disabled={busy}
                onClick={() =>
                  void run(async (check) => {
                    const c = await nearConnector(); check(); await c.disconnect(); check();
                    setPayer("");
                    setReview(null);
                  })
                }
              >
                Disconnect
              </button>
            )}
            <div className="live-divider" />
            <h2 id="settlement-journal">
              {unlocked
                ? "Your journal is unlocked"
                : "Keep a recoverable record"}
            </h2>
            <p>
              Payment plans and transaction hashes are encrypted in this
              browser. Your passphrase stays in memory; keep it and an exported
              backup safe.
            </p>
            {!unlocked ? (
              <>
                <label className="form-label">
                  Journal passphrase
                  <input
                    type="password"
                    autoComplete="off"
                    minLength={12}
                    value={passphrase}
                    disabled={busy}
                    onChange={(e) => setPassphrase(e.target.value)}
                    placeholder="At least 12 characters"
                  />
                </label>
                <div className="live-buttons">
                  <button
                    className="button button-dark"
                    disabled={busy || !verified || passphrase.length < 12}
                    onClick={() => void run(check => unlock(false, check))}
                  >
                    Unlock existing
                  </button>
                  <button
                    className="button button-outline"
                    disabled={busy || !verified || passphrase.length < 12}
                    onClick={() => void run(check => unlock(true, check))}
                  >
                    Create journal
                  </button>
                </div>
                <label className="live-file form-label">
                  Restore encrypted backup into empty storage
                  <input
                    type="file"
                    accept="application/json,.json"
                    disabled={busy || !verified || passphrase.length < 12}
                    onChange={(e) =>
                      void run(async check => { const backup = await fileText(e); check(); await unlock(false, check, backup); })
                    }
                  />
                </label>
              </>
            ) : (
              <div className="live-buttons">
                <button
                  className="button button-outline"
                  disabled={busy}
                  onClick={() =>
                    void run(async check => {
                      const backup = await journal.current!.export(); check();
                      download(backup, "core-operations.encrypted.json");
                    })
                  }
                >
                  <Download size={15} /> Export backup
                </button>
                <button
                  className="button button-outline"
                  onClick={lock}
                >
                  <LockKeyhole size={15} /> Lock
                </button>
              </div>
            )}
          </section>
        </div>
        <section className="panel live-card settlement-operations" id="prepared-payment">
          <div className="panel-heading">
            <div>

              <h2>Review. Sign. Confirm.</h2>
            </div>
            <span className="mini-tag">0.15% ADDED TO PRINCIPAL</span>
          </div>
          <p>
            Import a public deposit plan from <Link href="/notes/">Private notes</Link> or
            a withdrawal plan from <Link href="/prove/">Local proofs</Link> or Core’s CLI. Keep your encrypted note backup until final reconciliation.
          </p>
          {invoice && verified && policy && unlocked && payer && <InvoiceNotePayment key={`${api}:${canonical(policy)}:${payer}`} signed={invoice} paymentIndex={paymentIndex} policy={policy} api={api} disabled={busy}
            progress={review?.action === 'complete' ? 'confirmed' : op?.attempts.length && ['wait','reconcile'].includes(review?.action ?? '') ? 'wallet' : review ? 'review' : 'note'}
            run={run} onPrepared={prepareInvoicePayment} getOperations={async () => { if (!journal.current) throw new Error('Unlock the journal'); return journal.current.list(); }}/>}
          {invoice && <p className="small-note">Alternatively, import an existing public FT payment plan below. Keep private notes in the local proof form.</p>}
          <label className="live-file form-label">
            Public FT payment plan
            <input
              type="file"
              accept="application/json,.json"
              aria-label="Public FT payment plan"
              disabled={
                busy ||
                !unlocked ||
                !payer ||
                (!!invoice &&
                  (!invoiceStatus ||
                    !["awaiting_payment", "partial"].includes(
                      invoiceStatus.state,
                    )))
              }
              onChange={(e) =>
                void run(async (check) => {
                  if (!session.current) throw new Error("Unlock the journal");
                  const contents = await fileText(e, 8192); check();
                  const plan = JSON.parse(contents);
                  if (groupSelection && !groupSelection.allowNewDeposits && (await preparedPayment(plan, policy!, payer)).reference.kind === 'deposit')
                    throw new Error('This group is selected for withdrawals and recovery. New deposit imports are disabled.');
                  check();
                  if (invoice) {
                    await matchInvoicePlan(plan, invoice.invoice, payer, unit.current); check();
                  }
                  check(); const activeSession = session.current;
                  if (!activeSession) throw new Error("Unlock the journal");
                  const o = await activeSession.importPlan(plan); check();
                  const all = await journal.current!.list(); check(); setOperations(all);
                  await refresh(o.id, check);
                })
              }
            />
          </label>
          <div className="live-operations">
            <div className="live-history">
              <h3>Local operations</h3>
              {operations.length === 0 ? (
                <p>
                  {unlocked
                    ? "Import a payment plan to begin."
                    : "Unlock your journal to view operations."}
                </p>
              ) : (
                operations.map((o) => (
                  <button
                    key={o.id}
                    className={o.id === selected ? "selected" : ""}
                    disabled={busy}
                    onClick={() => void run(check => refresh(o.id, check))}
                  >
                    <span>
                      {o.reference.kind === "deposit"
                        ? "Deposit"
                        : "Withdrawal"}
                      <small>
                        {o.outcome} · {o.attempts.length} signature attempts
                      </small>
                    </span>
                    <ArrowUpRight size={16} />
                  </button>
                ))
              )}
            </div>
            <div className="live-review" aria-live="polite">
              {!review || !op ? (
                <div className="live-empty">
                  <LockKeyhole size={29} />
                  <h3>Every step is explicit</h3>
                  <p>
                    Registration, storage credit and token payment appear
                    separately before wallet approval.
                  </p>
                </div>
              ) : (
                <>
                  <div className="live-review-heading">
                    <span className="mini-tag">
                      {review.action.toUpperCase()}
                    </span>
                    <strong>{review.observation.state}</strong>
                  </div>
                  <h3>{review.message}</h3>
                  {invoice && review.action === 'complete' && <p className="invoice-payment-confirmed" role="status">Withdrawal confirmed for this payment unit. The recipient received the full note principal. Invoice totals are shown separately from the index.</p>}
                  <div className="live-policy">
                    <span>Reviewed payer</span>
                    <code>{op.payer}</code>
                    <span>Vault</span>
                    <code>
                      {op.reference.kind === "deposit"
                        ? op.reference.vault
                        : op.reference.expectedVault}
                    </code>
                    {op.reference.kind === "withdrawal" && (
                      <>
                        <span>Recipient</span>
                        <code>{op.reference.expectedRecipient}</code>
                      </>
                    )}
                    <span>Finalized block checked</span>
                    <strong>{review.observation.checkedAtBlock.height}</strong>
                  </div>
                  {!invoice && op.reference.kind === 'withdrawal' && <RecipientReadiness policy={policy} recipient={op.reference.expectedRecipient} api={api} disabled={busy}/>}
                  {review.call && (
                    <>
                      <div className="quote-lines">
                        <div>
                          <span>Next function</span>
                          <strong>{review.call.method}</strong>
                        </div>
                        <div>
                          <span>Attached NEAR · gas additional</span>
                          <strong>
                            {display(review.call.attachedYoctoNear)}
                          </strong>
                        </div>
                        {review.call.method === "ft_transfer_call" && (
                          <div>
                            <span>Token charge · atomic units</span>
                            <strong>{String(review.call.args.amount)}</strong>
                          </div>
                        )}
                      </div>
                      <details className="live-call">
                        <summary>Inspect exact call and hash</summary>
                        <pre>{JSON.stringify(review.call, null, 2)}</pre>
                        <code>{review.callHash}</code>
                      </details>
                    </>
                  )}
                  <div className="live-buttons">
                    {review.action === "sign" && (
                      <button
                        className="button button-dark"
                        disabled={busy || !payer}
                        onClick={() =>
                          void run(async (check) => {
                            if (invoice) {
                              if (
                                op.reference.kind !== "withdrawal" ||
                                op.reference.expectedRecipient !==
                                  invoice.invoice.recipient ||
                                !(await invoicePaymentRoots(invoice.invoice)).includes(op.reference.expectedDisclosureRoot ?? "")
                              )
                                throw new Error(
                                  "Operation is not bound to this invoice",
                                );
                              if (
                                review.kind !== "retry" &&
                                review.kind !== "refund"
                              ) {
                                const root = await invoiceRoot(invoice.invoice, unit.current); check();
                                if (op.reference.expectedDisclosureRoot !== root) throw new Error('Select the operation’s invoice payment unit before signing');
                              }
                            }
                            check(); const activeSession = session.current;
                            if (!activeSession) throw new Error("Unlock the journal");
                            try {
                              await activeSession.submitReviewed(
                                op.id,
                                review.callHash!,
                              );
                            } catch (error) {
                              check(); await refresh(op.id, check).catch(() => { check(); setReview(null); });
                              throw error;
                            }
                            check(); await refresh(op.id, check);
                          })
                        }
                      >
                        Approve {review.kind} in wallet{" "}
                        <ArrowUpRight size={15} />
                      </button>
                    )}
                    <button
                      className="button button-outline"
                      disabled={busy}
                      onClick={() => { polls.current.set(op.id, 0); void run(check => refresh(op.id, check)); }}
                    >
                      Refresh finalized state
                    </button>
                  </div>
                  {review.action === "reconcile" && (
                    <div className="live-reconcile">
                      <label className="form-label">
                        Transaction hash from your wallet
                        <input
                          value={txHash}
                          disabled={busy}
                          onChange={(e) => setTxHash(e.target.value)}
                          placeholder="NEAR transaction hash"
                        />
                      </label>
                      <button
                        className="button button-outline"
                        disabled={busy || !txHash}
                        onClick={() =>
                          void run(async (check) => {
                            check(); const activeSession = session.current;
                            if (!activeSession) throw new Error("Unlock the journal");
                            await activeSession.reconcile(op.id, {
                              hash: txHash.trim(),
                              signer: op.payer,
                            });
                            check(); await refresh(op.id, check);
                            setTxHash("");
                          })
                        }
                      >
                        Verify existing transaction
                      </button>
                      <p>
                        An unknown signature outcome stays blocked until it can
                        be verified. Refreshing never submits another payment.
                      </p>
                    </div>
                  )}
                  {op.attempts.length > 0 && (
                    <details className="live-call">
                      <summary>Recorded signature attempts</summary>
                      {op.attempts.map((a, i) => (
                        <div className="live-attempt" key={i}>
                          <strong>
                            {i + 1}. {a.kind} · {a.state}
                          </strong>
                          <code>
                            {a.transaction?.hash ||
                              "Transaction hash unavailable"}
                          </code>
                        </div>
                      ))}
                    </details>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
        {verified && policy && (
          <IndexedActivityPanel
            key={`${api}:${canonical(policy)}`}
            api={api}
            policy={policy}
          />
        )}
        <p className="small-note live-footnote">
          This journal contains public settlement metadata, not spendable
          private notes. The read-only Core API can observe requests; its
          availability and RPC responses affect status checks. Payment evidence supports professional review; verification and statutory filing are separate steps.
        </p>
    </SettlementFrame>
  );
}
