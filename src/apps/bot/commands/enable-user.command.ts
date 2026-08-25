import { ICommand } from "./interfaces/ICommand";
import { ICommandContext } from "./interfaces/ICommandContext";

import { userRepository } from "../../api/users/user.repository";

export class EnableUserCommand implements ICommand {

    name = "enableuser";

    aliases = [
        "enable"
    ];

    category = "user";

    permission = "user.update" as const;

    cooldown = 3;

    description =
        "Mengaktifkan kembali pengguna";


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

/enableuser <whatsapp>

Contoh:

/enableuser 6289529852918`
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
            // CEK STATUS
            // ====================================

            if (user.active) {

                await context.reply(
                    `⚠️ User sudah aktif.

👤 Nama:
${[
    user.firstName,
    user.lastName
]
    .filter(Boolean)
    .join(" ") || "-"}

📱 WhatsApp:
${user.whatsappNumber ?? "-"}

📊 Status:
🟢 Aktif`
                );

                return;
            }


            // ====================================
            // ENABLE USER
            // ====================================

            const updatedUser =
                await userRepository.update(

                    user.id,

                    {
                        active: true
                    }

                );


            // ====================================
            // NAMA USER
            // ====================================

            const fullName =
                [
                    updatedUser.firstName,
                    updatedUser.lastName
                ]
                    .filter(Boolean)
                    .join(" ") || "-";


            // ====================================
            // SUCCESS
            // ====================================

            await context.reply(

                `✅ *USER BERHASIL DIAKTIFKAN*

👤 Nama:
${fullName}

📧 Email:
${updatedUser.email}

📱 WhatsApp:
${updatedUser.whatsappNumber ?? "-"}

📊 Status:
🟢 Aktif

🏢 Tenant:
${context.tenantId}`

            );


        } catch (error) {

            console.error(
                "❌ EnableUserCommand error:",
                error
            );


            await context.reply(
                "❌ Gagal mengaktifkan user."
            );

        }

    }

}
