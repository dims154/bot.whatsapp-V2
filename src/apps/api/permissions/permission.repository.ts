import { prismaService } from '../../../database/prisma.service';

export const permissionRepository = {
  findAll: async (tenantId: string) => {
    return prismaService.client.permission.findMany({
      where: { tenantId },
    });
  },
  findById: async (id: string, tenantId: string) => {
    return prismaService.client.permission.findFirst({
      where: { id, tenantId },
    });
  },
  findByIds: async (ids: string[], tenantId: string) => {
    return prismaService.client.permission.findMany({
      where: { id: { in: ids }, tenantId },
    });
  },
  create: async (data: { tenantId: string; name: string; description?: string }) => {
    return prismaService.client.permission.create({
      data,
    });
  },
  update: async (id: string, tenantId: string, data: { name?: string; description?: string }) => {
    const existing = await prismaService.client.permission.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return null;
    }

    return prismaService.client.permission.update({
      where: { id },
      data,
    });
  },
  delete: async (id: string, tenantId: string) => {
    const existing = await prismaService.client.permission.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return null;
    }

    return prismaService.client.permission.delete({
      where: { id },
    });
  },
};
