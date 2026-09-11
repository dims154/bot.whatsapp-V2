export type QueueJobStatus = "queued" | "running" | "completed" | "failed";

export interface IQueueJob {

    id: string;

    type: string;

    payload: unknown;

    createdAt: Date;

    maxAttempts?: number;

    retryDelayMs?: number;

    status?: QueueJobStatus;

    attempts?: number;

    lastError?: unknown;

    execute(): Promise<void>;

}
