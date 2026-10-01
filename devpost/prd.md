---
doc: prd
status: approved
---
# Clarity - Product Requirements

A single-page concept decoder for students, research scholars, and developers who need dense text rebuilt into a usable mental model.
Source: `scope.md > The Unique Kernel`, `scope.md > Who It's For`.

## The Core Journey

1. The user opens Clarity and sees one focused page with the `Clarity` logo, the tagline `Understand anything, at your level.`, a large text input, file drop target, three audience choices, and a `Decode` action.
2. The user pastes dense text, drops/selects a `.pdf` or `.txt` file, or pastes a public web URL. File or URL content replaces the input only after successful server-side extraction and remains editable before decoding.
3. The user confirms or changes the selected audience. `Student` is selected by default. The available labels are exactly `Student`, `Executive`, and `Developer (Non-ML)`.
4. The user clicks `Decode`. The action immediately changes to `Decoding...` with a pulsing indicator and becomes disabled. The input remains unlocked.
5. The results area immediately replaces its empty placeholder with four skeleton cards matching the final card shapes.
6. As the explanation is generated, the four result cards fill in order: `TL;DR`, `The Analogy`, `Jargon Buster`, then `The One Thing to Remember`.
7. After the four cards complete, a fifth `Concept Map` section appears below them with an interactive node-link graph.
8. When generation completes, the action returns to `Decode`. The user can edit the text, ingest another file, and decode again at any time.
9. If the input changes after results exist, the result area shows a subtle `Results out of date` badge. The existing results remain visible until the user requests a fresh decode.
10. Success means the reader can move from recognizing dense words to understanding the central concept, explaining it, and seeing its key relationships, demonstrated with the supplied machine-learning paragraph.
2. The user pastes dense text into the input. The input remains readable and editable throughout the experience.
3. The user confirms or changes the selected audience. `Student` is selected by default. The available labels are exactly `Student`, `Executive`, and `Developer (Non-ML)`.
4. The user clicks `Decode`. The action immediately changes to `Decoding...` with a pulsing indicator and becomes disabled. The input remains unlocked.
5. The results area immediately replaces its empty placeholder with four skeleton cards matching the final card shapes.
6. As the explanation is generated, the four result cards fill in order: `TL;DR`, `The Analogy`, `Jargon Buster`, then `The One Thing to Remember`.
7. When generation completes, the action returns to `Decode`. The user can edit the input and decode again at any time.
8. If the input changes after results exist, the result area shows a subtle `Results out of date` badge. The existing results remain visible until the user requests a fresh decode.
9. Success means the reader can move from recognizing dense words to understanding and explaining the central concept, demonstrated with the supplied machine-learning paragraph.
Source: `scope.md > The Core Loop`, `scope.md > What "Working" Looks Like`.

## Screens and Layout

Clarity has one responsive single-page surface, not multiple screens.

### Header

A small, elegant header sits at the top. It shows the `Clarity` logo on the left, with the one-line tagline `Understand anything, at your level.` beneath or immediately alongside it. A small logo mark may use the amber accent.

### Input Area

The input area occupies the upper portion of the page. It contains:

- A large text box spanning most of the available width.
- Placeholder text: `Paste your dense text here...`.
- Three distinct audience controls below the text box: `Student`, `Executive`, and `Developer (Non-ML)`.
- `Student` selected by default.
- A prominent `Decode` action aligned with the audience controls.
- A drag-and-drop zone and file-picker control accepting `.pdf` and `.txt` files.
- Upload progress and extraction feedback that do not erase existing text until extraction succeeds.

### URL Ingestion

The user can paste a public `http` or `https` URL into the input and request extraction. The server fetches the page, extracts readable text from public HTML, and returns it for review. URL extraction never starts Decode automatically.

- Reject non-HTTP(S) schemes, localhost/private-network destinations, redirects into private networks, login-required pages, paywalls, oversized responses, JavaScript-only pages, and unsupported content types.
- Enforce response size, timeout, redirect-count, and content-type limits before parsing.
- Replace the input only after readable text extraction succeeds.
- Preserve the existing input on every URL error.
- Show the source URL as metadata so the user knows which page produced the text.

### Results Area

The results area occupies the lower portion of the page.

- Before the first decode, it shows the centered message `Your decoded breakdown will appear here.`
- During generation, it shows four skeleton cards in the final result arrangement.
- On success, it shows four cleanly separated cards in generation order.
- After the four cards complete, it shows a fifth `Concept Map` section with an interactive graph of key concepts and relationships.
- On partial failure, only the failed section becomes an inline recovery card while completed cards remain.

