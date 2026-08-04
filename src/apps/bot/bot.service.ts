import { BotCommand, BotMessage } from './bot.interfaces';
import { IWhatsAppProvider } from '../../providers/whatsapp-provider.interface';
import { EventBus } from '../../shared/event-bus/event-bus';

export class BotService {
  constructor(private provider: IWhatsAppProvider, private eventBus: EventBus) {}

  async sendMessage(to: string, body: string): Promise<void> {
    await this.provider.sendMessage({ to, body });
  }

  async broadcastMessage(targets: string[], body: string): Promise<void> {
    await Promise.all(targets.map((to) => this.sendMessage(to, body)));
  }

  async receiveRawPayload(payload: unknown): Promise<void> {
    await this.provider.receiveMessage(payload);
  }

  async processIncomingMessage(message: BotMessage): Promise<void> {
    const command = this.parseCommand(message);

    await this.eventBus.emit('message.received', message);

    if (command) {
      await this.eventBus.emit('command.received', command);
    }
  }

  private parseCommand(message: BotMessage): BotCommand | null {
    const raw = message.body.trim();
    if (!raw.startsWith('/')) {
      return null;
    }

    const [name, ...args] = raw.slice(1).split(' ');
    return {
      name: name.toLowerCase(),
      args,
      raw,
      from: message.from,
      provider: message.provider,
    };
  }
}
