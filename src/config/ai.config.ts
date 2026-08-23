import "./environment";

export const aiConfig = {

    provider:
        process.env.AI_PROVIDER ??
        "gemini",

    model:
        process.env.AI_MODEL ??
        "gemini-flash-latest",

    plannerModel:
        process.env.AI_PLANNER_MODEL ??
        process.env.AI_MODEL ??
        "gemini-flash-latest",

    geminiKey:
        process.env.GEMINI_API_KEY ??
        "",

    openaiKey:
        process.env.OPENAI_API_KEY ??
        "",

       claudeKey:
        process.env.CLAUDE_API_KEY ??
        "",

    deepseekKey:
        process.env.DEEPSEEK_API_KEY ??
        ""

};