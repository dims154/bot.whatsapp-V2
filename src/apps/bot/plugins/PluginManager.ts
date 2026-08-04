import { PluginRegistry } from "./PluginRegistry";

export class PluginManager {

    constructor(
        private registry: PluginRegistry
    ) {}

    async initialize(): Promise<void> {

        for (const plugin of this.registry.getAll()) {

            if (!plugin.enabled) {
                continue;
            }

            await plugin.initialize();

            console.log(`✅ Plugin Loaded: ${plugin.name}`);

        }

    }

    async shutdown(): Promise<void> {

        for (const plugin of this.registry.getAll()) {

            await plugin.shutdown();

        }

    }

}