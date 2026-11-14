import { type OrganizationClient } from './organizations.js';
export type PaymentWebhookEvent = {
    version: 1;
    id: string;
    type: 'invoice.payment_confirmed';
    organizationId: string;
    createdAt: string;
    producer: string;
    data: {
        invoiceRecordId: string;
        invoiceId: string;
        invoiceHash: string;
        network: 'testnet';
        registry: string;
        asset: string;
        recipient: string;
        amountTokens: string;
        nullifier: string;
        recordIndex: number;
        blockHeight: number;
        transaction: {
            hash: string;
            signer: string;
        };
        index: {
            hash: string;
            height: number;
            updatedAt: string;
        };
    };
};
export type WebhookEndpoint = {
    id: string;
    url: string;
    state: 'active' | 'paused';
    version: number;
    keyId: string;
    createdAt: string;
};
export type WebhookDelivery = {
    id: string;
    sequence: number;
    eventId: string;
    endpointId: string;
    state: 'pending' | 'sending' | 'delivered' | 'dead' | 'held';
    version: number;
    attempts: number;
    redrives: number;
    nextAttemptAt: string | null;
    lastError: string | null;
    createdAt: string;
};
export type WebhookAttempt = {
    number: number;
    startedAt: string;
    finishedAt: string | null;
    outcome: string;
    httpStatus: number | null;
    error: string | null;
};
export type WebhookHeaders = {
    'core-event-id': string;
    'core-webhook-timestamp': string;
    'core-webhook-key-id': string;
    'core-webhook-signature': string;
};
export declare function createWebhookSecret(): string;
export declare function webhookSecret(value: string): Uint8Array<ArrayBuffer>;
export declare function webhookKeyId(secret: string): Promise<string>;
export declare function webhookSigningMessage(eventId: string, timestamp: string, keyId: string, body: string): string;
/** Verify the exact raw UTF-8 body before JSON handling; receivers must atomically deduplicate event IDs. */
export declare function verifyPaymentWebhook(body: string, headers: WebhookHeaders, secrets: string[], options?: {
    now?: number;
    organizationId?: string;
}): Promise<PaymentWebhookEvent>;
export declare class OrganizationWebhookClient {
    private client;
    private base;
    constructor(client: OrganizationClient, org: string);
    endpoints(signal?: AbortSignal): Promise<{
        items: WebhookEndpoint[];
    }>;
    create(requestId: string, url: string, secret: string, signal?: AbortSignal): Promise<{
        endpoint: WebhookEndpoint;
        replayed: boolean;
    }>;
    update(endpointId: string, action: 'pause' | 'resume' | 'rotate', version: number, secret?: string, signal?: AbortSignal): Promise<WebhookEndpoint>;
    deliveries(before?: number, signal?: AbortSignal): Promise<{
        items: WebhookDelivery[];
        nextCursor: number | null;
    }>;
    delivery(deliveryId: string, signal?: AbortSignal): Promise<{
        delivery: WebhookDelivery;
        attempts: WebhookAttempt[];
        event: PaymentWebhookEvent;
    }>;
    retry(deliveryId: string, version: number, signal?: AbortSignal): Promise<WebhookDelivery>;
}
