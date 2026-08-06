import { KnowledgeDocument } from "./KnowledgeDocument";
import { KnowledgeChunk } from "./KnowledgeChunk";
import { RetrievedChunk } from "./RetrievedChunk";

export interface KnowledgeContext {

    query: string;

    documents: KnowledgeDocument[];

    chunks: KnowledgeChunk[];

    retrieved: RetrievedChunk[];

}