'use client';
import {defaultRelayOrigin} from '@/lib/deployment';
import {useEffect,useRef,useState,type ChangeEvent} from 'react';
import Link from 'next/link';
import {ArrowUpRight,Clock3,Download} from 'lucide-react';
import {MerchantShell} from './merchant-shell';
import {parsePolicy,type Policy} from '@/vendor/core-client/index.js';
import {checkRelay,createRelayReceipt,parseRelayReceipt,parseRelayStatus,relayFetch,relayLabel,relayRequest,timingChoices,type RelayRequest,type RelayReceipt,type RelayStatus} from '@/lib/relay';
function download(receipt:RelayReceipt){const url=URL.createObjectURL(new Blob([JSON.stringify(receipt,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='core-relay-recovery.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function timestamp(n:number){return new Date(n).toLocaleString('en-US',{dateStyle:'medium',timeStyle:'medium'});}
export function RelayWorkspace(){
 const[policy,setPolicy]=useState<Policy|null>(null),[origin,setOrigin]=useState(defaultRelayOrigin),[request,setRequest]=useState<RelayRequest|null>(null),[choice,setChoice]=useState('immediate');
 const[receipt,setReceipt]=useState<RelayReceipt|null>(null),[status,setStatus]=useState<RelayStatus|null>(null),[saved,setSaved]=useState(false),[sent,setSent]=useState(false),[missing,setMissing]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[now,setNow]=useState(0);
 const lock=useRef(false),alive=useRef(true),epoch=useRef(0),pollBusy=useRef(false);
 useEffect(()=>{alive.current=true;const id=setInterval(()=>setNow(Date.now()),1000);return()=>{alive.current=false;clearInterval(id);};},[]);
 async function run(action:()=>Promise<void>){if(lock.current)return;lock.current=true;setBusy(true);setError('');setNotice('');try{await action();}catch(e){if(alive.current)setError(e instanceof Error?e.message:'Could not reach the relay. Check the saved request before sending again.');}finally{lock.current=false;if(alive.current)setBusy(false);}}
 async function file(e:ChangeEvent<HTMLInputElement>){const f=e.target.files?.[0];e.target.value='';if(!f||f.size<1||f.size>32768)throw Error('Choose a public JSON file up to 32 KB');return JSON.parse(await f.text());}
 async function refresh(r:RelayReceipt){if(!policy)return;const mine=++epoch.current;await checkRelay(r.origin,policy,r.sponsor);try{const data=await relayFetch(r.origin,'/v1/relay/requests/'+r.requestId);if(alive.current&&mine===epoch.current){setStatus(parseRelayStatus(data,r,policy));setMissing(false);}}catch(e){if(e instanceof Error&&e.message==='RELAY_NOT_FOUND'&&alive.current&&mine===epoch.current)setMissing(true);throw e;}}
 async function submitSaved(){if(!receipt||!policy)return;const mine=++epoch.current;setSent(true);setMissing(false);await checkRelay(receipt.origin,policy,receipt.sponsor);const data=await relayFetch(receipt.origin,receipt.timing?'/v1/relay/schedules':'/v1/relay/requests',receipt.timing?{request:receipt.request,timing:receipt.timing,controlToken:receipt.controlToken}:receipt.request);if(alive.current&&mine===epoch.current)setStatus(parseRelayStatus(data,receipt,policy));}
 async function command(action:'cancel'|'resume'|'reschedule'|'retry'|'reconcile'){if(!receipt||!policy||!status)return;const mine=++epoch.current;await checkRelay(receipt.origin,policy,receipt.sponsor);let body:unknown={};if(action==='retry')body={expectedAttempt:status.settlement.record?.attempt};else if(action!=='reconcile')body={controlToken:receipt.controlToken,expectedRevision:status.schedule?.revision,...(action==='reschedule'?{timing:receipt.timing}:{})};const data=await relayFetch(receipt.origin,`/v1/relay/requests/${receipt.requestId}/${action}`,body);if(alive.current&&mine===epoch.current)setStatus(parseRelayStatus(data,receipt,policy));}
 useEffect(()=>{if(!receipt||!policy||!sent||status?.settlement.complete)return;let disposed=false;const id=setInterval(()=>{if(disposed||lock.current||pollBusy.current||document.visibilityState!=='visible')return;pollBusy.current=true;void refresh(receipt).catch(()=>{/* Manual status check reports failures without repeating payment. */}).finally(()=>{pollBusy.current=false;});},10000);return()=>{disposed=true;clearInterval(id);};},[receipt,policy,sent,status?.settlement.complete]);
 const schedule=status?.schedule,started=!!status?.executions.length,waiting=schedule?.state==='waiting',mutable=!!schedule&&['waiting','blocked'].includes(schedule.state)&&!started,complete=status?.settlement.complete;
 return <MerchantShell section="Scheduled delivery">
  <div className="merchant-page-heading"><div><h1>Scheduled delivery</h1><p>Choose when your proof reaches the network. Track the original payout through final confirmation.</p></div><Link href="/docs/payments/#scheduled-delivery" className="button button-outline">Read the guide <ArrowUpRight size={14}/></Link></div>
  <div className="notes-grid relay-grid">
   <section className="panel live-card" aria-label="Delivery setup">
    <h2>Prepare your delivery</h2><p>Your relay sponsors gas and the add-on withdrawal fee. Principal stays in the vault until the contract pays the recipient.</p>
    <label className="form-label">Trusted group policy JSON<input type="file" accept=".json,application/json" disabled={busy||!!receipt} onChange={e=>void run(async()=>{setPolicy(parsePolicy(await file(e)));setRequest(null);})}/></label>
    <label className="form-label">Relay origin<input value={origin} disabled={busy||!!receipt} onChange={e=>setOrigin(e.target.value)} placeholder="https://relay.example"/></label>
    <label className="form-label">Public proof file<input type="file" accept=".json,application/json" disabled={busy||!policy||!!receipt} onChange={e=>void run(async()=>{setRequest(await relayRequest(await file(e),policy!));})}/></label>
    <p className="notes-help">Use a browser proof file or a Core relay request. Browser file checksums and destination bindings are checked here; the relay verifies the ZK proof. Private notes and keys stay on your device.</p>
    <label className="form-label">Delivery timing<select value={choice} disabled={busy||!!receipt} onChange={e=>setChoice(e.target.value)}><option value="immediate">Send immediately</option><option value="short">Spread across 30 seconds–3 minutes</option><option value="long">Spread across 5–15 minutes</option></select></label>
    <p className="notes-help">{choice==='immediate'?'Submission begins after your confirmation.':choice==='short'?'One time is sampled within your window. Unstarted delivery expires after 10 minutes.':'One time is sampled within your window. Unstarted delivery expires after 30 minutes.'} Batches contain up to 8 separate transactions. Delivery does not wait for more users.</p>
    <button className="button button-dark" disabled={busy||!request||!policy||!!receipt} onClick={()=>void run(async()=>{const sponsor=await checkRelay(origin,policy!),r=await createRelayReceipt(origin,policy!,sponsor,request!,timingChoices[choice]);if(alive.current){setReceipt(r);setSaved(false);setSent(false);}})}>Review delivery</button>
    <div className="note-restore"><h2>Recover a saved request</h2><p>Import the trusted policy first, then your receipt. Recovery checks status without sending another payment.</p><label className="form-label">Recovery receipt JSON<input type="file" accept=".json,application/json" disabled={busy||!policy||!!receipt} onChange={e=>void run(async()=>{const r=await parseRelayReceipt(await file(e),policy!);if(alive.current){setReceipt(r);setRequest(r.request);setOrigin(r.origin);setSaved(true);setSent(true);setStatus(null);setNotice('Receipt restored. Check original request to see its current state.');}})}/></label></div>
    <Link href="/prove/" className="merchant-back">Generate a local proof <ArrowUpRight size={14}/></Link>
   </section>
   <section className="panel live-card relay-summary" aria-label="Delivery review and recovery">
    <h2>{receipt?'Your delivery':'Review before sending'}</h2>
    {!receipt&&<div className="relay-empty"><Clock3 size={30}/><p>Import a proof and choose a window to review the exact recipient, amount and fee.</p></div>}
    {receipt&&policy&&<>
     <dl className="relay-facts"><dt>Recipient</dt><dd>{receipt.request.recipient}</dd><dt>Principal (atomic units)</dt><dd>{policy.denomination} {policy.tokenId??'yoctoNEAR'}</dd><dt>Protocol fee, paid in addition</dt><dd>{(BigInt(policy.denomination)*15n/10000n).toString()} atomic units · 0.15% · sponsored</dd><dt>Sponsor</dt><dd>{receipt.sponsor}</dd><dt>Delivery</dt><dd>{receipt.timing?`${receipt.timing.delayMinSeconds}–${receipt.timing.delayMaxSeconds} seconds; expires ${receipt.timing.expiresInSeconds} seconds after acceptance`:'Immediate'}</dd><dt>Request ID</dt><dd>{receipt.requestId}</dd></dl>
     <button className="button button-outline" disabled={busy} onClick={()=>{download(receipt);setSaved(true);}}><Download size={14}/> Save recovery receipt</button>
     <p className="notes-help">Keep this receipt private: it can cancel or reschedule your queued delivery. Cancellation stops this relay only; it does not revoke a proof already shared elsewhere.</p>
     {!sent&&<button className="button button-dark" disabled={busy||!saved} onClick={()=>void run(submitSaved)}>{receipt.timing?'Confirm scheduled delivery':'Confirm immediate delivery'}</button>}
     {!sent&&<button className="button button-outline" disabled={busy} onClick={()=>{setReceipt(null);setSaved(false);}}>Edit delivery</button>}
     {missing&&<button className="button button-dark" disabled={busy} onClick={()=>void run(submitSaved)}>Submit saved request</button>}
     <div className="relay-state" role="status"><strong>{sent&&!status?'Check original request':relayLabel(status)}</strong>{waiting&&<p>Execution can start {timestamp(schedule.readyAt)}. {now>=schedule.expiresAt?'Deadline passed. Check original request before recovery.':now&&now<schedule.readyAt?`${Math.ceil((schedule.readyAt-now)/1000)} seconds until eligible.`:'Eligible; waiting for the worker.'}</p>}{schedule&&<p>Unstarted delivery deadline: {timestamp(schedule.expiresAt)}</p>}{status?.waitingForReconciliation&&<p>The sponsor has an unresolved transaction. This request stays queued until it is reconciled.</p>}{schedule?.error&&<p>{schedule.error}</p>}{complete&&<p>Confirmed from the relay’s finalized, policy-checked contract read. You can verify the transaction independently.</p>}{sent&&!status&&<p>Use your saved request ID to check whether delivery was accepted. Do not create another note or resend after a timeout.</p>}</div>
     <div className="notes-actions">
      {sent&&<button className="button button-outline" disabled={busy} onClick={()=>void run(()=>refresh(receipt))}>Check original request</button>}
      {mutable&&!complete&&<button className="button button-outline" disabled={busy} onClick={()=>void run(()=>command('cancel'))}>Cancel queued delivery</button>}
      {schedule?.state==='blocked'&&!started&&!complete&&<button className="button button-dark" disabled={busy} onClick={()=>void run(()=>command('resume'))}>Resume original delivery</button>}
      {schedule&&['expired','cancelled'].includes(schedule.state)&&!started&&!complete&&<button className="button button-dark" disabled={busy||schedule.revision>=6} onClick={()=>void run(()=>command('reschedule'))}>Reschedule original delivery</button>}
      {status?.executions.some(e=>e.state!=='final')&&<button className="button button-outline" disabled={busy} onClick={()=>void run(()=>command('reconcile'))}>Reconcile original transaction</button>}
      {status?.settlement.retryAvailable&&started&&status.executions.every(e=>e.state==='final')&&<button className="button button-dark" disabled={busy} onClick={()=>void run(()=>command('retry'))}>Retry original payout</button>}
     </div>
     {status?.executions.map(e=><p className="relay-hash" key={e.sequence}>Attempt {e.sequence+1} · {e.state}<code>{e.transactionHash??'No signed transaction recorded; operator review required.'}</code></p>)}
    </>}
    <p className="notes-help relay-limit">Timing spreads submissions; it does not create independent participants or guarantee anonymity. This requires your own configured relay. The hosted frontend does not include a running relay.</p>
   </section>
  </div>
  {error&&<p className="live-error" role="alert">{error}</p>}{notice&&<p className="live-notice" role="status">{notice}</p>}{busy&&<p role="status">Checking your delivery…</p>}
 </MerchantShell>;
}
