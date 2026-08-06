import { dispatcher } from "../apps/bot/bot.container";
import { CommandContext } from "../apps/bot/context/CommandContext";

async function send(text: string) {

    const args = text.split(" ").slice(1);

    await dispatcher.dispatch(

        new CommandContext({

            sender: "6281234567890",

            chatId: "6281234567890",

            messageId: Date.now().toString(),

            text,

            args,

            isGroup: false,

            isAdmin: false,

            isOwner: true

        })

    );

}

(async () => {

    await send("/ai Nama saya Ilham.");

    await send("/ai Saya tinggal di Jambi.");

    await send("/ai Siapa nama saya?");

})();