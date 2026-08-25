import { ICommand } from "../commands/interfaces/ICommand";

export class CommandRegistry {

    private commands = new Map<string, ICommand>();

    register(command: ICommand): void {

        const permission = command.permission;

        if (
            typeof permission !== "string" ||
            permission.trim() !== permission ||
            permission.length === 0 ||
            !(
                [
                    "user",
                    "everyone",
                    "admin",
                    "owner"
                ].includes(permission) ||
                /^[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)*$/.test(permission)
            )
        ) {
            throw new Error(
                `Invalid permission metadata "${String(permission)}" for command "${command.name}".`
            );
        }

        const tokens = [
            command.name,
            ...command.aliases
        ];
        const pending = new Map<string, string>();

        for (const token of tokens) {
            if (
                typeof token !== "string" ||
                token.trim().length === 0
            ) {
                throw new Error(
                    `Invalid command name or alias "${String(token)}" for command "${command.name}".`
                );
            }

            const normalizedToken = token.toLowerCase();
            const firstCommand =
                pending.get(normalizedToken) ??
                this.commands.get(normalizedToken)?.name;

            if (firstCommand) {
                throw new Error(
                    `Command token collision "${token}" between command "${firstCommand}" and command "${command.name}".`
                );
            }

            pending.set(normalizedToken, command.name);
        }

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