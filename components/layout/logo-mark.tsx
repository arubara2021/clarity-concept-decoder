"use client";

import { useId } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

type LogoMarkSize = "sm" | "md" | "lg";

type LogoMarkProps = {
    size?: LogoMarkSize;
    orbit?: boolean;
    className?: string;
};

const sizeMap: Record<LogoMarkSize, number> = {
    sm: 20,
    md: 28,
    lg: 36,
};

export function LogoMark({ size = "md", orbit = true, className }: LogoMarkProps) {
    const reduceMotion = useReducedMotion();
    const rawId = useId();
    const maskId = `logo-eclipse-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
    const px = sizeMap[size];
    const showOrbit = orbit && !reduceMotion;

    return (
        <svg
            width={px}
            height={px}
            viewBox="0 0 32 32"
            fill="none"
            aria-hidden="true"
            className={cn("shrink-0", className)}
        >
            <defs>
                <mask id={maskId}>
                    <rect x="0" y="0" width="32" height="32" fill="white" />
                    <circle cx="19.5" cy="12.5" r="4.4" fill="black" />
                </mask>
            </defs>

            <circle
                cx="16"
                cy="16"
                r="14"
                stroke="currentColor"
                strokeWidth="1.25"
                opacity="0.32"
            />

            <circle
                cx="16"
                cy="16"
                r="14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                pathLength={100}
                strokeDasharray="26 74"
                transform="rotate(120 16 16)"
                opacity="0.9"
            />

            <circle cx="16" cy="16" r="5" fill="currentColor" mask={`url(#${maskId})`} />

            <g
                className={showOrbit ? "animate-orbit-slow" : undefined}
                style={{
                    transformBox: "view-box",
                    transformOrigin: "center",
                    animationDuration: "14s",
                }}
            >
                <circle cx="16" cy="2" r="1.7" fill="currentColor" />
            </g>
        </svg>
    );
}