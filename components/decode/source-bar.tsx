"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { previewSnippet } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Audience } from "@/lib/types";

type SourceBarProps = {
    text: string;
    title: string;
    audience: Audience;
    open?: boolean;
    onOpenChange?: (next: boolean) => void;
    defaultOpen?: boolean;
    className?: string;
};

export function paragraphId(index: number): string {
    return `src-p-${index}`;
}

export function SourceBar({
    text,
    title,
    audience,
    open,
    onOpenChange,
    defaultOpen = false,
    className,
}: SourceBarProps) {
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const isControlled = typeof open === "boolean";
    const isOpen = isControlled ? open : internalOpen;

    const paragraphs = useMemo(
        () =>
            text
                .split(/\r?\n{2,}/)
                .map((block) => block.trim())
                .filter((block) => block.length > 0),
        [text]
    );

    const preview = previewSnippet(text, title);

    function toggle() {
        const next = !isOpen;
        if (!isControlled) setInternalOpen(next);
        onOpenChange?.(next);
    }

    return (
        <section
            className={cn(
                "overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-1)] shadow-[var(--shadow-card)]",
                className
            )}
        >
            <button
                type="button"
                onClick={toggle}
                aria-expanded={isOpen}
                className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-[var(--bg-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
            >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[var(--border)] bg-[var(--bg-0)] text-[var(--text-2)]">
                    <FileText size={14} aria-hidden="true" />
                </span>

                <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-2)]">
                            Original source
                        </span>
                        <Badge variant="neutral">{audience}</Badge>
                    </span>
                    <span className="mt-1 block truncate text-xs text-[var(--text-3)]">
                        {preview}
                    </span>
                </span>

                <span className="flex shrink-0 items-center gap-3">
                    <span className="hidden text-[11px] tabular-nums text-[var(--text-3)] sm:inline">
                        {text.length.toLocaleString("en-US")} chars
                    </span>
                    <motion.span
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ type: "spring", stiffness: 420, damping: 32 }}
                        className="text-[var(--text-2)]"
                        aria-hidden="true"
                    >
                        <ChevronDown size={16} />
                    </motion.span>
                </span>
            </button>

            <AnimatePresence initial={false}>
                {isOpen ? (
                    <motion.div
                        key="source-body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                            height: { type: "spring", stiffness: 320, damping: 34 },
                            opacity: { duration: 0.18 },
                        }}
                        className="overflow-hidden"
                    >
                        <div className="no-scrollbar max-h-[55dvh] overflow-y-auto border-t border-[var(--border)] px-5 py-4">
                            <div className="flex flex-col gap-4 text-sm leading-7 text-[var(--text-1)]">
                                {paragraphs.map((block, index) => (
                                    <p
                                        key={`${paragraphId(index + 1)}-${index}`}
                                        id={paragraphId(index + 1)}
                                        data-paragraph={index + 1}
                                        className="whitespace-pre-wrap break-words transition-colors duration-300"
                                    >
                                        {block}
                                    </p>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </section>
    );
}