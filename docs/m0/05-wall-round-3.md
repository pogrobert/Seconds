# M0 result 4: Wall round 3, sites that look different

**Date:** 2026-11-14. **Why:** Robert, on round 2: "they are all so similar i don't even know why i should select them". He was right.

## What made round 2 look the same

- **The same photo filled most of every first screen:** the salon interior on all 24 sites.
- **The same words and the same purple** were on every site.
- **Only 3 banner layouts,** all "big photo with a text box on it".
- **The same 8 sections in the same order.**
- **The varied settings were too small to see** at a glance: corners, spacing, light tints, and most font swaps.

**The lesson for M0:** the decision model can only win the blind test if its choices make visible differences. Settings people can't see add nothing to the test.

## What changed

- **A new setting for every family: photo treatment.** The options:
  - natural
  - black and white
  - a soft wash of the brand colour

  It is set in theme CSS (`photoFilter` in `packages/blocks/src/themes/index.ts`). The first tint was too strong and looked neon; it was toned down by eye.
- **A new block with four banner layouts**, `hero/photo` 1.0.0. They are candidates until Robert's picks decide:
  - `half`: photo and brand colour, half each, edge to edge.
  - `cover`: a magazine cover, with the business name across the top of a full-width photo.
  - `portrait`: a tall photo that runs off the top and side of the page.
  - `triptych`: two or three tall photos in a row under the headline.
- **New kit pieces:**
  - `Panel`, a box in another surface's colours.
  - A both-ends photo shade.
- **The Wall (`ROUND=3`, now the default)** draws more per site:
  - **the banner photo:** any of the 4 salon photos that work as a banner
  - **the brand colour:** from 8 that suit a salon, standing in for the owner's colour
  - **the headline:** one of 4, standing in for the text model writing a few options
  - **the photo treatment**
  - **the section order:** the middle sections are shuffled and one is sometimes left out; the visit and call-to-action sections come in either order

  The other photos are shared out among the sections, so a page repeats a photo only when it runs out. Corners and spacing are no longer drawn.

## Defect found by eye, fixed

- **What happened:** with black-and-white or tinted photos, the text laid over a photo disappeared. The photo was painted on top of it.
- **Cause:** a CSS filter makes the photo its own layer, painted above plain boxes that come later in the page.
- **Fix:** the kit's text-on-photo pieces (`OnPhoto`, `PhotoShade`) are now positioned, so they paint above the photo.
- **Blocks affected before the fix:**
  - `hero/overlay`
  - `cta/feature#photo-banner`
  - the new cover banner
- **New check in the Wall:** headlines, subheads and main buttons must not be covered by anything. With the fix taken out, the check flags all three blocks *(measured)*.

## Checks *(measured)*

- **The 24 round-3 sites:** 0 problems at 360 and 1280 px. The check covers:
  - overflow
  - elements sticking out
  - axe WCAG 2.2 AA
  - covered text
- **Browser gate:** 278 of 278 pass.
- **Character limits with real fonts for `hero/photo`:** all 9 pairings pass.
- **Unit tests:** spec 75, blocks 474, pipeline 21, eval 5. Lint and types are clean.
- **Which banners came up:**

  | Banner | Sites |
  |---|---|
  | `hero/photo` (new) | 12 |
  | round-1 favourites | 12 |

## Where to look

- The Wall is on a private review page
- To rebuild it: `pnpm --filter @repo/eval wall` (`ROUND=2` reproduces round 2)

## Not decided

Robert's picks decide:
- which of the four new layouts stay
- whether black and white and the brand-colour wash stay
- whether the shuffled section order reads better than the default order

Corners and spacing could be dropped as settings altogether.

## Robert's verdict (2026-11-14)

"Pretty much all are fine and acceptable." He named no site as liked or disliked. The verdict is stored in `tools/eval/taste/2026-11-14-salon-wall-3.json`.

**What it means:**

- **For The Wall (M1):** random draws from this space already give sites the owner would accept. The Wall's basic promise holds for one salon: many different sites, all usable.
- **For M0's blind test:**
  - If random valid choices already look acceptable, the decision model can't win by avoiding ugly sites. It has to win on fit: whether a site suits its business and brief.
  - All 24 Wall sites were for one salon, so this round did not test fit. The 30 briefs, across five kinds of business with different tones, will.
- **The library's floor is acceptable;** what's left to decide is taste and fit. No option is removed on this evidence.
