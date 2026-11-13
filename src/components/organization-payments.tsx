"use client";
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { CorporatePaymentExecution } from './corporate-payment-execution';
import { liveWallet } from '@/lib/wallet';
import { canonical, corporateContent, corporateQuote, HttpGateway, preparedPayment, parsePolicy, verifyCorporatePayment,
  type Call, type CorporatePayment, type Organization, type OrganizationClient, type Policy } from '@/vendor/core-client/index.js';

type Run = (action:(client:OrganizationClient,signal:AbortSignal,check:()=>void)=>Promise<void>,publicAction?:boolean)=>Promise<void>;
async function file(event:ChangeEvent<HTMLInputElement>){const selected=event.target.files?.[0];event.target.value='';if(!selected||selected.size>8192)throw new Error('Choose a public JSON file no larger than 8 KB');return JSON.parse(await selected.text());}
export function OrganizationPayments({organization,client,accountId,disabled,run}:{organization:Organization;client:OrganizationClient;accountId:string;disabled:boolean;run:Run}){
  const [items,setItems]=useState<CorporatePayment[]>([]),[selected,setSelected]=useState<CorporatePayment|null>(null);
  const [api,setApi]=useState('http://localhost:3001'),[policy,setPolicy]=useState<Policy|null>(null),[plan,setPlan]=useState<Call|null>(null),[title,setTitle]=useState('Supplier payment');
  const loaded=useRef(false);
  const [ready,setReady]=useState(false);const blocked=disabled||!ready;
  const can=(p:Organization['permissions'][number])=>organization.permissions.includes(p),base=`/v1/organizations/${organization.id}/payments`;
  const trusted=!!selected&&!!policy&&canonical(policy)===canonical(selected.payload.content.policy);
  async function refresh(check:()=>void,signal:AbortSignal,id=selected?.payload.paymentId){
    const raw=await client.request<{items:CorporatePayment[]}>(base,'GET',undefined,signal);
    const rows=await Promise.all(raw.items.map(p=>verifyCorporatePayment(p,organization.id)));check();setItems(rows);
    if(id){const value=await verifyCorporatePayment(await client.request(`${base}/${id}`,'GET',undefined,signal),organization.id);check();setSelected(value);}
  }
  useEffect(()=>{if(!disabled&&!loaded.current&&can('payments.read')){loaded.current=true;void run(async(_c,s,check)=>{await refresh(check,s);check();setReady(true);});}},[disabled]);
  async function verifyApi(p:Policy){if(canonical(await new HttpGateway(api).policy())!==canonical(p))throw new Error('Core API does not match your independently trusted policy');}
  function decide(action:'approve'|'reject'|'cancel'){
    if(!selected)return;const displayed=selected;
    void run(async(_c,signal,check)=>{
      const current=await verifyCorporatePayment(await client.request(`${base}/${displayed.payload.paymentId}`,'GET',undefined,signal),organization.id);check();
      if(current.contentHash!==displayed.contentHash||current.version!==displayed.version)throw new Error('Payment changed. Refresh and review it again.');
      if(action==='approve'){if(!policy||!trusted)throw new Error('Import an independently trusted policy matching this payment');await verifyApi(policy);check();}
      await client.request(`${base}/${displayed.payload.paymentId}/${action}`,'POST',{version:displayed.version,contentHash:displayed.contentHash},signal);check();await refresh(check,signal,displayed.payload.paymentId);
    });
  }
  if(!can('payments.read'))return <p>Your role does not include corporate payments.</p>;
  const content=selected?.payload.content,quote=content?corporateQuote(content):null,message=content?JSON.parse(content.payment.args.msg as string):null;
  return <div className="corporate-payments" aria-label="Corporate payments">
    <h2>Corporate payments</h2><p>Prepare a payment, have a different owner or admin approve it, then sign the exact reviewed calls with the creator’s wallet.</p>
    {!ready&&<p role="status">Loading payment requests…</p>}
    <label className="form-label">Core settlement API origin<input value={api} disabled={blocked} onChange={e=>setApi(e.target.value)}/></label>
    <label className="form-label">Trusted corporate policy JSON<input type="file" accept="application/json,.json" disabled={blocked} onChange={e=>{setPolicy(null);setPlan(null);void run(async(_c,_s,check)=>{const contents=await file(e);check();const p=parsePolicy(contents);if(p.network!=='testnet'||!p.tokenId)throw new Error('Choose a testnet FT policy');setPolicy(p);});}}/></label>
    {can('payments.create')&&<details className="corporate-create"><summary>Prepare a new payment</summary><p>Generate its proof in Local proofs or the Core CLI first. Import only the public withdrawal plan.</p>
      <label className="form-label">Corporate payment title<input value={title} maxLength={120} disabled={blocked} onChange={e=>setTitle(e.target.value)}/></label>
      <label className="form-label">Public corporate withdrawal plan<input type="file" accept="application/json,.json" disabled={blocked||!policy} onChange={e=>{setPlan(null);void run(async(_c,_s,check)=>{const input=await file(e);check();const p=await preparedPayment(input,policy!,accountId);check();if(p.reference.kind!=='withdrawal')throw new Error('Choose a withdrawal plan');setPlan(p.payment);});}}/></label>
      {plan&&<p className="small-note">Public withdrawal plan loaded. No payment has been sent.</p>}
      <button className="button button-dark" disabled={blocked||!policy||!plan||title.trim().length<2} onClick={()=>void run(async(_c,signal,check)=>{
        const identity=await liveWallet.identity();check();if(identity.accountId!==accountId)throw new Error('Reconnect the signed-in creator’s wallet');
        await verifyApi(policy!);check();const prepared=await preparedPayment({tokenCall:plan},policy!,accountId);if(prepared.reference.kind!=='withdrawal')throw new Error('Withdrawal required');
        const preflight=await new HttpGateway(api).preflight({operation:'withdraw',payer:accountId,vault:prepared.reference.expectedVault,recipient:prepared.reference.expectedRecipient});check();
        if(!preflight.canPrepare||preflight.blockers.length)throw new Error('Resolve settlement readiness before requesting approval');
        const content=await corporateContent({format:'core-corporate-payment-v1',title:title.trim(),policy,payer:accountId,payment:plan,prerequisites:preflight.prerequisites});check();
        const created=await verifyCorporatePayment(await client.request(base,'POST',content,signal),organization.id);check();setPlan(null);setSelected(created);await refresh(check,signal,created.payload.paymentId);
      })}>Request independent approval</button>
    </details>}
    <div className="organization-section-title"><h3>Payment requests</h3><button className="button button-outline" disabled={blocked} onClick={()=>void run((_c,s,check)=>refresh(check,s))}>Refresh payments</button></div>
    <div className="organization-list">{items.length===0&&<p>No payment requests.</p>}{items.map(item=><button className="corporate-request" key={item.payload.paymentId} disabled={blocked} onClick={()=>void run(async(_c,s,check)=>{const p=await verifyCorporatePayment(await client.request(`${base}/${item.payload.paymentId}`,'GET',undefined,s),organization.id);check();setSelected(p);})}><strong>{item.payload.content.title}</strong><span>{item.state} · {item.payload.creatorAccount}</span></button>)}</div>
    {selected&&content&&quote&&<section className="corporate-payment-summary organization-separator" aria-label="Reviewed corporate payment">
      <h3>{content.title}</h3><p>{selected.state==='approved'&&!selected.approvalValid?'Approval is no longer current. Review membership and prepare a replacement.':selected.state==='dispatched'?'Wallet dispatch reserved. Confirm payment through the settlement journal.':selected.state}</p>
      <dl className="organization-facts"><div><dt>Creator</dt><dd>{selected.payload.creatorAccount}</dd></div><div><dt>Independent approver</dt><dd>{selected.approvedBy??'Waiting for another owner or admin'}</dd></div><div><dt>Recipient</dt><dd>{message.recipient}</dd></div><div><dt>Token</dt><dd>{content.policy.tokenId}</dd></div><div><dt>Recipient principal · atomic units</dt><dd>{quote.principalTokens}</dd></div><div><dt>Withdrawal fee · 0.15% added</dt><dd>{quote.feeTokens}</dd></div><div><dt>Maximum attached NEAR · yoctoNEAR</dt><dd>{quote.maximumAttachedYoctoNear}</dd></div><div><dt>Payment reference</dt><dd>{message.disclosure_root}</dd></div><div><dt>Expires</dt><dd>{selected.payload.expiresAt}</dd></div><div><dt>Approved content SHA-256</dt><dd>{selected.contentHash}</dd></div></dl>
      <p>NEAR network gas is separate. Payment terms and approved prerequisite calls are read-only. To change them, cancel and prepare a new request.</p>
      <details><summary>Inspect exact policy and wallet calls</summary><pre>{JSON.stringify(content,null,2)}</pre></details>
      <div className="live-buttons">
        {selected.state==='pending'&&can('payments.approve')&&selected.payload.creatorAccount!==accountId&&<><button className="button button-dark" disabled={blocked||!trusted} onClick={()=>decide('approve')}>Approve exact payment</button><button className="button button-outline" disabled={blocked} onClick={()=>decide('reject')}>Reject payment</button></>}
        {selected.payload.creatorAccount===accountId&&selected.state==='pending'&&<p>A different owner or admin must approve your payment.</p>}
        {['pending','approved'].includes(selected.state)&&selected.dispatches.length===0&&(selected.payload.creatorAccount===accountId||can('payments.approve'))&&<button className="button button-outline" disabled={blocked} onClick={()=>decide('cancel')}>Cancel payment request</button>}
      </div>
      {trusted&&can('payments.execute')&&selected.payload.creatorAccount===accountId&&['approved','dispatched'].includes(selected.state)&&<CorporatePaymentExecution key={`${selected.payload.paymentId}:${api}:${canonical(policy)}`} payment={selected} client={client} api={api} disabled={blocked} onChanged={()=>run((_c,s,check)=>refresh(check,s,selected.payload.paymentId))} onAccessError={error=>{void run(async()=>{throw error;});}}/>}
    </section>}
  </div>;
}
