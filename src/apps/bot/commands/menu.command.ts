import { ICommand } from "./interfaces/ICommand";
import { ICommandContext } from "./interfaces/ICommandContext";
import { CommandRegistry } from "../registry/CommandRegistry";

export class MenuCommand implements ICommand {

    name = "menu";

    aliases = ["m"];

    description = "Menampilkan menu bot";

    category = "general";

    permission = "user" as const;

    cooldown = 3;

    constructor(
        private registry: CommandRegistry
    ) {}

    async execute(
        context: ICommandContext
    ): Promise<void> {

        const commands =
            this.registry.getAll();

        const visibleCommands =
            commands.filter(
                (command) =>
                    command.permission === "user" ||
                    command.permission === "everyone" ||
                    (command.permission === "admin" &&
                        (context.isAdmin || context.isOwner)) ||
                    (command.permission === "owner" &&
                        context.isOwner)
            );

        const grouped =
            new Map<string, typeof visibleCommands>();

        for (const command of visibleCommands) {

            const category =
                command.category || "general";

            if (!grouped.has(category)) {
                grouped.set(
                    category,
                    []
                );
            }

            grouped
                .get(category)!
                .push(command);
        }

        let response =
            "🤖 *MENU BOT*\n\n";

        for (
            const [category, commands]
            of grouped
        ) {

            response +=
                `📌 *${category.toUpperCase()}*\n`;

            for (const command of commands) {

                response +=
                    `/${command.name}`;

                if (
                    command.aliases.length > 0
                ) {

                    response +=
                        ` (${command.aliases
                            .map(
                                (alias) =>
                                    `/${alias}`
                            )
                            .join(", ")})`;
                }

                response +=
                    ` - ${command.description}\n`;
            }

            response += "\n";
        }

        await context.reply(
            response.trim()
        );
    }
}
