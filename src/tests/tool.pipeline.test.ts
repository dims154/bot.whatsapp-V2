import { aiPipeline } from "../apps/bot/ai/pipeline/pipeline.container";

(async () => {

    const result = await aiPipeline.run({

        chatId: "123",

        prompt: "Jam berapa sekarang?",

        history: "",

        persona: "",

        messages: []

    });

    console.log(result.toolResults);

})();