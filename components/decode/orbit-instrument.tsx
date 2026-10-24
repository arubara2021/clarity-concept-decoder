"use client";

import { motion, useReducedMotion } from "motion/react";
import { Sparkles } from "lucide-react";
import { WordReveal } from "@/components/ui/word-reveal";
import { Button } from "@/components/ui/button";

type OrbitInstrumentProps = {
    onTrySample?: () => void;
};

const contract = [
    { index: "01", label: "TL;DR" },
    { index: "02", label: "Analogy" },
    { index: "03", label: "Jargon" },
    { index: "04", label: "Takeaway" },
];

export function OrbitInstrument({ onTrySample }: OrbitInstrumentProps) {
    const reduceMotion = useReducedMotion();

    return (
        <div className="grid flex-1 place-items-center px-6 py-12 text-center">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex max-w-md flex-col items-center"
            >
                <div className="relative h-28 w-28" aria-hidden="true">
                    <motion.span
                        className="absolute inset-0 rounded-full border border-[var(--border)]"
                        animate={reduceMotion ? {} : { rotate: 360 }}
                        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
                    >
                        <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--text-0)]" />
                    </motion.span>

                    <motion.span
                        className="absolute inset-3 rounded-full border border-[var(--border-faint)]"
                        animate={reduceMotion ? {} : { rotate: -360 }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    >
                        <span className="absolute left-1/2 top-0 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--text-2)]" />
                    </motion.span>

                    <motion.span
                        className="absolute inset-6 rounded-full border border-dashed border-[var(--border-faint)]"
                        animate={reduceMotion ? {} : { rotate: 360 }}
                        transition={{ duration: 34, repeat: Infinity, ease: "linear" }}
                    />

                    <motion.span
                        className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--text-1)]"
                        animate={
                            reduceMotion
                                ? {}
                                : {
                                    opacity: [0.45, 1, 0.45],
                                    scale: [1, 1.18, 1],
                                }
                        }
                        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                    />
                </div>

                <h2 className="mt-8 text-lg font-semibold tracking-[-0.02em] text-[var(--text-0)]">
                    <WordReveal text="Your decoded breakdown will appear here." />
                </h2>

                <p className="mt-2 max-w-[42ch] text-sm leading-6 text-[var(--text-2)]">
                    Paste text, choose an audience, and press Decode. Four cards and a
                    concept map rise into place.
                </p>

                <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
                    {contract.map((item) => (
                        <span
                            key={item.index}
                            className="inline-flex items-center gap-2 rounded-full border border-[var(--border-faint)] bg-[var(--glass-bg)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-2)]"
                        >
                            <span className="tabular-nums text-[var(--text-3)]">
                                {item.index}
                            </span>
                            {item.label}
                        </span>
                    ))}
                </div>

                {onTrySample ? (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mt-7"
                        onClick={onTrySample}
                        icon={<Sparkles size={13} aria-hidden="true" />}
                    >
                        Try the sample paragraph
                    </Button>
                ) : null}
            </motion.div>
        </div>
    );
}