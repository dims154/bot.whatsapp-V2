import { GoogleGenAI } from "@google/genai";

import { AIProvider } from "../AIProvider";
import { AIRequest } from "../AIRequest";
import { AIResponse } from "../AIResponse";

import { aiConfig } from "../../../../config/ai.config";

export class GeminiProvider extends AIProvider {

    readonly name = "Gemini";

    private client = new GoogleGenAI({

        apiKey: aiConfig.geminiKey

    });

    async generate(
        request: AIRequest
    ): Promise<AIResponse> {

        const prompt = request.messages
            .map(message => `${message.role}: ${message.content}`)
            .join("\n");

 const model = aiConfig.model;

console.log("Gemini Model:", model);

const response = await this.client.models.generateContent({

    model,

    contents: prompt

});

        return {

            text: response.text ?? "",

            provider: this.name,

            model: aiConfig.model

        };

    }

}