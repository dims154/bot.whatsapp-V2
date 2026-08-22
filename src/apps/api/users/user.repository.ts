import { prismaService } from '../../../database/prisma.service';
import { CreateUserPayload } from './user.interfaces';


// =====================================================
// CREATE USER DATA
// =====================================================

type CreateUserData =
    Omit<CreateUserPayload, 'tenantId'> & {
        tenantId: string;
    };


// =====================================================
// UPDATE USER DATA
// =====================================================

type UpdateUserData = {

    email?: string;

    password?: string;

    firstName?: string;

    lastName?: string;

    whatsappNumber?: string;

    active?: boolean;

    roles?: {
        set: {
            id: string;
        }[];
    };

    permissions?: {
        set: {
            id: string;
        }[];
    };

};


// =====================================================
// USER REPOSITORY
// =====================================================

export const userRepository = {


    // =================================================
    // FIND ALL USERS
    // =================================================

    findAll: async (
        tenantId?: string
    ) => {

        return prismaService.client.user.findMany({

            where:
                tenantId
                    ? {
                        tenantId
                    }
                    : undefined,

            include: {

                roles: true,

                permissions: true

            },

            orderBy: {

                createdAt: 'asc'

            }

        });

    },


    // =================================================
    // FIND USER BY ID
    // =================================================

    findById: async (

        id: string,

        tenantId?: string

    ) => {

        return prismaService.client.user.findFirst({

            where:
                tenantId
                    ? {

                        id,

                        tenantId

                    }
                    : {

                        id

                    },

            include: {

                permissions: true,

                roles: {

                    include: {

                        permissions: true

                    }

                }

            }

        });

    },


    // =================================================
    // FIND USER BY EMAIL
    // =================================================

    findByEmail: async (

        email: string,

        tenantId: string

    ) => {

        return prismaService.client.user.findFirst({

            where: {

                email,

                tenantId

            },

            include: {

                roles: true,

                permissions: true

            }

        });

    },


    // =================================================
    // FIND USER BY WHATSAPP
    // ACTIVE ONLY
    // =================================================

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

                // Permission langsung
                permissions: true,

                // Role + permission dari role
                roles: {

                    include: {

                        permissions: true

                    }

                }

            }

        });

    },


    // =================================================
    // FIND USER BY WHATSAPP
    // ALL STATUS
    // =================================================

    // Digunakan untuk validasi duplicate ketika CREATE.
    //
    // User inactive tetap dianggap sudah memiliki nomor.

    // =================================================

    findByWhatsAppAnyStatus: async (

        whatsappNumber: string,

        tenantId: string

    ) => {

        return prismaService.client.user.findFirst({

            where: {

                whatsappNumber,

                tenantId

            },

            include: {

                permissions: true,

                roles: {

                    include: {

                        permissions: true

                    }

                }

            }

        });

    },


    // =================================================
    // CREATE USER
    // =================================================

    create: async (

        data: CreateUserData

    ) => {

        return prismaService.client.user.create({

            data: {

                email:
                    data.email,

                password:
                    data.password,

                tenantId:
                    data.tenantId,

                firstName:
                    data.firstName,

                lastName:
                    data.lastName,

                whatsappNumber:
                    data.whatsappNumber,


                // =====================================
                // ASSIGN ROLES
                // =====================================

                roles:

                    data.roleIds &&
                    data.roleIds.length > 0

                        ? {

                            connect:

                                data.roleIds.map(

                                    (id) => ({

                                        id

                                    })

                                )

                        }

                        : undefined,


                // =====================================
                // ASSIGN DIRECT PERMISSIONS
                // =====================================

                permissions:

                    data.permissionIds &&
                    data.permissionIds.length > 0

                        ? {

                            connect:

                                data.permissionIds.map(

                                    (id) => ({

                                        id

                                    })

                                )

                        }

                        : undefined

            },

            include: {

                permissions: true,

                roles: {

                    include: {

                        permissions: true

                    }

                }

            }

        });

    },


    // =================================================
    // UPDATE USER
    // =================================================

    update: async (

        id: string,

        data: UpdateUserData

    ) => {

        const payload: UpdateUserData = {

            email:
                data.email,

            password:
                data.password,

            firstName:
                data.firstName,

            lastName:
                data.lastName,

            whatsappNumber:
                data.whatsappNumber,

            active:
                data.active

        };


        // =============================================
        // UPDATE ROLES
        // =============================================

        if (data.roles) {

            payload.roles =
                data.roles;

        }


        // =============================================
        // UPDATE PERMISSIONS
        // =============================================

        if (data.permissions) {

            payload.permissions =
                data.permissions;

        }


        return prismaService.client.user.update({

            where: {

                id

            },

            data: payload,

            include: {

                permissions: true,

                roles: {

                    include: {

                        permissions: true

                    }

                }

            }

        });

    },


    // =================================================
    // DELETE USER
    // =================================================

    delete: async (

        id: string,

        tenantId?: string

    ) => {

        // =============================================
        // Jika tenantId diberikan,
        // pastikan user memang milik tenant tersebut.
        // =============================================

        if (tenantId) {

            const user =
                await prismaService.client.user.findFirst({

                    where: {

                        id,

                        tenantId

                    }

                });


            if (!user) {

                return null;

            }

        }


        return prismaService.client.user.delete({

            where: {

                id

            }

        });

    },


    // =================================================
    // ASSIGN ROLES
    // TENANT SAFE
    // =================================================

    assignRoles: async (

        id: string,

        roleIds: string[],

        tenantId?: string

    ) => {

        // =============================================
        // VALIDASI TENANT
        // =============================================

        if (tenantId) {

            // =========================================
            // CEK USER
            // =========================================

            const user =
                await prismaService.client.user.findFirst({

                    where: {

                        id,

                        tenantId

                    }

                });


            if (!user) {

                return null;

            }


            // =========================================
            // CEK ROLE
            // =========================================

            const roles =
                await prismaService.client.role.findMany({

                    where: {

                        id: {

                            in: roleIds

                        },

                        tenantId

                    }

                });


            // =========================================
            // SEMUA ROLE HARUS ADA
            // DI TENANT YANG SAMA
            // =========================================

            if (
                roles.length !== roleIds.length
            ) {

                throw new Error(
                    "ROLE_NOT_FOUND_OR_WRONG_TENANT"
                );

            }

        }


        // =============================================
        // ASSIGN ROLE
        // =============================================

        return prismaService.client.user.update({

            where: {

                id

            },

            data: {

                roles: {

                    set:

                        roleIds.map(

                            (roleId) => ({

                                id:
                                    roleId

                            })

                        )

                }

            },

            include: {

                permissions: true,

                roles: {

                    include: {

                        permissions: true

                    }

                }

            }

        });

    },


    // =================================================
    // ASSIGN PERMISSIONS
    // TENANT SAFE
    // =================================================

    assignPermissions: async (

        id: string,

        permissionIds: string[],

        tenantId?: string

    ) => {

        // =============================================
        // VALIDASI TENANT
        // =============================================

        if (tenantId) {

            // =========================================
            // CEK USER
            // =========================================

            const user =
                await prismaService.client.user.findFirst({

                    where: {

                        id,

                        tenantId

                    }

                });


            if (!user) {

                return null;

            }


            // =========================================
            // CEK PERMISSION
            // =========================================

            const permissions =
                await prismaService.client.permission.findMany({

                    where: {

                        id: {

                            in: permissionIds

                        },

                        tenantId

                    }

                });


            // =========================================
            // SEMUA PERMISSION HARUS ADA
            // DI TENANT YANG SAMA
            // =========================================

            if (
                permissions.length !==
                permissionIds.length
            ) {

                throw new Error(
                    "PERMISSION_NOT_FOUND_OR_WRONG_TENANT"
                );

            }

        }


        // =============================================
        // ASSIGN PERMISSION
        // =============================================

        return prismaService.client.user.update({

            where: {

                id

            },

            data: {

                permissions: {

                    set:

                        permissionIds.map(

                            (permissionId) => ({

                                id:
                                    permissionId

                            })

                        )

                }

            },

            include: {

                permissions: true,

                roles: {

                    include: {

                        permissions: true

                    }

                }

            }

        });

    },


    // =================================================
    // FIND USER PERMISSIONS
    // =================================================

    findPermissions: async (

        userId: string,

        tenantId?: string

    ) => {

        return prismaService.client.user.findFirst({

            where:

                tenantId

                    ? {

                        id:
                            userId,

                        tenantId

                    }

                    : {

                        id:
                            userId

                    },

            include: {

                permissions: true,

                roles: {

                    include: {

                        permissions: true

                    }

                }

            }

        });

    }

};