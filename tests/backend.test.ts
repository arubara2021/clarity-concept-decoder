import { describe, it, expect, beforeEach } from "vitest";

import {
    audienceSchema,
    decodeSectionSchema,
    decodeRequestSchema,
    retryRequestSchema,
    fetchUrlRequestSchema,
    shareRequestSchema,
    revokeRequestSchema,
} from "../lib/validation";

import { graphSchema } from "../lib/graph-schema";

import {
    buildSectionPrompt,
    buildRetrySectionPrompt,
    buildGraphPrompt,
} from "../lib/prompts";

import { fetchPublicHtml } from "../lib/safe-url";

import {
    getRateBudget,
    incrementRateBudget,
    resetRateBudget,
} from "../lib/rate-budget";

import { POST as decodePost } from "../app/api/decode/route";
import { POST as retryPost } from "../app/api/retry-section/route";
import { POST as sharePost } from "../app/api/share/route";
import { POST as revokePost } from "../app/api/share/[id]/revoke/route";
import { POST as fetchUrlPost } from "../app/api/fetch-url/route";

function jsonRequest(body: unknown): Request {
    return new Request("http://localhost/api", {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
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
        expect(audienceSchema.safeParse("Developer").success).toBe(false);
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
    it("rejects text over 20000 characters", () => {
        const result = decodeRequestSchema.safeParse({
            text: "a".repeat(20001),
            audience: "Student",
        });
        expect(result.success).toBe(false);
    });
    it("rejects a bad audience", () => {
        const result = decodeRequestSchema.safeParse({
            text: "Some text",
            audience: "Wizard",
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
            section: "summary",
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
        expect(fetchUrlRequestSchema.safeParse({ url: "https://example.com" }).success).toBe(true);
        expect(fetchUrlRequestSchema.safeParse({ url: "http://example.com" }).success).toBe(true);
        expect(fetchUrlRequestSchema.safeParse({ url: "HTTPS://example.com" }).success).toBe(true);
    });
    it("rejects ftp, mailto, file, and data schemes", () => {
        expect(fetchUrlRequestSchema.safeParse({ url: "ftp://example.com" }).success).toBe(false);
        expect(fetchUrlRequestSchema.safeParse({ url: "mailto:a@b.com" }).success).toBe(false);
        expect(fetchUrlRequestSchema.safeParse({ url: "file:///etc/passwd" }).success).toBe(false);
        expect(fetchUrlRequestSchema.safeParse({ url: "data:text/html,hi" }).success).toBe(false);
    });
    it("rejects a URL over 2048 characters", () => {
        const longUrl = `https://example.com/${"a".repeat(2100)}`;
        expect(fetchUrlRequestSchema.safeParse({ url: longUrl }).success).toBe(false);
    });
});

describe("validation.shareRequestSchema", () => {
    const valid = {
        identity: "abc123XYZ_-",
        decode: {
            text: "Some text",
            audience: "Student",
            sections: { tldr: "a", analogy: "b", jargon: "c", takeaway: "d" },
            graph: null,
        },
    };
    it("accepts a valid share body", () => {
        expect(shareRequestSchema.safeParse(valid).success).toBe(true);
    });
    it("accepts a body with a graph", () => {
        const withGraph = {
            ...valid,
            decode: {
                ...valid.decode,
                graph: {
                    nodes: [{ id: "a", label: "Alpha" }],
                    edges: [],
                },
            },
        };
        expect(shareRequestSchema.safeParse(withGraph).success).toBe(true);
    });
    it("rejects an identity with spaces", () => {
        expect(shareRequestSchema.safeParse({ ...valid, identity: "has spaces" }).success).toBe(false);
    });
    it("rejects a too-short identity", () => {
        expect(shareRequestSchema.safeParse({ ...valid, identity: "abc" }).success).toBe(false);
    });
    it("rejects an invalid audience inside the decode", () => {
        const bad = {
            ...valid,
            decode: { ...valid.decode, audience: "Wizard" },
        };
        expect(shareRequestSchema.safeParse(bad).success).toBe(false);
    });
    it("rejects an invalid graph inside the decode", () => {
        const bad = {
            ...valid,
            decode: {
                ...valid.decode,
                graph: {
                    nodes: [{ id: "a", label: "Alpha" }],
                    edges: [{ id: "e1", source: "a", target: "missing" }],
                },
            },
        };
        expect(shareRequestSchema.safeParse(bad).success).toBe(false);
    });
});

describe("validation.revokeRequestSchema", () => {
    it("accepts a valid token", () => {
        expect(revokeRequestSchema.safeParse({ deleteToken: "a".repeat(32) }).success).toBe(true);
    });
    it("rejects a token under 16 characters", () => {
        expect(revokeRequestSchema.safeParse({ deleteToken: "abc" }).success).toBe(false);
    });
    it("rejects a token over 128 characters", () => {
        expect(revokeRequestSchema.safeParse({ deleteToken: "a".repeat(200) }).success).toBe(false);
    });
});

describe("graphSchema", () => {
    it("accepts a small valid graph", () => {
        const result = graphSchema.safeParse({
            nodes: [
                { id: "alpha", label: "Alpha" },
                { id: "beta", label: "Beta" },
            ],
            edges: [{ id: "e1", source: "alpha", target: "beta", label: "links" }],
        });
        expect(result.success).toBe(true);
    });
    it("accepts an edge with no label", () => {
        const result = graphSchema.safeParse({
            nodes: [
                { id: "a", label: "A" },
                { id: "b", label: "B" },
            ],
            edges: [{ id: "e1", source: "a", target: "b" }],
        });
        expect(result.success).toBe(true);
    });
    it("rejects edges that reference unknown nodes", () => {
        const result = graphSchema.safeParse({
            nodes: [{ id: "a", label: "Alpha" }],
            edges: [{ id: "e1", source: "a", target: "missing" }],
        });
        expect(result.success).toBe(false);
    });
    it("rejects more than 24 nodes", () => {
        const nodes = Array.from({ length: 25 }, (_, i) => ({ id: `n${i}`, label: `Node ${i}` }));
        const result = graphSchema.safeParse({ nodes, edges: [] });
        expect(result.success).toBe(false);
    });
    it("rejects more than 36 edges", () => {
        const nodes = Array.from({ length: 24 }, (_, i) => ({ id: `n${i}`, label: `Node ${i}` }));
        const edges = Array.from({ length: 37 }, (_, i) => ({
            id: `e${i}`,
            source: `n${i % 24}`,
            target: `n${(i + 1) % 24}`,
        }));
        const result = graphSchema.safeParse({ nodes, edges });
        expect(result.success).toBe(false);
    });
    it("rejects an empty node id", () => {
        const result = graphSchema.safeParse({
            nodes: [{ id: "", label: "Alpha" }],
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
        const prompt = buildSectionPrompt("Student", "tldr", "Sample text.");
        expect(prompt).toContain("warm, analogy-heavy");
    });
    it("includes Executive audience guidance", () => {
        const prompt = buildSectionPrompt("Executive", "tldr", "Sample text.");
        expect(prompt).toContain("crisp, outcome-focused");
    });
    it("includes Developer (Non-ML) audience guidance", () => {
        const prompt = buildSectionPrompt("Developer (Non-ML)", "tldr", "Sample text.");
        expect(prompt).toContain("technical precision");
    });
    it("includes the tldr instruction", () => {
        expect(buildSectionPrompt("Student", "tldr", "s")).toContain("exactly one sentence");
    });
    it("includes the analogy instruction", () => {
        expect(buildSectionPrompt("Student", "analogy", "s")).toContain("concrete analogy");
    });
    it("includes the jargon instruction", () => {
        expect(buildSectionPrompt("Student", "jargon", "s")).toContain("term -> translation");
    });
    it("includes the takeaway instruction", () => {
        expect(buildSectionPrompt("Student", "takeaway", "s")).toContain("most important thing");
    });
    it("numbers paragraphs when source has blank lines", () => {
        const prompt = buildSectionPrompt("Student", "tldr", "First para.\n\nSecond para.");
        expect(prompt).toContain("[P1] First para.");
        expect(prompt).toContain("[P2] Second para.");
    });
    it("wraps a single-paragraph source in P1", () => {
        const prompt = buildSectionPrompt("Student", "tldr", "Only one paragraph.");
        expect(prompt).toContain("[P1] Only one paragraph.");
    });
    it("marks the source as untrusted input", () => {
        const prompt = buildSectionPrompt("Student", "tldr", "text");
        expect(prompt).toContain("untrusted input");
    });
    it("asks for citation markers", () => {
        const prompt = buildSectionPrompt("Student", "tldr", "text");
        expect(prompt).toContain("[pN]");
    });
});

describe("buildRetrySectionPrompt", () => {
    it("matches the full section prompt for the same inputs", () => {
        const full = buildSectionPrompt("Student", "jargon", "text");
        const retry = buildRetrySectionPrompt("Student", "jargon", "text");
        expect(retry).toBe(full);
    });
});

describe("buildGraphPrompt", () => {
    it("requests only JSON", () => {
        expect(buildGraphPrompt("text")).toContain("only the JSON object");
    });
    it("sets the node count range", () => {
        expect(buildGraphPrompt("text")).toContain("between four and twelve");
    });
    it("marks the source as untrusted input", () => {
        expect(buildGraphPrompt("text")).toContain("untrusted input");
    });
});

describe("fetchPublicHtml rejections that do not need DNS", () => {
    it("rejects an unparseable URL", async () => {
        await expect(fetchPublicHtml("not a url")).rejects.toThrow("valid URL");
    });
    it("rejects ftp scheme", async () => {
        await expect(fetchPublicHtml("ftp://example.com")).rejects.toThrow("HTTP(S)");
    });
    it("rejects data scheme", async () => {
        await expect(fetchPublicHtml("data:text/html,hi")).rejects.toThrow("HTTP(S)");
    });
    it("rejects file scheme", async () => {
        await expect(fetchPublicHtml("file:///etc/passwd")).rejects.toThrow("HTTP(S)");
    });
    it("rejects embedded credentials", async () => {
        await expect(fetchPublicHtml("http://user:pass@example.com")).rejects.toThrow("credentials");
    });
});

describe("rate-budget", () => {
    beforeEach(() => {
        resetRateBudget();
    });
    it("starts with the full limit remaining", () => {
        const status = getRateBudget();
        expect(status.remaining).toBe(20);
        expect(status.limit).toBe(20);
        expect(status.exhausted).toBe(false);
    });
    it("decrements on each increment", () => {
        incrementRateBudget();
        incrementRateBudget();
        expect(getRateBudget().remaining).toBe(18);
    });
    it("becomes exhausted at the limit", () => {
        for (let i = 0; i < 20; i += 1) incrementRateBudget();
        const status = getRateBudget();
        expect(status.remaining).toBe(0);
        expect(status.exhausted).toBe(true);
    });
    it("reset returns to full", () => {
        for (let i = 0; i < 10; i += 1) incrementRateBudget();
        resetRateBudget();
        expect(getRateBudget().remaining).toBe(20);
    });
    it("reports a reset time within the next hour", () => {
        const status = getRateBudget();
        const delta = status.resetAt - Date.now();
        expect(delta).toBeGreaterThan(0);
        expect(delta).toBeLessThanOrEqual(60 * 60 * 1000);
    });
});

describe("POST /api/decode validation", () => {
    it("returns 400 on an empty body", async () => {
        const response = await decodePost(jsonRequest({}));
        expect(response.status).toBe(400);
    });
    it("returns 400 on empty text", async () => {
        const response = await decodePost(jsonRequest({ text: "   ", audience: "Student" }));
        expect(response.status).toBe(400);
    });
    it("returns 400 on an invalid audience", async () => {
        const response = await decodePost(jsonRequest({ text: "hi", audience: "Wizard" }));
        expect(response.status).toBe(400);
    });
    it("returns 400 on text over 20000 characters", async () => {
        const response = await decodePost(
            jsonRequest({ text: "a".repeat(20001), audience: "Student" })
        );
        expect(response.status).toBe(400);
    });
});

describe("POST /api/retry-section validation", () => {
    it("returns 400 on an invalid section", async () => {
        const response = await retryPost(
            jsonRequest({ text: "hi", audience: "Student", section: "summary" })
        );
        expect(response.status).toBe(400);
    });
    it("returns 400 on a missing section", async () => {
        const response = await retryPost(jsonRequest({ text: "hi", audience: "Student" }));
        expect(response.status).toBe(400);
    });
});

describe("POST /api/share without DATABASE_URL", () => {
    it("returns 503 when sharing is not configured", async () => {
        const response = await sharePost(jsonRequest({ identity: "abc12345", decode: {} }));
        expect(response.status).toBe(503);
    });
});

describe("POST /api/share/[id]/revoke without DATABASE_URL", () => {
    it("returns 503 when sharing is not configured", async () => {
        const response = await revokePost(
            jsonRequest({ deleteToken: "a".repeat(32) }),
            { params: Promise.resolve({ id: "someid" }) }
        );
        expect(response.status).toBe(503);
    });
});

describe("POST /api/fetch-url validation", () => {
    it("returns 400 on a missing url", async () => {
        const response = await fetchUrlPost(jsonRequest({}));
        expect(response.status).toBe(400);
    });
    it("returns 400 on an ftp url", async () => {
        const response = await fetchUrlPost(jsonRequest({ url: "ftp://example.com" }));
        expect(response.status).toBe(400);
    });
    it("returns 400 on an empty url", async () => {
        const response = await fetchUrlPost(jsonRequest({ url: "" }));
        expect(response.status).toBe(400);
    });
});