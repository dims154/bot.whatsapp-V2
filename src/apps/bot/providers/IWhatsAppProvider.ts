export interface IWhatsAppProvider {

    sendMessage(
        to: string,
        message: string,
        phoneNumberId?: string
    ): Promise<void>;

    sendImage(
        to: string,
        imageUrl: string,
        caption?: string,
        phoneNumberId?: string
    ): Promise<void>;

    sendDocument(
        to: string,
        documentUrl: string,
        filename?: string,
        phoneNumberId?: string
    ): Promise<void>;

    receiveMessage(): Promise<void>;
}