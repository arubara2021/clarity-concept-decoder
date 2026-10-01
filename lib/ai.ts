import { createGoogleGenerativeAI } from "@ai-sdk/google";

export function getGeminiModel() {
    const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
    const model = process.env.GEMINI_MODEL;

    if (!apiKey) {
        throw new Error("Missing GEMINI_API_KEY or GOOGLE_API_KEY.");
    }

    if (!model) {
        throw new Error("Missing GEMINI_MODEL.");
    }

    return createGoogleGenerativeAI({ apiKey })(model);
}
