# 02 — Blocks, themes and rendering

Date: 14 November 2026. Area 2 of six technical designs. Owns: how a block and a theme are authored, how a spec becomes HTML for the preview and for the published site, CSS, fonts, images, icons, fit rules and text measurement, block versioning, the quality gate, the library layout and export. Does not own the spec format (area 1), the decision and text pipeline (area 3), repo, runtime and hosting (area 4), the editor and Wall UI (area 5), or apps, forms and the foundry (area 6). Section 5 lists what this design needs from them.

**Evidence labels.** **[V]** verified: I read the source, the docs or the registry myself, or ran it. **[M]** measured: I ran an experiment and report the number (machine: Apple Silicon Mac, Node 25.6.1, Chrome 155.0.8059.39, workerd from wrangler 4.162.0; local runs, not production). **[R]** reported by a secondary source. **[P]** my proposal or estimate.

**The experiment.** Everything in section 3 was built and run, not only written. It lives in the scratchpad (`/private/tmp/claude-501/-Users-robert--claude-spares-spare-tvKEHk/b3e62d49-f555-416c-8c3c-257e4e035b40/scratchpad/tech-2/exp/`), outside the Builder folder: a block kit, the hero block with three variants, a theme engine, the renderer, a Cloudflare Worker that renders, builds CSS and runs fit rules, a calibration test and a gate test. Package versions used (all [V] `npm view`, 14 Nov 2026): react / react-dom 19.3.1 (12 Nov), tailwindcss 4.3.5 (11 Nov), @chenglou/pretext 1.0.0 (14 Oct), harfbuzzjs 1.6.4 (22 Oct), zod 4.6.7, TypeScript 7.0.2, wrangler 4.162.0, playwright-core 1.65.0, axe-core 4.14.0, @tanstack/react-start 1.169.5, @tanstack/react-router 1.170.46, vite 8.3.8.

---

## 0. The design in one page

- **A block is a pure function from content to HTML.** One React component per block type, with no hooks, no state, no effects and no context. It renders the same bytes on a Worker, in Node and in the browser. Interactivity never lives in a block: a block names behaviors from a small core set (`disclosure`, `nav-menu`, `dialog`, `tabs`, `carousel`, `form`), and most of those need no JavaScript at all in 2026 browsers.
- **Next to it, a manifest is the contract**: slots from a closed vocabulary with length limits, variants with declared text geometry and fit rules, surfaces, behaviors, licence and AI text. Zod schemas and JSON Schema are derived from it, never written by hand.
- **Published pages ship zero JavaScript by default.** The Worker renders the spec with `renderToStaticMarkup`, builds one small per-site stylesheet with Tailwind's own compiler at publish time, and stores static HTML. Measured: a 12-section page is 4.9 KB gzip of HTML including its inline CSS, with no script. By comparison, the smallest possible React hydration costs 69 KB gzip, and React plus TanStack Router costs 96 KB gzip [M].
- **TanStack Start runs the editor and the server routes, not the published pages' client.** Its prerendering is build-time and per route, its deferred hydration still ships React and the router, and its Server Components are experimental [V]. None of them gets a data-driven page to zero JavaScript. A server route that returns our HTML does.
- **Styling** uses Tailwind v4 with the default theme wiped (`--*: initial`). Blocks can only use our token utilities, so `bg-red-500` or `p-4` produce nothing and fail lint. Theme values are CSS custom properties scoped to `[data-site]`. Style families and axes change only variables and a few primitive attributes, never block markup. That is also why The Wall is cheap: the same HTML with a different variable set is a different-looking site.
- **Layout responds to the block's own container**, not the window, through container queries, `cqi` units and two breakpoints. Fit rules are evaluated at three fixed probe widths of that container: 328, 640 and 1024 px.
- **Text is measured without a browser.** Pretext does line breaking, and HarfBuzz WASM supplies glyph widths on servers. Measured against Chrome: 600 of 600 random headlines got the same line count across Fraunces, Inter at two weights and Armenian. The whole thing runs inside a Worker after two small patches to harfbuzzjs [M]. The block's declared geometry is kept honest by a CI test that compares predictions with Chromium's layout. That test caught two real bugs in my own example block [M].
- **The quality gate** uses Vitest for manifests, schemas, migrations and fit rules, and Playwright with Chrome for rendering gates: axe-core, overflow, tap targets, determinism, measurement calibration, size budgets and screenshot baselines. There is no Storybook. A dev catalog route in the app is both the gallery and the test target. The later block foundry uses the same gate.
- **The one-way doors** are the block contract (purity, manifest shape, slot vocabulary), the token vocabulary, container-relative layout and probes, variant and slot naming with versioning and migrations, and the image value shape. Everything else is a two-way door, and the simplest option is picked.

---

## 1. Decisions table

| # | Decision | Recommendation | Door | Confidence |
|---|---|---|---|---|
| D1 | What a block is | A pure, server-renderable React function component with no hooks, state, effects or context, plus a manifest. Interactivity only through named core behaviors | **One-way** | High |
| D2 | Content model | Closed slot vocabulary (`text`, `richText` reserved, `link`, `image`, `icon`, `list`, `fact`, `ref`), **per block type, shared by every variant**. Zod and JSON Schema derived. Unused slots are kept when variants swap | **One-way** | High |
| D3 | Variants | Named string keys, stable forever, in one component file. A variant may hide slots, never add its own. Each variant declares text geometry, a fit predicate, a ≤40-word fit description and a layout signature | **One-way** (names, schema rule); two-way (implementation) | High |
| D4 | Nesting | v1 blocks are page sections. Repeating items are `list` slots (data), not child blocks. Reserve a `ref` slot kind and a `slots` map for container blocks later | **One-way** (reservation) | Medium |
| D5 | Theme contract | A fixed token vocabulary: semantic colour roles × 4 surfaces, 8 composite text styles, named spacing, radius, aspect. Scoped to `[data-site]`. Blocks never use raw values, `dark:` or viewport breakpoints | **One-way** | High |
| D6 | Responsive model | Container queries only. Two layout breakpoints (`@md` 640, `@lg` 1024 px of the block's content box). Fit probes at 328 / 640 / 1024 px | **One-way** | High |
| D7 | Published rendering | `renderToStaticMarkup` in a Worker at publish → static HTML in R2. Zero JS unless a block's behavior needs a ~1 KB vanilla module. No hydration, no RSC, no TanStack Start client | Two-way (pipeline); its premise is D1 | High |
| D8 | CSS production | Per-site CSS built at publish with Tailwind's `compile().build(candidates)` from per-block candidate lists precomputed at library build. One catalog stylesheet for the editor. **Never concatenate per-block CSS** | Two-way | High |
| D9 | Enforcing tokens | Wiped default theme + `eslint-plugin-better-tailwindcss` (`no-unknown-classes`, `no-restricted-classes`, `enforce-logical-properties`) + bans on `style` and hooks + a CI check on compiled CSS + the calibration test | Two-way | High |
| D10 | Preview | The same components, rendered client-side in one same-origin iframe from an external store with per-block subscriptions. Theme edits change only CSS variables. Wall tiles are `[data-site]` roots with CSS `zoom` in one document | Two-way | Medium |
| D11 | Fonts | Self-hosted woff2 split by `unicode-range` subsets, served from the site's own origin, with metric-matched fallback faces (Capsize metrics). Display font preloaded. A TTF copy of each face for server measurement | Two-way | Medium-high |
| D12 | Images | Image value `{asset, alt, focal}` plus an asset table. Width-only resizes on a fixed ladder of 8 widths. Cropping is done by CSS `object-position` at the focal point. Drivers: Cloudflare `/cdn-cgi/image`, self-hosted ipx or imgproxy, or none | **One-way** (value shape); two-way (driver) | Medium-high |
| D13 | Icons | Icon slot holds a name from **our own** alias vocabulary, mapped to Lucide (ISC). Inline SVG at render, stroke width from a token | **One-way** (names); two-way (icon set) | Medium |
| D14 | Fit rules and measurement | TypeScript predicates over a `Measure` API + declared text geometry. Pretext with canvas in the browser and HarfBuzz WASM elsewhere. A CI calibration test against Chromium | Two-way (engine); geometry format **one-way-ish** | Medium-high |
| D15 | Versioning | Semver per block. Instances store the major. Forward-only content migrations as pure functions. Only the latest code of a block exists. Published pages are snapshots | **One-way** | Medium |
| D16 | CI gate | Vitest (node) + Playwright Test with Chrome + axe-core + our DOM gates + calibration + screenshots for changed blocks + byte budgets. No Storybook or Ladle | Two-way | High |
| D17 | Library layout and registry | `packages/blocks/<type>/` folders. A generated library snapshot (JSON, content-hashed), a lazy component map for the editor, static imports for the Worker, candidate lists for CSS | Two-way | High |
| D18 | Export | The spec + the blocks used + the kit + the same renderer + a prerender script + `AGENTS.md`. Compiled-JSX export later | Two-way | Medium |

---

## 2. Detail per decision

### D1. What a block is (one-way door)

**Options considered.**
1. *Hydrated React components* (shadcn on Base UI, as report 03 assumed). Rich interactivity, but every published page pays for React. Hydration mismatches are possible, and a published page differs from its preview whenever client state differs.
2. *Server-only React components* (pure functions, no hooks) plus a separate, closed set of behaviors. Same markup everywhere, zero JS by default.
3. *A template language* (Liquid, Handlebars, or Mitosis JSX). Portable to other frameworks, but outside the fixed stack, with weaker types and tooling, and worse for coding agents.

**Recommendation: option 2.** A block is:

```
packages/blocks/hero/
  manifest.ts      defineBlock({...}): slots, variants, fit, surfaces, behaviors, licence, AI text
  hero.tsx         default export: ({ content, variant, ctx }) => JSX. No hooks, no state, no effects
  fixtures.ts      named content cases: minimal, typical, maximal, long-word, rtl, cjk (+ any)
  migrations.ts    only once the block has a major version > 1
  __screens__/     screenshot baselines (generated, committed or stored as CI artifacts)
```

Rules (lint-enforced, section D9):
- Imports only from `@builder/block-kit` (primitives and types) and from files in its own folder. No `react` hooks, no `createContext`, no headless UI library, no animation library.
- Every prop comes from `content`, `variant` or `ctx`. `ctx` is computed by the renderer: instance id, surface, heading level, image URL builder, and the few theme axes that need markup.
- No `style` prop. The one exception is the `Picture` primitive, which writes the focal point as two custom properties. No `dangerouslySetInnerHTML`, as area 6 also requires.
- Text renders as React text nodes, so it is always escaped. Links go through `safeUrl()` in the `ButtonLink` and `Link` primitives.

**Why this is the costliest door.** Every one of 500 blocks would encode the choice. Moving from "hydrated" to "static" later means rewriting every interactive block and every block that used a hook for layout. Moving from "static" to "may hydrate" is additive: area 6's `render: island` can come later without touching static blocks. So start static.

**Consequence I am flagging plainly.** Report 03 recommended building blocks on shadcn with Base UI. Base UI components need hydration, so they cannot be used on published pages under this design. shadcn's *markup and Tailwind patterns* are still a fine source (MIT). Its interactive primitives are replaced by native elements and our behaviors (D7).

### D2. Content model (one-way door)

Saved sites contain values of these kinds forever, so the vocabulary is closed and small. Each kind has one value shape:

| Kind | Value stored in the spec | Constructor options |
|---|---|---|
| `text` | `string` (plain, no markup) | `min`, `max` chars, `purpose`, `factKind` (default `copy`) |
| `richText` (reserved, not built in v1) | `{ t: 'doc', c: Inline[] }`, marks `b`, `i`, `link` only | `max` |
| `link` | `{ label, href }` | `labelMax` |
| `image` | `{ asset, alt, focal?: {x, y} }` | accepted `aspect` range, `role`, `focal` |
| `icon` | a name from our alias vocabulary (D13) | |
| `list` | `Array<object of slots>` | `of`, `min`, `max` items |
| `fact` | a binding to the business record, e.g. `{ $business: '/hours' }` (area 6) | `factKind`: `price`, `hours`, `address`, `phone`, `email`, `url` … |
| `ref` (reserved) | id of a child block instance | `accepts: role[]` |

- **Per block type, not per variant.** Area 3 asked for this too, and it is what makes `replaceVariant` lossless. A variant lists the slots it `uses`, and others are kept but not rendered.
- **`factKind` on every slot** (requirement from area 3, §5). Hard facts (price, hours, phone, address) are `fact` slots bound to the business record, never free text (requirement from area 6, §5.2.3).
- **Zod is derived** (`contentSchema()` in §3.1). JSON Schema for the text writer comes from Zod 4's `z.toJSONSchema` (present in zod 4.6.7 [V]). Cloudflare's Workers limits page says Zod versions before 4.5.0 "use substantially more memory per schema" [V developers.cloudflare.com/workers/platform/limits], which matters with 500 schemas in one isolate. So stay on ≥ 4.5 and build schemas lazily.
- **TypeScript typing** of content is inferred from the manifest. One finding [M]: with TypeScript 7.0.2, slot constructors must return `TextSlot<NoInfer<O>>`, or the contextual return type widens `optional: true` to `boolean` and every optional slot becomes required. The kit in §3.1 has the working form.

### D3. Variants (one-way door for names and the schema rule)

**Options:** (a) separate components per variant; (b) one component with a `variant` prop; (c) CSS-only variants (same markup, `data-variant` changes layout).

**Recommendation: (b), using (c) where markup is identical.** One file per block keeps shared parts (the copy stack, the actions) in one place. A coding agent then sees every variant at once, and the gate runs them together. Variant keys (`centered`, `split`, `overlay`) are stored in saved specs, so they are **never renamed**. Removing one requires a major version and a migration that maps it to a survivor.

Each variant declares:
- `uses` and `requires` (slots shown and slots that must be filled).
- `text`: the geometry the measurer needs, meaning a text style and a box width (`full | two-thirds | half | third`) per probe. This is a closed vocabulary because the measurer resolves it without a browser. The calibration test (D14) fails when the declared geometry and the real CSS disagree.
- `fit(m)`: a hard predicate. `score(m)`: a soft preference.
- For area 3: `describe` (≤ 40 words, a concrete situation such as "6–12 items with photos"). For area 3's Wall sampler: `signature`, a few categorical features (`{ align: 'center', media: 'none', density: 'airy' }`).
- `surfaces` it supports, if narrower than the block's.

### D4. Nesting (one-way door: what to reserve)

Repeating content (features, testimonials, menu items, FAQ entries) is a **`list` slot of plain data**, not child blocks. The decision model then answers "how many" and "which variant", and the text writer fills one typed array. Child blocks would turn each item into a separate block choice, which multiplies questions and gives worse visual consistency.

Reserve now and build later: a `ref` slot kind and the spec's `slots: Record<string, id[]>` on an instance (json-render's `UIElement` already has `slots` [V, report 03 §1.2]). These are for genuine containers (tabs of sections, a two-column layout block). A rule to adopt now: depth ≤ 2 (section → container → section) whenever it arrives.

