---
doc: checklist
status: draft
---
# Build Checklist

Build mode: learn

## Slices

- [x] **1. A polished Clarity shell is usable before generation exists**
  Becomes usable: A running Next.js app shows the warm charcoal Clarity interface, header, dense-text input, three audience controls, Decode action, empty results state, and responsive layout.
  Why now: Establishes the visual foundation and proves the app can run before provider complexity is added.
  PRD ref: `prd.md > The Core Journey` (steps 1-3), `prd.md > Screens and Layout`, `prd.md > Look and Feel`
  Spec ref: `spec.md > Components > Page Shell`, `spec.md > Look and Feel`, `spec.md > File Structure`
  Build: Scaffold Next.js App Router with strict TypeScript and Tailwind; add the page shell, CSS variables, warm charcoal surfaces, restrained amber usage, input behavior, audience contract, empty state, and responsive card layout.
  Verify (mechanical): Run typecheck and lint/build checks; start the dev server and confirm the page responds without console errors.
  Learner check: Open the app, paste text, switch between all three audiences, resize the viewport, and report whether the interface feels calm and premium.
  Commit: `Build Clarity visual shell`

- [x] **2. A real Gemini stream produces the first decoded section**
  Becomes usable: A valid input reaches `POST /api/decode`, passes Zod validation, calls Gemini through `streamText`, and progressively fills the TL;DR card while the remaining cards show skeletons.
  Why now: Verifies the highest-risk external dependency and the core translation kernel before expanding the output contract.
  PRD ref: `prd.md > Features and Behavior > Decode and Streaming Results`, `prd.md > Features and Behavior > Audience Selection`
  Spec ref: `spec.md > Components > Next.js Route Handlers`, `spec.md > Components > Zod Schemas`, `spec.md > Components > AI Client`
  Build: Gemini provider configuration, environment example, audience prompt builder, decode schema, route handler, client stream consumption, loading state, and TL;DR progressive rendering.
  Verify (mechanical): Run typecheck and build; make a real local request with a fresh key and confirm a streamed response arrives without exposing the key to the browser.
  Learner check: Paste the supplied ML paragraph, choose `Developer (Non-ML)`, click Decode, and observe the loading state, skeletons, and TL;DR arriving progressively.
  Commit: `Stream first Clarity explanation`

- [x] **3. The complete four-card concept translation works**
  Becomes usable: A successful decode fills TL;DR, The Analogy, Jargon Buster, and The One Thing to Remember in the required order with audience-specific tone.
  Why now: Completes the unique kernel and makes the one-minute demo compelling once the provider path is proven.
  PRD ref: `prd.md > Features and Behavior > Decode and Streaming Results`, `prd.md > What We're Building`
  Spec ref: `spec.md > Components > Result Cards`, `spec.md > Components > Prompt Builder`, `spec.md > Data Model`, `spec.md > API Contracts`
  Build: Extended structured prompt, typed result model, all four cards, progressive content, jargon term/translation pairs, the emphasized takeaway, and completion state.
  Verify (mechanical): Run typecheck, lint, and production build; execute the demo flow and confirm all four sections appear in order with no type or runtime errors.
  Learner check: Run the supplied research-paper demo for `Student`, `Executive`, and `Developer (Non-ML)` and compare how the explanation tone changes.
  Commit: `Complete four-card decoding flow`

