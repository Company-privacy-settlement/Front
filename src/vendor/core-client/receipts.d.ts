export declare const RECEIPT_FIELDS: readonly ["sender", "recipient", "asset", "amount", "purpose", "reference", "occurredAt", "credentialHash"];
export type ReceiptField = typeof RECEIPT_FIELDS[number];
export type ReceiptValues = Record<ReceiptField, string>;
export type Receipt = {
    version: 1;
    root: string;
    openings: {
        field: ReceiptField;
        value: string;
        salt: string;
        siblings: string[];
    }[];
};
/** Local integrity only. The expected root must come from an independent source. */
export declare function verifyReceiptDisclosure(raw: unknown, expectedRoot: string): Promise<Receipt>;
export declare function createReceipt(input: ReceiptValues): Promise<Receipt>;
export declare function discloseReceipt(raw: Receipt, fields: ReceiptField[]): Promise<Receipt>;
export declare function encryptReceiptBackup(raw: Receipt, password: string): Promise<string>;
export declare function openReceiptBackup(envelope: string, password: string): Promise<Receipt>;
