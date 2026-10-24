import { z } from "zod";
import type { Audience, DecodeSection } from "./types";
import { graphSchema } from "./graph-schema";
import { MAX_SECTION_CHARS, MAX_SOURCE_CHARS } from "./limits";

export const audienceSchema = z.enum([
    "Student",
    "Executive",
    "Developer (Non-ML)",
]) satisfies z.ZodType<Audience>;

export const decodeSectionSchema = z.enum([
    "tldr",
    "analogy",
    "jargon",
    "takeaway",
]) satisfies z.ZodType<DecodeSection>;

export const decodeRequestSchema = z.object({
    text: z
        .string()
        .trim()
        .min(1, "Please paste some text to decode.")
        .max(MAX_SOURCE_CHARS),
    audience: audienceSchema,
});

export const retryRequestSchema = z.object({
    text: z.string().trim().min(1).max(MAX_SOURCE_CHARS),
    audience: audienceSchema,
    section: decodeSectionSchema,
});

export const fetchUrlRequestSchema = z.object({
    url: z
        .string()
        .trim()
        .min(1)
        .max(2048)
        .regex(/^https?:\/\//i, "Please paste a valid public URL."),
});

const sectionsSchema = z.object({
    tldr: z.string().max(MAX_SECTION_CHARS.tldr),
    analogy: z.string().max(MAX_SECTION_CHARS.analogy),
    jargon: z.string().max(MAX_SECTION_CHARS.jargon),
    takeaway: z.string().max(MAX_SECTION_CHARS.takeaway),
});

export const shareRequestSchema = z.object({
    identity: z
        .string()
        .trim()
        .min(8)
        .max(64)
        .regex(/^[A-Za-z0-9_-]+$/, "Invalid session identity."),
    decode: z.object({
        text: z.string().min(1).max(MAX_SOURCE_CHARS),
        audience: audienceSchema,
        sections: sectionsSchema,
        graph: graphSchema.nullable(),
    }),
});

export const revokeRequestSchema = z.object({
    deleteToken: z.string().trim().min(16).max(128),
});