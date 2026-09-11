import { prismaService } from "../database/prisma.service";
import { userRepository } from "../apps/api/users/user.repository";
import { userService } from "../apps/api/users/user.service";

async function expectRejected(action: () => Promise<unknown>, label: string) {
    try {
        await action();
        throw new Error(`${label} was accepted`);
    } catch (error) {
        if (error instanceof Error && error.message === `${label} was accepted`) {
            throw error;
        }
    }
}

async function main() {
    const prisma = prismaService.client;
    const suffix = Date.now().toString();
    let tenantAId: string | undefined;
    let tenantBId: string | undefined;
    let userAId: string | undefined;
    let rejectedUserEmails: string[] = [];

    try {
        const [tenantA, tenantB] = await Promise.all([
            prisma.tenant.create({
                data: { code: `ISO-A-${suffix}`, name: `Isolation A ${suffix}` }
            }),
            prisma.tenant.create({
                data: { code: `ISO-B-${suffix}`, name: `Isolation B ${suffix}` }
            })
        ]);
        tenantAId = tenantA.id;
        tenantBId = tenantB.id;

        const [roleA, roleB, permissionA, permissionB] = await Promise.all([
            prisma.role.create({ data: { tenantId: tenantA.id, name: `Role A ${suffix}` } }),
            prisma.role.create({ data: { tenantId: tenantB.id, name: `Role B ${suffix}` } }),
            prisma.permission.create({ data: { tenantId: tenantA.id, name: `Permission A ${suffix}` } }),
            prisma.permission.create({ data: { tenantId: tenantB.id, name: `Permission B ${suffix}` } })
        ]);

        rejectedUserEmails = [
            `rejected-role-${suffix}@test.local`,
            `rejected-permission-${suffix}@test.local`
        ];

        await expectRejected(
            () => userService.create({
                email: rejectedUserEmails[0],
                password: "Password123!",
                roleIds: [roleB.id]
            }, tenantA.id),
            "cross-tenant role user creation"
        );

        await expectRejected(
            () => userService.create({
                email: rejectedUserEmails[1],
                password: "Password123!",
                permissionIds: [permissionB.id]
            }, tenantA.id),
            "cross-tenant permission user creation"
        );

        const rejectedUsers = await prisma.user.findMany({
            where: { email: { in: rejectedUserEmails } }
        });
        if (rejectedUsers.length !== 0) {
            throw new Error("Rejected user creation left database records");
        }

        const userA = await userService.create({
            email: `valid-${suffix}@test.local`,
            password: "Password123!",
            roleIds: [roleA.id],
            permissionIds: [permissionA.id]
        }, tenantA.id);
        userAId = userA.id;

        const beforeUpdate = await userRepository.findById(userA.id, tenantA.id);
        if (!beforeUpdate || beforeUpdate.roles.length !== 1 || beforeUpdate.permissions.length !== 1) {
            throw new Error("Valid same-tenant assignments were not created");
        }

        await expectRejected(
            () => userService.update(userA.id, { roleIds: [roleB.id] }, tenantA.id),
            "cross-tenant role user update"
        );

        const afterRoleRejection = await userRepository.findById(userA.id, tenantA.id);
        if (!afterRoleRejection || afterRoleRejection.roles.map((role) => role.id).join() !== roleA.id || afterRoleRejection.permissions.map((permission) => permission.id).join() !== permissionA.id) {
            throw new Error("Role rejection changed existing assignments");
        }

        await expectRejected(
            () => userService.update(userA.id, { permissionIds: [permissionB.id] }, tenantA.id),
            "cross-tenant permission user update"
        );

        const afterPermissionRejection = await userRepository.findById(userA.id, tenantA.id);
        if (!afterPermissionRejection || afterPermissionRejection.roles.map((role) => role.id).join() !== roleA.id || afterPermissionRejection.permissions.map((permission) => permission.id).join() !== permissionA.id) {
            throw new Error("Permission rejection changed existing assignments");
        }

        await userService.update(userA.id, {
            roleIds: [roleA.id],
            permissionIds: [permissionA.id]
        }, tenantA.id);

        console.log("Tenant user relation isolation tests: PASS");
    } finally {
        if (userAId) {
            await prisma.user.delete({ where: { id: userAId } });
        }
        if (tenantAId) {
            await prisma.role.deleteMany({ where: { tenantId: tenantAId } });
            await prisma.permission.deleteMany({ where: { tenantId: tenantAId } });
            await prisma.tenant.delete({ where: { id: tenantAId } });
        }
        if (tenantBId) {
            await prisma.role.deleteMany({ where: { tenantId: tenantBId } });
            await prisma.permission.deleteMany({ where: { tenantId: tenantBId } });
            await prisma.tenant.delete({ where: { id: tenantBId } });
        }
        await prismaService.disconnect();
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
