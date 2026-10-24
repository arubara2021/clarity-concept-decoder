import type { Metadata } from "next";
import { HeroNav } from "@/components/landing/hero-nav";
import { HeroBackground } from "@/components/landing/hero-background";
import { HeroGraph } from "@/components/landing/hero-graph";
import { HeroContent } from "@/components/landing/hero-content";

export const metadata: Metadata = {
    title: "Clarity — Understand anything, at your level",
    description:
        "Paste dense text, drop a document, or extract a page. Clarity rebuilds the explanation into a clear mental model.",
};

export default function LandingPage() {
    return (
        <main className="relative h-dvh overflow-hidden bg-[var(--bg-0)] text-[var(--text-0)]">
            <HeroNav />

            <section className="relative flex h-full min-h-[640px] w-full items-center px-6 pb-16 pt-24">
                <HeroBackground />
                <HeroGraph className="opacity-30 md:opacity-45" />
                <HeroContent />
            </section>
        </main>
    );
}