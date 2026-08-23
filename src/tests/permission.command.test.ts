import { prismaService } from "../database/prisma.service";

import { CommandRegistry } from "../apps/bot/registry/CommandRegistry";
import { CommandExecutor } from "../apps/bot/executor/CommandExecutor";
import { CommandContext } from "../apps/bot/context/CommandContext";

import { PermissionCommand } from "../apps/bot/commands/permission.command";


async function test() {

    console.log("");
    console.log("========================================");
    console.log("🧪 TEST PERMISSION DETAIL COMMAND");
    console.log("========================================");

    let testTenantId:
        string | undefined;

    let testPermissionId:
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


        const tenantA =
            await prismaService.client.tenant.findUnique({

                where: {
                    id:
                        owner.tenantId
                }

            });


        if (!tenantA) {

            throw new Error(
                "Tenant utama tidak ditemukan."
            );

        }


        console.log("");
        console.log(
            "🏢 Tenant A:",
            tenantA.id
        );


        // ====================================
        // BUAT PERMISSION TEST TENANT A
        // ====================================

        const testPermission =
            await prismaService.client.permission.create({

                data: {

                    tenantId:
                        tenantA.id,

                    name:
                        `test.detail.permission.${Date.now()}`,

                    description:
                        "Permission untuk test detail"

                }

            });


        testPermissionId =
            testPermission.id;


        console.log(
            "🔑 Permission test:",
            testPermission.name
        );


        // ====================================
        // BUAT TENANT B
        // ====================================

        const tenantB =
            await prismaService.client.tenant.create({

                data: {

                    name:
                        "TEST Permission Detail B",

                    code:
                        `test-permission-detail-${Date.now()}`,

                    description:
                        "Temporary tenant"

                }

            });


        testTenantId =
            tenantB.id;


        console.log(
            "🏢 Tenant B:",
            tenantB.id
        );


        // ====================================
        // PERMISSION TENANT B
        // ====================================

        const foreignPermission =
            await prismaService.client.permission.create({

                data: {

                    tenantId:
                        tenantB.id,

                    name:
                        `foreign.detail.permission.${Date.now()}`,

                    description:
                        "Permission Tenant B"

                }

            });


        console.log(
            "🔑 Permission Tenant B:",
            foreignPermission.name
        );


        // ====================================
        // REGISTRY
        // ====================================

        const registry =
            new CommandRegistry();


        registry.register(
            new PermissionCommand()
        );


        // ====================================
        // EXECUTOR
        // ====================================

        const executor =
            new CommandExecutor(
                registry
            );


        // ====================================
        // DETAIL TEST
        // ====================================

        console.log("");
        console.log(
            "----------------------------------------"
        );

        console.log(
            "🧪 DETAIL PERMISSION"
        );

        console.log(
            "----------------------------------------"
        );


        const context =
            new CommandContext({

                sender:
                    "6289529852918",

                chatId:
                    "TEST_CHAT",

                messageId:
                    "TEST_PERMISSION_DETAIL",

                text:
                    `/permission ${testPermission.name}`,

                args:
                    [testPermission.name],

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
                    ["permission.read"]

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


        await executor.execute(
            context
        );


        if (!replyMessage) {

            throw new Error(
                "❌ Command tidak menghasilkan reply."
            );

        }


        if (
            !replyMessage.includes(
                testPermission.name
            )
        ) {

            throw new Error(
                "❌ Nama permission tidak muncul."
            );

        }


        if (
            !replyMessage.includes(
                testPermission.id
            )
        ) {

            throw new Error(
                "❌ ID permission tidak muncul."
            );

        }


        console.log(
            "✅ Detail permission berhasil ditampilkan."
        );


        // ====================================
        // CROSS TENANT
        // ====================================

        console.log("");
        console.log(
            "----------------------------------------"
        );

        console.log(
            "🧪 CROSS-TENANT CHECK"
        );

        console.log(
            "----------------------------------------"
        );


        const foreignContext =
            new CommandContext({

                sender:
                    "6289529852918",

                chatId:
                    "TEST_CHAT",

                messageId:
                    "TEST_FOREIGN_PERMISSION",

                text:
                    `/permission ${foreignPermission.name}`,

                args:
                    [foreignPermission.name],

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
                    ["permission.read"]

            });


        let foreignReply =
            "";


        foreignContext.reply =
            async (
                message: string
            ) => {

                foreignReply =
                    message;

                console.log("");
                console.log(
                    "📨 CROSS-TENANT REPLY:"
                );

                console.log(
                    message
                );

            };


        await executor.execute(
            foreignContext
        );


        if (
            !foreignReply.includes(
                "tidak ditemukan"
            )
        ) {

            throw new Error(
                "❌ Permission Tenant B bocor ke Tenant A."
            );

        }


        console.log(
            "🔐 Cross-tenant check: PASS"
        );


        // ====================================
        // NOT FOUND
        // ====================================

        const notFoundContext =
            new CommandContext({

                sender:
                    "6289529852918",

                chatId:
                    "TEST_CHAT",

                messageId:
                    "TEST_NOT_FOUND",

                text:
                    "/permission PermissionTidakAda",

                args:
                    ["PermissionTidakAda"],

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
                    ["permission.read"]

            });


        let notFoundReply =
            "";


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
                "❌ Permission tidak ditemukan tidak ditangani."
            );

        }


        console.log(
            "✅ Permission tidak ditemukan ditangani."
        );


        // ====================================
        // SUCCESS
        // ====================================

        console.log("");
        console.log(
            "========================================"
        );

        console.log(
            "🎉 PERMISSION DETAIL TEST PASS"
        );

        console.log(
            "========================================"
        );


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
        // DELETE TEST PERMISSION
        // ====================================

        if (testPermissionId) {

            try {

                await prismaService.client.permission.delete({

                    where: {
                        id:
                            testPermissionId
                    }

                });

                console.log(
                    "🧹 Permission Tenant A berhasil dihapus."
                );

            } catch (error) {

                console.error(
                    "⚠️ Cleanup permission A gagal:",
                    error
                );

            }

        }


        // ====================================
        // CLEANUP TENANT B
        // ====================================

        if (testTenantId) {

            try {

                await prismaService.client.permission.deleteMany({

                    where: {
                        tenantId:
                            testTenantId
                    }

                });

                await prismaService.client.tenant.delete({

                    where: {
                        id:
                            testTenantId
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


        await prismaService.client.$disconnect();

    }

}


test();