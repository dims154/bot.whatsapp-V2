export interface BotMessage {
  from: string;
  body: string;
  provider: string;
  metadata?: Record<string, unknown>;
}

export interface BotCommand {
  name: string;
  args: string[];
  raw: string;
  from: string;
  provider: string;
}

export interface BotGroup {
  id: string;
  name: string;
  members: string[];
}

export interface BotPluginContext {
  sendMessage(to: string, body: string): Promise<void>;
  broadcastMessage(targets: string[], body: string): Promise<void>;
  emitEvent(event: string, payload: unknown): Promise<void>;
  listGroups(): BotGroup[];
  getGroup(id: string): BotGroup | null;
  createGroup(name: string, members: string[]): BotGroup;
  addGroupMember(groupId: string, member: string): BotGroup | null;
  removeGroupMember(groupId: string, member: string): BotGroup | null;
}
