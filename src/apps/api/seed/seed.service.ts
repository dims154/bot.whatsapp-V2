import { prismaService } from '../../../database/prisma.service';
import { defaultPermissions, defaultRoles, rolePermissionMap } from './defaultDefinitions';
import bcrypt from 'bcrypt';

const FIRST_TENANT_CODE = 'first-tenant';
const FIRST_TENANT_NAME = 'First Tenant';
const FIRST_USER_EMAIL = 'superadmin@tenant.local';
const FIRST_USER_PASSWORD = 'SuperAdmin123!';

export const seedService = {
  initialize: async () => {
    const existingTenant = await prismaService.client.tenant.findUnique({
      where: { code: FIRST_TENANT_CODE },
    });

    if (existingTenant) {
      return;
    }

    const tenant = await prismaService.client.tenant.create({
      data: {
        name: FIRST_TENANT_NAME,
        code: FIRST_TENANT_CODE,
        description: 'Automatically generated default tenant',
      },
    });

    const defaultBusiness = await prismaService.client.business.create({
      data: {
        tenantId: tenant.id,
        name: 'Default Business',
        code: 'default-business',
        description: 'Default business for the first tenant',
      },
    });

    const permissions = await Promise.all(
      defaultPermissions.map(async (name) => {
        return prismaService.client.permission.create({
          data: {
            tenantId: tenant.id,
            name,
            description: `${name} permission`,
          },
        });
      }),
    );

    const roleRecords = await Promise.all(
      defaultRoles.map(async (name) => {
        const permissionIds = rolePermissionMap[name].map((permissionName) => {
          const permission = permissions.find((item) => item.name === permissionName);
          return permission?.id ?? '';
        });

        return prismaService.client.role.create({
          data: {
            tenantId: tenant.id,
            name,
            description: `${name} role`,
            permissions: {
              connect: permissionIds.filter(Boolean).map((id) => ({ id })),
            },
          },
        });
      }),
    );

    const ownerRole = roleRecords.find((role) => role.name === 'Owner');
    const superAdminRole = roleRecords.find((role) => role.name === 'Super Admin');
    const hashedPassword = await bcrypt.hash(FIRST_USER_PASSWORD, 12);

    const ownerUser = await prismaService.client.user.create({
      data: {
        tenantId: tenant.id,
        email: 'owner@tenant.local',
        password: hashedPassword,
        firstName: 'First',
        lastName: 'Owner',
        roles: {
          connect: [{ id: ownerRole?.id ?? '' }].filter((item) => item.id),
        },
      },
    });

    await prismaService.client.user.create({
      data: {
        tenantId: tenant.id,
        email: FIRST_USER_EMAIL,
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        roles: {
          connect: [{ id: superAdminRole?.id ?? '' }].filter((item) => item.id),
        },
      },
    });

    await prismaService.client.admin.create({
      data: {
        userId: ownerUser.id,
        businessId: defaultBusiness.id,
      },
    });
  },
};
