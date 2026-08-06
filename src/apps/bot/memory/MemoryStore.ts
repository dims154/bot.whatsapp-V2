export interface MemoryStore {

    get(chatId: string): Promise<string[]>;

    save(
        chatId: string,
        message: string
    ): Promise<void>;

    clear(chatId: string): Promise<void>;

}