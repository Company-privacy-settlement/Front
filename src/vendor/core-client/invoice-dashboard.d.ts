import { type InvoiceStatus } from './invoices.js';
import type { Policy } from './types.js';
import type { OrganizationInvoice, OrganizationInvoiceClient } from './organization-invoices.js';
export type DashboardState = InvoiceStatus['state'] | 'unchecked' | 'unavailable' | 'stale';
export type InvoiceObservation = {
    status: InvoiceStatus;
    apiOrigin: string;
    observedAt: string;
};
export type InvoiceDashboardRow = {
    record: OrganizationInvoice;
    observation: InvoiceObservation | null;
    unavailable: boolean;
};
export type InvoiceDashboardFilter = {
    search?: string;
    state?: DashboardState | 'all';
    registry?: string;
    asset?: string;
    from?: string;
    to?: string;
};
/** Complete, bounded organization snapshot. Newer concurrent creations appear on the next refresh. */
export declare function loadOrganizationInvoices(client: Pick<OrganizationInvoiceClient, 'list'>, org: string, signal: AbortSignal): Promise<OrganizationInvoice[]>;
export declare function invoiceDashboardState(row: InvoiceDashboardRow, now?: number): DashboardState;
export declare function filterInvoiceDashboard(rows: InvoiceDashboardRow[], filter: InvoiceDashboardFilter, now?: number): InvoiceDashboardRow[];
export declare function invoiceDashboardObservation(record: OrganizationInvoice, trusted: Policy, apiOrigin: string, input: unknown, now?: number): Promise<InvoiceObservation>;
/** CSV is readable business data. Prefix spreadsheet formula cells and quote every value. */
export declare function exportInvoiceDashboard(rows: InvoiceDashboardRow[], format: 'csv' | 'json', now?: number): string;
