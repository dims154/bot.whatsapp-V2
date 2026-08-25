import { prismaService } from "../database/prisma.service";
import { CommandExecutor } from "../apps/bot/executor/CommandExecutor";
import { CommandRegistry } from "../apps/bot/registry/CommandRegistry";
import { CommandLoader } from "../apps/bot/loader/CommandLoader";

const prisma = prismaService.client;

async function main() {

    console.log("========================================");
    console.log("🔐 RBAC SECURITY AUDIT");
    console.log("🧪 TEST #9: ASSIGN ROLE SECURITY");
    console.log("========================================");

    // ========================================
    // OWNER
    // ========================================

    const owner = await prisma.user.findFirst({
        where: {
            email: "owner@erp.local"
        }
    });

    if (!owner) {
        throw new Error(
            "❌ Owner owner@erp.local tidak ditemukan."
        );
    }

    const tenantA = owner.tenantId;

    console.log("");
    console.log("👤 Owner:", owner.email);
    console.log("🏢 Tenant A:", tenantA);

    // ========================================
    // TENANT B
    // ========================================

    const timestamp = Date.now();

    const tenantB = await prisma.tenant.create({
        data: {
            code: `TEST-ASSIGN-ROLE-${timestamp}`,
            name: `Assign Role Security Tenant B ${timestamp}`
        }
    });

    console.log(
        "🏢 Tenant B:",
        tenantB.id
    );

    // ========================================
    // ROLE TENANT A
    // ========================================

    const roleA = await prisma.role.create({
        data: {
            tenantId: tenantA,
            name: `Security Role A ${timestamp}`,
            description:
                "Role Tenant A untuk security test"
        }
    });

    console.log(
        "🔐 Role Tenant A:",
        roleA.name
    );

    // ========================================
    // ROLE TENANT B
    // ========================================

    const roleB = await prisma.role.create({
        data: {
            tenantId: tenantB.id,
            name: `Secret Role B ${timestamp}`,
            description:
                "Role Tenant B untuk cross-tenant test"
        }
    });

    console.log(
        "🔐 Role Tenant B:",
        roleB.name
    );

    // ========================================
    // PERMISSION user.assign_roles
    // ========================================

    const assignRolePermission =
        await prisma.permission.findFirst({
            where: {
                tenantId: tenantA,
                name: "user.assign_roles"
            }
        });

    if (!assignRolePermission) {
        throw new Error(
            "❌ Permission user.assign_roles tidak ditemukan."
        );
    }

    console.log(
        "🔑 Permission:",
        assignRolePermission.name
    );

    // ========================================
    // ROLE NORMAL
    // ========================================

    const normalRole = await prisma.role.create({
        data: {
            tenantId: tenantA,
            name: `Security Normal Role ${timestamp}`,
            description:
                "Role tanpa user.assign_roles"
        }
    });

    // ========================================
    // ROLE AUTHORIZED
    // ========================================

    const authorizedRole =
        await prisma.role.create({
            data: {
                tenantId: tenantA,
                name: `Security Assign Role ${timestamp}`,
                description:
                    "Role dengan user.assign_roles",
                permissions: {
                    connect: {
                        id: assignRolePermission.id
                    }
                }
            }
        });

    // ========================================
    // NORMAL USER
    // ========================================

    const normalUser =
        await prisma.user.create({
            data: {
                email:
                    `assign-role-normal-${timestamp}@test.local`,
                password: "test-password",
                firstName: "Normal",
                lastName: "AssignRole",
                whatsappNumber:
                    `628753${timestamp
                        .toString()
                        .slice(-7)}`,
                tenantId: tenantA,
                active: true,
                roles: {
                    connect: {
                        id: normalRole.id
                    }
                }
            }
        });

    console.log(
        "👤 Normal User:",
        normalUser.id
    );

    // ========================================
    // AUTHORIZED USER
    // ========================================

    const authorizedUser =
        await prisma.user.create({
            data: {
                email:
                    `assign-role-authorized-${timestamp}@test.local`,
                password: "test-password",
                firstName: "Authorized",
                lastName: "AssignRole",
                whatsappNumber:
                    `628754${timestamp
                        .toString()
                        .slice(-7)}`,
                tenantId: tenantA,
                active: true,
                roles: {
                    connect: {
                        id: authorizedRole.id
                    }
                }
            }
        });

    console.log(
        "👤 Authorized User:",
        authorizedUser.id
    );

    // ========================================
    // TARGET USER TENANT A
    // ========================================

    const targetUserA =
        await prisma.user.create({
            data: {
                email:
                    `assign-role-target-a-${timestamp}@test.local`,
                password: "test-password",
                firstName: "Target",
                lastName: "TenantA",
                whatsappNumber:
                    `628755${timestamp
                        .toString()
                        .slice(-7)}`,
                tenantId: tenantA,
                active: true
            }
        });

    console.log(
        "👤 Target User Tenant A:",
        targetUserA.id
    );

    // ========================================
    // TARGET USER TENANT B
    // ========================================

    const targetUserB =
        await prisma.user.create({
            data: {
                email:
                    `assign-role-target-b-${timestamp}@test.local`,
                password: "test-password",
                firstName: "Target",
                lastName: "TenantB",
                whatsappNumber:
                    `628756${timestamp
                        .toString()
                        .slice(-7)}`,
                tenantId: tenantB.id,
                active: true
            }
        });

    console.log(
        "👤 Target User Tenant B:",
        targetUserB.id
    );

    // ========================================
    // COMMAND REGISTRY
    // ========================================

    const registry =
        new CommandRegistry();

  const loader = new CommandLoader(registry);

loader.load();

console.log(
    "🧪 ASSIGNROLE REGISTER CHECK:",
    registry.get("assignrole")
);
    const executor =
        new CommandExecutor(registry);

    // ========================================
    // HELPER
    // ========================================

    async function executeCommand(
        label: string,
        userId: string,
        sender: string,
        tenantId: string,
        roles: string[],
        permissions: string[],
        text: string
    ): Promise<string> {

        console.log("");
        console.log("----------------------------------------");
        console.log(`🧪 ${label}`);
        console.log("----------------------------------------");

        const replies: string[] = [];

       await executor.execute({
    text,

    sender,

    userId,

    tenantId,

    roles,

    permissions,

    isAdmin: roles.some(
        role =>
            [
                "Admin",
                "Owner",
                "Super Admin"
            ].includes(role)
    ),

    isOwner: roles.some(
        role =>
            role.toLowerCase() ===
            "owner"
    ),

    args: text
        .trim()
        .split(/\s+/)
        .slice(1),

    // ========================================
    // REQUIRED COMMAND CONTEXT
    // ========================================

    chatId:
        `security-test-${timestamp}`,

    messageId:
        `RBAC_ASSIGN_ROLE_${timestamp}`,

    isGroup:
        false,

    // ========================================
    // REPLY
    // ========================================

    reply: async (
        message: string
    ) => {

        replies.push(message);

        console.log("");

        console.log(
            "📨 REPLY:"
        );

        console.log(
            message
        );
    }
});

        return replies.join("\n");
    }

    try {

        // ========================================
        // TEST #1
        // NORMAL USER
        // ========================================

        const normalReply =
            await executeCommand(
                "NORMAL USER → ASSIGN ROLE",
                normalUser.id,
                normalUser.whatsappNumber!,
                tenantA,
                [normalRole.name],
                [],
                `/assignrole ${targetUserA.whatsappNumber} ${roleA.name}`
            );

        if (
            !normalReply.includes(
                "tidak memiliki permission"
            )
        ) {

            throw new Error(
                "SECURITY FAILURE: User tanpa user.assign_roles dapat menjalankan /assignrole."
            );
        }

        const targetNormalCheck =
            await prisma.user.findUnique({
                where: {
                    id: targetUserA.id
                },
                include: {
                    roles: true
                }
            });

        if (
            targetNormalCheck?.roles.some(
                role =>
                    role.id === roleA.id
            )
        ) {

            throw new Error(
                "SECURITY FAILURE: Role berhasil diberikan oleh user tanpa permission."
            );
        }

        console.log(
            "✅ User tanpa user.assign_roles berhasil ditolak."
        );

        // ========================================
        // TEST #2
        // CROSS-TENANT USER
        // ========================================

        const crossTenantUserReply =
            await executeCommand(
                "TENANT A USER → TARGET USER TENANT B",
                authorizedUser.id,
                authorizedUser.whatsappNumber!,
                tenantA,
                [authorizedRole.name],
                ["user.assign_roles"],
                `/assignrole ${targetUserB.whatsappNumber} ${roleA.name}`
            );

        if (
            !crossTenantUserReply.includes(
                "tidak ditemukan"
            )
        ) {

            throw new Error(
                "SECURITY FAILURE: Tenant A dapat memodifikasi User Tenant B."
            );
        }

        const targetBCheck =
            await prisma.user.findUnique({
                where: {
                    id: targetUserB.id
                },
                include: {
                    roles: true
                }
            });

        if (
            targetBCheck?.roles.some(
                role =>
                    role.id === roleA.id
            )
        ) {

            throw new Error(
                "SECURITY FAILURE: Role Tenant A berhasil diberikan kepada User Tenant B."
            );
        }

        console.log(
            "✅ Cross-tenant target user berhasil ditolak."
        );

        // ========================================
        // TEST #3
        // CROSS-TENANT ROLE
        // ========================================

        const crossTenantRoleReply =
            await executeCommand(
                "TENANT A USER → ROLE TENANT B",
                authorizedUser.id,
                authorizedUser.whatsappNumber!,
                tenantA,
                [authorizedRole.name],
                ["user.assign_roles"],
                `/assignrole ${targetUserA.whatsappNumber} ${roleB.name}`
            );

        if (
            !crossTenantRoleReply.includes(
                "tidak ditemukan"
            )
        ) {

            throw new Error(
                "SECURITY FAILURE: Tenant A dapat menggunakan Role Tenant B."
            );
        }

        const targetRoleCheck =
            await prisma.user.findUnique({
                where: {
                    id: targetUserA.id
                },
                include: {
                    roles: true
                }
            });

        if (
            targetRoleCheck?.roles.some(
                role =>
                    role.id === roleB.id
            )
        ) {

            throw new Error(
                "SECURITY FAILURE: Role Tenant B berhasil diberikan ke User Tenant A."
            );
        }

        console.log(
            "✅ Cross-tenant role berhasil ditolak."
        );

        // ========================================
        // TEST #4
        // AUTHORIZED SAME TENANT
        // ========================================

        const successReply =
            await executeCommand(
                "AUTHORIZED USER → SAME TENANT",
                authorizedUser.id,
                authorizedUser.whatsappNumber!,
                tenantA,
                [authorizedRole.name],
                ["user.assign_roles"],
                `/assignrole ${targetUserA.whatsappNumber} ${roleA.name}`
            );

        if (
            !successReply
                .toLowerCase()
                .includes("berhasil")
        ) {

            throw new Error(
                "SECURITY FAILURE: User dengan user.assign_roles gagal memberikan role."
            );
        }

        const finalTarget =
            await prisma.user.findUnique({
                where: {
                    id: targetUserA.id
                },
                include: {
                    roles: true
                }
            });

        if (
            !finalTarget?.roles.some(
                role =>
                    role.id === roleA.id
            )
        ) {

            throw new Error(
                "DATABASE FAILURE: Role tidak tersimpan pada target user."
            );
        }

        console.log(
            "✅ Authorized user berhasil memberikan role."
        );

        // ========================================
        // SECURITY RESULT
        // ========================================

        console.log("");
        console.log("----------------------------------------");
        console.log("🔐 SECURITY RESULT");
        console.log("----------------------------------------");

        console.log(
            "✅ User tanpa permission tidak dapat assign role."
        );

        console.log(
            "✅ Cross-tenant user assignment ditolak."
        );

        console.log(
            "✅ Cross-tenant role assignment ditolak."
        );

        console.log(
            "✅ Authorized user dapat assign role dalam tenant."
        );

        console.log(
            "✅ Database tetap aman."
        );

        console.log(
            "✅ Tenant isolation tetap aman."
        );

        console.log(
            "✅ Assign role security: PASS"
        );

        console.log("");
        console.log("========================================");
        console.log(
            "🎉 RBAC ASSIGN ROLE SECURITY TEST PASS"
        );
        console.log("========================================");

    } finally {

        // ========================================
        // CLEANUP USERS
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

        console.log(
            "🧹 Test users berhasil dihapus."
        );

        // ========================================
        // CLEANUP ROLES
        // ========================================

        await prisma.role.deleteMany({
            where: {
                id: {
                    in: [
                        normalRole.id,
                        authorizedRole.id,
                        roleA.id,
                        roleB.id
                    ]
                }
            }
        });

        console.log(
            "🧹 Test roles berhasil dihapus."
        );

        // ========================================
        // CLEANUP TENANT B
        // ========================================

        await prisma.tenant.delete({
            where: {
                id: tenantB.id
            }
        });

        console.log(
            "🧹 Tenant B berhasil dihapus."
        );
    }
}

main()
    .catch(error => {

        console.error("");
        console.error(
            "❌ SECURITY TEST RESULT:"
        );

        console.error(error);

        process.exit(1);

    })
    .finally(async () => {

        await prismaService.client.$disconnect();
    });