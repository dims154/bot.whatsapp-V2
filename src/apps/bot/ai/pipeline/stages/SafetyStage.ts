import { AIStage } from "../AIStage";
import { AIPipelineContext } from "../AIPipelineContext";

export class SafetyStage implements AIStage<AIPipelineContext> {

    readonly name = "SafetyStage";

    private readonly maxPromptLength = 4000;

    async execute(
        context: AIPipelineContext
    ): Promise<AIPipelineContext> {

        context.prompt = context.prompt.trim();

        if (!context.prompt) {
            throw new Error("Prompt kosong.");
        }

        if (context.prompt.length > this.maxPromptLength) {
            throw new Error("Prompt terlalu panjang.");
        }

        return context;

    }

}