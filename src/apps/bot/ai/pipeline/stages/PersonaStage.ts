import { AIStage } from "../AIStage";
import { AIPipelineContext } from "../AIPipelineContext";

import { personaManager } from "../../../persona/persona.container";

export class PersonaStage implements AIStage<AIPipelineContext> {

    readonly name = "PersonaStage";

    async execute(
        context: AIPipelineContext
    ): Promise<AIPipelineContext> {

        context.persona = personaManager.current().description;

        return context;

    }

}