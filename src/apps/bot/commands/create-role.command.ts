import { ICommand } from "./interfaces/ICommand";
import { ICommandContext } from "./interfaces/ICommandContext";

import { roleRepository } from "../../api/roles/role.repository";


export class CreateRoleCommand implements ICommand {

    name = "createrole";

    aliases = [
        "addrole"
    ];

    category = "role";

    permission = "role.create" as const;

    cooldown = 3;

    description =
        "Membuat role baru";


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

/createrole <nama role>

Contoh:

/createrole Manager`
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


        // ====================================
        // VALIDASI PANJANG
        // ====================================

        if (roleName.length < 2) {

            await context.reply(
                "❌ Nama role minimal 2 karakter."
            );

            return;

        }


        if (roleName.length > 50) {

            await context.reply(
                "❌ Nama role maksimal 50 karakter."
            );

            return;

        }


        try {

            // ====================================
            // CEK DUPLIKAT
            // ====================================

            const existingRole =
                await roleRepository.findByName(
                    roleName,
                    context.tenantId
                );


            if (existingRole) {

                await context.reply(
                    `❌ Role *${roleName}* sudah ada.

🏢 Tenant:
${context.tenantId}`
                );

                return;

            }


            // ====================================
            // CREATE ROLE
            // ====================================

            const role =
                await roleRepository.create({

                    tenantId:
                        context.tenantId,

                    name:
                        roleName

                });


            // ====================================
            // SUCCESS
            // ====================================

            await context.reply(
                `✅ *ROLE BERHASIL DIBUAT*

🔐 Nama:
${role.name}

🆔 ID:
${role.id}

🔑 Permission:
0

🏢 Tenant:
${context.tenantId}`
            );


        } catch (error) {

            console.error(
                "❌ CreateRoleCommand error:",
                error
            );


            await context.reply(
                "❌ Gagal membuat role."
            );

        }

    }

}
