import { ICommand } from "./interfaces/ICommand";
import { ICommandContext } from "./interfaces/ICommandContext";

import { prismaService } from "../../../database/prisma.service";
import { userRepository } from "../../api/users/user.repository";

export class AssignRoleCommand implements ICommand {

    name = "assignrole";

    aliases = [
        "setrole"
    ];

    category = "user";

    permission = "user.assign_roles";

    cooldown = 3;

    description =
        "Memberikan role kepada pengguna";


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

        if (context.args.length < 2) {

            await context.reply(
                `📌 *CARA PENGGUNAAN*

/assignrole <whatsapp> <role>

Contoh:

/assignrole 6289529852918 Admin`
            );

            return;
        }


        // ====================================
        // DATA
        // ====================================

        const whatsappNumber =
            context.args[0]
                .replace(/\D/g, "");

        const roleName =
            context.args
                .slice(1)
                .join(" ")
                .trim();


        // ====================================
        // VALIDASI NOMOR
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


        // ====================================
        // VALIDASI ROLE
        // ====================================

        if (!roleName) {

            await context.reply(
                "❌ Nama role wajib diisi."
            );

            return;
        }


        try {

            // ====================================
            // CARI USER
            // TENANT AWARE
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
            // CARI ROLE
            // TENANT AWARE
            // ====================================

            const role =
                await prismaService.client.role.findFirst({

                    where: {

                        name:
                            roleName,

                        tenantId:
                            context.tenantId

                    },

                    include: {

                        permissions: true

                    }

                });


            if (!role) {

                await context.reply(
                    `❌ Role tidak ditemukan.

🔐 Role:
${roleName}`
                );

                return;
            }


            // ====================================
            // ASSIGN ROLE
            // ====================================

            const updatedUser =
                await userRepository.assignRoles(

                    user.id,

                    [role.id],

                    context.tenantId

                );


            if (!updatedUser) {

                await context.reply(
                    "❌ User tidak ditemukan atau bukan bagian dari tenant ini."
                );

                return;
            }


            // ====================================
            // PERMISSION ROLE
            // ====================================

            const permissions =
                role.permissions.map(
                    permission =>
                        permission.name
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

                `✅ *ROLE BERHASIL DIBERIKAN*

👤 Nama:
${fullName}

📧 Email:
${updatedUser.email}

📱 WhatsApp:
${updatedUser.whatsappNumber ?? "-"}

🔐 Role:
${role.name}

🔑 Permission dari role:
${permissions.length
    ? permissions.join(", ")
    : "-"}

🏢 Tenant:
${context.tenantId}`

            );


        } catch (error) {

            console.error(
                "❌ AssignRoleCommand error:",
                error
            );


            // ====================================
            // WRONG TENANT ROLE
            // ====================================

            if (

                error instanceof Error &&

                error.message ===
                    "ROLE_NOT_FOUND_OR_WRONG_TENANT"

            ) {

                await context.reply(
                    "❌ Role tidak ditemukan atau bukan bagian dari tenant ini."
                );

                return;
            }


            // ====================================
            // GENERAL ERROR
            // ====================================

            await context.reply(
                "❌ Gagal memberikan role."
            );

        }

    }

}