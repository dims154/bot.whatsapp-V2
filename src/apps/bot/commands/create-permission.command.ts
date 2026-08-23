import { ICommand } from "./interfaces/ICommand";
import { ICommandContext } from "./interfaces/ICommandContext";

import { permissionRepository } from "../../api/permissions/permission.repository";

export class CreatePermissionCommand implements ICommand {

    name = "createpermission";

    aliases = [
        "createperm"
    ];

    category = "permission";

    permission = "permission.create";

    cooldown = 3;

    description =
        "Membuat permission baru";

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

/createpermission <nama> [deskripsi]

Contoh:

/createpermission inventory.read Membaca data inventory`
            );

            return;
        }

        const permissionName =
            context.args[0]?.trim();

        const description =
            context.args
                .slice(1)
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
            // CHECK DUPLICATE
            // ====================================

            const existing =
                await permissionRepository.findAll(
                    context.tenantId
                );

            const duplicate =
                existing.find(
                    permission =>
                        permission.name === permissionName
                );

            if (duplicate) {

                await context.reply(
                    `❌ Permission *${permissionName}* sudah ada.

🏢 Tenant:
${context.tenantId}`
                );

                return;
            }

            // ====================================
            // CREATE
            // ====================================

            const permission =
                await permissionRepository.create({

                    tenantId:
                        context.tenantId,

                    name:
                        permissionName,

                    description:
                        description || undefined

                });

            // ====================================
            // SUCCESS
            // ====================================

            await context.reply(
                `✅ *PERMISSION BERHASIL DIBUAT*

🔐 Nama:
${permission.name}

🆔 ID:
${permission.id}

📝 Deskripsi:
${permission.description || "-"}

🏢 Tenant:
${permission.tenantId}`
            );

        } catch (error) {

            console.error(
                "❌ CreatePermissionCommand error:",
                error
            );

            await context.reply(
                "❌ Gagal membuat permission."
            );
        }
    }
}