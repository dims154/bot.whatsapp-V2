import type { AuthUser } from './auth.types';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      rawBody?: Buffer;
      tenantId?: string;
      businessId?: string;
      permissions?: string[];
    }
  }
}

export {};
