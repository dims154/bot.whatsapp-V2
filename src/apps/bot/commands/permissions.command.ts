import { ICommand } from "./interfaces/ICommand";
import { ICommandContext } from "./interfaces/ICommandContext";

import { permissionRepository } from "../../api/permissions/permission.repository";


export class PermissionsCommand implements ICommand {

    name = "permissions";

    aliases = [
        "perms"
    ];

    category = "permission";

    permission = "permission.read";

    cooldown = 3;

    description =
        "Menampilkan daftar permission";


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


        try {

            // ====================================
            // GET PERMISSIONS
            // ====================================

            const permissions =
                await permissionRepository.findAll(
                    context.tenantId
                );


            // ====================================
            // EMPTY
            // ====================================

            if (permissions.length === 0) {

                await context.reply(
                    `🔑 *DAFTAR PERMISSION*

Tidak ada permission pada tenant ini.

🏢 Tenant:
${context.tenantId}`
                );

                return;

            }


            // ====================================
            // FORMAT
            // ====================================

            const permissionText =
                permissions
                    .map(
                        (permission, index) =>
                            `${index + 1}. *${permission.name}*
   📝 ${permission.description || "-"}
   🆔 ${permission.id}`
                    )
                    .join("\n\n");


            // ====================================
            // RESPONSE
            // ====================================

            await context.reply(

                `🔑 *DAFTAR PERMISSION*

Total: ${permissions.length}

${permissionText}

🏢 Tenant:
${context.tenantId}`

            );


        } catch (error) {

            console.error(
                "❌ PermissionsCommand error:",
                error
            );


            await context.reply(
                "❌ Gagal mengambil daftar permission."
            );

        }

    }

}