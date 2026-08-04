import type { AuthUser } from './auth.types';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      tenantId?: string;
      businessId?: string;
      permissions?: string[];
    }
  }
}

export {};
