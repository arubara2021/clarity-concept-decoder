import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type KbdProps = {
    children: ReactNode;
    className?: string;
};

export function Kbd({ children, className }: KbdProps) {
    return (
        <kbd
            className={cn(
                "inline-flex min-w-6 items-center justify-center rounded-md border border-[color:var(--border)] bg-[var(--bg-0)] px-1.5 py-0.5 font-mono text-[10px] font-medium text-[color:var(--text-1)] shadow-[inset_0_-1px_0_var(--border)]",
                className
            )}
        >
            {children}
        </kbd>
    );
}