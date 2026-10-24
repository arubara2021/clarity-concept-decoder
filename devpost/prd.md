---
doc: prd
status: draft
---
# Clarity - Product Requirements

A single-page concept decoder that turns dense text into a usable mental model for the chosen audience, keeps every decode in the reader's own browser, and lets the reader share one result with a link when they choose to. Source: `scope.md > The Unique Kernel`, `scope.md > Who It's For`.

## The Core Journey

1. The user opens Clarity and sees one focused page with the `Clarity` logo, the tagline `Understand anything, at your level.`, a large source input, three audience choices, a `Decode` action, and a small library icon in the header. The empty results area reads `Your decoded breakdown will appear here.`
2. The user supplies source text one of three ways:
   - Pastes dense text directly into the textarea.
   - Drops or selects a `.pdf` or `.txt` file. The browser parses it locally. Extracted text replaces the input and remains editable before any decode begins.
   - Pastes a public `http` or `https` URL and clicks Extract. The server fetches the page safely and returns readable text plus source metadata, which replaces the input and remains editable.
3. The user confirms or changes the audience. `Student` is selected by default. The available labels are exactly `Student`, `Executive`, and `Developer (Non-ML)`.
4. The user clicks `Decode`. The action immediately changes to `Decoding...` with a pulsing indicator and becomes disabled. The input remains unlocked and editable.
5. The results area replaces its empty placeholder with four skeleton cards matching the final card shapes. The source textarea dims to a warm grey and a thin amber line draws itself across the results panel, marking the transition into decoding.
6. As the explanation generates, the four result cards fill in order: `TL;DR`, `The Analogy`, `Jargon Buster`, then `The One Thing to Remember`. Text arrives progressively as a readable type-in effect.
7. After the four cards complete, a fifth `Concept Map` section appears below them with an interactive node-link graph derived from the source.
8. When generation completes, the action returns to `Decode` and the completed result is saved automatically into the reader's local library.
9. If the user edits the source after results exist, the current results remain visible and a subtle `Results out of date` badge appears. A later `Decode` replaces them and creates a new library entry.
10. If a section fails, the completed cards remain and only the failed card becomes a retry card. The original source and audience are preserved in every failure state.
11. At any time the user can open the library from the header, search past decodes, reopen them read-only, rename, or delete them. Nothing leaves the browser.
12. If the user wants to share one decode, they click `Share` on that result. The app returns a short link. Opening the link in another browser shows the decode read-only, alongside the original source. The user can revoke the share at any time.
13. Success means the reader moves from recognizing dense words to understanding the central concept, explaining it to someone else, seeing how its parts relate, and being able to revisit that understanding days later without redoing the work.
Source: `scope.md > The Core Loop`, `scope.md > What "Working" Looks Like`.

## Screens and Layout

Clarity has one responsive single-page surface plus two overlay surfaces. There is no navigation between pages.

### Header

A small, elegant header sits at the top. On the left is the `Clarity` logo with a small amber mark and the tagline `Understand anything, at your level.` beside it. On the right are two controls: a small library icon that opens the library drawer, and a small share icon that is disabled until a result exists. The header includes a hidden command-palette trigger surface, accessible via `Cmd+K` on macOS and `Ctrl+K` on Windows and Linux.

### Source Input Area

The source input area occupies the upper portion of the page. It contains:

- A large text box with the placeholder `Paste your dense text here...`.
- A drag-and-drop zone covering the textarea and a file-picker control accepting `.pdf` and `.txt` files. Text extraction happens in the browser and shows a brief progress state without erasing existing text until extraction succeeds.
- A source-mode row with three tabs: `Paste`, `File`, and `URL`. Only one mode is active at a time; switching tabs does not clear the textarea contents.
- In URL mode, a single text input for the public URL and an `Extract` button.
- Below the input, three audience controls labeled exactly `Student`, `Executive`, and `Developer (Non-ML)`. `Student` is selected by default.
- A prominent `Decode` action aligned with the audience controls.
- A character counter that appears in the corner of the textarea and dims when the input is near the maximum.

### Results Area

The results area occupies the lower portion of the page.

- Before the first decode, it shows the centered message `Your decoded breakdown will appear here.` with a small orbit animation.
- During generation, it shows four skeleton cards in the final arrangement, staggered into view.
- On success, it shows four cleanly separated cards in generation order, each with a small section number in the top right.
- After the four cards complete, it shows a fifth `Concept Map` section with an interactive graph.
- On partial failure, only the failed section becomes an inline recovery card while completed cards remain.
- If citations are present, each card shows one or more small superscript markers that scroll the source input to the referenced paragraph when clicked.

### Library Drawer

A right-side drawer slides in from the header library icon or the command palette. It contains:

- A search field that filters across titles and source text.
- A reverse-chronological list of past decodes, each showing title, audience label, and a relative timestamp.
- Per-item actions: open, rename, delete.
- An empty state when no decodes exist: `Decodes you make will appear here. Nothing leaves this browser unless you share it.`
- A small footer line showing total library size and a `Clear all` action behind a confirmation.

### Command Palette

A centered overlay triggered by `Cmd+K` or `Ctrl+K`. It contains a single search field and a filtered list of actions:

- Focus source input.
- Decode current source.
- Switch audience (three sub-entries).
- Open library.
- Share current result.
- Copy current link.
- Clear current result.

The palette is keyboard-first. Every action is reachable without a mouse.

### Share Dialog

A small modal triggered by the share icon or the command palette. It shows:

- The link in a read-only field with a `Copy` button.
- A short line: `Anyone with this link can read this decode. You can revoke it at any time.`
- A `Revoke share` action that consumes the stored delete token and immediately invalidates the link.
- A share count indicator: `7 of 10 shares used on this browser.`

### Shared View (`/s/[id]`)

A read-only page rendered when someone opens a share link. It contains the decode exactly as the sharer saw it, with the four cards and the concept map. The original source text is shown above the cards in a collapsed panel, expandable by clicking. There is a small footer note: `This is a shared Clarity decode. Make your own at clarity.app.` No actions are available on this page except expanding the source panel.

Source: `scope.md > The Core Loop`, `scope.md > The Product Boundary`.

## Look and Feel

The visual identity is calm, warm, focused, and premium, like a thoughtful reading app rather than a generic AI chatbot or developer tool.

- Background: warm near-black, approximately `#1A1815`.
- Surfaces: lighter warm charcoal, approximately `#232019`, with a subtle 1px `#33302A` border.
- Primary text: soft off-white, approximately `#EDE8E0`.
- Secondary text: muted warm grey, approximately `#8A8375`.
- Accent: one amber, approximately `#E8A33D`.
- Amber is reserved for the logo mark, the active audience control, the `Decode` action, the command palette's primary affordance, and the signature decode transition line. It is not used for result borders, underlines, or result text.
- Error surfaces use a calm red-tinted treatment. This is a semantic failure state, not part of the brand palette.
- UI typography is a clean sans-serif. Result paragraphs use generous line-height and a readable maximum width. The final takeaway uses a larger, heavier treatment.
- Spacing follows a consistent four-pixel base unit throughout the interface.
- No gradients, glow effects, neon, purple, pure black, pure white, or additional accent colors.

