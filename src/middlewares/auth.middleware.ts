import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment';
import { prismaService } from '../database/prisma.service';

type JwtPayloadWithUser = jwt.JwtPayload & {
  sub?: string;
  email?: string;
  tenantId?: string;
};

const isJwtPayloadWithUser = (value: unknown): value is JwtPayloadWithUser => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'sub' in value &&
    'email' in value &&
    'tenantId' in value &&
    typeof (value as Record<string, unknown>).sub === 'string' &&
    typeof (value as Record<string, unknown>).email === 'string' &&
    typeof (value as Record<string, unknown>).tenantId === 'string'
  );
};

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  }

  const token = authorization.split(' ')[1];

  try {
    const payload = jwt.verify(token, config.auth.jwtSecret);

    if (!isJwtPayloadWithUser(payload)) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const user = await prismaService.client.user.findUnique({
      where: { id: payload.sub },
      include: {
        permissions: true,
        roles: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const permissions = [
      ...user.permissions.map((permission: { name: string }) => permission.name),
      ...user.roles.flatMap((role: { permissions: { name: string }[] }) =>
        role.permissions.map((permission: { name: string }) => permission.name),
      ),
    ];

    req.user = {
      id: user.id,
      email: user.email,
      tenantId: user.tenantId,
      permissions,
    };
    req.tenantId = user.tenantId;
    req.permissions = permissions;
    req.businessId = undefined;

    return next();
  } catch (error) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  }
};
