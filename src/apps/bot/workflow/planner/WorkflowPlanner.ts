import { workflowPlannerAI } from "./planner.ai.container";

import { ruleWorkflowPlanner }

from "./rules/rule.container";

import { WorkflowPlanSchema }

from "./WorkflowPlanSchema";

import { Workflow }

from "../models/Workflow";

export class WorkflowPlanner {

    async plan(

        prompt: string

    ): Promise<Workflow> {

        try {

            return await workflowPlannerAI.ask<Workflow>(

                prompt,

                WorkflowPlanSchema

            );

        }

        catch (error) {

            console.warn(

                "AI Planner gagal."

            );

            console.warn(

                "Menggunakan Rule Planner."

            );

            return ruleWorkflowPlanner.plan(

                prompt

            );

        }

    }

}