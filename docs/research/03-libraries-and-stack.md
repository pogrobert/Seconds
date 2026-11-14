# 03: Libraries and stack, a build-versus-adopt map for a spec-driven AI website builder

Research date: 13 to 14 November 2026.

**Evidence labels**

- **[V] verified:** I read the source file, LICENSE, official docs, or registry metadata myself.
- **[R] reported:** the claim comes from a secondary source, a vendor claim, or a search snippet.
- **[I] inference:** my own judgement.

Repo paths are on `main` unless noted. Sections 2 to 7 were researched by three parallel sub-investigations using the same method, and each claim keeps its label. Section 1 (json-render) I read line by line.

---

## 0. The short answer

Build on **our own spec**, a superset of json-render's flat `Spec` and of its `StartAppSpec` shape. Around it:

- **Take selectively from json-render:** depend on `@json-render/core` for patches, streams and expressions, and **fork** its Jev composer.
- **Build** the composer extensions, the theme and responsive layer, the exporter, the editor and the publish path ourselves.
- **Fill the catalog** from MIT and Apache sources only (shadcn on Base UI, coss/Origin, Magic UI free, Tremor Blocks and others), mostly written in-house. Ship it in **shadcn registry-item format** with a `meta.catalog` extension.
- **Adopt off the shelf:** assistant-ui for the chat pane, dnd-kit and Tiptap for editing, and Cloudflare (one renderer Worker plus Cloudflare for SaaS) for publishing.

The full table is in section 8.

---

## 1. Vercel json-render in depth

### 1.1 Facts on the ground

| Item | Finding | Label / source |
|---|---|---|
| License | Apache-2.0 for the repo and every npm package (`@json-render/core`, `react`, `tanstack-start`, `codegen`, `next`, `shadcn`, `directives`) | [V] `gh api repos/vercel-labs/json-render`; `npm view @json-render/*` |
| Status | Badged "Vercel Labs Product", still 0.x. Jev APIs are `experimental_`, "may change in any release", and the docs say to pin exact versions | [V] README.md line 8; `apps/web/content/docs/jev.mdx` |
| Releases | v0.19.0 (12 May), v0.20.0 (18 Aug), v0.21.0 (18 Sep, Jev arrives), 0.21.1–0.21.4 (Oct), v0.22.0 (4 Nov 2026, Chat SDK renderer) | [V] `gh api …/releases` |
| Popularity | About 19.6k stars, 1,040 forks, 121 open issues; repo created 14 Jan 2026 | [V] `gh api repos/vercel-labs/json-render` |
| Activity | Weekly commits over the last 8 weeks: 2, 1, 0, 3, 13, 3, 3, 6 | [V] `gh api …/stats/commit_activity` |
| Bus factor | One maintainer (`ctate`) has 185 commits. The next human has 16 | [V] `gh api …/contributors` |
| Packages | 33 in total: core, react, vue, svelte, solid, react-native, next, tanstack-start, shadcn, shadcn-svelte, codegen, directives, image (Satori), react-pdf, react-email, remotion, r3f, ink, chat, mcp, yaml, plus state adapters (zustand, jotai, redux, xstate) and devtools | [V] `gh api …/contents/packages` |

### 1.2 What the spec format supports

The core `Spec` is `{ root: string, elements: Record<id, UIElement>, state?: Record<string, unknown> }` [V] `packages/core/src/types.ts` L175–182.

`UIElement` has these fields [V] `types.ts` L58–80:
- `type`, `props`
- `children: string[]` and named `slots: Record<string, string[]>`
- `visible` (a condition)
- `on` (event → action binding or bindings)
- `repeat` (`{statePath, key}`)
- `watch` (state path → actions)

