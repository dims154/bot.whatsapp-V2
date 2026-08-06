export interface ToolCall {

    tool: string;

    input: string;

}

export interface ToolPlan {

    tools: ToolCall[];

}