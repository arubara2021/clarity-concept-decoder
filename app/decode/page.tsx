"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { WorkspaceShell } from "@/components/decode/workspace-shell";
import { SourceComposer } from "@/components/decode/source-composer";
import { StatusBar } from "@/components/decode/status-bar";
import { OutputCanvas } from "@/components/decode/output-canvas";
import { CommandPalette } from "@/components/overlays/command-palette";
import { ShareDialog } from "@/components/share/share-dialog";
import { useDecodeStream } from "@/lib/use-decode-stream";
import { useStore } from "@/lib/store";

export default function DecodePage() {
    const router = useRouter();
    const { runDecode } = useDecodeStream();
    const [isNavigating, setIsNavigating] = useState(false);
    const decodeRef = useRef<() => Promise<unknown>>(async () => null);

    useEffect(() => {
        const query = window.matchMedia("(min-width: 1024px)");

        function apply() {
            if (query.matches) {
                document.body.classList.add("workspace-locked");
            } else {
                document.body.classList.remove("workspace-locked");
            }
        }

        apply();
        query.addEventListener("change", apply);

        return () => {
            query.removeEventListener("change", apply);
            document.body.classList.remove("workspace-locked");
        };
    }, []);

    async function handleDecode() {
        const result = await runDecode();
        if (result.ok && result.id) {
            setIsNavigating(true);
            router.push(`/r/${result.id}`);
        }
        return result;
    }

    useEffect(() => {
        decodeRef.current = handleDecode;
    });

    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (event.key !== "Enter") return;
            if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;

            const target = event.target as HTMLElement | null;
            if (target) {
                const tag = target.tagName;
                if (
                    tag === "TEXTAREA" ||
                    tag === "INPUT" ||
                    tag === "BUTTON" ||
                    target.isContentEditable
                ) {
                    return;
                }
            }

            const state = useStore.getState();
            if (state.isPaletteOpen || state.isShareOpen || state.isDecoding) return;

            event.preventDefault();
            void decodeRef.current();
        }

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    return (
        <main className="flex min-h-dvh w-full flex-col bg-[var(--bg-0)] text-[var(--text-0)] lg:h-dvh lg:overflow-hidden">
            <div className="relative z-40 shrink-0 px-3 pt-3 sm:px-4 sm:pt-4">
                <AppHeader />
            </div>

            <WorkspaceShell
                className="min-h-0 px-3 pb-3 pt-2 sm:px-4 sm:pb-4 sm:pt-3 lg:flex-1"
                left={
                    <>
                        <SourceComposer />
                        <StatusBar onDecode={handleDecode} />
                    </>
                }
                right={
                    <OutputCanvas
                        navigating={isNavigating}
                        onRetry={() => void handleDecode()}
                    />
                }
            />

            <CommandPalette />
            <ShareDialog />
        </main>
    );
}