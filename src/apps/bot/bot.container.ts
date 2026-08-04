import { CommandRegistry } from "./registry/CommandRegistry";
import { CommandLoader } from "./loader/CommandLoader";
import { CommandExecutor } from "./executor/CommandExecutor";
import { BotDispatcher } from "./dispatcher/BotDispatcher";

const registry = new CommandRegistry();

// Register semua command
const loader = new CommandLoader(registry);
loader.load();

// Executor
const executor = new CommandExecutor(registry);

// Dispatcher
const dispatcher = new BotDispatcher(executor);

export {
    registry,
    loader,
    executor,
    dispatcher
};