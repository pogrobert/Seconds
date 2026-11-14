# 0002: Style families

**Status:** Robert chose on 2026-11-14: **Poster, Quiet and Soft** are M0's three families. Workshop and Deep stay in the code as options, but are not used in M0. Questions 2 to 4 below are still open; none of them blocks M0.
**Viewer:** https://claude.ai/artifact/CsxSj5jiajesqcp8Cw2BKq (private): the five families on the same five sample businesses, side by side.

## What a style family is

A family turns a business's own brand colour into a complete look: a palette for four surfaces (base, muted, brand, inverse), fonts and a type scale, spacing, corner shapes, a button style and an art style for generated pictures. Blocks never change between families: only CSS variables do (report 02, D5). The spec stores the family as `style.family`, for example `"soft@1"`.

The code is in `packages/blocks/src/themes/index.ts`. Values come from `docs/research/07-style-inspiration.md`: 16 live sites measured on 2026-11-14.

## The five options

| Family | Feel | Fonts (Google Fonts) | Shape | Art (Surfaces) |
|---|---|---|---|---|
| Poster | Loud and local: huge condensed capitals, flat colour blocks | Oswald + Inter | Square, solid buttons | screenprint |
| Quiet | Hushed and expensive: small serif headings, wide margins, one dark ink | Newsreader + Hanken Grotesk | Square, outline buttons | aquatint |
| Workshop | Practical and precise: plain grotesk, typewriter labels, one safety colour | Schibsted Grotesk + IBM Plex Mono | Square, solid buttons | linework |
| Soft | Friendly and reassuring: light sans, rounded cards, pill buttons, pale tints | Geist | Round, pill buttons | underpaint |
| Deep | Moody and rich: dark jewel ground, pale compressed capitals | Antonio + Inter + Oxygen Mono | Pill buttons | mezzotint |

## What is checked

- **Contrast, in code** *(measured)*: `packages/blocks/test/themes.test.ts` checks every family against 11 brand colours, including yellow, white, black and the sky blue that failed on a real site. On every surface, body text, muted text, links and button text all reach WCAG AA (4.5:1). 55 of 55 pass.
- **In a browser** *(measured)*: `pnpm --filter @repo/eval styles` renders all 25 pages and checks each in Chromium at 360 and 1280 px with the real fonts. It checks for overflow and for axe WCAG 2.2 AA problems, including colour contrast. 25 of 25 pass.
- **By eye:** one page per family was looked at on desktop. Not every page has been looked at on a phone.

## Choices for Robert

1. ~~Which three families M0 tests.~~ Answered: Poster, Quiet and Soft.
2. Whether Deep is its own family, or a dark setting any family can switch on.
3. Anything to change within a family: fonts, corners, colour strategy.
4. Whether the "Storybook" idea from the research (warm, illustrated) deserves a family.

## Not decided here

- Fonts on published sites will be self-hosted, not loaded from Google (report 02, D11). The previews load them from Google Fonts.
- The axes within a family (density, corner size, palette strategy) are not exposed yet. Each family is one fixed point for now.
