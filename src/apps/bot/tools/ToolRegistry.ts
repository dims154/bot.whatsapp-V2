import { Tool } from "./Tool";
import { ToolDefinition } from "./ToolDefinition";

export class ToolRegistry {

    private readonly tools = new Map<string, Tool>();

    register(tool: Tool): void {

        this.tools.set(

            tool.definition.name.toLowerCase(),

            tool

        );

    }

    get(name: string): Tool | undefined {

        return this.tools.get(

            name.toLowerCase()

        );

    }

    all(): Tool[] {

        return [...this.tools.values()];

    }

    definitions(): ToolDefinition[] {

        return this.all().map(

            tool => tool.definition

        );

    }

    definitionsText(): string {

        return this
            .definitions()
            .map(

                tool =>
                    `- ${tool.name}: ${tool.description}`

            )
            .join("\n");

    }

    definitionsJson(): string {

        return JSON.stringify(

            this.definitions(),

            null,

            2

        );

    }

}