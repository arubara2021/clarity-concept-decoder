# Clarity

**Understand anything, at your level.**

Clarity is a local-first concept decoder that transforms dense, complex text into a structured mental model. Instead of providing a generic summary, Clarity rebuilds the explanation into four distinct sections—a TL;DR, a concrete analogy, a jargon buster, and a core takeaway—tailored specifically to the reader's background. Every claim is grounded in the source material with paragraph-level citations, and the relationships between ideas are mapped in an interactive concept graph.

Built for the **Build With AI: Basics** hackathon, this project demonstrates how to use the Devpost Learn Skill Pack to plan, architect, and build a production-grade application from an empty folder.

---

## Core Features

### 1. Audience-Aware Decoding
The audience is not a simple filter; it is a strict contract that dictates the tone, depth, and analogies used by the language model.
* **Student:** Warm, analogy-heavy, assumes no domain background.
* **Executive:** Crisp, outcome-focused, assumes business literacy.
* **Developer (Non-ML):** Technically precise, draws analogies from systems and data structures.

### 2. Source-Grounded Citations
Hallucinations are mitigated by forcing the model to append `[pN]` markers to every claim. The frontend parses these markers into interactive citation buttons. Clicking a marker smoothly scrolls the source panel to the exact paragraph and highlights it, providing immediate visual proof of the claim's origin.

### 3. Interactive Concept Mapping
Using React Flow and Dagre, Clarity extracts a directed graph of concepts from the source. Nodes are laid out hierarchically, edges are drawn with bezier curves, and selecting a node opens a glassmorphic inspector panel detailing its incoming and outgoing relationships.

### 4. Local-First Privacy Architecture
Your data never leaves your machine unless you explicitly choose to share it.
* **Storage:** All decodes, library metadata, and rate-limit budgets are stored locally in the browser using IndexedDB via Dexie.
* **Extraction:** PDF parsing happens entirely on the client using PDF.js.
* **Sharing:** Only when a user clicks "Share" is a single decode payload sent to a Neon Postgres database, generating a revocable, read-only link.

---

## Motion Design & Animation System

Clarity relies on a rigid, spring-based physics engine powered by Framer Motion to create a tactile, spatial interface.

* **Spring Physics:** Almost all interactive elements use custom spring configurations (e.g., `stiffness: 460, damping: 34`) rather than linear easing. This gives buttons, panels, and layout shifts a sense of physical mass and momentum.
* **Layout Animations:** The workspace uses `layoutId` and `layout` props to seamlessly morph elements between states. When a decode completes, the skeleton loaders smoothly crossfade into the final text without layout jank.
* **Staggered Reveals:** Result cards and library items enter the viewport with calculated stagger delays (`delay: index * 0.04`), creating a cascading waterfall effect that guides the user's eye.
* **Hero Canvas:** The landing page features a custom HTML5 Canvas particle system. In dark mode, particles orbit a central void with gravitational pull and linking lines. In light mode, the system shifts to an eclipse strategy with subtle vignettes and muted node halos, responding to pointer movement with parallax depth.
* **Magnetic Interactions:** Primary call-to-action buttons employ magnetic hover effects, where the button physically translates toward the user's cursor based on pointer proximity, calculated via `useMotionValue` and `useSpring`.

---

## Tech Stack

* **Framework:** Next.js 16 (App Router, Turbopack)
* **Language:** TypeScript (Strict Mode)
* **Styling:** Tailwind CSS v4, CSS Variables for dynamic theming
* **State Management:** Zustand (with `subscribeWithSelector` middleware)
* **Animations:** Framer Motion
* **Database (Local):** Dexie.js (IndexedDB wrapper)
* **Database (Cloud):** Neon Postgres (Serverless)
* **AI SDK:** Vercel AI SDK, Google Generative AI (Gemini)
* **Graphing:** React Flow, Dagre
* **Parsing:** PDF.js, Mozilla Readability, JSDOM

---

## The Build Process

This project was built using the **Devpost Learn Skill Pack**. Instead of writing code immediately, the development cycle began by letting the AI interview the project requirements to generate three foundational documents:

1. **`scope.md`**: Defined the boundaries of the MVP, explicitly listing what would *not* be built to prevent scope creep.
2. **`prd.md`**: Outlined the product requirements, user personas, and the exact four-section output contract.
3. **`spec.md`**: Detailed the technical architecture, including the Zustand store shape, the SSE streaming protocol, and the IndexedDB schema.

This "plan before you build" methodology ensured that the AI coding agent remained focused and did not generate disconnected or hallucinated features.

---

## Local Setup

### Prerequisites
* Node.js 18+ 
* npm
* A Google AI Studio API Key (for Gemini)
* (Optional) A Neon Postgres connection string for the sharing feature

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/arubara2021/clarity-concept-decoder.git
   cd clarity-concept-decoder
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory and add your environment variables:
   ```env
   GEMINI_API_KEY=your_google_ai_api_key_here
   GEMINI_MODEL=gemini-1.5-flash-latest
   
   # Optional: Only required if you want to test the cloud sharing feature
   DATABASE_URL=your_neon_postgres_connection_string
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

* `npm run dev`: Starts the Next.js development server with Turbopack.
* `npm run build`: Creates an optimized production build.
* `npm run start`: Runs the production server.
* `npm run lint`: Runs ESLint with the custom Next.js configuration.
* `npm run typecheck`: Runs the TypeScript compiler in `noEmit` mode to verify type safety.
* `npm run test`: Runs the Vitest test suite.

---

## Project Structure

```text
app/
  api/           # Serverless routes for AI streaming, URL extraction, and sharing
  decode/        # The main dual-pane workspace interface
  library/       # The local IndexedDB library view
  r/[id]/        # The reading view for saved decodes
  s/[id]/        # The public read-only shared view
  settings/      # Theme, budget, and shortcut preferences
components/
  concept/       # React Flow concept map and inspector drawer
  decode/        # Workspace shell, source composer, result cards, and status bar
  landing/       # Hero section, canvas background, and marketing components
  layout/        # Global header, theme toggle, and logo mark
  overlays/      # Command palette (Cmd+K) and share dialog
  ui/            # Primitive components (Button, Panel, Badge, Skeleton)
lib/
  ai.ts          # Gemini model initialization
  local-store.ts # Dexie database definitions and CRUD operations
  prompts.ts     # System prompt engineering and paragraph numbering
  rate-budget.ts # Local storage rate limiting logic
  store.ts       # Zustand global state definition
  use-decode-stream.ts # Custom hook for parsing Server-Sent Events (SSE)
```

---

## License & Acknowledgments

Built for the Devpost **Build With AI: Basics** Hackathon. 
Special thanks to the Devpost Learn Skill Pack for providing the architectural scaffolding and planning methodology.
