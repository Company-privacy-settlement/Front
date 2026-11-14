/** Browser-only public wire types. No Node crypto, filesystem, notes or signing keys. */
export type Policy = {
    network: "sandbox" | "testnet";
    registry: string;
    denomination: string;
    feeRecipient: string;
    registryWasmSha256: string;
    vaultWasmSha256: string;
    verifierSha256: string;
    tokenId?: string;
};
export type Call = {
    contract: string;
    method: string;
    args: Record<string, unknown>;
    attachedYoctoNear: string;
    gas: string;
};
export type Identity = {
    network: Policy["network"];
    accountId: string;
};
export type TxRef = {
    hash: string;
    signer: string;
};
export type Reference = {
    kind: "deposit";
    vault: string;
    commitment: string;
    expectedOwner: string;
    expectedDisclosureRoot: string;
} | {
    kind: "withdrawal";
    nullifier: string;
    expectedVault: string;
    expectedRecipient: string;
    expectedDisclosureRoot: string;
};
export type Observation = {
    state: string;
    complete: boolean;
    refunded: boolean;
    retryAvailable: boolean;
    refundAvailable: boolean;
    retryCall: Call | null;
    refundCall: Call | null;
    record: unknown;
    checkedAtBlock: {
        hash: string;
        height: number;
    };
};
export type Preflight = {
    canPrepare: boolean;
    prerequisitesSatisfied: boolean;
    prerequisites: Call[];
    blockers: {
        code: string;
        accountId: string;
    }[];
    tokenAmountRequired: string;
    payerTokenBalance: string;
    checkedAtBlock: {
        hash: string;
        height: number;
    };
};
export type Verification = {
    status: "pending";
} | {
    status: "final";
    effect: "accepted" | "not-accepted" | "unknown";
    transaction: TxRef;
};
export interface Gateway {
    policy(options?: {
        signal?: AbortSignal;
    }): Promise<Policy>;
    preflight(request: {
        operation: "deposit" | "withdraw";
        payer: string;
        vault: string;
        recipient?: string;
    }): Promise<Preflight>;
    observe(reference: Reference, options?: {
        signal?: AbortSignal;
    }): Promise<Observation>;
    verify(transaction: TxRef, call: Call): Promise<Verification>;
}
export interface WalletPort {
    supportsBeforeDispatch?: true;
    identity(): Promise<Identity>;
    sign(call: Call, context: {
        operationId: string;
        attempt: number;
        identity: Identity;
        authorize?: () => void;
        beforeDispatch?: () => Promise<void>;
    }): Promise<TxRef | void>;
}
export type Attempt = {
    kind: "prerequisite" | "payment" | "retry" | "refund";
    call: Call;
    callHash: string;
    recordHash: string;
    state: "signing" | "submitted" | "confirmed" | "observed" | "uncertain" | "not-accepted";
    transaction?: TxRef;
};
export type Operation = {
    id: string;
    policy: Policy;
    payer: string;
    payment: Call;
    reference: Reference;
    attempts: Attempt[];
    outcome: "open" | "complete" | "refunded";
    createdAt: string;
};
export interface JournalStorage {
    read(): Promise<string | null>;
    write(envelope: string): Promise<void>;
    exclusive<T>(action: () => Promise<T>): Promise<T>;
}
