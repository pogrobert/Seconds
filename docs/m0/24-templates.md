# 24. Whole-page templates

Started 2026-11-20. In round 3, Robert saw that pages "feel stitched together instead of one
coherent website": different widths, repeating photos, a different style in every section.

The cause is that each block brings its own kit's width, spacing, corners and card style, and the
page has more photo spaces than photo searches. Templates fix this at the root. Robert:
"go ahead with the three templates".

## What a template is

One page designed as a unit (`packages/library/src/templates/`). Each template sets:
- one width and one spacing scale;
- one way of using the business's colour;
- one recurring detail;
- a fixed plan for its photos, each used once.

It reads the same content as the blocks, and Jev's extra sections (statement, reasons, audience,
steps, gallery, faq) each have a form in every template. It brings all of its own CSS, so the
block library stylesheet is not used. Jev's colour (as the deep "band" colour) and Jev's type rule
plug in through the same theme variables as before.

1. **Field.** The first screen is a field of the business's colour, with the promise set large
   and one tall portrait photo hanging over its lower edge. Below, every heading sits in a left
   column with its content on the right, on one 12-column grid. All photos are 4:5 portraits. For
   studios, cafés, salons, clinics and makers.
2. **Signal.** Practical and facts first:
   - a coloured strip with the phone or hours;
   - a very large headline beside a panel of facts;
   - one wide photo;
   - the same thick coloured rule opening every block.

   Steps are numbered because they are a sequence. For trades, clinics, councils and firms.
3. **Low light.** A dark page tinted by the business's colour. A full-screen photo has the promise
   set low; then narrow centred words alternate with photos that run edge to edge. The offer reads
   like a menu card, with dotted leaders to the prices. For tattoo studios, bars, evening
   restaurants, barbers and venues.

The three versions shown to the owner are now the three templates. Jev picks which shows first,
reading each template's description. On the three test briefs it picked Field for the yoga
studio, Signal for the plumber and Low light for the tattoo studio.

## Photos

- Each space now gets a photo no other space uses (`sitePhotos` in `make-site.ts`).
- A space with no fresh photo left gets its own drawn art, never a repeat.
- In a pair, a gallery or an edge-to-edge strip, a space with drawn art is hidden, because a
  missing photo reads better there than a coloured blob. The opening keeps its art.

## Measured (laptop, `runs/2026-11-19-22-58-only-templates2`)

| Brief | Page shows | Cost | Columns in the sheet (left to right) |
|---|---|---|---|
| Yoga | 3.4 s | $0.0065 | Field, Signal, Low light |
| Plumber | 2.4 s | $0.0043 | Signal, Field, Low light |
| Tattoo | 3.8 s | $0.0070 | Low light, Field, Signal |

Sheets: `24-templates/yoga.jpg`, `plumber.jpg`, `tattoo.jpg`.

## Seen (not rated)

- Every page has one width, one rhythm and no repeated photo.
- Weak spots that templates don't fix:
  - **Photos:** ink bottles and a fountain pen for a tattoo studio, a black-and-white tap for a
    plumber.
  - **Thin offers:** when the owner lists nothing and the checks remove some items, the offer can
    shrink to two or three names with no descriptions.
- **Grey brands:** a near-black colour (charcoal, black) makes Field's coloured first screen a
  flat grey.

## Template sources looked at

A research pass (2026-11-20) found one library of whole-page small-business templates under a
verified MIT licence:
- **scala-sites** (github.com/Alessandro114/scala-sites): 99 Next.js templates.
- Its barber demo is coherent but uses the familiar template look: spaced-out capital labels,
  "What We Do", a grid of identical cards.
- It also advertises the author's paid product inside the pages.

It is a source of structural ideas, not a clear step up. Everything else found was a single
theme, a SaaS page, or not licensed for us. HTML5 UP is CC BY 3.0, which is not on our list.

## Round 4 (measured, laptop, 2026-11-20)

- Bench run `runs/2026-11-19-23-01-only-round4`, the same eight briefs.
- **Speed:** page shows at a median of 3.8 s (p90 5.4 s); page and photos take 6.8 s.
- **Cost:** $0.0067 a site.
- **Problems:** 2, both a hidden photo space in the yoga studio's third version (not the version
  rated). 0 fact flags.
- **Jev's first pick:** Field for the café, Osteria Nonna and the yoga studio; Signal for the
  barber, dentist, plumber and council; Low light for the tattoo studio.
- **Rating:** Jev's first pick for each brief against the same Lovable and v0 pages, at
  `/vs.html?set=vs4`. Results go in `tools/bench/vs4/ratings.json`.

### Result (Robert's rankings, 2026-11-20)

| | Best | Middle | Worst |
|---|---|---|---|
| Builder | 3 | 2 | 3 |
| Lovable | 3 | 3 | 2 |
| v0 | 2 | 3 | 3 |

- Head to head: Builder beat v0 5–3 and lost to Lovable 3–5. In round 1 it was worst on all
  eight (0–8 against both).
- Builder was best for the café (Field), the dentist and the plumber (both Signal). It was second
  for the yoga studio and the council.
- It was worst for the barber (Signal), Osteria Nonna (Field) and the tattoo studio (Low
  light).
- Less blind than round 1: Robert had seen the rival pages. Rounds 2 and 3 were not rated.

## Fixes after round 4 (2026-11-20)

1. **Photo groups adapt.**
   - When some photos in a pair, gallery or strip fall back to drawn art, those are hidden and the
     rest share the row evenly.
   - When none are left, the whole section goes.

   (`templates/shared.tsx`)
2. **Made-up dishes.**
   - Jev is now also asked whether each offer item is a specific named dish, product, class or
     package rather than a broad category. Code checks whether its words appear in the owner's.
   - When both say it is invented, the item goes.
   - The writer also lists 2–5 broad categories from the owner's own words. When fewer than two
     real items are left, the offer uses those.
   - Result: Osteria Nonna's menu went from "Spaghetti Bolognese, Tagliatelle al Ragù, Risotto"
     to its own pasta, wood-fired dishes and Sunday lunch.
   - Still seen: the owner's "Mains £14–£22" is shown as the price of every item.

## Three more templates (Robert: "i think we can add more templates")

4. **Split.** Photos of the place run down the whole left half while the words run on the
   right. The offer is set as a printed price card, with a coloured block of hours and address at
   the end. For restaurants, cafés, barbers and salons whose prices matter.
5. **Poster.** The promise is set enormous on a block of the business's colour, with photos edge
   to edge and the offer as big names and prices between heavy rules. Colour and near-white
   alternate. For gyms, barbers, trades and places with attitude.
6. **Album.** Photos first: a short centred welcome over a mosaic of three photos, then soft
   centred words between wide pairs of photos. For B&Bs, venues, florists and makers.

Jev now ranks all six templates in its first request, alongside the words, so the choice adds no
time. The top three become the versions.

On ten briefs, Jev's first picks were:
- **Split:** café, Osteria Nonna, barber.
- **Signal:** dentist, plumber, council, law firm.
- **Field:** yoga.
- **Low light:** tattoo.
- **Album:** B&B.

**Measured** (laptop, ten briefs, `runs/2026-11-20-08-56-only-six`): the page shows at a median
of 2.8 s (p90 3.6 s) and costs $0.0053 a site.

**Seen:**
- The Skye B&B found no fitting photo at all, so Album (the photo-led template) showed words only.
- Poster's photo strip showed drawn art; it now follows the same hiding rule.

Sheet: `24-templates/split-album-poster.jpg` (Split, Album, Poster, Album).
