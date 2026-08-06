import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

(async () => {

    const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY!
    });

    try {

        const response = await ai.models.generateContent({

            // Ganti model satu per satu
            model: "gemini-flash-latest",

            contents: "Perkenalkan dirimu dalam satu kalimat."

        });

        console.log(response.text);

    } catch (error) {

        console.error(error);

    }

})();