import { PromptBuilder } from "./PromptBuilder";

export class PromptManager {

    private builder = new PromptBuilder();

    create(

        history: string,

        prompt: string

    ) {

        return this.builder.build(

            history,

            prompt

        );

    }

}