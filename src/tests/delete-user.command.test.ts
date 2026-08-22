import { prismaService } from "../database/prisma.service";

import { CommandRegistry } from "../apps/bot/registry/CommandRegistry";
import { CommandExecutor } from "../apps/bot/executor/CommandExecutor";
import { CommandContext } from "../apps/bot/context/CommandContext";

import { DeleteUserCommand } from "../apps/bot/commands/delete-user.command";


async function test() {

    console.log("");
    console.log("========================================");
    console.log("🧪 TEST DELETE USER COMMAND");
    console.log("========================================");

    let createdUserId:
        string | undefined;

    let createdUserWhatsApp:
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


        console.log("");
        console.log(
            "🏢 Tenant:",
            tenant.id
        );

        console.log(
            "👤 Owner:",
            owner.email
        );


        // ====================================
        // BUAT USER TEST
        // ====================================

        const whatsapp =
            `628${Date.now()
                .toString()
                .slice(-10)}`;


        createdUserWhatsApp =
            whatsapp;


        const testUser =
            await prismaService.client.user.create({

                data: {

                    tenantId:
                        tenant.id,

                    email:
                        `delete-user-${Date.now()}@test.local`,

                    password:
                        "TEST_HASHED_PASSWORD",

                    firstName:
                        "Delete",

                    lastName:
                        "Test User",

                    whatsappNumber:
                        whatsapp,

                    active:
                        true

                }

            });


        createdUserId =
            testUser.id;


        console.log(
            "👤 User test:",
            testUser.id
        );

        console.log(
            "📱 WhatsApp:",
            whatsapp
        );


        // ====================================
        // VERIFY USER EXISTS
        // ====================================

        const beforeDelete =
            await prismaService.client.user.findUnique({

                where: {

                    id:
                        testUser.id

                }

            });


        if (!beforeDelete) {

            throw new Error(
                "❌ User test tidak ditemukan sebelum delete."
            );

        }


        console.log(
            "✅ User ditemukan sebelum delete."
        );


        // ====================================
        // REGISTRY
        // ====================================

        const registry =
            new CommandRegistry();


        registry.register(
            new DeleteUserCommand()
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
                    `/deleteuser ${whatsapp}`,

                args: [
                    whatsapp
                ],

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

                roles: [
                    "Owner"
                ],

                permissions: [
                    "user.delete"
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
        // VERIFY USER DELETED
        // ====================================

        const afterDelete =
            await prismaService.client.user.findUnique({

                where: {

                    id:
                        testUser.id

                }

            });


        if (afterDelete) {

            throw new Error(
                "❌ User masih ada di database setelah delete."
            );

        }


        console.log(
            "✅ User sudah tidak ada di database."
        );


        // ====================================
        // VERIFY WHATSAPP
        // ====================================

        const byWhatsApp =
            await prismaService.client.user.findFirst({

                where: {

                    whatsappNumber:
                        createdUserWhatsApp,

                    tenantId:
                        tenant.id

                }

            });


        if (byWhatsApp) {

            throw new Error(
                "❌ User masih ditemukan berdasarkan WhatsApp."
            );

        }


        console.log(
            "✅ User tidak ditemukan berdasarkan WhatsApp."
        );


        // ====================================
        // SUPAYA FINALLY TIDAK DELETE LAGI
        // ====================================

        createdUserId =
            undefined;


        // ====================================
        // SUCCESS
        // ====================================

        console.log("");
        console.log("========================================");
        console.log("🎉 DELETE USER TEST PASS");
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
        // CLEANUP JIKA MASIH ADA
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
                    "🧹 Test user berhasil dibersihkan."
                );


            } catch (cleanupError) {

                console.error(
                    "⚠️ Cleanup gagal:",
                    cleanupError
                );

            }

        }


        await prismaService.client.$disconnect();

    }

}


test();