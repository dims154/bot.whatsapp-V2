import { ICommandContext } from "../commands/interfaces/ICommandContext";
import { CommandRegistry } from "../registry/CommandRegistry";
import { PermissionResolver } from "../auth/PermissionResolver";

export class CommandExecutor {

    constructor(
        private registry: CommandRegistry
    ) {}

    async execute(
        context: ICommandContext
    ): Promise<void> {

        // =========================
        // DEBUG: EXECUTOR DIPANGGIL
        // =========================

        console.log(
            "🚀 CommandExecutor dipanggil:",
            {
                text:
                    context.text,

                sender:
                    context.sender,

                userId:
                    context.userId,

                tenantId:
                    context.tenantId,

                roles:
                    context.roles,

                permissions:
                    context.permissions,

                isAdmin:
                    context.isAdmin,

                isOwner:
                    context.isOwner
            }
        );


        // =========================
        // VALIDASI TEXT
        // =========================

        const text =
            context.text.trim();

        if (
            !text.startsWith("/")
        ) {

            console.log(
                "⚠️ Bukan command:",
                text
            );

            return;
        }


        // =========================
        // AMBIL COMMAND NAME
        // =========================

        const commandName =
            text
                .split(/\s+/)[0]
                .substring(1)
                .toLowerCase();

        console.log(
            "🔎 Command name:",
            commandName
        );


        // =========================
        // CARI COMMAND
        // =========================

        const command =
            this.registry.get(
                commandName
            );

        if (!command) {

            console.log(
                `❌ Command tidak ditemukan: ${commandName}`
            );

            await context.reply(
                `❌ Command "${commandName}" tidak ditemukan.`
            );

            return;
        }


        // =========================
        // DEBUG COMMAND
        // =========================

        console.log(
            "🔎 COMMAND DEBUG:",
            {
                command:
                    command.name,

                permission:
                    command.permission,

                category:
                    command.category,

                sender:
                    context.sender,

                userId:
                    context.userId,

                tenantId:
                    context.tenantId,

                roles:
                    context.roles,

                permissions:
                    context.permissions
            }
        );


        // =========================
        // DATABASE PERMISSION CHECK
        // =========================

        const hasPermission =
            PermissionResolver.has(
                context.permissions,
                command.permission,
                context.roles
            );


        console.log(
            "🔐 DATABASE PERMISSION CHECK:",
            {
                command:
                    command.name,

                requiredPermission:
                    command.permission,

                userId:
                    context.userId,

                tenantId:
                    context.tenantId,

                roles:
                    context.roles,

                permissions:
                    context.permissions,

                result:
                    hasPermission
            }
        );


        // =========================
        // PERMISSION DENIED
        // =========================

        if (!hasPermission) {

            console.log(
                "❌ Permission denied:",
                {
                    command:
                        command.name,

                    requiredPermission:
                        command.permission,

                    sender:
                        context.sender,

                    roles:
                        context.roles,

                    permissions:
                        context.permissions
                }
            );

            // =========================
            // MESSAGE SESUAI LEVEL
            // =========================

            if (
                command.permission === "owner"
            ) {

                await context.reply(
                    "❌ Kamu tidak memiliki akses owner."
                );

            } else if (
                command.permission === "admin"
            ) {

                await context.reply(
                    "❌ Kamu tidak memiliki akses admin."
                );

            } else {

                await context.reply(
                    "❌ Kamu tidak memiliki permission untuk menjalankan command ini."
                );

            }

            return;
        }


        // =========================
        // PERMISSION PASSED
        // =========================

        console.log(
            "🔐 Permission Check PASSED:",
            {
                command:
                    command.name,

                permission:
                    command.permission,

                sender:
                    context.sender,

                userId:
                    context.userId,

                tenantId:
                    context.tenantId,

                roles:
                    context.roles,

                permissions:
                    context.permissions
            }
        );


        // =========================
        // EXECUTE COMMAND
        // =========================

        try {

            await command.execute(
                context
            );

            console.log(
                `✅ Command executed: /${command.name}`
            );

        } catch (error) {

            console.error(
                `❌ Command execution error: /${command.name}`,
                error
            );

            try {

                await context.reply(
                    "❌ Terjadi kesalahan saat menjalankan command."
                );

            } catch (replyError) {

                console.error(
                    "❌ Gagal mengirim error response:",
                    replyError
                );

            }

        }

    }

}