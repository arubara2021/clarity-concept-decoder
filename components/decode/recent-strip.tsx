"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Link2 } from "lucide-react";
import { resolveTitle } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Audience, LocalDecode } from "@/lib/types";

type RecentStripProps = {
    decodes: LocalDecode[];
};

const audienceDot: Record<Audience, string> = {
    Student: "bg-[var(--text-0)]",
    Executive: "bg-[var(--text-1)]",
    "Developer (Non-ML)": "bg-[var(--text-2)]",
};

function relativeDay(timestamp: number): string {
    const diff = Date.now() - timestamp;
    const days = Math.floor(diff / 86400000);

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;

    return new Date(timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
}

export function RecentStrip({ decodes }: RecentStripProps) {
    if (decodes.length === 0) {
        return null;
    }

    return (
        <div className="mt-auto shrink-0 border-t border-[var(--border-faint)] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-6">
            <div className="flex items-center justify-between gap-3">
                <p className="flex items-baseline gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-2)]">
                    Recent
                    <span className="text-[10px] font-medium tabular-nums tracking-normal text-[var(--text-3)]">
                        {decodes.length}
                    </span>
                </p>
                <Link
                    href="/library"
                    className="inline-flex items-center gap-1 text-xs font-medium text-[var(--text-1)] transition-colors hover:text-[var(--text-0)]"
                >
                    View library
                    <ArrowRight size={12} aria-hidden="true" />
                </Link>
            </div>

            <div className="mt-2 flex flex-col">
                {decodes.map((entry, index) => (
                    <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            delay: index * 0.04,
                            type: "spring",
                            stiffness: 380,
                            damping: 30,
                        }}
                        className={cn(
                            index < decodes.length - 1 &&
                            "border-b border-[var(--border-faint)]"
                        )}
                    >
                        <Link
                            href={`/r/${entry.id}`}
                            className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-[var(--bg-2)]"
                        >
                            <span className="w-6 shrink-0 text-[10px] tabular-nums text-[var(--text-3)]">
                                {String(index + 1).padStart(2, "0")}
                            </span>

                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-[13px] font-medium leading-5 text-[var(--text-0)]">
                                    {resolveTitle(entry.title, entry.text, 70)}
                                </span>
                                <span className="mt-0.5 flex items-center gap-2 text-[11px] leading-4 text-[var(--text-3)]">
                                    <span
                                        aria-hidden="true"
                                        className={cn(
                                            "h-1.5 w-1.5 shrink-0 rounded-full",
                                            audienceDot[entry.audience]
                                        )}
                                    />
                                    <span className="truncate">{entry.audience}</span>
                                    <span aria-hidden="true">·</span>
                                    <span className="shrink-0">{relativeDay(entry.createdAt)}</span>
                                    {entry.share ? (
                                        <>
                                            <span aria-hidden="true">·</span>
                                            <span className="inline-flex shrink-0 items-center gap-1">
                                                <Link2 size={10} aria-hidden="true" />
                                                Shared
                                            </span>
                                        </>
                                    ) : null}
                                </span>
                            </span>

                            <ArrowRight
                                size={14}
                                aria-hidden="true"
                                className="shrink-0 text-[var(--text-3)] transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[var(--text-0)]"
                            />
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}