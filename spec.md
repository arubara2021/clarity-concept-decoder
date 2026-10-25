
---
doc: spec
status: draft
---
# Clarity - Technical Spec

## How This Works, In Plain Language

Clarity is a Next.js application that runs entirely in the browser by default. Nothing leaves the user's machine unless they explicitly ask for it.

The system has four layers:

- The **React browser UI** renders the warm single-page interface, owns all page state, streams generated text into four result cards, and stores every completed decode in the browser's IndexedDB.
- The **Next.js route handlers** run on the server only for operations the browser cannot do safely or legally: calling Gemini with a protected API key, fetching public HTML from arbitrary origins, and writing a shared decode to the cloud database.
- The **Gemini provider** turns the user's source text and selected audience into four explanation sections plus a concept graph, streamed section by section.
- The **share layer** is a single Neon Postgres table behind two routes. It exists only so a user can turn one local decode into a link. It holds no accounts, no sessions, and no user identity beyond an unguessable share ID.

The default path never touches a server beyond the Gemini call. A user pastes text, drops a PDF or TXT file, or pastes a public URL. Files are parsed locally in the browser. URLs are fetched by the server because the browser's cross-origin policy blocks arbitrary fetch. The user reviews the extracted text, chooses an audience, and clicks Decode. The client streams four sections from `POST /api/decode`, then stores the completed result in IndexedDB. If the user later clicks Share, the client sends that one result to `POST /api/share`, receives a short ID, and constructs a link.

The tradeoff is that two different storage layers coexist. IndexedDB holds the user's own library and is the source of truth for everything they see. Neon holds only shared decodes, and only because a link must be reachable from another browser. This keeps the open-source, accountless, privacy-respecting character of a local-first tool while still allowing a share feature.

## The Core Journey Through the System

Implements `prd.md > The Core Journey`.

1. Next.js renders `app/page.tsx` with the shell, source input, audience controls, Decode action, and the local library drawer.
2. The user supplies source text in one of three ways:
   - Pastes text directly into the textarea. State lives in React memory until Decode.
   - Drops a `.pdf` or `.txt` file. The client parses it locally: `.txt` via `FileReader`, `.pdf` via the browser build of `pdfjs-dist`. Extracted text replaces the textarea contents. No network request occurs.
   - Pastes a public `http` or `https` URL and clicks Extract. The client sends `{ url }` to `POST /api/fetch-url`, which performs the safe fetch and readability extraction server-side and returns text plus source metadata.
3. The user confirms or changes the audience. `Student` is selected by default. Labels are exactly `Student`, `Executive`, and `Developer (Non-ML)`.
4. The user clicks Decode. The client validates non-empty text, checks the per-session decode budget in `localStorage`, disables the button, keeps the textarea editable, renders four skeleton cards, and calls `POST /api/decode` with `{ text, audience }`.
5. The route handler reads `GEMINI_API_KEY` from the server environment, validates the body with Zod, and streams four sections via the Vercel AI SDK, then a graph event, then done.
6. The client consumes the stream, identifies the active section from the `section-start` event, and appends token text into the correct card. Completed cards remain visible while later sections stream.
7. On `done`, the client restores the Decode button and writes the completed result to IndexedDB under a generated local ID, storing the source text, audience, all four sections, the graph, and a timestamp.
8. If the user edits the source after results exist, the results remain visible and a `Results out of date` badge appears. A later Decode replaces them with a fresh result and a new library entry.
9. If a section fails mid-stream, the route emits `section-error` for that section. Completed cards persist. The failed card becomes a retry card with `Retry this section` and, on a second failure, `Retry full decode`. The client calls `POST /api/retry-section` with `{ text, audience, section }`.
10. If the whole service is unreachable, the client renders a single global error state with `Try again`. Source text and audience are preserved.
11. The user can open the local library at any time, search it, reopen a past decode read-only, or delete it.
12. The user can share one decode by clicking Share on that result. The client sends the result to `POST /api/share`, receives a short ID and a delete token, and displays the link. The delete token is stored alongside the local entry so the user can revoke the share later.

## Stack

