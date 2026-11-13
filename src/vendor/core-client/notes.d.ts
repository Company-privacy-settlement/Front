import type { Policy } from './types.js';
export type PrivateNote = {
    version: 1;
    domain: string;
    secret: string;
    nullifier: string;
    commitment: string;
};
/** BN254 Poseidon, zero initial state, matching circomlibjs 0.1.7 / the existing circuits. */
export declare function noteHash(inputs: string[]): string;
export declare function noteDomain(input: Policy): Promise<string>;
export declare function createPrivateNote(policy: Policy): Promise<PrivateNote>;
export declare function validatePrivateNote(policy: Policy, raw: unknown): Promise<PrivateNote>;
export declare function encryptNoteBackup(input: Policy, raw: PrivateNote, password: string): Promise<string>;
export declare function openNoteBackup(envelope: string, password: string, expectedPolicy?: Policy): Promise<{
    policy: Policy;
    note: PrivateNote;
}>;
