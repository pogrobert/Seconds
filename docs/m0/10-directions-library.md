# The directions as library blocks

**Date:** 2026-11-15. **Why:** Robert scored four hand-made directions 4 or 5 (`docs/m0/09-directions.md`). A hand-made page only counts if the library can draw the same look for any business, with its own photos and words. So each direction is now built from blocks, and drawn for all five sample businesses.

**Rating page:** https://claude.ai/artifact/MVX7mABEbCspTfUitEK8Qc (private). 20 sites, the same 1-to-5 bar, scores saved with the page.

## What a direction is in code

- **A style family** (`packages/blocks/src/themes/index.ts`: `landscape`, `wordmark`, `signature`, `atelier`):
  - one font pairing and one palette
  - fixed neutrals from the photographs' world, with the brand colour as the accent only
  - its own spacing, corners and button style
  - the photo treatments it allows (`warm`, a gentle grade, for Landscape and Atelier)
  - a `name` type role for the business name when the name is the design
- **A fixed set of blocks and backgrounds** (`packages/pipeline/src/directions.ts`, `DIRECTIONS`). There is one slot for every kind of section the default pages use, and `directionPlan(kind, direction)` turns any kind's default page into the direction. Nothing is mixed across directions.
- **New blocks:**

  | Block | Variants |
  |---|---|
  | `header/over` | `on-dark`, `on-light`: a menu bar laid over the opening photo. It keeps a ground of its own unless a full-screen opening is under it |
  | `hero/stage` | `sky`, `pair`, `lettered`, `feature`: the four openings |
  | `cards/marks` | `row`, `stack`: reasons with drawings |

  The other sections reuse existing blocks; the family's type and spacing restyle them.
- **New kit pieces:**
  - `kit/marks.tsx`: six sets of flat drawings (dental, food, hair, trades, fitness and a general set), and `LetteredName`. The name is set one word to a line, the first O becomes the set's round drawing, and an A or I becomes its tall drawing, whichever letter that drawing resembles.
  - Fitted names now work inside centred layouts.
  - A soft glow behind light type on photos.
  - Washes of the page colour for dark words on light photos.
- **Supporting changes:**
  - Blocks can read the site's style settings (`ctx.axes`), used for the drawing set.
  - A new setting, `marks`.
  - A block may split its variants into several files: the stylesheet build, the contract test and the browser gate now read every file in a block's folder. Before this fix they read only `component.tsx`.

## Checks *(measured)*

- **The 20 sites** (4 directions × 5 businesses): 0 problems at 1440 and 390 px. The check covers overflow, elements sticking out, covered text and axe WCAG 2.2 AA, plus whether each block can hold its content (`pnpm --filter @repo/eval directions-wall`).
- **Browser gate:** 315 of 315.
- **Character limits with real fonts** (`test:fonts`): every variant passes in all 13 pairings, the 9 old ones and the 4 direction pairings.
- **Unit tests:** spec 75, blocks 540, pipeline 38, eval 5. Lint and types are clean.
- **Contrast:** every new family's palette passes AA for 11 brand colours.

## Found by eye and fixed

| Problem | Fix |
|---|---|
| Classes in the split banner files were never compiled, so the photo spilled over the page | The build, the contract test and the gate read every file in a block's folder |
| The fitted name had zero width inside a centred column, so it disappeared | Fitted names take the full width |
| Thin white names were hard to read on the sample businesses' busy or bright photos | An overall dim, darker top and bottom edges, and a soft glow |
| Lettered names put the drawings on their own lines | Drawings sit inline |
| A post-shaped drawing read as a gap where an A was | Each drawing replaces the letter it resembles |

## Known limits

- **These directions depend on photos more than anything else.** With the sample businesses' ordinary stock photos, Landscape and Wordmark are clearly weaker than the hand-made pages.
- **Atelier needs a bright photo.** On a dark one, the light wash makes the photo look milky. Choosing a direction should therefore take each photo's brightness into account, measured once when the photo arrives. That is not built.
- **The words are the samples' stand-ins,** so the about sections still say "About Northside Hair".

## Robert's scores (2026-11-15)

| Direction | Made by hand | From the library, 5 businesses | Notes |
|---|---|---|---|
| Landscape | 5 | **4, 4, 4, 4, 4** | "text is not very readable" (on 4 of 5) |
| Wordmark | 5 | **4, 4, 4, 4, 4** | |
| Signature | 5 | 3, 3, 3, 3, 3 | "i kinda do not like the black bg and square buttons" |
| Atelier | 4 | 2, 2, 2, 2, 2 | "text not readable, blur looks bad." |

**Each direction scored the same for every business.** So the scores judge the direction as built, not how well it fits one business.

**The library versions lost one to two points against the hand-made pages.** The causes are:
- **Readability:** light type over the sample businesses' ordinary photos, and Atelier's wash.
- **Signature's look:** the black ground and square buttons, which suited the hand-made page with its own drawings and colours but not this version.

Stored in `tools/eval/taste/2026-11-15-directions-library.json`.
