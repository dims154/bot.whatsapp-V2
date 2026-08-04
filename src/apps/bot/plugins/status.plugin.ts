import { BotPlugin } from '../bot.plugin';
import { BotCommand } from '../bot.interfaces';

export class StatusPlugin extends BotPlugin {
  protected canHandleCommand(commandName: string): boolean {
    return commandName === 'status';
  }

  protected async handleCommand(command: BotCommand): Promise<void> {
    await this.context.sendMessage(command.from, 'Bot is active and ready.');
  }
}
