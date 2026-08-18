import { createHmac } from "crypto";
import axios, { AxiosError } from "axios";
import { config } from "../../../config/environment";
import { IWhatsAppProvider } from "./IWhatsAppProvider";

export class MetaProvider implements IWhatsAppProvider {

    // ==========================================
    // AXIOS CONFIG
    // ==========================================

    private buildAxiosConfig() {

        const params: Record<string, string> = {
            access_token:
                config.whatsapp.accessToken,
        };

        // App Secret Proof
        if (
            config.whatsapp.appSecret &&
            config.whatsapp.accessToken
        ) {

            params.appsecret_proof =
                createHmac(
                    "sha256",
                    config.whatsapp.appSecret
                )
                    .update(
                        config.whatsapp.accessToken
                    )
                    .digest("hex");
        }

        return {
            params,

            headers: {
                Authorization:
                    `Bearer ${config.whatsapp.accessToken}`,

                "Content-Type":
                    "application/json",
            },
        };
    }

    // ==========================================
    // GRAPH API URL
    // ==========================================

    private getMessagesUrl(): string {

        return (
            `https://graph.facebook.com/v23.0/` +
            `${config.whatsapp.phoneNumberId}` +
            `/messages`
        );
    }

    // ==========================================
    // ERROR LOGGER
    // ==========================================

    private logMetaError(
        error: unknown
    ): void {

        console.error(
            "========================================"
        );

        console.error(
            "❌ META WHATSAPP API ERROR"
        );

        console.error(
            "========================================"
        );

        if (
            axios.isAxiosError(error)
        ) {

            const axiosError =
                error as AxiosError;

            console.error(
                "HTTP Status:",
                axiosError.response?.status
            );

            console.error(
                "HTTP Status Text:",
                axiosError.response?.statusText
            );

            console.error(
                "Meta Response:"
            );

            console.error(
                JSON.stringify(
                    axiosError.response?.data,
                    null,
                    2
                )
            );

            console.error(
                "Request Method:",
                axiosError.config?.method
            );

            console.error(
                "Request URL:",
                axiosError.config?.url
            );

            console.error(
                "Request Data:"
            );

            console.error(
                axiosError.config?.data
            );

        } else {

            console.error(
                "Unknown Error:",
                error
            );
        }

        console.error(
            "========================================"
        );
    }

    // ==========================================
    // SEND TEXT MESSAGE
    // ==========================================

    async sendMessage(
        to: string,
        message: string
    ): Promise<void> {

        const url =
            this.getMessagesUrl();

        console.log(
            "📤 Meta sendMessage:",
            {
                to,
                message,
                phoneNumberId:
                    config.whatsapp.phoneNumberId
            }
        );

        try {

            const response =
                await axios.post(
                    url,

                    {
                        messaging_product:
                            "whatsapp",

                        to,

                        type:
                            "text",

                        text: {
                            body: message
                        }
                    },

                    this.buildAxiosConfig()
                );

            console.log(
                "✅ Meta sendMessage:",
                response.data
            );

        } catch (error) {

            this.logMetaError(
                error
            );

            throw error;
        }
    }

    // ==========================================
    // SEND IMAGE
    // ==========================================

    async sendImage(
        to: string,
        imageUrl: string,
        caption?: string
    ): Promise<void> {

        const url =
            this.getMessagesUrl();

        console.log(
            "📤 Meta sendImage:",
            {
                to,
                imageUrl,
                caption
            }
        );

        try {

            const response =
                await axios.post(
                    url,

                    {
                        messaging_product:
                            "whatsapp",

                        to,

                        type:
                            "image",

                        image: {

                            link:
                                imageUrl,

                            ...(caption
                                ? {
                                    caption
                                }
                                : {})
                        }
                    },

                    this.buildAxiosConfig()
                );

            console.log(
                "✅ Meta sendImage:",
                response.data
            );

        } catch (error) {

            this.logMetaError(
                error
            );

            throw error;
        }
    }

    // ==========================================
    // SEND DOCUMENT
    // ==========================================

    async sendDocument(
        to: string,
        documentUrl: string,
        filename?: string
    ): Promise<void> {

        const url =
            this.getMessagesUrl();

        console.log(
            "📤 Meta sendDocument:",
            {
                to,
                documentUrl,
                filename
            }
        );

        try {

            const response =
                await axios.post(
                    url,

                    {
                        messaging_product:
                            "whatsapp",

                        to,

                        type:
                            "document",

                        document: {

                            link:
                                documentUrl,

                            ...(filename
                                ? {
                                    filename
                                }
                                : {})
                        }
                    },

                    this.buildAxiosConfig()
                );

            console.log(
                "✅ Meta sendDocument:",
                response.data
            );

        } catch (error) {

            this.logMetaError(
                error
            );

            throw error;
        }
    }

    // ==========================================
    // RECEIVE MESSAGE
    // ==========================================

    async receiveMessage(
        payload: unknown
    ): Promise<void> {

        console.log(
            "========= META RECEIVE MESSAGE ========="
        );

        console.log(
            JSON.stringify(
                payload,
                null,
                2
            )
        );

        console.log(
            "========================================"
        );
    }
}