import { ICommand } from "./interfaces/ICommand";
import { ICommandContext } from "./interfaces/ICommandContext";

import { roleRepository } from "../../api/roles/role.repository";

export class RolesCommand implements ICommand {

    name = "roles";

    aliases = [
        "listrole",
        "rolelist"
    ];

    category = "role";

    permission = "role.read";

    cooldown = 3;

    description =
        "Menampilkan daftar role";


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


        try {

            // ====================================
            // GET ROLES
            // ====================================

            const roles =
                await roleRepository.findAll(
                    context.tenantId
                );


            // ====================================
            // EMPTY
            // ====================================

            if (roles.length === 0) {

                await context.reply(
                    `🔐 *DAFTAR ROLE*

Belum ada role pada tenant ini.

🏢 Tenant:
${context.tenantId}`
                );

                return;
            }


            // ====================================
            // FORMAT
            // ====================================

            let message =
                `🔐 *DAFTAR ROLE*\n\n`;

            message +=
                `Total: ${roles.length}\n`;


            roles.forEach(
                (role, index) => {

                    message +=
                        `\n${index + 1}. *${role.name}*\n`;


                    if (role.description) {

                        message +=
                            `   📝 ${role.description}\n`;

                    }


                    message +=
                        `   🔑 Permission: ${role.permissions.length}\n`;

                }
            );


            message +=
                `\n🏢 Tenant:\n${context.tenantId}`;


            // ====================================
            // REPLY
            // ====================================

            await context.reply(
                message
            );


        } catch (error) {

            console.error(
                "❌ RolesCommand error:",
                error
            );


            await context.reply(
                "❌ Gagal mengambil daftar role."
            );

        }

    }

}