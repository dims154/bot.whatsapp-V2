import Database from "better-sqlite3";
import { MemoryStore } from "./MemoryStore";

export class SQLiteMemoryStore implements MemoryStore {

    private db = new Database("storage/bot.db");

    constructor() {

        this.db.prepare(`
            CREATE TABLE IF NOT EXISTS conversation_memory (
                chat_id TEXT,
                message TEXT
            )
        `).run();

    }

    async get(chatId: string): Promise<string[]> {

        const rows = this.db.prepare(`
            SELECT message
            FROM conversation_memory
            WHERE chat_id = ?
            ORDER BY rowid ASC
        `).all(chatId) as { message: string }[];

        return rows.map(row => row.message);

    }

    async save(chatId: string, message: string): Promise<void> {

        this.db.prepare(`
            INSERT INTO conversation_memory(chat_id, message)
            VALUES (?, ?)
        `).run(chatId, message);

    }

    async clear(chatId: string): Promise<void> {

        this.db.prepare(`
            DELETE FROM conversation_memory
            WHERE chat_id = ?
        `).run(chatId);

    }

}