import type { NearConnector } from "@hot-labs/near-connect";
import type { WalletPort, TxRef } from "@/vendor/core-client/index.js";
let connector: NearConnector | undefined;
export async function nearConnector() {
  if (!connector) {
    const { NearConnector } = await import("@hot-labs/near-connect");
    connector = new NearConnector({
      network: "testnet",
      autoConnect: false,
      features: { testnet: true, signAndSendTransaction: true },
    });
  }
  return connector;
}
export const liveWallet: WalletPort = {
  async identity() {
    const c = await nearConnector();
    if (c.network !== "testnet") throw new Error("Select NEAR testnet");
    const wallet = await c.wallet(),
      accounts = await wallet.getAccounts({ network: "testnet" });
    if (!accounts[0]) throw new Error("Connect a testnet wallet first");
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
