"use client";

import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type InputSize = "sm" | "md" | "lg";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
    invalid?: boolean;
    inputSize?: InputSize;
};

const baseFieldClasses =
    "w-full border bg-[var(--bg-0)] text-[var(--text-0)] placeholder:text-[var(--text-3)] transition-[border-color,box-shadow] duration-150 focus:outline-none disabled:cursor-not-allowed disabled:opacity-55";

const inputSizeClasses: Record<InputSize, string> = {
    sm: "h-9 rounded-lg px-3 text-xs",
    md: "h-10 rounded-[12px] px-4 text-sm",
    lg: "h-11 rounded-xl px-4 text-sm",
};

function fieldBorderClasses(invalid: boolean) {
    if (invalid) {
        return "border-[var(--danger)] focus:border-[var(--danger)] focus:shadow-[0_0_0_3px_var(--danger-tint)]";
    }
    return "border-[var(--border)] hover:border-[var(--border-strong)] focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-ring)]";
}

export function Input({
    className,
    invalid = false,
    inputSize = "md",
    type = "text",
    ...props
}: InputProps) {
    return (
        <input
            type={type}
            aria-invalid={invalid || undefined}
            className={cn(
                baseFieldClasses,
                inputSizeClasses[inputSize],
                fieldBorderClasses(invalid),
                className
            )}
            {...props}
        />
    );
}