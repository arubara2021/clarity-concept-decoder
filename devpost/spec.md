---
doc: spec
status: approved
---
# Clarity - Technical Spec

## How This Works, In Plain Language

Clarity is a small Next.js application with three cooperating layers:

- The **React browser UI** displays the warm, single-page interface, keeps the current text and audience selection, renders skeletons and result cards, and reads the live stream of generated text.
- The **Next.js route handlers** validate requests with Zod, protect the Gemini API key, and use the Vercel AI SDK to turn model output into a browser-readable stream. The browser never receives the key.
- The **Gemini provider** turns the user's text plus the selected audience contract into four explanation sections. The route handler streams each section's text to the browser in order.
- The **file ingestion route** extracts text from TXT and digital PDF uploads, then returns it for user review.
- The **URL ingestion route** safely fetches public HTML, extracts readable text, and returns it for user review.
- The **graph layer** asks Gemini for structured concepts and relationships and renders them as an interactive Concept Map.

The user drops a file, pastes a public URL, or pastes text. Files go to `POST /api/upload`; URLs go to `POST /api/fetch-url`. The server extracts safe source text and returns it to the editable textarea. The user then clicks `Decode`; the client sends `{ text, audience }` to `POST /api/decode`. The route streams four explanation sections followed by graph data. `POST /api/retry-section` repeats the same path for one missing explanation section.

This shape keeps the project type-safe without adding a separate backend service: Next.js serves the UI and API from one app, TypeScript catches contract mistakes, Zod validates untrusted input, and the AI SDK handles provider streaming. The tradeoff is a little more framework setup than plain HTML, but it removes manual DOM plumbing and hand-written stream parsing.

## The Core Journey Through the System

Implements `prd.md > The Core Journey`.

1. Next.js renders `app/page.tsx`, with components styled by Tailwind CSS. The initial UI shows the input, three audience controls, `Decode`, and the empty results message.
2. The user pastes text and chooses one exact audience string: `Student`, `Executive`, or `Developer (Non-ML)`. React state stores the current values in page memory.
3. The user clicks `Decode`. The client validates that text is non-empty, disables the button, keeps the textarea editable, renders four skeleton cards, and calls the typed `decode` client against `POST /api/decode`.
4. The Next.js route validates the request with Zod and calls `streamText` with the audience-specific system instructions and source text. The Gemini API key is read from the server environment only.
5. The Vercel AI SDK streams model output through the route response. The client consumes the AI SDK stream and identifies the active section from the structured output contract. The API key never reaches the browser.
6. The result components fill the cards in the required order: `tldr`, `analogy`, `jargon`, `takeaway`. Completed cards remain visible while later sections stream.
7. On `done`, the browser restores `Decode`. If the user edits the source afterward, the browser keeps the current cards and adds the `Results out of date` badge.
8. If a section fails, the route returns a typed stream error for that section. The browser preserves completed cards and turns only the active card into a retry card. `Retry this section` sends the original current request plus the section name to `/api/retry-section`.
9. If the whole service is unavailable, the browser renders one global error state while preserving the source and selected audience.

## Stack

- **Framework:** Next.js App Router, with UI and server route handlers in one TypeScript project.
- **Language:** TypeScript with strict mode enabled.
- **API contracts:** tRPC is intentionally not used for the two streaming endpoints. Next.js route handlers provide the literal `/api/decode` and `/api/retry-section` paths required by the product, while shared TypeScript types and Zod schemas keep their request contracts type-safe.
- **Validation:** Zod schemas validate every route body before any model call.
- **AI integration:** Vercel AI SDK `streamText` with `@ai-sdk/google` and a configurable Gemini model.
- **Styling:** Tailwind CSS with CSS variables for the warm charcoal design tokens.
- **File extraction:** `pdf-parse` for digital PDF text and native UTF-8 decoding for TXT files.
- **URL extraction:** server-side `fetch` plus an HTML readability parser, with SSRF, redirect, size, timeout, and content-type guards.
- **Graph:** React Flow for draggable nodes and edges.
- **Model:** Configurable through `GEMINI_MODEL`; verify a current fast Gemini model during setup rather than assuming availability.

Documentation:

