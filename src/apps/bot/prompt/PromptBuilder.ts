import { AIMessage } from "../ai/AIRequest";

import { PromptTemplate } from "./PromptTemplate";

export class PromptBuilder {

    build(
        history: string,
        prompt: string
    ): AIMessage[] {

        return [

            {
                role: "system",
                content: PromptTemplate.system
            },

            {
                role: "system",
                content: history
            },

            {
                role: "user",
                content: prompt
            }

        ];

    }

}