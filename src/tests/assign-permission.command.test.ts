import { prismaService } from "../database/prisma.service";

import { CommandRegistry } from "../apps/bot/registry/CommandRegistry";
import { CommandExecutor } from "../apps/bot/executor/CommandExecutor";
import { CommandContext } from "../apps/bot/context/CommandContext";

import { AssignPermissionCommand } from "../apps/bot/commands/assign-permission.command";


async function test() {

    console.log("");
    console.log("========================================");
    console.log("🧪 TEST ASSIGN PERMISSION COMMAND");
    console.log("========================================");

    let createdUserId:
        string | undefined;


    try {

        // ====================================
        // OWNER
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


        // ====================================
        // TENANT
        // ====================================

        const tenant =
            await prismaService.client.tenant.findUnique({

                where: {

                    id:
                        owner.tenantId

                }

            });


        if (!tenant) {

            throw new Error(
                "Tenant utama tidak ditemukan."
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
        // PERMISSION
        // ====================================

        const permission =
            await prismaService.client.permission.findFirst({

                where: {

                    tenantId:
                        tenant.id,

                    name:
                        "user.create"

                }

            });


        if (!permission) {

            throw new Error(
                "Permission user.create tidak ditemukan."
            );

        }


        console.log(
            "🔑 Permission:",
            permission.name
        );


        // ====================================
        // BUAT USER TEST
        // ====================================

        const whatsapp =
            `628${Date.now()
                .toString()
                .slice(-10)}`;


        const testUser =
            await prismaService.client.user.create({

                data: {

                    tenantId:
                        tenant.id,

                    email:
                        `assign-permission-${Date.now()}@test.local`,

                    password:
                        "TEST_HASHED_PASSWORD",

                    firstName:
                        "Assign",

                    lastName:
                        "Permission",

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
            new AssignPermissionCommand()
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
                    `/assignpermission ${whatsapp} user.create`,

                args: [

                    whatsapp,

                    "user.create"

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
                    tenant.id,

                roles: [
                    "Owner"
                ],

                permissions: [

                    "user.assign_permissions"

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

                    permissions: true

                }

            });


        if (!updatedUser) {

            throw new Error(
                "❌ User test tidak ditemukan."
            );

        }


        // ====================================
        // CHECK PERMISSION
        // ====================================

        const hasPermission =
            updatedUser.permissions.some(

                item =>
                    item.id === permission.id

            );


        if (!hasPermission) {

            throw new Error(
                "❌ Permission tidak berhasil diberikan."
            );

        }


        console.log("");
        console.log(
            "✅ Permission berhasil tersimpan di database."
        );


        console.log(
            "🔑 Direct Permissions:",
            updatedUser.permissions.map(

                item =>
                    item.name

            )

        );


        // ====================================
        // SUCCESS
        // ====================================

        console.log("");
        console.log("========================================");
        console.log("🎉 ASSIGN PERMISSION TEST PASS");
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