# Clarity — Build Checklist (Devpost Learn Skill Pack)

Project: Clarity — Understand anything, at your level.
Repository: https://github.com/arubara2021/clarity-concept-decoder
Hackathon: Build With AI: Basics (Devpost Learn)
Status key: `[x]` completed and verified in code · `[ ]` open item before submission

---

## Phase 0 — Skill Pack Onboarding

- [x] Installed the Devpost Learn Skill Pack into an empty project folder.
- [x] Ran the interview flow before writing any application code.
- [x] Generated `devpost/learner-profile.md` capturing builder context and constraints.
- [x] Confirmed the agent workflow: plan first, build second, verify third.
- [x] Set up Node.js, Git, and a coding agent that supports skills.

## Phase 1 — Planning Documents (Required by Rules)

- [x] `devpost/scope.md` — MVP boundary locked: four output sections, three audiences, local-first storage, explicit non-goals (no accounts, no chat, no fine-tuning).
- [x] `devpost/prd.md` — Personas, audience contracts, output contract, citation requirement, recovery behavior, rate budget, share limits.
- [x] `devpost/spec.md` — Architecture: Zustand store shape, SSE event protocol, IndexedDB schema, Neon share schema, prompt structure, route map.
- [x] `devpost/checklist.md` — this file, maintained slice by slice as work completed.
- [x] `devpost/UPGRADE-PLAN.md` — post-MVP improvement plan kept separate from MVP scope.

## Phase 2 — Foundation and Design System

- [x] Next.js 16 App Router with Turbopack, TypeScript strict mode.
- [x] Tailwind CSS v4 with CSS-variable token system in `app/globals.css`.
- [x] Monochrome identity: black-hole dark theme and paper-white light theme, no decorative color.
- [x] Token pairs for surfaces, text steps, borders, shadows, glass, canvas panes, dock glow.
- [x] Motion language: spring presets, stagger reveals, line-breathe, orbit, skeleton breathe keyframes.
- [x] `prefers-reduced-motion` global collapse for all CSS animations.
- [x] Hidden scrollbars with `no-scrollbar` utility and body scroll locking for the workspace.
- [x] Eclipse logo mark (`components/layout/logo-mark.tsx`) plus `app/icon.svg` favicon with dark-mode media query.

## Phase 3 — State, Storage, and Budget

- [x] `lib/store.ts` — Zustand store with `subscribeWithSelector`: text, audience, results, card states, section errors, graph, decode flags, overlay flags.
- [x] `lib/local-store.ts` — Dexie database `clarity`, table `decodes` keyed by id with createdAt and title indexes.
- [x] Session identity generation persisted in localStorage for share attribution.
- [x] `lib/rate-budget.ts` — 20 decodes per rolling hour, localStorage enforced, reset helper for settings.
- [x] Title building with markdown stripping and word-boundary truncation (`lib/format.ts`).
- [x] `resolveTitle` self-heals legacy truncated titles at render time across library, recent strip, reading view, and map view.

## Phase 4 — AI Core and Streaming Protocol

- [x] `lib/ai.ts` — Gemini provider via Vercel AI SDK with explicit key and model env checks.
- [x] `lib/prompts.ts` — role block, audience guidance contracts, per-section instructions, format constraints, citation instruction, untrusted-source guardrails.
- [x] Paragraph numbering `[P1]..[Pn]` injected into every section prompt for citation grounding.
- [x] `lib/graph-schema.ts` — Zod schema for concept nodes and edges with referential integrity refinement.
- [x] `app/api/decode/route.ts` — SSE stream: section-start, token, section-complete, section-error, graph, graph-error, global-error, done.
- [x] `app/api/retry-section/route.ts` — single-section regeneration stream with temperature 0.
- [x] `lib/use-decode-stream.ts` — SSE block parser, per-section token buffers, requestAnimationFrame batching, persistence on completion.
- [x] `lib/validation.ts` — Zod request schemas for decode, retry, fetch-url, share, and revoke payloads.
- [x] Server routes never leak provider error text; client-facing messages stay calm and generic.

## Phase 5 — Source Ingestion

- [x] `components/decode/source-toolbar.tsx` — Paste / File / URL segmented rail with spring layoutId pill.
- [x] `components/decode/source-composer.tsx` — borderless editor canvas, 20,000 character contract, drag-and-drop with depth counting.
- [x] Client-side PDF text extraction with `pdfjs-dist` (file bytes never leave the browser).
- [x] TXT extraction with empty-file and 20 MB guards.
- [x] `app/api/fetch-url/route.ts` — public page extraction with Mozilla Readability and JSDOM.
- [x] `lib/safe-url.ts` — SSRF protection: protocol allowlist, private IPv4/IPv6 rejection, redirect cap, byte cap, timeout.
- [x] Progress hairline attached to the toolbar for both file and URL extraction.
- [x] Inline calm error row with icon; error clears on next successful edit.

