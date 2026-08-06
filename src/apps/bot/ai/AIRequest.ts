export type AIMessageRole =
    | "system"
    | "user"
    | "assistant";

export interface AIMessage {

    role: AIMessageRole;

    content: string;

}

export interface AIRequest {

    messages: AIMessage[];

    temperature?: number;

    maxTokens?: number;

    topP?: number;

    stream?: boolean;

}