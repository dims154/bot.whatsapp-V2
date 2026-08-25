import { prismaService } from "../database/prisma.service";

import { CommandRegistry } from "../apps/bot/registry/CommandRegistry";
import { CommandExecutor } from "../apps/bot/executor/CommandExecutor";
import { CommandContext } from "../apps/bot/context/CommandContext";

import { RoleCommand } from "../apps/bot/commands/role.command";


async function test() {

    console.log("");
    console.log("========================================");
    console.log("🔐 RBAC SECURITY AUDIT");
    console.log("🧪 TEST #6: DISABLED USER");
    console.log("========================================");

    let testUserId: string | undefined;
    let testRoleId: string | undefined;
    let tenantId: string | undefined;

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


        tenantId =
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
        // CREATE ROLE WITH role.read
        // ====================================

        const roleName =
            `Disabled User Role ${Date.now()}`;


        const role =
            await prismaService.client.role.create({

                data: {

                    tenantId:
                        tenantId,

                    name:
                        roleName,

                    description:
                        "Role khusus audit disabled user",

                    permissions: {

                        connect: {

                            id:
                                (
                                    await prismaService.client.permission.findFirst({

                                        where: {

                                            tenantId:
                                                tenantId,

                                            name:
                                                "role.read"

                                        }

                                    })
                                )?.id

                        }

                    }

                },

                include: {

                    permissions:
                        true

                }

            });


        testRoleId =
            role.id;


        console.log(
            "🔐 Role:",
            role.name
        );


        // ====================================
        // VERIFY role.read
        // ====================================

        const hasRoleRead =
            role.permissions.some(
                permission =>
                    permission.name ===
                    "role.read"
            );


        if (!hasRoleRead) {

            throw new Error(
                "Role test tidak memiliki role.read."
            );

        }


        console.log(
            "🔑 Permission: role.read"
        );


        // ====================================
        // CREATE TEST USER
        // ====================================

        const whatsappNumber =
            `628766${Date.now()
                .toString()
                .slice(-7)}`;


        const testUser =
            await prismaService.client.user.create({

                data: {

                    tenantId:
                        tenantId,

                    firstName:
                        "Disabled",

                    lastName:
                        "Security User",

                    email:
                        `disabled-security-${Date.now()}@test.local`,

                    whatsappNumber:
                        whatsappNumber,

                    password:
                        "disabled-security-test",

                    active:
                        true,

                    roles: {

                        connect: {

                            id:
                                role.id

                        }

                    }

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

        console.log(
            "📊 Status awal: 🟢 Aktif"
        );


        // ====================================
        // VERIFY USER BEFORE DISABLE
        // ====================================

        const userBeforeDisable =
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


        if (!userBeforeDisable) {

            throw new Error(
                "Test user tidak ditemukan."
            );

        }


        if (
            userBeforeDisable.active !== true
        ) {

            throw new Error(
                "Test user tidak aktif pada kondisi awal."
            );

        }


        const userHasRoleRead =
            userBeforeDisable.roles.some(
                userRole =>
                    userRole.permissions.some(
                        permission =>
                            permission.name ===
                            "role.read"
                    )
            );


        if (!userHasRoleRead) {

            throw new Error(
                "Test user tidak memiliki role.read sebelum disable."
            );

        }


        console.log(
            "✅ User aktif."
        );

        console.log(
            "✅ User memiliki role.read."
        );


        // ====================================
        // DISABLE USER
        // ====================================

        console.log("");
        console.log("----------------------------------------");
        console.log("🧪 DISABLE USER");
        console.log("----------------------------------------");


        await prismaService.client.user.update({

            where: {

                id:
                    testUser.id

            },

            data: {

                active:
                    false

            }

        });


        // ====================================
        // VERIFY DISABLED
        // ====================================

        const disabledUser =
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


        if (!disabledUser) {

            throw new Error(
                "User hilang setelah disable."
            );

        }


        if (
            disabledUser.active !== false
        ) {

            throw new Error(
                "User gagal menjadi inactive."
            );

        }


        const disabledUserStillHasRoleRead =
            disabledUser.roles.some(
                userRole =>
                    userRole.permissions.some(
                        permission =>
                            permission.name ===
                            "role.read"
                    )
            );


        if (
            !disabledUserStillHasRoleRead
        ) {

            throw new Error(
                "Test invalid: role.read hilang setelah disable."
            );

        }


        console.log(
            "🔴 Status database: Nonaktif"
        );

        console.log(
            "✅ User tetap memiliki role.read."
        );


        // ====================================
        // COMMAND EXECUTOR
        // ====================================

        console.log("");
        console.log("----------------------------------------");
        console.log("🧪 DISABLED USER → /role");
        console.log("----------------------------------------");


        const registry =
            new CommandRegistry();


        registry.register(
            new RoleCommand()
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
                    "RBAC_DISABLED_USER_002",

                text:
                    `/role ${roleName}`,

                args:
                    [
                        roleName
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
                    [roleName],

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


        // ====================================
        // EXECUTE COMMAND
        // ====================================

        await executor.execute(
            context
        );


        console.log(
            "✅ CommandExecutor selesai."
        );


        // ====================================
        // SECURITY CHECK
        // ====================================

        if (
            replyMessage.includes(
                "DETAIL ROLE"
            )
        ) {

            console.log("");
            console.log(
                "🚨 SECURITY VULNERABILITY"
            );

            console.log(
                "❌ User inactive masih dapat menjalankan command."
            );

            console.log(
                "❌ User masih memiliki role.read."
            );

            console.log(
                "❌ CommandExecutor tidak memeriksa active status."
            );


            throw new Error(
                "SECURITY FAILURE: Disabled user masih dapat menjalankan command meskipun memiliki permission valid."
            );

        }


        // ====================================
        // EXPECTED DENIAL
        // ====================================

        console.log(
            "✅ Disabled user berhasil ditolak."
        );


        console.log("");
        console.log("----------------------------------------");
        console.log("🔐 SECURITY RESULT");
        console.log("----------------------------------------");

        console.log(
            "✅ User aktif pada kondisi awal."
        );

        console.log(
            "✅ User memiliki role.read."
        );

        console.log(
            "✅ User berhasil menjadi inactive."
        );

        console.log(
            "✅ Permission role.read tetap dimiliki."
        );

        console.log(
            "✅ Disabled user tidak dapat menjalankan command."
        );

        console.log(
            "✅ Disabled user enforcement: PASS"
        );


        console.log("");
        console.log("========================================");
        console.log("🎉 RBAC DISABLED USER TEST PASS");
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


        await prismaService.client.$disconnect();

    }

}


test();