- [ ] **4. Recovery and stale-result behavior preserves user work**
  Becomes usable: Editing source text marks results out of date, and partial or global provider failures preserve completed cards, input, and audience while exposing the correct retry action.
  Why now: These states are central to the premium experience. Everything after this slice assumes recovery exists, because the local library, share, and citations all depend on a decode that can survive a mid-stream failure.
  PRD ref: `prd.md > Features and Behavior > Stale Results`, `prd.md > Features and Behavior > Partial Recovery`, `prd.md > Features and Behavior > Global Failure`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Components > Recovery State`, `spec.md > Components > Stale Badge`, `spec.md > API Contracts > POST /api/retry-section`, `spec.md > Important Failure Modes`
  Build: Add `app/api/retry-section/route.ts`, the `Recovery State` component, the `Stale Badge` component, section-level retry rendering, full retry fallback, global error state, stale badge trigger, abort and duplicate-request handling on the client, and safe provider error mapping that never exposes raw provider payloads.
  Verify (mechanical): Run typecheck, lint, and build; test invalid input, simulated section failure, section retry, full retry, global failure, and post-result editing without losing source text; confirm the retry route returns only the requested section.
  Learner check: Force a section failure (temporarily throw inside the decode loop or disconnect the network), verify completed cards remain, retry only the missing section, edit the source, and confirm the `Results out of date` badge appears.
  Commit: `Add resilient streaming recovery`

- [x] **5. Final visual refinement makes the demo feel intentional**
  Becomes usable: The complete journey feels polished across desktop and mobile, with stable layouts, readable results, and accessible controls.
  Why now: Final refinement should respond to the real running states rather than being designed against placeholders alone.
  PRD ref: `prd.md > Look and Feel`, `prd.md > What We're Building`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Look and Feel`, `spec.md > Components`
  Build: Tuned spacing, typography, card hierarchy, responsive composition, focus states, and reduced-motion behavior. The current stylesheet carries the visible polish but does not yet have a designed motion system or a signature visual moment.
  Verify (mechanical): Typecheck, lint, production build, and browser smoke check at desktop and mobile widths.
  Learner check: Run the full demo on desktop and mobile.
  Commit: `Polish Clarity demo experience`

- [x] **6. PDF and TXT ingestion becomes reviewable and safe (server-side, to be rewritten)**
  Becomes usable: A user can drag or select a `.pdf` or `.txt` file, see extraction progress, review the extracted text in the existing input, edit it, and only then decode it.
  Why now: File ingestion established the first review-before-decode path before the graph depended on document input.
  PRD ref: `prd.md > Features and Behavior > File Ingestion`
  Spec ref: `spec.md > Components > Source Input`
  Build: Built as a server-side `app/api/upload/route.ts` using `pdfjs-dist` for PDF text extraction and native UTF-8 decoding for TXT. This approach works on localhost but cannot survive Vercel's 4.5 MB request-body limit and 128-300 MB function memory ceiling. Superseded by slice 9.
  Verify (mechanical): Performed at build time.
  Learner check: Performed at build time.
  Commit: `Add PDF and TXT text ingestion`

