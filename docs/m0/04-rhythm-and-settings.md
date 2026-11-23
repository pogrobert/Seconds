# M0 result 3: page rhythm, settings within each family, and the Wall

**Date:** 2026-11-14. **Why:** steps 3 to 5 of `docs/m0/02-variety-and-quality-plan.md`: make two sites with the same blocks feel different, give each family more than one look, and show many sites for one business side by side.

## Answer in short

- **Settings within each family** *(new, options for Robert to judge)*:
  - **Fonts:** three font pairings per M0 family.
    - Poster: Oswald, Anton, Big Shoulders.
    - Quiet: Newsreader, Instrument Serif, Cormorant Garamond.
    - Soft: Geist, Fraunces, Outfit.
  - **Palette:** two light palettes per family, plus a dark mode for every family.
  - **Corners:** square or slightly soft for Quiet; round or gentle for Soft. Poster stays square.
  - **Spacing:** regular, airy or compact.
  - **Coloured sections:** full-width bands, or inset panels on the page's ground.
- **How many looks** *(counted)*: 54 per Poster site, 216 per Quiet site, 216 per Soft site, before any layout choice (pairings × palettes and dark × corners × spacing × framing).
- **Page rhythm** *(new)*: four named patterns for the order of background colours down the page. Code turns the chosen name into a background per section, stored in the spec as before.
  - **Calm:** one ground, with a coloured call to action.
  - **Alternate:** ground and tint in turn.
  - **Colour blocks:** a block of colour every other section.
  - **Dark end:** the page darkens towards the bottom.

  Two neighbouring sections never share a colour block, except the dark end, which merges on purpose.
- **Footer wordmark fills the width in every family** *(fixed)*. A new kit piece, `FitLine`, sizes one line from its character count and the font's measured character width, with no JavaScript. The widths were measured in Chromium on 12 business names (`pnpm --filter @repo/eval advance`).
- **The Wall** *(new preview tool)*: `pnpm --filter @repo/eval wall` renders 24 sites for one business. Code draws each site's family, settings, light or dark, rhythm and block variants at random from what the content fits. The salon's Wall is published privately on a private review page.

## Checks *(measured)*

- **Contrast:** every family's palettes, light and dark, give AA contrast on every surface for 11 brand colours, including pure yellow, black and white.
- **Every combination of settings** builds a theme. Unknown families, settings and values are rejected (`checkStyle`).
- **The 24 salon Wall sites:** 0 problems at 360 and 1280 px. The check covers page overflow, elements sticking out, and axe WCAG 2.2 AA with the real web fonts.
- **Character limits in every font pairing** (`pnpm --filter @repo/blocks test:fonts`, new):
  - Every variant is filled to its caps and drawn in each of the 9 pairings, with the real fonts, at 360 and 1280 px. This is the README's rule "Tests prove those limits for every font pairing". The main browser gate still uses system fonts.
  - **First run: 6 of 9 pairings passed; all three Poster pairings failed.**
    - `cards/feature#tiles`: item titles in the big h2 size were wider than a 312 px tile, by up to 96 px with Oswald.
    - `text-media/editorial#heading-aside`, with Oswald only: the longest headline was 17 px wider than its column.

    The system-font gate had missed both.
  - **Fixed:**
    - Each tile is now its own size container, so the heading size follows the tile's width (`cards/feature` 1.0.1).
    - The side heading takes two fifths of the width instead of a third (`text-media/editorial` 1.0.1).

    Both blocks now pass in all 9 pairings.
  - **Time** *(measured)*: about 9 minutes for the whole run. It needs the network for Google Fonts, so it runs on its own, not in the fast gate.
- **Fast checks:** spec 75, blocks 447, pipeline 21, eval 5. Lint and types are clean.

## By eye (coordinator review)

- The 24 first screens read as different sites, not as one template recoloured. The biggest contributors:
  - the hero variant
  - the font pairing (Big Shoulders against Instrument Serif against Geist)
  - dark mode
  - inset framing, which gives Soft its rounded photo panels
