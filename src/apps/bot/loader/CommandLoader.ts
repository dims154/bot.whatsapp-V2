import { CommandRegistry } from "../registry/CommandRegistry";

import { PingCommand } from "../commands/ping.command";
import { AICommand } from "../commands/ai.command";
import { HelpCommand } from "../commands/help.command";
import { MenuCommand } from "../commands/menu.command";
import { AdminCommand } from "../commands/admin.command";
import { OwnerCommand } from "../commands/owner.command";

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