import { GoogleGenAI } from "@google/genai";

import { aiConfig } from "../../../../config/ai.config";

import { EmbeddingProvider } from "./EmbeddingProvider";

export class GeminiEmbeddingProvider
implements EmbeddingProvider {

    private client = new GoogleGenAI({

        apiKey: aiConfig.geminiKey

    });

    async embed(
        text: string
    ): Promise<number[]> {

        const response =
            await this.client.models.embedContent({

                model: "gemini-embedding-001",

                contents: text

            });

        return response.embeddings?.[0]?.values ?? [];

    }

}