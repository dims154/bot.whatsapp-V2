export interface ToolParameter {

    name: string;

    type: string;

    description: string;

    required: boolean;

}

export interface ToolDefinition {

    name: string;

    description: string;

    parameters: ToolParameter[];

}