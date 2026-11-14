'use client';
import {useState} from 'react';
import {ArrowUpRight,Check,Copy,Download} from 'lucide-react';
import {deploymentReference as d,accountExplorer,transactionExplorer,blockExplorer} from '@/lib/deployment-reference';

export function DeploymentReference({section}:{section:'addresses'|'verification'|'transactions'}){
 const [copied,setCopied]=useState(''),[announcement,setAnnouncement]=useState('');
 async function copy(label:string,value:string){
  try{if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');await navigator.clipboard.writeText(value);setCopied(label);setAnnouncement('Copied '+label+'.');}
  catch{setCopied('');setAnnouncement('Copy unavailable. Select the address or hash manually.');}
 }
 const copyButton=(label:string,value:string)=><button type="button" className="docs-copy" aria-label={'Copy '+label} onClick={()=>void copy(label,value)}>{copied===label?<Check size={15}/>:<Copy size={15}/>}<span>Copy</span></button>;
 const contracts=[{...d.registry,detail:'Shared proof state, spent nullifiers and payout reservations.'},...d.vaults.map(v=>({...v,detail:'Independent principal custody. '+v.availableNotes+' available / '+v.reservedNotes+' reserved notes at this snapshot.'}))];
 const pins=[['Registry WASM SHA-256',d.policy.registryWasmSha256],['Vault WASM SHA-256',d.policy.vaultWasmSha256],['Verification key SHA-256',d.policy.verifierSha256],['Policy file SHA-256',d.policyFileSha256]];
 return <div className="docs-deployment">
  {section==='addresses'&&<>
   <p className="docs-deployment-context">NEAR testnet · native NEAR · {d.asset.denominationDisplay} per note</p>
   <div className="docs-address-list">{contracts.map(c=><div className="docs-address-card" key={c.accountId}>
    <h3>{c.label}</h3><p>{c.detail}</p>
    <div className="docs-address-value"><code>{c.accountId}</code>{copyButton(c.label+' address',c.accountId)}</div>
    <div className="docs-address-meta"><span>{c.accessKeyCount} access keys at verification</span><a href={accountExplorer(c.accountId)} target="_blank" rel="noopener noreferrer" aria-label={'View '+c.label+' in explorer'}>View in explorer <ArrowUpRight size={13}/></a></div>
   </div>)}
    <div className="docs-address-card" key={d.feeRecipient.accountId}>
     <h3>Fee recipient account</h3><p>Receives collected protocol fees. This account is not a vault or a deposit endpoint.</p>
     <div className="docs-address-value"><code>{d.feeRecipient.accountId}</code>{copyButton('fee recipient address',d.feeRecipient.accountId)}</div>
     <div className="docs-address-meta"><span>Treasury account</span><a href={accountExplorer(d.feeRecipient.accountId)} target="_blank" rel="noopener noreferrer" aria-label="View fee recipient in explorer">View in explorer <ArrowUpRight size={13}/></a></div>
    </div>
   </div>
   <div className="docs-deployment-downloads"><a href="/deployments/native-near.json" download><Download size={14}/> Download address record</a><a href="/deployments/native-policy.json" download><Download size={14}/> Download native policy</a></div>
  </>}
  {section==='verification'&&<>
   <dl className="docs-deployment-snapshot"><div><dt>Verified at</dt><dd>{d.verification.verifiedAt.replace('T',' ').replace('Z',' UTC')}</dd></div><div><dt>FINAL block</dt><dd><a href={blockExplorer(d.verification.snapshot.height)} target="_blank" rel="noopener noreferrer">{d.verification.snapshot.height.toLocaleString('en-US')} <ArrowUpRight size={12}/></a></dd></div><div><dt>Registry outputs</dt><dd>{d.state.totalOutputCount} / {d.state.capacity}</dd></div><div><dt>Outstanding notes</dt><dd>{d.state.outstandingNotes}</dd></div></dl>
   <p>This is a verified snapshot, not a live status feed. Code, verifier, fee policy, registry membership and empty contract key lists were checked at the same canonical FINAL block.</p>
   <div className="docs-deployment-pins">{pins.map(([label,value])=><div key={label}><strong>{label}</strong><div className="docs-address-value"><code>{value}</code>{copyButton(label,value)}</div></div>)}</div>
   <details className="docs-deployment-details"><summary>RPC and snapshot hash</summary><p>RPC: <code>{d.verification.rpcUrl}</code></p><div className="docs-address-value"><code>{d.verification.snapshot.hash}</code>{copyButton('snapshot hash',d.verification.snapshot.hash)}</div><p>{d.verification.assurance}</p></details>
  </>}
  {section==='transactions'&&<div className="docs-deployment-transactions">{d.transactions.map(t=><a key={t.hash} href={transactionExplorer(t.hash)} target="_blank" rel="noopener noreferrer"><strong>{t.label}<ArrowUpRight size={14}/></strong><code>{t.hash}</code></a>)}</div>}
  {announcement&&<p className="docs-copy-status" role="status">{announcement}</p>}
 </div>;
}
