import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { readShare } from "@/lib/share-store";
import { ResultCards } from "@/components/decode/result-cards";
import { ConceptMap } from "@/components/concept/concept-map";
import { Badge } from "@/components/ui/badge";
import { LogoMark } from "@/components/layout/logo-mark";
import type { CardState, DecodeSection } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const populated: Record<DecodeSection, CardState> = {
    tldr: "complete",
    analogy: "complete",
    jargon: "complete",
    takeaway: "complete",
};

export default async function SharedDecodePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    if (!process.env.DATABASE_URL) {
        notFound();
    }

    const result = await readShare(id).catch(() => null);

    if (!result) {
        notFound();
    }

    const { decode, createdAt } = result;
    const sharedDate = new Date(createdAt);
    const dateLabel = Number.isNaN(sharedDate.getTime())
        ? ""
        : sharedDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });

    return (
        <main className="min-h-dvh bg-[var(--bg-0)] text-[var(--text-0)]">
            <div className="mx-auto w-[min(var(--content-max,1120px),calc(100%-2rem))] pb-24">
                <header className="flex items-center justify-between border-b border-[var(--border)] py-6">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 rounded-full py-1 pr-2 text-sm font-semibold tracking-[-0.02em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
                    >
                        <span className="text-[var(--text-0)]">
                            <LogoMark size="sm" />
                        </span>
                        Clarity
                    </Link>
                    <Badge variant="neutral">Shared decode</Badge>
                </header>

                <article className="mx-auto mt-14 max-w-[var(--reading-measure,68ch)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-2)]">
                        A shared Clarity decode
                    </p>
                    <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] md:text-5xl">
                        Understand anything, at your level.
                    </h1>

                    <div className="mt-5 flex flex-wrap items-center gap-2">
                        <Badge variant="neutral">{decode.audience}</Badge>
                        {dateLabel ? (
                            <Badge variant="neutral">Shared on {dateLabel}</Badge>
                        ) : null}
                    </div>

                    <details className="group mt-10 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-1)]">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-medium text-[var(--text-1)] transition-colors hover:bg-[var(--bg-2)]">
                            <span className="inline-flex items-center gap-2">
                                <BookOpen size={14} aria-hidden="true" />
                                Original source
                            </span>
                            <span className="tabular-nums text-[var(--text-3)]">
                                {decode.text.length.toLocaleString("en-US")} chars
                            </span>
                        </summary>
                        <div className="max-h-[60dvh] overflow-y-auto whitespace-pre-wrap break-words border-t border-[var(--border)] px-5 py-4 text-sm leading-7 text-[var(--text-1)]">
                            {decode.text}
                        </div>
                    </details>

                    <div className="mt-12">
                        <ResultCards
                            sections={decode.sections}
                            cardStates={populated}
                            sectionErrors={{}}
                        />
                    </div>

                    {decode.graph && decode.graph.nodes.length > 0 ? (
                        <section aria-label="Concept map" className="mt-12">
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                <h2 className="text-xl font-semibold tracking-[-0.02em]">
                                    Concept map
                                </h2>
                                <Badge variant="neutral">
                                    {decode.graph.nodes.length} concepts ·{" "}
                                    {decode.graph.edges.length} relationships
                                </Badge>
                            </div>
                            <ConceptMap graph={decode.graph} />
                        </section>
                    ) : null}

                    <footer className="mt-16 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-6 text-xs text-[var(--text-2)]">
                        <span>This is a shared Clarity decode.</span>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-1 font-medium text-[var(--text-1)] transition-colors hover:text-[var(--text-0)]"
                        >
                            Make your own at Clarity
                            <ArrowRight size={12} aria-hidden="true" />
                        </Link>
                    </footer>
                </article>
            </div>
        </main>
    );
}