import { prismaService } from '../../../database/prisma.service';
import {
    defaultPermissions,
    defaultRoles,
    rolePermissionMap
} from './defaultDefinitions';

import bcrypt from 'bcrypt';

const FIRST_TENANT_CODE = 'first-tenant';
const FIRST_TENANT_NAME = 'First Tenant';

const OWNER_EMAIL = 'owner@erp.local';
const OWNER_PASSWORD = 'owner123';

const OWNER_WHATSAPP = '6289529852918';

const FIRST_USER_EMAIL = 'superadmin@tenant.local';
const FIRST_USER_PASSWORD = 'SuperAdmin123!';

export const seedService = {

    initialize: async () => {

        // =========================
        // CHECK TENANT
        // =========================

        const existingTenant =
            await prismaService.client.tenant.findUnique({
                where: {
                    code: FIRST_TENANT_CODE
                }
            });

        if (existingTenant) {

            console.log(
                '⚠️ Default tenant sudah ada. Seed dilewati.'
            );

            return;
        }

        // =========================
        // CREATE TENANT
        // =========================

        const tenant =
            await prismaService.client.tenant.create({

                data: {

                    name:
                        FIRST_TENANT_NAME,

                    code:
                        FIRST_TENANT_CODE,

                    description:
                        'Automatically generated default tenant',

                },

            });

        // =========================
        // CREATE BUSINESS
        // =========================

        const defaultBusiness =
            await prismaService.client.business.create({

                data: {

                    tenantId:
                        tenant.id,

                    name:
                        'Default Business',

                    code:
                        'default-business',

                    description:
                        'Default business for the first tenant',

                },

            });

        // =========================
        // CREATE PERMISSIONS
        // =========================

        const permissions =
            await Promise.all(

                defaultPermissions.map(
                    async (name) => {

                        return prismaService.client.permission.create({

                            data: {

                                tenantId:
                                    tenant.id,

                                name,

                                description:
                                    `${name} permission`,

                            },

                        });

                    }
                )

            );

        console.log(
            '✅ Permissions created:',
            permissions.map(
                permission =>
                    permission.name
            )
        );

        // =========================
        // CREATE ROLES
        // =========================

        const roleRecords =
            await Promise.all(

                defaultRoles.map(
                    async (name) => {

                        const permissionIds =
                            rolePermissionMap[name]
                                .map(
                                    permissionName => {

                                        const permission =
                                            permissions.find(
                                                item =>
                                                    item.name ===
                                                    permissionName
                                            );

                                        return permission?.id ?? '';

                                    }
                                );

                        return prismaService.client.role.create({

                            data: {

                                tenantId:
                                    tenant.id,

                                name,

                                description:
                                    `${name} role`,

                                permissions: {

                                    connect:
                                        permissionIds
                                            .filter(Boolean)
                                            .map(
                                                id => ({
                                                    id
                                                })
                                            ),

                                },

                            },

                            include: {

                                permissions: true

                            },

                        });

                    }
                )

            );

        console.log(
            '✅ Roles created:',
            roleRecords.map(
                role => ({
                    name: role.name,
                    permissions:
                        role.permissions.map(
                            permission =>
                                permission.name
                        )
                })
            )
        );

        // =========================
        // FIND OWNER ROLE
        // =========================

        const ownerRole =
            roleRecords.find(
                role =>
                    role.name.toLowerCase() ===
                    'owner'
            );

        if (!ownerRole) {

            throw new Error(
                '❌ Owner role tidak ditemukan.'
            );

        }

        // =========================
        // FIND SUPER ADMIN ROLE
        // =========================

        const superAdminRole =
            roleRecords.find(
                role =>
                    role.name.toLowerCase() ===
                    'super admin'
            );

        if (!superAdminRole) {

            throw new Error(
                '❌ Super Admin role tidak ditemukan.'
            );

        }

        // =========================
        // PASSWORD
        // =========================

        const hashedPassword =
            await bcrypt.hash(
                OWNER_PASSWORD,
                12
            );

        const hashedSuperAdminPassword =
            await bcrypt.hash(
                FIRST_USER_PASSWORD,
                12
            );

        // =========================
        // CREATE OWNER
        // =========================

        const ownerUser =
            await prismaService.client.user.create({

                data: {

                    // JANGAN isi id.
                    // Prisma akan membuat UUID otomatis.

                    tenantId:
                        tenant.id,

                    email:
                        OWNER_EMAIL,

                    password:
                        hashedPassword,

                    firstName:
                        'Owner',

                    lastName:
                        'ERP',

                    whatsappNumber:
                        OWNER_WHATSAPP,

                    active:
                        true,

                    roles: {

                        connect: {

                            id:
                                ownerRole.id

                        }

                    },

                },

                include: {

                    roles: true,

                    permissions: true

                },

            });

        console.log(
            '✅ Owner created:',
            {
                id:
                    ownerUser.id,

                email:
                    ownerUser.email,

                whatsappNumber:
                    ownerUser.whatsappNumber,

                roles:
                    ownerUser.roles.map(
                        role =>
                            role.name
                    )

            }
        );

        // =========================
        // CREATE SUPER ADMIN
        // =========================

        const superAdminUser =
            await prismaService.client.user.create({

                data: {

                    tenantId:
                        tenant.id,

                    email:
                        FIRST_USER_EMAIL,

                    password:
                        hashedSuperAdminPassword,

                    firstName:
                        'Super',

                    lastName:
                        'Admin',

                    active:
                        true,

                    roles: {

                        connect: {

                            id:
                                superAdminRole.id

                        }

                    },

                },

            });

        console.log(
            '✅ Super Admin created:',
            {
                id:
                    superAdminUser.id,

                email:
                    superAdminUser.email

            }
        );

        // =========================
        // CREATE ADMIN RECORD
        // =========================

        await prismaService.client.admin.create({

            data: {

                userId:
                    ownerUser.id,

                businessId:
                    defaultBusiness.id,

            },

        });

        console.log(
            '================================'
        );

        console.log(
            '✅ DATABASE SEED BERHASIL'
        );

        console.log(
            '================================'
        );

    },

};