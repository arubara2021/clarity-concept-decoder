"use client";

import { Fragment } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

type WordRevealProps = {
    text: string;
    accent?: string;
    className?: string;
    delay?: number;
    staggerDelay?: number;
};

export function WordReveal({
    text,
    accent,
    className,
    delay = 0,
    staggerDelay = 0.05,
}: WordRevealProps) {
    const reduceMotion = useReducedMotion();

    const words = text.split(/\s+/).filter((word) => word.length > 0);

    return (
        <span className={cn("inline", className)}>
            {words.map((word, index) => {
                const stripped = word.replace(/[.,!?;:]+$/g, "");
                const isAccent = accent
                    ? stripped.toLowerCase() === accent.toLowerCase()
                    : false;

                const wordDelay = delay + index * staggerDelay;

                return (
                    <Fragment key={`${word}-${index}`}>
                        <span className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
                            {reduceMotion ? (
                                <span
                                    className={cn(
                                        "inline-block",
                                        isAccent && "text-[var(--accent)]"
                                    )}
                                >
                                    {word}
                                </span>
                            ) : (
                                <motion.span
                                    className={cn(
                                        "inline-block will-change-transform",
                                        isAccent && "text-[var(--accent)]"
                                    )}
                                    initial={{ y: "110%", opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 320,
                                        damping: 30,
                                        delay: wordDelay,
                                    }}
                                >
                                    {word}
                                </motion.span>
                            )}
                        </span>

                        {index < words.length - 1 ? " " : null}
                    </Fragment>
                );
            })}
        </span>
    );
}