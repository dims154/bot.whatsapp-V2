import { prismaService } from '../../../database/prisma.service';
import { CreateUserPayload } from './user.interfaces';

type CreateUserData = Omit<CreateUserPayload, 'tenantId'> & {
    tenantId: string;
};

type UpdateUserData = {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    whatsappNumber?: string;
    active?: boolean;
    roles?: { set: { id: string }[] };
    permissions?: { set: { id: string }[] };
};

export const userRepository = {

    findAll: async (tenantId?: string) => {
        return prismaService.client.user.findMany({
            where: tenantId ? { tenantId } : undefined,
            include: {
                roles: true,
                permissions: true
            },
        });
    },

    findById: async (
        id: string,
        tenantId?: string
    ) => {
        return prismaService.client.user.findFirst({
            where: tenantId
                ? { id, tenantId }
                : { id },
            include: {
                roles: true,
                permissions: true
            },
        });
    },

    // =========================
    // FIND USER BY WHATSAPP
    // =========================

    findByWhatsApp: async (
        whatsappNumber: string,
        tenantId: string
    ) => {
        return prismaService.client.user.findFirst({
            where: {
                whatsappNumber,
                tenantId,
                active: true
            },
            include: {
                roles: true,
                permissions: true
            }
        });
    },

    // =========================
    // CREATE
    // =========================

    create: async (data: CreateUserData) => {
        return prismaService.client.user.create({
            data: {
                email: data.email,
                password: data.password,
                tenantId: data.tenantId,
                firstName: data.firstName,
                lastName: data.lastName,
                whatsappNumber: data.whatsappNumber,

                roles: data.roleIds
                    ? {
                        connect: data.roleIds.map(
                            (id) => ({ id })
                        )
                    }
                    : undefined,

                permissions: data.permissionIds
                    ? {
                        connect: data.permissionIds.map(
                            (id) => ({ id })
                        )
                    }
                    : undefined,
            },

            include: {
                roles: true,
                permissions: true
            },
        });
    },

    // =========================
    // UPDATE
    // =========================

    update: async (
        id: string,
        data: UpdateUserData
    ) => {

        const payload: UpdateUserData = {
            email: data.email,
            password: data.password,
            firstName: data.firstName,
            lastName: data.lastName,
            whatsappNumber: data.whatsappNumber,
            active: data.active,
        };

        if (data.roles) {
            payload.roles = data.roles;
        }

        if (data.permissions) {
            payload.permissions = data.permissions;
        }

        return prismaService.client.user.update({
            where: { id },
            data: payload,
            include: {
                roles: true,
                permissions: true
            },
        });
    },

    // =========================
    // DELETE
    // =========================

    delete: async (id: string) => {
        return prismaService.client.user.delete({
            where: { id },
        });
    },

    // =========================
    // ASSIGN ROLES
    // =========================

    assignRoles: async (
        id: string,
        roleIds: string[]
    ) => {
        return prismaService.client.user.update({
            where: { id },

            data: {
                roles: {
                    set: roleIds.map(
                        (roleId) => ({ id: roleId })
                    ),
                },
            },

            include: {
                roles: true
            },
        });
    },

    // =========================
    // ASSIGN PERMISSIONS
    // =========================

    assignPermissions: async (
        id: string,
        permissionIds: string[]
    ) => {
        return prismaService.client.user.update({
            where: { id },

            data: {
                permissions: {
                    set: permissionIds.map(
                        (permissionId) => ({
                            id: permissionId
                        })
                    ),
                },
            },

            include: {
                permissions: true
            },
        });
    },

    // =========================
    // FIND PERMISSIONS
    // =========================

    findPermissions: async (
        userId: string
    ) => {
        return prismaService.client.user.findUnique({
            where: {
                id: userId
            },

            include: {
                permissions: true,

                roles: {
                    include: {
                        permissions: true
                    }
                }
            },
        });
    },
};