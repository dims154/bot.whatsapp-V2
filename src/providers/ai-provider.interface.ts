export interface AIRequest {
  prompt: string;
  metadata?: Record<string, unknown>;
}

export interface AIResponse {
  text: string;
  metadata?: Record<string, unknown>;
}

export interface IAIProvider {
  generate(response: AIRequest): Promise<AIResponse>;
  getProviderName(): string;
}
