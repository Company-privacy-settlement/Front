import type { Policy, Call } from './types.js';
export type RecipientReadiness = {
    policy: Policy;
    recipient: string;
    checkedAtBlock: {
        hash: string;
        height: number;
    };
    accountKind: 'near_implicit' | 'eth_implicit' | 'named_or_other';
    accountExists: boolean;
    tokenRegistered: boolean;
    state: 'account_missing' | 'registration_required' | 'ready';
    canReceiveTokens: boolean;
    storageMinimumYoctoNear: string;
    registrationCall: Call | null;
    activationAmountYoctoNear: null;
    gasBudgetIncluded: false;
    chainFreshnessChecked: false;
};
export declare function parseRecipientReadiness(raw: unknown, trusted: Policy, expectedRecipient: string): RecipientReadiness;
