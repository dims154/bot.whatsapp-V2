import { IQueueJob } from "./IQueueJob";

export class Queue {

    private jobs: IQueueJob[] = [];

    add(job: IQueueJob): void {
        this.jobs.push(job);
    }

    next(): IQueueJob | undefined {
        return this.jobs.shift();
    }

    size(): number {
        return this.jobs.length;
    }

    isEmpty(): boolean {
        return this.jobs.length === 0;
    }

}