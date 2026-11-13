import type { JournalStorage, Operation, TxRef } from "./types.js";
export declare function transactionRef(input: unknown): TxRef;
/** Every mutation reloads the encrypted source while holding the storage's cross-context lock. */
export declare class OperationJournal {
    readonly storage: JournalStorage;
    private password;
    constructor(storage: JournalStorage, password: string);
    lock(): void;
    private read;
    create(): Promise<void>;
    list(): Promise<Operation[]>;
    export(): Promise<string>;
    restore(envelope: string): Promise<void>;
    update<T>(fn: (operations: Operation[], persist: () => Promise<void>) => Promise<T>): Promise<T>;
}
/** Refuse concurrent tabs and unsupported lock APIs; never fall back to an unsafe read/write race. */
export declare function browserJournalStorage(key?: string, label?: string): JournalStorage;
