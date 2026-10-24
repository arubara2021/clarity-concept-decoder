"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
    ArrowUpDown,
    Check,
    CheckSquare,
    LayoutGrid,
    List,
    Pencil,
    Search,
    Sparkles,
    Square,
    Trash2,
    X,
} from "lucide-react";
import { toast } from "sonner";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { clearAll, deleteDecode, renameDecode } from "@/lib/local-store";
import { cleanTitle, stripMarkdown, resolveTitle } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { LocalDecode } from "@/lib/types";


type SortKey = "recent" | "oldest" | "alpha";
type FilterKey = "all" | "shared" | "private";
type ViewMode = "grid" | "list";

type LibraryListProps = {
    decodes: LocalDecode[];
};

type LibraryItemProps = {
    entry: LocalDecode;
    view: ViewMode;
    selected: boolean;
    editing: boolean;
    draftTitle: string;
    onToggleSelect: () => void;
    onStartRename: () => void;
    onCancelRename: () => void;
    onDraftTitle: (value: string) => void;
    onSaveRename: () => void;
    onDelete: () => void;
};

const filters: { value: FilterKey; label: string }[] = [
    { value: "all", label: "All" },
    { value: "shared", label: "Shared" },
    { value: "private", label: "Private" },
];

function relativeDay(timestamp: number): string {
    const diff = Date.now() - timestamp;
    const days = Math.floor(diff / 86400000);

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;

    return `${Math.floor(days / 365)} years ago`;
}

