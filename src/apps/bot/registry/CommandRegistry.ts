import { ICommand } from "../commands/interfaces/ICommand";

export class CommandRegistry {

    private commands = new Map<string, ICommand>();

    register(command: ICommand): void {

        // Nama utama
        this.commands.set(
            command.name.toLowerCase(),
            command
        );

        // Alias
        command.aliases.forEach((alias: string) => {
            this.commands.set(
                alias.toLowerCase(),
                command
            );
        });

    }

    get(name: string): ICommand | undefined {

        return this.commands.get(
            name.toLowerCase()
        );

    }

    getAll(): ICommand[] {

        return [...new Set(this.commands.values())];

    }

}