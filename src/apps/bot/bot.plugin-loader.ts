import { BotPlugin } from './bot.plugin';
import { BotPluginContext } from './bot.interfaces';
import { EventBus } from '../../shared/event-bus/event-bus';

export class BotPluginLoader {
  private plugins: BotPlugin[] = [];

  constructor(private context: BotPluginContext, private eventBus: EventBus) {}

  register(plugin: BotPlugin): void {
    plugin.initialize(this.context, this.eventBus);
    this.plugins.push(plugin);
  }

  getPlugins(): BotPlugin[] {
    return [...this.plugins];
  }
}