- [x] **7. Public URL ingestion becomes safe and reviewable**
  Becomes usable: A user can paste a public HTTP(S) URL, see readable page text extracted into the existing input, edit it, and only then decode it.
  Why now: URL ingestion extended the source workflow after files while establishing SSRF, redirect, content-type, size, and timeout boundaries.
  PRD ref: `prd.md > Features and Behavior > URL Ingestion`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Components > Safe URL Fetcher`, `spec.md > API Contracts > POST /api/fetch-url`
  Build: Added URL mode, `app/api/fetch-url/route.ts`, `lib/safe-url.ts` with private-network rejection, bounded public HTML fetch, `@mozilla/readability` and `jsdom` extraction, source metadata, loading state, and recoverable errors.
  Verify (mechanical): Typecheck, lint, and build; fetched a public HTML fixture, rejected private and invalid URLs, enforced size and timeout limits, and preserved existing text after failures.
  Learner check: Pasted a public article URL, reviewed the extracted text, and confirmed Decode remained a separate deliberate action.
  Commit: `Add safe public URL ingestion`

- [x] **8. Concept Map reveals the source relationships**
  Becomes usable: After the four explanation cards, a fifth interactive Concept Map displays validated nodes and edges derived from the original text.
  Why now: The graph is the second new scope feature and depends on stable source text plus the completed explanation pipeline.
  PRD ref: `prd.md > Features and Behavior > Concept Map`, `prd.md > Screens and Layout`
  Spec ref: `spec.md > Components > Concept Map`, `spec.md > Components > Graph Schema`, `spec.md > API Contracts > POST /api/decode` (graph event)
  Build: Added `lib/graph-schema.ts`, the graph prompt in `lib/prompts.ts`, the `graph` event in the decode stream, the `Concept Map` component with React Flow, node dragging, relationship labels, and graph-specific error handling.
  Verify (mechanical): Typecheck, lint, and build; decoded the supplied paragraph and asserted validated nodes and edges render, malformed graph data is rejected, and graph failure leaves the four cards usable.
  Learner check: Decoded the supplied ML paragraph, dragged a concept node, and inspected relationships.
  Commit: `Add interactive concept map`

- [ ] **9. Repository tree matches the spec and dead files are removed**
  Becomes usable: The project tree matches `spec.md > File Structure` exactly. `app/page.tsx` is slim and orchestrates child components. `lib/types.ts` exists as the shared type source. No curriculum trees, no dump artifact, no orphan files.
  Why now: Every later slice adds files. Adding them into a messy tree makes the mess permanent. This slice is the precondition for everything that follows.
  PRD ref: `prd.md > What We're Building`
  Spec ref: `spec.md > File Structure`, `spec.md > Components`
  Build: Delete `project-code-dump.txt`, `.agents/`, `.claude/skills/`, and `agent/skills/` (the curriculum trees are not read by GitHub Copilot, which reads `AGENTS.md`). Extract `components/source-input.tsx`, `components/audience-action.tsx`, `components/result-cards.tsx`, and `components/recovery-state.tsx` from `app/page.tsx`. Create `lib/types.ts` and move `Audience`, `DecodeSection`, `SectionResult`, `Decode`, `ConceptGraph`, and `ShareMeta` into it. Update every import across the app. No behavior change.
  Verify (mechanical): Run typecheck, lint, and production build; start the dev server and confirm the app behaves identically to before the split; confirm the removed directories are gone and `AGENTS.md` is intact at root.
  Learner check: Open the app, paste the ML paragraph, decode, and confirm the result is identical to before. Then open `app/page.tsx` and confirm it reads as orchestration, not implementation.
  Commit: `Restructure tree to match spec`

- [ ] **10. Client-side file parsing replaces the server upload route**
  Becomes usable: A dropped or selected `.pdf` or `.txt` file is parsed entirely in the browser. Extracted text lands in the textarea. No file content leaves the user's machine. The `/api/upload` route is deleted.
  Why now: The server route cannot survive Vercel's 4.5 MB request-body limit and memory ceiling. Client-side parsing removes the ceiling entirely, works offline, and keeps file content private.
  PRD ref: `prd.md > Features and Behavior > File Ingestion`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Components > Source Input`, `spec.md > What Was Simplified and Why`, `spec.md > Important Failure Modes`
  Build: Delete `app/api/upload/route.ts`. Remove `serverExternalPackages: ["pdfjs-dist"]` from `next.config.ts`. Move `pdfjs-dist` from a server dependency to a browser dependency and load it lazily on first file drop. Implement `handleFile` in `components/source-input.tsx` using `FileReader` for `.txt` and the `pdfjs-dist` browser build for `.pdf`. Enforce a 20 MB ceiling with a clear message. Handle encrypted, empty, and image-only PDFs with distinct messages. Preserve existing text on every failure.
  Verify (mechanical): Typecheck, lint, and production build; drop a representative TXT and a digital PDF fixture and confirm extraction; attempt an unsupported extension, an empty file, an oversized file, and an image-only PDF and confirm each returns a safe error without clearing the input. Confirm `app/api/upload/route.ts` no longer exists.
  Learner check: Drop a TXT and a PDF, edit the extracted text, and confirm Decode remains a separate deliberate action. Then disconnect the network and repeat — extraction must still work.
  Commit: `Parse files in the browser`

- [ ] **11. Local library keeps every decode private and searchable**
  Becomes usable: Every successful decode is saved automatically to IndexedDB. A library drawer opens from the header, lists past decodes newest first, searches titles and source text, and supports open, rename, and delete. Nothing leaves the browser.
  Why now: This is the first feature that transforms the product from a demo into a tool. It is the single biggest felt-quality change in the plan.
  PRD ref: `prd.md > Features and Behavior > Local Library`, `prd.md > Screens and Layout > Library Drawer`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Components > Local Library`, `spec.md > Components > Local Store`, `spec.md > Data Model > Local persistence`
  Build: Add `dexie`. Create `lib/local-store.ts` with `saveDecode`, `listDecodes`, `getDecode`, `deleteDecode`, `searchDecodes`, and a stable session UUID in `localStorage`. Create `components/library-drawer.tsx` with the search field, the reverse-chronological list, the per-item actions, the empty state, and the clear-all confirmation. Hook `saveDecode` into the `done` event in the decode flow.
  Verify (mechanical): Typecheck, lint, and build; decode the ML paragraph, open the library, confirm the entry appears, search for a word from the source, rename the entry, delete it, and confirm the drawer returns to the empty state. Refresh the page and confirm persistence. Inspect IndexedDB in devtools to confirm the schema.
  Learner check: Decode three different paragraphs with different audiences, open the library, search across them, reopen one read-only, and confirm nothing was sent to a server by checking the network tab.
  Commit: `Add local decode library`

