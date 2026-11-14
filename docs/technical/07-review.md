# 07: Independent review of the architecture

Date: 14 November 2026. Reviewer: an agent that did not write any of reports 01 to 06. Under review: `README.md` in this folder, checked against reports 01 to 06, `CLAUDE.md` and `docs/research/README.md`.

**Scope note.** The founder removed self-hosting from the first version while this review was being written. Self-hosting machinery (the Docker image, the LLM-emulated decision adapter, self-host replacements for Cloudflare services) is treated as already cut and gets no findings here. Where that change affects a finding, the finding says so.

**Labels.** **[read]**: I checked it by reading the named file and section. **[fetched]**: I checked it at a primary source on 14 Nov 2026. **[inferred]**: my reasoning or arithmetic, not checked by an experiment. Nothing in this review was built or run apart from two page fetches.

---

## 1. Verdict in five lines

1. The big bets are sound: our own spec format, id-addressed operations, pure static blocks, zero-JavaScript published pages, render once at publish, pure `generate()` with two model ports.
2. But three one-way doors are defined three different ways in three reports, and the README picked a winner without redesigning the losers: the section-type content contract, how text meets layout (fit), and the edit log with its storage.
3. As written, The Wall cannot both show skeletons first and guarantee that one shared text fits every tile, and the history store deletes the very records that undo and the "30 days of edits" default depend on.
4. The design builds too much before it knows whether a decision model has taste: rotations, four adapters, replay modes, server-side HarfBuzz, a version graph with branches, and a cross-site frame are all in or near M0.
5. Replace the speed spike with a taste-and-contract spike: compare the model against code defaults in blind tests, test the section-type list against real sites, and time how long one block takes to author.

---

## 2. Findings, ranked

Each finding: what is wrong, the evidence, the fix.

### Blockers

#### B1. The section-type contract does not exist yet, and three reports define it three incompatible ways

**What is wrong.** The README makes the section type the owner of content (README line 23 and the resolution at line 69), and calls the section-type list the second-biggest risk (line 125). But nobody owns the list, and the reports disagree on what a section type even is:

| | Report 01 | Report 02 | Report 03 |
|---|---|---|---|
| Unit that owns content | Section type, ~25–40 (D3) | Block type (D2) | Section type (D5, one-way door 6) |
| Example names | `header`, `hero`, `features`, `collection-list`, `story`, `cta`, `faq`, `contact`, `hours-location`, `testimonials` (§3.1) | 12 `role`s: `nav`, `hero`, `features`, `proof`, `pricing`, `faq`, `cta`, `contact`, `gallery`, `team`, `footer`, `content` (§3.1 `BlockManifest.role`) | `nav`, `hero`, `menu-highlights`, `order-form`, `about`, `hours-location`, `pricing-table`, `logo-cloud` (§2.5, §3.3) |
| Granularity | Generic (`collection-list` covers menu, services, team) | One block per role with its variants (`blocks/hero/` holds centered, split, overlay) | Vertical-specific (`menu-highlights`) |
| Link value | `{label, to: LinkTarget}` with page ids (§3.1 `Cta`) | `{label, href}` string (§3.1 `LinkValue`) | — |
| Image value | `{asset, alt?}`; focal point on the asset (§3.1 `ImageRef`, `Asset.focal`) | `{asset, alt, focal?}`, alt required (D12, `ImageValue`) | — |
| Hard facts | Not content fields; rendered from `content.business` (D3, last paragraph) | A `fact` slot kind holding `{ $business: '/hours' }` (D2 table) | `factKind` per slot; fact slots filled by code (D11) |
| Rich text | Used in v1 (`story.body`, `faq.items[].a`) as paragraph/span arrays (D18) | Reserved, not built in v1; different shape `{t:'doc', c: Inline[]}` (D2) | Text writer emits strings (`slot` event `text: string`) |
| Limits | Hero headline max 70 (§3.1) | Hero headline max 80 (§3.2) | Per slot, from the manifest (D10) |

The README's sentence "Report 02's slot kinds are used to define the section types" (line 69) cannot be carried out as written, because report 01 already wrote the section types in Zod with different value shapes, and 01 itself says area 2's report "did not exist when I finished" (01 §8, last bullet) **[read]**.

