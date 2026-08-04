import { CommandRegistry } from "../registry/CommandRegistry";
import { CommandContext } from "../context/CommandContext";

export class CommandExecutor {

    constructor(
        private registry: CommandRegistry
    ) {}

    async execute(context: CommandContext) {

        const body = context.text.trim();

        const parts = body.split(/\s+/);

        const commandName = (parts.shift() ?? "")
            .replace(/^\//, "")
            .toLowerCase();

        console.log("📥 Input :", body);
        console.log("🔎 Command :", commandName);

        const command = this.registry.get(commandName);

        console.log("📦 Registry :", command);

        if (!command) {
            console.log(`❌ Command "${commandName}" tidak ditemukan.`);
            return;
        }

        context.args = parts;

        console.log(`✅ Menjalankan command "${command.name}"`);

        await command.execute(context);

    }

}