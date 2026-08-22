import { prismaService } from "../database/prisma.service";

import { CommandRegistry } from "../apps/bot/registry/CommandRegistry";
import { CommandExecutor } from "../apps/bot/executor/CommandExecutor";
import { CommandContext } from "../apps/bot/context/CommandContext";

import { CreateRoleCommand } from "../apps/bot/commands/create-role.command";


async function test() {

    console.log("");
    console.log("========================================");
    console.log("🧪 TEST CREATE ROLE COMMAND");
    console.log("========================================");

    let testRoleId:
        string | undefined;


    try {

        // ====================================
        // OWNER
        // ====================================

        const owner =
            await prismaService.client.user.findUnique({

                where: {
                    email:
                        "owner@erp.local"
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
                    id:
                        owner.tenantId
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
        // ROLE NAME
        // ====================================

        const roleName =
            `Test Manager ${Date.now()}`;


        console.log(
            "🔐 Role test:",
            roleName
        );


        // ====================================
        // REGISTRY
        // ====================================

        const registry =
            new CommandRegistry();


        registry.register(
            new CreateRoleCommand()
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
                    `/createrole ${roleName}`,

                args:
                    roleName.split(" "),

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
                    ["role.create"]

            });


        // ====================================
        // CAPTURE REPLY
        // ====================================

        let replyMessage =
            "";


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
                "ROLE BERHASIL DIBUAT"
            )
        ) {

            throw new Error(
                "❌ Response create role tidak sesuai."
            );

        }


        console.log(
            "✅ Command create role berhasil."
        );


        // ====================================
        // QUERY DATABASE
        // ====================================

        const createdRole =
            await prismaService.client.role.findFirst({

                where: {

                    id:
                        replyMessage
                            .match(
                                /🆔 ID:\s*\n(.+)/
                            )?.[1]
                            ?.trim(),

                    tenantId:
                        tenant.id

                }

            });


        if (!createdRole) {

            throw new Error(
                "❌ Role tidak ditemukan di database."
            );

        }


        testRoleId =
            createdRole.id;


        console.log(
            "✅ Role berhasil tersimpan di database."
        );


        // ====================================
        // TENANT CHECK
        // ====================================

        if (
            createdRole.tenantId !==
            tenant.id
        ) {

            throw new Error(
                "❌ Role tersimpan pada tenant yang salah."
            );

        }


        console.log(
            "🔐 Tenant isolation: PASS"
        );


        // ====================================
        // DUPLICATE TEST
        // ====================================

        const duplicateContext =
            new CommandContext({

                sender:
                    "6289529852918",

                chatId:
                    "TEST_CHAT",

                messageId:
                    "TEST_MESSAGE_DUPLICATE",

                text:
                    `/createrole ${roleName}`,

                args:
                    roleName.split(" "),

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
                    ["role.create"]

            });


        let duplicateReply =
            "";


        duplicateContext.reply =
            async (
                message: string
            ) => {

                duplicateReply =
                    message;

                console.log("");
                console.log(
                    "📨 DUPLICATE REPLY:"
                );

                console.log(
                    message
                );

            };


        await executor.execute(
            duplicateContext
        );


        if (
            !duplicateReply.includes(
                "sudah ada"
            )
        ) {

            throw new Error(
                "❌ Duplicate role tidak ditolak."
            );

        }


        console.log(
            "✅ Duplicate role berhasil ditolak."
        );


        // ====================================
        // SUCCESS
        // ====================================

        console.log("");
        console.log("========================================");
        console.log("🎉 CREATE ROLE TEST PASS");
        console.log("========================================");


    } catch (error) {

        console.error("");
        console.error(
            "❌ TEST ERROR:"
        );

        console.error(
            error
        );

        process.exitCode =
            1;

    } finally {

        // ====================================
        // CLEANUP
        // ====================================

        if (testRoleId) {

            try {

                await prismaService.client.role.delete({

                    where: {
                        id:
                            testRoleId
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