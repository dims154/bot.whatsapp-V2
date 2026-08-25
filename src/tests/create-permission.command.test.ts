import { prismaService } from "../database/prisma.service";

import { CommandRegistry } from "../apps/bot/registry/CommandRegistry";
import { CommandExecutor } from "../apps/bot/executor/CommandExecutor";
import { CommandContext } from "../apps/bot/context/CommandContext";

import { CreatePermissionCommand } from "../apps/bot/commands/create-permission.command";


async function test() {

    console.log("");
    console.log("========================================");
    console.log("🧪 TEST CREATE PERMISSION COMMAND");
    console.log("========================================");

    let testPermissionId:
        string | undefined;

    let tenantBId:
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
        // TENANT B
        // ====================================

        const tenantB =
            await prismaService.client.tenant.create({

                data: {

                    name:
                        "TEST Create Permission B",

                    code:
                        `test-create-permission-${Date.now()}`,

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
        // REGISTRY
        // ====================================

        const registry =
            new CommandRegistry();


        registry.register(
            new CreatePermissionCommand()
        );


        // ====================================
        // EXECUTOR
        // ====================================

        const executor =
            new CommandExecutor(
                registry
            );


        // ====================================
        // TEST DATA
        // ====================================

        const permissionName =
            `test.create.permission.${Date.now()}`;

        const description =
            "Permission hasil test create";


        console.log(
            "🔑 Permission test:",
            permissionName
        );


        // ====================================
        // CREATE
        // ====================================

        console.log("");
        console.log("----------------------------------------");
        console.log("🧪 CREATE PERMISSION");
        console.log("----------------------------------------");


        const context =
            new CommandContext({

                sender:
                    "6289529852918",

                chatId:
                    "TEST_CHAT",

                messageId:
                    "TEST_CREATE_PERMISSION",

                text:
                    `/createpermission ${permissionName} ${description}`,

                args: [
                    permissionName,
                    description
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
                    ["permission.create"]

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
                console.log("📨 REPLY:");
                console.log(message);

            };


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
                "PERMISSION BERHASIL DIBUAT"
            )
        ) {

            throw new Error(
                "❌ Permission gagal dibuat."
            );

        }


        console.log(
            "✅ Command create permission berhasil."
        );


        // ====================================
        // DATABASE CHECK
        // ====================================

        const createdPermission =
            await prismaService.client.permission.findFirst({

                where: {

                    tenantId:
                        tenantA.id,

                    name:
                        permissionName

                }

            });


        if (!createdPermission) {

            throw new Error(
                "❌ Permission tidak ditemukan di database."
            );

        }


        testPermissionId =
            createdPermission.id;


        console.log(
            "✅ Permission berhasil tersimpan di database."
        );


        // ====================================
        // TENANT CHECK
        // ====================================

        if (
            createdPermission.tenantId !==
            tenantA.id
        ) {

            throw new Error(
                "❌ Permission tersimpan pada tenant yang salah."
            );

        }


        console.log(
            "🔐 Tenant database: PASS"
        );


        // ====================================
        // DESCRIPTION CHECK
        // ====================================

        if (
            createdPermission.description !==
            description
        ) {

            throw new Error(
                "❌ Deskripsi permission tidak sesuai."
            );

        }


        console.log(
            "✅ Deskripsi permission sesuai."
        );


        // ====================================
        // DUPLICATE
        // ====================================

        console.log("");
        console.log("----------------------------------------");
        console.log("🧪 DUPLICATE PERMISSION");
        console.log("----------------------------------------");


        const duplicateContext =
            new CommandContext({

                sender:
                    "6289529852918",

                chatId:
                    "TEST_CHAT",

                messageId:
                    "TEST_DUPLICATE_PERMISSION",

                text:
                    `/createpermission ${permissionName}`,

                args:
                    [permissionName],

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
                    ["permission.create"]

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
                console.log("📨 DUPLICATE REPLY:");
                console.log(message);

            };


        await executor.execute(
            duplicateContext
        );


        if (
            !duplicateReply.includes(
                "sudah ada"
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
        // TENANT B ISOLATION
        // ====================================

        console.log("");
        console.log("----------------------------------------");
        console.log("🧪 TENANT ISOLATION");
        console.log("----------------------------------------");


        const tenantBPermission =
            await prismaService.client.permission.findFirst({

                where: {

                    tenantId:
                        tenantB.id,

                    name:
                        permissionName

                }

            });


        if (tenantBPermission) {

            throw new Error(
                "❌ Permission Tenant A bocor ke Tenant B."
            );

        }


        console.log(
            "✅ Tenant B tidak memiliki permission Tenant A."
        );


        // ====================================
        // TENANT A EXISTENCE
        // ====================================

        const tenantAPermission =
            await prismaService.client.permission.findFirst({

                where: {

                    tenantId:
                        tenantA.id,

                    name:
                        permissionName

                }

            });


        if (!tenantAPermission) {

            throw new Error(
                "❌ Permission tidak ditemukan pada Tenant A."
            );

        }


        console.log(
            "🔐 Tenant isolation: PASS"
        );


        // ====================================
        // SUCCESS
        // ====================================

        console.log("");
        console.log("========================================");
        console.log("🎉 CREATE PERMISSION TEST PASS");
        console.log("========================================");


    } catch (error) {

        console.error("");
        console.error("❌ TEST ERROR:");
        console.error(error);

        process.exitCode =
            1;

    } finally {

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


        // ====================================
        // CLEANUP TENANT B
        // ====================================

        if (tenantBId) {

            try {

                await prismaService.client.permission.deleteMany({

                    where: {
                        tenantId:
                            tenantBId
                    }

                });

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