**What in report 02 breaks under "content belongs to the section type"** **[read; consequences inferred]**:
1. `defineBlock({ content: {...slots} })` (02 §3.1–3.2): content leaves the block manifest. The manifest keeps `sectionType`, `uses`, `requires`, per-variant geometry and fit.
2. `contentSchema()` and `BlockProps<typeof manifest>` typing must derive from the section type narrowed by `uses`, not from the block.
3. Per-slot limits move to the section type. 02's list of *block* breaking changes (rename a slot, change its kind, tighten a limit, make optional required; 02 D15) becomes a list of *section-type* breaking changes, which are `specVersion` migrations across all sites (01 D14 table, last row).
4. Block migrations change signature: 02 has `({content, variant})`; 01 has `({props, variant})` and says "content never migrates with a block". 01 must win.
5. `fixtures.ts` per block becomes fixtures per section type. This is good news: six fixtures are written once per section type, not once per block, which cuts authoring cost (02 risk 1).
6. The `role` field (12 values) duplicates the section type and should go.
7. The relevance question and `ai.whenToUse` text belong to the section type, not the block (03 §5 asks for relevance "per block manifest"; with 12 hero blocks that is 12 copies of one question).
8. 02's instance shape `{id, type, v, variant, surface, content}` (02 §5, area 1 item 1) is replaced by 01's split partitions with `surface` inside `props`.

**Does one schema per section type make a vast library impossible?** No, but it makes it awkward in a specific way **[inferred]**. Visual variety comes mostly from style axes and layout variants, which a shared schema does not limit. What a shared schema limits is *structural* variety: a hero with three stat counters, a hero with a logo strip, a hero with an embedded form. Under 01's rule each needs a new optional field on `hero` ("if a design needs a badge, `badge?` is added", 01 D3). After 300 hero blocks, `hero` has 20 to 30 optional fields, the text writer does not know which to fill, and "hero" stops meaning anything. The real failure mode is schema bloat and semantic drift, not impossibility.

**Fix (a third option).** A **global field vocabulary** with section types as named subsets:
- Define fields once, globally, with one value shape each: `headline`, `subhead`, `eyebrow`, `body` (rich text), `primaryCta`, `secondaryCta`, `media`, `items[]` (keyed), `stats[]`, `logos[]`, `source` (collection reference). Use 01's value shapes (id-based links, item ids) everywhere; 02's `href` link must go.
- A section type is a named set: required fields, optional fields, list bounds, character limits, a relevance question, and fact bindings. Most section types are 3 to 6 fields drawn from the vocabulary.
- A block declares its section type and `uses`. It may tighten a field's character cap for a variant (see B2) but never add a field.
- Content stays per block instance, keyed by global field names. Changing section type (testimonials to quotes, hero to cta) keeps every field the two share, with no hand-written `transforms` for the shared part. Cross-breeding matches by section type first, then by field overlap.
- Give the list one owner: a `packages/sections` folder (or `spec/sections`), one file per section type, reviewed by the founder. Start by mapping 30 to 50 real small-business sites in 5 verticals into it (see M0).

#### B2. Text arrives after layout is chosen, but whether text fits depends on the layout, and The Wall shares one text across 48 layouts

**What is wrong** **[read]**:
- Variants decide fit from measured line counts of the actual text (02 D14, `fit(m)` using `m.lines(slot, probe)`). Report 02's own test shows the `maximal` fixture fits **no** hero variant and `long-word` fits none at 328 px (02 §3.2 fit table).
- The decision model picks variants before any text exists (03 §3.4: decisions at ~150–250 ms, wave 2 text from ~260 ms). 02 says fit runs "before or after the model's choice" (02 §5, area 3 item 1); before is impossible for wave-2 sections, and after means the layout changes after first paint, which 05 D16 tries hard to avoid.
- The Wall sends N skeletons at ~0.35–0.5 s and then fills them all with **one** text set written per section type (03 D14 steps 2–4). The sampler cannot know which variants the text will fit. A headline of 70 characters is legal for `hero` and breaks `overlay` (≤ 2 lines at lg). So some tiles will overflow or must be swapped after they appear.
- "Text per section type" also breaks when one site has two blocks of the same section type. Report 01's own bakery example has two `collection-list` blocks (01 §3.2). The Wall's shared map `wallText: Record<sectionType, Record<slot, string>>` (05 §3.1, §3.2 `wallText` message) would give both the same text, and it cannot hold list items with ids, links, or rich text.
- Fit needs the theme's fonts. Calibration was done for one sample theme (02 D14). At ~50 type pairings (research 05 §9.1), calibrating every variant × pairing × fixture × probe against Chrome is millions of renders **[inferred]**, so most fit predictions in production would be uncalibrated.

