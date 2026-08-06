import { Scheduler } from "./Scheduler";
import { SchedulerJob } from "./SchedulerJob";

export class SchedulerManager {

    private schedulers = new Map<string, NodeJS.Timeout>();

    register(job: SchedulerJob): void {

        const scheduler = new Scheduler(job);

        const timer = scheduler.start();

        this.schedulers.set(job.name, timer);

    }

    stop(name: string): void {

        const timer = this.schedulers.get(name);

        if (!timer) return;

        clearInterval(timer);

        this.schedulers.delete(name);

    }

    stopAll(): void {

        this.schedulers.forEach(clearInterval);

        this.schedulers.clear();

    }

}