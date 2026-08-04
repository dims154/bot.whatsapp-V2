import { Request, Response } from "express";
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
            token,
            challenge,
            envToken: config.whatsapp.verifyToken
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

        console.log("========= META WEBHOOK =========");
        console.log(JSON.stringify(req.body, null, 2));
        console.log("===============================");

        try {

            const context = MetaParser.parse(req.body);

            if (!context) {
                console.log("⚠️ Tidak ada pesan masuk.");
                return res.sendStatus(200);
            }

            await dispatcher.dispatch(context);

            return res.sendStatus(200);

        } catch (error) {

            console.error("❌ Dispatcher Error:", error);

            return res.sendStatus(500);

        }

    }

}