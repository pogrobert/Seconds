# 20. Motion back in the blocks

Date: 2026-11-17. Robert: "let's bring back animated blocks that we stripped".

## What the originals animated

The free repositories animate far less than expected. Their Motion helpers (InfiniteSlider,
Marquee) mostly drive logo strips, which were never ported. In the kinds we did port, ten originals
moved:

| Our block | Original | Motion |
|---|---|---|
| `shadcnui/hero-03` | hero-03 GradientText | a slow gradient moving through the badge |
| `shadcnui/hero-07` | hero-07 AnimatedGridPattern | squares of the grid light up and fade (30, at most 10%) |
| `shadcnui/testimonials-04` | testimonials-04 Marquee | two rows of quotes scrolling, the second reversed, pausing on hover |
| `tailark/hero-veil-four` | Veil hero four header (useScroll) | the header narrows into a floating pill with a blur behind it as the page scrolls; the links fade |
| `tailark/testimonials-dusk-two` | Dusk testimonials two (AnimatePresence) | one quote at a time, changing every six seconds |
| `efferd/testimonials-1` | testimonials 1 columns | each column scrolls up without end, at its own speed |
| `efferd/testimonials-2` | testimonials 2 (whileInView) | cards fade in from a blur, one after another |
| `efferd/footer-2`, `efferd/footer-5` | footer 2 and 5 AnimatedContainer | the columns fade in one after another |
| `efferd/gallery-1` | image-gallery 1 lazy image | photos fade in as they come into view |

## How

- **`packages/library/src/motion.ts`.** Blocks carry markers in their server-drawn HTML:
  `data-m="reveal"`, `marquee`, `marquee-y`, `gradient-text`, `grid`, `scroll-header`, `rotate`.
  A small style and script, about 3 KB, run the same effects with the browser's own animation
  tools.
- **Only where needed.** `renderSite` adds them only to pages with a marked block. In the core
  bench that's 28 of 90 pages.
- **No React in the browser.** The originals use Motion's React components, but these effects need
  no React running there. React can still be added later for a block that truly needs it.
- **Never hidden by mistake.** Content is hidden only once the script runs: a small script in the
  head hides what will fade in, and shows it again if the main script hasn't started within 3 s.
  With motion turned off (`prefers-reduced-motion`) nothing moves.
- **The bench** takes its screenshots with motion turned off, so a whole-page shot never catches
  a section mid-fade.

## Checked (measured)

- **In a browser,** on three demo pages:
  - the quotes strip moved from −73 px to −89 px in 1.2 s;
  - the floating header narrowed to 768 px once scrolled, with the page blurred behind it;
  - the quote columns moved;
  - between 5 and 19 grid squares were lit at a time over 3 s;
  - one of the two Dusk quotes showed at a time;
  - gallery photos had faded in where they were in view.
- **Tests:** library 840, including three for motion: the ten blocks are marked, only known
  markers are used, and only pages with a moving block get the script.
- **Core bench (30 briefs):** 0 page problems, 0 fact flags, the page shows in 1.39 s (median).

## Open

- **Motion people see often.** Only 28 of 90 pages have a moving block, and most of those moves
  are in footers and quotes, which appear only when the owner gives quotes. A gentle fade-in for
  sections on other blocks would be new motion, not restored, so it is Robert's call.
