export class WorkflowVariableResolver {

    resolve(

        input: string,

        outputs: string[]

    ): string {

        let result = input;

        outputs.forEach(

            (value, index) => {

                result = result.replaceAll(

                    `$${index}`,

                    value

                );

            }

        );

        if (

            outputs.length > 0

        ) {

            result = result.replaceAll(

                "$last",

                outputs[

                    outputs.length - 1

                ]

            );

        }

        return result;

    }

}