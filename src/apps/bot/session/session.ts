export type SessionState =
    | "idle"
    | "waiting"
    | "conversation"
    | "finished";

export class Session {

    constructor(

        public id: string,

        public userId: string,

        public chatId: string,

        public state: SessionState = "idle",

        public data: Record<string, any> = {},

        public createdAt: Date = new Date(),

        public updatedAt: Date = new Date()

    ) {}

    update(data: Record<string, any>) {

        this.data = {

            ...this.data,

            ...data

        };

        this.updatedAt = new Date();

    }

    changeState(state: SessionState) {

        this.state = state;

        this.updatedAt = new Date();

    }

}