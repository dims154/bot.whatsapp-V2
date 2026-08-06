import { MemoryStore } from "./MemoryStore";

export class InMemoryStore implements MemoryStore {

    private memory = new Map<string, string[]>();

    async get(chatId: string): Promise<string[]> {

        return this.memory.get(chatId) ?? [];

    }

    async save(
        chatId: string,
        message: string
    ): Promise<void> {

        const messages = this.memory.get(chatId) ?? [];

        messages.push(message);

        this.memory.set(chatId, messages);

    }

    async clear(chatId: string): Promise<void> {

        this.memory.delete(chatId);

    }

}