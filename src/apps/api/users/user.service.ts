import bcrypt from 'bcrypt';
import { userRepository } from './user.repository';
import { CreateUserPayload, UpdateUserPayload } from './user.interfaces';

export const userService = {
  getAll: async (tenantId: string) => {
    return userRepository.findAll(tenantId);
  },
  getById: async (id: string, tenantId: string) => {
    return userRepository.findById(id, tenantId);
  },
  create: async (payload: CreateUserPayload, tenantId: string) => {
    const hashedPassword = await bcrypt.hash(payload.password, 12);
    const createData = {
      ...payload,
      password: hashedPassword,
      tenantId,
    };

    return userRepository.create(createData);
  },
  update: async (id: string, payload: UpdateUserPayload, tenantId: string) => {
    const existingUser = await userRepository.findById(id, tenantId);
    if (!existingUser) {
      return null;
    }

    const updatePayload: {
      email?: string;
      password?: string;
      firstName?: string;
      lastName?: string;
      active?: boolean;
      roles?: { set: { id: string }[] };
      permissions?: { set: { id: string }[] };
    } = {
      email: payload.email,
      password: payload.password,
      firstName: payload.firstName,
      lastName: payload.lastName,
      active: payload.active,
    };

    if (payload.password) {
      updatePayload.password = await bcrypt.hash(payload.password, 12);
    }

    if (payload.roleIds) {
      updatePayload.roles = { set: payload.roleIds.map((roleId) => ({ id: roleId })) };
    }
    if (payload.permissionIds) {
      updatePayload.permissions = { set: payload.permissionIds.map((permissionId) => ({ id: permissionId })) };
    }

    return userRepository.update(id, updatePayload);
  },
  remove: async (id: string, tenantId: string) => {
    const existingUser = await userRepository.findById(id, tenantId);
    if (!existingUser) {
      return null;
    }

    return userRepository.delete(id);
  },
  assignRoles: async (id: string, roleIds: string[], tenantId: string) => {
    const existingUser = await userRepository.findById(id, tenantId);
    if (!existingUser) {
      return null;
    }

    return userRepository.assignRoles(id, roleIds);
  },
  assignPermissions: async (id: string, permissionIds: string[], tenantId: string) => {
    const existingUser = await userRepository.findById(id, tenantId);
    if (!existingUser) {
      return null;
    }

    return userRepository.assignPermissions(id, permissionIds);
  },
  getPermissions: async (userId: string) => {
    return userRepository.findPermissions(userId);
  },
};
