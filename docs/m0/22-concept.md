# 22. A concept for every page

Started 2026-11-20, after Builder came last on all eight briefs in the blind test against Lovable
and v0 (`21-vs-lovable-v0.md`). Robert chose to fix the concept and the words first.

## Decided by Robert (2026-11-19)

- **Colour: "leave the colour choices to Jev".** Jev already chose colours before 2026-11-17; the
  loud ways of using them looked cheap. So Jev now picks a named colour (oxblood, forest, sage…)
  and one of two quiet ways to use it. The loud ones stay out.
- **Writer: keep the fast model** (`gpt-oss-120b` on Cerebras or Groq).
- **Never invent facts**, as before.

## What changed

1. **Concept first.** The writer now decides three things before any words, in the same call:
   - `idea`: the one thought the page is built around ("bread while the town sleeps").
   - `voice`: three adjectives every other field is written in.
   - `sections`: the one or two extra sections this business's visitors need most (reasons,
     steps, audience, faq, statement or gallery).

   The prompt also:
   - bans stock headings ("Why choose us", "Our services"…);
   - asks for a distinctive name when the owner gives none;
   - shortens the introduction to two to four sentences;
   - shows one worked example (a Whitstable fishmonger) of the writing wanted.
   (`packages/pipeline/src/site-text.ts`)
2. **Shorter pages.** Every page has the opening, introduction, offer, closing and footer, plus a
   contact block when there are facts to show. It adds only the extras the concept picked; blocks
   that bring in a section the concept left out are not used. (`packages/library/src/page.tsx`)
3. **Colour from Jev.** One more question goes in Jev's art request, in parallel: which named
   colour suits the business. The page uses one of two colour rules, chosen as before from Jev's
   reading of the brief:
   - **Cream** (new): the same warm cream page for everyone, with the colour on buttons, accents
     and one band.
   - **Night**: a near-black page.

   The site's tokens now come from the rule's palette instead of fixed black and white.
   (`colour-rules.ts`, `library/src/theme.ts`, `apps/web/src/server/make-site.ts`)
4. **More thinking for the writer.** Its reasoning effort went from low to medium. On two briefs
   the words took 2.7 s and 3.4 s, against 1.2–2.7 s before (measured on the laptop). It is kept
   for the re-run so the blind result can show whether the time is worth it.

## Seen before the re-run (not rated)

- Names improved from "Calm Yoga Studio" to "Seaside Flow" and "Rapid Flow". They are
  distinctive but still plain.
- Headings follow the voice ("From call to fix", "When you need us").
- The writer still adds things now and then: a "Private session", an "Evening class", a
  "15-minute" sauna. The claim checks don't catch these yet.

## Re-run (measured, laptop dev server, 2026-11-20)

- Bench run `runs/2026-11-19-20-10-only-concept2`, the same eight briefs: 0 page problems,
  0 fact flags.
- **Speed:** page shows at a median of 3.6 s (p90 4.7 s), against 1.6 s before. Page and photos
  take 7.6 s.
- **Cost:** $0.0063 a site, against $0.0027 before. Most of the rise is the writer's extra
  thinking.
- **Page length:** median 4,000px at the comparison width, against 4,200–6,700px before.
- **First run thrown away.** The new cream rule had no stored profile, so Jev's reading
  underrated it and every version 1 came out dark, even the dentist's. Its profile is now in
  `rule-profiles.json`. On the re-run, dark versions appear only for the tattoo studio and one
  council version.
- **Still seen:**
  - Some stock headings ("What we offer", "Our services"). Some come from block labels such as
    "Visit" and "Questions"; others are the writer ignoring the ban.
  - Photos are still near misses (a moonlit silhouette for the yoga studio).

Round 2 rating: `/vs.html?set=vs2`, results in `tools/bench/vs2/ratings.json`.
