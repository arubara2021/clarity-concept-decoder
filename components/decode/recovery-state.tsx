"use client";

import { motion } from "motion/react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type SectionRecoveryProps = {
    message: string;
    hasOtherComplete: boolean;
    onRetrySection: () => void;
    onRetryFull?: () => void;
};

type GlobalErrorProps = {
    message: string;
    onRetry: () => void;
};

export function SectionRecovery({
    message,
    hasOtherComplete,
    onRetrySection,
    onRetryFull,
}: SectionRecoveryProps) {
    const showFull = typeof onRetryFull === "function";

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
        >
            <div className="rounded-2xl border border-[var(--danger)] bg-[var(--danger-tint)] p-6">
                <div className="flex flex-col gap-5">
                    <div className="flex items-start gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--danger)] bg-[var(--danger-tint)] text-[var(--danger)]">
                            <AlertTriangle size={14} aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-[var(--danger)]">
                                Section unavailable
                            </p>
                            <p className="mt-1 text-sm leading-6 text-[var(--text-1)]">
                                {message}
                            </p>
                            {hasOtherComplete ? (
                                <p className="mt-2 text-xs text-[var(--text-2)]">
                                    Your completed sections are preserved.
                                </p>
                            ) : null}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={onRetrySection}
                            icon={<RefreshCw size={12} aria-hidden="true" />}
                        >
                            Retry this section
                        </Button>
                        {showFull ? (
                            <Button variant="ghost" size="sm" onClick={onRetryFull}>
                                Retry full decode
                            </Button>
                        ) : null}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export function GlobalError({ message, onRetry }: GlobalErrorProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ type: "spring", stiffness: 360, damping: 30 }}
            role="alert"
        >
            <div className="mx-auto max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--bg-1)] p-8 text-center shadow-[var(--shadow-float)]">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-[var(--danger)] bg-[var(--danger-tint)] text-[var(--danger)]">
                    <AlertTriangle size={18} aria-hidden="true" />
                </span>
                <h2 className="mt-5 text-lg font-semibold tracking-[-0.02em] text-[var(--text-0)]">
                    The decoder is unavailable
                </h2>
                <p className="mx-auto mt-2 max-w-[44ch] text-sm leading-6 text-[var(--text-2)]">
                    {message}
                </p>
                <Button
                    className="mx-auto mt-6"
                    onClick={onRetry}
                    icon={<RefreshCw size={13} aria-hidden="true" />}
                >
                    Try again
                </Button>
            </div>
        </motion.div>
    );
}