# M0 result 6: the blind test

**Date:** 2026-11-14. **Rater:** Robert, blind, on https://claude.ai/artifact/78QGdzPNntwTKEWhNDseXa.
**Pass mark, set before any results:** the decision model must be preferred in at least 20 of 30 pairs against the code defaults, and must also beat random choices.

## Answer in short

**The decision model did not earn its place** *(measured)*.

| Comparison | Model preferred | Other preferred | No preference | Sign test, one-sided |
|---|---|---|---|---|
| Model (A) against the code defaults (B) | **14** | 12 | 4 | p = 0.42 |
| Model (A) against random choices (C) | **12** | 12 | 6 | p = 0.58 |

- **Against the defaults:** 14 is short of the 20 needed.
- **Against random choices:** a tie. The model did no better than picking at random from the same options.
- **Neither difference is distinguishable from chance.**
- **How the rating went:** all 60 pairs were rated in about 5 minutes, roughly 5 seconds each. So the test measures first impressions, mostly of the top of the page. That is also how an owner first meets The Wall.
- **No side bias:** left 23, right 27, no preference 10.

CLAUDE.md's rule for this outcome: "the product still works, and the effort moves from the decision machinery to the library and the defaults."

## By kind of business

| Kind | Model vs defaults (A–B–same) | Model vs random (A–C–same) |
|---|---|---|
| Fitness | 6–0–0 | 4–1–1 |
| Restaurant | 3–3–0 | 5–1–0 |
| Salon | 3–0–3 | 2–3–1 |
| Trades | 1–5–0 | 1–2–3 |
| Clinic | 1–4–1 | 0–5–1 |

The model won where it chose Poster or Quiet, mostly dark. It lost the clinics and trades, where it chose Soft and light nearly every time.

## What Robert preferred, whoever chose it

These counts come from the decided pairs where the two sites differed on that one setting *(measured; small numbers, one rater, and the settings vary together, so they are hints)*.

| Setting | Won | Lost |
|---|---|---|
| **Banner:** card on a full-width photo (`hero/editorial#card`) | 12 of 15 | |
| **Banner:** magazine cover (`hero/photo#cover`) | 9 of 12 | |
| **Banner:** text at the foot of a photo (`hero/overlay#bottom`) | 10 of 16 | |
| **Banner:** three photos (`hero/photo#triptych`) | 3 of 3 | |
| **Banner:** tall photo off the edge (`hero/photo#portrait`) | | 9 of 22 |
| **Banner:** half photo, half colour (`hero/photo#half`) | | 4 of 13 |
| **Banner:** framed photo (`hero/editorial#framed`) | | **0 of 13** |
| **Family:** Poster | 15 of 20 | |
| **Family:** Quiet | 9 of 17 | |
| **Family:** Soft | | **2 of 15** |
| **Mode:** dark | 13 of 17 | |
| **Mode:** light | | 4 of 17 |
| **Photos:** black and white | 5 of 7 | |
| **Photos:** brand-colour wash | | 6 of 18 |
| **Type:** Cormorant | 9 of 11 | |
| **Type:** Outfit | | 6 of 18 |

**Why the model lost:**
- **Its favourites are exactly the losers above:**
  - Soft in 14 of 30 sites, with Outfit in 11 of those
  - the tall-photo banner in 14 of 30
  - light pages
- **It chose by meaning,** for example "a dentist for frightened patients wants soft and gentle". Robert chose bold, dark, full-width photos almost whatever the brief said.
- **So the model's sense of fit and Robert's taste point different ways.** Part of that is the library itself: the Soft family looks weak next to the others, so choosing it costs a site even where it fits the brief.

**Note on earlier rounds:** in round 1 of the Wall, every photo-led banner was liked, including the framed one. Head to head, the framed banner never won. Liking a site on its own and preferring it over another are different measures.

## What this does not show

- **One rater, one sitting,** about 5 seconds a pair.
- **The model's sites may be easy to spot:** site A appears in both pairs of its brief.
- **Only the first M0 version of the questions was tested.** Different questions, such as "which looks better" instead of "which suits", or giving the model taste data, were not tried. A retest would need fresh briefs.

## Data

- **Unblinded ratings with each site's style and blocks:** `tools/eval/taste/2026-11-14-m0-blind.json`
- **The run itself:** `tools/eval/out/m0/live/`, including `rating-key.json` (not committed; the folder is ignored)
