import { ConversationMemory } from "./ConversationMemory";
import { SQLiteMemoryStore } from "./SQLiteMemoryStore";

const store = new SQLiteMemoryStore();


export const memory = new ConversationMemory(store);