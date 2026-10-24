"use client";

import { AnimatePresence, motion } from "motion/react";
import { FileText, Link2, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";

export type SourceMode = "paste" | "file" | "url";

type SourceToolbarProps = {
    mode: SourceMode;
    onModeChange: (mode: SourceMode) => void;
    onPickFile: () => void;
    onExtractUrl: () => void;
    url: string;
    onUrlChange: (value: string) => void;
    sourceName: string;
    isExtracting: boolean;
    isFetchingUrl: boolean;
    busy: boolean;
    progress: number;
};

const modes: { value: SourceMode; label: string; icon: typeof Type }[] = [
    { value: "paste", label: "Paste", icon: Type },
    { value: "file", label: "File", icon: FileText },
    { value: "url", label: "URL", icon: Link2 },
];

export function SourceToolbar({
    mode,
    onModeChange,
    onPickFile,
    onExtractUrl,
    url,
    onUrlChange,
    sourceName,
    isExtracting,
    isFetchingUrl,
    busy,
    progress,
}: SourceToolbarProps) {
    return (
        <div className="relative shrink-0 border-b border-[var(--border-faint)] px-4 pb-4 pt-4 sm:px-6">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase leading-4 tracking-[0.12em] text-[var(--text-2)]">
                        01 / Source material
                    </p>
                    <h2 className="mt-1.5 text-lg font-semibold leading-6 tracking-[-0.02em] text-[var(--text-0)]">
                        What are you trying to understand?
                    </h2>
                </div>
                <p className="hidden max-w-[34ch] pt-0.5 text-right text-[11px] leading-4 text-[var(--text-3)] sm:block">
                    Paste, drop, or link. Everything stays editable before you decode.
                </p>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex flex-wrap items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--bg-0)] p-1">
                    {modes.map((option) => {
                        const Icon = option.icon;
                        const active = mode === option.value;

                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => onModeChange(option.value)}
                                aria-pressed={active}
                                className={cn(
                                    "relative rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]",
                                    active
                                        ? "text-[var(--text-0)]"
                                        : "text-[var(--text-2)] hover:text-[var(--text-0)]"
                                )}
                            >
                                {active ? (
                                    <motion.span
                                        layoutId="source-mode-rail"
                                        className="absolute inset-0 rounded-full bg-[var(--bg-2)] shadow-[var(--shadow-hair)]"
                                        transition={{ type: "spring", stiffness: 460, damping: 34 }}
                                    />
                                ) : null}
                                <span className="relative z-10 inline-flex items-center gap-2">
                                    <Icon size={12} aria-hidden="true" />
                                    {option.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="flex min-w-0 flex-wrap items-center gap-2">
                    {sourceName ? (
                        <Badge variant="neutral" dot className="max-w-[240px]">
                            <span className="truncate">Extracted from {sourceName}</span>
                        </Badge>
                    ) : null}

                    <Button
                        variant="ghost"
                        size="sm"
                        icon={<FileText size={13} aria-hidden="true" />}
                        onClick={onPickFile}
                        loading={isExtracting}
                        disabled={busy}
                    >
                        {isExtracting ? "Extracting" : "Choose file"}
                    </Button>
                </div>
            </div>

            <AnimatePresence initial={false}>
                {mode === "url" ? (
                    <motion.div
                        key="url-row"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        className="mt-3 flex flex-col gap-2 sm:flex-row"
                    >
                        <Input
                            type="url"
                            inputMode="url"
                            autoComplete="url"
                            spellCheck={false}
                            placeholder="https://example.com/article"
                            aria-label="Public webpage URL"
                            value={url}
                            onChange={(event) => onUrlChange(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    event.preventDefault();
                                    onExtractUrl();
                                }
                            }}
                            disabled={busy}
                            className="flex-1"
                        />
                        <Button
                            variant="ghost"
                            onClick={onExtractUrl}
                            loading={isFetchingUrl}
                            disabled={busy || url.trim().length === 0}
                        >
                            Extract
                        </Button>
                    </motion.div>
                ) : null}
            </AnimatePresence>

            <AnimatePresence initial={false}>
                {busy ? (
                    <motion.div
                        key="progress-hairline"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-x-0 -bottom-px h-px overflow-hidden bg-[var(--border-faint)]"
                    >
                        {isExtracting ? (
                            <motion.div
                                className="absolute inset-y-0 left-0 bg-[var(--accent)]"
                                initial={{ width: "0%" }}
                                animate={{ width: `${Math.round(progress * 100)}%` }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                            />
                        ) : (
                            <motion.div
                                className="absolute inset-y-0 w-2/5 bg-[var(--accent)]"
                                animate={{ x: ["-100%", "250%"] }}
                                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                            />
                        )}
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
}