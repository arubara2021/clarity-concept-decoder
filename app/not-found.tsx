"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/layout/logo-mark";

export default function NotFound() {
    const router = useRouter();

    return (
        <main className="grid min-h-dvh place-items-center bg-[var(--bg-0)] px-6 text-[var(--text-0)]">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 360, damping: 30 }}
                className="w-full max-w-md text-center"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 26 }}
                    className="mx-auto w-fit text-[var(--text-0)]"
                    aria-hidden="true"
                >
                    <LogoMark size="lg" />
                </motion.div>

                <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-2)]">
                    404
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
                    This page drifted out of view
                </h1>
                <p className="mt-3 text-sm leading-6 text-[var(--text-2)]">
                    The decode, share, or page you are looking for does not exist here.
                </p>

                <div className="mt-8 flex flex-wrap justify-center gap-2">
                    <Button onClick={() => router.push("/")}>Back to Clarity</Button>
                    <Button variant="ghost" onClick={() => router.push("/library")}>
                        Open library
                    </Button>
                </div>
            </motion.div>
        </main>
    );
}