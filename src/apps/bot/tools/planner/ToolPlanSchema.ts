import { Schema, Type } from "@google/genai";

export const ToolPlanSchema: Schema = {

    type: Type.OBJECT,

    properties: {

        tools: {

            type: Type.ARRAY,

            items: {

                type: Type.OBJECT,

                properties: {

                    tool: {

                        type: Type.STRING,

                        description: "Nama tool yang akan dipanggil."

                    },

                    input: {

                        type: Type.STRING,

                        description: "Input untuk tool."

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

};