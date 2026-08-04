import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  tenantId: z.string().uuid().optional(),
  roleIds: z.array(z.string().uuid()).optional(),
  permissionIds: z.array(z.string().uuid()).optional(),
});

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  active: z.boolean().optional(),
  roleIds: z.array(z.string().uuid()).optional(),
  permissionIds: z.array(z.string().uuid()).optional(),
});

export const assignRolesSchema = z.object({
  roleIds: z.array(z.string().uuid()),
});

export const assignPermissionsSchema = z.object({
  permissionIds: z.array(z.string().uuid()),
});
