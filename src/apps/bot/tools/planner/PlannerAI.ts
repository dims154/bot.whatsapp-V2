import { GoogleGenAI } from "@google/genai";

import { aiConfig } from "../../../../config/ai.config";

export class PlannerAI {

    private client = new GoogleGenAI({

        apiKey: aiConfig.geminiKey

    });

    async ask(
        prompt: string
    ): Promise<string> {

        const response =
            await this.client.models.generateContent({

                model: aiConfig.plannerModel,

                contents: prompt

            });

        return response.text ?? "";

    }

}