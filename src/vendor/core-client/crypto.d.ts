export declare function canonical(value: unknown): string;
export declare function sha256(value: string): Promise<string>;
export declare function shaField(value: string): Promise<string>;
export declare function seal(value: unknown, password: string): Promise<string>;
export declare function unseal(envelope: string, password: string): Promise<unknown>;
