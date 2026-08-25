import { CommandRegistry } from "../apps/bot/registry/CommandRegistry";
import { CommandExecutor } from "../apps/bot/executor/CommandExecutor";
import { CommandContext } from "../apps/bot/context/CommandContext";
import { ICommand } from "../apps/bot/commands/interfaces/ICommand";


// ========================================
// TEST COMMAND
// ========================================

function createCommand(
    name: string,
    permission: "user" | "everyone" | "admin" | "owner" | `${string}.${string}`
): ICommand {

    return {

        name,

        aliases: [],

        description:
            `Test command ${name}`,

        category:
            "test",

        permission,

        cooldown: 0,

        async execute(context) {

            console.log(
                `🎯 EXECUTE: /${name}`
            );

            await context.reply(
                `TEST_EXECUTED:${name}`
            );

        }

    };

}


// ========================================
// TEST CONTEXT
// ========================================

function createContext(
    permissions: string[],
    roles: string[] = []
): CommandContext {

    return new CommandContext({

        sender:
            "6289529852918",

        chatId:
            "TEST_CHAT",

        messageId:
            "TEST_MESSAGE",

        text:
            "",

        args: [],

        isGroup:
            false,

        isAdmin:
            roles.some(
                role =>
                    [
                        "Owner",
                        "Admin",
                        "Super Admin"
                    ].includes(role)
            ),

        isOwner:
            roles.includes("Owner"),

        userId:
            "TEST_USER",

        tenantId:
            "TEST_TENANT",

        roles,

        permissions

    });

}


// ========================================
// TEST RUNNER
// ========================================

async function test() {

    console.log("");
    console.log("========================================");
    console.log("🧪 TEST COMMAND EXECUTOR");
    console.log("========================================");


    // ====================================
    // REGISTRY
    // ====================================

    const registry =
        new CommandRegistry();


    registry.register(
        createCommand(
            "help",
            "user"
        )
    );

    registry.register(
        createCommand(
            "owner",
            "owner"
        )
    );

    registry.register(
        createCommand(
            "admin",
            "admin"
        )
    );

    registry.register(
        createCommand(
            "createuser",
            "user.create"
        )
    );


    const executor =
        new CommandExecutor(
            registry
        );


    // ====================================
    // HELPER TEST
    // ====================================

    async function runTest(
        name: string,
        text: string,
        permissions: string[],
        roles: string[]
    ) {

        console.log("");
        console.log("----------------------------------------");
        console.log(`🧪 ${name}`);
        console.log("----------------------------------------");

        const context =
            createContext(
                permissions,
                roles
            );

        context.text =
            text;

        // Override reply supaya test
        // tidak mengirim WhatsApp sungguhan
        context.reply =
            async (message: string) => {

                console.log(
                    "📨 REPLY:",
                    message
                );

            };

        await executor.execute(
            context
        );

    }


    // ====================================
    // TEST 1
    // ====================================

    await runTest(

        "HELP → PUBLIC",

        "/help",

        [],

        []

    );


    // ====================================
    // TEST 2
    // ====================================

    await runTest(

        "OWNER → OWNER",

        "/owner",

        [],

        ["Owner"]

    );


    // ====================================
    // TEST 3
    // ====================================

    await runTest(

        "ADMIN → OWNER",

        "/admin",

        [],

        ["Owner"]

    );


    // ====================================
    // TEST 4
    // ====================================

    await runTest(

        "CREATE USER → HAS PERMISSION",

        "/createuser",

        [
            "user.create"
        ],

        ["User"]

    );


    // ====================================
    // TEST 5
    // ====================================

    await runTest(

        "CREATE USER → NO PERMISSION",

        "/createuser",

        [
            "user.read"
        ],

        ["User"]

    );


    // ====================================
    // TEST 6
    // ====================================

    await runTest(

        "OWNER → USER BIASA",

        "/owner",

        [],

        ["User"]

    );


    console.log("");
    console.log("========================================");
    console.log("🎉 COMMAND EXECUTOR TEST SELESAI");
    console.log("========================================");

}


test()
    .catch(error => {

        console.error("");
        console.error(
            "❌ TEST ERROR:"
        );

        console.error(
            error
        );

        process.exit(1);

    });