import { ToolPlan } from "../planner/ToolPlan";
import { toolRegistry } from "../tool.container";

export class ToolValidator {

    validate(
        plan: ToolPlan
    ): ToolPlan {

        return {

            tools: plan.tools.filter(

                tool =>

                    toolRegistry.get(tool.tool) !== undefined

            )

        };

    }

}