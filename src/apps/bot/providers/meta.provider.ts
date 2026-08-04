import axios from "axios";
import { config } from "../../../config/environment";

export class MetaProvider {

    static async sendMessage(

        to: string,

        message: string

    ) {

        const url =
            `https://graph.facebook.com/v23.0/${config.whatsapp.phoneNumberId}/messages`;

        try {

            const response = await axios.post(

                url,

                {

                    messaging_product: "whatsapp",

                    to,

                    type: "text",

                    text: {

                        body: message

                    }

                },

                {

                    headers: {

                        Authorization:
                            `Bearer ${config.whatsapp.accessToken}`,

                        "Content-Type":
                            "application/json"

                    }

                }

            );

            return response.data;

        }

        catch (err: any) {

            console.error(

                err.response?.data ??

                err.message

            );

        }

    }

}