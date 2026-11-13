import { type PrivateNote } from './notes.js';
import { type SignedInvoice, type InvoiceStatus } from './invoices.js';
import { type BrowserProver, type ProofBundle, type ProvingAssets, type ProvingContext, type ProverStage } from './prover.js';
import type { SettlementGuards } from './session.js';
import type { Operation, Policy, Reference } from './types.js';
export interface InvoicePaymentGateway {
    invoiceStatus(invoice: SignedInvoice, options?: {
        signal?: AbortSignal;
    }): Promise<InvoiceStatus>;
    provingContext(policy: Policy, vault: string, options?: {
        signal?: AbortSignal;
    }): Promise<ProvingContext>;
}
/** Cryptographic invoice/selected-unit binding for a locally verified proof. */
export declare function matchInvoiceProof(raw: ProofBundle, input: SignedInvoice, paymentIndex: number, payer: string): Promise<{
    bundle: ProofBundle;
    prepared: {
        payment: import("./types.js").Call;
        reference: Reference;
    };
    root: string;
}>;
/** No journal writes or wallet calls: note → public snapshot → local proof. */
export declare function prepareInvoiceProof(prover: Pick<BrowserProver, 'prove'>, gateway: InvoicePaymentGateway, input: SignedInvoice, paymentIndex: number, rawNote: PrivateNote, assets: ProvingAssets, vault: string, options?: {
    signal?: AbortSignal;
    onProgress?: (stage: ProverStage) => void;
    getOperations?: () => Promise<readonly Operation[]>;
}): Promise<import("./prover.js").ProverResult>;
/** Install on the settlement session so imports and every signature share the gates. */
export declare function invoiceSettlementGuards(gateway: Pick<InvoicePaymentGateway, 'invoiceStatus'>, input: SignedInvoice): SettlementGuards;
