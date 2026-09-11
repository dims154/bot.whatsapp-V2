import { ICommandContext } from "../commands/interfaces/ICommandContext";
import { messageProvider } from "../providers";
import { CommandContextData } from "./CommandContextData";

export class CommandContext implements ICommandContext {

    // =========================
    // MESSAGE
    // =========================

    sender: string;

    chatId: string;

    phoneNumberId: string;

    messageId: string;

    text: string;

    args: string[];

    isGroup: boolean;


    // =========================
    // ROLE FLAGS
    // =========================

    isAdmin: boolean;

    isOwner: boolean;


    // =========================
    // DATABASE IDENTITY
    // =========================

    userId?: string;

    tenantId?: string;


    // =========================
    // AUTHORIZATION
    // =========================

    roles: string[];

    permissions: string[];


    // =========================
    // CONSTRUCTOR
    // =========================

    constructor(
        data: CommandContextData
    ) {

        this.sender =
            data.sender;

        this.chatId =
            data.chatId;

        this.phoneNumberId =
            data.phoneNumberId ?? '';

        this.messageId =
            data.messageId;

        this.text =
            data.text;

        this.args =
            data.args;

        this.isGroup =
            data.isGroup;


        // =========================
        // ROLE FLAGS
        // =========================

        this.isAdmin =
            data.isAdmin;

        this.isOwner =
            data.isOwner;


        // =========================
        // DATABASE IDENTITY
        // =========================

        this.userId =
            data.userId;

        this.tenantId =
            data.tenantId;


        // =========================
        // AUTHORIZATION
        // =========================

        this.roles =
            data.roles ?? [];

        this.permissions =
            data.permissions ?? [];

    }


    // =========================
    // REPLY
    // =========================

    async reply(
        message: string
    ): Promise<void> {

        await messageProvider.sendMessage(
            this.chatId,
            message
        );

    }

}