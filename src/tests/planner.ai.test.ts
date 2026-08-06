import { toolPlanner } from "../apps/bot/tools/planner/planner.container";

(async () => {

    const result = await toolPlanner.plan(

        "Hitung 250 * 90"

    );

    console.log(result);

})();