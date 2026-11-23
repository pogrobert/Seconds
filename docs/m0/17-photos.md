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

## Page first, photos after (2026-11-17, measured)

Robert: photos are the bottleneck; find alternatives, maybe use Surfaces, maybe show the page with
loading placeholders.

- **Two steps.**
  - `build()` (in `apps/web/src/server/make-site.ts`) writes the words, chooses the blocks and
    draws the page with a token in each photo space. It returns a photo job.
  - `sitePhotos(job)` then finds and checks the photos.
  - The build page shows the page at once, with a soft neutral shimmer in each photo space. When
    the photos arrive, each fades in, without reloading the page. Photos from an older build are
    dropped. The shimmer stays still for visitors who turn off motion.
- **Drawn art where no photo fits.** A space with no fitting photo gets Surfaces art (`underpaint`,
  calm, a quiet colour from the business's seed) instead of a photo-free page. It is drawn on the
  server in a few milliseconds. The style and colour are placeholders until Robert picks them.
- **The check starts sooner.** The town question and Wikimedia's photos no longer hold it back.
  Town photos (already named after the town) go straight into place when the town suits.
- **No 960px downloads.** Pixabay's download links refuse sizes other than their own (HTTP 400),
  so photos stay at 1280px. A first run with 960px gave every site drawn art.
- **Gemini "temporarily rate-limited upstream" (429)** now waits a second and asks once more,
  before splitting the set.
- **Other photo sources:** none better found. Pexels still has no keys, Unsplash requires
  hotlinking, Openverse was worse. The time is in checking and fetching, not in searching.

**Core bench (30 briefs):**

| | before (one step) | page first |
|---|---|---|
| page shows, median | about 5.0 s (all at once) | 0.97 s |
| page shows, slowest 10% | about 7.2 s | 1.8 s |
| photos, median | 4.1 s | 3.2 s after the page |
| page and photos, median | 5.0 s | 4.2 s |
| photo spaces with drawn art | – | 2 of about 150 (yoga) |
| cost per site | $0.0019 | $0.0019 |

**Bench:** it now runs both steps, reports "page shows" and "page and photos" separately, and
counts spaces with drawn art. Its headless Chromium lives in `tools/bench/.browsers`
(`pnpm --filter @repo/bench browsers`), because the system cache folder was cleared twice in one
day.

## Jev chooses the drawn art (2026-11-17)

- **Robert:** "let jev choose among all 12 and the colour too", and "the styles support
  light/dark modes so jev can decide based on website".
- **The choice:** `pickArt` asks Jev two multiple-choice questions in the call it already makes
  while the words are written, so no time is added:
  - which of the 12 Surfaces styles suits this organisation (each described by Surfaces' own
    catalogue);
  - how much colour: almost grey, muted, gentle or clear.
  
  The answer travels in the photo job. The 12 styles and 4 strengths are in
  `apps/web/src/server/art.ts`; `tools/eval/src/art-styles.ts` draws them side by side.
- **First picks:**

  | Business | Style | Colour |
  |---|---|---|
  | Funeral directors | aquatint | almost grey |
  | Employment law firm | aquatint | almost grey |
  | Berlin techno club | sfumato | clear |
  | Lake sauna, optician | papercut | muted |
  | Beekeeper | papercut | gentle |
  | Yoga | underpaint | muted |
  | Tattoo studio | aquatint | almost grey |

- **Light and dark:** each version's light or dark ground is already Jev's pick. A dark
  version's photo spaces get their own tokens, and the photo step draws the art in Surfaces' dark
  theme there. Photos are the same in both.

## A backup for the photo check (2026-11-24, measured)

During the editing tests Google AI Studio, the only provider of Gemini 2.5 Flash Lite on
OpenRouter, often answered "temporarily rate-limited upstream", and spaces went without photos.
Gemini 2.5 Flash has the same single provider, so the backup had to be another company's model.
`tools/bench/src/photo-models.ts` ran the look with eight models on the same six businesses:

| Model | Time | Cost a look | Notes |
|---|---|---|---|
| Gemini 2.5 Flash Lite (first) | 1.2–2.3 s | ~$0.0001–0.0006 | |
| **GPT-4.1 mini (backup)** | 4.4–5.6 s | ~$0.0006 | answered every time; picks about as good (better for a coding club, worse for a plumber) |
| Llama 4 Scout | 1.5–3.2 s | ~$0.0004 | kept nothing at all for two businesses in one run |
| Llama 4 Maverick | 2.9–5.3 s | ~$0.0014 | sometimes kept almost nothing |
| Claude Haiku 5.5 | 5–17 s | | often kept no people |
| Gemma 3 27B | 5.5–25 s | ~$0.0005 | |
| Mistral Small 3.2 | 8–35 s | ~$0.0001 | |
| GPT-4o mini | 4.3–6.8 s | ~$0.023 | 40 times the cost |
| Qwen 3.6 35B | 44–54 s | ~$0.008 | |

The look and the town question now send `models: [first, backup]`: OpenRouter tries the backup in
the same request when the first fails or is busy. With a first model that cannot take images, all
six businesses still got checked photos, in 3.4–4.3 s.
