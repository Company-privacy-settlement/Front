import {publishWallet} from './wallet-state';
import type { NearConnector } from "@hot-labs/near-connect";
import type { WalletPort, TxRef, Identity } from "@/vendor/core-client/index.js";
import {
  invoiceHash,
  invoiceMessage,
  nonceBytes,
  INVOICE_SIGNING_RECIPIENT,
  verifySignedInvoice,
  type Invoice,
} from "@/vendor/core-client/index.js";
let connector: NearConnector | undefined;
let opening: Promise<NearConnector> | undefined;
export async function nearConnector():Promise<NearConnector> {
  if(connector)return connector;
  if(!opening)opening=(async()=>{
    const {NearConnector}=await import('@hot-labs/near-connect');
    const created=new NearConnector({network:'testnet',autoConnect:false,features:{testnet:true,signAndSendTransaction:true},footerBranding:{heading:'Money Station',link:'https://wallet.near.org',linkText:'Find a wallet'}});
    created.on('wallet:signIn',({accounts,success})=>{if(success&&created.network==='testnet')publishWallet(accounts[0]?.accountId??'');});
    created.on('wallet:signOut',()=>publishWallet(''));
    connector=created;return created;
  })().catch(error=>{opening=undefined;throw error;});
  return opening;
}
let connecting:Promise<Identity>|undefined;
export function connectWallet():Promise<Identity>{
  return connecting??=nearConnector().then(c=>c.connect()).then(()=>liveWallet.identity()).finally(()=>{connecting=undefined;});
}
export const liveWallet: WalletPort = {
  supportsBeforeDispatch: true,
  async identity() {
    const c = await nearConnector();
    if (c.network !== "testnet") throw new Error("Reconnect your wallet on the configured network");
    const wallet = await c.wallet(),
      accounts = await wallet.getAccounts({ network: "testnet" });
    if (!accounts[0]) throw new Error("Connect your wallet first");
    publishWallet(accounts[0].accountId);
    return { network: "testnet", accountId: accounts[0].accountId };
  },
  async sign(call, context) {
    const c = await nearConnector(),
      identity = await liveWallet.identity(),
      wallet = await c.wallet();
    if (
      identity.network !== context.identity.network ||
      identity.accountId !== context.identity.accountId
    )
      throw new Error(
        "Wallet changed after review; reconnect the reviewed payer",
      );
    await context.beforeDispatch?.();
    context.authorize?.();
    const outcome = await wallet.signAndSendTransaction({
      network: "testnet",
      signerId: identity.accountId,
      receiverId: call.contract,
      actions: [
        {
          type: "FunctionCall",
          params: {
            methodName: call.method,
            args: call.args,
            gas: call.gas,
            deposit: call.attachedYoctoNear,
          },
        },
      ],
    });
    const result = outcome as unknown as
      | { transaction?: { hash?: string; signer_id?: string } }
      | undefined;
    if (!result?.transaction?.hash) return;
    return {
      hash: result.transaction.hash,
      signer: result.transaction.signer_id ?? identity.accountId,
    } satisfies TxRef;
  },
};
export async function signInvoice(invoice: Invoice) {
  const c = await nearConnector(),
    identity = await liveWallet.identity(),
    wallet = await c.wallet();
  if (
    identity.accountId !== invoice.merchantAccount ||
    identity.network !== invoice.policy.network
  )
    throw new Error("Connect the invoice merchant on the correct network");
  if (!wallet.manifest.features.signMessage)
    throw new Error("Select a wallet that supports NEP-413 message signing");
  const signature = await wallet.signMessage({
    network: "testnet",
    signerId: identity.accountId,
    message: invoiceMessage(await invoiceHash(invoice), invoice.policy.network),
    recipient: INVOICE_SIGNING_RECIPIENT,
    nonce: nonceBytes(invoice.nonce),
  });
  return verifySignedInvoice({
    invoice,
    signature: {
      accountId: signature.accountId,
      publicKey: signature.publicKey,
      signature: signature.signature,
    },
  });
}
