import { KnowledgeChunk } from "../models/KnowledgeChunk";

export interface VectorStore {

    add(
        chunk: KnowledgeChunk
    ): Promise<void>;

    addMany(
        chunks: KnowledgeChunk[]
    ): Promise<void>;

    search(
        embedding: number[],
        limit?: number
    ): Promise<KnowledgeChunk[]>;

}