### Motion Language

Motion is designed as a system, not added per component.

- Cards enter with a short upward translate plus fade, staggered by roughly 40 milliseconds between siblings.
- Skeletons breathe on a slow sine cycle rather than a linear pulse.
- Streaming tokens append without reflow jitter; each card reserves its final height so text does not push the layout.
- Buttons have four distinct states — hover, press, focus, and disabled — each with its own timing curve.
- The command palette fades and scales in with a spring easing over roughly 150 milliseconds.
- All motion respects `prefers-reduced-motion` and collapses to instant transitions when the user requests it.

### The Signature Moment

Every premium product has one visual decision that a screenshot betrays as theirs. For Clarity it is the decode transition: when the user clicks Decode, the source textarea dims to a warm grey and a thin amber line draws itself across the results panel as the four cards rise into place. This is the moment that makes the product feel alive, and every other design decision supports it rather than competes with it.

Source: `scope.md > Inspiration & Identity`.

## Features and Behavior

### Source Input

The user can paste or type dense text into the large input. The value remains in place while decoding, during successful generation, and after any failure. Editing is always allowed, including while generation is in progress.

If the user clicks `Decode` with no text, no generation begins. A gentle inline error says `Please paste some text to decode.` The page stays usable and the input remains ready for text.

The input has a maximum length of 20,000 characters, chosen during implementation after verifying the selected Gemini model's context window and rate limits. A character counter appears near the textarea and dims when the input is within 10% of the limit.

