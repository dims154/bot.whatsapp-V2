import { KnowledgeDocument } from "../models/KnowledgeDocument";

export interface DocumentLoader {

    load(
        source: string
    ): Promise<KnowledgeDocument>;

}