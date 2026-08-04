export interface ParsedCommand {

    command: string;

    args: string[];

}

export class CommandParser {

    static parse(text: string): ParsedCommand | null {

        if (!text)
            return null;

        text = text.trim();

        if (!text.startsWith("/"))
            return null;

        const split = text.split(/\s+/);

        const command = split.shift()!
            .substring(1)
            .toLowerCase();

        return {

            command,

            args: split

        };

    }

}