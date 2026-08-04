import { roleRepository } from './role.repository';

export const roleService = {
  getAll: async (tenantId: string) => {
    return roleRepository.findAll(tenantId);
  },
  getById: async (id: string, tenantId: string) => {
    return roleRepository.findById(id, tenantId);
  },
  create: async (tenantId: string, data: {
    name: string;
    description?: string;
    permissionIds?: string[];
  }) => {
    return roleRepository.create({ ...data, tenantId });
  },
  update: async (id: string, tenantId: string, data: {
    name?: string;
    description?: string;
    permissionIds?: string[];
  }) => {
    return roleRepository.update(id, tenantId, data);
  },
  remove: async (id: string, tenantId: string) => {
    return roleRepository.delete(id, tenantId);
  },
};
