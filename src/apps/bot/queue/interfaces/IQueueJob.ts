export type QueueJobStatus =
    | "queued"
    | "running"
    | "completed"
    | "failed";

export interface IQueueJob {

    id: string;

    type: string;

    payload: unknown;

    createdAt: Date;

    /**
     * Maximum number of execution attempts,
     * including the first attempt.
     */
    maxAttempts?: number;

    /**
     * Delay between failed attempts in milliseconds.
     */
    retryDelayMs?: number;

    /**
     * Current execution status.
     */
    status?: QueueJobStatus;

    /**
     * Number of execution attempts.
     */
    attempts?: number;

    /**
     * Last error thrown by the job.
     */
    lastError?: unknown;

    execute(): Promise<void>;

}