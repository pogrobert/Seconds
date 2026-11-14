# Architecture

Second version, 2026-11-14. Six design reports (`01` to `06`) were reconciled into a first version, which an independent review (`07-review.md`) then attacked. This version includes the review's fixes.

**Order of authority:** this page, then `07-review.md`, then the numbered reports. The reports were written in parallel and contradict each other in places; where they differ from this page, this page wins.

Nothing here has been built. Figures marked *measured* come from one-off experiments on one laptop. Everything else is a design or an estimate.

## Decisions Robert made

| Question | Answer |
|---|---|
| Reach | Websites now, with room for apps (logins, databases, payments) later |
| Where it runs | The first version is the hosted copy only. Self-hosting comes later |
| Who site code is for | People who never open code. An exported project is read by an LLM coding agent |
| Stack | Fixed: pnpm, TypeScript, React, TanStack Start, Tailwind v4, Cloudflare |
| Published sites when a block improves | Stay frozen until the owner republishes |
| Custom code | Only inside a sandbox |
| Generating before sign-in | Yes, with limits |
| Thousands of items in one site | No. Small lists only in the first year, with room reserved to move large content out later |
| First milestone | The taste-and-contract test |

## The system in one page

1. **Site spec.** Our own data format, not json-render's. Four parts: `structure` (pages and blocks), `style` (design choices), `content` (text, images, business facts, lists) and `settings`. No CSS, class names, HTML or code.
2. **One list of content fields.** Fields such as `headline`, `subhead`, `body`, `primaryCta`, `media`, `items` are defined once, each with one shape. A **section type** (hero, FAQ, pricing…) is a named set of those fields with limits. A block implements one section type and says which fields it uses. It can never add a field of its own.
3. **Why that matters.** Swapping a block or variant never loses text. Changing a section's type keeps every field the two types share. The Wall writes the words once for every design, and cross-breeding two sites is a swap of parts.
4. **Fit is a character count.** Each variant states the longest text it can hold per field. Tests prove those limits for every font pairing before a block enters the library. When a site is generated, checking fit is a length comparison, with no fonts or measuring involved.
5. **Changes are transactions.** A change is a command (`addBlock`, `replaceVariant`, `setContent`…) that compiles to 15 primitive operations, grouped into one transaction with its own undo. Blocks and list items are addressed by stable ids, never by position. One chat turn is one transaction.
6. **Blocks.** A block is a pure React function with no hooks or state, plus a manifest. It uses theme tokens only and responds to its own width through container queries.
7. **Generation.** One pure function, `generate()`, with models behind two interfaces: one for decisions and one for text. The decision model is asked about **attributes** (image or none, alignment, density, emphasis), and code picks the variant that best matches. It is never asked to choose from a list of every variant. Facts such as prices and hours never pass through the text model.
8. **The server writes generated changes.** It makes the ids, compiles commands to primitives and streams them. The browser applies them and never sends them back.
9. **Editor.** The editor holds the only writable copy of the spec. The preview is a frame on a separate domain that receives operations as messages. The Wall is one page holding dozens of scaled-down live sites.
10. **Publishing.** A site is rendered once into plain HTML and one small stylesheet, stored as files, and served by a small Worker. Pages ship no JavaScript by default.

## Expensive to change later

Settle these before writing blocks or saving sites.

