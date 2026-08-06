import { embeddingProvider } from "../embedding/embedding.container";
import { vectorStore } from "../vector/vector.container";

import { KnowledgeRetriever } from "./KnowledgeRetriever";

export const retriever =
    new KnowledgeRetriever(

        embeddingProvider,

        vectorStore

    );