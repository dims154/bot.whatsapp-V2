import { toolManager } from "../apps/bot/tools/tool.container";

(async () => {

    const result = await toolManager.execute(
        "time",
        ""
    );

    console.log(result);

})();