"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import {
    ArrowLeft,
    Check,
    ClipboardCopy,
    Network,
    Share2,
    Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { SourceBar, paragraphId } from "@/components/decode/source-bar";
import { ResultCards } from "@/components/decode/result-cards";
import { StaleBadge } from "@/components/decode/stale-badge";
import { ConceptMap } from "@/components/concept/concept-map";
import { ShareDialog } from "@/components/share/share-dialog";
import { CommandPalette } from "@/components/overlays/command-palette";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LogoMark } from "@/components/layout/logo-mark";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { deleteDecode, getDecode } from "@/lib/local-store";
import { resolveTitle } from "@/lib/format";
import type { CardState, DecodeSection, LocalDecode } from "@/lib/types";

const populated: Record<DecodeSection, CardState> = {
    tldr: "complete",
    analogy: "complete",
    jargon: "complete",
    takeaway: "complete",
};

type BarActionProps = {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    children: React.ReactNode;
};

function BarAction({ label, onClick, disabled = false, children }: BarActionProps) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            disabled={disabled}
            onClick={onClick}
            className="grid h-9 w-9 place-items-center rounded-lg text-[var(--text-2)] transition-colors hover:bg-[var(--bg-2)] hover:text-[var(--text-0)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] disabled:cursor-not-allowed disabled:opacity-40"
        >
            {children}
        </button>
    );
}

