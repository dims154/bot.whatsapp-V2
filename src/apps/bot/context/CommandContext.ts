import { ICommandContext } from "../commands/interfaces/ICommandContext";
import { messageProvider } from "../providers";

export class CommandContext implements ICommandContext {

    sender: string;

    chatId: string;

    messageId: string;

    text: string;

    args: string[];

    isGroup: boolean;

    isAdmin: boolean;

    isOwner: boolean;

    constructor(data: ICommandContext) {

        this.sender = data.sender;
        this.chatId = data.chatId;
        this.messageId = data.messageId;
        this.text = data.text;
        this.args = data.args;
        this.isGroup = data.isGroup;
        this.isAdmin = data.isAdmin;
        this.isOwner = data.isOwner;

    }

    async reply(message: string): Promise<void> {

        await messageProvider.sendMessage(
            this.chatId,
            message
        );

    }

}