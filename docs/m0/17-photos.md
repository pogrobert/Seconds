# 17. Photos that fit

Date: 2026-11-17. Robert saw a council site with an old iron, a blacksmith's workshop and an
electric car. He said to change the service if needed and find other ways, but no AI pictures.

## What was wrong

- **Borrowed photos.** When Pixabay hit its limit (100 searches a minute), the build fell back to
  another kind of business's sample photos. That's where the iron and the workshop came from.
- **Searches stock sites can't match.** The word model wrote searches with place names ("Bristol
  street with a van") and abstract words ("staff assisting residents"). Stock sites returned
  anything: New York traffic, a steamboat.
- **First result taken unseen.** The build used Pixabay's first result, which is simply its most
  popular photo for the words.

## Sources compared (same 5 briefs: council, bakery, tattoo studio, dentist, plumber)

| Source | Ordinary scenes | Real places | Terms |
|---|---|---|---|
| Pixabay | best of the three | poor | free, no hotlinking, ask before bulk use |
| Wikimedia Commons | poor | excellent (its "quality images" of Zamość, Lisbon, Glasgow) | free with credit and licence (mostly CC BY-SA) |
| Openverse | worst (a steamboat for a council) | mixed | some searches refused without a key |

Pexels still isn't issuing API keys. Unsplash stays out: its terms require hotlinking.

## What the build does now (`apps/web/src/server/photos.ts`)

1. **Searches for things a camera can see.** The word model writes searches such as "baker
   kneading dough", with no place names, and gives the town separately (also when it is only part
   of the name).
2. **Candidates.** Six Pixabay photos per subject (place, people, detail). When there is a town,
   three of Commons' quality images that name that town.
3. **A look.** One call to a small vision model (`google/gemini-2.5-flash-lite`) sees all
   candidates as small copies. It keeps only those that fit, best first, and answers whether a
   photo of the town itself suits this organisation. Town photos are used only when it says yes
   (yes for the council; no for the tattoo studio and the plumber). It only judges photos and never
   makes them. If the call fails it is retried once.
4. **Nothing borrowed.** If nothing fits, the page uses only blocks without photos and leaves out
   the gallery (library test: "draws a page with no photo at all").

## Measured

- **Vision models compared on the 5 briefs:**
  - gemini-3.1-flash-lite: 5–21 s and about $0.006 a site;
  - gemini-2.5-flash-lite: 2.2–2.9 s and about $0.0007 a site, choosing about as well.
- **The look itself:** the call took 4.9 s while the provider fetched about 35 photo links itself.
  Sending small copies inside the request instead is what brought it down.
- **On the build page:**
  - Zamość council: 5.9 s in all (photos 4.8 s), $0.0015, the town square from Commons.
  - Bristol plumber: 4.9 s (photos 3.8 s), $0.0020, all plumbing photos.

## Also fixed

- **Text cut off with "…".** The word model's length cap stopped text mid-sentence. The schema now
  allows a third more than the prompt asks for, and the existing length check asks for a shorter
  version instead of cutting.

## Open

- **Speed.** Builds now take about 5 s instead of about 2–3 s. The look is the slow part.
- **Dark photos.** The model's "dark, moody" picks are often not dark.
- **Duplicates.** Pixabay sometimes has the same photo under two ids, so it can appear twice.
- **Small towns.** Not measured yet: how often Commons has good photos of a small town.
- **Later.** The owner's own photos, from uploads or their website.

## The failing photo check, found and fixed (2026-11-17, measured)

- **Cause.** Google's Gemini refuses some photo sets outright ("Gemini blocked the response:
  OTHER"). The same set is refused every time, so asking again was useless. All 16 tries with
  physio's and florist's photos were refused. Gemini 2.5 Flash, the larger model, refuses them
  too. Gemini is also sometimes "rate-limited upstream" (HTTP 429).
- **Fallback models tried on those sets:**
  - Qwen3-VL-30B answers every set, $0.0004–0.0008, but takes 9–18 s.
  - GPT-5 Nano answers too, but takes 38–51 s.
- **Fix** (`apps/web/src/server/photos.ts`). When the whole set is refused:
  1. Ask about each subject (place, people, detail) on its own, all at once.
  2. Split a subject that is refused again into two halves, asked at once.
  3. Use Qwen only when both halves are refused.
  4. Leave a subject that no model will look at empty: unchecked photos are what this avoids.
- **The town question is now separate.** "Does a photo of the town suit this organisation?" is a
  text-only question, asked while the searches run, so it can't be refused and Qwen doesn't
  decide it. Before, Qwen put views of Lisbon on a florist.
- **Wikimedia previews are skipped unless the answer is yes,** and they use Wikimedia's
  ready-made thumbnail sizes: 330px to check, 1280px for the page. The 240px and 1600px sizes
  used before were drawn on request and took about 1 s.

**Core runs (30 briefs):**

| | before | Qwen fallback | + town question first | + halves, town search in parallel |
|---|---|---|---|---|
| "photo check failed" notes | 2 | 0 | 0 | 0 |
| median build | 5.4 s | 6.1 s | 4.9 s | 5.0 s |
| slowest 10% | 6.1 s | 7.4 s | 13.3 s | 7.2 s |
| median photo time | – | 5.1 s | 3.9 s | 4.1 s |
| cost per site | $0.0020 | $0.0020 | $0.0019 | $0.0019 |

Zamość's council keeps its own town photos (3.8 s for photos). Brno's council got none in the
last run: the check chose other photos.
