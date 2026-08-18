import { ICommandContext } from "../commands/interfaces/ICommandContext";
import { CommandRegistry } from "../registry/CommandRegistry";

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

        console.log("🚀 CommandExecutor dipanggil:", {
            text: context.text,
            sender: context.sender,
            isAdmin: context.isAdmin,
            isOwner: context.isOwner
        });

        // =========================
        // VALIDASI TEXT
        // =========================

        const text = context.text.trim();

        if (!text.startsWith("/")) {
            console.log("⚠️ Bukan command:", text);
            return;
        }

        // =========================
        // AMBIL COMMAND NAME
        // =========================

        const commandName = text
            .split(/\s+/)[0]
            .substring(1)
            .toLowerCase();

        console.log("🔎 Command name:", commandName);

        // =========================
        // CARI COMMAND
        // =========================

        const command = this.registry.get(commandName);

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

        console.log("🔎 COMMAND DEBUG:", {
            command: command.name,
            permission: command.permission,
            category: command.category,
            sender: context.sender,
            isAdmin: context.isAdmin,
            isOwner: context.isOwner
        });

        // =========================
        // PERMISSION: ADMIN
        // =========================

        if (
            command.permission === "admin" &&
            !context.isAdmin &&
            !context.isOwner
        ) {

            console.log("❌ Admin permission denied:", {
                command: command.name,
                sender: context.sender,
                isAdmin: context.isAdmin,
                isOwner: context.isOwner
            });

            await context.reply(
                "❌ Kamu tidak memiliki akses admin."
            );

            return;
        }

        // =========================
        // PERMISSION: OWNER
        // =========================

        if (
            command.permission === "owner" &&
            !context.isOwner
        ) {

            console.log("❌ Owner permission denied:", {
                command: command.name,
                sender: context.sender,
                isAdmin: context.isAdmin,
                isOwner: context.isOwner
            });

            await context.reply(
                "❌ Kamu tidak memiliki akses owner."
            );

            return;
        }

        // =========================
        // PERMISSION PASSED
        // =========================

        console.log("🔐 Permission Check PASSED:", {
            command: command.name,
            permission: command.permission,
            sender: context.sender,
            isAdmin: context.isAdmin,
            isOwner: context.isOwner
        });

        // =========================
        // EXECUTE COMMAND
        // =========================

        try {

            await command.execute(context);

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