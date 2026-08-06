import { AIStage } from "../AIStage";
import { AIPipelineContext } from "../AIPipelineContext";

export class LoggerStage implements AIStage<AIPipelineContext> {

    readonly name = "LoggerStage";

    async execute(
        context: AIPipelineContext
    ): Promise<AIPipelineContext> {

        console.log("[LoggerStage] AI pipeline result:", {
            chatId: context.chatId,
            prompt: context.prompt,
            persona: context.persona,
            response: context.response
        });

        return context;

    }

}
