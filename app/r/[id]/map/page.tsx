"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowLeft, Network } from "lucide-react";
import { ConceptMap } from "@/components/concept/concept-map";
import { GraphInspector } from "@/components/concept/graph-inspector";
import { Button } from "@/components/ui/button";
import { getDecode } from "@/lib/local-store";
import { resolveTitle } from "@/lib/format";
import type { ConceptNode, LocalDecode } from "@/lib/types";

export default function MapView() {
    const params = useParams<{ id: string }>();
    const id = params.id;
    const router = useRouter();

    const [status, setStatus] = useState<"loading" | "ready" | "missing">(
        "loading"
    );
    const [entry, setEntry] = useState<LocalDecode | null>(null);
    const [selected, setSelected] = useState<ConceptNode | null>(null);

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
            setStatus("ready");
        });

        return () => {
            active = false;
        };
    }, [id]);

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
                    Loading concept map
                </motion.div>
            </main>
        );
    }

    if (status === "missing" || !entry) {
        return (
            <main className="grid min-h-dvh place-items-center bg-[var(--bg-0)] p-6 text-[var(--text-0)]">
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 340, damping: 30 }}
                    className="w-full max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--glass-bg)] p-8 text-center shadow-[var(--shadow-float)] backdrop-blur-2xl"
                >
                    <Network
                        size={24}
                        aria-hidden="true"
                        className="mx-auto text-[var(--text-2)]"
                    />
                    <h1 className="mt-4 text-xl font-semibold tracking-[-0.02em]">
                        This decode does not exist in this browser
                    </h1>
                    <p className="mx-auto mt-3 max-w-[44ch] text-sm leading-6 text-[var(--text-2)]">
                        The concept map cannot be opened because the decode is not stored
                        here.
                    </p>
                    <Button
                        className="mx-auto mt-6"
                        onClick={() => router.push("/decode")}
                        icon={<ArrowLeft size={13} aria-hidden="true" />}
                    >
                        Back to Clarity
                    </Button>
                </motion.div>
            </main>
        );
    }

    const graph = entry.graph ?? null;
    const hasGraph = Boolean(graph && graph.nodes.length > 0);
    const displayTitle = resolveTitle(entry.title, entry.text, 90);

    return (
        <main className="relative h-dvh overflow-hidden bg-[var(--bg-0)] text-[var(--text-0)]">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                <div className="grid-overlay absolute inset-0 opacity-40" />
                <div className="hero-noise absolute inset-0" />
                <div className="hero-vignette absolute inset-0" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                className="relative z-10 h-full"
            >
                {hasGraph && graph ? (
                    <ConceptMap
                        graph={graph}
                        fill
                        selectedNodeId={selected?.id ?? null}
                        onNodeSelect={setSelected}
                    />
                ) : (
                    <div className="grid h-full place-items-center p-6">
                        <motion.div
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: "spring", stiffness: 340, damping: 30 }}
                            className="w-full max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--glass-bg)] p-8 text-center shadow-[var(--shadow-float)] backdrop-blur-2xl"
                        >
                            <div className="relative mx-auto h-16 w-16" aria-hidden="true">
                                <motion.span
                                    className="absolute inset-0 rounded-full border border-[var(--border)]"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                >
                                    <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--text-1)]" />
                                </motion.span>
                                <motion.span
                                    className="absolute inset-3 rounded-full border border-dashed border-[var(--border-faint)]"
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
                                />
                            </div>
                            <h1 className="mt-5 text-xl font-semibold tracking-[-0.02em]">
                                No concept relationships were found
                            </h1>
                            <p className="mx-auto mt-3 max-w-[44ch] text-sm leading-6 text-[var(--text-2)]">
                                This source did not contain enough connected ideas to build a
                                map.
                            </p>
                            <Button
                                className="mx-auto mt-6"
                                variant="ghost"
                                onClick={() => router.push(`/r/${id}`)}
                                icon={<ArrowLeft size={13} aria-hidden="true" />}
                            >
                                Back to reading
                            </Button>
                        </motion.div>
                    </div>
                )}
            </motion.div>

            <div className="absolute left-4 top-4 z-30">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/r/${id}`)}
                    icon={<ArrowLeft size={13} aria-hidden="true" />}
                    className="rounded-full bg-[var(--glass-bg)] backdrop-blur-xl"
                >
                    Back to reading
                </Button>
            </div>

            <div className="pointer-events-none absolute inset-x-0 top-4 z-20 hidden justify-center px-40 md:flex">
                <div className="flex min-w-0 max-w-full items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--glass-bg)] px-4 py-2 backdrop-blur-xl">
                    <Network
                        size={12}
                        aria-hidden="true"
                        className="shrink-0 text-[var(--text-2)]"
                    />
                    <span className="truncate text-xs font-semibold text-[var(--text-0)]">
                        {displayTitle}
                    </span>
                </div>
            </div>

            {hasGraph && graph ? (
                <div className="absolute right-4 top-4 z-30">
                    <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--glass-bg)] px-3.5 py-2 text-[11px] font-semibold tabular-nums text-[var(--text-1)] backdrop-blur-xl">
                        {graph.nodes.length} concepts · {graph.edges.length} relationships
                    </span>
                </div>
            ) : null}

            {hasGraph ? (
                <div className="pointer-events-none absolute bottom-4 left-4 z-20 hidden sm:block">
                    <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-faint)] bg-[var(--glass-bg)] px-3.5 py-1.5 text-[11px] text-[var(--text-3)] backdrop-blur-xl">
                        Drag nodes · Scroll to zoom · Click a concept to inspect
                    </span>
                </div>
            ) : null}

            <GraphInspector
                node={selected}
                graph={graph}
                onClose={() => setSelected(null)}
            />
        </main>
    );
}