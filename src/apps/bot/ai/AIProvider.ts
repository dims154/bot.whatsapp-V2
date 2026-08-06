import { AIRequest } from "./AIRequest";
import { AIResponse } from "./AIResponse";

export abstract class AIProvider {

    abstract readonly name: string;

    abstract generate(
        request: AIRequest
    ): Promise<AIResponse>;

}