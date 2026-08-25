import { prismaService } from '../../../database/prisma.service';

const validatePermissionIds = async (permissionIds: string[], tenantId: string) => {
  const permissions = await prismaService.client.permission.findMany({
    where: { id: { in: permissionIds }, tenantId },
    select: { id: true },
  });

  if (permissions.length !== new Set(permissionIds).size) {
    throw new Error('PERMISSION_NOT_FOUND_OR_WRONG_TENANT');
  }
};

export const roleRepository = {
  findAll: async (tenantId: string) => {
    return prismaService.client.role.findMany({
      where: { tenantId },
      include: { permissions: true },
    });
  },
  findById: async (id: string, tenantId: string) => {
    return prismaService.client.role.findFirst({
      where: { id, tenantId },
      include: { permissions: true },
    });
  },
  findByIds: async (ids: string[], tenantId: string) => {
    return prismaService.client.role.findMany({
      where: { id: { in: ids }, tenantId },
      include: { permissions: true },
    });
  },
  // =========================
// FIND BY NAME
// =========================

findByName: async (
    name: string,
    tenantId: string
) => {

    return prismaService.client.role.findFirst({

        where: {
            name,
            tenantId
        },

        include: {
            permissions: true
        },

    });

},
  create: async (data: {
    tenantId: string;
    name: string;
    description?: string;
    permissionIds?: string[];
  }) => {
    if (data.permissionIds) {
      await validatePermissionIds(data.permissionIds, data.tenantId);
    }

    return prismaService.client.role.create({
      data: {
        tenantId: data.tenantId,
        name: data.name,
        description: data.description,
        permissions: data.permissionIds
          ? { connect: data.permissionIds.map((id) => ({ id })) }
          : undefined,
      },
      include: { permissions: true },
    });
  },
  update: async (id: string, tenantId: string, data: {
    name?: string;
    description?: string;
    permissionIds?: string[];
  }) => {
    const existing = await prismaService.client.role.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return null;
    }

    if (data.permissionIds) {
      await validatePermissionIds(data.permissionIds, tenantId);
    }

    return prismaService.client.role.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        permissions: data.permissionIds
          ? { set: data.permissionIds.map((id) => ({ id })) }
          : undefined,
      },
      include: { permissions: true },
    });
  },
  delete: async (id: string, tenantId: string) => {
    const existing = await prismaService.client.role.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return null;
    }

    return prismaService.client.role.delete({
      where: { id },
    });
  },
};
