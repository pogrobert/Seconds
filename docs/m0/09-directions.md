# Five directions, designed by hand

**Date:** 2026-11-15. **Why:** the taste board (`docs/m0/08-taste-board.md`) showed what Robert loves. Before anything goes into the block library, each direction gets one complete homepage designed by hand, to be rated against a fixed bar: would he proudly hand it to the owner?

**Rating page:** https://claude.ai/artifact/67XNHEKJxKEE5EzHuLeCqo (private). Scores are 1 to 5, with a note.

| Direction | Business (invented stand-in) | The idea | From |
|---|---|---|---|
| Landscape | Hollis & Reed, garden builders, Cotswolds | A full-screen photo of the place; a thin serif name in the sky; almost no interface | Barr Build, Sóller, Castor |
| Atelier | Tidewater Pilates, Deptford | A bright studio photo with a gentle warm grade; a large light lowercase serif headline low on the left | Core Atelier |
| Spread | Northside Hair, Leith | A magazine spread: a warm photo on one half, white space with a small name and a second photo on the other | Casa Bosques |
| Wordmark | Marrow & Vine, Ancoats | Two food photos side by side, the name huge and thin across both; below, a centred page set like a printed menu | Era Ceramics |
| Signature | Seafront Family Dental, Dún Laoghaire | No photos: heavy condensed letters on black, two letters swapped for drawings from the place | The Rechabite |

## Notes

- **Facts:** each page uses the sample business's real facts (prices, hours, addresses) where the kind matches. The garden builder is new.
- **The words** are written by hand, standing in for the text model.
- **Photos:** 18 Pixabay photos, picked by hand from 141 previews in 12 searches. Credits are in `tools/eval/photos/directions.json`; the files stay out of git, like all stock photos.
  - The free API gives at most 1,280 px wide, so full-screen photos are slightly soft on large screens.
  - Pixabay's range is limited: the salon and dental photos were the weakest, which is why Signature uses none.
- **Checks** *(measured)*: all five pass at 1440 and 390 px, with no overflow, nothing sticking out, no covered text and no axe WCAG 2.2 AA violations (`pnpm --filter @repo/eval directions`).
- **The pages are plain HTML and CSS, with no JavaScript.** They are references, not yet blocks. The winners get broken into blocks under the block contract afterwards.