### D5. Theme contract and tokens (one-way door)

Every block depends on token *names*. Values can change any day.

**The vocabulary (v1).**

| Group | Tokens | Tailwind utilities blocks may use |
|---|---|---|
| Colour roles | `bg`, `fg`, `fg-muted`, `accent`, `accent-fg`, `border` (+ `current`, `transparent`) | `bg-bg`, `text-fg`, `text-fg-muted`, `bg-accent`, `border-border` … |
| Surfaces | `base`, `muted`, `brand`, `inverse`. Each remaps the 6 roles; a site provides 24 palette values `--p-<surface>-<role>` | `data-surface` set by the `Section` primitive from the instance's `surface` |
| Text styles | `display`, `h2`, `h3`, `lead`, `body`, `small`, `eyebrow`, `button`. Each is family + fluid size + leading + tracking + weight + case | `type-display` … (composite `@utility`). No `text-xl`, `font-bold` or `leading-*` in blocks |
| Spacing | `2xs xs sm md lg xl 2xl`, `section`, `gutter`, `columns`, `tap` | `gap-md`, `py-section`, `px-gutter`, `gap-columns`, `min-h-tap` |
| Radius | `control`, `card`, `media`, `none` | `rounded-card` |
| Aspect | `portrait`, `square`, `landscape`, `wide` | `aspect-portrait` |
| Containers | `content` 72rem, `prose` 40rem, `wide` 90rem; breakpoints `md` 40rem, `lg` 64rem | `max-w-content`, `@md:`, `@lg:` |

**How style families and axes apply without forking markup** [P, implemented in the experiment]:
- *Type pairing, scale, heading case and tracking, density, radius, palette strategy, chroma, neutral temperature* change only CSS variables, emitted by the theme engine as one declaration block on `[data-site]`.
- *Section surface rhythm* is a spec-level choice (`instance.surface`), not a block choice.
- *Button style, ornament set and image treatment* are read once by primitives (`ButtonLink` sets `data-button`, `Eyebrow` may draw a rule, `Picture` sets `data-treatment`), and kit CSS styles those attributes. 500 blocks never branch on them.
- *Hero archetype and grid alignment* are variant choices, so they are layout.
- Container **style queries** (`@container style(--x: y)`) became Baseline on 19 May 2026 [V web-features 3.46.0]. They are an escape hatch for a future axis that needs CSS branching, without new markup. Not needed in v1.

**Dark mode.** Blocks never use `dark:`. A dark scheme is another palette for the same 24 variables, emitted under `@media (prefers-color-scheme: dark)` when the site opts in, or as a dark-first family. Whether every site gets automatic dark is a founder question (Q3).

**Scoping to `[data-site]`, not `:root`.** This is what allows several sites in one document (The Wall), and it is free on a published page (`<body data-site>`). One trap I hit: a variable defined in `:root` as `var(--other)` is resolved at `:root`, so overriding `--other` lower down does nothing. The theme therefore overrides the *same* variable names that Tailwind's utilities read (for example `--spacing-md`), and surfaces remap colour roles on the element that carries `data-surface` [M, the experiment's CSS].

**OKLCH palettes from one brand colour** follow report 05 §2.1 (Leonardo or Material Color Utilities to solve contrast, culori for OKLCH). The contract here is only the 24 output variables and the rule that every role pair passes WCAG 2.2 AA on every surface. Area 3 asks for theme facets as named presets mapped to tokens; the theme engine provides `facet → Theme` functions, and blocks never see facets.

### D6. Container-relative layout and probes (one-way door)

- The page root (`[data-site]`) and every section are size containers. Fluid type and spacing use `cqi`, so a 1280 px site laid out inside a 320 px Wall tile is correct. Verified in Chrome 155: inside a 1280 px box at `zoom: 0.25`, and also under `transform: scale(.25)`, a `@container (min-width: 1024px)` rule applies and `4cqi` computes to 51.2 px [M].
- **Two layout breakpoints only:** `@md` (40rem) and `@lg` (64rem), measured on the block's own content box. Fluid tokens handle everything in between.
- **Probes** are the *narrowest* content-box width of each range, because the narrowest width wraps the most: sm = 328 (a 360 px phone minus 16 px gutters), md = 640, lg = 1024.
- **A real bug this caught.** My first version defined probes as page widths. At a 1024 px page the section's content box is 942 px, so `@lg` did not apply, and the calibration test reported 10 mismatches. Defining probes on the content box fixed all of them [M]. This is why probes belong to the contract: fit data, fixtures and calibration all depend on them.

### D7. Rendering for published pages (two-way pipeline, one-way premise)

**State of the options, November 2026.**

| Option | What it does | Fit for us |
|---|---|---|
| TanStack Start static prerendering | `tanstackStart({ prerender: { enabled, crawlLinks, … } })` renders the app's *routes* to HTML at **build time** [V `docs/start/framework/react/guide/static-prerendering.md`] | No. Our sites are data, not routes in our build. The output also hydrates the full app |
| TanStack Start deferred hydration | `<Hydrate when={visible() \| idle() \| interaction() \| media() \| condition() \| never()}>`; children split into a lazy chunk; marked **experimental** [V `deferred-hydration.md`] | Reduces hydration work but still loads React and the router. `never()` keeps HTML static, but the document still boots the app |
| TanStack Start Server Components | Opt-in, **experimental**, needs `@vitejs/plugin-rsc` and Vite 8+. `renderServerComponent` / `createCompositeComponent` through server functions [V `server-components.md`] | Moves work to the server, but the client still runs React to consume the RSC payload |
| Selective SSR | `ssr: true \| 'data-only' \| false` per route [V `selective-ssr.md`] | Controls SSR, not hydration |
| `react-dom/server` in a Worker | `react-dom/server` resolves to `server.edge.js` under the `workerd` condition and exports `renderToStaticMarkup`, `renderToString`, `renderToReadableStream`, `resume` [V `react-dom@19.3.1/package.json`, `server.edge.js`] | **Yes.** It produces plain HTML with no React markers and no script |
| Astro-style islands | Not in the stack | Our behaviors play the same role without a framework |

