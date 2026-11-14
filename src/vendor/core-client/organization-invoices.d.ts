import type { SignedInvoice } from './invoices.js';
import type { OrganizationClient } from './organizations.js';
export type OrganizationInvoice = {
    id: string;
    organizationId: string;
    sequence: number;
    createdAt: string;
    createdBy: string;
    invoice: SignedInvoice;
};
export type OrganizationInvoicePage = {
    items: OrganizationInvoice[];
    nextCursor: number | null;
};
export type OrganizationInvoiceResult = {
    invoice: OrganizationInvoice;
    replayed: boolean;
};
/** Authenticated transport; no credentials or decrypted invoice terms are persisted. */
export declare class OrganizationInvoiceClient {
    private client;
    private organizationId;
    constructor(client: OrganizationClient, organizationId: string);
    private path;
    save(requestId: string, invoice: SignedInvoice, signal?: AbortSignal): Promise<OrganizationInvoiceResult>;
    get(invoiceId: string, signal?: AbortSignal): Promise<OrganizationInvoice>;
    list(before?: number, signal?: AbortSignal): Promise<OrganizationInvoicePage>;
}
