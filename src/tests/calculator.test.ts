import { toolManager } from "../apps/bot/tools/tool.container";

(async () => {

    const result = await toolManager.execute(

        "calculator",

        "25 + 75"

    );

    console.log(result);

})();