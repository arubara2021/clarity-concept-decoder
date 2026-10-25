<p align="center">
  <img src="./assets/banner.svg" alt="Clarity — understand anything, at your level" width="100%" />
</p>

<h1 align="center">Clarity</h1>

<p align="center"><strong>Understand anything, at your level.</strong></p>

<p align="center">
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white" alt="Next.js" /></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-000000?style=flat-square&logo=react&logoColor=white" alt="React" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-strict-000000?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind-v4-000000?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind" /></a>
  <a href="https://ai-sdk.dev"><img src="https://img.shields.io/badge/Vercel_AI_SDK-Gemini-000000?style=flat-square" alt="Vercel AI SDK" /></a>
  <a href="https://dexie.org"><img src="https://img.shields.io/badge/Storage-Dexie_IndexedDB-000000?style=flat-square" alt="Dexie" /></a>
</p>

---

Clarity is a local-first concept decoder. Paste dense text, drop a PDF, or extract a URL, and it rebuilds the material into four structured sections — a TL;DR, an analogy drawn from your world, a jargon buster, and one takeaway — plus an interactive concept graph. Every claim carries a paragraph citation that jumps to the exact source line.

Built for the **Devpost Build With AI: Basics** hackathon using the Devpost Learn Skill Pack.

---

## Why it exists

Dense text is written for people who already understand it. Summaries collapse the structure and lose the reasoning. Clarity keeps the structure and changes only the framing. The audience you choose is a contract, not a tone slider:

| Audience | Assumes | Explains |
|---|---|---|
| **Student** | No domain background | What and why, with analogies from daily life |
| **Executive** | Business literacy, no technical depth | So what and what to do, outcome over mechanism |
| **Developer (Non-ML)** | Software fluency, not ML fluency | How it works, analogies from systems and data |

---

## Flow

```mermaid
flowchart LR
    A[Paste text / PDF / URL] --> B[Choose audience]
    B --> C[Decode]
    C --> D[4 sections stream via SSE]
    C --> E[Concept graph]
    D --> F[(Local library - IndexedDB)]
    E --> F
    F --> G{Share?}
    G -- No --> H[Stays on device]
    G -- Yes --> I[(Neon Postgres)]
    I --> J[Read-only public link]
```

---

## Architecture

```mermaid
flowchart TB
    subgraph Client["Browser"]
      UI[Next.js App Router]
      Store[Zustand store]
      SSE[SSE parser]
      DB[(Dexie / IndexedDB)]
    end

    subgraph Server["Next.js server"]
      Decode[/api/decode/]
      Retry[/api/retry-section/]
      Fetch[/api/fetch-url/]
      ShareApi[/api/share/]
      Prompts[lib/prompts.ts]
      Model[Gemini via Vercel AI SDK]
    end

    subgraph Cloud["Optional"]
      Neon[(Neon Postgres)]
    end

    UI --> Store
    Store --> DB
    UI --> SSE
    SSE --> Decode
    SSE --> Retry
    UI --> Fetch
    UI --> ShareApi
    Decode --> Prompts
    Retry --> Prompts
    Prompts --> Model
    ShareApi --> Neon
```

### Decode sequence

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant B as Browser
    participant A as /api/decode
    participant M as Gemini

    U->>B: Paste source, choose audience
    B->>A: POST { text, audience }
    A-->>B: SSE: section-start (tldr)
    loop tldr, analogy, jargon, takeaway
        A->>M: buildSectionPrompt
        M-->>A: token stream
        A-->>B: SSE: token
        A-->>B: SSE: section-complete
    end
    A->>M: buildGraphPrompt
    M-->>A: JSON concept graph
    A-->>B: SSE: graph
    A-->>B: SSE: done
    B->>B: Persist to IndexedDB
```

### Data model

```mermaid
erDiagram
    LOCAL_DECODE {
      string  id PK
      number  createdAt
      string  title
      string  text
      string  audience
      json    sections
      json    graph
      json    share
    }

    SHARED_DECODE {
      string        id PK
      string        identity
      timestamptz   created_at
      jsonb         payload
      string        delete_token_hash
      int           views
    }

    LOCAL_DECODE ||--o| SHARED_DECODE : "optional publish"
