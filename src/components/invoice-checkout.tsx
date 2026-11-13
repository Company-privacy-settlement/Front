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
type CheckoutState =
  | { phase: "loading"; hash: string }
  | { phase: "verified"; hash: string; signed: SignedInvoice }
  | { phase: "invalid"; hash: string; error: string };
export function InvoiceCheckout() {
  const [state, setState] = useState<CheckoutState>({ phase: "loading", hash: "" });
  useEffect(() => {
    let generation = 0;
    const load = () => {
      const current = ++generation, hash = location.hash;
      setState({ phase: "loading", hash });
      const invalid = (e: unknown) => {
        if (current === generation)
          setState({ phase: "invalid", hash, error: e instanceof Error ? e.message : "Invalid payment link" });
      };
      try {
        void verifySignedInvoice(invoiceFromFragment(hash))
          .then((signed) => {
            if (current === generation) setState({ phase: "verified", hash, signed });
          })
          .catch(invalid);
      } catch (e) {
        invalid(e);
      }
    };
    window.addEventListener("hashchange", load);
    window.addEventListener("popstate", load);
    load();
    return () => {
      generation++;
      window.removeEventListener("hashchange", load);
      window.removeEventListener("popstate", load);
    };
  }, []);
  if (state.phase === "invalid")
    return (
      <div className="merchant-ui checkout-empty"><header className="checkout-topbar"><Brand/><span className="merchant-mode">Testnet checkout</span></header><main className="checkout-error-card">
        <span className="checkout-error-icon"><ShieldAlert size={26}/></span><h1>Invoice could not be verified</h1>
        <p role="alert" className="error-text">
          {state.error}
        </p>
        <Link href="/invoices/" className="button button-outline">
          <ArrowLeft size={15}/> Open invoices
        </Link>
      </main></div>
    );
  if (state.phase === "loading")
    return (
      <div className="merchant-ui checkout-empty"><header className="checkout-topbar"><Brand/><span className="merchant-mode">Testnet checkout</span></header><main className="checkout-error-card"><LoaderCircle className="spin" size={24}/><p role="status">Verifying signed payment request…</p></main></div>
    );
  return <LiveWorkspace key={state.hash} invoice={state.signed} />;
}
