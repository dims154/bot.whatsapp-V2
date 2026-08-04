import { MetaParser } from "../apps/bot/parser/MetaParser";

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

const context = MetaParser.parse(payload);

console.log(context);