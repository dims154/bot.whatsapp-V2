import { BotCommand, BotPluginContext } from './bot.interfaces';
import { EventBus } from '../../shared/event-bus/event-bus';

export abstract class BotPlugin {
  protected context!: BotPluginContext;
  protected eventBus!: EventBus;

  initialize(context: BotPluginContext, eventBus: EventBus): void {
    this.context = context;
    this.eventBus = eventBus;
    this.attachHandlers();
  }

  protected attachHandlers(): void {
    this.eventBus.on('command.received', async (command: BotCommand) => {
      if (this.canHandleCommand(command.name)) {
        await this.handleCommand(command);
      }
    });
  }

  protected abstract canHandleCommand(commandName: string): boolean;
  protected abstract handleCommand(command: BotCommand): Promise<void>;
}
