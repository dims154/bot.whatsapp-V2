import { prismaService } from "../database/prisma.service";

import { CommandRegistry } from "../apps/bot/registry/CommandRegistry";
import { CommandExecutor } from "../apps/bot/executor/CommandExecutor";
import { CommandContext } from "../apps/bot/context/CommandContext";

import { DisableUserCommand } from "../apps/bot/commands/disable-user.command";


async function test() {

    console.log("");
    console.log("========================================");
    console.log("🧪 TEST DISABLE USER COMMAND");
    console.log("========================================");

    let createdUserId:
        string | undefined;


    try {

        // ====================================
        // OWNER UTAMA
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


        // ====================================
        // BUAT USER TEST
        // ====================================

        const whatsapp =
            `628${Date.now()
                .toString()
                .slice(-10)}`;


        const testUser =
            await prismaService.client.user.create({

                data: {

                    tenantId:
                        tenant.id,

                    email:
                        `disable-user-${Date.now()}@test.local`,

                    password:
                        "TEST_HASHED_PASSWORD",

                    firstName:
                        "Disable",

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

        console.log(
            "📊 Status awal:",
            testUser.active
                ? "🟢 Aktif"
                : "🔴 Nonaktif"
        );


        // ====================================
        // PASTIKAN AWAL AKTIF
        // ====================================

        if (!testUser.active) {

            throw new Error(
                "❌ User test seharusnya aktif."
            );

        }


        // ====================================
        // REGISTRY
        // ====================================

        const registry =
            new CommandRegistry();


        registry.register(
            new DisableUserCommand()
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
                    `/disableuser ${whatsapp}`,

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

                    "user.update"

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
        // VERIFY DATABASE
        // ====================================

        const updatedUser =
            await prismaService.client.user.findUnique({

                where: {

                    id:
                        testUser.id

                }

            });


        if (!updatedUser) {

            throw new Error(
                "❌ User test tidak ditemukan setelah disable."
            );

        }


        console.log("");
        console.log(
            "📊 Status database:",
            updatedUser.active
                ? "🟢 Aktif"
                : "🔴 Nonaktif"
        );


        // ====================================
        // DATABASE HARUS FALSE
        // ====================================

        if (updatedUser.active) {

            throw new Error(
                "❌ User masih aktif di database."
            );

        }


        console.log(
            "✅ Database berhasil berubah menjadi inactive."
        );


        // ====================================
        // FIND BY WHATSAPP
        // ACTIVE ONLY
        // ====================================

        const activeUser =
            await prismaService.client.user.findFirst({

                where: {

                    whatsappNumber:
                        whatsapp,

                    tenantId:
                        tenant.id,

                    active:
                        true

                }

            });


        if (activeUser) {

            throw new Error(
                "❌ User nonaktif masih ditemukan sebagai user aktif."
            );

        }


        console.log(
            "✅ User tidak ditemukan melalui active-only lookup."
        );


        // ====================================
        // FIND ANY STATUS
        // ====================================

        const anyStatusUser =
            await prismaService.client.user.findFirst({

                where: {

                    whatsappNumber:
                        whatsapp,

                    tenantId:
                        tenant.id

                }

            });


        if (!anyStatusUser) {

            throw new Error(
                "❌ User seharusnya masih ada dengan status nonaktif."
            );

        }


        if (anyStatusUser.active) {

            throw new Error(
                "❌ User ditemukan tetapi status masih aktif."
            );

        }


        console.log(
            "✅ User masih dapat ditemukan sebagai user nonaktif."
        );


        // ====================================
        // SUCCESS
        // ====================================

        console.log("");
        console.log("========================================");
        console.log("🎉 DISABLE USER TEST PASS");
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


        await prismaService.client.$disconnect();

    }

}


test();