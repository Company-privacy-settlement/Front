import type { Policy } from './types.js';
export type ApprovedGroup = {
    id: string;
    depositsEnabled: boolean;
    policy: Policy;
};
export type ApprovedGroups = {
    version: 1;
    groups: ApprovedGroup[];
};
export type GroupCapacity = {
    policy: Policy;
    checkedAtBlock: {
        hash: string;
        height: number;
    };
    capacity: 256;
    usedOutputs: number;
    remainingOutputs: number;
    outstandingNotes: number;
    depositCapacityAvailable: boolean;
    depositVaultObserved: boolean;
    checkedVaults: number;
    vaultScanComplete: boolean;
    chainFreshnessChecked: false;
};
/** Approvals remain client-held; API origins and private-note fields are rejected. */
export declare function parseApprovedGroups(input: unknown): ApprovedGroups;
export declare function parseGroupCapacity(input: unknown, trusted: Policy): GroupCapacity;
