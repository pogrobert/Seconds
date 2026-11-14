# 01: The site spec, the operations on it, and its history

Date: 14 November 2026. Area 1 of six technical designs. Owner of: the `SiteSpec` format, the operation vocabulary, history, versioning and migration of saved sites, validation, and cross-breeding.

**Evidence labels.** [V] verified: I read the source file, the docs page or the registry myself on 14 Nov 2026. [R] reported: secondary source. [P] my proposal or judgement. [M] measured by me in a throwaway experiment (scratchpad, Node 25.6.1 on this Mac, Zod 4.6.7).

**What I built to check the design [M].** A Zod 4 draft of the whole schema (400 lines), the operation applier with inverses, whole-document invariants, cross-breeding and a readable diff (446 lines), and the bakery example in section 3. Results:
- The bakery spec (3 pages, 10 blocks, 2 collections, 3 assets, 1 translation) parses and passes all invariants. It is 8,956 bytes of JSON, 3,955 bytes gzipped.
- A six-operation chat turn (move, block swap, add FAQ, change a button label, reorder nav, change density) applies, produces the readable diff `Added a faq section to Home / Moved the testimonials section up 2 / Header nav changed / Changed the hero section's design / … / Theme density: airy → regular`, and its inverse restores the original byte for byte.
- An invalid transaction fails atomically with `block_not_found {"block":"b_hero9f3k2a"}`. A page path collision fails at commit with `duplicate_path, home_count`.
- Cross-breeding (layout of the edited site, style of a third, content of the original) is pure (same output twice), keeps every headline, remaps nav links and anchors, and reports exactly one problem: `content_pending` for the FAQ that the content source never had.
- Full validation of the spec takes 0.09 ms. One transaction (clone, apply, invariants) takes 0.08 ms. Validating after every operation is affordable.
- `z.toJSONSchema` emits a 15 KB JSON Schema for the whole document.

Four other areas wrote requirements on this one (section 5 of `03-generation-pipeline.md`, `04-platform.md`, `05-editor-client.md` and `06-room-for-later.md`). The draft adopts them, with the disagreements stated in section 5.

---

## 1. Decisions

| # | Decision | Recommendation | Door | Confidence |
|---|---|---|---|---|
| D1 | Relationship to json-render | **Our own format** with a small adapter that compiles a page to json-render's flat `Spec` when we want its renderer or composer. Not a superset, not a wrapper | One-way | High |
| D2 | Top-level layout of the document | Four partitions, **`structure` / `style` / `content` / `settings`**, plus behaviour keys reserved for area 6 (`capabilities`, `automations`, `permissions`, `integrations`, `extensions`) | One-way | High |
| D3 | Who owns a block's content shape | **The section type.** Every block type implements one section type (hero, faq, collection-list…). Content is stored per block instance and validated by the section type's schema. Variants and block types never own content fields | One-way | Medium-high |
| D4 | Shape of the tree | **Flat id-keyed maps** (pages, shells, blocks, assets, collections) and ordered id lists. Content arrays hold keyed objects only | One-way | High |
| D5 | Identity | **Opaque, prefixed, random ids** (`b_` + 10 chars), minted by code, never by a model. Site id is a ULID. A block keeps its id through variant, block-type and section-type changes | One-way | High |
| D6 | References | **By id everywhere**: links, anchors, images, collections, forms. Hard facts by channel (`{type:"contact", channel:"phone"}`), never typed into text | One-way | High |
| D7 | Free styling and code | **None in the spec.** No CSS, class names, pixel values, HTML or code strings. Only ids from registries | One-way | High (escape hatch is a founder question) |
| D8 | Business facts and repeated entities | `content.business` holds single facts; **`content.collections` holds every repeated entity** (menu items, services, team, testimonials, posts). Sections reference them | One-way | Medium |
| D9 | Operations | **Two layers.** Callers (decision model, text model, slow path, editor) issue *commands* (`addBlock`, `replaceVariant`, `setContent`…). Commands compile to **15 primitive operations**, which are stored, invertible and self-contained. RFC 6902 JSON Patch is derived only where a consumer needs it. No CRDT | One-way (primitive semantics); two-way (storage) | High |
| D10 | Addressing inside content | **Keyed paths**: JSON-Pointer-like, but a segment that enters an array is an item id, never an index | One-way | High |
| D11 | Ordering | Ordered arrays plus anchor-based operations ("before `b_x`"). No fractional indexing yet | Two-way | High |
| D12 | History | **Append-only version graph** (`parents[]`). Each version stores a transaction (ops, inverse ops, author, intent, turn). Snapshots are authoritative every 50–100 versions and at named versions and publishes. Undo is a new transaction | One-way (fields); two-way (retention) | High |
| D13 | Format versioning | Integer **`specVersion`**, chained pure migrations run on read and persisted on next write. Additive changes do not bump it | One-way | High |
| D14 | Block versioning | A block instance **pins the block's major `v`**; minor and patch float. A major ships a chained `migrate(props, variant)`. Content never migrates with a block. Published pages are frozen until republished | One-way | High |
| D15 | Style versioning | Style stored as **choices** (`family@major` plus axis option ids), compiled to tokens at render; families version like blocks | One-way | High |
| D16 | Validation | Zod 4 for authoring, JSON Schema generated, three checkpoints (operation preconditions, commit invariants, defensive render), structured `Problem` objects | Two-way | High |
| D17 | Locales | Default-locale values inline; other locales as an **overlay keyed by text key with a source hash**; the same structure in every locale | One-way | Medium (founder question) |
| D18 | Rich text | Constrained paragraph-and-span JSON, replaced as one value | One-way | Medium |
| D19 | Provenance | One side map `content.provenance[textKey]` for both text slots (area 3) and facts (area 6) | Two-way, cheap now | High |
| D20 | Cross-breeding | A pure function over the partitions, matching pages by kind and blocks by section type in order | Two-way (given D2, D3) | High |
| D21 | Multiplayer and branches | Later, on the same primitives: server-ordered transactions, last writer wins per field, three-way merge of snapshots by id | Two-way | Medium |

---

## 2. Detail per decision

### D1. json-render: own format with an adapter (one-way door)

**Options.**
1. **Superset.** Store json-render's `Spec` per page (`{root, elements, state}`, each element `{type, props, children, slots, visible, on, repeat, watch}`) and add our fields around it.
2. **Wrapper.** Store json-render's `StartAppSpec` (`{metadata, routes, layouts, state}`) untouched inside our document.
3. **Own format plus adapter.** Store `SiteSpec`. Compile a page to a json-render `Spec` in about 100 lines when we use its React renderer in the editor, or the forked composer.

