import { ICommand } from "./interfaces/ICommand";
import { ICommandContext } from "./interfaces/ICommandContext";

import { prismaService } from "../../../database/prisma.service";
import { userRepository } from "../../api/users/user.repository";

export class AssignPermissionCommand implements ICommand {

    name = "assignpermission";

    aliases = [
        "setpermission",
        "assignperm"
    ];

    category = "user";

    permission = "user.assign_permissions";

    cooldown = 3;

    description =
        "Memberikan permission kepada pengguna";


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

/assignpermission <whatsapp> <permission>

Contoh:

/assignpermission 6289529852918 user.create`
            );

            return;
        }


        // ====================================
        // DATA
        // ====================================

        const whatsappNumber =
            context.args[0]
                .replace(/\D/g, "");

        const permissionName =
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
        // VALIDASI PERMISSION
        // ====================================

        if (!permissionName) {

            await context.reply(
                "❌ Nama permission wajib diisi."
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
            // CARI PERMISSION
            // TENANT AWARE
            // ====================================

            const permission =
                await prismaService.client.permission.findFirst({

                    where: {

                        name:
                            permissionName,

                        tenantId:
                            context.tenantId

                    }

                });


            if (!permission) {

                await context.reply(
                    `❌ Permission tidak ditemukan.

🔑 Permission:
${permissionName}`
                );

                return;
            }


            // ====================================
            // ASSIGN PERMISSION
            // ====================================

            const updatedUser =
                await userRepository.assignPermissions(

                    user.id,

                    [permission.id],

                    context.tenantId

                );


            if (!updatedUser) {

                await context.reply(
                    "❌ User tidak ditemukan atau bukan bagian dari tenant ini."
                );

                return;
            }


            // ====================================
            // AMBIL PERMISSION TERBARU
            // ====================================

            const directPermissions =
                updatedUser.permissions.map(

                    item =>
                        item.name

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

                `✅ *PERMISSION BERHASIL DIBERIKAN*

👤 Nama:
${fullName}

📧 Email:
${updatedUser.email}

📱 WhatsApp:
${updatedUser.whatsappNumber ?? "-"}

🔑 Permission:
${permission.name}

📋 Direct Permission:
${directPermissions.length
    ? directPermissions.join(", ")
    : "-"}

🏢 Tenant:
${context.tenantId}`

            );


        } catch (error) {

            console.error(
                "❌ AssignPermissionCommand error:",
                error
            );


            // ====================================
            // WRONG TENANT
            // ====================================

            if (

                error instanceof Error &&

                error.message ===
                    "PERMISSION_NOT_FOUND_OR_WRONG_TENANT"

            ) {

                await context.reply(
                    "❌ Permission tidak ditemukan atau bukan bagian dari tenant ini."
                );

                return;
            }


            // ====================================
            // GENERAL ERROR
            // ====================================

            await context.reply(
                "❌ Gagal memberikan permission."
            );

        }

    }

}