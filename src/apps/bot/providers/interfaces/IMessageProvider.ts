export interface IMessageProvider {

    sendMessage(
        to: string,
        message: string
    ): Promise<void>;

}