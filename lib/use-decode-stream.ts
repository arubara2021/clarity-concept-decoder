"use client";

import { useCallback, useEffect, useRef } from "react";
import { useStore } from "./store";
import { getRateBudget, incrementRateBudget } from "./rate-budget";
import { createLocalDecode, getDecode, saveDecode } from "./local-store";
import type { ConceptGraph, DecodeSection, LocalDecode } from "./types";

export type DecodeRunResult =
    | { ok: true; id: string | null }
    | {
        ok: false;
        reason:
        | "empty-text"
        | "already-decoding"
        | "rate-limited"
        | "request-failed"
        | "network-error"
        | "global-error";
        resetAt?: number;
    };

export type RetryRunResult =
    | { ok: true }
    | {
        ok: false;
        reason:
        | "empty-text"
        | "already-decoding"
        | "rate-limited"
        | "request-failed"
        | "network-error";
        resetAt?: number;
    };

type SseEvent =
    | { name: "section-start"; section: DecodeSection }
    | { name: "token"; section: DecodeSection; text: string }
    | { name: "section-complete"; section: DecodeSection }
    | { name: "section-error"; section: DecodeSection; message: string }
    | { name: "graph"; graph: ConceptGraph }
    | { name: "graph-error"; message: string }
    | { name: "global-error"; message: string }
    | { name: "done" };

function parseBlock(block: string): SseEvent | null {
    let name = "";
    const dataLines: string[] = [];

    for (const raw of block.split("\n")) {
        const line = raw.endsWith("\r") ? raw.slice(0, -1) : raw;

        if (line.length === 0 || line.startsWith(":")) continue;

        if (line.startsWith("event:")) {
            name = line.slice(6).trim();
        } else if (line.startsWith("data:")) {
            dataLines.push(line.slice(5).trim());
        }
    }

    if (!name) return null;

    const dataStr = dataLines.length > 0 ? dataLines.join("\n") : "{}";

    let data: Record<string, unknown>;

    try {
        data = JSON.parse(dataStr) as Record<string, unknown>;
    } catch {
        return null;
    }

    switch (name) {
        case "section-start":
            return typeof data.section === "string"
                ? { name: "section-start", section: data.section as DecodeSection }
                : null;

        case "token":
            return typeof data.section === "string" && typeof data.text === "string"
                ? {
                    name: "token",
                    section: data.section as DecodeSection,
                    text: data.text,
                }
                : null;

        case "section-complete":
            return typeof data.section === "string"
                ? {
                    name: "section-complete",
                    section: data.section as DecodeSection,
                }
                : null;

        case "section-error":
            return typeof data.section === "string" &&
                typeof data.message === "string"
                ? {
                    name: "section-error",
                    section: data.section as DecodeSection,
                    message: data.message,
                }
                : null;

        case "graph":
            return data.nodes && data.edges
                ? { name: "graph", graph: data as unknown as ConceptGraph }
                : null;

        case "graph-error":
            return typeof data.message === "string"
                ? { name: "graph-error", message: data.message }
                : null;

        case "global-error":
            return typeof data.message === "string"
                ? { name: "global-error", message: data.message }
                : null;

        case "done":
            return { name: "done" };

        default:
            return null;
    }
}

async function* readSse(
    body: ReadableStream<Uint8Array>
): AsyncGenerator<SseEvent> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
        while (true) {
            const { done, value } = await reader.read();

            if (done) {
                buffer += decoder.decode();

                for (const block of buffer.split(/\r?\n\r?\n/)) {
                    if (!block.trim()) continue;

                    const parsed = parseBlock(block);
                    if (parsed) yield parsed;
                }

                break;
            }

            buffer += decoder.decode(value, { stream: true });

            const blocks = buffer.split(/\r?\n\r?\n/);
            buffer = blocks.pop() ?? "";

            for (const block of blocks) {
                if (!block.trim()) continue;

                const parsed = parseBlock(block);
                if (parsed) yield parsed;
            }
        }
    } finally {
        try {
            reader.releaseLock();
        } catch {
            void 0;
        }
    }
}

function isConceptGraph(value: unknown): value is ConceptGraph {
    if (!value || typeof value !== "object") return false;

    const candidate = value as { nodes?: unknown; edges?: unknown };

    return Array.isArray(candidate.nodes) && Array.isArray(candidate.edges);
}

