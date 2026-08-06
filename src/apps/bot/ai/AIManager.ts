import { AIService } from "./AIService";
import { AIFactory } from "./AIFactory";
import { AIRequest } from "./AIRequest";
import { AIResponse } from "./AIResponse";
import { aiConfig } from "../../../config/ai.config";

export class AIManager {

    private service: AIService;

    constructor() {

        this.service = new AIService(
            AIFactory.create(aiConfig.provider)
        );

    }

    async ask(
        request: AIRequest
    ): Promise<AIResponse> {

        return this.service.generate(request);

    }

}