import { prismaService } from "../database/prisma.service";
import { userRepository } from "../apps/api/users/user.repository";
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
            code: `TEST-DELETE-REVOKE-${timestamp}`,
            name: `Delete Revoke Security Tenant B ${timestamp}`
        }
    });

    const permissionA = await prisma.permission.create({
        data: {
            tenantId: tenantA,
            name: `security.delete.revoke.a.${timestamp}`
        }
    });
    const permissionB = await prisma.permission.create({
        data: {
            tenantId: tenantB.id,
            name: `security.delete.revoke.b.${timestamp}`
        }
    });
    const deletePermission = await prisma.permission.findFirst({
        where: { tenantId: tenantA, name: "permission.delete" }
    });
    const deleteUser = await prisma.permission.findFirst({
        where: { tenantId: tenantA, name: "user.delete" }
    });

    if (!deletePermission || !deleteUser) {
        throw new Error("Permission seed delete tidak ditemukan.");
    }

    const normalRole = await prisma.role.create({
        data: {
            tenantId: tenantA,
            name: `Delete Revoke Normal ${timestamp}`
        }
    });
    const authorizedRole = await prisma.role.create({
        data: {
            tenantId: tenantA,
            name: `Delete Revoke Authorized ${timestamp}`,
            permissions: {
                connect: [
                    { id: deletePermission.id },
                    { id: deleteUser.id }
                ]
            }
        }
    });
    const disabledRole = await prisma.role.create({
        data: {
            tenantId: tenantA,
            name: `Delete Revoke Disabled ${timestamp}`,
            permissions: {
                connect: [
                    { id: deletePermission.id },
                    { id: deleteUser.id }
                ]
            }
        }
    });

    let userSequence = 0;
    const createUser = async (tenantId: string, emailPrefix: string, roleId?: string, active = true) => {
        userSequence += 1;
        return prisma.user.create({
            data: {
                tenantId,
                email: `${emailPrefix}-${timestamp}@test.local`,
                password: "security-test",
                firstName: "Delete",
                lastName: emailPrefix,
                whatsappNumber: `628${String(timestamp).slice(-9)}${userSequence}`,
                active,
                roles: roleId ? { connect: { id: roleId } } : undefined
            }
        });
    };

    const normalUser = await createUser(tenantA, "normal", normalRole.id);
    const authorizedUser = await createUser(tenantA, "authorized", authorizedRole.id);
    const disabledUser = await createUser(tenantA, "disabled", disabledRole.id, false);
    const targetUserA = await createUser(tenantA, "target-a");
    const targetUserB = await createUser(tenantB.id, "target-b");

    const registry = new CommandRegistry();
    new CommandLoader(registry).load();
    const executor = new CommandExecutor(registry);

    if (!registry.get("deleteuser") || !registry.get("deletepermission")) {
        throw new Error("TEST #11 gagal: delete command tidak terdaftar.");
    }

    const execute = async (user: typeof normalUser, roles: string[], permissions: string[], text: string) => {
        const replies: string[] = [];
        await executor.execute({
            sender: user.whatsappNumber!,
            chatId: `test-11-${timestamp}`,
            messageId: `test-11-${Date.now()}`,
            text,
            args: text.trim().split(/\s+/).slice(1),
            isGroup: false,
            isAdmin: false,
            isOwner: false,
            userId: user.id,
            tenantId: user.tenantId,
            roles,
            permissions,
            reply: async (message: string) => {
                replies.push(message);
            }
        });
        return replies;
    };

    const normalReplies = await execute(
        normalUser,
        [normalRole.name],
        [],
        `/deleteuser ${targetUserA.whatsappNumber}`
    );
    if (!normalReplies.some(message => message.includes("tidak memiliki permission"))) {
        throw new Error("Normal user tanpa permission tidak ditolak.");
    }
    if (!await prisma.user.findUnique({ where: { id: targetUserA.id } })) {
        throw new Error("Database berubah setelah delete unauthorized.");
    }
    console.log("PASS 1: normal user delete denied, database unchanged");

    const disabledReplies = await execute(
        disabledUser,
        [disabledRole.name],
        [deleteUser.name],
        `/deleteuser ${targetUserA.whatsappNumber}`
    );
    if (!disabledReplies.some(message => message.includes("dinonaktifkan"))) {
        throw new Error("Disabled user dengan permission valid tidak ditolak.");
    }
    if (!await prisma.user.findUnique({ where: { id: targetUserA.id } })) {
        throw new Error("Database berubah setelah disabled delete attempt.");
    }
    console.log("PASS 2: disabled user denied, database unchanged");

    const crossUserReplies = await execute(
        authorizedUser,
        [authorizedRole.name],
        [deleteUser.name],
        `/deleteuser ${targetUserB.whatsappNumber}`
    );
    if (!crossUserReplies.some(message => message.includes("User tidak ditemukan"))) {
        throw new Error("Cross-tenant user delete tidak ditolak.");
    }
    if (!await prisma.user.findUnique({ where: { id: targetUserB.id } })) {
        throw new Error("Target user Tenant B terhapus oleh Tenant A.");
    }
    console.log("PASS 3: cross-tenant user delete denied, target preserved");

    const crossPermissionReplies = await execute(
        authorizedUser,
        [authorizedRole.name],
        [deletePermission.name],
        `/deletepermission ${permissionB.name}`
    );
    if (!crossPermissionReplies.some(message => message.includes("tidak ditemukan"))) {
        throw new Error("Cross-tenant permission delete tidak ditolak.");
    }
    if (!await prisma.permission.findUnique({ where: { id: permissionB.id } })) {
        throw new Error("Permission Tenant B terhapus oleh Tenant A.");
    }
    console.log("PASS 4: cross-tenant permission delete denied, target preserved");

    await userRepository.assignPermissions(targetUserA.id, [permissionA.id], tenantA);
    let crossTenantRevokeDenied = false;
    try {
        await userRepository.assignPermissions(targetUserA.id, [permissionB.id], tenantA);
    } catch (error) {
        crossTenantRevokeDenied = error instanceof Error && error.message === "PERMISSION_NOT_FOUND_OR_WRONG_TENANT";
    }
    const targetAfterCrossRevoke = await prisma.user.findUnique({
        where: { id: targetUserA.id },
        include: { permissions: true }
    });
    if (!crossTenantRevokeDenied || !targetAfterCrossRevoke?.permissions.some(permission => permission.id === permissionA.id)) {
        throw new Error("Cross-tenant permission revoke tidak ditolak atau state berubah.");
    }
    console.log("PASS 5: cross-tenant permission revoke denied, database unchanged");

    await userRepository.assignPermissions(targetUserA.id, [], tenantA);
    const targetAfterRevoke = await prisma.user.findUnique({
        where: { id: targetUserA.id },
        include: { permissions: true }
    });
    if (!targetAfterRevoke || targetAfterRevoke.permissions.length !== 0) {
        throw new Error("Same-tenant revoke authorized tidak berhasil.");
    }
    console.log("PASS 6: same-tenant revoke allowed and persisted");

    const authorizedReplies = await execute(
        authorizedUser,
        [authorizedRole.name],
        [deleteUser.name],
        `/deleteuser ${targetUserA.whatsappNumber}`
    );
    if (!authorizedReplies.some(message => message.includes("USER BERHASIL DIHAPUS"))) {
        throw new Error("Authorized same-tenant delete tidak menghasilkan response sukses.");
    }
    if (await prisma.user.findUnique({ where: { id: targetUserA.id } })) {
        throw new Error("Authorized delete tidak menghapus target Tenant A.");
    }
    console.log("PASS 7: authorized same-tenant delete allowed and persisted");

    console.log("TEST #11 DELETE / REVOKE SECURITY: PASS");

    await prisma.user.deleteMany({
        where: { id: { in: [normalUser.id, authorizedUser.id, disabledUser.id, targetUserB.id] } }
    });
    await prisma.role.deleteMany({
        where: { id: { in: [normalRole.id, authorizedRole.id, disabledRole.id] } }
    });
    await prisma.permission.deleteMany({
        where: { id: { in: [permissionA.id, permissionB.id] } }
    });
    await prisma.tenant.delete({ where: { id: tenantB.id } });
}

main()
    .catch(error => {
        console.error("TEST #11 DELETE / REVOKE SECURITY: FAIL");
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prismaService.disconnect();
    });
