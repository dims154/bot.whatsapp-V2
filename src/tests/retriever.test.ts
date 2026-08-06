import { embeddingProvider } from "../apps/bot/knowledge/embedding/embedding.container";
import { vectorStore } from "../apps/bot/knowledge/vector/vector.container";
import { retriever } from "../apps/bot/knowledge/retriever/retriever.container";

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
        await retriever.retrieve(

            "Apa itu Enterprise AI Platform?"

        );

    console.log(result);

}

main();