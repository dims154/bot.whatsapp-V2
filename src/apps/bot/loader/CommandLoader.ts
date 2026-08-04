import { CommandRegistry } from "../registry/CommandRegistry";
import { PingCommand } from "../commands/ping.command";

export class CommandLoader {

    constructor(
        private registry: CommandRegistry
    ) {}

    load() {

        this.registry.register(
            new PingCommand()
        );

    }

}