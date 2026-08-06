import { ToolStage } from "../apps/bot/ai/pipeline/stages/ToolStage";

async function main() {

    const stage = new ToolStage();

    const context = {

        chatId: "test",

        prompt: "Hitung 250 * 90",

        history: "",

        messages: [],

        persona: "test"

    };

    const result = await stage.execute(context);

    console.log("========== RESULT ==========");

    console.log(result.toolResults);

}

main();