### File Ingestion

The user can drop a `.pdf` or `.txt` file onto the input area or choose one through the file picker. Extraction happens entirely in the browser. No file content is sent to the server.

- `.txt` files are read using the browser's native file reader and inserted into the textarea as UTF-8 text.
- Digital `.pdf` files are parsed in the browser using `pdfjs-dist`. Extracted text replaces the current input.
- The extracted text is editable before decoding, and no model request starts automatically.
- A loading indicator appears on the textarea during extraction. Existing text is not cleared until extraction succeeds.
- Unsupported extensions, empty files, oversized files, encrypted PDFs, and PDFs with no extractable text show a clear recoverable error and preserve the existing input.
- PDFs larger than roughly 20 MB are rejected with a message that explains the file exceeds the browser's safe parse limit and suggests pasting the relevant section as text.
- Scanned or image-only PDFs produce no extractable text. The error message says clearly that OCR is not supported.

### URL Ingestion

The user can paste a public `http` or `https` URL and click `Extract`. The server fetches the page, extracts readable text from public HTML, and returns it for review. URL extraction never starts Decode automatically.

- Reject non-HTTP(S) schemes, localhost and private-network destinations, redirects into private networks, login-required pages, paywalls, oversized responses, JavaScript-only pages, and unsupported content types.
- Enforce response size, timeout, redirect-count, and content-type limits before parsing.
- Replace the input only after readable text extraction succeeds.
- Preserve the existing input on every URL error.
- Show the source URL as metadata so the user knows which page produced the text.

### Audience Selection

Exactly three audience controls are available:

- `Student` — warm and analogy-heavy. Assumes no domain background. Explains what and why.
- `Executive` — crisp and outcome-focused. Assumes business literacy but no technical depth. Explains so what and what to do.
- `Developer (Non-ML)` — technically precise. Assumes software fluency but not machine-learning fluency. Explains how it works using engineering analogies.

One audience is always selected, with `Student` as the initial selection. Changing the audience does not erase the input or existing results. The selected label is part of the decode request and determines the explanation tone.

### Decode and Streaming Results

When `Decode` is activated with valid input:

- The button immediately displays `Decoding...` with a pulsing indicator and becomes disabled to prevent duplicate submissions.
- The input remains unlocked for reading, highlighting, and editing.
- Four skeleton cards appear immediately and match the shape and order of the final cards.
- The source textarea dims and the signature decode transition line draws across the results panel.
- Content streams into the cards in this order: `TL;DR`, `The Analogy`, `Jargon Buster`, `The One Thing to Remember`.
- Text appears progressively as it is generated, creating a readable type-in effect that does not cause layout shift.
- The completed cards retain their content while later cards are still loading.
- At completion, the button returns to `Decode` and the entire result is saved to the local library automatically.

The successful result contains:

1. `TL;DR` — exactly one sentence capturing the central idea.
2. `The Analogy` — a short, concrete explanation adapted to the selected audience.
3. `Jargon Buster` — a bulleted list pairing difficult terms or phrases with plain-English translations.
4. `The One Thing to Remember` — one bold, important takeaway.
5. `Concept Map` — an interactive graph containing named concept nodes and labeled relationships derived from the source.

### Citations

Each result card shows one or more small superscript markers next to claims that trace back to specific paragraphs in the source. Clicking a marker scrolls the source textarea to the referenced paragraph and briefly highlights it. Citations are paragraph-level in this release. If the model cannot confidently map a claim to a source paragraph, no marker is shown rather than a wrong one.

### Concept Map

