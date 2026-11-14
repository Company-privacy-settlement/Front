import {createHash} from 'node:crypto';
import {parsePolicy,canonical} from '../src/vendor/core-client/index.js';
const read=name=>process.env['NEXT_PUBLIC_MONEY_STATION_'+name]??'';
const demoKyb=read('DEMO_KYB');
if(!['','0','1'].includes(demoKyb))throw Error('DEMO_KYB must be 0 or 1');
if(demoKyb==='1'&&process.env.MONEY_STATION_REQUIRE_DEPLOYMENT==='1')throw Error('Disable hackathon KYB before the full service release gate');
const origins=['API_ORIGIN','ORGANIZATION_ORIGIN','RELAY_ORIGIN'];
for(const key of origins){const value=read(key);if(!value)continue;const u=new URL(value);if(u.origin!==value||u.protocol!=='https:'||u.username||u.password||u.search||u.hash)throw Error(`${key} must be an exact HTTPS origin`);}
const policyJson=read('POLICY_JSON'),digest=read('POLICY_SHA256'),api=read('API_ORIGIN');
if(policyJson||digest||api){if(!policyJson||!api||!/^[a-f0-9]{64}$/.test(digest))throw Error('Configure API_ORIGIN, POLICY_JSON and independently verified POLICY_SHA256 together');const p=parsePolicy(JSON.parse(policyJson));if(p.network!=='testnet'||!p.tokenId)throw Error('Use a token settlement policy on the configured wallet network');if(createHash('sha256').update(canonical(p)).digest('hex')!==digest)throw Error('Deployment policy digest mismatch');}
if(process.env.MONEY_STATION_REQUIRE_DEPLOYMENT==='1'&&(!api||!policyJson||!read('ORGANIZATION_ORIGIN')||!read('RELAY_ORIGIN')))throw Error('Release requires payment, organization and relay HTTPS services and a pinned policy');
console.log(api?'Money Station deployment configuration verified; live readiness still requires service/chain qualification.':'Money Station frontend build: payment services unconfigured. Wallet connection is available; no service readiness is implied.');
