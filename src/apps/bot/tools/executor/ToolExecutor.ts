import { ToolPlan } from "../planner/ToolPlan";
import { ToolResult } from "../ToolResult";
import { toolManager } from "../tool.container";

export class ToolExecutor {

    async execute(
        plan: ToolPlan
    ): Promise<ToolResult[]> {

        const results: ToolResult[] = [];

        for (const tool of plan.tools) {

            const result = await toolManager.execute(
                tool.tool,
                tool.input
            );

            results.push(result);

        }

        return results;

    }

}