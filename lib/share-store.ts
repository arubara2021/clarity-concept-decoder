import { neon } from "@neondatabase/serverless";
import { nanoid } from "nanoid";
import { createHash } from "node:crypto";
import { z } from "zod";
import type { ConceptGraph, Decode, ReadShareResult, RevokeOutcome } from "./types";
import { audienceSchema } from "./validation";
import { graphSchema } from "./graph-schema";

export const SHARE_LIMIT = 10;

const ID_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
const ID_LENGTH = 8;
const TOKEN_LENGTH = 32;
const INSERT_ATTEMPTS = 3;

type SqlClient = ReturnType<typeof neon>;

const sectionsSchema = z.object({
    tldr: z.string(),
    analogy: z.string(),
    jargon: z.string(),
    takeaway: z.string(),
});

const storedDecodeSchema = z.object({
    text: z.string(),
    audience: audienceSchema,
    sections: sectionsSchema,
    graph: graphSchema.nullable(),
});

let cachedSql: SqlClient | null = null;
let schemaReady: Promise<void> | null = null;

function getSql(): SqlClient {
    if (!cachedSql) {
        const url = process.env.DATABASE_URL?.trim();
        if (!url) throw new Error("DATABASE_URL is not set.");
        cachedSql = neon(url);
    }
    return cachedSql;
}

function ensureSchema(): Promise<void> {
    if (!schemaReady) {
        schemaReady = (async () => {
            const sql = getSql();
            await sql`
                CREATE TABLE IF NOT EXISTS shared_decodes (
                    id TEXT PRIMARY KEY,
                    identity TEXT NOT NULL,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                    payload JSONB NOT NULL,
                    delete_token_hash TEXT NOT NULL,
                    views INTEGER NOT NULL DEFAULT 0
                )
            `;
            await sql`
                CREATE INDEX IF NOT EXISTS shared_decodes_identity_idx
                ON shared_decodes (identity)
            `;
        })().catch((error) => {
            schemaReady = null;
            throw error;
        });
    }
    return schemaReady;
}

function generateId(): string {
    let id = "";
    for (let i = 0; i < ID_LENGTH; i += 1) {
        id += ID_ALPHABET[Math.floor(Math.random() * ID_ALPHABET.length)];
    }
    return id;
}

function hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
}

function isDuplicateKeyError(error: unknown): boolean {
    if (!(error instanceof Error)) return false;
    const message = error.message.toLowerCase();
    return message.includes("duplicate key") || message.includes("unique constraint");
}

function normalizePayload(raw: unknown): unknown {
    if (typeof raw !== "string") return raw;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function toIsoString(value: unknown): string {
    if (value instanceof Date) return value.toISOString();
    if (typeof value === "string") return value;
    return new Date().toISOString();
}

export async function countSharesForIdentity(identity: string): Promise<number> {
    await ensureSchema();
    const sql = getSql();
    const rows = (await sql`
        SELECT COUNT(*)::int AS count
        FROM shared_decodes
        WHERE identity = ${identity}
    `) as Array<{ count: number }>;
    return rows[0]?.count ?? 0;
}

export async function createShare(
    identity: string,
    decode: Decode
): Promise<{ id: string; deleteToken: string }> {
    await ensureSchema();
    const sql = getSql();
    const payload = JSON.stringify(decode);
    const deleteToken = nanoid(TOKEN_LENGTH);
    const deleteTokenHash = hashToken(deleteToken);

    for (let attempt = 0; attempt < INSERT_ATTEMPTS; attempt += 1) {
        const id = generateId();
        try {
            await sql`
                INSERT INTO shared_decodes (id, identity, payload, delete_token_hash)
                VALUES (${id}, ${identity}, ${payload}::jsonb, ${deleteTokenHash})
            `;
            return { id, deleteToken };
        } catch (error) {
            if (isDuplicateKeyError(error) && attempt < INSERT_ATTEMPTS - 1) continue;
            throw error;
        }
    }

    throw new Error("Could not allocate a unique share ID.");
}

export async function readShare(id: string): Promise<ReadShareResult | null> {
    await ensureSchema();
    const sql = getSql();
    const rows = (await sql`
        UPDATE shared_decodes
        SET views = views + 1
        WHERE id = ${id}
        RETURNING payload, views, created_at
    `) as Array<{ payload: unknown; views: number; created_at: unknown }>;

    if (rows.length === 0) return null;

    const normalized = normalizePayload(rows[0].payload);
    const parsed = storedDecodeSchema.safeParse(normalized);
    if (!parsed.success) {
        console.error("stored share payload is invalid", parsed.error);
        return null;
    }

    const decoded = parsed.data;

    return {
        decode: {
            text: decoded.text,
            audience: decoded.audience,
            sections: decoded.sections,
            graph: decoded.graph as ConceptGraph | null,
        },
        views: rows[0].views,
        createdAt: toIsoString(rows[0].created_at),
    };
}

export async function revokeShare(
    id: string,
    deleteToken: string
): Promise<RevokeOutcome> {
    await ensureSchema();
    const sql = getSql();
    const tokenHash = hashToken(deleteToken);

    const deleted = (await sql`
        DELETE FROM shared_decodes
        WHERE id = ${id} AND delete_token_hash = ${tokenHash}
        RETURNING id
    `) as Array<{ id: string }>;

    if (deleted.length > 0) return "revoked";

    const exists = (await sql`
        SELECT 1 AS present FROM shared_decodes WHERE id = ${id} LIMIT 1
    `) as Array<{ present: number }>;

    if (exists.length > 0) return "forbidden";
    return "not-found";
}