**Fix.**
1. **Make fit a character-count question at request time.** Each variant may declare a tighter character cap per field than the section type allows (for example, overlay hero headline ≤ 40). CI proves, for every type pairing's text styles, that worst-case text at that cap fits at all three probes. Calibrate per text style and pairing (50 × 8 styles × 3 probes), not per block. At request time, eligibility is `length ≤ cap`, which needs no fonts and no HarfBuzz.
2. **Write text to a known budget.** Wave 1 writes the kernel to the section type's limits. Variant eligibility is then a cheap check once text lands, and the decision model's variant answer becomes a ranking over the eligible variants rather than a hard pick.
3. **For The Wall, write text first for the hero and other high-variance sections, or write to a "Wall budget"** (the 40th-percentile cap of that section type's variants), and let the sampler draw only variants whose caps the budget meets. Text for low-variance sections can still stream later.
4. **The Wall's content source is a full spec skeleton**, not a map by section type: one block per (page kind, section type, occurrence), with item ids. `crossBreed` already takes a content spec (01 D20); use it, and drop `wallText`.
5. With this, server-side HarfBuzz, the vendored harfbuzzjs patches (02 risk 3), and measurement TTFs leave the request path. Keep Pretext in the editor (real canvas) as an advisory warning, and keep the Playwright overflow gate in CI.

#### B3. The edit log has three incompatible definitions, and the chosen storage deletes what history needs

**What is wrong** **[read]**:

| | Report 01 | Report 04 | Report 05 |
|---|---|---|---|
| Unit sent and stored | `Transaction {id, base: VersionId, ops[], inverse[], author, turn, intent}`; one `Version` per transaction with `parents[]`, `seq`, `specHash` (§3.3) | Ops batched with `baseVersion`, head `(version, snapshotKey)` (P3) | `OpEnvelope {id, txn, actor, baseSeq, op, seq?}`, **one op per envelope** (D3) |
| Validation | Whole-document invariants at commit of a transaction (D16) | Not stated | Server "validates each op" (D5) |
| Conflict | Stale base → reject, client reloads (D12) | `409`, reload (P3) | Rebase pending ops on server ops (D3) |
| Retention | Append-only, never mutate; snapshots every 50–100 versions; "every edit for 30 days" offered (D12, Q3) | **Ops older than the snapshot are deleted** every 50 ops (P3) | Snapshot every ~100 ops (D5) |

- Report 04's pruning deletes the stored inverses that undo by turn uses (01 D12), the per-version history the history panel shows, and contradicts the README's own default "History keeps every edit for 30 days" (README line 87).
- Per-op validation (05) conflicts with transaction invariants (01): a `removePage` command compiles to `block.remove`… then `page.remove` (01 §3.3), and intermediate states are invalid on purpose.
- **Who writes generated changes is undefined.** 05 §2.3 step 3 treats area 3's stream as "server ops from elsewhere" (so the server commits them), but 05 §3.3's diagram turns stream events into client `OpEnvelope`s posted back to the server.
- **The stream carries commands, not primitives.** 03's `spec` event is `ops: SpecOp[]` and its example is commands with ids the pipeline made up (`{"op":"addBlock","id":"b1","type":"nav"}`, 03 §3.3 step 4), while 01 says the pipeline must "never mint ids" (01 §5, area 3 item 1) and the client applies primitives (05 D1). If the client compiles commands, it needs the same library version and the same id seed as the server, or later ops from the server reference ids the client never made.
- D1 cannot hold 30 days of transactions at scale **[inferred]**: at 300,000 saved projects a month, ~200 transactions each and ~2 KB per transaction with inverses (a `block.remove` inverse carries the block's whole content; 01 §5 already warns ops can exceed 1 KB), that is ~120 GB a month against D1's 10 GB hard cap (04 §2.2 [read]).

**Fix.**
- One envelope: 01's `Transaction` is the unit sent, validated, stored and undone. Drop 05's per-op `seq`; the server assigns `seq` per transaction. Keep 05's rebase as a later option; M1 rejects stale bases (01, 04 agree).
- The server is the only writer of generated changes. `generate()` compiles commands to primitives on the server, mints ids from the generation seed, and the stream's `spec` event carries primitives plus the transaction id. The client applies them optimistically and never posts them back. Slot text arrives as `set` primitives grouped into the turn's transaction.
- Storage: **one SQLite Durable Object per project** holds the version graph and transactions (append-only, 10 GB each [read 06 §2.3]); R2 holds snapshots; D1 holds only the project row and head pointer. Retention (30 days, then named versions and publishes) is a deletion job on the DO, not pruning on every snapshot. *Self-hosting change:* report 04 kept the log in D1 partly for portability; with hosted-only, a DO per project has no portability cost.

### Serious

#### S1. Business facts have four shapes, and the README's resolution contradicts two reports

**What is wrong** **[read]**:
- Shapes: 01 `content.business` (days as `"mo"`, money `{amount, currency}` inside untyped collection `data`) plus `content.collections` for menu items (01 §3.1); 06 `BusinessProfile` with nested `menu.sections[].items[]`, ISO weekdays `1–7`, `Price` union with `from`/`range`/`on_request`, and `Sourced<T>` on every field (06 §3.3); 03 `FactsLedger = Record<string, {value: string, …}>` with flat strings such as `"Tue–Sun 7:00–15:00"` (03 §3.2, §3.3); 02 `fact` slots bound with `{ $business: '/hours' }` (02 D2).
- The README says "unconfirmed or non-storable data must never enter" the spec, with evidence "in a separate ledger keyed by the same ids" (line 75). But 01 puts `status: "suggested"` in the spec's provenance map and makes it a publish blocker (01 D16, D19), and 06 wants suggested facts visible in the preview (06 §2.5 principle 2). The preview renders only from the spec (05 D1), so under the README's rule suggested facts cannot appear in the preview at all. "The same ids" do not exist: 01's business fields are paths, 06's services use slugs like `"skin-fade"`, 01's items use `i_` ids.

**Fix.** One business schema, owned by area 6's design but stored as 01 stores it: typed values (06's `Price`, ISO weekday, minor units) without `Sourced` wrappers, menu and services as collections with `i_` ids. Status (`suggested`, `confirmed`, `owner_entered`) lives in the spec's provenance map, as 01 designed, and blocks publishing. Evidence quotes and confidence live in a ledger outside the spec, keyed by keyed path. The hard rule becomes: *data we may not store (Google content) never reaches any storage*; data we may store but the owner has not confirmed may enter the spec, marked and publish-blocked. Correct README line 75.

#### S2. Addresses, provenance and translations are keyed by paths that break when content moves

**What is wrong** **[read]**:
- Four slot-address formats: 01 text keys `blocks/b_x/items/i_y/title` (D10); 05 `Addr {siteId, blockId, slot: "items.k3f.title"}` with dots (§3.1) and markers `data-slot="cta.label"` (§2.9); 03 `slot` events `{blockId, slot}` with flat names, including fact slots `"hours"` that are not content in 01 (§3.3 step 4); 06 form labels `{ "$content": "/forms/booking/name" }` (§3.2). Block markers also clash: 01 wants `data-block="<blockId>"` (§5, area 2 item 5), 02 renders `data-block-id={id}` and `data-block={role}` (§3.3 `Section`), 05 wants `data-block-id`, `data-block-type`, `data-variant` (§2.9).
- 01's `TextKey` regex allows only `blocks|pages|business|collections|assets|seo` (01 §3.1), so form labels inside `capabilities` cannot be translated or carry provenance, although 01 §5 (area 6 item 2) says "Form labels are content and get text keys".
- `crossBreed` copies the content source's `provenance` and `translations` unchanged, but moves block content under the layout's block ids (`content: { ...C.content, pages: {}, blocks: {} }`, 01 §3.4). Every Wall pick therefore keeps provenance and translations pointing at block ids that no longer exist, so regeneration no longer knows which text the user wrote. The same applies to `duplicateBlock` and `changeSectionType`. I read the code; I did not run it.

**Fix.** One address grammar in `@repo/spec`: 01's keyed path with `/` and item ids, used by ops, `data-slot`, chat pointers, provenance, translations and comments. Renderer-owned markers fixed as `data-block-id`, `data-section`, `data-block-type`, `data-variant`, `data-slot`, `data-item`. Allow `capabilities/` as a text-key root (or move form labels into `content`). Add one `rekeyContent(spec, idMap)` used by `crossBreed`, duplicate and section-type change, and an invariant that every key in `provenance` and `translations` resolves.

#### S3. The style parameter space is untyped and nobody owns it

**What is wrong** **[read]**: 01 stores `style.axes` as `z.record(z.string(), z.string())` (01 §3.1), so any axis name or value is valid and a renamed axis persists in every saved site. The axis list differs: 01's example has `typePairing, imagery, grid, density, radius, buttons, motion`; 03's `setTheme` uses `palette, type, density, corners, imagery` (03 §3.3 step 4); research 05 has 6 salient and 11 secondary axes including *hero archetype* and *grid alignment* (research 05 §9.1). 02 says hero archetype and grid alignment are layout, chosen by variant (02 D5), while 01 stores `grid` as a style axis. So "take B's style" on The Wall moves the grid in 01's definition and not in 02's. How a family constrains the axes ("allowed sub-range and prior weights", research 05 §9.1) is not designed anywhere.

**Fix.** A typed `StyleChoice` per family major: enumerated axes and values, the family's allowed sub-ranges, validated at commit. Decide once that hero archetype and grid alignment are layout (02's position), because they change markup. Owner: the themes package in area 2. Write it before the first theme, since every saved site stores it.