The Concept Map appears only after the four result cards have completed successfully or after graph data has independently completed. It contains draggable nodes, visible edges, and enough labels to understand the main relationships without opening another screen.

- Nodes represent key entities or concepts extracted from the original text.
- Edges represent relationships between those concepts and may include a short relationship label.
- The graph is interactive: users can drag nodes and inspect the structure without changing the source text.
- Empty or unusable graph output shows a calm `No concept relationships found` state rather than an empty canvas.
- Graph generation failure preserves the four cards and shows a retryable Concept Map error state.

### Local Library

Every successful decode is saved automatically to the browser's IndexedDB. The library is private to the browser and never syncs to a server.

- The library drawer is reachable from the header icon or the command palette.
- Search filters across titles and source text.
- Each entry can be opened read-only, renamed, or deleted.
- A `Clear all` action empties the library behind a confirmation dialog.
- The library shows a small footer line stating how much space it uses and that nothing leaves the browser unless shared.
- Deleting a shared decode does not revoke the share; revocation is a separate explicit action in the share dialog.

### Share a Decode

The user can share one decode by clicking the share icon in the header or the share action in the command palette. The share flow:

- Sends the current decode, the audience label, and the source text to the server.
- Stores the payload in a shared database and returns a short link.
- Shows the link in the share dialog with a copy button.
- Stores the delete token locally with the corresponding library entry.
- Limits each browser to ten live shares. The share dialog shows the current count. Reaching the limit disables the share action and shows a message that says a share must be revoked before a new one can be created.
- Allows the sharer to revoke at any time. Revocation deletes the row in the database and immediately invalidates the link.

A shared decode is read-only. It shows the four cards, the concept map, and the original source in a collapsed panel. It carries a small footer note inviting the reader to make their own.

### Command Palette

The palette is triggered by `Cmd+K` or `Ctrl+K` and offers a keyboard-first way to control the app. Its actions are:

- Focus source input.
- Decode current source.
- Switch audience (three sub-entries, one per label).
- Open library.
- Share current result.
- Copy current link.
- Clear current result.

The palette is fully keyboard-navigable. Every action is reachable without a mouse.

### Stale Results

If the user edits the input after a result exists, the current results remain visible and a subtle `Results out of date` badge appears. The user may click `Decode` at any time to replace them with a fresh analysis. The new request uses the current input and currently selected audience and creates a new library entry.

### Partial Recovery

If generation fails while a section is streaming:

- Fully completed cards remain exactly as they are.
- The failed card becomes a calm inline error card with a red-tinted border, a warning icon, and the message `This section couldn't be generated. The connection may have dropped.`
- The error card includes `Retry this section`, which requests only that missing section.
- A successful section retry restores the failed card and preserves all other cards.
- If the section retry fails, or no card completed before the failure, the recovery card also offers `Retry full decode`.
- If the failure occurs before the final card completes, `The One Thing to Remember` never fails silently. Its skeleton changes to `Waiting for the summary...` with an explicit retry option.
- The original input and audience selection are preserved in every case.

### Global Failure

If the service is completely unreachable, such as when the required API configuration is unavailable, the results area shows one centered error state with a clear explanation and a `Try again` action. The input and audience selection remain intact.

### Rate Budget

Each browser has a decode budget of twenty decodes per rolling hour, stored in `localStorage`. When the budget is exhausted:

- The `Decode` action is disabled.
- A calm inline message states when the budget resets.
- No model request is made.

The rate budget exists to protect the free Gemini tier and is a per-browser mitigation, not a security control. The browser identity is a random UUID stored in `localStorage` and is not derived from any personal information.

### Offline and No-Database Modes

The app functions without a database configured. In that case, the share feature is hidden, the share routes return a clear `sharing is not configured` message, and everything else — decode, library, command palette, concept map — works normally.

The app also functions without a network connection for everything except the Gemini call itself. File parsing is local, the library is local, and reopening past decodes requires no network.

## States and Boundaries

