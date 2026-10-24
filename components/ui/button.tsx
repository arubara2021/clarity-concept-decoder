"use client";

import { motion } from "motion/react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = Omit<
    ComponentPropsWithoutRef<typeof motion.button>,
    "children"
> & {
    children?: ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    block?: boolean;
    icon?: ReactNode;
};

const baseClasses =
    "group inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-2xl font-semibold tracking-[-0.01em] transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-0)] disabled:cursor-not-allowed disabled:opacity-55 disabled:saturate-50";

const variantClasses: Record<ButtonVariant, string> = {
    primary:
        "button-glow button-shimmer border border-[var(--button-border)] bg-[var(--button-bg)] text-[var(--button-text)] hover:opacity-90 active:opacity-80",
    ghost:
        "border border-[var(--border)] bg-[var(--glass-bg)] text-[var(--text-1)] backdrop-blur-xl hover:border-[var(--border-strong)] hover:bg-[var(--bg-2)] hover:text-[var(--text-0)]",
    danger:
        "border border-transparent bg-[var(--danger)] text-[var(--danger-contrast)] hover:brightness-110 active:brightness-95",
};

const sizeClasses: Record<ButtonSize, string> = {
    sm: "h-8 px-3 text-[11px]",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-sm",
};

export function Button({
    variant = "primary",
    size = "md",
    loading = false,
    block = false,
    icon,
    className,
    children,
    disabled,
    type = "button",
    ...props
}: ButtonProps) {
    const interactive = !disabled && !loading;

    return (
        <motion.button
            type={type}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            whileHover={interactive ? { y: -2, scale: 1.02 } : undefined}
            whileTap={interactive ? { scale: 0.97 } : undefined}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className={cn(
                baseClasses,
                variantClasses[variant],
                sizeClasses[size],
                block && "w-full",
                className
            )}
            {...props}
        >
            {loading ? (
                <motion.span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-current"
                    animate={{ opacity: [0.35, 1, 0.35], scale: [0.9, 1.1, 0.9] }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                />
            ) : null}

            {icon && !loading ? (
                <span className="inline-flex items-center justify-center">{icon}</span>
            ) : null}

            {children ? (
                <span className="relative z-10 inline-flex items-center gap-2">
                    {children}
                </span>
            ) : null}
        </motion.button>
    );
}