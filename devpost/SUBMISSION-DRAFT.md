# Clarity — Devpost Submission Draft

Hackathon: Build With AI: Basics (Devpost Learn)
Deadline: 27 Oct 2026, 2:30 AM GMT+5:30
Repository: https://github.com/arubara2021/clarity-concept-decoder
Builder: arubara2021
Status: Code complete, lint clean, typecheck clean, production build green. Submission blocked only on demo video recording.

---

## Section 1 — Exact Form Fields (copy these into Devpost)

### Project Name
Clarity

### Tagline
Understand anything, at your level.

### Repository URL
https://github.com/arubara2021/clarity-concept-decoder

### Demo Video URL
[PASTE YOUR YOUTUBE / VIMEO / LOOM LINK HERE AFTER RECORDING — shot list in Section 4]

### Live Demo URL (optional)
[Leave blank, or deploy to Vercel. The app is fully functional locally with no database; sharing features activate only when DATABASE_URL is set.]

### Built With (select these tags on Devpost)
Next.js, React, TypeScript, Tailwind CSS, Framer Motion, Vercel AI SDK, Google Gemini, Neon Postgres, Dexie (IndexedDB), React Flow, Zod, Radix UI, cmdk, PDF.js, Mozilla Readability

---

## Section 2 — Main Description (paste into the description box)

### What it does

Clarity is a local-first concept decoder. You paste dense text, drop a PDF, or link a public article, and Clarity rebuilds the explanation into a structured mental model instead of a wall of summary:

1. TL;DR — the central idea in one sentence, paraphrased in the reader's own language.
2. The Analogy — one concrete comparison drawn from the reader's world, never the source's domain.
3. Jargon Buster — every load-bearing technical term, copied exactly from the source, translated plainly.
4. The One Thing to Remember — a single takeaway that does not reuse the source's phrasing.
5. Concept Map — an interactive graph of how the ideas connect, with labeled, directional relationships.

Before any of this, you choose who the explanation is for: Student, Executive, or Developer (Non-ML). The audience is not a cosmetic filter. It is a strict contract embedded in the system prompt that changes tone, depth, and the kind of analogies the model is allowed to use. The same source produces three genuinely different explanations.

Every claim carries a paragraph-level citation. The model is instructed to append [pN] markers to sentences that trace to a specific paragraph of the numbered source. The frontend parses those markers (including grouped lists like [p2, p5, p7]) into superscript chips. Clicking one opens the original source and scrolls to, then flashes, the exact paragraph that supports the claim. Understanding you can audit.

### The problem it solves

Summarizers compress text. They do not build understanding. A researcher reading outside their subfield, a developer reading a dense RFC, an analyst reading a financial filing, a student reading a difficult paper — none of them need fewer words. They need the same words reorganized into a model they can hold: what matters, what it is like, what the jargon means, what to remember, and how the pieces connect. Generic LLM chat gives you prose that feels helpful and is unverifiable. Clarity gives you a fixed contract of four sections plus a graph, all grounded in the source and citable to the paragraph.

### Who it is for

- Researchers and students reading dense material outside their comfort zone.
- Software engineers reading RFCs, postmortems, and architecture docs.
- Analysts and executives who need the shape of a document, not its length.
- Anyone who has ever highlighted an entire PDF and understood none of it.

### How it works (user flow)

1. Ingest. Paste text, drop a PDF or TXT (parsed entirely in the browser with PDF.js, so file bytes never leave the machine), or paste a public URL (extracted server-side with Mozilla Readability behind an SSRF-guarded fetcher).
2. Choose an audience. Student, Executive, or Developer (Non-ML). The contract line under the selector tells you exactly what each promise means.
3. Decode. Press the dock button or hit Enter. The source dims, a signature line draws across the output canvas, and the four sections stream in token by token over Server-Sent Events, each with a breathing skeleton and a live caret until it completes.
4. Audit. Click any citation chip to jump to the supporting paragraph. Open the concept map, drag nodes, click one to inspect its incoming and outgoing relationships.
5. Keep it. Every decode is saved automatically to a private local library in IndexedDB. Search it, sort it, rename entries, bulk-delete, or reopen any decode in a calm reading view.
6. Share (optional). One click creates a revocable, read-only link stored as a single row in Neon Postgres. Ten live shares per browser. Revoke anytime with the delete token. Nothing else from your library is ever uploaded.

### Core features

