import { CommandRegistry } from "../apps/bot/registry/CommandRegistry";
import { CommandExecutor } from "../apps/bot/executor/CommandExecutor";
import { CommandContext } from "../apps/bot/context/CommandContext";
import { UserDetailCommand } from "../apps/bot/commands/user-detail.command";

async function test() {

    console.log("");
    console.log("========================================");
    console.log("🧪 TEST USER DETAIL COMMAND");
    console.log("========================================");

    const registry =
        new CommandRegistry();

    registry.register(
        new UserDetailCommand()
    );

    const executor =
        new CommandExecutor(
            registry
        );

    const context =
        new CommandContext({

            sender:
                "6289529852918",

            chatId:
                "TEST_CHAT",

            messageId:
                "TEST_MESSAGE",

            text:
                "/user 6289529852918",

            args: [
                "6289529852918"
            ],

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


    context.reply =
        async (message: string) => {

            console.log("");
            console.log("📨 REPLY:");
            console.log(message);

        };


    await executor.execute(
        context
    );


    console.log("");
    console.log("========================================");
    console.log("🎉 USER DETAIL TEST SELESAI");
    console.log("========================================");

}

test()
    .catch(error => {

        console.error("");
        console.error("❌ TEST ERROR:");
        console.error(error);

        process.exit(1);

    });