export class MessageEvent {

    async handle(payload: unknown): Promise<void> {
        console.log("📩 Incoming WhatsApp message:");
        console.log(JSON.stringify(payload, null, 2));
    }

}