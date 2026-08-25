import { prismaService } from "../database/prisma.service";
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
    const deletePermission = await prisma.permission.findFirst({
        where: { tenantId: tenantA, name: "user.delete" }
    });

    if (!deletePermission) {
        throw new Error("Permission user.delete tidak ditemukan.");
    }

    const tenantB = await prisma.tenant.create({
        data: {
            code: `TEST-DELETE-USER-${timestamp}`,
            name: `Delete User Security Tenant B ${timestamp}`
        }
    });

    const authorizedRole = await prisma.role.create({
        data: {
            tenantId: tenantA,
            name: `Delete User Authorized ${timestamp}`,
            permissions: { connect: { id: deletePermission.id } }
        }
    });
    const disabledRole = await prisma.role.create({
        data: {
            tenantId: tenantA,
            name: `Delete User Disabled ${timestamp}`,
            permissions: { connect: { id: deletePermission.id } }
        }
    });
    const normalRole = await prisma.role.create({
        data: {
            tenantId: tenantA,
            name: `Delete User Normal ${timestamp}`
        }
    });

    let sequence = 0;
    const createUser = async (tenantId: string, label: string, roleId: string, active = true) => {
        sequence += 1;
        return prisma.user.create({
            data: {
                tenantId,
                email: `delete-user-security-${label}-${timestamp}@test.local`,
                password: "security-test",
                firstName: "Delete",
                lastName: label,
                whatsappNumber: `628${String(timestamp).slice(-9)}${sequence}`,
                active,
                roles: { connect: { id: roleId } }
            }
        });
    };

    const authorizedUser = await createUser(tenantA, "authorized", authorizedRole.id);
    const disabledUser = await createUser(tenantA, "disabled", disabledRole.id, false);
    const normalUser = await createUser(tenantA, "normal", normalRole.id);
    const targetUserA = await createUser(tenantA, "target-a", normalRole.id);
    const targetUserB = await createUser(tenantB.id, "target-b", normalRole.id);

    const registry = new CommandRegistry();
    new CommandLoader(registry).load();
    const executor = new CommandExecutor(registry);

    if (!registry.get("deleteuser")) {
        throw new Error("deleteuser tidak terdaftar di CommandRegistry/CommandLoader.");
    }

    const execute = async (user: typeof authorizedUser, roles: string[], permissions: string[], target: string) => {
        const replies: string[] = [];
        await executor.execute({
            sender: user.whatsappNumber!,
            chatId: `delete-user-security-${timestamp}`,
            messageId: `delete-user-security-${Date.now()}`,
            text: `/deleteuser ${target}`,
            args: [target],
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

    try {
        const normalReplies = await execute(normalUser, [normalRole.name], [], targetUserA.whatsappNumber!);
        if (!normalReplies.some(message => message.includes("tidak memiliki permission"))) {
            throw new Error("Skenario 1 gagal: normal user tidak ditolak.");
        }
        if (!await prisma.user.findUnique({ where: { id: targetUserA.id } })) {
            throw new Error("Skenario 1 gagal: database berubah.");
        }
        console.log("PASS 1: normal user tanpa user.delete DENIED; database unchanged");

        const disabledReplies = await execute(disabledUser, [disabledRole.name], [deletePermission.name], targetUserA.whatsappNumber!);
        if (!disabledReplies.some(message => message.includes("dinonaktifkan"))) {
            throw new Error("Skenario 2 gagal: disabled user tidak ditolak.");
        }
        if (!await prisma.user.findUnique({ where: { id: targetUserA.id } })) {
            throw new Error("Skenario 2 gagal: database berubah.");
        }
        console.log("PASS 2: inactive user dengan permission DENIED; database unchanged");

        const crossTenantReplies = await execute(authorizedUser, [authorizedRole.name], [deletePermission.name], targetUserB.whatsappNumber!);
        if (!crossTenantReplies.some(message => message.includes("User tidak ditemukan"))) {
            throw new Error("Skenario 3 gagal: cross-tenant delete tidak ditolak.");
        }
        if (!await prisma.user.findUnique({ where: { id: targetUserB.id } })) {
            throw new Error("Skenario 4 gagal: user Tenant B terhapus.");
        }
        console.log("PASS 3-4: cross-tenant delete DENIED; user Tenant B tetap ada");

        const selfDeleteReplies = await execute(authorizedUser, [authorizedRole.name], [deletePermission.name], authorizedUser.whatsappNumber!);
        if (!selfDeleteReplies.some(message => message.includes("tidak dapat menghapus akunmu sendiri"))) {
            throw new Error("Skenario 6 gagal: self-delete tidak ditolak.");
        }
        if (!await prisma.user.findUnique({ where: { id: authorizedUser.id } })) {
            throw new Error("Skenario 6 gagal: authorized user terhapus sendiri.");
        }
        console.log("PASS 5-6: self-delete DENIED; actor tetap ada");

        const authorizedReplies = await execute(authorizedUser, [authorizedRole.name], [deletePermission.name], targetUserA.whatsappNumber!);
        if (!authorizedReplies.some(message => message.includes("USER BERHASIL DIHAPUS"))) {
            throw new Error("Skenario 5 gagal: authorized delete tidak menghasilkan response sukses.");
        }
        if (await prisma.user.findUnique({ where: { id: targetUserA.id } })) {
            throw new Error("Skenario 5 gagal: target Tenant A masih ada.");
        }
        console.log("PASS 5: authorized same-tenant delete ALLOWED; database verified");

        console.log("TEST #11 DELETE USER SECURITY: PASS");
    } finally {
        await prisma.user.deleteMany({
            where: { id: { in: [authorizedUser.id, disabledUser.id, normalUser.id, targetUserA.id, targetUserB.id] } }
        });
        await prisma.role.deleteMany({
            where: { id: { in: [authorizedRole.id, disabledRole.id, normalRole.id] } }
        });
        await prisma.tenant.delete({ where: { id: tenantB.id } });
    }
}

main()
    .catch(error => {
        console.error("TEST #11 DELETE USER SECURITY: FAIL");
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prismaService.disconnect();
    });
