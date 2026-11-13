import { type PrivateNote } from './notes.js';
import type { Call, Policy } from './types.js';
export type ProvingContext = {
    version: 1;
    policy: Policy;
    checkedAtBlock: {
        hash: string;
        height: number;
    };
    root: string;
    commitments: string[];
    vault: string;
};
export type ProvingAction = {
    recipient: string;
    disclosureRoot: string;
};
export type ProvingAssets = {
    manifest: Blob;
    wasm: Blob;
    zkey: Blob;
    verificationKey: Blob;
    manifestSha256: string;
};
export type ProvingRequest = {
    policy: Policy;
    note: PrivateNote;
    context: ProvingContext;
    action: ProvingAction;
};
export type SpendProof = {
    proof: string;
    public_inputs: string[];
};
export type ProofBundle = {
    format: 'core-browser-proof';
    version: 1;
    policy: Policy;
    action: ProvingAction & {
        vault: string;
    };
    checkedAtBlock: ProvingContext['checkedAtBlock'];
    artifactManifestSha256: string;
    setup: string;
    spend: SpendProof;
    plan: {
        tokenCall: Call;
        checkedAtBlock: string;
    };
    digest: string;
};
export type ProverStage = 'assets' | 'tree' | 'witness' | 'proving' | 'verifying';
export type ProverResult = {
    bundle: ProofBundle;
    metrics: {
        elapsedMs: number;
        witnessMs: number;
        provingMs: number;
        verificationMs: number;
    };
};
export declare function parseProvingAction(input: unknown, policy: Policy): ProvingAction;
export declare function parseProvingContext(input: unknown, expected: Policy): ProvingContext;
/** Rebuild all eight levels locally; neither the API nor an imported path supplies a witness. */
export declare function spendWitness(request: ProvingRequest): Promise<{
    input: {
        root: string;
        contextHash: string;
        domain: string;
        secret: string;
        nullifier: string;
        siblings: string[];
        pathIndices: number[];
    };
    publicInputs: string[];
}>;
export declare function verifyProvingAssets(assets: ProvingAssets, expected: Policy): Promise<{
    wasm: Uint8Array<ArrayBuffer>;
    zkey: Uint8Array<ArrayBuffer>;
    verificationKey: Record<string, unknown>;
    setup: string;
}>;
export declare function encodeVerificationKeyBytes(key: Record<string, unknown>): Uint8Array<ArrayBuffer>;
export declare function encodeBrowserProof(input: unknown): string;
export declare function decodeBrowserProof(spend: SpendProof): {
    protocol: string;
    curve: string;
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
};
export declare function createProofBundle(request: ProvingRequest, assets: {
    manifestSha256: string;
    setup: string;
}, raw: SpendProof): Promise<ProofBundle>;
/** A checksum detects file edits; Groth16 verification remains mandatory in the worker. */
export declare function parseProofBundle(raw: unknown, expected: Policy): Promise<ProofBundle>;
export declare class BrowserProver {
    private readonly worker;
    constructor(worker: () => Worker);
    prove(request: ProvingRequest, assets: ProvingAssets, options?: {
        signal?: AbortSignal;
        onProgress?: (stage: ProverStage) => void;
        timeoutMs?: number;
    }): Promise<ProverResult>;
    verify(bundle: ProofBundle, policy: Policy, assets: ProvingAssets, options?: {
        signal?: AbortSignal;
        onProgress?: (stage: ProverStage) => void;
        timeoutMs?: number;
    }): Promise<ProverResult>;
    private run;
}
