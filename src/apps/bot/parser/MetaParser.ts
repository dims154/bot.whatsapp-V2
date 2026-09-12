import { CommandContext } from "../context/CommandContext";
import { UserResolver } from "../auth/UserResolver";
import { ChannelResolver } from "../auth/ChannelResolver";

export class MetaParser {

    static async parse(
        payload: any
    ): Promise<CommandContext | null> {

        // =========================
        // GET MESSAGE
        // =========================

        const message =
            payload?.entry?.[0]
                ?.changes?.[0]
                ?.value?.messages?.[0];

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
        // META PHONE NUMBER ID
        // =========================

        const phoneNumberId =
            payload?.entry?.[0]
                ?.changes?.[0]
                ?.value?.metadata?.phone_number_id ?? "";

        console.log(
            "📱 Meta Phone Number ID:",
            phoneNumberId
        );

        // =========================
        // TEXT
        // =========================

        const text =
            message.text?.body?.trim() ?? "";

        // =========================
        // ARGS
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

                return `62${digits.slice(1)}`;
            }

            return digits;
        };

        const normalizedSender =
            normalizeNumber(sender);

        // =========================
        // TENANT
        // =========================

        const channel =
            await ChannelResolver.resolveByPhoneNumberId(
                phoneNumberId
            );

        if (!channel) {
            console.error(
                `❌ Tidak ada channel aktif untuk phoneNumberId: ${phoneNumberId}`
            );

            return null;
        }

        const tenantId = channel.tenantId;

        console.log("🏢 Tenant resolved:", tenantId);
        console.log("📡 Channel resolved:", channel.channelId);
        console.log("💼 Business resolved:", channel.businessId);
        
        // =========================
        // USER RESOLVER
        // =========================

        const user =
            await UserResolver.resolve(
                normalizedSender,
                tenantId
            );

        // =========================
        // USER TIDAK DITEMUKAN
        // =========================

        if (!user) {

            console.log(
                "🚫 WhatsApp user belum terdaftar:",
                {
                    sender:
                        normalizedSender,

                    tenantId,

                    phoneNumberId
                }
            );

            return new CommandContext({

                sender,

                chatId:
                    sender,

                phoneNumberId,

                messageId:
                    message.id,

                text,

                args,

                isGroup:
                    false,

                isAdmin:
                    false,

                isOwner:
                    false,

                userId:
                    undefined,

                tenantId,

                roles: [],

                permissions: []

            });
        }

        // =========================
        // ROLE
        // =========================

        const isOwner =
            user.roles.some(
                role =>
                    role.toLowerCase() ===
                    "owner"
            );

        const isAdmin =
            isOwner ||
            user.roles.some(
                role =>
                    role.toLowerCase() ===
                    "admin"
            );

        // =========================
        // DEBUG
        // =========================

        console.log(
            "🔐 Database Role Resolver:",
            {
                sender:
                    normalizedSender,

                userId:
                    user.id,

                tenantId:
                    user.tenantId,

                phoneNumberId,

                roles:
                    user.roles,

                permissions:
                    user.permissions,

                isAdmin,

                isOwner
            }
        );

        // =========================
        // COMMAND CONTEXT
        // =========================

        return new CommandContext({

            sender,

            chatId:
                sender,

            phoneNumberId,

            messageId:
                message.id,

            text,

            args,

            isGroup:
                false,

            isAdmin,

            isOwner,

            userId:
                user.id,

            tenantId:
                user.tenantId,

            roles:
                user.roles,

            permissions:
                user.permissions

        });
    }
}