---
doc: checklist
status: approved
---
# Build Checklist

Build mode: learn

## Slices

- [ ] **1. A polished Clarity shell is usable before generation exists**
  Becomes usable: A running Next.js app shows the warm charcoal Clarity interface, header, dense-text input, three audience controls, Decode action, empty results state, and responsive layout. The input and audience selection work in page memory.
  Why now: Establishes the visual foundation and proves the app can run before provider complexity is added. It also gives the learner an early chance to shape the advanced visual direction.
  PRD ref: `prd.md > The Core Journey` (steps 1-3), `prd.md > Screens and Layout`, `prd.md > Look and Feel`
  Spec ref: `spec.md > Stack`, `spec.md > Look and Feel`, `spec.md > Components > Next.js Page Shell`, `spec.md > File Structure`
  Build: Scaffold Next.js App Router with strict TypeScript and Tailwind; add the page shell, CSS variables, warm charcoal surfaces, restrained amber usage, input behavior, audience contract, empty state, and responsive card layout. Keep the result area ready for streaming states.
  Verify (mechanical): Run the project typecheck and lint/build checks; start the dev server and confirm the page responds without browser-console errors.
  Learner check: Open the app, paste text, switch between all three audiences, resize the viewport, and report whether the interface feels calm, premium, and distinctive enough for Clarity.
  Commit: `Build Clarity visual shell`

- [ ] **2. A real Gemini stream produces the first decoded section**
  Becomes usable: A valid input reaches `POST /api/decode`, passes Zod validation, calls Gemini through `streamText`, and progressively fills the TL;DR card while the remaining cards show skeletons.
  Why now: Verifies the highest-risk external dependency and the core translation kernel before expanding the output contract.
  PRD ref: `prd.md > Features and Behavior > Decode and Streaming Results`, `prd.md > Features and Behavior > Audience Selection`
  Spec ref: `spec.md > Components > Next.js Route Handlers`, `spec.md > Components > Zod Request Schemas`, `spec.md > Components > AI SDK Gemini Stream`, `spec.md > Decisions and Open Issues`
  Build: Add the Gemini provider configuration, environment example, audience prompt builder, decode schema, route handler, client stream consumption, loading state, and TL;DR progressive rendering. Use a current verified model configured through `GEMINI_MODEL`.
  Verify (mechanical): Run typecheck and build; make a real local request with a fresh configured key and confirm a streamed response arrives without exposing the key to the browser.
  Learner check: Paste the supplied ML paragraph, choose `Developer (Non-ML)`, click Decode, and observe the loading state, skeletons, and TL;DR arriving progressively.
  Commit: `Stream first Clarity explanation`

- [ ] **3. The complete four-card concept translation works**
  Becomes usable: A successful decode fills TL;DR, The Analogy, Jargon Buster, and The One Thing to Remember in the required order with audience-specific tone.
  Why now: Completes the unique kernel and makes the one-minute demo compelling once the provider path is proven.
  PRD ref: `prd.md > Features and Behavior > Decode and Streaming Results`, `prd.md > What We're Building`
  Spec ref: `spec.md > Components > Result Cards`, `spec.md > Components > Audience Prompt Builder`, `spec.md > Data Model`, `spec.md > API Contracts`
  Build: Extend the structured prompt and typed result model; render all four cards, progressive content, jargon term/translation pairs, the emphasized takeaway, completion state, and exact audience behavior.
  Verify (mechanical): Run typecheck, lint, and production build; execute the demo flow and confirm all four sections appear in order with no type or runtime errors.
  Learner check: Run the supplied research-paper demo for `Student`, `Executive`, and `Developer (Non-ML)` and compare how the explanation tone changes.
  Commit: `Complete four-card decoding flow`

- [ ] **4. Recovery and stale-result behavior preserves user work**
  Becomes usable: Editing source text marks results out of date, and partial or global provider failures preserve completed cards, input, and audience while exposing the correct retry action.
  Why now: These states are central to the premium experience and must be verified while the stream contract is still easy to adjust.
  PRD ref: `prd.md > Features and Behavior > Stale Results`, `prd.md > Features and Behavior > Partial Recovery`, `prd.md > Features and Behavior > Global Failure`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Components > Recovery Controls`, `spec.md > Important Failure Modes`, `spec.md > API Contracts`, `spec.md > Data Model`
  Build: Add `POST /api/retry-section`, section-level retry rendering, full retry fallback, global error state, stale badge, abort/duplicate-request handling, and safe provider error mapping.
  Verify (mechanical): Run typecheck, lint, and build; test invalid input, simulated section failure, section retry, full retry, global failure, and post-result editing without losing source text.
  Learner check: Trigger or simulate a failed section, verify completed cards remain, retry only the missing section, edit the source, and confirm the stale badge appears.
  Commit: `Add resilient streaming recovery`

- [ ] **5. Final visual refinement makes the demo feel intentional**
  Becomes usable: The complete journey feels stunning and advanced across desktop and mobile, with polished transitions, stable layouts, readable results, accessible controls, and no accidental generic AI styling.
  Why now: Final refinement should respond to the real running states rather than being designed against placeholders alone.
  PRD ref: `prd.md > Look and Feel`, `prd.md > What We're Building`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Look and Feel`, `spec.md > Components`, `spec.md > Where It Runs and How Someone Tries It`
  Build: Tune spacing, typography, card hierarchy, shimmer and reveal motion, responsive composition, focus states, reduced-motion behavior, loading/error transitions, and demo framing. Keep amber scarce and preserve the warm reading-room character.
  Verify (mechanical): Run typecheck, lint, production build, and a browser smoke check at desktop and mobile widths; inspect for overflow, overlap, console errors, and inaccessible controls.
  Learner check: Run the full one-minute demo on desktop and mobile and identify the one visual change that would most improve the experience.
  Commit: `Polish Clarity demo experience`

