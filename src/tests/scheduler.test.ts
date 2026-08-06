import { SchedulerManager } from "../apps/bot/scheduler/SchedulerManager";
import { SchedulerJob } from "../apps/bot/scheduler/SchedulerJob";

const manager = new SchedulerManager();

manager.register(
    new SchedulerJob(

        "heartbeat",

        2000,

        async () => {

            console.log(
                "❤️ Heartbeat",
                new Date().toLocaleTimeString()
            );

        }

    )
);