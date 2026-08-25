import { ICommand } from "./interfaces/ICommand";
import { ICommandContext } from "./interfaces/ICommandContext";

import { permissionRepository } from "../../api/permissions/permission.repository";


export class PermissionCommand implements ICommand {

    name = "permission";

    aliases = [
        "perm"
    ];

    category = "permission";

    permission = "permission.read" as const;

    cooldown = 3;

    description =
        "Menampilkan detail permission";


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
            context.args.length === 0
        ) {

            await context.reply(
                `❌ Format command salah.

Gunakan:

/permission <nama permission>

Contoh:

/permission user.read`
            );

            return;

        }


        const permissionName =
            context.args
                .join(" ")
                .trim();


        if (!permissionName) {

            await context.reply(
                "❌ Nama permission tidak boleh kosong."
            );

            return;

        }


        try {

            // ====================================
            // FIND PERMISSION
            // ====================================

            const permissions =
                await permissionRepository.findAll(
                    context.tenantId
                );


            const permission =
                permissions.find(
                    item =>
                        item.name === permissionName
                );


            // ====================================
            // NOT FOUND
            // ====================================

            if (!permission) {

                await context.reply(
                    `❌ Permission *${permissionName}* tidak ditemukan.

🏢 Tenant:
${context.tenantId}`
                );

                return;

            }


            // ====================================
            // RESPONSE
            // ====================================

            await context.reply(

                `🔑 *DETAIL PERMISSION*

🆔 ID:
${permission.id}

🔐 Nama:
${permission.name}

📝 Deskripsi:
${permission.description || "-"}

🏢 Tenant:
${permission.tenantId}`

            );


        } catch (error) {

            console.error(
                "❌ PermissionCommand error:",
                error
            );


            await context.reply(
                "❌ Gagal mengambil detail permission."
            );

        }

    }

}
