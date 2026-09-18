import { Request, Response } from "express";
import { createHmac, timingSafeEqual } from "crypto";
import type {} from "../../../../types/express";
import { config } from "../../../../config/environment";
import { dispatcher } from "../../../../apps/bot/bot.container";
import { MetaParser } from "../../../../apps/bot/parser/MetaParser";

export class MetaController {

    static verifyWebhook(req: Request, res: Response) {

        const mode = req.query["hub.mode"];
        const token = req.query["hub.verify_token"];
        const challenge = req.query["hub.challenge"];

        console.log({
            mode,
            challenge
        });

        if (
            mode === "subscribe" &&
            token === config.whatsapp.verifyToken
        ) {
            console.log("✅ Webhook verified.");
            return res.status(200).send(challenge);
        }

        console.log("❌ Invalid verify token.");
        return res.sendStatus(403);
    }

    static async receiveWebhook(
        req: Request,
        res: Response
    ): Promise<Response> {

        const signature = req.get("X-Hub-Signature-256");
        const appSecret = config.whatsapp.appSecret;
        const rawBody = req.rawBody;

        if (!signature || !appSecret || !rawBody) {
            return res.sendStatus(403);
        }

        const expectedSignature = createHmac(
            "sha256",
            appSecret
        )
            .update(rawBody)
            .digest("hex");

        const receivedSignature = signature.startsWith("sha256=")
            ? signature.slice("sha256=".length)
            : "";

        const expectedBuffer = Buffer.from(expectedSignature, "hex");
        const receivedBuffer = Buffer.from(receivedSignature, "hex");

        if (
            expectedBuffer.length !== receivedBuffer.length ||
            !timingSafeEqual(expectedBuffer, receivedBuffer)
        ) {
            return res.sendStatus(403);
        }

        console.log("========= META WEBHOOK =========");
        console.log("===============================");

        try {

           const context = await MetaParser.parse(req.body);

            if (!context) {
                console.log("⚠️ Tidak ada pesan masuk.");
                return res.sendStatus(200);
            }

            await dispatcher.dispatch(context);

            return res.sendStatus(200);

        } catch (error) {

            console.error(
                "❌ Dispatcher Error:",
                error instanceof Error
                    ? error.message
                    : "Unknown error"
            );

            return res.sendStatus(500);

        }

    }

}