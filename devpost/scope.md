---
doc: scope
status: approved
---
# Clarity

A concept decoder that translates dense text into an accurate mental model for a chosen audience.

## The Unique Kernel
Clarity does more than shorten or rephrase dense content. It bridges the gap between recognizing the words and understanding the concept by rebuilding the explanation for the reader's chosen background while preserving the important nuance.

Its signature output is a structured translation: a one-sentence TL;DR, a concrete analogy, jargon translated into plain English, and the single most important takeaway.

## Who It's For
Students, research scholars, and developers who encounter dense academic, legal, scientific, or technical writing and need to understand the underlying concept quickly. Today they reread paragraphs repeatedly, search individual terms across many tabs, or prompt a chatbot several times and still receive generic or overly simplified explanations.

## The Core Loop
The user opens Clarity, pastes dense text, drops a PDF/TXT file, or pastes a public web URL into the input area. Clarity extracts file or URL content server-side, the user reviews or edits the resulting text, chooses the audience they want the explanation adapted for, and receives a structured breakdown. Once the four explanations are complete, Clarity reveals a Concept Map showing how the important ideas in the source connect. They return whenever a difficult passage, document, or web page creates the gap between knowing the words and understanding what the passage means or why it matters.

## Inspiration & Identity
Clarity should feel precise, calm, accessible, and intellectually respectful. It should simplify the path to understanding without making the reader feel talked down to. The product identity is a translator of concepts, not a generic chat interface.

## Why This Matters to the Learner
The learner wants to own the project deeply and understand its architecture, data flow, and processing pipeline rather than only produce working code. This formal scope expansion turns the original proof of concept into a production-oriented product surface while keeping the core journey focused.

## What "Working" Looks Like
In a one-minute demo, the user pastes this machine-learning research paragraph:

> "We propose a novel architecture that leverages orthogonal latent representations to disentangle independent factors of variation. By imposing a factorized prior over the latent space, our model achieves superior compositional generalization on out-of-distribution tasks, as measured by the disentanglement metric. Ablation studies confirm that the orthogonality constraint is the critical inductive bias."

They select `Developer (Non-ML)` and trigger the decode. The screen changes from the dense original to four distinct blocks:

1. **TL;DR:** "They built an AI that separates different concepts in its memory so it can handle new situations better."
2. **Analogy:** A closet analogy where concepts are organized on separate shelves instead of dumped into one pile, making new combinations easier to handle.
3. **Jargon Buster:** Terms such as orthogonal latent representations, disentangle independent factors of variation, compositional generalization, and inductive bias translated into plain English.
4. **One Thing to Remember:** "The key insight is that how you organize an AI's memory matters more than how much data you feed it."

5. **Concept Map:** An interactive node-link graph shows the key concepts and relationships extracted from the source, such as `Orthogonal Latent Representations` connecting to `Disentanglement`.

The compelling moment is the transition from "I recognize these words" to "I understand this concept, can explain it to someone else, and can see how its parts relate."

## The Product Boundary

This formal scope change expands the original proof of concept with production-oriented file extraction and concept relationships, while still excluding accounts, collaboration, OCR, and document management.

**In:**
- One focused web experience for pasting dense text.
- A small set of audience presets, including the demonstrated `Developer (Non-ML)` audience.
- One decode action producing the four structured output blocks.
- Drag-and-drop or file-picker ingestion for `.pdf` and `.txt` files, with extracted text review before decoding.
- Public HTML URL ingestion, with fetched readable text review before decoding.
- A Concept Map below the four explanation cards, with interactive nodes and edges derived from the original text.
- Structured graph data returned by the backend for rendering.
- The end-to-end path from input text through audience-aware explanation to visible results.
- A compelling demo using the supplied research paper paragraph and a representative PDF/TXT upload.

**Out of scope for this release:**
- User accounts, saved history, document libraries, and collaboration.
- Browser extensions or integrations with research tools.
- Open-ended chat or repeated prompting as the primary interaction.
- Accounts, saved libraries, collaboration, and document history.
- OCR for scanned/image-only PDFs, citations, and formal factuality evaluation.

## Later

- More domain- and audience-specific presets, including the initially imagined 10-year-old, Busy Executive, and Non-technical Founder options.
- Custom audience instructions and interactive follow-up questions.
- Long-document and file support with source references.
- Batch document ingestion and file history.
- Authenticated, paywalled, JavaScript-only, or private URL ingestion.
- Richer graph filtering, node details, zoom controls, and export.
- Saved explanations, sharing, and integrations.
- Evaluation tools for factual accuracy, nuance preservation, and explanation quality.

## Explicitly Cut

- Generic chatbot conversation: it would recreate the prompting loop Clarity is meant to improve.
- Feature-heavy document management: it does not prove the concept-translation kernel.
- OCR and scanned-PDF support: extracting text from digital PDFs is enough to prove the ingestion path.
- Full knowledge-management workflows: the first graph is an explanation surface, not a document database.
