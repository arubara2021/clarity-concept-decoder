---
doc: scope
status: draft
---
# Clarity

A concept decoder that translates dense text into an accurate mental model for a chosen audience, keeps the reader's work private on their own machine, and lets them share a single decode by link when they choose to.

## The Unique Kernel

Clarity does more than shorten or rephrase dense content. It bridges the gap between recognizing the words and understanding the concept by rebuilding the explanation for the reader's chosen background while preserving the important nuance.

Its signature output is a structured translation: a one-sentence TL;DR, a concrete analogy, jargon translated into plain English, and the single most important takeaway, followed by a concept map that shows how the ideas relate. Each claim can be traced back to a paragraph in the source.

The kernel has not changed since the original scope. What has changed is that the tool now keeps its work, survives its failures, and feels like a product rather than a form.

## Who It's For

Anyone who repeatedly hits a wall of dense text and needs to get through it without losing the nuance. Researchers reading papers outside their subfield. Developers reading specifications and RFCs. Analysts reading filings and long reports. Students reading outside their discipline. The three audience labels (`Student`, `Executive`, `Developer (Non-ML)`) serve the vast majority of these readers.

Today they reread paragraphs repeatedly, open many tabs to search terms, or prompt a chatbot several times and still receive generic or overly simplified explanations. Nothing in that loop gives them a working mental model, and nothing in it remembers what they already figured out.

## The Core Loop

The user opens Clarity, pastes dense text, drops a PDF or TXT file, or pastes a public web URL. Files are parsed locally in the browser; URLs are fetched safely by the server. The user reviews and edits the extracted text, chooses the audience, and receives a structured breakdown that streams into four cards, followed by a concept map. Every completed decode is saved automatically into the reader's local library, where it can be reopened, searched, renamed, or deleted. The user returns whenever a difficult passage, document, or web page creates the gap between knowing the words and understanding what the passage means or why it matters.

## Inspiration & Identity

Clarity should feel precise, calm, accessible, and intellectually respectful. It should simplify the path to understanding without making the reader feel talked down to. The product identity is a translator of concepts, not a generic chat interface.

The visual identity is warm near-black, warm charcoal surfaces, soft off-white text, and one scarce amber accent. The palette is calm and premium, like a thoughtful reading app rather than a developer tool.

The motion language is designed as a system rather than added per component. Cards rise into place with a short stagger. Skeletons breathe rather than pulse. Streaming text does not shift the layout beneath it. Every button has four distinct states — hover, press, focus, and disabled. All motion respects `prefers-reduced-motion`.

The signature moment is the decode transition. When the user clicks Decode, the source textarea dims to a warm grey, a thin amber line draws itself across the results panel, and the four cards rise into place beneath it. This is the moment a screenshot betrays as Clarity's, and every other visual decision supports it rather than competes with it.

## Why This Matters to the Learner

The learner wants to own the project deeply and understand its architecture, data flow, and processing pipeline rather than only produce working code. The upgrade from a demo into a local-first tool with a designed identity, a local library, a motion language, and an optional cloud share is exactly the work that produces that understanding, because every part of it is a real engineering decision rather than a feature checklist.

## What "Working" Looks Like

In a one-minute demo, the user drops a machine-learning research PDF onto the input area. The browser parses it. The extracted text appears in the editable source input. The user selects `Developer (Non-ML)` and clicks Decode. The source textarea dims, the amber line draws across the results panel, and the four cards rise into place as skeletons. Text streams into TL;DR, The Analogy, Jargon Buster, and The One Thing to Remember in order. Each card carries small superscript markers that scroll the source to the paragraph a claim was drawn from. Below the cards, a Concept Map renders the key concepts and their relationships. When the stream finishes, the decode is saved into the library. The user opens the library, searches for a term, and reopens the decode. Then they share it, receive a short link, and open the link in a private window to see it read-only with the source behind a collapsed panel.

The compelling moment is the same as it was in the original scope: the transition from "I recognize these words" to "I understand this concept, can explain it to someone else, and can see how its parts relate." What has changed is that the moment now survives a refresh, can be shared with a link, and feels like something worth returning to.

## The Product Boundary

This scope change turns the original proof of concept into a local-first product with a designed identity, an offline library, and an optional cloud share. It still excludes accounts, collaboration, document management, and OCR.

**In:**

- One focused web experience for pasting dense text, dropping a file, or pasting a public URL.
- A small set of audience presets: `Student`, `Executive`, and `Developer (Non-ML)`.
- One decode action producing the four structured output blocks, a concept map, and paragraph-level citations.
- Client-side parsing for `.pdf` and `.txt` files, keeping file content on the user's machine.
- Public HTML URL ingestion with safe server-side fetching and readable-text extraction.
- A local library backed by IndexedDB, with search, reopen, rename, and delete. Nothing leaves the browser.
- A command palette reachable by `Cmd+K` and `Ctrl+K`, with every action available from the keyboard.
- A designed motion language and one signature decode transition.
- Share-on-demand: one decode becomes one short link, up to ten live shares per browser, each revocable.
- A read-only shared view that shows the decode alongside the source behind a collapsed panel.
- A per-browser rate budget of twenty decodes per rolling hour, protecting the free Gemini tier.
- The end-to-end path from input text through audience-aware explanation to visible, revisit-able, shareable results.
- A compelling demo using a supplied research paper PDF or paragraph.

**Out of scope for this release:**

- User accounts, cross-device sync, saved cloud history, and collaboration.
- Custom audience fields and audience-specific presets beyond the three locked labels.
- Sentence-level citations, formal factuality evaluation, and confidence scoring.
- OCR for scanned or image-only PDFs, citations to external sources, and reference resolution.
- Export to Markdown, PDF, or any format other than a share link.
- Browser extensions, research-tool integrations, and one-click capture from an external page.
- Open-ended chat or repeated prompting as the primary interaction.
- Server-side file upload, server-side PDF parsing, and any pipeline that sends the user's file off their machine.

## Later

- Custom audience fields and additional audience presets.
- Sentence-level citations and structured confidence indicators.
- Side-by-side audience comparison for the same source.
- Export to Markdown, PDF, and a portable library file.
- PWA install target and offline-first caching of the app itself.
- A browser extension for one-click capture of selected text.
- Optional cloud sync of the local library, layered on top of the existing local-first model without replacing it.
- Evaluation tooling for factual accuracy, nuance preservation, and audience fit.
- Authenticated, paywalled, JavaScript-only, or private URL ingestion, which requires credentials, browser automation, or a larger security surface.

## Explicitly Cut

- **Generic chatbot conversation.** It would recreate the prompting loop Clarity is meant to improve, and it would blur the product's identity into "another AI chat."
- **Accounts and authentication.** The local library gives the account-like behavior a user actually wants without the infrastructure, the privacy surface, or the support burden.
- **Server-side file processing.** Vercel Functions cap request bodies at 4.5 MB and memory at a few hundred MB. Parsing files in the browser removes both ceilings, works offline, and keeps file content private. It also matches the local-first character of the rest of the app.
- **Cloud sync of the library.** Deferred until the local library proves people return to it. Sync without that evidence is infrastructure built on a guess.
- **OCR and scanned-PDF support.** Extracting text from digital PDFs proves the ingestion path. OCR adds a substantial dependency and a large surface of edge cases.
- **Document management workflows.** The library is a place to revisit a decode, not a document database. Batch uploads, folders, tagging, and document history are out.
- **Collaborative decode.** Sharing a read-only link is in scope. Editing someone else's decode, commenting on it, or building a shared workspace are not.