```

---

## Features

**Audience-aware decoding.** Three contracts, three prompts. The audience changes what the model is allowed to assume, not just the adjectives.

**Source grounding.** Every sentence can carry a `[pN]` marker. The frontend turns markers into buttons. Clicking one opens the source panel, scrolls to that paragraph, and highlights it for 1.4 seconds.

**Interactive concept map.** React Flow with Dagre layout. Directed edges, bezier curves, glassmorphic inspector showing incoming and outgoing relationships per node.

**Local-first storage.** Decodes, rate budget, and session identity live in IndexedDB. PDF extraction runs in the browser via PDF.js. Nothing leaves the device until the user presses Share.

**Streaming everywhere.** SSE over a `ReadableStream`, one section at a time, tokens flushed on animation frame. Sections render progressively with skeletons that collapse as text arrives.

**Revocable sharing.** One decode, one row in Neon, one delete token. Revoke at any time. Ten shares per browser identity.

**SSRF-safe URL extraction.** DNS resolution, private-range rejection, manual redirect handling, 5 MB cap, 10 s timeout, HTML-only content type.

**Rate budget.** Twenty decodes per hour, enforced client-side, visible in `/settings`.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript, strict |
| Styling | Tailwind CSS v4 with CSS variables |
| State | Zustand with `subscribeWithSelector` |
| Animation | Motion (Framer Motion) |
| Local DB | Dexie (IndexedDB) |
| Cloud DB | Neon Postgres (serverless driver) |
| AI | Vercel AI SDK + Google Generative AI (Gemini) |
| Graph | React Flow + Dagre |
| Parsing | PDF.js, Mozilla Readability, JSDOM |
| Validation | Zod |

---

## Getting started

### Prerequisites

- Node.js 18 or newer
- npm
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)
- Optional: a Neon Postgres connection string for sharing

### Install

```bash
git clone https://github.com/arubara2021/clarity-concept-decoder.git
cd clarity-concept-decoder
npm install
```

### Environment

Two files, two purposes:

| File | Purpose | Committed |
|---|---|---|
| `.env` | Real values for local runs | No |
| `.env.example` | Placeholder template | Yes |

Copy the template and fill it in:

```bash
cp .env.example .env
```

`.env`:

```env
GEMINI_API_KEY=your_key_from_google_ai_studio
GEMINI_MODEL=gemini-2.5-flash-lite
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional — required only for the share feature
# DATABASE_URL=postgres://user:password@host/database
```

The app reads `.env` on startup. Do not create `.env.local`; it overrides `.env` and will shadow your real values with placeholders.

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm run test` | Vitest |

---

## Project structure

```text
app/
  api/decode/          SSE stream: four sections plus graph
  api/retry-section/   Regenerate a single section
  api/fetch-url/       Readability extraction behind an SSRF guard
  api/share/           Create and revoke public links
  decode/              Dual-pane workspace
  library/             Local IndexedDB library
  r/[id]/              Saved reading view
  r/[id]/map/          Full-bleed concept map
  s/[id]/              Public read-only share view
  settings/            Theme, budget, shortcuts
components/
  concept/             React Flow map and inspector
  decode/              Composer, toolbar, status bar, result cards
  landing/             Hero, canvas particle field, nav
  layout/              Header, theme toggle, logo mark
  overlays/            Command palette, share dialog
  ui/                  Button, Panel, Badge, Input, Textarea, Skeleton
lib/
  ai.ts                Gemini model factory
  local-store.ts       Dexie schema and CRUD
  prompts.ts           Prompt construction and paragraph numbering
  rate-budget.ts       Client rate limiting
  safe-url.ts          SSRF-safe fetcher
  share-store.ts       Neon persistence
  store.ts             Zustand store
  use-decode-stream.ts SSE parser and orchestration
assets/
  banner.svg           Animated README banner
```

---

## Planning docs

Built with the Devpost Learn Skill Pack. The three planning artifacts that drove this build sit at the repository root:

| File | Contents |
|---|---|
| [`scope.md`](./scope.md) | MVP boundaries and explicit non-goals |
| [`prd.md`](./prd.md) | Personas, requirements, the four-section output contract |
| [`spec.md`](./spec.md) | Store shape, SSE protocol, IndexedDB schema, prompt design |

---

## Prompt design

Each section prompt is assembled from four blocks:

```text
<role>        What the model is
<audience>    Which contract applies
<source>      Paragraph-numbered, budget-capped, marked untrusted
<task>        Section instruction plus format constraint
<constraints> Grounding, citation rule, injection defense
```

Three rules make the output usable:

1. **Paragraph numbering.** The source is split on blank lines and prefixed with `[P1]`, `[P2]`, and so on. The model cites with `[pN]`, which the UI parses.
2. **Injection boundary.** The source block opens with an explicit instruction that its contents are data, never directives.
3. **Format ceilings.** TL;DR is 25 words or fewer. Takeaway is 20. Jargon is a fixed arrow grammar with no prose. The model cannot drift into essay mode.

---

## License

MIT.

---

<p align="center">
  <sub>Built for Devpost Build With AI: Basics — October 2026</sub>
</p>