export function useDecodeStream(): {
    runDecode: () => Promise<DecodeRunResult>;
    runRetry: (section: DecodeSection) => Promise<RetryRunResult>;
} {
    const buffersRef = useRef<Partial<Record<DecodeSection, string>>>({});
    const flushScheduledRef = useRef(false);

    const flushNow = useCallback(() => {
        const buffers = buffersRef.current;

        if (Object.keys(buffers).length === 0) return;

        useStore.getState().appendTokens(buffers);

        buffersRef.current = {};
    }, []);

    const scheduleFlush = useCallback(() => {
        if (flushScheduledRef.current) return;

        if (typeof window === "undefined") {
            flushNow();
            return;
        }

        flushScheduledRef.current = true;

        const run = () => {
            flushScheduledRef.current = false;
            flushNow();
        };

        if (typeof document !== "undefined" && document.hidden) {
            window.setTimeout(run, 32);
            return;
        }

        if (typeof window.requestAnimationFrame === "function") {
            window.requestAnimationFrame(run);
            return;
        }

        window.setTimeout(run, 16);
    }, [flushNow]);

    const bufferToken = useCallback(
        (section: DecodeSection, text: string) => {
            if (!text) return;

            buffersRef.current[section] =
                (buffersRef.current[section] ?? "") + text;

            scheduleFlush();
        },
        [scheduleFlush]
    );

    useEffect(() => {
        return () => {
            flushNow();
        };
    }, [flushNow]);

    const runDecode = useCallback(async (): Promise<DecodeRunResult> => {
        const snapshot = useStore.getState();
        const text = snapshot.text.trim();

        if (text.length === 0) {
            return { ok: false, reason: "empty-text" };
        }

        if (snapshot.isDecoding) {
            return { ok: false, reason: "already-decoding" };
        }

        const budget = getRateBudget();

        if (budget.exhausted) {
            return {
                ok: false,
                reason: "rate-limited",
                resetAt: budget.resetAt,
            };
        }

        incrementRateBudget();

        const audience = snapshot.audience;

        useStore.getState().startDecode();

        try {
            const response = await fetch("/api/decode", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text, audience }),
            });

            if (!response.ok || !response.body) {
                const payload = await response.json().catch(() => null);

                const message =
                    (payload as { error?: string } | null)?.error ??
                    "The decoder is unavailable.";

                flushNow();
                useStore.getState().failDecode(message);

                return { ok: false, reason: "request-failed" };
            }

            for await (const event of readSse(response.body)) {
                const store = useStore.getState();

                if (event.name === "token") {
                    bufferToken(event.section, event.text);
                } else if (event.name === "section-complete") {
                    flushNow();
                    store.completeSection(event.section);
                } else if (event.name === "section-error") {
                    flushNow();
                    store.failSection(event.section, event.message);
                } else if (event.name === "graph") {
                    flushNow();

                    if (isConceptGraph(event.graph)) {
                        store.setGraph(event.graph);
                    }
                } else if (event.name === "graph-error") {
                    flushNow();
                    store.failGraph(event.message);
                } else if (event.name === "global-error") {
                    flushNow();
                    store.failDecode(event.message);

                    return { ok: false, reason: "global-error" };
                } else if (event.name === "done") {
                    flushNow();
                    store.finishDecode();
                }
            }

            flushNow();

            const final = useStore.getState();

            const created = await persistDecode({
                text,
                audience,
                sections: final.results,
                graph: final.graph,
            });

            const savedId = created?.id ?? null;

            if (savedId) {
                useStore.getState().setCurrentDecodeId(savedId);
            }

            return { ok: true, id: savedId };
        } catch (error) {
            console.error("decode stream failed", error);

            flushNow();
            useStore.getState().failDecode("The decoder is unavailable.");

            return { ok: false, reason: "network-error" };
        }
    }, [bufferToken, flushNow]);

    const runRetry = useCallback(
        async (section: DecodeSection): Promise<RetryRunResult> => {
            const snapshot = useStore.getState();
            const text = snapshot.text.trim();

            if (text.length === 0) {
                return { ok: false, reason: "empty-text" };
            }

            if (snapshot.isDecoding) {
                return { ok: false, reason: "already-decoding" };
            }

            const budget = getRateBudget();

            if (budget.exhausted) {
                return {
                    ok: false,
                    reason: "rate-limited",
                    resetAt: budget.resetAt,
                };
            }

            incrementRateBudget();

            const audience = snapshot.audience;

            useStore.getState().retrySection(section);

            try {
                const response = await fetch("/api/retry-section", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text, audience, section }),
                });

                if (!response.ok || !response.body) {
                    const payload = await response.json().catch(() => null);

                    const message =
                        (payload as { error?: string } | null)?.error ??
                        "The section could not be regenerated.";

                    flushNow();
                    useStore.getState().failSection(section, message);
                    useStore.getState().finishDecode();

                    return { ok: false, reason: "request-failed" };
                }

                for await (const event of readSse(response.body)) {
                    const store = useStore.getState();

                    if (event.name === "token") {
                        bufferToken(event.section, event.text);
                    } else if (event.name === "section-complete") {
                        flushNow();
                        store.completeSection(event.section);
                    } else if (event.name === "section-error") {
                        flushNow();
                        store.failSection(event.section, event.message);
                    } else if (event.name === "global-error") {
                        flushNow();
                        store.failSection(section, event.message);
                    } else if (event.name === "done") {
                        flushNow();
                        store.finishDecode();
                    }
                }

                flushNow();

                const updated = useStore.getState();

                await updatePersistedDecode(updated.currentDecodeId, {
                    sections: updated.results,
                    graph: updated.graph,
                });

                return { ok: true };
            } catch (error) {
                console.error("section retry failed", error);

                flushNow();

                useStore
                    .getState()
                    .failSection(
                        section,
                        "This section couldn't be generated. The connection may have dropped."
                    );

                useStore.getState().finishDecode();

                return { ok: false, reason: "network-error" };
            }
        },
        [bufferToken, flushNow]
    );

    return { runDecode, runRetry };
}

async function persistDecode(input: {
    text: string;
    audience: LocalDecode["audience"];
    sections: LocalDecode["sections"];
    graph: ConceptGraph | null;
}): Promise<LocalDecode | null> {
    try {
        return await createLocalDecode({
            text: input.text,
            audience: input.audience,
            sections: input.sections,
            graph: input.graph,
        });
    } catch (error) {
        console.error("local save failed", error);
        return null;
    }
}

async function updatePersistedDecode(
    id: string | null,
    patch: { sections: LocalDecode["sections"]; graph: ConceptGraph | null }
): Promise<void> {
    if (!id) return;

    try {
        const existing = await getDecode(id);

        if (!existing) return;

        await saveDecode({
            ...existing,
            sections: patch.sections,
            graph: patch.graph,
        });
    } catch (error) {
        console.error("local update failed", error);
    }
}