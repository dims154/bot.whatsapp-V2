import { aiManager } from "../apps/bot/ai/ai.container";
import { aiConfig } from "../config/ai.config";

(async () => {

    const response = await aiManager.ask({

        messages: [

            {

                role: "system",

                content: "Kamu adalah BOT V2 Enterprise."

            },

            {

                role: "user",

                content: "Perkenalkan dirimu."

            }

        ]

    });

    console.log(response);

})();
console.log({
    keyExists: !!aiConfig.geminiKey,
    keyLength: aiConfig.geminiKey.length,
    keyPrefix: aiConfig.geminiKey.substring(0, 8)
});