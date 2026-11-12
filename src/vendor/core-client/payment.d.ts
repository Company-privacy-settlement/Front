import type { Call, Policy, Reference } from "./types.js";
export declare const GAS = "300000000000000", STORAGE = 20000000000000000000000n, BOND = 5000000000000000000000n;
export declare function object(value: unknown): Record<string, unknown>;
export declare function account(value: unknown): string;
export declare function scalar(value: unknown): string;
export declare function parsePolicy(input: unknown): Policy;
export declare function parseCall(input: unknown): Call;
export declare function feeQuote(policy: Policy): {
    principalTokens: string;
    feeTokens: string;
    depositTokens: string;
    storageYoctoNear: string;
};
/** Accept an existing Core CLI FT plan. Ignore its display quote; derive every destination and amount. */
export declare function preparedPayment(input: unknown, policyInput: Policy, payerInput: string): Promise<{
    payment: Call;
    reference: Reference;
}>;
export declare function validatePrerequisite(input: unknown, policy: Policy, payer: string, ref: Reference): Call;
export declare function validateRecovery(input: unknown, policy: Policy, ref: Reference): Call;
