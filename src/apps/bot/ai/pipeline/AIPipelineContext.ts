import { AIMessage } from "../AIRequest";
import { ToolResult } from "../../tools/ToolResult";

export interface AIPipelineContext {

    chatId: string;

    prompt: string;

    history: string;

    persona: string;

    messages: AIMessage[];

    response?: string;

    toolResults?: ToolResult[];

}