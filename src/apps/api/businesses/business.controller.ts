import { Request, Response } from 'express';
import { businessService } from './business.service';
import { createBusinessSchema, updateBusinessSchema } from './business.dto';

export const businessController = {
  getAll: async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const businesses = await businessService.getAll(req.user.tenantId);
    return res.status(200).json({ status: 'success', data: businesses });
  },
  getById: async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const { id } = req.params;
    const business = await businessService.getById(id, req.user.tenantId);
    if (!business) {
      return res.status(404).json({ status: 'error', message: 'Business not found' });
    }
    return res.status(200).json({ status: 'success', data: business });
  },
  create: async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const parse = createBusinessSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ status: 'error', message: 'Invalid payload', errors: parse.error.errors });
    }

    const business = await businessService.create(req.user.tenantId, parse.data);
    return res.status(201).json({ status: 'success', data: business });
  },
  update: async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const { id } = req.params;
    const parse = updateBusinessSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ status: 'error', message: 'Invalid payload', errors: parse.error.errors });
    }

    const business = await businessService.update(id, req.user.tenantId, parse.data);
    if (!business) {
      return res.status(404).json({ status: 'error', message: 'Business not found' });
    }
    return res.status(200).json({ status: 'success', data: business });
  },
  delete: async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const { id } = req.params;
    const business = await businessService.remove(id, req.user.tenantId);
    if (!business) {
      return res.status(404).json({ status: 'error', message: 'Business not found' });
    }
    return res.status(200).json({ status: 'success', message: 'Business deleted' });
  },
};
