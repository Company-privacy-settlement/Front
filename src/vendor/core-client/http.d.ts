import { type DepositRequest } from './deposits.js';
import { type SignedInvoice, type InvoiceStatus } from "./invoices.js";
import { type ActivityFilters } from "./activity.js";
import type { Call, Gateway, Policy, Preflight, Reference, Observation, TxRef, Verification } from "./types.js";
export declare class HttpGateway implements Gateway {
    readonly url: string;
    constructor(url: string);
    private request;
    policy(): Promise<Policy>;
    preflight(request: Parameters<Gateway["preflight"]>[0]): Promise<Preflight>;
    observe(reference: Reference): Promise<Observation>;
    verify(transaction: TxRef, call: Call): Promise<Verification>;
    private trusted;
    groupCapacity(policy: Policy, options?: {
        signal?: AbortSignal;
    }): Promise<import("./groups.js").GroupCapacity>;
    recipientReadiness(policy: Policy, recipient: string, options?: {
        signal?: AbortSignal;
    }): Promise<import("./recipients.js").RecipientReadiness>;
    prepareDeposit(policy: Policy, request: DepositRequest, options?: {
        signal?: AbortSignal;
    }): Promise<import("./deposits.js").DepositPlan>;
    provingContext(policy: Policy, vault: string, options?: {
        signal?: AbortSignal;
    }): Promise<import("./prover.js").ProvingContext>;
    verifyInvoice(input: SignedInvoice): Promise<SignedInvoice>;
    invoiceStatus(input: SignedInvoice): Promise<InvoiceStatus>;
    indexStatus(policy: Policy): Promise<import("./activity.js").IndexStatus>;
    activity(policy: Policy, query?: ActivityFilters & {
        limit?: number;
        cursor?: string;
    }): Promise<import("./activity.js").ActivityPage>;
}
export declare class CoreApiError extends Error {
    readonly status: number;
    readonly code?: string | undefined;
    readonly retryAfterSeconds?: number | undefined;
    constructor(status: number, code?: string | undefined, retryAfterSeconds?: number | undefined);
}
