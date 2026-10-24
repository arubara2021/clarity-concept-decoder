"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import "./globals.css";

type GlobalErrorProps = {
    error: Error & { digest?: string };
    reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
    useEffect(() => {
        console.error("Clarity global error", error);
    }, [error]);

    return (
        <html lang="en" suppressHydrationWarning>
            <body className="bg-[var(--bg-0)] text-[var(--text-0)] antialiased">
                <main className="grid min-h-dvh place-items-center px-6">
                    <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--bg-1)] p-8 text-center shadow-[var(--shadow-float)]">
                        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-[var(--danger)] bg-[var(--danger-tint)] text-[var(--danger)]">
                            <AlertTriangle size={18} aria-hidden="true" />
                        </span>
                        <h1 className="mt-5 text-xl font-semibold tracking-[-0.02em]">
                            Clarity ran into a critical error
                        </h1>
                        <p className="mx-auto mt-3 max-w-[40ch] text-sm leading-6 text-[var(--text-2)]">
                            Nothing was lost. Your library lives in this browser. Reload the
                            app to continue where you left off.
                        </p>
                        <div className="mt-6 flex flex-wrap justify-center gap-2">
                            <button
                                type="button"
                                onClick={reset}
                                className="inline-flex h-10 items-center justify-center rounded-2xl bg-[var(--button-bg)] px-5 text-sm font-semibold text-[var(--button-text)] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
                            >
                                Try again
                            </button>
                            <button
                                type="button"
                                onClick={() => window.location.reload()}
                                className="inline-flex h-10 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--glass-bg)] px-5 text-sm font-semibold text-[var(--text-1)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text-0)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
                            >
                                Reload app
                            </button>
                        </div>
                    </div>
                </main>
            </body>
        </html>
    );
}