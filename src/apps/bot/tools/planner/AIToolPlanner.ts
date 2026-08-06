import { plannerAI } from "./planner.ai.container";
import { toolRegistry } from "../tool.container";

import { ToolPlan } from "./ToolPlan";
import { ToolPlanSchema } from "./ToolPlanSchema";

export class AIToolPlanner {

    async plan(
        prompt: string
    ): Promise<ToolPlan> {

        const tools =
            toolRegistry.definitionsJson();

        const plannerPrompt = `Kamu adalah AI Tool Planner.

Berikut daftar tool yang tersedia:

${tools}

Tugasmu adalah memilih tool yang PALING sesuai.

Jawab sesuai schema yang diberikan.

User:
${prompt}`;

        for (let attempt = 1; attempt <= 3; attempt++) {

            try {

                console.log(
                    `========== PLANNER ATTEMPT ${attempt} ==========`
                );

                const plan =
                    await plannerAI.ask<ToolPlan>(

                        plannerPrompt,

                        ToolPlanSchema

                    );

                console.log(plan);

                console.log(
                    "✅ Planner berhasil."
                );

                return plan;

            } catch (error) {

                console.error(
                    `❌ Planner gagal pada attempt ${attempt}`
                );

                console.error(error);

            }

        }

        console.warn(
            "⚠ Semua percobaan planner gagal. Menggunakan fallback."
        );

        return {

            tools: []

        };

    }

}