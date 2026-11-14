# 05 — The builder app in the browser: editor client, preview, The Wall

Written 2026-11-14 by the area-5 agent. Scope: client state, sync, the preview, selection and direct editing, The Wall, cross-breeding and taste, the chat panel, perceived speed, routes, accessibility and budgets. Not in scope: the spec format and operations (area 1), blocks/themes/rendering (area 2), the generation pipeline (area 3, see `03-generation-pipeline.md`), repo/storage/hosting (area 4), apps/forms/foundry (area 6).

**Labels.** [V] verified at a primary source (docs, source code, npm registry) on 2026-11-14. [M] measured by me in a throwaway experiment (method in section 3.6). [R] reported by a secondary source. [P] my proposal. [E] my estimate.

**The design in one paragraph [P].** The editor window owns the site spec in a small TanStack Store and is the only writer. The preview is a **separate document on a separate site** (an iframe on a second registrable domain) that holds a read-only replica and receives operations over a typed `postMessage` protocol; it draws its own hover and selection overlay and hosts inline text editing. The Wall is **the same preview runtime in "wall" mode: one document that renders all 48 sites as live React trees**, scaled with `transform`, each themed by CSS variables on its root, made responsive by container queries. Every change is an operation with an id, a transaction id and an inverse; the server assigns a sequence number. That plain, server-ordered operation log is the whole sync story for now, and it is shaped so a Durable Object per site can later broadcast it for multiplayer, branches and offline editing without changing the client model.

---

## 1. Decisions table

| # | Decision | Recommendation | Door | Confidence |
|---|---|---|---|---|
| D1 | Who owns the spec in the browser | The editor window holds the only writable copy; the preview and The Wall hold read-only replicas fed by operations | **One-way** | High |
| D2 | Client store library | TanStack Store 0.11 (atoms + `useSelector`), wrapped in our own `useDoc()` hook; immutable structural sharing; one memo boundary per block | Two-way | High |
| D3 | Local edit model | Optimistic: apply locally, queue as pending, server acks with a sequence number; rebase pending ops on server ops | **One-way** (shape of the op envelope) | High |
| D4 | Undo/redo | Per-user stacks of transactions; undo = apply the stored inverse as a *new* operation (never "rewind the log") | **One-way** | High |
| D5 | Sync and multiplayer | Plain operation log with server ordering. No CRDT, no sync engine now. Later: one Durable Object per site broadcasting the same log | **One-way** (log model); transport two-way | Medium-high |
| D6 | Preview container | Cross-site iframe (separate registrable domain; `127.0.0.1` vs `localhost` in development), same renderer as the published site | **One-way** (the rule "editor never touches preview DOM") | High |
| D7 | Editor ↔ preview protocol | Versioned, schema-checked `postMessage` protocol; ops in, events out; batched once per animation frame | **One-way** | High |
| D8 | Responsive preview | Real iframe width for phone/tablet/desktop **and** blocks written with container queries only | **One-way** (block contract) | High |
| D9 | Selection markers | Blocks emit `data-block-id` on the root and `data-slot="<path>"` on every text and image slot | **One-way** (block contract) | High |
| D10 | Overlay and inline text | Overlay drawn inside the preview frame (shadow root), keyed by address not DOM node; inline text via `contenteditable="plaintext-only"`, emitting `setContent` | Two-way | High |
| D11 | Editing libraries | Now: none of dnd-kit, Tiptap, Lexical, Floating UI, assistant-ui. Later, lazily loaded: Tiptap core for rich slots, dnd-kit for drag and drop, Floating UI for toolbars | Two-way | High |
| D12 | The Wall rendering | One document (the preview runtime in wall mode), 48 live React trees scaled with `transform`, themes as CSS variables, no shadow DOM, no per-tile iframes, no server images | Two-way (rendering), **one-way** for the block rules it relies on (D8) | High (measured) |
| D13 | Cross-breeding | Pure client-side spec merge, no model call; recorded as an event | Two-way | High |
| D14 | Taste learning | Client-side online logistic model over spec features plus diversity re-ranking; events sent to the server | Two-way (model); **one-way** (what is recorded) | Medium |
| D15 | Chat panel | Build plain on our own message types and area 3's NDJSON events. Do not adopt assistant-ui or AI SDK UI | Two-way | High |
| D16 | First paint and text arrival | No skeletons: library copy is the placeholder; slot text replaces at word boundaries; view transitions for variant swaps | Two-way | High |
| D17 | Routes and SSR | SSR for landing, settings and marketing; editor and Wall are client-rendered shells (`ssr: false`); anonymous drafts claimable after sign-in | Two-way | High |
| D18 | Phones | Wall and chat-driven editing work on phones from v1; drag-and-drop and inline editing are desktop-first | Two-way, but a product call (question 3) | Medium |
| D19 | JS budget | Landing ≤ 110 KB gzip JS; editor ≤ 200 KB initial; preview runtime ≤ 120 KB plus per-block chunks | Two-way | Medium |

---

## 2. Detail per decision

### 2.1 D1 — The editor owns the spec; previews are replicas (one-way)

**Options.** (a) One React tree: the editor renders the site directly, sharing state. (b) Editor owns state; the preview is a replica fed by operations. (c) The preview owns state; the editor asks it. (d) A shared CRDT document that both sides mutate.

**Recommendation: (b).** Reasons:
- Area 3's stream, the user's direct edits, undo and (later) other collaborators all produce the same thing: operations. Putting them through one queue in one place (the editor) gives one ordering, one undo stack and one place to talk to the server.
- The preview can then live anywhere: same document, same-origin iframe, cross-site iframe, a phone-width second iframe, or 48 tiles. It only needs `applyOp`, which area 1 ships as a pure function shared by server, editor and preview.
- (c) makes the preview's crash or reload lose work. (d) costs a CRDT where a log suffices (D5).

Expensive to change later because every feature (undo, chat undo buttons, selection, sync) would be written against the ownership model.

### 2.2 D2 — Store library (two-way)

The real requirement is "apply many small patches quickly without re-rendering the whole preview". I measured this directly on a 40-block page (1,085 elements) in Chromium 156 [M]:

| Strategy | `setContent` apply + render + layout, p50 / p95 | `replaceVariant` p50 / p95 | 200 text ops in one batch | `setTheme` |
|---|---|---|---|---|
| Per-block selectors (`useSelector(store, s => s.blocks[id])`) | 0.2 / 0.3 ms | 0.3 / 0.4 ms | 0.9 ms | 1.2 ms |
| Whole-spec subscription, `memo` per block, structural sharing | 0.2 / 0.3 ms | 0.2 / 0.3 ms | 0.7 ms | 1.2 ms |
| Whole-spec subscription, no `memo` | 0.5 / 0.6 ms | 0.6 / 0.7 ms | 0.7 ms | 1.5 ms |

(Timer resolution was 0.1 ms in that run because the page was not cross-origin isolated.)

**Conclusion [M→P]:** the store library does not decide speed. What decides it is (1) immutable updates with structural sharing, so untouched blocks keep their object identity, and (2) one `memo` boundary per block. Any of the candidates meets the budget. So pick by fit, size and family:

