import { toolPlanner } from "../apps/bot/tools/planner/planner.container";

(async () => {

    const plan = await toolPlanner.plan(
        "Jam berapa sekarang?"
    );

    console.log(plan);

})();