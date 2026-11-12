"use client";
import { useEffect, useRef, useState } from "react";
import { FileCheck2, RefreshCw, Download, Check, Clock3 } from "lucide-react";
import {
  HttpGateway,
  invoiceQuote,
  invoicePaymentRoots,
  type SignedInvoice,
  type InvoiceStatus,
} from "@/vendor/core-client/index.js";
export const invoiceStates: Record<InvoiceStatus["state"], string> = {
  awaiting_payment: "Awaiting payment",
  partial: "Partially paid",
  paid: "Paid in indexed confirmations",
  paid_late: "Paid after expiry · review",
  overpaid: "Overpaid · review",
  expired: "Expired · no indexed payment",
  partial_expired: "Expired · partially paid",
  review_required: "Coverage limit · review",
};
export function saveJson(value: unknown, name: string) {
  const url = URL.createObjectURL(
      new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }),
    ),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function InvoiceSummary({
  signed,
  api,
  enabled = true,
  onChecked,
}: {
  signed: SignedInvoice;
  api: string;
  enabled?: boolean;
  onChecked?: (s: InvoiceStatus | null) => void;
}) {
  const [status, setStatus] = useState<InvoiceStatus | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [paymentIndex, setPaymentIndex] = useState(0),
    [roots, setRoots] = useState<string[]>([]);
  const generation = useRef(0);
  const i = signed.invoice,
    q = invoiceQuote(i),
    coverage = status ? BigInt(status.paidTokens) * 100n / BigInt(status.expectedTokens) : 0n;
  const selectedRoot = roots[paymentIndex] ?? "",
    usedReference = i.version === 2 && !!status?.confirmations.some(c => c.settlementRoot === selectedRoot);
  useEffect(() => {
    let active = true;
    setRoots([]);
    setPaymentIndex(0);
    setStatus(null);
    setError("");
    invoicePaymentRoots(i).then(r => { if (active) setRoots(r); }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [i]);
  useEffect(() => {
    generation.current++;
    setStatus(null);
    setBusy(false);
    setError("");
    onChecked?.(null);
    return () => { generation.current++; };
  }, [signed, api, enabled, onChecked]);
  async function refresh() {
    const requestGeneration = generation.current;
    setBusy(true);
    setError("");
    setStatus(null);
    onChecked?.(null);
    try {
      const s = await new HttpGateway(api).invoiceStatus(signed);
      const references = await invoicePaymentRoots(i);
      if (requestGeneration !== generation.current) return;
      setStatus(s);
      if (i.version === 2) {
        const used = new Set(s.confirmations.map(c => c.settlementRoot));
        const next = references.findIndex(r => !used.has(r));
        if (next >= 0) setPaymentIndex(next);
      }
      onChecked?.(s);
    } catch (e) {
      if (requestGeneration !== generation.current) return;
      setStatus(null);
      onChecked?.(null);
      setError(e instanceof Error ? e.message : "Invoice verification failed");
    } finally {
      if (requestGeneration === generation.current) setBusy(false);
    }
  }
  return (
    <section
      className="panel live-card invoice-summary"
      aria-labelledby="invoice-title"
    >
      <div className="activity-heading">
        <div>

          <h2 id="invoice-title">{i.title}</h2>
          <p>
            {i.reference} · {i.units} fixed-denomination note
            {i.units === 1 ? "" : "s"}
          </p>
        </div>
        <span className="merchant-badge"><FileCheck2 size={13}/> Signed invoice</span>
      </div>
      <div className="invoice-amount">
        <span>Recipient receives · token atomic units</span>
        <strong>{q.principalTokens}</strong>
        <small>
          {i.policy.tokenId} · NEAR {i.policy.network}
        </small>
      </div>
      <div className="live-policy">
        <span>Merchant signer</span>
        <code>{i.merchantAccount}</code>
        <span>Payout account</span>
        <code>{i.recipient}</code>
        <span>Protocol fee · 0.15% added</span>
        <strong>{q.withdrawalFeeTokens} token atomic units</strong>
        <span>Expires · UTC</span>
        <code>{i.expiresAt}</code>
      </div>
      <p>
        The merchant’s wallet signature binds these terms. Wallet control is
        separate from KYB. Private payments also require NEAR storage and gas;
        funding private notes has its own deposit fee.
      </p>
      <div className="invoice-payment-reference">
        <label className="form-label">Payment unit<select value={paymentIndex} onChange={e => setPaymentIndex(Number(e.target.value))} disabled={!roots.length || busy}>
          {roots.map((root, index) => <option value={index} key={root}> {i.version === 2 ? `Payment ${index + 1} of ${i.units}` : "Legacy shared reference"}{status?.confirmations.some(c => c.settlementRoot === root) ? " · Indexed payment recorded" : ""}</option>)}
        </select></label>
        <p>{i.version === 2 ? "Each payment unit uses a different signed reference. The payout account, amount and timing remain public; link holders and the API can still associate these payments." : "Legacy invoice: every payment shares one public reference. New invoices use per-payment references; this signed request cannot be silently upgraded."}</p>
        <button className="button button-outline" disabled={!selectedRoot || !enabled || usedReference} onClick={() => saveJson({ kind: "withdraw", target: i.recipient, disclosureRoot: selectedRoot }, `invoice-action-${i.id}-${paymentIndex + 1}.json`)}><Download size={14}/> Download proof action</button>
        {usedReference && <p className="small-note">This reference already has an indexed payment. Choose an unused payment unit.</p>}
      </div>
      <button
        className="button button-dark"
        disabled={busy || !enabled}
        onClick={() => void refresh()}
      >
        <RefreshCw size={15} />
        {busy ? "Checking…" : "Verify merchant & refresh payment"}
      </button>
      {!enabled && (
        <p className="small-note">
          Verify the API against an independently trusted group policy first.
        </p>
      )}
      {error && (
        <p className="error-text invoice-error" role="alert">
          {error}
        </p>
      )}
      {status && (
        <div className={`invoice-status invoice-state-${status.state}`} aria-live="polite">
          <span className="mini-tag">MERCHANT WALLET VERIFIED · NOT KYB</span>
          <h3>{["paid", "paid_late", "overpaid"].includes(status.state) ? <Check size={18}/> : <Clock3 size={18}/>} {invoiceStates[status.state]}</h3>
          <progress className="invoice-coverage" aria-label="Confirmed invoice coverage" max={100} value={Number(coverage > 100n ? 100n : coverage)}/>
          <div className="quote-lines">
            <div>
              <span>Confirmed principal · token atomic units</span>
              <strong>
                {status.paidTokens} / {status.expectedTokens}
              </strong>
            </div>
            <div>
              <span>Remaining principal</span>
              <strong>{status.remainingTokens}</strong>
            </div>
            {status.overpaidTokens !== "0" && (
              <div>
                <span>Overpayment · manual reconciliation</span>
                <strong>{status.overpaidTokens}</strong>
              </div>
            )}
            <div>
              <span>Indexed final block</span>
              <strong>{status.checkedAt.height}</strong>
            </div>
          </div>
          {!!status.reusedPaymentReferences && <p className="invoice-reference-warning" role="status">Repeated public references detected: {status.reusedPaymentReferences}. Funds remain included in confirmed totals; review the reference reuse.</p>}
          <p>
            As of {status.checkedAt.updatedAt}. This reads confirmed registry
            records in the index, not the latest chain head. A wallet submission
            or browser redirect does not mark this invoice paid. Expiry is a
            checkout rule; contracts can still settle late payments.
          </p>
          <button
            className="button button-outline"
            onClick={() =>
              saveJson(
                {
                  format: "core-invoice-indexed-summary",
                  signedInvoice: signed,
                  status,
                  claims: {
                    indexedObservations: true,
                    completeBusinessHistory: false,
                    taxCertification: false,
                  },
                },
                `invoice-summary-${i.id}.json`,
              )
            }
          >
            <Download size={15} /> Export indexed summary
          </button>
        </div>
      )}
      <details className="live-call">
        <summary>Inspect signed invoice</summary>
        <pre>{JSON.stringify(signed, null, 2)}</pre>
        <button
          className="text-link"
          onClick={() =>
            void navigator.clipboard.writeText(selectedRoot)
          }
        >
          Copy selected payment reference
        </button>
      </details>
    </section>
  );
}
