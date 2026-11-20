# 23. Jev does more

Started 2026-11-20, after the concept step (`22-concept.md`). Robert: "what if we delegate to jev a
lot more" … "we can do all 4 now". Jev still has no taste of its own (the M0 rule): it matches
options that already look good, and judges whether words are true and specific.

## The four jobs

1. **Blocks and extra sections.**
   - Every block now has a one-line description of its look, taken from the comment above it
     (`packages/library/scripts/describe.py` writes `src/descriptions.json`; the registry test
     fails if a block lacks one).
   - Jev reads the brief and answers one question per section kind ("which design for the
     opening screen would suit it best?") plus one on which extra section visitors need most.
     The second extra is added only when Jev gives it at least 0.2.
   - These questions run in one request alongside the words, so they add no time.
   - Version 1 takes the best fit in every section. Versions 2 and 3 draw by fit. Before this,
     every block was drawn at random. (`make-site.ts` `pickParts`, `page.tsx` `plans`)
2. **Best of three.**
   - The writer gives two more names, headlines and offer headings beside its first.
   - Jev picks the most specific and fitting one. When the owner gave a name, there is nothing
     to choose.
3. **Checks on the words.** The request that already checked the FAQ answers now also asks Jev:
   - whether each offer item is something the owner never mentioned;
   - whether each item's description, each reason and each step states a fact the owner never
     gave (a duration, a time, a number, a price, a promise).

   What happens to anything flagged:
   - Invented items and reasons are dropped, keeping at least two.
   - Invented descriptions are blanked.
   - Steps with invented facts are dropped, and the steps section goes with fewer than three
     left.

   (`site-text.ts` `groundAnswers`)
4. **Which version shows first.** After the three versions are drawn, Jev reads what makes each
   different (its opening block, type rule and colour) and picks the one to show first.

## First build (yoga, measured on the laptop)

- **Time:** page in 2.9 s. Jev's block request took 0.3 s, in parallel with the words (2.4 s).
  The check took 0.2 s, and choosing the first version another 0.2 s.
- **Cost:** about $0.004 for the page.
- **Jev's picks:** the name "Sea Breath" and the headline "Quiet stretch before the tide" from
  the writer's options.
- **Removed by the checks:** both offer descriptions.
- **Missed:** "a ten-minute unwind" in the steps, which is why steps are now checked too.

## Re-run (measured, laptop dev server, 2026-11-20)

- **First run thrown away** (`runs/2026-11-19-22-45-only-jev`). At Jev's usual 0.5, the checks
  dropped general things any such place offers ("Filter coffee", the plumber's item
  descriptions), so offers shrank to two bare cards.
- **The fix:** items, details, reasons and steps now need Jev at over 0.75; the FAQ check stays at
  0.5.
- **Kept run:** `runs/2026-11-19-22-47-only-jev2`, 0 page problems, 0 fact flags.
  - **Speed:** page shows at a median of 4.3 s (p90 5.2 s); page and photos take 7.2 s.
  - **Cost:** $0.0077 a site.
  - **Length:** median 3,400px at the comparison width, against 4,000 in round 2 and 4,200–6,700
    in round 1.
- **Still seen:** the introduction is not checked and can still invent things (the plumber's
  "we answer within minutes").

Round 3 of the blind rating: `/vs.html?set=vs3`, the same eight briefs against the same Lovable
and v0 pages.

## Next (Robert's idea, 2026-11-20)

Ready, polished templates that Jev can pick from: whole pages designed as one piece, rather than
blocks drawn per section.
