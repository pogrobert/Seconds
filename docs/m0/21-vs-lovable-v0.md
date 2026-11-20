# 21. Builder against Lovable and v0

Started 2026-11-18. Robert asked for a blind comparison before going public: are Builder's
sites as good-looking as those from code-writing builders, and how much faster is it?

## Method

- **Ten briefs** from the bench's core set: café (short), Osteria Nonna (detailed), Fade & Co
  barber (prices), Leeds dentist, Bristol plumber, Brighton yoga, Zamość council, Glasgow
  tattoo, Birmingham employment law, Skye B&B.
- **The same words, one try each.** Each brief was pasted unchanged into each tool, with no
  follow-up messages and no fixes. Builder's version 1 is used, not the best of its three.
- **Accounts.** Robert's free plans:
  - Lovable's free plan allows about 5 builds a day ("free build credits", about 0.9 a build).
  - v0's free plan uses only its small model, "v0 Mini" (as of August 2026). The paid models
    may do better.
- **Screenshots:**
  - Whole pages, at the same width: a 1908px-wide window drawn at 1568px, with a 16px strip cut
    at the right.
  - Lovable and v0 previews were captured in Chrome one screen at a time, at exact scroll
    positions, and stitched (`tools/bench/src/vs_stitch.py`).
  - Before capturing, each page was scrolled through once, so content that fades in on scroll
    had appeared.
  - "Edit with Lovable"-style badges were hidden.
  - On 2026-11-19 Chrome drew the same 1908px window at 1512px instead of 1568px, so Lovable's
    yoga, Zamość and tattoo pages were stitched at that size and scaled up 2.6% to the same
    width as the rest.
  - Builder's pages were taken by Playwright with motion off (`tools/bench/src/vs-builder.ts`).
- **Blind rating.** `pnpm --filter @repo/bench serve`, then http://127.0.0.1:8791/vs.html:
  - The three pages are shown side by side in a shuffled order, with no tool names.
  - Robert picks the best and the worst.
  - Totals are shown only once all ten briefs are rated.
  - Rankings are saved to `tools/bench/vs/ratings.json`.
- **Not fully blind.** Two things can give a tool away:
  - v0 wrote the Zamość council site in Polish; Builder writes English.
  - Lovable and v0 make their own pictures with AI; Builder uses stock photos or drawn art.

## Speed (measured)

| | briefs | median | fastest | slowest |
|---|---|---|---|---|
| Builder, page shows | 10 | 1.6 s | 1.2 s | 2.6 s |
| Builder, page and photos | 10 | 5.1 s | 4.2 s | 9.3 s |
| Lovable, until finished | 8 so far | 57 s | 44 s | 4 min 24 s |
| v0, its own "worked for" time | 10 | 2 min 21 s | 41 s | 4 min 1 s |

- **Builder:** the bench run `runs/2026-11-18-19-18-only-vs-lovable-v0`, on the laptop dev
  server, not a deployed address.
- **Lovable:** timed from Enter until its reply finished. The first two (café, restaurant) are
  upper limits, because I checked only every 30–60 s. From the yoga brief on, I checked every
  second. Zamość took 4 min 24 s.
- **v0:** its own "Worked for" figure.
- Raw figures are in `tools/bench/vs/times.json`.
- **Cost:**
  - Builder: about $0.0027 a site (measured).
  - v0: credit went from $5 to $4.36 over ten builds, about $0.06 each (estimated from the
    displayed balance).
  - Lovable: shown only as free credits.

## Seen while capturing (not ratings)

- **Lovable and v0 make their own pictures.** Lovable's are AI images made for each site; v0
  mixes AI images and stock. Robert ruled AI pictures out for Builder.
- **Both invent facts:**
  - Lovable's plumber claims "60 min typical arrival" and "Gas Safe registered".
  - v0 put the Birmingham law firm in Birmingham, Alabama, with a (205) phone number.
  - v0's tattoo portfolio shows unrelated stock photos (a crowd, a road, a field).
  - Builder's claim checks exist to stop this kind of thing.
- **v0's quick pages have broken photos.** For two briefs (café, B&B) v0 made a quick
  standalone page whose photos don't load, in v0's own preview too.
- **Page length.** Builder's pages are much longer:
  - Builder: 4,200–6,700px at this width.
  - Lovable: 1,250–1,800px.
  - v0: 1,380–2,570px.

## Result (measured, Robert's blind rankings, 2026-11-19)

Builder was ranked worst on all eight briefs.

| Brief | Best | Middle | Worst |
|---|---|---|---|
| Café | Lovable | v0 | Builder |
| Osteria Nonna | v0 | Lovable | Builder |
| Fade & Co | Lovable | v0 | Builder |
| Leeds dentist | v0 | Lovable | Builder |
| Bristol plumber | Lovable | v0 | Builder |
| Brighton yoga | Lovable | v0 | Builder |
| Zamość council | Lovable | v0 | Builder |
| Glasgow tattoo | Lovable | v0 | Builder |

- Head to head: Lovable beat Builder 8–0, v0 beat Builder 8–0, Lovable beat v0 6–2.
- Builder is 30–90× faster and costs well under a cent, but on looks it is not close.
- I saw the first two rankings by accident on 2026-11-19 while checking the page; the
  captures for the last three were already fixed by then.

## Why Builder lost (my reading of the pages side by side, not measured)

1. **No idea behind the page.** Lovable and v0 give each business a concept: a name ("Still"),
   a line with a voice ("Slow mornings, by the sea"), one palette and type pairing that fits.
   Builder's pages read as a template filled in: "Calm Yoga Studio", "Our Services",
   "Why choose us", "About Bristol Emergency Plumbing".
2. **Words restate the brief.** "Small morning classes with a sauna", "We offer a calm
   environment for yoga and sauna". The rivals write like a copywriter and add concrete detail
   (class times, opening hours), partly by inventing it.
3. **Pictures don't fit.** Builder's stock photos are near misses (yoga on a park lawn for a
   Brighton studio, a dental tray of syringes, a chrome tap) and empty spaces show soft pink
   gradients. The rivals' pictures, mostly AI-made, show exactly the place described.
4. **Too long and too boxy.** Builder's pages are 2–4× longer, with grey cards, small boxed
   photos and repeated sections. The rivals say less, with one strong hero and a few confident
   sections.
5. **Generic type and colour.** Builder's versions mostly look black-on-white or grey; the
   rivals choose a serif-plus-sans pairing and a warm palette per business.

## Status

- Briefs 1–8: all three tools captured (Lovable's yoga, Zamość and tattoo on 2026-11-19).
- Law firm: Lovable stopped to ask whether to build the site or research existing firms; I
  submitted its preselected answer ("build the firm's website"), which adds nothing to the
  brief. It then paused at about 6 minutes because the free credits ran out. Not captured.
- B&B: Lovable not started.
- Robert judged eight briefs enough (2026-11-19): the law firm and B&B are left out of the
  three-way rating. Builder and v0 have both, if they are ever needed.
- Today's 5 free credits covered only 3½ builds (Zamość was long), against 5 yesterday.
- Rating: all eight rated blind, finished 2026-11-19.
