import { CommandRegistry } from "../registry/CommandRegistry";
import { CommandContext } from "../context/CommandContext";

export class CommandExecutor {

    constructor(
        private registry: CommandRegistry
    ) {}

    async execute(
        context: CommandContext
    ): Promise<void> {

        const text = context.text.trim();

        if (!text.startsWith("/")) {
            return;
        }

        const commandName = text
            .split(/\s+/)[0]
            .substring(1)
            .toLowerCase();

        const command = this.registry.get(
            commandName
        );

        if (!command) {

            await context.reply(
                `❌ Command "${commandName}" tidak ditemukan.`
            );

            return;

        }

        await command.execute(context);

    }

}