- **First use / empty:** Results show `Your decoded breakdown will appear here.` The `Student` audience is selected. The library is empty.
- **Empty submission:** No request starts. Show `Please paste some text to decode.` and preserve focusable input.
- **Decoding:** Button shows `Decoding...` and is disabled. Input remains editable. Four skeleton cards are visible. The decode transition line has drawn across the results panel.
- **Streaming success:** Cards fill in the fixed order, preserving completed content, with no layout shift.
- **Complete success:** Four result cards and the concept map are visible. The button is restored to `Decode`. The result is saved to the local library.
- **File extracting:** The textarea shows a loading state; Decode is unavailable until extraction finishes; existing text remains safe.
- **File extracted:** Extracted text is visible in the editable input. No model request has started.
- **File rejected:** A clear message explains the specific reason (too large, wrong type, no extractable text, encrypted) and the existing input is preserved.
- **URL extracting:** The URL row shows a loading state; Decode is unavailable; existing text remains safe.
- **URL extracted:** Readable public-page text and source URL metadata are visible in the editable input. No model request has started.
- **URL rejected:** A clear message explains that only safe public HTML pages are supported and the existing input is preserved.
- **Concept Map loading:** The four cards remain readable while graph data loads below them.
- **Concept Map success:** A draggable node-link graph with meaningful concepts and relationships is visible.
- **Concept Map unavailable:** Four cards remain usable and the graph shows a retryable error or empty-result state.
- **Citations present:** Small markers appear next to claims with source mappings. Clicking scrolls the source input to the referenced paragraph.
- **Edited after success:** Existing results remain, with a `Results out of date` badge.
- **Partial stream failure:** Completed cards remain; the active card becomes a section-level retry card.
- **Section retry failure:** Preserve all completed cards and expose `Retry full decode`.
- **Failure before completion:** Keep the final-card recovery message visible with an explicit retry path.
- **Global service failure:** Replace the results area with one retryable error state. Preserve input and audience.
- **Library open:** A right-side drawer shows the searchable list of past decodes. Nothing leaves the browser.
- **Library empty:** The drawer shows `Decodes you make will appear here. Nothing leaves this browser unless you share it.`
- **Share available:** The share dialog opens, shows a link, shows the used share count, and offers revoke.
- **Share limit reached:** The share action is disabled with a message stating that a share must be revoked before a new one can be created.
- **Share revoked:** The row is deleted from the database. Opening the old link shows `404`. The local library entry remains, but its share metadata is cleared.
- **Shared view:** A read-only page shows the four cards, the concept map, and the source text behind a collapsed panel.
- **Rate budget exhausted:** The `Decode` action is disabled with a message stating when the budget resets.
- **Database unavailable:** Share and shared views fail with a clear message. Local decode, library, and reopening past decodes continue to work.
- **Persistence:** Local decodes persist in IndexedDB across sessions and page refreshes. Page memory state (current source, audience selection, in-progress stream) does not persist across a refresh. Shared decodes persist in the database until revoked or until the database's storage limit is reached.

## Product Decisions

- **Path A chosen over Path B.** Depth for one reader class first rather than breadth across a platform. Every product that became a platform started as a sharp tool for one person.
- **Universal audience served by three locked labels.** `Student`, `Executive`, and `Developer (Non-ML)` map to the defined users and make the explanation contract testable. Custom audience fields are deferred.
- **Local-first persistence.** IndexedDB holds decodes and session identity. Nothing leaves the browser unless the user explicitly shares.
- **Client-side file parsing.** `.txt` and `.pdf` parsing happens in the browser, removing the serverless request-size and memory ceilings and keeping file content on the user's machine.
- **Cloud-on-demand share.** A single Neon table backs shareable links. Accounts, sync, and collaboration are deferred.
- **Ten live shares per browser.** Abuse prevention for a free, open-source, accountless tool, enforced at the point of share via a stored browser UUID.
- **Revocable shares.** Each share carries an unguessable delete token; revocation removes the row immediately.
- **Shared views show the original source.** Reading a decode without the source undercuts the trust the citations are meant to build. The source is behind a collapsed panel by default.
- **Paragraph-level citations.** Meaningful trust without the prompt-engineering and layout complexity of sentence-level mapping in this release.
- **Twenty decodes per rolling hour per browser.** Protects the free Gemini tier and communicates the limit clearly rather than silently throttling.
- **Motion is a designed system.** A shared motion language and design tokens, not ad-hoc transitions per component.
- **One signature visual moment.** The decode transition — dimming the source, drawing the amber line, and rising the cards — is the product's identity.
- **No generic chat.** Clarity is not an open-ended chatbot. It is a structured translation with a fixed contract.
- **No accounts.** The local library gives the account-like behavior a user actually wants without the account infrastructure.
- **No database required for local use.** Share is optional; the rest of the product runs fully on the user's machine.

