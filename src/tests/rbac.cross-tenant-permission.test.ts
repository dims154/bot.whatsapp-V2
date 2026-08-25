import { prismaService } from "../database/prisma.service";

import { CommandRegistry } from "../apps/bot/registry/CommandRegistry";
import { CommandExecutor } from "../apps/bot/executor/CommandExecutor";
import { CommandContext } from "../apps/bot/context/CommandContext";

import { PermissionCommand } from "../apps/bot/commands/permission.command";


async function test() {

    console.log("");
    console.log("========================================");
    console.log("🔐 RBAC SECURITY AUDIT");
    console.log("🧪 TEST #5: CROSS-TENANT PERMISSION");
    console.log("========================================");

    let tenantBId: string | undefined;
    let permissionBId: string | undefined;

    try {

        // ====================================
        // OWNER / TENANT A
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
                "Tenant A tidak ditemukan."
            );

        }


        console.log("");
        console.log(
            "👤 Owner Tenant A:",
            owner.email
        );

        console.log(
            "🏢 Tenant A:",
            tenantA.id
        );


        // ====================================
        // CREATE TENANT B
        // ====================================

        const tenantB =
            await prismaService.client.tenant.create({

                data: {

                    name:
                        `SECURITY AUDIT PERMISSION TENANT B ${Date.now()}`,

                    code:
                        `security-permission-b-${Date.now()}`,

                    description:
                        "Temporary tenant for cross-tenant permission security test"

                }

            });


        tenantBId =
            tenantB.id;


        console.log(
            "🏢 Tenant B:",
            tenantB.id
        );


        // ====================================
        // CREATE PERMISSION TENANT B
        // ====================================

        const permissionName =
            `Cross Tenant Secret Permission ${Date.now()}`;


        const permissionDescription =
            "Permission rahasia milik Tenant B";


        const permissionB =
            await prismaService.client.permission.create({

                data: {

                    tenantId:
                        tenantB.id,

                    name:
                        permissionName,

                    description:
                        permissionDescription

                }

            });


        permissionBId =
            permissionB.id;


        console.log(
            "🔑 Permission Tenant B:",
            permissionB.name
        );

        console.log(
            "🆔 Permission ID:",
            permissionB.id
        );

        console.log(
            "🏢 Permission Tenant:",
            permissionB.tenantId
        );


        // ====================================
        // DATABASE PRE-CHECK
        // ====================================

        const permissionBeforeAttack =
            await prismaService.client.permission.findFirst({

                where: {

                    id:
                        permissionB.id,

                    tenantId:
                        tenantB.id

                }

            });


        if (!permissionBeforeAttack) {

            throw new Error(
                "Permission Tenant B gagal dibuat."
            );

        }


        console.log(
            "✅ Permission Tenant B berhasil dibuat."
        );


        // ====================================
        // COMMAND REGISTRY
        // ====================================

        const registry =
            new CommandRegistry();


        registry.register(
            new PermissionCommand()
        );


        // ====================================
        // COMMAND EXECUTOR
        // ====================================

        const executor =
            new CommandExecutor(
                registry
            );


        // ====================================
        // CROSS-TENANT PERMISSION LOOKUP
        // ====================================

        console.log("");
        console.log("----------------------------------------");
        console.log("🧪 TENANT A → PERMISSION TENANT B");
        console.log("----------------------------------------");


        const context =
            new CommandContext({

                sender:
                    "6289529852918",

                chatId:
                    "SECURITY_AUDIT",

                messageId:
                    "RBAC_CROSS_TENANT_PERMISSION_001",

                text:
                    `/permission ${permissionName}`,

                args:
                    [
                        permissionName
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
                    ["permission.read"]

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
        // MUST NOT EXPOSE DETAIL
        // ====================================

        if (
            replyMessage.includes(
                "DETAIL PERMISSION"
            )
        ) {

            throw new Error(
                "🚨 SECURITY FAILURE: Tenant A berhasil melihat detail Permission Tenant B!"
            );

        }


        // ====================================
        // MUST RETURN NOT FOUND
        // ====================================

        if (
            !replyMessage.includes(
                "Permission"
            ) ||
            !replyMessage.includes(
                "tidak ditemukan"
            )
        ) {

            throw new Error(
                "🚨 SECURITY FAILURE: Cross-tenant permission tidak ditolak dengan benar!"
            );

        }


        console.log(
            "🔐 Cross-tenant permission berhasil ditolak."
        );


        // ====================================
        // DATABASE TENANT A CHECK
        // ====================================

        const lookupFromTenantA =
            await prismaService.client.permission.findFirst({

                where: {

                    id:
                        permissionB.id,

                    tenantId:
                        tenantA.id

                }

            });


        if (lookupFromTenantA) {

            throw new Error(
                "🚨 SECURITY FAILURE: Permission Tenant B dapat ditemukan menggunakan Tenant A!"
            );

        }


        console.log(
            "✅ Permission Tenant B tidak ditemukan dari Tenant A."
        );


        // ====================================
        // DATABASE TENANT B CHECK
        // ====================================

        const lookupFromTenantB =
            await prismaService.client.permission.findFirst({

                where: {

                    id:
                        permissionB.id,

                    tenantId:
                        tenantB.id

                }

            });


        if (!lookupFromTenantB) {

            throw new Error(
                "🚨 SECURITY FAILURE: Permission Tenant B hilang dari tenant pemilik!"
            );

        }


        console.log(
            "✅ Permission tetap ditemukan pada Tenant B."
        );


        // ====================================
        // OWNERSHIP CHECK
        // ====================================

        if (
            lookupFromTenantB.tenantId !==
            tenantB.id
        ) {

            throw new Error(
                "🚨 SECURITY FAILURE: Ownership Permission berubah!"
            );

        }


        console.log(
            "🔐 Permission ownership tetap benar."
        );


        // ====================================
        // DATA INTEGRITY
        // ====================================

        if (
            lookupFromTenantB.name !==
            permissionName
        ) {

            throw new Error(
                "🚨 SECURITY FAILURE: Nama Permission berubah!"
            );

        }


        if (
            lookupFromTenantB.description !==
            permissionDescription
        ) {

            throw new Error(
                "🚨 SECURITY FAILURE: Deskripsi Permission berubah!"
            );

        }


        console.log(
            "✅ Data Permission Tenant B tidak berubah."
        );


        // ====================================
        // FINAL SECURITY RESULT
        // ====================================

        console.log("");
        console.log("----------------------------------------");
        console.log("🔐 SECURITY RESULT");
        console.log("----------------------------------------");

        console.log(
            "✅ Owner Tenant A memiliki permission.read."
        );

        console.log(
            "✅ Permission target benar-benar milik Tenant B."
        );

        console.log(
            "✅ Tenant A tidak dapat melihat detail Permission Tenant B."
        );

        console.log(
            "✅ Tenant A tidak dapat menemukan Permission Tenant B."
        );

        console.log(
            "✅ Permission Tenant B tetap tersedia bagi Tenant B."
        );

        console.log(
            "✅ Permission ownership tetap aman."
        );

        console.log(
            "✅ Data Permission Tenant B tidak berubah."
        );

        console.log(
            "✅ Cross-tenant permission isolation: PASS"
        );


        console.log("");
        console.log("========================================");
        console.log("🎉 RBAC CROSS-TENANT PERMISSION TEST PASS");
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
        // CLEANUP PERMISSION
        // ====================================

        if (permissionBId) {

            try {

                await prismaService.client.permission.delete({

                    where: {
                        id:
                            permissionBId
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


        // ====================================
        // DISCONNECT
        // ====================================

        await prismaService.client.$disconnect();

    }

}


test();