import { AIProvider } from "../AIProvider";
import { AIRequest } from "../AIRequest";
import { AIResponse } from "../AIResponse";

export class OpenAIProvider extends AIProvider {

    readonly name = "OpenAI";

    async generate(
        request: AIRequest
    ): Promise<AIResponse> {

        const prompt =
            request.messages
                .map(message => message.content)
                .join("\n");

        return {

            text: `[OpenAI] ${prompt}`,

            provider: this.name

        };

    }

}