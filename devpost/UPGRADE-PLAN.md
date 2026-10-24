---
doc: upgrade-plan
status: approved
---
# Clarity — Upgrade Plan

The reasoning trail behind the shift from a hackathon demo to a local-first product with an optional cloud share. This document is not a specification, not a PRD, and not a build tracker. It exists so that any future session — human or agent — can understand *why* the current architecture looks the way it does, rather than reverse-engineering intent from code.

Read this before proposing a change that touches the stack, the storage model, or the product boundary. If the change contradicts a decision recorded here, either the reasoning has genuinely changed (in which case update this file) or the change is a mistake (in which case do not make it).

## What Prompted the Upgrade

The original Clarity was a small Next.js app that decoded dense text into four cards and a concept map. It worked. It streamed. It had a warm charcoal interface and a real kernel. It also felt like a demo, and the honest diagnosis of why was five things:

1. Nothing persisted. A refresh erased every result.
2. No citations. The model was told to be source-grounded, but a reader had no way to verify a claim.
3. No recovery. A mid-stream failure discarded everything past the last completed card.
4. No cost control. One user pasting the same paper ten times cost ten API calls.
5. No point of view. The palette was calm but the interface was a form, not a product.

None of those are feature gaps. They are missing properties: permanence, trust, resilience, discipline, and identity. The upgrade is about adding the properties, and the features are downstream of them.

## The Three Paths Considered

Only three legitimate ways existed to move forward. They trade off against each other, and choosing one shapes everything that follows.

**Path A — Depth: one reader class, executed to perfection.** Pick one specific reader with a sharp pain and build the best experience in the world for that reader. The candidate was the research scholar or developer reading papers outside their subfield. Features: source citations per claim, section-level retry, a locally saved library, highlight-to-decode, share via link, no accounts, no backend for the default path. Fastest path to something that feels like a product because every decision optimizes for one reader with a real problem.

**Path B — Platform: accounts, sync, collaboration, API.** Add auth, cloud database, user accounts, saved history across devices, team workspaces, developer API, browser extension. Five to ten times the work. Requires real backend, real auth, real cost control, and a real privacy policy. The path to a company; not the path to a working, beautiful product in weeks.

**Path C — Vertical: become the best tool for one document type.** Legal contracts, medical papers, financial filings, technical RFCs. Pick a domain and add domain-specific features: glossaries, term extraction, comparison between two documents, citation-linked reasoning. Smaller audience, much deeper value.

**Path A was chosen**, with one refinement: the audience is universal rather than one narrow reader class, served by the three locked labels (`Student`, `Executive`, `Developer (Non-ML)`) that map to the majority of readers who hit dense text. This keeps the depth of a focused product while opening the reach. It is not Path C — no single document type is privileged — and it is not Path B, because there are still no accounts and no sync.

The reason Path A beats Path B for this project is a rule that holds for almost every product: **every product that ever became a platform started as a sharp tool for one person.** Adding auth before proving the kernel works is spending the budget on infrastructure instead of on the magic. If the magic lands, accounts can be added later; if it does not, accounts would not have saved it.

## The Storage Model

The chosen shape is **local-first with cloud-on-demand share**. This is a specific architecture, not a slogan.

**Local-first by default.** Every decode lives in the user's browser. IndexedDB via Dexie holds the decode and the session identity. The library is searchable, reopenable, renamable, and deletable. Nothing leaves the machine unless the user explicitly asks.

**Cloud on demand.** One decode can be shared. The client sends the serialized result to `POST /api/share`, the server writes one row into a Neon Postgres table, and the response carries a short ID and a delete token. Opening `https://<host>/s/<id>` reads that row and renders a read-only view. The user can revoke at any time with the delete token.

**Why not cloud-only.** Cloud-only means accounts, sessions, per-user storage, a privacy surface, and a support burden. None of those prove the kernel. They prove the ability to build a backend.

