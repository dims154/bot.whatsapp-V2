export interface CommandContextData {

    sender: string;

    chatId: string;

    messageId: string;

    text: string;

    args: string[];

    isGroup: boolean;

    isAdmin: boolean;

    isOwner: boolean;

}