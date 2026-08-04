import { IWhatsAppProvider, WhatsAppMessage } from '../whatsapp-provider.interface';

export interface BaileysProviderConfig {
  sessionId: string;
}

export class BaileysWhatsAppProvider implements IWhatsAppProvider {
  constructor(private config: BaileysProviderConfig) {}

  async sendMessage(message: WhatsAppMessage): Promise<void> {
    console.log('[Baileys] sendMessage', {
      provider: this.getProviderName(),
      message,
      sessionId: this.config.sessionId,
    });
  }

  async receiveMessage(payload: unknown): Promise<void> {
    console.log('[Baileys] receiveMessage', { payload });
  }

  getProviderName(): string {
    return 'baileys';
  }
}
