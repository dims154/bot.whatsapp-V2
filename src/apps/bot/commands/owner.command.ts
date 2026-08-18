import { ICommand } from "./interfaces/ICommand";
import { ICommandContext } from "./interfaces/ICommandContext";

export class OwnerCommand implements ICommand {
    name = "owner";
    aliases = ["own"];
    category = "owner";
    permission = "owner";
    cooldown = 3;
    description = "Menu owner";

    async execute(context: ICommandContext): Promise<void> {
        if (!context.isOwner) {
            await context.reply("❌ Command ini hanya untuk owner.");
            return;
        }

        await context.reply(
            `👑 MENU OWNER

/owner - Menu owner
/admin - Menu administrator
/status - Status sistem`
        );
    }
}