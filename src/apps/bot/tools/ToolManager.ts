import { ToolRegistry } from "./ToolRegistry";
import { ToolResult } from "./ToolResult";

export class ToolManager {

    constructor(
        private registry: ToolRegistry
    ) {}

    async execute(
        name: string,
        input: string
    ): Promise<ToolResult> {

        const tool = this.registry.get(name);

        if (!tool) {

            return {

                success: false,

                result: "Tool tidak ditemukan."

            };

        }

        return tool.execute({

            tool: name,

            input

        });

    }

}