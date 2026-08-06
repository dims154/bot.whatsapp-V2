import { dispatcher } from "../apps/bot/bot.container";
import { CommandContext } from "../apps/bot/context/CommandContext";

const payload = {
    entry: [
        {
            changes: [
                {
                    value: {
                        messages: [
                            {
                                from: "6281234567890",
                                id: "wamid.TEST123",
                                text: {
                                    body: "/ping"
                                }
                            }
                        ]
                    }
                }
            ]
        }
    ]
};

(async () => {

    const message =
        payload.entry[0].changes[0].value.messages[0];

    const context = new CommandContext({

        sender: message.from,
        chatId: message.from,
        messageId: message.id,

        text: message.text.body,

        args: [],

        isGroup: false,
        isAdmin: true,
        isOwner: true,

        

    });

    await dispatcher.dispatch(context);

})();