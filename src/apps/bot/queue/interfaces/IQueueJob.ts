export interface IQueueJob {

    id: string;

    type: string;

    payload: unknown;

    createdAt: Date;

    execute(): Promise<void>;

}