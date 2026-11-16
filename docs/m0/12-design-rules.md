# Design rules instead of templates: the two-layer proof

**Date:** 2026-11-16.

**Why:** hand-making directions and rating them round after round is too slow, and it ends in a template box like other no-code builders. Robert wants sites in about a second, a decision model at the centre, and a different site for every owner. The proposal is to store design rules in layers, let the decision model pick a rule per layer, and have code compose the page. Any combination the rules allow must look good. This is the cheapest proof: two layers, six rules each.

**Rating page:** https://claude.ai/artifact/23edwuA74rDL4qu7UgD5wn (private). Scores are stored in the page's database, which only Robert can read or write.

## What was built

It is an experiment in `tools/eval/src/grammar/`, kept out of the block library on purpose. Run it with `pnpm --filter @repo/eval grammar`.

- **Layer 1, composition** (`compositions.ts`): where things sit. The six rules are below. A composition never sets a font.

  | Rule | What it does |
  |---|---|
  | Monument | The name set enormous across the page, above a wide photo, on a strict grid. |
  | Split | Two halves all the way down: words on one side, a full-height photo on the other. |
  | Editorial column | One narrow column with labels in the margin, and photos that break out to the edge. |
  | Bands | A full-screen photo opening, then full-width bands of colour, text and photos. |
  | Index | Numbered rows and thin lines, small captioned photos, prices and hours as tables. |
  | Framed | Centred, with arched photos and ornamental dividers. |

- **Layer 2, type** (`type-rules.ts`): every type role (display, statement, body, label, button, emphasis) as CSS variables.

  | Rule | Fonts |
  |---|---|
  | Didone | Bodoni Moda and Inter |
  | Grotesk | Inter Tight in heavy capitals |
  | Literary | Newsreader throughout |
  | Swiss | Instrument Sans and IBM Plex Mono |
  | Soft serif | Fraunces and Figtree |
  | Condensed | Big Shoulders Display and Source Serif 4 |

- **What keeps every pair safe:**
  - Each type rule records how wide its letters are. This was measured in Chromium as the widest of eight sample names and phrases: 0.42 to 0.60 em per character.
  - Headings are capped so their longest word always fits the column, and the giant name always fits one line.
  - Colours come from the brand colour: warm paper, near-black ink, a tint and the brand itself.
- **The decision:** Jev gets the owner's words and two questions, one per layer, with each rule described by feeling only. It answers with a probability for every rule. Code drops rules under 4%, then draws pairs in proportion to p(layout) × p(type) without repeats.
- **The words** are written once per owner by the text model (gpt-oss-120b on OpenRouter) and used in every design.

## Results *(measured, on this computer, 2026-11-16)*

- **Checks:** 41 pages (all 36 pairs for one owner plus 5 other owners) had 0 problems at 1440 and 390 px. The check covers overflow, elements sticking out, covered text and axe WCAG 2.2 AA.
- **Speed and cost per site:**

  | Step | Time | Cost |
  |---|---|---|
  | Jev | 0.31–0.34 s | $0.00004 |
  | Words | 1.1–1.24 s | $0.0007–0.0009 |
  | Drawing the page | 0.08 ms median | free |

  Jev and the words run at the same time, so a site takes about 1.2 s and under a tenth of a cent. That's not yet measured on a deployed Cloudflare address.
- **Jev reads the briefs clearly.** Rules over 4% only:

  | Owner | Words, in short | Layouts | Type |
  |---|---|---|---|
  | Northside Hair | calm, upmarket colour studio | column 69%, framed 20%, bands 6%, split 4% | Didone 65%, literary 29%, soft 6% |
  | Shore Cuts | fast, friendly, affordable | index 94% | soft 75%, Swiss 18%, grotesk 5% |
  | Velvet | glamour, bridal, decadent | framed 57%, bands 41% | Didone 100% |
  | The Colour Lab | bold, loud, vivid colour | bands 77%, monument 22% | grotesk 99% |
  | Fern | eco, soft, gentle | column 88%, bands 7% | soft 81%, literary 19% |
  | Constitution | old-school barbering, confident | index 32%, monument 21%, split 20%, column 13%, framed 9%, bands 5% | condensed 93%, Swiss 6% |

- **The limit:** for one owner, Jev leaves 4 layouts × 3 type systems = 12 pairs, not 20. Two layers of six aren't enough for 20 different sites per owner. More layers (colour, photo treatment, rhythm, details) multiply the count; that's the next step if the rating is good.

## Not done yet

- Robert's rating.
- Whether two pairs can look too alike. Robert answers this in the "how different" question on the rating page.
- Moving the rules into the spec and blocks. That waits for the rating.
