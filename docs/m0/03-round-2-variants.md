# M0 result 2: variants that vary and look designed

**Date:** 2026-11-14. **Why:** Robert asked for more variety and better looks (`docs/m0/02-variety-and-quality-plan.md`). This round followed the plan's step 2 (expressive variants) and fixed the defects found in the audit.

## Answer in short

- **The library grew from 17 blocks and 37 variants to 24 blocks and 56 variants** *(counted)*. Seven new blocks, each built around one idea per variant:
  - `hero/editorial`: jumbo headline over a full-bleed photo; headline panel cut into the photo; floating card on a photo
  - `text-media/feature`: text panel overlapping a photo; opening line as a pull quote; wide photo with newspaper columns
  - `cards/feature`: bento with a photo lead; huge numerals on heavy rules; solid colour tiles; ruled accordion rows
  - `cta/feature`: headline and button across a photo; one jumbo line; two-tone split panels
  - `price-list/classic`: dotted leaders in two columns; a centred printed menu board
  - `hours-location/week`: a week strip of day columns; opening hours set large as the design
  - `footer/wordmark`: the business name huge along the bottom edge, with or without a sign-up
- **Three defects fixed:**
  - the washed-out photo overlay (now a dark shade with light text)
  - the empty column in `hours-location/split#with-text`
  - the ragged grid in `price-list/cards#featured`
- **Quality of the work** *(measured, as logged)*: 2 of 45 test runs failed (4%), against 20% in round 1. The agents went through 20 rounds of reviewing their own screenshots.
- **Every block passes every check** *(measured)*: 486 fast checks and 267 real-browser cases (at 360, 768 and 1280 px, with accessibility rules, the longest text and broken photos).
- **Cost** *(measured)*: 7 agents in parallel for about 9 minutes of wall time. They used about 1.23 million tokens (161k, 165k, 164k, 173k, 186k, 187k and 188k).

## What made the difference

- **A design bar in the brief** (`tools/eval/block-brief-2.md`): one idea per variant, clearly different from existing variants, photos as the star, scale contrast, restraint, and checked in all three families on desktop and phone.
- **New kit pieces:**
  - `type-jumbo`, sized per family, for editorial type
  - `PhotoShade` with `OnPhoto` for readable text over rich photos
- **A preview tool:** `BLOCK=<folder> pnpm --filter @repo/eval sheet` photographs a block in Poster, Quiet and Soft, at 1280 and 390 px, with real licensed photos. Agents looked at their own work and fixed defects before reporting.
- **Real photos** (Pixabay, credited) instead of abstract art.

## Coordinator review (by eye, every new variant)

All new variants read as distinct designs and hold up on phones. Two taste calls are left for Robert:

- `cards/feature#bento`: the small tiles look empty above their text when items have no photos.
- `text-media/feature#columns`: with short text, the body sits in one column on the end side, leaving the start side empty. The agent chose this deliberately.

## Open asks from the agents

- **Contract:**
  - a way to require item photos (`items[].media`) or a specific fact
- **Kit:**
  - a fit-to-width size for wordmarks (jumbo fills the width only in Poster)
  - a proper full-bleed option
  - a heading whose look is set apart from its level
  - a small-capitals style
  - a disclosure arrow that turns when a row opens
  - an icon set
  - more translated labels ("Book online", "Footer", "Contact")
- **Test content:**
  - photos in the typical action-band case
  - three or more item photos in price lists
- **Done in this round:** the contact sheet now builds content that shows every variant: required photos and forms are filled in, text is cut to caps, and item photos are added.
