import { textLoader } from "../apps/bot/knowledge/loader/loader.container";

async function main() {

    const doc =
        await textLoader.load(

            "./knowledge/sample.txt"

        );

    console.log(doc);

}

main();