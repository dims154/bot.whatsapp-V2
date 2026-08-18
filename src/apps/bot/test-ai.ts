import { aiPipeline } from "./ai/pipeline/pipeline.container";

async function testAI() {

    console.log("🤖 TEST AI DIMULAI");

    try {

        const result =
            await aiPipeline.run({

                chatId:
                    "TEST_AI_USER",

                prompt:
                    "Halo, siapa kamu? Jelaskan secara singkat.",

                history:
                    "",

                persona:
                    "",

                messages:
                    []
            }) as any;

        console.log(
            "================================"
        );

        console.log(
            "🤖 AI RESPONSE:"
        );

        console.log(
            result.response
        );

        console.log(
            "🤖 AI PROVIDER:"
        );

        console.log(
            result.provider
        );

        console.log(
            "================================"
        );

    } catch (error) {

        console.error(
            "❌ AI TEST ERROR:"
        );

        console.error(
            error
        );
    }
}

testAI();