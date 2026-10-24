"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { motion } from "motion/react";
import { Laptop, Moon, Sun, Timer } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getRateBudget, resetRateBudget } from "@/lib/rate-budget";
import type { BudgetStatus } from "@/lib/rate-budget";
import { cn } from "@/lib/cn";

type ThemeOption = "light" | "dark" | "system";

const themeOptions: { value: ThemeOption; label: string; icon: typeof Sun }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Laptop },
];

const shortcuts = [
    { keys: "Cmd K / Ctrl K", label: "Open command palette" },
    { keys: "Enter", label: "Decode current source" },
    { keys: "1 / 2 / 3", label: "Switch audience" },
    { keys: "L", label: "Open library" },
    { keys: ",", label: "Open settings" },
    { keys: "Esc", label: "Close overlay" },
];

function describeReset(resetAt: number): string {
    const minutes = Math.max(1, Math.round((resetAt - Date.now()) / 60000));
    return `Resets in ${minutes} minute${minutes === 1 ? "" : "s"}`;
}

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [budget, setBudget] = useState<BudgetStatus | null>(null);

    useEffect(() => {
        setMounted(true);
        setBudget(getRateBudget());

        const timer = window.setInterval(() => {
            setBudget(getRateBudget());
        }, 30000);

        return () => {
            window.clearInterval(timer);
        };
    }, []);

    const used = budget ? budget.limit - budget.remaining : 0;
    const percent = budget
        ? Math.min(100, (used / budget.limit) * 100)
        : 0;

    return (
        <main className="min-h-dvh bg-[var(--bg-0)] text-[color:var(--text-0)]">
            <div className="mx-auto w-[min(var(--content-max,1120px),calc(100%-2rem))] pb-20 pt-24">
                <AppHeader />

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 360, damping: 30 }}
                    className="mx-auto mt-10 max-w-2xl"
                >
                    <header>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--text-2)]">
                            Settings
                        </p>

                        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
                            Preferences
                        </h1>

                        <p className="mt-3 max-w-[52ch] text-sm leading-6 text-[color:var(--text-2)]">
                            Appearance, decode budget, and keyboard control. Everything on
                            this page stays private to this browser.
                        </p>
                    </header>

                    <div className="mt-10 flex flex-col gap-8">
                        <section aria-label="Appearance">
                            <div className="mb-4 flex items-center justify-between gap-4">
                                <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-[color:var(--text-2)]">
                                    Appearance
                                </h2>

                                {mounted ? (
                                    <Badge variant="neutral">
                                        {theme === "light"
                                            ? "Light"
                                            : theme === "dark"
                                                ? "Dark"
                                                : "System"}
                                    </Badge>
                                ) : null}
                            </div>

                            <Panel elevation="raised" padding="lg">
                                <div className="inline-flex flex-wrap gap-1 rounded-xl border border-[color:var(--border)] bg-[var(--bg-0)] p-1">
                                    {themeOptions.map((option) => {
                                        const Icon = option.icon;
                                        const active = mounted && theme === option.value;

                                        return (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => setTheme(option.value)}
                                                aria-pressed={active}
                                                className={cn(
                                                    "relative rounded-lg px-4 py-2 text-xs font-medium transition-colors",
                                                    active
                                                        ? "text-[color:var(--text-0)]"
                                                        : "text-[color:var(--text-2)] hover:text-[color:var(--text-0)]"
                                                )}
                                            >
                                                {active ? (
                                                    <motion.span
                                                        layoutId="settings-theme-pill"
                                                        className="absolute inset-0 rounded-lg bg-[var(--bg-2)] shadow-[var(--shadow-hair)]"
                                                        transition={{
                                                            type: "spring",
                                                            stiffness: 460,
                                                            damping: 34,
                                                        }}
                                                    />
                                                ) : null}

                                                <span className="relative z-10 inline-flex items-center gap-2">
                                                    <Icon size={13} aria-hidden="true" />
                                                    {option.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                <p className="mt-4 text-xs leading-5 text-[color:var(--text-2)]">
                                    System follows your operating system preference. Dark keeps
                                    the reading surface calm for long sessions.
                                </p>
                            </Panel>
                        </section>

                        <section aria-label="Rate budget">
                            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.1em] text-[color:var(--text-2)]">
                                Decode budget
                            </h2>

                            <Panel elevation="raised" padding="lg">
                                {budget ? (
                                    <div>
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div className="inline-flex items-center gap-2 text-sm font-medium text-[color:var(--text-0)]">
                                                <Timer size={14} aria-hidden="true" />
                                                {used} of {budget.limit} decodes used this hour
                                            </div>

                                            <Badge
                                                variant={budget.exhausted ? "danger" : "neutral"}
                                            >
                                                {describeReset(budget.resetAt)}
                                            </Badge>
                                        </div>

                                        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[var(--bg-3)]">
                                            <motion.div
                                                initial={false}
                                                animate={{ width: `${percent}%` }}
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 220,
                                                    damping: 30,
                                                }}
                                                className={cn(
                                                    "h-full rounded-full",
                                                    budget.exhausted
                                                        ? "bg-[var(--danger)]"
                                                        : "bg-[var(--accent)]"
                                                )}
                                            />
                                        </div>

                                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                                            <p className="text-xs leading-5 text-[color:var(--text-2)]">
                                                The budget protects the free model tier. It is enforced
                                                locally in this browser.
                                            </p>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    resetRateBudget();
                                                    setBudget(getRateBudget());
                                                }}
                                            >
                                                Reset budget
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-[color:var(--text-2)]">
                                        Loading budget...
                                    </p>
                                )}
                            </Panel>
                        </section>

                        <section aria-label="Keyboard shortcuts">
                            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.1em] text-[color:var(--text-2)]">
                                Keyboard shortcuts
                            </h2>

                            <Panel elevation="raised" padding="none" className="overflow-hidden">
                                <div className="divide-y divide-[color:var(--border)]">
                                    {shortcuts.map((shortcut) => (
                                        <div
                                            key={shortcut.label}
                                            className="flex items-center justify-between gap-4 px-5 py-4"
                                        >
                                            <span className="text-sm text-[color:var(--text-1)]">
                                                {shortcut.label}
                                            </span>

                                            <kbd className="rounded-md border border-[color:var(--border)] bg-[var(--bg-0)] px-2 py-1 font-mono text-[10px] text-[color:var(--text-1)]">
                                                {shortcut.keys}
                                            </kbd>
                                        </div>
                                    ))}
                                </div>
                            </Panel>
                        </section>

                        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--border)] pt-5 text-xs text-[color:var(--text-2)]">
                            <span>
                                Built for the space between knowing the words and understanding
                                the idea.
                            </span>

                            <span className="tabular-nums">CL / 001</span>
                        </footer>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}