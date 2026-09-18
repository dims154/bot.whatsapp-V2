import { Queue } from "./Queue";
import { IQueueJob } from "./IQueueJob";

export class QueueWorker {

    constructor(
        private queue: Queue
    ) {}

    async process(): Promise<void> {

        while (!this.queue.isEmpty()) {

            const job: IQueueJob | undefined = this.queue.next();

            if (!job) {
                continue;
            }

            const maxAttempts = Math.max(
                1,
                job.maxAttempts ?? 1
            );

            const retryDelayMs = Math.max(
                0,
                job.retryDelayMs ?? 0
            );

            job.status = "queued";
            job.attempts = job.attempts ?? 0;

            while (job.attempts < maxAttempts) {

                job.attempts += 1;
                job.status = "running";

                try {

                    await job.execute();

                    job.status = "completed";
                    job.lastError = undefined;

                    console.log(
                        `✅ Job ${job.id} selesai ` +
                        `(attempt ${job.attempts}/${maxAttempts})`
                    );

                    break;

                } catch (error) {

                    job.lastError = error;

                    const canRetry =
                        job.attempts < maxAttempts;

                    if (!canRetry) {

                        job.status = "failed";

                        console.error(
                            `❌ Job ${job.id} gagal ` +
                            `setelah ${job.attempts} attempt`,
                            error
                        );

                        break;
                    }

                    console.warn(
                        `⚠️ Job ${job.id} gagal ` +
                        `(attempt ${job.attempts}/${maxAttempts}), ` +
                        `retry dalam ${retryDelayMs}ms`,
                        error
                    );

                    if (retryDelayMs > 0) {
                        await new Promise(resolve =>
                            setTimeout(resolve, retryDelayMs)
                        );
                    }
                }
            }
        }
    }
}