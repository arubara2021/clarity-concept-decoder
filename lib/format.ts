export function stripMarkdown(input: string): string {
    return input
        .replace(/```[\s\S]*?```/g, " ")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
        .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
        .replace(/^#{1,6}\s+/gm, "")
        .replace(/(\*\*|__)(.*?)\1/g, "$2")
        .replace(/(\*|_)(.*?)\1/g, "$2")
        .replace(/^>\s?/gm, "")
        .replace(/^[-*+]\s+/gm, "")
        .replace(/^\d+\.\s+/gm, "")
        .replace(/^-{3,}$/gm, " ")
        .replace(/\|/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

export function cleanTitle(title: string, maxLength = 90): string {
    const plain = stripMarkdown(title);

    if (plain.length === 0) return "Untitled decode";
    if (plain.length <= maxLength) return plain;

    const cut = plain.slice(0, maxLength);
    const lastSpace = cut.lastIndexOf(" ");
    const threshold = Math.floor(maxLength * 0.55);
    const trimmed = lastSpace > threshold ? cut.slice(0, lastSpace) : cut;

    return `${trimmed.replace(/[\s,;:.–-]+$/, "")}…`;
}

export function resolveTitle(
    title: string,
    text: string,
    maxLength = 90
): string {
    if (/(\.\.\.|…)\s*$/.test(title)) {
        return cleanTitle(text, maxLength);
    }

    return cleanTitle(title, maxLength);
}

export function previewSnippet(
    text: string,
    title: string,
    maxLength = 140
): string {
    const plainTitle = stripMarkdown(title).toLowerCase();
    const paragraphs = text
        .split(/\r?\n{2,}/)
        .map((block) => stripMarkdown(block))
        .filter((block) => block.length > 0);

    const candidate =
        paragraphs.find(
            (block) =>
                plainTitle.length === 0 ||
                !block.toLowerCase().startsWith(plainTitle.slice(0, 24))
        ) ??
        paragraphs[0] ??
        "";

    if (candidate.length === 0) return "No readable preview available.";
    if (candidate.length <= maxLength) return candidate;

    const cut = candidate.slice(0, maxLength);
    const lastSpace = cut.lastIndexOf(" ");
    const trimmed = lastSpace > 60 ? cut.slice(0, lastSpace) : cut;

    return `${trimmed.replace(/[\s,;:.–-]+$/, "")}…`;
}