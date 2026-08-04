export type EventHandler<T = unknown> = (payload: T) => Promise<void> | void;

export class EventBus {
  private handlers: Record<string, EventHandler[]> = {};

  on<T = unknown>(event: string, handler: EventHandler<T>): void {
    this.handlers[event] = this.handlers[event] ?? [];
    this.handlers[event].push(handler as EventHandler);
  }

  async emit<T = unknown>(event: string, payload: T): Promise<void> {
    const handlers = this.handlers[event] ?? [];
    await Promise.all(handlers.map((handler) => Promise.resolve(handler(payload))));
  }
}
