import { IWhatsAppProvider } from "./IWhatsAppProvider";
import { MetaProvider } from "./meta.provider";

export class WhatsAppProviderFactory {

    static create(): IWhatsAppProvider {
        const provider = process.env.WHATSAPP_PROVIDER ?? "meta-cloud";

        switch (provider) {
            case "meta-cloud":
                return new MetaProvider();

            default:
                throw new Error(
                    `Unsupported WhatsApp provider: ${provider}`
                );
        }
    }
}