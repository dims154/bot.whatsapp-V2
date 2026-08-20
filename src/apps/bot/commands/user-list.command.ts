import { ICommand } from "./interfaces/ICommand";
import { ICommandContext } from "./interfaces/ICommandContext";
import { userRepository } from "../../api/users/user.repository";

export class UserListCommand implements ICommand {

    name = "users";

    aliases = ["userlist"];

    category = "user";

    permission = "user.read";

    cooldown = 3;

    description = "Menampilkan daftar pengguna";


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


        try {

            // =========================
            // AMBIL USER SESUAI TENANT
            // =========================

            const users =
                await userRepository.findAll(
                    context.tenantId
                );


            // =========================
            // TIDAK ADA USER
            // =========================

            if (!users.length) {

                await context.reply(
                    "📭 Belum ada pengguna."
                );

                return;
            }


            // =========================
            // FORMAT RESPONSE
            // =========================

            const lines =
                users.map(
                    (user, index) => {

                        const fullName =
                            [
                                user.firstName,
                                user.lastName
                            ]
                                .filter(Boolean)
                                .join(" ") ||
                            "-";

                        const roles =
                            user.roles.length
                                ? user.roles
                                    .map(
                                        role =>
                                            role.name
                                    )
                                    .join(", ")
                                : "-";

                        return (
                            `${index + 1}. ${fullName}\n` +
                            `   📧 ${user.email}\n` +
                            `   📱 ${user.whatsappNumber ?? "-"}\n` +
                            `   🔐 ${roles}\n` +
                            `   ${user.active ? "🟢 Aktif" : "🔴 Nonaktif"}`
                        );

                    }
                );


            // =========================
            // RESPONSE
            // =========================

            await context.reply(
                `👥 *DAFTAR PENGGUNA*\n\n` +
                `Total: ${users.length}\n\n` +
                lines.join("\n\n")
            );

        } catch (error) {

            console.error(
                "❌ UserListCommand error:",
                error
            );

            await context.reply(
                "❌ Gagal mengambil daftar pengguna."
            );

        }

    }

}