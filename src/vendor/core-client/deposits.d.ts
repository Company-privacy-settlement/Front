import type { Policy, Call } from './types.js';
export type DepositRequest = {
    commitment: string;
    disclosureRoot: string;
    vault?: string;
};
export type DepositPlan = {
    policy: Policy;
    checkedAtBlock: {
        hash: string;
        height: number;
    };
    plan: {
        tokenCall: Call;
        checkedAtBlock: string;
    };
    remainingOutputs: number;
    checkedVaults: number;
    vaultScanComplete: boolean;
};
export declare function parseDepositRequest(raw: unknown): DepositRequest;
export declare function parseDepositPlan(raw: unknown, trusted: Policy, expected: DepositRequest): Promise<DepositPlan>;
