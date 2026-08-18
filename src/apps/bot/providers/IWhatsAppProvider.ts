export interface IWhatsAppProvider {

    sendMessage(
        to: string,
        message: string
    ): Promise<void>;

    sendImage(
        to: string,
        imageUrl: string,
        caption?: string
    ): Promise<void>;

    sendDocument(
        to: string,
        documentUrl: string,
        filename?: string
    ): Promise<void>;

    receiveMessage(
        payload: unknown
    ): Promise<void>;
}