import type { Call, Policy } from './types.js';
import type { SettlementGuards } from './session.js';
import type { OrganizationClient } from './organizations.js';
export type CorporateContent = {
    format: 'core-corporate-payment-v1';
    title: string;
    policy: Policy;
    payer: string;
    payment: Call;
    prerequisites: Call[];
};
export type CorporatePayload = {
    format: 'core-corporate-approval-v1';
    organizationId: string;
    paymentId: string;
    creatorAccount: string;
    creatorMembershipVersion: number;
    expiresAt: string;
    content: CorporateContent;
};
export type CorporatePayment = {
    payload: CorporatePayload;
    contentHash: string;
    state: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'dispatched' | 'invalidated';
    version: number;
    approvedBy: string | null;
    approverMembershipVersion: number | null;
    approvedAt: string | null;
    approvalValid: boolean;
    dispatches: {
        callHash: string;
        kind: 'payment' | 'prerequisite';
        createdAt: string;
    }[];
};
export declare function corporateId(value: unknown): string;
export declare function corporateContent(input: unknown): Promise<CorporateContent>;
export declare function verifyCorporatePayment(input: unknown, organizationId?: string): Promise<CorporatePayment>;
export declare function corporateQuote(content: CorporateContent): {
    principalTokens: string;
    feeTokens: string;
    maximumAttachedYoctoNear: string;
};
/** Requires an adapter supporting and awaiting beforeDispatch immediately before its provider call. */
export declare function corporateSettlementGuards(client: OrganizationClient, approved: CorporatePayment): SettlementGuards;
