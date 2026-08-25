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
        // Permission yang diberikan
        // langsung kepada user
        // =========================

        const directPermissions =
            user.permissions.map(
                permission =>
                    permission.name
            );

        // =========================
        // ROLE PERMISSIONS
        // Permission yang berasal
        // dari role user
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
        // MERGE PERMISSIONS
        // =========================

        const permissions = [
            ...new Set([
                ...directPermissions,
                ...rolePermissions
            ])
        ];

        // =========================
        // DEBUG USER
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

                permissions
            }
        );

        // =========================
        // RETURN
        // =========================

        return {

            id: user.id,

            tenantId:
                user.tenantId,

            whatsappNumber:
                user.whatsappNumber,

            roles,

            permissions

        };
    }
}