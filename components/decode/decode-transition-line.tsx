"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

type DecodeTransitionLineProps = {
    isActive: boolean;
    className?: string;
};

export function DecodeTransitionLine({
    isActive,
    className,
}: DecodeTransitionLineProps) {
    const reduceMotion = useReducedMotion();

    return (
        <div className={cn("relative", className)}>
            <div className="relative h-px w-full rounded-full bg-[var(--border-faint)]">
                <AnimatePresence initial={false}>
                    {isActive ? (
                        <motion.div
                            key="signature-line"
                            className="absolute inset-y-0 left-0 w-full origin-left"
                            initial={reduceMotion ? { opacity: 1 } : { scaleX: 0, opacity: 0 }}
                            animate={reduceMotion ? { opacity: 1 } : { scaleX: 1, opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={
                                reduceMotion
                                    ? { duration: 0 }
                                    : {
                                        type: "spring",
                                        stiffness: 150,
                                        damping: 26,
                                        mass: 0.9,
                                    }
                            }
                        >
                            <span
                                aria-hidden="true"
                                className="absolute -inset-y-[3px] left-0 w-full rounded-full bg-[var(--accent)] opacity-15 blur-[2px]"
                            />
                            <span className="absolute inset-y-0 left-0 w-full rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent-ring)]" />
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>
        </div>
    );
}