import { prismaService } from "../database/prisma.service";
import { userRepository } from "../apps/api/users/user.repository";

async function test() {

    console.log("");
    console.log("========================================");
    console.log("🧪 TEST ASSIGN ROLE TENANT ISOLATION");
    console.log("========================================");

    let tenantBId: string | undefined;
    let userAId: string | undefined;

    try {

        // ====================================
        // TENANT A
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
            "🏢 TENANT A:",
            tenantA.id
        );


        // ====================================
        // ROLE A
        // ====================================

        const roleA =
            await prismaService.client.role.findFirst({

                where: {
                    tenantId: tenantA.id,
                    name: "Owner"
                }

            });

        if (!roleA) {

            throw new Error(
                "Role Owner Tenant A tidak ditemukan."
            );

        }

        console.log(
            "🔐 ROLE A:",
            roleA.id,
            roleA.name
        );


        // ====================================
        // BUAT TENANT B
        // ====================================

        const tenantB =
            await prismaService.client.tenant.create({

                data: {

                    name:
                        "TEST Tenant B Assign Role",

                    code:
                        `test-assign-role-${Date.now()}`,

                    description:
                        "Temporary tenant for assign role isolation test"

                }

            });

        tenantBId =
            tenantB.id;

        console.log("");
        console.log(
            "🏢 TENANT B:",
            tenantB.id
        );


        // ====================================
        // BUAT ROLE B
        // ====================================

        const roleB =
            await prismaService.client.role.create({

                data: {

                    name:
                        "TEST ROLE B",

                    description:
                        "Role Tenant B",

                    tenantId:
                        tenantB.id

                }

            });

        console.log(
            "🔐 ROLE B:",
            roleB.id,
            roleB.name
        );


        // ====================================
        // BUAT USER DI TENANT A
        // ====================================

        const testUser =
            await prismaService.client.user.create({

                data: {

                    tenantId:
                        tenantA.id,

                    email:
                        `assign-role-isolation-${Date.now()}@test.local`,

                    password:
                        "TEST_HASHED_PASSWORD",

                    firstName:
                        "Isolation",

                    lastName:
                        "Test User",

                    whatsappNumber:
                        `628${Date.now()
                            .toString()
                            .slice(-10)}`,

                    active:
                        true

                }

            });

        userAId =
            testUser.id;

        console.log("");
        console.log(
            "👤 USER A:",
            testUser.id
        );


        // ====================================
        // ATTEMPT CROSS-TENANT ASSIGN
        // ====================================

        console.log("");
        console.log(
            "⚔️ ATTEMPT:"
        );

        console.log(
            "User A Tenant A"
        );

        console.log(
            "Role B Tenant B"
        );

        console.log(
            "➡️ Mencoba memberikan Role B kepada User A..."
        );


        let rejected =
            false;


        try {

            await userRepository.assignRoles(

                testUser.id,

                [roleB.id],

                tenantA.id

            );

        } catch (error) {

            rejected =
                true;

            console.log("");
            console.log(
                "🛡️ CROSS-TENANT ATTACK DITOLAK:"
            );

            console.log(
                error instanceof Error
                    ? error.message
                    : error
            );

        }


        // ====================================
        // VALIDASI REJECTION
        // ====================================

        if (!rejected) {

            throw new Error(
                "❌ SECURITY FAILURE: Role Tenant B berhasil diberikan kepada User Tenant A."
            );

        }

        console.log(
            "✅ Cross-tenant assignment berhasil ditolak."
        );


        // ====================================
        // VERIFY USER
        // ====================================

        const verifiedUser =
            await prismaService.client.user.findUnique({

                where: {

                    id:
                        testUser.id

                },

                include: {

                    roles: true

                }

            });


        if (!verifiedUser) {

            throw new Error(
                "❌ User test tidak ditemukan saat verification."
            );

        }


        // ====================================
        // ROLE B TIDAK BOLEH MASUK
        // ====================================

        const leakedRole =
            verifiedUser.roles.some(

                role =>
                    role.id === roleB.id

            );


        if (leakedRole) {

            throw new Error(
                "❌ SECURITY FAILURE: Role Tenant B ditemukan pada User Tenant A."
            );

        }


        console.log(
            "✅ Role Tenant B tidak masuk ke User Tenant A."
        );


        // ====================================
        // ROLE TENANT CHECK
        // ====================================

        const userRoles =
            await prismaService.client.role.findMany({

                where: {

                    users: {

                        some: {

                            id:
                                testUser.id

                        }

                    }

                }

            });


        const foreignRole =
            userRoles.some(

                role =>
                    role.tenantId !== tenantA.id

            );


        if (foreignRole) {

            throw new Error(
                "❌ SECURITY FAILURE: User memiliki role dari tenant lain."
            );

        }


        console.log(
            "✅ User hanya memiliki role dari tenant sendiri."
        );


        // ====================================
        // SUCCESS
        // ====================================

        console.log("");
        console.log("========================================");
        console.log("🎉 CROSS-TENANT ASSIGN ROLE TEST PASS");
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
        // CLEANUP USER
        // ====================================

        if (userAId) {

            try {

                await prismaService.client.user.delete({

                    where: {

                        id:
                            userAId

                    }

                });

                console.log(
                    "🧹 Test User A berhasil dihapus."
                );

            } catch (error) {

                console.error(
                    "⚠️ Gagal cleanup User A:",
                    error
                );

            }

        }


        // ====================================
        // CLEANUP TENANT B
        // ====================================

        if (tenantBId) {

            try {

                // Hapus user Tenant B
                await prismaService.client.user.deleteMany({

                    where: {

                        tenantId:
                            tenantBId

                    }

                });


                // Hapus permission Tenant B
                await prismaService.client.permission.deleteMany({

                    where: {

                        tenantId:
                            tenantBId

                    }

                });


                // Hapus role Tenant B
                await prismaService.client.role.deleteMany({

                    where: {

                        tenantId:
                            tenantBId

                    }

                });


                // Hapus business Tenant B
                await prismaService.client.business.deleteMany({

                    where: {

                        tenantId:
                            tenantBId

                    }

                });


                // Hapus settings Tenant B
                await prismaService.client.setting.deleteMany({

                    where: {

                        tenantId:
                            tenantBId

                    }

                });


                // Hapus Tenant B
                await prismaService.client.tenant.delete({

                    where: {

                        id:
                            tenantBId

                    }

                });


                console.log(
                    "🧹 Tenant B berhasil dihapus."
                );

            } catch (cleanupError) {

                console.error(
                    "⚠️ Gagal cleanup Tenant B:",
                    cleanupError
                );

            }

        }


        await prismaService.client.$disconnect();

    }

}


test();