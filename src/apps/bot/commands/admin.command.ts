import { ICommand } from "./interfaces/ICommand";
import { ICommandContext } from "./interfaces/ICommandContext";

export class AdminCommand implements ICommand {

    name = "admin";

    aliases = ["adm"];

    category = "admin";

    permission = "admin" as const;

    cooldown = 3;

    description = "Menu administrator";


    async execute(
        context: ICommandContext
    ): Promise<void> {

        await context.reply(
            `🔐 MENU ADMIN

/admin - Menu administrator
/status - Status bot
/users - Daftar pengguna`
        );

    }

}
