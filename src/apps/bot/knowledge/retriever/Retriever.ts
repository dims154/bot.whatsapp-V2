import { RetrievedChunk } from "../models/RetrievedChunk";

export interface Retriever {

    retrieve(
        query: string,
        limit?: number
    ): Promise<RetrievedChunk[]>;

}