- **Framework:** Next.js App Router, with UI and server route handlers in one TypeScript project.
- **Language:** TypeScript with strict mode enabled.
- **API contracts:** Next.js route handlers provide the literal `/api/decode`, `/api/retry-section`, `/api/fetch-url`, and `/api/share` paths. Shared TypeScript types and Zod schemas keep request contracts type-safe. tRPC is not used.
- **Validation:** Zod schemas validate every route body before any work begins.
- **AI integration:** Vercel AI SDK `streamText` and `generateObject` with `@ai-sdk/google` and a configurable Gemini model.
- **Styling:** Tailwind CSS 4 with CSS variables for the warm charcoal design tokens.
- **Motion:** `motion` (formerly Framer Motion) for choreographed streaming, card entry, skeleton transitions, and command palette reveal.
- **Client-side file parsing:** `pdfjs-dist` browser build for digital PDFs; native `FileReader` for TXT. No server upload route exists.
- **URL extraction:** server-side `fetch` with SSRF, redirect, size, timeout, and content-type guards, followed by `@mozilla/readability` and `jsdom`.
- **Local persistence:** IndexedDB through `dexie` with a small typed schema.
- **Share database:** Neon Postgres via `@neondatabase/serverless`.
- **Graph:** React Flow (`@xyflow/react`) for draggable nodes and edges.
- **Model:** Configurable through `GEMINI_MODEL`; verify a current fast Gemini model during setup rather than assuming availability.

Documentation:

