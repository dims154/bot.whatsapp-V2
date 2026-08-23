import { prismaService } from "../database/prisma.service";

import { CommandRegistry } from "../apps/bot/registry/CommandRegistry";
import { CommandExecutor } from "../apps/bot/executor/CommandExecutor";
import { CommandContext } from "../apps/bot/context/CommandContext";

import { CreatePermissionCommand } from "../apps/bot/commands/create-permission.command";


async function test() {

    console.log("");
    console.log("========================================");
    console.log("🔐 RBAC SECURITY AUDIT");
    console.log("🧪 TEST #1: PERMISSION BYPASS");
    console.log("========================================");

    let testPermissionId:
        string | undefined;

    try {

        // ====================================
        // OWNER / TENANT
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
            "👤 Owner:",
            owner.email
        );

        console.log(
            "🏢 Tenant:",
            tenant.id
        );


        // ====================================
        // TEST PERMISSION NAME
        // ====================================

        const permissionName =
            `audit.bypass.${Date.now()}`;

        console.log(
            "🔐 Target permission:",
            permissionName
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
        // UNAUTHORIZED CONTEXT
        // ====================================

        console.log("");
        console.log("----------------------------------------");
        console.log("🧪 UNAUTHORIZED USER");
        console.log("----------------------------------------");

        const context =
            new CommandContext({

                sender:
                    "6289999999999",

                chatId:
                    "SECURITY_AUDIT",

                messageId:
                    "RBAC_BYPASS_001",

                text:
                    `/createpermission ${permissionName}`,

                args:
                    [permissionName],

                isGroup:
                    false,

                isAdmin:
                    false,

                isOwner:
                    false,

                userId:
                    "UNAUTHORIZED_TEST_USER",

                tenantId:
                    tenant.id,

                roles:
                    [],

                permissions:
                    []

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
        // RESPONSE MUST NOT BE SUCCESS
        // ====================================

        if (
            replyMessage.includes(
                "PERMISSION BERHASIL DIBUAT"
            )
        ) {

            throw new Error(
                "🚨 SECURITY FAILURE: User tanpa permission berhasil membuat permission!"
            );

        }


        console.log(
            "🔐 Unauthorized command berhasil ditolak."
        );


        // ====================================
        // DATABASE CHECK
        // ====================================

        const createdPermission =
            await prismaService.client.permission.findFirst({

                where: {

                    tenantId:
                        tenant.id,

                    name:
                        permissionName

                }

            });


        if (createdPermission) {

            testPermissionId =
                createdPermission.id;

            throw new Error(
                "🚨 SECURITY FAILURE: Permission tetap dibuat di database!"
            );

        }


        console.log(
            "✅ Database tidak berubah."
        );


        // ====================================
        // FINAL RESULT
        // ====================================

        console.log("");
        console.log("----------------------------------------");
        console.log("🔐 SECURITY RESULT");
        console.log("----------------------------------------");

        console.log(
            "✅ User tanpa permission tidak dapat menjalankan command."
        );

        console.log(
            "✅ Permission tidak masuk database."
        );

        console.log(
            "✅ Permission bypass: PASS"
        );


        console.log("");
        console.log("========================================");
        console.log("🎉 RBAC PERMISSION BYPASS TEST PASS");
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

        if (testPermissionId) {

            try {

                await prismaService.client.permission.delete({

                    where: {
                        id:
                            testPermissionId
                    }

                });

                console.log(
                    "🧹 Cleanup permission berhasil."
                );

            } catch (error) {

                console.error(
                    "⚠️ Cleanup gagal:",
                    error
                );

            }

        }

        await prismaService.client.$disconnect();

    }

}


test();