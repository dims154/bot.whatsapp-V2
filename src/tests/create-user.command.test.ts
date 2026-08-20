import { CommandRegistry } from "../apps/bot/registry/CommandRegistry";
import { CommandExecutor } from "../apps/bot/executor/CommandExecutor";
import { CommandContext } from "../apps/bot/context/CommandContext";

import { CreateUserCommand } from "../apps/bot/commands/create-user.command";

import { prismaService } from "../database/prisma.service";


async function test() {

    console.log("");
    console.log("========================================");
    console.log("🧪 TEST CREATE USER COMMAND");
    console.log("========================================");


    let createdUserId:
        string | undefined;


    try {

        // ====================================
        // REGISTRY
        // ====================================

        const registry =
            new CommandRegistry();


        registry.register(
            new CreateUserCommand()
        );


        // ====================================
        // EXECUTOR
        // ====================================

        const executor =
            new CommandExecutor(
                registry
            );


        // ====================================
        // TENANT
        // ====================================

        const tenant =
            await prismaService.client.tenant.findFirst();


        if (!tenant) {

            throw new Error(
                "Tenant tidak ditemukan."
            );

        }


        console.log("");
        console.log(
            "🏢 Tenant:",
            tenant.id
        );


        // ====================================
        // TEST DATA
        // ====================================

        const email =
            `test-create-${Date.now()}@erp.local`;


        const whatsapp =
            `628${Date.now()
                .toString()
                .slice(-10)}`;


        console.log(
            "📧 Test email:",
            email
        );


        console.log(
            "📱 Test WhatsApp:",
            whatsapp
        );


        // ====================================
        // COMMAND CONTEXT
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
                    `/createuser ${email} TestPassword123 Budi ${whatsapp}`,

                args: [

                    email,

                    "TestPassword123",

                    "Budi",

                    whatsapp

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
                    tenant.id,

                roles: [
                    "Owner"
                ],

                permissions: [
                    "user.create"
                ]

            });


        // ====================================
        // MOCK REPLY
        // ====================================

        context.reply =
            async (
                message: string
            ) => {

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
        // CEK DATABASE
        // ====================================

        const createdUser =
            await prismaService.client.user.findFirst({

                where: {

                    email,

                    tenantId:
                        tenant.id

                }

            });


        if (!createdUser) {

            throw new Error(
                "❌ User tidak ditemukan di database."
            );

        }


        createdUserId =
            createdUser.id;


        console.log("");
        console.log(
            "✅ User ditemukan di database:"
        );


        console.log({

            id:
                createdUser.id,

            email:
                createdUser.email,

            whatsappNumber:
                createdUser.whatsappNumber,

            tenantId:
                createdUser.tenantId,

            active:
                createdUser.active

        });


        // ====================================
        // PASSWORD CHECK
        // ====================================

        if (
            createdUser.password ===
            "TestPassword123"
        ) {

            throw new Error(
                "❌ Password masih plaintext!"
            );

        }


        console.log(
            "🔐 Password berhasil di-hash."
        );


        // ====================================
        // TENANT CHECK
        // ====================================

        if (
            createdUser.tenantId !==
            tenant.id
        ) {

            throw new Error(
                "❌ User dibuat pada tenant yang salah."
            );

        }


        console.log(
            "🏢 Tenant validation: PASS"
        );


        // ====================================
        // SUCCESS
        // ====================================

        console.log("");
        console.log("========================================");
        console.log("🎉 CREATE USER TEST PASS");
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

        if (createdUserId) {

            try {

                await prismaService.client.user.delete({

                    where: {

                        id:
                            createdUserId

                    }

                });


                console.log(
                    "🧹 Test user berhasil dihapus."
                );


            } catch (cleanupError) {

                console.error(
                    "⚠️ Cleanup gagal:",
                    cleanupError
                );

            }

        }


        // ====================================
        // DISCONNECT
        // ====================================

        await prismaService.client.$disconnect();

    }

}


// ========================================
// RUN
// ========================================

test();