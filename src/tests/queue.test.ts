import { QueueManager } from "../apps/bot/queue/interfaces/QueueManager";
import { IQueueJob } from "../apps/bot/queue/interfaces/IQueueJob";

const queue = new QueueManager();

queue.add({
    id: "1",
    type: "TEST",
    payload: {},
    createdAt: new Date(),

    async execute() {
        console.log("✅ Job 1 berjalan");
    }

} as IQueueJob);

queue.add({
    id: "2",
    type: "TEST",
    payload: {},
    createdAt: new Date(),

    async execute() {
        console.log("✅ Job 2 berjalan");
    }

} as IQueueJob);

queue.add({
    id: "3",
    type: "TEST",
    payload: {},
    createdAt: new Date(),

    async execute() {
        console.log("✅ Job 3 berjalan");
    }

} as IQueueJob);

(async () => {
    await queue.start();
})();