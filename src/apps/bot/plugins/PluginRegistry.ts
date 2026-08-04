import { IPlugin } from "./interfaces/IPlugin";

export class PluginRegistry {

    private plugins = new Map<string, IPlugin>();

    register(plugin: IPlugin): void {

        this.plugins.set(plugin.id, plugin);

    }

    get(id: string): IPlugin | undefined {

        return this.plugins.get(id);

    }

    getAll(): IPlugin[] {

        return Array.from(this.plugins.values());

    }

}