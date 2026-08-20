import { userRepository } from "../../api/users/user.repository";

export class UserResolver {

    static async resolve(
        whatsappNumber: string,
        tenantId: string
    ) {

        // =========================
        // FIND USER
        // =========================

        const user =
            await userRepository.findByWhatsApp(
                whatsappNumber,
                tenantId
            );

        if (!user) {

            console.log(
                "👤 User tidak ditemukan:",
                {
                    whatsappNumber,
                    tenantId
                }
            );

            return null;
        }

        // =========================
        // ROLES
        // =========================

        const roles =
            user.roles.map(
                role => role.name
            );

        // =========================
        // DIRECT PERMISSIONS
        // =========================

        const directPermissions =
            user.permissions.map(
                permission =>
                    permission.name
            );

        // =========================
        // ROLE PERMISSIONS
        // =========================

        const rolePermissions =
            user.roles.flatMap(
                role =>
                    role.permissions.map(
                        permission =>
                            permission.name
                    )
            );

        // =========================
        // COMBINE PERMISSIONS
        // =========================

        const permissions =
            [
                ...directPermissions,
                ...rolePermissions
            ];

        // =========================
        // REMOVE DUPLICATES
        // =========================

        const uniquePermissions =
            [
                ...new Set(
                    permissions
                )
            ];

        // =========================
        // DEBUG
        // =========================

        console.log(
            "👤 User ditemukan:",
            {
                id: user.id,
                email: user.email,
                whatsappNumber:
                    user.whatsappNumber,
                tenantId:
                    user.tenantId,
                active:
                    user.active,
                roles,
                directPermissions,
                rolePermissions,
                permissions:
                    uniquePermissions
            }
        );

        // =========================
        // RETURN IDENTITY
        // =========================

        return {

            id: user.id,

            tenantId:
                user.tenantId,

            whatsappNumber:
                user.whatsappNumber,

            roles,

            permissions:
                uniquePermissions

        };

    }

}