- [ ] **6. PDF and TXT ingestion becomes reviewable and safe**
  Becomes usable: A user can drag or select a `.pdf` or `.txt` file, see extraction progress, review the extracted text in the existing input, edit it, and only then decode it.
  Why now: File ingestion is the first new scope feature and must establish safe extraction boundaries before graph work depends on document input.
  PRD ref: `prd.md > Features and Behavior > File Ingestion`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Scope Change Addendum: File Ingestion and Concept Map > File Ingestion Route`, `spec.md > Scope Change Addendum: File Ingestion and Concept Map > New API Contract`
  Build: Add the dropzone and picker, multipart upload route, TXT decoding, `pdf-parse` extraction, size/type validation, extraction states, and editable-text handoff.
  Verify (mechanical): Run typecheck, lint, and build; upload representative TXT and digital PDF fixtures, verify extracted text, and verify unsupported, oversized, empty, and unreadable files return safe errors.
  Learner check: Drop a TXT file and a PDF, edit the extracted text, and confirm Decode does not run until you click it.
  Commit: `Add PDF and TXT text ingestion`

- [ ] **7. Public URL ingestion becomes safe and reviewable**
  Becomes usable: A user can paste a public HTTP(S) URL, see readable page text extracted into the existing input, edit it, and only then decode it.
  Why now: URL ingestion extends the source workflow after files while establishing SSRF, redirect, content-type, size, and timeout boundaries before graph work.
  PRD ref: `prd.md > Features and Behavior > URL Ingestion`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Scope Change Addendum: File Ingestion and Concept Map > URL Ingestion Addendum`, `spec.md > File Structure`, `spec.md > Important Failure Modes`
  Build: Add URL mode, `/api/fetch-url`, safe destination validation, bounded public HTML fetch, readable-text extraction, source metadata, loading, and recoverable errors.
  Verify (mechanical): Run typecheck, lint, and build; fetch a public HTML fixture, reject private/invalid URLs, enforce size and timeout limits, and preserve existing text after failures.
  Learner check: Paste a public article URL, review and edit the extracted text, and confirm Decode remains a separate deliberate action.
  Commit: `Add safe public URL ingestion`

- [ ] **8. Concept Map reveals the source relationships**
  Becomes usable: After the four explanation cards, a fifth interactive Concept Map displays validated nodes and edges derived from the original text.
  Why now: The graph is the second new scope feature and depends on stable source text plus the completed explanation pipeline.
  PRD ref: `prd.md > Features and Behavior > Concept Map`, `prd.md > Screens and Layout`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Scope Change Addendum: File Ingestion and Concept Map > Concept Map Renderer`, `spec.md > Scope Change Addendum: File Ingestion and Concept Map > Graph Data Contract`
  Build: Add graph schemas, graph prompt/output, graph event handling, React Flow rendering, node dragging, relationship labels, empty state, and graph-specific error recovery.
  Verify (mechanical): Run typecheck, lint, and build; decode the supplied paragraph and assert validated nodes/edges render, malformed graph data is rejected, and graph failure leaves the four cards usable.
  Learner check: Decode the supplied ML paragraph, drag a concept node, inspect its relationships, and explain whether the map adds understanding beyond the four cards.
  Commit: `Add interactive concept map`

## Hands-on Checkpoints

- [ ] Early usable behavior explored — after slice 1, learner reviews the running visual shell and gives feedback on the advanced design direction.
- [ ] Final kick-the-tires exploration and feedback completed — after slice 8, learner runs the full file-or-URL-to-explanation-to-graph journey at desktop and mobile widths.

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — trace one decode from component to route handler to `streamText` and back to result cards.
- [ ] Optional edit and transfer reflection addressed — offered after the final review.
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including the provider-to-card pipeline.

Activity and evidence: not started
Route and stops: not started
Edit outcome: not started
Reflection: not started
Activity mode: not started

## Revisions
