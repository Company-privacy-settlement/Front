export type RuleKind = 'us_fica' | 'us_nec' | 'ae_vat' | 'ae_mainland_gratuity' | 'ae_adgm_gratuity';
export type RuleJurisdiction = 'US-FEDERAL' | 'AE-MAINLAND' | 'AE-ADGM';
export type RuleRelationship = 'employee' | 'contractor' | 'business';
export type RuleSource = {
    id: string;
    title: string;
    url: string;
    locator: string;
    checkedAt: string;
    documentSha256: string | null;
};
export type RuleDefinition = {
    id: string;
    kind: RuleKind;
    jurisdictions: RuleJurisdiction[];
    relationships: RuleRelationship[];
    effectiveFrom: string;
    effectiveThrough: string;
    parameters: Record<string, string | number>;
    sources: RuleSource[];
    limitations: string[];
};
export type RuleCatalog = {
    format: 'core-rule-catalog-v1';
    version: string;
    engineVersion: 'core-rules-v1';
    engineSourceSha256: string;
    sourceCheckedAt: string;
    rules: RuleDefinition[];
};
export type RuleInput = {
    format: 'core-rule-input-v1';
    jurisdiction: RuleJurisdiction;
    relationship: RuleRelationship;
    effectiveDate: string;
    currency: 'USD' | 'AED';
    facts: Record<string, string | boolean>;
};
export type RuleTrust = {
    format: 'core-rule-trust-v1';
    reviewers: {
        id: string;
        publicKey: string;
        validFrom: string;
        validThrough: string;
    }[];
    revokedReviewHashes: string[];
};
export type RuleReviewClaims = {
    format: 'core-rule-review-v1';
    catalogHash: string;
    reviewerId: string;
    ruleIds: string[];
    reviewedAt: string;
    validThrough: string;
    scope: 'component-preparation';
    rationale: string;
};
export type RuleReview = {
    claims: RuleReviewClaims;
    signature: string;
};
export type RuleStep = {
    id: string;
    label: string;
    basis: Record<string, string>;
    numerator: string;
    denominator: string;
    rounding: 'half-up-minor-unit';
    amountMinor: string;
};
export type RuleResult = {
    format: 'core-rule-result-v1';
    engineVersion: 'core-rules-v1';
    catalogVersion: string;
    catalogHash: string;
    inputHash: string;
    input: RuleInput;
    ruleId: string | null;
    mode: 'preview' | 'reviewed';
    status: 'preview_unapproved' | 'reviewed_component' | 'needs_review';
    review: {
        reviewerId: string;
        reviewHash: string;
        validThrough: string;
        artifact: RuleReview;
    } | null;
    steps: RuleStep[];
    decisions: Record<string, string | boolean>;
    sources: RuleSource[];
    limitations: string[];
    blockers: string[];
    calculatedAt: string;
    executionAuthorized: false;
    filingAccepted: false;
};
export declare function ruleCatalog(): RuleCatalog;
export declare function ruleCatalogHash(): Promise<string>;
export declare function parseRuleInput(value: unknown): RuleInput;
export declare function parseRuleTrust(value: unknown, now?: number): RuleTrust;
export declare function ruleReviewMessage(claims: RuleReviewClaims): string;
export declare function verifyRuleReview(value: unknown, trustValue: unknown, trustedPolicyHash: string, rule: RuleDefinition, now?: number): Promise<{
    reviewerId: string;
    reviewHash: string;
    validThrough: string;
    artifact: RuleReview;
}>;
/** Deterministic component preparation; never signs, changes a payment, files or invents missing classification. */
export declare function evaluateRules(value: unknown, options: {
    mode: 'preview' | 'reviewed';
    review?: unknown;
    trust?: unknown;
    trustedPolicyHash?: string;
    now?: number;
    signal?: AbortSignal;
}): Promise<RuleResult>;
export declare function exportRuleResult(result: RuleResult): string;
/** Recomputes the calculation snapshot; a separate current trust check determines approval. Input truth is not attested. */
export declare function verifyRuleResult(value: unknown, options?: {
    trust?: unknown;
    trustedPolicyHash?: string;
    now?: number;
    signal?: AbortSignal;
}): Promise<{
    integrityValid: boolean;
    reviewCurrentlyValid: boolean;
    reason: string;
}>;
export declare function ruleInputExample(jurisdiction: RuleJurisdiction, relationship: RuleRelationship): RuleInput;
