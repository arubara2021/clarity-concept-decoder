"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { motion } from "motion/react";
import { AppHeader } from "@/components/layout/app-header";
import { LibraryList } from "@/components/library-list";
import { Badge } from "@/components/ui/badge";
import { listDecodes } from "@/lib/local-store";
import type { LocalDecode } from "@/lib/types";

export default function LibraryPage() {
    const decodes = useLiveQuery(
        () => listDecodes(),
        [],
        [] as LocalDecode[]
    );

    return (
        <main className="min-h-dvh bg-[var(--bg-0)] text-[var(--text-0)]">
            <div className="mx-auto w-[min(var(--content-max,1120px),calc(100%-2rem))] pb-20 pt-24">
                <AppHeader />

                <motion.header
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="mt-10 flex flex-col gap-3"
                >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--text-2)]">
                        Your library
                    </p>

                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <h1 className="text-3xl font-semibold tracking-[-0.04em] md:text-4xl">
                            Everything you have decoded
                        </h1>

                        <Badge variant="neutral">
                            {decodes.length} {decodes.length === 1 ? "decode" : "decodes"}
                        </Badge>
                    </div>

                    <p className="max-w-[68ch] text-sm leading-6 text-[color:var(--text-2)]">
                        Every decode is stored privately in this browser. Search, reopen,
                        rename, or delete them at any time. Nothing leaves this device
                        unless you explicitly share it.
                    </p>
                </motion.header>

                <div className="mt-8">
                    <LibraryList decodes={decodes} />
                </div>
            </div>
        </main>
    );
}