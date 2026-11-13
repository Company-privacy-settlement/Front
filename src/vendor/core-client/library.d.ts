import { type SignedInvoice } from './invoices.js';
import type { Identity, JournalStorage } from './types.js';
export type StoredInvoice = {
    hash: string;
    signed: SignedInvoice;
    savedAt: string;
};
/** Local encrypted terms only. No chain calls, payment-status cache or signing authority. */
export declare class InvoiceLibrary {
    readonly storage: JournalStorage;
    private password;
    readonly owner: Readonly<Identity>;
    private generation;
    constructor(storage: JournalStorage, password: string, owner: Identity);
    lock(): void;
    private access;
    private read;
    private decode;
    private write;
    create(): Promise<void>;
    list(): Promise<StoredInvoice[]>;
    add(raw: unknown): Promise<StoredInvoice>;
    remove(hash: string): Promise<void>;
    export(): Promise<string>;
    restore(envelope: string): Promise<void>;
    merge(envelope: string, backupPassword?: string): Promise<void>;
}
export declare function browserInvoiceLibraryStorage(owner: Identity): JournalStorage;
