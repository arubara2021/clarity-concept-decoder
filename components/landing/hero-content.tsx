"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";
import { ArrowRight, Network, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HeroContent() {
    const router = useRouter();
    const reduceMotion = useReducedMotion();
    const { resolvedTheme } = useTheme();

    // Hydration fix
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    const isLight = mounted && resolvedTheme === "light";

    const trustItems = [
        { icon: ShieldCheck, label: "Local-first" },
        { icon: Network, label: "Concept map" },
        { icon: Sparkles, label: "Source grounded" },
    ];

    return (
        <div className="relative z-10 mx-auto w-[min(1160px,calc(100%-2rem))]">
            <motion.div
                initial={
                    reduceMotion
                        ? { opacity: 1 }
                        : { opacity: 0, y: 26, filter: "blur(6px)" }
                }
                animate={
                    reduceMotion
                        ? { opacity: 1 }
                        : { opacity: 1, y: 0, filter: "blur(0px)" }
                }
                transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
                className="relative mx-auto max-w-3xl text-center"
            >
                <div
                    aria-hidden="true"
                    className="hero-text-halo pointer-events-none absolute -inset-x-16 -inset-y-12 -z-10"
                />

                <motion.div
                    initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 18, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 28 }}
                >
                    <Badge variant="neutral" dot pulse>
                        Clarity concept decoder
                    </Badge>
                </motion.div>

                <motion.h1
                    initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 26 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08, type: "spring", stiffness: 280, damping: 30 }}
                    className="mt-8 text-5xl font-semibold leading-[0.98] tracking-[-0.06em] text-[var(--text-0)] sm:text-6xl lg:text-7xl"
                >
                    Understand anything,
                    <span
                        className={`text-gradient mt-2 block ${isLight ? "" : "animate-gradient-shift"}`}
                    >
                        at your level.
                    </span>
                </motion.h1>

                <motion.p
                    initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.16, type: "spring", stiffness: 260, damping: 28 }}
                    className="mx-auto mt-6 max-w-[64ch] text-base leading-7 text-[var(--text-2)] sm:text-lg sm:leading-8"
                >
                    Paste dense text, drop a document, or extract a page. Clarity rebuilds
                    the explanation into a TL;DR, an analogy, jargon translation, one
                    takeaway, and a concept map.
                </motion.p>

                <motion.div
                    initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.24, type: "spring", stiffness: 260, damping: 28 }}
                    className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
                >
                    <Button size="lg" onClick={() => router.push("/decode")}>
                        Start decoding
                        <ArrowRight
                            size={15}
                            aria-hidden="true"
                            className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                    </Button>

                    <Button variant="ghost" size="lg" onClick={() => router.push("/library")}>
                        Open library
                    </Button>
                </motion.div>

                <motion.div
                    initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.32, type: "spring", stiffness: 240, damping: 26 }}
                    className="mx-auto mt-12 flex max-w-2xl flex-wrap items-center justify-center gap-2"
                >
                    {trustItems.map(({ icon: Icon, label }) => (
                        <span
                            key={label}
                            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--glass-bg)] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-2)] backdrop-blur-xl"
                        >
                            <Icon size={12} aria-hidden="true" className="text-[var(--text-1)]" />
                            {label}
                        </span>
                    ))}
                </motion.div>
            </motion.div>
        </div>
    );
}