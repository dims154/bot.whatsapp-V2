export interface ICommandContext {

    // =========================
    // MESSAGE
    // =========================

    sender: string;

    chatId: string;

    messageId: string;

    text: string;

    args: string[];

    isGroup: boolean;


    // =========================
    // LEGACY ROLE FLAGS
    // =========================

    isAdmin: boolean;

    isOwner: boolean;


    // =========================
    // DATABASE IDENTITY
    // =========================

    /**
     * ID user dari database.
     */
    userId?: string;

    /**
     * ID tenant tempat user terdaftar.
     */
    tenantId?: string;


    // =========================
    // DATABASE AUTHORIZATION
    // =========================

    /**
     * Role yang dimiliki user.
     */
    roles: string[];

    /**
     * Permission gabungan:
     * - direct permission
     * - permission dari role
     */
    permissions: string[];


    // =========================
    // RESPONSE
    // =========================

    reply(
        message: string
    ): Promise<void>;

}