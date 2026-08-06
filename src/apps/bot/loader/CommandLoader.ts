import { CommandRegistry } from "../registry/CommandRegistry";

import { PingCommand } from "../commands/ping.command";
import { AICommand } from "../commands/ai.command";

export class CommandLoader {

    constructor(
        private registry: CommandRegistry
    ) {}

    load() {

        this.registry.register(
            new PingCommand()
        );

        this.registry.register(
            new AICommand()
        );

    }

}