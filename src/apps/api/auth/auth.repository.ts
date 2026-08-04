import { prismaService } from '../../../database/prisma.service';

export const authRepository = {
  findUserByEmail: async (email: string) => {
    return prismaService.client.user.findUnique({
      where: { email },
    });
  },
  createUser: async (data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    tenantId: string;
  }) => {
    return prismaService.client.user.create({
      data,
    });
  },
  createRefreshToken: async (data: {
    userId: string;
    token: string;
    expiresAt: Date;
  }) => {
    return prismaService.client.refreshToken.create({
      data,
    });
  },
  findRefreshToken: async (token: string) => {
    return prismaService.client.refreshToken.findUnique({
      where: { token },
    });
  },
  revokeRefreshToken: async (id: string) => {
    return prismaService.client.refreshToken.update({
      where: { id },
      data: { revoked: true },
    });
  },
  revokeRefreshTokenByToken: async (token: string) => {
    return prismaService.client.refreshToken.updateMany({
      where: { token },
      data: { revoked: true },
    });
  },
};
