import { permissionRepository } from './permission.repository';

export const permissionService = {
  getAll: async (tenantId: string) => {
    return permissionRepository.findAll(tenantId);
  },
  getById: async (id: string, tenantId: string) => {
    return permissionRepository.findById(id, tenantId);
  },
  create: async (tenantId: string, data: { name: string; description?: string }) => {
    return permissionRepository.create({ ...data, tenantId });
  },
  update: async (id: string, tenantId: string, data: { name?: string; description?: string }) => {
    return permissionRepository.update(id, tenantId, data);
  },
  remove: async (id: string, tenantId: string) => {
    return permissionRepository.delete(id, tenantId);
  },
};
