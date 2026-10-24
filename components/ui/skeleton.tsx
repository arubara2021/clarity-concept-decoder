"use client";

import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

type SkeletonShape = "text" | "line" | "card" | "circle";

type SkeletonProps = {
    className?: string;
    shape?: SkeletonShape;
    animate?: boolean;
};

const shapeClasses: Record<SkeletonShape, string> = {
    text: "h-3.5 w-full rounded",
    line: "h-2.5 w-full rounded-full",
    card: "h-24 w-full rounded-2xl",
    circle: "h-10 w-10 rounded-full",
};

export function Skeleton({
    className,
    shape = "text",
    animate = true,
}: SkeletonProps) {
    const reduceMotion = useReducedMotion();
    const breathing = animate && !reduceMotion;

    return (
        <div
            aria-hidden="true"
            className={cn(
                "bg-[var(--bg-3)]",
                breathing ? "animate-skeleton-breathe" : "opacity-60",
                shapeClasses[shape],
                className
            )}
        />
    );
}