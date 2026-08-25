import { prismaService } from "../database/prisma.service";
import { permissionRepository } from "../apps/api/permissions/permission.repository";
import { CommandExecutor } from "../apps/bot/executor/CommandExecutor";
import { CommandRegistry } from "../apps/bot/registry/CommandRegistry";
import { CommandLoader } from "../apps/bot/loader/CommandLoader";

const prisma = prismaService.client;

async function main() {
    const timestamp = Date.now();
    const owner = await prisma.user.findUnique({
        where: { email: "owner@erp.local" }
    });
    if (!owner) {
        throw new Error("Owner owner@erp.local tidak ditemukan.");
    }

    const tenantA = owner.tenantId;
    const tenantB = await prisma.tenant.create({
        data: {
            code: `TEST-PERMISSION-DELETE-${timestamp}`,
            name: `Permission Delete Security Tenant B ${timestamp}`
        }
    });
    const permissionDelete = await prisma.permission.findFirst({
        where: { tenantId: tenantA, name: "permission.delete" }
    });
    const permissionUpdate = await prisma.permission.findFirst({
        where: { tenantId: tenantA, name: "permission.update" }
    });
    if (!permissionDelete || !permissionUpdate) {
        throw new Error("Permission seed permission.delete/update tidak lengkap.");
    }

    const targetPermission = await prisma.permission.create({
        data: { tenantId: tenantA, name: `permission.target.${timestamp}` }
    });
    const foreignPermission = await prisma.permission.create({
        data: { tenantId: tenantB.id, name: `permission.foreign.${timestamp}` }
    });
    const targetRole = await prisma.role.create({
        data: {
            tenantId: tenantA,
            name: `PermissionTargetRole${timestamp}`,
            permissions: { connect: { id: targetPermission.id } }
        }
    });
    const foreignRole = await prisma.role.create({
        data: {
            tenantId: tenantB.id,
            name: `PermissionForeignRole${timestamp}`,
            permissions: { connect: { id: foreignPermission.id } }
        }
    });
    const authorizedRole = await prisma.role.create({
        data: {
            tenantId: tenantA,
            name: `PermissionDeleteAuthorized${timestamp}`,
            permissions: { connect: { id: permissionDelete.id } }
        }
    });
    const disabledRole = await prisma.role.create({
        data: {
            tenantId: tenantA,
            name: `PermissionDeleteDisabled${timestamp}`,
            permissions: { connect: { id: permissionDelete.id } }
        }
    });
    const normalRole = await prisma.role.create({
        data: {
            tenantId: tenantA,
            name: `PermissionDeleteNormal${timestamp}`
        }
    });

    let sequence = 0;
    const createUser = async (label: string, roleId: string, active = true) => {
        sequence += 1;
        return prisma.user.create({
            data: {
                tenantId: tenantA,
                email: `permission-delete-${label}-${timestamp}@test.local`,
                password: "security-test",
                firstName: "Permission",
                lastName: label,
                whatsappNumber: `628${String(timestamp).slice(-9)}${sequence}`,
                active,
                roles: { connect: { id: roleId } },
                permissions: label === "target" ? { connect: { id: targetPermission.id } } : undefined
            }
        });
    };

    const authorizedUser = await createUser("authorized", authorizedRole.id);
    const disabledUser = await createUser("disabled", disabledRole.id, false);
    const normalUser = await createUser("normal", normalRole.id);
    const targetUser = await createUser("target", normalRole.id);

    const registry = new CommandRegistry();
    new CommandLoader(registry).load();
    const executor = new CommandExecutor(registry);
    if (!registry.get("deletepermission")) {
        throw new Error("deletepermission tidak terdaftar di CommandLoader/CommandRegistry.");
    }

    const execute = async (user: typeof authorizedUser, roles: string[], permissions: string[], permissionName: string) => {
        const replies: string[] = [];
        await executor.execute({
            sender: user.whatsappNumber!,
            chatId: `permission-delete-security-${timestamp}`,
            messageId: `permission-delete-security-${Date.now()}`,
            text: `/deletepermission ${permissionName}`,
            args: [permissionName],
            isGroup: false,
            isAdmin: false,
            isOwner: false,
            userId: user.id,
            tenantId: tenantA,
            roles,
            permissions,
            reply: async (message: string) => {
                replies.push(message);
            }
        });
        return replies;
    };

    try {
        const normalReplies = await execute(normalUser, [normalRole.name], [], targetPermission.name);
        if (!normalReplies.some(message => message.includes("tidak memiliki permission"))) {
            throw new Error("Skenario 1 gagal: normal user tidak ditolak.");
        }
        if (!await prisma.permission.findUnique({ where: { id: targetPermission.id } })) {
            throw new Error("Skenario 1 gagal: permission berubah.");
        }
        console.log("PASS 1: normal user tanpa permission.delete DENIED; database unchanged");

        const disabledReplies = await execute(disabledUser, [disabledRole.name], [permissionDelete.name], targetPermission.name);
        if (!disabledReplies.some(message => message.includes("dinonaktifkan"))) {
            throw new Error("Skenario 2 gagal: disabled user tidak ditolak.");
        }
        if (!await prisma.permission.findUnique({ where: { id: targetPermission.id } })) {
            throw new Error("Skenario 2 gagal: permission berubah.");
        }
        console.log("PASS 2: disabled user dengan permission.delete DENIED; database unchanged");

        const crossTenantReplies = await execute(authorizedUser, [authorizedRole.name], [permissionDelete.name], foreignPermission.name);
        if (!crossTenantReplies.some(message => message.includes("tidak ditemukan"))) {
            throw new Error("Skenario 3 gagal: cross-tenant delete tidak ditolak.");
        }
        const foreignAfterAttack = await prisma.permission.findUnique({
            where: { id: foreignPermission.id },
            include: { roles: true, users: true }
        });
        if (!foreignAfterAttack || foreignAfterAttack.tenantId !== tenantB.id || foreignAfterAttack.roles.length !== 1 || foreignAfterAttack.users.length !== 0) {
            throw new Error("Skenario 4 gagal: permission Tenant B atau relasinya berubah.");
        }
        console.log("PASS 3-4: cross-tenant delete DENIED; permission Tenant B tetap aman");

        const foreignUpdate = await permissionRepository.update(
            foreignPermission.id,
            tenantA,
            { name: `tampered.${timestamp}` }
        );
        const foreignAfterUpdate = await prisma.permission.findUnique({ where: { id: foreignPermission.id } });
        if (foreignUpdate || !foreignAfterUpdate || foreignAfterUpdate.name !== foreignPermission.name || foreignAfterUpdate.tenantId !== tenantB.id) {
            throw new Error("Skenario 5 gagal: cross-tenant permission update mengubah database.");
        }
        console.log("PASS 5: cross-tenant permission update DENIED; ownership unchanged");

        const authorizedReplies = await execute(authorizedUser, [authorizedRole.name], [permissionDelete.name], targetPermission.name);
        if (!authorizedReplies.some(message => message.includes("PERMISSION BERHASIL DIHAPUS"))) {
            throw new Error("Skenario 6 gagal: authorized delete tidak menghasilkan response sukses.");
        }
        if (await prisma.permission.findUnique({ where: { id: targetPermission.id } })) {
            throw new Error("Skenario 6 gagal: target permission masih ada.");
        }
        const targetRoleAfterDelete = await prisma.role.findUnique({ where: { id: targetRole.id }, include: { permissions: true } });
        const targetUserAfterDelete = await prisma.user.findUnique({ where: { id: targetUser.id }, include: { permissions: true } });
        if (!targetRoleAfterDelete || targetRoleAfterDelete.permissions.some(permission => permission.id === targetPermission.id) || !targetUserAfterDelete || targetUserAfterDelete.permissions.some(permission => permission.id === targetPermission.id)) {
            throw new Error("Skenario 7 gagal: user/role permission relationship tidak aman setelah delete.");
        }
        if (!await prisma.permission.findUnique({ where: { id: foreignPermission.id } })) {
            throw new Error("Skenario 10 gagal: delete Tenant A memengaruhi Tenant B.");
        }
        console.log("PASS 6-10: authorized same-tenant delete ALLOWED; user/role relations and Tenant B verified");

        console.log("TEST #13 PERMISSION DELETE / REVOKE SECURITY: PASS");
    } finally {
        await prisma.user.deleteMany({
            where: { id: { in: [authorizedUser.id, disabledUser.id, normalUser.id, targetUser.id] } }
        });
        await prisma.role.deleteMany({
            where: { id: { in: [targetRole.id, foreignRole.id, authorizedRole.id, disabledRole.id, normalRole.id] } }
        });
        await prisma.permission.deleteMany({
            where: { id: { in: [targetPermission.id, foreignPermission.id] } }
        });
        await prisma.tenant.delete({ where: { id: tenantB.id } });
    }
}

main()
    .catch(error => {
        console.error("TEST #13 PERMISSION DELETE / REVOKE SECURITY: FAIL");
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prismaService.disconnect();
    });
