import { Session } from "./session";

export class SessionManager {

    private sessions = new Map<string, Session>();

    create(
        userId: string,
        chatId: string
    ): Session {

        const session = new Session(

            crypto.randomUUID(),

            userId,

            chatId

        );

        this.sessions.set(chatId, session);

        return session;

    }

    get(chatId: string): Session | undefined {

        return this.sessions.get(chatId);

    }

    has(chatId: string): boolean {

        return this.sessions.has(chatId);

    }

    remove(chatId: string): void {

        this.sessions.delete(chatId);

    }

    clear(): void {

        this.sessions.clear();

    }

}