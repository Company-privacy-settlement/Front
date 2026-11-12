import type { Call, Gateway, Policy, Preflight, Reference, Observation, TxRef, Verification } from "./types.js";
export declare class HttpGateway implements Gateway {
    readonly url: string;
    constructor(url: string);
    private request;
    policy(): Promise<Policy>;
    preflight(request: Parameters<Gateway["preflight"]>[0]): Promise<Preflight>;
    observe(reference: Reference): Promise<Observation>;
    verify(transaction: TxRef, call: Call): Promise<Verification>;
}
