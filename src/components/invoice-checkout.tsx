"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldAlert, LoaderCircle, ArrowLeft } from "lucide-react";
import { Brand } from "./brand";
import {
  invoiceFromFragment,
  verifySignedInvoice,
  type SignedInvoice,
} from "@/vendor/core-client/index.js";
import { LiveWorkspace } from "./live-workspace";
export function InvoiceCheckout() {
  const [signed, setSigned] = useState<SignedInvoice | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    try {
      void verifySignedInvoice(invoiceFromFragment(location.hash))
        .then((s) => {
          if (active) setSigned(s);
        })
        .catch((e) => {
          if (active) setError(e.message);
        });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid payment link");
    }
    return () => {
      active = false;
    };
  }, []);
  if (error)
    return (
      <div className="merchant-ui checkout-empty"><header className="checkout-topbar"><Brand/><span className="merchant-mode">Testnet checkout</span></header><main className="checkout-error-card">
        <span className="checkout-error-icon"><ShieldAlert size={26}/></span><h1>Invoice could not be verified</h1>
        <p role="alert" className="error-text">
          {error}
        </p>
        <Link href="/invoices/" className="button button-outline">
          <ArrowLeft size={15}/> Open invoices
        </Link>
      </main></div>
    );
  if (!signed)
    return (
      <div className="merchant-ui checkout-empty"><header className="checkout-topbar"><Brand/><span className="merchant-mode">Testnet checkout</span></header><main className="checkout-error-card"><LoaderCircle className="spin" size={24}/><p role="status">Verifying signed payment request…</p></main></div>
    );
  return <LiveWorkspace invoice={signed} />;
}
