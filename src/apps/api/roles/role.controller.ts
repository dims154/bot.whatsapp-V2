import { Request, Response } from 'express';
import { roleService } from './role.service';
import { createRoleSchema, updateRoleSchema } from './role.dto';

export const roleController = {
  getAll: async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const roles = await roleService.getAll(req.user.tenantId);
    return res.status(200).json({ status: 'success', data: roles });
  },
  getById: async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const { id } = req.params;
    const role = await roleService.getById(id, req.user.tenantId);
    if (!role) {
      return res.status(404).json({ status: 'error', message: 'Role not found' });
    }
    return res.status(200).json({ status: 'success', data: role });
  },
  create: async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const parse = createRoleSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ status: 'error', message: 'Invalid payload', errors: parse.error.errors });
    }

    const role = await roleService.create(req.user.tenantId, parse.data);
    return res.status(201).json({ status: 'success', data: role });
  },
  update: async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const { id } = req.params;
    const parse = updateRoleSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ status: 'error', message: 'Invalid payload', errors: parse.error.errors });
    }

    const role = await roleService.update(id, req.user.tenantId, parse.data);
    if (!role) {
      return res.status(404).json({ status: 'error', message: 'Role not found' });
    }
    return res.status(200).json({ status: 'success', data: role });
  },
  delete: async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const { id } = req.params;
    const role = await roleService.remove(id, req.user.tenantId);
    if (!role) {
      return res.status(404).json({ status: 'error', message: 'Role not found' });
    }
    return res.status(200).json({ status: 'success', message: 'Role deleted' });
  },
};
