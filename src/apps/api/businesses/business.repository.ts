import { prismaService } from '../../../database/prisma.service';

export const businessRepository = {
  findAll: async (tenantId: string) => {
    return prismaService.client.business.findMany({
      where: { tenantId },
    });
  },
  findById: async (id: string, tenantId: string) => {
    return prismaService.client.business.findFirst({
      where: { id, tenantId },
    });
  },
  create: async (data: { tenantId: string; name: string; code: string; description?: string }) => {
    return prismaService.client.business.create({
      data,
    });
  },
  update: async (id: string, tenantId: string, data: { name?: string; description?: string; active?: boolean }) => {
    const existing = await prismaService.client.business.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return null;
    }

    return prismaService.client.business.update({
      where: { id },
      data,
    });
  },
  delete: async (id: string, tenantId: string) => {
    const existing = await prismaService.client.business.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return null;
    }

    return prismaService.client.business.delete({
      where: { id },
    });
  },
};
