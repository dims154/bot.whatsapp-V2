import { QueueManager } from "../apps/bot/queue/interfaces/QueueManager";
import { IQueueJob } from "../apps/bot/queue/interfaces/IQueueJob";

const queue = new QueueManager();

let executionCount = 0;

const job: IQueueJob = {
    id: "duplicate-test-1",
    type: "TEST",
    payload: {},
    createdAt: new Date(),
    maxAttempts: 1,

    async execute() {
        executionCount++;
        console.log(`✅ Job dieksekusi: ${executionCount}x`);
    }
};

queue.add(job);
queue.add(job);

(async () => {

    await queue.start();

    console.log("");
    console.log("========================================");
    console.log("🔐 DUPLICATE JOB TEST");
    console.log("========================================");

    if (executionCount === 1) {
        console.log("✅ Duplicate protection: PASS");
    } else {
        console.log(
            `❌ Duplicate protection: FAIL (${executionCount}x)`
        );
    }

    console.log("========================================");

})();