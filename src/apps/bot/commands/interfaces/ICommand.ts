import { ICommandContext } from "./ICommandContext";

export interface ICommand {

    /**
     * Nama command
     * Contoh:
     * menu
     * ping
     * ai
     */
    name: string;

    /**
     * Alias command
     * Contoh:
     * ["m","start"]
     */
    aliases: string[];

    /**
     * Deskripsi command
     */
    description: string;

    /**
     * Kategori command
     * General
     * AI
     * Admin
     */
    category: string;

    /**
     * Permission
     * everyone
     * admin
     * owner
     */
    permission: string;

    /**
     * Cooldown dalam detik
     */
    cooldown: number;

    /**
     * Function utama command
     */
    execute(context: ICommandContext): Promise<void>;

}