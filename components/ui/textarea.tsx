"use client";

import { useId } from "react";
import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
    invalid?: boolean;
    showCount?: boolean;
    hint?: string;
    borderless?: boolean;
};

const boxedClasses =
    "min-h-[140px] w-full resize-y rounded-xl border bg-[var(--bg-0)] px-4 py-3 text-sm leading-6 text-[var(--text-0)] placeholder:text-[var(--text-3)] transition-[border-color,box-shadow] duration-150 focus:outline-none disabled:cursor-not-allowed disabled:opacity-55";

const boxedNormal =
    "border-[var(--border)] hover:border-[var(--border-strong)] focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-ring)]";

const boxedError =
    "border-[var(--danger)] focus:border-[var(--danger)] focus:shadow-[0_0_0_3px_var(--danger-tint)]";

const borderlessClasses =
    "min-h-[240px] w-full resize-y rounded-none border-0 border-b bg-transparent px-0 py-2 text-base leading-8 text-[var(--text-0)] placeholder:text-[var(--text-3)] transition-[border-color,box-shadow] duration-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-55";

const borderlessNormal =
    "border-transparent hover:border-[var(--border-faint)] focus:border-[var(--border-strong)] focus:shadow-[0_10px_36px_-22px_var(--accent-ring)]";

const borderlessError =
    "border-[var(--danger)] focus:border-[var(--danger)]";

export function Textarea({
    className,
    invalid = false,
    showCount = false,
    hint,
    borderless = false,
    maxLength,
    value,
    id,
    ...props
}: TextareaProps) {
    const autoId = useId();
    const textareaId = id ?? autoId;
    const current = typeof value === "string" ? value.length : 0;
    const nearLimit = typeof maxLength === "number" && current >= maxLength * 0.9;
    const overLimit = typeof maxLength === "number" && current > maxLength;
    const showFooter =
        !borderless && (Boolean(hint) || (showCount && typeof maxLength === "number"));

    return (
        <div className="w-full">
            <textarea
                id={textareaId}
                aria-invalid={invalid || overLimit || undefined}
                aria-describedby={hint ? `${textareaId}-hint` : undefined}
                maxLength={maxLength}
                value={value}
                className={cn(
                    borderless ? borderlessClasses : boxedClasses,
                    invalid || overLimit
                        ? borderless
                            ? borderlessError
                            : boxedError
                        : borderless
                            ? borderlessNormal
                            : boxedNormal,
                    className
                )}
                {...props}
            />

            {showFooter ? (
                <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                    {hint ? (
                        <p id={`${textareaId}-hint`} className="text-[color:var(--text-2)]">
                            {hint}
                        </p>
                    ) : (
                        <span aria-hidden="true" />
                    )}

                    {showCount && typeof maxLength === "number" ? (
                        <span
                            className={cn(
                                "tabular-nums",
                                overLimit
                                    ? "text-[color:var(--danger)]"
                                    : nearLimit
                                        ? "text-[color:var(--accent)]"
                                        : "text-[color:var(--text-3)]"
                            )}
                        >
                            {current.toLocaleString("en-US")} / {maxLength.toLocaleString("en-US")}
                        </span>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}