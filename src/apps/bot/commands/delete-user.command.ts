import { ICommand } from "./interfaces/ICommand";
import { ICommandContext } from "./interfaces/ICommandContext";

import { userRepository } from "../../api/users/user.repository";

export class DeleteUserCommand implements ICommand {

    name = "deleteuser";

    aliases = [
        "deluser",
        "delete"
    ];

    category = "user";

    permission = "user.delete";

    cooldown = 3;

    description =
        "Menghapus pengguna";


    async execute(
        context: ICommandContext
    ): Promise<void> {

        // ====================================
        // TENANT
        // ====================================

        if (!context.tenantId) {

            await context.reply(
                "❌ Tenant tidak ditemukan."
            );

            return;
        }


        // ====================================
        // ARGUMENT
        // ====================================

        if (context.args.length < 1) {

            await context.reply(
                `📌 *CARA PENGGUNAAN*

/deleteuser <whatsapp>

Contoh:

/deleteuser 6289529852918`
            );

            return;
        }


        // ====================================
        // NOMOR WHATSAPP
        // ====================================

        const whatsappNumber =
            context.args[0]
                .replace(/\D/g, "");


        if (
            whatsappNumber.length < 10 ||
            whatsappNumber.length > 15
        ) {

            await context.reply(
                "❌ Nomor WhatsApp tidak valid."
            );

            return;
        }


        try {

            // ====================================
            // CARI USER
            // ALL STATUS
            // ====================================

            const user =
                await userRepository.findByWhatsAppAnyStatus(
                    whatsappNumber,
                    context.tenantId
                );


            if (!user) {

                await context.reply(
                    `❌ User tidak ditemukan.

📱 WhatsApp:
${whatsappNumber}`
                );

                return;
            }


            // ====================================
            // JANGAN HAPUS DIRI SENDIRI
            // ====================================

            if (
                context.userId &&
                user.id === context.userId
            ) {

                await context.reply(
                    "❌ Kamu tidak dapat menghapus akunmu sendiri."
                );

                return;
            }


            // ====================================
            // NAMA USER
            // ====================================

            const fullName =
                [
                    user.firstName,
                    user.lastName
                ]
                    .filter(Boolean)
                    .join(" ") || "-";


            // ====================================
            // DELETE
            // ====================================

            await userRepository.delete(
                user.id
            );


            // ====================================
            // SUCCESS
            // ====================================

            await context.reply(

                `✅ *USER BERHASIL DIHAPUS*

👤 Nama:
${fullName}

📧 Email:
${user.email}

📱 WhatsApp:
${user.whatsappNumber ?? "-"}

🏢 Tenant:
${context.tenantId}

🗑️ Status:
Data user telah dihapus dari database.`

            );


        } catch (error) {

            console.error(
                "❌ DeleteUserCommand error:",
                error
            );


            await context.reply(
                "❌ Gagal menghapus user. Periksa relasi data user."
            );

        }

    }

}