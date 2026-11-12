"use client";
import { useState } from "react";
import { FileCheck2, RefreshCw, Download, Check, Clock3 } from "lucide-react";
import {
  HttpGateway,
  invoiceQuote,
  invoiceRoot,
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
  onChecked?: (s: InvoiceStatus) => void;
}) {
  const [status, setStatus] = useState<InvoiceStatus | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const i = signed.invoice,
    q = invoiceQuote(i),
    coverage = status ? BigInt(status.paidTokens) * 100n / BigInt(status.expectedTokens) : 0n;
  async function refresh() {
    setBusy(true);
    setError("");
    try {
      const s = await new HttpGateway(api).invoiceStatus(signed);
      setStatus(s);
      onChecked?.(s);
    } catch (e) {
      setStatus(null);
      setError(e instanceof Error ? e.message : "Invoice verification failed");
    } finally {
      setBusy(false);
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
            void invoiceRoot(i).then((root) =>
              navigator.clipboard.writeText(root),
            )
          }
        >
          Copy settlement root
        </button>
      </details>
    </section>
  );
}