**Facts.**
- `Spec` is `{root, elements, state?}` with no version field [V `packages/core/src/types.ts` at tag v0.22.0, 4 Nov 2026]. Saved specs cannot say which shape they are.
- The expression syntax inside props has already been renamed once: `$path` and `$data` became `$state` in v0.6.0. The project's migration guide is a guide for changing your code, not a function that migrates stored data [V `apps/web/content/docs/migration.mdx`].
- `UIElement.props` holds everything: text, layout settings, and expressions. Cross-breeding would need the catalog to split every element's props, and the composer matches existing elements to candidates by "exact JSON equality of the recipe" (report 03, section 1.3), which fails as soon as text is inside props.
- Its patch applier is tolerant, not strict: for `replace` the source says "RFC 6902: target must exist. For streaming tolerance we set regardless" [V `types.ts`, `applySpecStreamPatch`]. Its diff replaces arrays whole instead of diffing them ("Arrays are compared shallowly and replaced atomically") [V `packages/core/src/diff.ts`], so a history of its patches records a move as "the list changed".
- `StartAppSpec` keys routes by their path (`"/blog/$slug"`) [V `packages/tanstack-start/src/types.ts`]. Renaming a page would change its identity.
- Open problems: `catalog.validate()` skips per-component props validation when the catalog has more than one component (#467, open, updated 9 Nov 2026); Zod 4.4+ support is blocked by a type check (#297, open since May). Core depends on `zod ^4.3.6` [V `gh issue view`, `packages/core/package.json`].
- One maintainer (`ctate`, 185 commits; the next human has 16); 19,615 stars; 121 open issues; last push 13 Nov 2026 [V `gh api`].

**Recommendation: option 3.** The stored format is the one thing we cannot change after 10,000 saved sites, so it should not inherit another project's 0.x shape, its expression language or its validation gaps. The cost of owning it is small and mostly needed anyway: we need our own validator (because of #467), our own migrations (json-render has none for data), and our own patch semantics (ids instead of indices). The experiment's schema plus applier is under 900 lines [M].

**What we keep from json-render.**
- The same structural idea: a flat map of elements with `children` and named `slots` (D4). The adapter is a one-to-one walk.
- Its `visible` and `on` shapes, reserved on blocks for later (area 6 asked for this).
- Its renderer for the editor preview if area 2 wants it, its forked composer (area 3), and SpecStream if a consumer wants RFC 6902 patches (derived, D9).

**This disagrees with `CLAUDE.md`**, which says "built on json-render's flat `Spec`" and "stored as JSON patches". The structural idea is kept; the storage is not. Reasons above and in D9.

### D2. Four partitions (one-way door)

**Options.** (a) Settings inline on each block instance, as in Puck (`props`) and Shopify (`settings`) [V Puck `component-data.mdx`; Shopify `json-templates.md`]. (b) Separate partitions for structure, style and content.

**Prior art.**
- Shopify splits settings by kind after the fact: when a merchant switches theme preset, "only values from presentational settings are updated", where presentational means certain input types (color, font picker, select, range…) [V `settings-data-json.md`]. That is cross-breeding by input type, done late.
- Notion: changing a block's type "doesn't change the block's properties or content—it only changes the type attribute" [V Notion blog, 18 May 2021].

**Recommendation (b).**
- `structure`: pages, shells (shared header and footer regions), block instances with their section type, block type, major version, variant and layout props.
- `style`: the theme as choices.
- `content`: business facts, page labels and SEO, per-block content, collections, assets, translations, provenance.
- `settings`: locales and redirects.
- Behaviour keys at the top level, shapes owned by area 6: `capabilities`, `automations`, `permissions`, `integrations`, `extensions` (`x-` keys only).

**Why.** The partitions match who may write what: the decision model writes `structure` and `style`; the text model writes text in `content`; extraction writes `content.business` and `content.collections`; a person writes anything. They make cross-breeding a swap of partitions (D20), and they make diffs and permissions per partition trivial.

### D3. Content belongs to the section type (one-way door, the most important one)

**Options.**
1. Content shape per block type (Gutenberg attributes, Puck props, Builder.io options). Swapping a block needs a prop mapping per pair of blocks; The Wall must write text per block.
2. Content shape per variant. Worse than 1.
3. **Content shape per section type**, shared by every block that implements it.

**Recommendation 3.** Section types are the content contract: `hero` has `eyebrow?`, `headline`, `subhead?`, `primaryCta?`, `secondaryCta?`, `media?`, whatever block draws it.
- A block declares which section type it implements, which fields it requires and which optional fields it shows. It may hide optional fields. It may not add private content fields; if a design needs a badge, `badge?` is added to the section type (an additive change).
- A variant swap or a block swap inside one section type never touches content. Analytics, comments and selection keep working because the id stays (D5).
- Area 3 already relies on this (its "one-way door 6": text is written once per section type, and The Wall reuses it) and report 04 proposed it ("content models are defined per section *type*, not per variant").
- Gutenberg's lesson points the same way: a block variation is not stored, so the editor needs an `isActive` function to work out which variation an instance is [V `block-variations.md`]. We store the section type, the block type and the variant explicitly.

**Size.** About 25 to 40 section types for v1 [P]. Each is a Zod object with field metadata (label, character limits, hint for the text model).

**Hard facts are not content fields.** `hours-location` has only a heading and a note; the hours come from `content.business`. A price list section has framing text and a `source` that points at a collection.

### D4. Flat maps and id lists (one-way door)

**Prior art.** Nested trees: Puck `content: ComponentData[]` with the id inside `props`; Builder.io `children: BuilderBlock[]`; Gutenberg `innerBlocks`. Flat: json-render `elements` map; Shopify `sections` keyed by id plus an `order` array ("Duplicates are not allowed", ids "alphanumeric") [V `json-templates.md`]; Notion's `content` array of child ids [V]; Figma's `Map<ObjectID, Map<Property, Value>>` [V Figma multiplayer post].

Puck's regret is instructive: nested regions were stored in a separate `zones` map keyed by compound strings (`"HeadingBlock-1234:my-content"`), now deprecated in favour of slot fields, with a migration guide [V Puck `data.mdx`, `dropzones-to-slots.mdx`].

**Recommendation: flat.** Every record lives at a path that never changes when it moves (`/structure/blocks/b_x/variant`). A move edits one or two id lists. Integrity (no orphans, no block placed twice, no dangling ids) is checked by about 40 lines of invariants [M]. Models and people see a derived nested outline.

**Depth.** In v1 a page body is a list of section blocks, and repeated things inside a section are content items, not child blocks. `slots` on a block is reserved for container blocks (apps will need grids and tabs); invariants already handle it.

### D5. Identity (one-way door)

**Options.** Sequential (`el-0`, `el-1`, as json-render's `nestedToFlat` does [V `types.ts`]); semantic (Shopify's `"main"`); UUID v4 (Notion [V]); ULID; short random.

**Recommendation.**
- **Format:** a type prefix plus 10 characters of `[a-z0-9]`: `b_hero9f3k2a` (block), `p_` page, `sh_` shell, `i_` item, `a_` asset, `c_` collection, `f_` form instance. About 51.7 bits; unique within a site, checked when minted [P]. Prefixes make logs, paths and prompts self-explanatory. The ids need no escaping in JSON Pointer, URLs, CSS selectors or HTML attributes, and cost few tokens in model prompts.
- **Site id:** a ULID, never derived from a name (area 6 requirement).
- **Who mints:** the code that creates the operation, on server or client. A model never invents an id. A tool call that creates something refers to it by a placeholder that the applier resolves. For replay, ids are minted from the generation seed (area 3, D17).
- **Every object in a content array has an `id`** (`i_…`), like Sanity's and Portable Text's `_key` [V Portable Text README; Sanity `http-patches.md`].

**What happens on replacement.**

| Change | Block id | Content |
|---|---|---|
| Variant swap | Kept | Untouched |
| Block type swap, same section type | Kept | Untouched |
| Section type change (testimonials → logo wall) | Kept | Transformed by the section type's mapping function if one exists, else replaced. The old content sits in the inverse operation, so undo restores it |
| Duplicate | New block id and new item ids | Copied |
| Cross-breed | The layout source's ids | Matched by section type (D20) |
| Code export and re-import | Carried as `data-block="b_x"` | — |

Analytics events carry `{blockId, sectionType, type, v, variant}` so a series can be split when a block changed type [P].

### D6. References by id (one-way door)

Links are `{type:"page", page, anchor?}`, `{type:"item", collection, item}`, `{type:"url", url}`, `{type:"asset", asset}` or `{type:"contact", channel}`. Images are `{asset, alt?}`. Sections point at collections by id. Forms by instance id.

- Renaming a page path then breaks nothing; the `setPagePath` command also adds a redirect.
- Hard facts are bound, never typed (area 6, principle 3): a "Call us" button is `{type:"contact", channel:"phone"}` and the renderer reads the number from `content.business`.
- Shared regions are references too: a page names its shell; Gutenberg does the same with template parts (`slug`, `theme`, `area`) and synced patterns (`ref` plus an override map) [V `template-part/block.json`, `block/block.json`].

### D7. No free styling or code in the spec (one-way door)

Builder.io stores per-breakpoint raw CSS (`responsiveStyles.large/medium/small/xsmall`) and bindings as code strings (`bindings: {[key]: string}`) [V `packages/sdks/src/types/builder-block.ts`]. Shopify stores merchants' `custom_css` and tells theme developers not to touch it [V `json-templates.md`].

Free CSS or code in the spec would break theme switching, cross-breeding, the quality gates, the decision model's ability to choose, and the promise that a library improvement reaches every site. Once users have it, it cannot be taken away. Layout props are enums, booleans and small integers declared by the block manifest; style is ids. Whether there is a sandboxed escape hatch is a product choice (section 6, Q2).

### D8. Business facts and collections (one-way door)

- `content.business`: name, tagline, brand (logo, colours), contact (E.164 phone, email, structured address, geo), time zone, opening hours, special hours, social links, price range. Field schema owned by area 6 (schema.org-aligned, money in minor units with ISO 4217 currency).
- `content.collections`: every repeated entity, typed by collection kind (`menu-item`, `service`, `product`, `post`, `team-member`, `testimonial`, `event`, `faq`, `custom`), items keyed by id, up to 500 items inline. A reserved `source: {capability: "cms"}` moves large collections into the site store later.
- The booking form, the price list, the JSON-LD and the menu page all read the same service or menu items. Changing a haircut price is one `set` and updates everything (report 06, B7).

Area 6 recommends a sibling `business.json`. I keep business facts **logically inside the spec** (one history, so "undo" covers a price change; one validation, so references from sections to items resolve; one export file). Nothing in `structure` points at storage locations, so area 4 can still store `content.business` and `content.collections` as separate rows later; that is a two-way storage choice (section 5).

### D9. Operations: commands compile to stored primitives (one-way door for semantics)

**Options.**
1. **Raw RFC 6902 JSON Patch as the stored log** (current `CLAUDE.md` text).
2. **Semantic primitives** addressed by id (recommended).
3. **A CRDT document**: Yjs 13.6.33 (moving items is still an open "Experimental move feature", #357, with open v14 move bugs #694 and #475), Automerge 3.5.0, Loro 1.17.1 (movable tree, time travel, version control) [V npm, GitHub].
4. **Commands as the stored log** (event sourcing of intents).

**Why not stored JSON Patch.** Array indices are positions, so concurrent or rebased edits land in the wrong place. A patch carries no intent, so readable diffs must be guessed. A patch has no inverse unless old values are captured. Stored patches cannot be migrated when `specVersion` changes because their paths change. json-render's own applier is deliberately non-strict (D1).

**Why not stored commands.** A command like `addBlock("faq")` reads library defaults (which block, which props, default text) at execution time. Replayed after a library release it gives a different result. Primitives carry everything they need.

**Why not a CRDT now.** The product is single-user today. A CRDT puts a binary format and a dependency in the most irreversible layer, and its merges can still produce a spec our validator rejects (a block removed on one side while content was added on the other). Figma took the simpler path for a central server: "Figma isn't using true CRDTs", the server is "the central authority", with per-property last-writer-wins and fractional indexing for order [V Figma post]. Notion batches operations into transactions "committed (or rejected) by the server as a group" [V]. Our primitives fit that later (D21).

**Recommendation.**
- **Commands** are what callers use. They read the library, mint ids, choose defaults and compile to primitives. The names match area 3's requirement: `addBlock`, `removeBlock`, `moveBlock`, `replaceVariant`, `setTheme`, `setContent`, plus the rest in section 3.3.
- **Primitives** are what is stored and replayed: 10 structural (`page.add/remove/set`, `block.add/remove/move/setType/setSectionType/setProps/setHidden`) and 5 generic for the other partitions (`set`, `unset`, `list.insert`, `list.remove`, `list.move`). Every primitive's inverse is computed at apply time from the state before it (table in section 3.3).
- **One shared `applyTransaction(spec, ops)`**, pure, used by the server, the client, the slow path's draft, undo and replay (area 3 requirement). All or nothing.
- **Whole-spec replacements** (picking a site from The Wall, regenerating, importing) become primitives through `diffToOps(current, target)`, so they are undoable and diffable like any edit.
- **RFC 6902 is derived** by `toJsonPatch(ops, before)` for any consumer that wants it (json-render SpecStream). Not needed in M0: the preview can receive whole snapshots.

### D10. Keyed paths (one-way door)

JSON Pointer has no way to say "the item with id x". Sanity's patches use JSONMatch, which can target array elements by key (for example "the element that has `_key == "abc-123"`") [V `http-patches.md`]. Our paths look like JSON Pointer, but a segment that enters an array is an item id:

`/content/blocks/b_hdr7c2k9q1/nav/i_nav9q0r1s2/label`

A text key is the same path without the `/content/` prefix (`blocks/b_x/items/i_y/title`). Text keys address translations, provenance, area 3's `slot` events and comments. Rule: arrays in content hold keyed objects only. Rich text is one atomic value, so nothing addresses inside it.

### D11. Ordering (two-way door)

Ordered arrays with anchor operations (`before: "b_x"` or `null` for the end). If the anchor is gone at rebase time, append. Fractional indexing (rocicorp `fractional-indexing` 4.0.0, the technique Figma describes [V]) is only needed for concurrent inserts without a server; switching later is a mechanical migration.

### D12. History (one-way door for the fields, two-way for retention)

**Options.** Snapshots only (v0 makes "a new version per applied edit" [R report 06]); an operation log only; both.

**Recommendation: both, with snapshots authoritative.**
- Every committed transaction becomes a **version**: `{id (ULID), parents[], branch, seq, specVersion, txn, snapshot?, specHash, label?, at}`. The transaction carries its own id (idempotent writes) and the base version its author saw; in M1 a stale base is rejected and the client reloads (areas 4 and 5 agree). The transaction holds ops, inverse ops, author (`user`, `decision-model`, `text-model`, `slow-path`, `import`, `migration`, `system`, with `genId` and model), the command and chat message that caused it, and a `turn` id.
- **Snapshots** every 50–100 versions (area 5 proposed about 100), at every named version, every publish and every merge. Loading is a snapshot plus at most that many transactions. Old operation logs are never replayed across a `specVersion` change; old versions open by migrating their snapshot.
- **Undo and redo**: per user, per session, over that user's own turns. Undo appends a new transaction made of the inverse ops (`undoOf`). One chat turn is one undo step, even if it streamed many text updates; typing into one field coalesces into one step after 1.5 s idle. Figma's rule applies when others edit too: "if you undo a lot, copy something, and redo back to the present … the document should not change" [V]. If an inverse no longer applies, undo says which block changed rather than guessing.
- **Named versions** are labels on versions. **Publishing** points the site at a version, so rollback is a pointer move.
- **Readable diffs** are computed from any two snapshots by id (`diffSpecs`), so they work across branches, imports and migrations. The transaction's intent is shown next to them. Field labels come from the section type's field metadata. Example output from the experiment [M]: "Added a faq section to Home", "Moved the testimonials section up 2", "Theme density: airy → regular".
- **Branches** later: a branch is a named head. **Merge** later: three-way merge of the base, ours and theirs snapshots by id: field level for content, record level for blocks and pages, diff3 on id lists. No operation log is needed for it.

**Cheap now, painful later:** `parents[]` on every version (branches need it), author and `genId` on every transaction (auditing model edits), `turn` ids (undo by turn), `specHash` per version (dedupe, replay checks), never mutating a stored version. **Safe to add later:** branch UI, merge, compaction, a time slider.

### D13. Format versioning and migrations (one-way door)

- `specVersion` is an integer (area 6 proposed a string; an integer orders without parsing).
- `migrations[n]: (spec at n) => spec at n+1`. Pure, no I/O, no library lookups except pinned tables in the migration file, each with fixtures. Chained on read by the shared package. Persisted on the next write as a transaction authored `migration`.
- **Additive changes do not bump it**: a new optional field, a new section type, a new enum value, a new collection kind, a new capability. Renames, removals and meaning changes do.
- Prior art: `theme.json` carries an integer `version` and documents renames from v1 to v2 [V `theme-json-migrations.md`]; Puck ships `migrate()` for its own data model and warns that a prop transform must cope because "data may include both components with old data and new data" [V `data-migration.mdx`, `transform-props.mdx`]. Stored versions avoid that ambiguity.
- **Capabilities** play the role of glTF's `extensionsRequired` ("Names of glTF extensions required to properly load this asset") [V glTF 2.0 schema]: an app that does not know a listed capability, or a newer major of it, opens the site read-only instead of corrupting it. This matters for self-hosters running older versions.

### D14. Block versioning and the compatibility contract (one-way door)

**Options.**
1. **Always latest, no version stored.** Gutenberg detects old content by re-running `save()` and comparing markup. Its deprecations "do not operate as a chain of updates", a deprecation's `migrate` is skipped if its `save` does not reproduce the stored markup, and authors may "need to update the `migrate` methods in multiple deprecations" [V `block-deprecation.md`]. Its `block.json` `version` is only for asset cache busting [V `block-metadata.md`]. Puck also stores no per-component version [V].
2. **Pin the exact version and keep every version's code.** The bundle grows forever and bug or accessibility fixes never reach old sites.
3. **Pin the major, float minor and patch** (recommended).

**The contract** [P]:

| Change to a block | Version | Allowed | Required |
|---|---|---|---|
| Bug fix, no visual intent change | patch | Yes | Renders every stored instance of this major |
| Visual polish, new optional prop with a default, new variant, new enum value | minor | Yes | Same, enforced in CI against fixtures and a nightly sample of real stored instances (props and variant only, no content) |
| Rename or remove a prop, remove a variant, change a prop's meaning | major | Yes | `migrate({props, variant}) → {props, variant}` from the previous major, chained |
| Retire a block type | — | Yes | `retiredTo` another block of the same section type, with a prop map. Always possible, because every section type has a fallback block |
| Change content fields | — | Not here | It is a section type change: additive is free, breaking is a `specVersion` migration |

**Mechanics.**
- The block instance stores `type` and `v` (major). The library keeps one implementation per major that stored sites still use.
- On read, the shared package migrates instances whose `v` is behind. A nightly batch migrates stored sites (load, migrate, validate, render-check, write as a `migration` transaction, with a dry-run diff report first) so old majors can be deleted.
- **10,000 sites when a block's props change:** for a minor, nothing happens to stored data; editors see the polish at once. For a major, the batch above runs pure functions over JSON; at 10–50 KB per site that is 100–500 MB of JSON, minutes on one machine [estimate].
- **Published sites do not change when the library changes.** The published HTML and assets are frozen at publish; the next publish picks up improvements. Whether to republish automatically is a product choice (section 6, Q1).

### D15. Style as choices (one-way door)

`style = {family: "warm-craft@1", axes: {typePairing, imagery, grid, density, radius, buttons, motion…}, palette: {strategy, useBrandColors, hue?}, mode, art?}`. Area 2 owns the registries and compiles them to CSS variables. Storing choices, not tokens, lets a palette fix reach every site, keeps the decision model's answers as the data, and makes The Wall's distance between styles a comparison of ids. Families pin a major like blocks, with the same migration rule.

### D16. Validation (two-way door)

**With what.** Zod 4.6.7: strict objects, discriminated unions, registries for field metadata, and `z.toJSONSchema()` [V `packages/docs/content/metadata.mdx`, `json-schema.mdx`]. The generated JSON Schema (15 KB [M]) is published with the export and referenced by `$schema`, so a coding agent can validate an exported spec. Validators exchanged across packages are typed as Standard Schema (`@standard-schema/spec` 1.1.0 [V npm]) so a block author could later use another library. Published pages ship no validator.

**Where.**
1. **Per operation**: preconditions inside `applyOp` (the target exists, the anchor exists, the path is legal for that partition). A failing operation rejects the whole transaction.
2. **At commit**: whole-document invariants: every block placed exactly once, no dangling or orphan ids, content valid for its section type, layout props valid for the block manifest, links and assets resolve, one home page, unique paths, capabilities enabled for blocks that require them, size limits, area 6's rejections (secret-looking values, submission data, reserved route prefixes).
3. **At render**: defensive. An unknown block renders its section type's fallback; invalid content renders a placeholder; a page never fails because of one block.
4. **On load**: migrate, then validate. Invalid parts are quarantined and shown, never a refusal to open (Gutenberg's "This block contains unexpected or invalid content" is the experience to avoid).

**Severities.** `error` rejects the transaction. `blocker` allows editing but blocks publish: pending content, placeholder text, `suggested` facts (area 6), missing alt text, assets still at their import URL. `warning` is advice ("this headline is 92 characters; this design fits 70").

**Who sees what.** Every problem is `{code, path, message, severity, expected?, hint?}`.
- The decision model rarely meets one, because code offers only valid options.
- The text model and the slow path get the list as a tool result, with paths in their vocabulary, and retry (area 3, D10 and D13).
- People get the message on the field, in plain words, with soft limits as warnings.

### D17. Locales (one-way door)

**Options.** (a) A locale map in every text field (`{en: …, ar: …}`): every field changes shape. (b) A full copy of content per locale: copies drift. (c) **Default-locale values inline plus an overlay** `content.translations[locale][textKey] = {value, sourceHash}`.

**Recommendation (c).** Shopify does the same: a translation must carry the `translatableContentDigest` of the source it translated [V `translationsRegister.md`]. When the source text changes, its hash no longer matches and the translation is flagged stale. Missing translations fall back to the default locale. Translated path segments use the text key `pages/p_x/path`. Direction is per locale (`dir`, derived from the script when absent); blocks use logical CSS properties (area 2). The structure is the same in every locale; a section shown in one language only is a founder question (Q4).

### D18. Rich text (one-way door)

Paragraphs (`p`, `bullet`, `number`, `quote`) of spans with `strong`, `em` and an optional link that uses the same `LinkTarget`. Modelled on Portable Text's blocks and spans [V README], with less. The text model writes a tiny Markdown subset that code parses; the editor maps Tiptap JSON to it (area 5). A rich-text field is replaced as one value; character-level merging is deferred.

### D19. Provenance (two-way door, cheap now)

`content.provenance[textKey] = {by, gen?, status?, source?, at?}`, with `by` one of `user`, `fact`, `generated`, `placeholder`, `default`, `import`. It serves area 3 (regeneration never overwrites `user` or `fact` text; `genId` for replay) and area 6 (`suggested` facts block publishing; the source URL of an imported fact). Area 6 proposed `Sourced<T>` wrappers around each value; a side map carries the same information while keeping values plain for the renderer, the models, the diff and cross-breeding (section 5). Size is roughly 60–100 bytes per entry [estimate].

### D20. Cross-breeding and variation (two-way door, given D2 and D3)

**Definitions.**

| Part of the spec | Layout | Style | Content | Site (travels with content) |
|---|---|---|---|---|
| `structure.pages`: kind, path, shell, body, template, hidden | ✓ | | | |
| `structure.shells` | ✓ | | | |
| `structure.blocks`: section type, block type, `v`, variant, props, slots, hidden, label | ✓ | | | |
| `style` (family, axes, palette strategy, mode, art) | | ✓ | | |
| `content.business` (including brand logo and colours) | | | ✓ | |
| `content.pages` (nav labels, SEO), `content.blocks`, `collections`, `assets`, `translations`, `provenance`, `seo` | | | ✓ | |
| `siteId`, `meta`, `settings`, `capabilities`, `automations`, `permissions`, `integrations`, `extensions` | | | | ✓ |

Edge cases settled by the table: a block's surface tone (`props.surface`) is layout, because section rhythm is decided with the section order. Brand colours are content (facts about the business); the style decides whether to use them (`palette.useBrandColors`). Page paths are layout; page labels are content.

**The function** (`crossBreed(L, S, C)`, code in section 3.4, tested [M]):
1. Start from C (the business), take `structure` from L and `style` from S.
2. Match L's pages to C's pages by page kind, in path order.
3. For each block in L (shell blocks first, then each page), take the first unused block of C with the same section type, on the matched page first, then anywhere.
4. Copy its content under L's block id, remapping page links and anchors to L's ids. A nav item whose page L does not have is dropped.
5. A block with no match has no content: the invariant reports `content_pending` and the text pipeline fills it.

**The Wall.** Area 3 writes text once for the union of section types (its D14). That text is a content source; each candidate is `crossBreed(layout_i, style_j, contentSource)`. A diversity sampler enumerates **genomes**: the layout genome is, per page, the sequence of `(sectionType, type, v, variant, props)`; the style genome is the `style` partition. Both map back to a spec without loss once content is applied. The distance between genomes and the "layout signature" per variant are area 3's and area 2's.

### D21. Multiplayer and branches later (two-way door)

When needed: clients send transactions with their base version; the server orders them, re-checks preconditions, applies, and broadcasts. Conflicts on the same field: last writer wins. Edit to a removed block: dropped with a notice. Anchors that vanished: append. This is the Figma and Notion shape [V], on the same primitives. Nothing in the format has to change.

---

## 3. Schema and operation drafts

All code in this section ran in the experiment [M]: the schema parses the example, the operations apply and invert, and cross-breeding passes the invariants. It is a draft to start from, not production code. One finding from type-checking: Zod brands on id strings (`.brand<"b">()`) make `Record` indexing awkward in TypeScript; production code should use template-literal types (`` `b_${string}` ``) instead [M].

### 3.1 `SiteSpec` v1 (Zod 4)

The section types are an excerpt (10 of the 25–40 needed). Collection item schemas, the business field schema and capability configs are owned by area 6 and appear here only as placeholders.

```ts
// SiteSpec draft, specVersion 1. Zod 4. Proposal, not production code.
import { z } from "zod";

/* ------------------------------------------------------------------ */
/* 1. Identifiers                                                      */
/* ------------------------------------------------------------------ */
// Opaque, random, prefixed, lowercase. Safe in JSON Pointer, URLs, CSS
// selectors, HTML attributes and file names without escaping.
const idOf = <P extends string>(prefix: P) =>
  z.string().regex(new RegExp(`^${prefix}_[a-z0-9]{10}$`)).brand<P>();

export const PageId = idOf("p");
export const ShellId = idOf("sh");
export const BlockId = idOf("b");
export const ItemId = idOf("i");
export const AssetId = idOf("a");
export const CollectionId = idOf("c");
export const FormId = idOf("f");
export type BlockId = z.infer<typeof BlockId>;
export type PageId = z.infer<typeof PageId>;
export type ItemId = z.infer<typeof ItemId>;

// Library identifiers are names, not random ids.
export const SectionTypeId = z.string().regex(/^[a-z][a-z0-9-]{1,40}$/); // "hero", "collection-list"
export const BlockTypeId = z.string().regex(/^[a-z][a-z0-9-]*\/[a-z][a-z0-9-]*$/); // "core/hero-split"
export const VariantId = z.string().regex(/^[a-z][a-z0-9-]{0,40}$/);
export const LocaleCode = z.string().regex(/^[a-z]{2,3}(-[A-Z][a-z]{3})?(-([A-Z]{2}|\d{3}))?$/); // BCP 47 subset
export const Slug = z.string().regex(/^[a-z0-9\p{L}]+(-[a-z0-9\p{L}]+)*$/u).max(80);
export const RoutePath = z.string().regex(/^\/([a-z0-9\p{L}-]+|\$slug)?(\/([a-z0-9\p{L}-]+|\$slug))*$/u);

// JSON value
export type Json = string | number | boolean | null | Json[] | { [k: string]: Json };
export const Json: z.ZodType<Json> = z.lazy(() =>
  z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(Json), z.record(z.string(), Json)]),
);

/* ------------------------------------------------------------------ */
/* 2. Field types shared by content models                             */
/* ------------------------------------------------------------------ */
// Field metadata lives in a Zod registry so models, editors and the
// diff describer can read limits and labels without parsing code.
export type FieldMeta = {
  label: string; // "Headline" -> used in readable diffs and the editor
  minChars?: number;
  maxChars?: number; // soft limit: hard error for models, warning for humans
  hint?: string; // instruction for the text model
};
export const fieldMeta = z.registry<FieldMeta>();

export const Text = (m: FieldMeta & { maxChars: number }) =>
  z.string().max(m.maxChars * 3).register(fieldMeta, m); // hard ceiling = 3x soft limit

export const LinkTarget = z.discriminatedUnion("type", [
  z.strictObject({ type: z.literal("page"), page: PageId, anchor: BlockId.optional() }),
  z.strictObject({ type: z.literal("item"), collection: CollectionId, item: ItemId }),
  z.strictObject({ type: z.literal("url"), url: z.url({ protocol: /^https?$/ }) }),
  // Hard facts are bound, never typed into content: resolved from content.business at render.
  z.strictObject({ type: z.literal("contact"), channel: z.enum(["phone", "email", "whatsapp", "directions"]) }),
  z.strictObject({ type: z.literal("asset"), asset: AssetId }), // e.g. PDF menu
  // reserved: { type: "action", action: "forms.submit" } (area 6 capability actions)
]);

export const Cta = z.strictObject({
  label: Text({ label: "Button label", minChars: 2, maxChars: 24 }),
  to: LinkTarget,
});

// Constrained rich text: paragraphs of spans. Edited and replaced as one value.
export const Span = z.strictObject({
  text: z.string(),
  marks: z.array(z.enum(["strong", "em"])).optional(),
  link: LinkTarget.optional(),
});
export const RichText = z.array(
  z.strictObject({ style: z.enum(["p", "bullet", "number", "quote"]), spans: z.array(Span).min(1) }),
);

export const ImageRef = z.strictObject({
  asset: AssetId,
  alt: z.string().max(250).optional(), // overrides the asset's alt for this use only
});

export const IconId = z.string().regex(/^[a-z][a-z0-9-]*$/); // from the icon set chosen by the theme

/** Content arrays hold keyed objects only. The key is the address. */
export const keyed = <T extends z.ZodRawShape>(shape: T) => z.strictObject({ id: ItemId, ...shape });

export const CollectionSource = z.strictObject({
  collection: CollectionId,
  pick: z.array(ItemId).optional(), // manual selection and order
  filter: z.strictObject({ field: z.string(), eq: Json }).optional(),
  sort: z.strictObject({ field: z.string(), dir: z.enum(["asc", "desc"]) }).optional(),
  limit: z.int().min(1).max(100).optional(),
});

/* ------------------------------------------------------------------ */
/* 3. Section types: one content model per section type (excerpt)      */
/* ------------------------------------------------------------------ */
// Every block type implements exactly one section type. All blocks of a
// section type render the same content, so variant and block swaps never
// touch content. (Area 3 calls this "content models per section type".)
export const NavItem = keyed({
  label: Text({ label: "Menu label", maxChars: 24 }),
  to: LinkTarget,
});

export const SectionTypes = {
  header: z.strictObject({
    nav: z.array(NavItem).max(8),
    cta: Cta.optional(),
  }),
  footer: z.strictObject({
    blurb: Text({ label: "Footer text", maxChars: 160 }).optional(),
    nav: z.array(NavItem).max(12),
    legal: Text({ label: "Legal line", maxChars: 120 }).optional(),
  }),
  hero: z.strictObject({
    eyebrow: Text({ label: "Eyebrow", maxChars: 32 }).optional(),
    headline: Text({ label: "Headline", minChars: 8, maxChars: 70 }),
    subhead: Text({ label: "Subheading", maxChars: 180 }).optional(),
    primaryCta: Cta.optional(),
    secondaryCta: Cta.optional(),
    media: ImageRef.optional(),
  }),
  features: z.strictObject({
    heading: Text({ label: "Heading", maxChars: 60 }),
    intro: Text({ label: "Intro", maxChars: 220 }).optional(),
    items: z
      .array(
        keyed({
          icon: IconId.optional(),
          title: Text({ label: "Item title", maxChars: 40 }),
          body: Text({ label: "Item text", maxChars: 160 }),
          media: ImageRef.optional(),
        }),
      )
      .min(2)
      .max(8),
  }),
  "collection-list": z.strictObject({
    // menu, services, team: the entities live in a collection
    heading: Text({ label: "Heading", maxChars: 60 }),
    intro: Text({ label: "Intro", maxChars: 220 }).optional(),
    source: CollectionSource,
    cta: Cta.optional(),
  }),
  testimonials: z.strictObject({
    heading: Text({ label: "Heading", maxChars: 60 }).optional(),
    source: CollectionSource,
  }),
  "hours-location": z.strictObject({
    // values come from content.business (facts); only framing text lives here
    heading: Text({ label: "Heading", maxChars: 60 }),
    note: Text({ label: "Note", maxChars: 200 }).optional(),
  }),
  story: z.strictObject({
    heading: Text({ label: "Heading", maxChars: 60 }),
    body: RichText,
    media: ImageRef.optional(),
  }),
  cta: z.strictObject({
    headline: Text({ label: "Headline", minChars: 8, maxChars: 70 }),
    body: Text({ label: "Text", maxChars: 200 }).optional(),
    primaryCta: Cta,
  }),
  faq: z.strictObject({
    heading: Text({ label: "Heading", maxChars: 60 }),
    items: z.array(keyed({ q: Text({ label: "Question", maxChars: 120 }), a: RichText })).min(1).max(20),
  }),
  contact: z.strictObject({
    heading: Text({ label: "Heading", maxChars: 60 }),
    intro: Text({ label: "Intro", maxChars: 220 }).optional(),
    form: FormId.optional(), // capabilities.forms.instances
  }),
} as const;
export type SectionTypeName = keyof typeof SectionTypes;

/* ------------------------------------------------------------------ */
/* 4. Structure ("layout" for cross-breeding)                          */
/* ------------------------------------------------------------------ */
export const Block = z.strictObject({
  id: BlockId,
  sectionType: SectionTypeId, // "hero"; decides the content model
  type: BlockTypeId, // "core/hero-split"; decides the markup
  v: z.int().min(1), // block MAJOR version; minor and patch float
  variant: VariantId, // "image-right"
  // Layout-class settings declared by the block manifest (enums and small
  // numbers only: columns, image side, surface tone, entrance motion).
  props: z.record(z.string(), Json),
  // Reserved for container blocks; v1 library uses none.
  slots: z.record(z.string().regex(/^[a-z][a-z0-9-]*$/), z.array(BlockId)).optional(),
  hidden: z.boolean().optional(),
  label: z.string().max(60).optional(), // name in the outline
  // RESERVED (rejected until a capability needs them), json-render v0.22 shapes:
  // visible: VisibilityCondition, on: Record<event, ActionBinding | ActionBinding[]>
});
export type Block = z.infer<typeof Block>;

export const PageKind = z.enum([
  "home", "about", "services", "menu", "contact", "gallery", "blog", "legal", "landing", "item-template", "custom",
]);

export const Page = z.strictObject({
  id: PageId,
  kind: PageKind,
  path: RoutePath, // default-locale route; "/menu", "/services/$slug"
  shell: ShellId,
  body: z.array(BlockId),
  template: z.strictObject({ collection: CollectionId }).optional(), // detail page per item
  hidden: z.boolean().optional(), // draft page, not published
});
export type Page = z.infer<typeof Page>;

// Shared header/footer regions around pages (Gutenberg template parts,
// Shopify section groups, json-render layouts with Slot).
export const Shell = z.strictObject({
  id: ShellId,
  before: z.array(BlockId), // header, announcement bar
  after: z.array(BlockId), // footer
});

export const Structure = z.strictObject({
  pages: z.record(PageId, Page),
  shells: z.record(ShellId, Shell),
  blocks: z.record(BlockId, Block),
});

/* ------------------------------------------------------------------ */
/* 5. Style                                                            */
/* ------------------------------------------------------------------ */
// Choices, never compiled tokens. Area 2 owns the registries and compiles
// these ids into CSS variables. Ids are versioned like blocks.
export const Style = z.strictObject({
  family: z.string().regex(/^[a-z][a-z0-9-]*@\d+$/), // "warm-craft@1"
  axes: z.record(z.string(), z.string()), // { typePairing: "fraunces-inter", density: "airy", ... }
  palette: z.strictObject({
    strategy: z.string(), // "neutral-accent"
    useBrandColors: z.boolean(), // take hue from content.business.brand when present
    hue: z.number().min(0).lt(360).optional(), // OKLCH hue when not using brand colors
  }),
  mode: z.enum(["light", "dark"]),
  art: z.strictObject({ style: z.string(), seed: z.int() }).optional(), // procedural imagery
});

/* ------------------------------------------------------------------ */
/* 6. Content                                                          */
/* ------------------------------------------------------------------ */
export const Oklch = z.string().regex(/^oklch\(/);
export const Day = z.enum(["mo", "tu", "we", "th", "fr", "sa", "su"]);
export const HHMM = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

// Field-level schema is owned by area 6 (BusinessProfile, schema.org-aligned).
// Values are plain; status and evidence live in content.provenance.
export const Business = z.strictObject({
  name: z.string().min(1).max(80),
  tagline: z.string().max(120).optional(),
  brand: z
    .strictObject({ logo: AssetId.optional(), colors: z.array(Oklch).max(3).optional() })
    .optional(),
  contact: z
    .strictObject({
      email: z.email().optional(),
      phone: z.string().regex(/^\+[1-9]\d{6,14}$/).optional(), // E.164
      address: z
        .strictObject({
          street: z.string(), locality: z.string(), region: z.string().optional(),
          postalCode: z.string().optional(), country: z.string().length(2),
        })
        .optional(),
      geo: z.strictObject({ lat: z.number(), lng: z.number() }).optional(),
    })
    .optional(),
  timeZone: z.string().optional(), // IANA, e.g. "Europe/London"
  hours: z
    .array(keyed({ days: z.array(Day).min(1), opens: HHMM, closes: HHMM }))
    .optional(),
  specialHours: z.array(keyed({ date: z.iso.date(), closed: z.boolean(), opens: HHMM.optional(), closes: HHMM.optional() })).optional(),
  social: z.array(keyed({ network: z.string(), url: z.url() })).optional(),
  priceRange: z.enum(["$", "$$", "$$$", "$$$$"]).optional(),
});

export const Licence = z.strictObject({
  type: z.enum(["owned", "cc0", "cc-by-4.0", "unsplash", "pexels", "generated", "client-supplied", "unknown"]),
  attribution: z.string().optional(),
  url: z.url().optional(),
});

export const Asset = z.strictObject({
  id: AssetId,
  type: z.enum(["image", "video", "svg", "document"]),
  source: z.discriminatedUnion("type", [
    z.strictObject({ type: z.literal("upload"), key: z.string(), sha256: z.string().length(64) }),
    z.strictObject({ type: z.literal("stock"), provider: z.string(), providerId: z.string(), url: z.url() }),
    z.strictObject({ type: z.literal("import"), url: z.url(), fetchedAt: z.iso.datetime() }), // must be copied to upload before publish
    z.strictObject({ type: z.literal("generated"), generator: z.string(), version: z.string(), params: z.record(z.string(), Json) }),
  ]),
  mime: z.string(),
  width: z.int().positive().optional(),
  height: z.int().positive().optional(),
  focal: z.strictObject({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) }).optional(), // default centre
  alt: z.string().max(250).optional(), // required unless decorative (lint)
  decorative: z.boolean().optional(),
  licence: Licence,
  placeholder: z.strictObject({ color: z.string().optional(), blurhash: z.string().optional() }).optional(),
});

export const CollectionItem = z.strictObject({
  id: ItemId,
  slug: Slug.optional(), // required when the collection has a detail template
  status: z.enum(["published", "draft"]).optional(),
  data: z.record(z.string(), Json), // validated by the collection kind's item schema
});

export const Collection = z.strictObject({
  id: CollectionId,
  kind: z.enum(["menu-item", "service", "product", "post", "team-member", "testimonial", "event", "faq", "custom"]), // item schema per kind: area 6
  name: z.string().max(60),
  items: z.array(CollectionItem).max(500),
  // reserved: source: { capability: "cms" } when items live in the site store
});

export const PageContent = z.strictObject({
  navLabel: z.string().max(24),
  seo: z.strictObject({
    title: z.string().max(70).optional(),
    description: z.string().max(170).optional(),
    image: AssetId.optional(),
    noindex: z.boolean().optional(),
  }),
});

// Text keys address one translatable string with a keyed path from the
// content root: "blocks/b_x/items/i_y/title", "pages/p_x/seo/title".
export const TextKey = z.string().regex(/^(blocks|pages|business|collections|assets|seo)\/[^\s]+$/);
export const Translation = z.strictObject({ value: Json, sourceHash: z.string() });

// One provenance mechanism for text slots (area 3) and facts (area 6).
export const Provenance = z.strictObject({
  by: z.enum(["user", "fact", "generated", "placeholder", "default", "import"]),
  gen: z.string().optional(), // generation id that wrote it (area 3)
  status: z.enum(["suggested", "confirmed", "owner_entered"]).optional(), // facts only (area 6)
  source: z.url().optional(), // where an imported fact came from
  at: z.iso.datetime().optional(),
});

export const Content = z.strictObject({
  business: Business,
  seo: z.strictObject({ titleTemplate: z.string().optional(), image: AssetId.optional() }),
  pages: z.record(PageId, PageContent),
  blocks: z.record(BlockId, z.record(z.string(), Json)), // shape checked per block.sectionType
  collections: z.record(CollectionId, Collection),
  assets: z.record(AssetId, Asset),
  translations: z.record(LocaleCode, z.record(TextKey, Translation)),
  provenance: z.record(TextKey, Provenance),
});

/* ------------------------------------------------------------------ */
/* 7. Settings and reserved extensions                                 */
/* ------------------------------------------------------------------ */
export const Settings = z.strictObject({
  locales: z.strictObject({
    default: LocaleCode,
    others: z.array(z.strictObject({ code: LocaleCode, dir: z.enum(["ltr", "rtl"]).optional() })),
    defaultDir: z.enum(["ltr", "rtl"]).optional(), // derived from script when absent
  }),
  redirects: z.array(
    keyed({ from: z.string().startsWith("/"), to: LinkTarget, status: z.union([z.literal(301), z.literal(302)]) }),
  ),
});

// Capabilities and behaviour: shapes owned by area 6; keys reserved here.
export const CapabilityUse = z.strictObject({
  v: z.int().min(1),
  config: z.record(z.string(), Json),
  instances: z.record(z.string(), z.record(z.string(), Json)).optional(),
});

/* ------------------------------------------------------------------ */
/* 8. The document                                                     */
/* ------------------------------------------------------------------ */
export const SPEC_VERSION = 1 as const;

export const SiteSpec = z.strictObject({
  $schema: z.string().optional(), // URL of the published JSON Schema, for agents and editors
  specVersion: z.literal(SPEC_VERSION),
  siteId: z.string().regex(/^[0-9A-HJKMNP-TV-Z]{26}$/), // ULID, opaque, never derived from a name
  meta: z.strictObject({
    createdWith: z.strictObject({ app: z.string(), library: z.string() }),
  }),
  settings: Settings,
  structure: Structure,
  style: Style,
  content: Content,
  // Behaviour (area 6). An absent capability is disabled. Like glTF's
  // extensionsRequired: an app that does not know a capability opens read-only.
  capabilities: z.record(z.string().regex(/^[a-z][a-z0-9-]*$/), CapabilityUse),
  automations: z.array(z.record(z.string(), Json)).optional(), // reserved
  permissions: z.array(z.never()).optional(), // reserved, must be empty in v1
  integrations: z.array(z.record(z.string(), Json)).optional(), // reserved
  extensions: z.record(z.string().regex(/^x-/), Json).optional(), // namespaced, ignored by renderer
});
export type SiteSpec = z.infer<typeof SiteSpec>;
```

### 3.2 Example: a bakery landing site

Three pages (home, menu, contact), a shared shell with header and footer, ten blocks, a menu collection with prices in minor units, reviews as a collection, three assets with sources and licences (an upload, a stock photo, an image generated by Surfaces), one Arabic translation with its source hash, provenance for an imported phone number, a generated headline and a note the owner typed, and a cake-order form as a capability instance. 8,956 bytes; 3,955 gzipped [M]. The domain `crumbandco.example` and the business are invented.

```json
{
  "$schema": "https://example.invalid/schemas/site-spec/v1.json",
  "specVersion": 1,
  "siteId": "01JCX4K8Q2M7X1PZ3V9R6T2W8E",
  "meta": {"createdWith": {"app": "0.1.0", "library": "2026.11.14"}},
  "settings": {"locales": {"default": "en-GB", "others": [{"code": "ar", "dir": "rtl"}]}, "redirects": []},
  "structure": {
    "shells": {"sh_main00000a": {"id": "sh_main00000a", "before": ["b_hdr7c2k9q1"], "after": ["b_ftr3m8x2v6"]}},
    "pages": {
      "p_home3j8w2q": {
        "id": "p_home3j8w2q",
        "kind": "home",
        "path": "/",
        "shell": "sh_main00000a",
        "body": ["b_hero9f3k2a", "b_menu4t7p1z", "b_stry2h6d8c", "b_revw8k1m3n", "b_hour5q2w7e", "b_ctab1x9r4t"]
      },
      "p_menu6v1n4b": {
        "id": "p_menu6v1n4b",
        "kind": "menu",
        "path": "/menu",
        "shell": "sh_main00000a",
        "body": ["b_mful2c8j5d"]
      },
      "p_ctct7b3m9x": {
        "id": "p_ctct7b3m9x",
        "kind": "contact",
        "path": "/contact",
        "shell": "sh_main00000a",
        "body": ["b_form6y4u2i"]
      }
    },
    "blocks": {
      "b_hdr7c2k9q1": {
        "id": "b_hdr7c2k9q1",
        "sectionType": "header",
        "type": "core/header-inline",
        "v": 1,
        "variant": "logo-left",
        "props": {"sticky": true}
      },
      "b_ftr3m8x2v6": {
        "id": "b_ftr3m8x2v6",
        "sectionType": "footer",
        "type": "core/footer-columns",
        "v": 1,
        "variant": "three-col",
        "props": {}
      },
      "b_hero9f3k2a": {
        "id": "b_hero9f3k2a",
        "sectionType": "hero",
        "type": "core/hero-split",
        "v": 2,
        "variant": "image-right",
        "props": {"surface": "base", "entrance": "rise"}
      },
      "b_menu4t7p1z": {
        "id": "b_menu4t7p1z",
        "sectionType": "collection-list",
        "type": "core/price-list",
        "v": 1,
        "variant": "two-column",
        "props": {"showPrices": true}
      },
      "b_stry2h6d8c": {
        "id": "b_stry2h6d8c",
        "sectionType": "story",
        "type": "core/story-media",
        "v": 1,
        "variant": "image-left",
        "props": {"surface": "muted"}
      },
      "b_revw8k1m3n": {
        "id": "b_revw8k1m3n",
        "sectionType": "testimonials",
        "type": "core/quote-grid",
        "v": 1,
        "variant": "three-up",
        "props": {}
      },
      "b_hour5q2w7e": {
        "id": "b_hour5q2w7e",
        "sectionType": "hours-location",
        "type": "core/hours-map",
        "v": 1,
        "variant": "map-right",
        "props": {}
      },
      "b_ctab1x9r4t": {
        "id": "b_ctab1x9r4t",
        "sectionType": "cta",
        "type": "core/cta-band",
        "v": 1,
        "variant": "centered",
        "props": {"surface": "accent"}
      },
      "b_mful2c8j5d": {
        "id": "b_mful2c8j5d",
        "sectionType": "collection-list",
        "type": "core/price-list",
        "v": 1,
        "variant": "grouped",
        "props": {"showPrices": true}
      },
      "b_form6y4u2i": {
        "id": "b_form6y4u2i",
        "sectionType": "contact",
        "type": "core/contact-split",
        "v": 1,
        "variant": "form-left",
        "props": {}
      }
    }
  },
  "style": {
    "family": "warm-craft@1",
    "axes": {
      "typePairing": "fraunces-work-sans",
      "imagery": "framed-photo",
      "grid": "left-editorial",
      "density": "airy",
      "radius": "soft-6",
      "buttons": "solid-pill",
      "motion": "rise-stagger"
    },
    "palette": {"strategy": "neutral-accent", "useBrandColors": true},
    "mode": "light"
  },
  "content": {
    "business": {
      "name": "Crumb & Co.",
      "tagline": "Sourdough and pastries, baked before sunrise",
      "brand": {"logo": "a_logo2k7d9m", "colors": ["oklch(0.62 0.14 55)"]},
      "contact": {
        "email": "hello@crumbandco.example",
        "phone": "+442079460000",
        "address": {"street": "12 Mill Lane", "locality": "Bristol", "postalCode": "BS1 4XX", "country": "GB"},
        "geo": {"lat": 51.4545, "lng": -2.5879}
      },
      "hours": [
        {"id": "i_hrs1a2b3c4", "days": ["tu", "we", "th", "fr"], "opens": "07:00", "closes": "16:00"},
        {"id": "i_hrs5d6e7f8", "days": ["sa", "su"], "opens": "08:00", "closes": "14:00"}
      ],
      "social": [{"id": "i_soc9g0h1j2", "network": "instagram", "url": "https://instagram.com/crumbandco.example"}],
      "priceRange": "$",
      "timeZone": "Europe/London"
    },
    "seo": {"titleTemplate": "%s · Crumb & Co.", "image": "a_hero8p3l2k"},
    "pages": {
      "p_home3j8w2q": {
        "navLabel": "Home",
        "seo": {
          "title": "Crumb & Co. — Bristol sourdough bakery",
          "description": "Naturally leavened bread, laminated pastries and coffee on Mill Lane. Open Tuesday to Sunday from 7am."
        }
      },
      "p_menu6v1n4b": {
        "navLabel": "Menu",
        "seo": {"title": "Menu", "description": "Today's breads, pastries and coffee with prices."}
      },
      "p_ctct7b3m9x": {"navLabel": "Contact", "seo": {"title": "Contact and custom orders"}}
    },
    "blocks": {
      "b_hdr7c2k9q1": {
        "nav": [
          {"id": "i_nav1k2l3m4", "label": "Menu", "to": {"type": "page", "page": "p_menu6v1n4b"}},
          {
            "id": "i_nav5n6o7p8",
            "label": "Our story",
            "to": {"type": "page", "page": "p_home3j8w2q", "anchor": "b_stry2h6d8c"}
          },
          {"id": "i_nav9q0r1s2", "label": "Contact", "to": {"type": "page", "page": "p_ctct7b3m9x"}}
        ],
        "cta": {"label": "Order a cake", "to": {"type": "page", "page": "p_ctct7b3m9x"}}
      },
      "b_ftr3m8x2v6": {
        "blurb": "A small neighbourhood bakery on Mill Lane, Bristol.",
        "nav": [
          {"id": "i_fnv3t4u5v6", "label": "Menu", "to": {"type": "page", "page": "p_menu6v1n4b"}},
          {"id": "i_fnv7w8x9y0", "label": "Contact", "to": {"type": "page", "page": "p_ctct7b3m9x"}}
        ],
        "legal": "© 2026 Crumb & Co. Ltd"
      },
      "b_hero9f3k2a": {
        "eyebrow": "Mill Lane, Bristol",
        "headline": "Bread worth getting up early for",
        "subhead": "Long-fermented sourdough, butter-rich pastries and good coffee, baked on site every morning from 4am.",
        "primaryCta": {"label": "See today's menu", "to": {"type": "page", "page": "p_menu6v1n4b"}},
        "secondaryCta": {"label": "Order a cake", "to": {"type": "page", "page": "p_ctct7b3m9x"}},
        "media": {"asset": "a_hero8p3l2k"}
      },
      "b_menu4t7p1z": {
        "heading": "Out of the oven",
        "intro": "A few favourites. The full menu changes with the seasons.",
        "source": {"collection": "c_menu5r2t8y", "pick": ["i_mnu1a1a1a1", "i_mnu2b2b2b2", "i_mnu3c3c3c3"]},
        "cta": {"label": "Full menu", "to": {"type": "page", "page": "p_menu6v1n4b"}}
      },
      "b_stry2h6d8c": {
        "heading": "Started in a home kitchen",
        "body": [
          {
            "style": "p",
            "spans": [
              {
                "text": "Maya began baking for neighbours in 2019. Five years and one very old starter later, Crumb & Co. opened on Mill Lane."
              }
            ]
          },
          {
            "style": "p",
            "spans": [
              {"text": "We use "},
              {"text": "organic flour from Shipton Mill", "marks": ["strong"]},
              {"text": " and ferment every loaf for at least 36 hours."}
            ]
          }
        ],
        "media": {"asset": "a_bake4n9k1j"}
      },
      "b_revw8k1m3n": {"heading": "What the neighbours say", "source": {"collection": "c_revw7u3i9o"}},
      "b_hour5q2w7e": {"heading": "Find us", "note": "Arrive before 10 on Saturdays for cardamom buns."},
      "b_ctab1x9r4t": {
        "headline": "Celebration cakes, made to order",
        "body": "Tell us the date and the flavour. We need five days' notice.",
        "primaryCta": {"label": "Start an order", "to": {"type": "page", "page": "p_ctct7b3m9x"}}
      },
      "b_mful2c8j5d": {
        "heading": "Menu",
        "source": {"collection": "c_menu5r2t8y", "sort": {"field": "group", "dir": "asc"}}
      },
      "b_form6y4u2i": {
        "heading": "Say hello or order a cake",
        "intro": "We reply within one working day.",
        "form": "f_cake3w8e2r"
      }
    },
    "collections": {
      "c_menu5r2t8y": {
        "id": "c_menu5r2t8y",
        "kind": "menu-item",
        "name": "Menu",
        "items": [
          {
            "id": "i_mnu1a1a1a1",
            "data": {
              "name": "Country sourdough",
              "description": "Wheat and rye, 36-hour ferment",
              "price": {"amount": 650, "currency": "GBP"},
              "group": "Bread",
              "dietary": ["vegan"]
            }
          },
          {
            "id": "i_mnu2b2b2b2",
            "data": {
              "name": "Cardamom bun",
              "description": "Swedish-style, laminated",
              "price": {"amount": 380, "currency": "GBP"},
              "group": "Pastry"
            }
          },
          {
            "id": "i_mnu3c3c3c3",
            "data": {"name": "Almond croissant", "price": {"amount": 420, "currency": "GBP"}, "group": "Pastry"}
          }
        ]
      },
      "c_revw7u3i9o": {
        "id": "c_revw7u3i9o",
        "kind": "testimonial",
        "name": "Reviews",
        "items": [
          {
            "id": "i_rev1d1d1d1",
            "data": {
              "quote": "The best sourdough in Bristol, and I have tried them all.",
              "author": "Sam P.",
              "source": "Google review"
            }
          },
          {
            "id": "i_rev2e2e2e2",
            "data": {
              "quote": "Cardamom buns sell out by ten. Worth the early alarm.",
              "author": "Priya K.",
              "source": "Google review"
            }
          }
        ]
      }
    },
    "assets": {
      "a_logo2k7d9m": {
        "id": "a_logo2k7d9m",
        "type": "svg",
        "source": {
          "type": "upload",
          "key": "sites/s_4k8q2m7x1p/logo.svg",
          "sha256": "0000000000000000000000000000000000000000000000000000000000000000"
        },
        "mime": "image/svg+xml",
        "alt": "Crumb & Co.",
        "licence": {"type": "client-supplied"}
      },
      "a_hero8p3l2k": {
        "id": "a_hero8p3l2k",
        "type": "image",
        "source": {
          "type": "stock",
          "provider": "unsplash",
          "providerId": "xyz123",
          "url": "https://images.unsplash.com/photo-xyz123"
        },
        "mime": "image/jpeg",
        "width": 4000,
        "height": 2667,
        "focal": {"x": 0.62, "y": 0.4},
        "alt": "Loaves of sourdough cooling on a wooden rack",
        "licence": {
          "type": "unsplash",
          "attribution": "Photo by A. Baker on Unsplash",
          "url": "https://unsplash.com/license"
        },
        "placeholder": {"color": "#b98a5e"}
      },
      "a_bake4n9k1j": {
        "id": "a_bake4n9k1j",
        "type": "image",
        "source": {
          "type": "generated",
          "generator": "surfaces",
          "version": "1.4.0",
          "params": {"seed": 81723, "color": "oklch(0.62 0.14 55)", "style": "sfumato"}
        },
        "mime": "image/webp",
        "width": 1600,
        "height": 1200,
        "decorative": true,
        "licence": {"type": "generated"}
      }
    },
    "translations": {
      "ar": {"blocks/b_hero9f3k2a/headline": {"value": "خبز يستحق الاستيقاظ مبكرًا", "sourceHash": "h1:7d9c0a"}}
    },
    "provenance": {
      "business/contact/phone": {
        "by": "import",
        "status": "confirmed",
        "source": "https://crumbandco.example/contact",
        "at": "2026-11-14T09:12:00Z"
      },
      "blocks/b_hero9f3k2a/headline": {"by": "generated", "gen": "g_01JCX4M0A1B2C3"},
      "blocks/b_hour5q2w7e/note": {"by": "user", "at": "2026-11-14T09:20:41Z"}
    }
  },
  "capabilities": {
    "forms": {
      "v": 1,
      "config": {},
      "instances": {
        "f_cake3w8e2r": {
          "fields": [
            {"id": "i_fld1m2n3b4", "name": "name", "type": "text", "label": "Your name", "required": true},
            {"id": "i_fld5v6c7x8", "name": "email", "type": "email", "label": "Email", "required": true},
            {"id": "i_fld9z0a1s2", "name": "date", "type": "date", "label": "When do you need it?"},
            {"id": "i_fld3d4f5g6", "name": "message", "type": "textarea", "label": "Tell us about the cake"}
          ],
          "submit": {"label": "Send", "deliver": "email-owner"},
          "success": "Thanks! We will reply within one working day."
        }
      }
    }
  }
}
```

### 3.3 Operations

#### Commands (what callers use)

Commands read the library, mint ids, choose defaults and compile to primitives. They are what the decision model's answers, the text model, the slow path's tools (area 3, D13), the editor and import call. A command's name and arguments are kept as the transaction's `intent`.

| Command | Compiles to | Notes |
|---|---|---|
| `addBlock(sectionType, at, {type?, variant?, content?})` | `block.add` (+ `set` provenance) | Default block and variant from the library; content may be absent (pending) |
| `removeBlock(id)` | children's `block.remove` first, then `block.remove`; `set` on links that anchored to it (anchor dropped) | |
| `moveBlock(id, to)` | `block.move` | `to` = parent + `before` |
| `replaceVariant(id, variant)` | `block.setType` (same type) | Props mapped by the manifest; content untouched |
| `replaceBlock(id, type, variant?)` | `block.setType` | Same section type only |
| `changeSectionType(id, sectionType, …)` | `block.setSectionType` | Content via the section type's mapping, else replaced |
| `duplicateBlock(id)` | `block.add` | Fresh block and item ids |
| `setBlockProps(id, patch)` / `hideBlock(id)` | `block.setProps` / `block.setHidden` | |
| `setContent(textKey, value, {source, genId})` | `set` + `set` on `/content/provenance/…` | Area 3's `slot` events land here |
| `addItem` / `removeItem` / `moveItem` | `list.insert` / `list.remove` / `list.move` | Items of section content, collections, hours, nav |
| `setImage(textKey, asset)` | `set` (+ `set` `/content/assets/a_x` for a new asset) | |
| `setTheme(patch)` | one `set` per changed key under `/style` | |
| `setBusinessFact(path, value, provenance)` / `confirmBusinessFacts(paths)` | `set` | Area 6 |
| `addPage(kind, path, blocks…)` | `page.add` + `block.add`… | Page body starts empty |
| `removePage(id)` | `block.remove`… + `page.remove` + nav `list.remove` + redirect `list.insert` | |
| `setPagePath(id, path)` | `page.set` + redirect `list.insert` | |
| `enableCapability` / `disableCapability` / `setCapabilityInstance` | `set` / `unset` under `/capabilities` | Area 6 |
| `addLocale` / `setTranslation` | `set` under `/settings/locales`, `/content/translations` | |
| `applySpec(target)` | `diffToOps(current, target)` | The Wall pick, regenerate, import: one undoable transaction |

#### Primitives (what is stored)

```ts
/* ---------------- positions and paths ---------------- */
export const Parent = z.discriminatedUnion("type", [
  z.strictObject({ type: z.literal("page"), page: PageId }),
  z.strictObject({ type: z.literal("shell"), shell: ShellId, region: z.enum(["before", "after"]) }),
  z.strictObject({ type: z.literal("slot"), block: BlockId, slot: z.string() }),
]);
export const Position = z.strictObject({ parent: Parent, before: BlockId.nullable() }); // null = append
export type Position = z.infer<typeof Position>;

// Keyed path: JSON-Pointer-like, but a segment that enters an array is an
// item id ("i_..."), never an index. Root is a partition.
export const KeyedPath = z.string().regex(/^\/(content|style|settings|capabilities|automations|integrations|extensions)(\/[^/]+)+$/);

/* ---------------- primitive operations (stored) ---------------- */
export const Op = z.discriminatedUnion("op", [
  // structure: semantic, integrity-checked
  z.strictObject({ op: z.literal("page.add"), page: Page, content: PageContent }),
  z.strictObject({ op: z.literal("page.remove"), page: PageId }),
  z.strictObject({ op: z.literal("page.set"), page: PageId, set: Page.pick({ kind: true, path: true, shell: true, hidden: true }).partial() }),
  z.strictObject({ op: z.literal("block.add"), block: Block, content: z.record(z.string(), Json).nullable(), at: Position }),
  z.strictObject({ op: z.literal("block.remove"), block: BlockId }),
  z.strictObject({ op: z.literal("block.move"), block: BlockId, to: Position }),
  z.strictObject({ op: z.literal("block.setType"), block: BlockId, type: BlockTypeId, v: z.int().min(1), variant: VariantId, props: z.record(z.string(), Json) }),
  z.strictObject({ op: z.literal("block.setSectionType"), block: BlockId, sectionType: SectionTypeId, type: BlockTypeId, v: z.int().min(1), variant: VariantId, props: z.record(z.string(), Json), content: z.record(z.string(), Json).nullable() }),
  z.strictObject({ op: z.literal("block.setProps"), block: BlockId, set: z.record(z.string(), Json) }), // null value = unset
  z.strictObject({ op: z.literal("block.setHidden"), block: BlockId, hidden: z.boolean() }),
  // generic: content, style, settings, capabilities and other behaviour keys
  z.strictObject({ op: z.literal("set"), path: KeyedPath, value: Json }),
  z.strictObject({ op: z.literal("unset"), path: KeyedPath }),
  z.strictObject({ op: z.literal("list.insert"), path: KeyedPath, item: z.record(z.string(), Json), before: ItemId.nullable() }),
  z.strictObject({ op: z.literal("list.remove"), path: KeyedPath, item: ItemId }),
  z.strictObject({ op: z.literal("list.move"), path: KeyedPath, item: ItemId, before: ItemId.nullable() }),
]);
export type Op = z.infer<typeof Op>;

export class OpError extends Error {
  code: string; detail: Record<string, unknown>;
  constructor(code: string, detail: Record<string, unknown>) { super(code); this.code = code; this.detail = detail; }
}
```

#### Validation and inverse per primitive

Preconditions are checked inside the applier; whole-document invariants after the last operation of a transaction (section 2, D16). The inverse is computed from the state just before the operation and stored with the transaction. A transaction's inverse is its operations' inverses in reverse order. Tested: applying a six-operation turn and then its inverse gives back the original document exactly [M].

| Primitive | Preconditions (error code) | Inverse |
|---|---|---|
| `page.add {page, content}` | id unused (`id_taken`); body empty (`page_body_must_start_empty`) | `page.remove` |
| `page.remove {page}` | exists; body empty (`page_not_empty`) | `page.add` with the removed page and its content |
| `page.set {page, set}` | exists | `page.set` with the old values |
| `block.add {block, content, at}` | id unused; no children yet; parent and anchor exist (`anchor_not_found`) | `block.remove` |
| `block.remove {block}` | exists; no children (`block_has_children`) | `block.add` with the block, its content and its old position (parent + next sibling) |
| `block.move {block, to}` | exists; anchor exists and is not itself (`anchor_is_self`) | `block.move` back to the old position |
| `block.setType {block, type, v, variant, props}` | exists; at commit: the block type implements the block's section type, the variant exists, props pass the manifest | `block.setType` with the old values |
| `block.setSectionType {block, sectionType, type, v, variant, props, content}` | exists; at commit: content valid for the new section type | `block.setSectionType` with the old values and old content |
| `block.setProps {block, set}` (`null` unsets) | exists | `block.setProps` with old values (`null` where absent) |
| `block.setHidden {block, hidden}` | exists | `block.setHidden` with the old value |
| `set {path, value}` | path in `content`, `style`, `settings` or a behaviour key; not a block's content root (`use_block_ops`); under `/content/blocks/b_x/…` the block exists (`block_not_found`); array segments resolve (`item_not_found`) | `set` with the old value, or `unset` if there was none |
| `unset {path}` | exists; not an array item (`use_list_remove`) | `set` with the old value |
| `list.insert {path, item, before}` | item has a fresh `i_` id (`bad_item_id`); anchor exists | `list.remove` |
| `list.remove {path, item}` | item exists | `list.insert` with the old item before its old next sibling |
| `list.move {path, item, before}` | item and anchor exist | `list.move` back before the old next sibling |

#### Transactions and history

```ts
type VersionId = string; // ULID

interface Transaction {
  id: string;                          // txId, ULID; idempotency key for the write (areas 4, 5)
  base: VersionId;                     // the version the author saw; stale base → 409 and reload in M1
  ops: Op[];
  inverse: Op[];                       // computed by applyTransaction
  author: {
    kind: "user" | "decision-model" | "text-model" | "slow-path" | "import" | "migration" | "system";
    userId?: string;
    model?: string;                    // provider/model id
    genId?: string;                    // area 3 generation record
  };
  turn?: string;                       // all transactions of one chat turn: one undo step
  intent?: { command: string; args?: Json; message?: string }; // what was asked, for the history panel
  undoOf?: VersionId;
  redoOf?: VersionId;
}

interface Version {
  id: VersionId;
  siteId: string;
  branch: string;                      // "main"
  seq: number;                         // server-assigned order within the branch (area 5's seq/baseSeq)
  parents: VersionId[];                // 1 normally, 2 for a merge, 0 for the first version
  specVersion: number;
  txn: Transaction | null;             // null when the version is a snapshot only (import, merge, batch migration)
  snapshot?: string;                   // storage key; every 50–100 versions, and on labels, publishes, merges
  specHash: string;                    // sha256 of RFC 8785 canonical JSON of the spec after this version
  label?: string;                      // named version
  at: string;
}

interface SiteHead {
  siteId: string;
  branches: Record<string, VersionId>;
  published?: { version: VersionId; at: string };
}
```

#### What blocks and section types declare (requirement on area 2)

```ts
interface SectionTypeDef {
  id: string;                                   // "hero"
  label: string;                                // "Hero"
  content: z.ZodObject;                         // fields registered in fieldMeta (label, min/max chars, hint)
  fallbackBlock: `${string}/${string}`;         // always renderable
  facts?: string[];                             // business paths it renders, e.g. ["hours", "contact.address"]
  collectionKinds?: string[];                   // which collections its `source` may point at
  transforms?: Record<string, (c: Json) => Json | null>; // content mapping to another section type
}

interface BlockManifest {
  type: `${string}/${string}`;                  // "core/hero-split"; namespaces: core, foundry, site
  v: number;                                    // current major
  sectionType: string;
  variants: { id: string; fit: string; signature: Record<string, string> }[];
  props: z.ZodObject;                           // layout-class only: enums, booleans, small ints; all defaulted
  uses: { required: string[]; optional: string[] }; // section-type field names it shows
  requires?: string[];                          // capability ids (area 6)
  migrations?: { from: number; migrate(old: { props: Json; variant: string }): { props: Json; variant: string } }[];
  status?: "active" | "deprecated" | { retiredTo: { type: string; v: number; variant: string; props: Json } };
}

interface Problem {
  code: string;                                 // "content_invalid", "broken_link", "content_pending"…
  path: string;                                 // keyed path
  message: string;                              // plain words for a person
  severity: "error" | "blocker" | "warning";
  expected?: Json;
  hint?: string;                                // for a model: what would be valid
}
```

#### The package API

One pure TypeScript package with no DOM or Cloudflare imports, used in the browser, in Workers and in Node:

`SiteSpec` (schema and types) · `applyTransaction(spec, ops) → {ok: true, spec, inverse} | {ok: false, problems: Problem[]}` (never throws, as area 5 asked; the experiment's version throws) · `summarize(before, after) → string[]` (area 5's `diffSummary`) · `checkInvariants(spec) → Problem[]` · `migrate(raw) → SiteSpec` · `outline(spec) → {id, page, sectionType, type, variant, label}[]` · `specHash(spec)` (SHA-256 of RFC 8785 canonical JSON) · `diffSpecs(a, b) → Change[]` and `describe(change)` · `diffToOps(a, b) → Op[]` · `crossBreed(layout, style, content)` · `layoutGenome(spec)` / `styleGenome(spec)` · `toJsonRenderSpec(spec, pageId, locale)` · `toJsonPatch(ops, before)` · `mintId(prefix, seed?)`.

### 3.4 Cross-breeding (tested)

```ts
/* ---------------- cross-breeding ---------------- */
// layout = structure; style = style; content = content + settings + capabilities + siteId.
// Pure: same inputs, same output.
export function crossBreed(L: SiteSpec, S: SiteSpec, C: SiteSpec): SiteSpec {
  const out: SiteSpec = clone({
    ...C, // siteId, settings, capabilities, meta come from the content source (the business)
    structure: L.structure,
    style: S.style,
    content: { ...C.content, pages: {}, blocks: {} },
  });
  // 1. match pages by kind, then by order of appearance
  const pageMap = new Map<string, string>(); // C page id -> L page id
  const used = new Set<string>();
  for (const lp of sortedPages(L)) {
    const cp = sortedPages(C).find((p) => p.kind === lp.kind && !used.has(p.id));
    if (cp) { used.add(cp.id); pageMap.set(cp.id, lp.id); out.content.pages[lp.id] = clone(C.content.pages[cp.id]); }
    else out.content.pages[lp.id] = clone(L.content.pages[lp.id]); // borrowed; flagged by diff/provenance
  }
  // 2. match nodes by kind: same matched page first, then anywhere (shells count as one page)
  const cNodesByPage = nodeOrder(C);
  const taken = new Set<string>();
  const nodeMap = new Map<string, string>(); // C node id -> L node id
  for (const [lPage, lNodes] of nodeOrder(L)) {
    const cPage = [...pageMap].find(([, l]) => l === lPage)?.[0] ?? lPage;
    for (const ln of lNodes) {
      const kind = L.structure.blocks[ln].sectionType;
      const pick = (ids: string[]) => ids.find((id) => !taken.has(id) && C.structure.blocks[id].sectionType === kind);
      const cn = pick(cNodesByPage.get(cPage) ?? []) ?? pick([...cNodesByPage.values()].flat());
      if (!cn || C.content.blocks[cn] === undefined) continue; // pending: the text pipeline fills it
      taken.add(cn);
      nodeMap.set(cn, ln);
    }
  }
  // 3. copy matched content, remapping page and anchor references into L's ids
  for (const [cn, ln] of nodeMap) out.content.blocks[ln as never] = remapLinks(clone(C.content.blocks[cn as never]), pageMap, nodeMap) as any;
  return out;
}
function sortedPages(x: SiteSpec): Page[] {
  return Object.values(x.structure.pages).sort((a, b) => a.path.localeCompare(b.path));
}
function nodeOrder(x: SiteSpec): Map<string, string[]> {
  const m = new Map<string, string[]>();
  const shellIds = Object.values(x.structure.shells).flatMap((sh) => [...sh.before, ...sh.after]);
  m.set("shell", shellIds);
  for (const p of sortedPages(x)) m.set(p.id, p.body);
  return m;
}
function remapLinks(v: unknown, pageMap: Map<string, string>, nodeMap: Map<string, string>): unknown {
  if (Array.isArray(v)) return v.flatMap((x) => {
    const r = remapLinks(x, pageMap, nodeMap);
    return r === DROP ? [] : [r];
  });
  if (v && typeof v === "object") {
    const o = v as AnyObj;
    if (o.type === "page" && typeof o.page === "string") {
      const to = pageMap.get(o.page);
      if (!to) return DROP; // link to a page the layout does not have
      const anchor = o.anchor ? nodeMap.get(o.anchor) : undefined;
      return anchor ? { ...o, page: to, anchor } : { type: o.type, page: to };
    }
    const r: AnyObj = {};
    for (const [k, x] of Object.entries(o)) { const y = remapLinks(x, pageMap, nodeMap); if (y !== DROP) r[k] = y; }
    // a nav item whose link was dropped is dropped by the array branch above
    if ("label" in r && "id" in r && !("to" in r) && "to" in o) return DROP;
    return r;
  }
  return v;
}
const DROP = Symbol("drop");
```

---

## 4. What to defer

**Build in M0** (the speed spike), and nothing more:
- The `SiteSpec` v1 schema with the 10–15 section types the M0 blocks need, `specVersion: 1`, and the migration runner with zero migrations (so the path exists).
- `applyTransaction` with all 15 primitives and their inverses, `checkInvariants`, `outline`, `specHash`, `mintId`.
- The commands M0 uses: `addBlock`, `removeBlock`, `moveBlock`, `replaceVariant`, `setContent`, `setTheme`, `applySpec`.
- `crossBreed` and `diffSpecs` (both small, and The Wall needs the first).
- In-memory undo and redo by turn. Versions stored as plain snapshots with `parents` and `author` fields.
- A property test (for example with fast-check): random valid operation sequences, apply then inverse equals the original, invariants always hold.

**Defer, with the reason it is safe:**

| Deferred | Why it can wait |
|---|---|
| CRDT, real-time multiplayer, presence | Primitives are id-addressed; a server-ordered transport can be added without format changes (D21) |
| Branch UI, merge, time slider | `parents[]` and snapshots are stored from day one; merge needs only snapshots |
| Operation-log compaction and retention rules | Snapshots are authoritative; compaction only deletes |
| `toJsonPatch` and SpecStream | The preview can take whole snapshots (a 9 KB object) until measured otherwise |
| Fractional indexing | Anchors work with a central server |
| Translations UI, translated slugs, hreflang | The overlay shape is fixed; filling it is additive |
| Large collections in the site store | `source: {capability: "cms"}` is reserved |
| Container blocks (`slots`), `visible`, `on`, automations, permissions | Reserved names and invariants exist; v1 library uses none |
| Character-level rich-text merging | Rich text is replaced as one value |
| Re-import from exported code | `data-block` ids are emitted from the first export (area 2/4) |
| Batch migration runner for stored sites | Needed at the first block major; on-read migration covers the gap |

**Do not build at all for now:** a generic "custom" section type with free fields, free CSS or HTML fields, per-locale structure, expressions in content (`$template`, `$cond`, `$computed`), inline fact references inside text.

---

## 5. Requirements on the other five areas

**Area 2: blocks, themes, rendering.**
1. Every block type implements exactly one section type and declares `uses.required` and `uses.optional`. No block-private content fields; propose an optional field on the section type instead.
2. Layout props are enums, booleans or small integers, each with a default, declared in the manifest's Zod schema. No text, colours, sizes or URLs in props.
3. Block majors ship `migrations`; minors must render every stored instance of their major (CI against fixtures and a sample of stored instances). Every section type names a `fallbackBlock`.
4. The renderer is a pure function of `(spec, pageId, locale)`. It never throws for one bad block: unknown block → fallback; invalid content → placeholder; absent content → skeleton.
5. Every block root carries `data-block="<blockId>"`; every text slot carries its text key, so the editor and comments can address it.
6. Style is compiled from choices (`family@major`, axis option ids) to tokens; families version like blocks. Brand colours are read from `content.business.brand` when `palette.useBrandColors` is true.
7. Hard facts render from `content.business` and collections, never from text slots.
8. Supply a "layout signature" per variant for The Wall's distance, as area 3 asked.

**Area 3: decision and text pipeline.**
1. Emit commands; the shared package compiles and applies them. Never mint ids; never emit raw JSON Patch.
2. The text writer addresses slots by text key (`blocks/b_x/headline`, `blocks/b_x/items/i_y/title`) and writes through `setContent` with `source` and `genId`. Area 3's `slot` event `{blockId, slot}` maps to that key with `slot` as the path inside the block's content.
3. One chat turn is one `turn` id. Streamed text updates coalesce into that turn.
4. Treat `Problem[]` as the tool result and retry; never bypass the applier.
5. For The Wall, build one content source for the union of section types and call `crossBreed`; read `content_pending` to know which text is still missing.

**Area 4: repository, runtime, storage, hosting.** (Its own asks on this area are met: pure applier and validator with no `cloudflare:*`, `node:*` or React imports; JSON operations with a `txId`; canonical JSON and `specHash`; `specVersion` with migrations; reject a stale base in M1. One caveat: a `block.add` carrying a large block's content, or an `applySpec` diff, can exceed its 1 KB-per-operation target.)
1. Store versions append-only (`Version`, `Transaction`, snapshots, `SiteHead`), never mutate one. Version and transaction ids are ULIDs; insert is idempotent by transaction id; `seq` is assigned by the server per branch. Area 5's `ops(siteId, branchId, seq, id, txn, actor, op, at)` table is a valid physical layout of the same records.
2. Publishing points at a version and freezes its rendered output; a library release never changes a live site until the next publish.
3. Run the migration batch (dry run with diff report, then write as `migration` transactions).
4. Size budget: warn at 256 KB of spec JSON, refuse above 2 MB [P]; move large collections to the site store.
5. Physical splitting of `content.business` and `content.collections` into their own rows is allowed if the logical document and its single history are preserved.
6. Export writes the spec, its JSON Schema and the history labels, with `data-block` ids in generated code.

**Area 5: editor client and The Wall.** (Its asks are met: a pure applier that returns the inverse and never throws; id-addressed operations with item ids and no array indices; one slot address format, the text key, shared by blocks, operations, selection and chat; per-operation validation with a plain reason; a one-sentence summary per transaction. One difference: anchors are "before id" (with `null` for the end), matching the DOM's `insertBefore` and json-render's composer, not "after id".)
1. Every user action is a command. Selection is a block id plus an optional text key, never a DOM path. The `data-slot` and `data-item` markers area 5 asked of area 2 carry text-key segments.
2. Undo and redo use stored inverse transactions by turn; typing coalesces after 1.5 s idle; a failed undo names the block that changed.
3. The history panel shows `describe(diffSpecs(a, b))` plus the transaction's intent.
4. Rich-text editing maps Tiptap JSON to the spec's paragraph-and-span shape and writes the whole field.
5. Cross-breeding in the browser calls the shared `crossBreed`; "pick this site" calls `applySpec`.

**Area 6: apps, forms, foundry.** I adopted its reserved keys (`siteId` ULID, `capabilities`, `automations`, `permissions` empty in v1, `integrations`, `extensions` with `x-` keys), its operations (as commands compiling to `set`/`unset`), its validator rejections, its money, phone and hours primitives, and its rule that hard facts are bound. Requirements back:
1. Collection item schemas per collection kind, and the business field schema, as Zod objects registered with field metadata.
2. Capability configs and instances reference spec objects by id (form instance `f_x`, collection `c_x`, route by page id), never by path or index. Form labels are content and get text keys.
3. Foundry blocks satisfy the same manifest contract under the `foundry/` namespace. A new section type is an additive registry release, never a per-site invention.

**Disagreements with earlier reports, for the founder or lead to settle:**
- **Storage of operations.** `CLAUDE.md` and report 03 say operations are "stored as JSON patches"; area 6 says its operations "are ordinary JSON patches". I store id-addressed primitives and derive JSON Patch (D9). The generic `set`, `unset` and `list.*` primitives are close to keyed JSON Patch, so area 6's operations map one to one.
- **Where business facts live.** Area 6 recommends a sibling `business.json`; I keep them inside the logical spec and allow physical splitting (D8).
- **`Sourced<T>` versus a side map.** Same information; I place status and evidence in `content.provenance` so values stay plain (D19).
- (Minor) `specVersion` is an integer, not a string.

---

## 6. Questions for the founder

1. **Should live sites pick up library improvements automatically?**
   - *Frozen until the owner republishes* (recommended default). Cost: live sites keep old bugs and old polish until someone presses publish; an "Improvements available" notice is needed.
   - *Republished automatically* for patch and minor releases. Cost: a visual change can surprise an owner; needs a visual-diff gate per site before republishing, and a per-site opt-out.
2. **Is there ever an escape hatch for custom code or CSS?**
   - *Never in the spec.* Cost: some users leave for code export or other tools; the library and foundry must cover the gap.
   - *A sandboxed "custom block"* (HTML/CSS/JS in an isolated island, the draft tier of foundry blocks, report 06 A4). Cost: the block cannot be restyled, cross-bred, checked or chosen by the model; security and support work.
3. **How much history is kept?**
   - *Every edit forever.* Cost: storage grows with edits (small per transaction, but unbounded); enables a full time slider.
   - *Every edit for 30 days, then named versions, publishes and one snapshot per day.* Cost: old fine-grained undo is lost.
4. **Can a page differ by language** (a section shown only in Arabic, a page only in French)?
   - *No, translations only* (recommended for v1). Cost: some multilingual businesses cannot express local differences.
   - *Yes.* Cost: per-locale structure, more complex diffs, merges and cross-breeding.
5. **On The Wall, when you take another site's colours, do your own brand colours survive?**
   - *Brand wins* (the user's logo colours keep driving the palette unless they turn it off). Cost: less visual variety for businesses with a brand.
   - *Palette wins.* Cost: the result may clash with the logo.
6. **Will blogs or shops with hundreds to thousands of items arrive in the first year?** If yes, collections move to the site store early (area 6's CMS capability) and the spec only references them. If no, inline collections up to 500 items are enough for a long time.

---

## 7. Risks

1. **The section-type taxonomy is wrong (the biggest risk).** Section types are the shared contract between content, blocks, The Wall and cross-breeding. Too coarse, and blocks need private fields; too fine, and cross-breeding finds no matches and content does not survive block swaps. *Mitigation:* start with 25–40 types written from real sites in the first five verticals; allow only additive changes without a `specVersion` bump; write `transforms` between neighbouring types; review the list with a few dozen real business sites before M1.
2. **Building too much before M0.** The design has history, migrations and locales. *Mitigation:* the M0 subset in section 4; everything else is reserved, not built.
3. **Bugs in inverses or the applier corrupt history.** *Mitigation:* the property test in section 4; snapshots authoritative; `specHash` checked on load.
4. **Migration debt** as block majors accumulate. *Mitigation:* the nightly batch removes old majors; CI renders every stored instance sample on each minor.
5. **Divergence from json-render.** The forked composer and any use of its renderer need the adapter maintained. *Mitigation:* the adapter is one function with a golden test per section type.
6. **Valid but unintended edits.** Validation cannot catch "the model moved the wrong section". *Mitigation:* readable diffs after every turn and one-step undo by turn.
7. **Valid but ugly cross-breeds.** *Mitigation:* area 2's adjacency rules and area 5's gates run on the result; the spec layer only guarantees validity.
8. **Spec growth** from provenance, translations and collections. *Mitigation:* the size budget in section 5; large collections move to the site store.

---

## 8. Not verified

- **Webflow and Framer storage formats.** Not studied at a primary source; nothing in this report depends on them.
- **Storyblok** beyond its content type (`_uid`, `component`, `_editable` [V `storyblok-js-client/src/interfaces.ts`]); its field-level translation mechanism was not read.
- **Shopify theme updates**: how stored settings are carried over when a theme version removes or renames a setting. The theme-updates page returned "Page not found" at the `.md` URL.
- **Builder.io's own regrets** about free CSS and code bindings: my inference from its type definitions, not a statement by Builder.io.
- **RFC 8785** (JSON Canonicalization Scheme) is cited from knowledge, not re-read.
- **Yjs move support**: judged from open issue titles (#357, #694, #475), not from the v14 source.
- **Timings** come from one machine and one 9 KB spec; a 6-page site with 40 blocks was not measured. The batch-migration time for 10,000 sites is an estimate.
- **Id collision odds** are arithmetic, not measured.
- **Section-type list size** (25–40) and the provenance size per entry are judgements.
- **Other areas.** I read the requirement sections of areas 3, 4, 5 and 6 and aligned with them; I did not read the rest of areas 4 and 5. Area 2's report did not exist when I finished, so the requirements on it may duplicate or conflict with its design.
