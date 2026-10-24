"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/layout/logo-mark";

type ErrorPageProps = {
    error: Error & { digest?: string };
    reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
    const router = useRouter();

    useEffect(() => {
        console.error("Clarity route error", error);
    }, [error]);

    return (
        <main className="grid min-h-dvh place-items-center bg-[var(--bg-0)] px-6 text-[var(--text-0)]">
            <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--bg-1)] p-8 text-center shadow-[var(--shadow-float)]">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-[var(--danger)] bg-[var(--danger-tint)] text-[var(--danger)]">
                    <AlertTriangle size={18} aria-hidden="true" />
                </span>
                <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-2)]">
                    Unexpected error
                </p>
                <h1 className="mt-2 text-xl font-semibold tracking-[-0.02em]">
                    This view hit a snag
                </h1>
                <p className="mx-auto mt-3 max-w-[40ch] text-sm leading-6 text-[var(--text-2)]">
                    Your decodes and library are safe in this browser. Reload the view or
                    head back to the workspace.
                </p>
                {error.digest ? (
                    <p className="mt-3 font-mono text-[10px] text-[var(--text-3)]">
                        ref {error.digest}
                    </p>
                ) : null}
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                    <Button onClick={reset} icon={<RefreshCw size={13} aria-hidden="true" />}>
                        Try again
                    </Button>
                    <Button variant="ghost" onClick={() => router.push("/decode")}>
                        Back to workspace
                    </Button>
                </div>
                <div className="mt-6 flex items-center justify-center gap-2 text-[var(--text-3)]">
                    <LogoMark size="sm" />
                    <span className="text-[11px]">Clarity</span>
                </div>
            </div>
        </main>
    );
}