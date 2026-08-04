import { z } from 'zod';

export const createBusinessSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().optional(),
});

export const updateBusinessSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  active: z.boolean().optional(),
});
