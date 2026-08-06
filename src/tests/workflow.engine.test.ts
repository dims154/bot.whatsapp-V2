import { workflowEngine } from "../apps/bot/workflow/engine/engine.container";

async function main() {

    const result =
        await workflowEngine.runPrompt(
            "Hitung 250 * 90 lalu tambahkan 100"
        );

    console.log(result);

}

main();