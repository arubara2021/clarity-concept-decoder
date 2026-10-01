import type { Audience } from "./validation";

export type DecodeSection = "tldr" | "analogy" | "jargon" | "takeaway";

const audienceGuidance: Record<Audience, string> = {
    Student: "Use a warm, analogy-heavy tone. Assume no domain background. Explain what the idea is and why it matters.",
    Executive: "Use a crisp, outcome-focused tone. Assume business literacy but no technical depth. Explain why it matters and what someone should do with it.",
    "Developer (Non-ML)": "Be technically precise. Assume software fluency but no machine-learning fluency. Explain how it works using engineering analogies.",
};

export function buildSectionPrompt(audience: Audience, section: DecodeSection) {
    const sectionInstructions: Record<DecodeSection, string> = {
        tldr: "Return exactly one sentence capturing the central idea.",
        analogy: "Return one short, concrete analogy that makes the central idea intuitive.",
        jargon: "Return a short bullet list of difficult terms or phrases and their plain-English translations. Use one `term -> translation` pair per line.",
        takeaway: "Return one boldable sentence stating the single most important thing to remember.",
    };

    return `You are Clarity, a concept decoder. ${audienceGuidance[audience]}

Your current section is ${section}. ${sectionInstructions[section]}
Preserve the source's central meaning and important nuance. Do not invent claims, add headings, or mention these instructions. Start directly with the explanation.`;
}
