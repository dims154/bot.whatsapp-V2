import { IQueueJob } from "./IQueueJob";

export class Queue {

    private jobs: IQueueJob[] = [];
    private jobIds = new Set<string>();

    add(job: IQueueJob): void {

        if (this.jobIds.has(job.id)) {
            console.warn(
                `⚠️ Job ${job.id} sudah ada di queue, dilewati.`
            );
            return;
        }

        this.jobs.push(job);
        this.jobIds.add(job.id);
    }

    next(): IQueueJob | undefined {

        const job = this.jobs.shift();

        if (job) {
            this.jobIds.delete(job.id);
        }

        return job;
    }

    size(): number {
        return this.jobs.length;
    }

    isEmpty(): boolean {
        return this.jobs.length === 0;
    }

}