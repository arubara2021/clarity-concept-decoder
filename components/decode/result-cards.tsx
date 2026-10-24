"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { Skeleton } from "@/components/ui/skeleton";
import { DecodeTransitionLine } from "@/components/decode/decode-transition-line";
import { SectionRecovery } from "@/components/decode/recovery-state";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/cn";
import type { CardState, DecodeSection, Sections } from "@/lib/types";

type ResultCardsProps = {
    sections?: Sections;
    cardStates?: Record<DecodeSection, CardState>;
    sectionErrors?: Partial<Record<DecodeSection, string>>;
    onRetry?: (section: DecodeSection) => void;
    onFullRetry?: () => void;
    onSourceScroll?: (paragraphIndex: number) => void;
};

type JargonPair = { term: string; translation: string };
type Segment =
    | { kind: "text"; value: string }
    | { kind: "cite"; values: number[] };

const order: DecodeSection[] = ["tldr", "analogy", "jargon", "takeaway"];

const labels: Record<DecodeSection, string> = {
    tldr: "TL;DR",
    analogy: "The Analogy",
    jargon: "Jargon Buster",
    takeaway: "The One Thing to Remember",
};

const indexes: Record<DecodeSection, string> = {
    tldr: "01",
    analogy: "02",
    jargon: "03",
    takeaway: "04",
};

const descriptions: Record<DecodeSection, string> = {
    tldr: "The central idea in one sentence",
    analogy: "A familiar comparison that makes it click",
    jargon: "Difficult terms translated plainly",
    takeaway: "The one thing worth remembering",
};

const reservedHeights: Record<DecodeSection, string> = {
    tldr: "min-h-[7rem]",
    analogy: "min-h-[8rem]",
    jargon: "min-h-[11rem]",
    takeaway: "min-h-[6rem]",
};

function parseJargon(text: string): JargonPair[] {
    const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

    const pairs: JargonPair[] = [];

    for (const line of lines) {
        const arrow = line.match(/^(.+?)\s*->\s*(.+)$/);
        const dashed = line.match(/^(.{3,60}?)\s+[-–—:]\s+(.+)$/);
        const match = arrow ?? dashed;

        if (match) {
            pairs.push({ term: match[1].trim(), translation: match[2].trim() });
            continue;
        }

        if (line.length <= 80) {
            pairs.push({ term: line, translation: "" });
            continue;
        }

        if (pairs.length > 0) {
            pairs[pairs.length - 1].translation =
                `${pairs[pairs.length - 1].translation} ${line}`.trim();
        }
    }

    return pairs.filter((pair) => pair.term.length > 0);
}

function parseCitations(text: string): Segment[] {
    const segments: Segment[] = [];
    const regex = /\[p(\d+(?:\s*,\s*p\d+)*)\]/g;
    let cursor = 0;
    let match: RegExpExecArray | null;

    const pushCites = (values: number[]) => {
        const last = segments[segments.length - 1];
        if (last && last.kind === "cite") {
            last.values.push(...values);
            return;
        }
        segments.push({ kind: "cite", values });
    };

    while ((match = regex.exec(text)) !== null) {
        if (match.index > cursor) {
            segments.push({ kind: "text", value: text.slice(cursor, match.index) });
        }

        const inner = match[1] ?? "";
        const numbers = inner
            .split(/,/)
            .map((part) => part.replace(/p/gi, "").trim())
            .filter((part) => part.length > 0)
            .map((part) => Number(part))
            .filter((value) => Number.isFinite(value) && value > 0);

        if (numbers.length === 0) {
            segments.push({ kind: "text", value: match[0] });
        } else {
            pushCites(numbers);
        }

        cursor = regex.lastIndex;
    }

    if (cursor < text.length) {
        segments.push({ kind: "text", value: text.slice(cursor) });
    }

    return segments;
}

function renderText(
    text: string,
    onSourceScroll?: (paragraphIndex: number) => void
): ReactNode {
    const segments = parseCitations(text);

    if (segments.length === 0) return text;
    if (segments.length === 1 && segments[0].kind === "text") return text;

    return segments.map((segment, index) => {
        if (segment.kind === "text") {
            return <span key={index}>{segment.value}</span>;
        }

        const label = segment.values.join(",");
        const markerClasses =
            "mx-0.5 inline-flex whitespace-nowrap items-center justify-center rounded-[5px] bg-[var(--accent-tint)] px-1.5 align-super text-[0.62rem] font-bold leading-[1.35] tracking-tight text-[var(--accent)] transition-colors hover:bg-[var(--accent-ring)]";

        if (typeof onSourceScroll === "function") {
            return (
                <button
                    key={index}
                    type="button"
                    onClick={() => onSourceScroll(segment.values[0] ?? 1)}
                    aria-label={`Jump to source paragraph ${label}`}
                    className={markerClasses}
                >
                    {label}
                </button>
            );
        }

        return (
            <span key={index} aria-hidden="true" className={markerClasses}>
                {label}
            </span>
        );
    });
}

function SectionHeader({
    section,
    state,
}: {
    section: DecodeSection;
    state: CardState;
}) {
    return (
        <div className="flex items-start justify-between gap-4">
            <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-2)]">
                    {labels[section]}
                </p>
                <p className="mt-1 text-xs text-[var(--text-3)]">
                    {descriptions[section]}
                </p>
            </div>
            <div className="flex items-center gap-2">
                {state === "streaming" ? (
                    <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent)]"
                    />
                ) : null}
                <span className="text-[11px] tabular-nums text-[var(--text-3)]">
                    {indexes[section]}
                </span>
            </div>
        </div>
    );
}