| Capability | Supported? | How | Source |
|---|---|---|---|
| State | Yes | `spec.state`, read and written with JSON Pointer paths. StateStore adapters exist for zustand, jotai, redux and xstate | [V] `types.ts`; `docs/data-binding.mdx` |
| Bindings | Yes | `$state` (read), `$bindState` (two-way), `$item` / `$index` inside repeats | [V] `docs/data-binding.mdx` |
| Computed values | Yes | `$template` (`"Hello ${/user/name}"`), `$computed` (named registered functions), `$cond` | [V] `docs/computed-values.mdx`, `docs/directives.mdx` |
| Custom expressions | Yes | `defineDirective` with Zod schema plus resolver. `standardDirectives`: `$format`, `$math`, `$concat`, `$count`, `$truncate`, `$pluralize`, `$join` | [V] `docs/directives.mdx` |
| i18n | Partial | `$t` directive with a locale → key → string map and fallback locale. No locale routing or translated slugs | [V] `packages/directives/src/i18n.ts` |
| Conditionals | Yes | `visible` with `eq/neq/gt/gte/lt/lte/not`, `$and`, `$or`, and comparison against other state | [V] `docs/visibility.mdx`; `types.ts` L109–165 |
| Repeats | Yes | `repeat.statePath`, nested via `{ $item: field }` | [V] `docs/data-binding.mdx` |
| Actions | Yes | Catalog actions with Zod params, `onSuccess`/`onError` chains, built-in `setState` etc. | [V] `packages/core/src/actions.ts`; `experimental-compose.ts` L25–30 |
| Watchers | Yes | `watch` runs actions when state changes (for example, cascading selects) | [V] `docs/watchers.mdx` |
| Form validation | Yes | `checks` on bound fields; built-ins such as `matches`, `lessThan`, `requiredIf`; custom functions. Async checks are not supported (issue #291) | [V] `docs/validation.mdx`; issue #291 |
| Routes, layouts, metadata | Yes, in the **framework packages** | `StartAppSpec = { metadata, routes: { "/blog/$slug": { page: Spec, layout, metadata, loader, staticParams, loading, error, notFound } }, layouts, state }`. A layout uses a `Slot` element | [V] `packages/tanstack-start/src/types.ts`; `packages/tanstack-start/README.md` |
| SEO metadata | Basic | title template, description, keywords, OpenGraph, Twitter, robots, canonical, icons. No JSON-LD, sitemap or hreflang | [V] `packages/tanstack-start/src/types.ts` (`StartMetadata`) |
| Data loading | Yes, at route level | Named `loader`s passed to `createStartApp`, results merged into state. Per-element loading on mount is an open feature request (#245) | [V] tanstack-start README; issue #245 |
| SSR | TanStack Start and Next.js SSR with full hydration. `@json-render/react` is client-only (context and hooks), so no RSC, and every registered component hydrates | [V] issue #369 (the "every component … hydrates" complaint is the issue author's) |
| Streaming | SpecStream: JSONL of RFC 6902 ops (`add`, `remove`, `replace`, `move`, `copy`, `test`). "Inline mode" mixes prose and patches | [V] `docs/streaming.mdx`, `docs/generation-modes.mdx`, `types.ts` L233–244 |
| LLM edit modes | Three: `patch` (RFC 6902), `merge` (RFC 7396, `null` deletes), `diff` (unified diff against serialized JSON). With more than one enabled, the model picks per edit | [V] `packages/core/src/edit-modes.ts` |
| Prompt generation | `catalog.prompt({customRules, mode})` builds the system prompt from the catalog. `buildUserPrompt` handles edits | [V] `docs/generation-modes.mdx`; `packages/core/src/prompt.ts` |
| Wire formats | JSON or YAML | [V] `prompt.ts` (`format?: "json" \| "yaml"`) |
| A2UI / AG-UI / MCP interop | Docs pages exist (`a2ui.mdx`, `ag-ui.mdx`); `@json-render/mcp` exists | [V] docs listing; packages listing |

What the spec does **not** have [V, by absence in `types.ts`, `StartAppSpec`, and code search for `theme`/`breakpoint`]:

- **Theme or design tokens.** "theme" appears only in app or demo theme toggles.
- **Responsive props or breakpoints.** Issue #355 says the shadcn `Grid` is a fixed `grid-cols-N` and breaks on phones.
- **Assets or images as a first-class type.** `@json-render/image` renders specs *to* SVG/PNG with Satori; it does not manage images.
- **CMS collections.** Collections can be approximated with loaders plus `repeat`.
- **Animation.** A GSAP request is open as #228.
- **Reusable fragments or templates.** These are proposed in #308.
- **Per-element style overrides or `className`.** Requested in #145.

### 1.3 How `experimental_composeSpec` works

Source:
- `packages/core/src/experimental-compose.ts` (680 lines)
- `experimental-composition-batch.ts` (~10 KB)
- `experimental-composition-tree.ts` (~5.6 KB)
- `experimental-evaluator.ts` (~3.8 KB)

All are [V].

**Inputs.** The composer takes:
- a catalog: Zod `props` per component, plus `slots` and `events`
- a list of **candidates**: `{ id, description, element: {type, props, on, visible}, root?, maxUses? (default 1), resource? }`

A candidate is a **fully configured component instance**. In the code's words: "The evaluator cannot modify its props or bindings" (L49). Candidates sharing a `resource` are mutually exclusive. That is how alternatives are offered: a BarGraph and a LineGraph for one dataset, or Hero variant A versus B.

**Candidate validation, before any model call** (`validateCandidate`, L104–170):
- The candidate must be atomic (only `type`, `props`, `on`, `visible`).
- Expressions are limited to `$state`, `$bindState`, `$and`, `$or`. Anything else throws "Unsupported composition expression".
- Props must pass the component's Zod schema, after resolving `$state` against `initialState`.
- Events must be declared by the component.
- Actions must be in the catalog or the built-ins, with params validated recursively, including `onSuccess`/`onError`.

**What Jev sees.** `state` holds `user_request`, the candidate `id` and `description` list (`capabilities`), and app `context`, plus the tree topology in sequential mode. Raw props, binding values and `initialState` are **never** sent (L340–352; batch L33–41; and jev.mdx "Initial state, raw props, and binding values are not sent automatically"). Every question is `{type: "choice", instructions, criteria: Record<key, description>}`. Jev must return a criteria key, optionally with a confidence.

**New tree, `strategy: "batch"` (the default for creation)** (`composeBatch`):

1. **Select call (one evaluation).** All questions go out in parallel:
   - `root`: which candidate is the outermost element, or `unavailable`.
   - One question per **group**. A resource group yields `omit` / `use:<id>`. A candidate with `maxUses > 1` yields "how many instances, 0..maxUses".

   The composer builds `node_0..node_n`, attaches every child to the root's default (or first) slot in catalog order, validates, and **yields a first preview immediately**.
2. **Layout call (one evaluation, skipped when trivial).** For each selected non-root element:
   - `parent_<id>`: the parent and slot, from the slots of all selected elements.
   - `order_<id>`: its position, 1..n-1.

   The tree is rebuilt on a private clone, sorted by order (ties keep catalog order), and validated as a whole. Cycles or excess depth **throw**, and the first preview stays as partial output.

So a new tree costs **at most two evaluations**. At Jev's roughly 100 ms per call plus Gateway overhead, a page skeleton arrives in a few hundred ms [I from V mechanics; the ~100 ms figure is from the brief, not measured].

**New tree, `strategy: "sequential"`.** This is a loop of up to `maxSteps`. Each step asks `next` (add a candidate, `finish`, or `unavailable`) and, when more than one container exists, `parent` (which existing element and slot). It yields a full snapshot after each step.

**Edits (`initialSpec`), always sequential.** The seed must be a flat Spec "without repeats or watchers" (`cloneInitialSpec`, composition-tree L1–30). Existing elements are matched to candidates by **exact JSON equality of the recipe** (`recipeKey`, key-order-insensitive). Unmatched ones are described as "Existing <type>" unless the app passes `elementDescriptions`.

Each step offers:
- **add:** any usable candidate
- **`replace:<id>`:** the next step picks the new recipe, keeping id, position and compatible children (`canReplace`)
- **`remove:<id>`:** the whole subtree; the root cannot be removed
- **`move:<id>`:** the next step picks from every valid destination, given as slot and "before X" or "at end", with a depth check
- **`finish`**, **`unavailable`**

Replace and move each take **two evaluations**. `changes_made` (the step history) goes back to the model to prevent loops.

**Budgets and defaults:**
- `maxSteps` 32: evaluations, counting terminal decisions in sequential mode.
- `maxElements` 32: batch only, including the root.
- `maxDepth` 8.
- `maxUses` 1 per candidate.
- Per-evaluation timeout 10 s (`experimental_createEvaluator`).
- Overall deadline set by the caller through `signal`.

The playground caps itself at 14 elements, 14 evaluations, depth 4 and 55 s [V jev.mdx].

**Failure handling:**
- An answer outside the offered criteria, or a confidence outside 0–1, **throws**: "Evaluator returned a choice outside the permitted catalog operations" (`validateEvaluation`).
- Abort and timeout throw. `evaluateWithSignal` stops waiting even if a custom evaluator ignores the signal.
- The `complete` event carries `stopReason`:
  - `finish`
  - `unavailable` (the model said the catalog can't do it)
  - `limit` (a budget ran out)
- It can carry a partial spec, or `null` when no root was added.
- After every step the whole tree is checked:
  - `indexTree` rejects cycles, shared nodes, dangling or unreachable nodes, and excess depth.
  - It also runs `catalog.validate(resolved)` and `validateSpec`.
- The docs: "Completion is not a correctness guarantee" [V jev.mdx].

**Transport.** `experimental_createEvaluator` POSTs `{state, questions}` to `https://ai-gateway.vercel.sh/v4/ai/evaluation-model` with model id `typesafe-ai/jev` and a Gateway API key [V `experimental-evaluator.ts`]. The `Experimental_CompositionEvaluator` type is a plain async function, so we can write an adapter that calls TypeSafe's own API (docs.typesafe.ai lists `POST System One` and JS/Python SDKs [V page index]) or an LLM that returns choices [I].

**Output.** The composer yields **full snapshots, not SpecStream patches** [V jev.mdx "These are full snapshots"]. Diffing to patches is our job; `packages/core/src/diff.ts` exists [V file list].

### 1.4 What the Jev path does not support

All [V] from `experimental-compose.ts` and jev.mdx unless marked.

1. **It cannot write text or data.** "Jev cannot invent missing prose or data". Candidates carry concrete props. For a website builder this is the central fact: headlines, body copy, CTAs, testimonials and alt text must come from somewhere else. The options are an LLM, the user, a template content pack, or `$state`-bound content slots.
2. **Its expression subset is small.** It allows literals, `$state`, `$bindState`, and state-based `visible`. It does **not** allow `repeat`, `watch`, `$cond`, `$template`, `$computed`, custom directives or conditional props. A seed spec that uses any of these cannot be edited by Jev.
3. **It composes one `Spec`, not an app.** There are no routes, layouts or metadata. `StartAppSpec` composition is ours to write: one composer call per page, plus a site-level call for nav, footer, theme and page list [I].
4. **It cannot edit props.** "Change the headline", "make the button say Book now" or "make it blue" only work if a candidate already holds that exact recipe. The playground's workaround is narrow: "A title in double quotes becomes an extra Heading candidate".
5. **It has no theme, variant or style questions.** Questions are hard-coded to `root`/`select_*`/`parent_*`/`order_*` (batch) and `next`/`parent` (sequential). The only way to add a "theme" or "density" choice is to encode it as candidate alternatives with `resource`, which doesn't scale [I].
6. **Its order questions are global.** `order_<id>` offers positions 1..n-1 over all non-root elements, not per parent. Per-parent order is derived by sorting [V batch L190–235]. That is fine for shallow pages and odd for deep trees [I].
7. **The question count grows with the catalog.** Batch select asks one question per candidate group in one call. With 300 block-variant candidates, that is 300 questions in a single evaluation. Jev's limits per call (question count, state size) are not documented in what I read. TypeSafe's own "jaggedness" page warns against "Large state full of irrelevant detail" and option-order effects [V docs.typesafe.ai/model-jaggedness/jev-1.13]. So pre-filter the candidates per request, with code or a first Jev question about page type [I].
8. **It handles numbers and hex colors poorly.** The same TypeSafe page says Jev is weak on numeric precision, counting and hex or RGB similarity. Pass named buckets ("warm earthy palette", not `#a0522d`) [V].

### 1.5 The LLM path, for comparison

With a generative model, json-render's main path is `catalog.prompt()`, then the model streams SpecStream JSONL, then `useUIStream`/`createSpecStreamCompiler` renders it progressively [V `docs/generation-modes.mdx`, `docs/streaming.mdx`]. Edits can be patch, merge or diff [V `edit-modes.ts`]. This path **does** support every expression type, and it can write copy.

One trap: `catalog.validate()` **skips per-component props validation when the catalog has more than one component** (issue #467, opened 2026-11-09, reproduced on 0.21.4, and said to be present in 0.22.0; the related #378 dates from 3 Oct). The composer is not affected, because it calls `definition.props.safeParse` itself (L118–124). Any LLM-patch path that relies on `catalog.validate()` would accept invalid props [V source and issue]. **Write our own per-type discriminated validator.**

### 1.6 Codegen and the "runtime-free export" claim

- `@json-render/codegen` is **utilities only**, about 9 KB of source:
  - `traverseSpec`, `collectUsedComponents`, `collectStatePaths`, `collectActions`
  - `serializeProps`, which turns props into a JSX attribute string

  [V] `packages/codegen/src/*`; `docs/code-export.mdx`.
- The docs say generation is "intentionally project-specific": you write the generator, and the components you emit are "standalone with no json-render dependencies" [V `docs/code-export.mdx`].
- The docs point to a dashboard example that exports a full Next.js project. In the current tree, `examples/dashboard/app/api/v1/reports/export/route.ts` is a *data report* export, and the only in-repo users of `collectUsedComponents` are the web app's `playground.tsx` and `demo.tsx` [V code search]. So the documented reference exporter appears to be gone or moved [I].
- **What the playground exporter does** (`apps/web/components/playground.tsx` L520–597) [V]:
  - It prints one `"use client"` page.
  - Imports come from `@/components/ui`, and it walks children and slots.
  - Props are passed through `serializeProps` **verbatim**. A `{ "$state": "/x" }` prop becomes a literal object prop.
  - `visible`, `on`, `repeat` and `watch` are **silently dropped**.

The export is runtime-free only because it **drops the dynamic semantics**. Compiling `$state`, `$cond`, `$template`, actions, visibility and repeats into idiomatic code (`useState`, `.map`, ternaries, handlers) is unbuilt work [V for the behavior; I for the conclusion]. There is no reverse codegen, and issue #315 ("Reverse Codegen") has had no answer since July [V].

### 1.7 Runtime size

- Per bundlephobia's API for v0.22.0 (min / gzip) [R; bundlephobia, not measured by us]:
  - `@json-render/core`: 76.8 KB / **23.9 KB**
  - `@json-render/react` with core: 164 KB / **48.1 KB**
  - `@json-render/tanstack-start`: 65.9 KB / **20.8 KB**
- Zod is a dependency and peer of core, and bundlephobia's approximate raw size for it is 564 KB [R].
- All three packages declare `hasSideEffects: true`, so tree-shaking is limited [R].
- npm unpacked sizes [V `npm view`]:
  - core 1.22 MB
  - react 566 KB
  - shadcn 674 KB, which pulls in `radix-ui`, `vaul`, `embla-carousel-react` and `lucide-react`

**Verdict:** about 50 to 70 KB gzip of runtime plus Zod is fine inside the editor, and wrong for published marketing pages. Published sites should ship compiled blocks, not the interpreter [I].

### 1.8 What json-render lacks for a full website builder, and how to close each gap

| Gap | Strongest way to close it | Effort |
|---|---|---|
| **Copy and content generation** (Jev can't write text) | Two tiers. (a) Jev picks structure, variants and theme in two calls, about 200–300 ms [I]. (b) A small LLM fills a **content pack** in parallel. The pack is Zod-typed per block (`hero.headline ≤ 60 chars`…) and streamed into `spec.state.content.*`. Candidates bind props to `$state: "/content/<slot>/headline"`, which the composer allows. Jev then sees fixed recipes, the skeleton renders with placeholder copy at about 300 ms, and real copy streams in afterwards. The exporter resolves `$state` to literals [I, built on V mechanics] | M |
| **Themes and tokens** | Our own `theme` object in the site spec, as semantic tokens in shadcn cssVars style (`--primary`, `--radius`, type scale, spacing density). It compiles to a Tailwind v4 `@theme` block. Jev picks among about 30 named theme presets plus axes (palette mood, type pairing, radius, density) as **separate choice questions in our forked composer** | M |
| **Responsive variants** | Make responsiveness a property of **blocks and variants**, not free-form props. Each block implements mobile, tablet and desktop itself. Variants are enums such as `layout: "split-left" \| "split-right" \| "stacked"`, with an optional `mobileLayout`. Avoid per-breakpoint arbitrary props; the model gets them wrong and they bloat the spec [I]. Fix the #355-class bugs in our own primitives | S–M |
| **Images and assets** | An `assets` table in the spec (`{id, src, alt, width, height, focal, blurhash, license}`). Blocks take `imageRef`. Resize with Cloudflare Images or R2. Stock and AI images are picked by a separate decision and generated step. Alt text comes from the LLM content pack | M |
| **CMS collections** | `collections: { posts: { schema (Zod or JSON Schema), items | source } }`, rendered through json-render-style `repeat` plus route `loader`s (`/blog/$slug`, `staticParams`). The Payload/Sanity "array of typed blocks" pattern is the reference (section 2). Export to MDX/JSON files, or to a Payload config | L |
| **Forms** | json-render's `$bindState`, `checks` and actions cover client-side behavior [V]. We add a `submitForm` action handled by our Worker (store in D1, forward by email or webhook), Turnstile, and export to a TanStack Start server function | M |
| **SEO** | Extend `StartMetadata` with JSON-LD, sitemap.xml, robots.txt, hreflang and OG image generation (json-render's `@json-render/image`/Satori can render OG cards from a spec [V package README]). Ship static HTML with no hydration for non-interactive blocks (see 1.7 and section 7) | S–M |
| **i18n** | `$t` exists [V], but sites need locale routes, translated slugs and per-locale content packs. Model this as `content[locale]` plus a route prefix strategy, and export to TanStack Router `/$lang/…` [I] | M |
| **Animations** | Block-level enum props (`entrance: "none" \| "fade-up" \| "stagger"`), implemented in blocks with CSS scroll-driven animations or Motion. Never as free-form keyframes in the spec [I] | S |
| **Code export with dynamic semantics** | Our own compiler (section 6): spec → TanStack Start routes plus copied block files plus a `@theme` CSS file, with `$state`/`$cond`/repeats compiled to idiomatic React | L |
| **Prop-level edits by Jev** | Extend the forked composer with an **"edit content slot"** operation: Jev picks *which* slot, the LLM rewrites it. Also offer **variant swaps** as `replace` among `resource`-grouped candidates, which already works [V] | M |
| **Editor (click, drag, inline text)** | Section 5: our own thin editor on dnd-kit and Tiptap, with Puck as the spike | L |

### 1.9 Stability and roadmap

- **There is no public roadmap file.** The issue tracker is the de facto roadmap.
- **Relevant open items** [V `gh issue list`]:
  - #467 / #378: props validation bug
  - #369: SSR for `@json-render/react`
  - #355: responsive shadcn grid
  - #315: reverse codegen
  - #308: reusable templates and fragments
  - #245: data loading on mount
  - #228: GSAP animation
  - #145: `className` on shadcn components
  - #297: Zod 4.4+ support blocked by a type check
- **Several are months old with no maintainer reply**, for example #315 and #245 [V].
- **Release cadence is steady**: roughly monthly minors with patch releases [V releases].
- **It depends on one maintainer** [V contributors].
- **Risk read [I]:** good code quality (strict validation, abort handling, tests about the same size as the source) and permissive license. The risks are a Labs product, a single maintainer, a 0.x API and an experimental composer. Treat it as vendorable code, not a platform.

### 1.10 Verdict on json-render

- **Adopt as a dependency, pinned exact:** `@json-render/core` for:
  - the `Spec`/`UIElement` types
  - SpecStream compile and patch apply
  - expression resolution (`$state`, `$cond`, `$template`, directives)
  - prompt helpers for the LLM path
- **Adopt for the editor preview only:** `@json-render/react`'s `Renderer`, or our own roughly 200-line renderer [I]. For publishing, use neither (section 7).
- **Fork:** the composer (about 1,100 lines across 4 files, Apache-2.0, so a fork just needs the NOTICE kept). We need:
  - our own question types (theme, variant, content slot, page set)
  - multi-page composition
  - candidate pre-filtering
  - patch emission instead of snapshots
  - a non-Gateway evaluator
- **Borrow the shape:** `StartAppSpec` (routes, layouts with `Slot`, metadata, loaders, `staticParams`) becomes the skeleton of our `SiteSpec`. We add `theme`, `assets`, `collections`, `content` and `locales`.
- **Ignore:** `@json-render/codegen` (too thin; write our own) and `@json-render/shadcn` (it is built on Radix and has known responsiveness issues; our catalog replaces it).
- **Fallback if the project stalls:** vendor the 4 to 6 core files we use. The surface is small enough to own [I].

---

## 2. The alternatives, judged for our use

All rows come from primary sources (repo files, official docs, npm metadata), read on 13 and 14 Nov 2026.

| Item | Spec format | Catalog definition | Editing model | Visual editor | Code export | License | Maturity | Verdict |
|---|---|---|---|---|---|---|---|---|
| **A2UI** (now `a2ui-project/a2ui`) | **Flat** adjacency list: `id`, `children: [ids]`, `root` id. Separate data model | JSON Schema catalog; `ComponentId`/`ChildList` refs | Streamed JSONL envelopes. `updateComponents` upserts whole components by id; `updateDataModel` by JSON Pointer | No | No | Apache-2.0 | Spec **v1.0 "current"** (2026-11-06; previously 0.10). v0.9/0.9.1 "previous". `@a2ui/react` 0.15.0. About 17.3k stars | **Borrow ideas**: the id-upsert and validation rules. v1.0 **removed `theme`**. Chat-surface oriented: no pages, routes or responsive styles |
| **AG-UI** | An event protocol, not a UI spec ("AG-UI is not a generative UI specification") | n/a | `STATE_SNAPSHOT` plus `STATE_DELTA` (RFC 6902) | No | n/a | MIT | `@ag-ui/core` 1.0.4; very active | **Borrow** the snapshot-plus-delta pattern. We own both ends, so we don't need the protocol |
| **CopilotKit** | Tool-call props; also hosts A2UI and MCP Apps | Zod via `useComponent` | Tool streaming | No | No | MIT, **but v2 "Intelligence" features are license-token gated** (`licenseToken`, `LicenseWarningBanner`) | v1.87.1, very active | **Ignore**: a heavy agent-chat runtime with licensing creep |
| **Tambo** | Tool-call props | Zod `propsSchema` | Prop streaming | No | No | MIT | **Cloud shut down 2026-10-31** per README; no commits in 4 weeks | **Ignore**: abandoned |
| **Thesys OpenUI / C1** | OpenUI Lang, a flat statement DSL (`root = Stack([…])`) | Zod; the prompt is generated from the library | **Incremental merge by statement name; `name = null` deletes; orphans are dropped**; streaming | No | No | OpenUI MIT; C1 is a paid hosted API ($49 / $499 per month tiers) | `@openuidev/server` 0.4.3 (2026-11-13) | **Borrow** the merge-by-id, null-delete, orphan-GC semantics. The "67% fewer tokens than JSON" figure is the vendor's own benchmark [R] |
| **MCP Apps / MCP-UI** | HTML resources (`ui://`) in a sandboxed iframe | Tool `_meta.ui.resourceUri` | Opaque HTML | No | No | ext-apps Apache-2.0 (with MIT parts); mcp-ui Apache-2.0 | ext-apps v2.1.0; stable spec 2026-01-26 | **Ignore for authoring.** Revisit to put "edit my site" inside Claude or ChatGPT [I] |
| **assistant-ui** | Chat primitives. `generative-ui` uses a nested `{_type,…}` tree; `generative-frame` "spec mode" uses JSONL patches against your catalog with `applyPatch`, `validateSpec` and a repair loop | Zod | Tool streaming / JSONL patch | No | No | MIT | `@assistant-ui/react` 0.15.36; `generative-frame` 0.0.10 (2026-11-08) | **Adopt for the chat pane** (TanStack Start fit not verified). Read `generative-frame` as a second reference next to json-render |
| **LangGraph generative UI** | `{name, props}` messages referring to React bundles that LangSmith builds | React code | `ui.push` with merge | No | No | MIT | Active | **Ignore**: not declarative |
| **Puck** (`@puckeditor/core`) | `{root, content:[{type, props:{id,…}}], zones}`. **Nested through slot fields**, with `zones` being deprecated | Puck `config` field types (not Zod) | Editor state | **Yes** | **None** (it renders with `<Render>`) | Core **MIT**. **Puck AI has no license on npm, is absent from the public repo, and is routed through paid Puck Cloud** (PAYG, $199, $799 per month; "BYOK requests… are still routed through Puck's servers") | 0.24.0 (2026-10-29); about 13.7k stars | **Spike its editor; ignore Puck AI** (section 5) |
| **Builder.io** (Mitosis, Fusion) | Builder content JSON (SaaS). Mitosis has a nested JSON IR | Registered components | Fusion has an agent edit **code in your repo** | SaaS | Mitosis compiles to about 17 frameworks | Repos MIT; platform proprietary | Mitosis 0.14.2, 2 commits in 4 weeks | **Ignore as a dependency.** Mitosis is a reference for multi-framework compilation (section 6) |
| **Plasmic** | Proprietary Studio model | Code components | Studio → repo `plasmic sync` | Yes | Codegen, with Studio as the source of truth | MIT, **except `platform/`, which is AGPL-3.0** | Active | **Ignore.** Its file-ownership split is a pattern to copy (section 6) |
| **Makeswift** | Hosted page data | `registerComponent` | Hosted | SaaS | No | Runtime MIT; service proprietary | 0.29.3 | **Ignore** |
| **Webstudio** | **Flat normalized** instances, props, styles and styleSources, linked by id | **Zod** (`packages/sdk/src/schema`) | Builder ops; the CLI exposes MCP | Yes | **Yes**: `webstudio build` (react-router, SSG and Cloudflare templates) | **AGPL-3.0-or-later**, including the SDK packages that exported sites import. `sdk-components-animation` is proprietary | 0.312.0 (2026-11-11) | **Study the schema; never take a dependency.** Exported sites appear to inherit AGPL packages [I] |
| **GrapesJS** | HTML/CSS component JSON | JS component types | Editor commands | Yes | HTML/CSS | BSD-3-Clause; Studio SDK and AI are commercial | 0.23.9 | **Ignore**: the wrong model for a React block catalog |
| **Craft.js** | Flat `Record<NodeId, SerializedNode>` | React components | Editor actions | Yes (framework) | No | MIT | **Last release 0.2.12 on 2025-02-14: dormant** | **Ignore**; its data model is a reference |
| **Payload / Sanity** | An array of blocks discriminated by `blockType` / `_type` | TS config / `defineType` | CMS editing | Admin / Studio | n/a | MIT (both) | Payload v3.93 (v4 beta); Sanity v6.23 | **Borrow** the discriminated-union pattern. These are natural export targets for collections |
| **Storyblok** | Nested `component`-keyed bloks | Editor or `@storyblok/schema` | SaaS | Yes | No | Proprietary; `storyblok-js` archived | n/a | **Ignore** |
| Newer in 2026 | `generative-frame` (above); `CopilotKit/OpenIntelligentUI` (a demo); `PrefectHQ/prefab` (a Python MCP Apps DSL); `AGenUI` (an A2UI renderer). OpenAI "Open-JSON-UI" is mentioned in AG-UI docs [R], but no repo was found | | | | | | | Nothing displaces a home-grown spec |

**What to take from them:**
1. A2UI v1.0's flat id graph and child-ref validation.
2. OpenUI's merge-by-id edits with null-delete and orphan GC.
3. AG-UI's snapshot plus RFC 6902 delta for streaming into the preview.
4. Webstudio's normalized split of instances, props and styles.
5. Payload/Sanity's discriminated block unions.

Two things are worth adopting as dependencies: **assistant-ui** (chat) and, optionally, **Puck core** (editor spike). Avoid AGPL code (Webstudio, Plasmic `platform/`) and license-gated features (CopilotKit Intelligence, Puck AI, C1).

---

## 3. Catalog supply and licenses

What matters to us: (1) use inside a commercial SaaS builder; (2) **redistribute the source to end users in exported projects**; (3) the builder itself counts as a "template / UI kit / website builder" that could compete. Most paid kits forbid (2) or (3), and several name website builders explicitly.

| Source | License (where read) | Verdict for us | Operative clause / note |
|---|---|---|---|
| **shadcn/ui** components and blocks | MIT, `shadcn-ui/ui/LICENSE.md` [V] | 🟢 | Keep the notice |
| **Origin UI → coss ui** | MIT, `cosscom/ui` [V] | 🟢 | Now built on Base UI [V coss.com/origin] |
| **Magic UI (free)** | MIT, `magicuidesign/magicui` [V] | 🟢 | |
| **Tremor / Tremor Blocks** | Apache-2.0 and MIT [V] | 🟢 license, 🟡 maintenance | blocks.tremor.so: "Tremor is joining Vercel", Blocks "now free and open-source" [V]. `@tremor/react` was last published Jan 2025 [V] |
| **Park UI** | MIT [V] | 🟢 (wrong styling stack) | Ark UI + Panda CSS, not Tailwind [V README] |
| **daisyUI** | MIT [V] | 🟢 | Pure CSS classes, so framework-agnostic [I] |
| **HyperUI** | MIT [V] | 🟢 | Plain HTML + Tailwind v4, useful for an HTML export target |
| **Flowbite core / flowbite-react** | MIT [V] | 🟢 | |
| **Launch UI, Kokonut UI, Cult UI, Motion Primitives** | MIT [V] | 🟢 (free repos only) | Paid tiers were not read |
| **HeroUI** | Apache-2.0 [V] | 🟢 | An npm library, not copy-paste source |
| **Mantine** | MIT [V] | 🟢 | Not Tailwind |
| **Untitled UI React (OSS repo)** | MIT, `untitleduico/react` [V] | 🟡 | Use only what is in the MIT repo. The PRO license (below) is red |
| **Preline UI (free)** | MIT **plus a "Fair Use License"** [V preline.co/license.html] | 🟡 → treat as excluded | Bars products that "directly compete". Page builders are allowed only with attribution and when not marketed as competing [V] |
| **shadcn registry directory** (565 namespaces) | Per namespace [V `apps/v4/registry/directory.json`] | 🟡 per item | The directory requires "open source and publicly accessible" registries, yet lists `@shadcnblocks`, `@aceternity` and `@react-bits`, which are red [V]. **Being listed is not clearance** |
| **Tailwind Plus** (ex-Tailwind UI) + Catalyst | Proprietary; the license page is now login-gated | 🔴 | Prohibits "website builder" use where end users build from its components, and redistribution outside an End Product [R search snippet; page not readable] |
| **Magic UI Pro** | pro.magicui.design/license [V] | 🔴 | "may not redistribute, resell, share…"; "may not use the Products in a way that competes"; $10,000 liquidated damages per redistribution [V] |
| **Aceternity UI (free *and* Pro)** | ui.aceternity.com/licence [V] | 🔴 | One licence covers "each item… for purchase or download". "cannot re-distribute… source files"; "cannot create themes, templates, or derivative products to sell" [V] |
| **Preline Pro** | Same page [V] | 🔴 | Bars use in "generators" [V] |
| **Flowbite Pro / Blocks** | flowbite.com/license [V] | 🔴 | Bars "website builder projects that can be considered as direct competitors" [V] |
| **Relume** | relume.ai licensing agreement [V] | 🔴 | "may NOT distribute any components to others". Relume is itself a competitor (an AI builder with React export) [V] |
| **Untitled UI PRO** | untitledui.com/legal/license, updated 14 Jun 2026 [V] | 🔴 | Bars "Creating an app or website builder that includes Untitled UI components" [V] |
| **shadcnblocks.com** | shadcnblocks.com/license [V] | 🔴 | Bars "a 'website builder' that allows End Users to create their own websites", AI site builders, and "an AI generator trained on Components" [V] |
| **shadcn.io Pro** | shadcn.io/license [V] | 🔴 | Bars a "website builder" project [V] |
| **React Bits** | **MIT + Commons Clause** [V `DavidHDev/react-bits/LICENSE.md`] | 🔴 as catalog material | "do not sell, sublicense, or redistribute the components themselves". GitHub shows NOASSERTION [V] |

**Consequences:**
1. **Catalog sources.** Seed only from 🟢 sources. Most of the catalog should be **written in-house on shadcn primitives**; that is where consistency and quality come from [I].
2. **Licensing in the pipeline.**
   - Enforce an SPDX allowlist (MIT, Apache-2.0, ISC, BSD) in CI through `meta.catalog.license`.
   - The exporter writes a `THIRD_PARTY_NOTICES` file (MIT notice; Apache NOTICE) [I, from the MIT/Apache text].
3. **Premium kits.** Any premium kit (shadcnblocks, Tailwind Plus) would need a **negotiated OEM/redistribution license** [I].

**Registry format: adopt shadcn `registry-item.json` unchanged on the wire** [V schema at ui.shadcn.com/schema/registry-item.json]:

- **Item `type`s:** `registry:block | component | ui | page | theme | style | base | font | …`.
- **Extension point:** `meta` is a free-form object, so our metadata goes there.
- **Namespaces and access:** namespaced registries (`@ns/item`) with headers and env expansion for private or paid registries [V `docs/registry/namespace.mdx`].
- **GitHub registries:** `npx shadcn add owner/repo/item`, available since June 2026; private ones since August [V changelog].
- **Bases:** `registry:base` covers the radix, base and aria bases [V changelog 2026-07].
- **MCP server:** included [V `docs/registry/mcp.mdx`].
- **"Open in v0":** a strict subset of the format, with no `cssVars`, `css`, `envVars` or namespaces [V `docs/registry/open-in-v0.mdx`]. Emit compatible items and the button works; it is not a separate format.

Our `meta.catalog` contract [I, designed for this product]:

| Field | Contents | Role |
|---|---|---|
| `license` | `{spdx, sourceUrl, copyright, commit, noticeText}` | Gates ingestion; feeds the NOTICES file |
| `kind` / `sectionRole` | hero, pricing, faq, nav, footer…, plus placement rules ("once per page", "first") | |
| `props` | JSON Schema generated from Zod; the content model with length limits, image aspect and alt requirements, CTA counts | What the LLM fills |
| `slots` | Accepted `kind`s per slot | |
| `variants` | cva-style enums with defaults | What Jev picks |
| `tokens` | Theme tokens the block consumes | Coverage checks against themes |
| `bases` / `frameworks` | Implementations available per base and per target | |
| `interactivity` | Abstract primitives used (accordion, dialog, menu, carousel, tabs) | Lets non-React exporters swap in their own |
| `preview` | Screenshots (light/dark × mobile/desktop), a fixture, a live route | |
| `ai` | `description`, `whenToUse`, `whenNotToUse`, tags, an example prompt → props pair | |
| `quality` | a11y status, size budget, last-verified date | |

---

## 4. Headless behavior layer

| Layer | License | Latest (date) | Activity since 15 Aug | Frameworks | shadcn base? | Fit |
|---|---|---|---|---|---|---|
| **Base UI** (`@base-ui/react`) | MIT [V] | v1.9.0, 2026-10-09 [V] | 441 commits; about 29.7M weekly downloads [V npm] | React | **Yes, the default since 2026-07-02** ("New projects now use Base UI by default. Radix is still fully supported") [V `apps/v4/content/docs/changelog/2026-07-base-ui-default.mdx`] | **Best React default** |
| **Radix** (`radix-ui`) | MIT [V] | 1.8.1, 2026-10-12 [V] | 69 commits; "Maintained by @workos" [V] | React | Yes, not deprecated [V] | Safe but slower. No reason to choose it for new work |
| **React Aria Components** | Apache-2.0 [V] | 1.22.x, 2026-10-09 [V] | 195 commits | React | **Yes, `--base aria` since 2026-07-17** [V changelog] | Strongest a11y and i18n; heavier |
| **Ark UI / Zag.js** | MIT [V] | Ark 5.40.0 (2026-10-29), Zag 1.47.0 (2026-10-26) [V] | 128 / 238 commits | Ark: React, Solid, Vue, Svelte. **Zag also has a vanilla build** [V] | No (third-party `@ark-cn` only) | **The proven multi-framework option today** |
| **Headless UI** | MIT [V] | React 2.2.10 (2026-04-07); Vue 1.7.23 (2024-09) [V] | **0** | React, Vue | No | Avoid |
| **Vercel UI SDK** (`vercel-labs/ui`, `@ui-sdk/*`) | Apache-2.0 [V] | `0.1.0-beta.2`, 2026-11-13; npm `latest` is still beta.1 [V] | Repo created 2026-10-26 | **React, Vue, Svelte 5, Solid 2, Web Components** [V `contributing/README.md`] | No | Watch closely; don't commit yet |

**What Vercel UI SDK actually is** [V README, `AGENTS.md`, package layout]:

- **Purpose.** It is "the layer underneath" a component library, not a component library.
- **Core package.** `@ui-sdk/core` has **zero runtime dependencies**.
- **Layered structure.**
  - **Behaviors**: focus, selection, popups, drag-and-drop, lists, forms, motion.
  - **Primitives**: `definePrimitive({state, api, slots})`.
  - **Per-framework adapters**: `createParts(...)` gives Root and Part components with the same names in all five targets.
- **Shipped components.** About 55: dialog, menu, select, combobox, tabs, accordion, carousel, date-picker, tree, toast and more.
- **Extras.**
  - `@ui-sdk/core/testing`, which checks against WAI-ARIA patterns.
  - `@ui-sdk/core/agent` (`snapshot`, `act`), which lets an agent operate a finished UI.
- **Stated design goals.** SSR before hydration, no portals, RTL without a provider, and "Small, predictable APIs… so a model writes them correctly in few tokens".

Conceptually it is the closest thing to "one behavior spec, many framework renderers". It is three weeks old and beta [I].

**Recommendation:**
- **Catalog blocks today:** shadcn on **Base UI**, written base-agnostic where shadcn ships all three bases.
- **Abstract references:** the spec and `meta.catalog.interactivity` name **abstract primitives** (accordion, tabs, dialog, nav menu, carousel, tooltip), never a library.
- **Per-target mapping:**

  | Export target | Implementation |
  |---|---|
  | React | Base UI |
  | Vue, Svelte, Solid | Ark UI |
  | Astro, plain HTML | Zag vanilla or native `<details>`, `<dialog>` and `popover` |

- **Spike:** a time-boxed spike on Vercel UI SDK as a possible single layer, including Web Components for HTML and Astro. Re-decide when it reaches GA [I].

---

## 5. Visual editing layer

| Library | License | State (Nov 2026) | What it gives | Fit |
|---|---|---|---|---|
| **Puck** | MIT [V] | 0.24.0, 2026-10-29. Fast churn: 0.22 → 0.24 in three months [V] | A full editor shell: drawer, fields, outline, **iframe canvas**, selection, DnD, slots, **inline rich text (Tiptap)**, plugins and overrides [V `apps/docs/pages/docs/api-reference/*`] | Nested data, but flat ↔ nested is a pure function of about 50 lines [I]. **Best for a 1–2 week UX spike** |
| **dnd-kit** | MIT [V] | `@dnd-kit/react` 0.5.3 (2026-10-31), a layered rewrite. Legacy `@dnd-kit/core` was last published Dec 2024 [V] | Sortable and nested containers, keyboard and screen-reader support. **Puck itself uses `@dnd-kit/react`** [V Puck package.json] | **Adopt** (pinned, behind our own `moveBlock()`) |
| **Pragmatic drag and drop** (Atlassian) | Apache-2.0 [V] | 4.0.0 (Sep 2026) [V] | A roughly 4.7 kB core on native HTML5 DnD; used in Jira and Trello [V README] | Fallback; good for the layers tree |
| **Tiptap** | Core MIT; paid Pro (collaboration, AI, comments) from $59/mo [V tiptap.dev/pricing] | 3.34.0 [V] | Inline rich text on ProseMirror | **Adopt the core** with a tiny schema, stored as a **JSON mark tree, not HTML** [I] |
| **Lexical** | MIT [V] | 0.53.0 [V] | Fast editor state | Alternative; more verbose for small inline fields [I] |
| **Plate** | MIT (some per-package LICENSEs) [V] | 53.5.6 [V] | Slate-based document editor kit | Built for documents, not inline web copy [I] |
| **tldraw** | **Proprietary "tldraw license"**: production use needs a license key, enforced by "technical measures… watermark" [V `LICENSE.md`; tldraw.dev/pricing] | 5.6.0 | Infinite canvas | **Avoid**: wrong paradigm and license cost |
| **Onlook** | Apache-2.0 [V] | Last release Jul 2025; the README calls it "the open-source visual editor that started Onlook" while a hosted product is in early access [V] | A visual editor over real Next.js code: Babel injects `data-oid`, and DOM selection maps to the AST [V `packages/parser/src/ids.ts`] | **Read it as the reference for round-trip**, not as a dependency |
| **Webstudio canvas** | **AGPL-3.0-or-later** [V package.json] | 0.312.0, very active | A mature canvas over a flat instance map | **Study only; never copy** |
| **Craft.js** | MIT [V] | Dormant since Feb 2025 [V] | A flat `SerializedNodes` editor | Avoid |
| **GrapesJS** | BSD-3-Clause; commercial Studio SDK [V] | 0.23.9 | HTML/CSS editor | Foreign model; avoid |

**Recommended editor architecture** [I, with V references]:

1. **Canvas.** The production block renderer runs in a **same-origin iframe** (CSS isolation, breakpoint simulation by width). Each block root carries `data-block-id`, and a parent-frame overlay handles hover and selection through `closest('[data-block-id]')`. This is Puck's model: its iframe is on by default [V `components/puck.mdx`].
2. **Drag and drop.** `@dnd-kit/react`, behind spec commands (`moveBlock(id, parent, slot, index)`). The same commands are what Jev and the LLM emit, so the AI, the editor and undo share **one command and patch log** [I].
3. **Inline text.** Tiptap core on `contentEditable` text props, saved as constrained rich-text JSON.
4. **Puck spike first.** Write `specToPuck`/`puckToSpec`, put it in front of users for 1–2 weeks, then build our own thin editor. Reasons not to keep Puck long term:
   - Its nested model fights flat id patches.
   - Its zustand state sits between AI patches and the canvas.
   - Its API is pre-1.0 and churning.

---

## 6. Code export and round-trip

| Tool | Mechanism | Round-trip? | Source |
|---|---|---|---|
| **Plasmic codegen** | Two kinds of file. `PlasmicX.tsx` is owned and overwritten by `plasmic sync`; the wrapper `X.tsx` is scaffolded once and "never touches it again" | **No re-import.** Hand edits are protected by **file ownership** | [V] docs.plasmic.app/learn/codegen-components |
| **Webstudio** | CLI templates (react-router, SSG, Cloudflare); JSX generated from the instance map | One-way. **Exported sites import AGPL packages** | [V] `packages/cli/templates/*`, `packages/react-sdk/src/component-generator.ts` |
| **Puck** | No codegen; JSON plus `<Render>` | n/a | [V] packages listing |
| **json-render codegen** | Utilities only; the playground printer drops dynamic semantics | No (#315 unanswered) | [V] section 1.6 |
| **Mitosis** | A constrained JSX dialect ↔ JSON IR. About 17 generators (React, Vue, Svelte, Solid, Qwik, Angular, HTML…) and parsers for JSX, Svelte, Angular and Builder. Documented "gotchas" ban some patterns (e.g. `...rest`) | **Yes, within its subset** | [V] `packages/core/src/generators`, `/parsers`, docs `gotchas` |
| **TeleportHQ** | UIDL JSON → React, Next, Vue, Nuxt, Angular or HTML through a plugin pipeline; Tailwind plugin; publishers | One-way; README says "Beta" | [V] repo |
| **Onlook** | Babel injects stable `data-oid`; an index maps oid → file and range; edits are applied as AST mutations | **Yes**, with code as the source of truth | [V] `packages/parser/src/ids.ts`, `editor/ast/README.md` |
| **Lovable Visual Edits** | A Vite plugin assigns "a unique, stable ID" to JSX; the AST is synced into the browser; edits regenerate JSX, which is diffed and pushed to a fly.io dev container with HMR | **Yes**, with code as the source of truth | [V] lovable.dev/blog/visual-edits |
| **v0 Design Mode** | Style edits plus a screenshot go to chat; **the LLM generates a new version** | Through the LLM, not the AST | [V] v0.app/docs/design-mode |
| **Builder Fusion / Projects** | An agent edits the GitHub repo and opens PRs | Code is the source of truth | [V] builder.io/c/docs/projects-github |
| Webflow DevLink, Subframe, Anima, Locofy, Framer, Tempo | Partial or not verified | — | [V partial] / [R] |

**What the field has solved:**
- **Code is the source of truth (Onlook, Lovable, Fusion).** True round-trip exists here only. The mechanism is always stable ids injected into JSX, plus an AST index, plus AST mutations printed back.
- **A structured model is the source of truth (Plasmic, Webstudio, TeleportHQ, Webflow, Puck).** Export is one-way.
- **Mitosis** is the only general constrained-subset parser back to an IR. It works by forbidding what it can't represent.

**Our approach** (design [I], with mechanisms from the sources above [V]):

1. **Split files by owner, as Plasmic does.**
   - `src/blocks/*.tsx` are catalog blocks copied verbatim. **The user owns them** and we never regenerate them.
   - `src/routes/*.tsx` (TanStack Start) are **generated composition only.** Imports come from `src/blocks`, and there is one JSX tree of catalog blocks with literal props, our rich-text JSON, and a mandatory `data-block="<specId>"`.
   - `src/styles/theme.css` is a Tailwind v4 `@theme` file generated from tokens.
   - `content/*.json` holds the content packs, so copy edits don't touch code.
2. **Deterministic printer.** The same spec always produces byte-identical output: sorted props, fixed formatting, clean git diffs.
3. **Dynamic semantics are compiled, not dropped.**
   - `$state`/`$bindState` → `useState`, or a tiny generated store.
   - `repeat` → `.map`.
   - `visible`/`$cond` → `&&` or a ternary.
   - Actions → typed handlers in a generated `actions.ts`.

   For marketing sites most of this collapses to literals at export time [I].
4. **Re-import parser** (oxc or Babel). A page re-imports into the spec only when all of these hold:
   - It imports only from `src/blocks`.
   - Its tags are in the catalog.
   - Its props are literals that pass the block's Zod schema.
   - Its `data-block` ids are unique.
   - It has no hooks or logic.

   The ids keep selection, comments and chat history stable across edits made by a coding agent. The `data-block` id plays the same role as Onlook's `data-oid`.
5. **Per-page eject.** A page that leaves the subset becomes `ejected: true`. It renders from code, is read-only in the visual editor, and the other pages stay editable. "Re-adopt" re-parses it. Lovable- or Onlook-style AST patching for text and class edits on ejected pages is a v2 feature.
6. **Other export targets from the same spec.**
   - **Astro:** `.astro` pages that import the React blocks with no `client:` directive (zero JS), adding `client:visible` only for interactive blocks.
   - **Plain HTML:** `renderToStaticMarkup` plus compiled Tailwind CSS.
   - **Not Mitosis for v1.** It is worth adopting only if blocks must be authored once for Vue and Svelte, and its constraints would then bind how blocks are written [V gotchas; I].

---

## 7. Hosting and preview

**Our path: render the spec directly, with no build and no sandbox**

| Step | Mechanism | Numbers |
|---|---|---|
| Live preview | The editor renders the spec with the production blocks in a same-origin iframe. Jev or LLM patches update state, and React re-renders | First paint is bound by loading the block bundle once. After that each patch is one React render, "tens of ms" [I, **benchmark this**] |
| Publish (SSR) | **One** TanStack Start renderer Worker for all tenants: hostname → spec (KV/D1/R2) → render → cache. Cloudflare auto-detects TanStack Start [V CF TanStack Start guide] | Workers Paid includes 10M requests a month, then $0.30/M; CPU $0.02 per M ms. Startup limit 1 s; script limit 64 MiB [V workers/platform/pricing, limits] |
| Worker cold start | Isolates | About 5 ms historically. Cloudflare's 2025 "shard and conquer" post claims a 10x cut in cold starts and 99.99% warm hits [R, vendor] |
| Publish (static) | Prerender HTML at publish to R2 or KV; serve as static with SSR fallback | Static asset requests are "free and unlimited" [V workers static-assets billing]. R2 costs $0.015/GB-month with free egress [V r2/pricing] |
| Custom domains | **Cloudflare for SaaS** custom hostnames → the one renderer Worker | 100 included, then $0.10 each, up to 50k on non-Enterprise plans [V cloudflare-for-saas/plans] |
| Ejected or custom code only | **Dynamic Workers** (Worker Loader), or Workers for Platforms dispatch namespaces | Dynamic Workers: 1,000 a month included, then $0.002 per Worker-day [V]. WfP: $25 a month base [V] |

Because the model never writes code, **ordinary sites need no Workers for Platforms**: every tenant runs the same code, and only their data differs [I]. Published pages should ship **static HTML plus islands**: hydrate only blocks whose `meta.catalog.interactivity` is non-empty. That sidesteps json-render's client-only renderer (#369) on the public site [I].

**What code-writing builders pay** (rates [V] from pricing pages; per-hour figures are my arithmetic for 2 vCPU / 4 GiB):

| Option | Boot claim | Approx. $/sandbox-hour |
|---|---|---|
| E2B (Firecracker) | — | $0.166 (Hobby: 1 h sessions; Pro: $150/mo) [V e2b.dev/pricing] |
| Daytona | "Sub 90ms sandbox creation" [V page, vendor claim]. Note: the GitHub repo is now **archived** [V] | $0.166 [V daytona.io/pricing] |
| Modal Sandboxes | — | $0.238 (3x the Function rates) [V modal.com/pricing] |
| Vercel Sandbox (Firecracker) | "Sub-second" [V docs, vendor claim] | $0.11 at 10% CPU, $0.34 at 100% [V vercel.com/docs/sandbox/pricing] |
| Cloudflare Containers / Sandbox | Cold start "often… in the 1-3 second range" [V containers/faq] | $0.09 at 10% CPU, $0.22 at full (standard-3) [V] |
| StackBlitz WebContainers | Runs in the browser | **A commercial license is required for production for-profit use** [V webcontainers.io/enterprise]; price on request |

Known architectures:
- Bolt.new uses WebContainers [V `stackblitz/bolt.new` README].
- Lovable ran "over 4,000" fly.io dev-server containers with Vite HMR as of Mar 2025 [V Lovable blog; may have changed].
- Onlook uses CodeSandbox SDK [V].
- v0's preview runtime is not documented [V absence].
- Typical cold install plus Vite boot of about 1–3 s and 50–300 ms per HMR update are commonly reported but **unverified** [R].

**Quantified advantage** [I, using V rates]:

| Metric | Code-writing builder | Spec renderer (us) |
|---|---|---|
| First preview | Sandbox create + dependency restore + Vite boot + compile, i.e. seconds | A Jev skeleton in about 200–300 ms (two evaluations), then one React render. **Benchmark it** |
| Edit → preview | LLM writes a file, then HMR; compile and type errors are possible | Patch, then re-render. **It cannot fail to compile**, because blocks are pre-built |
| Infrastructure per editing hour | $0.09–$0.34 per sandbox-hour, plus keep-warm | About $0 of server compute; only model calls and storage |
| 10k sessions/day × 30 min | 5,000 sandbox-hours/day, **about $450–1,700/day** | Negligible preview infrastructure |
| Publish | Build plus deploy (seconds to minutes) | Write the spec plus prerender, sub-second [I]. SSR at about $0.40 per million views (5 ms CPU); static hits $0 |

---

## 8. Recommended stack: adopt, fork, build

| Layer | Decision | What | Main risk | Fallback |
|---|---|---|---|---|
| **Spec** | **Build** (superset of json-render) | `SiteSpec = { theme, assets, collections, locales, content, metadata, layouts, routes: { page: Spec } }`. Pages are json-render flat `Spec`s; routes and layouts use `StartAppSpec` shapes. Content lives in `state.content` and is bound with `$state`. Add our own per-type Zod validator (works around #467) | Spec design debt: fields that turn out wrong are expensive to migrate | Version the spec from day one (`specVersion`) with migration functions, as json-render's `migration.mdx` does |
| **Spec runtime utilities** | **Adopt, pinned exact** | `@json-render/core`: types, SpecStream compile and apply, expression resolution, directives, prompt helpers for the LLM path | Single maintainer, 0.x, Labs | Vendor the few files we use (Apache-2.0) |
| **Composer (Jev)** | **Fork** | Start from `experimental-compose*.ts`. Add: theme and variant questions; content-slot edit ops; multi-page and site composition; candidate pre-filtering; patch output; evaluators for both TypeSafe-direct and Gateway | Jev quality on large catalogs and literal-reading failures (TypeSafe's own jaggedness list) | **The LLM tool-call path**, with the same commands as tools and SpecStream patches, at higher latency. Run Jev first and use the LLM for copy and as a fallback when `unavailable` or low confidence |
| **Content and copy** | **Build** | A content-pack generator: LLM structured output per block `props` schema, streamed into `state.content` | Copy quality and latency | User-provided content plus curated template packs |
| **Catalog blocks** | **Build**, seeded from 🟢 sources | In-house blocks on shadcn (Base UI), plus coss/Origin, Magic UI free, Tremor Blocks, Launch UI and others. SPDX allowlist in CI; NOTICES in exports | Quality and coverage (Relume-level breadth takes time); accidental ingestion of 🔴 kits through the shadcn directory | Negotiate an OEM license with one premium kit (shadcnblocks or Tailwind Plus) |
| **Block format and contribution** | **Adopt** | shadcn `registry-item.json` with a `meta.catalog` extension; host `@ours` and accept GitHub registries | shadcn format churn | `meta` is free-form; keep our schema separate and validate it ourselves |
| **Headless layer** | **Adopt** | Base UI through shadcn (React); abstract interactivity names in the spec | Lock-in to React if multi-framework export matters | Ark UI or Zag for Vue, Svelte and vanilla; spike Vercel UI SDK when it reaches GA |
| **Theme system** | **Build** | Semantic tokens → Tailwind v4 `@theme`; about 30 named presets plus axes; Jev picks by name | Tokens that don't cover all blocks | `meta.catalog.tokens` coverage tests |
| **Chat pane** | **Adopt** | assistant-ui (MIT) | TanStack Start integration not verified; 0.x | AI SDK UI hooks plus our own components |
| **Visual editor** | **Spike with Puck, then build** | Same-origin iframe canvas, `data-block-id` overlay, dnd-kit (pinned), Tiptap core | Editor UX is a deep pit | Keep Puck as the editor for longer through spec ↔ Puck adapters |
| **Code export** | **Build** | Deterministic printer to TanStack Start, Astro and HTML; owner-split files; compiled dynamic semantics; NOTICES | Exported code quality is the product's promise; edge cases in compilation | Ship "spec-only" export first (blocks plus JSON plus a small runtime renderer), then compiled export |
| **Round-trip** | **Build (v2)** | Constrained-subset parser with `data-block` ids; per-page eject | Users' agents break the subset constantly | Eject is always safe; offer a "re-adopt" cleanup that is itself an LLM task |
| **Publish and hosting** | **Adopt Cloudflare** | One renderer Worker, Cloudflare for SaaS, specs in D1/R2, prerendered static HTML plus islands | Islands and hydration plumbing in TanStack Start | Full SSR plus hydration (json-render's `PageRenderer`) as a stopgap |
| **Avoid** | — | Webstudio and Plasmic `platform/` (AGPL); tldraw (license key); WebContainers (commercial license); CopilotKit Intelligence, Puck AI and C1 (gated or hosted); Tambo (dead); Craft.js (dormant); every 🔴 kit in section 3 | — | — |

**The most important architectural bet** [I]: AI actions, editor actions, undo and redo, collaboration, and the round-trip parser all produce or consume **one command vocabulary** (`addBlock`, `replaceVariant`, `moveBlock`, `removeBlock`, `setContent`, `setTheme`) serialized as RFC 6902 patches against `SiteSpec`. Jev, the LLM and the human are then interchangeable sources of the same operations, and that is the moat over code-writing builders.

---

## 9. Not verified, or only partly verified

- **Jev latency and limits per call.** I did not measure Jev latency, nor find a documented limit on the number of questions or state size per evaluation. The about 100 ms figure comes from the brief.
- **Bundle sizes.** These are bundlephobia figures [R], not our own build. Zod's real gzip contribution was not measured.
- **The json-render dashboard exporter that the docs reference** was not found at the documented path [V absence], and may live elsewhere.
- **Tailwind Plus license text.** The page is login-gated, so the wording is [R] from a search snippet.
- **Tool internals not read:** Anima, Locofy, Framer export, Tempo Labs, Webflow DevLink sync details, Bolt's 2026 preview stack, v0's preview runtime.
- **Vite boot and HMR numbers** have no primary source [R].
- **assistant-ui's fit with TanStack Start** is not tested.
- **Webstudio AGPL.** Whether exported Webstudio sites import AGPL packages at runtime is [I], based on the package licenses and the templates.
- **Plasmic codegen.** Whether generated code imports `@plasmicapp/*` is [I].
- **Paid tiers of Launch UI, Cult UI and Kokonut** were not read.
- **Search budget.** Some sub-investigations ran out of web-search budget and relied on `gh api` and direct page fetches, which favors primary sources but may miss recent announcements.
