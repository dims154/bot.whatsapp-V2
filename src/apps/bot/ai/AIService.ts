import { AIProvider } from "./AIProvider";
import { AIRequest } from "./AIRequest";
import { AIResponse } from "./AIResponse";

export class AIService {

    constructor(
        private provider: AIProvider
    ) {}

    async generate(
        request: AIRequest
    ): Promise<AIResponse> {

        return this.provider.generate(request);

    }

}