| Area | Decision | Source |
|---|---|---|
| Spec | Own format with a version number and chained migrations | 01, D1 and D13 |
| Spec | Four parts; reserved keys `capabilities`, `automations`, `permissions`, `integrations`, `extensions` | 01, D2; 06 |
| Content | One global list of fields, one shape each, using report 01's shapes (links point at page ids, list items have ids) | review B1 |
| Content | Section types are named subsets of that list, kept in one place with one owner, and only ever added to | review B1 |
| Spec | Flat maps keyed by id; random prefixed ids made by code, never by a model; references by id | 01, D4 to D6 |
| Addresses | One way to name a spot in a site: a path with `/` and item ids. Used by operations, markers, chat, provenance and translations | review S2 |
| Markers | `data-block-id`, `data-section`, `data-block-type`, `data-variant`, `data-slot`, `data-item` | review S2 |
| Operations | Commands compile to 15 invertible primitives; the transaction is the unit that is sent, checked, stored and undone | 01, D9; review B3 |
| History | Append-only versions with parent links; undo is a new transaction | 01, D12 |
| Versioning | A saved block records its block's major version; a major change ships a migration; published pages are frozen | 01, D14 |
| Releases | Each library release has an increasing id and a list of every part's version. Publishes and generation records store that id, and every release is archived | review S4 |
| Style | A typed set of style choices per family: named axes with listed values. Hero layout and grid alignment are layout, not style, because they change markup | review S3 |
| Blocks | Pure function plus manifest; interactivity only from a small set of named behaviors on native HTML | 02, D1 |
| Blocks | Fixed token vocabulary; container queries only; variants have stable names | 02, D3, D5, D6 |
| Blocks | Each variant declares character limits per field and a layout signature (the attributes the model is asked about) | review B2 and S7 |
| Images | Image value is `{asset, alt, focal}`; every variant that shows an image must look right with generated art, and every section type has a version with no image | 02, D12; review S5 |
| Pipeline | `generate()` is pure; models sit behind a decision interface and a text interface | 03, D1 and D2 |
| Pipeline | Fact fields never reach the text model | 03, D11 |
| Pipeline | Every generation is recorded | 03, D17 |
| Pipeline | The server-to-browser event format, carrying primitives and a transaction id | 03, D15; review B3 |
| Platform | Only `env.ts` touches Cloudflare; packages import nothing from Cloudflare or Node | 04, P1 |
| Platform | Publish to immutable static files that record the library release used | 04, P4 |
| Platform | The app and user content live on separate registrable domains | 04, P5; 06, D1 |
| Editor | The editor never touches the preview's page directly; a versioned message protocol | 05, D6 and D7 |
| Later | The spec never holds secrets, form submissions or visitors' personal data | 06, D2 |
| Later | Capabilities attach through one `capabilities` map; `/_x/*` is reserved on every published site | 06, D3 and D4 |
| Later | Every dynamic row belongs to one site; site builders and site visitors are separate identity systems | 06, D5 and D6 |
| Facts | One business schema with typed values. Each fact's status (suggested, confirmed, entered by owner) is stored in the spec | review S1 |

## What the review changed