Source: `scope.md > The Core Loop`, `scope.md > The Product Boundary`.

## Look and Feel

The visual identity is calm, warm, focused, and premium, like a thoughtful reading app rather than a generic AI chatbot or developer tool.

- Background: warm near-black, approximately `#1A1815` or `#181614`.
- Surfaces: lighter warm charcoal, approximately `#232019` or `#252220`, with a subtle 1px `#33302A` border.
- Primary text: soft off-white, approximately `#EDE8E0`.
- Secondary text: muted warm grey, approximately `#8A8375`.
- Accent: one amber/gold, approximately `#E8A33D` or `#D99A3C`.
- Amber is reserved for the active audience control, the `Decode` action, and the small logo mark. It is not used for result borders, underlines, or result text.
- UI typography is a clean sans-serif. Result paragraphs use generous line-height and a readable maximum width. The final takeaway uses a larger, heavier treatment.
- No gradients, glow effects, neon, purple, pure black, pure white, or extra accent colors.

Source: `scope.md > Inspiration & Identity`.

## Features and Behavior

### File Ingestion

The user can drag a `.pdf` or `.txt` file onto the input area or choose one through the file picker. The browser sends the file to `POST /api/upload` as multipart form data.

- `.txt` files are read as raw UTF-8 text.
- Digital `.pdf` files are processed with `pdf-parse` on the server to extract text.
- The extracted text replaces the current input only after successful extraction.
- The user can review and edit extracted text before clicking `Decode`.
- Unsupported extensions, empty files, oversized files, encrypted PDFs, and PDFs with no extractable text show a clear recoverable error and preserve the existing input.
- Uploading a new file does not automatically call the model.

### Text Input

The user can paste or type dense text into the large input. The value remains in place while decoding, during successful generation, and after any failure. Editing is always allowed, including while generation is in progress.

If the user clicks `Decode` with no text, no generation begins. A gentle inline error says: `Please paste some text to decode.` The page stays usable and the input remains ready for text.

### Audience Selection

Exactly three audience controls are available:

- `Student` - warm and analogy-heavy; assumes no domain background; explains what and why.
- `Executive` - crisp and outcome-focused; assumes business literacy but no technical depth; explains so what and what to do.
- `Developer (Non-ML)` - technically precise; assumes software fluency but not machine-learning fluency; explains how it works using engineering analogies.

One audience is always selected, with `Student` as the initial selection. Changing the audience does not erase the input or existing results. The selected label is part of the decode request and determines the explanation tone.

### Decode and Streaming Results

When `Decode` is activated with valid input:

- The button immediately displays `Decoding...` with a pulsing indicator.
- The button is disabled to prevent duplicate submissions.
- The input remains unlocked for reading, highlighting, and editing.
- Four skeleton cards appear immediately and match the shape and order of the final cards.
- Content streams into the cards in this order: `TL;DR`, `The Analogy`, `Jargon Buster`, `The One Thing to Remember`.
- Text appears progressively as it is generated, creating a readable type-in effect.
- The completed cards retain their content while later cards are still loading.
- At completion, the button returns to `Decode`.

The successful result contains:

1. `TL;DR` - exactly one sentence capturing the central idea.
2. `The Analogy` - a short, concrete explanation adapted to the selected audience.
3. `Jargon Buster` - a bulleted list pairing difficult terms or phrases with plain-English translations.
4. `The One Thing to Remember` - one bold, important takeaway.

5. `Concept Map` - an interactive graph containing named concept nodes and labeled relationships. The graph must include meaningful connections from the source, such as `Orthogonal Latent Representations` connecting to `Disentanglement` when those concepts are present.

### Concept Map

The Concept Map appears only after the four result cards have completed successfully or after graph data has independently completed. It contains draggable nodes, visible edges, and enough labels to understand the main relationships without opening another screen.

- Nodes represent key entities or concepts extracted from the original text.
- Edges represent relationships between those concepts and may include a short relationship label.
- The graph is interactive: users can drag nodes and inspect the structure without changing the source text.
- Empty or unusable graph output shows a calm `No concept relationships found` state rather than an empty canvas.
- Graph generation failure preserves the four cards and shows a retryable Concept Map error state.

### Stale Results

If the user edits the input after a result exists, the current results remain visible and a subtle `Results out of date` badge appears. The user may click `Decode` at any time to replace them with a fresh analysis. The new request uses the current input and currently selected audience.

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

## States and Boundaries

