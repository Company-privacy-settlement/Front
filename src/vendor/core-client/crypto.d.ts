export declare function canonical(value: unknown): string;
export declare function sha256(value: string): Promise<string>;
export declare function shaField(value: string): Promise<string>;
type StorageFormat = 'core-operation-journal' | 'core-invoice-library' | 'core-private-note';
export declare function seal(value: unknown, password: string, format?: StorageFormat): Promise<string>;
export declare function unseal(envelope: string, password: string, format?: StorageFormat): Promise<unknown>;
export {};
