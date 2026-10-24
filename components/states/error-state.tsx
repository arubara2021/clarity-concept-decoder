"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/cn";

type ErrorStateProps = {
    title?: string;
    message?: string;
    action?: ReactNode;
    fullScreen?: boolean;
    compact?: boolean;
    className?: string;
};

export function ErrorState({
    title = "Something went wrong",
    message = "Please try again.",
    action,
    fullScreen = false,
    compact = false,
    className,
}: ErrorStateProps) {
    return (
        <motion.div
            role="alert"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 360, damping: 30 }}
            className={cn(
                "grid place-items-center rounded-2xl border border-[color:var(--danger)] bg-[var(--danger-tint)] text-center",
                fullScreen
                    ? "min-h-dvh rounded-none border-0 px-6"
                    : compact
                        ? "px-6 py-10"
                        : "px-8 py-16",
                className
            )}
        >
            <div className="max-w-md">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-[color:var(--danger)] bg-[var(--bg-1)] text-[color:var(--danger)]">
                    <AlertTriangle size={18} aria-hidden="true" />
                </span>

                <h2 className="mt-5 text-lg font-semibold tracking-[-0.02em] text-[color:var(--text-0)]">
                    {title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-[color:var(--text-1)]">
                    {message}
                </p>

                {action ? (
                    <div className="mt-6 flex justify-center">{action}</div>
                ) : null}
            </div>
        </motion.div>
    );
}