import { CommandRegistry } from "../apps/bot/registry/CommandRegistry";
import { CommandExecutor } from "../apps/bot/executor/CommandExecutor";
import { CommandContext } from "../apps/bot/context/CommandContext";
import { UserListCommand } from "../apps/bot/commands/user-list.command";

async function test() {

    console.log("");
    console.log("========================================");
    console.log("🧪 TEST USER LIST COMMAND");
    console.log("========================================");

    const registry =
        new CommandRegistry();

    // =========================
    // REGISTER /users
    // =========================

    registry.register(
        new UserListCommand()
    );

    const executor =
        new CommandExecutor(
            registry
        );

    // =========================
    // CONTEXT
    // =========================

    const context =
        new CommandContext({

            sender:
                "6289529852918",

            chatId:
                "TEST_CHAT",

            messageId:
                "TEST_MESSAGE",

            text:
                "/users",

            args: [],

            isGroup:
                false,

            isAdmin:
                true,

            isOwner:
                true,

            userId:
                "46f09034-2cb7-48ce-981d-59669f907b0c",

            tenantId:
                "a290075f-5aa4-4692-be35-039de2623059",

            roles: [
                "Owner"
            ],

            permissions: [
                "user.read"
            ]

        });

    // =========================
    // OVERRIDE REPLY
    // =========================

    context.reply =
        async (message: string) => {

            console.log("");
            console.log("📨 REPLY:");
            console.log(message);

        };

    // =========================
    // EXECUTE
    // =========================

    await executor.execute(
        context
    );

    console.log("");
    console.log("========================================");
    console.log("🎉 USER LIST TEST SELESAI");
    console.log("========================================");

}

test()
    .catch(error => {

        console.error("");
        console.error("❌ TEST ERROR:");
        console.error(error);

        process.exit(1);

    });