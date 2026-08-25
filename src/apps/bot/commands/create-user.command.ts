import bcrypt from "bcrypt";

import { ICommand } from "./interfaces/ICommand";
import { ICommandContext } from "./interfaces/ICommandContext";

import { userRepository } from "../../api/users/user.repository";

export class CreateUserCommand implements ICommand {

    name = "createuser";

    aliases = ["adduser"];

    category = "user";

    permission = "user.create" as const;

    cooldown = 5;

    description = "Membuat pengguna baru";


    async execute(
        context: ICommandContext
    ): Promise<void> {

        // ====================================
        // VALIDASI TENANT
        // ====================================

        if (!context.tenantId) {

            await context.reply(
                "❌ Tenant pengguna tidak ditemukan."
            );

            return;
        }


        // ====================================
        // VALIDASI ARGUMENT
        // ====================================

        if (context.args.length < 4) {

            await context.reply(
                `📌 *CARA PENGGUNAAN*

/createuser <email> <password> <nama> <whatsapp>

Contoh:

/createuser staff@erp.local Staff123 Budi 628123456789`
            );

            return;
        }


        // ====================================
        // AMBIL ARGUMENT
        // ====================================

        const email =
            context.args[0]
                .trim()
                .toLowerCase();

        const password =
            context.args[1];

        const whatsappNumber =
            context.args[
                context.args.length - 1
            ]
                .replace(/\D/g, "");

        const nameParts =
            context.args.slice(
                2,
                context.args.length - 1
            );


        const firstName =
            nameParts[0] ?? "";


        const lastName =
            nameParts
                .slice(1)
                .join(" ") || undefined;


        // ====================================
        // VALIDASI EMAIL
        // ====================================

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {

            await context.reply(
                "❌ Format email tidak valid."
            );

            return;
        }


        // ====================================
        // VALIDASI PASSWORD
        // ====================================

        if (password.length < 8) {

            await context.reply(
                "❌ Password minimal 8 karakter."
            );

            return;
        }


        // ====================================
        // VALIDASI NAMA
        // ====================================

        if (!firstName) {

            await context.reply(
                "❌ Nama pengguna wajib diisi."
            );

            return;
        }


        // ====================================
        // VALIDASI WHATSAPP
        // ====================================

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
            // CEK EMAIL
            // ====================================

            const existingEmail =
                await userRepository.findByEmail(
                    email,
                    context.tenantId
                );


            if (existingEmail) {

                await context.reply(
                    `❌ Email sudah digunakan:

📧 ${email}`
                );

                return;
            }


            // ====================================
            // CEK WHATSAPP
            // ====================================

            const existingWhatsApp =
                await userRepository.findByWhatsAppAnyStatus(
                    whatsappNumber,
                    context.tenantId
                );


            if (existingWhatsApp) {

                await context.reply(
                    `❌ Nomor WhatsApp sudah terdaftar:

📱 ${whatsappNumber}`
                );

                return;
            }


            // ====================================
            // HASH PASSWORD
            // ====================================

            const hashedPassword =
                await bcrypt.hash(
                    password,
                    12
                );


            // ====================================
            // CREATE USER
            // ====================================

            const user =
                await userRepository.create({

                    email,

                    password:
                        hashedPassword,

                    tenantId:
                        context.tenantId,

                    firstName,

                    lastName,

                    whatsappNumber,

                    roleIds: [],

                    permissionIds: []

                });


            // ====================================
            // SUCCESS RESPONSE
            // ====================================

            const fullName =
                [
                    user.firstName,
                    user.lastName
                ]
                    .filter(Boolean)
                    .join(" ") || "-";


            await context.reply(

                `✅ *USER BERHASIL DIBUAT*

👤 Nama:
${fullName}

📧 Email:
${user.email}

📱 WhatsApp:
${user.whatsappNumber ?? "-"}

🏢 Tenant:
${user.tenantId}

🔐 Role:
-

🔑 Permission:
-

📊 Status:
${user.active ? "🟢 Aktif" : "🔴 Nonaktif"}`

            );


        } catch (error) {

            console.error(
                "❌ CreateUserCommand error:",
                error
            );


            await context.reply(
                "❌ Gagal membuat user."
            );

        }

    }

}
