export type WalletState={accountId:string};
const empty:WalletState={accountId:''};let state=empty;const listeners=new Set<()=>void>();
export function publishWallet(accountId:string){if(accountId&&!/^[a-z0-9]+(?:[-_.][a-z0-9]+)*$/.test(accountId))return;if(state.accountId===accountId)return;state={accountId};for(const listener of listeners)listener();}
export const subscribeWallet=(listener:()=>void)=>{listeners.add(listener);return()=>{listeners.delete(listener);};};
export const walletSnapshot=()=>state;
export const walletServerSnapshot=()=>empty;
