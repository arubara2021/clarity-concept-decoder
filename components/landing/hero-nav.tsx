"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Menu, X } from "lucide-react";
import { LogoMark } from "@/components/layout/logo-mark";
import { cn } from "@/lib/cn";

const navLinks = [
    { name: "Decode", href: "/decode" },
    { name: "Library", href: "/library" },
];

export function HeroNav() {
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 24);
        };

        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    useEffect(() => {
        document.body.style.overflow = mobileMenuOpen ? "hidden" : "auto";

        return () => {
            document.body.style.overflow = "auto";
        };
    }, [mobileMenuOpen]);

    return (
        <motion.header
            initial={{ y: -72, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className={cn(
                "fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300",
                scrolled || mobileMenuOpen
                    ? "border-[var(--border)] bg-[var(--glass-bg)] backdrop-blur-xl"
                    : "border-transparent bg-transparent backdrop-blur-0"
            )}
        >
            <div className="mx-auto flex h-16 w-[min(1160px,calc(100%-2rem))] items-center justify-between gap-4">
                <Link
                    href="/"
                    className="group inline-flex items-center gap-2.5 rounded-full py-1 pr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
                >
                    <span className="text-[var(--text-0)] transition-transform duration-200 group-hover:-rotate-6">
                        <LogoMark size="sm" />
                    </span>

                    <span className="text-sm font-semibold tracking-tight text-[var(--text-0)]">
                        Clarity
                    </span>
                </Link>

                <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="group relative rounded-full px-3 py-2 text-sm font-medium text-[var(--text-2)] transition-colors hover:text-[var(--text-0)]"
                        >
                            {link.name}
                            <span
                                aria-hidden="true"
                                className="absolute inset-x-3 -bottom-0.5 h-px scale-x-0 rounded-full bg-[var(--text-0)] transition-transform duration-300 group-hover:scale-x-100"
                            />
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => router.push("/decode")}
                        className="hidden h-9 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--glass-bg)] px-4 text-xs font-semibold text-[var(--text-1)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text-0)] md:inline-flex"
                    >
                        Open Clarity
                        <ArrowRight size={12} aria-hidden="true" />
                    </button>

                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen((value) => !value)}
                        aria-expanded={mobileMenuOpen}
                        aria-label="Toggle navigation menu"
                        className="inline-grid h-10 w-10 place-items-center rounded-xl border border-[var(--border)] bg-[var(--glass-bg)] text-[var(--text-0)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--bg-2)] md:hidden"
                    >
                        {mobileMenuOpen ? (
                            <X size={18} aria-hidden="true" />
                        ) : (
                            <Menu size={18} aria-hidden="true" />
                        )}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {mobileMenuOpen ? (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ type: "spring", stiffness: 320, damping: 32 }}
                        className="overflow-hidden border-t border-[var(--border)] bg-[var(--bg-1)] backdrop-blur-2xl md:hidden"
                    >
                        <div className="mx-auto flex w-[min(1160px,calc(100%-2rem))] flex-col gap-3 py-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] px-4 py-3 text-sm font-medium text-[var(--text-1)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text-0)]"
                                >
                                    {link.name}
                                </Link>
                            ))}

                            <button
                                type="button"
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    router.push("/decode");
                                }}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[var(--button-bg)] px-4 text-sm font-semibold text-[var(--button-text)]"
                            >
                                Open Clarity
                                <ArrowRight size={14} aria-hidden="true" />
                            </button>
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </motion.header>
    );
}