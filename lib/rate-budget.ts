const STORAGE_KEY = "clarity.rate-budget.v1";
const WINDOW_MS = 60 * 60 * 1000;
const LIMIT = 20;

type BudgetRecord = {
    windowStart: number;
    count: number;
};

export type BudgetStatus = {
    remaining: number;
    limit: number;
    resetAt: number;
    windowStart: number;
    exhausted: boolean;
};

let memoryFallback: BudgetRecord | null = null;

function now(): number {
    return Date.now();
}

function readRecord(): BudgetRecord {
    const fresh: BudgetRecord = { windowStart: now(), count: 0 };

    if (typeof window === "undefined") return memoryFallback ?? fresh;

    let raw: string | null = null;
    try {
        raw = window.localStorage.getItem(STORAGE_KEY);
    } catch {
        return memoryFallback ?? fresh;
    }

    if (!raw) return memoryFallback ?? fresh;

    try {
        const parsed = JSON.parse(raw) as Partial<BudgetRecord>;
        const windowStart =
            typeof parsed.windowStart === "number" && Number.isFinite(parsed.windowStart)
                ? parsed.windowStart
                : null;
        const count =
            typeof parsed.count === "number" && Number.isFinite(parsed.count) && parsed.count >= 0
                ? Math.floor(parsed.count)
                : null;

        if (windowStart === null || count === null) return fresh;
        if (windowStart > now() + WINDOW_MS) return fresh;
        return { windowStart, count };
    } catch {
        return fresh;
    }
}

function writeRecord(record: BudgetRecord): void {
    memoryFallback = record;
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch {
        void 0;
    }
}

function normalize(record: BudgetRecord): BudgetRecord {
    if (now() - record.windowStart >= WINDOW_MS) {
        return { windowStart: now(), count: 0 };
    }
    return record;
}

export function getRateBudget(): BudgetStatus {
    const record = normalize(readRecord());
    const used = Math.max(0, Math.min(record.count, LIMIT));
    const remaining = LIMIT - used;
    return {
        remaining,
        limit: LIMIT,
        resetAt: record.windowStart + WINDOW_MS,
        windowStart: record.windowStart,
        exhausted: remaining <= 0,
    };
}

export function incrementRateBudget(): BudgetStatus {
    const record = normalize(readRecord());
    const next: BudgetRecord = {
        windowStart: record.windowStart,
        count: Math.min(record.count + 1, LIMIT + 1),
    };
    writeRecord(next);
    return getRateBudget();
}

export function resetRateBudget(): void {
    writeRecord({ windowStart: now(), count: 0 });
}