**Why not local-only.** A share link is the smallest feature that lets a reader say "look at this" without describing the result. That is real value, and it requires exactly one server-side row per share.

**Why not sync.** Sync across devices implies accounts, which implies the full Path B infrastructure. It was deferred because the local library has to prove people return to it before syncing across devices is worth building. If nobody opens the library twice, they will not open it from a second device either.

## The Free Stack, With Real Numbers

Every choice below is on a free tier. The numbers were verified rather than assumed; where a number is uncertain, the uncertainty is stated.

### Google Gemini free tier

- Purpose: the generation call for four sections and the concept graph.
- Rate limits: Google no longer publishes fixed per-model RPM/RPD numbers on its rate-limits page. Third-party tracking puts Flash-class models at roughly 10–15 requests per minute and a few hundred to about 1,500 requests per day depending on the model.
- The uncertainty matters. A publicly deployed app where anyone can decode anything will exhaust a free quota quickly. Mitigation: cache by content hash, and apply a per-browser budget of twenty decodes per rolling hour. If traffic patterns show the browser budget is not enough, a per-IP server-side limit is the next layer.
- Do not assume unlimited free usage. Verify the current model and account at setup.

### Vercel Hobby

- Purpose: host the Next.js app and the route handlers.
- Free tier: 100 GB transfer, 1M function invocations per month, 100 deployments per day, 200 projects.
- Proxied request timeout: 120 seconds, hard ceiling. Your decode streams four sections plus a graph; in practice this finishes in 10–30 seconds, comfortably inside the limit.
- Function duration with Fluid Compute: 300 seconds across all plans. Fluid Compute must be enabled in the dashboard under Settings → Functions for streaming AI apps to have enough time.
- Request body limit: 4.5 MB. This is why file upload must be client-side.
- Memory ceiling: typically 128 MB to 1 GB depending on configuration. This is also why file parsing must be client-side — `pdfjs-dist` on a 10 MB PDF can consume 200–500 MB during parsing and kill the function.
- Licensing: personal and non-commercial use only. A hackathon project qualifies. If this ever becomes a paid product, Pro is required.

### Neon Postgres

- Purpose: store shared decodes behind short links.
- Free tier: 0.5 GB storage, 100 compute-unit hours per month, 100 projects, 10 branches per project, 5 GB public network transfer per month. No credit card required.
- Behavior on idle: compute scales to zero after five minutes without queries and reactivates in a few hundred milliseconds on the next query.
- Behavior on cap: writes fail when the storage limit is exceeded. No automatic charges.

### Why Neon over Supabase

Supabase free tier pauses a project after seven days of low activity and serves nothing until it is manually restored. For a share-link database this is a failure mode: a link shared on Monday would return an error the following Monday because nobody happened to query the database that week. Neon scales to zero after five minutes and wakes on the next request. For a low-traffic share endpoint, that difference is the whole reason for choosing one over the other.

Supabase is good software. It is the wrong tool for this specific feature.

### Why Neon over Turso

Turso has the largest free tier on paper — 9 GB and a billion row reads — but it is SQLite rather than Postgres, and the serverless driver is less familiar if the schema ever needs to be extended. For a project where a few megabytes is the real requirement, Neon's Postgres compatibility and scale-to-zero behavior are worth more than raw capacity.

### The rest

- Next.js on Vercel (already the stack).
- Motion, formerly Framer Motion, for animation. Roughly 30 KB. Worth the weight because motion is the thirty-second hook.
- Dexie for IndexedDB. Small, typed, and stable.
- React Flow (`@xyflow/react`) for the concept map. Already in use.
- `pdfjs-dist` browser build for PDF parsing. Already a dependency; moving from server to client.
- `@mozilla/readability` and `jsdom` for URL extraction. Already in use; server-side only.

No paid service anywhere on the critical path. No analytics. No error tracking. No auth provider. No payment processor. No CDN beyond Vercel's built-in edge.