- [Next.js App Router](https://nextjs.org/docs/app)
- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [tRPC](https://trpc.io/docs/) (evaluated, but not used for streaming routes)
- [Zod](https://zod.dev/)
- [Vercel AI SDK](https://ai-sdk.dev/docs)
- [AI SDK `streamText`](https://ai-sdk.dev/docs/reference/ai-sdk-core/stream-text)
- [Google provider](https://ai-sdk.dev/providers/ai-sdk-providers/google-generative-ai)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [pdf-parse](https://www.npmjs.com/package/pdf-parse)
- [React Flow](https://reactflow.dev/)
- [Gemini OpenAI compatibility](https://ai.google.dev/gemini-api/docs/openai)
- [Gemini API keys](https://ai.google.dev/gemini-api/docs/api-key)
- [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing)
- [Gemini rate limits](https://ai.google.dev/gemini-api/docs/rate-limits)

The official Gemini documentation currently shows this base URL and streaming shape:

`https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`

with `stream: true`, a bearer API key, and a configurable Gemini model. Free-tier eligibility, quotas, model names, and billing rules can change, so the build should verify the selected account and model before implementation. This spec does not assume that a student account guarantees unlimited or permanently free usage.

## Where It Runs and How Someone Tries It

The app runs locally with the Next.js development server. A browser talks to Next.js route handlers; those handlers talk to Gemini.

Required environment variables:

```dotenv
GEMINI_API_KEY=replace-with-a-new-key-from-google-ai-studio
GEMINI_MODEL=replace-with-a-current-fast-gemini-model
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`GOOGLE_API_KEY` may be accepted as a fallback because Google's documentation supports it, but `GEMINI_API_KEY` is the project-standard name. Never place either key in frontend files, HTML, JavaScript bundles, screenshots, or Git history.

Planned commands:

```text
npm install
npm run dev
```

Then open `http://localhost:3000` and demonstrate:

1. Paste the supplied machine-learning paragraph.
2. Select `Developer (Non-ML)`.
3. Click `Decode`.
4. Show the immediate skeletons, ordered streaming cards, and final takeaway.
5. Optionally demonstrate editing the source to show `Results out of date`.

A local run is sufficient for the required short demo video and public GitHub repository. Deployment remains optional for the hackathon, while production hosting can be added after the ingestion and graph behavior are verified.

## Look and Feel

Implements `prd.md > Look and Feel`.

- CSS variables define the warm near-black background, warm charcoal surfaces, subtle borders, soft off-white text, muted warm-grey secondary text, and one amber accent.
- Amber is used only for the logo mark, active audience, and `Decode` action.
- Layout is a calm single page: header, input surface, audience/action row, then results.
- Use a clean sans-serif UI font, readable line-height, constrained result paragraphs, and a larger/bolder takeaway.
- Skeletons use neutral warm-charcoal contrast and a restrained shimmer. Avoid gradients, glow, neon, purple, pure black, and pure white.
- Error surfaces use the PRD's calm red-tinted treatment, which is a semantic failure state rather than part of the brand palette.

## Components

### Next.js Page Shell

Serves the header, tagline, textarea, audience controls, action button, and results region.

Files: `app/page.tsx`, `app/globals.css`, and UI components under `components/`.

Implements `prd.md > Screens and Layout`.

### Input and Audience Controller

Client components own the current text, selected audience, request status, and stale-results flag. They validate empty input, keep the textarea editable during requests, and mark results stale after edits.

Implements `prd.md > Features and Behavior > Text Input` and `prd.md > Features and Behavior > Audience Selection`.

### Decode Stream Reader

The client calls `POST /api/decode` with `fetch` and consumes the AI SDK data stream. It uses the SDK's stream utilities rather than manually splitting provider SSE frames. `EventSource` is not used because the routes need JSON request bodies.

Implements `prd.md > Features and Behavior > Decode and Streaming Results`.

### Result Cards

React result components render four stable cards: `tldr`, `analogy`, `jargon`, and `takeaway`. Each card supports skeleton, streaming, complete, and section-error states. Jargon items render as term/translation pairs; other sections render constrained text.

Implements `prd.md > Screens and Layout`, `prd.md > Features and Behavior > Decode and Streaming Results`, and `prd.md > Features and Behavior > Partial Recovery`.

### Recovery Controls

Client components render `Retry this section`, `Retry full decode`, and global `Try again` controls. Retry requests reuse the input and selected audience currently held in page memory. A section retry replaces only that section's error state.

Implements `prd.md > Features and Behavior > Partial Recovery` and `prd.md > Features and Behavior > Global Failure`.

### Next.js Route Handlers

`app/api/decode/route.ts` and `app/api/retry-section/route.ts` parse request bodies, run Zod validation, call the AI service, and return streaming responses. Next.js serves the page and these handlers from the same application.

Implements `prd.md > Screens and Layout` and the server side of every `prd.md > Features and Behavior` section.

### Zod Request Schemas

`lib/validation.ts` validates that `text` is a bounded non-empty string, `audience` is one of the three exact allowed strings, and `section` is one of `tldr`, `analogy`, `jargon`, or `takeaway` for retry requests. Invalid requests return typed JSON errors before an upstream model call begins.

Implements `prd.md > States and Boundaries`.

### Audience Prompt Builder

`lib/prompts.ts` builds the system message from the exact audience contract and requested output contract. For a full decode, the prompt requires four structured sections in order. For a retry, it requests only the named section and preserves the same audience instruction.

The prompt must tell the model:

- Preserve the source's central meaning and important nuance.
- Do not invent claims absent from the source.
- Match the selected audience tone.
- Emit only the agreed section markers and content, without commentary.
- Make TL;DR one sentence and takeaway one boldable sentence.
- Make jargon output a simple list of term/translation pairs.

Implements `prd.md > Features and Behavior > Audience Selection` and `prd.md > Features and Behavior > Decode and Streaming Results`.

### AI SDK Gemini Stream

`lib/ai.ts` configures `@ai-sdk/google` and calls `streamText`. The route converts the AI SDK result into a browser stream and maps provider failures to a section error or global error without exposing provider details or secrets.

Implements `prd.md > Features and Behavior > Streaming Results`, `prd.md > Features and Behavior > Partial Recovery`, and `prd.md > Features and Behavior > Global Failure`.

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
event: done
data: {}
```

The same sequence repeats for `analogy`, `jargon`, and `takeaway`. Error example:

```text
event: section-error
data: {"section":"jargon","message":"This section couldn't be generated. The connection may have dropped."}
```

If validation fails before streaming, return `400 application/json` with `{ "error": "..." }`. If the provider is unavailable before a section can start, return a streamable global error event or a `502` JSON error, depending on whether response headers have already been sent.

### `POST /api/retry-section`

Request:

```json
{
  "text": "Dense source text...",
  "audience": "Developer (Non-ML)",
  "section": "jargon"
}
```

Response: `200 text/event-stream` containing `section-start`, `token`, `section-complete`, and `done` for only the requested section. It uses the same validation and provider error rules as `/decode`.

### AI SDK Provider Request

Server-only provider configuration:

```json
{
  "model": "${GEMINI_MODEL}",
  "temperature": 0.2
}
```

`streamText` receives the system and user messages, sets the model from `@ai-sdk/google`, and returns the stream response. Authentication is handled by the server-side provider key. The model name is configuration, not a frontend input.

## Data Model

There is no database. Data lives in browser memory for the current page session and in local variables for the duration of each request.

```text
PageState {
  text: string
  audience: "Student" | "Executive" | "Developer (Non-ML)"
  results: {
    tldr: string,
    analogy: string,
    jargon: Array<{ term: string, explanation: string }>,
    takeaway: string
  }
  cardStates: "empty" | "skeleton" | "streaming" | "complete" | "error"
  isDecoding: boolean
  isStale: boolean
  globalError: string | null
}
```

- `text` and `audience` are updated by input controls and are never cleared by errors.
- `results` updates as token events arrive; completed sections are not replaced by later failures.
- `cardStates` drives visible skeleton, streaming, success, and recovery UI.
- Leaving or refreshing the page discards everything. Persistence remains outside this release boundary.
- The server does not persist source text or generated content after a request ends.

## File Structure

```text
Clarity/
├── app/
│   ├── api/
│   │   ├── decode/route.ts          # Full streaming decode endpoint
│   │   └── retry-section/route.ts   # Single-section retry endpoint
│   ├── globals.css                  # Tailwind layers and design tokens
│   ├── layout.tsx                   # Root metadata and shell
│   └── page.tsx                     # Main Clarity page
├── components/
│   ├── clarity-input.tsx            # Textarea, audience controls, Decode
│   ├── result-cards.tsx             # Four progressive result cards
│   └── recovery-state.tsx           # Section and global retry UI
├── lib/
│   ├── ai.ts                        # Gemini model and streamText setup
│   ├── prompts.ts                   # Audience-aware prompt builders
│   ├── types.ts                     # Shared result and audience types
│   └── validation.ts                # Zod request schemas
├── package.json                     # Scripts and dependencies
├── tsconfig.json                    # Strict TypeScript configuration
├── tailwind.config.ts               # Tailwind content and tokens
├── postcss.config.mjs              # Tailwind PostCSS integration
├── package-lock.json       # Reproducible dependency versions
├── .env.example            # Secret-free variable names and safe placeholders
├── .env                    # Local secret values; ignored and never committed
├── .gitignore              # Ignores secrets and learner profile
└── devpost/
    ├── learner-profile.md
    ├── scope.md
    ├── scope.html
    ├── prd.md
    ├── prd.html
    ├── spec.md
    └── spec.html
```

## External Services and Dependencies

### Google AI Studio / Gemini API

- Purpose: generate the audience-aware four-section explanation.
- Documentation: [OpenAI compatibility](https://ai.google.dev/gemini-api/docs/openai), [API keys](https://ai.google.dev/gemini-api/docs/api-key), [pricing](https://ai.google.dev/gemini-api/docs/pricing), [rate limits](https://ai.google.dev/gemini-api/docs/rate-limits).
- Endpoint: `POST https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`.
- Auth: `GEMINI_API_KEY` or `GOOGLE_API_KEY` on the server. Never client-side.
- Input: model, `stream: true`, temperature, system message, and user message.
- Output: OpenAI-compatible SSE chunks containing incremental assistant delta text.
- Cost and quotas: use the current free tier if the selected model/account supports it. Verify current pricing, rate limits, and model availability during setup; do not assume “free” means unlimited.
- Privacy: source text is sent to the external provider for generation. Do not add confidential documents to the demo without considering provider data policies.

### Next.js and AI SDK

- Purpose: render the app, expose the two route handlers, and stream Gemini output through AI SDK.
- Dependencies: `next`, `react`, `react-dom`, `ai`, `@ai-sdk/google`, `zod`, `tailwindcss`, `typescript`.
- No external account or persistence service.

## Important Failure Modes

- **Empty or invalid request** -> Return a clear validation response; frontend keeps input and shows the gentle empty-text message.
- **Slow upstream model** -> Show disabled `Decoding...` plus four skeleton cards; keep input editable.
- **Provider stream breaks mid-section** -> Preserve complete cards and show an inline section error with section retry.
- **Provider unavailable before output** -> Show global retry state; preserve input and audience.
- **Malformed model markers** -> Server treats the affected section as failed rather than displaying model control text; expose section retry.
- **Rate limit or quota response** -> Convert to a calm retryable error and do not expose raw provider payloads.

## What Was Simplified and Why

- **One Next.js app** instead of separate frontend and API deployments - enough for a local demo and keeps the key server-side.
- **No database** instead of saved history - the PRD's proof is the decode transition, not document management.
- **AI SDK** instead of hand-written provider stream parsing - it handles the streaming protocol and leaves the application focused on section rendering and recovery.
- **Fixed audience strings and tagged sections** instead of arbitrary prompts or schema design - makes the demo behavior testable and keeps streaming parsing understandable.
- **Single-file ingestion** instead of batch uploads and document libraries - proves the new file path without adding document management.

## Decisions and Open Issues

### Decisions

- **Provider:** Google Gemini API through Google AI Studio, replacing retired GitHub Models. The learner chose it to keep the project free and compatible with the existing chat-completions/SSE shape.
- **Frontend:** Next.js App Router with TypeScript and Tailwind, because the learner chose a modern type-safe full-stack foundation.
- **API:** Next.js route handlers at `/api/decode` and `/api/retry-section`, because AI SDK streaming needs a direct response stream. tRPC was evaluated but intentionally omitted from these routes to avoid wrapping a stream in a second transport layer.
- **Validation:** Zod schemas at every route boundary, because all browser input is untrusted.
- **Streaming:** Vercel AI SDK `streamText` with `@ai-sdk/google`, because it handles provider streaming and keeps the provider swappable.
- **Storage:** None; page memory only.
- **Secrets:** Environment variables only; the repository ignores `.env` and permits a secret-free `.env.example`.

### One useful unknown

The main technical uncertainty is whether the selected Gemini model/account combination supports the required streaming behavior and quota in the free tier. The first build step should verify the account, create a fresh restricted key, list or confirm an available fast model, and run one minimal streaming request before building the full UI pipeline.

### Open issues

- Select and verify the current Gemini model name during setup; keep it in `GEMINI_MODEL` so the provider model can change without a code rewrite.
- Confirm the provider's current free-tier quota and any geographic/account restrictions before demo recording.
- Choose the exact maximum input length during implementation after checking the selected model's context and rate limits. This is inherited from `prd.md > Open Questions` and does not change the product behavior.

## Scope Change Addendum: File Ingestion and Concept Map

### File Ingestion Route

`app/api/upload/route.ts` accepts `multipart/form-data` with a `file` field. It accepts only `.txt` and `.pdf`, enforces a configured size limit, reads TXT bytes as UTF-8, and passes digital PDF bytes to `pdf-parse`. It returns extracted text and filename metadata without calling Gemini. The client replaces the textarea only after extraction succeeds.

Implements `prd.md > Features and Behavior > File Ingestion`.

### Concept Map Renderer

`components/concept-map.tsx` renders validated nodes and edges with React Flow. Nodes are draggable, the canvas supports pan and zoom, and relationship labels remain readable. Empty graph data and graph failure have explicit states that leave the four explanation cards usable.

Implements `prd.md > Features and Behavior > Concept Map`.

### Graph Data Contract

The existing `POST /api/decode` stream emits a `graph` event after the four explanation sections and before `done`:

```text
event: graph
data: {"nodes":[{"id":"orthogonal","label":"Orthogonal Latent Representations"}],"edges":[{"id":"orthogonal-disentangle","source":"orthogonal","target":"disentangle","label":"supports"}]}
```

The graph prompt requires stable node IDs, human-readable labels, valid edge references, and concise relationship labels. `lib/graph-schema.ts` validates the payload before React Flow receives it. Malformed or oversized graph data becomes a graph-specific error instead of breaking the result cards.

### New API Contract

`POST /api/upload` receives a file field and returns:

```json
{
  "text": "Extracted source text...",
  "filename": "paper.pdf",
  "pageCount": 4
}
```

Unsupported, unreadable, or oversized files return a safe client error. Uploaded bytes are processed in memory and are not persisted.

### Scope-Change File Structure

```text
app/api/upload/route.ts       # TXT/PDF extraction route
app/api/fetch-url/route.ts    # Safe public HTML extraction route
components/file-dropzone.tsx # Drag/drop and picker UI
components/concept-map.tsx   # React Flow graph
lib/graph-schema.ts           # Node and edge validation
```

### Scope-Change Dependencies

- `pdf-parse` extracts text from digital PDFs; it does not provide OCR for scanned documents.
- The HTML readability parser extracts public page content; it does not bypass authentication or paywalls.
- `reactflow` renders the interactive graph; Gemini remains responsible for producing the concept and relationship data.

### Scope-Change Failure Modes

- Unsupported or oversized file -> reject before extraction, preserve current text, and show a recoverable upload error.
- Unsafe, private, redirected, oversized, or non-HTML URL -> reject before parsing, preserve current text, and show a recoverable URL error.
- Encrypted or image-only PDF -> explain that no extractable text was found; do not clear the input.
- Malformed graph JSON -> keep the four cards and show a retryable Concept Map error.
- Excessive graph size -> reject or trim through schema limits so the UI remains usable.

### URL Ingestion Addendum

`app/api/fetch-url/route.ts` accepts a public `http` or `https` URL, validates the hostname and resolved IP address against private-network ranges, follows only safe redirects, enforces response size and timeout limits, requires an HTML content type, and extracts readable page text. It returns text plus source URL metadata without calling Gemini.

Request:

```json
{ "url": "https://example.com/public-article" }
```

Response:

```json
{ "text": "Readable page text...", "url": "https://example.com/public-article", "title": "Article title" }
```

The route rejects unsafe schemes, private destinations, authentication pages, non-HTML content, oversized responses, excessive redirects, and timeouts. The HTML readability parser does not bypass authentication or paywalls. Implements `prd.md > Features and Behavior > URL Ingestion`.
