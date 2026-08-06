import { Workflow } from "../../models/Workflow";

export class RuleWorkflowPlanner {

    plan(
        prompt: string
    ): Workflow {

        const lower =
            prompt.toLowerCase();

        if (

            lower.includes("hitung")

        ) {

            const matches =

                prompt.match(

                    /(\d+\s*[\+\-\*\/]\s*\d+)/g

                ) ?? [];

            const steps =

                matches.map(

                    (

                        expression,

                        index

                    ) => ({

                        id: String(

                            index + 1

                        ),

                        tool: "calculator",

                        input:

                            index === 0

                                ? expression

                                : `$${index-1}${expression.replace(matches[index],"")}`

                    })

                );

            if (

                steps.length === 1

            ) {

                const tambah =

                    prompt.match(

                        /tambah\s+(\d+)/i

                    );

                if (

                    tambah

                ) {

                    steps.push({

                        id: "2",

                        tool: "calculator",

                        input:

                            `$0+${tambah[1]}`

                    });

                }

            }

            return {

                steps

            };

        }

        return {

            steps: []

        };

    }

}