export default function ReadingView() {
    const params = useParams<{ id: string }>();
    const id = params.id;
    const router = useRouter();

    const loadDecode = useStore((s) => s.loadDecode);
    const openShare = useStore((s) => s.openShare);
    const isStale = useStore((s) => s.isStale);

    const [status, setStatus] = useState<"loading" | "ready" | "missing">("loading");
    const [entry, setEntry] = useState<LocalDecode | null>(null);
    const [sourceOpen, setSourceOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    useEffect(() => {
        let active = true;
        setStatus("loading");

        void getDecode(id).then((found) => {
            if (!active) return;

            if (!found) {
                setStatus("missing");
                return;
            }

            setEntry(found);
            loadDecode({
                id: found.id,
                text: found.text,
                audience: found.audience,
                sections: found.sections,
                graph: found.graph,
            });
            setStatus("ready");
        });

        return () => {
            active = false;
        };
    }, [id, loadDecode]);

    useEffect(() => {
        if (!copied) return;
        const timer = window.setTimeout(() => setCopied(false), 1800);
        return () => window.clearTimeout(timer);
    }, [copied]);

    useEffect(() => {
        if (!confirmDelete) return;
        const timer = window.setTimeout(() => setConfirmDelete(false), 3000);
        return () => window.clearTimeout(timer);
    }, [confirmDelete]);

    async function copyLink() {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            toast("Link copied.");
        } catch {
            toast("Could not copy the link.");
        }
    }

    async function handleDelete() {
        if (!confirmDelete) {
            setConfirmDelete(true);
            return;
        }

        await deleteDecode(id);
        toast("Decode deleted.");
        router.replace("/decode");
    }

    function handleCitation(paragraphIndex: number) {
        setSourceOpen(true);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const element = document.getElementById(paragraphId(paragraphIndex));
                if (!element) return;

                element.scrollIntoView({ behavior: "smooth", block: "center" });
                element.classList.add("rounded-md", "bg-[var(--accent-tint)]");

                window.setTimeout(() => {
                    element.classList.remove("rounded-md", "bg-[var(--accent-tint)]");
                }, 1400);
            });
        });
    }

    if (status === "loading") {
        return (
            <main className="grid min-h-dvh place-items-center bg-[var(--bg-0)] text-[var(--text-0)]">
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 360, damping: 30 }}
                    className="flex items-center gap-3 text-sm text-[var(--text-2)]"
                >
                    <motion.span
                        animate={{ opacity: [0.35, 1, 0.35] }}
                        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                        className="h-2 w-2 rounded-full bg-[var(--accent)]"
                    />
                    Loading decode
                </motion.div>
            </main>
        );
    }

    const displayTitle = entry ? resolveTitle(entry.title, entry.text, 96) : "";
    const barTitle = entry ? resolveTitle(entry.title, entry.text, 60) : "Decode not found";
    const hasGraph = Boolean(entry?.graph && entry.graph.nodes.length > 0);
    const createdLabel = entry
        ? new Date(entry.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        : "";

    const documentBar = (
        <div className="sticky top-0 z-40 border-b border-[var(--border-faint)] bg-[var(--statusbar-bg)] backdrop-blur-xl">
            <div className="mx-auto flex h-14 w-full max-w-[var(--content-max,1120px)] items-center gap-2 px-4 sm:px-6">
                <BarAction label="New decode" onClick={() => router.push("/decode")}>
                    <ArrowLeft size={16} aria-hidden="true" />
                </BarAction>

                <span aria-hidden="true" className="h-4 w-px shrink-0 bg-[var(--border-faint)]" />

                <Link
                    href="/"
                    aria-label="Clarity home"
                    className="ml-1 hidden shrink-0 text-[var(--text-0)] sm:block"
                >
                    <LogoMark size="sm" />
                </Link>

                <span className="min-w-0 flex-1 truncate px-1 text-sm font-medium text-[var(--text-1)]">
                    {barTitle}
                </span>

                {entry && isStale ? <StaleBadge /> : null}

                <div className="flex shrink-0 items-center gap-1">
                    {entry ? (
                        <>
                            <BarAction
                                label="Open concept map"
                                disabled={!hasGraph}
                                onClick={() => router.push(`/r/${id}/map`)}
                            >
                                <Network size={16} aria-hidden="true" />
                            </BarAction>
                            <BarAction label="Share" onClick={openShare}>
                                <Share2 size={16} aria-hidden="true" />
                            </BarAction>
                            <BarAction
                                label={copied ? "Link copied" : "Copy link"}
                                onClick={() => void copyLink()}
                            >
                                {copied ? (
                                    <Check size={16} aria-hidden="true" className="text-[var(--accent)]" />
                                ) : (
                                    <ClipboardCopy size={16} aria-hidden="true" />
                                )}
                            </BarAction>
                            {confirmDelete ? (
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => void handleDelete()}
                                    className="ml-1"
                                >
                                    Confirm delete
                                </Button>
                            ) : (
                                <BarAction label="Delete decode" onClick={() => void handleDelete()}>
                                    <Trash2 size={16} aria-hidden="true" />
                                </BarAction>
                            )}
                            <span aria-hidden="true" className="mx-1 h-4 w-px bg-[var(--border-faint)]" />
                        </>
                    ) : null}
                    <ThemeToggle />
                </div>
            </div>
        </div>
    );

    if (status === "missing" || !entry) {
        return (
            <main className="min-h-dvh bg-[var(--bg-0)] text-[var(--text-0)]">
                {documentBar}
                <div className="mx-auto grid min-h-[calc(100dvh-3.5rem)] max-w-xl place-items-center px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 340, damping: 30 }}
                        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-1)] p-8 text-center shadow-[var(--shadow-float)]"
                    >
                        <h1 className="text-xl font-semibold tracking-[-0.02em]">
                            This decode does not exist in this browser
                        </h1>
                        <p className="mx-auto mt-3 max-w-[44ch] text-sm leading-6 text-[var(--text-2)]">
                            Decodes are stored privately in this browser. If it was deleted,
                            it cannot be recovered here.
                        </p>
                        <Button
                            className="mx-auto mt-6"
                            onClick={() => router.push("/decode")}
                            icon={<ArrowLeft size={13} aria-hidden="true" />}
                        >
                            Make a new decode
                        </Button>
                    </motion.div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-dvh bg-[var(--bg-0)] text-[var(--text-0)]">
            {documentBar}

            <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 340, damping: 30 }}
                className="mx-auto w-[min(var(--content-max,1120px),calc(100%-2rem))] pb-24 pt-10"
            >
                <div className="mx-auto flex max-w-[var(--reading-measure,68ch)] flex-col gap-8">
                    <SourceBar
                        text={entry.text}
                        title={displayTitle}
                        audience={entry.audience}
                        open={sourceOpen}
                        onOpenChange={setSourceOpen}
                        className="scroll-mt-24"
                    />

                    <header>
                        <h1 className="text-balance text-3xl font-semibold tracking-[-0.04em] md:text-4xl">
                            {displayTitle}
                        </h1>
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                            <Badge variant="neutral">{entry.audience}</Badge>
                            <Badge variant="neutral">{createdLabel}</Badge>
                            {entry.share ? (
                                <Badge variant="amber" dot>
                                    Shared
                                </Badge>
                            ) : null}
                        </div>
                    </header>

                    <ResultCards
                        sections={entry.sections}
                        cardStates={populated}
                        sectionErrors={{}}
                        onSourceScroll={handleCitation}
                    />

                    {hasGraph && entry.graph ? (
                        <section aria-label="Concept map" className="flex flex-col gap-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <h2 className="text-xl font-semibold tracking-[-0.02em]">
                                    Concept map
                                </h2>
                                <Badge variant="neutral">
                                    {entry.graph.nodes.length} concepts ·{" "}
                                    {entry.graph.edges.length} relationships
                                </Badge>
                            </div>
                            <ConceptMap graph={entry.graph} />
                        </section>
                    ) : null}

                    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-5 text-xs text-[var(--text-2)]">
                        <span>
                            Built for the space between knowing the words and understanding
                            the idea.
                        </span>
                        <span className="tabular-nums">CL / 001</span>
                    </footer>
                </div>
            </motion.div>

            <ShareDialog />
            <CommandPalette />
        </main>
    );
}