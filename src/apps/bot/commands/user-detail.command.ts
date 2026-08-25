import { ICommand } from "./interfaces/ICommand";
import { ICommandContext } from "./interfaces/ICommandContext";
import { userRepository } from "../../api/users/user.repository";

export class UserDetailCommand implements ICommand {

    name = "user";

    aliases = ["userinfo"];

    category = "user";

    permission = "user.read" as const;

    cooldown = 3;

    description = "Menampilkan detail pengguna";


    async execute(
        context: ICommandContext
    ): Promise<void> {

        // =========================
        // VALIDASI TENANT
        // =========================

        if (!context.tenantId) {

            await context.reply(
                "❌ Tenant pengguna tidak ditemukan."
            );

            return;
        }


        // =========================
        // VALIDASI ARGUMENT
        // =========================

        if (!context.args.length) {

            await context.reply(
                `📌 *CARA PENGGUNAAN*

/user <nomor WhatsApp>

Contoh:

/user 6289529852918`
            );

            return;
        }


        // =========================
        // NORMALISASI NOMOR
        // =========================

        let whatsappNumber =
            context.args[0]
                .replace(/\D/g, "");


        // =========================
        // NORMALISASI 08 → 628
        // =========================

        if (
            whatsappNumber.startsWith("08")
        ) {

            whatsappNumber =
                "62" +
                whatsappNumber.substring(1);

        }


        try {

            // =========================
            // CARI USER
            // =========================

            const user =
                await userRepository.findByWhatsApp(
                    whatsappNumber,
                    context.tenantId
                );


            // =========================
            // USER TIDAK DITEMUKAN
            // =========================

            if (!user) {

                await context.reply(
                    `❌ User dengan nomor:

📱 ${whatsappNumber}

tidak ditemukan pada tenant ini.`
                );

                return;
            }


            // =========================
            // ROLE
            // =========================

            const roles =
                user.roles.length
                    ? user.roles
                        .map(
                            role =>
                                role.name
                        )
                        .join(", ")
                    : "-";


            // =========================
            // PERMISSION
            // =========================

            const directPermissions =
                user.permissions
                    .map(
                        permission =>
                            permission.name
                    );


            const rolePermissions =
                user.roles.flatMap(
                    role =>
                        role.permissions.map(
                            permission =>
                                permission.name
                        )
                );


            const permissions =
                [
                    ...new Set([
                        ...directPermissions,
                        ...rolePermissions
                    ])
                ];


            // =========================
            // NAMA
            // =========================

            const fullName =
                [
                    user.firstName,
                    user.lastName
                ]
                    .filter(Boolean)
                    .join(" ") ||
                "-";


            // =========================
            // RESPONSE
            // =========================

            await context.reply(

                `👤 *DETAIL USER*\n\n` +

                `🆔 ID: ${user.id}\n` +

                `👤 Nama: ${fullName}\n` +

                `📧 Email: ${user.email}\n` +

                `📱 WhatsApp: ${
                    user.whatsappNumber ?? "-"
                }\n` +

                `🏢 Tenant: ${user.tenantId}\n` +

                `🔐 Role: ${roles}\n` +

                `🔑 Permission: ${
                    permissions.length
                        ? permissions.join(", ")
                        : "-"
                }\n` +

                `📊 Status: ${
                    user.active
                        ? "🟢 Aktif"
                        : "🔴 Nonaktif"
                }`

            );

        } catch (error) {

            console.error(
                "❌ UserDetailCommand error:",
                error
            );

            await context.reply(
                "❌ Gagal mengambil detail user."
            );

        }

    }

}
