"use client";

import { useState } from "react";

const audiences = ["Student", "Executive", "Developer (Non-ML)"] as const;
type Section = "tldr" | "analogy" | "jargon" | "takeaway";
type Results = Record<Section, string>;

const emptyResults: Results = {
  tldr: "",
  analogy: "",
  jargon: "",
  takeaway: "",
};

export default function Home() {
  const [text, setText] = useState("");
  const [audience, setAudience] = useState<(typeof audiences)[number]>("Student");
  const [error, setError] = useState("");
  const [results, setResults] = useState<Results>(emptyResults);
  const [isDecoding, setIsDecoding] = useState(false);

  async function handleDecode() {
    if (!text.trim()) {
      setError("Please paste some text to decode.");
      return;
    }

    setError("");
    setResults(emptyResults);
    setIsDecoding(true);

    try {
      const response = await fetch("/api/decode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, audience }),
      });

      if (!response.ok || !response.body) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "The decoder is unavailable.");
      }

      const reader = response.body.getReader();
      const textDecoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          buffer += textDecoder.decode();
        } else {
          buffer += textDecoder.decode(value, { stream: true });
        }

        const messages = buffer.split("\n\n");
        buffer = messages.pop() ?? "";

        for (const message of messages) {
          const eventName = message.match(/^event: (.+)$/m)?.[1];
          const data = message.match(/^data: (.+)$/m)?.[1];
          if (!eventName || !data) continue;

          const payload = JSON.parse(data) as { section?: Section; text?: string; message?: string };
          const section = payload.section;
          if (eventName === "token" && section && payload.text) {
            setResults((current) => ({
              ...current,
              [section]: current[section] + payload.text,
            }));
          }

          if (eventName === "global-error") {
            throw new Error(payload.message ?? "The decoder is unavailable.");
          }
        }

        if (done) break;
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The decoder is unavailable.");
    } finally {
      setIsDecoding(false);
    }
  }

  return (
    <main className="clarity-shell">
      <div className="grain" aria-hidden="true" />
      <div className="clarity-frame">
        <header className="site-header">
          <a className="brand" href="#top" aria-label="Clarity home">
            <span className="brand-mark" aria-hidden="true">C</span>
            <span className="brand-name">Clarity</span>
          </a>
          <p className="tagline">Understand anything, at your level.</p>
          <span className="header-status"><span className="status-dot" />Concept decoder</span>
        </header>

        <section className="intro-block" id="top">
          <p className="overline">A better way through dense ideas</p>
          <h1>Make the difficult<br /><em>click.</em></h1>
          <p className="intro-copy">Paste a passage that refuses to make sense. Clarity rebuilds it for the way you already think.</p>
        </section>

        <section className="workspace" aria-label="Concept decoder">
          <div className="input-panel">
            <div className="panel-heading">
              <div>
                <p className="panel-kicker">01 / Source material</p>
                <h2>What are you trying to understand?</h2>
              </div>
              <span className="character-count">{text.length.toLocaleString()} characters</span>
            </div>
            <label className="sr-only" htmlFor="source-text">Dense text to decode</label>
            <textarea
              id="source-text"
              value={text}
              onChange={(event) => {
                setText(event.target.value);
                if (error) setError("");
              }}
              placeholder="Paste your dense text here..."
              spellCheck="true"
            />
            <div className="input-footer">
              <p className="input-hint"><span className="hint-glyph">↳</span> A paragraph is enough to begin.</p>
              <div className="audience-group" aria-label="Choose an audience">
                <span className="panel-kicker audience-label">02 / Audience</span>
                <div className="audience-options" role="group" aria-label="Audience selection">
                  {audiences.map((option) => (
                    <button
                      className={`audience-button ${audience === option ? "is-active" : ""}`}
                      key={option}
                      type="button"
                      aria-pressed={audience === option}
                      onClick={() => setAudience(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              <button className="decode-button" type="button" onClick={handleDecode} disabled={isDecoding}>
                {isDecoding ? <><span className="loading-pip" aria-hidden="true" /> Decoding...</> : <>Decode <span aria-hidden="true">↗</span></>}
              </button>
            </div>
            <p className={`input-error ${error ? "is-visible" : ""}`} role="alert">{error || " "}</p>
          </div>

          <div className="results-panel">
            <div className="results-heading">
              <div>
                <p className="panel-kicker">03 / Your clarity layer</p>
                <h2>The decoded idea</h2>
              </div>
              <span className="results-rule" aria-hidden="true" />
            </div>
            {Object.values(results).some(Boolean) || isDecoding ? (
              <div className="result-grid" aria-live="polite">
                <article className="result-card result-card-wide">
                  <p className="result-label">TL;DR</p>
                  {results.tldr ? <p className="result-copy">{results.tldr}</p> : <span className="result-skeleton result-skeleton-short" />}
                </article>
                <article className="result-card">
                  <p className="result-label">The Analogy</p>
                  {results.analogy ? <p className="result-copy">{results.analogy}</p> : <><span className="result-skeleton" /><span className="result-skeleton result-skeleton-medium" /></>}
                </article>
                <article className="result-card">
                  <p className="result-label">Jargon Buster</p>
                  {results.jargon ? <p className="result-copy result-copy-list">{results.jargon}</p> : <><span className="result-skeleton" /><span className="result-skeleton result-skeleton-medium" /></>}
                </article>
                <article className="result-card result-card-wide result-card-takeaway">
                  <p className="result-label">The One Thing to Remember</p>
                  {results.takeaway ? <p className="result-copy result-takeaway">{results.takeaway}</p> : <span className="result-skeleton result-skeleton-short" />}
                </article>
              </div>
            ) : (
              <div className="empty-results">
                <span className="empty-orbit" aria-hidden="true"><span /></span>
                <p>Your decoded breakdown will appear here.</p>
                <span className="empty-caption">Four ways into one idea</span>
              </div>
            )}
          </div>
        </section>

        <footer className="site-footer">
          <span>Built for the space between knowing the words and understanding the idea.</span>
          <span className="footer-index">CL / 001</span>
        </footer>
      </div>
    </main>
  );
}
