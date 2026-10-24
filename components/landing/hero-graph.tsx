"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";

const nodes = [
    { id: "source", label: "SOURCE", x: 220, y: 220, radius: 3.5, halo: 18 },
    { id: "tldr", label: "TLDR", x: 520, y: 160, radius: 4.5, halo: 24 },
    { id: "analogy", label: "ANALOGY", x: 830, y: 230, radius: 3.5, halo: 18 },
    { id: "jargon", label: "JARGON", x: 430, y: 470, radius: 3.5, halo: 18 },
    { id: "takeaway", label: "TAKEAWAY", x: 760, y: 480, radius: 4.5, halo: 24 },
    { id: "map", label: "MAP", x: 590, y: 620, radius: 5.5, halo: 30 },
];

const edges = [
    { id: "edge-1", x1: 220, y1: 220, x2: 520, y2: 160 },
    { id: "edge-2", x1: 520, y1: 160, x2: 830, y2: 230 },
    { id: "edge-3", x1: 220, y1: 220, x2: 430, y2: 470 },
    { id: "edge-4", x1: 830, y1: 230, x2: 760, y2: 480 },
    { id: "edge-5", x1: 430, y1: 470, x2: 590, y2: 620 },
    { id: "edge-6", x1: 760, y1: 480, x2: 590, y2: 620 },
];

export function HeroGraph({ className = "" }: { className?: string }) {
    const reduceMotion = useReducedMotion();
    const { resolvedTheme } = useTheme();

    // Hydration fix
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    const isLight = mounted && resolvedTheme === "light";

    const edgeStartOpacity = isLight ? 0.3 : 0.5;
    const edgeEndOpacity = isLight ? 0.08 : 0.12;

    return (
        <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 z-[2] text-[var(--text-0)] ${className}`}
        >
            <svg
                className="h-full w-full"
                viewBox="0 0 1200 800"
                fill="none"
                preserveAspectRatio="xMidYMid slice"
            >
                <defs>
                    <linearGradient id="hero-edge-themed" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="currentColor" stopOpacity={edgeStartOpacity} />
                        <stop offset="100%" stopColor="currentColor" stopOpacity={edgeEndOpacity} />
                    </linearGradient>
                </defs>

                {edges.map((edge, index) => (
                    <motion.line
                        key={edge.id}
                        x1={edge.x1}
                        y1={edge.y1}
                        x2={edge.x2}
                        y2={edge.y2}
                        stroke="url(#hero-edge-themed)"
                        strokeWidth="1"
                        vectorEffect="non-scaling-stroke"
                        initial={reduceMotion ? { opacity: 0.18 } : { opacity: 0, pathLength: 0 }}
                        animate={
                            reduceMotion
                                ? { opacity: 0.18 }
                                : {
                                    pathLength: 1,
                                    opacity: [0.08, 0.28, 0.08],
                                }
                        }
                        transition={
                            reduceMotion
                                ? { duration: 0 }
                                : {
                                    pathLength: {
                                        delay: 0.2 + index * 0.08,
                                        duration: 1.2,
                                        ease: "easeInOut",
                                    },
                                    opacity: {
                                        delay: 0.5 + index * 0.08,
                                        duration: 5.5,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    },
                                }
                        }
                    />
                ))}

                {nodes.map((node, index) => (
                    <motion.g
                        key={node.id}
                        initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={
                            reduceMotion
                                ? { duration: 0 }
                                : {
                                    delay: 0.25 + index * 0.08,
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 28,
                                }
                        }
                    >
                        <g style={{ opacity: "var(--hero-node-halo)" }}>
                            <motion.circle
                                cx={node.x}
                                cy={node.y}
                                r={node.halo}
                                fill="currentColor"
                                animate={
                                    reduceMotion
                                        ? {}
                                        : {
                                            opacity: [0.04, 0.12, 0.04],
                                        }
                                }
                                transition={
                                    reduceMotion
                                        ? { duration: 0 }
                                        : {
                                            delay: index * 0.12,
                                            duration: 5.2,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                        }
                                }
                            />
                        </g>

                        <motion.circle
                            cx={node.x}
                            cy={node.y}
                            r={node.radius}
                            fill="currentColor"
                            animate={
                                reduceMotion
                                    ? {}
                                    : {
                                        opacity: [0.35, 0.9, 0.35],
                                    }
                            }
                            transition={
                                reduceMotion
                                    ? { duration: 0 }
                                    : {
                                        delay: 0.15 + index * 0.1,
                                        duration: 4.4,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }
                            }
                        />

                        <text
                            x={node.x + 16}
                            y={node.y + 4}
                            fill="currentColor"
                            opacity="0.35"
                            fontSize="11"
                            letterSpacing="0.14em"
                        >
                            {node.label}
                        </text>
                    </motion.g>
                ))}
            </svg>
        </div>
    );
}