"use client";

import { motion } from "motion/react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/cn";
import type { Audience } from "@/lib/types";

const audiences: Audience[] = ["Student", "Executive", "Developer (Non-ML)"];

const contracts: Record<Audience, string> = {
    Student:
        "Warm and analogy-heavy. Assumes no domain background. Explains what and why.",
    Executive:
        "Crisp and outcome-focused. Assumes business literacy. Explains so what and what to do.",
    "Developer (Non-ML)":
        "Technically precise. Assumes software fluency, not ML fluency. Explains how it works.",
};

type AudienceSegmentProps = {
    disabled?: boolean;
    className?: string;
};

export function AudienceSegment({
    disabled = false,
    className,
}: AudienceSegmentProps) {
    const audience = useStore((s) => s.audience);
    const setAudience = useStore((s) => s.setAudience);

    return (
        <div className={cn("flex min-w-0 flex-col gap-2", className)}>
            <div
                role="radiogroup"
                aria-label="Audience"
                className="no-scrollbar flex max-w-full flex-nowrap items-center gap-1 overflow-x-auto rounded-full border border-[var(--border)] bg-[var(--bg-0)] p-1"
            >
                {audiences.map((option) => {
                    const active = audience === option;

                    return (
                        <button
                            key={option}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            disabled={disabled}
                            onClick={() => setAudience(option)}
                            className={cn(
                                "relative shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] disabled:cursor-not-allowed disabled:opacity-60",
                                active
                                    ? "text-[var(--accent-contrast)]"
                                    : "text-[var(--text-2)] hover:text-[var(--text-0)]"
                            )}
                        >
                            {active ? (
                                <motion.span
                                    layoutId="audience-segment-pill"
                                    className="absolute inset-0 rounded-full"
                                    style={{ backgroundColor: "var(--accent)" }}
                                    transition={{ type: "spring", stiffness: 460, damping: 34 }}
                                />
                            ) : null}
                            <span className="relative z-10">{option}</span>
                        </button>
                    );
                })}
            </div>

            <p
                title={contracts[audience]}
                className="truncate text-[11px] leading-4 text-[var(--text-3)]"
            >
                {contracts[audience]}
            </p>
        </div>
    );
}