"use client";

import { AnimatePresence, motion } from "motion/react";
import { Skeleton } from "@/components/ui/skeleton";
import { DecodeTransitionLine } from "@/components/decode/decode-transition-line";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/cn";
import type { DecodeSection } from "@/lib/types";

type DecodeStageProps = {
    navigating?: boolean;
};

const sectionOrder: DecodeSection[] = ["tldr", "analogy", "jargon", "takeaway"];

const sectionLabels: Record<DecodeSection, string> = {
    tldr: "TL;DR",
    analogy: "The Analogy",
    jargon: "Jargon Buster",
    takeaway: "The One Thing to Remember",
};

const sectionIndexes: Record<DecodeSection, string> = {
    tldr: "01",
    analogy: "02",
    jargon: "03",
    takeaway: "04",
};

const reservedHeights: Record<DecodeSection, string> = {
    tldr: "min-h-[4.5rem]",
    analogy: "min-h-[5rem]",
    jargon: "min-h-[6.5rem]",
    takeaway: "min-h-[4rem]",
};

export function DecodeStage({ navigating = false }: DecodeStageProps) {
    const cardStates = useStore((s) => s.cardStates);
    const results = useStore((s) => s.results);

    return (
        <div className="flex flex-col px-4 pb-10 pt-4 sm:px-6" aria-live="polite">
            <DecodeTransitionLine isActive className="mb-2" />

            <p className="mt-4 text-[11px] leading-4 text-[var(--text-3)]">
                {navigating
                    ? "Opening your saved result."
                    : "Building your mental model, section by section."}
            </p>

            <div className="mt-2 flex flex-col">
                {sectionOrder.map((section, index) => {
                    const state = cardStates[section];
                    const text = results[section];
                    const showSkeleton =
                        state === "empty" ||
                        state === "skeleton" ||
                        (state === "streaming" && text.length === 0);

                    return (
                        <motion.section
                            key={section}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                delay: index * 0.05,
                                type: "spring",
                                stiffness: 380,
                                damping: 30,
                            }}
                            className={cn("py-5", index > 0 && "hairline-top")}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-2.5">
                                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-[var(--border-faint)] bg-[var(--bg-1)] text-[10px] font-semibold tabular-nums text-[var(--text-2)]">
                                        {sectionIndexes[section]}
                                    </span>
                                    <p className="truncate text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-1)]">
                                        {sectionLabels[section]}
                                    </p>
                                </div>

                                {state === "streaming" ? (
                                    <motion.span
                                        aria-hidden="true"
                                        className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--text-0)]"
                                        animate={{ opacity: [0.35, 1, 0.35] }}
                                        transition={{
                                            duration: 1.4,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                        }}
                                    />
                                ) : null}
                            </div>

                            <div className={cn("mt-3 pl-[34px]", reservedHeights[section])}>
                                <AnimatePresence initial={false} mode="wait">
                                    {showSkeleton ? (
                                        <motion.div
                                            key="skeleton"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.18 }}
                                            className="flex flex-col gap-2 pt-1"
                                        >
                                            <Skeleton shape="line" className="h-3 w-4/5" />
                                            <Skeleton shape="line" className="h-3 w-3/5" />
                                            {section === "analogy" || section === "jargon" ? (
                                                <Skeleton shape="line" className="h-3 w-1/2" />
                                            ) : null}
                                        </motion.div>
                                    ) : (
                                        <motion.p
                                            key="content"
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                            className="line-clamp-4 text-sm leading-6 text-[var(--text-1)]"
                                        >
                                            {text}
                                            {state === "streaming" ? (
                                                <motion.span
                                                    aria-hidden="true"
                                                    className="ml-0.5 inline-block h-3.5 w-px align-middle bg-[var(--text-0)]"
                                                    animate={{ opacity: [1, 0, 1] }}
                                                    transition={{
                                                        duration: 1,
                                                        repeat: Infinity,
                                                        ease: "easeInOut",
                                                    }}
                                                />
                                            ) : null}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.section>
                    );
                })}
            </div>
        </div>
    );
}