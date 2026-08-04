import { businessRepository } from './business.repository';

export const businessService = {
  getAll: async (tenantId: string) => {
    return businessRepository.findAll(tenantId);
  },
  getById: async (id: string, tenantId: string) => {
    return businessRepository.findById(id, tenantId);
  },
  create: async (tenantId: string, data: { name: string; code: string; description?: string }) => {
    return businessRepository.create({ ...data, tenantId });
  },
  update: async (id: string, tenantId: string, data: { name?: string; description?: string; active?: boolean }) => {
    return businessRepository.update(id, tenantId, data);
  },
  remove: async (id: string, tenantId: string) => {
    return businessRepository.delete(id, tenantId);
  },
};
