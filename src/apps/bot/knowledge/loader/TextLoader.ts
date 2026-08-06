import { promises as fs } from "fs";

import { DocumentLoader } from "./DocumentLoader";
import { KnowledgeDocument } from "../models/KnowledgeDocument";

export class TextLoader implements DocumentLoader {

    async load(
        source: string
    ): Promise<KnowledgeDocument> {

        const content =
            await fs.readFile(
                source,
                "utf8"
            );

        return {

            id: crypto.randomUUID(),

            title: source.split(/[\\/]/).pop() ?? source,

            source,

            content

        };

    }

}