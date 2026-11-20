# 26. Bringing the time down

2026-11-20. Robert: "next let's think how we can bring the time down." All figures are measured
on the laptop dev server, through OpenRouter, unless marked.

## Where the time went

| Step | Time | Note |
|---|---|---|
| Jev's choices (design, blocks, template, colour, art) | about 0.35 s | alongside the words |
| The words (`gpt-oss-120b` on Cerebras, medium effort) | 2.0–3.7 s | mostly hidden thinking: 2,000–3,600 of its output tokens |
| A second try when the words broke a rule | about +1.2 s | 2 of 6 briefs |
| Jev's check on the words | about 0.2 s | |
| Drawing the page | about 0.02 s | |
| Photos (search, vision check, download) | +2.3–3.5 s | started only after the page reached the browser |

- **Totals:** the page showed in a median of 3.7 s, page and photos in 6.9 s (round 5 bench).
- **Fixed cost:** every writer call costs about 1.1 s before it generates anything (network,
  routing, first token). Cerebras then writes very fast.

## What changed

1. **Low effort for the writer.**
   - On the same six briefs, low gave 1.5–1.7 s against medium's 2.0–3.7 s, with 100–960 thinking
     tokens instead of 2,000–3,600.
   - Jev's best-of-three picks and checks now cover some of what the extra thinking added.
   - (`writeSiteCopy`, option `effort`, default low.)
2. **No second try for wording.**
   - Answers that are too long or carry a phrase the checks flag are fixed in code, as they already
     were after a second try.
   - A second call is made only when the answer cannot be used at all: no answer, broken JSON, or an
     empty name or headline.
3. **Photos start early, on the server.**
   - A small separate call (`writePhotoQueries`) writes the three photo searches, the kind of
     business and the town, at the start, in parallel with the words.
   - With Jev's art pick, the photo step begins about 1 s in instead of after the page.
   - The photos come down the same live stream as the page (`/api/build-stream`), so the browser no
     longer asks for them separately.
   - If the early call fails, the photo step starts from the words' own searches.
   - The bench and the server function still run photos after the page, as before.

The vision model in the photo step stays. It is one call per build (`gemini-2.5-flash-lite`)
that looks at small previews of all the candidates and keeps those that fit
(`17-photos.md`). It is most of the photo step's time, but now it runs alongside the words.

## Result (measured, seven briefs through the stream)

| Brief | Page | Page and photos |
|---|---|---|
| Yoga | 2.1 s | 4.4 s |
| Plumber | 1.7 s | 4.2 s |
| Osteria Nonna | 1.5 s | 4.6 s |
| Zamość council | 1.6 s | 4.1 s |
| Tattoo | 1.5 s | 4.3 s |
| Café | 2.4 s | 6.1 s |
| Barber | 2.0 s | 4.9 s |

- **The page:** median about 1.7 s, against 3.7 s before.
- **Page and photos:** median about 4.4 s, against 6.9 s before.
- **In the browser:** the dentist example showed its page at 1.7 s and its photos at 4.6 s.

## Not yet measured

- **Quality at low effort:** no blind round has rated the words at low effort.
- **Cost:** the extra early call costs a little; the second try it removes and the shorter
  thinking cost less. Bench it before claiming a figure.