- [ ] **12. Motion system makes the product feel alive**
  Becomes usable: A designed motion language with a typographic scale, a spacing rhythm, a token file, and the signature decode transition. Buttons have four distinct states. Cards stagger in. Skeletons breathe. Streaming text does not shift layout. The command palette has not yet been built; this slice readies the tokens it will use.
  Why now: This is the thirty-second hook. Every other visual decision supports this moment, and building it now means later components inherit the language rather than inventing their own.
  PRD ref: `prd.md > Look and Feel > Motion Language`, `prd.md > Look and Feel > The Signature Moment`, `prd.md > Features and Behavior > Decode and Streaming Results`
  Spec ref: `spec.md > Components > Design Tokens`, `spec.md > Look and Feel`, `spec.md > Stack`
  Build: Add `motion`. Create `lib/tokens.ts` with the spacing scale, motion durations, and easing curves. Establish the typographic scale in `globals.css` (three or four deliberate sizes, not twelve). Rewrite the decode flow to run the signature transition: dim the textarea, draw the amber line across the results panel, stagger the four cards into place. Convert every button to the four-state contract. Convert skeletons to a sine-eased breathe. Reserve card height so streaming does not reflow. Wire `prefers-reduced-motion` to collapse all transitions to instant.
  Verify (mechanical): Typecheck, lint, and production build; run the app with reduced motion enabled and confirm nothing animates; run with motion enabled and confirm the stagger, line draw, skeleton breathe, and button states behave as designed; measure no layout shift during streaming.
  Learner check: Decode the ML paragraph on desktop and mobile and describe whether the transition feels premium. This is the slice where you shape the identity of the product, not just its behavior.
  Commit: `Design the motion language`

- [ ] **13. Command palette gives keyboard-first control**
  Becomes usable: `Cmd+K` (macOS) or `Ctrl+K` (Windows and Linux) opens a centered palette. Every action in the app is reachable without a mouse: focus input, decode, switch audience, open library, share, copy link, clear result.
  Why now: A command palette is the single feature that most reliably moves a product from "form" to "application" in the user's perception. It is also small, cheap, and does not add any backend surface.
  PRD ref: `prd.md > Features and Behavior > Command Palette`, `prd.md > Screens and Layout > Command Palette`
  Spec ref: `spec.md > Components > Command Palette`, `spec.md > Components > Design Tokens`
  Build: Create `components/command-palette.tsx` with a single search field, a filtered action list, arrow-key navigation, enter to fire, escape to close, and focus trapping. Wire the global keydown listener. Each action dispatches into the existing page state. No new routes, no new server calls.
  Verify (mechanical): Typecheck, lint, and build; open the palette with both key combinations; navigate with arrows only; fire each action and confirm the expected effect; confirm escape closes and returns focus to the previously focused element.
  Learner check: Complete a full decode using only the keyboard. Switch audience from the palette. Open the library from the palette. Confirm no action requires a mouse.
  Commit: `Add command palette`

