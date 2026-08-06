import { dispatcher } from "../apps/bot/bot.container";
import { CommandContext } from "../apps/bot/context/CommandContext";

(async () => {

    const context = new CommandContext({

        sender: "6281234567890",

        chatId: "6281234567890",

        messageId: "TEST001",

        text: "/ai Jelaskan apa itu TypeScript",

        args: [
            "Jelaskan",
            "apa",
            "itu",
            "TypeScript"
        ],

        isGroup: false,

        isAdmin: false,

        isOwner: true

    });

    await dispatcher.dispatch(context);

})();