import { Tool } from "../Tool";
import { ToolContext } from "../ToolContext";
import { ToolResult } from "../ToolResult";

export class CalculatorTool implements Tool {

    readonly definition = {

        name: "calculator",

        description: "Menghitung ekspresi matematika.",

        parameters: [

            {

                name: "expression",

                type: "string",

                description: "Ekspresi matematika yang akan dihitung.",

                required: true

            }

        ]

    };

    async execute(
        context: ToolContext
    ): Promise<ToolResult> {

        try {

            const expression = context.input
                .replace(/hitung/gi, "")
                .trim();

            const result = Function(
                `"use strict"; return (${expression})`
            )();

            return {

                success: true,

                result: String(result)

            };

        } catch {

            return {

                success: false,

                result: "Perhitungan gagal."

            };

        }

    }

}