import { prismaService } from "../database/prisma.service";

import { CommandRegistry } from "../apps/bot/registry/CommandRegistry";
import { CommandExecutor } from "../apps/bot/executor/CommandExecutor";
import { CommandContext } from "../apps/bot/context/CommandContext";

import { AssignRolePermissionCommand } from "../apps/bot/commands/assign-role-permission.command";


async function test() {

    console.log("");
    console.log("========================================");
    console.log("🔐 RBAC SECURITY AUDIT");
    console.log("🧪 TEST #7: PRIVILEGE ESCALATION");
    console.log("========================================");

    let testUserId: string | undefined;
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


        const tenantId =
            owner.tenantId;


        console.log("");
        console.log(
            "👤 Owner:",
            owner.email
        );

        console.log(
            "🏢 Tenant:",
            tenantId
        );


        // ====================================
        // FIND role.read
        // ====================================

        const roleReadPermission =
            await prismaService.client.permission.findFirst({

                where: {

                    tenantId:
                        tenantId,

                    name:
                        "role.read"

                }

            });


        if (!roleReadPermission) {

            throw new Error(
                "Permission role.read tidak ditemukan."
            );

        }


        // ====================================
        // CREATE TEST PERMISSION
        // ====================================

        const permissionName =
            `audit.privilege.escalation.${Date.now()}`;


        const testPermission =
            await prismaService.client.permission.create({

                data: {

                    tenantId:
                        tenantId,

                    name:
                        permissionName,

                    description:
                        "Permission khusus privilege escalation audit"

                }

            });


        testPermissionId =
            testPermission.id;


        console.log(
            "🔑 Target Permission:",
            testPermission.name
        );


        // ====================================
        // CREATE TARGET ROLE
        // ====================================

        const roleName =
            `Privilege Audit Role ${Date.now()}`;


        const testRole =
            await prismaService.client.role.create({

                data: {

                    tenantId:
                        tenantId,

                    name:
                        roleName,

                    description:
                        "Role target privilege escalation audit"

                }

            });


        testRoleId =
            testRole.id;


        console.log(
            "🔐 Target Role:",
            testRole.name
        );


        console.log(
            "🆔 Role ID:",
            testRole.id
        );


        // ====================================
        // CREATE UNAUTHORIZED USER
        // ====================================

        const whatsappNumber =
            `628755${Date.now()
                .toString()
                .slice(-7)}`;


        const testUser =
            await prismaService.client.user.create({

                data: {

                    tenantId:
                        tenantId,

                    firstName:
                        "Privilege",

                    lastName:
                        "Audit User",

                    email:
                        `privilege-audit-${Date.now()}@test.local`,

                    whatsappNumber:
                        whatsappNumber,

                    password:
                        "privilege-audit-test",

                    active:
                        true

                }

            });


        testUserId =
            testUser.id;


        console.log(
            "👤 Test User:",
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


        // ====================================
        // CREATE USER ROLE
        // ====================================

        const userRoleName =
            `Privilege Audit User Role ${Date.now()}`;


        const userRole =
            await prismaService.client.role.create({

                data: {

                    tenantId:
                        tenantId,

                    name:
                        userRoleName,

                    description:
                        "Role user biasa privilege escalation audit",

                    permissions: {

                        connect: {

                            id:
                                roleReadPermission.id

                        }

                    }

                }

            });


        console.log(
            "👤 User Role:",
            userRole.name
        );

        console.log(
            "🔑 User Permission:",
            "role.read"
        );


        // ====================================
        // ASSIGN ROLE TO USER
        // ====================================

        await prismaService.client.user.update({

            where: {

                id:
                    testUser.id

            },

            data: {

                roles: {

                    connect: {

                        id:
                            userRole.id

                    }

                }

            }

        });


        // ====================================
        // VERIFY USER PRIVILEGES
        // ====================================

        const userBefore =
            await prismaService.client.user.findUnique({

                where: {

                    id:
                        testUser.id

                },

                include: {

                    roles: {

                        include: {

                            permissions:
                                true

                        }

                    }

                }

            });


        if (!userBefore) {

            throw new Error(
                "Test user tidak ditemukan."
            );

        }


        const userPermissions =
            userBefore.roles.flatMap(
                role =>
                    role.permissions.map(
                        permission =>
                            permission.name
                    )
            );


        console.log("");
        console.log(
            "🔐 USER SECURITY PROFILE"
        );

        console.log(
            "Roles:",
            userBefore.roles.map(
                role =>
                    role.name
            )
        );

        console.log(
            "Permissions:",
            userPermissions
        );


        if (
            !userPermissions.includes(
                "role.read"
            )
        ) {

            throw new Error(
                "Test user tidak memiliki role.read."
            );

        }


        if (
            userPermissions.includes(
                "role.update"
            )
        ) {

            throw new Error(
                "Test user ternyata memiliki role.update."
            );

        }


        console.log(
            "✅ User memiliki role.read."
        );

        console.log(
            "✅ User TIDAK memiliki role.update."
        );


        // ====================================
        // VERIFY TARGET ROLE EMPTY
        // ====================================

        const roleBefore =
            await prismaService.client.role.findUnique({

                where: {

                    id:
                        testRole.id

                },

                include: {

                    permissions:
                        true

                }

            });


        if (!roleBefore) {

            throw new Error(
                "Target role tidak ditemukan."
            );

        }


        if (
            roleBefore.permissions.length !== 0
        ) {

            throw new Error(
                "Target role sudah memiliki permission sebelum test."
            );

        }


        console.log(
            "✅ Target role belum memiliki permission."
        );


        // ====================================
        // ATTACK
        // ====================================

        console.log("");
        console.log("----------------------------------------");
        console.log("🧪 PRIVILEGE ESCALATION ATTACK");
        console.log("----------------------------------------");


        const registry =
            new CommandRegistry();


        registry.register(
            new AssignRolePermissionCommand()
        );


        const executor =
            new CommandExecutor(
                registry
            );


        const context =
            new CommandContext({

                sender:
                    whatsappNumber,

                chatId:
                    "SECURITY_AUDIT",

                messageId:
                    "RBAC_PRIVILEGE_ESCALATION_001",

                text:
                    `/assignrolepermission ${roleName} ${permissionName}`,

                args:
                    [
                        roleName,
                        permissionName
                    ],

                isGroup:
                    false,

                isAdmin:
                    false,

                isOwner:
                    false,

                userId:
                    testUser.id,

                tenantId:
                    tenantId,

                roles:
                    [userRole.name],

                permissions:
                    ["role.read"]

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


        console.log(
            "✅ CommandExecutor selesai."
        );


        // ====================================
        // CHECK RESPONSE
        // ====================================

        if (
            !replyMessage.includes(
                "tidak memiliki permission"
            )
        ) {

            throw new Error(
                "SECURITY FAILURE: Unauthorized user tidak ditolak oleh CommandExecutor."
            );

        }


        console.log(
            "🔐 Unauthorized privilege escalation berhasil ditolak."
        );


        // ====================================
        // DATABASE CHECK
        // ====================================

        const roleAfter =
            await prismaService.client.role.findUnique({

                where: {

                    id:
                        testRole.id

                },

                include: {

                    permissions:
                        true

                }

            });


        if (!roleAfter) {

            throw new Error(
                "Target role hilang setelah attack."
            );

        }


        const permissionWasAssigned =
            roleAfter.permissions.some(
                permission =>
                    permission.id ===
                    testPermission.id
            );


        if (
            permissionWasAssigned
        ) {

            throw new Error(
                "SECURITY FAILURE: Permission berhasil dipasang oleh unauthorized user."
            );

        }


        if (
            roleAfter.permissions.length !== 0
        ) {

            throw new Error(
                "SECURITY FAILURE: Target role berubah."
            );

        }


        console.log(
            "✅ Database role tidak berubah."
        );

        console.log(
            "✅ Permission tidak berhasil diberikan."
        );


        // ====================================
        // SECURITY RESULT
        // ====================================

        console.log("");
        console.log("----------------------------------------");
        console.log("🔐 SECURITY RESULT");
        console.log("----------------------------------------");

        console.log(
            "✅ User memiliki role biasa."
        );

        console.log(
            "✅ User memiliki role.read."
        );

        console.log(
            "✅ User tidak memiliki role.update."
        );

        console.log(
            "✅ User mencoba memberikan permission ke role."
        );

        console.log(
            "✅ Command berhasil ditolak."
        );

        console.log(
            "✅ Database tidak berubah."
        );

        console.log(
            "✅ Target role tetap aman."
        );

        console.log(
            "✅ Privilege escalation: PASS"
        );


        console.log("");
        console.log("========================================");
        console.log("🎉 RBAC PRIVILEGE ESCALATION TEST PASS");
        console.log("========================================");


    } catch (error) {

        console.error("");
        console.error(
            "❌ SECURITY TEST RESULT:"
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
        // CLEANUP PERMISSION
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