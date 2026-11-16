# From "fine" to 10/10: research and plan

**Date:** 2026-11-16.

**Why:** Robert's verdict on the two-layer design rules proof (`docs/m0/12-design-rules.md`): "they're all fine… I just don't think they're 10/10". He asked for research on four things: design taste and quality writing, what 2026 sites and AI builders do, how far decision models can be pushed, and what we can reuse instead of inventing.

**How:** four research threads ran in parallel. This file pulls them together. Every source is linked inside its section.

**Labels:** **measured** = we read it from a page or a test. **sourced** = a named source says it. **judgement** = ours.

## 1. Diagnosis: why our sites are "fine"

1. **We meet the floor but lack commitment.**
   - The craft rules are mostly met already: line length, a type scale, one spacing scale, contrast, hygiene.
   - What's missing:
     - one dominant element per screen
     - one bold move per site
     - decoration that carries information
     - a look taken from the business's own world (judgement, from the design-writing thread).
2. **Our look is itself a known AI default.**
   - Anthropic's frontend-design guide lists what models produce once told to stop looking AI-made (sourced):
     - warm cream with a terracotta accent
     - broadsheet layouts with hairline rules
     - tracked all-caps labels
     - mono data labels
     - emphasis on one word of the headline
   - The proof uses almost all of them.
   - Lesson: banning one default just moves us to the next default (sourced).
3. **Colour is timid.**
   - Every award-level small-business site checked uses one deep brand colour and one warm off-white (sourced, Awwwards palettes). Examples:
     - Gielly Green: #5D0F17 on #F2F0ED
     - Délice: #DE2B2B on #F5DBCA
     - Core Atelier: #25140C on #F7E7DE
   - The brand colour fills whole backgrounds or all the text. We use it as a button accent on paper, which is the safe middle (measured on their sites, judgement on ours).
4. **The pages are thin on real facts.**
   - The best local sites turn information into design:
     - a live "open now" line
     - today's menu with prices
     - a numbers row (founded, seats)
     - an offer strip
     - a stamp-like note
     - one quote
   - A test of 51 AI-built pages faulted every builder for thin, generic pages with no sections specific to the kind of business (sourced, Crazy Egg, Oct 2025).
5. **The fonts are common.**
   - Award sites pair a characterful serif with a neutral grotesk, mostly commercial faces (GT, Editorial New, Styrene).
   - Our Google fonts (Bodoni Moda, Fraunces, Newsreader, Inter Tight) are what every generator reaches for (judgement).
   - We must stay with OFL fonts (the free font licence), so the choice and the setting matter more:
     - tracking −0.02 to −0.05 em on display type
     - line height about 0.9
     - small mono or tracked labels used sparingly (measured on award sites)

## 2. What the decision model can really do

Sources: TypeSafe docs, OpenAPI spec and cookbooks, all read directly.

- **Score questions, which we don't use yet.** Up to 10 ordered levels. Each answer returns a fractional score and probabilities.
  - The documented pattern is a composite score: several Score questions, weighted in code.
  - Use: turn a brief into a style vector (energy, formality, warmth, density, boldness). Score every library option on the same dimensions once, offline. Code then picks the option nearest the brief.
  - Taste stays in the library; Jev only reads the brief.
- **Ranking with one Choice across up to 255 options.** Its probabilities work as soft scores.
  - A third party measured top-1 recall of 0.94 for this, against 0.87 with one question per option (sourced).
  - Use: code lists valid combinations, Jev ranks them, and the top N fill The Wall.
- **Confidence routing.**
  - If Jev is unsure, show two or three alternatives.
  - If Jev is sure, commit to one.
- **Screenshots as input.**
  - Supported, but marked "not production ready", behind a header.
  - TypeSafe says image answers are weaker than text answers.
  - Use it only for defect checks and "which of these fits the brief" (asked twice with the order swapped). Never use it to judge beauty.
- **Learning each owner's taste from their picks.**
  - Outside research agrees with our blind test: models judge design taste poorly, and even 20 professional designers barely agree with each other (sourced, DesignPref).
  - A model fitted to one person beats one averaged judge (sourced).
  - Use: Jev answers fixed descriptor questions once per library combination. Picks and skips on The Wall become labels for a small model per owner, with a prior learned from all owners.
  - No training at TypeSafe is needed.
- **Limits to design around** (documented):
  - Jev leans towards the first option, so shuffle the options and average.
  - It reads instructions literally.
  - It is weak at hex colours, so describe colours by name.
  - A "none of the above" option hurts; ask a separate yes/no question instead.
  - Confidence measures how concentrated the answer is, not how likely it is to be correct.

## 3. What to reuse

Every licence was checked against our list unless marked otherwise.

