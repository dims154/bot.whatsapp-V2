import { Workflow } from "../models/Workflow";

export class WorkflowValidator {

    validate(
        workflow: Workflow
    ): boolean {

        if (
            !workflow.steps.length
        ) {

            return false;

        }

        for (const step of workflow.steps) {

            if (!step.tool) {

                return false;

            }

        }

        return true;

    }

}