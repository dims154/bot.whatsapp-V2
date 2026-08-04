import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../../../config/environment';
import { authRepository } from './auth.repository';
import { prismaService } from '../../../database/prisma.service';

const createAccessToken = (userId: string, email: string, tenantId: string) => {
  const options: jwt.SignOptions = {
    expiresIn: config.auth.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  };

  return jwt.sign(
    { sub: userId, email, tenantId },
    config.auth.jwtSecret as jwt.Secret,
    options,
  );
};

const createRefreshToken = () => {
  const options: jwt.SignOptions = {
    expiresIn: config.auth.refreshTokenExpiresIn as jwt.SignOptions['expiresIn'],
  };

  return jwt.sign({ type: 'refresh' }, config.auth.jwtSecret as jwt.Secret, options);
};

export const authService = {
  register: async (email: string, password: string, tenantId: string, firstName?: string, lastName?: string) => {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await authRepository.createUser({
      email,
      password: hashedPassword,
      tenantId,
      firstName,
      lastName,
    });

    const accessToken = createAccessToken(user.id, user.email, user.tenantId);
    const refreshToken = createRefreshToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await authRepository.createRefreshToken({
      userId: user.id,
      token: refreshToken,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: config.auth.jwtExpiresIn,
    };
  },
  login: async (email: string, password: string) => {
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return null;
    }

    const accessToken = createAccessToken(user.id, user.email, user.tenantId);
    const refreshToken = createRefreshToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await authRepository.createRefreshToken({
      userId: user.id,
      token: refreshToken,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: config.auth.jwtExpiresIn,
    };
  },
  refresh: async (token: string) => {
    const existing = await authRepository.findRefreshToken(token);
    if (!existing || existing.revoked || existing.expiresAt < new Date()) {
      return null;
    }

    const user = await prismaService.client.user.findUnique({
      where: { id: existing.userId },
    });
    if (!user) {
      return null;
    }

    const accessToken = createAccessToken(user.id, user.email, user.tenantId);
    const refreshToken = createRefreshToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await authRepository.revokeRefreshToken(existing.id);
    await authRepository.createRefreshToken({
      userId: user.id,
      token: refreshToken,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: config.auth.jwtExpiresIn,
    };
  },
  logout: async (token: string) => {
    const result = await authRepository.revokeRefreshTokenByToken(token);
    return result.count > 0;
  },
};