- [Next.js App Router](https://nextjs.org/docs/app)
- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Zod](https://zod.dev/)
- [Vercel AI SDK](https://ai-sdk.dev/docs)
- [AI SDK `streamText`](https://ai-sdk.dev/docs/reference/ai-sdk-core/stream-text)
- [AI SDK `generateObject`](https://ai-sdk.dev/docs/reference/ai-sdk-core/generate-object)
- [Google provider](https://ai-sdk.dev/providers/ai-sdk-providers/google-generative-ai)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Motion](https://motion.dev/docs)
- [Dexie](https://dexie.org/docs/)
- [pdfjs-dist](https://mozilla.github.io/pdf.js/)
- [Neon serverless driver](https://neon.tech/docs/serverless/serverless-driver)
- [Vercel Fluid Compute](https://vercel.com/docs/functions/fluid-compute)
- [React Flow](https://reactflow.dev/)
- [Gemini API keys](https://ai.google.dev/gemini-api/docs/api-key)
- [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing)
- [Gemini rate limits](https://ai.google.dev/gemini-api/docs/rate-limits)

## Where It Runs and How Someone Tries It

The app runs locally during development and deploys to Vercel for public use. It works in two deployment contexts:

**Local.** `npm run dev` starts the Next.js development server on `http://localhost:3000`. PDF parsing, IndexedDB, and streaming all work on localhost. The share routes also work on localhost if `DATABASE_URL` is set, otherwise Share is disabled with a clear message.

**Vercel Hobby.** Deployed to Vercel with Fluid Compute enabled (Settings → Functions), which raises the default function duration to 300 seconds and supports streaming responses. The free tier is licensed for personal and non-commercial use. A hackathon submission qualifies.

**Required environment variables:**

```dotenv
GEMINI_API_KEY=replace-with-a-new-key-from-google-ai-studio
GEMINI_MODEL=replace-with-a-current-fast-gemini-model
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgres://...neon.tech/clarity
```

`GOOGLE_API_KEY` is accepted as a fallback for `GEMINI_API_KEY`. `DATABASE_URL` is optional in local development; when absent, the Share action is hidden and the `/api/share` and `/s/[id]` routes return a clear "sharing is not configured" response.

**Planned commands:**

```text
npm install
npm run dev
```

**Deployed commands:** Vercel builds and deploys automatically on push to the connected branch.

**Demo path:**

1. Open the app.
2. Drop a PDF paper onto the input area. Text extracts in the browser.
3. Select `Developer (Non-ML)`.
4. Click Decode. Observe skeletons, ordered streaming cards, and the concept map.
5. Open the local library. Reopen the decode.
6. Click Share. Copy the link. Open it in a private window.

## Look and Feel

Implements `prd.md > Look and Feel`.

**Palette.** Warm near-black background (`#1A1815`), warm charcoal surfaces (`#232019`), subtle 1px borders (`#33302A`), soft off-white primary text (`#EDE8E0`), muted warm-grey secondary text (`#8A8375`), and one amber accent (`#E8A33D`). Amber is reserved for the logo mark, the active audience control, the Decode action, and the primary affordance in the command palette. It is not used for result borders, underlines, or result text. Error surfaces use a calm red-tinted treatment that is semantic, not brand.

**Typography.** A clean sans-serif for the UI. Result paragraphs use generous line-height and a constrained maximum width. The takeaway uses a larger, heavier treatment.

**Spacing.** A four-pixel base unit. Every gap, padding, and margin is a multiple of four. The layout uses a consistent vertical rhythm; no ad-hoc values.

**Motion.** This is the thirty-second hook and it is designed, not decorative:
- Cards enter with a short upward translate plus fade, staggered by 40 milliseconds.
- Skeletons breathe on a 1.5-second sine cycle, not a linear pulse.
- Streaming tokens append without reflow jitter; the card reserves height for its expected final size.
- Buttons respond to hover (subtle lift), press (scale down 0.98), focus (amber ring), and disabled (reduced opacity) as four distinct states.
- The command palette fades and scales in over 150 milliseconds with a spring easing.
- All motion respects `prefers-reduced-motion` and collapses to instant transitions.

**The one distinctive visual decision.** Every premium product has one thing a screenshot betrays as theirs. For Clarity it is the **decode transition**: the moment the user clicks Decode, the source textarea dims to a warm grey and the four result cards rise into place beneath a thin amber line that draws itself across the results panel. This is the product's signature moment, and every other design decision supports it rather than competes with it.

**Surfaces to avoid.** No gradients, no glow effects, no neon, no purple, no pure black, no pure white, and no additional accent colors.

## Components

### Page Shell

`app/page.tsx` orchestrates the layout and composes the child components. It owns the top-level React state that must be shared across the input area and the results area: current source text, selected audience, decode status, and the current result object. Everything else lives in the child components.

Files: `app/page.tsx`, `app/layout.tsx`, `app/globals.css`.

Implements `prd.md > Screens and Layout`.

### Source Input

`components/source-input.tsx` owns the textarea, the file dropzone, the URL input row, and the source-mode tabs. It performs client-side file parsing for `.txt` and `.pdf`. It calls `POST /api/fetch-url` for URL extraction. It never calls the model.

Implements `prd.md > Features and Behavior > Text Input`, `prd.md > Features and Behavior > File Ingestion`, `prd.md > Features and Behavior > URL Ingestion`.

### Audience and Action

`components/audience-action.tsx` owns the three audience buttons and the Decode action. It reads and writes the audience and decode status through props. It is the only component that triggers the decode flow.

Implements `prd.md > Features and Behavior > Audience Selection`, `prd.md > Features and Behavior > Decode and Streaming Results`.

### Result Cards

`components/result-cards.tsx` renders the four progressive cards. Each card supports five states: skeleton, streaming, complete, section-error, and retry. The Jargon Buster card renders term-translation pairs. Paragraph-level citations, when present, render as a subtle superscript link that scrolls the source input to the referenced paragraph.

Implements `prd.md > Features and Behavior > Decode and Streaming Results`, `prd.md > Features and Behavior > Partial Recovery`, `prd.md > Features and Behavior > Citations`.

### Recovery State

`components/recovery-state.tsx` renders the section-level retry card and the global error state. It receives the failed section name and the retry callbacks from the page.

Implements `prd.md > Features and Behavior > Partial Recovery`, `prd.md > Features and Behavior > Global Failure`.

### Stale Badge

`components/stale-badge.tsx` renders the `Results out of date` indicator. It is a purely presentational component driven by a boolean prop.

Implements `prd.md > Features and Behavior > Stale Results`.

### Concept Map

`components/concept-map.tsx` renders validated nodes and edges with React Flow. Nodes are draggable, the canvas supports pan and zoom, and relationship labels remain readable.

Implements `prd.md > Features and Behavior > Concept Map`.

### Local Library

`components/library-drawer.tsx` renders the searchable list of past decodes from IndexedDB. It supports open, rename, and delete. It never calls the network.

Implements `prd.md > Features and Behavior > Local Library`.

### Command Palette

`components/command-palette.tsx` renders a Cmd+K (Ctrl+K on Windows and Linux) overlay. Actions include: focus source input, decode, switch audience, open library, share current result, and clear current result. It is keyboard-first and has no mouse-required interaction.

Implements `prd.md > Features and Behavior > Command Palette`.

### Share Dialog

`components/share-dialog.tsx` renders the share action, the resulting link, a copy button, and a revoke link. It stores the delete token in the local library entry.

Implements `prd.md > Features and Behavior > Share a Decode`.

### Next.js Route Handlers

- `app/api/decode/route.ts` validates and streams four sections plus a graph event.
- `app/api/retry-section/route.ts` validates and streams one section.
- `app/api/fetch-url/route.ts` safely fetches public HTML and returns readable text.
- `app/api/share/route.ts` inserts a shared decode and returns an ID plus a delete token.
- `app/s/[id]/route.ts` reads a shared decode and renders it read-only. It also handles revocation when the correct token is supplied as a query parameter.

Implements the server side of the corresponding `prd.md > Features and Behavior` sections.

### Zod Schemas

`lib/validation.ts` validates the decode request, the retry request, the URL request, and the share request. Every schema rejects with a typed JSON error before any work begins.

Implements `prd.md > States and Boundaries`.

### Prompt Builder

`lib/prompts.ts` builds section-specific system prompts from the audience contract and the source text. It also builds the graph extraction prompt. Every prompt enforces source grounding and forbids invented content.

Implements `prd.md > Features and Behavior > Audience Selection`, `prd.md > Features and Behavior > Decode and Streaming Results`, `prd.md > Features and Behavior > Concept Map`.

### AI Client

`lib/ai.ts` constructs the `@ai-sdk/google` provider from the server environment. It reads `GEMINI_API_KEY` and `GEMINI_MODEL` and throws a clear error when either is missing.

Implements `prd.md > Features and Behavior > Decode and Streaming Results`.

### Local Store

`lib/local-store.ts` wraps Dexie and exposes typed functions: `saveDecode`, `listDecodes`, `getDecode`, `deleteDecode`, `searchDecodes`. It also exposes the localStorage session identity used for the share limit.

Implements `prd.md > Features and Behavior > Local Library`, `prd.md > Features and Behavior > Share a Decode`.

### Share Store

`lib/share-store.ts` wraps the Neon serverless driver. It exposes `createShare`, `readShare`, `revokeShare`, and `countSharesForIdentity`. It is server-only.

Implements `prd.md > Features and Behavior > Share a Decode`.

### Safe URL Fetcher

`lib/safe-url.ts` validates a URL against private-network ranges, follows only safe redirects, enforces size and timeout limits, and requires an HTML content type.

Implements `prd.md > Features and Behavior > URL Ingestion`.

### Rate Budget

`lib/rate-budget.ts` reads and updates a per-browser decode counter in localStorage. Default budget is twenty decodes per hour. When exhausted, the Decode button disables and shows the reset time.

Implements `prd.md > States and Boundaries`.

### Design Tokens

`lib/tokens.ts` exports the spacing scale, motion durations, and easing curves used by components. This is the single source of truth for the visual system.

Implements `prd.md > Look and Feel`.

### Graph Schema

`lib/graph-schema.ts` validates the concept graph payload before React Flow receives it. Malformed or oversized payloads become a graph-specific error rather than breaking the result cards.

Implements `prd.md > Features and Behavior > Concept Map`.

### Shared Types

`lib/types.ts` holds `Audience`, `DecodeSection`, `SectionResult`, `Decode`, `ConceptGraph`, and `ShareMeta`. It is imported by both client and server code and has no runtime dependencies.

Implements the type contracts of every component above.

## API Contracts

### `POST /api/decode`

Request:

```json
{
  "text": "Dense source text...",
  "audience": "Developer (Non-ML)"
}
```

Response: `200 text/event-stream`.

Application events:

```text
event: section-start
data: {"section":"tldr"}

event: token
data: {"section":"tldr","text":"They built..."}

event: section-complete
data: {"section":"tldr"}

event: section-error
data: {"section":"jargon","message":"This section couldn't be generated. The connection may have dropped."}

event: graph
data: {"nodes":[...],"edges":[...]}

event: global-error
data: {"message":"The decoder is unavailable."}

event: done
data: {}
```

If validation fails before streaming, the route returns `400 application/json` with `{ "error": "..." }`.

### `POST /api/retry-section`

Request:

```json
{
  "text": "Dense source text...",
  "audience": "Developer (Non-ML)",
  "section": "jargon"
}
```

Response: `200 text/event-stream` containing `section-start`, `token`, `section-complete`, and `done` for only the requested section. If the retry itself fails, the route emits `section-error` for that section.

### `POST /api/fetch-url`

Request:

```json
{ "url": "https://example.com/public-article" }
```

Response:

```json
{
  "text": "Readable page text...",
  "url": "https://example.com/public-article",
  "title": "Article title"
}
```

The route rejects unsafe schemes, private destinations, authentication pages, non-HTML content, oversized responses, excessive redirects, and timeouts.

### `POST /api/share`

Request:

```json
{
  "identity": "browser-uuid-v4",
  "decode": {
    "text": "Source text...",
    "audience": "Developer (Non-ML)",
    "sections": {
      "tldr": "...",
      "analogy": "...",
      "jargon": "...",
      "takeaway": "..."
    },
    "graph": { "nodes": [], "edges": [] }
  }
}
```

Response:

```json
{
  "id": "8f3a2c",
  "deleteToken": "d41f9b7e...",
  "url": "https://clarity.app/s/8f3a2c"
}
```

The route first counts existing shares for the supplied `identity`. If the count is at the limit (ten), the route returns `429 application/json` with `{ "error": "Share limit reached for this browser." }`.

### `GET /s/[id]`

Response: `200 text/html` rendering the shared decode read-only, including the source text and the graph. Returns `404` if the ID does not exist or has been revoked.

### `POST /api/share/[id]/revoke`

Request:

```json
{ "deleteToken": "d41f9b7e..." }
```

Response: `204 No Content` on success, `403` on a wrong token, `404` on an unknown ID.

## Data Model

### Local persistence (browser, IndexedDB via Dexie)

```text
LocalDecode {
  id: string                    // uuid v4, generated on save
  createdAt: number             // epoch milliseconds
  title: string                 // first 60 chars of source, editable
  text: string
  audience: "Student" | "Executive" | "Developer (Non-ML)"
  sections: {
    tldr: string
    analogy: string
    jargon: string
    takeaway: string
  }
  graph: ConceptGraph | null
  share: {
    id: string
    url: string
    deleteToken: string
  } | null
}

SessionIdentity {
  uuid: string                  // stable per browser, stored in localStorage
  decodeBudget: {
    windowStart: number         // epoch milliseconds of current hour window
    count: number
  }
}
```

IndexedDB indexes: `createdAt` for the library list, and a full-text search on `text` and `title` implemented in application code because Dexie does not ship a full-text index by default.

### Cloud persistence (Neon Postgres)

```text
shared_decodes (
  id            text primary key,
  identity      text not null,
  created_at    timestamptz not null default now(),
  payload       jsonb not null,
  delete_token  text not null,
  views         integer not null default 0
)
```

`id` is a short random string (eight characters, base32). `payload` holds the entire decode object as JSON, which keeps the schema minimal and lets the shape evolve without a migration. `identity` exists only to enforce the ten-share limit; it is never shown or exported. A row is deleted when the user supplies the correct `delete_token` to the revoke route.

### Page state (React memory)

```text
PageState {
  text: string
  audience: "Student" | "Executive" | "Developer (Non-ML)"
  results: {
    tldr: string
    analogy: string
    jargon: string
    takeaway: string
  }
  cardStates: "empty" | "skeleton" | "streaming" | "complete" | "error"
  isDecoding: boolean
  isStale: boolean
  globalError: string | null
}
```

`text` and `audience` are updated by input controls and are never cleared by errors. `results` updates as token events arrive; completed sections are not replaced by later failures. Refreshing the page discards in-memory state; the local library is what survives.

## File Structure

```text
Clarity/
├── app/
│   ├── api/
│   │   ├── decode/route.ts
│   │   ├── retry-section/route.ts
│   │   ├── fetch-url/route.ts
│   │   └── share/
│   │       ├── route.ts
│   │       └── [id]/revoke/route.ts
│   ├── s/
│   │   └── [id]/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── audience-action.tsx
│   ├── command-palette.tsx
│   ├── concept-map.tsx
│   ├── library-drawer.tsx
│   ├── recovery-state.tsx
│   ├── result-cards.tsx
│   ├── share-dialog.tsx
│   ├── source-input.tsx
│   └── stale-badge.tsx
├── lib/
│   ├── ai.ts
│   ├── graph-schema.ts
│   ├── local-store.ts
│   ├── prompts.ts
│   ├── rate-budget.ts
│   ├── safe-url.ts
│   ├── share-store.ts
│   ├── tokens.ts
│   ├── types.ts
│   └── validation.ts
├── devpost/
├── public/
├── AGENTS.md
├── package.json
├── tsconfig.json
├── next.config.ts
├── eslint.config.mjs
├── postcss.config.mjs
├── .env
├── .env.example
├── .gitignore
└── README.md
```

## External Services and Dependencies

### Google AI Studio / Gemini API

- Purpose: generate the audience-aware four-section explanation and the concept graph.
- Endpoint: `POST https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`, wrapped by `@ai-sdk/google`.
- Auth: `GEMINI_API_KEY` or `GOOGLE_API_KEY` on the server. Never client-side.
- Input: model, `stream: true`, temperature, system and user messages.
- Output: OpenAI-compatible SSE chunks containing incremental assistant delta text.
- Cost: free tier subject to current quotas. Verify the selected model and account at setup; do not assume unlimited free usage.
- Privacy: source text is sent to the provider for generation. Do not add confidential documents to the demo without considering provider data policies.

### Vercel Hobby

- Purpose: host the Next.js application and the route handlers.
- Constraints: 4.5 MB request body limit on functions, 120-second proxied request timeout, 300-second function duration with Fluid Compute, personal and non-commercial use only.
- Free tier: 100 GB transfer, 1M function invocations per month, 100 deployments per day.
- Documentation: [Vercel Fluid Compute](https://vercel.com/docs/functions/fluid-compute).

### Neon Postgres

- Purpose: store shared decodes behind short links.
- Free tier: 0.5 GB storage, 100 compute-unit hours per month, 100 projects, scale-to-zero after five minutes idle, 5 GB public network transfer.
- Driver: `@neondatabase/serverless` for HTTP-mode queries.
- Documentation: [Neon serverless driver](https://neon.tech/docs/serverless/serverless-driver).
- Cost cap: writes fail when the storage limit is exceeded; no automatic charges.

### No Other Services

No authentication provider, no analytics, no error tracking service, no payment processor, and no CDN beyond Vercel's built-in edge network.

## Important Failure Modes

- **Empty or invalid request** → Return a clear validation response; the frontend keeps input and shows the empty-text message.
- **Slow upstream model** → Show disabled `Decoding...` plus four skeleton cards; keep the input editable.
- **Provider stream breaks mid-section** → Preserve completed cards and show an inline section error with section retry.
- **Provider unavailable before output** → Show a global retry state; preserve input and audience.
- **Malformed model markers** → Server treats the affected section as failed rather than displaying model control text; expose section retry.
- **Rate limit or quota response** → Convert to a calm retryable error and do not expose raw provider payloads.
- **Per-session budget exhausted** → Disable Decode, show reset time, and never call the model.
- **PDF too large for the browser** → Show a clear message explaining that the file exceeds the browser's safe parse limit and suggest pasting the relevant section as text.
- **PDF has no extractable text** → Explain that the PDF contains no readable text and that scanned PDFs are not supported.
- **Malformed graph JSON** → Keep the four cards and show a retryable Concept Map error.
- **Share limit reached** → Return `429` with a clear message; the client shows it in the share dialog.
- **Neon unavailable** → Share and shared views fail with a clear message; local decode and local library continue to work.
- **Database not configured in local development** → Share is hidden; the share routes return a `503` with a "sharing is not configured" message.

## What Was Simplified and Why

- **One Next.js app** instead of separate frontend and API deployments. Enough for the demo and keeps the Gemini key server-side.
- **No accounts** instead of user authentication. The local library and the browser-identity share limit give the account-like behavior a user actually wants without the account infrastructure.
- **Local-first persistence** instead of server-side user storage. The user's work stays on their machine unless they explicitly share it.
- **Client-side PDF parsing** instead of server-side parsing. Removes the serverless request-size and memory ceilings, works offline, and keeps file content on the user's machine.
- **Paragraph-level citations** instead of sentence-level citations. Meaningful trust without a hard prompt-engineering and layout problem in this phase.
- **AI SDK** instead of hand-written provider stream parsing. It handles the streaming protocol and leaves the application focused on rendering and recovery.
- **Fixed audience strings and tagged sections** instead of arbitrary prompts. Makes the demo behavior testable and keeps streaming parsing understandable.
- **Single shared decode table** instead of a full share schema. One table with a JSON payload is the smallest shape that supports a share link and can evolve without migrations.
- **Ten-share limit per browser identity** instead of per-account or per-IP limits. This is abuse prevention for a free, open-source, accountless tool, not security.

## Decisions and Open Issues

### Decisions

- **Direction:** Path A. Depth for one reader class first (researchers, developers, analysts, students who hit walls of dense text), rather than breadth across a platform. The three locked audiences are the tool's contract.
- **Deployment shape:** Local-first with cloud-on-demand share. The default path never touches a server beyond the Gemini call.
- **Provider:** Google Gemini API through Google AI Studio. Configured through `GEMINI_MODEL`.
- **Frontend:** Next.js App Router with TypeScript and Tailwind, chosen for a modern type-safe full-stack foundation.
- **API:** Next.js route handlers at the documented paths. tRPC is not used.
- **Validation:** Zod schemas at every route boundary.
- **Streaming:** Vercel AI SDK `streamText` with `@ai-sdk/google`.
- **Local storage:** IndexedDB via Dexie, holding decodes and the browser session identity.
- **Cloud storage:** Neon Postgres, holding only shared decodes.
- **File parsing:** Client-side, via `FileReader` and `pdfjs-dist` browser build. No server upload route exists.
- **Share:** Ten live shares per browser identity, tracked in `localStorage`, each revocable with a per-share delete token.
- **Motion:** `motion` library, with a designed motion language rather than ad-hoc transitions.
- **Secrets:** Environment variables only. `.env` is ignored; `.env.example` contains names and safe placeholders.

### One useful unknown

The interaction between Gemini's free-tier rate limits and a publicly deployed app is the largest operational risk. The per-browser decode budget (twenty per hour) is a mitigation, but not a guarantee, because the serverless function sees only the request, not the browser identity at the Gemini call. Verify the current Gemini free-tier request-per-minute and request-per-day limits during setup, and add a server-side rate limit keyed by IP if the browser budget is insufficient in practice.

### Open issues

- Select and verify the current Gemini model name during setup; keep it in `GEMINI_MODEL` so the provider model can change without a code rewrite.
- Confirm the current Gemini free-tier quota and any geographic or account restrictions before demo recording.
- Choose the exact maximum source text length during implementation after checking the selected model's context and rate limits.
- Decide whether citations should be paragraph-level (this spec) or sentence-level (stretch) once the first version of the citation UI is running and can be evaluated against real decode output.
- Decide whether a server-side per-IP rate limit is needed once the app is deployed and real traffic patterns are observable. The browser budget is the first line; the server limit is a second line only if needed.