## Phase 6 — Decode Workspace Composition

- [x] `components/decode/workspace-shell.tsx` — dual-pane grid with hairline divider and grip, per-pane ambient grid, noise, and vignette.
- [x] Desktop: locked viewport, independent pane scrolling, status bar pinned to pane bottom.
- [x] Mobile: stacked panes with page scroll, no clipped controls.
- [x] `components/decode/status-bar.tsx` — character counter, budget mini-meter, audience segment, magnetic Decode dock with glow, Enter-to-decode hint.
- [x] `components/decode/audience-selector.tsx` — three-audience radiogroup with contract line per audience.
- [x] `components/decode/output-canvas.tsx` — mode machine: idle orbit, decode stage, global error; recent rail collapses during decode.
- [x] `components/decode/orbit-instrument.tsx` — triple-ring idle instrument with contract chips and one-click sample paragraph.
- [x] `components/decode/decode-stage.tsx` — numbered ledger rows, breathing skeletons with reserved heights, streaming caret, hairline separators.
- [x] `components/decode/decode-transition-line.tsx` — signature spring-drawn line with tight monochrome halo.
- [x] `app/decode/page.tsx` — orchestration only: header, shell, palette, share dialog, Enter shortcut, body scroll lock.

## Phase 7 — Results, Citations, and Reading View

- [x] `components/decode/result-cards.tsx` — TL;DR, Analogy, Jargon Buster, Takeaway cards with distinct typographic treatments.
- [x] Grouped citation parsing: `[p2, p5, p7]` expands into one compact superscript chip per claim.
- [x] Citation chips are buttons in the reading view and quiet spans in the shared view.
- [x] Jargon parser tolerates `term -> translation`, `term - translation`, and `term: translation` lines.
- [x] Reserved heights apply only while streaming; completed cards hug their content.
- [x] `components/decode/source-bar.tsx` — collapsible original source with paragraph anchors and character count.
- [x] Citation click opens the source, scrolls to the paragraph, and flashes a tint highlight for 1.4 seconds.
- [x] `app/r/[id]/page.tsx` — single sticky document bar carrying title, stale badge, map, share, copy, and two-step delete.
- [x] `components/decode/stale-badge.tsx` — results-out-of-date indicator when source text changes after a decode.
- [x] `components/decode/recovery-state.tsx` — section-level recovery card preserving completed sections, plus global error card.

## Phase 8 — Concept Map

- [x] `components/concept/concept-map.tsx` — React Flow with dagre hierarchical layout, custom constellation nodes and edges.
- [x] Edges draw in with pathLength animation; labels fade in after their edge completes.
- [x] Selection dims unrelated nodes and edges; connected edges gain an animated dash flow.
- [x] Custom zoom and fit controls in a glass cluster; attribution preserved.
- [x] `components/concept/graph-inspector.tsx` — floating glass panel listing outgoing and incoming relationships with direction icons.
- [x] `app/r/[id]/map/page.tsx` — full-screen map view with ambient background, title pill, count badge, and interaction hint.
- [x] Empty-graph and missing-decode states handled with branded messaging.

## Phase 9 — Library and Persistence UX

- [x] `app/library/page.tsx` — library header with live decode count from Dexie.
- [x] `components/library-list.tsx` — grid and list views persisted per browser.
- [x] Search across cleaned titles and raw source text; filters for all, shared, private.
- [x] Sort cycling: newest, oldest, alphabetical on cleaned titles.
- [x] Bulk selection bar with select-all-visible, clear, and two-step delete of selection.
- [x] Inline rename with Enter to save and Escape to cancel; titles cleaned on save.
- [x] Single-item delete and clear-all with three-second confirm windows.
- [x] Empty and no-match states with recovery actions.
- [x] `components/decode/recent-strip.tsx` — three most recent decodes pinned to the output canvas when idle.

## Phase 10 — Sharing and Privacy Boundary