## The File Parsing Decision

The original `/api/upload` route ran `pdfjs-dist` on the server. It worked on localhost and cannot work on Vercel. Three independent walls:

1. **Request body limit.** Vercel Functions cap requests at 4.5 MB. A 6 MB PDF never reaches the handler.
2. **Memory limit.** The route loads the entire file into a `Uint8Array` and then `pdfjs-dist` builds its own internal representation. A 10 MB PDF can consume 200–500 MB during parsing and get the function killed.
3. **Execution time.** PDF parsing is CPU-bound and synchronous. A 50-page PDF can take 5–15 seconds, competing with the streaming decode for the same function budget.

Three options were considered:

- **A. Client-direct upload to blob storage, then server-side parse.** Solves the request-size limit but not the memory limit. Adds a storage dependency and a three-step upload handshake that does not fire callbacks on localhost.
- **B. Client-side parsing in the browser.** Solves both limits. File content stays on the user's machine. Works offline. Fits the local-first architecture exactly. Cost: roughly 1–2 MB of JavaScript on first use, cached after that.
- **C. Hybrid — client parses small files, server parses large ones via blob storage.** Best of both, but maintains two parsing paths and doubles the edge-case surface.

**Option B was chosen.** The trade-off accepted is a one-time JavaScript download and the requirement that the browser have enough memory to hold the PDF. For papers, contracts, articles, and specs — the documents users will actually paste — both are fine. A 20 MB ceiling with a clear message is the honest version of that limit. If large-file support becomes real, Option C is a feature addition, not a rewrite, because the client-side path stays intact.

The consequence for the codebase: `app/api/upload/route.ts` is deleted. `serverExternalPackages: ["pdfjs-dist"]` is removed from `next.config.ts`. `pdfjs-dist` remains in `package.json` but is loaded lazily in the browser, not imported on the server.

## The Ten-Share Rule

Each browser is limited to ten live shared decodes. Enforced at share time by counting rows for a stored browser UUID in `localStorage`. Not a security control; abuse prevention for a free, open-source, accountless tool. A determined user clears `localStorage` and starts over, and that is acceptable at this stage.

**Alternatives considered and rejected:**

- Per-hour share limit. Rejected because it does not cap total storage and encourages repeated small shares instead of one thoughtful one.
- Lifetime share limit. Rejected because it is hostile to a user who wants to share the same decode after revoking an old one.
- No limit at all. Rejected because one user could fill the database and lock out everyone else on the shared 0.5 GB Neon free tier.

**Revocation** is included in the same design. Each share carries an unguessable delete token; the share dialog exposes a `Revoke share` action that consumes the token and deletes the row. This makes the ten-share limit meaningful — a user at the limit revokes a share to make room, and the revoked link returns `404` immediately.

## The Tiered Feature Set

Features were ranked by what makes the product feel real, not by how impressive they sound in a list.

### Tier 1 — Foundation

Without these, nothing else feels real.

1. **Local library.** Past decodes persist, are searchable, and reopen instantly.
2. **Source citations.** Every generated claim traces back to a paragraph in the source. Paragraph-level in this release; sentence-level is a stretch.
3. **Recovery.** Section-level retry, stale-results badge, partial preservation. This is unbuilt slice 4 and must be built before features that assume it.
4. **The `page.tsx` split.** Extract `source-input`, `audience-action`, `result-cards`, and `recovery-state`; create `lib/types.ts`. Not a feature — the precondition for every feature after it.

### Tier 2 — The Hook

This is what makes someone stay.

5. **Motion system.** Choreographed streaming, card entry, skeleton-to-content transition, four-state buttons, and the signature decode transition.
6. **Command palette.** `Cmd+K` and `Ctrl+K`. Fast, keyboard-first, immediately signals "application" rather than "form."
7. **Share-on-demand.** One decode, one short link, ten per browser, revocable. The only server-touching feature in the app.
8. **Client-side file parsing.** Removes the serverless ceiling. Works offline. Keeps file content private.

