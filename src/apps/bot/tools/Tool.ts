import type { ToolDefinition } from "./ToolDefinition";
import type { ToolContext } from "./ToolContext";
import type { ToolResult } from "./ToolResult";

export interface Tool {

    readonly definition: ToolDefinition;

    execute(
        context: ToolContext
    ): Promise<ToolResult>;

}

export type { ToolDefinition };
