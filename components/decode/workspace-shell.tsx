"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";

type WorkspaceShellProps = {
    left: ReactNode;
    right: ReactNode;
    className?: string;
};

function PaneAmbient() {
    return (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="grid-overlay absolute inset-0 opacity-30" />
            <div className="hero-noise absolute inset-0 opacity-60" />
            <div className="hero-vignette absolute inset-0" />
        </div>
    );
}

export function WorkspaceShell({ left, right, className }: WorkspaceShellProps) {
    return (
        <div className={cn("relative w-full", className)}>
            <div className="grid grid-cols-1 gap-3 lg:h-full lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)] lg:gap-0">
                <motion.section
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 32, delay: 0.1 }}
                    aria-label="Source canvas"
                    className="canvas-surface relative flex h-[72dvh] min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--border-faint)] lg:h-auto lg:min-h-0 lg:rounded-l-2xl lg:rounded-r-none lg:border-r-0"
                >
                    <PaneAmbient />
                    <div className="relative z-10 flex min-h-0 flex-1 flex-col">{left}</div>
                </motion.section>

                <div aria-hidden="true" className="relative hidden lg:block">
                    <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[var(--divider-hair)] to-transparent" />
                    <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1">
                        <span className="h-1 w-1 rounded-full bg-[var(--border-strong)]" />
                        <span className="h-10 w-[2px] rounded-full bg-[var(--border-strong)]" />
                        <span className="h-1 w-1 rounded-full bg-[var(--border-strong)]" />
                    </div>
                </div>

                <motion.section
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 32, delay: 0.18 }}
                    aria-label="Output canvas"
                    className="canvas-surface-alt relative flex h-[72dvh] min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--border-faint)] lg:h-auto lg:min-h-0 lg:rounded-l-none lg:rounded-r-2xl lg:border-l-0"
                >
                    <PaneAmbient />
                    <div className="relative z-10 flex min-h-0 flex-1 flex-col">{right}</div>
                </motion.section>
            </div>
        </div>
    );
}