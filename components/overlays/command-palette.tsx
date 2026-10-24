"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Command } from "cmdk";
import { AnimatePresence, motion } from "motion/react";
import {
    BookOpen,
    ClipboardCopy,
    Eraser,
    Play,
    Settings2,
    Share2,
    Sparkles,
    Target,
    Users,
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { useDecodeStream } from "@/lib/use-decode-stream";
import { getDecode } from "@/lib/local-store";
import type { Audience } from "@/lib/types";

const audiences: Audience[] = [
    "Student",
    "Executive",
    "Developer (Non-ML)",
];

function Highlight({ text, query }: { text: string; query: string }) {
    const trimmed = query.trim().toLowerCase();

    if (!trimmed) {
        return <>{text}</>;
    }

    const index = text.toLowerCase().indexOf(trimmed);

    if (index === -1) {
        return <>{text}</>;
    }

    return (
        <>
            {text.slice(0, index)}
            <span className="text-[color:var(--accent)]">
                {text.slice(index, index + trimmed.length)}
            </span>
            {text.slice(index + trimmed.length)}
        </>
    );
}

function PaletteKbd({ children }: { children: string }) {
    return (
        <kbd className="rounded-md border border-[color:var(--border)] bg-[var(--bg-0)] px-1.5 py-0.5 font-mono text-[10px] font-medium text-[color:var(--text-2)]">
            {children}
        </kbd>
    );
}

type PaletteItemProps = {
    onSelect: () => void;
    icon: React.ReactNode;
    label: string;
    query: string;
    shortcut?: string;
    badge?: string;
    disabled?: boolean;
};

function PaletteItem({
    onSelect,
    icon,
    label,
    query,
    shortcut,
    badge,
    disabled,
}: PaletteItemProps) {
    return (
        <Command.Item
            onSelect={onSelect}
            disabled={disabled}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[color:var(--text-1)] transition-colors data-[selected=true]:bg-[var(--bg-2)] data-[selected=true]:text-[color:var(--text-0)] data-[disabled=true]:opacity-40"
        >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[color:var(--border)] bg-[var(--bg-0)] text-[color:var(--text-1)]">
                {icon}
            </span>

            <span className="min-w-0 flex-1 truncate">
                <Highlight text={label} query={query} />
            </span>

            {badge ? (
                <span className="shrink-0 rounded-full border border-[color:var(--accent)] bg-[var(--accent-tint)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[color:var(--accent)]">
                    {badge}
                </span>
            ) : null}

            {shortcut ? <PaletteKbd>{shortcut}</PaletteKbd> : null}
        </Command.Item>
    );
}

export function CommandPalette() {
    const router = useRouter();

    const isOpen = useStore((s) => s.isPaletteOpen);
    const openPalette = useStore((s) => s.openPalette);
    const closePalette = useStore((s) => s.closePalette);
    const openShare = useStore((s) => s.openShare);
    const setAudience = useStore((s) => s.setAudience);
    const resetResults = useStore((s) => s.resetResults);

    const audience = useStore((s) => s.audience);
    const isDecoding = useStore((s) => s.isDecoding);
    const hasText = useStore((s) => s.text.trim().length > 0);
    const currentDecodeId = useStore((s) => s.currentDecodeId);
    const hasResult = useStore((s) =>
        Object.values(s.results).some((value) => value.length > 0)
    );

    const [query, setQuery] = useState("");

    const { runDecode } = useDecodeStream();

    const canShare = hasResult && Boolean(currentDecodeId);

    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();

                if (isOpen) {
                    closePalette();
                } else {
                    openPalette();
                }
            }
        }

        window.addEventListener("keydown", onKeyDown);

        return () => {
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [closePalette, isOpen, openPalette]);

    useEffect(() => {
        if (!isOpen) {
            setQuery("");
        }
    }, [isOpen]);

    function focusSource() {
        closePalette();

        requestAnimationFrame(() => {
            const element = document.getElementById("source-text");

            if (element instanceof HTMLTextAreaElement) {
                element.focus();
                element.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        });
    }

    async function triggerDecode() {
        closePalette();

        const result = await runDecode();

        if (result.ok && result.id) {
            router.push(`/r/${result.id}`);
            return;
        }

        if (!result.ok) {
            if (result.reason === "empty-text") {
                toast("Please paste some text to decode.");
                return;
            }

            if (result.reason === "rate-limited") {
                toast("Rate budget exhausted. Try again later.");
                return;
            }

            toast("The decoder is unavailable.");
        }
    }

    function triggerAudience(next: Audience) {
        setAudience(next);
        closePalette();
    }

    function navigate(path: string) {
        closePalette();
        router.push(path);
    }

    async function triggerCopyLink() {
        const id = useStore.getState().currentDecodeId;

        const entry = id ? await getDecode(id) : null;

        if (!entry?.share?.url) {
            toast("Share this decode first.");
            return;
        }

        try {
            await navigator.clipboard.writeText(entry.share.url);
            toast("Share link copied.");
            closePalette();
        } catch {
            toast("Could not copy the link.");
        }
    }

    function triggerShare() {
        closePalette();
        openShare();
    }

    function triggerClearResult() {
        resetResults();
        closePalette();
        toast("Current result cleared.");
    }

    return (
        <DialogPrimitive.Root
            open={isOpen}
            onOpenChange={(next) => {
                if (!next) closePalette();
            }}
        >
            <AnimatePresence>
                {isOpen ? (
                    <DialogPrimitive.Portal forceMount>
                        <DialogPrimitive.Overlay asChild>
                            <motion.div
                                className="fixed inset-0 z-[80] bg-[var(--overlay-bg,rgba(8,8,8,0.55))] backdrop-blur-md"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.16 }}
                            />
                        </DialogPrimitive.Overlay>

                        <div className="pointer-events-none fixed inset-0 z-[81] flex justify-center px-4 pt-[16vh]">
                            <DialogPrimitive.Content
                                asChild
                                aria-describedby={undefined}
                                className="focus:outline-none"
                            >
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.96, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.98, y: -6 }}
                                    transition={{ type: "spring", stiffness: 480, damping: 36 }}
                                    className="pointer-events-auto h-fit w-full max-w-xl overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[var(--bg-1)] shadow-[var(--shadow-float)]"
                                >
                                    <DialogPrimitive.Title className="sr-only">
                                        Command palette
                                    </DialogPrimitive.Title>

                                    <Command label="Command palette" loop shouldFilter>
                                        <Command.Input
                                            value={query}
                                            onValueChange={setQuery}
                                            placeholder="Search actions"
                                            autoFocus
                                            className="w-full border-b border-[color:var(--border)] bg-transparent px-5 py-4 text-base text-[color:var(--text-0)] placeholder:text-[color:var(--text-3)] focus:outline-none"
                                        />

                                        <Command.List className="max-h-[46vh] overflow-y-auto p-2">
                                            <Command.Empty className="px-4 py-8 text-center text-sm text-[color:var(--text-2)]">
                                                No actions match that search.
                                            </Command.Empty>

                                            <Command.Group heading="Source">
                                                <PaletteItem
                                                    onSelect={focusSource}
                                                    icon={<Target size={14} aria-hidden="true" />}
                                                    label="Focus source input"
                                                    query={query}
                                                    shortcut="1"
                                                />

                                                <PaletteItem
                                                    onSelect={() => void triggerDecode()}
                                                    icon={<Play size={14} aria-hidden="true" />}
                                                    label={
                                                        isDecoding
                                                            ? "Decode in progress"
                                                            : "Decode current source"
                                                    }
                                                    query={query}
                                                    shortcut="Enter"
                                                    disabled={!hasText || isDecoding}
                                                />

                                                <PaletteItem
                                                    onSelect={triggerClearResult}
                                                    icon={<Eraser size={14} aria-hidden="true" />}
                                                    label="Clear current result"
                                                    query={query}
                                                    disabled={!hasResult}
                                                />
                                            </Command.Group>

                                            <Command.Group heading={`Audience · ${audience}`}>
                                                {audiences.map((option) => (
                                                    <PaletteItem
                                                        key={option}
                                                        onSelect={() => triggerAudience(option)}
                                                        icon={<Users size={14} aria-hidden="true" />}
                                                        label={`Switch to ${option}`}
                                                        query={query}
                                                        badge={option === audience ? "Current" : undefined}
                                                        disabled={isDecoding}
                                                    />
                                                ))}
                                            </Command.Group>

                                            <Command.Group heading="Navigate">
                                                <PaletteItem
                                                    onSelect={() => navigate("/")}
                                                    icon={<Sparkles size={14} aria-hidden="true" />}
                                                    label="Go to home"
                                                    query={query}
                                                />

                                                <PaletteItem
                                                    onSelect={() => navigate("/library")}
                                                    icon={<BookOpen size={14} aria-hidden="true" />}
                                                    label="Open library"
                                                    query={query}
                                                    shortcut="L"
                                                />

                                                <PaletteItem
                                                    onSelect={() => navigate("/settings")}
                                                    icon={<Settings2 size={14} aria-hidden="true" />}
                                                    label="Open settings"
                                                    query={query}
                                                    shortcut=","
                                                />
                                            </Command.Group>

                                            <Command.Group heading="Share">
                                                <PaletteItem
                                                    onSelect={triggerShare}
                                                    icon={<Share2 size={14} aria-hidden="true" />}
                                                    label="Share current result"
                                                    query={query}
                                                    disabled={!canShare}
                                                />

                                                <PaletteItem
                                                    onSelect={() => void triggerCopyLink()}
                                                    icon={<ClipboardCopy size={14} aria-hidden="true" />}
                                                    label="Copy share link"
                                                    query={query}
                                                    disabled={!canShare}
                                                />
                                            </Command.Group>
                                        </Command.List>
                                    </Command>
                                </motion.div>
                            </DialogPrimitive.Content>
                        </div>
                    </DialogPrimitive.Portal>
                ) : null}
            </AnimatePresence>
        </DialogPrimitive.Root>
    );
}