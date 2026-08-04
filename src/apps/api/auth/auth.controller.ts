import { Request, Response } from 'express';
import { authService } from './auth.service';
import { loginSchema, refreshSchema, registerSchema, logoutSchema } from './auth.dto';

export const authController = {
  register: async (req: Request, res: Response) => {
    const parse = registerSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ status: 'error', message: 'Invalid payload', errors: parse.error.errors });
    }

    const result = await authService.register(
      parse.data.email,
      parse.data.password,
      parse.data.tenantId,
      parse.data.firstName,
      parse.data.lastName,
    );

    return res.status(201).json({
      status: 'success',
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        tokenType: 'Bearer',
        expiresIn: result.expiresIn,
      },
    });
  },
  login: async (req: Request, res: Response) => {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ status: 'error', message: 'Invalid payload', errors: parse.error.errors });
    }

    const result = await authService.login(parse.data.email, parse.data.password);
    if (!result) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        tokenType: 'Bearer',
        expiresIn: result.expiresIn,
      },
    });
  },
  refresh: async (req: Request, res: Response) => {
    const parse = refreshSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ status: 'error', message: 'Invalid payload', errors: parse.error.errors });
    }

    const result = await authService.refresh(parse.data.refreshToken);
    if (!result) {
      return res.status(401).json({ status: 'error', message: 'Invalid refresh token' });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        tokenType: 'Bearer',
        expiresIn: result.expiresIn,
      },
    });
  },
  logout: async (req: Request, res: Response) => {
    const parse = logoutSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ status: 'error', message: 'Invalid payload', errors: parse.error.errors });
    }

    const success = await authService.logout(parse.data.refreshToken);
    if (!success) {
      return res.status(400).json({ status: 'error', message: 'Logout failed' });
    }

    return res.status(200).json({ status: 'success', message: 'Logged out successfully' });
  },
};
