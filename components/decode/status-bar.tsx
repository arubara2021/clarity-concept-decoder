"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { MouseEvent } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { CircleAlert, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Kbd } from "@/components/ui/kbd";
import { AudienceSegment } from "@/components/decode/audience-selector";
import { MAX_SOURCE_CHARS } from "@/components/decode/source-composer";
import { useStore } from "@/lib/store";
import { getRateBudget } from "@/lib/rate-budget";
import type { BudgetStatus } from "@/lib/rate-budget";
import { cn } from "@/lib/cn";
import type { DecodeRunResult } from "@/lib/use-decode-stream";

type StatusBarProps = {
    onDecode: () => Promise<DecodeRunResult>;
};

const neutralBudget: BudgetStatus = {
    remaining: 20,
    limit: 20,
    resetAt: 0,
    windowStart: 0,
    exhausted: false,
};

function describeReset(resetAt: number): string {
    const minutes = Math.max(1, Math.round((resetAt - Date.now()) / 60000));
    return `Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`;
}

export function StatusBar({ onDecode }: StatusBarProps) {
    const text = useStore((s) => s.text);
    const isDecoding = useStore((s) => s.isDecoding);
    const isStale = useStore((s) => s.isStale);

    const [localError, setLocalError] = useState("");
    const [tick, setTick] = useState(0);
    const [mounted, setMounted] = useState(false);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const springX = useSpring(x, { stiffness: 300, damping: 20, mass: 0.6 });
    const springY = useSpring(y, { stiffness: 300, damping: 20, mass: 0.6 });

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const timer = window.setInterval(() => {
            setTick((value) => value + 1);
        }, 30000);

        return () => {
            window.clearInterval(timer);
        };
    }, []);

    const budget = useMemo<BudgetStatus>(() => {
        if (!mounted) return neutralBudget;
        return getRateBudget();
    }, [isDecoding, text, tick, mounted]);

    const length = text.length;
    const nearLimit = length >= MAX_SOURCE_CHARS * 0.9;
    const used = budget.limit - budget.remaining;
    const budgetPercent = Math.min(100, (used / budget.limit) * 100);
    const isEmpty = text.trim().length === 0;
    const isRateLimited = budget.exhausted;

    useEffect(() => {
        if (text.trim().length > 0 && localError === "Please paste some text to decode.") {
            setLocalError("");
        }
    }, [text, localError]);

    const handleDecode = useCallback(async () => {
        setLocalError("");

        if (isEmpty) {
            setLocalError("Please paste some text to decode.");
            return;
        }

        if (isRateLimited) {
            setLocalError(describeReset(budget.resetAt));
            return;
        }

        const result = await onDecode();

        if (!result.ok) {
            if (result.reason === "empty-text") {
                setLocalError("Please paste some text to decode.");
                return;
            }

            if (result.reason === "rate-limited") {
                setLocalError(describeReset(result.resetAt ?? budget.resetAt));
                return;
            }

            if (result.reason === "already-decoding") {
                setLocalError("Decode is already running.");
                return;
            }

            setLocalError("The decoder is unavailable. Try again.");
        }
    }, [budget.resetAt, isEmpty, isRateLimited, onDecode]);

    function handleMagneticMove(event: MouseEvent<HTMLDivElement>) {
        const rect = event.currentTarget.getBoundingClientRect();
        const offsetX = (event.clientX - rect.left - rect.width / 2) / rect.width;
        const offsetY = (event.clientY - rect.top - rect.height / 2) / rect.height;

        x.set(offsetX * 8);
        y.set(offsetY * 6);
    }

    function handleMagneticLeave() {
        x.set(0);
        y.set(0);
    }

    return (
        <div
            role="toolbar"
            aria-label="Decode controls"
            className="sticky bottom-0 z-30 mt-auto shrink-0 hairline-top bg-[var(--statusbar-bg)] pb-[max(0.75rem,env(safe-area-inset-bottom))] pl-[max(1.25rem,env(safe-area-inset-left))] pr-5 pt-3 backdrop-blur-xl sm:pr-7"
        >
            <AnimatePresence initial={false}>
                {localError ? (
                    <motion.p
                        key="status-error"
                        role="alert"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="mb-2 flex items-center gap-2 text-xs font-medium text-[var(--danger)]"
                    >
                        <CircleAlert size={12} aria-hidden="true" />
                        {localError}
                    </motion.p>
                ) : null}
            </AnimatePresence>

            <div className="flex flex-col gap-3">
                <AudienceSegment disabled={isDecoding} className="w-full" />

                <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                    <div className="flex items-center gap-5">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-3)]">
                                Chars
                            </span>
                            <span
                                className={cn(
                                    "text-xs tabular-nums text-[var(--text-1)]",
                                    nearLimit && "opacity-60"
                                )}
                            >
                                {length.toLocaleString("en-US")} / {MAX_SOURCE_CHARS.toLocaleString("en-US")}
                            </span>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-3)]">
                                Budget
                            </span>
                            <div className="flex items-center gap-2">
                                <div className="h-1 w-16 overflow-hidden rounded-full bg-[var(--bg-3)]">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-[width] duration-300",
                                            budget.exhausted ? "bg-[var(--danger)]" : "bg-[var(--text-1)]"
                                        )}
                                        style={{ width: `${budgetPercent}%` }}
                                    />
                                </div>
                                <span className="text-xs tabular-nums text-[var(--text-3)]">
                                    {used}/{budget.limit}
                                </span>
                            </div>
                        </div>

                        {isStale ? (
                            <Badge variant="warning" dot pulse>
                                Results out of date
                            </Badge>
                        ) : null}
                    </div>

                    <div className="ml-auto flex items-center gap-3">
                        <span className="hidden items-center gap-2 text-[11px] text-[var(--text-3)] md:inline-flex">
                            <Kbd>Enter</Kbd>
                            to decode
                        </span>

                        <motion.div
                            onMouseMove={handleMagneticMove}
                            onMouseLeave={handleMagneticLeave}
                            style={{ x: springX, y: springY }}
                        >
                            <Button
                                size="lg"
                                loading={isDecoding}
                                disabled={isDecoding || isRateLimited}
                                onClick={() => void handleDecode()}
                                icon={!isDecoding ? <Sparkles size={14} aria-hidden="true" /> : undefined}
                                className="dock-glow rounded-full"
                            >
                                {isDecoding ? "Decoding" : "Decode"}
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}