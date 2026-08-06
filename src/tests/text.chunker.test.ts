import { textLoader } from "../apps/bot/knowledge/loader/loader.container";
import { textChunker } from "../apps/bot/knowledge/chunker/chunker.container";

async function main() {

    const document =
        await textLoader.load(
            "./knowledge/sample.txt"
        );

    const chunks =
        await textChunker.chunk(
            document
        );

    console.log(chunks);

}

main();