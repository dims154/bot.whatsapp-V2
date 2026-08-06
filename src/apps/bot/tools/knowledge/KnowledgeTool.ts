import { Tool } from "../Tool";
import { ToolContext } from "../ToolContext";
import { ToolResult } from "../ToolResult";

import { retriever } from "../../knowledge/retriever/retriever.container";

export class KnowledgeTool
implements Tool {

    readonly definition = {

        name: "knowledge",

        description:
            "Mencari informasi dari Knowledge Base.",

        parameters: []

    };

    async execute(
        context: ToolContext
    ): Promise<ToolResult> {

        const chunks =
            await retriever.retrieve(

                context.input

            );

        return {

            success: true,

            result: chunks
                .map(

                    c => c.chunk.content

                )
                .join("\n\n")

        };

    }

}