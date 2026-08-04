import { IWhatsAppProvider } from '../whatsapp-provider.interface';
import { BaileysWhatsAppProvider } from './baileys.provider';
import { MetaCloudWhatsAppProvider } from './meta-cloud.provider';
import { WahaWhatsAppProvider } from './waha.provider';

export type WhatsAppProviderName = 'waha' | 'meta-cloud' | 'baileys';

export interface WhatsAppProviderSettings {
  provider: WhatsAppProviderName;
  apiKey?: string;
  endpoint?: string;
  accessToken?: string;
  phoneNumberId?: string;
  sessionId?: string;
}

export const createWhatsAppProvider = (settings: WhatsAppProviderSettings): IWhatsAppProvider => {
  switch (settings.provider) {
    case 'waha':
      return new WahaWhatsAppProvider({ apiKey: settings.apiKey ?? '', endpoint: settings.endpoint });
    case 'meta-cloud':
      return new MetaCloudWhatsAppProvider({
        accessToken: settings.accessToken ?? '',
        phoneNumberId: settings.phoneNumberId ?? '',
      });
    case 'baileys':
      return new BaileysWhatsAppProvider({ sessionId: settings.sessionId ?? 'default-session' });
    default:
      return new MetaCloudWhatsAppProvider({
        accessToken: settings.accessToken ?? '',
        phoneNumberId: settings.phoneNumberId ?? '',
      });
  }
};
