import { toolManager } from "../../tools/tool.container";

export class ParallelExecutor {

    async execute(

        tasks: {

            tool: string;

            input: string;

        }[]

    ): Promise<string[]> {

        const results =

            await Promise.all(

                tasks.map(

                    async task => {

                        const result =

                            await toolManager.execute(

                                task.tool,

                                task.input

                            );

                        return String(

                            result.result

                        );

                    }

                )

            );

        return results;

    }

}