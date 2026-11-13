import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { docs, docHref, type Doc } from '@/lib/docs';
import { Network } from './network';

export function DocsArticle({ doc }: { doc: Doc }) {
  const position = docs.findIndex(d => d.slug === doc.slug), previous = docs[position - 1], next = docs[position + 1];
  const organizationGuide = doc.slug === 'organizations';
  return <div className="docs-reader-grid"><article className="docs-article">
    <h1>{doc.title}</h1><p className="docs-description">{doc.description}</p>
    {doc.slug === '' && <div className="docs-topic-grid">{docs.slice(1).map(topic => <Link href={docHref(topic.slug)} key={topic.slug}><strong>{topic.title}<ArrowUpRight size={15}/></strong><span>{topic.description}</span></Link>)}</div>}
    {doc.sections.map(section => <section className="docs-section" id={section.id} key={section.id}>
      <h2><a href={'#' + section.id}>{section.title}</a></h2>
      {section.paragraphs?.map(p => <p key={p}>{p}</p>)}
      {section.diagram && <Network/>}
      {section.bullets && <ul>{section.bullets.map(item => <li key={item}>{item}</li>)}</ul>}
      {section.steps && <ol>{section.steps.map(item => <li key={item}>{item}</li>)}</ol>}
      {section.table && <div className="docs-table-scroll" tabIndex={0} role="region" aria-label={section.title + ' table'}><table><thead><tr>{section.table.headings.map(h => <th scope="col" key={h}>{h}</th>)}</tr></thead><tbody>{section.table.rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>}
      {section.code && <div className="docs-code"><div>{section.code.label}</div><pre tabIndex={0}><code>{section.code.text}</code></pre></div>}
    </section>)}
    <div className="docs-guide-source"><a href={doc.source} target="_blank" rel="noreferrer">View the source guide <ArrowUpRight size={14}/></a><span>Documentation describes the current development implementation.</span></div>
    <nav className="docs-page-links" aria-label="Previous and next documentation">{previous ? <Link href={docHref(previous.slug)}><small><ArrowLeft size={13}/> Previous</small><strong>{previous.title}</strong></Link> : <span/>}{next && <Link href={docHref(next.slug)}><small>Next <ArrowRight size={13}/></small><strong>{next.title}</strong></Link>}</nav>
  </article><aside className="docs-toc"><nav aria-label="On this page"><strong>On this page</strong>{doc.sections.map(section => <a href={'#' + section.id} key={section.id}>{section.title}</a>)}</nav><Link href={organizationGuide ? '/organization/' : '/invoices/'} className="docs-toc-cta">{organizationGuide ? 'Manage organization' : 'Create an invoice'} <ArrowUpRight size={13}/></Link></aside></div>;
}
