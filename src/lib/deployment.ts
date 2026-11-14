import {canonical,parsePolicy,sha256,type Policy} from '../vendor/core-client/index.js';
export type DeploymentInput={apiOrigin?:string;organizationOrigin?:string;relayOrigin?:string;policyJson?:string;policySha256?:string};
export const deploymentInput:DeploymentInput={apiOrigin:process.env.NEXT_PUBLIC_MONEY_STATION_API_ORIGIN,organizationOrigin:process.env.NEXT_PUBLIC_MONEY_STATION_ORGANIZATION_ORIGIN,relayOrigin:process.env.NEXT_PUBLIC_MONEY_STATION_RELAY_ORIGIN,policyJson:process.env.NEXT_PUBLIC_MONEY_STATION_POLICY_JSON,policySha256:process.env.NEXT_PUBLIC_MONEY_STATION_POLICY_SHA256};
export function configuredOrigin(value:string|undefined){if(!value)return '';const u=new URL(value);if(u.origin!==value||u.protocol!=='https:'||u.username||u.password||u.search||u.hash)throw Error('Service origins must be exact HTTPS origins');return u.origin;}
export async function verifyDeployment(input:DeploymentInput=deploymentInput):Promise<{apiOrigin:string;organizationOrigin:string;relayOrigin:string;policy:Policy|null}>{
 const apiOrigin=configuredOrigin(input.apiOrigin),organizationOrigin=configuredOrigin(input.organizationOrigin),relayOrigin=configuredOrigin(input.relayOrigin);
 const any=!!(apiOrigin||input.policyJson||input.policySha256);if(!any)return{apiOrigin,organizationOrigin,relayOrigin,policy:null};
 if(!apiOrigin||!input.policyJson||!input.policySha256||!/^[a-f0-9]{64}$/.test(input.policySha256))throw Error('Configure the payment service and an independently pinned policy together');
 const policy=parsePolicy(JSON.parse(input.policyJson));if(policy.network!=='testnet'||!policy.tokenId)throw Error('The deployment must use a token settlement group on the configured network');
 if(await sha256(canonical(policy))!==input.policySha256)throw Error('Deployment policy digest mismatch');
 return{apiOrigin,organizationOrigin,relayOrigin,policy};
}
export const defaultApiOrigin=deploymentInput.apiOrigin??'';
export const defaultOrganizationOrigin=deploymentInput.organizationOrigin??'';
export const defaultRelayOrigin=deploymentInput.relayOrigin??'';
