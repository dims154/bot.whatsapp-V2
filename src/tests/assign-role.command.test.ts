import { prismaService } from "../database/prisma.service";

import { CommandRegistry } from "../apps/bot/registry/CommandRegistry";
import { CommandExecutor } from "../apps/bot/executor/CommandExecutor";
import { CommandContext } from "../apps/bot/context/CommandContext";

import { AssignRoleCommand } from "../apps/bot/commands/assign-role.command";


async function test() {

    console.log("");
    console.log("========================================");
    console.log("🧪 TEST ASSIGN ROLE COMMAND");
    console.log("========================================");


    let createdUserId:
        string | undefined;


    try {

        // ====================================
        // TENANT
        // ====================================

       // ====================================
// CARI OWNER UTAMA
// ====================================

const owner =
    await prismaService.client.user.findUnique({

        where: {
            email: "owner@erp.local"
        }

    });


if (!owner) {

    throw new Error(
        "Owner utama owner@erp.local tidak ditemukan."
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
        "Tenant Owner utama tidak ditemukan."
    );

}


console.log("");
console.log(
    "🏢 Tenant utama:",
    tenant.id
);

console.log(
    "👤 Owner:",
    owner.email
);


// ====================================
// CARI ROLE OWNER
// ====================================

const role =
    await prismaService.client.role.findFirst({

        where: {

            tenantId:
                tenant.id,

            name:
                "Owner"

        },

        include: {

            permissions: true

        }

    });


if (!role) {

    throw new Error(
        `Role Owner tidak ditemukan pada tenant ${tenant.id}.`
    );

}


console.log(
    "🔐 Role:",
    role.name
);


        console.log(
            "🔐 Role:",
            role.name
        );


        // ====================================
        // BUAT USER TEST
        // ====================================

        const email =
            `assign-role-${Date.now()}@test.local`;


        const whatsapp =
            `628${Date.now()
                .toString()
                .slice(-10)}`;


        const testUser =
            await prismaService.client.user.create({

                data: {

                    tenantId:
                        tenant.id,

                    email,

                    password:
                        "TEST_HASHED_PASSWORD",

                    firstName:
                        "Assign",

                    lastName:
                        "Role",

                    whatsappNumber:
                        whatsapp,

                    active:
                        true

                }

            });


        createdUserId =
            testUser.id;


        console.log(
            "👤 User test:",
            testUser.id
        );


        // ====================================
        // REGISTRY
        // ====================================

        const registry =
            new CommandRegistry();


        registry.register(
            new AssignRoleCommand()
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
                    `/assignrole ${whatsapp} Owner`,

                args: [

                    whatsapp,

                    "Owner"

                ],

                isGroup:
                    false,

                isAdmin:
                    true,

                isOwner:
                    true,

                userId:
                    "TEST_OWNER",

                tenantId:
                    tenant.id,

                roles: [
                    "Owner"
                ],

                permissions: [

                    "user.assign_roles"

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

                },

                include: {

                    roles: {

                        include: {

                            permissions: true

                        }

                    }

                }

            });


        if (!updatedUser) {

            throw new Error(
                "❌ User test tidak ditemukan."
            );

        }


        const hasRole =
            updatedUser.roles.some(

                item =>
                    item.id === role.id

            );


        if (!hasRole) {

            throw new Error(
                "❌ Role tidak berhasil diberikan."
            );

        }


        console.log("");
        console.log(
            "✅ Role berhasil tersimpan di database."
        );


        console.log(
            "🔐 Roles:",
            updatedUser.roles.map(
                item => item.name
            )
        );


        console.log(
            "🔑 Permissions:",
            updatedUser.roles.flatMap(
                item =>
                    item.permissions.map(
                        permission =>
                            permission.name
                    )
            )
        );


        // ====================================
        // SUCCESS
        // ====================================

        console.log("");
        console.log("========================================");
        console.log("🎉 ASSIGN ROLE TEST PASS");
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