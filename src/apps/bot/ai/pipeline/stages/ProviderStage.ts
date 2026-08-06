import { AIStage } from "../AIStage";
import { AIPipelineContext } from "../AIPipelineContext";

import { aiManager } from "../../ai.container";

export class ProviderStage implements AIStage<AIPipelineContext> {

    readonly name = "ProviderStage";

    async execute(
        context: AIPipelineContext
    ): Promise<AIPipelineContext> {

        const response = await aiManager.ask({
            messages: context.messages
        });

        context.response = response.text;

        return context;

    }

}