**Recommendation.** A TanStack Start **server route** (or a plain Worker `fetch`, which is area 4's call) that runs `renderDocument(spec)` and returns a `Response` [V, server routes return `new Response(...)` in `server-routes.md`]. At publish time, write the HTML and CSS to R2 and serve them as static files. The Start client bundle never reaches a published page.

**Measured page weight** [M]:
- 3 hero sections, rendered inside workerd with the CSS inlined: 15,246 B, **3,702 B gzip**, 0 B JS.
- 12 sections in Node: 33,577 B, **4,931 B gzip, 3,964 B brotli**. Repetition flatters compression, so expect 8–15 KB gzip for real 12-section pages [P].
- Per-site CSS for kit + hero: 11,461 B, 3,070 B gzip (mostly Tailwind preflight).
- Render time: 12 sections in under 0.1 ms, and 48 sites × 10 sections in 3 ms, in Node.
- Worker bundle with the renderer, the Tailwind compiler, Pretext, HarfBuzz WASM and two TTF fonts: 2.96 MB upload, 1.16 MB gzip. That is well under the 64 MiB size limit; the 1 s startup limit and 128 MB memory per isolate also apply [V developers.cloudflare.com/workers/platform/limits].
- For comparison: `hydrateRoot` from react-dom 19.3.1 alone is **69,055 B gzip**, and with `@tanstack/react-router` it is **96,310 B gzip**, both bundled with esbuild and minified. That is a lower bound for any hydrated Start page.

**The interactive blocks: native first, vanilla second, React never on v1 published pages.** Browser support is from [V web-features 3.46.0, `data.json`]:

| Need | Zero-JS mechanism | Support | Fallback behavior module |
|---|---|---|---|
| Accordion / FAQ | `<details name="group">` (exclusive) | Baseline 2024-09 | none needed |
| Mobile nav menu | `popover` + `<button commandfor command="toggle-popover">` | popover Baseline 2025-01; invoker commands Baseline 2025-12-12 (Chrome 135, Firefox 144, Safari 26.2) | `nav-menu.js` ≈ 0.5 KB polyfills the `commandfor` click for older Safari [P] |
| Dialog / lightbox | `<dialog>` + `command="show-modal"` | dialog widely available; commands as above | same module |
| Carousel | CSS scroll-snap (widely available); `::scroll-button` / `::scroll-marker` only Chrome 135+ | partial | `carousel.js` ≈ 1 KB: prev/next buttons and dots [P] |
| Tabs | none fully accessible without JS | — | `tabs.js` ≈ 1 KB, rendered as stacked sections without JS [P] |
| Forms | `<form method="post">` works without JS (area 6 requirement) | universal | `form.js` ≈ 1.5 KB: inline validation and fetch submit [P] |
| Motion | CSS scroll-driven animations, Baseline 2026-10-27 | new | none; honour `prefers-reduced-motion` |

Behaviors are owned by the core team, written in plain TypeScript, attached by `data-behavior` attributes, and loaded as one hashed module per behavior only on pages that use them. The block foundry cannot add JavaScript; it can only use existing behaviors. That keeps foundry blocks static and safe.

**Where React hurts, and how it is contained.**
- Blocks cannot use the React ecosystem's interactive components. This is contained by the behaviors set, plus area 6's `render: island` for the rare app-like block, which would load React (≈ 69 KB gzip) on that page only.
- `server.edge.js` loads both the streaming build (`react-dom-server.edge.production.js`, 293 KB [V file size]) and the legacy build that provides `renderToStaticMarkup`. That is fine for a Worker. It would not be fine in a browser bundle, where the editor uses `react-dom/client` instead.
- `renderToStaticMarkup` is the legacy synchronous API. It cannot wait for Suspense data, which is a feature here: blocks get all data synchronously. If it is ever deprecated, `prerender` from `react-dom/static` produces the same HTML asynchronously.
- React-only idioms (`className`, `htmlFor`, style objects) make exporting to non-React targets a re-implementation. That cost is accepted; multi-framework export is deferred.

### D8. CSS production (two-way door)

| Option | Verdict |
|---|---|
| One precompiled stylesheet for the whole catalog on every site | Simple, but every site pays for 500 blocks' utilities. Fine for the editor, wrong for published pages |
| Per-block CSS files concatenated per site | **Broken.** Tailwind orders utilities so that later ones win correctly within *one* build. Two separately built sheets can each contain `p-4` and `px-2`, and when concatenated the second sheet's `p-4` overrides the first block's `px-2` [P, from how cascade order works] |
| **Per-site CSS at publish** | Tailwind 4.3.5 exports `compile(css, { loadStylesheet, loadModule })` → `{ build(candidates: string[]): string }` [V `tailwindcss/dist/lib.d.mts`]. It runs in workerd [M] |
| Runtime generation per request | Unnecessary; the result is cached at publish |

**Recommendation.**
- *Library build:* Tailwind's own scanner (`@tailwindcss/oxide` `Scanner`) extracts each block's candidates into `candidates.gen.json` [M, 62 for the hero, 152 for the kit]. Non-class words are harmless because the compiler ignores them.
- *Publish:* take the union of candidates of the kit and the blocks used, then `compiler.build(union)`. Measured: 1.5 ms per site in Node including compile, and the compiler instance can be reused [M].
- *Editor:* one catalog stylesheet built by Vite from all block sources and cached once. Its size has not been measured; I estimate tens of KB gzip at 500 blocks, since utilities are shared [P].
- **Pin one Tailwind version** for the library build, the Worker and the editor. Candidate lists and the compiler must agree.
- Gotcha found [M]: with a custom entry stylesheet you must import `tailwindcss/utilities.css` (which contains `@tailwind utilities;`) yourself. Otherwise no utilities are emitted and nothing fails loudly. The calibration test caught it, because every headline rendered at 16 px.

### D9. Enforcing tokens (two-way door; the checks can tighten over time)

Layered, with the cheapest check first:

1. **Wiped theme.** `@theme { --*: initial; … our tokens … }` [V `tailwindcss.com` `theme.mdx`: "set the global theme variable namespace to `initial`"]. Non-token utilities generate nothing.
2. **Lint** with `eslint-plugin-better-tailwindcss` 4.11.0 (MIT) [V repo `docs/rules`]: `no-unknown-classes` (anything that does not compile), `no-restricted-classes` (arbitrary values `[...]`, `dark:`, `!` important), `enforce-logical-properties` (RTL), `no-concatenated-classes` (dynamic class strings break scanning). It reads the kit CSS through `settings['better-tailwindcss'].entryPoint` [V `docs/settings/settings.md`].
3. **Code bans** with `no-restricted-imports` (React hooks, `createContext`, UI and animation libraries), `react/forbid-dom-props` (`style`, `dangerouslySetInnerHTML`), and `no-restricted-syntax` (hex, `rgb(` or `px` string literals in `.tsx`).
4. **Compiled-CSS check in CI:** parse the CSS built for each block and fail if a colour, length or font declaration is not `var(...)`, `0`, a percentage, a keyword or a kit-owned utility.
5. **The calibration test** (D14) catches geometry drift that types and lint cannot.

Type-level enforcement of class strings (template-literal types of allowed classes) was considered and rejected: it is slow to compile at this scale, and lint already covers it.

### D10. Rendering for the preview (two-way door)

**Same renderer: yes.** The same block components, the same kit CSS rules and the same `ctx` construction. What differs:

| | Preview (editor iframe) | Published |
|---|---|---|
| React mode | `createRoot` client render; blocks re-render on patches | `renderToStaticMarkup` once |
| CSS | catalog stylesheet (all blocks) + live theme variables | per-site stylesheet |
| Code loading | blocks lazy-loaded per type (`import()`), prefetched by role | all blocks in the Worker bundle |
| Theme change | rewrite one `<style>` text for `[data-site]`; **no React render** | regenerate at publish |
| Images | low-res or placeholder first | srcset ladder |
| Fonts | all pairings loadable on demand | only the site's pair |
| Behaviors | same modules, so menus and FAQs work in preview | same |
| Fit check | Pretext with real canvas and loaded fonts (exact) | HarfBuzz backend |

**Applying patches without a full re-render** [P]. The spec lives in an external store (area 1's `applyOp`). Each instance renders through `<BlockHost id>`, which is memoised and subscribes with `useSyncExternalStore` to `state.instances[id]`. A `setContent` or `replaceVariant` patch re-renders one block. `setTheme` touches no React tree, because only CSS variables change. `moveBlock` reorders keyed children. A variant whose code is not loaded yet keeps showing the old render until `import()` resolves (`startTransition`).

**The Wall** [P, rendering verified M]. Render dozens of sites in **one document**, not one iframe per site. Each tile is a `<div data-site="t17">` with its own scoped theme `<style>`, a fixed layout width of 1280 px and `zoom` (Baseline 2024-05 [V web-features]). Zoom shrinks the layout box, so tiles flow in a CSS grid. Container queries and `cqi` resolve against the 1280 px width [M, Chrome 155]. Add `content-visibility: auto` per tile. Cross-breeding is swapping the theme on a tile (variables only) or swapping the instance tree (a React render of that tile only). Rendering cost: 48 sites × 10 sections took 3 ms as HTML strings in Node [M]. Client DOM creation will cost more; I estimate 50–200 ms for 48 tiles, and area 5 should measure it.
- Conditions: no block or kit CSS may target `html`, `body` or `:root`, and `@font-face` rules go in the document head once per family.

### D11. Fonts (two-way door)

- **Source:** Fontsource packages (MIT packaging, fonts mostly OFL) [V `fontsource/fontsource`]. Their woff2 files are already split by script subset, for example Inter latin 400 is 23,664 B and Fraunces latin 600 is 18,096 B [V file sizes]. Prefer `@fontsource-variable/*` (5.3.0 [V]) so one file covers every weight.
- **Delivery:** `@font-face` with `unicode-range` per subset, so the browser fetches only the subsets the text uses. Serve the files from the *site's own origin* under `/_f/<hash>.woff2` with immutable caching: from Workers static assets (20,000 files per version on Free, 100,000 on Paid, 25 MiB per file [V limits page]) or R2 on Cloudflare, and from disk when self-hosted. No third-party font host, so no extra connection and no privacy issue.
- **No layout shift:** fallback faces with `size-adjust`, `ascent-override`, `descent-override` and `line-gap-override`, computed at library build with Capsize (`@capsizecss/core` `createFontStack`, `@capsizecss/metrics` 4.4.0, MIT [V README]) or fontaine 1.0.3 (MIT). Caveat: web-features lists the ascent, descent and line-gap overrides as unsupported in Safari, while `size-adjust` works there [V web-features `font-metric-overrides`]. Expect a small shift in Safari only.
- `font-display: swap` plus a `<link rel=preload>` for the display face's latin subset only.
- **Measurement copies:** HarfBuzz needs TTF or OTF, not woff2. Keep a TTF of each catalog face for the measurer, built from the same source version as the woff2. Variable fonts with an `opsz` axis need the optical size set to the CSS px size, because Chrome applies `font-optical-sizing: auto`. Without it, 75 of 600 test headlines measured wrong [M].
- **Script coverage** (report 05 §2.2): the theme picks a fallback face per script (Noto). The measurer must use the same chain. In the experiment, Arabic and Japanese fixtures were measured with Latin fonts, which gives meaningless widths [M]. So the font catalog must declare coverage, and the measurer must implement the fallback.

### D12. Images (one-way door for the value shape)

- **Value shape in content:** `{ asset: id, alt, focal?: {x, y} }`. **Asset table** in the spec: `{ src, width, height, mime, licence, source }` (area 1).
- **Rendering:** the `Picture` primitive emits `srcset` over a **fixed ladder** of 320, 480, 640, 960, 1280, 1600, 1920 and 2560 px, capped at the intrinsic width. It also emits `sizes` from the block, `width` and `height` (no layout shift), `loading` and `fetchpriority`, plus `object-fit: cover; object-position: var(--fx) var(--fy)`. **Crops are done by CSS at the focal point**, so the server only resizes by width.
- **Why width-only:** Cloudflare bills **$0.50 per 1,000 unique transformations per month after 5,000 free**, where a unique transformation is a source image plus parameters, and `format` and `quality` do not count [V developers.cloudflare.com/images/pricing]. With width-only on a ladder, each image costs at most 8 unique transformations whatever the variants, aspect ratios or Wall tiles.
- **Drivers** (one function `(src, width) → url`):
  - Cloudflare: `/cdn-cgi/image/width=W,format=auto/<src>`. `gravity=XxY` and `gravity=auto` (saliency) and `face` also exist [V transform-via-url docs]. Use `gravity=auto` *once at upload* to suggest a focal point, then store it.
  - Self-hosted: ipx (MIT [V]) or imgproxy (Apache-2.0 [V]) behind `/_img/`.
  - None: originals, for export and development.
- **Procedural imagery** (Surfaces) renders to SVG at publish and is stored as an asset like any other.

### D13. Icons (one-way door for names)

The icon slot stores **our** name (`clock`, `phone`, `leaf`, `delivery`), an alias table of about 300 names mapped to Lucide (ISC [V `LICENSE`], lucide-static 1.72.0). The renderer inlines the SVG path data, so there is no icon font, no sprite request and no JavaScript. `stroke-width: var(--icon-stroke)` makes weight a theme axis. Phosphor (MIT) can come later as a second set behind the same names. Storing Lucide's own names would tie 10,000 saved sites to one vendor's naming.

### D14. Fit rules and text measurement (two-way engine; geometry format one-way-ish)

**How a block declares fit:** per variant, `text` geometry plus `fit(m)` and `score(m)` over a `Measure` API: `lines(slot, probe)`, `longestWord(slot, probe)`, `count`, `has` and `aspect` (§3.1). Predicates are TypeScript functions, not a data DSL, because every consumer (pipeline, editor, CI) is TypeScript. Area 3 gets natural-language `describe` text for the model, and deterministic code applies `fit` before or after the model's choice.

**Engine:** Pretext 1.0.0 (MIT; GitHub shows NOASSERTION, but `LICENSE` is MIT [V]). Pretext needs canvas `measureText`, and outside a browser you "define a global `OffscreenCanvas` class whose `getContext()` returns … a `measureText(text)` that returns `{ width }`" [V README]. My backend shapes text with HarfBuzz WASM, which is the shaper Chromium itself uses.

**What runs in Cloudflare Workers** [M, workerd from wrangler 4.162.0, compatibility date 2026-11-01]:
- `Intl.Segmenter` is present, and Unicode property escapes work. There is no `OffscreenCanvas` and no canvas.
- harfbuzzjs 1.6.4 does **not** run unmodified. Three issues and fixes:
  1. Its entry runs `init(await createHarfBuzz())` at import and fetches the WASM relative to `import.meta.url`. Fix: vendor it and export `load({ instantiateWasm })` that uses a WASM module imported through wrangler's `CompiledWasm` rule.
  2. Its Emscripten glue detects Node through `process` and tries `createRequire`. Fix: force the web path.
  3. `init()` calls `Module.addFunction`, which compiles WASM at runtime, and Workers refuse with "Wasm code generation disallowed by embedder". Fix: pass a null destroy callback for font blobs, which live for the isolate's lifetime.

  With those three patches (about 6 changed lines, kept with `pnpm patch`), the whole fit check ran inside the Worker.
- Font files load as `Data` modules (or from R2), up to 1.2 MB for two variable TTFs.

**Accuracy** [M]:
- 600 random headlines and paragraphs (Fraunces 600, Inter 700, Inter 400, Noto Sans Armenian 600; 16–80 px; widths 260–1160 px): **600/600** line counts equal Chrome's DOM. That took 29 ms total in Node.
- With `opsz` not set: 75/600 wrong.
- End to end (theme → declared geometry → Pretext → line count, compared with the rendered hero in Chrome at each probe): **39/39** after fixing the two bugs the test found (probe definition, D6; a subhead declared `half` that the markup made `two-thirds`).
- Only Chrome was calibrated. Safari and Firefox break lines with their own engines, and Pretext has profiles for them that I did not test.

**Where the check runs.** In the pipeline (Worker or Node) with the HarfBuzz backend. In the editor with real canvas. In CI as the calibration test. To leave margin for other engines, hard predicates use limits one line looser than the design target [P].

**Fallback when no variant fits** (report 05 §3.2; area 3 owns the loop): try a smaller display step, then a variant with a wider box, then ask the text writer for a shorter value with the measured overflow as the reason. In the experiment the `maximal` and `long-word` fixtures fit no variant, which is the intended outcome [M].

**Not in the measurer:** `text-wrap: pretty` (may change line breaks; Baseline status: not Baseline, Chrome and Safari only [V web-features]) is used only for body text, where predicates are loose. `text-wrap: balance` keeps the line count, so headings may use it.

### D15. Block versioning (one-way door)

- `version` in the manifest is semver. A saved instance stores `type` and `v` (the major only). Minor and patch versions float.
- **Breaking (major):** removing or renaming a slot or a variant; changing a slot's kind; tightening a limit (lower `max`, higher `min`, narrower aspect range, fewer list items); making an optional slot required; removing a surface or behavior that saved instances use.
- **Not breaking:** visual changes within the token contract, new optional slots, new variants, looser limits, fit rule changes, new fixtures.
- **Migrations** live in `migrations.ts` as pure, forward-only functions per major: `{ 2: ({ content, variant }) => ({ content, variant }) }`. They run on load in area 1's spec migration pass. Only the latest code of each block exists; old majors are never rendered. CI keeps the fixtures of every old major and checks that each migrates to valid current content.
- **Published pages are snapshots** (D7), so a library release never silently changes a live site. Whether sites should pick up improvements automatically is founder question Q1.
- **Coordination with area 1's pinning question:** pin the major per instance and record the `libraryVersion` content hash per publish and per generation record (area 3 asked for this). Area 6's registry id `core/hero-split@2` names a block-plus-variant; I recommend the block id `core/hero` plus a separate `variant`, so that variant swaps never change the block's version line.

### D16. Quality enforcement in CI (two-way door)

Run on every changed block (and its dependents through the kit), and on the whole library nightly. **This is the same gate the foundry uses.**

| Check | Tool | Where | Notes |
|---|---|---|---|
| Types | `tsc` (TypeScript 7.0.2) | node | Manifest generics infer content types |
| Lint, tokens, RTL, purity | ESLint + better-tailwindcss 4.11.0 + core rules | node | §3.5 |
| Manifest valid; slot and variant names unchanged unless the major changed; `describe` ≤ 40 words; licence on the SPDX allowlist | Vitest 5.1.0 | node | Compares with the previous library snapshot |
| Fixtures valid; required fixture names present | Vitest + derived Zod | node | `minimal, typical, maximal, long-word, rtl, cjk` |
| Migrations | Vitest | node | Old-major fixtures → current schema |
| Determinism | Vitest | node | Render twice → byte-identical |
| Fit rules total and pure | Vitest | node | No throw on any fixture; at least one variant fits `typical` |
| **Calibration** | Playwright + Chrome | browser | Predicted vs DOM lines, every variant × fixture × probe, as in §3.4 |
| Overflow, clipping, tap targets ≥ 44 px, heading order | Playwright, our DOM script | browser | Widths 320 + 3 probes + 1920 |
| Accessibility | axe-core 4.14.0 (`wcag2a, wcag2aa, wcag21aa, wcag22aa, best-practice`) | browser | Also on `inverse` and `brand` surfaces |
| Contrast of every role pair on every surface, for sample themes | Vitest (colour maths) | node | WCAG 2.2 AA |
| Visual regression | Playwright `toHaveScreenshot` | browser | Canonical fixture × 2 widths × 2 sample themes per variant, changed blocks only |
| Size budgets | Vitest | node | HTML ≤ 6 KB gzip per section on `typical`, ≤ 300 candidates per block, behavior modules ≤ 2 KB gzip |

**Measured cost** of the browser half for one block [M]: 60 renders (6 fixtures × eligible variants × 5 widths) with axe and the geometry script took 5.4 s sequentially, about 91 ms per render. They found two real defects: a missing `<main>` landmark (a renderer fix) and a long German word overflowing the centered variant (fixed in the `Heading` primitive with `max-w-full`). At 500 blocks × about 4 variants that is roughly 4 CPU-minutes per full run with 8 workers [P].

**No Storybook** (10.6.7 is current [V]) **and no Ladle** (last published 4 Nov 2025 [V]). A dev route `/dev/blocks/:type?variant=&fixture=&theme=&width=` in the editor app renders anything through the real renderer. It is the gallery, the Playwright target and the foundry's review page. Vitest browser mode (5.1.0) is not needed, because Playwright Test drives Chrome directly.

### D17. The library at scale (two-way door)

```
packages/
  block-kit/                  the contract (owned by core)
    src/define.ts             slot constructors, defineBlock, Measure, PROBES, contentSchema
    src/ui/                   Section, Container, Heading, Text, Eyebrow, ButtonLink, Picture, Icon, List…
    src/css/kit.css           @theme tokens, surfaces, type-* utilities, primitive attributes
    src/behaviors/            nav-menu.ts, disclosure.ts, dialog.ts, tabs.ts, carousel.ts, form.ts
    src/measure/              pretext-harfbuzz.ts (server), canvas.ts (browser), vendor/harfbuzz (patched)
  themes/                     theme engine: tokens.ts, families/*.ts, palette.ts (OKLCH), fonts/catalog.ts
  blocks/
    hero/                     manifest.ts, hero.tsx, fixtures.ts, migrations.ts
    features/ …               one folder per block type; category is a manifest field, not a folder
  renderer/                   renderBody, renderDocument, buildSiteCss, image drivers, font-face builder
  library/                    gen script and its outputs (generated, not committed):
    dist/snapshot.json        every manifest as data + JSON Schemas + AI text, libraryVersion = sha256
    dist/candidates.json      Tailwind candidates per block
    dist/client.gen.ts        { hero: () => import('blocks/hero/hero'), … } for the editor
    dist/server.gen.ts        static imports for the Worker
    dist/fit.gen.ts           manifests with fit predicates, for the pipeline
```

- **The editor ships no block code up front.** The decision pipeline needs only `snapshot.json` and `fit.gen.ts`. The editor imports each block on first use, and Vite splits one chunk per block. The Worker imports everything statically. At an estimated 3–8 KB per block, 500 blocks add 1.5–4 MB to the Worker, within the 64 MiB limit [P]. Startup time must be measured against the 1 s limit as the library grows; if it gets close, use lazy `import()` inside the Worker.
- **Published pages contain only the blocks used,** by construction, because the HTML is static and the CSS is built from those blocks' candidates.

### D18. Export for an LLM reader (two-way door; kept cheap)

```
my-site/
  AGENTS.md            the block contract in one page: purity, tokens, slots, how to add a section
  site.json            the spec (source of truth), with content
  theme.css            generated tokens for [data-site]
  blocks/<type>/       only the blocks used: manifest.ts, component, fixtures
  kit/                 block-kit (define, ui, kit.css, behaviors)
  render.ts            the same renderer
  scripts/build.ts     site.json → dist/*.html + CSS (Tailwind compile, same as publish)
  package.json         pnpm, react, react-dom, tailwindcss, zod; Apache-2.0 + THIRD_PARTY_NOTICES
```

A coding agent edits `site.json` for content and layout, or writes a new block to the contract it can read. The build is about 50 lines. Compiled-JSX export (TanStack Start routes with literal props, as in report 03 §6) is deferred.

---

## 3. The example block and pipeline sketches

All code here compiled with TypeScript 7.0.2 and ran [M], except where marked sketch.

### 3.1 The contract (`block-kit/src/define.ts`, essentials)

```ts
import { z } from 'zod'

/** Content-box widths of the block's own container at which fit rules run: the narrowest width of
 *  each layout range (sm < 640 <= md < 1024 <= lg). Fixed forever. */
export const PROBES = { sm: 328, md: 640, lg: 1024 } as const
export type Probe = keyof typeof PROBES
export const TEXT_STYLES = ['display', 'h2', 'h3', 'lead', 'body', 'small', 'eyebrow', 'button'] as const
export type TextStyle = (typeof TEXT_STYLES)[number]
export type BoxWidth = 'full' | 'two-thirds' | 'half' | 'third'
export type Surface = 'base' | 'muted' | 'brand' | 'inverse'

type SlotBase<K extends string, V, O extends boolean> = { kind: K; optional: O; purpose: string; readonly __value?: V }
export type TextSlot<O extends boolean = boolean> = SlotBase<'text', string, O> & { min: number; max: number }
export type LinkValue = { label: string; href: string }
export type LinkSlot<O extends boolean = boolean> = SlotBase<'link', LinkValue, O> & { labelMax: number }
export type ImageValue = { asset: string; alt: string; focal?: { x: number; y: number } }
export type ImageSlot<O extends boolean = boolean> = SlotBase<'image', ImageValue, O> & {
  aspect: [number, number]; focal: boolean; role: 'photo' | 'illustration' | 'logo' | 'art'
}
// IconSlot, ListSlot<I>, FactSlot follow the same pattern.

type Opt<O> = { optional?: O; purpose: string }
export const s = {
  // NoInfer: without it TS infers O from the contextual return type and optional slots become required.
  text: <O extends boolean = false>(o: Opt<O> & { min?: number; max: number }): TextSlot<NoInfer<O>> =>
    ({ kind: 'text', optional: (o.optional ?? false) as O, purpose: o.purpose, min: o.min ?? 1, max: o.max }),
  link: <O extends boolean = false>(o: Opt<O> & { labelMax: number }): LinkSlot<NoInfer<O>> =>
    ({ kind: 'link', optional: (o.optional ?? false) as O, purpose: o.purpose, labelMax: o.labelMax }),
  image: <O extends boolean = false>(o: Opt<O> & { aspect: [number, number]; focal?: boolean; role: ImageSlot['role'] }): ImageSlot<NoInfer<O>> =>
    ({ kind: 'image', optional: (o.optional ?? false) as O, purpose: o.purpose, aspect: o.aspect, focal: o.focal ?? true, role: o.role }),
  // icon, list, fact …
}

export interface Measure<C> {
  lines(slot: Extract<keyof C, string>, at: Probe): number        // 0 when empty
  longestWord(slot: Extract<keyof C, string>, at: Probe): number  // widest word / box width; > 1 means it must break
  count(slot: Extract<keyof C, string>): number
  has(slot: Extract<keyof C, string>): boolean
  aspect(slot: Extract<keyof C, string>): number | undefined
}

export type VariantDef<C> = {
  label: string
  uses: ReadonlyArray<Extract<keyof C, string>>
  requires?: ReadonlyArray<Extract<keyof C, string>>
  text: Partial<Record<Extract<keyof C, string>, { style: TextStyle; width: Partial<Record<Probe, BoxWidth>> & { sm: BoxWidth } }>>
  fit: (m: Measure<C>) => boolean
  score?: (m: Measure<C>) => number
  surfaces?: ReadonlyArray<Surface>
  // For area 3 (sketch, not in the experiment): describe: string (<= 40 words); signature: Record<string, string>
}

export type BlockManifest<C, V extends string> = {
  type: string
  version: `${number}.${number}.${number}`
  role: 'nav' | 'hero' | 'features' | 'proof' | 'pricing' | 'faq' | 'cta' | 'contact' | 'gallery' | 'team' | 'footer' | 'content'
  placement?: { position?: 'first' | 'last' | 'any'; maxPerPage?: number }
  ai: { description: string; whenToUse: string; whenNotToUse?: string; tags: string[] } // + relevance question (area 3)
  content: C
  variants: Record<V, VariantDef<C>>
  surfaces: ReadonlyArray<Surface>
  behaviors: ReadonlyArray<'disclosure' | 'tabs' | 'carousel' | 'nav-menu' | 'form' | 'dialog'>
  license: { spdx: 'MIT' | 'Apache-2.0' | 'ISC' | 'BSD-3-Clause'; source: string; notice?: string }
  // area 6 fields (sketch): requires?: string[]; binds?: …; render: 'static' | 'island' | 'sandboxed-island'; fallback: string
}

export function defineBlock<C extends Record<string, Slot>, V extends string>(
  m: BlockManifest<NoInfer<C>, V> & { content: C },
): BlockManifest<C, V> { return m }

function slotSchema(slot: Slot): z.ZodType {
  switch (slot.kind) {
    case 'text': return z.string().min(slot.min).max(slot.max)
    case 'link': return z.object({ label: z.string().min(1).max(slot.labelMax), href: z.string().max(2048) })
    case 'image': return z.object({ asset: z.string(), alt: z.string().max(250),
      focal: z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) }).optional() })
    case 'icon': return z.string().regex(/^[a-z0-9-]+$/)
    case 'list': return z.array(contentSchema(slot.of)).min(slot.min).max(slot.max)
  }
}
export const contentSchema = (c: Record<string, Slot>) =>
  z.object(Object.fromEntries(Object.entries(c).map(([k, v]) => [k, v.optional ? slotSchema(v).optional() : slotSchema(v)])))
```

### 3.2 The hero block, complete

`packages/blocks/hero/manifest.ts`:

```ts
import { defineBlock, s } from '@builder/block-kit'

export default defineBlock({
  type: 'hero',
  version: '1.0.0',
  role: 'hero',
  placement: { position: 'first', maxPerPage: 1 },
  ai: {
    description: 'Opening section of a page: one headline, an optional supporting line, one or two calls to action, optional image.',
    whenToUse: 'The first section of almost every landing or home page.',
    whenNotToUse: 'Inside a page after the first section; use a CTA band instead.',
    tags: ['hero', 'above-the-fold', 'headline'],
  },
  content: {
    eyebrow: s.text({ optional: true, max: 40, purpose: 'Short label above the headline: a category, place or offer.' }),
    headline: s.text({ min: 8, max: 80, purpose: 'The main promise of the business, in plain words.' }),
    subhead: s.text({ optional: true, max: 200, purpose: 'One or two sentences that support the headline.' }),
    primaryCta: s.link({ labelMax: 24, purpose: 'The main action, e.g. Book a table.' }),
    secondaryCta: s.link({ optional: true, labelMax: 24, purpose: 'A softer second action, e.g. See the menu.' }),
    image: s.image({ optional: true, aspect: [0.6, 2.2], role: 'photo', purpose: 'A photo of the place, product or people.' }),
  },
  variants: {
    centered: {
      label: 'Centered type',
      uses: ['eyebrow', 'headline', 'subhead', 'primaryCta', 'secondaryCta'],
      text: {
        headline: { style: 'display', width: { sm: 'full', lg: 'two-thirds' } },
        subhead: { style: 'lead', width: { sm: 'full', lg: 'two-thirds' } },
      },
      fit: (m) => m.lines('headline', 'lg') <= 3 && m.lines('headline', 'sm') <= 6 && m.longestWord('headline', 'sm') <= 1,
      score: (m) => (m.has('image') ? 0.3 : 0.9),
    },
    split: {
      label: 'Text beside image',
      uses: ['eyebrow', 'headline', 'subhead', 'primaryCta', 'secondaryCta', 'image'],
      requires: ['image'],
      text: {
        headline: { style: 'display', width: { sm: 'full', md: 'full', lg: 'half' } },
        subhead: { style: 'lead', width: { sm: 'full', lg: 'half' } },
      },
      fit: (m) =>
        m.lines('headline', 'lg') <= 4 && m.lines('subhead', 'lg') <= 4 && m.longestWord('headline', 'lg') <= 1 &&
        (m.aspect('image') ?? 1) >= 0.6 && (m.aspect('image') ?? 1) <= 1.6,
      score: () => 0.8,
    },
    overlay: {
      label: 'Text over full-bleed image',
      uses: ['eyebrow', 'headline', 'subhead', 'primaryCta', 'secondaryCta', 'image'],
      requires: ['image'],
      text: {
        headline: { style: 'display', width: { sm: 'full', lg: 'two-thirds' } },
        subhead: { style: 'lead', width: { sm: 'full', lg: 'two-thirds' } },
      },
      // Short copy only: long text over a photo hurts contrast and hides the image.
      fit: (m) => m.lines('headline', 'lg') <= 2 && m.lines('headline', 'sm') <= 4 && m.lines('subhead', 'sm') <= 4 && (m.aspect('image') ?? 0) >= 1.2,
      score: (m) => (m.lines('headline', 'lg') === 1 ? 1 : 0.6),
      surfaces: ['inverse'],
    },
  },
  surfaces: ['base', 'muted', 'brand', 'inverse'],
  behaviors: [],
  license: { spdx: 'Apache-2.0', source: 'in-house' },
})
```

`packages/blocks/hero/hero.tsx`:

```tsx
import type { BlockProps } from '@builder/block-kit'
import { ButtonLink, Container, Eyebrow, Heading, Picture, Section, Text } from '@builder/block-kit'
import type manifest from './manifest'

export default function Hero({ content: c, variant, ctx }: BlockProps<typeof manifest>) {
  const actions = (
    <div className="flex flex-wrap gap-sm">
      <ButtonLink ctx={ctx} link={c.primaryCta} priority="primary" />
      {c.secondaryCta && <ButtonLink ctx={ctx} link={c.secondaryCta} priority="secondary" />}
    </div>
  )
  const copy = (
    <>
      {c.eyebrow && <Eyebrow ctx={ctx}>{c.eyebrow}</Eyebrow>}
      <Heading ctx={ctx} style="display">{c.headline}</Heading>
      {c.subhead && <Text style="lead">{c.subhead}</Text>}
    </>
  )

  switch (variant) {
    case 'centered':
      return (
        <Section ctx={ctx} role="hero">
          <Container className="flex flex-col items-center gap-md text-center">
            <div className="flex w-full flex-col items-center gap-sm @lg:w-2/3">{copy}</div>
            {actions}
          </Container>
        </Section>
      )
    case 'split':
      return (
        <Section ctx={ctx} role="hero">
          <Container className="grid items-center gap-columns @lg:grid-cols-2">
            <div className="flex flex-col items-start gap-md">
              <div className="flex flex-col gap-sm">{copy}</div>
              {actions}
            </div>
            {c.image && (
              <Picture ctx={ctx} image={c.image} aspect={4 / 5} priority className="aspect-portrait w-full"
                sizes="(min-width: 1024px) 50vw, 100vw" />
            )}
          </Container>
        </Section>
      )
    case 'overlay':
      return (
        <Section ctx={ctx} role="hero" className="relative isolate flex min-h-hero items-end overflow-hidden">
          {c.image && (
            <Picture ctx={ctx} image={c.image} aspect={16 / 9} priority className="absolute inset-0 -z-10 size-full rounded-none"
              sizes="100vw" />
          )}
          <div aria-hidden="true" className="scrim absolute inset-0 -z-10" />
          <Container className="flex flex-col items-start gap-md">
            <div className="flex w-full flex-col gap-sm @lg:w-2/3">{copy}</div>
            {actions}
          </Container>
        </Section>
      )
  }
}
```

`packages/blocks/hero/fixtures.ts`:

```ts
import type { ContentOf } from '@builder/block-kit'
import type manifest from './manifest'

type C = ContentOf<(typeof manifest)['content']>
const img = (asset: string, alt: string, focal = { x: 0.5, y: 0.4 }) => ({ asset, alt, focal })

export const fixtures = {
  minimal: { headline: 'Fresh bread.', primaryCta: { label: 'Visit', href: '#' } },
  typical: {
    eyebrow: 'Since 1982 · Yerevan',
    headline: 'Sourdough baked by hand every morning',
    subhead: 'Neighbourhood bakery with wholesale for cafés and cakes for every celebration.',
    primaryCta: { label: 'Order for pickup', href: '/order' },
    secondaryCta: { label: 'See the menu', href: '/menu' },
    image: img('fx-bakery-wide', 'Loaves cooling on a wooden rack', { x: 0.62, y: 0.45 }),
  },
  maximal: {
    eyebrow: 'Award-winning family bakery & café since 1982',
    headline: 'Sourdough, croissants and celebration cakes baked by hand every single morning',
    subhead: 'From our wood-fired oven in the old town to your table: wholesale for cafés and restaurants, catering for weddings and birthdays, gluten-free options and next-day delivery across the city.',
    primaryCta: { label: 'Order for pickup today', href: '/order' },
    secondaryCta: { label: 'Wholesale enquiries', href: '/wholesale' },
    image: img('fx-bakery-tall', 'Baker shaping dough at a floured bench'),
  },
  'long-word': { headline: 'Kraftfahrzeughaftpflichtversicherung, einfach erklärt', primaryCta: { label: 'Angebot', href: '#' } },
  rtl: {
    headline: 'خبز طازج مخبوز يدويًا كل صباح',
    subhead: 'مخبز الحي مع خدمة الجملة للمقاهي والكعك لكل مناسبة.',
    primaryCta: { label: 'اطلب الآن', href: '#' },
    image: img('fx-bakery-wide', 'أرغفة خبز على رف خشبي'),
  },
  cjk: {
    headline: '毎朝、手でこねて焼き上げるサワードウ',
    subhead: '近所のパン屋さん。カフェへの卸売りと、お祝いのケーキもご用意しています。',
    primaryCta: { label: '注文する', href: '#' },
  },
} satisfies Record<string, C>
```

`migrations.ts` (sketch, for the day the hero reaches 2.0.0 by dropping `overlay`):

```ts
import type { Migration } from '@builder/block-kit'
export const migrations: Record<number, Migration> = {
  2: ({ content, variant }) => ({ content, variant: variant === 'overlay' ? 'split' : variant }),
}
```

Fit results for the hero under the sample theme, computed inside workerd [M]:

| Fixture | centered | split | overlay |
|---|---|---|---|
| minimal | fits (0.9) | needs image | needs image |
| typical | fits (0.3) | fits (0.8) | fits (0.6) |
| maximal | no | no | no → the fallback chain runs |
| long-word | no (word wider than the 328 px box) | — | — |

The rtl and cjk results are not meaningful, because they were measured with Latin fonts (D11).

### 3.3 Primitives and kit CSS (excerpts)

```tsx
// block-kit/src/ui — primitives decide markup for theme axes once, for every block.
export function Section(p: { ctx: RenderCtx; role: string; label?: string; className?: string; children: ReactNode }) {
  return (
    <section data-block-id={p.ctx.id} data-block={p.role} data-surface={p.ctx.surface} aria-label={p.label}
      className={cx('@container bg-bg text-fg py-section px-gutter', p.className)}>{p.children}</section>
  )
}
export function Heading(p: { ctx: RenderCtx; style: 'display' | 'h2' | 'h3'; level?: 1 | 2 | 3; className?: string; children: ReactNode }) {
  const level = p.level ?? (p.style === 'h3' ? 3 : p.ctx.headingLevel)   // the renderer gives the first block h1
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3'
  return <Tag className={cx(`type-${p.style}`, 'max-w-full text-balance', p.className)}>{p.children}</Tag>
}
export function ButtonLink(p: { ctx: RenderCtx; link: LinkValue; priority: 'primary' | 'secondary' }) {
  const style = p.priority === 'primary' ? p.ctx.theme.button : 'outline'
  return <a href={safeUrl(p.link.href)} data-button={style}
    className="btn type-button inline-flex min-h-tap items-center justify-center px-md rounded-control">{p.link.label}</a>
}
export function Picture(p: { ctx: RenderCtx; image: ImageValue; sizes: string; aspect: number; priority?: boolean; className?: string }) {
  const a = p.ctx.image(p.image, { sizes: p.sizes, aspect: p.aspect })
  const fx = Math.round((p.image.focal?.x ?? 0.5) * 100), fy = Math.round((p.image.focal?.y ?? 0.5) * 100)
  return <img src={a.src} srcSet={a.srcSet} sizes={p.sizes} width={a.width} height={a.height} alt={p.image.alt}
    loading={p.priority ? 'eager' : 'lazy'} fetchPriority={p.priority ? 'high' : undefined} decoding="async"
    data-treatment={p.ctx.theme.imageTreatment}
    style={{ '--fx': `${fx}%`, '--fy': `${fy}%` } as React.CSSProperties}   // the only inline style in the library
    className={cx('media-cover rounded-media', p.className)} />
}
```

```css
/* block-kit/src/css/kit.css (excerpt) */
@layer theme, base, components, utilities;
@import "tailwindcss/preflight.css" layer(base);
@import "tailwindcss/utilities.css" layer(utilities);   /* forget this and no utilities are emitted */

@theme {
  --*: initial;                         /* no default palette, scale, fonts or breakpoints */
  --container-md: 40rem; --container-lg: 64rem;
  --container-content: 72rem; --container-prose: 40rem; --container-wide: 90rem;
  --color-bg: var(--p-base-bg); --color-fg: var(--p-base-fg); --color-fg-muted: var(--p-base-fg-muted);
  --color-accent: var(--p-base-accent); --color-accent-fg: var(--p-base-accent-fg); --color-border: var(--p-base-border);
  --spacing-2xs: 4px; --spacing-xs: 8px; --spacing-sm: 12px; --spacing-md: 20px; --spacing-lg: 32px;
  --spacing-xl: 48px; --spacing-2xl: 72px; --spacing-section: 96px; --spacing-gutter: 16px; --spacing-columns: 24px;
  --spacing-tap: 2.75rem;
  --radius-control: 8px; --radius-card: 12px; --radius-media: 8px; --radius-none: 0;
  --aspect-portrait: 4 / 5; --aspect-square: 1 / 1; --aspect-landscape: 3 / 2; --aspect-wide: 16 / 9;
}
@layer base {
  [data-site] { container-type: inline-size; background: var(--color-bg); color: var(--color-fg); font-family: var(--font-body); }
  [data-surface="inverse"] { --color-bg: var(--p-inverse-bg); --color-fg: var(--p-inverse-fg); /* … all 6 roles; same for base, muted, brand */ }
}
@utility type-display { font-family: var(--family-display); font-size: var(--text-display); line-height: var(--leading-display);
  letter-spacing: var(--tracking-display); font-weight: var(--weight-display); text-transform: var(--case-display); }
/* … type-h2, type-h3, type-lead, type-body, type-small, type-eyebrow, type-button */
@utility media-cover { object-fit: cover; object-position: var(--fx, 50%) var(--fy, 50%); }
@utility btn {
  &[data-button="solid"] { background: var(--color-accent); color: var(--color-accent-fg); }
  &[data-button="outline"] { box-shadow: inset 0 0 0 1.5px currentColor; }
  &[data-button="underline"] { text-decoration: underline; text-underline-offset: 0.25em; padding-inline: 0; }
  &:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }
}
```

The theme engine emits the CSS and the measurer's numbers from the same constants (excerpt of `themes/src/theme.ts`):

```ts
const FLUID_MIN = 328, FLUID_MAX = 1184            // content-box widths the fluid ramps span
const fluidCss = ([lo, hi]: [number, number]) => {  // → clamp() in cqi of the section
  const slope = (hi - lo) / (FLUID_MAX - FLUID_MIN), base = lo - slope * FLUID_MIN
  return `clamp(${lo}px, ${base.toFixed(3)}px + ${(slope * 100).toFixed(4)}cqi, ${hi}px)`
}
const fluidPx = ([lo, hi]: [number, number], cw: number) => Math.min(hi, Math.max(lo, lo + ((hi - lo) * (cw - FLUID_MIN)) / (FLUID_MAX - FLUID_MIN)))

export function resolveText(t: Theme, style: TextStyle, width: BoxWidth, cw: number) {
  const s = t.type[style], full = Math.min(cw, LAYOUT.contentMax), gap = fluidPx(LAYOUT.columns, cw)
  const box = { full, 'two-thirds': (full * 2) / 3, half: (full - gap) / 2, third: (full - 2 * gap) / 3 }[width]
  const size = fluidPx(s.size, cw), weight = s.weight ?? t.fonts[s.font].weight
  return { font: `${weight} ${size}px "${t.fonts[s.font].family}"`, size, lineHeight: size * s.leading, letterSpacing: s.tracking * size, width: box }
}
```

### 3.4 Fit evaluation and the calibration test

```ts
// fit.ts — runs in the pipeline, the editor and CI
import { layout, measureNaturalWidth, prepare } from '@chenglou/pretext'

export function evaluateFit(m: BlockManifest<…>, content: Record<string, unknown>, theme: Theme) {
  const out: Record<string, { eligible: boolean; fit: boolean; score: number }> = {}
  for (const [name, v] of Object.entries(m.variants)) {
    const geometry = (slot: string, at: Probe) => {
      const g = v.text[slot]
      if (!g) throw new Error(`${m.type}.${name}: fit reads "${slot}" but declares no geometry for it`)
      return resolveText(theme, g.style, g.width[at] ?? (at === 'lg' ? g.width.md : undefined) ?? g.width.sm, PROBES[at])
    }
    const measure: Measure<…> = {
      lines: (slot, at) => { const t = textOf(content, slot); if (!t) return 0
        const r = geometry(slot, at); return layout(prep(t, r.font, r.letterSpacing), r.width, r.lineHeight).lineCount },
      longestWord: (slot, at) => { const t = textOf(content, slot); if (!t) return 0; const r = geometry(slot, at)
        return Math.max(...t.split(/\s+/).map((w) => measureNaturalWidth(prep(w, r.font, r.letterSpacing)))) / r.width },
      count: (slot) => (Array.isArray(content[slot]) ? (content[slot] as unknown[]).length : content[slot] ? 1 : 0),
      has: (slot) => content[slot] != null && content[slot] !== '',
      aspect: (slot) => assetAspect(content[slot]),
    }
    const eligible = (v.requires ?? []).every((s) => measure.has(s))
    const fit = eligible && v.fit(measure)
    out[name] = { eligible, fit, score: fit ? (v.score?.(measure) ?? 0.5) : 0 }
  }
  return out
}
```

The server measuring backend (inside the Worker; the browser uses real canvas instead):

```ts
globalThis.OffscreenCanvas = class {
  getContext() { return { font: '16px Inter', measureText(text: string) {
    const [, w, px, family] = /^(?:(\d{3})\s+)?([\d.]+)px\s+"?([^",]+)"?/.exec(this.font)!
    const weight = Number(w || 400), size = Number(px), f = fonts[family.trim()]
    const font = f.instance(weight, size)            // hb.Font with wght = weight and opsz = clamp(size) — opsz matters
    const buf = new hb.Buffer(); buf.addText(text); buf.guessSegmentProperties(); hb.shape(font, buf)
    let adv = 0; for (const p of buf.getGlyphPositions()) adv += p.xAdvance
    return { width: (adv * size) / f.upem }
  } } }
}
```

The calibration test (CI, Playwright and Chrome), as run:

```ts
for (const fixture of fixtureNames) for (const variant of eligibleVariants) for (const [probe, cw] of Object.entries(PROBES)) {
  await page.setViewportSize({ width: Math.ceil(pageWidthForContent(cw)), height: 900 })  // makes the section's content box = probe
  await page.setContent(renderDocument(specFor(fixture, variant), css, { imageUrl, fontFaces, preload: [] }))
  await page.evaluate(() => document.fonts.ready)
  const dom = await page.evaluate(() => {
    const lines = (el: Element | null) => el ? Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight)) : 0
    return { headline: lines(document.querySelector('h1')), subhead: lines(document.querySelector('p.type-lead')) }
  })
  for (const slot of measuredSlots) expect(predictLines(manifest, variant, slot, content[slot], theme, probe).lines).toBe(dom[slot])
}
// Result on the hero: 29/39 → (probe fix) 37/39 → (manifest fix) 39/39
```

### 3.5 ESLint for blocks

```js
// eslint.config.js (applies to packages/blocks/**)
import tw from 'eslint-plugin-better-tailwindcss'
import react from 'eslint-plugin-react'
export default [{
  files: ['packages/blocks/**/*.tsx'],
  plugins: { 'better-tailwindcss': tw, react },
  settings: { 'better-tailwindcss': { entryPoint: 'packages/block-kit/src/css/kit.css' } },
  rules: {
    'better-tailwindcss/no-unknown-classes': 'error',
    'better-tailwindcss/no-concatenated-classes': 'error',
    'better-tailwindcss/enforce-logical-properties': 'error',
    'better-tailwindcss/no-restricted-classes': ['error', { restrict: [
      { pattern: '\\[', message: 'No arbitrary values in blocks. Add a token to the kit instead.' },
      { pattern: '(^|:)dark:', message: 'No dark: variant. Dark is a palette, not markup.' },
      { pattern: '(^!|!$)', message: 'No !important.' },
    ] }],
    'react/forbid-dom-props': ['error', { forbid: ['style', 'dangerouslySetInnerHTML'] }],
    'no-restricted-imports': ['error', {
      paths: [{ name: 'react', importNames: ['useState', 'useEffect', 'useLayoutEffect', 'useRef', 'useContext',
        'useReducer', 'useSyncExternalStore', 'createContext', 'useId'], message: 'Blocks are pure functions of content.' }],
      patterns: ['@base-ui/*', 'radix-ui', '@radix-ui/*', 'motion', 'framer-motion', 'lucide-react'],
    }],
    'no-restricted-syntax': ['error', { selector: 'Literal[value=/#[0-9a-fA-F]{3,8}\\b|rgba?\\(|\\d+px/]', message: 'No literal colours or sizes.' }],
  },
}]
```

### 3.6 Publish pipeline sketch

```
publish(siteId)                                   (Worker; area 4 owns where it runs and stores)
  spec   ← load(siteId)                           D1/R2
  spec   ← migrate(spec, library)                 block majors forward (D15) + specVersion (area 1)
  for route in spec.routes:
    html  ← renderDocument(route, theme, { imageUrl: driver, fontFaces, preload })   static, no <script>
    used  ← blocks(route)
  css    ← compiler.build(union(candidates[kit], candidates[used]))                  ~1.5 ms
  fonts  ← fontFaceCss(theme.fonts, scriptsUsed(spec))  + preload for the display face
  js     ← behaviors(used) → <script type="module" src="/_b/<behavior>.<hash>.js">  usually none
  write  R2: sites/<siteId>/<deployId>/<route>/index.html, /_s/<cssHash>.css         atomic pointer flip in KV
serve(host, path)                                 one Worker for every tenant
  pointer ← KV(host) → R2 object → Cache API; /_f/* fonts and /_s/* CSS immutable
```

CSS is inlined in the HTML when it is under about 14 KB, otherwise linked. Inlining saves a round trip on a cold visit, and a typical site's CSS is 3–8 KB gzip [P].

### 3.7 Preview store sketch

```tsx
// editor iframe (sketch): one external store, one subscription per block
const store = createSpecStore(initialSpec)            // area 1's applyOp underneath
function BlockHost({ id }: { id: string }) {
  const inst = useSyncExternalStore(store.subscribe, () => store.get().instances[id])
  const C = useBlockComponent(inst.type)              // lazy import, cached; suspends only the first time
  return <C content={inst.content} variant={inst.variant} ctx={ctxFor(inst)} />
}
const MemoHost = memo(BlockHost)
store.onTheme((theme) => { themeStyleEl.textContent = themeToCss(theme, `[data-site="${siteId}"]`) })  // no React work
```

---

## 4. What to defer (do not build yet)

- **React islands on published pages** (`render: island`). Reserve the manifest field (area 6) and build when the first app block exists.
- **`richText` and `ref` slots**, and container blocks. Reserve the names.
- **Behaviors beyond `nav-menu`, `disclosure` and `form` for M0.** Add `dialog`, `tabs` and `carousel` when a block needs them.
- **Automatic dark mode** for every site (pending Q3). Dark-first families can ship.
- **Safari and Firefox calibration.** Calibrate Chrome only until fit failures show up in real use.
- **Compiled-JSX export**, Astro or HTML export targets, Mitosis, Vercel UI SDK.
- **A second icon set**, motion presets beyond CSS scroll-driven animations, AI image crops (use `gravity=auto` once at upload).
- **Storybook or Ladle**, Chromatic, cross-browser visual regression.
- **Lazy loading inside the Worker**, until startup time approaches 1 s.
- **Per-glyph font subsetting** (harfbuzz-subset). `unicode-range` subsets are enough.
- **Theme family authoring tools.** Families are TypeScript files reviewed by hand.

For M0 specifically: the kit (define, 6 primitives, kit.css), the theme engine with 3 themes, about 15 blocks to this contract, the renderer, the calibration and gate scripts, and the dev catalog route.

---

## 5. Requirements on the other five areas

**Area 1 — spec format and operations.**
1. A block instance has `{ id, type, v, variant, surface, content }`. `v` is the block's major. `variant` and `surface` are first-class fields, so `replaceVariant` and surface rhythm are single operations. `content` keeps slots the current variant does not use.
2. A top-level `assets` table: `{ id: { src, width, height, mime, licence, source, focalHint? } }`. Image values reference ids.
3. Page-level `lang` and `dir`, and a site `theme` object as defined by the theme engine (fonts, type, density, palette strategy and brand colour, radius, ornament, button, image treatment, motion). Store inputs, not derived CSS.
4. A migration hook that calls each block's `migrations[major]` during `specVersion` migration, and stores `libraryVersion` per publish.
5. Reserve `slots: Record<string, id[]>` on instances and the `ref` value kind.
6. Rich text, when it comes, is the JSON mark tree in D2, never HTML.

**Area 3 — decision and text pipeline.**
1. Read block data only from `snapshot.json` (manifests, JSON Schemas, `describe`, `signature`, relevance). Call `evaluateFit()` from `fit.gen.ts`, with the HarfBuzz backend, before or after variant choice.
2. Write text to slot limits in characters, and treat fit failure as a retry signal with the measured overflow ("2 lines too long at 328 px").
3. Do not choose surfaces per block freely; use the adjacency rules (report 05 §5.1) over the block's declared `surfaces`.

**Area 4 — repo, runtime, storage, hosting.**
1. Packages as in D17. The renderer and block-kit must import nothing from Cloudflare or Node (they ran in workerd, Node and Chrome unchanged).
2. Worker rules: `CompiledWasm` for `harfbuzz.wasm`, `Data` for measurement TTFs (or R2), `Text` for kit CSS. **Do not** enable `nodejs_compat` for the measuring module without re-checking the HarfBuzz glue.
3. One pinned Tailwind version across the library build, the Worker and the editor.
4. Serve `/_f/*` (fonts), `/_s/*` (CSS), `/_b/*` (behaviors) and `/_img/*` or `/cdn-cgi/image/*` on every site's own hostname. Self-hosted mode needs ipx or imgproxy and a static file server for the same paths.
5. Published HTML is a stored snapshot per deploy, with an atomic pointer flip.

**Area 5 — editor client and The Wall.**
1. Render the preview in one same-origin iframe with the catalog CSS, using an external store with per-block subscriptions; theme edits rewrite one style element.
2. Wall tiles are `[data-site]` roots at a fixed width (1280) with `zoom`, in one document, with `content-visibility: auto`; measure client render time for 48 tiles.
3. The selection overlay uses `data-block-id`, which the `Section` primitive always renders.
4. Run fit checks in the browser with Pretext's native canvas after fonts load.

**Area 6 — apps, forms, foundry.**
1. Foundry blocks are ordinary block folders and pass the D16 gate unchanged. They may use existing behaviors and never ship their own JavaScript while `render: 'static'`.
2. Form blocks render `<form method="post">` through a kit `Form` primitive; field definitions come from the forms capability, labels from text slots.
3. The registry fields of area 6 §3.5 (`hash`, `status`, `trust`, `fallback`, `budgets`, `render`) are generated from the manifest plus the build, not written by hand. I recommend `id` = block type and a separate `variant` (D15).

---

## 6. Questions for the founder

**Q1. When the library improves a block, do live sites change?**
- *A — Frozen until republished* (recommended default). A site looks exactly as approved, and a library regression cannot break 10,000 live sites. Cost: improvements and fixes reach a site only when its owner publishes again. Storage grows with each deploy's snapshot (small: about 10–30 KB per page).
- *B — Re-render all sites on each library release.* Sites get better on their own. Cost: every release needs a fleet-wide visual-regression pass and a rollback path. An owner may also see an unexpected change.

**Q2. How much motion and "wow" do published pages get?**
- *A — CSS-only motion* (scroll-driven animations, transitions; zero JavaScript). Cost: no physics-style effects, no WebGL heroes, no marquee libraries.
- *B — Allow an opt-in motion behavior* (for example Motion, about 15–30 KB [R, not measured]) on pages that choose it. Cost: weight and a second code path to test, and it erodes the "as light as possible" promise.

**Q3. Does every site get an automatic dark version?**
- *A — No.* Dark is a style family (dark-first). Cost: users who expect a system dark mode do not get one.
- *B — Yes.* Every theme generates a dark palette under `prefers-color-scheme`. Cost: twice the contrast gates and screenshots, and every user photo must look right on both.

**Q4. Which browsers must published sites support fully?**
- *A — "Baseline newly available" (about the last 2 years).* Native popover menus and `commandfor` work with zero JavaScript; Safari before 26.2 gets a 0.5 KB shim. Cost: a small share of old iOS devices sees the shim path.
- *B — "Baseline widely available" (about 2.5+ years).* Every menu and dialog uses a JavaScript behavior. Cost: more JavaScript on every site.

**Q5. What is an exported site for?**
- *A — "Keep building with a coding agent"*: spec + blocks + renderer (D18). Cost: the user's code is a small framework of ours, not plain pages.
- *B — "Own plain React code"*: compiled JSX routes with literal props. Cost: a code printer to build and maintain, and edits there cannot come back into the builder.

---

## 7. Risks

1. **The biggest risk: authoring cost of the contract.** Pure blocks, declared geometry, token-only styling and 6 fixtures per block slow down writing 500 blocks, and agents will push against the rules. Mitigations: a `pnpm new:block` scaffold; the calibration test printing the geometry it observed so authors copy it; and the kit growing tokens and primitives quickly (adding is cheap, removing is a migration).
2. **Measurement outside Chrome.** Only Chrome was calibrated. Safari's line breaking differs, and the server measures with fonts and fallbacks that must match exactly (opsz, script fallback). A wrong prediction means an ugly but never broken layout, since CSS still wraps. Keep one line of slack in hard predicates and log fit-versus-DOM mismatches from the editor in the field.
3. **Vendored HarfBuzz patches.** Three local changes to harfbuzzjs 1.6.4 must survive upgrades. Fallback: run fit checks in Node or the browser only, or switch to precomputed advance-width tables for Latin scripts.
4. **Token vocabulary too small.** Designers will want values the tokens lack, and pressure for arbitrary values will grow. Add tokens deliberately; never relax the lint.
5. **Tailwind version coupling.** The candidate lists, the Worker compiler and the editor CSS must use the same version, or published CSS silently misses utilities. CI should rebuild the CSS for a sample site and diff it against the editor's.
6. **Worker startup with 500 blocks.** Bundle size is fine, but parse time is not yet measured at scale; 1 s is a hard limit.
7. **Screenshot baseline storage.** 500 blocks × 4 variants × 2 widths × 2 themes is about 8,000 images. Keep them as CI artifacts keyed by block hash, not in git.
8. **Safari layout shift.** Without ascent and descent overrides, Safari shows a small font-swap shift.
9. **The report 03 assumption** (Base UI blocks) is reversed here. Anyone seeding blocks from shadcn must strip the interactive primitives.

---

## 8. Not verified

- Production Workers numbers. All workerd figures are local (wrangler dev). `performance.now()` in Workers only advances across I/O, so in-Worker timings are coarse; the Node timings are the reliable ones.
- Startup time and memory of a Worker carrying the full library and several font TTFs.
- Safari and Firefox line-break parity with the Pretext + HarfBuzz backend, and Pretext with real canvas in the editor (assumed from its README).
- Arabic, Hebrew, CJK and Indic measurement with script-matched fonts. My fixtures used Latin fonts for those scripts.
- The editor's catalog CSS size at 500 blocks, and client render time for 48 Wall tiles.
- The sizes of the behavior modules (`nav-menu` about 0.5 KB, others 1–1.5 KB) are estimates. None is written.
- The "zero-JS nav menu with `commandfor`" pattern was not tested in a browser here; support data comes from web-features 3.46.0.
- Capsize and fontaine fallback values for our pairings were not generated, so CLS was not measured.
- Cloudflare `gravity=auto` focal suggestions were not tried; the docs were read.
- Motion library weight in Q2 (reported, not measured).
- The exact `react/forbid-dom-props` option shape and the `no-restricted-syntax` regex in §3.5 were not run through ESLint. The better-tailwindcss rule names and the `entryPoint` setting were read in its docs.
- TanStack Start was not built end to end. The 96 KB figure is react-dom client plus TanStack Router bundled with esbuild, a lower bound for a Start page's client.
