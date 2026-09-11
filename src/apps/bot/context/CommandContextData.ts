export interface CommandContextData {

    // =========================
    // MESSAGE
    // =========================

    sender: string;

    chatId: string;

    /**
     * ID nomor WhatsApp dari Meta Cloud API.
     */
    phoneNumberId?: string;

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
     *
     * Contoh:
     * ["Owner"]
     */
    roles?: string[];

    /**
     * Permission gabungan:
     *
     * - direct permission
     * - permission dari role
     *
     * Contoh:
     * [
     *   "user.create",
     *   "user.read",
     *   "user.update"
     * ]
     */
    permissions?: string[];

}