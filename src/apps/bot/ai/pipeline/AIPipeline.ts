import { AIStage } from "./AIStage";
import { AIPipelineContext } from "./AIPipelineContext";

export class AIPipeline {

    constructor(

        private stages: AIStage<AIPipelineContext>[]

    ) {}

    async run(

        context: AIPipelineContext

    ): Promise<AIPipelineContext> {

        let current = context;

        for (const stage of this.stages) {

            const start = Date.now();
            current = await stage.execute(current);
            const duration = Date.now() - start;

            console.log(
                `[AIPipeline] Stage "${stage.name}" completed in ${duration}ms`
            );

        }

        return current;

    }

}