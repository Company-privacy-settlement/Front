import { OperationJournal } from "./journal.js";
import type { Attempt, Call, Gateway, Observation, Operation, Policy, Reference, TxRef, WalletPort } from "./types.js";
export type Review = {
    operationId: string;
    action: "sign" | "wait" | "reconcile" | "blocked" | "complete" | "refunded";
    message: string;
    observation: Observation;
    kind?: Attempt["kind"];
    call?: Call;
    callHash?: string;
    recordHash: string;
};
export type SettlementGuards = {
    beforeImport?: (payment: {
        payment: Call;
        reference: Reference;
    }, payer: string, operations: readonly Operation[]) => Promise<void>;
    beforeSubmit?: (operation: Operation, review: Review, operations: readonly Operation[]) => Promise<() => void>;
};
export declare class SettlementSession {
    readonly journal: OperationJournal;
    readonly gateway: Gateway;
    readonly wallet: WalletPort;
    private readonly guards;
    readonly policy: Policy;
    constructor(journal: OperationJournal, gateway: Gateway, wallet: WalletPort, policy: Policy, guards?: SettlementGuards);
    private trusted;
    private identity;
    importPlan(plan: unknown): Promise<Operation>;
    private operation;
    private next;
    review(id: string): Promise<Review>;
    submitReviewed(id: string, reviewedCallHash: string): Promise<{
        state: "submitted" | "uncertain";
        transaction: TxRef | undefined;
    }>;
    reconcile(id: string, transaction: TxRef): Promise<"not-accepted" | "confirmed" | "uncertain">;
}
