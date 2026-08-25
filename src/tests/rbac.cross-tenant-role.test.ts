import { prismaService } from "../database/prisma.service";

import { CommandRegistry } from "../apps/bot/registry/CommandRegistry";
import { CommandExecutor } from "../apps/bot/executor/CommandExecutor";
import { CommandContext } from "../apps/bot/context/CommandContext";

import { RoleCommand } from "../apps/bot/commands/role.command";


async function test() {

    console.log("");
    console.log("========================================");
    console.log("🔐 RBAC SECURITY AUDIT");
    console.log("🧪 TEST #4: CROSS-TENANT ROLE");
    console.log("========================================");

    let tenantBId: string | undefined;
    let roleBId: string | undefined;

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
                        `SECURITY AUDIT ROLE TENANT B ${Date.now()}`,

                    code:
                        `security-role-b-${Date.now()}`,

                    description:
                        "Temporary tenant for cross-tenant role security test"

                }

            });


        tenantBId =
            tenantB.id;


        console.log(
            "🏢 Tenant B:",
            tenantB.id
        );


        // ====================================
        // CREATE ROLE TENANT B
        // ====================================

        const roleName =
            `Cross Tenant Secret Role ${Date.now()}`;


        const roleDescription =
            "Role rahasia milik Tenant B";


        const roleB =
            await prismaService.client.role.create({

                data: {

                    tenantId:
                        tenantB.id,

                    name:
                        roleName,

                    description:
                        roleDescription

                },

                include: {

                    permissions: true

                }

            });


        roleBId =
            roleB.id;


        console.log(
            "🔐 Role Tenant B:",
            roleB.name
        );

        console.log(
            "🆔 Role ID:",
            roleB.id
        );

        console.log(
            "🏢 Role Tenant:",
            roleB.tenantId
        );


        // ====================================
        // DATABASE PRE-CHECK
        // ====================================

        const roleBeforeAttack =
            await prismaService.client.role.findFirst({

                where: {

                    id:
                        roleB.id,

                    tenantId:
                        tenantB.id

                }

            });


        if (!roleBeforeAttack) {

            throw new Error(
                "Role Tenant B gagal dibuat."
            );

        }


        console.log(
            "✅ Role Tenant B berhasil dibuat."
        );


        // ====================================
        // COMMAND REGISTRY
        // ====================================

        const registry =
            new CommandRegistry();


        registry.register(
            new RoleCommand()
        );


        // ====================================
        // COMMAND EXECUTOR
        // ====================================

        const executor =
            new CommandExecutor(
                registry
            );


        // ====================================
        // CROSS-TENANT ROLE LOOKUP
        // ====================================

        console.log("");
        console.log("----------------------------------------");
        console.log("🧪 TENANT A → ROLE TENANT B");
        console.log("----------------------------------------");


        const context =
            new CommandContext({

                sender:
                    "6289529852918",

                chatId:
                    "SECURITY_AUDIT",

                messageId:
                    "RBAC_CROSS_TENANT_ROLE_001",

                text:
                    `/role ${roleName}`,

                args:
                    [
                        roleName
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
        // MUST NOT EXPOSE ROLE DETAIL
        // ====================================

        if (
            replyMessage.includes(
                "DETAIL ROLE"
            )
        ) {

            throw new Error(
                "🚨 SECURITY FAILURE: Tenant A berhasil melihat detail Role Tenant B!"
            );

        }


        // ====================================
        // MUST RETURN NOT FOUND
        // ====================================

        if (
            !replyMessage.includes(
                "Role"
            ) ||
            !replyMessage.includes(
                "tidak ditemukan"
            )
        ) {

            throw new Error(
                "🚨 SECURITY FAILURE: Cross-tenant role tidak ditolak dengan benar!"
            );

        }


        console.log(
            "🔐 Cross-tenant role berhasil ditolak."
        );


        // ====================================
        // DATABASE TENANT A CHECK
        // ====================================

        const lookupFromTenantA =
            await prismaService.client.role.findFirst({

                where: {

                    id:
                        roleB.id,

                    tenantId:
                        tenantA.id

                }

            });


        if (lookupFromTenantA) {

            throw new Error(
                "🚨 SECURITY FAILURE: Role Tenant B dapat ditemukan menggunakan Tenant A!"
            );

        }


        console.log(
            "✅ Role Tenant B tidak ditemukan dari Tenant A."
        );


        // ====================================
        // DATABASE TENANT B CHECK
        // ====================================

        const lookupFromTenantB =
            await prismaService.client.role.findFirst({

                where: {

                    id:
                        roleB.id,

                    tenantId:
                        tenantB.id

                }

            });


        if (!lookupFromTenantB) {

            throw new Error(
                "🚨 SECURITY FAILURE: Role Tenant B hilang dari tenant pemilik!"
            );

        }


        console.log(
            "✅ Role tetap ditemukan pada Tenant B."
        );


        // ====================================
        // ROLE OWNERSHIP CHECK
        // ====================================

        if (
            lookupFromTenantB.tenantId !==
            tenantB.id
        ) {

            throw new Error(
                "🚨 SECURITY FAILURE: Ownership Role berubah!"
            );

        }


        console.log(
            "🔐 Role ownership tetap benar."
        );


        // ====================================
        // ROLE DATA INTEGRITY
        // ====================================

        if (
            lookupFromTenantB.name !==
            roleName
        ) {

            throw new Error(
                "🚨 SECURITY FAILURE: Nama Role berubah!"
            );

        }


        if (
            lookupFromTenantB.description !==
            roleDescription
        ) {

            throw new Error(
                "🚨 SECURITY FAILURE: Deskripsi Role berubah!"
            );

        }


        console.log(
            "✅ Data Role Tenant B tidak berubah."
        );


        // ====================================
        // FINAL SECURITY RESULT
        // ====================================

        console.log("");
        console.log("----------------------------------------");
        console.log("🔐 SECURITY RESULT");
        console.log("----------------------------------------");

        console.log(
            "✅ Owner Tenant A memiliki role.read."
        );

        console.log(
            "✅ Role target benar-benar milik Tenant B."
        );

        console.log(
            "✅ Tenant A tidak dapat melihat detail Role Tenant B."
        );

        console.log(
            "✅ Tenant A tidak dapat menemukan Role Tenant B."
        );

        console.log(
            "✅ Role Tenant B tetap tersedia bagi Tenant B."
        );

        console.log(
            "✅ Role ownership tetap aman."
        );

        console.log(
            "✅ Data Role Tenant B tidak berubah."
        );

        console.log(
            "✅ Cross-tenant role isolation: PASS"
        );


        console.log("");
        console.log("========================================");
        console.log("🎉 RBAC CROSS-TENANT ROLE TEST PASS");
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
        // CLEANUP ROLE
        // ====================================

        if (roleBId) {

            try {

                await prismaService.client.role.delete({

                    where: {
                        id:
                            roleBId
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