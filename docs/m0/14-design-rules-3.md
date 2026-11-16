# Design rules, round 3: the atmospheric direction, now on the build page

**Date:** 2026-11-16.

**Why:** Robert's reference picks (`docs/research/2026-11-16-reference-library.md`). All seven loved sites share one look:
- a single low-key photograph
- a deep or near-black page
- almost nothing on the first screen
- restrained type

The measurements agree. Loved first screens average 0.23 brightness, against 0.51–0.53 for the rest, and are richer in colour. He asked for this direction to be built and made testable on the local build page.

## What changed

The rules are in `tools/eval/src/grammar/`. Choosing designs moved into a shared module, `choose.ts`, used by both the proof task and the build page.

- **Photo layer (new):**

  | Rule | What it does |
  |---|---|
  | Natural | Photos as they are. |
  | Low-key | The business's atmospheric photo set leads; every photo gets a light grade (slightly darker, warmer, denser). |
  | Low-key portrait | The same, but a person leads the opening instead of the place. |

- **Low-key photo sets** (`pnpm photos --lowkey`): three photos per kind of business (a place, a person, a detail), 15 in all, from Pixabay with credits in the manifest.
  - Several first picks were wrong and were replaced: a Christmas tree, an aeroplane cabin and an anime drawing for the clinic set, a forest path for fitness, and a semi-nude portrait for the salon.
  - Moody salon and clinic photos are scarce. The salon "people" photo is bright, and the salon opening is the dark scissors photo.
- **Quiet opening (new hero rule):** one full-screen photo, one short line set modestly in the centre over a soft shade, one outlined button, and the area underneath.
- **Night (new colour strategy):** near-black with the faintest warmth of the brand colour, cream text, and the brand colour only as a small accent.
- **None (new detail rule):** restraint as a choice.
- **The atmospheric direction** (`ATMOSPHERIC` in `choose.ts`) narrows every layer to the rules that make up the look:

  | Layer | Allowed |
  |---|---|
  | Photo | low-key, low-key portrait |
  | Colour | deep, night |
  | Opening | quiet, photo first |
  | Detail | none, monogram |
  | Layout | editorial column, split, bands, framed, monument |
  | Type | the restrained voices: Couture, Gallery, Inscription, Grotesk, Heritage, Condensed |

  Jev still chooses within the direction for each brief.
- **The first screens differ:** the three designs for one owner now must differ in opening *and* in whether a place or a person leads, unless nothing else fits.
- **Fixed on the way:**
  - The quiet opening's centred line was invisible. The headline sizes itself from its box's width, and the box shrank to fit its content, so the width and the font size came out as zero.
  - The photo grade and the shade together made photos too dark; both were lightened.
  - Very large names on narrow screens are now capped at 20% of the width.

## The build page

`apps/web`, run with `pnpm --filter @repo/web dev`, at http://localhost:5173.

- **One server call per message:**
  1. **In parallel:** Jev names the kind of business, and reads the words (five scales and a direct pick per layer).
  2. **The words:** the text model writes them.
  3. **The looks:** code draws four. Looks 1–3 are the atmospheric direction; "Jev's pick" uses every rule.
- **The facts** are still the sample business's for each kind (prices, hours, address), so they are stand-ins.
- **The tabs** show each look's rules in a line above the preview.
- **The old hand-made directions** (Landscape, Wordmark, Signature) are no longer on the page. Their code stays in the library.

## Results *(measured on this computer, 2026-11-16)*

- **Checks:**
  - **Proof, round 3:** 64 pages (24 designs for the six salon briefs plus 40 random designs across every rule) at 1440 and 390 px. One random page tripped the tell linter (two small-capital labels above headings, at 390 px), a combination outside the atmospheric direction. Everything else passed: overflow, covered text, axe WCAG 2.2 AA and the tell linter.
  - **Unit tests:** pipeline 41, blocks 540.
  - **Lint and types:** clean in all six packages.
- **Build page:**
  - Leith colour studio (salon): 1.7 s (choices 0.3 s, words 1.3 s, drawing under 0.1 s), $0.0008.
  - Fire-cooking restaurant: 1.3 s, $0.0011.
  - Bath joinery (trades): 1.2 s, $0.0009.
- **Jev's open pick now often chooses the quiet opening and low-key photos by itself** (Northside, Velvet and Constitution in the run behind this report).

## Known limits

- **Photos still decide most of the result**, and stock low-key photos for salons and clinics are scarce. An owner's own photos will matter more than any rule.
- **The text model's words:** one wrote "inManchester" with no space. Not fixed, because a general rule would break names like "McDonald".
- **Follow-up messages** still rebuild rather than edit.
