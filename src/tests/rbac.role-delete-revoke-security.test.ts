import { prismaService } from "../database/prisma.service";
import { roleRepository } from "../apps/api/roles/role.repository";
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
            code: `TEST-ROLE-DELETE-${timestamp}`,
            name: `Role Delete Security Tenant B ${timestamp}`
        }
    });

    const roleUpdate = await prisma.permission.findFirst({
        where: { tenantId: tenantA, name: "role.update" }
    });
    const assignRoles = await prisma.permission.findFirst({
        where: { tenantId: tenantA, name: "user.assign_roles" }
    });
    const roleDelete = await prisma.permission.findFirst({
        where: { tenantId: tenantA, name: "role.delete" }
    });
    const permissionA = await prisma.permission.create({
        data: { tenantId: tenantA, name: `role.revoke.a.${timestamp}` }
    });
    const permissionB = await prisma.permission.create({
        data: { tenantId: tenantB.id, name: `role.revoke.b.${timestamp}` }
    });

    if (!roleUpdate || !assignRoles || !roleDelete) {
        throw new Error("Permission seed role management tidak lengkap.");
    }

    const roleA = await prisma.role.create({
        data: {
            tenantId: tenantA,
            name: `RoleDeleteA${timestamp}`
        }
    });
    const roleB = await prisma.role.create({
        data: {
            tenantId: tenantB.id,
            name: `RoleDeleteB${timestamp}`,
            permissions: { connect: { id: permissionB.id } }
        }
    });
    const normalRole = await prisma.role.create({
        data: {
            tenantId: tenantA,
            name: `Role Delete Normal ${timestamp}`
        }
    });
    const authorizedRole = await prisma.role.create({
        data: {
            tenantId: tenantA,
            name: `Role Delete Authorized ${timestamp}`,
            permissions: {
                connect: [
                    { id: roleUpdate.id },
                    { id: assignRoles.id },
                    { id: roleDelete.id }
                ]
            }
        }
    });
    const disabledRole = await prisma.role.create({
        data: {
            tenantId: tenantA,
            name: `Role Delete Disabled ${timestamp}`,
            permissions: { connect: { id: roleUpdate.id } }
        }
    });

    let sequence = 0;
    const createUser = async (label: string, roleId: string, active = true) => {
        sequence += 1;
        return prisma.user.create({
            data: {
                tenantId: tenantA,
                email: `role-delete-${label}-${timestamp}@test.local`,
                password: "security-test",
                firstName: "Role",
                lastName: label,
                whatsappNumber: `628${String(timestamp).slice(-9)}${sequence}`,
                active,
                roles: { connect: { id: roleId } }
            }
        });
    };

    const normalUser = await createUser("normal", normalRole.id);
    const authorizedUser = await createUser("authorized", authorizedRole.id);
    const disabledUser = await createUser("disabled", disabledRole.id, false);
    const targetUser = await createUser("target", normalRole.id);

    const registry = new CommandRegistry();
    new CommandLoader(registry).load();
    const executor = new CommandExecutor(registry);
    if (!registry.get("assignrolepermission")) {
        throw new Error("assignrolepermission tidak terdaftar.");
    }

    const execute = async (user: typeof authorizedUser, roles: string[], permissions: string[], text: string) => {
        const replies: string[] = [];
        await executor.execute({
            sender: user.whatsappNumber!,
            chatId: `role-delete-security-${timestamp}`,
            messageId: `role-delete-security-${Date.now()}`,
            text,
            args: text.trim().split(/\s+/).slice(1),
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
        const normalReplies = await execute(
            normalUser,
            [normalRole.name],
            [],
            `/assignrolepermission ${roleA.name} ${permissionA.name}`
        );
        if (!normalReplies.some(message => message.includes("tidak memiliki permission"))) {
            throw new Error("Skenario 1 gagal: normal user tidak ditolak.");
        }
        const roleAfterNormal = await roleRepository.findById(roleA.id, tenantA);
        if (!roleAfterNormal || roleAfterNormal.permissions.length !== 0) {
            throw new Error("Skenario 1 gagal: role berubah setelah unauthorized operation.");
        }
        console.log("PASS 1: normal user role.update DENIED; role unchanged");

        const disabledReplies = await execute(
            disabledUser,
            [disabledRole.name],
            [roleUpdate.name],
            `/assignrolepermission ${roleA.name} ${permissionA.name}`
        );
        if (!disabledReplies.some(message => message.includes("dinonaktifkan"))) {
            throw new Error("Skenario 2 gagal: disabled user tidak ditolak.");
        }
        console.log("PASS 2: disabled user dengan role.update DENIED");

        const authorizedReplies = await execute(
            authorizedUser,
            [authorizedRole.name],
            [roleUpdate.name],
            `/assignrolepermission ${roleA.name} ${permissionA.name}`
        );
        if (!authorizedReplies.some(message => message.includes("PERMISSION BERHASIL DIBERIKAN KE ROLE"))) {
            throw new Error("Skenario 3 gagal: authorized same-tenant role operation tidak diproses.");
        }
        console.log("PASS 3: authorized same-tenant role operation ALLOWED");

        const crossRoleReplies = await execute(
            authorizedUser,
            [authorizedRole.name],
            [roleUpdate.name],
            `/assignrolepermission ${roleB.name} ${permissionA.name}`
        );
        if (!crossRoleReplies.some(message => message.includes("tidak ditemukan"))) {
            throw new Error("Skenario 4 gagal: cross-tenant role tidak ditolak.");
        }
        const roleBAfterCross = await roleRepository.findById(roleB.id, tenantB.id);
        if (!roleBAfterCross || roleBAfterCross.permissions.length !== 1 || roleBAfterCross.permissions[0].id !== permissionB.id) {
            throw new Error("Skenario 5 gagal: role Tenant B atau permission-nya berubah.");
        }
        console.log("PASS 4-5: cross-tenant role DENIED; Tenant B role unchanged");

        let crossTenantPermissionDenied = false;
        try {
            await roleRepository.update(roleA.id, tenantA, { permissionIds: [permissionB.id] });
        } catch (error) {
            crossTenantPermissionDenied = error instanceof Error && error.message === "PERMISSION_NOT_FOUND_OR_WRONG_TENANT";
        }
        const roleAfterCrossPermission = await roleRepository.findById(roleA.id, tenantA);
        if (!crossTenantPermissionDenied || !roleAfterCrossPermission || roleAfterCrossPermission.permissions.length !== 1 || roleAfterCrossPermission.permissions[0].id !== permissionA.id) {
            throw new Error("Skenario 6 gagal: cross-tenant permission mengubah role.");
        }
        console.log("PASS 6: cross-tenant permission DENIED; role relationship unchanged");

        const revokedRole = await roleRepository.update(roleA.id, tenantA, { permissionIds: [] });
        if (!revokedRole || revokedRole.permissions.length !== 0) {
            throw new Error("Skenario 7 gagal: revoke same-tenant tidak berhasil.");
        }
        console.log("PASS 7: same-tenant role permission revoke persisted");

        const crossTenantDelete = await roleRepository.delete(roleB.id, tenantA);
        if (crossTenantDelete || !await prisma.role.findUnique({ where: { id: roleB.id } })) {
            throw new Error("Skenario 8 gagal: cross-tenant role delete tidak ditolak.");
        }
        console.log("PASS 8: cross-tenant role delete DENIED; role tetap ada");

        const deletedRole = await roleRepository.delete(roleA.id, tenantA);
        if (!deletedRole || await prisma.role.findUnique({ where: { id: roleA.id } })) {
            throw new Error("Skenario 9 gagal: authorized same-tenant role delete tidak berhasil.");
        }
        console.log("PASS 9: authorized same-tenant role delete ALLOWED; database verified");

        console.log("TEST #12 ROLE DELETE / REVOKE SECURITY: PASS");
    } finally {
        await prisma.user.deleteMany({
            where: { id: { in: [normalUser.id, authorizedUser.id, disabledUser.id, targetUser.id] } }
        });
        await prisma.role.deleteMany({
            where: { id: { in: [roleB.id, normalRole.id, authorizedRole.id, disabledRole.id] } }
        });
        await prisma.permission.deleteMany({
            where: { id: { in: [permissionA.id, permissionB.id] } }
        });
        await prisma.tenant.delete({ where: { id: tenantB.id } });
    }
}

main()
    .catch(error => {
        console.error("TEST #12 ROLE DELETE / REVOKE SECURITY: FAIL");
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prismaService.disconnect();
    });
