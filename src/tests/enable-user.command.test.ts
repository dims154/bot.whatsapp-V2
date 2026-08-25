import { prismaService } from "../database/prisma.service";

import { CommandRegistry } from "../apps/bot/registry/CommandRegistry";
import { CommandExecutor } from "../apps/bot/executor/CommandExecutor";
import { CommandContext } from "../apps/bot/context/CommandContext";

import { EnableUserCommand } from "../apps/bot/commands/enable-user.command";


async function test() {

    console.log("");
    console.log("========================================");
    console.log("🧪 TEST ENABLE USER COMMAND");
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
        // BUAT USER TEST NONAKTIF
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
                        `enable-user-${Date.now()}@test.local`,

                    password:
                        "TEST_HASHED_PASSWORD",

                    firstName:
                        "Enable",

                    lastName:
                        "Test User",

                    whatsappNumber:
                        whatsapp,

                    active:
                        false

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
        // PASTIKAN AWAL NONAKTIF
        // ====================================

        if (testUser.active) {

            throw new Error(
                "❌ User test seharusnya nonaktif."
            );

        }


        // ====================================
        // PASTIKAN ACTIVE-ONLY
        // BELUM MENEMUKAN USER
        // ====================================

        const activeBefore =
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


        if (activeBefore) {

            throw new Error(
                "❌ User nonaktif ditemukan sebagai user aktif sebelum enable."
            );

        }


        console.log(
            "✅ User belum aktif sebelum command."
        );


        // ====================================
        // REGISTRY
        // ====================================

        const registry =
            new CommandRegistry();


        registry.register(
            new EnableUserCommand()
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
                    `/enableuser ${whatsapp}`,

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
                "❌ User test tidak ditemukan setelah enable."
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
        // DATABASE HARUS TRUE
        // ====================================

        if (!updatedUser.active) {

            throw new Error(
                "❌ User masih nonaktif di database."
            );

        }


        console.log(
            "✅ Database berhasil berubah menjadi active."
        );


        // ====================================
        // FIND BY WHATSAPP
        // ACTIVE ONLY
        // HARUS MENEMUKAN USER
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


        if (!activeUser) {

            throw new Error(
                "❌ User aktif tidak ditemukan melalui active-only lookup."
            );

        }


        console.log(
            "✅ User kembali ditemukan melalui active-only lookup."
        );


        // ====================================
        // FINAL STATUS
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
                "❌ User tidak ditemukan melalui all-status lookup."
            );

        }


        if (!anyStatusUser.active) {

            throw new Error(
                "❌ User ditemukan tetapi masih nonaktif."
            );

        }


        console.log(
            "✅ All-status lookup juga menunjukkan user aktif."
        );


        // ====================================
        // SUCCESS
        // ====================================

        console.log("");
        console.log("========================================");
        console.log("🎉 ENABLE USER TEST PASS");
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