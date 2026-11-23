# Reference library: real local-business sites

**Date:** 2026-11-16.

**Why:**
- The paid screen libraries (Mobbin, Gummble, Refero) collect app screens, not local-business websites.
- The free one closest to our kind of site (Inspo) has only about 8 real venues.

So we built our own library, for internal study only. We learn patterns from it; nothing from it ships, and no layout is copied.

## What is in it

- **The list** (`tools/eval/references/sites.json`): 104 sites found in agency portfolios (Pentagram, Here Design, Perky Bros, Hook Agency and others) and award galleries (Awwwards, Siteinspire), across our five kinds of business. 99 were confirmed live. Written by a research agent, 2026-11-16.
- **The capture** (`pnpm --filter @repo/eval references`, `tools/eval/tasks/references.task.ts`): each site once, at 1440 and 390 px.
  - It takes a first-screen and a full-page screenshot (git-ignored, in `tools/eval/out/references/`).
  - It measures fonts and sizes per role, colours by painted area, how much of the first screen is photo, buttons and headings (`references/measured.json`).
  - **Overlays:** consent banners, offers and other pop-ups are hidden on screen. Nothing is clicked, accepted or declined.
  - **Inner scrolling:** sites that scroll inside one container are expanded so the whole page is captured.
- **The summary** (`node src/references-summary.ts` → `references/summary.json`): the numbers per kind.
- **The picking page:** a private review page. Robert marks each site love, like or not for me; the picks are stored privately in its database.

## Capture results *(measured, 2026-11-16)*

- **Captured:** 98 of 99. Core Atelier Pilates refused the connection (HTTP/2 protocol error).
- **Full pages:** 86 captured whole.
- **First screen only (12):** Hart Bageri, MÁLÀ Project, noma, The Barbary, UNA, Alley Dental, Andy Sturgeon, Arne Maynard, Tom Stuart-Smith, 1Rebel, Humming Puppy and Y7. Some are genuinely one-screen homepages; others build or scroll their content in ways the capture doesn't follow.
- **A pop-up still shows (4):** HIDE, Quo Vadis, Townhouse and Othership. 53 is still slightly dimmed.
- **Not usable as references:**
  - Electric City now shows "Launching Soon".
  - One site shows a bot check, which we don't try to get past.
- **Time:** about 12 minutes for all 99.

## First numbers

- **Reliable:**
  - **Faces:** a default face as the only voice is rare: 0–8% of sites, except salons at 20%. The median site uses two faces; trades use one.
  - **Restaurants** favour square buttons (13 of 17 measured) and all-caps headlines (53%).
  - **Clinics** favour pill buttons (7 of 14).
  - **First-screen headlines** are large for salons (median 60 px), clinics (67 px) and fitness (66 px).
- **Not reliable yet:** the background colour ("pure white" is overcounted, because a transparent page reads as white) and how much of the first screen is photo (undercounted, because photos under text layers are missed). Fix both before turning them into rules.

## Next

- **Robert's picks:** read them from the picking page, then compare loved sites with the rest on the measured numbers.
- **Turn the patterns into rules:** a clinic colour strategy (burgundy, espresso or deep green on cream, never medical blue); a trades layer (two-colour van brand plus the phone number, reviews and booking at the top); the split in fitness between gyms (compressed type and neon on black) and pilates or yoga (salon-like).

## Robert's picks (2026-11-16)

He marked 98 sites: 7 love, 68 like and 23 not for me, with no notes. The picks are saved in `tools/eval/references/picks.json`.

- **Love:** KOL (restaurant), Remedy Place (wellness club), LAVA dental, Tom Stuart-Smith Studio (garden design), Dogpound (gym), Heartcore (pilates), Humming Puppy (yoga).
- **Not for me:**
  - *Restaurants:* Africola, Atelier Crenn, MÁLÀ Project, noma, Quo Vadis, Tacaloa.
  - *Salons, spas and barbers:* Blind Barber, Fellow Barber, Goldust Spa, Marco Ambrosi, Nine Zero One, Othership, Townhouse.
  - *Trades:* Electric City, Genz-Ryan, Lorenz Plumbing, Plain English, Terremoto, Thelen, Tuck & Howell.
  - *Fitness:* 1Rebel, Frame, Y7 Studio.
  - *Clinics:* none.

**Measured on the first-screen screenshots** (mean over each group; brightness and colourfulness 0–1, busyness = mean edge strength):

| Verdict | Sites | Brightness | Colourfulness | Busyness |
|---|---|---|---|---|
| Love | 7 | 0.23 | 0.43 | 0.06 |
| Like | 68 | 0.51 | 0.26 | 0.07 |
| Not for me | 23 | 0.53 | 0.23 | 0.08 |

- **Dark first screens** (brightness under 0.3): 5 of 7 loves, 17 of 68 likes and 2 of 23 rejects.

**Reading** (judgement, from 7 loves, so a small sample):
- **Loved:**
  - The opening is one atmospheric, low-key photograph: warm or coloured light on a deep ground.
  - The page is in one rich, deep colour (oxblood, forest green, black, warm brown).
  - Type is small and restrained, with a single quiet button and very little text.
  - It is calm and premium, not loud.
- **Rejected:**
  - *Salesy and cluttered:* the trades sites with badges, several calls to action and promotion strips; Frame's sale banner; Blind Barber's product advert.
  - *Quirky maximalism:* Africola, MÁLÀ Project, Tacaloa.
- **Capture artefacts:** some rejects may reflect the capture rather than the design. Townhouse showed a pop-up; 1Rebel a location chooser; Goldust Spa and Atelier Crenn a splash screen; Electric City a "launching soon" page.
- **Liked:** a wide range, so the bar for "love" is high and specific.
