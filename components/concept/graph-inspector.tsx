"use client";

import { useMemo, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDownRight, ArrowUpRight, Waypoints, X } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ConceptGraph, ConceptNode } from "@/lib/types";

type GraphInspectorProps = {
    node: ConceptNode | null;
    graph: ConceptGraph | null;
    onClose: () => void;
};

type Relationship = {
    id: string;
    direction: "outgoing" | "incoming";
    otherLabel: string;
    label?: string;
};

export function GraphInspector({ node, graph, onClose }: GraphInspectorProps) {
    // Use refs to hold the last valid node/graph so the inspector doesn't 
    // instantly blank out when the user clicks away (which sets node to null).
    // This avoids the react-hooks/set-state-in-effect lint error.
    const lastNodeRef = useRef(node);
    const lastGraphRef = useRef(graph);

    if (node) lastNodeRef.current = node;
    if (graph) lastGraphRef.current = graph;

    const lastNode = node ?? lastNodeRef.current;
    const lastGraph = graph ?? lastGraphRef.current;

    const relationships = useMemo<Relationship[]>(() => {
        if (!lastNode || !lastGraph) return [];

        const byId = new Map(lastGraph.nodes.map((item) => [item.id, item]));
        const outgoing: Relationship[] = [];
        const incoming: Relationship[] = [];

        for (const edge of lastGraph.edges) {
            if (edge.source === lastNode.id) {
                const other = byId.get(edge.target);
                if (other) {
                    outgoing.push({
                        id: edge.id,
                        direction: "outgoing",
                        otherLabel: other.label,
                        label: edge.label,
                    });
                }
            } else if (edge.target === lastNode.id) {
                const other = byId.get(edge.source);
                if (other) {
                    incoming.push({
                        id: edge.id,
                        direction: "incoming",
                        otherLabel: other.label,
                        label: edge.label,
                    });
                }
            }
        }

        return [...outgoing, ...incoming];
    }, [lastGraph, lastNode]);

    // The panel is only considered "open" if the active node/graph props are present.
    const open = Boolean(node && graph);

    return (
        <AnimatePresence>
            {open && lastNode ? (
                <motion.aside
                    key="graph-inspector"
                    role="dialog"
                    aria-label={`Relationships for ${lastNode.label}`}
                    initial={{ opacity: 0, x: 28, scale: 0.98 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 28, scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    className="absolute right-4 top-20 z-30 flex max-h-[calc(100dvh-7rem)] w-[min(360px,calc(100%-2rem))] flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--glass-bg)] shadow-[var(--shadow-float)] backdrop-blur-2xl"
                >
                    <div className="flex items-start justify-between gap-3 border-b border-[var(--border-faint)] px-5 py-4">
                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-3)]">
                                Concept inspector
                            </p>
                            <h2 className="mt-1 truncate text-sm font-semibold text-[var(--text-0)]">
                                {lastNode.label}
                            </h2>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close inspector"
                            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-transparent text-[var(--text-2)] transition-colors hover:border-[var(--border)] hover:bg-[var(--bg-2)] hover:text-[var(--text-0)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
                        >
                            <X size={14} aria-hidden="true" />
                        </button>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                        <p className="text-[11px] font-medium tabular-nums text-[var(--text-3)]">
                            {relationships.length} relationship
                            {relationships.length === 1 ? "" : "s"}
                        </p>

                        {relationships.length === 0 ? (
                            <p className="mt-3 rounded-xl border border-[var(--border-faint)] bg-[var(--bg-1)] px-4 py-3 text-xs leading-5 text-[var(--text-2)]">
                                This concept has no direct relationships in the extracted
                                graph.
                            </p>
                        ) : (
                            <ul className="mt-3 flex flex-col gap-2">
                                {relationships.map((relationship, index) => {
                                    const Icon =
                                        relationship.direction === "outgoing"
                                            ? ArrowUpRight
                                            : ArrowDownRight;

                                    return (
                                        <motion.li
                                            key={relationship.id}
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                delay: index * 0.03,
                                                type: "spring",
                                                stiffness: 380,
                                                damping: 30,
                                            }}
                                        >
                                            <div className="grid grid-cols-[auto_1fr] items-start gap-3 rounded-xl border border-[var(--border-faint)] bg-[var(--bg-1)] px-3 py-2.5 transition-colors hover:border-[var(--border-strong)]">
                                                <span
                                                    className={cn(
                                                        "grid h-7 w-7 place-items-center rounded-lg",
                                                        relationship.direction === "outgoing"
                                                            ? "bg-[var(--accent-tint)] text-[var(--accent)]"
                                                            : "bg-[var(--bg-2)] text-[var(--text-2)]"
                                                    )}
                                                >
                                                    <Icon size={13} aria-hidden="true" />
                                                </span>
                                                <span className="min-w-0">
                                                    <span className="block truncate text-xs font-semibold text-[var(--text-0)]">
                                                        {relationship.otherLabel}
                                                    </span>
                                                    <span className="mt-0.5 block text-[11px] leading-4 text-[var(--text-3)]">
                                                        {relationship.direction === "outgoing"
                                                            ? "Points to"
                                                            : "Receives from"}
                                                        {relationship.label ? ` · ${relationship.label}` : ""}
                                                    </span>
                                                </span>
                                            </div>
                                        </motion.li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    <div className="flex items-start gap-2.5 border-t border-[var(--border-faint)] px-5 py-3.5">
                        <Waypoints
                            size={13}
                            aria-hidden="true"
                            className="mt-0.5 shrink-0 text-[var(--text-2)]"
                        />
                        <p className="text-[11px] leading-4 text-[var(--text-3)]">
                            Arrows point from the concept that acts on or produces another
                            toward the concept that receives the action.
                        </p>
                    </div>
                </motion.aside>
            ) : null}
        </AnimatePresence>
    );
}