import { IWhatsAppProvider, WhatsAppMessage } from '../whatsapp-provider.interface';

export interface WahaProviderConfig {
  apiKey: string;
  endpoint?: string;
}

export class WahaWhatsAppProvider implements IWhatsAppProvider {
  constructor(private config: WahaProviderConfig) {}

  async sendMessage(message: WhatsAppMessage): Promise<void> {
    console.log('[WAHA] sendMessage', {
      provider: this.getProviderName(),
      message,
      endpoint: this.config.endpoint,
    });
  }

  async receiveMessage(payload: unknown): Promise<void> {
    console.log('[WAHA] receiveMessage', { payload });
  }

  getProviderName(): string {
    return 'waha';
  }
}
