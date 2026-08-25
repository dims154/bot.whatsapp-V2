import { prismaService } from "../database/prisma.service";
import { userRepository } from "../apps/api/users/user.repository";

async function test() {

    console.log("");
    console.log("========================================");
    console.log("🧪 TEST ASSIGN PERMISSION TENANT ISOLATION");
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
        // PERMISSION A
        // ====================================

        const permissionA =
            await prismaService.client.permission.findFirst({

                where: {

                    tenantId:
                        tenantA.id,

                    name:
                        "user.create"

                }

            });

        if (!permissionA) {

            throw new Error(
                "Permission Tenant A tidak ditemukan."
            );

        }


        console.log(
            "🔑 PERMISSION A:",
            permissionA.id,
            permissionA.name
        );


        // ====================================
        // BUAT TENANT B
        // ====================================

        const tenantB =
            await prismaService.client.tenant.create({

                data: {

                    name:
                        "TEST Tenant B Permission",

                    code:
                        `test-assign-permission-${Date.now()}`,

                    description:
                        "Temporary tenant for permission isolation test"

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
        // BUAT PERMISSION B
        // ====================================

        const permissionB =
            await prismaService.client.permission.create({

                data: {

                    name:
                        "test.cross.tenant.permission",

                    description:
                        "Permission Tenant B",

                    tenantId:
                        tenantB.id

                }

            });


        console.log(
            "🔑 PERMISSION B:",
            permissionB.id,
            permissionB.name
        );


        // ====================================
        // BUAT USER A
        // ====================================

        const testUser =
            await prismaService.client.user.create({

                data: {

                    tenantId:
                        tenantA.id,

                    email:
                        `assign-permission-isolation-${Date.now()}@test.local`,

                    password:
                        "TEST_HASHED_PASSWORD",

                    firstName:
                        "Permission",

                    lastName:
                        "Isolation",

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
        // ATTEMPT CROSS-TENANT ASSIGNMENT
        // ====================================

        console.log("");
        console.log(
            "⚔️ ATTEMPT:"
        );

        console.log(
            "User A → Tenant A"
        );

        console.log(
            "Permission B → Tenant B"
        );

        console.log(
            "➡️ Mencoba memberikan Permission B kepada User A..."
        );


        let rejected =
            false;


        try {

            await userRepository.assignPermissions(

                testUser.id,

                [permissionB.id],

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
                "❌ SECURITY FAILURE: Permission Tenant B berhasil diberikan kepada User Tenant A."
            );

        }


        console.log(
            "✅ Cross-tenant permission assignment berhasil ditolak."
        );


        // ====================================
        // VERIFY DATABASE
        // ====================================

        const verifiedUser =
            await prismaService.client.user.findUnique({

                where: {

                    id:
                        testUser.id

                },

                include: {

                    permissions: true

                }

            });


        if (!verifiedUser) {

            throw new Error(
                "❌ User test tidak ditemukan."
            );

        }


        // ====================================
        // PERMISSION B TIDAK BOLEH MASUK
        // ====================================

        const leakedPermission =
            verifiedUser.permissions.some(

                permission =>
                    permission.id === permissionB.id

            );


        if (leakedPermission) {

            throw new Error(
                "❌ SECURITY FAILURE: Permission Tenant B ditemukan pada User Tenant A."
            );

        }


        console.log(
            "✅ Permission Tenant B tidak masuk ke User Tenant A."
        );


        // ====================================
        // VALIDASI SEMUA PERMISSION USER
        // ====================================

        const userPermissions =
            await prismaService.client.permission.findMany({

                where: {

                    users: {

                        some: {

                            id:
                                testUser.id

                        }

                    }

                }

            });


        const foreignPermission =
            userPermissions.some(

                permission =>
                    permission.tenantId !== tenantA.id

            );


        if (foreignPermission) {

            throw new Error(
                "❌ SECURITY FAILURE: User memiliki permission dari tenant lain."
            );

        }


        console.log(
            "✅ User hanya memiliki permission dari tenant sendiri."
        );


        // ====================================
        // SUCCESS
        // ====================================

        console.log("");
        console.log("========================================");
        console.log("🎉 CROSS-TENANT ASSIGN PERMISSION TEST PASS");
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
        // CLEANUP USER A
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
                    "🧹 User A berhasil dihapus."
                );

            } catch (cleanupError) {

                console.error(
                    "⚠️ Gagal cleanup User A:",
                    cleanupError
                );

            }

        }


        // ====================================
        // CLEANUP TENANT B
        // ====================================

        if (tenantBId) {

            try {

                // User Tenant B
                await prismaService.client.user.deleteMany({

                    where: {

                        tenantId:
                            tenantBId

                    }

                });


                // Permission Tenant B
                await prismaService.client.permission.deleteMany({

                    where: {

                        tenantId:
                            tenantBId

                    }

                });


                // Role Tenant B
                await prismaService.client.role.deleteMany({

                    where: {

                        tenantId:
                            tenantBId

                    }

                });


                // Business Tenant B
                await prismaService.client.business.deleteMany({

                    where: {

                        tenantId:
                            tenantBId

                    }

                });


                // Setting Tenant B
                await prismaService.client.setting.deleteMany({

                    where: {

                        tenantId:
                            tenantBId

                    }

                });


                // Tenant B
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