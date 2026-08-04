import { Queue } from "./Queue";

export class QueueWorker {

    constructor(
        private queue: Queue
    ) {}

    async process(): Promise<void> {

        while (!this.queue.isEmpty()) {

            const job = this.queue.next();

            if (!job) {
                continue;
            }

            try {

                await job.execute();

                console.log(`✅ Job ${job.id} selesai`);

            } catch (error) {

                console.error(`❌ Job ${job.id} gagal`, error);

            }

        }

    }

}