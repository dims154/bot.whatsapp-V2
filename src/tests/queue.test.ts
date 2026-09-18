import { QueueManager } from "../apps/bot/queue/interfaces/QueueManager";
import { IQueueJob } from "../apps/bot/queue/interfaces/IQueueJob";

const queue = new QueueManager();

let retryAttempts = 0;
let failedAttempts = 0;

const jobs: IQueueJob[] = [

    {
        id: "queue-success",
        type: "TEST",
        payload: {},
        createdAt: new Date(),
        maxAttempts: 1,

        async execute() {
            console.log("✅ Success job berjalan");
        }
    },

    {
        id: "queue-retry",
        type: "TEST",
        payload: {},
        createdAt: new Date(),
        maxAttempts: 3,
        retryDelayMs: 100,

        async execute() {
            retryAttempts++;

            console.log(
                `🔄 Retry job berjalan (attempt ${retryAttempts})`
            );

            if (retryAttempts < 3) {
                throw new Error("Simulasi kegagalan retry");
            }
        }
    },

    {
        id: "queue-failed",
        type: "TEST",
        payload: {},
        createdAt: new Date(),
        maxAttempts: 2,
        retryDelayMs: 100,

        async execute() {
            failedAttempts++;

            console.log(
                `❌ Failed job berjalan (attempt ${failedAttempts})`
            );

            throw new Error("Simulasi permanent failure");
        }
    },

    {
        id: "queue-after-failure",
        type: "TEST",
        payload: {},
        createdAt: new Date(),
        maxAttempts: 1,

        async execute() {
            console.log(
                "✅ Job setelah failure berjalan"
            );
        }
    }
];

for (const job of jobs) {
    queue.add(job);
}

(async () => {

    await queue.start();

    console.log("");
    console.log("========================================");
    console.log("🔐 QUEUE SECURITY / RELIABILITY RESULT");
    console.log("========================================");

    const successJob = jobs[0];
    const retryJob = jobs[1];
    const failedJob = jobs[2];
    const afterFailureJob = jobs[3];

    console.log(
        successJob.status === "completed"
            ? "✅ Success job: PASS"
            : "❌ Success job: FAIL"
    );

    console.log(
        retryJob.status === "completed" &&
        retryJob.attempts === 3
            ? "✅ Retry + attempts: PASS"
            : "❌ Retry + attempts: FAIL"
    );

    console.log(
        failedJob.status === "failed" &&
        failedJob.attempts === 2 &&
        failedJob.lastError
            ? "✅ Failed job + lastError: PASS"
            : "❌ Failed job + lastError: FAIL"
    );

    console.log(
        afterFailureJob.status === "completed"
            ? "✅ Failure isolation: PASS"
            : "❌ Failure isolation: FAIL"
    );

    console.log("========================================");

})();