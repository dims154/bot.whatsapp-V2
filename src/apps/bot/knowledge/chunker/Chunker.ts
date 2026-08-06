import { KnowledgeChunk } from "../models/KnowledgeChunk";
import { KnowledgeDocument } from "../models/KnowledgeDocument";

export interface Chunker {

    chunk(
        document: KnowledgeDocument
    ): Promise<KnowledgeChunk[]>;

}