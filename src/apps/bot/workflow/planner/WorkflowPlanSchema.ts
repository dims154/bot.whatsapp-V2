import { Schema } from "@google/genai";

export const WorkflowPlanSchema = ({

    type: "object",

    properties: {

        steps: {

            type: "array",

            items: {

                type: "object",

                properties: {

                    id: { type: "string" },

                    tool: { type: "string" },

                    input: { type: "string" }

                },

                required: ["id", "tool", "input"]

            }

        }

    },

    required: ["steps"]

} as unknown) as Schema;