| Option | Version (npm, 2026-11-14) [V] | Added gzip over React (esbuild, minified) [M] | Fit |
|---|---|---|---|
| **TanStack Store** | 0.11.2 (2026-09-29) | +2.2 KB | Atoms built on a vendored alien-signals core (`packages/store/src/alien.ts`), `batch()`, `useSelector` on `useSyncExternalStoreWithSelector` ([source](https://github.com/TanStack/store/tree/main/packages/store/src)) [V]. TanStack family, tiny. Still 0.x: `useStore` is already deprecated for `useSelector` ([react-store index.ts](https://github.com/TanStack/store/blob/main/packages/react-store/src/index.ts)) [V], so wrap it |
| Zustand | 5.1.0 | +0.3 KB | Equally good technically. Not TanStack |
| Jotai | 3.0.2 | +2.9 KB | Atom-per-block works but scatters the doc; worse for "one spec, one log" |
| Preact signals for React | 3.12.0 | +2.5 KB | Fine-grained, but needs `useSignals()` or a Babel transform with React 19; buys nothing measurable here |
| **TanStack DB** | 1.0.0-rc.1.5 (2026-11-11); README badge still says "BETA" ([README](https://github.com/TanStack/db)) [V] | +82.7 KB | Normalised row collections with live queries and optimistic mutations. Wrong shape for one JSON document edited by semantic ops. Reconsider only for lists (sites dashboard) once 1.0 ships |
| TanStack Query | 5.107.1 | +9.7 KB | Use it for server state (site list, account, publish status), not for the spec |

**Recommendation:** TanStack Store, behind our own `useDoc(selector)` / `useSelection()` hooks so a swap to Zustand is a one-file change. Applying ops: area 1 writes `applyOp` as hand-written immutable updates (there are about ten op types); if they prefer a helper, `mutative` (+9.4 KB) or `immer` (+4.8 KB) both measured [M].

### 2.3 D3 — Optimistic local edits and the op envelope (one-way)

Every change, from any source, travels in this envelope. Area 1 owns `Op`; area 5 needs the envelope fields [P]:

```ts
type Actor = { kind: "user" | "ai" | "agent" | "system"; id: string };

type OpEnvelope = {
  id: string;          // uuidv7, client- or server-generated; idempotency key
  txn: string;         // transaction id: one chat turn, one inline-edit session, one drag
  actor: Actor;
  baseSeq: number;     // last server seq the author had applied
  op: Op;              // addBlock | removeBlock | moveBlock | replaceVariant | setContent | setTheme | …
  seq?: number;        // assigned by the server; absent while pending
};

type Applied = { spec: Spec; inverse: Op } | { rejected: string };  // applyOp never throws
```

Flow:
1. **Local edit:** `dispatch(op, txn)` → `applyOp(view, op)` → push to `pending` → enqueue for the preview (next animation frame) → POST to the server.
2. **Server ack** (`seq` for my op id): move the op from `pending` to `confirmed`.
3. **Server op from elsewhere** (area 3's stream today, collaborators later): apply to `confirmed`; if `pending` is empty, also to `view` and forward to the preview; if not, recompute `view = pending.reduce(applyOp, confirmed)` and send the preview a `load` snapshot. Measured cost of a full-site re-render from a fresh object is about 0.5 ms for 1,085 elements [M], so snapshots on rebase are fine.

**The one-way part, which is a requirement on area 1:** ops must be **intent-based and addressed by stable ids**, so a pending op still means the same thing after other ops land first. Concretely: `moveBlock(id, { after: otherId })` or a fractional index, not `/order/3`; list items inside a block (features, tiers, FAQ entries) carry ids, so a slot path is `items.k3f.title`, not `items.2.title`; an op whose target is gone returns `{ rejected }` instead of throwing. RFC 6902 JSON Patch with array indexes is fine as a storage or debugging encoding, not as the op itself.

### 2.4 D4 — Undo and redo (one-way)

- Stacks are per user, per site: `undo: Txn[]`, `redo: Txn[]`. A `Txn` holds its ops and their inverses (captured from `applyOp` at apply time).
- **Undo applies the inverses as new ops** with a new `txn` and `actor` of the undoing user, so undo syncs, is recorded and works with collaborators. It never deletes log entries.
- **Selective undo check:** before applying an inverse to a slot or block, compare the current value with what the original op set. If someone else changed it since, skip that op and say so in chat ("Kept Ana's newer headline"). This is the rule Figma-style multiplayer editors use; it is cheap with id-addressed ops.
- **One chat turn = one transaction**, so every applied-ops chat message carries an Undo button that inverts exactly that turn. Text streamed into slots joins the turn's transaction; the inverse records the pre-stream text once, not per word.
- **Inline typing:** one transaction per editing session (focus to blur), so Cmd-Z after typing a headline undoes the whole edit, as users expect.
- Undo during a streaming turn: abort the stream (area 3 supports `AbortController`), then invert what was applied.

### 2.5 D5 — Sync and the road to multiplayer (one-way for the log model)

**What is needed now:** saving, one user, one tab, area 3's server stream. **What must stay possible:** real-time collaboration, branches and time travel, offline editing, agents proposing changes.

| Option | State on 2026-11-14 | Verdict |
|---|---|---|
| **Plain op log, server-ordered** (Figma/Replicache-style) | Ours; ~300 lines | **Adopt** |
| Yjs | 13.6.33 latest; 14.0.0-16 in beta ([npm](https://www.npmjs.com/package/yjs)) [V]; +19 KB gzip [M] | Merges, but cannot enforce the block contract (valid variants, slot limits, required blocks) during merge; no native list move. Good for character-level text co-editing |
| Automerge | 3.5.0 (2026-09-16), MIT [V]; WASM ≈ 1.14 MB gzip [M] | Same contract problem; heavy WASM for a ~1 s product |
| Loro | 1.17.1 (2026-10-22), MIT [V]; movable tree, time travel, "Git DAG history" ([README](https://github.com/loro-dev/loro)) [V]; WASM ≈ 1.19 MB gzip [M] | Best CRDT fit if one is ever needed (moves, versions). Plan B for offline-heavy use |
| Zero (Rocicorp) | 1.12.0 (2026-11-13); 1.0 on 2026-03-24 [V]. Replicates **Postgres** into a SQLite replica in `zero-cache` ([llms.txt](https://zero.rocicorp.dev/llms.txt)) [V] | Row-sync for relational apps; needs Postgres plus a `zero-cache` server. Wrong shape and too much machinery |
| Electric | `@electric-sql/client` 1.5.28, Apache-2.0 [V] | Postgres read-path sync; same mismatch |
| Jazz | 2.0.0-alpha.61, "an entirely new API" ([README](https://github.com/garden-co/jazz)) [V] | Alpha rewrite; avoid |
| LiveStore | 0.5.0 (2026-10-15), Apache-2.0; event-sourced SQLite; Cloudflare sync provider on Durable Objects, events stored in the DO's SQLite or D1 ([docs](https://docs.livestore.dev/reference/syncing/sync-provider/cloudflare/)) [V] | Philosophically closest to our design (event log, rebase, DO). Pre-1.0. Watch; the op log below can migrate onto it if it matures |
| Convex | 1.50.0; self-hosted backend under FSL-1.1-Apache-2.0 ([LICENSE](https://github.com/get-convex/convex-backend/blob/main/LICENSE.md)) [V] | A whole backend; licence and lock-in clash with "Apache-2.0, self-hostable" |
| InstantDB | `@instantdb/react` 1.0.67, Apache-2.0 [V] | Hosted-first triple store; same mismatch |
| PartyKit / partyserver / Cloudflare Agents | `partyserver` 0.5.10 (ISC, Cloudflare repo), "enhances Durable Objects" ([README](https://github.com/cloudflare/partykit/tree/main/packages/partyserver)) [V]; `partysocket` +3.8 KB [M] | Not a sync model, just DO plumbing. Use later as the transport if it saves code |
| Durable Objects | WebSocket Hibernation API recommended, no duration charges while hibernating ([docs](https://developers.cloudflare.com/durable-objects/best-practices/websockets/)) [V]; SQLite-backed storage ([docs](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/)) [V] | **The later home of the log**: one DO per site = one ordering point |

**Recommendation [P]:**
- **Now (M0–M1):** ops go to the server in small batches (one POST per animation frame or 100 ms, whichever is later) over area 3's TanStack Start server routes. The server validates each op against the spec, assigns `seq`, appends to an `ops` table and snapshots the spec every ~100 ops. Area 4 picks D1 vs DO storage. The client keeps `confirmed`, `pending` and `view` (D3).
- **Later, multiplayer:** move the per-site log into one Durable Object with hibernating WebSockets. It does what the server function did (validate, assign `seq`, append) and also broadcasts. **The client code does not change**: server ops from others are already handled by the rebase in D3.
- **Later, branches and time travel:** a branch is a log forked at `(branchId, seq)`. Time travel = load the nearest snapshot and replay to `seq`. Merge = replay the branch's ops onto main through the same rebase, with conflicts surfaced per block. Agents' proposals are branches.
- **Later, offline:** persist `pending` in IndexedDB; on reconnect, send and rebase. Long offline sessions get the same per-op conflict rule as undo.

**Exactly which doors this keeps open:** multiplayer at block and slot granularity, branches, time travel, readable diffs ("Hero: headline changed"), agent proposals, offline with reconnect. **The one door it does not open:** two people typing inside the *same text slot at the same moment* and both keystroke streams surviving. With this design the later commit wins per slot (with a visible "Ana is editing" lock while someone types). If that ever matters, add a text CRDT *inside* rich-text slots only (Yjs `Y.Text` or Loro text), keyed by slot address; the rest of the model stays the same. Slots are short (headlines, paragraphs), so I expect a soft lock to be enough [E].

### 2.6 D6 — The preview container (one-way: the isolation rule)

| Option | Style isolation | Security | Phone/tablet width | Patch speed | Click-to-select |
|---|---|---|---|---|---|
| Same React tree | None: editor CSS and site Tailwind themes collide; preflight resets fight | Site content runs with the editor's cookies and DOM | Container queries only; `vw`, `vh`, `fixed` wrong | Fastest | Trivial |
| Same-origin iframe (Puck's model) | Full | Frame can read `parent` and the editor's storage | Real viewport | Shares the editor's main thread | Parent can reach into the frame's DOM |
| **Cross-site iframe** | Full | Frame cannot touch the editor, its cookies or storage; runs in its own process | Real viewport | Own main thread; postMessage overhead ~0.1 ms | Through messages; overlay lives in the frame |
| Sandboxed opaque-origin iframe (`sandbox="allow-scripts"`) | Full | Strong, no second domain needed | Real viewport | Same process as the editor in many cases [E] | Through messages |
| Shadow DOM | Partial (inherited properties, `@font-face`, `@property` and `:root` tokens leak in or out) | None | Container queries only | Fastest | Easy |

Measurements [M] (section 3.6):
- `postMessage` round trip from editor to a preview iframe, including applying a `setContent` op, React render and forced layout in the frame: **p50 ≤ 0.1 ms, p95 0.3 ms** for a cross-site frame (`127.0.0.1` inside a `localhost` page); same-origin p50 below the 0.1 ms timer resolution. The messaging cost is irrelevant next to a 16 ms frame.
- **Main-thread isolation is real.** Streaming text into 48 sites every frame: with same-origin iframes the editor's own frame intervals were p95 21.7 ms, max 50 ms (7 frames over 20 ms in 2 s); with cross-site iframes the editor stayed at p95 5.0 ms, max 8 ms (none over 20 ms). The work moved to the frames' process.
- The Claude browser pane used for testing blocked sandboxed opaque-origin frames (`net::ERR_BLOCKED_BY_CLIENT`), so I could not measure that option. That is a policy of this test browser, not of the web platform.

**Recommendation: a cross-site iframe from day one [P].**
- Security: user content is text today, but images, embeds, custom-domain sites' scripts and later **foundry blocks (model-written code)** will run in the preview. On a separate site they can never read the editor's session or drive the editor's UI. This matters for an open-source, self-hostable product where people will add their own blocks.
- Fidelity: the frame runs the *published* renderer, so the preview is the published site, at a real viewport width.
- Responsiveness: rendering, image decoding and text streaming run on another main thread.
- **Development:** editor on `http://localhost:3000`, frame on `http://127.0.0.1:3001` (different sites; I tested exactly this pairing). Production: a second registrable domain (like `googleusercontent.com` for Google), because a subdomain of the editor's domain is same-site: it gets no process isolation and receives the parent domain's cookies. Choosing that domain is the founder's call (question 1).
- The frame is static: an HTML file plus the renderer bundle, no cookies, no auth. All data comes from the editor by message. It can be served from Cloudflare static assets for free and cached forever by hash.

**The one-way door** is the rule, not the origin: *the editor never reads or writes the preview's DOM; everything crosses the protocol in D7.* If the team starts with a same-origin iframe and lets editor code reach into `iframe.contentDocument` (as Puck does), moving to a separate origin later means rewriting selection, overlay, inline editing and drag and drop. With the rule, the origin is configuration.

### 2.7 D7 — The editor ↔ preview protocol (one-way)

Messages are plain objects, checked with a schema on receipt, and accepted only from the expected origin (`event.origin === FRAME_ORIGIN` in the editor, `=== EDITOR_ORIGIN` in the frame). Full protocol in section 3.2. Principles:
- **Ops in, events out.** The frame never decides anything; it reports what the user pointed at or typed, and the editor turns that into ops.
- **Batched per animation frame.** The editor collects all ops (area 3's `slot` events, local edits) and posts one `ops` message per frame. With area 3 emitting at word boundaries that is at most ~60 messages a second.
- **Versioned.** `hello`/`ready` exchange a protocol number and the frame's runtime and block-registry versions, so a cached old frame is detected and reloaded.
- **Addresses, not DOM nodes.** Everything is addressed by `Addr = { siteId, blockId, slot? }`, the same type chat uses for "point at something".

### 2.8 D8 — Responsive preview (one-way, through the block contract)

The editor shows phone (390), tablet (768) and desktop (1280) by **resizing the iframe**, which gives a real viewport. That alone would allow viewport media queries. But The Wall (D12) renders sites scaled inside one document, and there a viewport query sees the wall's viewport, not the tile's. So:

**Requirement on area 2 [P]:** blocks are responsive through **container queries only**: the site root is `container-type: inline-size; container-name: site`, blocks use Tailwind v4 container variants (`@md:`, `@lg:`), and fluid sizes use `cqi` instead of `vw`. Container queries are supported since Chrome 105, Firefox 110, Safari 16 ([MDN BCD](https://github.com/mdn/browser-compat-data/blob/main/css/at-rules/container.json)) [V]. Verified in my experiment [M]: a 1280 px-wide site scaled by `transform: scale(0.123)` still lays out at its 1280 px desktop breakpoint, because `transform` does not change layout size (screenshot check, section 3.6).

Benefits beyond The Wall: phone and desktop previews side by side in one frame later; tiles on a phone can render the *phone* layout of each site, which reads better at thumbnail size.

### 2.9 D9 and D10 — Selection, overlay and inline editing

**Markers blocks must emit (requirement on area 2) [P]:**

```html
<section data-block-id="b7" data-block-type="hero" data-variant="split">
  <h1 data-slot="title">Fresh khachapuri every morning</h1>
  <p data-slot="sub">…</p>
  <a href="#"><span data-slot="cta.label">Book a class</span></a>
  <img data-slot="image" data-slot-kind="image" …>
  <ul><li data-item="k3f"><h3 data-slot="items.k3f.title">…</h3></li></ul>
</section>
```

- The block root carries id, type and variant. The renderer adds these, so block authors cannot forget them; block authors only mark slots.
- A text slot's element contains **only** that slot's text (no sibling text nodes, no wrappers inside). Rich slots render only the constrained mark tree (bold, italic, link). This makes `contenteditable` on that element map 1:1 to `setContent`.
- List items carry `data-item` with the item id (D3).
- Blocks take an `edit` render mode from context: links do not navigate, forms do not submit, timers and autoplay stop, `<details>` stays as the user left it.

**Overlay [P].** The frame mounts a small "bridge" with its UI in a shadow root (so the site's CSS cannot style it, and it cannot style the site). Hover: `pointermove` → `closest('[data-slot],[data-block-id]')` → outline drawn at `getBoundingClientRect()`, coalesced per animation frame. Selection is stored as an `Addr`, not as a DOM node, and re-resolved after every commit, on scroll and through one `ResizeObserver`, so it survives re-renders and variant swaps. Hover never crosses the protocol except throttled for a status bar; clicks do (`click {addr, rect}`), and the editor decides selection.

**Inline text [P].** Double-click (or Enter on a selected slot) sets `contenteditable="plaintext-only"` on the slot element (Chrome 51, Firefox 136, Safari 5 per [MDN BCD](https://github.com/mdn/browser-compat-data/blob/main/html/global_attributes.json)) [V]. Input events post `textEdit {addr, value, final:false}` debounced ~150 ms; blur or Enter (single-line slots) posts `final:true`; Escape reverts. The editor applies these as `setContent` ops in one transaction per session. While a slot is being edited, the frame ignores incoming ops for that slot so React does not move the caret. A small counter shows the slot's min/max length from the block contract. Rich slots get Tiptap later.

**"Point, then say" [P].** In the chat composer, a pointer button (or Alt-click in the preview) adds the clicked `Addr` as a chip ("Hero › headline"). The chat request carries `pointer: Addr[]` plus the block type, variant and current text for each, so area 3's edit router resolves "this" without guessing.

**Libraries [V sizes measured by me, M]:**

| Library | Version | Added gzip | When |
|---|---|---|---|
| Tiptap (core + document/paragraph/text/bold/italic/link) | 3.34.0 | +112 KB | **Later**, lazy-loaded in the frame for rich slots only |
| Lexical (plain text) | 0.53.0 | +109 KB | No: Tiptap is the research's pick and the schema we need is tiny |
| `@dnd-kit/react` | 0.5.3 | +39 KB | **Later**, with the drag-and-drop editor. Reordering in v1 = "move up/down" buttons and chat |
| `@floating-ui/react-dom` | 2.1.9 | +7 KB | When a floating toolbar needs flip/shift at edges |
| Puck | `@puckeditor/core` 0.24.0 (2026-11-13) [V] | — | **Skip the Puck spike** the research suggested: its canvas assumes same-origin DOM access and its own Zustand state, the two things D1 and D6 rule out. Two weeks a solo founder does not have |

Drag and drop across a cross-site frame (later) [P]: when a drag starts in the editor, the editor asks the frame for drop-target rects (`rects` request), lays a transparent capture layer over the iframe, computes the insertion point locally, and emits `addBlock`/`moveBlock`. Drags *within* the page happen entirely inside the frame and report the result as an event.

### 2.10 D12 — The Wall as a rendering problem (measured)

The experiment (section 3.6) rendered 48 generated sites of ~274 elements each (13,162 elements in total), at 1280 px design width, scaled to tiles about 158 px wide, in a 1014 × 930 pane at DPR 2 on an Apple-silicon Mac (Chromium 156) [M]:

| Approach | All 48 painted | Editor-document JS heap | Elements | Scroll frames over 20 ms | Text streaming into all 48 every frame, p95 / max frame |
|---|---|---|---|---|---|
| **One document, 48 React trees, `transform: scale`** | **120 ms** | **9.7 MB** | 13,162 | 0 | **10.3 / 15.5 ms** |
| 48 same-origin iframes (React in each) | 512 ms | 41.8 MB | 13,546 | 0 | 21.7 / 50 ms |
| 48 cross-site iframes | 435 ms | 4.6 MB here, **45.4 MB** in the frames' process | — | 0 | (parent unaffected; work in frames' process) |
| Static server HTML in 48 shadow roots, one shared constructable stylesheet | 99 ms | 2.3 MB | 13,162 | 0 | n/a (static) |
| Static server HTML in light DOM | 76 ms | 2.9 MB | 13,162 | 0 | n/a (static) |
| 96 React trees (two screens) | 172 ms | 21.5 MB | 26,314 | 0 | 22.5 / 27.8 ms |
| 96 React trees + `content-visibility: auto` | 178 ms | — | 26,314 | 0 | 25.3 / 35.8 ms (no gain: the cost is React work, not layout) |

Heap figures are V8 heap only (`performance.memory`); DOM memory is not included. Server-rendered images were not built: they need a headless browser per tile (seconds each) and would break the one-second promise; they remain useful for share cards.

**Recommendation [P]:**
- **The Wall is the preview runtime in `wall` mode, inside one cross-site iframe.** One document, 48 live React trees, each wrapped as `<div style="width:1280px; transform:scale(s)">` inside a `contain: strict` tile. It costs ~4× less memory and paints ~4× faster than an iframe per tile, keeps the editor responsive (own process), and every tile is already live, so there is no "upgrade on hover" machinery to build.
- **No shadow DOM.** The 48 themes do not need it: themes are CSS custom properties on each site root and all blocks share one stylesheet (requirement on area 2: no `:root`/`html`/`body` selectors in block CSS; tokens never compiled in with Tailwind's `@theme inline`).
- **Text arrives once for all tiles.** Area 3 writes text per section type and sends `slot` events that fill every site at once. Keep wall content in one shared map keyed by section type and slot, so one event is one `setState`. Coalesce to at most one commit per frame and, if a frame would update more than ~40 tiles, spread them over frames (measured ~0.2 ms per tile update; 96 per frame cost ~20 ms) [M].
- **Static HTML first paint is not needed now.** Light-DOM HTML paints 48 tiles in 76 ms vs 120 ms for React [M]; the 44 ms gain does not justify a second render path. Revisit only for an SEO-visible public gallery.
- **Virtualise past one screen** with TanStack Virtual (+10 KB [M]) when the wall grows beyond ~48 or on phones (mount ±1 screen of tiles).
- **Fonts [E]:** 48 tiles can name up to ~20 type pairings. Cap a wall to ≤ 16 families, self-hosted WOFF2 Latin subsets, 1–2 weights each (~20–40 KB each, so ≤ ~600 KB), `font-display: swap` (a swap at thumbnail size is invisible). Area 2 supplies a font manifest per theme so the frame can preload exactly what the first screen needs.
- **Images [P]:** `sizes` cannot see a CSS transform, so a scaled 1280 px site would download full-width images for 158 px tiles. The image component must read a `renderScale` from context and request `tileWidth × DPR` (~300–450 px) from the image resizer, upgrading when a tile opens.
- **`inert` on every tile's site subtree**; the tile itself is a focusable button (section 2.17).

Performance budget for The Wall (on a 2023-class laptop; phones show fewer tiles) [P, anchored on M]:

| Metric | Budget | Measured on the fake library |
|---|---|---|
| Wall skeletons in → 48 tiles painted | ≤ 250 ms (real blocks are ~2–3× larger than my fake ones [E]) | 120 ms |
| Frame JS heap | ≤ 40 MB | 9.7 MB |
| Elements | ≤ 45,000 | 13,162 |
| Text arrival | ≤ 1 commit per frame, ≤ 40 tile updates per frame | 48 per frame at p95 10.3 ms |
| Scroll | 0 frames over 20 ms | 0 |
| Cross-breed result visible | ≤ 1 frame + 200 ms transition | single-tile render ~0.5 ms [M] |
| Swipe → replacement chosen | ≤ 50 ms client-side | not built |
| Fonts per wall | ≤ 16 families, ≤ 600 KB | not built |
| Images per wall | ≤ 1.5 MB at thumbnail size | not built |

### 2.11 D13 and D14 — Cross-breeding and taste

**Cross-breed needs no model [P].** Area 3 already sends each wall site as ops plus a feature map, and text is per section type. So "layout of A with the style of B" is:

```ts
function crossbreed(layout: Spec, style: Spec): Spec {
  return { ...layout, theme: style.theme };            // order, blocks, variants, content from A; tokens, fonts, palette from B
}
```

Then run area 2's deterministic quality checks (contrast, for example B's dark palette on A's image-backed hero). If one fails, step to the nearest passing theme variant in the same family and say so on the tile. Only if A's layout uses a section type the wall has no text for does it need area 3's small text call (area 3 D14 says the same).

Interaction: drag a tile onto another (pointer events inside the one wall document; no dnd-kit needed). On drop, the target shows two halves, "A's layout + B's style" and "B's layout + A's style"; the hybrid appears as a new tile next to the target with a small badge and a view transition. Keyboard: select tile A, press `L` ("take layout"), move to B, press Enter.

**Swipe to teach [P].** Desktop: hover shows "Less like this" and "More like this", keys ← and →. Touch: horizontal swipe on a tile with an 80 px threshold. A disliked tile collapses and a replacement slides in; a liked one gets a mark and pulls similar candidates forward.

Client logic:
- Features per site = area 3's feature map (theme family, type pairing, palette strategy, density, corners, imagery, hero family, layout signature), one-hot encoded.
- Model: online logistic regression with a small prior, updated per event (a few hundred weights; microseconds).
- Replacement: score the remaining candidate pool (area 3 draws `4N` and keeps `N`; ask it to send the extra candidates too, or re-run the shared sampler locally as area 3 proposes) and pick by maximal marginal relevance (score minus similarity to tiles already shown), so the wall moves toward taste without collapsing into 48 copies.
- The caption ("You prefer warm serif, editorial layouts, photo-led") = labels of the top positive weights.

**What gets recorded (the one-way part, because past data cannot be recollected) [P]:**

```ts
type WallEvent = {
  wallId: string; genId: string;         // links to area 3's generation record
  siteId: string; features: Record<string, string>;
  action: "impression" | "hover" | "open" | "like" | "dislike" | "crossbreed" | "publish";
  partnerSiteId?: string;                // for crossbreed: the other parent
  role?: "layout" | "style";             // which side this site gave
  position: number; dwellMs?: number; at: number;
};
```

Batched to the server every few seconds. Whether it is kept and used across users is question 4.

### 2.12 D15 — The chat panel (two-way)

- **assistant-ui** 0.15.36 has an official TanStack Start example in its repository (`examples/with-tanstack`, TanStack Start 1.169, React 19.3, Vite 8) ([repo](https://github.com/assistant-ui/assistant-ui/tree/main/examples/with-tanstack)) [V]. It works with TanStack Start. Cost: primitives plus the external-store runtime add **+111 KB gzip** over React [M]; its dependencies include Zustand, Radix and Zod ([npm](https://www.npmjs.com/package/@assistant-ui/react)) [V]. It is built for long streamed assistant text, tool UIs and threads.
- **AI SDK UI** (`useChat` from `@ai-sdk/react` 4.0.176): **+57 KB gzip** [M]. It expects AI SDK's UI message stream; area 3 deliberately streams its own NDJSON protocol (area 3 D15).
- **Plain:** our reader of area 3's events, a list of typed items, a textarea. Roughly 300–500 lines [E].

**Recommendation: build plain.** Replies here are mostly operations and one-line confirmations, and the event protocol is ours. Neither library's model of "a message" fits "an applied transaction with an undo button".

Message types (section 3.4 has the full union): user text with pointer chips; applied operations (summary, count, Undo/Redo); progress (stage, cancellable); clarifying question (buttons, free text allowed) from area 3's `ask`; alternatives (two or three mini-previews to pick, from area 3's `suggest`); short assistant text; warning or error with retry. The thread is `role="log"` with polite announcements. Virtualise with TanStack Virtual only when threads exceed ~200 items.

### 2.13 D16 — Perceived speed (two-way)

- **Speculative generation while typing:** exactly area 3's D16. On the landing box: ≥ 6 words and a 400 ms pause → start the request with `speculative: true`, buffer events, abort on change. Use TanStack Pacer's debouncer (+3.5 KB [M]) — a good TanStack fit.
- **No skeletons.** The first `spec` event already has library copy in every slot (area 3), so the first paint is a complete-looking site. Gray boxes would be slower to read and cause a second visual jump.
- **Text into slots without layout shift:** area 3 sends `slot` events at word boundaries with `final`. Library copy is chosen to match each slot's typical length, so most swaps change height little. For the hero headline, reserve `min-height` equal to its library-copy line count (in `lh` units) until `final`. Each replaced slot gets a 150 ms opacity fade. Measured apply cost is ~0.2 ms per op [M]; the concern is visual stability, not CPU.
- **Variant swaps and moves:** wrap the commit in a view transition with `view-transition-name: blk-<siteId>-<blockId>` on each block root (names must be unique per document, hence the site prefix in The Wall). `document.startViewTransition` ships in Chrome 111, Firefox 144, Safari 18 ([MDN BCD](https://github.com/mdn/browser-compat-data/blob/main/api/Document.json)) [V]; React 19.3.1 exports `ViewTransition` (checked in the installed package) [V]. Off under `prefers-reduced-motion`.
- **Slow path (~1–1.5 s):** keep the current site fully interactive; show a progress item in chat with the stage and a Cancel button; shimmer only the targeted block when the edit has a target. Never block the preview.
- **Opening a tile:** FLIP-zoom the tile to full width inside the frame (the tree is already live), then switch routes with the spec in hand. No loading screen.

### 2.14 D17 — Routes and screens (two-way)

TanStack Start supports per-route `ssr: true | false | 'data-only'`, inherited and only tightenable by children ([selective SSR guide](https://github.com/TanStack/router/blob/main/docs/start/framework/react/guide/selective-ssr.md)) [V].

| Route | Screen | SSR | Notes |
|---|---|---|---|
| `/` | Landing with the prompt box | `true` | Fast first paint and SEO. Speculation starts here |
| `/w/$wallId` | The Wall | `false` (shell SSR'd by the root) | The content lives in the cross-site frame |
| `/s/$siteId` | Editor: chat + preview | `false` | Loader gets snapshot + `seq` through TanStack Query |
| `/s/$siteId/settings` | Publish, domain, SEO, favicon | `true` | Ordinary forms (TanStack Form later) |
| `/s/$siteId/history` | Versions and branches | `false` | Later |
| `/sites` | My sites | `true` | Signed-in only |
| `/sign-in` | Auth | `true` | Area 4 |
| frame origin `/frame` | Preview / wall runtime | static | Separate Vite entry, not a route of the app |

**Generating before sign-in [P]:** the first generation creates an anonymous draft owner (an HTTP-only signed cookie with a random id). Drafts are stored server-side under it with a TTL (say 7 days). Signing in claims every draft for that id. Publishing needs an account. How much an anonymous visitor may do is already area 3's question 2; I add only that the client needs nothing different either way.

### 2.15 D18 — Phones (two-way, product-dependent)

- **The Wall on phones** fits the device: two columns, each tile rendering the *phone* layout (390 px design width, thanks to container queries), virtualised, swipe native.
- **The editor on phones:** two tabs, Chat and Preview, with the pointer chip set by tapping in the preview. Chat-driven edits, undo, theme and variant pickers work. Drag and drop and inline rich-text editing are desktop-first.
- Touch targets ≥ 44 px; `100dvh` layouts; no hover-only affordances.

### 2.16 D19 — Accessibility and budgets for the builder itself

Accessibility [P]:
- Chat is `role="log"` with `aria-live="polite"`; each applied transaction is announced in one sentence.
- An **outline panel** (blocks as a `role="tree"`, slots as children) is the keyboard path to selection, moving, and "point at". The preview is not the only way to reach a block.
- The Wall is a grid with roving tabindex; each tile is a button named from its features ("Site 7: warm serif, dark, editorial"); its site subtree is `inert`. Like/dislike/cross-breed all have keys.
- Focus moves into the frame only for inline editing, and Escape returns it.
- Reduced motion disables view transitions and FLIP.

JS budgets, measured building blocks [M]: React + ReactDOM 19.3.1 = 68.9 KB gzip; TanStack Router +27.5 KB; TanStack Store +2.2; Query +9.7; Pacer +3.5; Virtual +10.1; my whole fake preview runtime (React + store + 10 block types) 73.8 KB.

| Bundle | Budget (gzip JS) [P] |
|---|---|
| Landing `/` | ≤ 110 KB (React 69 + router/Start ~30 + prompt UI ~10) |
| Editor initial | ≤ 200 KB; Tiptap, dnd-kit, Floating UI lazy |
| Preview/wall runtime core | ≤ 120 KB; each block type a lazy chunk ≤ 10 KB |
| Op → pixels in the preview | ≤ 1 frame (measured 0.2–0.3 ms apply + layout, 0.1 ms messaging) |
| Editor interactions | INP ≤ 100 ms |

---

## 3. Store shape, protocols and the Wall design

### 3.1 Store shape (editor window)

```ts
// Shared from area 1: Spec, Op, applyOp(spec, op): Applied, validate(spec)
type Addr = { siteId: string; blockId: string; slot?: string };   // slot = content path, e.g. "items.k3f.title"

type Txn = { id: string; label: string; source: "chat" | "inline" | "panel" | "drag" | "undo";
             ops: OpEnvelope[]; inverses: Op[]; genId?: string };

// One TanStack Store per concern, so hover or chat updates never notify doc subscribers.
const doc = new Store<{
  siteId: string;
  confirmedSeq: number;
  confirmed: Spec;               // as of confirmedSeq
  pending: OpEnvelope[];         // optimistic, not yet acked
  view: Spec;                    // confirmed + pending; what the preview shows
  frameVersion: number;          // increments per batch posted to the frame
  streamingSlots: Record<string, true>;   // `${blockId}/${slot}` currently receiving text
}>(…);

const history   = new Store<{ undo: Txn[]; redo: Txn[]; openTxn?: string }>(…);
const selection = new Store<{ selected: Addr[]; editing?: Addr; pointer: Addr[] }>(…); // no hover here
const chat      = new Store<{ items: ChatItem[]; activeGen?: { genId: string; abort: () => void } }>(…);
const ui        = new Store<{ device: "phone" | "tablet" | "desktop"; panel: "chat" | "outline" | "theme" }>(…);
const conn      = new Store<{ status: "online" | "offline" | "saving"; lastError?: string }>(…);
```

The frame (preview and wall) has its own store: `{ mode: "edit" | "wall"; sites: Record<siteId, Spec>; wallText?: Record<sectionType, Record<slot, string>>; selected: Addr[]; editing?: Addr }`. It applies ops with the same `applyOp`.

### 3.2 Editor ↔ frame protocol v1

```ts
// editor → frame
type ToFrame =
  | { t: "hello"; protocol: 1; mode: "edit" | "wall"; device?: { width: number } }
  | { t: "load"; sites: { siteId: string; spec: Spec }[]; version: number }        // full snapshot
  | { t: "ops"; siteId: string; ops: Op[]; version: number }                        // one batch per frame
  | { t: "wallText"; updates: { sectionType: string; slot: string; text: string; final: boolean }[] }
  | { t: "select"; addrs: Addr[] }
  | { t: "point"; addrs: Addr[] }                                                   // chat chips highlight
  | { t: "edit"; addr: Addr | null }                                                // start/stop inline edit
  | { t: "scrollTo"; addr: Addr }
  | { t: "transition"; blockIds: string[] }                                         // next batch: view transition
  | { t: "rectsRequest"; reqId: string; siteId: string };

// frame → editor
type FromFrame =
  | { t: "ready"; protocol: 1; runtime: string; blocks: string }                    // versions
  | { t: "applied"; version: number; ms: number }
  | { t: "click"; addr: Addr; rect: Rect; mods: { alt: boolean; shift: boolean; meta: boolean } }
  | { t: "hover"; addr: Addr | null }                                               // throttled, optional
  | { t: "textEdit"; addr: Addr; value: string; final: boolean }
  | { t: "rects"; reqId: string; items: { addr: Addr; rect: Rect }[] }
  | { t: "renderError"; addr: Addr; message: string }                               // per-block error boundary
  | { t: "wall"; ev: "open" | "like" | "dislike" | "crossbreed"; siteId: string; partner?: string; role?: "layout" | "style" };
```

Rules: check `event.origin` on both sides; validate with a schema; drop unknown `t`. If `applied.version` lags by more than a few batches, or `ready.protocol` differs, reload the frame and send `load`.

### 3.3 Data flow, end to end

```
landing prompt ─(debounce 400 ms, ≥6 words)─► POST /api/generate (speculative, area 3)
                                                │ NDJSON GenEvent
                                                ▼
                                   editor: GenEvent reader
          spec/slot events ─► OpEnvelope(actor: ai, txn: genId) ─► doc.view (applyOp)
                                                │ rAF batch                 │ ack/seq
                                                ▼                           ▼
                                  frame (cross-site iframe)        server op log (seq)
                                  applyOp → React → pixels         later: Durable Object per site
                                                │                     broadcasting to collaborators
           click/textEdit events ◄──────────────┘
           → OpEnvelope(actor: user) → same path
```

### 3.4 Chat item types

```ts
type ChatItem =
  | { kind: "user"; id: string; text: string; pointer: Addr[]; at: number }
  | { kind: "applied"; id: string; txn: string; summary: string; opCount: number; state: "applied" | "undone" | "partly-undone" }
  | { kind: "progress"; id: string; genId: string; stage: "planning" | "writing" | "images" | "checking"; cancellable: boolean }
  | { kind: "question"; id: string; text: string; options: string[]; allowFree: boolean; answered?: string }
  | { kind: "alternatives"; id: string; items: { label: string; ops: Op[] }[]; picked?: number }   // previews rendered in mini frames or as variant thumbnails
  | { kind: "assistant"; id: string; text: string }
  | { kind: "notice"; id: string; level: "warn" | "error"; text: string; retry?: boolean };
```

### 3.5 The Wall, component tree

```
/w/$wallId (editor app)
└─ WallPage
   ├─ WallToolbar  (brief, "more like this", taste caption, undo last swipe)
   └─ <iframe src="https://<frame-domain>/frame?mode=wall">     ← one cross-site document
      └─ FrameRoot (mode="wall")
         ├─ FontLoader (manifest of first-screen themes)
         ├─ WallGrid (CSS grid; TanStack Virtual when > 1 screen or on phones)
         │  └─ Tile × N   <button> 158–240 px, contain: strict, roving tabindex
         │     ├─ <div inert style="width:1280px;transform:scale(s);transform-origin:0 0">
         │     │    └─ SiteRoot (container-type:inline-size; theme CSS variables)
         │     │         └─ Block × k  (memo per block; reads shared wallText)
         │     └─ TileActions (like / dislike / take layout) – shadow-root bridge UI
         ├─ DragLayer (pointer events; cross-breed drop halves)
         └─ TasteModel (logistic weights + MMR re-ranking; emits WallEvents)
```

### 3.6 Experiment method (throwaway, in the scratch folder)

- Code: `…/scratchpad/tech-5/wall/` (`src/site.jsx` fake library of 10 block types with variants and 12 palettes; `src/wall.jsx`; `src/tile.jsx`; `src/bench.jsx`; `build.mjs` bundles with esbuild, renders static HTML with `react-dom/server`, serves locally with optional COOP/COEP). Bundle sizes: `…/scratchpad/tech-5/sizes/`, each library imported with React and bundled by esbuild 0.28 with minification, gzip -9; numbers are the delta over React + ReactDOM alone (68,874 bytes).
- Environment: the Claude desktop browser pane, Chromium 156, 1014 × 930 CSS px, DPR 2, 10 cores, visible. `measureUserAgentSpecificMemory` was unavailable in this browser, so memory is `performance.memory.usedJSHeapSize` (V8 heap only). rAF intervals were ~4.2 ms at rest, so "frames over 20 ms" is a strict test.
- Fake sites are ~274 elements each; real block libraries will be larger, which is why the budgets above are ~2× the measured values.
- One run per configuration; figures are indicative, not statistics.

---

## 4. What to defer (do not build yet)

- Any CRDT, sync engine or WebSocket. Ship the server-ordered log over POST; the Durable Object comes with multiplayer.
- IndexedDB persistence of pending ops (offline). The design supports it; build it when offline matters.
- Branches, time slider, diff view. The log and snapshots make them possible; no UI now.
- Drag and drop (dnd-kit), rich text (Tiptap), floating toolbars (Floating UI). Ship chat edits, up/down moves, plain-text inline editing.
- The Puck spike.
- assistant-ui and AI SDK UI.
- Static-HTML or image thumbnails for The Wall; per-tile iframes.
- TanStack DB. Revisit after its 1.0 for the sites dashboard if it ever needs live queries.
- A taste model on the server; cross-user priors (needs question 4 answered and data).
- Multi-page touring in Wall tiles (area 3's research also allows skipping it).
- Phone drag and drop and phone rich-text editing.

---

## 5. Requirements on the other five areas

**Area 1 (spec and operations)**
1. `applyOp(spec, op)` is pure, shared by server, editor and frame, never throws, and returns the inverse op: `{ spec, inverse } | { rejected }`.
2. Ops are intent-based and addressed by stable ids: block ids; list-item ids inside blocks; ordering by "after id" or fractional index. No array-index paths in the op itself.
3. The envelope fields in section 2.3 (`id`, `txn`, `actor`, `baseSeq`, `seq`) are part of the log format.
4. A slot address format (`blockId` + content path with item ids) used identically by blocks, ops, selection and chat.
5. Validation that the server runs per op (the contract checks), with a reason string the chat can show.
6. A cheap `diffSummary(txn)` that produces one human sentence ("Hero: headline changed") for chat and, later, history.

**Area 2 (blocks, themes, rendering)**
1. Responsive through container queries only (`@container` on the site root, Tailwind v4 `@sm:`/`@md:`/`@lg:`, `cqi` units); no `vw`/`vh` for layout; no viewport media queries.
2. Theme tokens are runtime CSS custom properties set on the site root; no `:root`, `html` or `body` selectors in block CSS; no `@theme inline` for theme tokens; one shared stylesheet for all blocks.
3. Slot markers as in section 2.9: `data-slot` on an element that contains only that slot's text; `data-item` for list items; `data-slot-kind="image"` for images. The renderer adds `data-block-id`, `data-block-type`, `data-variant`.
4. A render context `{ mode: "edit" | "wall" | "live", renderScale: number }`: in edit and wall modes links, forms, timers and autoplay are inert; images request `tileWidth × DPR`.
5. Rendering is pure: no reads of `window` size, randomness or time during render; stable React keys by id; one error boundary per block.
6. One renderer entry usable for N sites in one document (`renderSite(spec, ctx)`), the same one the published site uses.
7. A font manifest per theme (family, weights, WOFF2 URLs, `unicode-range`), and a cap on families per wall.
8. Client-side runnable quality checks (contrast at least) for cross-bred specs.
9. Blocks split into lazy chunks per type, so the frame can load a new block (including foundry blocks) without a full reload.

**Area 3 (decision and text pipeline)** — the event protocol v1 in `03-generation-pipeline.md` fits. Additional asks:
1. Every `spec` event carries a `txId` (it does) and every `slot` event carries the `genId`/`txId` it belongs to, so streamed text joins the turn's undo transaction.
2. For The Wall, `slot` events keyed by section type and slot (text is shared per type), not only by `blockId`.
3. Send the reserve candidates (or the sampler seed and inputs) so "more like this" and swipe replacement run client-side.
4. Accept `pointer: Addr[]` with block type, variant and current text in edit requests.
5. `ask` and `suggest` events get ids so the chat can post the answer back.

**Area 4 (repo, runtime, storage, hosting)**
1. Packages: `spec` (types, `applyOp`, validate; used by server, editor, frame), `blocks`, `app` (TanStack Start), `frame` (a separate static Vite entry for preview and wall).
2. Serve `frame` from a second registrable domain in production and from `127.0.0.1:<port>` in development; long-cache by hash; a CSP with `frame-ancestors` limited to the editor origin.
3. Op log storage: `ops(siteId, branchId, seq, id, txn, actor, op, at)` with idempotent insert by `id`, and snapshots every ~100 ops. Room for a Durable Object per site later.
4. Anonymous draft ownership by signed cookie, claim on sign-in.
5. Endpoint to receive `WallEvent` batches.

**Area 6 (apps, forms, foundry)**
1. Foundry blocks run only in the frame origin, never in the editor origin.
2. Forms and app blocks honour `mode: "edit" | "wall"` (no submission, no network calls, no timers).
3. Interactive blocks expose their internal state to the editor only through ops (for example "which tab is open" is not spec state; "which tabs exist" is).

---

## 6. Questions for the founder

1. **A second domain for the preview.** The secure design serves the preview from a domain separate from the builder's own (as Google does with `googleusercontent.com`). *Path A:* plan for a second domain once the name is chosen; cost about one domain registration a year and one more Cloudflare route; strongest isolation, preview runs in its own process. *Path B:* use a subdomain of the main domain; free, but the preview shares the editor's process and cookies scoped to the main domain, so foundry blocks and embeds must be trusted more. Development works either way. (CLAUDE.md says not to choose or register names, hence the question.)
2. **Is editing on a phone a goal for the first public version?** *Path A:* phone = The Wall + chat edits + undo + theme/variant pickers; drag and drop and inline rich text desktop-only. Small extra cost (a tabbed layout). *Path B:* full editor on phones, including drag and drop and inline editing. Several extra weeks of touch-specific work, and harder testing.
3. **Simultaneous typing in the same text.** *Path A:* when two people edit the same headline at once, a soft lock shows who is typing and the later commit wins. No extra machinery. *Path B:* true character-level co-editing inside text slots. Adds a text CRDT (Yjs, +19 KB, or Loro, ~1.2 MB WASM) for rich slots, plus its storage. Only matters once multiplayer exists.
4. **Taste data from The Wall.** *Path A:* send likes, dislikes and cross-breeds to the server and, later, learn from all users together (better walls for everyone; needs a privacy note and a retention rule). *Path B:* keep taste on the device only (simplest privacy story; no cross-user learning, and the wall starts cold for every new visitor).

---

## 7. Risks

1. **Biggest risk: ops that are not intent-based.** If area 1 ships index-based JSON Patch as the op itself, rebase, offline, collaborative undo and branch merge all break silently (an op lands on the wrong block). Countermeasure: requirement 2 on area 1, plus a property test that applies random concurrent op pairs in both orders and checks the result is valid and preserves each op's intent.
2. **Cross-site frame friction.** Debugging across processes, two dev servers, and later drag-and-drop from the editor into the frame. Countermeasure: the protocol is small and typed; a dev-only "same-origin" switch for debugging is allowed as long as editor code still talks only through the protocol; the rect-request pattern for drag and drop.
3. **Real blocks are heavier than my fake ones.** Walls of 48 real sites may be 3× the elements and need images and fonts. Countermeasure: the budgets in section 2.10, virtualisation, tile-size images, a font cap; re-run the experiment with the M0 library.
4. **Text streaming causes visible jumpiness.** Countermeasure: word-boundary updates (area 3), length-matched library copy, reserved hero height, fades; measure CLS on the M0 briefs.
5. **TanStack Store is 0.x** and has already renamed its React hook. Countermeasure: our own hooks wrap it; Zustand is a drop-in fallback.
6. **Inline editing fights React.** Caret jumps if React re-renders a slot being edited. Countermeasure: the frame ignores ops for the slot being edited and renders it uncontrolled until commit.
7. **Firefox and Safari behaviour** was not measured (section 8).

---

## 8. Not verified

- All performance numbers come from one machine (Apple silicon, Chromium 156 in the Claude desktop pane), single runs, with a fake block library. Not measured on Firefox, Safari, Android or iOS.
- Memory figures are V8 heap only; DOM and GPU memory were not measured (`measureUserAgentSpecificMemory` was unavailable in that browser).
- Sandboxed opaque-origin iframes could not be tested (blocked by the test browser).
- Whether the cross-site test frames really ran in a separate process was inferred from the editor's unaffected frame times and separate heap, not inspected in a task manager.
- assistant-ui's size was measured for its primitives and external-store runtime only, not with its styled components or markdown.
- Font budget figures (20–40 KB per WOFF2 subset) are estimates, not measured.
- Durable Object costs for a collaborative session, and LiveStore's suitability as a later replacement for our log, were not tested.
- The claim that "Figma-style" editors use selective undo with server-ordered ops is from general knowledge, not a source read today.
- React's `ViewTransition` export was checked in the installed package; its stability status in React 19.3 was not checked against release notes.
- Tailwind v4's handling of `@theme` variables overridden on a wrapper element was reasoned from how v4 emits `var(--…)` utilities, not tested in this experiment (the fake library used hand-written CSS).
