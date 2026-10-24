"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, Settings2, Share2 } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LogoMark } from "@/components/layout/logo-mark";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/cn";

type AppHeaderProps = {
    solid?: boolean;
};

type IconActionProps = {
    label: string;
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    children: ReactNode;
};

function IconAction({
    label,
    onClick,
    active = false,
    disabled = false,
    children,
}: IconActionProps) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            disabled={disabled}
            onClick={onClick}
            className={cn(
                "grid h-9 w-9 place-items-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] disabled:cursor-not-allowed disabled:opacity-40",
                active
                    ? "bg-[var(--accent-tint)] text-[var(--accent)]"
                    : "text-[var(--text-2)] hover:bg-[var(--bg-2)] hover:text-[var(--text-0)]"
            )}
        >
            {children}
        </button>
    );
}

export function AppHeader({ solid = false }: AppHeaderProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);

    const openShare = useStore((s) => s.openShare);
    const currentDecodeId = useStore((s) => s.currentDecodeId);
    const hasResult = useStore((s) =>
        Object.values(s.results).some((value) => value.length > 0)
    );

    const canShare = hasResult && Boolean(currentDecodeId);

    useEffect(() => {
        if (solid) return;

        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });

        return () => window.removeEventListener("scroll", onScroll);
    }, [solid]);

    const frosted = solid || scrolled;

    return (
        <header
            className={cn(
                "sticky top-0 z-40 w-full transition-colors duration-200",
                frosted
                    ? "border-b border-[var(--border-faint)] bg-[var(--statusbar-bg)] backdrop-blur-xl"
                    : "border-b border-transparent bg-transparent"
            )}
        >
            <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
                <Link
                    href="/"
                    className="flex min-w-0 items-center gap-2.5 rounded-lg py-1 pr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
                >
                    <span className="text-[var(--text-0)]">
                        <LogoMark size="sm" />
                    </span>
                    <span className="truncate text-sm font-semibold tracking-[-0.02em] text-[var(--text-0)]">
                        Clarity
                    </span>
                    <span
                        aria-hidden="true"
                        className="hidden h-4 w-px bg-[var(--border-faint)] xl:block"
                    />
                    <span className="hidden truncate text-xs text-[var(--text-3)] xl:inline">
                        Understand anything, at your level.
                    </span>
                </Link>

                <nav className="flex shrink-0 items-center gap-1" aria-label="Primary">
                    <ThemeToggle />
                    <IconAction
                        label="Open library"
                        active={pathname === "/library"}
                        onClick={() => router.push("/library")}
                    >
                        <BookOpen size={16} aria-hidden="true" />
                    </IconAction>
                    <IconAction
                        label="Open settings"
                        active={pathname === "/settings"}
                        onClick={() => router.push("/settings")}
                    >
                        <Settings2 size={16} aria-hidden="true" />
                    </IconAction>
                    <IconAction
                        label="Share current decode"
                        disabled={!canShare}
                        onClick={openShare}
                    >
                        <Share2 size={16} aria-hidden="true" />
                    </IconAction>
                </nav>
            </div>
        </header>
    );
}