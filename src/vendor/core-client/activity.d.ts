import type { Policy } from "./types.js";
export declare const activityKinds: readonly ["deposit", "transfer", "withdrawal_requested", "withdrawal_failed", "withdrawal_retried", "withdrawal_succeeded"];
export type ActivityKind = (typeof activityKinds)[number];
export type ActivityFilters = {
    kind?: ActivityKind;
    vault?: string;
    recipient?: string;
    nullifier?: string;
    commitment?: string;
};
type Block = {
    hash: string;
    height: number;
};
export type IndexStatus = {
    enabled: true;
    policy: Policy;
    checkpoint: {
        block: Block;
        nextIndex: number;
        sourceRecordCount: number;
        updatedAt: string;
    } | null;
    indexedRecords: number;
    linkedRecords: number;
    remainingRecords: number | null;
    candidates: Record<string, number>;
    discovery?: {
        enabled: boolean;
        state: {
            startHeight: number;
            lastComplete: Block | null;
            current: {
                block: Block;
                offset: number;
                total: number;
            } | null;
            scannedTransactions: number;
            candidatesFound: number;
            updatedAt: string;
            blocked: string | null;
        } | null;
    };
    chainFreshnessChecked: false;
    scope: "configured_registry_records";
    claims: {
        completeBusinessHistory: false;
        taxFilingAccepted: false;
    };
};
export type IndexedRecord = {
    index: number;
    kind: ActivityKind;
    commitment: string | null;
    nullifier: string | null;
    vault: string | null;
    recipient: string | null;
    disclosure_root: string;
    block_height: number;
    timestamp_ns: string;
    amount: string;
    asset_token_id: string | null;
    protocol_fee_charged: string;
    protocol_fee_earned: string;
    storage_fee_charged: string;
};
export type IndexedActivity = {
    record: IndexedRecord;
    observedAt: Block;
    provenance: {
        transaction: {
            hash: string;
            signer: string;
        };
        outerOutcome: "succeeded" | "failed";
        receipts: {
            id: string;
            blockHash: string;
        }[];
        verifiedAt: Block;
    } | null;
};
export type ActivityPage = {
    items: IndexedActivity[];
    nextCursor: string | null;
    snapshot: {
        upperExclusive: number;
    };
    index: IndexStatus;
    scope: "configured_registry_records";
};
export declare function parseIndexStatus(input: unknown, policy: Policy): IndexStatus;
export declare function parseActivityPage(input: unknown, policy: Policy): ActivityPage;
export {};
