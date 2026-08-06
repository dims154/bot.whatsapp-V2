import { AIStage } from "../AIStage";
import { AIPipelineContext } from "../AIPipelineContext";

import { promptManager } from "../../../prompt/prompt.container";

export class PromptStage implements AIStage<AIPipelineContext> {

    readonly name = "PromptStage";

    async execute(
        context: AIPipelineContext
    ): Promise<AIPipelineContext> {

        context.messages = promptManager.create(

            context.history,

            context.prompt

        );

        if (context.toolResults?.length) {

            const toolText = context.toolResults

                .map(

                    (result, index) =>

                        `Tool ${index + 1}:\n${result.result}`

                )

                .join("\n\n");

            context.messages.push({

                role: "system",

                content:

`Hasil Tool:

${toolText}

Gunakan informasi di atas untuk menjawab pengguna.`

            });

        }

        return context;

    }

}