### Tier 3 — Later

Real, but not now.

9. Compare audiences side by side.
10. Export to Markdown.
11. PWA install.
12. Custom audience field.
13. Concept-map auto-layout and node grouping.
14. Sentence-level citations.

**Not on the list at all:** accounts, sync, collaboration, payments, browser extension. Those are Path B. Path A was chosen, and Path A holds.

## The Build Order and Why It Matters

Each slice leaves the project working. The order is not arbitrary.

1. **Reconstruct the tree** (slice 9). Delete the three dead curriculum trees and the dump artifact. Split `app/page.tsx` into the four declared components. Create `lib/types.ts`. No behavior change. This is first because every later slice adds files, and adding them into a messy tree makes the mess permanent.

2. **Recovery** (slice 4). Retry route, section-level retry, stale badge, partial preservation. Already specified in `spec.md`; still unbuilt. This is second because the local library, share, and citations all assume a decode that can survive a mid-stream failure. Building them first means building them twice.

3. **Client-side parsing** (slice 10). Replaces `/api/upload`. This is third because the server route is actively wrong for the deployed environment, and leaving it in place means any deployed demo can hit the 4.5 MB wall.

4. **Local library** (slice 11). This is the first feature that transforms the product from a demo into a tool. The single biggest felt-quality change in the plan.

5. **Motion system** (slice 12). This is the thirty-second hook. It is after the library because the library changes what states exist (empty library, full library, search results), and the motion system should animate those states, not just the original ones.

6. **Command palette** (slice 13). Keyboard-first control. Small, cheap, no backend surface.

7. **Citations** (slice 14). The trust feature. After the palette because it is genuinely complex and should not block the simpler wins.

8. **Share** (slice 15). Last among the significant features. It depends on the library (to store the delete token) and citations (so a shared decode carries its trust markers). It is the only feature that touches a server beyond Gemini.

9. **Final polish** (slice 16). The demo path, the responsive check, the accessibility pass.

## Decisions That Are Now Closed

These are recorded in `spec.md > Decisions and Open Issues` and should not be reopened without reason.

- Provider: Google Gemini through Google AI Studio.
- Framework: Next.js App Router with strict TypeScript.
- Styling: Tailwind CSS 4 with CSS variables.
- Motion: the `motion` library with a designed language.
- Local storage: IndexedDB via Dexie.
- Cloud storage: Neon Postgres, one table, two routes.
- File parsing: client-side for `.pdf` and `.txt`.
- URL parsing: server-side with SSRF guards.
- Share limit: ten live shares per browser, revocable.
- Rate budget: twenty decodes per rolling hour per browser.
- Citations: paragraph-level in this release.
- Custom audience: deferred.
- Accounts, sync, collaboration, payments: out of scope.

## Decisions That Remain Open

These are recorded in `spec.md > Open Issues` and can be resolved during implementation.

- Exact maximum source length. Planned as 20,000 characters; verify against the selected model's context window.
- Whether a server-side per-IP rate limit is needed in addition to the browser budget. Depends on observed traffic after deployment.
- The exact layout of citation markers within result cards. Tune against real decode output.
- Whether the audience label should be prominent or subtle in the shared view.
- The exact concept map layout algorithm. React Flow supports several; pick one when the graph shape is known against real papers.

None of these block the build. Each can be decided against running code rather than in the abstract.

## The Rule This Document Exists To Enforce

A change that contradicts a decision recorded here is either a mistake or a genuine re-evaluation. If it is a mistake, this file is the reason the mistake is caught. If it is a re-evaluation, this file is where the reasoning changes.

The reason most solo projects die at this stage is not that the code is hard. It is that the plan lived in someone's head and their head could not hold it. The `devpost/` documents exist so both of ours can let go.

