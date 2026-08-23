import { prismaService } from "../database/prisma.service";

import { CommandRegistry } from "../apps/bot/registry/CommandRegistry";
import { CommandExecutor } from "../apps/bot/executor/CommandExecutor";
import { CommandContext } from "../apps/bot/context/CommandContext";

import { AssignRolePermissionCommand } from "../apps/bot/commands/assign-role-permission.command";


async function test() {

    console.log("");
    console.log("========================================");
    console.log("🧪 TEST ASSIGN ROLE PERMISSION COMMAND");
    console.log("========================================");

    let testTenantId: string | undefined;
    let testRoleId: string | undefined;
    let testPermissionId: string | undefined;
    let foreignPermissionId: string | undefined;

    try {

        // ====================================
        // TENANT UTAMA
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
                "Tenant utama tidak ditemukan."
            );

        }


        console.log("");
        console.log(
            "🏢 Tenant A:",
            tenantA.id
        );


        // ====================================
        // BUAT TENANT TEST B
        // ====================================

        const tenantB =
            await prismaService.client.tenant.create({

                data: {

                    name:
                        "TEST Permission Tenant B",

                    code:
                        `test-permission-${Date.now()}`,

                    description:
                        "Temporary tenant for permission isolation test"

                }

            });


        testTenantId =
            tenantB.id;


        console.log(
            "🏢 Tenant B:",
            tenantB.id
        );


        // ====================================
        // BUAT ROLE DI TENANT A
        // ====================================

        const testRole =
            await prismaService.client.role.create({

                data: {

                    tenantId:
                        tenantA.id,

                    name:
                        `Test Manager ${Date.now()}`,

                    description:
                        "Temporary role for assign permission test"

                }

            });


        testRoleId =
            testRole.id;


        console.log(
            "🔐 Role Tenant A:",
            testRole.name
        );


        // ====================================
        // BUAT PERMISSION DI TENANT A
        // ====================================

        const testPermission =
            await prismaService.client.permission.create({

                data: {

                    tenantId:
                        tenantA.id,

                    name:
                        `test.permission.${Date.now()}`,

                    description:
                        "Permission untuk test assignment"

                }

            });


        testPermissionId =
            testPermission.id;


        console.log(
            "🔑 Permission Tenant A:",
            testPermission.name
        );


        // ====================================
        // BUAT PERMISSION DI TENANT B
        // ====================================

        const foreignPermission =
            await prismaService.client.permission.create({

                data: {

                    tenantId:
                        tenantB.id,

                    name:
                        `foreign.permission.${Date.now()}`,

                    description:
                        "Permission Tenant B untuk cross-tenant test"

                }

            });


        foreignPermissionId =
            foreignPermission.id;


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
            new AssignRolePermissionCommand()
        );


        // ====================================
        // EXECUTOR
        // ====================================

        const executor =
            new CommandExecutor(
                registry
            );


        // ====================================
        // TEST 1
        // ASSIGN PERMISSION NORMAL
        // ====================================

        console.log("");
        console.log(
            "----------------------------------------"
        );

        console.log(
            "🧪 ASSIGN PERMISSION → SUCCESS"
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
                    "TEST_ASSIGN_PERMISSION",

                text:
                    `/assignrolepermission ${testRole.name} ${testPermission.name}`,

                args: [
                    testRole.name,
                    testPermission.name
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
                    ["role.update"]

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
                "PERMISSION BERHASIL"
            )
        ) {

            throw new Error(
                "❌ Permission gagal diberikan ke role."
            );

        }


        console.log(
            "✅ Permission berhasil diberikan."
        );


        // ====================================
        // DATABASE VALIDATION
        // ====================================

        const updatedRole =
            await prismaService.client.role.findUnique({

                where: {
                    id:
                        testRole.id
                },

                include: {
                    permissions: true
                }

            });


        if (!updatedRole) {

            throw new Error(
                "❌ Role test tidak ditemukan."
            );

        }


        const assignedPermission =
            updatedRole.permissions.some(
                permission =>
                    permission.id ===
                    testPermission.id
            );


        if (!assignedPermission) {

            throw new Error(
                "❌ Permission tidak tersimpan pada database."
            );

        }


        console.log(
            "✅ Permission tersimpan di database."
        );


        // ====================================
        // TEST 2
        // DUPLICATE PERMISSION
        // ====================================

        console.log("");
        console.log(
            "----------------------------------------"
        );

        console.log(
            "🧪 DUPLICATE PERMISSION"
        );

        console.log(
            "----------------------------------------"
        );


        const duplicateContext =
            new CommandContext({

                sender:
                    "6289529852918",

                chatId:
                    "TEST_CHAT",

                messageId:
                    "TEST_DUPLICATE_PERMISSION",

                text:
                    `/assignrolepermission ${testRole.name} ${testPermission.name}`,

                args: [
                    testRole.name,
                    testPermission.name
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
                    ["role.update"]

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
                "sudah dimiliki"
            )
        ) {

            throw new Error(
                "❌ Duplicate permission tidak ditolak."
            );

        }


        console.log(
            "✅ Duplicate permission berhasil ditolak."
        );


        // ====================================
        // TEST 3
        // CROSS TENANT PERMISSION
        // ====================================

        console.log("");
        console.log(
            "----------------------------------------"
        );

        console.log(
            "🧪 CROSS-TENANT PERMISSION"
        );

        console.log(
            "----------------------------------------"
        );


        const crossTenantContext =
            new CommandContext({

                sender:
                    "6289529852918",

                chatId:
                    "TEST_CHAT",

                messageId:
                    "TEST_CROSS_TENANT_PERMISSION",

                text:
                    `/assignrolepermission ${testRole.name} ${foreignPermission.name}`,

                args: [
                    testRole.name,
                    foreignPermission.name
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
                    ["role.update"]

            });


        let crossTenantReply =
            "";


        crossTenantContext.reply =
            async (
                message: string
            ) => {

                crossTenantReply =
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
            crossTenantContext
        );


        if (
            !crossTenantReply.includes(
                "tidak ditemukan"
            )
        ) {

            throw new Error(
                "❌ Permission Tenant B berhasil digunakan oleh Tenant A."
            );

        }


        console.log(
            "✅ Cross-tenant permission berhasil ditolak."
        );


        // ====================================
        // DATABASE CROSS-TENANT VALIDATION
        // ====================================

        const roleAfterCrossTenant =
            await prismaService.client.role.findUnique({

                where: {
                    id:
                        testRole.id
                },

                include: {
                    permissions: true
                }

            });


        if (!roleAfterCrossTenant) {

            throw new Error(
                "❌ Role test hilang."
            );

        }


        const leakedPermission =
            roleAfterCrossTenant.permissions.some(
                permission =>
                    permission.id ===
                    foreignPermission.id
            );


        if (leakedPermission) {

            throw new Error(
                "❌ Permission Tenant B bocor ke Role Tenant A."
            );

        }


        console.log(
            "🔐 Database cross-tenant check: PASS"
        );


        // ====================================
        // TEST 4
        // ROLE TIDAK DITEMUKAN
        // ====================================

        console.log("");
        console.log(
            "----------------------------------------"
        );

        console.log(
            "🧪 ROLE TIDAK DITEMUKAN"
        );

        console.log(
            "----------------------------------------"
        );


        const notFoundRoleContext =
            new CommandContext({

                sender:
                    "6289529852918",

                chatId:
                    "TEST_CHAT",

                messageId:
                    "TEST_ROLE_NOT_FOUND",

                text:
                    `/assignrolepermission RoleTidakAda ${testPermission.name}`,

                args: [
                    "RoleTidakAda",
                    testPermission.name
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
                    ["role.update"]

            });


        let notFoundRoleReply =
            "";


        notFoundRoleContext.reply =
            async (
                message: string
            ) => {

                notFoundRoleReply =
                    message;

                console.log("");
                console.log(
                    "📨 ROLE NOT FOUND REPLY:"
                );

                console.log(
                    message
                );

            };


        await executor.execute(
            notFoundRoleContext
        );


        if (
            !notFoundRoleReply.includes(
                "tidak ditemukan"
            )
        ) {

            throw new Error(
                "❌ Role yang tidak ada tidak ditangani."
            );

        }


        console.log(
            "✅ Role tidak ditemukan ditangani."
        );


        // ====================================
        // TEST 5
        // PERMISSION TIDAK DITEMUKAN
        // ====================================

        console.log("");
        console.log(
            "----------------------------------------"
        );

        console.log(
            "🧪 PERMISSION TIDAK DITEMUKAN"
        );

        console.log(
            "----------------------------------------"
        );


        const notFoundPermissionContext =
            new CommandContext({

                sender:
                    "6289529852918",

                chatId:
                    "TEST_CHAT",

                messageId:
                    "TEST_PERMISSION_NOT_FOUND",

                text:
                    `/assignrolepermission ${testRole.name} PermissionTidakAda`,

                args: [
                    testRole.name,
                    "PermissionTidakAda"
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
                    ["role.update"]

            });


        let notFoundPermissionReply =
            "";


        notFoundPermissionContext.reply =
            async (
                message: string
            ) => {

                notFoundPermissionReply =
                    message;

                console.log("");
                console.log(
                    "📨 PERMISSION NOT FOUND REPLY:"
                );

                console.log(
                    message
                );

            };


        await executor.execute(
            notFoundPermissionContext
        );


        if (
            !notFoundPermissionReply.includes(
                "tidak ditemukan"
            )
        ) {

            throw new Error(
                "❌ Permission yang tidak ada tidak ditangani."
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
            "🎉 ASSIGN ROLE PERMISSION TEST PASS"
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
        // CLEANUP ROLE
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
        // CLEANUP PERMISSION B
        // ====================================

        if (foreignPermissionId) {

            try {

                await prismaService.client.permission.delete({

                    where: {
                        id:
                            foreignPermissionId
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