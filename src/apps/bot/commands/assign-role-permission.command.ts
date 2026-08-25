import { ICommand } from "./interfaces/ICommand";
import { ICommandContext } from "./interfaces/ICommandContext";

import { roleRepository } from "../../api/roles/role.repository";
import { permissionRepository } from "../../api/permissions/permission.repository";


export class AssignRolePermissionCommand implements ICommand {

    name = "assignrolepermission";

    aliases = [
        "assignroleperm",
        "rolepermission"
    ];

    category = "role";

    permission = "role.update" as const;

    cooldown = 3;

    description =
        "Memberikan permission kepada role";


    async execute(
        context: ICommandContext
    ): Promise<void> {

        // ====================================
        // TENANT CHECK
        // ====================================

        if (!context.tenantId) {

            await context.reply(
                "❌ Tenant tidak ditemukan."
            );

            return;

        }


        // ====================================
        // ARGUMENT CHECK
        // ====================================

        if (
            !context.args ||
            context.args.length < 2
        ) {

            await context.reply(
                `❌ Format command salah.

Gunakan:

/assignrolepermission <role> <permission>

Contoh:

/assignrolepermission Manager user.read`
            );

            return;

        }


        // ====================================
        // PARSE ARGUMENT
        // ====================================

        const roleName =
            context.args[0]
                .trim();

        const permissionName =
            context.args[1]
                .trim();


        if (
            !roleName ||
            !permissionName
        ) {

            await context.reply(
                "❌ Role dan permission wajib diisi."
            );

            return;

        }


        try {

            // ====================================
            // FIND ROLE
            // ====================================

            const role =
                await roleRepository.findByName(
                    roleName,
                    context.tenantId
                );


            if (!role) {

                await context.reply(
                    `❌ Role *${roleName}* tidak ditemukan.

🏢 Tenant:
${context.tenantId}`
                );

                return;

            }


            // ====================================
            // FIND PERMISSION
            // ====================================

            const permission =
                await permissionRepository.findAll(
                    context.tenantId
                );


            const targetPermission =
                permission.find(
                    item =>
                        item.name === permissionName
                );


            if (!targetPermission) {

                await context.reply(
                    `❌ Permission *${permissionName}* tidak ditemukan.

🏢 Tenant:
${context.tenantId}`
                );

                return;

            }


            // ====================================
            // EXISTING PERMISSIONS
            // ====================================

            const existingPermissionIds =
                role.permissions.map(
                    item => item.id
                );


            // ====================================
            // DUPLICATE CHECK
            // ====================================

            if (
                existingPermissionIds.includes(
                    targetPermission.id
                )
            ) {

                await context.reply(
                    `⚠️ Permission *${permissionName}* sudah dimiliki role *${role.name}*.

🏢 Tenant:
${context.tenantId}`
                );

                return;

            }


            // ====================================
            // ASSIGN
            // ====================================

            const updatedRole =
                await roleRepository.update(

                    role.id,

                    context.tenantId,

                    {

                        permissionIds: [

                            ...existingPermissionIds,

                            targetPermission.id

                        ]

                    }

                );


            if (!updatedRole) {

                await context.reply(
                    "❌ Role gagal diperbarui."
                );

                return;

            }


            // ====================================
            // SUCCESS
            // ====================================

            const permissionNames =
                updatedRole.permissions
                    .map(
                        item => item.name
                    )
                    .join(", ");


            await context.reply(

                `✅ *PERMISSION BERHASIL DIBERIKAN KE ROLE*

🔐 Role:
${updatedRole.name}

🔑 Permission ditambahkan:
${targetPermission.name}

📋 Semua permission role:
${permissionNames || "-"}

🏢 Tenant:
${context.tenantId}`

            );


        } catch (error) {

            console.error(
                "❌ AssignRolePermissionCommand error:",
                error
            );


            await context.reply(
                "❌ Gagal memberikan permission kepada role."
            );

        }

    }

}