#### S4. "Library version" means four different things, and one report breaks the founder's frozen-sites rule

**What is wrong** **[read]**:
- 01 records `meta.createdWith.library: "2026.11.14"` (a date); 02 and 03 use a content hash of the whole snapshot (02 D17, 03 §5); 06 hashes and signs each block entry and has specs reference `core/hero-split@2` (06 D13, §3.5); 01 and 02 store `type` plus major `v` per instance.
- 01 keeps "one implementation per major that stored sites still use" (01 D14); 02 keeps "only the latest code of each block" (02 D15). Compatible only if on-read migration always runs; say so.
- Section types, families, archetypes, question templates and policies also version (01 D15, 03 D5, D7), and a release every day changes the whole-library hash every day. Replay modes `redecide` and `rewrite` (03 D17) need the old snapshot, which nobody archives.
- 06's foundry lifecycle says a revoked block's "affected sites republish automatically" (06 §2.7). `CLAUDE.md` fixes that published sites "stay frozen when a block improves, until the owner republishes". A security revocation is a legitimate exception, but it is not stated anywhere.

**Fix.** A library release has a monotonic id and a manifest listing each part's version (section types, blocks by semver, families, archetypes, question templates, policy) plus the content hash. Archive every release manifest and snapshot in R2. Deploys and generation records store the release id. Ask the founder whether a security revocation may re-render frozen sites (question 4 below).

