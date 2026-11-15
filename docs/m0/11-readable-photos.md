# Readable words on any photo, Signature in light, Atelier parked

**Date:** 2026-11-15. **Why:** Robert's scores for the directions drawn from the library (`docs/m0/10-directions-library.md`):
- Landscape and Wordmark scored 4, with notes that the text was hard to read.
- Signature scored 3: "i kinda do not like the black bg and square buttons".
- Atelier scored 2: the text was hard to read and the blur looked bad.

**Rating page, round 2:** https://claude.ai/artifact/9f24CvZeCgBR4aix9Uzb2F (private). It has 15 sites: 3 directions × 5 businesses.

## 1. Each photo is measured once, and words are placed and shaded for it

- **The spec:** an asset may now carry a `tone`, with how light and how busy its top, middle and bottom thirds are, each from 0 to 1 (`packages/spec`). This field is added only; nothing changes for existing sites.
- **The measurement:** `photoTone(rgba, width, height)` in `packages/pipeline/src/photo.ts` is a pure function, so the server and the browser can both run it.
  - `light` is perceived lightness, the cube root of the mean luminance.
  - `busy` is how much the luminance changes between neighbouring pixels.
  - The eval tools decode each photo in Chromium at 160 px wide (`pnpm --filter @repo/eval photo-tones`) and store the tone next to the photo's credit. The product will do the same when an owner uploads a photo.
- **The rule:** `wordsOn(tones, allowed thirds)` in `kit/photo.ts` decides three things:
  - the third the words sit on: the calmest one allowed
  - a soft halo of shade behind the words: enough for about 6:1 contrast for the name's thin light type, plus more where the photo is busy, and never less than a light halo
  - a slight dim over the whole photo, only for very bright photos

  Bright, calm photos stay bright.
- **Where it is used:**
  - Landscape (`hero/stage#sky`) sets the name on the calmer of the top and middle thirds.
  - Wordmark (`hero/stage#pair`) sets it across the middle of both photos, with the shade the busier and lighter of the two needs.

## 2. Signature on a light ground

- **The ground** is warm white, with no black anywhere. The colour comes from the drawings, one band in the brand colour (hours and location) and tinted bands.
- **The buttons** are the theme's own, now rounded, in the business's brand colour.
- **The menu bar** is dark on light (`header/over#on-light`).

## 3. Atelier is parked

- **The code and the family stay,** marked `parked` in `DIRECTIONS`, so any site already using it keeps working. It is no longer offered (`DIRECTION_IDS`).
- **The reason:** its look depends on one kind of bright photo, and its wash fails on everything else. We can revisit it now that photos are measured.

## Also fixed along the way

- **The menu bar's own ground:** it is meant to disappear over a full-screen opening. Its rule sat in a lower style layer than the class that painted it, so it never applied. It is now a utility of its own.
- **The halo** stays inside the page width.

## Checks *(measured)*

- **The 15 sites:** 0 problems at 1440 and 390 px. The check covers overflow, elements sticking out, covered text and axe WCAG 2.2 AA, plus whether each block can hold its content.
- **Browser gate:** 315 of 315.
- **Unit tests:** spec 75, blocks 540, pipeline 39, eval 5. Lint and types are clean.