- [x] `lib/share-store.ts` — Neon Postgres `shared_decodes` table with hashed delete tokens and view counters.
- [x] Share limit of 10 live shares per browser identity, enforced server-side.
- [x] `app/api/share/route.ts` — HEAD returns share count header; POST creates share and returns url plus delete token.
- [x] `app/api/share/[id]/revoke/route.ts` — token-verified revoke with 403 on mismatch and 404 on absence.
- [x] `components/share/share-dialog.tsx` — creation, copy with icon swap, meter, open shared view, two-step revoke.
- [x] `app/s/[id]/page.tsx` — public read-only shared view with collapsed source and no library access.
- [x] Sharing disabled gracefully with a clear message when DATABASE_URL is absent.

## Phase 11 — Overlays, Keyboard, and Settings

- [x] `components/overlays/command-palette.tsx` — Cmd/Ctrl+K palette with Source, Audience, Navigate, and Share groups.
- [x] Palette actions: focus source, decode, clear result, switch audience, open library, open settings, share, copy share link.
- [x] Query highlighting and keyboard loop navigation via cmdk.
- [x] Enter decodes from anywhere outside editable fields on the decode page.
- [x] Escape closes overlays through Radix dialog primitives.
- [x] `components/layout/theme-toggle.tsx` — three-state cycle with 120-degree icon rotation spring.
- [x] `app/settings/page.tsx` — appearance segment, live budget meter with reset, and the documented shortcut table.

## Phase 12 — Error Handling and Recovery States

- [x] `app/error.tsx` — route-level branded boundary with retry and workspace escape.
- [x] `app/global-error.tsx` — document-level boundary with try-again and reload actions.
- [x] `app/not-found.tsx` — 404 surface with logo mark and recovery routes.
- [x] Mid-stream section failure keeps completed cards and offers section retry or full retry.
- [x] Global decoder failure surfaces one calm message with a retry path.
- [x] Graph failure degrades gracefully: four sections remain available with an explanatory note.
- [x] Network failure during streaming maps to the recovery language, never a raw stack trace.

## Phase 13 — Accessibility and Motion Safety

- [x] `MotionConfig reducedMotion="user"` disables transform animation for reduced-motion users.
- [x] Canvas particle loops, orbit rings, and dash flows gated by `useReducedMotion`.
- [x] Focus-visible rings on every interactive surface including icon actions and citation chips.
- [x] Radiogroup semantics for audience and segmented controls; aria-pressed for toggles.
- [x] `aria-live="polite"` on the decode stage and result card regions.
- [x] Accessible labels on icon-only buttons, map controls, and palette triggers.
- [x] Hydration-safe theme reading via mounted guards on canvas, graph, hero content, status bar, and theme toggle.

## Phase 14 — Quality Gate and Repository Hygiene

- [x] `npm run typecheck` — zero TypeScript errors under strict mode.
- [x] `npm run lint` — zero errors; remaining warning documented and accepted.
- [x] `npm run build` — production build green; all 14 routes generated.
- [x] `npm run test` — Vitest backend suite covering validation, budget, and store contracts.
- [x] Dead code pruned: unused UI primitives, orphaned landing sections, unused motion and token modules, inert Tailwind config dependencies removed from the working tree.
- [x] `@formkit/auto-animate` dependency uninstalled (unused).
- [x] `.env` excluded via `.gitignore`; no API keys or database URLs in git history.
- [x] `next.config.ts` ships `devIndicators: false`, compression, and no powered-by header.

## Phase 15 — Submission Package

- [x] `README.md` — overview, features, motion system, tech stack, build process, setup, scripts, structure.
- [x] Planning documents present in repository: `scope.md`, `prd.md`, `spec.md`.
- [x] This checklist maintained and committed as evidence of the skill-pack workflow.
- [x] Repository public on GitHub with clean commit history.
- [ ] Demo video, 1 to 3 minutes, covering ingest, decode stream, citations, concept map, library, theme switch, and share flow.
- [ ] Devpost submission form completed: description, tags, repository URL, video URL.
- [ ] Final submission submitted ahead of the 27 Oct 2026 deadline.

---

## Verification Log

| Gate | Command | Result |
| --- | --- | --- |
| Types | `npm run typecheck` | Pass |
| Lint | `npm run lint` | Pass, 0 errors |
| Build | `npm run build` | Pass, 14 routes |
| Tests | `npm run test` | Pass |
| Secrets | `git log --all -- .env` | Empty |

## What This Checklist Proves

Every slice above maps to files that exist in the repository and behavior that was manually exercised in both themes on desktop and mobile widths. The plan documents came first, the build followed the spec, and the verification gates closed each slice before the next one opened. That discipline is the point of the skill pack, and it is why the workspace, the streaming recovery, and the citation trust layer all behave like one product instead of four disconnected demos.