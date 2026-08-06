export const ToolPlanSchema = {

    type: "object",

    properties: {

        tools: {

            type: "array",

            items: {

                type: "object",

                properties: {

                    tool: {

                        type: "string"

                    },

                    input: {

                        type: "string"

                    }

                },

                required: [

                    "tool",

                    "input"

                ]

            }

        }

    },

    required: [

        "tools"

    ]

} as const;