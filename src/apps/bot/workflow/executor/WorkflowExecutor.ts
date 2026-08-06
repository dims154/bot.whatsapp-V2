import { toolManager } from "../../tools/tool.container";

import { workflowResolver } from "../resolver/resolver.container";
import { conditionEvaluator } from "../condition/condition.container";

import { Workflow } from "../models/Workflow";
import { WorkflowResult } from "../models/WorkflowResult";

export class WorkflowExecutor {

    async execute(
        workflow: Workflow
    ): Promise<WorkflowResult> {

        const outputs: string[] = [];

        for (const step of workflow.steps) {

            const input =
                workflowResolver.resolve(

                    step.input,

                    outputs

                );

            if (step.condition) {

                const condition = {

                    ...step.condition,

                    left: workflowResolver.resolve(

                        step.condition.left,

                        outputs

                    ),

                    right: workflowResolver.resolve(

                        step.condition.right,

                        outputs

                    )

                };

                if (

                    !conditionEvaluator.evaluate(

                        condition

                    )

                ) {

                    console.log(

                        `STEP ${step.id} dilewati karena condition = false.`

                    );

                    continue;

                }

            }

            console.log(
                "INPUT:",
                input
            );

            const result =
                await toolManager.execute(

                    step.tool,

                    input

                );

            console.log(
                "OUTPUT:",
                result.result
            );

            outputs.push(
                String(result.result)
            );

        }

        return {

            success: true,

            outputs

        };

    }

}