function JargonList({
    text,
    onSourceScroll,
}: {
    text: string;
    onSourceScroll?: (paragraphIndex: number) => void;
}) {
    const pairs = parseJargon(text);

    if (pairs.length === 0) {
        return (
            <p className="whitespace-pre-line text-sm leading-7 text-[var(--text-1)]">
                {renderText(text, onSourceScroll)}
            </p>
        );
    }

    return (
        <dl className="grid gap-2">
            {pairs.map((pair, index) => (
                <motion.div
                    key={`${pair.term}-${index}`}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        delay: 0.06 + index * 0.03,
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                    }}
                    className="rounded-xl border border-[var(--border-faint)] bg-[var(--bg-0)] px-4 py-3 transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--bg-2)]"
                >
                    <dt className="text-sm font-semibold leading-6 text-[var(--text-0)]">
                        {renderText(pair.term, onSourceScroll)}
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-[var(--text-1)]">
                        {pair.translation.length > 0
                            ? renderText(pair.translation, onSourceScroll)
                            : "—"}
                    </dd>
                </motion.div>
            ))}
        </dl>
    );
}

function renderSectionBody(
    section: DecodeSection,
    text: string,
    onSourceScroll?: (paragraphIndex: number) => void
): ReactNode {
    if (section === "jargon") {
        return <JargonList text={text} onSourceScroll={onSourceScroll} />;
    }

    if (section === "tldr") {
        return (
            <p className="max-w-[46ch] text-2xl font-semibold leading-snug tracking-[-0.03em] text-[var(--text-0)]">
                {renderText(text, onSourceScroll)}
            </p>
        );
    }

    if (section === "analogy") {
        return (
            <blockquote className="max-w-[68ch] border-l-2 border-l-[var(--border-strong)] pl-4 text-base leading-8 text-[var(--text-1)]">
                {renderText(text, onSourceScroll)}
            </blockquote>
        );
    }

    return (
        <p className="max-w-[58ch] text-xl font-bold leading-relaxed tracking-[-0.02em] text-[var(--text-0)]">
            {renderText(text, onSourceScroll)}
        </p>
    );
}

function cardClasses(section: DecodeSection): string {
    return cn(
        "rounded-2xl border",
        section === "takeaway"
            ? "border-[var(--border-faint)] bg-[var(--bg-2)] p-8"
            : "border-[var(--border)] bg-[var(--bg-1)] shadow-[var(--shadow-card)]",
        section === "tldr" && "overflow-hidden p-8",
        section === "analogy" && "border-l-2 border-l-[var(--border-strong)] p-6",
        section === "jargon" && "p-6"
    );
}

export function ResultCards(props: ResultCardsProps = {}) {
    const storeSections = useStore((s) => s.results);
    const storeCardStates = useStore((s) => s.cardStates);
    const storeSectionErrors = useStore((s) => s.sectionErrors);
    const isDecoding = useStore((s) => s.isDecoding);

    const sections = props.sections ?? storeSections;
    const cardStates = props.cardStates ?? storeCardStates;
    const sectionErrors = props.sectionErrors ?? storeSectionErrors;

    const hasAny = order.some(
        (section) =>
            cardStates[section] !== "empty" || sections[section].length > 0
    );

    if (!hasAny) return null;

    const anyLoading = order.some(
        (section) =>
            cardStates[section] === "skeleton" ||
            cardStates[section] === "streaming"
    );

    return (
        <section className="flex flex-col gap-5" aria-live="polite">
            <DecodeTransitionLine isActive={isDecoding || anyLoading} />

            <motion.div layout className="flex flex-col gap-5">
                {order.map((section, index) => {
                    const text = sections[section];
                    const state = cardStates[section];
                    const error = sectionErrors[section];
                    const isEmpty = text.trim().length === 0;
                    const showSkeleton =
                        state === "skeleton" || (state === "streaming" && isEmpty);
                    const showError = state === "error" && typeof error === "string";
                    const showContent = !showSkeleton && !showError;
                    const reserve = state !== "complete";
                    const hasOtherComplete = order.some(
                        (other) =>
                            other !== section &&
                            cardStates[other] === "complete" &&
                            sections[other].trim().length > 0
                    );

                    return (
                        <motion.article
                            key={section}
                            layout
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                delay: index * 0.04,
                                type: "spring",
                                stiffness: 360,
                                damping: 32,
                            }}
                            data-section={section}
                            data-state={state}
                        >
                            {showError ? (
                                <SectionRecovery
                                    message={
                                        typeof error === "string"
                                            ? error
                                            : "This section couldn't be generated. The connection may have dropped."
                                    }
                                    hasOtherComplete={hasOtherComplete}
                                    onRetrySection={() => props.onRetry?.(section)}
                                    onRetryFull={props.onFullRetry}
                                />
                            ) : (
                                <div className={cardClasses(section)}>
                                    <SectionHeader section={section} state={state} />
                                    <div className={cn("mt-4", reserve && reservedHeights[section])}>
                                        {showSkeleton ? (
                                            <div className="flex flex-col gap-2 pt-1">
                                                {section === "tldr" || section === "takeaway" ? (
                                                    <Skeleton shape="line" className="h-5 w-3/4" />
                                                ) : null}
                                                <Skeleton
                                                    shape="line"
                                                    className={
                                                        section === "tldr" ? "h-5 w-2/3" : "h-3.5 w-4/5"
                                                    }
                                                />
                                                <Skeleton shape="line" className="h-3.5 w-3/5" />
                                                {section === "analogy" || section === "jargon" ? (
                                                    <Skeleton shape="line" className="h-3.5 w-1/2" />
                                                ) : null}
                                            </div>
                                        ) : null}
                                        {showContent
                                            ? renderSectionBody(section, text, props.onSourceScroll)
                                            : null}
                                    </div>
                                </div>
                            )}
                        </motion.article>
                    );
                })}
            </motion.div>
        </section>
    );
}