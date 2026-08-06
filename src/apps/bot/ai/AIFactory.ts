import { AIProvider } from "./AIProvider";
import { OpenAIProvider } from "./providers/OpenAIProvider";
import { GeminiProvider } from "./providers/GeminiProvider";

export class AIFactory {

    static create(provider: string): AIProvider {

        switch (provider.toLowerCase()) {

            case "openai":
                return new OpenAIProvider();

            case "gemini":
                return new GeminiProvider();

            default:
                throw new Error(`Unknown AI Provider: ${provider}`);

        }

    }

}