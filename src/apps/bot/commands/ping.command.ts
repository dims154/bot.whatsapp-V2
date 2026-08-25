import { ICommand } from "./interfaces/ICommand";
import { ICommandContext } from "./interfaces/ICommandContext";

export class PingCommand implements ICommand {

    name = "ping";

    aliases = [];

    description = "Ping Command";

    category = "General";

    permission = "everyone" as const;

    cooldown = 0;

    async execute(context: ICommandContext): Promise<void> {

        await context.reply("🏓 Pong!");

    }

}
