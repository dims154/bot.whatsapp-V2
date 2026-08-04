import { BotGroup } from './bot.interfaces';

export class BotGroupManager {
  private groups: Record<string, BotGroup> = {};

  createGroup(name: string, members: string[] = []): BotGroup {
    const id = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    const group: BotGroup = { id, name, members };
    this.groups[id] = group;
    return group;
  }

  getGroup(id: string): BotGroup | null {
    return this.groups[id] ?? null;
  }

  listGroups(): BotGroup[] {
    return Object.values(this.groups);
  }

  addMember(groupId: string, member: string): BotGroup | null {
    const group = this.getGroup(groupId);
    if (!group) {
      return null;
    }

    if (!group.members.includes(member)) {
      group.members.push(member);
    }

    return group;
  }

  removeMember(groupId: string, member: string): BotGroup | null {
    const group = this.getGroup(groupId);
    if (!group) {
      return null;
    }

    group.members = group.members.filter((item) => item !== member);
    return group;
  }
}
