import { describe, it, expect, beforeEach } from "vitest";
import {
    audienceSchema,
    decodeSectionSchema,
    decodeRequestSchema,
    retryRequestSchema,
    fetchUrlRequestSchema,
    shareRequestSchema,
    revokeRequestSchema,
} from "@/lib/validation";
import { graphSchema } from "@/lib/graph-schema";
import {
    buildSectionPrompt,
    buildRetrySectionPrompt,
    buildGraphPrompt,
} from "@/lib/prompts";
import { fetchPublicHtml } from "@/lib/safe-url";
import {
    getRateBudget,
    incrementRateBudget,
    resetRateBudget,
} from "@/lib/rate-budget";
import { POST as decodeHandler } from "@/app/api/decode/route";
import { POST as retryHandler } from "@/app/api/retry-section/route";
import { POST as shareHandler } from "@/app/api/share/route";
import { POST as revokeHandler } from "@/app/api/share/[id]/revoke/route";
import { POST as fetchUrlHandler } from "@/app/api/fetch-url/route";

// Ensure env vars are set for AI model initialization during tests
process.env.GEMINI_API_KEY = "test-key";
process.env.GEMINI_MODEL = "gemini-1.5-flash-latest";

function jsonRequest(body: unknown, url = "http://localhost/api/test") {
    return new Request(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}

describe("validation.audienceSchema", () => {
    it("accepts Student, Executive, Developer (Non-ML)", () => {
        expect(audienceSchema.safeParse("Student").success).toBe(true);
        expect(audienceSchema.safeParse("Executive").success).toBe(true);
        expect(audienceSchema.safeParse("Developer (Non-ML)").success).toBe(true);
    });
    it("rejects wrong-case and empty strings", () => {
        expect(audienceSchema.safeParse("student").success).toBe(false);
        expect(audienceSchema.safeParse("").success).toBe(false);
    });
});

describe("validation.decodeSectionSchema", () => {
    it("accepts the four section names", () => {
        expect(decodeSectionSchema.safeParse("tldr").success).toBe(true);
        expect(decodeSectionSchema.safeParse("analogy").success).toBe(true);
        expect(decodeSectionSchema.safeParse("jargon").success).toBe(true);
        expect(decodeSectionSchema.safeParse("takeaway").success).toBe(true);
    });
    it("rejects unknown section names", () => {
        expect(decodeSectionSchema.safeParse("summary").success).toBe(false);
        expect(decodeSectionSchema.safeParse("").success).toBe(false);
    });
});

describe("validation.decodeRequestSchema", () => {
    it("accepts a valid body", () => {
        const result = decodeRequestSchema.safeParse({
            text: "Some text",
            audience: "Student",
        });
        expect(result.success).toBe(true);
    });
    it("rejects empty text", () => {
        const result = decodeRequestSchema.safeParse({
            text: "   ",
            audience: "Student",
        });
        expect(result.success).toBe(false);
    });
    it("rejects text over 60000 characters", () => {
        const result = decodeRequestSchema.safeParse({
            text: "a".repeat(60001),
            audience: "Student",
        });
        expect(result.success).toBe(false);
    });
    it("rejects a bad audience", () => {
        const result = decodeRequestSchema.safeParse({
            text: "Some text",
            audience: "Bad",
        });
        expect(result.success).toBe(false);
    });
});

describe("validation.retryRequestSchema", () => {
    it("accepts a valid retry body", () => {
        const result = retryRequestSchema.safeParse({
            text: "Some text",
            audience: "Executive",
            section: "tldr",
        });
        expect(result.success).toBe(true);
    });
    it("rejects a bad section", () => {
        const result = retryRequestSchema.safeParse({
            text: "Some text",
            audience: "Executive",
            section: "bad",
        });
        expect(result.success).toBe(false);
    });
    it("rejects a missing section", () => {
        const result = retryRequestSchema.safeParse({
            text: "Some text",
            audience: "Executive",
        });
        expect(result.success).toBe(false);
    });
});

describe("validation.fetchUrlRequestSchema", () => {
    it("accepts http and https, case-insensitive", () => {
        expect(fetchUrlRequestSchema.safeParse({ url: "http://example.com" }).success).toBe(true);
        expect(fetchUrlRequestSchema.safeParse({ url: "HTTPS://example.com" }).success).toBe(true);
    });
    it("rejects ftp, mailto, file, and data schemes", () => {
        expect(fetchUrlRequestSchema.safeParse({ url: "ftp://example.com" }).success).toBe(false);
        expect(fetchUrlRequestSchema.safeParse({ url: "mailto:a@b.com" }).success).toBe(false);
        expect(fetchUrlRequestSchema.safeParse({ url: "file:///etc/passwd" }).success).toBe(false);
        expect(fetchUrlRequestSchema.safeParse({ url: "data:text/plain,hi" }).success).toBe(false);
    });
    it("rejects a URL over 2048 characters", () => {
        expect(fetchUrlRequestSchema.safeParse({ url: "http://a.com/" + "a".repeat(2048) }).success).toBe(false);
    });
});

describe("validation.shareRequestSchema", () => {
    it("accepts a valid share body", () => {
        const result = shareRequestSchema.safeParse({
            identity: "test-identity-123",
            decode: {
                text: "text",
                audience: "Student",
                sections: { tldr: "a", analogy: "b", jargon: "c", takeaway: "d" },
                graph: null,
            },
        });
        expect(result.success).toBe(true);
    });
    it("accepts a body with a graph", () => {
        const result = shareRequestSchema.safeParse({
            identity: "test-identity-123",
            decode: {
                text: "text",
                audience: "Student",
                sections: { tldr: "a", analogy: "b", jargon: "c", takeaway: "d" },
                graph: { nodes: [{ id: "a", label: "A" }], edges: [] },
            },
        });
        expect(result.success).toBe(true);
    });
    it("rejects an identity with spaces", () => {
        const result = shareRequestSchema.safeParse({
            identity: "bad identity",
            decode: {
                text: "text",
                audience: "Student",
                sections: { tldr: "a", analogy: "b", jargon: "c", takeaway: "d" },
                graph: null,
            },
        });
        expect(result.success).toBe(false);
    });
    it("rejects a too-short identity", () => {
        const result = shareRequestSchema.safeParse({
            identity: "short",
            decode: {
                text: "text",
                audience: "Student",
                sections: { tldr: "a", analogy: "b", jargon: "c", takeaway: "d" },
                graph: null,
            },
        });
        expect(result.success).toBe(false);
    });
    it("rejects an invalid audience inside the decode", () => {
        const result = shareRequestSchema.safeParse({
            identity: "test-identity-123",
            decode: {
                text: "text",
                audience: "Bad",
                sections: { tldr: "a", analogy: "b", jargon: "c", takeaway: "d" },
                graph: null,
            },
        });
        expect(result.success).toBe(false);
    });
    it("rejects an invalid graph inside the decode", () => {
        const result = shareRequestSchema.safeParse({
            identity: "test-identity-123",
            decode: {
                text: "text",
                audience: "Student",
                sections: { tldr: "a", analogy: "b", jargon: "c", takeaway: "d" },
                graph: { nodes: [], edges: [{ id: "e", source: "missing", target: "missing" }] },
            },
        });
        expect(result.success).toBe(false);
    });
});

describe("validation.revokeRequestSchema", () => {
    it("accepts a valid token", () => {
        expect(revokeRequestSchema.safeParse({ deleteToken: "a".repeat(32) }).success).toBe(true);
    });
    it("rejects a token under 16 characters", () => {
        expect(revokeRequestSchema.safeParse({ deleteToken: "short" }).success).toBe(false);
    });
    it("rejects a token over 128 characters", () => {
        expect(revokeRequestSchema.safeParse({ deleteToken: "a".repeat(129) }).success).toBe(false);
    });
});

describe("graphSchema", () => {
    it("accepts a small valid graph", () => {
        const result = graphSchema.safeParse({
            nodes: [{ id: "a", label: "A" }, { id: "b", label: "B" }],
            edges: [{ id: "e1", source: "a", target: "b", label: "rel" }],
        });
        expect(result.success).toBe(true);
    });
    it("accepts an edge with no label", () => {
        const result = graphSchema.safeParse({
            nodes: [{ id: "a", label: "A" }, { id: "b", label: "B" }],
            edges: [{ id: "e1", source: "a", target: "b" }],
        });
        expect(result.success).toBe(true);
    });
    it("rejects edges that reference unknown nodes", () => {
        const result = graphSchema.safeParse({
            nodes: [{ id: "a", label: "A" }],
            edges: [{ id: "e1", source: "a", target: "missing" }],
        });
        expect(result.success).toBe(false);
    });
    it("rejects more than 24 nodes", () => {
        const nodes = Array.from({ length: 25 }, (_, i) => ({ id: `n${i}`, label: `N${i}` }));
        const result = graphSchema.safeParse({ nodes, edges: [] });
        expect(result.success).toBe(false);
    });
    it("rejects more than 36 edges", () => {
        const edges = Array.from({ length: 37 }, (_, i) => ({ id: `e${i}`, source: "a", target: "b" }));
        const result = graphSchema.safeParse({ nodes: [{ id: "a", label: "A" }, { id: "b", label: "B" }], edges });
        expect(result.success).toBe(false);
    });
    it("rejects an empty node id", () => {
        const result = graphSchema.safeParse({
            nodes: [{ id: "", label: "A" }],
            edges: [],
        });
        expect(result.success).toBe(false);
    });
    it("accepts an empty graph", () => {
        const result = graphSchema.safeParse({ nodes: [], edges: [] });
        expect(result.success).toBe(true);
    });
});

describe("buildSectionPrompt", () => {
    it("includes Student audience guidance", () => {
        expect(buildSectionPrompt("Student", "tldr", "s")).toContain("curious student");
    });
    it("includes Executive audience guidance", () => {
        expect(buildSectionPrompt("Executive", "tldr", "s")).toContain("senior executive");
    });
    it("includes Developer (Non-ML) audience guidance", () => {
        expect(buildSectionPrompt("Developer (Non-ML)", "tldr", "s")).toContain("software engineer");
    });
    it("includes the tldr instruction", () => {
        expect(buildSectionPrompt("Student", "tldr", "s")).toContain("One sentence only");
    });
    it("includes the analogy instruction", () => {
        expect(buildSectionPrompt("Student", "analogy", "s")).toContain("concrete comparison");
    });
    it("includes the jargon instruction", () => {
        expect(buildSectionPrompt("Student", "jargon", "s")).toContain("Jargon Buster");
    });
    it("includes the takeaway instruction", () => {
        expect(buildSectionPrompt("Student", "takeaway", "s")).toContain("single most important thing");
    });
    it("numbers paragraphs when source has blank lines", () => {
        const prompt = buildSectionPrompt("Student", "tldr", "p1\n\np2");
        expect(prompt).toContain("[P1] p1");
        expect(prompt).toContain("[P2] p2");
    });
    it("wraps a single-paragraph source in P1", () => {
        const prompt = buildSectionPrompt("Student", "tldr", "single");
        expect(prompt).toContain("[P1] single");
    });
    it("marks the source as untrusted input", () => {
        expect(buildSectionPrompt("Student", "tldr", "s")).toContain("untrusted input");
    });
    it("asks for citation markers", () => {
        expect(buildSectionPrompt("Student", "tldr", "s")).toContain("[pN]");
    });
});

describe("buildRetrySectionPrompt", () => {
    it("matches the full section prompt for the same inputs", () => {
        const a = buildSectionPrompt("Student", "tldr", "s");
        const b = buildRetrySectionPrompt("Student", "tldr", "s");
        expect(a).toBe(b);
    });
});

describe("buildGraphPrompt", () => {
    it("requests only JSON", () => {
        expect(buildGraphPrompt("s")).toContain("JSON object");
    });
    it("sets the node count range", () => {
        expect(buildGraphPrompt("s")).toContain("four and twelve");
    });
    it("marks the source as untrusted input", () => {
        expect(buildGraphPrompt("s")).toContain("untrusted input");
    });
});

describe("fetchPublicHtml rejections that do not need DNS", () => {
    it("rejects an unparseable URL", async () => {
        await expect(fetchPublicHtml("not a url")).rejects.toThrow();
    });
    it("rejects ftp scheme", async () => {
        await expect(fetchPublicHtml("ftp://example.com")).rejects.toThrow();
    });
    it("rejects data scheme", async () => {
        await expect(fetchPublicHtml("data:text/plain,hi")).rejects.toThrow();
    });
    it("rejects file scheme", async () => {
        await expect(fetchPublicHtml("file:///etc/passwd")).rejects.toThrow();
    });
    it("rejects embedded credentials", async () => {
        await expect(fetchPublicHtml("http://user:pass@example.com")).rejects.toThrow();
    });
});

describe("rate-budget", () => {
    beforeEach(() => {
        resetRateBudget();
    });
    it("starts with the full limit remaining", () => {
        const budget = getRateBudget();
        expect(budget.remaining).toBe(20);
        expect(budget.exhausted).toBe(false);
    });
    it("decrements on each increment", () => {
        incrementRateBudget();
        incrementRateBudget();
        const budget = getRateBudget();
        expect(budget.remaining).toBe(18);
    });
    it("becomes exhausted at the limit", () => {
        for (let i = 0; i < 20; i++) incrementRateBudget();
        const budget = getRateBudget();
        expect(budget.exhausted).toBe(true);
        expect(budget.remaining).toBe(0);
    });
    it("reset returns to full", () => {
        for (let i = 0; i < 20; i++) incrementRateBudget();
        resetRateBudget();
        const budget = getRateBudget();
        expect(budget.remaining).toBe(20);
    });
    it("reports a reset time within the next hour", () => {
        const budget = getRateBudget();
        const hour = 60 * 60 * 1000;
        expect(budget.resetAt).toBeGreaterThan(Date.now());
        expect(budget.resetAt).toBeLessThanOrEqual(Date.now() + hour + 1000);
    });
});

describe("POST /api/decode validation", () => {
    it("returns 400 on an empty body", async () => {
        const response = await decodeHandler(jsonRequest({}));
        expect(response.status).toBe(400);
    });
    it("returns 400 on empty text", async () => {
        const response = await decodeHandler(jsonRequest({ text: "   ", audience: "Student" }));
        expect(response.status).toBe(400);
    });
    it("returns 400 on an invalid audience", async () => {
        const response = await decodeHandler(jsonRequest({ text: "text", audience: "Bad" }));
        expect(response.status).toBe(400);
    });
    it("returns 400 on text over 60000 characters", async () => {
        const response = await decodeHandler(
            jsonRequest({ text: "a".repeat(60001), audience: "Student" })
        );
        expect(response.status).toBe(400);
    });
});

describe("POST /api/retry-section validation", () => {
    it("returns 400 on an invalid section", async () => {
        const response = await retryHandler(
            jsonRequest({ text: "text", audience: "Student", section: "bad" })
        );
        expect(response.status).toBe(400);
    });
    it("returns 400 on a missing section", async () => {
        const response = await retryHandler(
            jsonRequest({ text: "text", audience: "Student" })
        );
        expect(response.status).toBe(400);
    });
});

describe("POST /api/share without DATABASE_URL", () => {
    it("returns 503 when sharing is not configured", async () => {
        const original = process.env.DATABASE_URL;
        delete process.env.DATABASE_URL;
        try {
            const response = await shareHandler(
                jsonRequest({
                    identity: "test-identity-123",
                    decode: {
                        text: "text",
                        audience: "Student",
                        sections: { tldr: "a", analogy: "b", jargon: "c", takeaway: "d" },
                        graph: null,
                    },
                })
            );
            expect(response.status).toBe(503);
        } finally {
            if (original) process.env.DATABASE_URL = original;
        }
    });
});

describe("POST /api/share/[id]/revoke without DATABASE_URL", () => {
    it("returns 503 when sharing is not configured", async () => {
        const original = process.env.DATABASE_URL;
        delete process.env.DATABASE_URL;
        try {
            const response = await revokeHandler(
                jsonRequest({ deleteToken: "a".repeat(32) }),
                { params: Promise.resolve({ id: "testid" }) }
            );
            expect(response.status).toBe(503);
        } finally {
            if (original) process.env.DATABASE_URL = original;
        }
    });
});

describe("POST /api/fetch-url validation", () => {
    it("returns 400 on a missing url", async () => {
        const response = await fetchUrlHandler(jsonRequest({}));
        expect(response.status).toBe(400);
    });
    it("returns 400 on an ftp url", async () => {
        const response = await fetchUrlHandler(jsonRequest({ url: "ftp://example.com" }));
        expect(response.status).toBe(400);
    });
    it("returns 400 on an empty url", async () => {
        const response = await fetchUrlHandler(jsonRequest({ url: "   " }));
        expect(response.status).toBe(400);
    });
});