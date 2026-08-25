import { ICommand } from "./interfaces/ICommand";
import { ICommandContext } from "./interfaces/ICommandContext";

import { roleRepository } from "../../api/roles/role.repository";


export class RoleCommand implements ICommand {

    name = "role";

    aliases = [
        "roledetail"
    ];

    category = "role";

    permission = "role.read" as const;

    cooldown = 3;

    description =
        "Menampilkan detail role";


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

/role <nama role>

Contoh:

/role Owner`
            );

            return;

        }


        // ====================================
        // ROLE NAME
        // ====================================

        const roleName =
            context.args
                .join(" ")
                .trim();


        if (!roleName) {

            await context.reply(
                "❌ Nama role tidak boleh kosong."
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


            // ====================================
            // ROLE NOT FOUND
            // ====================================

            if (!role) {

                await context.reply(
                    `❌ Role *${roleName}* tidak ditemukan.

🏢 Tenant:
${context.tenantId}`
                );

                return;

            }


            // ====================================
            // FORMAT PERMISSION
            // ====================================

            const permissionText =
                role.permissions.length > 0

                    ? role.permissions
                        .map(
                            (permission: { name: string }) =>
                                `• ${permission.name}`
                        )
                        .join("\n")

                    : "Tidak ada permission";


            // ====================================
            // RESPONSE
            // ====================================

            const message =
                `🔐 *DETAIL ROLE*

` +
                `🆔 ID:
${role.id}

` +
                `🔐 Nama:
${role.name}

` +
                `📝 Deskripsi:
${role.description || "-"}

` +
                `🔑 Permission:
${permissionText}

` +
                `🏢 Tenant:
${context.tenantId}`;


            // ====================================
            // REPLY
            // ====================================

            await context.reply(
                message
            );


        } catch (error) {

            console.error(
                "❌ RoleCommand error:",
                error
            );


            await context.reply(
                "❌ Gagal mengambil detail role."
            );

        }

    }

}