- Audience-contract prompting: three locked audience labels, three distinct explanation contracts, enforced in the system prompt with tone, depth, and analogy-source rules.
- Source-grounded citations: paragraph numbering injected into every prompt, marker parsing for single and grouped citations, click-to-scroll with a highlight flash in the collapsible source panel.
- Streaming decode with recovery: SSE protocol with section-start, token, section-complete, section-error, graph, graph-error, global-error, and done events. A mid-stream failure preserves every completed card and offers retry-this-section or retry-full-decode. Completed work is never lost.
- Interactive concept map: React Flow with dagre hierarchical layout, custom constellation nodes and edges, draw-in path animations, animated dash flow on selection, dimming of unrelated nodes, and a floating glass inspector panel.
- Local-first library: IndexedDB via Dexie with live queries, grid and list views, search across titles and source text, shared/private filters, sort cycling, bulk selection with two-step delete, inline rename, and a rate-budget meter.
- Privacy boundary: PDF parsing client-side, library client-side, budget client-side. The only server round-trips are model streaming, URL extraction, and explicit sharing.
- Rate budget: 20 decodes per rolling hour, enforced locally, visible in the status bar and settings, with a reset control.
- Command palette: Cmd/Ctrl+K opens a cmdk palette covering focus source, decode, clear result, audience switching, navigation, and share actions. Enter decodes from anywhere outside editable fields.
- Motion system: spring-physics interactions throughout, layout animations for state morphs, staggered card reveals, a canvas particle hero with per-theme strategies (black-hole void in dark, eclipse rings in light), magnetic dock button, and word-reveal headlines. All transform animation collapses under prefers-reduced-motion.
- Theme system: light, dark, and system modes driven by CSS custom properties, with a monochrome identity (black-hole dark, paper-white light) and an eclipse logo mark.
- Production safety: branded route and global error boundaries, 404 surface, Zod validation on every route, SSRF protection on URL fetch (protocol allowlist, private IPv4/IPv6 rejection, redirect cap, byte cap, timeout), and hashed delete tokens for share revocation.

### How we built it

We built Clarity with the Devpost Learn Skill Pack inside a coding agent, and we followed its core discipline: plan before code. The agent interviewed us about the idea first and generated scope.md (what is in, what is explicitly out), prd.md (personas, the four-section output contract, citation requirement, recovery behavior, share limits), and spec.md (store shape, SSE protocol, IndexedDB and Neon schemas, prompt architecture) before a single component was written. Those documents live in the devpost/ folder of the repository, and devpost/checklist.md tracks every build slice to completion.

The stack is Next.js 16 (App Router, Turbopack) with TypeScript in strict mode, Tailwind CSS v4 on a CSS-variable token system, and Framer Motion for the spring-based motion language. State is a single Zustand store with subscribeWithSelector. Streaming uses the Vercel AI SDK against Google Gemini, with a custom SSE parser and requestAnimationFrame-batched token flushing so the UI stays smooth under fast token streams. The concept graph is validated with a Zod schema that enforces referential integrity between nodes and edges before it ever reaches React Flow.

### What we learned

- Planning artifacts are the real product of an AI build. The scope, PRD, and spec stopped the agent from drifting into disconnected features. Every later decision (locked audience labels, the citation contract, the share limit of ten) traces back to a line in those documents.
- Streaming is a design problem, not just a transport problem. Token batching, reserved card heights, breathing skeletons, and per-section recovery states matter more to perceived quality than raw model speed.
- Grounding is a prompt-and-parse partnership. Telling the model to cite paragraphs is half the work; the other half is a tolerant frontend parser that handles grouped markers and turns them into auditable UI.
- Local-first changes the trust conversation. When the library, budget, and PDF parsing all live in the browser, "private by default" is an architecture fact, not a policy page.
- Reduced motion and error states are features. Designing the collapse path for animation and the recovery path for failure is what separates a demo from a product.

---

## Section 3 — Judging Criteria Alignment (internal notes, do not paste)

### Design
Complete product experience, not a technical proof: seven surfaces (landing, decode workspace, reading view, concept map view, library, settings, shared view), a consistent monochrome design system with light/dark parity, a documented motion language, keyboard-first control, recovery states for every failure mode, and branded error boundaries. The workspace is a dual-pane instrument with independent scrolling, a sticky status dock, and a single sticky document bar in the reading view.

