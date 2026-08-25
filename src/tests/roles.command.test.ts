import { prismaService } from "../database/prisma.service";

import { CommandRegistry } from "../apps/bot/registry/CommandRegistry";
import { CommandExecutor } from "../apps/bot/executor/CommandExecutor";
import { CommandContext } from "../apps/bot/context/CommandContext";

import { RolesCommand } from "../apps/bot/commands/roles.command";


async function test() {

    console.log("");
    console.log("========================================");
    console.log("🧪 TEST ROLES COMMAND");
    console.log("========================================");

    let testTenantId:
        string | undefined;

    let testRoleId:
        string | undefined;


    try {

        // ====================================
        // TENANT UTAMA
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
            "🏢 Tenant A:",
            tenantA.id
        );


        // ====================================
        // BUAT TENANT B
        // ====================================

        const tenantB =
            await prismaService.client.tenant.create({

                data: {

                    name:
                        "TEST Role Tenant B",

                    code:
                        `test-role-${Date.now()}`,

                    description:
                        "Temporary role isolation tenant"

                }

            });


        testTenantId =
            tenantB.id;


        console.log(
            "🏢 Tenant B:",
            tenantB.id
        );


        // ====================================
        // BUAT ROLE TENANT B
        // ====================================

        const roleB =
            await prismaService.client.role.create({

                data: {

                    tenantId:
                        tenantB.id,

                    name:
                        "Tenant B Secret Role",

                    description:
                        "Role yang tidak boleh terlihat Tenant A"

                }

            });


        testRoleId =
            roleB.id;


        console.log(
            "🔐 Role Tenant B:",
            roleB.name
        );


        // ====================================
        // REGISTRY
        // ====================================

        const registry =
            new CommandRegistry();


        registry.register(
            new RolesCommand()
        );


        // ====================================
        // EXECUTOR
        // ====================================

        const executor =
            new CommandExecutor(
                registry
            );


        // ====================================
        // CONTEXT TENANT A
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
                    "/roles",

                args:
                    [],

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


        // ====================================
        // CAPTURE REPLY
        // ====================================

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


        // ====================================
        // VALIDASI RESPONSE
        // ====================================

        if (!replyMessage) {

            throw new Error(
                "❌ Command tidak menghasilkan reply."
            );

        }


        console.log(
            "✅ /roles berhasil menghasilkan response."
        );


        // ====================================
        // TENANT ISOLATION
        // ====================================

        if (
            replyMessage.includes(
                "Tenant B Secret Role"
            )
        ) {

            throw new Error(
                "❌ ROLE TENANT B BOCOR KE TENANT A."
            );

        }


        console.log(
            "✅ Role Tenant B tidak terlihat oleh Tenant A."
        );


        // ====================================
        // DATABASE CHECK
        // ====================================

        const rolesA =
            await prismaService.client.role.findMany({

                where: {

                    tenantId:
                        tenantA.id

                }

            });


        const leakedRole =
            rolesA.some(
                role =>
                    role.id === roleB.id
            );


        if (leakedRole) {

            throw new Error(
                "❌ Database Tenant A menemukan role Tenant B."
            );

        }


        console.log(
            "🔐 Cross-tenant role check: PASS"
        );


        // ====================================
        // SUCCESS
        // ====================================

        console.log("");
        console.log("========================================");
        console.log("🎉 ROLES COMMAND TEST PASS");
        console.log("========================================");


    } catch (error) {

        console.error("");
        console.error(
            "❌ TEST ERROR:"
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
        // CLEANUP TENANT
        // ====================================

        if (testTenantId) {

            try {

                await prismaService.client.tenant.delete({

                    where: {
                        id:
                            testTenantId
                    }

                });

                console.log(
                    "🧹 Test tenant berhasil dihapus."
                );

            } catch (error) {

                console.error(
                    "⚠️ Cleanup tenant gagal:",
                    error
                );

            }

        }


        await prismaService.client.$disconnect();

    }

}


test();