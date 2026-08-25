import { ICommand } from "./interfaces/ICommand";
import { ICommandContext } from "./interfaces/ICommandContext";

import { aiPipeline } from "../ai/pipeline/pipeline.container";
import { memory } from "../memory/memory.container";

export class AICommand implements ICommand {

    name = "ai";

    aliases = [];

    description = "AI Chat Command";

    category = "AI";

    permission = "everyone" as const;

    cooldown = 0;

    async execute(context: ICommandContext): Promise<void> {

        const prompt = context.args.join(" ").trim();

        if (!prompt) {
            await context.reply("Contoh:\n/ai Halo, siapa kamu?");
            return;
        }

        try {
            const result = await aiPipeline.run({
                chatId: context.chatId,
                prompt,
                history: "",
                persona: "",
                messages: []
            });

            const responseText = result.response ?? "";

            await memory.add(context.chatId, "user", prompt);
            await memory.add(context.chatId, "assistant", responseText);

            await context.reply(responseText);
        } catch (error) {
            console.error(error);
            await context.reply("❌ Terjadi kesalahan saat menghubungi AI.");
        }
    }

}