export function LibraryList({ decodes }: LibraryListProps) {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState<SortKey>("recent");
    const [filter, setFilter] = useState<FilterKey>("all");
    const [view, setView] = useState<ViewMode>("grid");
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [confirmDeleteSelected, setConfirmDeleteSelected] = useState(false);
    const [confirmClearAll, setConfirmClearAll] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [draftTitle, setDraftTitle] = useState("");

    useEffect(() => {
        setMounted(true);
        const saved = window.localStorage.getItem("clarity.library.view");
        if (saved === "grid" || saved === "list") {
            setView(saved);
        }
    }, []);

    useEffect(() => {
        if (!mounted) return;
        window.localStorage.setItem("clarity.library.view", view);
    }, [mounted, view]);

    useEffect(() => {
        setSelected((current) => {
            if (current.size === 0) return current;
            const ids = new Set(decodes.map((decode) => decode.id));
            const next = new Set(Array.from(current).filter((id) => ids.has(id)));
            return next.size === current.size ? current : next;
        });
    }, [decodes]);

    useEffect(() => {
        if (!confirmDeleteSelected) return;
        const timer = window.setTimeout(() => {
            setConfirmDeleteSelected(false);
        }, 3000);
        return () => window.clearTimeout(timer);
    }, [confirmDeleteSelected]);

    useEffect(() => {
        if (!confirmClearAll) return;
        const timer = window.setTimeout(() => {
            setConfirmClearAll(false);
        }, 3000);
        return () => window.clearTimeout(timer);
    }, [confirmClearAll]);

    const visible = useMemo(() => {
        const trimmed = query.trim().toLowerCase();
        let result = decodes;

        if (trimmed.length > 0) {
            result = result.filter(
                (entry) =>
                    entry.title.toLowerCase().includes(trimmed) ||
                    cleanTitle(entry.title).toLowerCase().includes(trimmed) ||
                    entry.text.toLowerCase().includes(trimmed)
            );
        }

        if (filter === "shared") {
            result = result.filter((entry) => entry.share);
        }

        if (filter === "private") {
            result = result.filter((entry) => !entry.share);
        }

        if (sort === "oldest") {
            result = [...result].sort((a, b) => a.createdAt - b.createdAt);
        } else if (sort === "alpha") {
            result = [...result].sort((a, b) =>
                cleanTitle(a.title).localeCompare(cleanTitle(b.title))
            );
        } else {
            result = [...result].sort((a, b) => b.createdAt - a.createdAt);
        }

        return result;
    }, [decodes, filter, query, sort]);

    const allSelected =
        visible.length > 0 && visible.every((entry) => selected.has(entry.id));

    const sortLabel =
        sort === "recent" ? "Newest" : sort === "oldest" ? "Oldest" : "A-Z";

    function toggleOne(id: string) {
        setSelected((current) => {
            const next = new Set(current);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }

    function toggleAllVisible() {
        setSelected((current) => {
            const next = new Set(current);
            if (allSelected) {
                visible.forEach((entry) => next.delete(entry.id));
            } else {
                visible.forEach((entry) => next.add(entry.id));
            }
            return next;
        });
    }

    function clearSelection() {
        setSelected(new Set());
        setConfirmDeleteSelected(false);
    }

    function cycleSort() {
        setSort((current) => {
            if (current === "recent") return "oldest";
            if (current === "oldest") return "alpha";
            return "recent";
        });
    }

    async function handleDeleteSelected() {
        const ids = Array.from(selected);
        await Promise.all(ids.map((id) => deleteDecode(id)));
        setSelected(new Set());
        setConfirmDeleteSelected(false);
        toast(`${ids.length} ${ids.length === 1 ? "decode" : "decodes"} deleted.`);
    }

    async function handleClearAll() {
        await clearAll();
        setSelected(new Set());
        setConfirmClearAll(false);
        toast("Library cleared.");
    }

    function startRename(entry: LocalDecode) {
        setEditingId(entry.id);
        setDraftTitle(entry.title);
    }

    function cancelRename() {
        setEditingId(null);
    }

    async function saveRename() {
        if (!editingId) return;
        const next = draftTitle.replace(/\s+/g, " ").trim();
        if (!next) {
            toast("Title cannot be empty.");
            return;
        }
        await renameDecode(editingId, next);
        setEditingId(null);
        toast("Title updated.");
    }

    async function handleDeleteOne(entry: LocalDecode) {
        await deleteDecode(entry.id);
        setSelected((current) => {
            if (!current.has(entry.id)) return current;
            const next = new Set(current);
            next.delete(entry.id);
            return next;
        });
        toast("Decode deleted.");
    }

    if (decodes.length === 0) {
        return (
            <Panel
                elevation="float"
                padding="xl"
                className="grid min-h-[420px] place-items-center text-center"
            >
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 360, damping: 30 }}
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-[var(--border)]"
                        aria-hidden="true"
                    >
                        <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                    </motion.div>
                    <h2 className="mt-6 text-xl font-semibold tracking-[-0.02em]">
                        Your library is empty
                    </h2>
                    <p className="mx-auto mt-2 max-w-[44ch] text-sm leading-6 text-[var(--text-2)]">
                        Decodes you make will appear here and stay private to this browser.
                        Nothing leaves this device unless you share it.
                    </p>
                    <Button
                        className="mx-auto mt-6"
                        onClick={() => router.push("/decode")}
                        icon={<Sparkles size={13} aria-hidden="true" />}
                    >
                        Make your first decode
                    </Button>
                </motion.div>
            </Panel>
        );
    }

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="relative w-full max-w-md">
                    <Search
                        size={14}
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-2)]"
                    />
                    <Input
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search titles and source"
                        aria-label="Search library"
                        className="pl-9"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex rounded-xl border border-[var(--border)] bg-[var(--bg-0)] p-1">
                        {filters.map((option) => {
                            const active = filter === option.value;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setFilter(option.value)}
                                    aria-pressed={active}
                                    className={cn(
                                        "relative rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                                        active
                                            ? "text-[var(--text-0)]"
                                            : "text-[var(--text-2)] hover:text-[var(--text-0)]"
                                    )}
                                >
                                    {active ? (
                                        <motion.span
                                            layoutId="library-filter-pill"
                                            className="absolute inset-0 rounded-lg bg-[var(--bg-2)] shadow-[var(--shadow-hair)]"
                                            transition={{ type: "spring", stiffness: 460, damping: 34 }}
                                        />
                                    ) : null}
                                    <span className="relative z-10">{option.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={cycleSort}
                        icon={<ArrowUpDown size={12} aria-hidden="true" />}
                    >
                        {sortLabel}
                    </Button>

                    <div className="inline-flex rounded-xl border border-[var(--border)] bg-[var(--bg-0)] p-1">
                        <button
                            type="button"
                            onClick={() => setView("grid")}
                            aria-pressed={view === "grid"}
                            aria-label="Grid view"
                            className={cn(
                                "relative grid h-8 w-9 place-items-center rounded-lg transition-colors",
                                view === "grid"
                                    ? "text-[var(--text-0)]"
                                    : "text-[var(--text-2)] hover:text-[var(--text-0)]"
                            )}
                        >
                            {view === "grid" ? (
                                <motion.span
                                    layoutId="library-view-pill"
                                    className="absolute inset-0 rounded-lg bg-[var(--bg-2)] shadow-[var(--shadow-hair)]"
                                    transition={{ type: "spring", stiffness: 460, damping: 34 }}
                                />
                            ) : null}
                            <LayoutGrid size={13} aria-hidden="true" className="relative z-10" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setView("list")}
                            aria-pressed={view === "list"}
                            aria-label="List view"
                            className={cn(
                                "relative grid h-8 w-9 place-items-center rounded-lg transition-colors",
                                view === "list"
                                    ? "text-[var(--text-0)]"
                                    : "text-[var(--text-2)] hover:text-[var(--text-0)]"
                            )}
                        >
                            {view === "list" ? (
                                <motion.span
                                    layoutId="library-view-pill"
                                    className="absolute inset-0 rounded-lg bg-[var(--bg-2)] shadow-[var(--shadow-hair)]"
                                    transition={{ type: "spring", stiffness: 460, damping: 34 }}
                                />
                            ) : null}
                            <List size={13} aria-hidden="true" className="relative z-10" />
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence initial={false}>
                {selected.size > 0 ? (
                    <motion.div
                        key="bulk-selection-bar"
                        layout
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    >
                        <Panel
                            elevation="raised"
                            padding="sm"
                            className="flex flex-wrap items-center justify-between gap-3 border-[var(--accent)] bg-[var(--accent-tint)]"
                        >
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="amber" dot>
                                    {selected.size} selected
                                </Badge>
                                <Button variant="ghost" size="sm" onClick={toggleAllVisible}>
                                    {allSelected ? "Unselect all" : "Select all"}
                                </Button>
                                <Button variant="ghost" size="sm" onClick={clearSelection}>
                                    Clear
                                </Button>
                            </div>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                    if (confirmDeleteSelected) {
                                        void handleDeleteSelected();
                                    } else {
                                        setConfirmDeleteSelected(true);
                                    }
                                }}
                                icon={<Trash2 size={12} aria-hidden="true" />}
                            >
                                {confirmDeleteSelected
                                    ? `Confirm delete ${selected.size}`
                                    : `Delete ${selected.size}`}
                            </Button>
                        </Panel>
                    </motion.div>
                ) : null}
            </AnimatePresence>

            {visible.length === 0 ? (
                <Panel
                    elevation="raised"
                    padding="xl"
                    className="grid min-h-[320px] place-items-center text-center"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        className="max-w-[44ch]"
                    >
                        <Search size={22} aria-hidden="true" className="mx-auto text-[var(--text-2)]" />
                        <h2 className="mt-4 text-lg font-semibold tracking-[-0.02em]">
                            No decodes match
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-[var(--text-2)]">
                            Try a different search, or clear the current filters.
                        </p>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mx-auto mt-5"
                            onClick={() => {
                                setQuery("");
                                setFilter("all");
                            }}
                        >
                            Clear search and filters
                        </Button>
                    </motion.div>
                </Panel>
            ) : (
                <motion.div
                    layout
                    className={cn(
                        view === "grid"
                            ? "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
                            : "flex flex-col gap-3"
                    )}
                >
                    <AnimatePresence initial={false}>
                        {visible.map((entry) => (
                            <LibraryItem
                                key={entry.id}
                                entry={entry}
                                view={view}
                                selected={selected.has(entry.id)}
                                editing={editingId === entry.id}
                                draftTitle={draftTitle}
                                onToggleSelect={() => toggleOne(entry.id)}
                                onStartRename={() => startRename(entry)}
                                onCancelRename={cancelRename}
                                onDraftTitle={setDraftTitle}
                                onSaveRename={() => void saveRename()}
                                onDelete={() => void handleDeleteOne(entry)}
                            />
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-5 text-xs text-[var(--text-2)]">
                <span>
                    {decodes.length} {decodes.length === 1 ? "decode" : "decodes"} live in
                    this browser only.
                </span>
                {confirmClearAll ? (
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-[var(--danger)]">
                            Delete everything?
                        </span>
                        <Button variant="danger" size="sm" onClick={() => void handleClearAll()}>
                            Yes
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setConfirmClearAll(false)}>
                            No
                        </Button>
                    </div>
                ) : (
                    <Button variant="ghost" size="sm" onClick={() => setConfirmClearAll(true)}>
                        Clear all
                    </Button>
                )}
            </div>
        </div>
    );
}

function LibraryItem({
    entry,
    view,
    selected,
    editing,
    draftTitle,
    onToggleSelect,
    onStartRename,
    onCancelRename,
    onDraftTitle,
    onSaveRename,
    onDelete,
}: LibraryItemProps) {
    const isGrid = view === "grid";
    const displayTitle = resolveTitle(entry.title, entry.text, 90);
    const preview = stripMarkdown(entry.text);
    const snippet = preview.slice(0, isGrid ? 220 : 140);

    if (editing) {
        return (
            <motion.div
                layout
                layoutId={`library-item-${entry.id}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
            >
                <Panel elevation="raised" padding="md" className="border-[var(--accent)]">
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Input
                            autoFocus
                            value={draftTitle}
                            onChange={(event) => onDraftTitle(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    event.preventDefault();
                                    onSaveRename();
                                }
                                if (event.key === "Escape") {
                                    onCancelRename();
                                }
                            }}
                            aria-label="Rename decode"
                            className="h-9 flex-1"
                        />
                        <div className="flex gap-2">
                            <Button size="sm" onClick={onSaveRename} icon={<Check size={12} aria-hidden="true" />}>
                                Save
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={onCancelRename}
                                icon={<X size={12} aria-hidden="true" />}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </Panel>
            </motion.div>
        );
    }

    const selectionButton = (
        <button
            type="button"
            onClick={onToggleSelect}
            aria-pressed={selected}
            aria-label={selected ? `Deselect ${displayTitle}` : `Select ${displayTitle}`}
            className={cn(
                "pointer-events-auto grid h-7 w-7 shrink-0 place-items-center rounded-md border transition-colors",
                selected
                    ? "border-[var(--accent)] bg-[var(--accent-tint)] text-[var(--accent)]"
                    : "border-[var(--border)] text-[var(--text-2)] hover:border-[var(--border-strong)] hover:text-[var(--text-0)]"
            )}
        >
            {selected ? (
                <CheckSquare size={13} aria-hidden="true" />
            ) : (
                <Square size={13} aria-hidden="true" />
            )}
        </button>
    );

    const actions = (
        <div className="pointer-events-auto flex shrink-0 items-center gap-1 opacity-100 transition-opacity duration-150 lg:opacity-0 lg:group-focus-within:opacity-100 lg:group-hover:opacity-100">
            <button
                type="button"
                onClick={onStartRename}
                aria-label={`Rename ${displayTitle}`}
                className="grid h-7 w-7 place-items-center rounded-md border border-transparent text-[var(--text-2)] transition-colors hover:border-[var(--border)] hover:bg-[var(--bg-0)] hover:text-[var(--text-0)]"
            >
                <Pencil size={12} aria-hidden="true" />
            </button>
            <button
                type="button"
                onClick={onDelete}
                aria-label={`Delete ${displayTitle}`}
                className="grid h-7 w-7 place-items-center rounded-md border border-transparent text-[var(--text-2)] transition-colors hover:border-[var(--danger)] hover:bg-[var(--danger-tint)] hover:text-[var(--danger)]"
            >
                <Trash2 size={12} aria-hidden="true" />
            </button>
        </div>
    );

    return (
        <motion.div
            layout
            layoutId={`library-item-${entry.id}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            whileHover={{ y: -2 }}
            className="group relative"
        >
            <Link
                href={`/r/${entry.id}`}
                aria-label={`Open ${displayTitle}`}
                className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
            />
            <Panel
                elevation="raised"
                padding={isGrid ? "md" : "sm"}
                className="pointer-events-none relative z-10 h-full transition-colors duration-200 group-hover:border-[var(--border-strong)] group-hover:bg-[var(--bg-2)]"
            >
                {isGrid ? (
                    <div className="flex h-full flex-col">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-2">
                                {selectionButton}
                                <Badge variant="neutral">{entry.audience}</Badge>
                                {entry.share ? (
                                    <Badge variant="amber" dot>
                                        Shared
                                    </Badge>
                                ) : null}
                            </div>
                            {actions}
                        </div>
                        <div className="mt-3 min-w-0">
                            <p className="line-clamp-2 text-sm font-semibold text-[var(--text-0)]">
                                {displayTitle}
                            </p>
                            <p className="mt-2 line-clamp-3 text-xs leading-5 text-[var(--text-2)]">
                                {snippet}
                            </p>
                        </div>
                        <div className="mt-auto flex items-center justify-between pt-4 text-[11px] text-[var(--text-3)]">
                            <span>{relativeDay(entry.createdAt)}</span>
                            <span className="tabular-nums">
                                {entry.text.length.toLocaleString("en-US")} chars
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        {selectionButton}
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-[var(--text-0)]">
                                {displayTitle}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-[var(--text-2)]">
                                {snippet}
                            </p>
                        </div>
                        <div className="hidden items-center gap-2 md:flex">
                            <Badge variant="neutral">{entry.audience}</Badge>
                            {entry.share ? (
                                <Badge variant="amber" dot>
                                    Shared
                                </Badge>
                            ) : null}
                        </div>
                        <span className="hidden shrink-0 text-[11px] text-[var(--text-3)] lg:inline">
                            {relativeDay(entry.createdAt)}
                        </span>
                        {actions}
                    </div>
                )}
            </Panel>
        </motion.div>
    );
}