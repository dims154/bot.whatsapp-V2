import { NextFunction, Request, Response } from 'express';
import { authMiddleware } from './auth.middleware';

export const authorize = (requiredPermissions: string[] = []) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await authMiddleware(req, res, async () => {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' });
      }

      if (requiredPermissions.length === 0) {
        return next();
      }

      const grantedPermissions = new Set<string>(user.permissions ?? []);
      const hasPermission = requiredPermissions.every((permission) => grantedPermissions.has(permission));

      if (!hasPermission) {
        return res.status(403).json({ status: 'error', message: 'Forbidden' });
      }

      return next();
    });
  };
};
