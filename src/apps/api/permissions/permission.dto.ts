import { z } from 'zod';

export const createPermissionSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const updatePermissionSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});
