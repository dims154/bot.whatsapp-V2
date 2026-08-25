import { prismaService } from "../database/prisma.service";

import { CommandRegistry } from "../apps/bot/registry/CommandRegistry";
import { CommandExecutor } from "../apps/bot/executor/CommandExecutor";
import { CommandContext } from "../apps/bot/context/CommandContext";

import { RoleCommand } from "../apps/bot/commands/role.command";


async function test() {

    console.log("");
    console.log("========================================");
    console.log("🧪 TEST ROLE DETAIL COMMAND");
    console.log("========================================");

    let testRoleId: string | undefined;

    try {

        // ====================================
        // OWNER
        // ====================================

        const owner =
            await prismaService.client.user.findUnique({

                where: {
                    email: "owner@erp.local"
                }

            });


        if (!owner) {

            throw new Error(
                "Owner utama tidak ditemukan."
            );

        }


        console.log("");
        console.log(
            "👤 Owner:",
            owner.email
        );


        // ====================================
        // TENANT
        // ====================================

        const tenant =
            await prismaService.client.tenant.findUnique({

                where: {
                    id: owner.tenantId
                }

            });


        if (!tenant) {

            throw new Error(
                "Tenant utama tidak ditemukan."
            );

        }


        console.log(
            "🏢 Tenant:",
            tenant.id
        );


        // ====================================
        // CARI ROLE OWNER
        // ====================================

        const ownerRole =
            await prismaService.client.role.findFirst({

                where: {

                    tenantId:
                        tenant.id,

                    name:
                        "Owner"

                },

                include: {
                    permissions: true
                }

            });


        if (!ownerRole) {

            throw new Error(
                "Role Owner tidak ditemukan."
            );

        }


        console.log(
            "🔐 Role:",
            ownerRole.name
        );

        console.log(
            "🔑 Permission:",
            ownerRole.permissions.length
        );


        // ====================================
        // BUAT ROLE TEST
        // ====================================

        const testRole =
            await prismaService.client.role.create({

                data: {

                    tenantId:
                        tenant.id,

                    name:
                        `Test Detail Role ${Date.now()}`,

                    description:
                        "Role untuk test detail command"

                }

            });


        testRoleId =
            testRole.id;


        console.log(
            "🧪 Test role:",
            testRole.name
        );


        // ====================================
        // REGISTRY
        // ====================================

        const registry =
            new CommandRegistry();


        registry.register(
            new RoleCommand()
        );


        // ====================================
        // EXECUTOR
        // ====================================

        const executor =
            new CommandExecutor(
                registry
            );


        // ====================================
        // CONTEXT
        // ====================================

        const context =
            new CommandContext({

                sender:
                    "6289529852918",

                chatId:
                    "TEST_CHAT",

                messageId:
                    "TEST_MESSAGE",

                text:
                    `/role ${testRole.name}`,

                args:
                    testRole.name.split(" "),

                isGroup:
                    false,

                isAdmin:
                    true,

                isOwner:
                    true,

                userId:
                    owner.id,

                tenantId:
                    tenant.id,

                roles:
                    ["Owner"],

                permissions:
                    ["role.read"]

            });


        // ====================================
        // CAPTURE REPLY
        // ====================================

        let replyMessage = "";


        context.reply =
            async (
                message: string
            ) => {

                replyMessage =
                    message;

                console.log("");
                console.log(
                    "📨 REPLY:"
                );

                console.log(
                    message
                );

            };


        // ====================================
        // EXECUTE
        // ====================================

        await executor.execute(
            context
        );


        // ====================================
        // VALIDASI RESPONSE
        // ====================================

        if (!replyMessage) {

            throw new Error(
                "❌ Command tidak menghasilkan reply."
            );

        }


        if (
            !replyMessage.includes(
                testRole.name
            )
        ) {

            throw new Error(
                "❌ Nama role tidak muncul pada response."
            );

        }


        if (
            !replyMessage.includes(
                testRole.id
            )
        ) {

            throw new Error(
                "❌ ID role tidak muncul pada response."
            );

        }


        if (
            !replyMessage.includes(
                tenant.id
            )
        ) {

            throw new Error(
                "❌ Tenant ID tidak muncul pada response."
            );

        }


        console.log(
            "✅ Detail role berhasil ditampilkan."
        );


        // ====================================
        // TEST ROLE TIDAK DITEMUKAN
        // ====================================

        const notFoundContext =
            new CommandContext({

                sender:
                    "6289529852918",

                chatId:
                    "TEST_CHAT",

                messageId:
                    "TEST_MESSAGE_2",

                text:
                    "/role RoleTidakAda",

                args:
                    ["RoleTidakAda"],

                isGroup:
                    false,

                isAdmin:
                    true,

                isOwner:
                    true,

                userId:
                    owner.id,

                tenantId:
                    tenant.id,

                roles:
                    ["Owner"],

                permissions:
                    ["role.read"]

            });


        let notFoundReply = "";


        notFoundContext.reply =
            async (
                message: string
            ) => {

                notFoundReply =
                    message;

                console.log("");
                console.log(
                    "📨 NOT FOUND REPLY:"
                );

                console.log(
                    message
                );

            };


        await executor.execute(
            notFoundContext
        );


        if (
            !notFoundReply.includes(
                "tidak ditemukan"
            )
        ) {

            throw new Error(
                "❌ Role yang tidak ada tidak ditangani dengan benar."
            );

        }


        console.log(
            "✅ Role tidak ditemukan ditangani dengan benar."
        );


        // ====================================
        // SUCCESS
        // ====================================

        console.log("");
        console.log("========================================");
        console.log("🎉 ROLE DETAIL TEST PASS");
        console.log("========================================");


    } catch (error) {

        console.error("");
        console.error(
            "❌ TEST ERROR:"
        );

        console.error(
            error
        );

        process.exitCode = 1;

    } finally {

        // ====================================
        // CLEANUP
        // ====================================

        if (testRoleId) {

            try {

                await prismaService.client.role.delete({

                    where: {
                        id: testRoleId
                    }

                });

                console.log(
                    "🧹 Test role berhasil dihapus."
                );

            } catch (error) {

                console.error(
                    "⚠️ Cleanup role gagal:",
                    error
                );

            }

        }


        await prismaService.client.$disconnect();

    }

}


test();