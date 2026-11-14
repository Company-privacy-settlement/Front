"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowUpRight, ChevronRight, Menu, Search, X } from 'lucide-react';
import { Brand } from './brand';
import { docs, docHref } from '@/lib/docs';
import { deploymentReference } from '@/lib/deployment-reference';

function DocsNavigation() {
  const path = usePathname();
  const [query, setQuery] = useState('');
  useEffect(() => { setQuery(''); }, [path]);
  const results = docs.filter(doc => (JSON.stringify(doc)+(doc.slug==='deployments'?JSON.stringify(deploymentReference):'')).toLowerCase().includes(query.trim().toLowerCase()));
  return <>
    <div className="docs-search"><Search size={15}/><input type="search" aria-label="Search documentation" placeholder="Search documentation" value={query} onChange={e => setQuery(e.target.value)}/>{query && <button aria-label="Clear documentation search" onClick={() => setQuery('')}><X size={14}/></button>}</div>
    <nav aria-label="Documentation">{results.map(doc => <Link href={docHref(doc.slug)} key={doc.slug} aria-current={path === docHref(doc.slug) ? 'page' : undefined}>{doc.title}<ChevronRight size={13}/></Link>)}</nav>
    {results.length === 0 && <p className="docs-no-results" role="status">No matching documentation.</p>}
    <div className="docs-source-links"><a href="https://github.com/Company-privacy-settlement/Core" target="_blank" rel="noreferrer">Protocol SDK <ArrowUpRight size={13}/></a><a href="https://github.com/Company-privacy-settlement/Contract" target="_blank" rel="noreferrer">Smart contracts <ArrowUpRight size={13}/></a></div>
  </>;
}
export function DocsShell({ children }: { children: ReactNode }) {
  const path = usePathname(), main = useRef<HTMLElement>(null), menu = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const target = location.hash ? document.getElementById(location.hash.slice(1)) : null;
    if (target && main.current?.contains(target)) target.scrollIntoView({ block: 'start' });
    else main.current?.scrollTo({ top: 0 });
    if (menu.current) menu.current.open = false;
  }, [path]);
  return <div className="docs-shell">
    <a className="docs-skip" href="#docs-content">Skip to content</a>
    <header className="docs-header"><div className="docs-header-brand"><Brand/><Link href="/docs/" className="docs-wordmark">Docs</Link></div><div className="docs-header-actions"><Link href="/" className="docs-home-link">Home</Link><Link href="/live/" className="button docs-workspace-link">Open workspace <ArrowUpRight size={14}/></Link><details className="docs-mobile-menu" ref={menu}><summary aria-label="Open documentation navigation"><Menu size={21}/></summary><div className="docs-mobile-panel"><DocsNavigation/></div></details></div></header>
    <div className="docs-layout"><aside className="docs-sidebar"><DocsNavigation/></aside><main className="docs-reading" id="docs-content" tabIndex={-1} ref={main}>{children}</main></div>
  </div>;
}
