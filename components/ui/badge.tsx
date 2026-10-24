import * as React from "react";
import { cn } from "@/lib/cn";

type BadgeVariant =
    | "neutral"
    | "accent"
    | "blue"
    | "purple"
    | "amber"
    | "warning"
    | "danger"
    | "success";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: BadgeVariant;
    dot?: boolean;
    pulse?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
    neutral: "border-[var(--border)] bg-[var(--glass-bg)] text-[var(--text-1)]",
    accent: "border-[var(--border-strong)] bg-[var(--accent)] text-[var(--accent-contrast)]",
    blue: "border-[var(--border)] bg-[var(--glass-bg)] text-[var(--text-1)]",
    purple: "border-[var(--border)] bg-[var(--glass-bg)] text-[var(--text-1)]",
    amber: "border-[var(--border)] bg-[var(--bg-2)] text-[var(--text-1)]",
    warning: "border-[var(--border)] bg-[var(--bg-2)] text-[var(--text-1)]",
    danger: "border-[var(--danger)] bg-[var(--danger-tint)] text-[var(--danger)]",
    success: "border-[var(--border)] bg-[var(--bg-2)] text-[var(--text-1)]",
};

const dotClasses: Record<BadgeVariant, string> = {
    neutral: "bg-[var(--text-2)]",
    accent: "bg-[var(--accent-contrast)]",
    blue: "bg-[var(--text-2)]",
    purple: "bg-[var(--text-2)]",
    amber: "bg-[var(--text-2)]",
    warning: "bg-[var(--text-2)]",
    danger: "bg-[var(--danger)]",
    success: "bg-[var(--text-2)]",
};

export function Badge({
    className,
    variant = "neutral",
    dot = false,
    pulse = false,
    children,
    ...props
}: BadgeProps) {
    return (
        <div
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] backdrop-blur-xl",
                variantClasses[variant],
                className
            )}
            {...props}
        >
            {dot ? (
                <span
                    aria-hidden="true"
                    className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        dotClasses[variant],
                        pulse && "animate-node-pulse"
                    )}
                />
            ) : null}
            {children}
        </div>
    );
}