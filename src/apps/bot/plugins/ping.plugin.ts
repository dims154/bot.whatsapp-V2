import { BotPlugin } from '../bot.plugin';
import { BotCommand } from '../bot.interfaces';

export class PingPlugin extends BotPlugin {
  protected canHandleCommand(commandName: string): boolean {
    return commandName === 'ping';
  }

  protected async handleCommand(command: BotCommand): Promise<void> {
    await this.context.sendMessage(command.from, 'pong');
  }
}
