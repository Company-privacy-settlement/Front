"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
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
      <main className="container live-content">
        <h1>Invoice could not be verified</h1>
        <p role="alert" className="error-text">
          {error}
        </p>
        <Link href="/invoices/" className="button button-outline">
          Open invoices
        </Link>
      </main>
    );
  if (!signed)
    return (
      <main className="container live-content">
        <p role="status">Verifying signed payment request…</p>
      </main>
    );
  return <LiveWorkspace invoice={signed} />;
}
