import { createGoogleGenerativeAI } from "@ai-sdk/google";

function buildModel() {
    const rawKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
    const rawModel = process.env.GEMINI_MODEL;

    const apiKey = rawKey?.trim();
    const modelName = rawModel?.trim();

    if (!apiKey) {
        throw new Error("Missing GEMINI_API_KEY or GOOGLE_API_KEY.");
    }

    if (!modelName) {
        throw new Error("Missing GEMINI_MODEL.");
    }

    return createGoogleGenerativeAI({ apiKey })(modelName);
}

let cached: ReturnType<typeof buildModel> | null = null;

export function getGeminiModel() {
    if (!cached) {
        cached = buildModel();
    }
    return cached;
}