## What We're Building

A responsive single-page Clarity experience with:

- Header, tagline, and restrained warm-charcoal visual identity.
- Source input with three modes: paste, file, and public URL.
- Client-side parsing for `.pdf` and `.txt` files.
- Safe server-side extraction for public HTML URLs.
- Three exact audience controls with clear selected state.
- Decode with a signature transition, streaming skeletons, and ordered result cards.
- Four structured result cards with audience-adapted content.
- Paragraph-level citations with scroll-to-source behavior.
- Interactive Concept Map with structured nodes and edges derived from the source.
- Local library with search, reopen, rename, and delete, backed by IndexedDB.
- Command palette with keyboard-first control over every action.
- Share one decode per action, up to ten live shares per browser, with per-share revoke.
- Rate budget of twenty decodes per rolling hour per browser.
- A designed motion language with a signature decode transition.
- A one-minute demo path using the supplied ML research paragraph.

## Deferred From This Release

- Accounts, cross-device sync, and multi-user collaboration are deferred because they do not prove the translation kernel and because local-first already serves the account-like need.
- Custom audience fields are deferred because fixed labels make the explanation contract testable. They are the first candidate for a later release.
- Sentence-level citations are deferred in favor of paragraph-level citations, which carry most of the trust value at a fraction of the complexity.
- OCR for scanned or image-only PDFs is deferred because extracting text from digital PDFs proves the ingestion path and OCR adds a substantial dependency.
- Batch uploads, saved files, long-document libraries, and document history are deferred. The first ingestion feature proves one file at a time.
- Authenticated, paywalled, private-network, and JavaScript-only URL support are deferred because they require credentials, browser automation, or a larger security surface.
- Citations against formal factuality evaluation are deferred because they require a broader content model and an evaluation plan.
- Additional audience presets such as `10-year-old`, `Busy Executive`, and `Non-technical Founder` are deferred in favor of the three locked labels.
- Export to Markdown or PDF is deferred until the library proves users return.

## Possible Later Enhancements

Clarity could support custom audience profiles, sentence-level citations, side-by-side audience comparison, shareable libraries, a browser extension for one-click capture of selected text, export to Markdown, a PWA install target, and structured evaluation of accuracy, nuance, and audience fit. None of these change the kernel; they extend its reach.

## Non-Goals

- It will not become an open-ended chatbot; that would recreate the prompting loop it is designed to replace.
- It will not claim to guarantee factual correctness or replace expert review.
- It will not manage documents, accounts, permissions, or collaboration in this release.
- It will not support every reading level or audience in the first version.
- It will not OCR scanned PDFs or claim to recover text from image-only documents.
- It will not fetch private, authenticated, paywalled, or arbitrary network resources.
- It will not store user content on a server unless the user explicitly shares a decode.
- It will not use a paid service anywhere on the critical path for the free tier of the deployed app.

## Open Questions

- The exact maximum source length (planned as 20,000 characters) should be confirmed after verifying the selected Gemini model's context window. This does not block approval.
- The exact layout of citation markers within result cards can be tuned during implementation as long as the markers remain unobtrusive and correctly scroll the source. This does not block approval.
- Whether a server-side per-IP rate limit is needed beyond the browser budget depends on observed traffic after deployment. This does not block approval.
- The exact concept map layout and node arrangement algorithm can be tuned during implementation as long as nodes remain draggable, edges remain visible, and graph failure is recoverable. This does not block approval.
- Whether a shared decode should display the audience label prominently or subtly can be decided when the shared view is designed against real content. This does not block approval.