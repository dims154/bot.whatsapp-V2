import { IWhatsAppProvider, WhatsAppMessage } from '../whatsapp-provider.interface';

export interface MetaCloudProviderConfig {
  accessToken: string;
  phoneNumberId: string;
}

export class MetaCloudWhatsAppProvider implements IWhatsAppProvider {
  constructor(private config: MetaCloudProviderConfig) {}

  async sendMessage(message: WhatsAppMessage): Promise<void> {
    console.log('[Meta Cloud] sendMessage', {
      provider: this.getProviderName(),
      message,
      phoneNumberId: this.config.phoneNumberId,
    });
  }

  async receiveMessage(payload: unknown): Promise<void> {
    console.log('[Meta Cloud] receiveMessage', { payload });
  }

  getProviderName(): string {
    return 'meta-cloud';
  }
}