- [ ] **14. Paragraph-level citations build trust in the output**
  Becomes usable: Each result card shows small superscript markers next to claims that trace to specific source paragraphs. Clicking a marker scrolls the source textarea to the referenced paragraph and briefly highlights it. If the model cannot confidently map a claim, no marker is shown.
  Why now: Trust is the single most important property of a tool that touches a reader's understanding. Citations are the first slice in this plan that changes what the user can verify, not just how the product feels.
  PRD ref: `prd.md > Features and Behavior > Citations`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Components > Result Cards`, `spec.md > Components > Prompt Builder`, `spec.md > Data Model`
  Build: Extend `lib/prompts.ts` to ask the model for paragraph references alongside section text, keyed to numbered paragraphs in a numbered version of the source. Extend `lib/graph-schema.ts` to a section schema that carries citations. Render superscript markers in `components/result-cards.tsx`. Add a scroll-and-highlight handler to the source input. Ensure missing or low-confidence mappings render nothing rather than a wrong marker.
  Verify (mechanical): Typecheck, lint, and build; decode three paragraphs and confirm markers appear where the model returned mappings; click each marker and confirm the source textarea scrolls to the referenced paragraph; decode a passage with no clear mapping and confirm no markers appear.
  Learner check: Decode a paper you do not know well, click every marker, and judge whether the mapping is honest. If a marker points to a wrong paragraph, that is a prompt problem worth fixing now rather than shipping.
  Commit: `Add paragraph-level citations`

- [ ] **15. Share turns one decode into a link**
  Becomes usable: The user clicks Share on a current result, receives a short link, can copy it, and can revoke it. Opening the link in another browser shows the decode read-only with the source behind a collapsed panel. Each browser is limited to ten live shares. The share count is visible in the dialog.
  Why now: Share is the only feature that touches a server beyond Gemini. It is last among the significant features because it depends on the local library (for the delete-token store) and on citations (so a shared decode carries its trust markers).
  PRD ref: `prd.md > Features and Behavior > Share a Decode`, `prd.md > Screens and Layout > Share Dialog`, `prd.md > Screens and Layout > Shared View`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Components > Share Dialog`, `spec.md > Components > Share Store`, `spec.md > API Contracts > POST /api/share`, `spec.md > API Contracts > GET /s/[id]`, `spec.md > Data Model > Cloud persistence`
  Build: Create the Neon project and set `DATABASE_URL`. Add `@neondatabase/serverless`. Create `lib/share-store.ts` with `createShare`, `readShare`, `revokeShare`, and `countSharesForIdentity`. Create `app/api/share/route.ts`, `app/api/share/[id]/revoke/route.ts`, and `app/s/[id]/route.ts`. Create `components/share-dialog.tsx`. Extend the local library entry type to carry the share ID and delete token. Hide the share action when `DATABASE_URL` is absent and return a `503` with a clear message from the routes.
  Verify (mechanical): Typecheck, lint, and build; create a share, open the link in a private window, confirm the read-only view and the collapsed source panel; revoke the share and confirm the link returns `404`; create ten shares and confirm the eleventh returns `429`; clear `localStorage` and confirm the count resets; stop the Neon project and confirm the app still decodes and the library still works while share reports a clear error.
  Learner check: Decode a paper, share it, open the link on your phone, and read it. Then revoke it and try the link again. Confirm that nothing about the source feels uncomfortable to see on someone else's screen.
  Commit: `Add shareable decode links`

