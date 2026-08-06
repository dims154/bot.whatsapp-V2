import { AIStage } from "../AIStage";
import { AIPipelineContext } from "../AIPipelineContext";

import { memory } from "../../../memory/memory.container";

export class MemoryStage implements AIStage<AIPipelineContext> {

    readonly name = "MemoryStage";

    async execute(
        context: AIPipelineContext
    ): Promise<AIPipelineContext> {

        context.history = await memory.history(context.chatId);

        return context;

    }

}
