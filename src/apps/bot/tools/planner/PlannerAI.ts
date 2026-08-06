import { GoogleGenAI, Schema } from "@google/genai";

import { aiConfig } from "../../../../config/ai.config";

export class PlannerAI {

    private client = new GoogleGenAI({

        apiKey: aiConfig.geminiKey

    });

    async ask<T>(
        prompt: string,
        schema: Schema
    ): Promise<T> {

        const response =
            await this.client.models.generateContent({

                model: aiConfig.plannerModel,

                contents: prompt,

                config: {

                    responseMimeType: "application/json",

                    responseSchema: schema

                }

            });

        if (!response.text) {
            throw new Error("PlannerAI: Empty response from Gemini.");
        }

        return JSON.parse(response.text) as T;
    }

}