import '../config/environment';
import type { PrismaClient } from '@prisma/client';

let prisma: PrismaClient | null = null;

try {
  // Use require so missing generated client doesn't throw at module parse time
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PrismaClient } = require('@prisma/client');
  prisma = new PrismaClient();
} catch (err: unknown) {
  // Prisma client not generated or not available; continue without DB
  // Logging here helps developers know why DB features are unavailable
  // Do not throw — higher-level startup will decide how to proceed
  // eslint-disable-next-line no-console
  console.error('Prisma client not initialized (skipping):', err && typeof err === 'object' && 'message' in err ? (err as { message?: string }).message : String(err));
}

export const prismaService = {
  get client(): PrismaClient {
    if (!prisma) {
      throw new Error('Prisma client not initialized');
    }
    return prisma;
  },
  connect: async () => {
    if (!prisma) return;
    await prisma.$connect();
  },
  disconnect: async () => {
    if (!prisma) return;
    await prisma.$disconnect();
  },
};
