import { CommandRegistry } from "../registry/CommandRegistry";

import { PingCommand } from "../commands/ping.command";
import { AICommand } from "../commands/ai.command";
import { HelpCommand } from "../commands/help.command";
import { MenuCommand } from "../commands/menu.command";
import { AdminCommand } from "../commands/admin.command";
import { OwnerCommand } from "../commands/owner.command";
import { UserListCommand } from "../commands/user-list.command";
import { UserDetailCommand } from "../commands/user-detail.command";
import { CreateUserCommand } from "../commands/create-user.command";

export class CommandLoader {

    constructor(
        private registry: CommandRegistry
    ) {}

    load(): void {

        // =========================
        // GENERAL
        // =========================

        this.registry.register(
            new PingCommand()
        );

        // =========================
        // AI
        // =========================

        this.registry.register(
            new AICommand()
        );

        // =========================
        // ADMIN
        // =========================

        this.registry.register(
            new AdminCommand()
        );

 // =========================
// USERS
// =========================

this.registry.register(
    new UserListCommand()
);

this.registry.register(
    new UserDetailCommand()
);

this.registry.register(
    new CreateUserCommand()
);
        // =========================
        // OWNER
        // =========================

        this.registry.register(
            new OwnerCommand()
        );

        // =========================
        // HELP & MENU
        // =========================

        this.registry.register(
            new HelpCommand(
                this.registry
            )
        );

        this.registry.register(
            new MenuCommand(
                this.registry
            )
        );
    }
}