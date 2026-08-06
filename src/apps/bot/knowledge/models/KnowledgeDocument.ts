export interface KnowledgeDocument {

    id: string;

    title: string;

    source: string;

    content: string;

    metadata?: Record<string, unknown>;

}