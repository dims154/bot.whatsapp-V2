import { Request, Response } from 'express';
import { permissionService } from './permission.service';
import { createPermissionSchema, updatePermissionSchema } from './permission.dto';

export const permissionController = {
  getAll: async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const permissions = await permissionService.getAll(req.user.tenantId);
    return res.status(200).json({ status: 'success', data: permissions });
  },
  getById: async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const { id } = req.params;
    const permission = await permissionService.getById(id, req.user.tenantId);
    if (!permission) {
      return res.status(404).json({ status: 'error', message: 'Permission not found' });
    }
    return res.status(200).json({ status: 'success', data: permission });
  },
  create: async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const parse = createPermissionSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ status: 'error', message: 'Invalid payload', errors: parse.error.errors });
    }

    const permission = await permissionService.create(req.user.tenantId, parse.data);
    return res.status(201).json({ status: 'success', data: permission });
  },
  update: async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const { id } = req.params;
    const parse = updatePermissionSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ status: 'error', message: 'Invalid payload', errors: parse.error.errors });
    }

    const permission = await permissionService.update(id, req.user.tenantId, parse.data);
    if (!permission) {
      return res.status(404).json({ status: 'error', message: 'Permission not found' });
    }
    return res.status(200).json({ status: 'success', data: permission });
  },
  delete: async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const { id } = req.params;
    const permission = await permissionService.remove(id, req.user.tenantId);
    if (!permission) {
      return res.status(404).json({ status: 'error', message: 'Permission not found' });
    }
    return res.status(200).json({ status: 'success', message: 'Permission deleted' });
  },
};
