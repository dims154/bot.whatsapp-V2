import { workflowExecutor } from "../executor/executor.container";
import { workflowValidator } from "../validator/validator.container";
import { workflowPlanner } from "../planner/planner.container";

import { Workflow } from "../models/Workflow";
import { WorkflowResult } from "../models/WorkflowResult";

export class WorkflowEngine {

    async run(
        workflow: Workflow
    ): Promise<WorkflowResult> {

        if (
            !workflowValidator.validate(
                workflow
            )
        ) {

            throw new Error(
                "Workflow tidak valid."
            );

        }

        return workflowExecutor.execute(
            workflow
        );

    }

    async runPrompt(
        prompt: string
    ): Promise<WorkflowResult> {

        const workflow =
            await (workflowPlanner as any).plan(
                prompt
            );

        return this.run(
            workflow
        );

    }

}