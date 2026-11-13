"use client";
import Link from "next/link";
import { useState, type ChangeEvent } from "react";
import { ArrowUpRight, Copy, Download, FilePlus2, Wallet } from "lucide-react";
import { MerchantShell } from "./merchant-shell";
import { InvoicePreview } from "./invoice-preview";
import { InvoiceSummary, saveJson } from "./invoice-summary";
import { InvoiceLibraryPanel } from './invoice-library';
import {
  HttpGateway,
  parsePolicy,
  createInvoice,
  invoiceLink,
  verifySignedInvoice,
  feeQuote,
  canonical,
  type Policy,
  type SignedInvoice,
} from "@/vendor/core-client/index.js";
import { nearConnector, liveWallet, signInvoice } from "@/lib/wallet";
async function jsonFile(e: ChangeEvent<HTMLInputElement>) {
  const f = e.target.files?.[0];
  e.target.value = "";
  if (!f || f.size > 16000)
    throw new Error("Choose an invoice/policy JSON file under 16 KB");
  return JSON.parse(await f.text());
}
export function InvoiceWorkspace() {
  const [api, setApi] = useState("http://localhost:3001"),
    [policy, setPolicy] = useState<Policy | null>(null),
    [merchant, setMerchant] = useState(""),
    [recipient, setRecipient] = useState(""),
    [title, setTitle] = useState(""),
    [reference, setReference] = useState(""),
    [units, setUnits] = useState(1),
    [hours, setHours] = useState(24),
    [signed, setSigned] = useState<SignedInvoice | null>(null),
    [link, setLink] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [libraryInvoiceId, setLibraryInvoiceId] = useState('');
  function hideLibraryInvoice(id?: string) {
    if (libraryInvoiceId && (id === undefined || id === libraryInvoiceId)) { setSigned(null); setLink(''); setLibraryInvoiceId(''); }
  }
  async function run(action: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invoice action failed");
    } finally {
      setBusy(false);
    }
  }
  async function issue() {
    if (!policy) throw new Error("Import a trusted FT group policy");
    const gateway = new HttpGateway(api);
    if (canonical(await gateway.policy()) !== canonical(policy))
      throw new Error("API policy does not match");
    const invoice = createInvoice({
      merchantAccount: merchant,
      recipient,
      title: title.trim(),
      reference: reference.trim(),
      policy,
      units,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + hours * 3600000).toISOString(),
    });
    const result = await signInvoice(invoice);
    await gateway.verifyInvoice(result);
    setSigned(result);
    setLibraryInvoiceId('');
    setLink(invoiceLink(location.origin, result));
    setNotice(
      "Signed payment request created. Save it to your encrypted library or download it before leaving; terms are not saved by the API.",
    );
  }
  return (
    <MerchantShell section="Invoices">
        <div className="merchant-page-heading">
          <div><h1>Create an invoice</h1><p>Request a private payment. Share a link. Track confirmed settlement.</p></div>
          <a href="#invoice-library" className="button button-outline"><FilePlus2 size={15}/> Invoice library</a>
        </div>
        <div className="merchant-tabs invoice-workspace-tabs" aria-label="Invoice workspace"><span aria-current="page">Create invoice</span><a href="#invoice-library">Invoice library</a><Link href="/live/">Payment activity <ArrowUpRight size={13}/></Link></div>
        <div className="demo-notice"><span className="merchant-badge">Testnet</span><span>Fixed token units. Your wallet receives the principal; fees are added on top.</span></div>
        {error && (
          <p className="live-feedback error-text" role="alert">
            {error}
          </p>
        )}
        {notice && (
          <p className="live-feedback" role="status">
            {notice}
          </p>
        )}
        <div className="invoice-builder">
          <div className="invoice-editor">
          <section className="panel live-card invoice-connection">

            <h2>Business & payment account</h2>
            <label className="form-label">
              Core API origin
              <input
                value={api}
                disabled={busy}
                onChange={(e) => setApi(e.target.value)}
              />
            </label>
            <label className="form-label">
              Trusted FT policy JSON
              <input
                type="file"
                accept="application/json,.json"
                disabled={busy}
                onChange={(e) =>
                  void run(async () => {
                    const p = parsePolicy(await jsonFile(e));
                    if (p.network !== "testnet" || !p.tokenId)
                      throw new Error("Use a testnet FT shared group");
                    feeQuote(p);
                    setPolicy(p);
                  })
                }
              />
            </label>
            {policy && (
              <div className="live-policy">
                <span>Registry</span>
                <code>{policy.registry}</code>
                <span>Token</span>
                <code>{policy.tokenId}</code>
                <span>Principal per note · atomic units</span>
                <strong>{policy.denomination}</strong>
              </div>
            )}
            <button
              className="button button-outline"
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  await (await nearConnector()).connect();
                  const identity = await liveWallet.identity();
                  if (identity.accountId !== merchant) { setSigned(null); setLink(''); setLibraryInvoiceId(''); }
                  if (merchant && identity.accountId !== merchant) {
                    setTitle(''); setReference(''); setUnits(1); setHours(24); setRecipient(identity.accountId);
                    setNotice('Merchant changed. The previous draft and opened request were cleared.');
                  }
                  setMerchant(identity.accountId);
                  if (!recipient) setRecipient(identity.accountId);
                })
              }
            >
              <Wallet size={16} />
              {merchant || "Connect merchant wallet"}
            </button>
            <p>
              Issuing an invoice uses an off-chain NEP-413 message signature.
              Choose a wallet with message-signing support. No application
              signing key is created.
            </p>
          </section>
          <section className="panel live-card invoice-details">

            <h2>Payment details</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void run(issue);
              }}
            >
              <label className="form-label">
                Invoice title
                <input
                  required
                  maxLength={120}
                  value={title}
                  disabled={busy}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Project milestone"
                />
              </label>
              <label className="form-label">
                Invoice reference
                <input
                  required
                  maxLength={80}
                  value={reference}
                  disabled={busy}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="INV-2026-001"
                />
              </label>
              <label className="form-label">
                Payout NEAR account
                <input
                  required
                  value={recipient}
                  disabled={busy}
                  onChange={(e) => setRecipient(e.target.value)}
                />
              </label>
              <div className="invoice-term-grid">
                <label className="form-label">
                  Number of notes
                  <input
                    type="number"
                    min={1}
                    max={32}
                    value={units}
                    disabled={busy}
                    onChange={(e) => setUnits(Number(e.target.value))}
                  />
                </label>
                <label className="form-label">
                  Expires in hours
                  <input
                    type="number"
                    min={1}
                    max={2160}
                    value={hours}
                    disabled={busy}
                    onChange={(e) => setHours(Number(e.target.value))}
                  />
                </label>
              </div>
              <div className="invoice-estimate">
                Recipient principal{" "}
                <strong>
                  {policy
                    ? (
                        BigInt(policy.denomination) *
                        BigInt(Number.isInteger(units) && units > 0 ? units : 0)
                      ).toString()
                    : "Choose a group"}{" "}
                  token atomic units
                </strong>
              </div>
              <button
                className="button button-dark"
                disabled={busy || !policy || !merchant}
              >
                Sign & create payment link <ArrowUpRight size={15} />
              </button>
            </form>
            <p>
              Terms are visible to anyone holding the link/file. Only a salted
              invoice commitment enters payment proofs; keep names, salaries and
              legal documents out of this shared request.
            </p>
          </section>
          </div>
          <InvoicePreview policy={policy} merchant={merchant} recipient={recipient} title={title} reference={reference} units={units} hours={hours}/>
        </div>
        <InvoiceLibraryPanel key={merchant || 'disconnected'} merchant={merchant} current={signed} disabled={busy} onHideOpened={hideLibraryInvoice} onOpen={s => { setSigned(s); setLink(invoiceLink(location.origin, s)); setLibraryInvoiceId(s.invoice.id); setNotice('Saved invoice opened. Use its matching Core API and refresh payment status.'); }}/>
        <section className="panel live-card saved-invoice" id="existing-invoice">
          <h2>Open an existing signed invoice</h2>
          <label className="form-label">
            Signed invoice JSON
            <input
              type="file"
              accept="application/json,.json"
              disabled={busy}
              onChange={(e) =>
                void run(async () => {
                  const s = await verifySignedInvoice(await jsonFile(e));
                  setSigned(s);
                  setLibraryInvoiceId('');
                  setLink(invoiceLink(location.origin, s));
                })
              }
            />
          </label>
        </section>
        {signed && (
          <>
            <section className="panel live-card invoice-share">

              <h2>Ready for your payer</h2>
              <label className="form-label">
                Payment link
                <textarea readOnly value={link} rows={3} />
              </label>
              <div className="live-buttons">
                <button
                  className="button button-dark"
                  onClick={() =>
                    void run(async () => {
                      await navigator.clipboard.writeText(link);
                      setNotice("Payment link copied");
                    })
                  }
                >
                  <Copy size={15} /> Copy payment link
                </button>
                <button
                  className="button button-outline"
                  onClick={() =>
                    saveJson(signed, `core-invoice-${signed.invoice.id}.json`)
                  }
                >
                  <Download size={15} /> Download signed invoice
                </button>
                <a className="button button-outline" href={link}>
                  Open checkout <ArrowUpRight size={15} />
                </a>

              </div>
              <p>
                The link carries signed terms in its URL fragment. Share it
                through your own channel. Refreshing a payment status never
                sends funds or marks an invoice paid manually.
              </p>
            </section>
            <InvoiceSummary
              key={signed.invoice.id + api}
              signed={signed}
              api={api}
            />
          </>
        )}
    </MerchantShell>
  );
}
