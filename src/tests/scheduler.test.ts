import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SchedulerManager } from "../apps/bot/scheduler/SchedulerManager";
import { SchedulerJob } from "../apps/bot/scheduler/SchedulerJob";

describe("SchedulerManager", () => {
  it("runs registered job and stops cleanly", async () => {
    const manager = new SchedulerManager();
    let ticks = 0;

    manager.register(
      new SchedulerJob("heartbeat", 100, async () => {
        ticks += 1;
      })
    );

    await new Promise((resolve) => setTimeout(resolve, 350));

    manager.stop("heartbeat");
    const ticksAfterStop = ticks;

    await new Promise((resolve) => setTimeout(resolve, 250));

    assert.ok(ticksAfterStop >= 2, `expected >= 2 ticks before stop, got ${ticksAfterStop}`);
    assert.equal(ticks, ticksAfterStop, "ticks must not increase after stop");
  });

  it("stopAll clears all jobs", async () => {
    const manager = new SchedulerManager();
    let a = 0;
    let b = 0;

    manager.register(new SchedulerJob("a", 100, () => { a += 1; }));
    manager.register(new SchedulerJob("b", 100, () => { b += 1; }));

    await new Promise((resolve) => setTimeout(resolve, 250));
    manager.stopAll();

    const aAfter = a;
    const bAfter = b;

    await new Promise((resolve) => setTimeout(resolve, 250));

    assert.ok(aAfter >= 1);
    assert.ok(bAfter >= 1);
    assert.equal(a, aAfter);
    assert.equal(b, bAfter);
  });
});