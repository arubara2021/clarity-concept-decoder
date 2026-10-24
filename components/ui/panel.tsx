"use client";

import { motion } from "motion/react";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

type PanelElevation = "flat" | "raised" | "float" | "surface";
type PanelPadding = "none" | "sm" | "md" | "lg" | "xl";

type PanelProps = ComponentPropsWithoutRef<typeof motion.div> & {
    elevation?: PanelElevation;
    padding?: PanelPadding;
    hover?: boolean;
    glass?: boolean;
};

const elevationClasses: Record<PanelElevation, string> = {
    flat: "border border-[var(--border)] bg-[var(--bg-1)]",
    raised: "border border-[var(--border)] bg-[var(--bg-1)] shadow-[var(--shadow-card)]",
    float: "border border-[var(--border-strong)] bg-[var(--bg-2)] shadow-[var(--shadow-float)]",
    surface:
        "hairline-top border-0 bg-[var(--canvas-left)] shadow-[var(--shadow-card)]",
};

const paddingClasses: Record<PanelPadding, string> = {
    none: "",
    sm: "p-3",
    md: "p-5",
    lg: "p-6",
    xl: "p-8",
};

export function Panel({
    elevation = "raised",
    padding = "md",
    hover = false,
    glass = false,
    className,
    children,
    layout = false,
    ...props
}: PanelProps) {
    return (
        <motion.div
            layout={layout}
            className={cn(
                "rounded-2xl",
                elevationClasses[elevation],
                paddingClasses[padding],
                glass &&
                "backdrop-blur-2xl bg-[var(--glass-bg)] border-[var(--glass-border)]",
                hover &&
                "transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-[var(--shadow-glow)]",
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
}