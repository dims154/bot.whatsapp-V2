import { ICommand } from "./interfaces/ICommand";
import { ICommandContext } from "./interfaces/ICommandContext";

import { permissionRepository } from "../../api/permissions/permission.repository";

export class DeletePermissionCommand implements ICommand {

    name = "deletepermission";

    aliases = [
        "deleteperm"
    ];

    category = "permission";

    permission = "permission.delete";

    cooldown = 3;

    description =
        "Menghapus permission";

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

/deletepermission <nama permission>

Contoh:

/deletepermission inventory.read`
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
            // DELETE
            // ====================================

            const deleted =
                await permissionRepository.delete(
                    permission.id,
                    context.tenantId
                );

            if (!deleted) {

                await context.reply(
                    `❌ Permission *${permissionName}* gagal dihapus.

🏢 Tenant:
${context.tenantId}`
                );

                return;
            }

            // ====================================
            // SUCCESS
            // ====================================

            await context.reply(
                `✅ *PERMISSION BERHASIL DIHAPUS*

🔐 Nama:
${deleted.name}

🆔 ID:
${deleted.id}

🏢 Tenant:
${deleted.tenantId}`
            );

        } catch (error) {

            console.error(
                "❌ DeletePermissionCommand error:",
                error
            );

            await context.reply(
                "❌ Gagal menghapus permission."
            );
        }
    }
}