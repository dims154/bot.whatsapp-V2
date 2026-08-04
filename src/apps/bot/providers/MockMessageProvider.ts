import { IMessageProvider } from "./interfaces/IMessageProvider";

export class MockMessageProvider implements IMessageProvider {

    async sendMessage(
        to: string,
        message: string
    ): Promise<void> {

        console.log("================================");
        console.log("📨 MOCK MESSAGE");
        console.log("To      :", to);
        console.log("Message :", message);
        console.log("================================");

    }

}