export const MAX_SOURCE_CHARS = 60000;

export const MAX_PROMPT_SOURCE_CHARS = 48000;

export const MAX_SECTION_CHARS = {
  tldr: 4000,
  analogy: 8000,
  jargon: 12000,
  takeaway: 4000,
} as const;

export function sourceTooLongMessage(limit: number = MAX_SOURCE_CHARS): string {
  return `That source is longer than the ${limit.toLocaleString(
    "en-US"
  )} character limit. Trim it, or paste only the relevant section.`;
}