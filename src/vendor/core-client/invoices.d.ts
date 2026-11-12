import type { Policy } from "./types.js";
export declare const INVOICE_SIGNING_RECIPIENT = "core.invoice.v1";
type InvoiceTerms = {
    id: string;
    merchantAccount: string;
    recipient: string;
    title: string;
    reference: string;
    policy: Policy;
    units: number;
    createdAt: string;
    expiresAt: string;
    nonce: string;
};
export type Invoice = InvoiceTerms & ({
    version: 1;
} | {
    version: 2;
    paymentNonces: string[];
});
export type InvoiceSignature = {
    accountId: string;
    publicKey: string;
    signature: string;
};
export type SignedInvoice = {
    invoice: Invoice;
    signature: InvoiceSignature;
};
export type InvoiceProof = {
    invoiceHash: string;
    merchantAccount: string;
    nonce: string;
    publicKey: string;
    signature: string;
};
export type InvoiceState = "awaiting_payment" | "partial" | "paid" | "paid_late" | "overpaid" | "expired" | "partial_expired" | "review_required";
export type InvoiceStatus = {
    invoiceHash: string;
    settlementRoot: string | null;
    settlementRoots?: string[];
    reusedPaymentReferences?: number;
    state: InvoiceState;
    expectedTokens: string;
    paidTokens: string;
    remainingTokens: string;
    overpaidTokens: string;
    lateTokens: string;
    confirmedPayments: number;
    coverageLimited: boolean;
    checkedAt: {
        hash: string;
        height: number;
        updatedAt: string;
    };
    chainFreshnessChecked: false;
    confirmations: {
        settlementRoot?: string;
        recordIndex: number;
        nullifier: string;
        blockHeight: number;
        late: boolean;
        transaction: {
            hash: string;
            signer: string;
        } | null;
    }[];
};
export declare function parseInvoice(input: unknown): Invoice;
export declare function createInvoice(input: Omit<InvoiceTerms, "id" | "nonce">): Invoice;
export declare function parseSignedInvoice(input: unknown): SignedInvoice;
export declare function invoiceHash(invoice: Invoice): Promise<string>;
export declare function invoiceRootsFromHash(hash: string, nonces: unknown): Promise<string[]>;
export declare function invoicePaymentRoots(invoice: Invoice): Promise<string[]>;
export declare function invoiceRoot(invoice: Invoice, paymentIndex?: number): Promise<string>;
export declare function invoiceStatusRequest(invoice: Invoice): Promise<{
    version?: 2 | undefined;
    paymentNonces?: string[] | undefined;
    invoiceHash: string;
    recipient: string;
    units: number;
    expiresAt: string;
}>;
export declare function assertInvoiceReferenceAvailable(invoice: Invoice, root: string, status: InvoiceStatus): Promise<void>;
export declare function invoiceMessage(hash: string, network: Policy["network"]): string;
export declare function nonceBytes(nonce: string): Uint8Array<ArrayBuffer>;
export declare function invoiceSigningDigest(hash: string, network: Policy["network"], nonce: string): Promise<Uint8Array<ArrayBuffer>>;
export declare function verifyInvoiceProofSignature(proof: InvoiceProof, network: Policy["network"]): Promise<boolean>;
export declare function invoiceProof(input: SignedInvoice): Promise<InvoiceProof>;
export declare function verifySignedInvoice(input: unknown): Promise<SignedInvoice>;
export declare function invoiceQuote(invoice: Invoice): {
    principalTokens: string;
    withdrawalFeeTokens: string;
    units: number;
    storageYoctoNearPerAttempt: string;
};
export declare function requireOpenInvoice(invoice: Invoice, now?: number): void;
export declare function matchInvoicePlan(input: unknown, invoice: Invoice, payer: string): Promise<{
    payment: import("./types.js").Call;
    reference: import("./types.js").Reference;
}>;
export declare function invoiceLink(origin: string, signed: SignedInvoice): string;
export declare function invoiceFromFragment(fragment: string): SignedInvoice;
export declare function validateInvoiceStatus(input: unknown, invoice: Invoice): InvoiceStatus;
export {};