#### S5. Nobody decided where images come from, and the most likely source forbids how the design uses it

**What is wrong.** Blocks have image slots and several variants require an image (`split`, `overlay`; 02 §3.2). No report says what fills them for a generated site in one second. 01's asset schema has a `stock` source with an Unsplash licence (01 §3.2), and 02 resizes every image through `/cdn-cgi/image` from the asset's source (02 D12). Unsplash's API guideline says "All API uses must use the hotlinked image URLs returned by the API" **[fetched, help.unsplash.com, Guideline: Hotlinking Images, 27 Jul 2026]**, so copying or resizing through our pipeline is not allowed, and 06 says "never hotlink" (06 §2.6). Without a decided source, every image-requiring variant is ineligible for most briefs, which narrows exactly the variety The Wall promises **[inferred]**. Images are also the largest factor in whether a generated site looks good.

**Fix.** Decide in M0: default imagery is Surfaces procedural art (allowed by `CLAUDE.md`, instant, no licence) plus the user's uploads; stock photos later through a driver that follows each provider's rules (hotlinked URLs plus attribution for Unsplash). Add a block-contract rule: every variant that shows media must look right with procedural art, and a no-media fallback must exist per section type.

#### S6. One Worker would carry everything, and the startup limit fails the deploy, not the request

