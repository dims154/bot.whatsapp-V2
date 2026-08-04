import { Request, Response } from 'express';
import { userService } from './user.service';
import { createUserSchema, updateUserSchema, assignRolesSchema, assignPermissionsSchema } from './user.dto';

export const userController = {
  getAll: async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const users = await userService.getAll(req.user.tenantId);
    return res.status(200).json({ status: 'success', data: users });
  },
  getById: async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const { id } = req.params;
    const user = await userService.getById(id, req.user.tenantId);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    return res.status(200).json({ status: 'success', data: user });
  },
  create: async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const parse = createUserSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ status: 'error', message: 'Invalid payload', errors: parse.error.errors });
    }

    const user = await userService.create(parse.data, req.user.tenantId);
    return res.status(201).json({ status: 'success', data: user });
  },
  update: async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const { id } = req.params;
    const parse = updateUserSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ status: 'error', message: 'Invalid payload', errors: parse.error.errors });
    }

    const user = await userService.update(id, parse.data, req.user.tenantId);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    return res.status(200).json({ status: 'success', data: user });
  },
  delete: async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const { id } = req.params;
    const removed = await userService.remove(id, req.user.tenantId);
    if (!removed) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    return res.status(200).json({ status: 'success', message: 'User deleted' });
  },
  assignRoles: async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const { id } = req.params;
    const parse = assignRolesSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ status: 'error', message: 'Invalid payload', errors: parse.error.errors });
    }

    const user = await userService.assignRoles(id, parse.data.roleIds, req.user.tenantId);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    return res.status(200).json({ status: 'success', data: user });
  },
  assignPermissions: async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const { id } = req.params;
    const parse = assignPermissionsSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ status: 'error', message: 'Invalid payload', errors: parse.error.errors });
    }

    const user = await userService.assignPermissions(id, parse.data.permissionIds, req.user.tenantId);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    return res.status(200).json({ status: 'success', data: user });
  },
};
