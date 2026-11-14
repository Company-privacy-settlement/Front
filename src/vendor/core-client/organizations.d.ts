export declare const ORGANIZATION_ROLES: readonly ["owner", "admin", "operator", "viewer", "auditor"];
export type OrganizationRole = typeof ORGANIZATION_ROLES[number];
export declare const ORGANIZATION_PERMISSIONS: readonly ["organization.read", "organization.update", "members.read", "members.manage", "invitations.manage", "audit.read", "ownership.transfer", "payments.read", "payments.create", "payments.approve", "payments.execute", "invoices.read", "invoices.create", "webhooks.read", "webhooks.manage"];
export type OrganizationPermission = typeof ORGANIZATION_PERMISSIONS[number];
export declare const ORGANIZATION_ROLE_PERMISSIONS: Readonly<Record<OrganizationRole, readonly OrganizationPermission[]>>;
export type Organization = {
    id: string;
    name: string;
    ownerAccount: string;
    version: number;
    membershipVersion: number;
    createdAt: string;
    role: OrganizationRole;
    permissions: OrganizationPermission[];
    claims: {
        kybVerified: false;
        walletSigningAuthorityGranted: false;
    };
};
export type OrganizationMember = {
    accountId: string;
    role: OrganizationRole;
    status: 'active' | 'revoked';
    version: number;
    joinedAt: string;
};
export type OrganizationInvitation = {
    id: string;
    organizationId: string;
    organizationName: string;
    accountId: string;
    role: Exclude<OrganizationRole, 'owner'>;
    status: 'pending' | 'accepted' | 'revoked' | 'declined' | 'expired';
    version: number;
    expiresAt: string;
    createdAt: string;
    createdBy: string;
};
export type OrganizationAudit = {
    sequence: number;
    actor: string;
    action: string;
    target: string;
    detail: Record<string, unknown>;
    occurredAt: string;
};
export type OrganizationChallenge = {
    id: string;
    accountId: string;
    network: 'testnet';
    audience: string;
    origin: string;
    nonce: string;
    expiresAt: string;
    recipient: string;
    message: string;
};
export type OrganizationSession = {
    accountId: string;
    token: string;
    expiresAt: string;
};
export declare function organizationOrigin(value: string): string;
export declare function organizationLoginMessage(c: Pick<OrganizationChallenge, 'accountId' | 'audience' | 'origin' | 'expiresAt'>): string;
export declare function parseOrganizationChallenge(value: unknown, accountId: string, audience: string, origin: string, now?: number): OrganizationChallenge;
/** NEP-413 payload, without a callback URL. Distinct from invoice signing. */
export declare function organizationSigningDigest(c: OrganizationChallenge): Promise<Uint8Array<ArrayBuffer>>;
export declare class OrganizationApiError extends Error {
    readonly status: number;
    readonly code: string;
    constructor(status: number, code: string);
}
/** Sessions are supplied explicitly; this client never persists credentials. */
export declare class OrganizationClient {
    private token?;
    readonly origin: string;
    constructor(origin: string, token?: string | undefined);
    request<T>(path: string, method?: string, body?: unknown, signal?: AbortSignal): Promise<T>;
}
