"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CircleAlert, UploadCloud } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { SourceToolbar, type SourceMode } from "@/components/decode/source-toolbar";
import { useStore } from "@/lib/store";
import { MAX_SOURCE_CHARS } from "@/lib/limits";
import { cn } from "@/lib/cn";

export { MAX_SOURCE_CHARS };

const MAX_FILE_BYTES = 20 * 1024 * 1024;

async function extractPdfText(
  file: File,
  onProgress: (value: number) => void
): Promise<string> {
  const pdfjs = await import("pdfjs-dist");

  if (typeof window !== "undefined" && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
  }

  const buffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: buffer });
  const doc = await loadingTask.promise;
  const pages: string[] = [];

  try {
    for (let pageIndex = 1; pageIndex <= doc.numPages; pageIndex += 1) {
      const page = await doc.getPage(pageIndex);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");
      pages.push(pageText);
      onProgress(pageIndex / doc.numPages);
    }
  } finally {
    await loadingTask.destroy();
  }

  return pages.join("\n").trim();
}

export function SourceComposer() {
  const text = useStore((s) => s.text);
  const setText = useStore((s) => s.setText);
  const isDecoding = useStore((s) => s.isDecoding);

  const [mode, setMode] = useState<SourceMode>("paste");
  const [url, setUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [error, setError] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [progress, setProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);

  const busy = isExtracting || isFetchingUrl;

  const handleFile = useCallback(
    async (file: File) => {
      if (busy) return;

      setError("");
      setIsExtracting(true);
      setProgress(0);
      setSourceName("");

      try {
        if (file.size === 0) throw new Error("That file is empty.");
        if (file.size > MAX_FILE_BYTES) {
          throw new Error("That file is larger than the 20 MB limit.");
        }

        const lower = file.name.toLowerCase();

        if (lower.endsWith(".txt")) {
          setProgress(0.35);
          const raw = await file.text();
          const trimmed = raw.trim();
          if (!trimmed) throw new Error("No readable text was found in that file.");
          setProgress(1);
          setText(trimmed.slice(0, MAX_SOURCE_CHARS));
          setSourceName(file.name);
          return;
        }

        if (lower.endsWith(".pdf")) {
          const extracted = await extractPdfText(file, setProgress);
          if (!extracted) {
            throw new Error(
              "No extractable text was found in that PDF. Scanned or image-only PDFs are not supported."
            );
          }
          setText(extracted.slice(0, MAX_SOURCE_CHARS));
          setSourceName(file.name);
          return;
        }

        throw new Error("Only .pdf and .txt files are supported.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "The file could not be read.");
      } finally {
        setIsExtracting(false);
        setProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [busy, setText]
  );

  const handleFetchUrl = useCallback(async () => {
    if (busy) return;

    const trimmed = url.trim();
    if (!trimmed) {
      setError("Paste a public URL to extract.");
      return;
    }

    setError("");
    setIsFetchingUrl(true);
    setSourceName("");

    try {
      const response = await fetch("/api/fetch-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error ?? "That URL could not be extracted.");
      }
      if (typeof payload?.text !== "string" || !payload.text.trim()) {
        throw new Error("No readable text was found at that URL.");
      }

      setText(payload.text.slice(0, MAX_SOURCE_CHARS));
      setSourceName(payload.title || payload.url || trimmed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "That URL could not be extracted.");
    } finally {
      setIsFetchingUrl(false);
    }
  }, [busy, setText, url]);

  return (
    <div
      className="relative flex min-h-0 flex-1 flex-col"
      onDragEnter={(event) => {
        event.preventDefault();
        dragDepth.current += 1;
        setIsDragging(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => {
        event.preventDefault();
        dragDepth.current -= 1;
        if (dragDepth.current <= 0) {
          dragDepth.current = 0;
          setIsDragging(false);
        }
      }}
      onDrop={(event) => {
        event.preventDefault();
        dragDepth.current = 0;
        setIsDragging(false);
        const file = event.dataTransfer.files?.[0];
        if (file) void handleFile(file);
      }}
    >
      <div className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
        <div className="flex min-h-full flex-col">
          <SourceToolbar
            mode={mode}
            onModeChange={setMode}
            onPickFile={() => fileInputRef.current?.click()}
            onExtractUrl={() => void handleFetchUrl()}
            url={url}
            onUrlChange={setUrl}
            sourceName={sourceName}
            isExtracting={isExtracting}
            isFetchingUrl={isFetchingUrl}
            busy={busy}
            progress={progress}
          />

          <div className="flex min-h-[320px] flex-1 flex-col px-4 pt-5 sm:px-6">
            <Textarea
              id="source-text"
              borderless
              value={text}
              onChange={(event) => {
                setText(event.target.value.slice(0, MAX_SOURCE_CHARS));
                if (error) setError("");
              }}
              placeholder="Paste your dense text here, or drop a PDF or TXT."
              maxLength={MAX_SOURCE_CHARS}
              disabled={busy}
              invalid={error.length > 0}
              className={cn(
                "flex-1 text-[15px] leading-8",
                isDecoding && !busy && "opacity-60"
              )}
            />

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,application/pdf,text/plain"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleFile(file);
              }}
            />
          </div>

          <div className="px-4 pb-3 sm:px-6">
            <AnimatePresence initial={false} mode="wait">
              {error ? (
                <motion.p
                  key="source-error"
                  role="alert"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-center gap-2 text-xs font-medium text-[var(--danger)]"
                >
                  <CircleAlert size={12} aria-hidden="true" />
                  {error}
                </motion.p>
              ) : (
                <motion.p
                  key="source-hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-[11px] text-[var(--text-3)]"
                >
                  <UploadCloud size={12} aria-hidden="true" />
                  Drop a PDF or TXT anywhere in this canvas.
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isDragging ? (
          <motion.div
            className="pointer-events-none absolute inset-0 z-20 grid place-items-center rounded-2xl border-2 border-dashed border-[var(--border-strong)] bg-[var(--accent-tint)] backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <motion.span
              aria-hidden="true"
              className="absolute inset-6 rounded-3xl border border-[var(--border-strong)]"
              animate={{ scale: [1, 1.02, 1], opacity: [0.5, 0.9, 0.5] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-0)]">
              <UploadCloud size={16} aria-hidden="true" />
              Drop PDF or TXT
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}