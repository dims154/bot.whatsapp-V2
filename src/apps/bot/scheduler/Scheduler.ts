import { SchedulerJob } from "./SchedulerJob";

export class Scheduler {

    constructor(
        private job: SchedulerJob
    ) {}

    start(): NodeJS.Timeout {

        console.log(`⏰ Scheduler "${this.job.name}" started.`);

        return setInterval(async () => {

            try {

                await this.job.callback();

            } catch (error) {

                console.error(
                    `❌ Scheduler "${this.job.name}" failed.`,
                    error
                );

            }

        }, this.job.interval);

    }

}