**What is wrong.** Publishing runs in the app Worker (04 P4 step 1), which also holds TanStack Start, Better Auth, the pipeline and, under 02, every block component, the Tailwind compiler, Pretext, HarfBuzz WASM and measurement fonts. 02 measured 2.96 MB for the renderer, compiler, measurer and two TTFs, but not startup (02 §8). Cloudflare: a Worker "must parse and execute its global scope … within 1 second", the platform "rejects a deployment" that exceeds it, and "generating or consuming a large schema at the top level is a common cause" **[fetched, Workers limits page]**. 40 section-type schemas and 500 manifest schemas built eagerly are exactly that. A font catalog of ~50 pairings with Arabic or CJK fallbacks would not fit 64 MiB uncompressed **[inferred]**.

**Fix.** Separate Workers by job: the app Worker (editor, API, `generate`, manifests only, as 04 already requires for `pipeline`); a render-and-publish Worker (components, Tailwind compiler) reached by service binding or a Queue; the `sites` Worker. Build Zod schemas lazily. B2's fix removes measurement fonts from the request path. Add `wrangler check startup` to CI with a synthetic 500-block bundle from M0.

#### S7. The question compiler is sized for 15 blocks, not for the library the founder wants

**What is wrong.** Stage 0 narrowing is "good to ~300 blocks and ~12 variants per section type" (03 D8) **[read]**. The target library of 500 blocks and ~3,000 variants over 40 section types averages ~75 block-variant options per section type **[inferred]**. A variant choice with 75 options at ~50 tokens each (label plus a ≤ 40-word fit description, 03 D5) is ~4,000 tokens; speculative fan-out over ~30 candidate sections is ~120,000 tokens **[inferred]**. clef-flash takes 64 questions and 24,576 tokens per request (README line 113), so that is 6 or more parallel chunks. Decision calls do not stream, so each holds one of the six "waiting for headers" slots until it answers **[fetched, Workers limits page]**; with wave 1 also starting at t = 0 (03 §3.4), the seventh call queues behind a full round trip. Cost (~$0.005) still fits "under a cent", but it doubles 03's estimate.

**Fix.** Do not ask the model to enumerate variants. Ask it about **attributes** that every variant already declares as its layout signature (02 D3, 03 D14): media presence and kind, alignment, density, emphasis, item presentation. That is 5 to 8 small questions per section type, fixed as the library grows. Code then picks the variant that best matches the answer distributions among those eligible by B2's character caps. New blocks, including foundry blocks, become choosable the moment their signature is valid. The Wall samples in the same attribute space.

#### S8. The README overstates what quality checks run on each generated site

**What is wrong.** `CLAUDE.md` and the README say code "checks every rendered result for overflow, clipped text, contrast and tap-target size". The measured check is 91 ms per render in Playwright with Chrome (02 D16), which runs in CI per block, not per generated site within one second; 04 P11 says the main gate runs in CI and per-publish browser checks are optional **[read]**. At request time only spec validation, contrast maths and fit predicates run.

**Fix.** Say plainly: CI guarantees each block × variant × text style; request time checks spec validity, contrast of the chosen palette, and B2's character caps; publish time may add one Browser Run screenshot check. *Self-hosting change:* with hosted-only, Browser Run Quick Actions at publish no longer need a fallback, so a per-publish overflow check is now a cheap option.

### Minor

