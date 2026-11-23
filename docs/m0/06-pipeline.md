# M0 result 5: the generation pipeline and the 30 briefs

**Date:** 2026-11-14. **Why:** steps 3 and 4 of M0's build order (`docs/technical/README.md`): one decision model, one text model, questions about attributes, character-limit checks, records saved to files, then three versions of 30 briefs.

**Robert's decision (2026-11-14):** the decision model is TypeSafe's Jev, called directly and pinned to `jev-1.14.0`. It replaces Cloudflare's `clef-flash`. Cloudflare stays the host.

## Answer in short

- **The pipeline is built and runs end to end with stand-ins.**
  - All 30 briefs give three sites each: 90 sites, 0 problems at 360 and 1280 px.
  - The checks cover overflow, elements sticking out, covered text, and axe WCAG 2.2 AA with real fonts *(measured)*.
- **It has not met the real models yet.** The `.env` file has no `TYPESAFE_API_KEY` or `OPENROUTER_API_KEY`.
  - So the run so far is named `standin`: random decisions, and the sample's fixed words.
  - It tests the plumbing and nothing about taste.
- **Size of the decision request** *(estimated from its length; Jev counts the real tokens)*:
  - 40 to 45 questions, about 5,000 tokens
  - about $0.0002 per site at Jev's listed price of $0.042 per million input tokens
  - well inside Jev's limits: 64,000 tokens per request and 32,000 per question

## How a site is made (`packages/pipeline`)

1. **`generate()`** asks for the words and the decisions at the same moment.
2. **The decision model** answers one request of typed questions (`choose.ts`, `decide.ts`):
   - the style family
   - the typeface and page background for each family (asked speculatively; only the chosen family's answer is used)
   - light or dark
   - how coloured sections sit
   - the photo treatment
   - the page rhythm
   - which photo leads
   - whether each optional section stays
   - which section comes first
   - for every section, its attributes: pictures or not, arrangement, what leads, density, alignment

   It never sees a list of variants, so the number of questions does not grow with the library. The model reads the business's name, kind and place and the owner's brief. Question ids never reach it.
3. **The text model** writes every slot once (`text.ts`):
   - tagline, headline, subhead, about, visit, three reasons, three steps where needed, and the closing call to action
   - each slot has a hard character limit, enforced by a strict JSON schema and checked again in code
   - one retry names the slots that broke a limit
   - prices, hours and contact details never pass through it
4. **Code picks each section's variant:** the one whose attributes best match the answers, weighted by probability, among the variants that can hold the words. Missing answers take the code default, and the record says so.
5. **The record** keeps every wire request and response, the timings, the token counts and the cost of each call.

**Rules that apply to all three arms:**
- A business with photos opens with a photo-led banner (Robert's picks).
- At least one optional section always stays.

## The three arms (`tools/eval/tasks/m0.task.ts`)

| Arm | Who chooses | Words |
|---|---|---|
| A | The decision model | Written once per brief by the text model; every arm uses them |
| B | The code defaults for the kind of business | Same |
| C | The same questions as A, answered at random from a seed | Same |

The brand colour is the owner's in every arm. Blind pairs (A against B, A against C) get their sides from a seed. The key is in `pairs-key.json`, apart from the sites.

## The 30 briefs (`tools/eval/src/briefs.ts`)

- **Six owners per kind of business,** each asking for a different feel. Examples:
  - a loud late-night restaurant and a candlelit dining room
  - a cheap walk-in salon and a glamour salon
  - a children's dentist and a dentist for frightened patients
  - an emergency electrician and a lighting designer
  - a sweaty, high-energy reformer studio and a restorative one
- **Within a kind, the facts are the sample business's:** address, hours, prices and photos. So the blind test asks whether a site fits its brief, not only whether it looks good.
- **They are stand-ins written by Claude;** none is a real business.

## Also changed

- **Font pairings** now carry a plain description the decision model reads, such as "a fine, slightly condensed fashion-magazine serif".
- **The Wall's page checks** moved to `tools/eval/src/page-checks.ts`, shared with the M0 run.
- **Tests:** pipeline tests rose from 21 to 34. They cover:
  - the question compiler
  - resolving answers
  - the TypeSafe adapter, checked against a fake server: pinned model, key in the header, wire names mapped back, cost, one retry
  - the word limits
  - `generate()` with stand-ins

## The live run (2026-11-14)

Run on this computer, not on Cloudflare: TypeSafe `jev-1.14.0` and OpenRouter `openai/gpt-oss-120b` (served by Cerebras). Results are in `tools/eval/out/m0/live/`.

**Measured:**

| | Median | Slowest |
|---|---|---|
| Decision call (about 5,900 input tokens) | 254 ms | 402 ms |
| Text call | 770 ms | 2,052 ms |
| Both together (they run at the same time) | 771 ms | 2,053 ms |
| Model cost per site | $0.00098 | $0.00121 |

- **Totals:** 30 briefs and 90 sites. 0 failures, 0 text retries and 0 fallbacks to defaults. 0 page problems at 360 and 1280 px.
- **Cost:** about $0.03 of OpenRouter credit for the whole run. Robert's key has a $3 cap.

**What Jev chose:**
- Loud or sporty briefs got Poster, mostly dark: the late-night restaurant, the sweaty studio, the colour salon, the cheeky electrician.
- Calm, upmarket briefs got Quiet with a serif: the candlelit dining room, the colour studio, the premium studio, the lighting designer.
- Gentle briefs got Soft: the frightened-patients dentist, the family dentist, the eco salon.
- Overall it leans on favourites:
  - Soft in 14 of 30, and Outfit in 11 of those 14
  - the tall-photo banner (`hero/photo#portrait`) in 14 of 30
  - the calm rhythm in 19 of 30

**Three faults were fixed after a 2-brief trial:**
1. The call to action could be chosen as the first section; now only content sections are offered (questions version 2).
2. The writer turned a parking note into an address; it now gets the real address.
3. The writer's non-breaking hyphens are now replaced with plain ones.

**The words:** no invented prices, years or awards were found in the 30 copies. Every address the text mentions is the real one.

**Blind rating page:** a private review page
- 60 pairs: A against B and A against C for every brief.
- Site files have random names, and each brief's two pairs sit in different halves of the list.
- Choices are saved in the page's storage, which only the owner can read or write.
- The key is `tools/eval/out/m0/live/rating-key.json`; it never goes into the page.
- Built by `node tools/eval/src/rating-page.ts live`.
- **Known weakness:** site A appears in both pairs of its brief. An attentive rater could notice that the site seen twice is A.

## To run it for real

1. Add `TYPESAFE_API_KEY` and `OPENROUTER_API_KEY` to the project's `.env` file. Never paste keys into the chat.
2. Run `pnpm --filter @repo/eval m0`. The run is named `live`. `BRIEFS=salon-1,clinic-3` limits it to a few briefs.
3. Read `tools/eval/out/m0/live/summary.md`: times and cost per site, text retries, fallbacks and page problems.

**Still to build:**
- the blind rating page
- the deployed Cloudflare measurement (step 7)
- the shared-text overflow count (step 6)
- the paper mapping of 40 real sites (step 1)

## Not decided

- Thresholds such as dropping a section at p ≤ 0.30 are the report's starting guesses.
- Option-order bias is not corrected. The README says to run that once as an experiment.
- The text model is OpenRouter's `openai/gpt-oss-120b` with Cerebras or Groq first.
