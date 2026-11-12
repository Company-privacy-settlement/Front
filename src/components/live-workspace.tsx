"use client";
import Link from "next/link";
import { useRef, useState, type ChangeEvent } from "react";
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
import {
  OperationJournal,
  SettlementSession,
  HttpGateway,
  browserJournalStorage,
  canonical,
  feeQuote,
  parsePolicy,
  type Policy,
  type Operation,
  type Review,
  type SignedInvoice,
  type InvoiceStatus,
  invoiceRoot,
  matchInvoicePlan,
  requireOpenInvoice,
} from "@/vendor/core-client/index.js";
import { liveWallet, nearConnector } from "@/lib/wallet";

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
  const [api, setApi] = useState("http://localhost:3001"),
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
  const journal = useRef<OperationJournal | null>(null),
    session = useRef<SettlementSession | null>(null);
  function lock() {
    journal.current?.lock();
    journal.current = null;
    session.current = null;
    setUnlocked(false);
    setOperations([]);
    setReview(null);
    setSelected("");
    setPassphrase("");
  }
  async function run(fn: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Operation failed");
    } finally {
      if (journal.current) {
        try {
          const all = await journal.current.list(),
            root = invoice ? await invoiceRoot(invoice.invoice) : null;
          setOperations(
            invoice
              ? all.filter(
                  (o) =>
                    o.reference.kind === "withdrawal" &&
                    o.reference.expectedDisclosureRoot === root &&
                    o.reference.expectedRecipient === invoice.invoice.recipient,
                )
              : all,
          );
        } catch {
          /* Keep the original operation error. */
        }
      }
      setBusy(false);
    }
  }
  function storage() {
    if (!policy) throw new Error("Import a trusted policy first");
    return browserJournalStorage(
      `core-live-journal-v1:${policy.network}:${policy.registry}`,
    );
  }
  async function unlock(create: boolean, backup?: string) {
    if (!verified || !policy)
      throw new Error("Verify the API against your trusted policy first");
    const j = new OperationJournal(storage(), passphrase);
    if (backup !== undefined) await j.restore(backup);
    else if (create) await j.create();
    await j.list();
    journal.current = j;
    session.current = new SettlementSession(
      j,
      new HttpGateway(api),
      liveWallet,
      policy,
    );
    setPassphrase("");
    setUnlocked(true);
    setNotice(
      "Journal unlocked in this tab. Export an encrypted backup before moving devices.",
    );
  }
  async function refresh(id: string) {
    if (!session.current) throw new Error("Unlock the journal");
    setReview(await session.current.review(id));
    setSelected(id);
  }
  async function invoiceGate() {
    if (!invoice) return;
    requireOpenInvoice(invoice.invoice);
    const status = await new HttpGateway(api).invoiceStatus(invoice);
    setInvoiceStatus(status);
    if (!["awaiting_payment", "partial"].includes(status.state))
      throw new Error(
        "This invoice is already covered or needs merchant review",
      );
  }
  const op = operations.find((o) => o.id === selected),
    quote = policy?.tokenId ? feeQuote(policy) : null;
  return (
    <SettlementFrame checkout={!!invoice} summary={invoice && <InvoiceSummary key={invoice.invoice.id + api} signed={invoice} api={api} enabled={verified} onChecked={setInvoiceStatus}/> }>
        <div className="merchant-page-heading">
          <div><div className="merchant-page-kicker">{invoice ? "PRIVATE PAYMENT" : "MONEY MOVEMENT"}</div><h1>{invoice ? "Pay with your wallet" : "Settlements"}</h1><p>{invoice ? "Review the request, connect your wallet, and approve each payment step." : "Prepare transfers, review wallet approvals, and follow finalized settlement."}</p></div>
          {!invoice && <a href="#prepared-payment" className="button button-dark"><ArrowUpRight size={15}/> Review a payment</a>}
        </div>
        {invoice ? <div className="checkout-method"><span className="checkout-method-icon"><Wallet size={22}/></span><div><strong>Private token payment</strong><span>NEAR testnet · Your connected wallet</span></div><ShieldCheck size={19}/></div> : <>
          <div className="merchant-tabs" aria-label="Settlement workspace"><span aria-current="page">Overview</span><a href="#prepared-payment">Local operations</a><Link href="/invoices/">Invoices <ArrowUpRight size={13}/></Link></div>
          <div className="settlement-readiness" aria-label="Settlement readiness">
            <a href="#settlement-group"><span>Payment group</span><strong>{verified ? "Verified" : policy ? "Ready to verify" : "Not configured"}</strong><small>{verified ? "API matches your trusted policy" : "Import an independently trusted policy"}</small></a>
            <a href="#settlement-wallet"><span>Wallet</span><strong>{payer ? "Connected" : "Not connected"}</strong><small>{payer || "Connect a NEAR testnet wallet"}</small></a>
            <a href="#settlement-journal"><span>Local journal</span><strong>{unlocked ? `${operations.length} operation${operations.length === 1 ? "" : "s"}` : "Locked"}</strong><small>{unlocked ? "Encrypted records in this browser" : "Unlock to view your own operations"}</small></a>
          </div>
        </>}
        <div className="demo-notice"><ShieldCheck size={16}/><span>Development testnet. Configure your own funded group. Each wallet approval can spend testnet assets and NEAR gas.</span></div>
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
        <div className="live-setup">
          <section className="panel live-card" id="settlement-group">
            <div className="eyebrow">01 · TRUSTED GROUP</div>
            <h2>Choose your deployment</h2>
            <p>
              Use the policy file supplied independently by your group operator.
              The API must match every pinned value.
            </p>
            <label className="form-label">
              Core API origin
              <input
                type="url"
                value={api}
                disabled={busy || unlocked}
                onChange={(e) => {
                  setApi(e.target.value);
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
                  void run(async () => {
                    const p = parsePolicy(JSON.parse(await fileText(e, 8192)));
                    if (
                      invoice &&
                      canonical(p) !== canonical(invoice.invoice.policy)
                    )
                      throw new Error(
                        "Trusted group does not match this signed invoice",
                      );
                    if (p.network !== "testnet" || !p.tokenId)
                      throw new Error(
                        "This workspace supports testnet FT shared groups",
                      );
                    feeQuote(p);
                    setPolicy(p);
                    setVerified(false);
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
              </div>
            )}
            <button
              className="button button-dark"
              disabled={busy || !policy || unlocked}
              onClick={() =>
                void run(async () => {
                  if (
                    canonical(await new HttpGateway(api).policy()) !==
                    canonical(policy)
                  )
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
          </section>
          <section className="panel live-card" id="settlement-wallet">
            <div className="eyebrow">02 · YOUR SIGNER</div>
            <h2>A wallet you control</h2>
            <p>
              The wallet approves each function call. Signing keys stay with
              your wallet provider.
            </p>
            <div className="live-wallet">
              <Wallet size={24} />
              <div>
                <strong>{payer || "No wallet connected"}</strong>
                <span>NEAR testnet · NEAR Connect</span>
              </div>
            </div>
            <button
              className="button button-outline"
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  const c = await nearConnector();
                  await c.connect();
                  setPayer((await liveWallet.identity()).accountId);
                })
              }
            >
              {payer ? "Reconnect wallet" : "Connect testnet wallet"}
              <ArrowUpRight size={16} />
            </button>
            {payer && (
              <button
                className="text-link"
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    await (await nearConnector()).disconnect();
                    setPayer("");
                    setReview(null);
                  })
                }
              >
                Disconnect
              </button>
            )}
            <div className="live-divider" />
            <div className="eyebrow" id="settlement-journal">03 · ENCRYPTED JOURNAL</div>
            <h2>
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
                    onClick={() => void run(() => unlock(false))}
                  >
                    Unlock existing
                  </button>
                  <button
                    className="button button-outline"
                    disabled={busy || !verified || passphrase.length < 12}
                    onClick={() => void run(() => unlock(true))}
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
                      void run(async () => unlock(false, await fileText(e)))
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
                    void run(async () =>
                      download(
                        await journal.current!.export(),
                        "core-operations.encrypted.json",
                      ),
                    )
                  }
                >
                  <Download size={15} /> Export backup
                </button>
                <button
                  className="button button-outline"
                  disabled={busy}
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
              <div className="eyebrow">04 · PREPARED PAYMENT</div>
              <h2>Review. Sign. Confirm.</h2>
            </div>
            <span className="mini-tag">0.15% ADDED TO PRINCIPAL</span>
          </div>
          <p>
            Import the public JSON from Core’s <code>shared-deposit-args</code>{" "}
            or <code>shared-spend-args</code>. Generate and retain private notes
            and withdrawal proofs with Core’s CLI.
          </p>
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
                void run(async () => {
                  if (!session.current) throw new Error("Unlock the journal");
                  const plan = JSON.parse(await fileText(e, 8192));
                  if (invoice) {
                    await invoiceGate();
                    await matchInvoicePlan(plan, invoice.invoice, payer);
                  }
                  const o = await session.current.importPlan(plan);
                  setOperations(await journal.current!.list());
                  await refresh(o.id);
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
                    onClick={() => void run(() => refresh(o.id))}
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
                          void run(async () => {
                            if (invoice) {
                              if (
                                op.reference.kind !== "withdrawal" ||
                                op.reference.expectedRecipient !==
                                  invoice.invoice.recipient ||
                                op.reference.expectedDisclosureRoot !==
                                  (await invoiceRoot(invoice.invoice))
                              )
                                throw new Error(
                                  "Operation is not bound to this invoice",
                                );
                              if (
                                review.kind !== "retry" &&
                                review.kind !== "refund"
                              )
                                await invoiceGate();
                            }
                            try {
                              await session.current!.submitReviewed(
                                op.id,
                                review.callHash!,
                              );
                            } catch (error) {
                              await refresh(op.id).catch(() => setReview(null));
                              throw error;
                            }
                            await refresh(op.id);
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
                      onClick={() => void run(() => refresh(op.id))}
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
                          void run(async () => {
                            await session.current!.reconcile(op.id, {
                              hash: txHash.trim(),
                              signer: op.payer,
                            });
                            await refresh(op.id);
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
          availability and RPC responses are trust dependencies. Testnet use
          does not certify KYB, tax or legal compliance.
        </p>
    </SettlementFrame>
  );
}
