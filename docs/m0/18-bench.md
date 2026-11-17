# 18. The benchmark harness

Date: 2026-11-17. Robert asked for a harness to benchmark the builder. It is in `tools/bench`.

## How to use it

With the build page running (`pnpm --filter @repo/web dev`):

```bash
pnpm --filter @repo/bench bench --label my-change
```

```bash
pnpm --filter @repo/bench serve
```

The second command starts a small server. Then open http://127.0.0.1:8791 for the newest report,
or http://127.0.0.1:8791/rate.html to rate runs blind. `--only dentist,plumber` runs a few briefs.

## What it does

- **Briefs** (`src/briefs.ts`): 30 fixed briefs with tags.
  - The five M0 kinds, short and detailed.
  - Councils and civic bodies in real towns (Zamość, Brno, Much Wenlock).
  - Kinds the samples never covered: a tattoo studio, a vineyard, a law firm, a charity.
  - Briefs in Czech, Polish and German.
  
  A brief is never edited in place; a changed brief gets a new id.
- **Runner** (`src/run.ts`): builds each brief through `POST /api/build` on the running build page,
  so it measures the real runtime with real models and photos.
  - Saves each of the three versions as a page that opens on its own.
  - Screenshots each one on desktop, on phone, and as a whole page.
  - Runs one build at a time, because of Pixabay's limit.
- **Checks code can judge** (`src/checks.ts`):
  - pages that scroll sideways, text running off the edge;
  - photos that don't load, left-over photo tokens;
  - nearly empty sections, text cut off with "…", raw values, the number of main headings;
  - facts not in the brief: numbers, prices, emails, years, and claims such as "book online" or
    "years of experience";
  - the same photo used for different kinds of business.
- **Report** (`runs/<run>/report.html`): the numbers first, then every brief with its three
  versions, their blocks, and every flag.
- **Blind rating** (`src/rate.html`):
  - The same brief and version number from two runs, in random order.
  - Keys: ← left, → right, ↓ about the same, ⌫ back.
  - Ratings go to `tools/bench/ratings.json`, which is kept in git as the record of Robert's taste.
  - "Results" shows how often each run wins, and how often each block wins when the two sites
    differ.

## First runs (measured on this computer, 30 briefs each)

| | baseline | after fixes |
|---|---|---|
| built / failed | 30 / 0 | 30 / 0 |
| median time | 3.9 s | 4.1 s |
| slowest 10% | 6.6 s | 5.8 s |
| median photo time | 2.8 s | 3.0 s |
| cost per site | $0.0016 | $0.0017 |
| page problems | 66 | 6 |
| fact flags | 26 | 0 |
| sites with no photo | 16 | 7 |

## What the baseline found, and what was fixed

1. **Wrong business shown.** For the library and the German bakery, the word model went over its
   length limit twice. The build then showed the sample restaurant, menu prices included.
   - **Fixed:** after two tries, the long paragraphs are cut at a sentence, and the business is
     never lost.
2. **Made-up claims:** "book online", "years of experience", "review".
   - **Fixed:** the word check now rejects common claims the owner never made and asks again.
3. **Pixabay's limit.** Running two builds at a time hit the limit in 14 of 30 builds.
   - **Changed:** the harness now runs one at a time.
   - **Still open:** 7 of 30 still hit it, because a build can make up to nine searches.
4. **A misleading note.** "No OPENROUTER_API_KEY" appeared when the photo check had failed twice.
   - **Fixed:** the note now says the check failed.

## Open

- **Pixabay searches.** Fewer searches per build, and pacing by Pixabay's rate-limit headers.
- **The photo check.** It failed twice in a row for 2 of 30 builds. Cause not found yet.
- **The museum.** Its text still ends in "…".
- **Blocks don't change between runs.** Plans come from a seed made from the brief, so two runs of
  the same code use the same blocks. Run against run compares words and photos. To rate the blocks
  themselves, a run would need a different seed.
- **No vision score for photo fit yet.** Robert's ratings are the measure of taste.
