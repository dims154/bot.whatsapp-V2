export interface IPlugin {

    id: string;

    name: string;

    version: string;

    description: string;

    enabled: boolean;

    initialize(): Promise<void>;

    shutdown(): Promise<void>;

}