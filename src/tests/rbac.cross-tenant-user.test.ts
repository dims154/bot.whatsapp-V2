import { prismaService } from "../database/prisma.service";

import { CommandRegistry } from "../apps/bot/registry/CommandRegistry";
import { CommandExecutor } from "../apps/bot/executor/CommandExecutor";
import { CommandContext } from "../apps/bot/context/CommandContext";

import { DisableUserCommand } from "../apps/bot/commands/disable-user.command";


async function test() {

    console.log("");
    console.log("========================================");
    console.log("🔐 RBAC SECURITY AUDIT");
    console.log("🧪 TEST #3: CROSS-TENANT USER");
    console.log("========================================");

    let tenantBId: string | undefined;
    let testUserId: string | undefined;

    try {

        // ====================================
        // OWNER / TENANT A
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


        const tenantA =
            await prismaService.client.tenant.findUnique({

                where: {
                    id: owner.tenantId
                }

            });

        if (!tenantA) {

            throw new Error(
                "Tenant A tidak ditemukan."
            );

        }


        console.log("");
        console.log(
            "👤 Owner Tenant A:",
            owner.email
        );

        console.log(
            "🏢 Tenant A:",
            tenantA.id
        );


        // ====================================
        // CREATE TENANT B
        // ====================================

        const tenantB =
            await prismaService.client.tenant.create({

                data: {

                    name:
                        `SECURITY AUDIT TENANT B ${Date.now()}`,

                    code:
                        `security-audit-b-${Date.now()}`,

                    description:
                        "Temporary tenant for cross-tenant security test"

                }

            });


        tenantBId =
            tenantB.id;


        console.log(
            "🏢 Tenant B:",
            tenantB.id
        );


        // ====================================
        // CREATE USER TENANT B
        // ====================================

        // Gunakan variabel ini karena tipenya
        // pasti string, bukan string | null.
        const whatsappNumber =
            `628777${Date.now()
                .toString()
                .slice(-7)}`;


        const testUser =
            await prismaService.client.user.create({

                data: {

                    tenantId:
                        tenantB.id,

                    firstName:
                        "Cross",

                    lastName:
                        "Tenant Target",

                    email:
                        `cross-tenant-${Date.now()}@test.local`,

                    whatsappNumber:
                        whatsappNumber,

                    password:
                        "security-audit-test-password",

                    active:
                        true

                }

            });


        testUserId =
            testUser.id;


        console.log(
            "👤 Target User Tenant B:",
            testUser.id
        );

        console.log(
            "📧 Email:",
            testUser.email
        );

        console.log(
            "📱 WhatsApp:",
            whatsappNumber
        );

        console.log(
            "📊 Status awal: 🟢 Aktif"
        );


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
        // CROSS-TENANT ATTACK
        // ====================================

        console.log("");
        console.log("----------------------------------------");
        console.log("🧪 TENANT A → USER TENANT B");
        console.log("----------------------------------------");


        const context =
            new CommandContext({

                sender:
                    "6289529852918",

                chatId:
                    "SECURITY_AUDIT",

                messageId:
                    "RBAC_CROSS_TENANT_USER_001",

                text:
                    `/disableuser ${whatsappNumber}`,

                args:
                    [
                        whatsappNumber
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
                    tenantA.id,

                roles:
                    ["Owner"],

                permissions:
                    ["user.update"]

            });


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


        console.log(
            "✅ CommandExecutor selesai."
        );


        // ====================================
        // RESPONSE MUST NOT BE SUCCESS
        // ====================================

        if (
            replyMessage.includes(
                "USER BERHASIL DINONAKTIFKAN"
            )
        ) {

            throw new Error(
                "🚨 SECURITY FAILURE: Tenant A berhasil menonaktifkan User Tenant B!"
            );

        }


        console.log(
            "🔐 Cross-tenant command berhasil ditolak."
        );


        // ====================================
        // DATABASE CHECK
        // ====================================

        const userAfter =
            await prismaService.client.user.findUnique({

                where: {
                    id:
                        testUser.id
                }

            });


        if (!userAfter) {

            throw new Error(
                "❌ Target User Tenant B hilang dari database."
            );

        }


        // ====================================
        // ACTIVE STATUS CHECK
        // ====================================

        if (
            userAfter.active !== true
        ) {

            throw new Error(
                "🚨 SECURITY FAILURE: User Tenant B berubah menjadi inactive!"
            );

        }


        console.log(
            "✅ User Tenant B tetap aktif."
        );


        // ====================================
        // TENANT OWNERSHIP CHECK
        // ====================================

        if (
            userAfter.tenantId !==
            tenantB.id
        ) {

            throw new Error(
                "🚨 SECURITY FAILURE: Tenant user berubah!"
            );

        }


        console.log(
            "🔐 Tenant ownership tetap benar."
        );


        // ====================================
        // TENANT A LOOKUP CHECK
        // ====================================

        const lookupFromTenantA =
            await prismaService.client.user.findFirst({

                where: {

                    id:
                        testUser.id,

                    tenantId:
                        tenantA.id

                }

            });


        if (lookupFromTenantA) {

            throw new Error(
                "🚨 SECURITY FAILURE: Tenant A dapat menemukan User Tenant B!"
            );

        }


        console.log(
            "✅ User Tenant B tidak dapat ditemukan dari Tenant A."
        );


        // ====================================
        // TENANT B LOOKUP CHECK
        // ====================================

        const lookupFromTenantB =
            await prismaService.client.user.findFirst({

                where: {

                    id:
                        testUser.id,

                    tenantId:
                        tenantB.id

                }

            });


        if (!lookupFromTenantB) {

            throw new Error(
                "🚨 SECURITY FAILURE: User Tenant B tidak dapat ditemukan dari tenant pemiliknya."
            );

        }


        console.log(
            "✅ User tetap terikat pada Tenant B."
        );


        // ====================================
        // FINAL SECURITY RESULT
        // ====================================

        console.log("");
        console.log("----------------------------------------");
        console.log("🔐 SECURITY RESULT");
        console.log("----------------------------------------");

        console.log(
            "✅ Tenant A memiliki permission user.update."
        );

        console.log(
            "✅ Target user berada di Tenant B."
        );

        console.log(
            "✅ Tenant A tidak dapat memodifikasi User Tenant B."
        );

        console.log(
            "✅ Database Tenant B tidak berubah."
        );

        console.log(
            "✅ Tenant ownership tetap aman."
        );

        console.log(
            "✅ Cross-tenant user isolation: PASS"
        );


        console.log("");
        console.log("========================================");
        console.log("🎉 RBAC CROSS-TENANT USER TEST PASS");
        console.log("========================================");


    } catch (error) {

        console.error("");
        console.error(
            "❌ SECURITY TEST ERROR:"
        );

        console.error(
            error
        );

        process.exitCode =
            1;

    } finally {

        // ====================================
        // CLEANUP USER
        // ====================================

        if (testUserId) {

            try {

                await prismaService.client.user.delete({

                    where: {
                        id:
                            testUserId
                    }

                });

                console.log(
                    "🧹 Test user berhasil dihapus."
                );

            } catch (error) {

                console.error(
                    "⚠️ Cleanup user gagal:",
                    error
                );

            }

        }


        // ====================================
        // CLEANUP TENANT B
        // ====================================

        if (tenantBId) {

            try {

                await prismaService.client.tenant.delete({

                    where: {
                        id:
                            tenantBId
                    }

                });

                console.log(
                    "🧹 Tenant B berhasil dihapus."
                );

            } catch (error) {

                console.error(
                    "⚠️ Cleanup Tenant B gagal:",
                    error
                );

            }

        }


        // ====================================
        // DISCONNECT
        // ====================================

        await prismaService.client.$disconnect();

    }

}


test();