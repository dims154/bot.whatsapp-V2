import { createHmac } from "crypto";

process.env.META_APP_SECRET = "test-meta-app-secret";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { MetaController } = require("../modules/core/meta/controllers/meta.controller");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { MetaParser } = require("../apps/bot/parser/MetaParser");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { dispatcher } = require("../apps/bot/bot.container");

const rawBody = Buffer.from(JSON.stringify({ entry: [] }));
const validSignature = `sha256=${createHmac("sha256", process.env.META_APP_SECRET)
    .update(rawBody)
    .digest("hex")}`;

function createRequest(signature?: string) {
    return {
        body: { entry: [] },
        rawBody,
        get: (name: string) =>
            name.toLowerCase() === "x-hub-signature-256"
                ? signature
                : undefined,
    };
}

function createResponse() {
    return {
        sendStatus: (status: number) => status,
    };
}

async function runTest(
    name: string,
    signature: string | undefined,
    expectedStatus: number,
    expectParserCall: boolean
): Promise<void> {
    let parserCalls = 0;
    let dispatcherCalls = 0;
    const originalParse = MetaParser.parse;
    const originalDispatch = dispatcher.dispatch;

    MetaParser.parse = async () => {
        parserCalls += 1;
        return null;
    };
    dispatcher.dispatch = async () => {
        dispatcherCalls += 1;
    };

    try {
        const status = await MetaController.receiveWebhook(
            createRequest(signature),
            createResponse()
        );

        const parserExpectation = expectParserCall ? parserCalls === 1 : parserCalls === 0;
        const passed = status === expectedStatus && parserExpectation && dispatcherCalls === 0;
        console.log(`${passed ? "PASS" : "FAIL"} ${name}`);

        if (!passed) {
            process.exitCode = 1;
        }
    } finally {
        MetaParser.parse = originalParse;
        dispatcher.dispatch = originalDispatch;
    }
}

(async () => {
    await runTest("valid signature accepted", validSignature, 200, true);
    await runTest("missing signature rejected", undefined, 403, false);
    await runTest("invalid signature rejected", "sha256=invalid", 403, false);
})();