- **M1. Publish-time artifacts have no owner.** `sitemap.xml`, `robots.txt`, canonical links, the 404 page, favicon and home-screen icon, Open Graph image, and serving `settings.redirects` in the `sites` Worker are not in 02's publish sketch (02 §3.6) or 04's `sites` Worker (04 P4). Fix: add them to `renderStatic` and the `sites` Worker before M1.5. JSON-LD is covered by 06 §3.4.
- **M2. Visitor analytics for published sites has no owner.** 01 assumes events carry `{blockId, sectionType, …}` (01 D5), which needs JavaScript on zero-JS pages. 06 offers typed third-party integrations only (06 D15). *Self-hosting change:* Cloudflare-only options (Web Analytics, Workers Analytics Engine logging in the `sites` Worker) are now acceptable and need no page script for page views. Decide before publishing ships.
- **M3. Non-Latin scripts.** Type pairings must declare script coverage and the compiler must filter pairings by the brief's language (02 D11 notes coverage; 03 does not filter). Arabic and CJK were measured with Latin fonts (02 D14). Fix: coverage tags on every pairing, a compiler rule, and fixtures per script in each section type.
- **M4. Page-level accessibility.** Block-level axe checks exist (02 D16). Page-level rules do not: one `h1` per page across blocks (02 relies on `ctx.headingLevel`), skip link, `lang` and `dir` per page, and who writes alt text for generated or stock images (01 makes missing alt a publish blocker but no report fills it). Fix: renderer rules plus an `alt` job in the text writer.
- **M5. Dark mode default conflicts.** README says every theme defines light and dark (line 83); 01 stores one `mode`; 02 Q3 warns it doubles contrast gates and screenshots. Fix: store `mode` as 01 does, and defer automatic dark.
- **M6. CI time at scale is fine.** 02 measured 5.4 s for one block's 60 renders. At 500 blocks with ~6 variants that is ~70 CPU-minutes, ~9 minutes on 8 workers per nightly full run **[inferred]**. Run changed blocks per PR and the full matrix nightly, as 02 says. Screenshot baselines belong in CI artifacts, not git (02 risk 7).

### The ten resolutions, one by one

| # | Resolution | Verdict |
|---|---|---|
| 1 | Own spec format | Right |
| 2 | Id-based operations | Right, but the envelope and storage left unreconciled (B3) |
| 3 | Content belongs to the section type | Right direction; consequences unhandled and the value shapes unresolved (B1, B2) |
| 4 | One stylesheet per site at publish | Right; needs its own Worker (S6) |
| 5 | Preview on a separate domain | Right; blocked on a domain purchase that waits on naming (question 2) |
| 6 | `transform` for Wall tiles | Right, measured |
| 7 | No Node version | Moot now that self-hosting is cut |
| 8 | Two domains first | Right |
| 9 | Business facts split | Wrong as worded (S1) |
| 10 | Per-site database later | Right; with hosted-only, a Durable Object per site needs no portability caveat |

---

## 3. What is sound

- Own spec format with `specVersion`, flat id maps, random prefixed ids made by code, references by id (01 D1, D4–D6).
- Id-addressed primitives with computed inverses, and no CRDT (01 D9, 05 D5).
- Blocks as pure functions with a closed set of native-HTML behaviors, zero JavaScript on published pages (02 D1, D7; measured 4.9 KB for 12 sections).
- Token-only styling with Tailwind's default theme wiped plus lint (02 D5, D9); container queries only (02 D6, 05 D8).
- Render once at publish to immutable files, served by a small Worker with a KV pointer (04 P4).
- Pure `generate()` with a decision port and a text port, our own decision IR with nullable distributions (03 D1, D2).
- Facts never pass through the text model; the number-and-quote guard (03 D11).
- Editor never touches the preview's DOM; a versioned message protocol (05 D6, D7).
- Separate registrable domains, the Public Suffix List, reserved `/_x/*`, no secrets or visitor data in the spec (04 P5, 06 D1, D2, D4).
- The Wall as one document of live React trees (05 D12, measured).
- CSS at scale: per-site compile from candidate lists (02 D8) holds up at 500 blocks.

---

## 4. What to cut or postpone

None of these closes a door; each keeps its field or interface reserved.

| Cut from M0 and M1 | Why it can wait | Report |
|---|---|---|
| Server-side text measurement: HarfBuzz WASM patches, measurement TTFs, Pretext in the Worker | B2's character caps replace it at request time; CI calibration stays | 02 D14 |
| Order-bias machinery as infrastructure: 3× rotations, `oNN_` wire keys, seeded permutations, a policy table per model version | Run them once as an M0 experiment; build only what the experiment shows matters | 03 D6, D7 |
| Adapters beyond one real provider and `mock` | One key is enough to learn; the port keeps the door open | 03 D3 |
| Replay modes `redecide` and `rewrite`, CI spec-hash replay | Write records to files in M0; replay tools when there is a second model to compare | 03 D17 |
| Version graph features: `parents[]` merges, branches, `diffToOps`, `toJsonPatch`, the json-render adapter | Keep the fields; build none. Cut `toJsonPatch` and the json-render adapter outright: no consumer exists | 01 D9, D12, D21 |
| Locale overlay, translations, source hashes | Reserve the key; one language in M0 and M1 | 01 D17 |
| Ops and history in M0 at all | M0 generates whole specs; no editing, so no undo | 01 §4 |
| Speculative generation while typing | It hides the latency M0 must measure, and costs money per keystroke pause | 03 D16, 05 D16 |
| Edit router, fast and slow paths | No chat editing until after The Wall | 03 D12, D13 |
| Taste model, swipe learning, `WallEvent` collection | M1's second half, after the Wall works | 05 D14 |
| Capability contract, `SiteData`, automations grammar, `$cel`, condition-grammar extensions | Keep the five reserved top-level keys; build nothing | 06 D3, D5, D7 |
| Screenshot baselines per block | Overflow and axe gates catch real defects; baselines add review load | 02 D16 |
| Auth, Turnstile, spend governor, PSL submission in M1 | Only if M1 is a founder-only demo (question 1) | 04 P7, 03 D20 |

