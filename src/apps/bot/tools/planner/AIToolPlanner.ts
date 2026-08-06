import { plannerAI } from "./planner.ai.container";
import { toolRegistry } from "../tool.container";

import { ToolPlan } from "./ToolPlan";

export class AIToolPlanner {

    private parse(
        text: string
    ): ToolPlan | null {

        try {

            return JSON.parse(
                text
            ) as ToolPlan;

        } catch {

            return null;

        }

    }

    async plan(
        prompt: string
    ): Promise<ToolPlan> {

        const tools =
            toolRegistry.definitionsJson();

        const plannerPrompt = `Kamu adalah AI Tool Planner.

Berikut daftar tool yang tersedia:

${tools}

Tugasmu adalah memilih tool yang PALING sesuai.

Jawab HANYA JSON.

Format:

{
  "tools":[
    {
      "tool":"nama_tool",
      "input":"parameter"
    }
  ]
}

Jika tidak ada tool yang sesuai:

{
  "tools":[]
}

User:
${prompt}`;

        for (let attempt = 1; attempt <= 3; attempt++) {

            try {

                console.log(
                    `========== PLANNER ATTEMPT ${attempt} ==========`
                );

                const response =
                    await plannerAI.ask(
                        plannerPrompt
                    );

                console.log(response);

                const plan =
                    this.parse(response);

                if (plan) {

                    console.log(
                        "✅ Planner berhasil."
                    );

                    return plan;

                }

                console.warn(
                    "⚠ Planner menghasilkan JSON tidak valid."
                );

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