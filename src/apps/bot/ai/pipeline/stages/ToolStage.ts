import { AIStage } from "../AIStage";
import { AIPipelineContext } from "../AIPipelineContext";

import { toolPlanner } from "../../../tools/planner/planner.container";
import { toolExecutor } from "../../../tools/executor/executor.container";
import { toolValidator } from "../../../tools/validator/validator.container";

export class ToolStage implements AIStage<AIPipelineContext> {

    readonly name = "ToolStage";

    async execute(
        context: AIPipelineContext
    ): Promise<AIPipelineContext> {

        // 1. AI membuat rencana
        const plan = await toolPlanner.plan(
            context.prompt
        );

        // 2. Validasi tool
        const validPlan = toolValidator.validate(
            plan
        );

        // 3. Tidak ada tool yang valid
        if (validPlan.tools.length === 0) {

            return context;

        }

        // 4. Eksekusi semua tool
        const results = await toolExecutor.execute(
            validPlan
        );

        // 5. Simpan hasil ke pipeline
        context.toolResults = results;

        return context;

    }

}