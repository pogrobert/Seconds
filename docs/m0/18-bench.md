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

Three sets, chosen with `--set`:

| Set | Briefs | Used for | Default |
|---|---|---|---|
| `core` | 30 (`src/briefs.ts`) | blind rating by Robert, and the checks | all 30 |
| `wide` | 195 (`src/wide.ts`) | the checks only | a sample of 40, a different 40 each day (`--sample`, `--seed`) |
| `edge` | 16 (`src/edge.ts`) | briefs built to break things; each says what a good result does | all 16 |

- **How the wide set is made:** 60 kinds of business across shops, trades, health, food, civic,
  faith, education, culture, clubs, sport, freelancers, firms, farms, pets, events, nightlife and
  funerals. Each appears in three of five ways of asking: one word, normal, detailed with facts,
  messy, or with a tone. The place rotates between a big city, a small town and none. 15 more
  briefs are hand-written in other languages.
- **Why the wide set is sampled:** every build fetches stock photos, and Pixabay asks to be told
  before bulk use.
- **What the report adds:** "worst first" (failures, then invented facts, then the rest) and
  results by tag (area, way of asking, place, language).
- **Rating:** the rating page offers core runs only.
- **Pixabay's limit:** when a build hits it, the runner waits a minute and builds once more.

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

## First edge run (16 briefs, 2026-11-17, measured)

- **The code checks:** no failures and no page problems. Median time 5.4 s, $0.0019 per site.
- **Read by eye against each "good result":**
  - **Pass:** the prompt injection (a bakery, no poem), the Arabic restaurant, the funeral
    directors, the abuse charity's words, the all-caps plumber.
  - **Fails:**
    - **Long menu.** A 15-dish menu keeps only 8 dishes, because the word schema allows at most 8
      offer items.
    - **Contradiction.** "Closed every day but always open" is repeated as if it were true.
    - **Online candle shop.** Made-up candle products and "delivered to your door".
    - **Emoji pizza.** "The best pizza in town" is stated as fact.
    - **Long name.** Shortened to 40 characters.
  - **A false alarm in the fact check.** The owner's own "guarantee" was flagged. The check now
    compares word stems.
- **Pixabay's limit.** It was hit on 6 of 16 builds, one at a time. A build now makes at most two
  searches per subject (it was three), and the runner waits out the limit.

## First wide sample (40 of 195, 2026-11-17, measured)

- **The numbers:** no failures, and every site had photos. Median time 5.9 s, slowest 10% 7.8 s,
  $0.0018 per site. 30 page problems and 3 fact flags.
- **Text ending in "…" on 4 sites, a bug.** Any text without a full stop was treated as cut off,
  so whole phrases got an "…". Now only text that reached the schema's cap is cut.
- **Two false alarms in the fact check:** "£40," (a trailing comma) and "stars" ("under the
  stars"). Both are fixed.
- **Pixabay refusals (429) on 14 of 40 builds.** They were not the 100-a-minute limit:
  - The refusals carry none of Pixabay's rate-limit headers.
  - A build makes only 4 to 6 searches. Measured from Node, one photo search uses 3 of the 100,
    and the previews and downloads from the CDN count for nothing.
  - Something in front of Pixabay refuses requests from the Cloudflare runtime.
  
  **Fix:** searches now send a User-Agent, and a refusal without rate-limit headers is retried
  once after 1.5 s. The same 8 builds then had 0 refusals, against 6 of 8 just before.
- **The photo check failed twice** on 2 of 40 builds. Cause still not found.

## Edge failures fixed (2026-11-17, measured)

| Edge case | Before | After |
|---|---|---|
| 15-dish menu | 8 dishes kept | all 15, with every price, in all three versions |
| Long society name | cut to 40 characters | kept whole; wraps on desktop and phone |
| "Quiet, very loud, closed every day, open 24 hours" | repeated as fact | no opening times, no contradiction |
| Online candle shop with checkout | made-up products, "delivered to your door", then "checkout and card payment" | plain categories, "View collection", no payment words |
| "Best pizza in town 🔥" | stated as fact | not claimed |

**How:**

- **The word schema** allows up to 30 offer items. Listed items are kept exactly, with their
  prices. When the owner lists none, the model writes general categories, never made-up product
  names.
- **New prompt rules:** promise nothing the owner didn't; leave contradictions out (with a worked
  example); never claim to be the best.
- **The word check** rejects, and asks again about:
  - delivery or shipping promises the owner didn't make;
  - payment and checkout words (a simple website takes no payments);
  - superlatives such as "best … in town".
- **The library** skips the two heroes that show only 6 or 8 offer items when the list is longer.

**Core regression run (all 30):** 0 failures, 0 page problems, 0 fact flags, every site with
photos. Median 5.4 s (it was 4.1 s), slowest 10% 6.1 s, $0.0020 per site. The stricter checks
send more words back for a second try, which is the likely reason it's slower.

**Still open:**

- **Long names.** The name fills the menu bar; a short display name for names over about 40
  characters would help.
- **The photo check.** It still fails twice in a row now and then (2 of 30: physio, florist).
