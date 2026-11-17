# 19. Fuller pages

Date: 2026-11-17. Robert: "most of the pages are still kinda empty and do not feel like a real
landing page or a website".

## What was measured first

- **Our pages** (30 core briefs × 3 versions): median 184 words, 5 sections, 3,790 px tall at
  1280px wide.
- **The 97 real small-business sites** in the reference library (made by design agencies): median
  6,725 px tall. The middle half runs from 3,800 to 9,700 px.
- **The gap:** every section had very little in it, and the sections that fill a real site
  (reviews, questions, team, numbers) never appeared, because those facts are not invented.

## What changed

- **More words, written in the same call:**
  - a fuller about (300–560 characters);
  - one or two sentences for each service;
  - a statement in the owner's voice;
  - "how it works" in 3–4 steps;
  - 4–6 questions and answers;
  - who it is for, in 3–4 groups.
  
  The prompt forbids promises, policies, prices and times the owner did not give, and any
  mention of other pages or forms.
- **Three new section kinds** with three blocks each (`packages/library/src/blocks/core/more.tsx`):
  - statement: large, on the band colour, beside a photo;
  - steps: numbers, a line, cards;
  - audience: grid, list, beside a photo.
  
  The library's 21 question blocks are now used too. Page order: header, hero, about, statement,
  offer, steps, reasons, audience, gallery, questions, visit, call to action, footer.
- **Jev checks every answer** (`groundAnswers` in `packages/pipeline/src/site-text.ts`). Prompt
  rules alone let made-up answers through: "We do not charge an adoption fee", "use the online
  reporting form", "several grant programmes", "dental cleaning".
  - Jev judges each answer against the owner's words. One that adds anything about this
    organisation becomes "Get in touch and we will tell you."
  - At most two such answers stay. With fewer than two real answers, the page has no questions
    section (Zamość's council).
  - The check takes 190–290 ms. It is strict: "bring your cat and its medication" was replaced
    too.
- **The word check** also rejects "on our website", "the Meetings section", "listed on the site"
  and the like: this page is the whole website.

## Measured (30 core briefs, 90 pages)

| | before | fuller | fuller, answers checked |
|---|---|---|---|
| words per page (median) | 184 | 388 | 307 |
| height at 1280px (median) | 3,790 px | 6,032 px | 5,636 px |
| sections (median) | 5 | 11 | 10 |
| page shows (median) | 0.97 s | 1.21 s | 1.33 s |
| page shows (slowest 10%) | 1.8 s | 1.6 s | 2.0 s |
| cost per site | $0.0019 | $0.0024 | $0.0026 |
| page problems, fact flags | 0, 0 | 0, 0 | 0, 0 |

## Open

- **"Who it is for" is not checked.** The plumber's lists landlords, which the owner did not say.
  It is general knowledge, but a guess. The same Jev check could cover it.
- **Slow photo steps.** In the last run 4 of 30 photo steps took 11–24 s (Gemini refusing, then
  Qwen). The page still showed in about 1.3 s.
- **Fixed English labels** in the new blocks ("Step 1").
