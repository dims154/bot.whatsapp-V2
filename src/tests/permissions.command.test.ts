import { prismaService } from "../database/prisma.service";

import { CommandRegistry } from "../apps/bot/registry/CommandRegistry";
import { CommandExecutor } from "../apps/bot/executor/CommandExecutor";
import { CommandContext } from "../apps/bot/context/CommandContext";

import { PermissionsCommand } from "../apps/bot/commands/permissions.command";


async function test() {

    console.log("");
    console.log("========================================");
    console.log("🧪 TEST PERMISSIONS COMMAND");
    console.log("========================================");

    let testTenantId:
        string | undefined;

    let tenantBPermissionId:
        string | undefined;


    try {

        // ====================================
        // OWNER / TENANT A
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
        // BUAT TENANT B
        // ====================================

        const tenantB =
            await prismaService.client.tenant.create({

                data: {

                    name:
                        "TEST Permission List Tenant B",

                    code:
                        `test-permissions-list-${Date.now()}`,

                    description:
                        "Temporary tenant for permission list isolation"

                }

            });


        testTenantId =
            tenantB.id;


        console.log(
            "🏢 Tenant B:",
            tenantB.id
        );


        // ====================================
        // BUAT PERMISSION TENANT B
        // ====================================

        const tenantBPermission =
            await prismaService.client.permission.create({

                data: {

                    tenantId:
                        tenantB.id,

                    name:
                        `tenant-b.secret.permission.${Date.now()}`,

                    description:
                        "Permission rahasia Tenant B"

                }

            });


        tenantBPermissionId =
            tenantBPermission.id;


        console.log(
            "🔑 Permission Tenant B:",
            tenantBPermission.name
        );


        // ====================================
        // CEK PERMISSION TENANT A
        // ====================================

        const permissionsA =
            await prismaService.client.permission.findMany({

                where: {
                    tenantId:
                        tenantA.id
                }

            });


        console.log(
            "🔑 Permission Tenant A:",
            permissionsA.length
        );


        // ====================================
        // REGISTRY
        // ====================================

        const registry =
            new CommandRegistry();


        registry.register(
            new PermissionsCommand()
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
                    "TEST_PERMISSIONS",

                text:
                    "/permissions",

                args:
                    [],

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
        // RESPONSE CHECK
        // ====================================

        if (!replyMessage) {

            throw new Error(
                "❌ Command tidak menghasilkan reply."
            );

        }


        if (
            !replyMessage.includes(
                "DAFTAR PERMISSION"
            )
        ) {

            throw new Error(
                "❌ Header daftar permission tidak ditemukan."
            );

        }


        console.log(
            "✅ /permissions berhasil dijalankan."
        );


        // ====================================
        // TENANT ISOLATION
        // ====================================

        if (
            replyMessage.includes(
                tenantBPermission.name
            )
        ) {

            throw new Error(
                "❌ Permission Tenant B bocor ke Tenant A."
            );

        }


        console.log(
            "✅ Permission Tenant B tidak terlihat Tenant A."
        );


        // ====================================
        // DATABASE VALIDATION
        // ====================================

        const tenantBVisible =
            permissionsA.some(
                permission =>
                    permission.id ===
                    tenantBPermission.id
            );


        if (tenantBVisible) {

            throw new Error(
                "❌ Database Tenant A mengandung permission Tenant B."
            );

        }


        console.log(
            "🔐 Database cross-tenant check: PASS"
        );


        // ====================================
        // COUNT VALIDATION
        // ====================================

        const expectedCount =
            permissionsA.length;


        if (
            !replyMessage.includes(
                `Total: ${expectedCount}`
            )
        ) {

            throw new Error(
                `❌ Total permission tidak sesuai. Expected: ${expectedCount}`
            );

        }


        console.log(
            "✅ Total permission sesuai database."
        );


        // ====================================
        // SUCCESS
        // ====================================

        console.log("");
        console.log(
            "========================================"
        );

        console.log(
            "🎉 PERMISSIONS COMMAND TEST PASS"
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
                    "⚠️ Cleanup permission gagal:",
                    error
                );

            }

        }


        // ====================================
        // CLEANUP TENANT B
        // ====================================

        if (testTenantId) {

            try {

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
                    "⚠️ Cleanup tenant B gagal:",
                    error
                );

            }

        }


        await prismaService.client.$disconnect();

    }

}


test();