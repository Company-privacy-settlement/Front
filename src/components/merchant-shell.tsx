"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowDown, ArrowUpRight, ArrowLeftRight, ChevronRight, FileCheck2, Home, Layers3, LockKeyhole, Menu, Wallet, ShieldCheck } from "lucide-react";
import { Brand, NearMark } from "./brand";

const navigation = [
  { title: "Overview", href: "/app/", icon: Home },
  { title: "Payments", href: "/app/?view=payments", icon: ArrowUpRight },
  { title: "Invoices", href: "/invoices/", icon: FileCheck2 },
  { title: "Settlements", href: "/live/", icon: ArrowLeftRight },
  { title: "Business verification", href: "/kyb/", icon: ShieldCheck },
  { title: "Vaults", href: "/app/?view=vaults", icon: Layers3 },
  { title: "Proofs & receipts", href: "/app/?view=proofs", icon: LockKeyhole },
];
function WorkspaceLinks({ section }: { section: string }) {
  return <>{navigation.map(({ title, href, icon: Icon }) => <Link key={title} href={href} aria-current={section === title ? "page" : undefined}><Icon size={17}/>{title}</Link>)}</>;
}

export function MerchantShell({ section, children }: { section: string; children: ReactNode }) {
  return <div className="merchant-ui merchant-shell">
    <aside className="merchant-sidebar">
      <Brand/>
      <div className="merchant-account"><div className="merchant-monogram"><Wallet size={18}/></div><div><strong>Core workspace</strong><span>Private payments on NEAR</span></div></div>
      <span className="merchant-nav-label">WORKSPACE</span>
      <nav aria-label="Merchant navigation"><WorkspaceLinks section={section}/></nav>
      <div className="merchant-sidebar-bottom"><div className="merchant-network"><NearMark/><div><strong>NEAR testnet</strong><span>Your wallet. Your funds.</span></div></div><Link href="/" className="merchant-back"><ArrowLeft size={15}/> Back to Core</Link><a href="https://github.com/Company-privacy-settlement/Core" target="_blank" rel="noreferrer" className="merchant-back">Developer resources <ArrowUpRight size={14}/></a></div>
    </aside>
    <div className="merchant-main">
      <header className="merchant-topbar">
        <div className="merchant-breadcrumb"><details className="merchant-mobile-menu"><summary aria-label="Open merchant navigation"><Menu size={20}/></summary><nav aria-label="Mobile merchant navigation"><WorkspaceLinks section={section}/></nav></details><span>Workspace</span><ChevronRight size={14}/><strong>{section}</strong></div>
        <span className="merchant-mode"><span className="dot"/> Testnet</span>
      </header>
      <main className="merchant-content live-content">{children}</main>
      <footer className="merchant-footer"><span><NearMark/> Built on NEAR</span><span>Development protocol · Wallet approvals required</span></footer>
    </div>
  </div>;
}

export function SettlementFrame({ checkout, summary, children }: { checkout: boolean; summary?: ReactNode; children: ReactNode }) {
  if (!checkout) return <MerchantShell section="Settlements">{children}</MerchantShell>;
  return <div className="merchant-ui checkout-page">
    <header className="checkout-topbar"><Brand/><span className="merchant-mode"><span className="dot"/> Testnet checkout</span><a href="#checkout-payment" className="checkout-continue">Continue to payment <ArrowDown size={13}/></a><Link href="/invoices/" className="checkout-back"><ArrowLeft size={14}/> Invoices</Link></header>
    <main className="checkout-layout">
      <aside className="checkout-bill"><div className="checkout-bill-inner">{summary}<div className="checkout-trust"><LockKeyhole size={14}/><span>Private settlement on NEAR. Your wallet approves every transaction.</span></div></div></aside>
      <div className="checkout-payment live-content" id="checkout-payment">{children}</div>
    </main>
    <footer className="checkout-footer"><Brand/><span>Private payments, with proof you can share.</span><Link href="/">About Core <ArrowUpRight size={12}/></Link></footer>
  </div>;
}
