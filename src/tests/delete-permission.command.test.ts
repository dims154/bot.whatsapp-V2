import { prismaService } from "../database/prisma.service";

import { CommandRegistry } from "../apps/bot/registry/CommandRegistry";
import { CommandExecutor } from "../apps/bot/executor/CommandExecutor";
import { CommandContext } from "../apps/bot/context/CommandContext";

import { DeletePermissionCommand } from "../apps/bot/commands/delete-permission.command";


async function test() {

    console.log("");
    console.log("========================================");
    console.log("🧪 TEST DELETE PERMISSION COMMAND");
    console.log("========================================");

    let testPermissionId:
        string | undefined;

    let tenantBId:
        string | undefined;

    let tenantBPermissionId:
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
            "👤 Owner:",
            owner.email
        );

        console.log(
            "🏢 Tenant A:",
            tenantA.id
        );


        // ====================================
        // CREATE TEST PERMISSION A
        // ====================================

        const testPermission =
            await prismaService.client.permission.create({

                data: {

                    tenantId:
                        tenantA.id,

                    name:
                        `test.delete.permission.${Date.now()}`,

                    description:
                        "Permission untuk test delete"

                }

            });


        testPermissionId =
            testPermission.id;


        console.log(
            "🔑 Permission Tenant A:",
            testPermission.name
        );


        // ====================================
        // TENANT B
        // ====================================

        const tenantB =
            await prismaService.client.tenant.create({

                data: {

                    name:
                        "TEST Delete Permission B",

                    code:
                        `test-delete-permission-${Date.now()}`,

                    description:
                        "Temporary tenant"

                }

            });


        tenantBId =
            tenantB.id;


        console.log(
            "🏢 Tenant B:",
            tenantB.id
        );


        // ====================================
        // PERMISSION TENANT B
        // ====================================

        const tenantBPermission =
            await prismaService.client.permission.create({

                data: {

                    tenantId:
                        tenantB.id,

                    name:
                        `foreign.delete.permission.${Date.now()}`,

                    description:
                        "Permission Tenant B"

                }

            });


        tenantBPermissionId =
            tenantBPermission.id;


        console.log(
            "🔑 Permission Tenant B:",
            tenantBPermission.name
        );


        // ====================================
        // REGISTRY
        // ====================================

        const registry =
            new CommandRegistry();

        registry.register(
            new DeletePermissionCommand()
        );


        // ====================================
        // EXECUTOR
        // ====================================

        const executor =
            new CommandExecutor(
                registry
            );


        // ====================================
        // DELETE SUCCESS
        // ====================================

        console.log("");
        console.log("----------------------------------------");
        console.log("🧪 DELETE PERMISSION → SUCCESS");
        console.log("----------------------------------------");


        const context =
            new CommandContext({

                sender:
                    "6289529852918",

                chatId:
                    "TEST_CHAT",

                messageId:
                    "TEST_DELETE_PERMISSION",

                text:
                    `/deletepermission ${testPermission.name}`,

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
                    ["permission.delete"]

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
                "PERMISSION BERHASIL DIHAPUS"
            )
        ) {

            throw new Error(
                "❌ Permission gagal dihapus."
            );

        }


        console.log(
            "✅ Command delete permission berhasil."
        );


        // ====================================
        // DATABASE CHECK
        // ====================================

        const deletedPermission =
            await prismaService.client.permission.findUnique({

                where: {
                    id:
                        testPermission.id
                }

            });


        if (deletedPermission) {

            throw new Error(
                "❌ Permission masih ditemukan di database."
            );

        }


        console.log(
            "✅ Permission benar-benar terhapus dari database."
        );


        // ====================================
        // MARK CLEANED
        // ====================================

        testPermissionId =
            undefined;


        // ====================================
        // CROSS TENANT
        // ====================================

        console.log("");
        console.log("----------------------------------------");
        console.log("🧪 CROSS-TENANT DELETE");
        console.log("----------------------------------------");


        const foreignContext =
            new CommandContext({

                sender:
                    "6289529852918",

                chatId:
                    "TEST_CHAT",

                messageId:
                    "TEST_FOREIGN_DELETE_PERMISSION",

                text:
                    `/deletepermission ${tenantBPermission.name}`,

                args:
                    [tenantBPermission.name],

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
                    ["permission.delete"]

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
                "❌ Permission Tenant B dapat diakses dari Tenant A."
            );

        }


        console.log(
            "🔐 Cross-tenant delete check: PASS"
        );


        // ====================================
        // DATABASE CROSS-TENANT CHECK
        // ====================================

        const foreignStillExists =
            await prismaService.client.permission.findUnique({

                where: {
                    id:
                        tenantBPermission.id
                }

            });


        if (!foreignStillExists) {

            throw new Error(
                "❌ Permission Tenant B ikut terhapus."
            );

        }


        console.log(
            "✅ Permission Tenant B tetap aman."
        );


        // ====================================
        // NOT FOUND
        // ====================================

        console.log("");
        console.log("----------------------------------------");
        console.log("🧪 PERMISSION TIDAK DITEMUKAN");
        console.log("----------------------------------------");


        const notFoundContext =
            new CommandContext({

                sender:
                    "6289529852918",

                chatId:
                    "TEST_CHAT",

                messageId:
                    "TEST_DELETE_PERMISSION_NOT_FOUND",

                text:
                    "/deletepermission PermissionTidakAda",

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
                    ["permission.delete"]

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
        console.log("========================================");
        console.log("🎉 DELETE PERMISSION TEST PASS");
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
        // CLEANUP PERMISSION A
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
                    "🧹 Test permission Tenant A berhasil dihapus."
                );

            } catch (error) {

                console.error(
                    "⚠️ Cleanup permission A gagal:",
                    error
                );

            }

        }


        // ====================================
        // CLEANUP PERMISSION B
        // ====================================

        if (tenantBPermissionId) {

            try {

                await prismaService.client.permission.delete({

                    where: {
                        id:
                            tenantBPermissionId
                    }

                });

                console.log(
                    "🧹 Permission Tenant B berhasil dihapus."
                );

            } catch (error) {

                console.error(
                    "⚠️ Cleanup permission B gagal:",
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


        await prismaService.client.$disconnect();

    }

}


test();