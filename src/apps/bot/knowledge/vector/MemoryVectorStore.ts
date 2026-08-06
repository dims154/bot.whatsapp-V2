import { VectorStore } from "./VectorStore";
import { KnowledgeChunk } from "../models/KnowledgeChunk";

export class MemoryVectorStore
implements VectorStore {

    private readonly chunks: KnowledgeChunk[] = [];

    async add(
        chunk: KnowledgeChunk
    ): Promise<void> {

        this.chunks.push(
            chunk
        );

    }

    async addMany(
        chunks: KnowledgeChunk[]
    ): Promise<void> {

        this.chunks.push(
            ...chunks
        );

    }

    async search(
        embedding: number[],
        limit = 5
    ): Promise<KnowledgeChunk[]> {

        const ranked = this.chunks

            .filter(

                chunk => chunk.embedding

            )

            .map(chunk => ({

                chunk,

                score: this.cosine(

                    embedding,

                    chunk.embedding!

                )

            }))

            .sort(

                (a, b) =>

                    b.score - a.score

            )

            .slice(0, limit)

            .map(

                item => item.chunk

            );

        return ranked;

    }

    private cosine(

        a: number[],

        b: number[]

    ): number {

        let dot = 0;

        let normA = 0;

        let normB = 0;

        for (

            let i = 0;

            i < a.length;

            i++

        ) {

            dot += a[i] * b[i];

            normA += a[i] * a[i];

            normB += b[i] * b[i];

        }

        return dot /

            (

                Math.sqrt(normA) *

                Math.sqrt(normB)

            );

    }

}