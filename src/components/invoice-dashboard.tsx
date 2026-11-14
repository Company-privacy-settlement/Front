"use client";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { Download, RefreshCw, Search } from 'lucide-react';
import { canonical, exportInvoiceDashboard, filterInvoiceDashboard, HttpGateway, invoiceDashboardObservation, invoiceDashboardState, invoiceLink, loadOrganizationInvoices, OrganizationApiError, OrganizationInvoiceClient, parsePolicy, verifySignedInvoice,
  type DashboardState, type InvoiceDashboardRow, type Organization, type OrganizationClient, type Policy, type SignedInvoice } from '@/vendor/core-client/index.js';

type Run=(action:(client:OrganizationClient,signal:AbortSignal,check:()=>void)=>Promise<void>,publicAction?:boolean)=>Promise<void>;
const labels:Record<DashboardState,string>={unchecked:'Unchecked',unavailable:'Unavailable',stale:'Stale index',awaiting_payment:'Awaiting payment',partial:'Partially paid',paid:'Paid',paid_late:'Paid late',overpaid:'Overpaid',expired:'Expired',partial_expired:'Partial · expired',review_required:'Needs review'};
async function read(event:ChangeEvent<HTMLInputElement>,max=8192) { const f=event.target.files?.[0];event.target.value='';if(!f||f.size>max)throw new Error('Choose a JSON file no larger than 8 KB');return JSON.parse(await f.text()); }
function wait(signal:AbortSignal) { return new Promise<void>((resolve,reject)=>{const abort=()=>{clearTimeout(timer);signal.removeEventListener('abort',abort);reject(signal.reason);};const timer=setTimeout(()=>{signal.removeEventListener('abort',abort);resolve();},1100);signal.addEventListener('abort',abort,{once:true});if(signal.aborted)abort();}); }
export function InvoiceDashboard({organization,client,accountId,disabled,run}:{organization:Organization;client:OrganizationClient;accountId:string;disabled:boolean;run:Run}) {
  const [rows,setRows]=useState<InvoiceDashboardRow[]>([]),[ready,setReady]=useState(false),[query,setQuery]=useState(''),[state,setState]=useState<DashboardState|'all'>('all');
  const [asset,setAsset]=useState(''),[registry,setRegistry]=useState(''),[from,setFrom]=useState(''),[to,setTo]=useState(''),[page,setPage]=useState(0),[now,setNow]=useState(Date.now());
  const [api,setApi]=useState('http://localhost:3001'),[policy,setPolicy]=useState<Policy|null>(null),[signed,setSigned]=useState<SignedInvoice|null>(null),[selected,setSelected]=useState<string|null>(null),[notice,setNotice]=useState(''),[checking,setChecking]=useState(false);
  const loaded=useRef(false),mounted=useRef(true),request=useRef<AbortController|null>(null);
  const canRead=organization.permissions.includes('invoices.read'),canCreate=organization.permissions.includes('invoices.create'),blocked=disabled||!ready;
  useEffect(()=>{mounted.current=true;const timer=setInterval(()=>setNow(Date.now()),30000);return()=>{mounted.current=false;request.current?.abort();clearInterval(timer);};},[]);
  const invoices=useMemo(()=>new OrganizationInvoiceClient(client,organization.id),[client,organization.id]);
  async function access(signal:AbortSignal,check:()=>void) { const current=await client.request<Organization>(`/v1/organizations/${organization.id}`,'GET',undefined,signal);check();if(!current.permissions.includes('invoices.read'))throw new OrganizationApiError(403,'PERMISSION_DENIED'); }
  async function refresh(signal:AbortSignal,check:()=>void) {
    const all=await loadOrganizationInvoices(invoices,organization.id,signal);check();setRows(all.map(record=>({record,observation:null,unavailable:false})));setSelected(null);setPage(0);setReady(true);setNotice(`${all.length} organization invoices loaded. Check payments against a trusted settlement API.`);
  }
  useEffect(()=>{if(!disabled&&!loaded.current&&canRead){loaded.current=true;void run(async(_c,s,check)=>refresh(s,check));}},[disabled]);
  useEffect(()=>{setSelected(null);},[query,state,asset,registry,from,to]);
  const invalidDates=!!from&&!!to&&from>to;
  let filtered:InvoiceDashboardRow[]=[];let filterError=invalidDates?'Start date must precede end date.':'';
  if(!filterError)try{filtered=filterInvoiceDashboard(rows,{search:query,state,asset,registry,from,to},now);}catch{filterError='Choose valid invoice date filters.';}
  const pages=Math.max(1,Math.ceil(filtered.length/20)),currentPage=Math.min(page,pages-1),visible=filtered.slice(currentPage*20,currentPage*20+20),detail=rows.find(r=>r.record.id===selected);
  const counts={paid:rows.filter(r=>['paid','paid_late'].includes(invoiceDashboardState(r,now))).length,review:rows.filter(r=>['review_required','unavailable','stale','overpaid'].includes(invoiceDashboardState(r,now))).length,unchecked:rows.filter(r=>invoiceDashboardState(r,now)==='unchecked').length};
  function resetSource() { setRows(current=>current.map(row=>({...row,observation:null,unavailable:false})));setNotice('Settlement source changed. Check payments again.'); }
  async function checkPayments() {
    if(!policy)return;const trusted=policy,eligible=rows.filter(r=>canonical(r.record.invoice.invoice.policy)===canonical(trusted)),controller=new AbortController();request.current=controller;
    await run(async(_c,parentSignal,check)=>{
      const signal=AbortSignal.any([parentSignal,controller.signal]);setChecking(true);setRows(current=>current.map(row=>eligible.some(e=>e.record.id===row.record.id)?{...row,observation:null,unavailable:false}:row));
      let checked=0,failed=0;
      try {
        const source=new HttpGateway(api.trim());
        await access(signal,check);
        if(canonical(await source.policy({signal}))!==canonical(trusted))throw new Error('Settlement API does not match your independently trusted policy');check();
        for(const row of eligible) {
          if(checked)await wait(signal);signal.throwIfAborted();
          let observation=null,unavailable=false;
          try { observation=await invoiceDashboardObservation(row.record,trusted,source.url,await source.invoiceHistory(row.record.invoice,{signal})); }
          catch(error) { signal.throwIfAborted();if(error instanceof OrganizationApiError)throw error;unavailable=true;failed++; }
          signal.throwIfAborted();check();
          // Revalidate private access before publishing each public reconciliation result.
          await access(signal,check);check();
          setRows(current=>current.map(r=>r.record.id===row.record.id?{...r,observation,unavailable}:r));checked++;setNow(Date.now());setNotice(`Checked ${checked} of ${eligible.length} invoices${failed?` · ${failed} unavailable`:''}.`);
        }
        await access(signal,check);setNotice(`Payment check complete: ${checked} invoices${failed?` · ${failed} unavailable`:''}. Finalized index history; current chain freshness is not asserted.`);
      } catch(error) {
        if(controller.signal.aborted&&!parentSignal.aborted&&mounted.current){await access(parentSignal,check);setNotice(`Payment check cancelled after ${checked} invoices. Remaining invoices stay unchecked.`);}
        else throw error;
      } finally {if(mounted.current)setChecking(false);if(request.current===controller)request.current=null;}
    });
  }
  function download(format:'csv'|'json') {
    void run(async(_c,signal,check)=>{await access(signal,check);const output=exportInvoiceDashboard(filtered,format,Date.now());check();const url=URL.createObjectURL(new Blob([output],{type:format==='csv'?'text/csv;charset=utf-8':'application/json'})),a=document.createElement('a');a.href=url;a.download=`core-invoices-${organization.id}-${new Date().toISOString().slice(0,10)}.${format}`;a.click();URL.revokeObjectURL(url);setNotice(`Exported ${filtered.length} filtered invoices. This file contains readable business details and an indexed status snapshot.`);});
  }
  if(!canRead)return <p>Your role does not include organization invoices.</p>;
  return <div className="invoice-dashboard" aria-label="Invoice payment dashboard">
    <div className="organization-section-title"><div><h2>Invoice payments</h2><p>Manage your organization’s invoices and reconcile finalized payments.</p></div><button className="button button-outline" disabled={blocked} onClick={()=>void run((_c,s,check)=>refresh(s,check))}><RefreshCw size={15}/>Refresh invoices</button></div>
    {!ready&&<p role="status">Loading organization invoices…</p>}
    <div className="invoice-dashboard-metrics"><div><span>Invoices</span><strong>{rows.length}</strong></div><div><span>Confirmed paid</span><strong>{counts.paid}</strong></div><div><span>Needs attention</span><strong>{counts.review}</strong></div><div><span>Unchecked</span><strong>{counts.unchecked}</strong></div></div>
    <details className="invoice-dashboard-source"><summary>Settlement source</summary><p>Import an independently trusted testnet policy and enter its matching Core API. Status checks send public payment references only.</p>
      <label className="form-label">Dashboard settlement API origin<input value={api} disabled={blocked} onChange={e=>{setApi(e.target.value);resetSource();}}/></label>
      <label className="form-label">Trusted dashboard policy JSON<input type="file" accept="application/json,.json" disabled={blocked} onChange={e=>{setPolicy(null);resetSource();void run(async(_c,_s,check)=>{const value=await read(e);check();const p=parsePolicy(value);if(p.network!=='testnet')throw new Error('Choose an independently trusted testnet policy');setPolicy(p);});}}/></label>
      {policy&&<p className="small-note">Selected group: {policy.registry} · {policy.tokenId??'NEAR'}</p>}
    </details>
    <div className="live-buttons"><button className="button button-dark" disabled={blocked||!policy||!rows.some(r=>canonical(r.record.invoice.invoice.policy)===canonical(policy))} onClick={()=>void checkPayments()}>Check payments</button>{checking&&<button className="button button-outline" onClick={()=>request.current?.abort()}>Cancel payment check</button>}</div>
    <p className="small-note">Checks cover all loaded invoices matching the selected policy, at most one per second. Other groups stay unchecked. Index data older than five minutes is marked stale; incomplete coverage or reused unit references need review.</p>
    {notice&&<p role="status" className="invoice-dashboard-notice">{notice}</p>}
    {canCreate&&<details className="invoice-dashboard-source"><summary>Save a signed invoice</summary><p>Download a signed request from Invoices, then save it to this organization with the same merchant account.</p><label className="form-label">Organization signed invoice JSON<input type="file" accept="application/json,.json" disabled={blocked} onChange={e=>{setSigned(null);void run(async(_c,_s,check)=>{const value=await read(e);check();const parsed=await verifySignedInvoice(value);check();if(parsed.invoice.merchantAccount!==accountId)throw new Error('Sign in as the invoice merchant to save this request');setSigned(parsed);});}}/></label>{signed&&<p>{signed.invoice.title} · {signed.invoice.reference}</p>}<button className="button button-outline" disabled={blocked||!signed} onClick={()=>void run(async(_c,s,check)=>{const result=await invoices.save(signed!.invoice.id,signed!,s);check();setSigned(null);await refresh(s,check);setNotice(result.replayed?'Invoice already saved. No duplicate was created.':'Signed invoice saved with organization encryption.');})}>Save to organization</button></details>}
    <div className="invoice-dashboard-filters">
      <label className="form-label invoice-dashboard-search"><span><Search size={15}/>Search invoices</span><input value={query} maxLength={200} disabled={blocked} placeholder="Title, reference, recipient or invoice ID" onChange={e=>{setQuery(e.target.value);setPage(0);}}/></label>
      <label className="form-label">Payment status<select value={state} disabled={blocked} onChange={e=>{setState(e.target.value as DashboardState|'all');setPage(0);}}><option value="all">All statuses</option>{Object.entries(labels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
      <label className="form-label">Invoice asset<select value={asset} disabled={blocked} onChange={e=>{setAsset(e.target.value);setPage(0);}}><option value="">All assets</option>{Array.from(new Set(rows.map(r=>r.record.invoice.invoice.policy.tokenId??'NEAR'))).map(a=><option key={a}>{a}</option>)}</select></label>
      <label className="form-label">Invoice group<select value={registry} disabled={blocked} onChange={e=>{setRegistry(e.target.value);setPage(0);}}><option value="">All groups</option>{Array.from(new Set(rows.map(r=>r.record.invoice.invoice.policy.registry))).map(a=><option key={a}>{a}</option>)}</select></label>
      <label className="form-label">Issued from<input type="date" value={from} disabled={blocked} onChange={e=>{setFrom(e.target.value);setPage(0);}}/></label><label className="form-label">Issued through<input type="date" value={to} disabled={blocked} onChange={e=>{setTo(e.target.value);setPage(0);}}/></label>
    </div>
    {filterError&&<p role="alert">{filterError}</p>}
    <div className="invoice-dashboard-results"><p>{filtered.length} of {rows.length} invoices · page {currentPage+1} of {pages}</p><div className="live-buttons"><button className="button button-outline" disabled={blocked||!filtered.length||!!filterError} onClick={()=>download('csv')}><Download size={15}/>Export CSV</button><button className="button button-outline" disabled={blocked||!filtered.length||!!filterError} onClick={()=>download('json')}>Export JSON</button></div></div>
    <p className="small-note">Exports include all filtered results across pages, with readable business details. Amounts use asset atomic units. Unchecked, unavailable and stale observations remain explicit.</p>
    <div className="organization-table-scroll"><table className="invoice-dashboard-table"><caption className="sr-only">Organization invoice payments</caption><thead><tr><th>Invoice</th><th>Recipient</th><th>Principal · atomic units</th><th>Payment status</th><th>Details</th></tr></thead><tbody>{visible.map(row=>{const r=row.record,i=r.invoice.invoice,status=invoiceDashboardState(row,now),s=row.observation?.status;return <tr key={r.id}><td><strong>{i.title}</strong><span>{i.reference}</span><time>{i.createdAt.slice(0,10)}</time></td><td>{i.recipient}</td><td>{(BigInt(i.policy.denomination)*BigInt(i.units)).toString()}<span>{i.policy.tokenId??'NEAR'}</span></td><td><strong className={`invoice-dashboard-status invoice-dashboard-status-${status}`}>{labels[status]}</strong>{s&&<span>{s.confirmedPayments} finalized payments · block {s.checkedAt.height}</span>}</td><td><button className="button button-outline" disabled={blocked} aria-label={`View invoice ${i.reference}`} onClick={()=>setSelected(r.id)}>View</button></td></tr>;})}</tbody></table></div>
    {ready&&!filtered.length&&<p>No matching organization invoices.</p>}
    <div className="live-buttons"><button className="button button-outline" disabled={blocked||currentPage===0} onClick={()=>setPage(currentPage-1)}>Previous invoice page</button><button className="button button-outline" disabled={blocked||currentPage>=pages-1} onClick={()=>setPage(currentPage+1)}>Next invoice page</button></div>
    {detail&&<section className="organization-separator invoice-dashboard-detail" aria-label="Invoice details"><div className="organization-section-title"><h3>{detail.record.invoice.invoice.title}</h3><button className="button button-outline" disabled={blocked} onClick={()=>setSelected(null)}>Close invoice details</button></div><dl className="organization-facts"><div><dt>Signed invoice ID</dt><dd>{detail.record.invoice.invoice.id}</dd></div><div><dt>Merchant</dt><dd>{detail.record.invoice.invoice.merchantAccount}</dd></div><div><dt>Group</dt><dd>{detail.record.invoice.invoice.policy.registry}</dd></div><div><dt>Expires</dt><dd>{detail.record.invoice.invoice.expiresAt}</dd></div><div><dt>Payment status</dt><dd>{labels[invoiceDashboardState(detail,now)]}</dd></div><div><dt>Index updated</dt><dd>{detail.observation?.status.checkedAt.updatedAt??'Unchecked'}</dd></div></dl>
      <a className="button button-outline" href={invoiceLink(typeof location==='undefined'?'https://checkout.invalid':location.origin,detail.record.invoice)} target="_blank" rel="noreferrer">Open signed checkout</a>
      {detail.observation&&<><p>Observed paid: {detail.observation.status.paidTokens} atomic units. Remaining at this index: {detail.observation.status.remainingTokens}. Current chain freshness is not asserted.</p><h4>Finalized confirmations</h4>{detail.observation.status.confirmations.length===0&&<p>No matching finalized payment in this indexed snapshot.</p>}{detail.observation.status.confirmations.map(c=><div className="invoice-dashboard-confirmation" key={c.nullifier}><strong>Record {c.recordIndex} · block {c.blockHeight}{c.late?' · late':''}</strong><span>Nullifier: {c.nullifier}</span><span>{c.transaction?`Transaction: ${c.transaction.hash} · signer ${c.transaction.signer}`:'Finalized contract record; transaction provenance is unavailable.'}</span></div>)}</>}
    </section>}
  </div>;
}