| Need | Pick | Licence |
|---|---|---|
| OKLCH palettes, contrast, gamut | culori | MIT |
| Palette from a photo or logo | Material Color Utilities | Apache-2.0 |
| Exact text fitting and vertical rhythm without a browser | Capsize + @capsizecss/metrics, fontkit | MIT |
| Fluid type and space scales as plain CSS | utopia-core | ISC |
| Self-hosted fonts with no layout jump | Fontsource (fonts OFL), google-font-metadata, fontaine | MIT |
| Photo focal points, stored in the spec | smartcrop.js + sharp | MIT / Apache-2.0 |
| Lint for "looks AI-made" | Impeccable detector (62 rules) | Apache-2.0 |
| Rules to adopt as checks | Anthropic frontend-design, Vercel Web Interface Guidelines | Apache-2.0 / MIT |
| Icons | Lucide, Tabler | ISC / MIT |
| Motion with no JavaScript | native scroll-driven animations and view transitions (in all major browsers as of Oct 2026) | n/a |

**Traps found:**
- APCA, used by Leonardo and apcach, carries a restrictive licence. Avoid it.
- Preline bans competing products.
- Once UI's templates are non-commercial.
- animate.css is not open source.
- axe-core, which we already use, is MPL-2.0. That is outside our list and **needs Robert's OK**, or we switch to Lighthouse (Apache-2.0), which runs axe internally.

**Not worth adopting:**
- Layout-generation research code: archived, and built for posters rather than web sections.
- Every free block library: they look generic.

**What we have to invent:**
- A type-system dataset. The Google Fonts "tags" file scores about 1,900 families on Calm, Loud, Sophisticated and so on, which is ideal. Its licence is unstated, so we need to ask Google first.
- Our own layout primitives, in the style of Every Layout.
- A contrast picker that targets a ratio, using WCAG 2 maths.
- Duotone and grain filters.
- The distinctive library itself.

## 4. What other builders teach us

- **Show options, then lock one.**
  - Lovable asks up to three visual questions before building: palettes as swatches, font pairs set in their own fonts, layout wireframes.
  - Framer has Shuffle; Squarespace offers alternate layouts (sourced).
  - This is The Wall. It also matches "taste lives in the library".
- **Consistency alone gives "fine".**
  - Relume, Webflow and Squarespace win on consistency, and reviewers still call them plain (sourced).
  - The way up is fewer but stronger directions per kind of business, each pushed further.
- **Business kinds differ.**
  - Trades sites win on trust: phone number up front, real staff and vans, a guarantee, years in business, review count.
  - Salons and studios: quiet luxury, a monogram, photos of the room or products on a flat tint, a press badge.
  - Restaurants: the menu as text with prices, live hours, walk-ins.

## 5. Plan

**Keep:** the rules-in-layers idea, Jev at request time, code composing pages, about one second, no JavaScript on pages.

**Change:**

1. **Make every site commit.** Add layers whose rules are bold by construction:
   - **Colour strategy:** brand colour as the background, brand colour as all the text, deep brand on off-white, a dark ground. Built with culori and checked for contrast.
   - **Hero strategy:**
     - photo only, with a small wordmark
     - big type on brand colour, with the photo in a shape
     - a centred sentence with a hanging label
   - **Signature detail**, exactly one per site:
     - a stamp
     - an organic photo mask
     - a monogram
     - an offer strip
     - a numbers row
     - live hours
2. **Ground each site in its business.**
   - Information blocks per kind: trust rows for trades, the menu for restaurants, the room and products for salons.
   - Fix the copy too: ask the text model for real specifics, and have Jev reject vague lines.
3. **Retire our own tells.**
   - The current paper-and-hairlines look becomes one option among many, not the default.
   - A tell linter (Impeccable plus our list) blocks any tell a rule didn't choose on purpose.
   - Track how often each rule ships across all sites, so no look takes over.
4. **Raise the floor with libraries.**
   - Capsize metrics replace our hand-measured letter widths.
   - culori builds the palettes.
   - utopia-core builds the scales.
   - smartcrop sets the photo focus.
5. **Use Jev properly.**
   - Score vectors for the brief and for every rule, matched in code.
   - Ranking for The Wall.
   - Confidence routing.
   - Later: learning each owner's taste from their picks.
6. **Show three or four strong, different directions** for the owner to pick from (The Wall), then shuffle per layer.

**First step (proposed):** a second round of the proof for the six salon briefs:
- Add the three new layers: colour, hero and signature detail.
- Pair better OFL fonts, with set tracking and line height per type system.
- Use Jev Score vectors in place of one Choice per layer.
- Add the tell linter.
- Put the result side by side with round 1 on one page, so Robert can see whether it moved from "fine" towards 10/10.

**Decisions for Robert:**
- axe-core (MPL-2.0): OK, or switch to Lighthouse?
- May we ask Google about the licence of the Fonts tags data?
- Use Jev's image input (not production ready) for defect checks only?