- [ ] **16. Final polish and the demo path**
  Becomes usable: The complete journey feels stunning and intentional across desktop and mobile, with a stable layout, readable results, accessible controls, and a demo that lands in under a minute.
  Why now: Final refinement should respond to the real running states, not to placeholders.
  PRD ref: `prd.md > Look and Feel`, `prd.md > What We're Building`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Look and Feel`, `spec.md > Where It Runs and How Someone Tries It`
  Build: Tune spacing, typography, card hierarchy, shimmer and reveal motion, responsive composition, focus states, reduced-motion behavior, loading and error transitions, and the shared-view framing. Verify every state on desktop and mobile widths. Confirm amber remains scarce. Confirm the signature transition is the most memorable moment in the app.
  Verify (mechanical): Typecheck, lint, production build, and a browser smoke check at desktop, tablet, and mobile widths; inspect for overflow, overlap, console errors, inaccessible controls, and layout shift.
  Learner check: Run the full one-minute demo on desktop and mobile and identify the single visual change that would most improve the experience.
  Commit: `Polish Clarity demo experience`

## Hands-on Checkpoints

- [x] Early usable behavior explored — completed after slice 1.
- [ ] Recovery states explored — after slice 4, trigger a section failure and confirm the retry flow.
- [ ] Local library explored — after slice 11, decode three paragraphs and navigate the library.
- [ ] Motion reviewed — after slice 12, judge the decode transition on desktop and mobile.
- [ ] Share explored — after slice 15, share a decode and open the link on another device.
- [ ] Final kick-the-tires exploration and feedback completed — after slice 16, run the full journey end to end.

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — trace one decode from component to route handler to `streamText` and back to result cards, and trace one share from the dialog to Neon and back to the shared view.
- [ ] Optional edit and transfer reflection addressed — offered after the final review.
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including the provider-to-card pipeline and the local-to-cloud share path.

Activity and evidence: not started
Route and stops: not started
Edit outcome: not started
Reflection: not started
Activity mode: not started

## Revisions

- Server-side file ingestion replaced with client-side parsing — Vercel Functions cap request bodies at 4.5 MB and memory at a few hundred MB, and `pdfjs-dist` on a 10 MB PDF can exceed both. Client-side parsing removes the ceilings and works offline.
- Database reintroduced for share only — the earlier spec said "there is no database." The share feature requires a server-held row so a link works across browsers. Scope narrowed to one table and two routes so the local-first character of the rest of the app is preserved.
- Neon chosen over Supabase for the share database — Supabase free tier pauses a project after seven days of low activity, which would break a link shared on Monday and opened the following Monday. Neon scales to zero after five minutes and wakes instantly.
- Vercel Hobby constraints now drive the streaming-only architecture — the 120-second proxied request timeout and Fluid Compute's 300-second ceiling mean the decode stream must stay short and the long-running work (PDF parsing) must live in the browser.
- Local-first persistence adopted — the earlier spec kept everything in page memory. IndexedDB is now the source of truth for the user's own decodes, and the library is a first-class product feature.
- Motion system added as a designed language — the earlier polish slice added a stylesheet but no motion language and no signature visual moment. Both are now required for the product to feel like a product rather than a form.
- Three new components and one new lib file declared — `source-input`, `audience-action`, `result-cards`, and `recovery-state` are split from `app/page.tsx`, and `lib/types.ts` becomes the shared type source. The earlier spec declared only `clarity-input`, `result-cards`, and `recovery-state`.
- Custom audience field deferred — universal reach is served by the three locked audiences in this release. A custom field would make the prompt contract untestable against fixed fixtures.
- Sentence-level citations deferred to paragraph-level — paragraph-level carries most of the trust value at a fraction of the prompt-engineering and layout complexity.
- Share count limited to ten live shares per browser — abuse prevention for a free, open-source, accountless tool. Enforced at share time via a stored browser UUID; not a security control.
- Tree reconstruction added as slice 9 — the audit found three dead curriculum trees, a 285 KB dump artifact, and a `page.tsx` that holds input, decode, and result rendering in one file. This slice is the precondition for every feature that follows.