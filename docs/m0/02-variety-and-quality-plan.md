# M0: plan to make sites vary and look really good

**Date:** 2026-11-14. **Why:** Robert reviewed the sample sites and five style families: the sites need more variety and must look really good. He also asked whether shadcn/ui and Vercel's UI SDK would help.

## Audit (contact sheets of all 37 variants × Poster, Quiet, Soft)

The sheets are produced by `pnpm --filter @repo/eval sheet` into `tools/eval/out/sheet/<family>/<section>.png`.

1. **Variants barely differ.** When items have no photos, the 7 card variants all render as titles and text in columns. Hero variants are "text beside a picture" or "centred text". The decision model would be choosing between near-twins.
2. **Pictures read as placeholders.** Surfaces art (soft blobs, discs, lines) works as texture, but small-business sites live on photos of the food, the room, the work and the people. Every strong reference site Robert shared leans on imagery.
3. **No art direction.** Nothing has scale contrast beyond the headline, nothing overlaps or breaks the grid, there are no editorial details (numbers, badges, rules, captions), and there is no colour rhythm between sections.
4. **Specific defects:**
   - `hours-location/split#with-text` leaves an empty left column when there is no body text.
   - `price-list/cards#featured` mixes photo cards and plain rows in a ragged grid.
   - `cards/grid#images` and `cards/steps#rows` look like plain lists when items have no photos.

## shadcn/ui and Vercel's UI SDK

| | What it gives | On published sites | In the builder's own app |
|---|---|---|---|
| shadcn/ui (MIT) | Consistent, polished components: cards, tables, forms, accordions | Its interactive parts need React in the visitor's browser, which the rules forbid. Its static markup can be copied as a source. **Its default look is the most common look on the web**, so it would make sites more alike, not less | Yes: ideal for the chat and editor |
| Vercel UI SDK (`vercel-labs/ui`, beta) | Headless behaviour: focus, popups, keyboard navigation. Draws nothing | Needs JavaScript in the page | Yes, if useful for the editor |

**Recommendation:** use both for the builder's own interface. For sites, borrow shadcn's polish details (focus rings, table and form styling) into the kit, and keep published pages free of JavaScript. Neither fixes variety or looks: those come from layout, art direction and imagery.

## The plan, biggest effect first

1. **Imagery: decided on 2026-11-14, licensed stock photos.** Pexels was chosen first, but it has paused new API keys, so the fetcher uses **Pixabay**: free account, photos up to 1,280 px wide through the API, licence allows use, storage and modification without attribution, API forbids permanent hotlinking and mass downloads. The Pexels notes below still apply if its keys reopen.
   - Pexels' licence allows downloading, storing, resizing and use on websites, including templates that are sold. Attribution is not required by the licence; its API terms ask for a Pexels link and photographer credit when possible, so every photo keeps its credit.
   - Unsplash is out: its API terms require hotlinked image URLs on every use. Pixabay forbids permanent hotlinking and mass downloads.
   - Pexels' terms forbid "bulk, large-scale or systematic copying" without permission: ask Pexels in writing before the 30 briefs need hundreds of photos, or before the product offers stock photos.
   - Surfaces stays for texture, backgrounds and blocks where a photo is wrong.
2. **Expressive variants.** Rebuild hero, cards, text-media and cta around distinct compositions, so each section type has 5 to 8 variants that look clearly different:
   - huge type over or beside images
   - asymmetric editorial grids
   - full-bleed image bands
   - numbered editorial lists
   - colour-block panels
   - overlap and inset frames
   - the research's details: proof line, next-slot card, week strip for hours, problem-to-fix pairs, location marquee, stamp badge
3. **Page rhythm.** Make the sequence of surfaces (base, muted, brand, inverse), full-bleed against contained sections and spacing between sections a decision of its own, so two sites with the same blocks still feel different.
4. **Axes within each family.** Give each family 2 or 3 type pairings, 2 or 3 palette strategies (light, tinted, dark), and a corner and a density setting. The contrast engine keeps every combination legible. 3 families × the axes gives dozens of looks per business.
5. **A quality loop.** Every change regenerates the contact sheets and a "Wall" of 24 sites for one brief, which is how M1's Wall will look.
   - Robert judges taste; checks catch defects; a vision model is used only to spot defects (CLAUDE.md).
   - A reference board of the best sites Robert shares sets the bar.
6. **Fix the defects above.**

## What stays the same

The section types, the block contract and the checks. Every new variant still passes the browser checks at three widths, with no JavaScript on published pages.