### Innovation / Idea
Differs from summarizers and chat wrappers in three concrete ways: (1) the audience is a contract, not a filter — the same source yields structurally different explanations; (2) citations are first-class UI — every claim is auditable to a paragraph with one click; (3) local-first privacy with an explicit, revocable share boundary — the default is that nothing leaves the machine. The decode transition (source dim, signature line draw, staggered card rise) is a designed moment, not a loading spinner.

### Presentation
The demo video (Section 4) shows the full loop end to end on real input: ingest, audience switch, streaming decode, citation audit, concept map inspection, library persistence, theme switch, share and revoke. The pitch leads with the problem (summaries are not understanding), names the audience, and closes on the privacy model.

---

## Section 4 — Demo Video Shot List (90 to 150 seconds)

Record at 1920x1080 or higher, dark mode, browser chrome hidden or minimal. Speak or caption each beat.

0:00 to 0:08 — Hook. Landing hero in dark mode. Line: "Dense text in. A mental model out. This is Clarity."
0:08 to 0:20 — Ingest. On /decode, drag a PDF onto the left canvas. Show the extraction progress hairline and the extracted-text badge. Mention: parsed in the browser, bytes never leave the machine.
0:20 to 0:30 — Audience. Switch Student to Developer (Non-ML). Read the contract line aloud or let it sit one second on screen.
0:30 to 0:50 — The signature moment. Press Decode. Capture the source dimming, the signature line drawing across the output canvas, and all four sections streaming with skeletons and carets. Do not cut away mid-stream.
0:50 to 1:05 — Trust layer. Click a citation chip in the TL;DR. Show the source panel opening, scrolling, and flashing the paragraph. Then open the concept map, drag one node, click another to open the inspector.
1:05 to 1:20 — Persistence and theme. Open the library, show the saved entry, rename it inline, toggle light mode, and show the same workspace in paper-white with the eclipse canvas strategy.
1:20 to 1:35 — Share boundary. Open the share dialog, create a link, open it in a private window (read-only view, collapsed source), then revoke it and show the shared view failing cleanly.
1:35 to 1:45 — Keyboard and close. Cmd+K palette, run "Decode current source" from the keyboard. End card: logo mark, "Local-first. No accounts. Share only when you choose."

Recording tips: pre-load a visually interesting source (the Athena rehearsal book or a research abstract works well); run one decode before recording so the model is warm; keep cursor movements slow; cut nothing during the streaming beat.

---

## Section 5 — Judge Q&A Prep (internal notes, do not paste)

Q: Does any user data reach a server by default?
A: No. Text stays in the browser. The only outbound calls are model streaming (text plus prompts), optional URL extraction, and explicit sharing. PDF parsing is client-side.

Q: What happens when the model fails mid-stream?
A: The SSE protocol emits section-error. Completed cards are preserved, the failed card shows a recovery panel with retry-this-section and retry-full-decode, and the rate budget is not silently wasted on a global failure path.

Q: How are citations enforced?
A: The prompt injects numbered paragraphs and forbids unsupported markers; the frontend parses single and grouped markers and renders them as buttons. A citation with no matching paragraph simply does not render as a chip.

Q: Why three locked audiences instead of free text?
A: The PRD locks them so the contract stays testable and the tone differences stay structural. Free-text personas would blur the evaluation and weaken the grounding contract.

Q: What is the rate budget for?
A: Twenty decodes per rolling hour, enforced in localStorage, protecting the free model tier. It is visible in the status bar and resettable in settings.

Q: Is the share link safe?
A: Shares store one decode payload per row in Neon. Delete tokens are stored only as SHA-256 hashes; revocation requires the token. The shared view is read-only and exposes nothing from the owner's library.

---

## Section 6 — Pre-Submission Checklist

- [ ] Repo is public and contains scope.md, prd.md, spec.md (required by rules).
- [ ] devpost/checklist.md shows all build slices complete.
- [ ] README.md present with setup, features, architecture, and build-process sections.
- [ ] .env is gitignored and no API key or DATABASE_URL appears in git history.
- [ ] npm run typecheck, npm run lint, npm run build, npm run test all pass.
- [ ] Demo video recorded per Section 4, between 1 and 3 minutes, uploaded, link tested in a private window.
- [ ] Description box filled from Section 2.
- [ ] Built-with tags selected per Section 1.
- [ ] Submitted at least 12 hours before the deadline to avoid upload or traffic issues.

---

End of draft.