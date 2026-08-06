import { MemoryStore } from "./MemoryStore";

export class ConversationMemory {

    constructor(
        private store: MemoryStore
    ) {}

    async history(
        chatId: string
    ): Promise<string> {

        const messages = await this.store.get(chatId);

        return messages.join("\n");

    }

    async add(

        chatId: string,

        role: string,

        message: string

    ): Promise<void> {

        await this.store.save(

            chatId,

            `${role}: ${message}`

        );

    }

    async clear(
        chatId: string
    ) {

        await this.store.clear(chatId);

    }

}