- **First use / empty:** Results show `Your decoded breakdown will appear here.` The `Student` audience is selected.
- **Empty submission:** No request starts. Show `Please paste some text to decode.` and preserve focusable input.
- **Decoding:** Button shows `Decoding...` and is disabled; input remains editable; four skeleton cards are visible.
- **Streaming success:** Cards fill in the fixed order, preserving completed content.
- **Complete success:** Four result cards are visible and the button is restored to `Decode`.
- **File or URL extracting:** The input area shows extraction progress; Decode is unavailable until extraction finishes, while existing text remains safe.
- **File extracted:** Extracted text is visible in the editable input and no model request has started.
- **URL extracted:** Readable public-page text and source URL metadata are visible in the editable input; no model request has started.
- **URL rejected:** A clear recoverable message explains that only safe public HTML pages are supported.
- **Concept Map loading:** The four cards remain readable while graph data loads below them.
- **Concept Map success:** A draggable node-link graph with meaningful concepts and relationships is visible.
- **Concept Map unavailable:** Four cards remain usable and the graph shows a retryable error or empty-result state.
- **Edited after success:** Existing results remain, with a `Results out of date` badge.
- **Partial stream failure:** Completed cards remain; the active card becomes a section-level retry card.
- **Section retry failure:** Preserve all completed cards and expose `Retry full decode`.
- **Failure before completion:** Keep the final-card recovery message visible with an explicit retry path.
- **Global service failure:** Replace the results area with one retryable error state; preserve input and audience.
- **Persistence:** Nothing is saved between sessions in this release. Input, extracted text, results, and graph data last only for the current page session.

## Product Decisions

- One page and one core loop keep the first release coherent while the new ingestion and graph surfaces deepen the explanation.
- The exact audience labels are `Student`, `Executive`, and `Developer (Non-ML)` because they map to the defined users and make the desired explanation contract testable.
- `Student` is the default because it provides the most broadly accessible first experience.
- The input stays editable during generation so users can read or highlight source material and never lose their text.
- Streaming and skeletons are part of the intended premium experience, not hidden implementation detail from the user's perspective.
- Partial retry preserves completed work because a failed section should not force the user to wait for content they already received.
- No generic chat, accounts, saved history, or collaboration are needed to prove the concept.
- File ingestion is intentionally review-before-decode: extraction never silently triggers a model request.
- URL ingestion is also review-before-decode: fetching a page never silently triggers a model request.
- The Concept Map is an explanation aid, not a general-purpose graph database or document-management feature.

## What We're Building

A responsive single-page Clarity experience with:

- Header, tagline, and restrained warm-charcoal visual identity.
- Dense-text input with empty validation.
- Three exact audience controls with clear selected state.
- Decode, loading, skeleton, streaming, success, stale, partial retry, and global error behavior.
- Four structured result cards with audience-adapted content.
- PDF and TXT drag-and-drop ingestion with editable extracted text.
- Public HTML URL ingestion with safe server-side fetching and editable extracted text.
- Interactive Concept Map with structured nodes and edges derived from the source.
- A one-minute demo path using the supplied ML research paragraph.

## Deferred From This Release

- Accounts, saved explanations, history, sharing, and collaboration are deferred because they do not prove the translation loop.
- Batch uploads, saved files, long-document libraries, and document history are deferred because the first ingestion feature proves only one file at a time.
- Authenticated, paywalled, private-network, and JavaScript-only URL support are deferred because they require credentials, browser automation, or a larger security surface.
- Custom audiences and follow-up chat are deferred because fixed labels make the first behavior contract precise.
- Citations and formal factuality evaluation are deferred because they require a broader content model and evaluation plan.
- Additional audience presets such as `10-year-old`, `Busy Executive`, and `Non-technical Founder` are deferred in favor of the three locked labels.

## Possible Later Enhancements

Clarity could support longer source documents, custom audience profiles, saved and shareable explanations, citations, and structured evaluation of accuracy, nuance, and audience fit.

## Non-Goals

- It will not become an open-ended chatbot; that would recreate the prompting loop it is designed to replace.
- It will not claim to guarantee factual correctness or replace expert review.
- It will not manage documents, accounts, permissions, or collaboration in this release.
- It will not support every reading level or audience in the first version.
- It will not OCR scanned PDFs or claim to recover text from image-only documents.
- It will not fetch private, authenticated, paywalled, or arbitrary network resources.

## Open Questions

- The maximum accepted input length can be chosen during the technical specification, as long as the demo paragraph and a reasonable dense paragraph are supported. This does not block product approval.
- The exact visual treatment of the streaming text can be tuned during implementation as long as the fixed order, skeleton transition, and progressive fill remain visible. This does not block product approval.
- The exact Concept Map interaction affordances can be tuned during implementation as long as nodes are draggable, relationships are visible, and graph failure is recoverable. This does not block product approval.
