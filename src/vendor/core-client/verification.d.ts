import type { OrganizationClient } from './organizations.js';
export type VerificationState = 'draft' | 'in_review' | 'needs_information' | 'approved' | 'rejected' | 'review_required' | 'expired' | 'revoked' | 'stale';
export type VerificationSubject = {
    reference: string;
    kind: 'company' | 'individual';
    roles: string[];
    state: VerificationState;
};
export type VerificationCase = {
    id: string;
    organizationId: string;
    jurisdiction: 'US' | 'AE-ADGM' | 'AE-MAINLAND';
    environment: 'sandbox' | 'production';
    state: VerificationState;
    version: number;
    createdAt: string;
    checkedAt: string | null;
    expiresAt: string | null;
    subjects: VerificationSubject[];
};
export type DemoKybApproval = {
    mode: 'hackathon';
    state: 'approved';
    identityChecksPerformed: false;
    credentialIssued: false;
};
export type OrganizationVerification = {
    configured: boolean;
    provider: 'sumsub';
    environment: 'sandbox' | 'production' | null;
    case: VerificationCase | null;
    demo?: DemoKybApproval;
};
export declare function verificationState(c: VerificationCase, now?: number): VerificationState;
/** Private, current organization access is required. No provider key or identity document is persisted here. */
export declare class OrganizationVerificationClient {
    private client;
    private base;
    constructor(client: OrganizationClient, organizationId: string);
    get(signal?: AbortSignal): Promise<OrganizationVerification>;
    create(input: {
        requestId: string;
        jurisdiction: VerificationCase['jurisdiction'];
        acknowledged: true;
    }, signal?: AbortSignal): Promise<OrganizationVerification>;
    refresh(version: number, signal?: AbortSignal): Promise<OrganizationVerification>;
    link(version: number, signal?: AbortSignal): Promise<{
        url: string;
        expiresAt: string;
        caseId: string;
    }>;
    revoke(version: number, signal?: AbortSignal): Promise<OrganizationVerification>;
}