| Problem found | Fix adopted |
|---|---|
| Three reports defined section types three ways, with clashing shapes for links, images, facts and limits | One global field list with report 01's shapes. Section types are subsets. Report 02's block manifest loses its own content fields and its `role`; fixtures are written once per section type, not per block |
| Text is written after the layout is picked, but whether text fits depends on the layout. On The Wall one text is shown in dozens of layouts | Character limits per variant, proved in tests. The Wall's shared content is a full site skeleton, not a map by section type, so two sections of the same type get different text |
| The edit log had three definitions, and one of them deleted the history that undo needs | The transaction is the single unit. History lives in one small database per project (a Durable Object), snapshots in R2, and only the project row in D1 |
| Business facts had four shapes, and the first version of this page contradicted two reports | One schema. Data we may not store (Google's) never reaches any storage. Data we may store but the owner has not confirmed can enter the spec, marked, and blocks publishing. Evidence and confidence live outside the spec |
| Spots in a site were named four different ways, and cross-breeding left notes pointing at blocks that no longer exist | One address format, and one function that re-keys notes whenever content moves |
| Style axes were untyped, and reports disagreed on what counts as style | Typed style choices; hero layout and grid are layout |
| "Library version" meant four things | Release ids with a manifest, archived |
| No report said where images come from. Unsplash requires its own image URLs to be used, which conflicts with resizing | Default imagery is generated art from Surfaces plus the owner's uploads. Stock photos come later, following each provider's rules |
| One Worker would hold everything, and a Worker that starts too slowly fails to deploy | Three Workers: the app, a render-and-publish Worker, and the sites Worker. Schemas are built on demand. A startup check runs in CI |
| The model would be asked to choose among about 75 options per section at the planned library size | Ask about attributes instead; the number of questions stays fixed as the library grows |
| This page overstated per-site quality checks | Corrected below |

## What is checked, and when

- **Before a block enters the library (in CI):** types, token rules, accessibility, overflow and clipping across test content and widths, and the character limits for every font pairing.
- **When a site is generated:** the spec is valid, the palette's contrast passes, and text is within each variant's character limits. No browser runs here.
- **When a site is published (optional, later):** one screenshot check in a hosted browser.

## Defaults chosen without asking

Each is cheap to change. Say so if one is wrong.

- **Images** are generated art from Surfaces and the owner's uploads.
- **Forms on the hosted copy** forward submissions by email or webhook at first. Storing them comes later, because it brings data-protection duties.
- **Dark mode** is one stored setting per site. Automatic light and dark for every site is deferred, because it doubles the contrast checks.
- **Browsers.** Native HTML for menus and accordions, with a small fallback script for older browsers.
- **Motion** on published pages is CSS only.
- **Export** is the spec, the blocks used, the renderer and a build script, for a coding agent to continue.
- **History** keeps every edit for 30 days, then named versions and publishes.
- **Languages.** One language at first. The key for translations is reserved.
- **Phones.** The Wall and chat editing work on phones; drag and drop is desktop first.
- **First paint** shows ready-made copy, which the generated text then replaces. No grey skeleton bars.
- **Chat panel** is built plain. assistant-ui would add 111 KB (measured).
- **Not used on published pages:** Base UI, shadcn components, or any React in the browser. They are for the builder's own interface.
- **No Rust or WebAssembly of our own.** Almost all of the wait is the model calls; our own code takes a few milliseconds. Add a compiled part only where measurements show our code is the slow step.
- **json-render is not used.** No converter is built until something needs one.

## Measured so far

| What | Result |
|---|---|
| Published 12-section page | 4.9 KB compressed, no JavaScript. The smallest React page that runs in the browser is 69 KB |
| The Wall, 48 live sites in one page | All painted in 120 ms, 9.7 MB of memory |
| Spec validation and one edit | Under 0.1 ms each for a three-page site |
| A site's stylesheet, built with Tailwind's compiler | 1.5 ms |
| Accessibility and overflow checks on one render | About 91 ms, in a real browser |
| TanStack Start on the local Cloudflare runtime | The build ran unchanged; about 317 requests a second |
| TanStack Start hello-world page | 111.6 KB of compressed JavaScript, which is why published sites do not use it |

All are single runs on one machine, with stand-in blocks. Phones, Firefox and Safari were not tested.

## Checked at the source on 2026-11-14

- Google's Places policies forbid storing business names, addresses or reviews; only the place id may be kept. **"Paste a Maps link" cannot copy data from Google.** Use Google to find the business, take facts from the business's own website and uploads, and have the owner confirm them.
- Cloudflare's decision model `clef-flash` is published under Apache-2.0 and is a fine-tune of Qwen3.5-9B. It allows 64 questions per request and 24,576 tokens of context.
- The Vercel AI SDK 7 contains an experimental decision call.
- Workers limits: 10 ms of CPU per request on the free plan, six outgoing requests waiting at once, one second to start. D1 and a SQLite Durable Object each hold up to 10 GB.
- Better Auth has an anonymous plugin that lets a visitor's work be claimed after sign-in.
- Cloudflare for SaaS includes 100 custom hostnames, then $0.10 each per month.
- Versions on npm: TanStack Start 1.169.5, Tailwind 4.3.5, Vite 8.3.8, React 19.3.1, Zod 4.6.7, TypeScript 7.0.2, Drizzle 0.45.4, Better Auth 1.7.23, AI SDK 7.0.172. Vitest is at 5.1.0, but report 04 pins 4.1.x because the Workers test pool does not support 5 yet.

Not confirmed: the full Google Maps Platform terms page would not load, so the storage rule rests on the Places policies page.

## Biggest risks

1. **Nobody has measured whether a decision model has taste.** If it does not clearly beat sensible defaults written in code, the product still works, but the effort should go into the library and the defaults, not the decision machinery. The first milestone tests exactly this.
2. **The section-type list.** It is the shared contract between text, blocks, The Wall and cross-breeding. The danger is not that one schema per section type limits variety; it is that a type such as `hero` collects 20 or 30 optional fields and stops meaning anything.
3. **The cost of writing hundreds of blocks to a strict contract.** Coding agents will push against the rules.
4. **Abuse of the free public copy:** people running up model costs, and phishing pages on free hosting.

## Repository

```
apps/web        TanStack Start app: the builder
apps/render     Worker that renders and publishes (later)
apps/sites      small Worker that serves published sites (later)
packages/spec      types, schemas, operations, migrations, the field list and section types
packages/blocks    manifests, components, styles, themes
packages/render    spec to page
packages/pipeline  generate(), decision and text interfaces, question compiler
tools/eval      test briefs, three-way comparison, rating page, timing and cost table
```

Internal packages are named `@repo/*` and ship TypeScript source with no build step. `pipeline` imports block manifests, never block components. Only the apps touch Cloudflare bindings.

## Build order

### M0: taste-and-contract test (confirmed by Robert on 2026-11-14; replaces the speed spike)

The speed spike measured the safest numbers. This tests the three riskiest assumptions instead: that the model has taste, that the section-type list fits real sites, and that blocks can be written at a reasonable cost.

1. **On paper first.** Take 40 real small-business sites in 5 kinds of business. Cut each into sections and map them to a draft section-type list. Count how many map cleanly and which fields do not fit.
2. **Library.** 8 section types, about 20 blocks (2 or 3 per section type), 2 or 3 variants each, 3 style families, images from Surfaces. Blocks written by coding agents; log the time and the failures per block.
3. **Pipeline.** One decision model (`clef-flash` needs no extra key on Cloudflare), one text model, questions about attributes, character-limit checks, records saved to files.
4. **Three versions of 30 briefs:** (A) the decision model chooses, (B) defaults written in code with no model, (C) random valid choices.
5. **Blind rating.** Robert compares A against B and A against C without knowing which is which.
6. **Shared text.** Put each brief's text into every variant it is allowed in, and count overflows in a real browser.
7. **Speed.** Deploy to a Cloudflare test address and measure the median and the slowest runs from Robert's location.
8. **Startup.** Check Worker startup time with 500 generated stand-in blocks.

Done when there is a table with: how often the model wins a blind pair, the share of real sections that map cleanly, time and failure rate per block, the overflow rate of shared text, time and cost per site, and startup time at 500 blocks.

### After M0

- **M1, The Wall.** The Wall and cross-breeding. Accounts, bot checks and the spending cap are needed only if M1 is public.
- **M1.5, publishing.** The render and sites Workers, the second domain, and the files a published site needs (sitemap, robots file, 404 page, icons, link preview image, redirects).
- **M2, a business from one link.** The business schema, reading the business's own website, owner confirmation.

### Do not build yet

Self-hosting. Text measurement on the server. Machinery against option-order bias (run it once as an experiment in M0). More than one model adapter plus a mock. Replay tools. Branches and merging. Translations. Editing, undo and history in M0. Generating while the user types. The router between quick and slow edits. Taste learning. Capabilities, per-site databases and automations (keep the five reserved keys). Screenshot baselines. Custom code, the block foundry, multiplayer, embeddings, a command-line tool, drag and drop.

## Still open for Robert

1. (Answered: the first milestone is the taste-and-contract test.)
2. (Answered 2026-11-14: the model must win at least 20 of 30 blind pairs against the code defaults, and also beat random choices.)
3. Is M1 public, or a demo you show yourself? A demo needs no accounts, bot checks or domains yet.
4. May two neutral domains be bought before the real name is chosen (one for published sites, one for the preview)? Publishing and the separate-domain preview wait on them.
5. If a block turns out to have a security problem, may published sites using it be re-rendered without the owner republishing? Your rule says sites stay frozen.
6. Which scripts must look right at launch: Latin only, or also Cyrillic, Armenian, Arabic, Chinese or Japanese? This sets the size of the font catalog.
7. Do published sites get visitor numbers built in, or only through a service the owner connects?
8. When the repository goes public, and the licence.
9. Whether the hosted copy may keep prompts and choice data to improve quality, and for how long.
