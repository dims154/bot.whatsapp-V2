import { AIStage } from "../AIStage";
import { AIPipelineContext } from "../AIPipelineContext";

export class PostProcessStage implements AIStage<AIPipelineContext> {

    readonly name = "PostProcessStage";

    async execute(
        context: AIPipelineContext
    ): Promise<AIPipelineContext> {

        if (context.response) {
            context.response = context.response.trim();
        }

        return context;

    }

}