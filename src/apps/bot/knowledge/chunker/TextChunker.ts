import { randomUUID } from "crypto";

import { Chunker } from "./Chunker";

import { KnowledgeDocument } from "../models/KnowledgeDocument";
import { KnowledgeChunk } from "../models/KnowledgeChunk";

export class TextChunker implements Chunker {

    constructor(

        private readonly chunkSize = 500,

        private readonly overlap = 50

    ) {}

    async chunk(
        document: KnowledgeDocument
    ): Promise<KnowledgeChunk[]> {

        const chunks: KnowledgeChunk[] = [];

        let start = 0;

        while (start < document.content.length) {

            const end = Math.min(

                start + this.chunkSize,

                document.content.length

            );

            chunks.push({

                id: randomUUID(),

                documentId: document.id,

                content: document.content.slice(

                    start,

                    end

                )

            });

            start += this.chunkSize - this.overlap;

        }

        return chunks;

    }

}