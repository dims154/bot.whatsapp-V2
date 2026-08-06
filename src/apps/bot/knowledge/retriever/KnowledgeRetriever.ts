import { Retriever } from "./Retriever";

import { RetrievedChunk } from "../models/RetrievedChunk";

import { EmbeddingProvider } from "../embedding/EmbeddingProvider";
import { VectorStore } from "../vector/VectorStore";

export class KnowledgeRetriever
implements Retriever {

    constructor(

        private embedding: EmbeddingProvider,

        private vectors: VectorStore

    ) {}

    async retrieve(

        query: string,

        limit = 5

    ): Promise<RetrievedChunk[]> {

        const embedding =
            await this.embedding.embed(
                query
            );

        const chunks =
            await this.vectors.search(

                embedding,

                limit

            );

        return chunks.map(chunk => ({

            chunk,

            score: 1

        }));

    }

}