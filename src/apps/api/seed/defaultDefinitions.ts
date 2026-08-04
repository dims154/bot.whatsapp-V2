export const defaultRoles = [
  'Super Admin',
  'Owner',
  'Admin',
  'Operator',
  'Kasir',
  'Marketing',
  'Customer Service',
  'Viewer',
];

export const defaultPermissions = [
  'user.read',
  'user.create',
  'user.update',
  'user.delete',
  'user.assign_roles',
  'user.assign_permissions',
  'role.read',
  'role.create',
  'role.update',
  'role.delete',
  'permission.read',
  'permission.create',
  'permission.update',
  'permission.delete',
  'business.read',
  'business.create',
  'business.update',
  'business.delete',
];

export const rolePermissionMap: Record<string, string[]> = {
  'Super Admin': [
    ...defaultPermissions,
  ],
  Owner: [
    ...defaultPermissions,
  ],
  Admin: [
    'user.read',
    'user.create',
    'user.update',
    'user.delete',
    'user.assign_roles',
    'user.assign_permissions',
    'role.read',
    'role.create',
    'role.update',
    'role.delete',
    'permission.read',
    'permission.create',
    'permission.update',
    'permission.delete',
    'business.read',
    'business.create',
    'business.update',
    'business.delete',
  ],
  Operator: [
    'user.read',
    'business.read',
  ],
  Kasir: [
    'business.read',
  ],
  Marketing: [
    'user.read',
    'business.read',
  ],
  'Customer Service': [
    'user.read',
    'business.read',
  ],
  Viewer: [
    'user.read',
    'business.read',
  ],
};
