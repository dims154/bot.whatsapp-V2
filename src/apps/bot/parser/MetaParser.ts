import { CommandContext } from "../context/CommandContext";
import { config } from "../../../config/environment";

export class MetaParser {

    static parse(payload: any): CommandContext | null {

        // =========================
        // AMBIL MESSAGE
        // =========================

        const message =
            payload?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

        if (!message) {
            console.log(
                "⚠️ MetaParser: message tidak ditemukan"
            );

            return null;
        }

        // =========================
        // SENDER
        // =========================

        const sender =
            message.from ?? "";

        // =========================
        // TEXT MESSAGE
        // =========================

        const text =
            message.text?.body?.trim() ?? "";

        // =========================
        // PARSE ARGUMENTS
        // =========================
        //
        // Contoh:
        //
        // /ai Halo siapa kamu?
        //
        // menjadi:
        //
        // command = ai
        // args = ["Halo", "siapa", "kamu?"]
        //
        // =========================

        const parts =
            text.length > 0
                ? text.split(/\s+/)
                : [];

        const args =
            parts.length > 1
                ? parts.slice(1)
                : [];

        // =========================
        // OWNER NUMBER
        // =========================

        const ownerNumber =
            config.whatsapp.ownerNumber
                ?.trim() ?? "";

        // =========================
        // NORMALIZE NUMBER
        // =========================

        const normalizeNumber = (
            value?: string
        ): string => {

            const digits =
                (value ?? "")
                    .toString()
                    .replace(
                        /[^0-9]/g,
                        ""
                    );

            if (
                digits.startsWith("0")
            ) {
                return (
                    `62${digits.slice(1)}`
                );
            }

            return digits;
        };

        // =========================
        // ROLE RESOLVER
        // =========================

        const normSender =
            normalizeNumber(sender);

        const normOwner =
            normalizeNumber(ownerNumber);

        const isOwner =
            normOwner !== "" &&
            normSender === normOwner;

        // Untuk sementara:
        // Owner otomatis dianggap admin
        const isAdmin =
            isOwner;

        // =========================
        // DEBUG PARSER
        // =========================

        console.log(
            "👤 Role Resolver:",
            {
                sender,
                ownerNumber,
                isAdmin,
                isOwner
            }
        );

        console.log(
            "📝 MetaParser:",
            {
                text,
                args
            }
        );

        // =========================
        // BUILD COMMAND CONTEXT
        // =========================

        return new CommandContext({

            sender,

            chatId:
                sender,

            messageId:
                message.id,

            text,

            args,

            isGroup:
                false,

            isAdmin,

            isOwner

        });
    }
}