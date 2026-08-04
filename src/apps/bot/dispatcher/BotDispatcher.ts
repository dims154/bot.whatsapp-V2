import { CommandExecutor } from "../executor/CommandExecutor";
import { CommandContext } from "../context/CommandContext";

export class BotDispatcher {

    constructor(
        private executor: CommandExecutor
    ) {}

    async dispatch(context: CommandContext) {

        const text = context.text.trim();

        if (!text) {
            return;
        }

        await this.executor.execute(context);

    }

}