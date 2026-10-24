"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { AnimatePresence, motion } from "motion/react";
import { OrbitInstrument } from "@/components/decode/orbit-instrument";
import { DecodeStage } from "@/components/decode/decode-stage";
import { RecentStrip } from "@/components/decode/recent-strip";
import { ErrorState } from "@/components/states/error-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { listDecodes } from "@/lib/local-store";
import type { LocalDecode } from "@/lib/types";

type OutputCanvasProps = {
    navigating: boolean;
    onRetry: () => void;
};

const SAMPLE_TEXT =
    "ReAct is a prompting paradigm that interleaves reasoning traces with task-specific actions. Instead of producing a final answer in one pass, the model writes a thought, emits an action such as a search query, observes the result, and repeats the loop. On HotpotQA and Fever, ReAct reduced hallucination compared with chain-of-thought alone because each claim is checked against an external observation before the next step. The tradeoff is latency: every action round-trips to a tool, so the answer arrives later but arrives grounded.";

export function OutputCanvas({ navigating, onRetry }: OutputCanvasProps) {
    const isDecoding = useStore((s) => s.isDecoding);
    const globalError = useStore((s) => s.globalError);
    const hasText = useStore((s) => s.text.trim().length > 0);
    const setText = useStore((s) => s.setText);

    const recent = useLiveQuery(
        async () => (await listDecodes()).slice(0, 3),
        [],
        [] as LocalDecode[]
    );

    const mode = isDecoding || navigating ? "stage" : globalError ? "error" : "idle";

    const statusLabel =
        mode === "stage"
            ? navigating
                ? "Opening"
                : "Decoding"
            : mode === "error"
                ? "Unavailable"
                : recent.length > 0
                    ? "Ready"
                    : "Idle";

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex shrink-0 items-start justify-between gap-3 px-4 pb-3 pt-4 sm:px-6">
                <p className="text-[11px] font-semibold uppercase leading-4 tracking-[0.12em] text-[var(--text-2)]">
                    02 / Output canvas
                </p>
                <Badge variant="neutral" dot={mode !== "idle"} pulse={mode === "stage"}>
                    {statusLabel}
                </Badge>
            </div>

            <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain">
                <div className="flex min-h-full flex-col">
                    <AnimatePresence initial={false} mode="wait">
                        {mode === "stage" ? (
                            <motion.div
                                key="stage"
                                initial={{ opacity: 0, y: 12, scale: 0.99 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -8, scale: 0.99 }}
                                transition={{ type: "spring", stiffness: 320, damping: 30 }}
                                className="flex flex-1 flex-col"
                            >
                                <DecodeStage navigating={navigating} />
                            </motion.div>
                        ) : mode === "error" ? (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0, y: 12, scale: 0.99 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -8, scale: 0.99 }}
                                transition={{ type: "spring", stiffness: 320, damping: 30 }}
                                className="grid flex-1 place-items-center px-4 py-10 sm:px-6"
                            >
                                <ErrorState
                                    compact
                                    title="The decoder is unavailable"
                                    message={globalError ?? "Please try again."}
                                    action={
                                        <Button onClick={onRetry} disabled={!hasText}>
                                            Try again
                                        </Button>
                                    }
                                    className="w-full max-w-md"
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="idle"
                                initial={{ opacity: 0, y: 12, scale: 0.99 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -8, scale: 0.99 }}
                                transition={{ type: "spring", stiffness: 320, damping: 30 }}
                                className="flex flex-1 flex-col"
                            >
                                <OrbitInstrument
                                    onTrySample={
                                        hasText
                                            ? undefined
                                            : () => {
                                                setText(SAMPLE_TEXT);
                                            }
                                    }
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <AnimatePresence initial={false}>
                {mode === "idle" && recent.length > 0 ? (
                    <motion.div
                        key="recent-rail"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 320, damping: 34 }}
                        className="shrink-0 overflow-hidden"
                    >
                        <RecentStrip decodes={recent} />
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
}