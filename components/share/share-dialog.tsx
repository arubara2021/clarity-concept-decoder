"use client";

import { useCallback, useEffect, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
    Check,
    ClipboardCopy,
    ExternalLink,
    Link2,
    Share2,
    Trash2,
    X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { getDecode, getSessionIdentity, saveDecode } from "@/lib/local-store";
import type { LocalDecode } from "@/lib/types";

const SHARE_LIMIT = 10;

type ShareState =
    | { kind: "idle" }
    | { kind: "creating" }
    | { kind: "ready"; url: string; id: string }
    | { kind: "error"; message: string };

export function ShareDialog() {
    const isOpen = useStore((s) => s.isShareOpen);
    const close = useStore((s) => s.closeShare);
    const currentDecodeId = useStore((s) => s.currentDecodeId);

    const [entry, setEntry] = useState<LocalDecode | null>(null);
    const [shareCount, setShareCount] = useState(0);
    const [state, setState] = useState<ShareState>({ kind: "idle" });
    const [copied, setCopied] = useState(false);
    const [confirmRevoke, setConfirmRevoke] = useState(false);

    useEffect(() => {
        if (!isOpen || !currentDecodeId) return;

        let active = true;

        void getDecode(currentDecodeId).then((result) => {
            if (!active || !result) return;

            setEntry(result);

            if (result.share) {
                setState({
                    kind: "ready",
                    url: result.share.url,
                    id: result.share.id,
                });
            } else {
                setState({ kind: "idle" });
            }
        });

        return () => {
            active = false;
        };
    }, [currentDecodeId, isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        setCopied(false);
        setConfirmRevoke(false);

        const identity = getSessionIdentity();

        void fetch(`/api/share?identity=${encodeURIComponent(identity)}`, {
            method: "HEAD",
        })
            .then((response) => response.headers.get("x-share-count"))
            .then((value) => {
                if (value) setShareCount(Number(value));
            })
            .catch(() => undefined);
    }, [isOpen]);

    useEffect(() => {
        if (!copied) return;

        const timer = window.setTimeout(() => {
            setCopied(false);
        }, 1800);

        return () => window.clearTimeout(timer);
    }, [copied]);

    useEffect(() => {
        if (!confirmRevoke) return;

        const timer = window.setTimeout(() => {
            setConfirmRevoke(false);
        }, 3000);

        return () => window.clearTimeout(timer);
    }, [confirmRevoke]);

    const createShare = useCallback(async () => {
        if (!entry) return;

        setState({ kind: "creating" });

        try {
            const identity = getSessionIdentity();

            const response = await fetch("/api/share", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    identity,
                    decode: {
                        text: entry.text,
                        audience: entry.audience,
                        sections: entry.sections,
                        graph: entry.graph,
                    },
                }),
            });

            const payload = await response.json().catch(() => null);

            if (response.status === 503) {
                setState({
                    kind: "error",
                    message: "Sharing is not configured on this deployment.",
                });
                return;
            }

            if (response.status === 429) {
                setState({
                    kind: "error",
                    message:
                        "You have used all 10 shares on this browser. Revoke one to create a new one.",
                });
                return;
            }

            if (!response.ok || !payload?.id || !payload?.url || !payload?.deleteToken) {
                setState({
                    kind: "error",
                    message: "The share could not be created. Please try again.",
                });
                return;
            }

            const updated: LocalDecode = {
                ...entry,
                share: {
                    id: payload.id,
                    url: payload.url,
                    deleteToken: payload.deleteToken,
                },
            };

            await saveDecode(updated);

            setEntry(updated);
            setState({ kind: "ready", url: payload.url, id: payload.id });
            setShareCount((count) => Math.min(SHARE_LIMIT, count + 1));
            toast("Share link created.");
        } catch {
            setState({
                kind: "error",
                message: "The share could not be created. Please try again.",
            });
        }
    }, [entry]);

    const revokeShare = useCallback(async () => {
        if (!entry?.share) return;

        try {
            const response = await fetch(`/api/share/${entry.share.id}/revoke`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ deleteToken: entry.share.deleteToken }),
            });

            if (response.status !== 204 && response.status !== 404) {
                toast("Could not revoke the share.");
                return;
            }

            const updated: LocalDecode = { ...entry, share: null };

            await saveDecode(updated);

            setEntry(updated);
            setState({ kind: "idle" });
            setConfirmRevoke(false);
            setShareCount((count) => Math.max(0, count - 1));

            toast("Share revoked.");
        } catch {
            toast("Could not revoke the share.");
        }
    }, [entry]);

    const copyLink = useCallback(async (url: string) => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast("Link copied.");
        } catch {
            toast("Could not copy. Select the text and copy manually.");
        }
    }, []);

    const creating = state.kind === "creating";
    const limitReached = shareCount >= SHARE_LIMIT;

    return (
        <DialogPrimitive.Root
            open={isOpen}
            onOpenChange={(next) => {
                if (!next) close();
            }}
        >
            <AnimatePresence>
                {isOpen ? (
                    <DialogPrimitive.Portal forceMount>
                        <DialogPrimitive.Overlay asChild>
                            <motion.div
                                className="fixed inset-0 z-[70] bg-[var(--overlay-bg,rgba(8,8,8,0.55))] backdrop-blur-md"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.18 }}
                            />
                        </DialogPrimitive.Overlay>

                        <div className="pointer-events-none fixed inset-0 z-[71] grid place-items-center p-4">
                            <DialogPrimitive.Content
                                asChild
                                aria-describedby={undefined}
                                className="focus:outline-none"
                            >
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.96, y: 8 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.98, y: 4 }}
                                    transition={{ type: "spring", stiffness: 460, damping: 34 }}
                                    className="pointer-events-auto w-full max-w-lg overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[var(--bg-1)] shadow-[var(--shadow-float)]"
                                >
                                    <div className="flex items-start justify-between gap-4 border-b border-[color:var(--border)] px-6 py-5">
                                        <div>
                                            <DialogPrimitive.Title className="text-lg font-semibold tracking-[-0.02em] text-[color:var(--text-0)]">
                                                Share this decode
                                            </DialogPrimitive.Title>

                                            <p className="mt-1 text-sm leading-6 text-[color:var(--text-2)]">
                                                Anyone with this link can read this decode. You can
                                                revoke it at any time.
                                            </p>
                                        </div>

                                        <DialogPrimitive.Close asChild>
                                            <button
                                                type="button"
                                                aria-label="Close share dialog"
                                                className="inline-grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-transparent text-[color:var(--text-1)] transition-colors hover:border-[color:var(--border)] hover:bg-[var(--bg-2)] hover:text-[color:var(--text-0)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
                                            >
                                                <X size={16} aria-hidden="true" />
                                            </button>
                                        </DialogPrimitive.Close>
                                    </div>

                                    <div className="flex flex-col gap-5 px-6 py-5">
                                        {state.kind === "ready" ? (
                                            <>
                                                <div className="flex flex-col gap-2 sm:flex-row">
                                                    <input
                                                        readOnly
                                                        value={state.url}
                                                        onFocus={(event) => event.target.select()}
                                                        aria-label="Share link"
                                                        className="h-10 w-full flex-1 rounded-xl border border-[color:var(--border)] bg-[var(--bg-0)] px-4 font-mono text-xs text-[color:var(--text-1)] focus:border-[color:var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)]"
                                                    />

                                                    <Button
                                                        onClick={() => void copyLink(state.url)}
                                                        icon={
                                                            <AnimatePresence mode="wait" initial={false}>
                                                                {copied ? (
                                                                    <motion.span
                                                                        key="copied"
                                                                        initial={{ scale: 0.6, opacity: 0 }}
                                                                        animate={{ scale: 1, opacity: 1 }}
                                                                        exit={{ scale: 0.6, opacity: 0 }}
                                                                        transition={{ duration: 0.15 }}
                                                                        className="inline-flex"
                                                                    >
                                                                        <Check size={13} aria-hidden="true" />
                                                                    </motion.span>
                                                                ) : (
                                                                    <motion.span
                                                                        key="copy"
                                                                        initial={{ scale: 0.6, opacity: 0 }}
                                                                        animate={{ scale: 1, opacity: 1 }}
                                                                        exit={{ scale: 0.6, opacity: 0 }}
                                                                        transition={{ duration: 0.15 }}
                                                                        className="inline-flex"
                                                                    >
                                                                        <ClipboardCopy
                                                                            size={13}
                                                                            aria-hidden="true"
                                                                        />
                                                                    </motion.span>
                                                                )}
                                                            </AnimatePresence>
                                                        }
                                                    >
                                                        {copied ? "Copied" : "Copy"}
                                                    </Button>
                                                </div>

                                                <div className="flex items-center gap-3 text-xs text-[color:var(--text-2)]">
                                                    <span className="tabular-nums">
                                                        {shareCount} / {SHARE_LIMIT}
                                                    </span>

                                                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--bg-3)]">
                                                        <motion.div
                                                            className="h-full rounded-full bg-[var(--accent)]"
                                                            animate={{
                                                                width: `${Math.min(
                                                                    100,
                                                                    (shareCount / SHARE_LIMIT) * 100
                                                                )}%`,
                                                            }}
                                                            transition={{
                                                                type: "spring",
                                                                stiffness: 220,
                                                                damping: 30,
                                                            }}
                                                        />
                                                    </div>

                                                    <span>shares used</span>
                                                </div>

                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <Link
                                                            href={state.url}
                                                            target="_blank"
                                                            rel="noreferrer noopener"
                                                            className="inline-flex h-9 items-center gap-2 rounded-[10px] border border-[color:var(--border-strong)] px-3 text-xs font-semibold text-[color:var(--text-1)] transition-colors hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
                                                        >
                                                            <Link2 size={12} aria-hidden="true" />
                                                            Open shared view
                                                        </Link>

                                                        {currentDecodeId ? (
                                                            <Link
                                                                href={`/r/${currentDecodeId}`}
                                                                className="inline-flex h-9 items-center gap-2 rounded-[10px] border border-[color:var(--border-strong)] px-3 text-xs font-semibold text-[color:var(--text-1)] transition-colors hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
                                                            >
                                                                <ExternalLink size={12} aria-hidden="true" />
                                                                Private copy
                                                            </Link>
                                                        ) : null}
                                                    </div>

                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => {
                                                            if (confirmRevoke) {
                                                                void revokeShare();
                                                            } else {
                                                                setConfirmRevoke(true);
                                                            }
                                                        }}
                                                        icon={<Trash2 size={12} aria-hidden="true" />}
                                                    >
                                                        {confirmRevoke ? "Confirm revoke" : "Revoke share"}
                                                    </Button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-sm leading-6 text-[color:var(--text-1)]">
                                                    Sharing stores this one decode on the server so
                                                    anyone with the link can read it. Nothing else from
                                                    your library is uploaded.
                                                </p>

                                                <div className="flex items-center gap-3 text-xs text-[color:var(--text-2)]">
                                                    <span className="tabular-nums">
                                                        {shareCount} / {SHARE_LIMIT}
                                                    </span>

                                                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--bg-3)]">
                                                        <motion.div
                                                            className="h-full rounded-full bg-[var(--accent)]"
                                                            animate={{
                                                                width: `${Math.min(
                                                                    100,
                                                                    (shareCount / SHARE_LIMIT) * 100
                                                                )}%`,
                                                            }}
                                                            transition={{
                                                                type: "spring",
                                                                stiffness: 220,
                                                                damping: 30,
                                                            }}
                                                        />
                                                    </div>

                                                    <span>shares used</span>
                                                </div>

                                                {state.kind === "error" ? (
                                                    <p
                                                        role="alert"
                                                        className="text-xs font-medium text-[color:var(--danger)]"
                                                    >
                                                        {state.message}
                                                    </p>
                                                ) : null}

                                                {limitReached ? (
                                                    <p className="text-xs font-medium text-[color:var(--danger)]">
                                                        You must revoke a share before creating a new one.
                                                    </p>
                                                ) : null}

                                                <Button
                                                    onClick={() => void createShare()}
                                                    loading={creating}
                                                    disabled={creating || limitReached || !entry}
                                                    icon={<Share2 size={13} aria-hidden="true" />}
                                                    className="w-fit"
                                                >
                                                    {creating ? "Creating share" : "Create share link"}
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            </DialogPrimitive.Content>
                        </div>
                    </DialogPrimitive.Portal>
                ) : null}
            </AnimatePresence>
        </DialogPrimitive.Root>
    );
}