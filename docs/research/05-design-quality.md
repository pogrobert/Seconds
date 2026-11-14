# 05 — The design quality engine: a recipe

Research date: 13 November 2026. Scope: how to make a JSON-spec website builder (catalog of blocks, themes and variants rendered by deterministic code) produce output that looks designer-made for any business, content, brand color and viewport, without two users getting the same site.

**Evidence labels used throughout**

- **[verified]**: primary source read (paper, official docs, repo, or the vendor's own page for a vendor's own product).
- **[reported]**: secondary source, vendor marketing about something not inspectable, or a search-snippet summary I could not open in full.
- **[proposal]**: my own design or estimate. Numbers marked this way are engineering estimates, not measurements.

---

## 0. The short answer

1. **Taste lives in a constrained parameter space, not in the generator.** Every system that reliably looks good (Material 3, Radix Themes, Linear, Squarespace Blueprint, Wix) lets the user or AI move only along a few curated axes. The axes generate a full token set through deterministic math. Linear replaced 98 per-theme variables with 3 inputs (base color, accent, contrast) in LCH, which made themes "consistently good-looking … regardless of which base colors are used" [verified, [Linear](https://linear.app/blog/how-we-redesigned-the-linear-ui)]. Radix Themes exposes five axes: accent (26 options), gray, radius (5), scaling (5) and panel background (2) [verified, [Radix Theme docs](https://www.radix-ui.com/themes/docs/components/theme), [theme.props.d.ts](https://cdn.jsdelivr.net/npm/@radix-ui/themes@3.2.1/dist/cjs/components/theme.props.d.ts)].
2. **Variety comes from crossing a few strongly perceptible axes**, such as type pairing, color strategy, imagery treatment, layout and grid, density and shape, plus seeded procedural imagery. More independent knobs do not add variety. Coherence is enforced by making most axes *conditional on a theme family*.
3. **Robustness is authored into blocks, not judged afterwards.** Each block declares content ranges, fit predicates and fallbacks. Text is measured before render, with Pretext or canvas, so the spec model picks only variants that fit. Container queries, `clamp()`, `text-wrap`, logical properties and intrinsic grids do the rest.
4. **Gates are cheap and mostly deterministic.** Contrast, overflow, orphans, line length, tap targets, crops and rhythm are code checks on a rendered DOM. Learned scorers (UIClip, saliency) and a VLM judge only rank survivors. Published evidence says off-the-shelf VLMs agree with designers no better than about 0.55 macro agreement ([TASTE](https://arxiv.org/html/2605.20731)). Use them as defect detectors, not as arbiters of taste.
5. **20 candidates → best 3 is affordable.** About $0.01–0.02 per site and 3–7 s wall time with a warm browser pool [proposal, cost arithmetic in §4.5]. The first site can still appear in about 1 s: show the best spec-time candidate immediately and swap in the gated ranking when it lands.
6. **"Every seed looks good" is provable statistically.** Use property-based fuzzing over content × brand color × viewport × seed, with zero hard-gate failures in N runs. By the rule of three, that bounds the failure rate at about 3/N. Add a periodic human-rated sample for the soft "looks designed" bar.

---

## 1. How taste is encoded in systems that work

### 1.1 What the leading ecosystems actually parameterize

| System | How a "style" is encoded | Axes exposed | Evidence |
|---|---|---|---|
| **Material 3 / Material Color Utilities (MCU)** | One seed color → HCT (hue, chroma, tone) tonal palettes → role-based scheme (primary, on-primary, container, surface…). Contrast is guaranteed by *tone distance*: a tone difference of 50 gives at least 4.5:1, and 40 gives at least 3:1. A final pass adjusts foreground tone if a target is missed. | Seed color + scheme variant: TonalSpot, Vibrant, Expressive, Fidelity, Content, Neutral, Monochrome, Rainbow, FruitSalad (9 variants) + contrast level | [verified] [Material blog "Science of Color & Design"](https://material.io/blog/science-of-color-design); scheme files in [MCU repo](https://github.com/material-foundation/material-color-utilities) (Apache-2.0) |
| **Radix Themes** | Theme provider props cascade to every component | accentColor (26), grayColor (6 + auto), radius (none/small/medium/large/full), scaling (90–110%), panelBackground (solid/translucent), appearance | [verified] [Theme docs](https://www.radix-ui.com/themes/docs/components/theme); MIT ([repo](https://github.com/radix-ui/themes)) |
| **Radix Colors** | 12-step scales, each step with a defined *job*: 1–2 backgrounds, 3–5 component states, 6–8 borders, 9–10 solid, 11–12 text. A custom-palette tool builds a scale from one brand color. | Accent scale + gray scale | [verified] [Radix custom palettes](https://www.radix-ui.com/colors/docs/overview/custom-palettes), [composing a palette](https://www.radix-ui.com/colors/docs/palette-composition/composing-a-palette); MIT ([repo](https://github.com/radix-ui/colors)) |
| **Linear** | 3 inputs (base, accent, contrast) in LCH generate 98 variables; high-contrast themes come free | 3 continuous inputs | [verified] [Linear blog](https://linear.app/blog/how-we-redesigned-the-linear-ui) |
| **Stripe** | Built its own perceptually uniform (CIELAB) palette tool so every hue at the same step has the same contrast | Hue × step | [verified] [Stripe: Designing accessible color systems](https://stripe.com/blog/accessible-color-systems) |
| **shadcn/ui + tweakcn** | About 30 CSS variables (background, foreground, card, primary, secondary, muted, accent, destructive, border, input, ring, chart-1…5, sidebar-*, radius) in `:root` and `.dark`, exposed through Tailwind v4 `@theme inline`. tweakcn adds a visual editor, presets, fonts and shadows. Its README states the problem plainly: "Websites made with shadcn/ui famously look the same." | Color roles, radius, fonts, shadow | [verified] [shadcn theming](https://ui.shadcn.com/docs/theming); [tweakcn repo](https://github.com/jnsahaj/tweakcn) (Apache-2.0) |
| **Squarespace Blueprint AI** | A brand-personality questionnaire → *designer-curated* font pairings and palettes for that personality. Chosen sections are arranged "in a variety of different ways". Output opens in Fluid Engine. | Personality, palette, font pairing, sections | [reported] [Squarespace blog](https://www.squarespace.com/blog/blueprint-ai-website-builder), [WebsiteBuilderExpert review](https://www.websitebuilderexpert.com/website-builders/squarespace-blueprint-ai/) |
| **Relume** | Prompt → sitemap → wireframes assembled from a component library with real copy → style guide (colors, type pairing, button, card and image treatments) → export to Figma, Webflow or React | Structure first, style last | [reported] [relume.io](https://relume.io/), [style guide page](https://www.relume.io/style-guide) |
| **Wix Harmony (Jan 2026)** | Agent "Aria" + editor. A Theme Assistant keeps the design system consistent as sections are added. Reviews say it draws on curated color/type combinations and per-vertical page structures. | Theme, brand kit, per-vertical structures | [reported] [Wix press release via Nasdaq](https://www.nasdaq.com/press-release/wix-launches-wix-harmony-ai-website-builder-merges-human-and-artificial-intelligence), [TechRadar on theme assistant](https://www.techradar.com/pro/website-building/wix-unveils-ai-powered-tool-for-website-theme-customization), [Wix blog](https://www.wix.com/blog/what-is-the-wix-ai-website-builder) |
| **Webflow** | Variables are design tokens: colors, sizes and fonts referenced by classes | Free-form tokens | [verified] [Webflow variables docs](https://developers.webflow.com/flowkit/variables/overview) |
| **Google Stitch DESIGN.md** | YAML tokens (colors, typography roles, rounded, spacing) + prose rationale ("Architectural Minimalism meets Journalistic Gravitas"). Has a linter with WCAG checks. | Tokens + intent prose | [verified] [google-labs-code/design.md](https://github.com/google-labs-code/design.md) (Apache-2.0) |
| **Framer templates, Tailwind Plus** | Hand-designed whole templates and component kits. Taste is in the artifact, not a parameter system. | Template choice | [verified existence] [Framer Wireframer](https://www.framer.com/wireframer/), [Tailwind Plus](https://tailwindcss.com/plus). I did not find a public description of their internal parameterization. |

**Lessons from failures.** The Grid promised an AI designer but limited sites to "a few choices of layout and color". It drew poor satisfaction, and customer sites were shut down in March 2019 [reported] ([CMSWire](https://www.cmswire.com/digital-experience/the-grid-ai-powered-website-builder-doesnt-check-enough-boxes/), [SiteBuilderReport](https://www.sitebuilderreport.com/blog/the-grid-a-much-hyped-ai-website-builder-is-near-industry-low-in-customer-satisfaction), [PageCloud](https://pagecloud.com/blog/what-happened-to-the-grid)). Today's "AI slop" critique of code-writing builders names Inter or Roboto type, purple-to-indigo gradients, a centered hero with a CTA, and three rounded icon cards. Critics attribute it to models drifting toward the statistical middle of their training data [reported] ([superdesign](https://superdesign.dev/blog/why-ai-design-looks-generic), [prg.sh](https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website)). One audit reportedly found about 21% of 500 Show HN sites carried five or more slop markers [reported, secondary aggregator] ([aiproductivity.ai](https://aiproductivity.ai/news/ai-design-slop-show-hn-analysis/)). One anti-slop playbook warns that "the failure mode of every anti-slop effort is replacing one default look with another" ([claudecodehq](https://claudecodehq.com/playbooks/unslop-ui)). That warning matters for us: a curated catalog has to avoid a *house look*, not just the AI look.

I could not find the practitioner post about six curated "theme families" through search, so that specific claim is unverified. The pattern itself is what Squarespace (personality → curated pairings) and Radix (small closed axes) do.

### 1.2 The real parameters of a "style"

Pulling these systems together, a complete style has these parameter groups. "Perceptual weight" is how much the axis changes the gestalt. It is my judgment [proposal], informed by which axes the vendors above chose to expose.

| Group | Parameters | Perceptual weight |
|---|---|---|
| Typography | Display/body pairing, scale ratio, heading weight, case and tracking, body size and measure, numeral style | **Very high** |
| Color | Brand hue, palette strategy (monochrome tint, neutral + accent, brand-flood, duotone, dark-first), neutral temperature, chroma level, contrast level, surface alternation | **Very high** |
| Imagery | Source (photo, procedural art style, illustration, none/typographic), frame (full-bleed, inset, rounded, masked), treatment (duotone, grain, natural) | **Very high** |
| Layout / grid | Alignment (centered, left editorial, asymmetric split), max width, columns, section variant choice, hero archetype | **High** |
| Shape | Radius family (0, 2, 6, 12, pill), border vs. shadow elevation, button style | Medium-high |
| Density | Spacing scale step (compact, regular, airy), section padding, scaling factor | Medium |
| Ornament | Eyebrow labels, rules/dividers, numbering, grain, pattern backgrounds | Medium |
| Iconography | Set and weight (outline thin or regular, duotone, filled, none) | Low-medium |
| Motion | Preset (none, fade, rise-stagger, spring, editorial reveal), duration and easing tokens | Low (static), medium (live) |

**How many independent axes?** Radix gets wide coverage from 5 axes, Linear from 3 continuous ones, and Material from seed + 9 variants + contrast. My recommendation is **about 6–8 salient axes that users perceive, plus about 6 secondary axes conditioned on them** [proposal]. Fully independent axes are where coherence breaks: a pill radius with brutalist type, or airy density with editorial dense grids. The fix is a *family* layer that sets the allowed sub-range of every other axis (§9.1).

---

## 2. Parametric design systems: full token sets from few inputs

### 2.1 Color

**Color space.** Use OKLCH (CSS-native) for authoring and interpolation, and HCT where you want Material's tone-to-contrast guarantee. Both are perceptual: equal steps in L or T look equal across hues, which HSL cannot do. Stripe, Linear and Material all reached this conclusion independently [verified] ([Stripe](https://stripe.com/blog/accessible-color-systems), [Linear](https://linear.app/blog/how-we-redesigned-the-linear-ui), [Material](https://material.io/blog/science-of-color-design)). For background, see [Evil Martians: OKLCH in CSS](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl).

**From one brand color to a full scheme (recommended recipe)** [proposal, built from verified components]:
1. Parse the brand color to OKLCH. Classify it by lightness and chroma: near-black, near-white, neon, muddy or normal. Pathological colors such as pure yellow `#FFFF00`, near-black navy and neon green get special handling. The brand color is used *as-is* only where contrast allows, for example on a solid button with a computed on-color. Elsewhere a tone-shifted sibling stands in.
2. Generate a 12-step accent scale with fixed *jobs* per step (Radix model). Step 9 is anchored at the brand color, and the other steps are solved to contrast targets against the background. Leonardo does exactly this: "colors by target contrast ratio", WCAG 2 or APCA [verified] ([adobe/leonardo](https://github.com/adobe/leonardo), Apache-2.0).
3. Derive the neutral scale from the brand hue at very low chroma (0.005–0.02), with temperature shifted ±10–20° by family: warm families toward yellow, cool toward blue. This single trick removes most of the "default gray" look.
4. Choose a **palette strategy**, a discrete axis analogous to MCU's scheme variants: monochrome-tint, neutral + accent, brand-flood (brand as section background), duotone (brand + complement or analog at hue ±30–150°), or dark-first.
5. Dark mode: regenerate rather than invert. Use the same hue and chroma curves, a mirrored tone ladder, chroma reduced at low lightness, and elevation expressed by *lighter* surfaces (Linear's elevation logic, [verified](https://linear.app/blog/how-we-redesigned-the-linear-ui)).
6. Gate: check every declared foreground/background role pair. WCAG 2.x is the legal floor. APCA is an optional perceptual advisory.

**Contrast standards, as of November 2026.** WCAG 2.2 AA is what laws reference. APCA was moved out of the WCAG 3 draft for further evaluation. Secondary sources say the September 2026 draft lists the contrast algorithm as "yet to be determined" [reported] ([lavawall](https://lavawall.com/wcag-3-readiness/), [liberogic](https://www.liberogic.jp/en/topics/20260914-wcag3/), [webability](https://www.webability.io/blog/wcag-3-0-explained)). **License caution:** the official `apca-w3` package carries a limited W3/AGWG license, not an OSI license, and restricts the APCA trademark [reported] ([Myndex/apca-w3](https://github.com/Myndex/apca-w3), [license file](https://www.github.com/Myndex/SAPC-APCA/blob/master/LICENSE.md)). Use WCAG 2 for gates and treat APCA as advisory, or use it through Leonardo or colorjs.io after a legal review.

**Libraries (licenses checked through the GitHub API, Nov 2026):**

| Library | Use | License |
|---|---|---|
| [material-color-utilities](https://github.com/material-foundation/material-color-utilities) | HCT, tonal palettes, 9 scheme variants, image quantization (palette from user photo) | Apache-2.0 [verified] |
| [adobe/leonardo](https://github.com/adobe/leonardo) | Scales solved to target contrast (WCAG 2 / APCA) | Apache-2.0 [verified] |
| [culori](https://github.com/danburzo/culori) | OKLCH conversion, gamut mapping, interpolation, difference metrics | MIT [verified] |
| [color.js](https://github.com/color-js/color.js) | By the CSS Color spec editors; contrast algorithms including APCA, gamut mapping | MIT [verified] |
| [radix-ui/colors](https://github.com/radix-ui/colors) | Reference 12-step scales and step semantics | MIT [verified] |

### 2.2 Typography

- **Fluid type scale.** Utopia computes a min/max viewport × min/max base size × two ratios scale and emits `clamp()` tokens. It can also emit relative to the *container*, which matters for blocks [verified] ([utopia-core](https://github.com/trys/utopia-core), ISC; [postcss-utopia](https://utopia.fyi/blog/postcss-utopia) MIT; [calculator](https://utopia.fyi/type/calculator/)).
- **Ratios by family** [proposal]: product/UI families use 1.2→1.25; editorial/luxe use 1.25→1.5 or 1.618 at desktop. A *display override* lets hero headlines exceed the scale in editorial families.
- **Pairing.** Hand-curate first: about 40–60 vetted pairings, each tagged with families, scripts covered, x-height match, available weights and license. Data-driven pairing research exists. "Visual Font Pairing" (Jiang, Wang, Hertzmann et al.) learns asymmetric pair compatibility from millions of PDF pages and notes that designers pair *contrasting* fonts, not similar ones [verified] ([arXiv 1811.08015](https://arxiv.org/abs/1811.08015)). Fontjoy embeds about 1,883 Google Fonts and pairs by a contrast/similarity distance [verified repo] ([fontjoy](https://github.com/nullnotfound/fontjoy)). Use embeddings to *expand and audit* the curated list and to map extracted fonts to the nearest open font (§6), not to pick pairings live.
- **Avoid the slop fonts as defaults.** Critics list Inter, Roboto, Geist, Plus Jakarta Sans, Space Grotesk and Fraunces as over-used [reported] ([zeli/HN thread](https://zeli.app/story/49867038), [superdesign](https://superdesign.dev/blog/why-ai-design-looks-generic)). They can stay in the catalog, but none should be the modal choice.
- **Fonts delivery.** [Fontsource](https://github.com/fontsource/fontsource) (MIT packaging; fonts carry their own mostly OFL licenses) gives self-hosting. Subset per site and per script.
- **Multilingual.** Every pairing needs declared script coverage: Latin-ext, Cyrillic, Greek, Arabic, Hebrew, Devanagari, CJK, Armenian, Georgian. When the content's script isn't covered, fall back to a family-matched Noto face. This is a hard constraint in the solver.

### 2.3 Spacing, radius, shadow

- **Spacing:** a geometric step scale (for example 4·1.5ⁿ or the Utopia "space pairs"), fluid with `clamp()`, with a density multiplier per family (Radix's scaling 90–110% is a production example [verified](https://www.radix-ui.com/themes/docs/components/theme)). Section padding is its own token pair (block-start and block-end), so section rhythm can alternate.
- **Radius:** five values (0, 2–4, 6–8, 12–16, pill), as in Radix. Nested radius = outer − padding, so inner cards never look "fatter" than their containers.
- **Shadow/elevation:** four styles: none (borders only), soft layered (2–3 stacked shadows tinted with the neutral hue), hard offset (neo-brutal), and glow (dark-first only). Shadows must be tinted by the surface hue; pure-black shadows are an AI-look tell [proposal].

---

## 3. Content-aware layout

### 3.1 What research offers

| Work | What it does | Relevance |
|---|---|---|
| **GRIDS** (Dayama, Todi, Saarelainen, Oulasvirta, CHI 2020) | MILP on grid layouts with continuous size/position and discrete relative-position variables. Guarantees no overlap or overflow, supports alignment, grouping and preferred positions. Gurobi, real-time suggestions. | [verified] [arXiv 2001.02921](https://arxiv.org/abs/2001.02921), [formulation](https://userinterfaces.aalto.fi/grids/resources/GRIDS-Formulation.pdf). Proves exact optimization of small layout problems runs at interactive speed. |
| **Cassowary** (kiwi.js port) | Linear-constraint solver behind Apple Auto Layout | [verified repo] [kiwi.js](https://github.com/IjzerenHein/kiwi.js) (license file not auto-detected; check). Mostly unnecessary when CSS grid/flex does the solving. |
| **LayoutGPT** (2023), **LayoutPrompter** (NeurIPS 2023), **LayoutDM** (CVPR 2023), **PosterLlama** (ECCV 2024) | LLM/diffusion generation of element bounding boxes for posters and documents. LayoutPrompter is training-free (serialization + exemplar retrieval + ranking). PosterLlama serializes layouts as HTML. | [verified] [LayoutPrompter](https://arxiv.org/abs/2311.06495), [PosterLlama](https://arxiv.org/abs/2404.00995), [survey 2503.18641](https://arxiv.org/abs/2503.18641) |
| **LaySPA** (2025/26), **Uni-Layout** (2025), **AeSlides** (2026), **WebGen-R1** (2026), **DesignSense** (Feb 2026) | RL with *verifiable* geometric/aesthetic rewards. AeSlides uses verifiable layout rewards for slides. WebGen-R1 uses visual aesthetic rewards for multi-page sites. DesignSense has 10,235 human preference pairs and an InternVL3-8B judge. | [verified abstracts via search] [LaySPA](https://arxiv.org/abs/2509.16891), [Uni-Layout](https://arxiv.org/abs/2508.02374), [AeSlides](https://arxiv.org/abs/2604.22840), [WebGen-R1](https://arxiv.org/abs/2604.20398), [DesignSense](https://arxiv.org/abs/2602.23438); list at [Awesome-Layout-Generation](https://github.com/wd1511/Awesome-Layout-Generation) |

**Takeaway [proposal].** Layout-generation models output boxes for fixed canvases such as posters and slides. They are research-grade and do not produce responsive, accessible web layouts. What transfers is the **verifiable-reward idea**: geometric checks such as overlap, overflow, alignment and whitespace are computable and correlate with quality. In our architecture layout is a *discrete choice among authored variants*, which is a small constraint-satisfaction problem. Solve it exactly by enumeration with fit predicates, rather than generating geometry.

### 3.2 Content → variant selection (the "fit solver")

For each block the spec model proposes intent ("features, 5 items, with icons"). Deterministic code then:
1. Computes **content features**: headline length in characters and words, longest word in em at the display size, line count at each breakpoint (measured, §3.4), item count, image presence, aspect ratio, focal point, script and direction, presence of numbers or prices.
2. Filters the block's variants by **declared fit predicates**. Example: `hero.split` requires `headline.lines@1280 ≤ 3 && headline.lines@375 ≤ 5 && image.aspect ∈ [0.66, 1.5]`. `features.grid3` requires `count ∈ {3, 6, 9}`, and `features.bento` requires `count ∈ [4, 7]` with one item having an image.
3. Chooses among survivors by family preference weights + diversity pressure (§5).
4. If no variant fits, applies **content transforms** in order: shorter display size step, balanced wrap, two-column → stacked, truncate secondary text with a "more" affordance, and finally ask the copy model for a shorter headline (the only LLM round-trip, and rarely needed).

### 3.3 CSS that makes blocks robust by construction

| Technique | Use | Status |
|---|---|---|
| Container size queries (`@container`, `cqi` units) | Blocks adapt to *their* width, so the same block works in a sidebar, a split or full-bleed | Baseline since 2023 [verified] [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_size_and_style_queries) |
| `clamp()` fluid type/space (Utopia, container-relative) | No breakpoint cliffs | [verified] [utopia](https://utopia.fyi/blog/clamp/) |
| `text-wrap: balance` (headings) / `pretty` (body) | Balanced headlines, fewer orphans | `balance` is Baseline. `pretty` is Chromium 117+ and Safari 26, with Firefox status disputed, so treat it as progressive enhancement and keep the orphan gate [reported] [MDN text-wrap-style](https://developer.mozilla.org/docs/Web/CSS/text-wrap-style) |
| `hyphens: auto` + correct `lang`, `overflow-wrap: anywhere` on headings | German compounds, long words, URLs | [verified] MDN |
| Logical properties (`margin-inline-start`, `inset-inline`), `dir="rtl"` | RTL for free. Mirror directional icons explicitly. | [verified] MDN |
| `grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr))`, subgrid | Item-count-agnostic grids with aligned card internals | [verified] MDN |
| `aspect-ratio` + `object-fit: cover` + `object-position: <focal point>` | Crops that keep the subject | [verified] MDN |
| `min-block-size: 44px` targets; `:focus-visible` | Tap targets, a11y | WCAG 2.2 target size |

### 3.4 Text measurement without a browser

- **Pretext** (Cheng Lou, 2026; MIT): `prepare()` segments text and measures it with canvas once, then `layout(width, lineHeight)` is pure arithmetic. It returns line count, height and widest line, supports all scripts, RTL and `keep-all`, and explicitly targets "verification … that labels on e.g. buttons don't overflow" [verified] ([repo](https://github.com/chenglou/pretext), 51K stars). **Caveat:** it uses the browser's canvas font engine as ground truth. Server-side you need a canvas implementation (node-canvas or skia-canvas) with the *same font files*, and should test equivalence against Chromium.
- **Satori** (Vercel; MPL-2.0): HTML/CSS subset → SVG, now on Taffy for flex/grid. No `calc()` or z-index, and fonts must be supplied [verified] ([repo](https://github.com/vercel/satori)). Good for OG images and thumbnails. **Not** suitable as the gate renderer, because it cannot render our real CSS.
- **Taffy** (MIT, Rust/WASM; flex, grid, block) and **Yoga** (MIT; flex) [verified] ([Taffy](https://github.com/DioxusLabs/taffy), [Yoga](https://github.com/facebook/yoga)). Usable for a fast *approximate* layout pre-check in Workers, but text measurement is still on you.
- **Recommendation [proposal]:** use Pretext with server canvas for spec-time fit predicates (sub-millisecond per string after `prepare`), and a real Chromium for gates. Do not maintain a second layout engine that can disagree with the browser.

---

## 4. Automatic quality gates

### 4.1 Deterministic checks on the rendered DOM (all [proposal] as a suite; each check is standard)

| Gate | Method | Hard/soft |
|---|---|---|
| Color contrast | Spec-time: all role pairs (WCAG 2.x). Render-time: axe-core-style checks for text over images/gradients, sampling pixel luminance under text boxes. | Hard |
| Horizontal overflow | `document.scrollingElement.scrollWidth > innerWidth`. Any element with `scrollWidth > clientWidth` and `overflow: hidden` that has text. | Hard |
| Clipping / overlap | Text boxes intersecting other text boxes, or text-node bounding rects outside their clipping ancestor | Hard |
| Orphans / widows | `Range.getClientRects()` on the last line of headings and paragraphs: one word on the last line → fail for headings, warn for body | Hard (headings) |
| Line length | Characters per line at each breakpoint: body 45–80, headings ≤ about 30 at display sizes | Soft |
| Headline rag | Variance of line widths in multi-line headings (balanced = low) | Soft |
| Vertical rhythm | All computed margins/paddings ∈ token set; section padding alternation as declared | Hard (tokens) |
| Alignment consistency | Cluster left edges per viewport. Count distinct x-alignments (fewer = cleaner) and flag near-misses (edges within 1–6 px of each other). | Soft |
| Tap targets | Interactive elements ≥ 44×44 CSS px or spaced (WCAG 2.2 2.5.8) | Hard |
| Image crops | Focal point (smartcrop.js, MIT, [repo](https://github.com/jwagner/smartcrop.js); or face detection) inside the visible crop at every breakpoint; no upscaling past 1.5× | Hard |
| Text on image | Local contrast under text ≥ threshold, else apply a scrim or switch variant | Hard |
| Whitespace balance | Ratio of ink to empty area per section; left/right visual-weight balance | Soft |
| Hierarchy | Exactly one h1-scale element above the fold; heading sizes monotonic with level; primary CTA largest-contrast interactive element above the fold | Hard/soft |
| Performance/a11y | Image bytes, font count, layout shift, landmarks, alt text, heading order | Hard |

### 4.2 Learned scorers

- **UIClip** (Wu et al., UIST 2024): CLIP B/32 fine-tuned on crawled, synthetic and designer-rated UIs. Scores screenshot + description for quality and relevance. It beat large VLMs at agreeing with designer rankings. Model checkpoint is MIT on Hugging Face [verified] ([arXiv 2404.12500](https://arxiv.org/abs/2404.12500), [HF model](https://huggingface.co/biglab/uiclip_jitteredwebsites-2-224-paraphrased)). Cheap: a B/32 forward pass runs in milliseconds on GPU. Use it as a *ranker among survivors*, ideally fine-tuned on our own pairwise data.
- **UICrit** (Duan et al., UIST 2024): 3,059 designer critiques with bounding boxes on 983 mobile screens. Few-shot + visual prompting with it improved LLM feedback by 55% [verified] ([arXiv 2407.08850](https://arxiv.org/abs/2407.08850), [dataset repo](https://github.com/google-research-datasets/uicrit); license not shown in API, check).
- **Saliency: UEyes** (CHI 2023): 62 participants, 1,980 UI screenshots (web, desktop, mobile, posters), about 20K saliency maps; dataset CC BY 4.0 [verified] ([project](https://userinterfaces.aalto.fi/ueyeschi23), [arXiv 2402.05202](https://arxiv.org/abs/2402.05202)). Train or borrow a UI saliency model and gate on "primary CTA and headline receive ≥ X% of predicted fixation mass above the fold".
- **Web-aesthetics benchmarks and reward models (2025–26):** OpenDesign / AesCode-358K (ICLR 2026: 840 real webpage cases, LLM-judge + agentic reward) [reported] ([ICLR paper](https://proceedings.iclr.cc/paper_files/paper/2026/file/514b48017505dc778c6db2d845cbbe24-Paper-Conference.pdf)). PosterReward (CVPR 2026, 70K preferences) [reported] ([CVF](https://openaccess.thecvf.com/content/CVPR2026/papers/Lai_PosterReward_Unlocking_Accurate_Evaluation_for_High-Quality_Graphic_Design_Generation_CVPR_2026_paper.pdf)). DesignSense (10,235 layout preference pairs) [verified abstract] ([arXiv](https://arxiv.org/abs/2602.23438)). AesthetiQ (uses WebUI screenshots and VLM preference alignment) [reported] ([arXiv 2503.00591](https://arxiv.org/abs/2503.00591)).

### 4.3 VLM judges: how much to trust them

- **TASTE (arXiv 2605.20731, 2026):** six open VLM judges and three T2I preference scorers (HPSv2.1, PickScore, LAION-Aesthetic) all reach **≤ 0.55 macro agreement** with a 5-designer majority. Scaling the VLM did not close the gap. A small head trained on designer labels narrowed it substantially [verified] ([paper](https://arxiv.org/html/2605.20731)).
- **DesignPref (arXiv 2511.20513):** 12,000 pairwise UI-design comparisons by 20 professional designers. Inter-designer agreement is low (Krippendorff α ≈ 0.25 binary), and *personalized* models beat aggregate ones even with 20× less data [verified abstract] ([arXiv](https://arxiv.org/abs/2511.20513)).
- **UIClip paper:** large VLMs did poorly at design-quality ranking at the time (2024) [verified] ([arXiv](https://arxiv.org/abs/2404.12500)).

**Implication [proposal].** Use VLMs for *defect detection with a rubric*: "is any text cut off, is the hero image irrelevant to a bakery, does anything look broken, is the CTA visible". They are good at these binary, grounded questions. Do *not* use a VLM's 1–10 "beauty" score to pick between two clean candidates; use the trained ranker and the user's own picks (§8). Always run pairwise comparisons in both orders to cancel position bias.

**Cost in late 2026 (Gemini API list prices)** [verified] ([Google AI pricing](https://aistudio.google.com/docs/pricing)): Gemini 3.5 Flash-Lite costs $0.30 per 1M input tokens and $2.50 per 1M output, with batch at half price. Gemini 2.5 Flash-Lite costs $0.10 / $0.40. Gemini 3 models count an image at up to about 1,120 tokens at default media resolution [verified] ([media resolution docs](https://ai.google.dev/gemini-api/docs/media-resolution)). One judge call with 2 screenshots (desktop + mobile), about 3.5K input tokens and about 300 output tokens on 3.5 Flash-Lite costs roughly **$0.0018** [proposal arithmetic]. Latency is typically 1–4 s for a short structured answer [proposal, unmeasured].

### 4.4 Rendering infrastructure

- **Cloudflare Browser Rendering ("Browser Run"):** $0.09 per browser-hour. The REST API is billed on duration only; Workers bindings also bill concurrency at $2.00 per concurrent browser per month (averaged). Workers Paid includes 10 h/month and 10 concurrent browsers [verified] ([Cloudflare pricing](https://www.cloudflare.com/plans/), [changelog post](https://community.cloudflare.com/t/browser-run-introducing-pricing-for-the-browser-rendering-api-0-09-per-browser-hour/897041)). Limits: 200 concurrent browsers per account, 3 new browsers per second, REST at 30 req/s, raisable on request [verified] ([limits](https://developers.cloudflare.com/browser-rendering/limits/)).
- **Self-hosted Playwright pool** [proposal]: keep N warm Chromium contexts. Render with `page.setContent(html)` and inlined, pre-cached fonts and images, so there is no network wait. Each context renders one viewport. A warm render + DOM audit + PNG screenshot is typically a few hundred ms (unmeasured; benchmark it).
- **Avoid the network:** serve all assets from an in-memory route handler. Disable animations during gates (`prefers-reduced-motion` emulation plus a CSS kill-switch) so screenshots are deterministic.

### 4.5 "20 candidates, score in parallel, show the best three": cost and latency

| Stage | Work per site | Latency (wall) | Cost |
|---|---|---|---|
| 0. Spec-time (no render): tokens, contrast pairs, Pretext fit predicates, adjacency rules, dedupe | 20 specs × about 10 blocks | < 50 ms | ≈ $0 |
| 1. Render + DOM gates | 20 specs × 2 viewports (390, 1440) = 40 renders, about 0.5–1 s browser time each, run 20-wide | 1–2 s | 40 s × $0.09/h ≈ **$0.001** (CF REST) |
| 2. Learned rank (UIClip/ranker + saliency) on survivors | ≤ 40 screenshots | 0.2–0.5 s (GPU batch) | ≈ $0.0005 (GPU amortized) |
| 3. VLM defect check on top 5 | 5 calls, parallel | 2–4 s | 5 × $0.0018 ≈ **$0.009** |
| **Total** | | **≈ 3–7 s** | **≈ $0.01–0.02 per site** |

All rows are [proposal] estimates built on the verified list prices above. For a felt latency of about 1 s: render the best stage-0 candidate immediately, which the deterministic engine can always produce. Run stages 1–3 in the background and present "two more directions" a few seconds later. Run the VLM step in batch mode at half price for non-interactive regenerations.

---

## 5. Variety without slop

### 5.1 How generative communities guarantee every seed is good

- **Constrain the distribution, don't curate outputs.** Tyler Hobbs released Fidenza's 999 outputs with "no curation whatsoever". Quality came from tuning probability distributions per feature, for example palette color weights [reported, artist interviews] ([Fidenza page](https://tylerxhobbs.com/fidenza), [OpenSea interview](https://opensea.io/blog/articles/in-conversation-with-tyler-hobbs)). His essay on probability distributions is the method reference ([tylerxhobbs.com](https://tylerxhobbs.com/words/probability-distributions-for-algorithmic-artists)). The long-form generative art practice is: test thousands of seeds, find the bad regions of parameter space, and *remove them from the distribution*. Rejecting them at runtime is the fallback, not the method.
- **Grammars and WFC.** Shape grammars and Wave Function Collapse ([mxgmn/WaveFunctionCollapse](https://github.com/mxgmn/WaveFunctionCollapse), MIT) generate valid structures by local adjacency rules. For pages, the useful analog is **section adjacency rules**: no two consecutive image-heavy sections, alternate surface tone, never two centered sections with the same background, and CTA bands only after social proof. That is a tiny constraint grammar we can author directly [proposal].
- **Quality-diversity search (MAP-Elites).** Keep the best solution per cell of a designer-chosen feature space. This is proven in level design: constrained interactive MAP-Elites for dungeons, Mario levels, FPS maps (2026) [verified] ([Alvarez et al.](https://arxiv.org/abs/1906.05175), [FPS maps 2026](https://arxiv.org/abs/2605.30570)). Library: [pyribs](https://github.com/icaros-usc/pyribs) (MIT).

### 5.2 Applying this to two bakeries [proposal]

1. **Offline: illuminate the style space per vertical.** For each vertical (bakery, dentist, law firm, yoga, SaaS…) run MAP-Elites over the style parameters with behavior descriptors such as (warm↔cool color, serif↔sans, image-led↔type-led, airy↔dense). Fitness = gate pass × ranker score. The archive gives, say, 50–200 elite *style genomes per vertical*. Each is pre-tested with synthetic content across viewports.
2. **Online: assign a genome, then perturb.** Pick from the vertical's archive with a *low-discrepancy* or "least-recently-used cell" policy, so successive users land in different cells. Then apply the user's brand hue, the seed for procedural art (30 styles × infinite seeds), the block-variant choices and the copy. The brand hue alone moves the whole palette; Linear's experience is that perceptual generation keeps any base color good.
3. **Distinctness constraint.** Two sites in the same vertical and locale must differ on at least 3 of the salient axes: type pairing, palette strategy, imagery treatment, hero archetype, grid alignment, density. A perceptual check backs this up: the screenshot embedding distance (UIClip/CLIP image embedding or DreamSim) to the nearest site we have served in that vertical must exceed a threshold.
4. **Measure variety** with three numbers per vertical and month: (a) archive coverage (filled cells / total), (b) mean nearest-neighbor embedding distance between served sites, and (c) entropy of each salient axis across served sites. Alarm if any axis value exceeds about 25% share. That is how a "house look" creeps in.

---

## 6. "A site like this": extraction and mapping

**Extract.**
- **Firecrawl `branding` format:** colors, fonts, typography, spacing, UI component styles and logo from a URL, combinable with a screenshot [verified docs] ([scrape docs](https://docs.firecrawl.dev/features/scrape), [cookbook](https://docs.firecrawl.dev/developer-guides/cookbooks/brand-style-guide-generator-cookbook)).
- **Brandfetch Brand API:** logos, colors *with roles* (accent/dark/light/brand), title and body fonts, and `palette=true` for the full system. Self-reported color coverage is 97% on core brands and about 80% on the long tail [verified vendor docs] ([docs](https://docs.brandfetch.com/brand-api/overview), [product page](https://brandfetch.com/developers/brand-api)).
- **DESIGN.md:** an open (Apache-2.0) token + rationale format with a linter, and Stitch has a wizard to extract one from a site [verified] ([spec repo](https://github.com/google-labs-code/design.md), [Stitch on X](https://x.com/stitchbygoogle/status/2047356036890427448)). Adopt it as our *import/export* format.
- **Do-it-yourself from a screenshot:** use MCU `quantize` for dominant colors, a VLM to classify family, tone, density, radius, imagery treatment and hero archetype, and computed styles from a headless render (font-family, sizes, radii, shadows, spacing histogram). Screenshot-to-code tools ([abi/screenshot-to-code](https://github.com/abi/screenshot-to-code), MIT) and benchmarks ([Design2Code](https://arxiv.org/abs/2403.03163)) show VLMs can read structure well enough for classification.

**Map onto our catalog [proposal].** Snap every continuous value to our axes:
- Brand color → hue anchor.
- Font → nearest *licensed open* font by embedding (Fontjoy-style), never the reference's commercial font.
- Radius → nearest of 5 values.
- Spacing histogram → density step.
- Section sequence → our block types and variants by VLM classification.

Then choose the nearest *family* and run the normal engine. The result shares the reference's mood without copying it.

**The legal line.** In the US a site's overall look-and-feel gets weak copyright protection, but its HTML/CSS code can be protected (*Media.net v. Netseer*, N.D. Cal. 2016) [reported] ([Goldman](https://blog.ericgoldman.org/?p=15625), [Proskauer](https://newmedialaw.proskauer.com/2016/02/05/website-HTML-is-copyrightable-even-if-look-and-feel-is-not/)). Look-and-feel can be *trade dress* if it has secondary meaning (*Blue Nile v. Ice.com*, 2007; *Ingrid & Isabel*), and deliberate copying can support an inference of secondary meaning [reported] ([Mondaq](https://www.mondaq.com/unitedstates/advertising-marketing-branding/347268/look-and-feel-of-a-website-can-constitute-protectable-trade-dress), [Lizerbram](https://www.lizerbramlaw.com/?p=2679)). Commentators call the doctrine unsettled ([NYU JIPEL](https://jipel.law.nyu.edu/vol-3-no-2-3-brown/)). This is not legal advice.

Engineering policy [proposal]:
- Copy only abstract style parameters.
- Never copy code, text, images, logos, icons or commercial font files.
- Always render with our own blocks.
- Add a *similarity ceiling*: if the generated screenshot's embedding is closer to the reference than some threshold (for example, closer than 95% of same-vertical pairs), perturb layout axes.
- Refuse "make it look exactly like <famous brand>". Allow "warm, editorial like this".

---

## 7. Imagery and motion

**Image sources, ranked for cost and quality [proposal ranking]:**
1. **Our procedural library** (30 styles, seed + brand color): zero marginal cost, always on-brand, always licensed, deterministic. This is the default for hero backgrounds, section art, empty states and OG images. It is our strongest anti-sameness asset, because seeds are effectively infinite.
2. **User photos:** auto-crop with focal points (smartcrop.js MIT, or face/saliency detection). Apply family treatments (duotone in brand hue, grain, warm grade) and extract an accent palette from them (MCU quantize).
3. **Stock APIs:** Unsplash API guidelines *require* hotlinking the returned URLs and attributing the photographer with a link [verified] ([Unsplash API guidelines](https://help.unsplash.com/api-guidelines), [attribution](https://help.unsplash.com/articles/2511315-guideline-attribution)). The Pexels License permits commercial use without required attribution, but API guidelines reportedly ask for a link back [reported] ([summary](https://blog.laozhang.ai/en/posts/free-image-api)). Stock images need a relevance check (VLM) and a treatment so they match the family.
4. **Image models**, used asynchronously, never on the 1-second path:
   - Google list prices are $0.0336 per 1K image for Nano Banana 2 Lite / 2.1 ($0.0168 batch) [verified] ([pricing](https://aistudio.google.com/docs/pricing)).
   - FLUX.2 [klein] costs about $0.014–0.015 per image on BFL's API, and Z-Image Turbo about $0.005–0.01 from hosts [reported] ([lyceum](https://lyceum.technology/magazine/flux-2-klein/), [anotherwrapper](https://anotherwrapper.com/tools/llm-pricing/image-models/compare/flux2-klein-base-9b/z-image-turbo), [Atlas](https://atlascloud.ai/blog/guides/z-image-turbo-api-guide)).
   - Reported latency ranges from about 1 s self-hosted on a 4090 to 6–7 s p50 via APIs [reported] ([img.ly benchmark](https://img.ly/ai-benchmarks/models/gemini-25-flash-image/), [runaihome](https://runaihome.com/blog/z-image-turbo-16gb-vram-home-lab-image-gen-2026/)).
   - Use them for subject-specific photography-like images (a croissant, a dental chair) after first render, gated by a VLM relevance check.

**Icons:** [Lucide](https://github.com/lucide-icons/lucide) (ISC), [Tabler](https://github.com/tabler/tabler-icons) (MIT, 6,200+), [Phosphor](https://github.com/phosphor-icons/core) (MIT; six weights, which makes a natural "icon weight" axis). Pick the set and stroke weight by family, so stroke width matches the body font's stem weight [proposal].

**Motion presets [proposal]:** four presets defined as tokens: duration scale, easing curves, stagger and distance. Material 3 publishes a reference duration/easing token system ([M3 motion tokens](https://m3.material.io/styles/motion/easing-and-duration/tokens-specs)). Implement with CSS scroll-driven animations or [Motion](https://github.com/motiondivision/motion) (MIT). Rules:
- Animate opacity and transform only.
- Keep entrances to 200–500 ms with ease-out.
- Stagger ≤ 60 ms per item.
- Never animate body text after first paint.
- Honor `prefers-reduced-motion`.
- Disable motion during gates.

---

## 8. Learning taste from data

- **Datasets:**
  - WebUI: 400K pages with screenshots + DOM, CHI 2023 [verified] ([arXiv](https://arxiv.org/abs/2301.13280), [project](https://uimodeling.github.io)); license not found, check before training.
  - UEyes (CC BY 4.0), UICrit, UIClip training data, DesignPref (12K personal pairs), DesignSense (10K pairs), TASTE (designer multi-criteria).
  - Award galleries (Awwwards, Godly, SiteInspire, Land-book) are the obvious "good" sets. Their terms of service generally don't grant training rights, and I did not verify any. Use them for **human curation of style families and reference boards**, not as scraped training data, unless licensed.
- **Learning from user picks [proposal]:**
  - Every "pick one of 3" is two pairwise preferences. Fit a **Bradley-Terry / logistic model over axis features** (family, pairing, palette strategy, imagery…) per vertical. Design Arena uses Bradley-Terry for its own leaderboards [reported] ([gigazine](https://www.gigazine.net/gsc_news/en/20250824-ai-design-arena), [BenchLM](https://benchlm.ai/benchmarks/designarenawebsite)).
  - Choose which 3 to show with **Thompson sampling** over archive cells: exploit what wins in the vertical, explore under-tried cells. Constrain the three to be mutually distinct (≥ 3 salient axes apart) so each pick is informative.
  - Implicit signals: regenerations, manual edits that move an axis ("changed font" = negative on that pairing), publish, and time-to-publish.
- **Personal style memory:** store per-user posteriors over axis values. DesignPref shows personal models beat aggregate ones with far less data [verified abstract] ([arXiv](https://arxiv.org/abs/2511.20513)), and designers disagree a lot (α ≈ 0.25), so personalization is a quality lever, not a nicety.
- **Train our own ranker:** fine-tune UIClip, or a small head on frozen image embeddings (TASTE shows a small trained head beats big zero-shot judges), on (a) user pairwise picks, (b) a few thousand designer-rated pairs of *our own* outputs, and (c) synthetic negatives from deliberately broken specs (wrong contrast, orphans, misaligned). UIClip used the same augmentation idea with "jittered" websites [verified] ([HF model name](https://huggingface.co/biglab/uiclip_jitteredwebsites-2-224-paraphrased), [paper](https://arxiv.org/abs/2404.12500)).

---

## 9. Blueprint

### 9.1 Recommended style parameter space [proposal]

**Layer A: family (the coherence layer).** About **10–12 curated families**, each written as a DESIGN.md-style document of tokens + rationale. Examples: Editorial Serif, Swiss Grotesk, Warm Craft, Quiet Luxury, Playful Rounded, Tech Mono, Soft Brutal, Organic Natural, Retro Print, Clinical Clean, Bold Commerce, Dark Studio. A family does not fix values. It sets the **allowed sub-range and prior weights** for every Layer-B axis.

**Layer B: salient axes (users notice these).**

| Axis | Values | Notes |
|---|---|---|
| Type pairing | ≈ 50 vetted (4–8 per family) | Script coverage, weights, license tagged |
| Palette strategy | 5 (mono-tint, neutral+accent, brand-flood, duotone, dark-first) | Brand hue applied continuously on top |
| Imagery treatment | 6 (full-bleed photo, framed photo, duotone photo, procedural art, illustration, typographic/no image) × 30 art styles × ∞ seeds | Biggest variety lever |
| Hero archetype | 6–8 (centered, split, full-bleed overlay, editorial big-type, collage, product-frame, minimal) | Content fit predicates apply |
| Grid alignment | 3 (centered, left editorial, asymmetric) | |
| Density | 3 (compact, regular, airy) | Spacing multiplier + section padding |

**Layer C: secondary axes (texture, conditioned on family).**

| Axis | Values |
|---|---|
| Type scale ratio | 3 |
| Heading treatment (case, tracking, weight) | 3 |
| Neutral temperature | 3 (derived from hue, shifted by family) |
| Chroma level | 3 |
| Radius | 5 |
| Elevation style | 4 |
| Section surface rhythm | 4 |
| Ornament set | 5 |
| Icon set and weight | 4 |
| Button style | 4 |
| Motion preset | 4 |

**Combinatorics:** within one family, allowing about half of each range, Layer B+C gives on the order of 10⁵–10⁶ discrete styles before brand hue, art seed and block-variant choices. Brand hue is continuous and the art seed is effectively unbounded. **Effective** variety is set by the 6 Layer-B axes; Layer C keeps two same-family sites from feeling templated.

### 9.2 How a block must be authored [proposal]

Each block ships with a manifest:
1. **Slots with content contracts:** type, min/max characters, item count range, image required/optional, accepted aspect range, and whether a focal point is needed.
2. **3–6 variants**, each with **fit predicates** written against measured content features (line counts at 375/768/1280 via Pretext, longest word in em, item count, image aspect).
3. **Fallback chain** when nothing fits (§3.2).
4. **Token-only styling.** No raw colors, sizes or radii. A lint rule fails the build if a literal value appears.
5. **Robust CSS by construction:**
   - Container queries, not viewport media queries.
   - `clamp()` type/space.
   - `text-wrap: balance` on headings and `pretty` on body.
   - `hyphens: auto`, `overflow-wrap` on display text.
   - Logical properties only, with mirrored directional icons.
   - Intrinsic `auto-fit/minmax(min(100%, X), 1fr)` grids and subgrid for card internals.
   - `aspect-ratio` + `object-position` from the focal point.
   - 44 px targets.
   - Explicit `lang`/`dir`.
6. **Surface declaration:** the block's background role and "ink density", so the adjacency grammar can alternate sections.
7. **Per-family overrides** limited to token remaps and ornament toggles, never forked markup.
8. **A fixture set:** the minimum, maximum, RTL, CJK and German-compound content cases that the CI harness renders on every change.

### 9.3 Gate pipeline per site [proposal; prices verified as cited in §4]

```
spec model (1 call) ──► 20 candidate specs (deterministic expansion: family × genome × variants × seed)
   │
   ├─ Stage 0  spec-time: tokens, WCAG pairs, Pretext fit, adjacency grammar, distinctness   <50 ms, $0
   │      └─ best candidate rendered to user immediately (≈1 s total felt latency)
   ├─ Stage 1  Chromium pool: 2 viewports × survivors, DOM gates (§4.1)                      1–2 s, ≈$0.001
   ├─ Stage 2  ranker (fine-tuned UIClip / small head) + UI saliency                         <0.5 s, ≈$0.0005
   └─ Stage 3  VLM rubric defect check on top 5, both-order pairwise on top 3                2–4 s, ≈$0.01
                └─ show best 3, mutually ≥3 salient axes apart
Total ≈ 3–7 s wall, ≈ $0.01–0.02/site. Image-model upgrades run async afterwards (≈$0.01–0.03/image).
```

### 9.4 How variety is produced and measured

- **Produced by:** offline MAP-Elites archives per vertical → least-recently-used / low-discrepancy cell assignment → brand-hue regeneration → procedural art seed → block-variant choice under fit predicates → user pick personalization.
- **Measured by:** archive coverage, nearest-neighbor screenshot-embedding distance among served sites per vertical, per-axis entropy and max-share alarms (> 25%), and a "twins" detector (any two served sites under a distance threshold triggers review).

### 9.5 Proving "every seed looks good": the test harness [proposal]

1. **Generators** (property-based, for example fast-check):
   - Content: headlines 1–25 words, single 30-character words, all-caps, numbers and prices, 0–12 items, missing images, images at 1:4…4:1 with off-center subjects, and text in en/de/fi/ar/he/ja/zh/hi/hy/ru.
   - Brand colors: sampled uniformly over the OKLCH gamut plus a pathological set (pure yellow, pure blue, near-black, near-white, neon green, mid-gray, brown).
   - Families, genomes, seeds.
   - Viewports 320/375/390/768/1024/1280/1440/1920, light/dark, reduced motion, 200% zoom.
2. **Hard gates** (§4.1) must pass on 100% of cases. The release criterion is **0 failures in N = 10,000 random cases**, which bounds the true failure rate below about 0.03% at 95% confidence (rule of three). Every failure becomes a shrunk minimal repro and a permanent fixture.
3. **Distribution pruning:** cluster failures and soft-score lows by parameter region, then **remove or reweight that region in the family's distribution**, the Hobbs method. Do not add runtime special cases.
4. **Soft-quality audit:** every release, render a stratified sample of about 300 cases. Designers rate them pairwise against a fixed anchor set of hand-made sites in the same vertical. Target: our median output is preferred over the anchor median in ≥ 40% of pairs, rising over time. Track by family and vertical so weak families get fixed or cut.
5. **Visual regression:** golden screenshots per block × variant × fixture, diffed on every block change.
6. **Diversity regression:** the archive-coverage and nearest-neighbor metrics in §9.4 must not drop between releases.

### 9.6 What is proven, what is research, what is mine

| Component | Status |
|---|---|
| Few-input token generation in perceptual color (Linear 3 inputs → 98 vars; MCU seed → scheme; Radix 5 axes; Stripe Lab palette) | **Proven in production** [verified] |
| Contrast-solved scales (Leonardo for Adobe Spectrum) | **Proven in production** [verified] |
| Fluid type via clamp (Utopia), container queries, text-wrap balance | **Proven in production** [verified] |
| Curated pairings/palettes by personality (Squarespace Blueprint, Wix) | **Production** [reported, internals unpublished] |
| Prompt → sitemap → wireframe-from-library → style guide (Relume) | **Production** [reported] |
| Pretext browser-free text measurement | **Production-grade library, new (2026)**; server-canvas parity is unverified |
| GRIDS-style exact layout optimization | Research (CHI), works at interactive speed |
| LLM/diffusion layout generation (LayoutGPT, LayoutPrompter, PosterLlama, LaySPA, AeSlides, WebGen-R1) | **Research-grade**; not used here except the verifiable-reward idea |
| UIClip / UICrit / UEyes as scorers | **Research models with public weights/data**; need fine-tuning on our outputs |
| VLM as aesthetic judge | **Research says unreliable** (≤ 0.55 agreement, TASTE); OK as rubric defect detector [my proposal] |
| MAP-Elites for style archives | **Proven in game PCG research**; applying it to web style is **my proposal** |
| Distinctness constraint, family layer, fit-predicate block manifests, rule-of-three seed harness, 20→3 pipeline costs | **My proposal** |

---

## 10. What I could not verify

- The practitioner post about six curated "theme families"; I could not locate it.
- How Framer, Tailwind Plus, Squarespace and Wix parameterize styles internally. Only marketing and reviews are public.
- The licenses of the WebUI dataset, the UICrit repository (no license detected through the GitHub API), kiwi.js (license not auto-detected), and the TASTE dataset on Hugging Face (the paper is CC BY 4.0).
- Pexels API attribution wording from a primary page.
- `text-wrap: pretty` support in Firefox; sources conflict.
- Real measured latency of warm Chromium renders and of Cloudflare's REST screenshot endpoint. The latencies in §4.5 are estimates to benchmark.
- Image-model prices outside Google's own page. FLUX.2 klein and Z-Image Turbo figures come from third-party hosts and vary by provider.
- Whether Pretext's server-side measurement, using node-canvas or skia-canvas with identical fonts, matches Chromium line breaking closely enough for hard predicates. This is the riskiest technical assumption.
