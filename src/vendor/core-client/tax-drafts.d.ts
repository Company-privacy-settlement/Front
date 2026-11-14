import { type RuleResult } from './rules.js';
import { type Receipt, type ReceiptField } from './receipts.js';
import type { OrganizationClient } from './organizations.js';
export type DraftKind = 'summary' | 'calculation' | 'evidence' | 'procedure' | 'open_items';
export type DraftEvidence = {
    id: string;
    label: string;
    expectedRoot: string;
    disclosure: Receipt;
    bindings: {
        field: ReceiptField;
        fact: string;
    }[];
};
export type DraftBasisInput = {
    report: RuleResult;
    evidence: DraftEvidence[];
};
export type DraftStatement = {
    id: string;
    kind: DraftKind;
    text: string;
    citations: string[];
    required: boolean;
};
export type DraftCitation = {
    id: string;
    kind: 'rule_report' | 'official_source' | 'receipt_declaration' | 'internal_workflow';
    title: string;
    reference: string;
    hash: string | null;
    assurance: string;
};
export type DraftBasis = {
    format: 'core-tax-draft-basis-v1';
    reportHash: string;
    groundingHash: string;
    ruleCurrentlyAccepted: boolean;
    policyHash: string | null;
    statements: DraftStatement[];
    citations: DraftCitation[];
    unboundFacts: string[];
};
export type DraftPlan = {
    sections: {
        kind: DraftKind;
        statementIds: string[];
    }[];
};
export type DraftPayload = {
    format: 'core-tax-draft-v1';
    organizationId: string;
    id: string;
    familyId: string;
    parentId: string | null;
    creatorAccount: string;
    creatorMembershipVersion: number;
    createdAt: string;
    title: string;
    basisInput: DraftBasisInput;
    basis: DraftBasis;
    plan: DraftPlan;
    producer: {
        kind: 'outline' | 'openai';
        model: string | null;
        responseId: string | null;
    };
};
export type DraftState = 'draft' | 'in_review' | 'changes_requested' | 'approved' | 'rejected' | 'withdrawn' | 'invalidated';
export type TaxDraft = {
    payload: DraftPayload;
    contentHash: string;
    state: DraftState;
    version: number;
    isCurrent: boolean;
    approvalValid: boolean;
    approvalBlockers: string[];
    approvedBy: string | null;
    approvalExpiresAt: string | null;
    reviews: {
        action: string;
        actor: string;
        at: string;
        comment: string;
    }[];
};
export type DraftRequest = {
    requestId: string;
    title: string;
    mode: 'outline' | 'ai';
    basisInput: DraftBasisInput;
};
export type DraftGeneration = {
    state: 'generating' | 'complete' | 'failed' | 'abandoned';
    version: number;
    draftId: string | null;
};
export declare const DRAFT_KINDS: readonly DraftKind[];
export declare function draftText(v: unknown, min?: number, max?: number): string;
export declare function draftBasis(input: unknown, options?: {
    trust?: unknown;
    trustedPolicyHash?: string;
    now?: number;
    signal?: AbortSignal;
}): Promise<{
    input: DraftBasisInput;
    basis: DraftBasis;
}>;
export declare function outlineDraftPlan(basis: DraftBasis): DraftPlan;
export declare function validateDraftPlan(input: unknown, basis: DraftBasis): DraftPlan;
export declare function draftModelMaterial(basis: DraftBasis, ruleId: string | null): {
    ruleId: string | null;
    sections: DraftKind[];
    items: {
        id: string;
        kind: DraftKind;
        required: boolean;
    }[];
};
export declare function renderTaxDraft(payload: DraftPayload): {
    kind: DraftKind;
    paragraphs: DraftStatement[];
}[];
export declare function verifyTaxDraft(input: unknown, organizationId?: string): Promise<TaxDraft>;
export declare function exportTaxDraft(draft: TaxDraft, format: 'json' | 'markdown'): string;
export declare class OrganizationTaxDraftClient {
    private client;
    readonly organizationId: string;
    private base;
    constructor(client: OrganizationClient, organizationId: string);
    list(signal?: AbortSignal): Promise<{
        aiConfigured: boolean;
        rulePolicyConfigured: boolean;
        activeGeneration: {
            requestId: string;
            creator: string;
            version: number;
            createdAt: string;
        } | null;
        items: TaxDraft[];
    }>;
    get(id: string, signal?: AbortSignal): Promise<TaxDraft>;
    create(value: DraftRequest, parent?: {
        id: string;
        version: number;
        contentHash: string;
    }, signal?: AbortSignal): Promise<TaxDraft>;
    decide(id: string, action: 'submit' | 'approve' | 'changes_requested' | 'reject' | 'withdraw', value: {
        version: number;
        contentHash: string;
        comment: string;
        basisReviewed?: true;
        evidenceReviewed?: true;
        scopeAcknowledged?: true;
    }, signal?: AbortSignal): Promise<TaxDraft>;
    generation(requestId: string, signal?: AbortSignal): Promise<DraftGeneration>;
    abandon(requestId: string, version: number, signal?: AbortSignal): Promise<DraftGeneration>;
}
