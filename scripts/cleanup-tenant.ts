import { prismaService } from "../database/prisma.service";

const TEST_TENANT_ID =
    "0851b40a-634b-430f-b3d4-40cfba3073df";

async function cleanup() {

    console.log("================================");
    console.log("🧹 CLEANUP TEST TENANT");
    console.log("================================");

    try {

        const deletedUsers =
            await prismaService.client.user.deleteMany({
                where: {
                    tenantId: TEST_TENANT_ID
                }
            });

        console.log(
            `👤 User dihapus: ${deletedUsers.count}`
        );

        await prismaService.client.tenant.delete({
            where: {
                id: TEST_TENANT_ID
            }
        });

        console.log("🏢 Tenant B berhasil dihapus.");
        console.log("✅ CLEANUP BERHASIL");

    } catch (error) {

        console.error("❌ CLEANUP GAGAL:", error);

    } finally {

        await prismaService.client.$disconnect();

    }
}

cleanup();