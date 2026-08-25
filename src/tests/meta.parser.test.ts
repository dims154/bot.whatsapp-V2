import { MetaParser } from "../apps/bot/parser/MetaParser";

const payload = {

    entry: [

        {

            changes: [

                {

                    value: {

                        messages: [

                            {

                                from: "6289529852918",

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

async function test() {

    console.log("================================");
    console.log("🧪 TEST META PARSER");
    console.log("================================");

    try {

        const context =
            await MetaParser.parse(payload);

        console.log(
            "✅ MetaParser berhasil:"
        );

        console.dir(
            context,
            { depth: null }
        );

    } catch (error) {

        console.error(
            "❌ MetaParser gagal:"
        );

        console.error(error);

        process.exit(1);
    }

}

test();