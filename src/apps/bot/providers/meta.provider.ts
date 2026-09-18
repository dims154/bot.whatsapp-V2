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

   private getMessagesUrl(
    phoneNumberId?: string
): string {

    const resolvedPhoneNumberId =
        phoneNumberId ||
        config.whatsapp.phoneNumberId;

    return (
        `https://graph.facebook.com/v23.0/` +
        `${resolvedPhoneNumberId}` +
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
                "Meta Response: [redacted]"
            );

            console.error(
                "Request Method:",
                axiosError.config?.method
            );

            console.error(
                "Meta Graph API URL: [redacted]"
            );

            console.error(
                "Request Data: [redacted]"
            );

        } else {

            const sanitizedMessage =
                error instanceof Error
                    ? error.message
                    : typeof error === "string"
                        ? error
                        : "Unknown error";

            console.error(
                "Unknown Error:",
                sanitizedMessage
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
    message: string,
    phoneNumberId?: string
): Promise<void> {

    const url =
        this.getMessagesUrl(phoneNumberId);

    console.log(
        "📤 Meta sendMessage:",
        {
            to: "[redacted]",
            message: "[redacted]",
            phoneNumberId: "[redacted]"
        }
    );

    try {

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
            "✅ Meta sendMessage: success"
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
                to: "[redacted]",
                imageUrl: "[redacted]",
                caption: "[redacted]"
            }
        );

        try {

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
                "✅ Meta sendImage: success"
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
                to: "[redacted]",
                documentUrl: "[redacted]",
                filename: "[redacted]"
            }
        );

        try {

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
                "✅ Meta sendDocument: success"
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
        payload?: unknown
    ): Promise<void> {

        console.log(
            "========= META RECEIVE MESSAGE ========="
        );

        if (payload !== undefined) {
            console.log(
                "Inbound Meta payload: [redacted]"
            );
        }

        console.log(
            "========================================"
        );
    }
}