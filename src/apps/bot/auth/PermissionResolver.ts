export class PermissionResolver {

    static has(
        permissions: string[],
        requiredPermission: string,
        roles: string[] = []
    ): boolean {

        // =========================
        // PUBLIC COMMAND
        // =========================

        if (
            requiredPermission === "user" ||
            requiredPermission === "everyone"
        ) {
            return true;
        }

        // =========================
        // OWNER
        // =========================

        if (
            requiredPermission === "owner"
        ) {

            return roles.some(
                role =>
                    role.toLowerCase() === "owner"
            );

        }

        // =========================
        // ADMIN
        // =========================

        if (
            requiredPermission === "admin"
        ) {

            return roles.some(
                role =>
                    [
                        "owner",
                        "admin",
                        "super admin"
                    ].includes(
                        role.toLowerCase()
                    )
            );

        }

        // =========================
        // DATABASE PERMISSION
        // =========================

        return permissions.includes(
            requiredPermission
        );

    }

}