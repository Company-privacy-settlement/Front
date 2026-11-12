import { OperationJournal } from "./journal.js";
import type { Attempt, Call, Gateway, Observation, Operation, Policy, TxRef, WalletPort } from "./types.js";
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
export declare class SettlementSession {
    readonly journal: OperationJournal;
    readonly gateway: Gateway;
    readonly wallet: WalletPort;
    readonly policy: Policy;
    constructor(journal: OperationJournal, gateway: Gateway, wallet: WalletPort, policy: Policy);
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
