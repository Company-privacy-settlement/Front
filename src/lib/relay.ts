import {canonical,sha256,parsePolicy,parseProofBundle,type Policy} from '../vendor/core-client/index.js';
export type RelayRequest={format:'core-relay-withdrawal-v1';policyHash:string;vault:string;recipient:string;disclosureRoot:string;spend:{proof:string;public_inputs:string[]}};
export type Timing={delayMinSeconds:number;delayMaxSeconds:number;expiresInSeconds:number};
export const timingChoices:Record<string,Timing|null>={immediate:null,short:{delayMinSeconds:30,delayMaxSeconds:180,expiresInSeconds:600},long:{delayMinSeconds:300,delayMaxSeconds:900,expiresInSeconds:1800}};
export type RelayReceipt={format:'core-relay-receipt-v1';origin:string;sponsor:string;policyHash:string;requestId:string;request:RelayRequest;timing:Timing|null;controlToken:string;digest:string};
export type RelayStatus={id:string;principal:string;assetTokenId:string|null;schedule:null|{requestId:string;revision:number;state:'waiting'|'blocked'|'cancelled'|'expired'|'executing';createdAt:number;readyAt:number;expiresAt:number;error:string|null};waitingForReconciliation:boolean;executions:{sequence:number;state:string;transactionHash:string|null}[];settlement:{state:string;complete:boolean;retryAvailable:boolean;record:null|{attempt:number;vault:string;recipient:string;disclosure_root:string}}};
const hex=/^[a-f0-9]{64}$/,account=/^[a-z0-9]+(?:[-_.][a-z0-9]+)*$/;
function obj(v:unknown):Record<string,any>{if(!v||typeof v!=='object'||Array.isArray(v))throw Error('Expected public JSON object');return v as Record<string,any>;}
function exact(v:Record<string,any>,keys:string[]){if(Object.keys(v).sort().join('|')!==keys.sort().join('|'))throw Error('Unexpected fields; import public proof data only');}
function acct(v:unknown):string{if(typeof v!=='string'||v.length<2||v.length>64||!account.test(v))throw Error('Invalid account');return v;}
export function relayOrigin(value:string){const u=new URL(value);if(u.origin!==value||u.username||u.password||u.search||u.hash||(u.protocol!=='https:'&&!(u.protocol==='http:'&&['localhost','127.0.0.1'].includes(u.hostname))))throw Error('Use an exact HTTPS relay origin, or HTTP localhost');return u.origin;}
async function fieldHash(value:string){return (BigInt('0x'+await sha256(value))&((1n<<253n)-1n)).toString();}
export async function relayRequest(raw:unknown,trusted:Policy):Promise<RelayRequest>{
 const policy=parsePolicy(trusted);let r=obj(raw);
 if(r.format==='core-browser-proof'){const b=await parseProofBundle(r,policy);r={format:'core-relay-withdrawal-v1',policyHash:await sha256(canonical(policy)),vault:b.action.vault,recipient:b.action.recipient,disclosureRoot:b.action.disclosureRoot,spend:b.spend};}
 exact(r,['format','policyHash','vault','recipient','disclosureRoot','spend']);const spend=obj(r.spend);exact(spend,['proof','public_inputs']);
 if(r.format!=='core-relay-withdrawal-v1'||r.policyHash!==await sha256(canonical(policy))||!hex.test(r.disclosureRoot)||typeof spend.proof!=='string'||spend.proof.length!==344)throw Error('Proof policy or format mismatch');
 try{if(atob(spend.proof).length!==256||btoa(atob(spend.proof))!==spend.proof)throw Error();}catch{throw Error('Invalid proof encoding');}
 if(!Array.isArray(spend.public_inputs)||spend.public_inputs.length!==5||spend.public_inputs.some((s:unknown)=>typeof s!=='string'||!/^(0|[1-9][0-9]{0,76})$/.test(s)||BigInt(s)>=21888242871839275222246405745257275088548364400416034343698204186575808495617n))throw Error('Invalid proof inputs');
 const vault=acct(r.vault),recipient=acct(r.recipient);if(!vault.endsWith('.'+policy.registry)||recipient===policy.registry||recipient.endsWith('.'+policy.registry))throw Error('Invalid withdrawal destination');
 const domain=await fieldHash(policy.tokenId?`core:ft:v3|${policy.network}|${policy.registry}|${policy.tokenId}|${policy.denomination}`:`core:v2|${policy.network}|${policy.registry}|${policy.denomination}`);
 const context=await fieldHash(`${policy.tokenId?'core:action:ft:v3':'core:action:v2'}|${domain}|withdraw|${vault}|${recipient}|${r.disclosureRoot}`);
 if(spend.public_inputs[4]!==domain||spend.public_inputs[3]!==context)throw Error('Proof does not bind this recipient and group');
 return r as RelayRequest;
}
export async function relayFetch(origin:string,path:string,body?:unknown){
 const response=await fetch(relayOrigin(origin)+path,{method:body===undefined?'GET':'POST',credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',headers:body===undefined?{}:{'content-type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(20000)});
 const text=await response.text();if(text.length>65536)throw Error('Relay response too large');let value;try{value=JSON.parse(text);}catch{throw Error('Relay response unavailable. Check the saved request before sending again.');}
 if(!response.ok)throw Error(/^RELAY_[A-Z_]+$/.test(value.error)?value.error:'Relay request failed. Check the saved request before sending again.');return value;
}
export async function checkRelay(origin:string,policy:Policy,sponsor?:string){const c=obj(await relayFetch(origin,'/v1/relay/config'));if(c.policyHash!==await sha256(canonical(policy))||canonical(parsePolicy(c.policy))!==canonical(policy)||(sponsor&&c.sponsor!==sponsor))throw Error('Relay policy or sponsor changed');acct(c.sponsor);if(!c.scheduling||c.scheduling.maxBatchSize!==8)throw Error('Relay does not support scheduled delivery');return c.sponsor as string;}
export async function createRelayReceipt(origin:string,policy:Policy,sponsor:string,request:RelayRequest,timing:Timing|null):Promise<RelayReceipt>{const data={format:'core-relay-receipt-v1' as const,origin:relayOrigin(origin),sponsor:acct(sponsor),policyHash:await sha256(canonical(policy)),requestId:await sha256(canonical(request)),request,timing,controlToken:[...crypto.getRandomValues(new Uint8Array(32))].map(b=>b.toString(16).padStart(2,'0')).join('')};return{...data,digest:await sha256(canonical(data))};}
export async function parseRelayReceipt(raw:unknown,policy:Policy){const v=obj(raw);exact(v,['format','origin','sponsor','policyHash','requestId','request','timing','controlToken','digest']);const{digest,...data}=v;
 if(v.format!=='core-relay-receipt-v1'||!hex.test(v.controlToken)||digest!==await sha256(canonical(data)))throw Error('Recovery receipt integrity failed');relayOrigin(v.origin);acct(v.sponsor);const r=await relayRequest(v.request,policy);
 if(v.policyHash!==r.policyHash||v.requestId!==await sha256(canonical(r))||!Object.values(timingChoices).some(t=>canonical(t)===canonical(v.timing)))throw Error('Recovery receipt policy or timing mismatch');return v as RelayReceipt;
}
export function parseRelayStatus(raw:unknown,receipt:RelayReceipt,policy:Policy):RelayStatus{const s=obj(raw);
 if(s.id!==receipt.requestId||s.principal!==policy.denomination||s.assetTokenId!==(policy.tokenId??null)||typeof s.waitingForReconciliation!=='boolean'||!Array.isArray(s.executions))throw Error('Relay status differs from this request');
 const settlement=obj(s.settlement);if(typeof settlement.complete!=='boolean'||typeof settlement.retryAvailable!=='boolean'||!['NotFound','Pending','Retryable','Complete'].includes(settlement.state))throw Error('Invalid finalized settlement status');
 if(settlement.complete&&!settlement.record)throw Error('Confirmed payout requires a finalized record');
 if(settlement.complete!==(settlement.state==='Complete')||(settlement.retryAvailable&&!['Pending','Retryable'].includes(settlement.state)))throw Error('Inconsistent settlement status');
 if(settlement.record){const r=obj(settlement.record);if(r.vault!==receipt.request.vault||r.recipient!==receipt.request.recipient||r.disclosure_root!==receipt.request.disclosureRoot||!Number.isSafeInteger(r.attempt)||r.attempt<1)throw Error('Settlement destination changed');}
 if(s.schedule){const q=obj(s.schedule);if(q.requestId!==s.id||!Number.isSafeInteger(q.revision)||q.revision<1||!['waiting','blocked','cancelled','expired','executing'].includes(q.state)||![q.createdAt,q.readyAt,q.expiresAt].every(Number.isSafeInteger)||q.createdAt>q.readyAt||q.readyAt>=q.expiresAt)throw Error('Invalid schedule status');}
 for(const e of s.executions)if(!Number.isSafeInteger(e.sequence)||e.sequence<0||!['preparing','intent','submitted','uncertain','final'].includes(e.state)||(e.transactionHash!==null&&!/^[1-9A-HJ-NP-Za-km-z]{32,64}$/.test(e.transactionHash)))throw Error('Invalid execution status');return s as RelayStatus;
}
export function relayLabel(s:RelayStatus|null){if(!s)return 'Ready to submit';if(s.settlement.complete)return 'Payment confirmed';if(s.executions.some(e=>e.state!=='final'))return 'Check original transaction';if(s.settlement.retryAvailable)return 'Payout recovery available';if(s.waitingForReconciliation)return 'Waiting for sponsor reconciliation';if(s.schedule?.state==='waiting')return 'Waiting for execution window';if(s.schedule?.state==='expired')return 'Delivery window expired';if(s.schedule?.state==='cancelled')return 'Delivery cancelled';if(s.schedule?.state==='blocked')return 'Action required';return 'Awaiting finalized payout';}
