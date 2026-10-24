import Dexie, { type Table } from "dexie";
import { nanoid } from "nanoid";
import { cleanTitle } from "./format";
import type { LocalDecode } from "./types";

const DB_NAME = "clarity";
const IDENTITY_KEY = "clarity.session.id";

class ClarityDatabase extends Dexie {
    decodes!: Table<LocalDecode, string>;

    constructor() {
        super(DB_NAME);
        this.version(1).stores({
            decodes: "id, createdAt, title",
        });
    }
}

let dbInstance: ClarityDatabase | null = null;
let identityCache: string | null = null;

function getDb(): ClarityDatabase {
    if (!dbInstance) dbInstance = new ClarityDatabase();
    return dbInstance;
}

export function getSessionIdentity(): string {
    if (identityCache) return identityCache;

    if (typeof window === "undefined") {
        identityCache = nanoid(16);
        return identityCache;
    }

    try {
        const existing = window.localStorage.getItem(IDENTITY_KEY);

        if (existing && existing.length >= 8) {
            identityCache = existing;
            return identityCache;
        }

        const fresh = nanoid(16);
        window.localStorage.setItem(IDENTITY_KEY, fresh);
        identityCache = fresh;
        return identityCache;
    } catch {
        identityCache = nanoid(16);
        return identityCache;
    }
}

function buildTitle(text: string): string {
    return cleanTitle(text, 60);
}

export async function saveDecode(entry: LocalDecode): Promise<LocalDecode> {
    await getDb().decodes.put(entry);
    return entry;
}

export async function createLocalDecode(
    decode: Omit<LocalDecode, "id" | "createdAt" | "title" | "share">
): Promise<LocalDecode> {
    const entry: LocalDecode = {
        ...decode,
        id: nanoid(16),
        createdAt: Date.now(),
        title: buildTitle(decode.text),
        share: null,
    };

    await saveDecode(entry);
    return entry;
}

export async function getDecode(id: string): Promise<LocalDecode | undefined> {
    return getDb().decodes.get(id);
}

export async function listDecodes(): Promise<LocalDecode[]> {
    return getDb().decodes.orderBy("createdAt").reverse().toArray();
}

export async function searchDecodes(query: string): Promise<LocalDecode[]> {
    const trimmed = query.trim().toLowerCase();
    const all = await listDecodes();

    if (trimmed.length === 0) return all;

    return all.filter((entry) => {
        if (entry.title.toLowerCase().includes(trimmed)) return true;
        if (entry.text.toLowerCase().includes(trimmed)) return true;
        return false;
    });
}

export async function renameDecode(id: string, title: string): Promise<void> {
    const next = cleanTitle(title, 120);
    if (next.length === 0) return;
    await getDb().decodes.update(id, { title: next });
}

export async function deleteDecode(id: string): Promise<void> {
    await getDb().decodes.delete(id);
}

export async function clearAll(): Promise<void> {
    await getDb().decodes.clear();
}

export async function countDecodes(): Promise<number> {
    return getDb().decodes.count();
}