---

## 5. The M0 I would run: a taste-and-contract spike

The README's M0 measures speed and cost, which are the least risky numbers: they are a few model calls whose rough cost is already known. It does not test whether the decision model has taste, because with 15 blocks for one page type the outputs will look alike whatever the model answers, and there is no baseline to compare against. It also does not test the section-type list or how long a block takes to write.

**Steps.**
1. **Taxonomy test (desk work, before code).** Take 40 real small-business sites across 5 verticals. Cut each into sections and map every section to a draft list of section types built from the global field vocabulary (B1). Measure: share of sections that map cleanly, and fields that do not fit.
2. **Library.** 8 section types, about 20 blocks (2 or 3 per section type, so block swaps exist), 2 or 3 variants each, 3 style families with typed axes (S3), Surfaces art as the image source (S5). Blocks written by coding agents to the contract. Log per block: agent time, gate failures, human fix time.
3. **Pipeline.** One decision provider (clef-flash through the Workers AI binding needs no extra key), one text model, the attribute-based compiler (S7), character-cap eligibility (B2), records written to files.
4. **Three arms on 30 briefs across the 5 verticals:** (A) the decision model; (B) code defaults per archetype with no model; (C) random valid choices. Render screenshots of each.
5. **Blind ratings.** The founder rates A against B and A against C on the existing rating page design (03 D19), without knowing which is which.
6. **"Text once" test.** Render each brief's text into every eligible variant and count overflow in Playwright.
7. **Speed.** Deploy to a `workers.dev` URL and measure p50 and p95 from the founder's own location, not from a laptop's local runtime.
8. **Startup.** `wrangler check startup` on a synthetic bundle of 500 generated block components and their schemas.

**Done when there is a table showing:**
- Model versus defaults: share of blind pairs the model wins. The founder sets the bar before seeing results (question 6).
- Taxonomy coverage: share of real sections that map cleanly to the draft section types.
- Block authoring: median time per block and gate-failure rate.
- Overflow rate of shared text across variants.
- Time to first spec and to text done, p50 and p95, measured from the founder's location, plus cost per site.
- Worker startup time at 500 blocks.

If the model does not clearly beat code defaults, the product still works (B is a valid site), but the design should then put its effort into the library and defaults rather than the decision machinery. That is the most important thing M0 can learn.

---

## 6. Questions only the founder can answer

1. **Is M1 public, or a demo you show yourself?** If it is a demo, accounts, bot checks, the spending cap and the domain purchase move to M1.5.
2. **May we buy neutral domains now** (one for published sites, one for the preview frame), independent of the final name? The cross-site preview and publishing both wait on them.
3. **What fills images on a generated site:** procedural art from Surfaces, stock photos (shown from the provider's own servers with credit), or AI-generated photos (cost and delay)?
4. **Can a security problem in a block re-render published sites** without the owner republishing? Your rule says sites stay frozen until republished; a revoked block needs an exception or a manual path.
5. **Which scripts must look right at launch:** Latin only, or also Cyrillic, Armenian, Arabic (right to left), or Chinese and Japanese? This sets the font catalog and its size.
6. **What result in M0 would convince you the decision model earns its place?** For example: you prefer its site over the plain defaults in at least two of three blind pairs.
7. **Do published sites get visitor numbers built in,** or only through a service the owner connects (Plausible, Google Analytics)?
