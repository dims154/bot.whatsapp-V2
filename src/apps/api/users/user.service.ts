import bcrypt from 'bcrypt';
import { userRepository } from './user.repository';
import {
    CreateUserPayload,
    UpdateUserPayload
} from './user.interfaces';

export const userService = {

    // =========================
    // GET ALL USERS
    // =========================

    getAll: async (tenantId: string) => {
        return userRepository.findAll(tenantId);
    },

    // =========================
    // GET USER BY ID
    // =========================

    getById: async (
        id: string,
        tenantId: string
    ) => {
        return userRepository.findById(
            id,
            tenantId
        );
    },

    // =========================
    // GET USER BY WHATSAPP
    // =========================

    getByWhatsApp: async (
        whatsappNumber: string,
        tenantId: string
    ) => {
        return userRepository.findByWhatsApp(
            whatsappNumber,
            tenantId
        );
    },

    // =========================
    // CREATE USER
    // =========================

    create: async (
        payload: CreateUserPayload,
        tenantId: string
    ) => {

        const hashedPassword =
            await bcrypt.hash(
                payload.password,
                12
            );

        const createData = {
            ...payload,
            password: hashedPassword,
            tenantId,
        };

        return userRepository.create(
            createData
        );
    },

    // =========================
    // UPDATE USER
    // =========================

    update: async (
        id: string,
        payload: UpdateUserPayload,
        tenantId: string
    ) => {

        const existingUser =
            await userRepository.findById(
                id,
                tenantId
            );

        if (!existingUser) {
            return null;
        }

        const updatePayload: {
            email?: string;
            password?: string;
            firstName?: string;
            lastName?: string;
            whatsappNumber?: string;
            active?: boolean;
            roles?: {
                set: { id: string }[];
            };
            permissions?: {
                set: { id: string }[];
            };
        } = {
            email: payload.email,
            password: payload.password,
            firstName: payload.firstName,
            lastName: payload.lastName,
            whatsappNumber: payload.whatsappNumber,
            active: payload.active,
        };

        if (payload.password) {
            updatePayload.password =
                await bcrypt.hash(
                    payload.password,
                    12
                );
        }

        if (payload.roleIds) {
            updatePayload.roles = {
                set: payload.roleIds.map(
                    (roleId) => ({
                        id: roleId
                    })
                )
            };
        }

        if (payload.permissionIds) {
            updatePayload.permissions = {
                set: payload.permissionIds.map(
                    (permissionId) => ({
                        id: permissionId
                    })
                )
            };
        }

        return userRepository.update(
            id,
            updatePayload,
            tenantId
        );
    },

    // =========================
    // DELETE USER
    // =========================

    remove: async (
        id: string,
        tenantId: string
    ) => {

        const existingUser =
            await userRepository.findById(
                id,
                tenantId
            );

        if (!existingUser) {
            return null;
        }

        return userRepository.delete(id, tenantId);
    },

    // =========================
    // ASSIGN ROLES
    // =========================

    assignRoles: async (
        id: string,
        roleIds: string[],
        tenantId: string
    ) => {

        const existingUser =
            await userRepository.findById(
                id,
                tenantId
            );

        if (!existingUser) {
            return null;
        }

        return userRepository.assignRoles(
            id,
            roleIds,
            tenantId
        );
    },

    // =========================
    // ASSIGN PERMISSIONS
    // =========================

    assignPermissions: async (
        id: string,
        permissionIds: string[],
        tenantId: string
    ) => {

        const existingUser =
            await userRepository.findById(
                id,
                tenantId
            );

        if (!existingUser) {
            return null;
        }

        return userRepository.assignPermissions(
            id,
            permissionIds,
            tenantId
        );
    },

    // =========================
    // GET PERMISSIONS
    // =========================

    getPermissions: async (
        userId: string
    ) => {
        return userRepository.findPermissions(
            userId
        );
    },
};