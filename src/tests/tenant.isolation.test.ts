import { prismaService } from "../database/prisma.service";
import { userRepository } from "../apps/api/users/user.repository";
import bcrypt from "bcrypt";

async function test() {

    console.log("");
    console.log("========================================");
    console.log("🧪 TEST TENANT ISOLATION");
    console.log("========================================");

    let testTenantId: string | undefined;

    try {

        // ====================================
        // TENANT A
        // ====================================

        const tenantA =
            await prismaService.client.tenant.findFirst();

        if (!tenantA) {

            throw new Error(
                "Tenant utama tidak ditemukan."
            );

        }

        console.log("");
        console.log(
            "🏢 TENANT A:",
            tenantA.id
        );


        // ====================================
        // BUAT TENANT B KHUSUS TEST
        // ====================================

        const tenantB =
            await prismaService.client.tenant.create({

                data: {

                    name:
                        "TEST Tenant B",

                    code:
                        `test-tenant-b-${Date.now()}`,

                    description:
                        "Temporary tenant for isolation test"

                }

            });

        testTenantId =
            tenantB.id;

        console.log(
            "🏢 TENANT B TEST:",
            tenantB.id
        );


        // ====================================
        // BUAT USER DI TENANT B
        // ====================================

        const hashedPassword =
            await bcrypt.hash(
                "TestPassword123!",
                10
            );

        const testUser =
            await prismaService.client.user.create({

                data: {

                    tenantId:
                        tenantB.id,

                    email:
                        `tenant-b-test-${Date.now()}@test.local`,

                    password:
                        hashedPassword,

                    firstName:
                        "Tenant B",

                    lastName:
                        "Test User",

                    whatsappNumber:
                        undefined,

                    active:
                        true

                }

            });

        console.log(
            "👤 User Tenant B dibuat:",
            testUser.id
        );


        // ====================================
        // QUERY TENANT A
        // ====================================

        const usersA =
            await userRepository.findAll(
                tenantA.id
            );

        console.log("");
        console.log(
            `👥 User Tenant A: ${usersA.length}`
        );


        // ====================================
        // QUERY TENANT B
        // ====================================

        const usersB =
            await userRepository.findAll(
                tenantB.id
            );

        console.log(
            `👥 User Tenant B: ${usersB.length}`
        );


        // ====================================
        // VALIDASI TENANT A
        // ====================================

        const leakedToA =
            usersA.some(
                user =>
                    user.tenantId === tenantB.id
            );

        if (leakedToA) {

            throw new Error(
                "❌ USER TENANT B BOCOR KE TENANT A"
            );

        }

        console.log(
            "✅ Tenant A tidak melihat user Tenant B."
        );


        // ====================================
        // VALIDASI TENANT B
        // ====================================

        const leakedToB =
            usersB.some(
                user =>
                    user.tenantId !== tenantB.id
            );

        if (leakedToB) {

            throw new Error(
                "❌ TENANT B MELIHAT USER TENANT LAIN"
            );

        }

        console.log(
            "✅ Tenant B hanya melihat user miliknya."
        );


        // ====================================
        // CROSS TENANT ID CHECK
        // ====================================

        const tenantAIds =
            new Set(
                usersA.map(
                    user =>
                        user.id
                )
            );

        const tenantBIds =
            new Set(
                usersB.map(
                    user =>
                        user.id
                )
            );

        const overlap =
            [...tenantAIds].filter(
                id =>
                    tenantBIds.has(id)
            );

        if (overlap.length > 0) {

            throw new Error(
                "❌ User ID muncul pada kedua tenant."
            );

        }

        console.log(
            "🔐 Cross-tenant check: PASS"
        );


        // ====================================
        // SUCCESS
        // ====================================

        console.log("");
        console.log("========================================");
        console.log("🎉 TENANT ISOLATION TEST PASS");
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
        // CLEANUP TENANT B
        // ====================================

        if (testTenantId) {

            try {

                // ==============================
                // HAPUS USER TENANT B
                // ==============================

                const deletedUsers =
                    await prismaService.client.user.deleteMany({

                        where: {
                            tenantId:
                                testTenantId
                        }

                    });

                console.log("");
                console.log(
                    `🧹 User Tenant B dihapus: ${deletedUsers.count}`
                );


                // ==============================
                // HAPUS TENANT B
                // ==============================

                await prismaService.client.tenant.delete({

                    where: {
                        id:
                            testTenantId
                    }

                });

                console.log(
                    "🧹 Tenant B test berhasil dihapus."
                );


            } catch (cleanupError) {

                console.error(
                    "⚠️ Gagal cleanup Tenant B:",
                    cleanupError
                );

                process.exitCode = 1;

            }

        }


        // ====================================
        // DISCONNECT PRISMA
        // ====================================

        await prismaService.client.$disconnect();

    }

}


// ========================================
// RUN TEST
// ========================================

test();