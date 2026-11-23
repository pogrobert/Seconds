# Design rules, round 2: five layers, Score profiles, no AI tells

**Date:** 2026-11-16.

**Why:** Robert on round 1 (`docs/m0/12-design-rules.md`): "they're all fine… I just don't think they're 10/10". The research in `docs/research/2026-11-16-fine-to-ten.md` named the gap:
- sites don't commit: timid colour, no one bold move, no human detail
- our look is itself a known AI default
- the fonts are the ones every generator reaches for

**Rating page:** a private review page. It shows six salon owners, each with round 1's site beside three round 2 designs, scored out of 10.

## What changed

The code is in `tools/eval/src/grammar/`. Run it with `pnpm --filter @repo/eval grammar`.

| Layer | Rules | New in round 2 |
|---|---|---|
| Composition | Monument, Split, Editorial column, Bands, Index, Framed | Each marks its menu and opening so a hero rule can replace them. The 01/02/03 numbering and the label above every headline are gone. |
| Type | Couture (Gloock + Geist), Heritage (Young Serif + Hanken Grotesk), Gallery (Libre Caslon Display + Familjen Grotesk), Inscription (Marcellus + Petrona), Grotesk (Schibsted Grotesk), Wide (Zalando Sans Expanded + Spline Sans Mono), Condensed (Antonio + Besley), Friendly (Gabarito + Host Grotesk) | All eight are new and all OFL. Each is chosen to be less common than round 1's Bodoni, Fraunces, Newsreader and Inter Tight. There is no italic last word, and only the type systems whose voice is built on capitals use spaced-capital labels. |
| Colour | Paper (round 1's look), Brand ink (all text in deep brand colour), Deep (the whole page in dark brand colour with cream text), Vivid (the whole page in the bright brand colour) | New. Built in OKLCH with culori (MIT). Every text pair is pushed to a minimum contrast before drawing. A colourless brand gets a warm neutral; a grey brand cannot be "vivid". |
| Hero | Layout's own, Photo first (the room full-screen, name only), Type on colour (headline on the brand colour, photo in an organic shape) | New |
| Signature detail | Stamp (founding year and area, tilted), Monogram, Numbers row, Top strip (open days, late night, booking) | New. Built only from the business's own facts. A rule is offered only when those facts exist. |

**How Jev decides**
- **One request per brief, ten questions in parallel:**
  - five Score questions place the brief on five scales: energy, price, warmth, era and texture
  - five Choice questions give a direct pick per layer
- **Every rule was scored on the same five scales once**, from its own description, and cached in `rule-profiles.json`. Scoring all 25 rules cost $0.0008.
- **A rule's weight** is the average of its profile fit and Jev's direct probability.
- **Why both:** profiles alone gave the barber a gallery serif. The direct pick keeps specific matches such as "like a barber sign".
- **The three designs per owner:**
  - Design 1 takes the best rule in every layer.
  - Designs 2 and 3 are drawn in proportion to weight, each with a different layout and a different opening, so the first screens differ.
  - The "different opening" rule is relaxed only when no other opening fits. That happened for The Colour Lab, where two designs share the colour opening.

**Also added:**
- **Score questions in the pipeline's decision interface** (`packages/pipeline/src/decide.ts`), with a unit test.
- **A tell linter** (`tells.ts`). It flags:
  - a one-word emphasis in a headline
  - eyebrow labels above headings
  - decorative numbering
  - a default typeface as the only voice
  - gradient text
  - everything centred, unless the layout chose it
  
  Checked against round 1: it finds round 1's tells.

## Results *(measured, on this computer, 2026-11-16)*

- **Checks:** 58 pages (18 designs plus 40 random combinations) had 0 problems at 1440 and 390 px. The checks cover overflow, elements sticking out, covered text, axe WCAG 2.2 AA and the tell linter.
- **Bugs found and fixed:**
  - The root element's class tag clashed with a hero style and tinted whole pages.
  - The menu bar was missing in the colour opening.
  - A four-letter name in the Monument layout grew so tall it covered the menu. It is now capped at 20% of the width.
- **Contrast:** the lowest text pair in the 18 designs was 5.7:1.
- **Speed and cost per brief:** Jev plus the words took 0.7–1.5 s across runs and cost about $0.0008. Drawing the page takes about 0.2 ms.
- **Jev's picks** (from the run behind the rating page):

  | Owner | Asked for | Design 1 |
  |---|---|---|
  | Northside Hair | calm, upmarket colour | Editorial column, Couture, brand ink, photo first, monogram |
  | Shore Cuts | fast, friendly, affordable | Index, Friendly, paper, type on colour, top strip |
  | Velvet | glamour | Bands, Couture, deep, photo first, monogram |
  | The Colour Lab | loud, vivid | Bands, Wide, vivid, type on colour, top strip |
  | Fern | eco, gentle | Editorial column, Inscription, paper, photo first, monogram |
  | Constitution | old-school barber | Index, Condensed, paper, photo first, monogram |

- **Run-to-run variation:** small differences in Jev's answers change some lower-ranked picks between runs.

## Licence notes

- **Google Fonts "tags" data:** no licence stated. The google/fonts README says its top-level folders give the licence of the files in them, and `tags/` is not a licence folder. It was read only as a reference while choosing fonts by hand; nothing from it ships.
- **Font Library** (katydecorah/font-library) has CC0 tag data, but it is too thin for this use.

## Known limits

- **Photos:** the sample salon has five photos, so every design opens on the same room. Real owners' photos will vary more than any rule can.
- **Profiles:** the rule profiles come from descriptions, not from the rendered look. A rule whose description oversells it will be picked too often.
- **Untested beyond salons:** the other four kinds of business haven't been tried yet.
