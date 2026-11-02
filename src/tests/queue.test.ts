import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { QueueManager } from "../apps/bot/queue/interfaces/QueueManager";
import { IQueueJob } from "../apps/bot/queue/interfaces/IQueueJob";

describe("QueueManager", () => {
  it("accepts jobs and start resolves without hanging the process", async () => {
    const queue = new QueueManager();
    const executed: string[] = [];

    const makeJob = (id: string): IQueueJob =>
      ({
        id,
        type: "TEST",
        payload: {},
        createdAt: new Date(),
        async execute() {
          executed.push(id);
        },
      }) as IQueueJob;

    queue.add(makeJob("1"));
    queue.add(makeJob("2"));
    queue.add(makeJob("3"));

    // Timeout guard: jika start() tidak pernah selesai, test gagal (bukan hang selamanya)
    const startPromise = queue.start();
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("QueueManager.start() timed out after 3s")), 3000)
    );

    await Promise.race([startPromise, timeoutPromise]);

    assert.deepEqual(executed, ["1", "2", "3"]);
  });
});