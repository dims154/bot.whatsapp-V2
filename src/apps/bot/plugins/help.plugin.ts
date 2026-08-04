import { BotPlugin } from '../bot.plugin';
import { BotCommand } from '../bot.interfaces';

export class HelpPlugin extends BotPlugin {
  protected canHandleCommand(commandName: string): boolean {
    return commandName === 'help';
  }

  protected async handleCommand(command: BotCommand): Promise<void> {
    const message = 'Available commands:\n/help - show this message\n/ping - health check\n/status - bot status';
    await this.context.sendMessage(command.from, message);
  }
}
