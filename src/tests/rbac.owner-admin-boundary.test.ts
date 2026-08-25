import { prismaService } from "../database/prisma.service";

import { CommandRegistry } from "../apps/bot/registry/CommandRegistry";
import { CommandExecutor } from "../apps/bot/executor/CommandExecutor";
import { CommandContext } from "../apps/bot/context/CommandContext";

import { AdminCommand } from "../apps/bot/commands/admin.command";
import { OwnerCommand } from "../apps/bot/commands/owner.command";


async function test() {

    console.log("");
    console.log("========================================");
    console.log("🔐 RBAC SECURITY AUDIT");
    console.log("🧪 TEST #8: OWNER / ADMIN BOUNDARY");
    console.log("========================================");


    let tenantId: string | undefined;

    const createdUserIds: string[] = [];
    const createdRoleIds: string[] = [];


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
        // CREATE ADMIN ROLE
        // ====================================

       const adminRoleName = "Admin";


        const adminRole =
            await prismaService.client.role.create({

                data: {

                    tenantId:
                        tenantId,

                    name:
                        adminRoleName,

                    description:
                        "Role admin untuk boundary audit"

                }

            });


        createdRoleIds.push(
            adminRole.id
        );


        // ====================================
        // CREATE NORMAL USER ROLE
        // ====================================

        const userRoleName =
            `Security User ${Date.now()}`;


        const userRole =
            await prismaService.client.role.create({

                data: {

                    tenantId:
                        tenantId,

                    name:
                        userRoleName,

                    description:
                        "Role user biasa untuk boundary audit"

                }

            });


        createdRoleIds.push(
            userRole.id
        );


        console.log(
            "🔐 Admin Role:",
            adminRole.name
        );

        console.log(
            "👤 User Role:",
            userRole.name
        );


        // ====================================
        // CREATE ADMIN USER
        // ====================================

        const adminWhatsapp =
            `628754${Date.now()
                .toString()
                .slice(-7)}`;


        const adminUser =
            await prismaService.client.user.create({

                data: {

                    tenantId:
                        tenantId,

                    firstName:
                        "Boundary",

                    lastName:
                        "Admin",

                    email:
                        `boundary-admin-${Date.now()}@test.local`,

                    whatsappNumber:
                        adminWhatsapp,

                    password:
                        "boundary-admin-test",

                    active:
                        true,

                    roles: {

                        connect: {

                            id:
                                adminRole.id

                        }

                    }

                }

            });


        createdUserIds.push(
            adminUser.id
        );


        // ====================================
        // CREATE NORMAL USER
        // ====================================

        const normalWhatsapp =
            `628753${Date.now()
                .toString()
                .slice(-7)}`;


        const normalUser =
            await prismaService.client.user.create({

                data: {

                    tenantId:
                        tenantId,

                    firstName:
                        "Boundary",

                    lastName:
                        "User",

                    email:
                        `boundary-user-${Date.now()}@test.local`,

                    whatsappNumber:
                        normalWhatsapp,

                    password:
                        "boundary-user-test",

                    active:
                        true,

                    roles: {

                        connect: {

                            id:
                                userRole.id

                        }

                    }

                }

            });


        createdUserIds.push(
            normalUser.id
        );


        console.log(
            "👤 Admin User:",
            adminUser.id
        );

        console.log(
            "📱 Admin WhatsApp:",
            adminWhatsapp
        );

        console.log(
            "👤 Normal User:",
            normalUser.id
        );

        console.log(
            "📱 Normal WhatsApp:",
            normalWhatsapp
        );


        // ====================================
        // REGISTRY
        // ====================================

        const registry =
            new CommandRegistry();


        registry.register(
            new AdminCommand()
        );


        registry.register(
            new OwnerCommand()
        );


        const executor =
            new CommandExecutor(
                registry
            );


        // ====================================
        // HELPER
        // ====================================

        async function executeCommand(
            label: string,
            userId: string,
            sender: string,
            roles: string[],
            permissions: string[],
            commandText: string
        ): Promise<string> {

            console.log("");
            console.log("----------------------------------------");
            console.log(
                `🧪 ${label}`
            );
            console.log("----------------------------------------");


            console.log(
                "👤 Roles:",
                roles
            );

            console.log(
                "🔑 Permissions:",
                permissions
            );

            console.log(
                "📨 Command:",
                commandText
            );


            const context =
                new CommandContext({

                    sender:

                        sender,

                    chatId:
                        "SECURITY_AUDIT",

                    messageId:
                        `BOUNDARY_${Date.now()}_${Math.random()}`,

                    text:
                        commandText,

                    args:
                        commandText
                            .split(/\s+/)
                            .slice(1),

                    isGroup:
                        false,

                    isAdmin:
                        roles.some(
                            role =>
                                [
                                    "owner",
                                    "admin",
                                    "super admin"
                                ].includes(
                                    role.toLowerCase()
                                )
                        ),

                    isOwner:
                        roles.some(
                            role =>
                                role.toLowerCase() ===
                                "owner"
                        ),

                    userId:
                        userId,

                    tenantId:
                        tenantId,

                    roles:
                        roles,

                    permissions:
                        permissions

                });


            let reply =
                "";


            context.reply =
                async (
                    message: string
                ) => {

                    reply =
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


            return reply;

        }


        // ====================================
        // TEST #1
        // NORMAL USER → OWNER
        // ====================================

        const normalToOwner =
            await executeCommand(

                "NORMAL USER → OWNER COMMAND",

                normalUser.id,

                normalWhatsapp,

                [userRoleName],

                [],

                "/owner"

            );


        if (
            normalToOwner.includes(
                "OWNER COMMAND"
            )
        ) {

            throw new Error(
                "SECURITY FAILURE: Normal user berhasil menjalankan owner command."
            );

        }


        if (
            !normalToOwner.includes(
                "tidak memiliki akses owner"
            )
        ) {

            throw new Error(
                "Normal user tidak mendapatkan owner denial response."
            );

        }


        console.log(
            "✅ Normal user → owner ditolak."
        );


        // ====================================
        // TEST #2
        // ADMIN → OWNER
        // ====================================

        const adminToOwner =
            await executeCommand(

                "ADMIN → OWNER COMMAND",

                adminUser.id,

                adminWhatsapp,

                [adminRoleName],

                [],

                "/owner"

            );


        if (
            adminToOwner.includes(
                "OWNER COMMAND"
            )
        ) {

            throw new Error(
                "SECURITY FAILURE: Admin berhasil menjalankan owner command."
            );

        }


        if (
            !adminToOwner.includes(
                "tidak memiliki akses owner"
            )
        ) {

            throw new Error(
                "Admin tidak mendapatkan owner denial response."
            );

        }


        console.log(
            "✅ Admin → owner ditolak."
        );


        // ====================================
        // TEST #3
        // OWNER → OWNER
        // ====================================

        const ownerToOwner =
            await executeCommand(

                "OWNER → OWNER COMMAND",

                owner.id,

                "6289529852918",

                ["Owner"],

                [],

                "/owner"

            );


      if (
    !ownerToOwner.includes(
        "MENU OWNER"
    )
) {
    throw new Error(
        "SECURITY FAILURE: Owner tidak dapat menjalankan owner command."
    );
}


        console.log(
            "✅ Owner → owner berhasil."
        );


        // ====================================
        // TEST #4
        // NORMAL USER → ADMIN
        // ====================================

        const normalToAdmin =
            await executeCommand(

                "NORMAL USER → ADMIN COMMAND",

                normalUser.id,

                normalWhatsapp,

                [userRoleName],

                [],

                "/admin"

            );


        if (
            normalToAdmin.includes(
                "ADMIN COMMAND"
            )
        ) {

            throw new Error(
                "SECURITY FAILURE: Normal user berhasil menjalankan admin command."
            );

        }


        if (
            !normalToAdmin.includes(
                "tidak memiliki akses admin"
            )
        ) {

            throw new Error(
                "Normal user tidak mendapatkan admin denial response."
            );

        }


        console.log(
            "✅ Normal user → admin ditolak."
        );


        // ====================================
        // TEST #5
        // ADMIN → ADMIN
        // ====================================

        const adminToAdmin =
            await executeCommand(

                "ADMIN → ADMIN COMMAND",

                adminUser.id,

                adminWhatsapp,

                [adminRoleName],

                [],

                "/admin"

            );


        if (
            !adminToAdmin.includes(
                "MENU ADMIN"
            )
        ) {

            throw new Error(
                "SECURITY FAILURE: Admin tidak dapat menjalankan admin command."
            );

        }


        console.log(
            "✅ Admin → admin berhasil."
        );


        // ====================================
// TEST #6
// OWNER → ADMIN
// ====================================

const ownerToAdmin =
    await executeCommand(

        "OWNER → ADMIN COMMAND",

        owner.id,

        "6289529852918",

        ["Owner"],

        [],

        "/admin"

    );


if (
    !ownerToAdmin.includes(
        "MENU ADMIN"
    )
) {

    throw new Error(
        "SECURITY FAILURE: Owner tidak dapat menjalankan admin command."
    );

}


console.log(
    "✅ Owner → admin berhasil."
);


        // ====================================
        // SECURITY RESULT
        // ====================================

        console.log("");
        console.log("----------------------------------------");
        console.log("🔐 SECURITY RESULT");
        console.log("----------------------------------------");

        console.log(
            "✅ Normal user tidak dapat menjalankan owner command."
        );

        console.log(
            "✅ Admin tidak dapat menjalankan owner command."
        );

        console.log(
            "✅ Owner dapat menjalankan owner command."
        );

        console.log(
            "✅ Normal user tidak dapat menjalankan admin command."
        );

        console.log(
            "✅ Admin dapat menjalankan admin command."
        );

        console.log(
            "✅ Owner dapat menjalankan admin command."
        );

        console.log(
            "✅ Owner/Admin boundary: PASS"
        );


        console.log("");
        console.log("========================================");
        console.log("🎉 RBAC OWNER / ADMIN BOUNDARY TEST PASS");
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
        // CLEANUP USERS
        // ====================================

        for (
            const userId
            of createdUserIds
        ) {

            try {

                await prismaService.client.user.delete({

                    where: {

                        id:
                            userId

                    }

                });

                console.log(
                    "🧹 Test user berhasil dihapus:",
                    userId
                );

            } catch (error) {

                console.error(
                    "⚠️ Cleanup user gagal:",
                    error
                );

            }

        }


        // ====================================
        // CLEANUP ROLES
        // ====================================

        for (
            const roleId
            of createdRoleIds
        ) {

            try {

                await prismaService.client.role.delete({

                    where: {

                        id:
                            roleId

                    }

                });

                console.log(
                    "🧹 Test role berhasil dihapus:",
                    roleId
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