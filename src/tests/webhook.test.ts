import { MetaParser } from "../apps/bot/parser/MetaParser";
import { dispatcher } from "../apps/bot/bot.container";

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

    const context = MetaParser.parse(payload);

    if (!context) {
        return;
    }

    await dispatcher.dispatch(context);

})();