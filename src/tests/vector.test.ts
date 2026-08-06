import { vectorStore } from "../apps/bot/knowledge/vector/vector.container";

import { embeddingProvider } from "../apps/bot/knowledge/embedding/embedding.container";

async function main() {

    const embedding =
        await embeddingProvider.embed(

            "Enterprise AI Platform"

        );

    await vectorStore.add({

        id: "1",

        documentId: "doc",

        content:

            "BOT V2 adalah Enterprise AI Platform.",

        embedding

    });

    const result =
        await vectorStore.search(

            embedding

        );

    console.log(result);

}

main();