- **Rhythm works:** Poster with colour blocks reads as a poster, and the dark end gives a page a clear close.
- **Weak spots seen:**
  - Photos repeat on a page: the stand-in business has 5 photos, and photo-led cards reuse them.
  - With the dark end, the call to action and the footer run together as one dark area. In inset framing they become three stacked dark panels.
  - The bento tiles without photos still look empty, the taste call from round 2.

## Where things live

- **Settings:** `packages/blocks/src/themes/index.ts`: `familyAxes`, `checkStyle`, `resolveStyle`, and `theme(id, brand, { axes, mode })`. The spec already had `style.axes` and `style.mode`; nothing in the spec format changed.
- **Rhythm:** `packages/pipeline/src/rhythm.ts`: `RHYTHMS` and `applyRhythm(plan, rhythm)`.
- **Fit-to-width type:** the kit's `FitLine` and the `type-fit` utility. `footer/wordmark` is now version 1.1.0.
- **Tools:**
  - the font-pairing check: `packages/blocks/test/browser/fonts.test.ts`
  - the width measurement: `tools/eval/tasks/advance.task.ts`
  - the Wall: `tools/eval/tasks/wall.task.ts`

## Not decided

All of these are options. Robert picks which pairings, palettes and rhythms stay, and whether dark mode and inset framing belong in M0. The decision model will be asked about rhythm and settings by name, so the list can shrink without code changes elsewhere.

## Robert's picks from the salon Wall (2026-11-14)

He liked 14 of 24: 01, 04, 05, 08, 10, 11, 12, 14, 15, 16, 21, 22, 23, 24. The picks are stored as taste data in `tools/eval/taste/2026-11-14-salon-wall.json`.

**The hero decides it** *(measured on these 24; one business, one rater)*:

| Hero | Liked |
|---|---|
| Photo-led: `hero/editorial#framed`, `#card`, `hero/overlay#bottom` | **9 of 9** |
| `hero/editorial#stacked` (huge headline, photo below) | 3 of 6 |
| `hero/overlay#center`, `hero/standard#split` | 2 of 4 |
| Text only or collage: `hero/standard#centered`, `#collage` | **0 of 5** |

- If he had picked 14 of 24 at random, the chance that all 9 photo-led heroes are among them is 0.15%. The chance that all 5 text-only or collage heroes are left out is 0.6%.
- The Wall's thumbnails show only the first screen, so the picks mostly judge the hero and the menu bar. They say little yet about the rest of the page.

**Everything else is too thin to read** (each setting appeared 1 to 13 times). Hints only:

- Fonts:
  - Anton and Instrument Serif were liked 3 of 3 each.
  - Geist 2 of 5, Cormorant 1 of 3, Big Shoulders 1 of 3.
- The calm rhythm was liked 3 of 7; every other rhythm 3 of 4 or better.
- Families were even: Poster 5 of 8, Quiet 5 of 8, Soft 4 of 8.

## Round 2 of the Wall (2026-11-14)

What changed after Robert's picks:

- **Code defaults (M0 arm B) use photo-led heroes** for all five kinds of business: `PHOTO_HEROES` in `packages/pipeline/src/defaults.ts`. This makes the defaults a stronger opponent for the decision model, which is fair.
- **The Wall's round 2** (`pnpm --filter @repo/eval wall`; `ROUND=1` reproduces round 1):
  - It draws the hero only from `PHOTO_HEROES`, with new seeds, and shows whole-page thumbnails. So Robert's picks judge everything below the hero.
  - It is on a private review page.
  - All 24 sites pass the browser checks at 360 and 1280 px *(measured)*.
- **Defect found by eye, fixed:** in `footer/simple#inline` (now 1.0.1), the details column was set one word per line, with a large empty area beside it. It appeared in 7 of 24 sites, and also in round 1's published sites.
  - Cause: in the wiped Tailwind theme, `max-w-md` resolves to the spacing token md (1.25rem), not a 40rem column width.
  - A contract rule now forbids `max-w-<spacing size>`.
  - The browser gate has a new check: text squeezed one word per line. It finds nothing else in the library *(measured)*.
