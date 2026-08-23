import { prismaService } from "../database/prisma.service";

import { CommandRegistry } from "../apps/bot/registry/CommandRegistry";
import { CommandExecutor } from "../apps/bot/executor/CommandExecutor";
import { CommandContext } from "../apps/bot/context/CommandContext";

import { AssignRolePermissionCommand } from "../apps/bot/commands/assign-role-permission.command";


async function test() {

    console.log("");
    console.log("========================================");
    console.log("🔐 RBAC SECURITY AUDIT");
    console.log("🧪 TEST #2: ROLE PERMISSION BYPASS");
    console.log("========================================");

    let testRoleId: string | undefined;
    let testPermissionId: string | undefined;

    try {

        // ====================================
        // OWNER / TENANT
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

        const tenant =
            await prismaService.client.tenant.findUnique({

                where: {
                    id: owner.tenantId
                }

            });

        if (!tenant) {

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
            "🏢 Tenant:",
            tenant.id
        );


        // ====================================
        // CREATE TEST ROLE
        // ====================================

        const role =
            await prismaService.client.role.create({

                data: {

                    tenantId:
                        tenant.id,

                    name:
                        `Audit Employee ${Date.now()}`,

                    description:
                        "Role untuk security audit"

                }

            });

        testRoleId =
            role.id;


        console.log(
            "🔐 Test Role:",
            role.name
        );


        // ====================================
        // CREATE UNRELATED PERMISSION
        // ====================================

        const permission =
            await prismaService.client.permission.create({

                data: {

                    tenantId:
                        tenant.id,

                    name:
                        `audit.role.permission.${Date.now()}`,

                    description:
                        "Permission untuk security audit"

                }

            });


        testPermissionId =
            permission.id;


        console.log(
            "🔑 Target Permission:",
            permission.name
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
        // UNAUTHORIZED ROLE
        // ====================================

        console.log("");
        console.log("----------------------------------------");
        console.log("🧪 ROLE WITHOUT role.update");
        console.log("----------------------------------------");


        const context =
            new CommandContext({

                sender:
                    "6288888888888",

                chatId:
                    "SECURITY_AUDIT",

                messageId:
                    "RBAC_ROLE_BYPASS_001",

                text:
                    `/assignrolepermission ${role.name} ${permission.name}`,

                args:
                    [
                        role.name,
                        permission.name
                    ],

                isGroup:
                    false,

                isAdmin:
                    false,

                isOwner:
                    false,

                userId:
                    "UNAUTHORIZED_ROLE_TEST_USER",

                tenantId:
                    tenant.id,

                roles:
                    [role.name],

                permissions:
                    [],

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
        // MUST BE DENIED
        // ====================================

        if (
            replyMessage.includes(
                "PERMISSION BERHASIL DIBERIKAN"
            )
        ) {

            throw new Error(
                "🚨 SECURITY FAILURE: Role tanpa role.update berhasil mengubah permission!"
            );

        }


        if (
            replyMessage.includes(
                "Permission berhasil"
            )
        ) {

            throw new Error(
                "🚨 SECURITY FAILURE: Unauthorized role berhasil menjalankan command!"
            );

        }


        console.log(
            "🔐 Role tanpa permission berhasil ditolak."
        );


        // ====================================
        // DATABASE CHECK
        // ====================================

        const roleAfter =
            await prismaService.client.role.findUnique({

                where: {
                    id:
                        role.id
                },

                include: {
                    permissions: true
                }

            });


        if (!roleAfter) {

            throw new Error(
                "❌ Test role tidak ditemukan."
            );

        }


        const assignedPermission =
            roleAfter.permissions.some(
                item =>
                    item.id === permission.id
            );


        if (assignedPermission) {

            throw new Error(
                "🚨 SECURITY FAILURE: Permission berhasil masuk ke role."
            );

        }


        console.log(
            "✅ Database role tidak berubah."
        );


        // ====================================
        // FINAL
        // ====================================

        console.log("");
        console.log("----------------------------------------");
        console.log("🔐 SECURITY RESULT");
        console.log("----------------------------------------");

        console.log(
            "✅ User memiliki role."
        );

        console.log(
            "✅ Role tidak memiliki role.update."
        );

        console.log(
            "✅ Command assignrolepermission ditolak."
        );

        console.log(
            "✅ Database tidak berubah."
        );

        console.log(
            "✅ Role permission bypass: PASS"
        );


        console.log("");
        console.log("========================================");
        console.log("🎉 RBAC ROLE PERMISSION BYPASS TEST PASS");
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


        if (testPermissionId) {

            try {

                await prismaService.client.permission.delete({

                    where: {
                        id:
                            testPermissionId
                    }

                });

                console.log(
                    "🧹 Test permission berhasil dihapus."
                );

            } catch (error) {

                console.error(
                    "⚠️ Cleanup permission gagal:",
                    error
                );

            }

        }


        await prismaService.client.$disconnect();

    }

}


test();