import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

(async () => {

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!
});

const response = await ai.models.generateContent({
    model: "gemini-flash-latest",
    contents: "Halo"
});

console.log(response.text);

    try {

        const models = await ai.models.list();

        for await (const model of models) {
            console.log(model.name);
        }

    } catch (error) {

        console.error(error);

    }

})();
