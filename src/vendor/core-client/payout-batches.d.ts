import { type CorporateContent, type CorporatePayment } from './corporate-payments.js';
import type { OrganizationClient } from './organizations.js';
import type { Gateway, Observation, Policy, TxRef, WalletPort } from './types.js';
import type { OperationJournal } from './journal.js';
export type PayoutCategory = 'worker' | 'contractor';
export type PayoutManifest = {
    format: 'core-payout-manifest-v1';
    requestId: string;
    title: string;
    entries: {
        intentId: string;
        category: PayoutCategory;
        content: CorporateContent;
    }[];
};
export type PayoutPayload = {
    format: 'core-payout-batch-v1';
    organizationId: string;
    batchId: string;
    creatorAccount: string;
    creatorMembershipVersion: number;
    title: string;
    createdAt: string;
    policy: Policy;
    rows: {
        intentId: string;
        category: PayoutCategory;
        paymentId: string;
        contentHash: string;
    }[];
};
export type PayoutBatch = {
    payload: PayoutPayload;
    contentHash: string;
    payments: CorporatePayment[];
};
export declare function parsePayoutManifest(input: unknown): Promise<PayoutManifest>;
export declare function verifyPayoutBatch(input: unknown, org?: string): Promise<PayoutBatch>;
export declare class PayoutBatchClient {
    private client;
    readonly organizationId: string;
    private base;
    constructor(client: OrganizationClient, organizationId: string);
    list(signal?: AbortSignal): Promise<PayoutBatch[]>;
    get(id: string, signal?: AbortSignal): Promise<PayoutBatch>;
    stage(entry: PayoutManifest['entries'][number], signal?: AbortSignal): Promise<CorporatePayment>;
    create(input: unknown, signal?: AbortSignal, onProgress?: (done: number, total: number) => void): Promise<PayoutBatch>;
}
export declare function payoutBatchQuote(batch: PayoutBatch): {
    rows: number;
    principalTokens: string;
    quotedWithdrawalFeeTokens: string;
    maximumReviewedAttachedYoctoNear: string;
};
export type PayoutReconciliation = {
    paymentId: string;
    state: 'complete' | 'recoverable' | 'pending' | 'unobserved' | 'unavailable' | 'stale' | 'inconsistent';
    observation: Observation | null;
    lastConfirmed: Observation | null;
    checkedAt: string;
    apiOrigin: string;
};
export declare function reconcilePayoutBatch(batch: PayoutBatch, gateway: Gateway, apiOrigin: string, signal: AbortSignal, previous?: PayoutReconciliation[]): Promise<PayoutReconciliation[]>;
export declare function payoutReconciliationState(row: PayoutReconciliation, now?: number): "pending" | "complete" | "unavailable" | "stale" | "recoverable" | "unobserved" | "inconsistent";
export declare function payoutSettlementSummary(batch: PayoutBatch, rows: PayoutReconciliation[], now?: number): {
    confirmedRows: number;
    confirmedPrincipalTokens: string;
    unconfirmedPrincipalTokens: string;
    needsReview: number;
    rows: number;
    principalTokens: string;
    quotedWithdrawalFeeTokens: string;
    maximumReviewedAttachedYoctoNear: string;
};
export declare function exportPayoutSettlement(batch: PayoutBatch, rows: PayoutReconciliation[], format: 'csv' | 'json', now?: number): string;
/** One encrypted journal, independent recipient operations. Never submits an entire batch implicitly. */
export declare class PayoutBatchSession {
    private journal;
    private gateway;
    private wallet;
    private client;
    private batch;
    private sessions;
    private generation;
    constructor(journal: OperationJournal, gateway: Gateway, wallet: WalletPort, client: OrganizationClient, batch: PayoutBatch);
    lock(): void;
    private operation;
    review(paymentId: string): Promise<import("./session.js").Review>;
    submitReviewed(paymentId: string, callHash: string): Promise<{
        state: "submitted" | "uncertain";
        transaction: TxRef | undefined;
    }>;
    reconcile(paymentId: string, transaction: TxRef): Promise<"not-accepted" | "confirmed" | "uncertain">;
}
