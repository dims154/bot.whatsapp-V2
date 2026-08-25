import { prismaService } from "../database/prisma.service";
import { CommandExecutor } from "../apps/bot/executor/CommandExecutor";
import { CommandRegistry } from "../apps/bot/registry/CommandRegistry";
import { CommandLoader } from "../apps/bot/loader/CommandLoader";

const prisma = prismaService.client;

async function main() {

    console.log("========================================");
    console.log("🔐 RBAC SECURITY AUDIT");
    console.log("🧪 TEST #10: ASSIGN PERMISSION SECURITY");
    console.log("========================================");

    const timestamp = Date.now();

    // ========================================
    // OWNER / TENANT A
    // ========================================

    const owner = await prisma.user.findFirst({
        where: {
            email: "owner@erp.local"
        },
        include: {
            roles: true,
            permissions: true
        }
    });

    if (!owner || !owner.tenantId) {
        throw new Error("Owner owner@erp.local tidak ditemukan.");
    }

    const tenantA = owner.tenantId;

    console.log(
        "👤 Owner:",
        owner.email
    );

    console.log(
        "🏢 Tenant A:",
        tenantA
    );

    // ========================================
    // TENANT B
    // ========================================

    const tenantB = await prisma.tenant.create({
        data: {
            code: `TEST-ASSIGN-PERM-${timestamp}`,
            name: `Assign Permission Security Tenant B ${timestamp}`
        }
    });

    console.log(
        "🏢 Tenant B:",
        tenantB.id
    );

    // ========================================
    // PERMISSION TENANT A
    // ========================================

    const permissionA =
        await prisma.permission.create({
            data: {
                tenantId: tenantA,
                name: `Security Permission A ${timestamp}`,
                description:
                    "Permission Tenant A untuk security test"
            }
        });

    // ========================================
    // PERMISSION TENANT B
    // ========================================

    const permissionB =
        await prisma.permission.create({
            data: {
                tenantId: tenantB.id,
                name: `Secret Permission B ${timestamp}`,
                description:
                    "Permission Tenant B untuk security test"
            }
        });

    console.log(
        "🔑 Permission Tenant A:",
        permissionA.name
    );

    console.log(
        "🔑 Permission Tenant B:",
        permissionB.name
    );

    console.log(
        "🆔 Permission B:",
        permissionB.id
    );

    // ========================================
    // AUTHORIZATION PERMISSION
    // ========================================

    const assignPermission =
        await prisma.permission.create({
            data: {
                tenantId: tenantA,
                name: "user.assign_permissions",
                description:
                    "Permission untuk memberikan permission kepada user"
            }
        });

    console.log(
        "🔐 Assign Permission Permission:",
        assignPermission.name
    );

    // ========================================
    // NORMAL ROLE
    // ========================================

    const normalRole =
        await prisma.role.create({
            data: {
                tenantId: tenantA,
                name: `Security Normal Role ${timestamp}`,
                description:
                    "Role tanpa user.assign_permissions"
            }
        });

    // ========================================
    // AUTHORIZED ROLE
    // ========================================

    const authorizedRole =
        await prisma.role.create({
            data: {
                tenantId: tenantA,
                name: `Security Assign Permission ${timestamp}`,
                description:
                    "Role dengan user.assign_permissions",

                permissions: {
                    connect: {
                        id: assignPermission.id
                    }
                }
            }
        });

    // ========================================
    // TARGET USER TENANT A
    // ========================================

    const targetUserA =
        await prisma.user.create({
            data: {
                tenantId: tenantA,

                email:
                    `assign-permission-target-a-${timestamp}@test.local`,

                password:
                    "security-test",

                firstName:
                    "Target",

                lastName:
                    "TenantA",

                whatsappNumber:
                    `628755${timestamp
                        .toString()
                        .slice(-7)}`,

                active: true
            }
        });

    // ========================================
    // TARGET USER TENANT B
    // ========================================

    const targetUserB =
        await prisma.user.create({
            data: {
                tenantId: tenantB.id,

                email:
                    `assign-permission-target-b-${timestamp}@test.local`,

                password:
                    "security-test",

                firstName:
                    "Target",

                lastName:
                    "TenantB",

                whatsappNumber:
                    `628756${timestamp
                        .toString()
                        .slice(-7)}`,

                active: true
            }
        });

    // ========================================
    // NORMAL USER
    // ========================================

    const normalUser =
        await prisma.user.create({
            data: {
                tenantId: tenantA,

                email:
                    `assign-permission-normal-${timestamp}@test.local`,

                password:
                    "security-test",

                firstName:
                    "Normal",

                lastName:
                    "User",

                whatsappNumber:
                    `628753${timestamp
                        .toString()
                        .slice(-7)}`,

                active: true,

                roles: {
                    connect: {
                        id: normalRole.id
                    }
                }
            }
        });

    // ========================================
    // AUTHORIZED USER
    // ========================================

    const authorizedUser =
        await prisma.user.create({
            data: {
                tenantId: tenantA,

                email:
                    `assign-permission-authorized-${timestamp}@test.local`,

                password:
                    "security-test",

                firstName:
                    "Authorized",

                lastName:
                    "User",

                whatsappNumber:
                    `628754${timestamp
                        .toString()
                        .slice(-7)}`,

                active: true,

                roles: {
                    connect: {
                        id: authorizedRole.id
                    }
                }
            }
        });

    console.log(
        "👤 Normal User:",
        normalUser.id
    );

    console.log(
        "👤 Authorized User:",
        authorizedUser.id
    );

    console.log(
        "👤 Target User Tenant A:",
        targetUserA.id
    );

    console.log(
        "👤 Target User Tenant B:",
        targetUserB.id
    );

    // ========================================
    // COMMAND REGISTRY
    // ========================================

    const registry =
        new CommandRegistry();

    const loader =
        new CommandLoader(registry);

    loader.load();

    const executor =
        new CommandExecutor(registry);

    // ========================================
    // CHECK COMMAND
    // ========================================

    const command =
        registry.get("assignpermission");

    console.log(
        "🧪 ASSIGNPERMISSION REGISTER CHECK:",
        command
    );

    if (!command) {
        throw new Error(
            "SECURITY FAILURE: assignpermission tidak terdaftar."
        );
    }

    // ========================================
    // HELPER
    // ========================================

    async function executeCommand(
        label: string,
        userId: string,
        whatsapp: string,
        text: string,
        roles: string[],
        permissions: string[]
    ) {

        console.log("");
        console.log("----------------------------------------");
        console.log(`🧪 ${label}`);
        console.log("----------------------------------------");

        const replies: string[] = [];

        const args =
            text
                .trim()
                .split(/\s+/)
                .slice(1);

        await executor.execute({

            text,

            sender:
                whatsapp,

            userId,

            tenantId:
                tenantA,

            roles,

            permissions,

            isAdmin:
                false,

            isOwner:
                false,

            args,

            chatId:
                `security-test-${timestamp}`,

            messageId:
                `security-message-${timestamp}-${Date.now()}`,

            isGroup:
                false,

            reply:
                async (message: string) => {

                    replies.push(message);

                    console.log("");
                    console.log("📨 REPLY:");
                    console.log(message);
                }
        });

        return replies;
    }

    // ========================================
    // NORMAL USER → ASSIGN PERMISSION
    // ========================================

    await executeCommand(
            "NORMAL USER → ASSIGN PERMISSION",

            normalUser.id,

            normalUser.whatsappNumber!,

            `/assignpermission ${targetUserA.whatsappNumber} ${permissionA.name}`,

            [normalRole.name],

            []
        );

    const normalAfter =
        await prisma.user.findUnique({
            where: {
                id: targetUserA.id
            },
            include: {
                permissions: true
            }
        });

    const normalGranted =
        normalAfter?.permissions.some(
            permission =>
                permission.id === permissionA.id
        );

    if (normalGranted) {

        throw new Error(
            "SECURITY FAILURE: User tanpa user.assign_permissions berhasil memberikan permission."
        );
    }

    console.log(
        "✅ User tanpa user.assign_permissions berhasil ditolak."
    );

    // ========================================
    // AUTHORIZED USER → CROSS TENANT USER
    // ========================================

    await executeCommand(
            "TENANT A USER → TARGET USER TENANT B",

            authorizedUser.id,

            authorizedUser.whatsappNumber!,

            `/assignpermission ${targetUserB.whatsappNumber} ${permissionA.name}`,

            [authorizedRole.name],

            [assignPermission.name]
        );

    const targetBAfterUserAttack =
        await prisma.user.findUnique({
            where: {
                id: targetUserB.id
            },
            include: {
                permissions: true
            }
        });

    const crossTenantUserGranted =
        targetBAfterUserAttack?.permissions.some(
            permission =>
                permission.id === permissionA.id
        );

    if (crossTenantUserGranted) {

        throw new Error(
            "SECURITY FAILURE: Tenant A berhasil memberikan permission kepada user Tenant B."
        );
    }

    console.log(
        "✅ Cross-tenant target user berhasil ditolak."
    );

    // ========================================
    // AUTHORIZED USER → CROSS TENANT PERMISSION
    // ========================================

    await executeCommand(
            "TENANT A USER → PERMISSION TENANT B",

            authorizedUser.id,

            authorizedUser.whatsappNumber!,

            `/assignpermission ${targetUserA.whatsappNumber} ${permissionB.name}`,

            [authorizedRole.name],

            [assignPermission.name]
        );

    const targetAAfterPermissionAttack =
        await prisma.user.findUnique({
            where: {
                id: targetUserA.id
            },
            include: {
                permissions: true
            }
        });

    const crossTenantPermissionGranted =
        targetAAfterPermissionAttack?.permissions.some(
            permission =>
                permission.id === permissionB.id
        );

    if (crossTenantPermissionGranted) {

        throw new Error(
            "SECURITY FAILURE: Tenant A berhasil memberikan permission milik Tenant B."
        );
    }

    console.log(
        "✅ Cross-tenant permission berhasil ditolak."
    );

    // ========================================
    // AUTHORIZED USER → SAME TENANT
    // ========================================

    await executeCommand(
            "AUTHORIZED USER → SAME TENANT",

            authorizedUser.id,

            authorizedUser.whatsappNumber!,

            `/assignpermission ${targetUserA.whatsappNumber} ${permissionA.name}`,

            [authorizedRole.name],

            [assignPermission.name]
        );

    const targetAAfterSuccess =
        await prisma.user.findUnique({
            where: {
                id: targetUserA.id
            },
            include: {
                permissions: true
            }
        });

    const authorizedGranted =
        targetAAfterSuccess?.permissions.some(
            permission =>
                permission.id === permissionA.id
        );

    if (!authorizedGranted) {

        throw new Error(
            "SECURITY FAILURE: Authorized user tidak dapat memberikan permission dalam tenant yang sama."
        );
    }

    console.log(
        "✅ Authorized user berhasil memberikan permission."
    );

    // ========================================
    // SECURITY RESULT
    // ========================================

    console.log("");
    console.log("----------------------------------------");
    console.log("🔐 SECURITY RESULT");
    console.log("----------------------------------------");

    console.log(
        "✅ User tanpa permission tidak dapat assign permission."
    );

    console.log(
        "✅ Cross-tenant target user assignment ditolak."
    );

    console.log(
        "✅ Cross-tenant permission assignment ditolak."
    );

    console.log(
        "✅ Authorized user dapat assign permission dalam tenant."
    );

    console.log(
        "✅ Database tetap aman."
    );

    console.log(
        "✅ Tenant isolation tetap aman."
    );

    console.log(
        "✅ Assign permission security: PASS"
    );

    console.log("");
    console.log(
        "========================================"
    );

    console.log(
        "🎉 RBAC ASSIGN PERMISSION SECURITY TEST PASS"
    );

    console.log(
        "========================================"
    );

    // ========================================
    // CLEANUP
    // ========================================

    await prisma.user.deleteMany({
        where: {
            id: {
                in: [
                    normalUser.id,
                    authorizedUser.id,
                    targetUserA.id,
                    targetUserB.id
                ]
            }
        }
    });

    await prisma.role.deleteMany({
        where: {
            id: {
                in: [
                    normalRole.id,
                    authorizedRole.id
                ]
            }
        }
    });

    await prisma.permission.deleteMany({
        where: {
            id: {
                in: [
                    permissionA.id,
                    permissionB.id,
                    assignPermission.id
                ]
            }
        }
    });

    await prisma.tenant.delete({
        where: {
            id: tenantB.id
        }
    });

    console.log(
        "🧹 Test users berhasil dihapus."
    );

    console.log(
        "🧹 Test roles berhasil dihapus."
    );

    console.log(
        "🧹 Test permissions berhasil dihapus."
    );

    console.log(
        "🧹 Tenant B berhasil dihapus."
    );
}


// ========================================
// RUN
// ========================================

main()
    .catch(async error => {

        console.error("");
        console.error(
            "❌ SECURITY TEST RESULT:"
        );

        console.error(error);

        process.exitCode = 1;
    })
    .finally(async () => {

        await prismaService.disconnect();
    });