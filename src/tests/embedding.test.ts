import { embeddingProvider } from "../apps/bot/knowledge/embedding/embedding.container";

async function main() {

    const vector =
        await embeddingProvider.embed(

            "BOT V2 adalah Enterprise AI Platform."

        );

    console.log(

        "Dimension:",

        vector.length

    );

    console.log(

        vector.slice(0, 10)

    );

}

main();