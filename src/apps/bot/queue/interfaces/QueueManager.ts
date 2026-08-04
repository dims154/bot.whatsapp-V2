import { Queue } from "./Queue";
import { QueueWorker } from "./QueueWorker";
import { IQueueJob } from "./IQueueJob";

export class QueueManager {

    private readonly queue = new Queue();
    private readonly worker = new QueueWorker(this.queue);

    add(job: IQueueJob): void {
        this.queue.add(job);
    }

    async start(): Promise<void> {
        await this.worker.process();
    }

}