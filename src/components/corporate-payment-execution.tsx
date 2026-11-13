"use client";
import { useEffect, useRef, useState } from 'react';
import { usePageHideLock } from '@/lib/page-hide-lock';
import { liveWallet } from '@/lib/wallet';
import { browserJournalStorage, canonical, corporateSettlementGuards, HttpGateway, OperationJournal, OrganizationApiError, SettlementSession,
  type CorporatePayment, type OrganizationClient, type Review } from '@/vendor/core-client/index.js';

export function CorporatePaymentExecution({payment,client,api,disabled,onAccessError,onChanged}:{payment:CorporatePayment;client:OrganizationClient;api:string;disabled:boolean;onAccessError(error:unknown):void;onChanged():Promise<void>}){
  const [password,setPassword]=useState(''),[busy,setBusy]=useState(false),[unlocked,setUnlocked]=useState(false),[review,setReview]=useState<Review|null>(null),[error,setError]=useState(''),[hash,setHash]=useState('');
  const journal=useRef<OperationJournal|null>(null),session=useRef<SettlementSession|null>(null),id=useRef(''),generation=useRef(0),pending=useRef(false),polls=useRef(0);
  function lock(){generation.current++;journal.current?.lock();journal.current=null;session.current=null;id.current='';pending.current=false;setPassword('');setUnlocked(false);setReview(null);setBusy(false);setHash('');setError('');}
  usePageHideLock(lock);
  useEffect(()=>()=>{generation.current++;journal.current?.lock();journal.current=null;session.current=null;},[]);
  async function run(action:(check:()=>void)=>Promise<void>){if(pending.current||disabled)return;pending.current=true;const mine=generation.current;setBusy(true);setError('');const check=()=>{if(mine!==generation.current)throw new DOMException('Corporate journal locked','AbortError');};
    try{await action(check);check();}catch(e){if(mine!==generation.current)return;setError(e instanceof Error?e.message:'Payment operation failed');if(e instanceof OrganizationApiError)onAccessError(e);}finally{if(mine===generation.current){pending.current=false;setBusy(false);}}
  }
  async function refresh(check:()=>void){const next=await session.current!.review(id.current);check();setReview(next);}
  async function open(create:boolean,check:()=>void){
    const content=payment.payload.content,identity=await liveWallet.identity();check();if(identity.accountId!==content.payer)throw new Error('Connect the approved creator’s fee payer wallet');
    const gateway=new HttpGateway(api);if(canonical(await gateway.policy())!==canonical(content.policy))throw new Error('Settlement API differs from the independently trusted policy');check();
    const j=new OperationJournal(browserJournalStorage(`core-live-journal-v1:${content.policy.network}:${content.policy.registry}`),password);journal.current=j;
    try{if(create)await j.create();await j.list();check();session.current=new SettlementSession(j,gateway,liveWallet,content.policy,corporateSettlementGuards(client,payment));
      // A previously imported operation is found locally for observation/recovery;
      // an already-reserved payment must not pass another new-plan import gate.
      const old=(await j.list()).find(o=>canonical(o.policy)===canonical(content.policy)&&o.payer===content.payer&&canonical(o.payment)===canonical(content.payment));check();
      const op=old??await session.current.importPlan({tokenCall:content.payment});check();id.current=op.id;setPassword('');setUnlocked(true);polls.current=0;await refresh(check);
    }catch(e){j.lock();if(journal.current===j)journal.current=null;throw e;}
  }
  useEffect(()=>{
    if(!unlocked||!review||!['wait','reconcile'].includes(review.action)||polls.current>=10)return;
    const timer=setTimeout(()=>{if(pending.current)return;polls.current++;void run(refresh);},2000);return()=>clearTimeout(timer);
  },[unlocked,review,busy]);
  return <div className="corporate-execution organization-separator" aria-label="Approved corporate execution">
    <h3>Execute the approved payment</h3><p>Each wallet call requires the current independent approval. The server reserves a call once before dispatch; a lost response must be reconciled.</p>
    {!unlocked?<><label className="form-label">Corporate journal passphrase<input type="password" autoComplete="off" value={password} disabled={busy||disabled} onChange={e=>setPassword(e.target.value)}/></label><div className="live-buttons"><button className="button button-dark" disabled={busy||disabled||password.length<12} onClick={()=>void run(check=>open(false,check))}>Unlock corporate journal</button><button className="button button-outline" disabled={busy||disabled||password.length<12} onClick={()=>void run(check=>open(true,check))}>Create corporate journal</button></div></>:<>
      <div className="live-buttons"><button className="button button-outline" onClick={lock}>Lock corporate journal</button><button className="button button-outline" disabled={busy||disabled} onClick={()=>void run(async check=>{const contents=await journal.current!.export();check();const url=URL.createObjectURL(new Blob([contents],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='core-corporate-operations.encrypted.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);})}>Export corporate journal</button><button className="button button-outline" disabled={busy||disabled} onClick={()=>{polls.current=0;void run(refresh);}}>Refresh settlement</button></div>
      {review&&<div className="corporate-execution-review" aria-live="polite"><h3>{review.message}</h3>{review.action==='complete'&&<p role="status">Corporate withdrawal confirmed by finalized contract state.</p>}{review.call&&<details open><summary>Next exact wallet call</summary><pre>{JSON.stringify(review.call,null,2)}</pre></details>}
        {review.action==='sign'&&<button className="button button-dark" disabled={busy||disabled} onClick={()=>void run(async check=>{try{await session.current!.submitReviewed(id.current,review.callHash!);check();}finally{if(session.current){await refresh(check);await onChanged();check();}}})}>Sign approved {review.kind} in wallet</button>}
        {review.action==='reconcile'&&<><label className="form-label">Existing corporate transaction hash<input value={hash} disabled={busy||disabled} onChange={e=>setHash(e.target.value)}/></label><button className="button button-outline" disabled={busy||disabled||!hash} onClick={()=>void run(async check=>{await session.current!.reconcile(id.current,{hash,signer:payment.payload.content.payer});check();await refresh(check);})}>Verify corporate transaction</button></>}
      </div>}
    </>}{error&&<p className="error-text" role="alert">{error.replaceAll('_',' ')}</p>}
  </div>;
}
