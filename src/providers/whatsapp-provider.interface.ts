export interface WhatsAppMessage {
  to: string;
  body: string;
  metadata?: Record<string, unknown>;
}

export interface IWhatsAppProvider {
  sendMessage(message: WhatsAppMessage): Promise<void>;
  receiveMessage(payload: unknown): Promise<void>;
  getProviderName(): string;
}
