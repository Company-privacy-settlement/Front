import { FileText, LockKeyhole } from "lucide-react";
import { Mark } from "./brand";
import { feeQuote, type Policy } from "@/vendor/core-client/index.js";

export function InvoicePreview({ policy, merchant, recipient, title, reference, units, hours }: { policy: Policy | null; merchant: string; recipient: string; title: string; reference: string; units: number; hours: number }) {
  const validUnits = Number.isInteger(units) && units >= 1 && units <= 32;
  const principal = policy && validUnits ? (BigInt(policy.denomination) * BigInt(units)).toString() : null;
  const fee = policy && validUnits ? (BigInt(feeQuote(policy).feeTokens) * BigInt(units)).toString() : null;
  return <aside className="invoice-preview" aria-label="Invoice preview">
    <div className="invoice-preview-label"><span><FileText size={15}/> Live preview</span><span className="merchant-badge">Unsigned draft</span></div>
    <div className="invoice-paper">
      <div className="invoice-paper-brand"><span className="invoice-merchant-mark"><Mark size={23}/></span><div><strong>{merchant || "Your business"}</strong><span>Payment request</span></div></div>
      <div className="invoice-paper-heading"><h2>Invoice</h2><span>{reference || "Invoice reference"}</span></div>
      <dl className="invoice-paper-details"><div><dt>Pay to</dt><dd>{recipient || "Add a payout account"}</dd></div><div><dt>Due</dt><dd>{Number.isInteger(hours) && hours >= 1 && hours <= 2160 ? `Within ${hours} hours of issue` : "Set a valid expiry"}</dd></div><div><dt>Network</dt><dd>NEAR</dd></div></dl>
      <div className="invoice-paper-item"><span>Description</span><span>Notes</span><strong>{title || "Your goods or services"}</strong><strong>{validUnits ? units : "1–32"}</strong></div>
      <div className="invoice-paper-total"><span>Amount requested</span><strong>{principal ?? "—"}</strong><small>Token atomic units · {policy?.tokenId || "Choose a payment token"}</small></div>
      <div className="invoice-paper-fee"><span>Withdrawal fee · 0.15%</span><strong>{fee ?? "—"}</strong></div>
      <p className="invoice-paper-note">The payer covers the fee in addition to the principal. NEAR storage and gas are additional.</p>
      <div className="invoice-paper-pay"><LockKeyhole size={14}/> A checkout link is available after signing</div>
    </div>
    <p className="invoice-preview-caption">Preview only. Signing creates the payment request. Drafts stay in this page until you leave.</p>
  </aside>;
}
