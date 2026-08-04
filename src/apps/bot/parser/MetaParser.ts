import { CommandContext } from "../context/CommandContext";

export class MetaParser {

    static parse(payload: any): CommandContext | null {

        const message =
            payload?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

        if (!message) {
            return null;
        }

        return new CommandContext({

            sender: message.from,
            chatId: message.from,
            messageId: message.id,

            text: message.text?.body ?? "",

            args: [],

            isGroup: false,

            isAdmin: false,

            isOwner: false,

            reply: async () => {}

        });

    }

}