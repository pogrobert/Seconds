# Brief, round 2: blocks that vary and look really good

Read `tools/eval/block-brief.md` first. **Every rule, check and log step in it still applies.** This round adds a design bar.

## Why this round exists

Robert reviewed the sample sites. They pass every check, but they look like templates:

- The variants of a section type barely differ from each other.
- Nothing is art-directed.
- Photos are washed out under light shades.

He shared current, well-designed sites from recent.design as the bar to aim for:

- confident editorial type with real scale contrast
- photography used big and cropped with intent
- restraint
- a clear idea per section

Your job is to add variants that are **clearly different** from what exists and **look designed**.

## Read before designing

1. The contact sheets of every existing variant, with real photos, in all three M0 families (Poster, Quiet, Soft):
   - `tools/eval/out/sheet/<family>/<section>-1280.png`
   - `tools/eval/out/sheet/<family>/<section>-390.png`

   Open them with the Read tool. Your new variants must not look like any of them.
2. `docs/research/07-style-inspiration.md`: the five families, and the section ideas worth taking ("Section ideas worth taking").
3. `docs/m0/02-variety-and-quality-plan.md`: what was found weak.
4. The kit again: there are new pieces.
   - `Heading` takes `style="jumbo"`, an editorial size larger than display, sized per family. Use it for one short line that _is_ the design, and cap that field tightly.
   - `PhotoShade` (from `bottom`, `start` or `even`) plus `OnPhoto`: the only way to set text over a photo. The text switches to light-on-dark and the photo stays rich.
   - `Picture` crops by focal point. Choose aspect classes with intent: `aspect-portrait`, `aspect-square`, `aspect-landscape` or `aspect-wide`, changing at `@md:` or `@lg:` where it helps.

## The bar

1. **One strong idea per variant**, which you can name in five words or fewer ("jumbo headline over full-bleed photo"). Its `describe` says when to choose it.
2. **Clearly different** from every existing variant of the section, in layout and not only in spacing. If you put it next to the existing sheet and squint, it should read as a different design.
3. **Photos are the star wherever a variant shows one.** Make them large, cropped with intent, and full-bleed or deliberately framed. Never put a light wash over a photo. Text over a photo only through `PhotoShade` and `OnPhoto`.
4. **Scale contrast and rhythm:**
   - jumbo or display type against small labels
   - generous space
   - a clear grid, with asymmetry welcome
5. **Restraint.** Tokens only, as before: no decoration for its own sake, no shadows, no gradients except the kit's shades.
6. **It must work in all three families and on phones.** Poster (huge condensed capitals, square corners), Quiet (small serif headings, airy) and Soft (light sans, rounded). Look at your own screenshots at 1280 and 390 px in all three.
7. **Without photos, it still looks designed,** wherever the section type allows no image.
8. **Accessibility is unchanged:** real headings and lists, link text, tap sizes. The browser checks enforce contrast.

## Process for each block

1. Write the manifest and the component (block contract as before).
2. Run `BLOCK=<folder> pnpm exec vitest run` and `BLOCK=<folder> pnpm test:browser` in `packages/blocks`.
3. Run `BLOCK=<folder> pnpm --filter @repo/eval sheet` from the repository root. Then Read these six images:
   - `tools/eval/out/sheet/poster/<folder>-1280.png`
   - `tools/eval/out/sheet/poster/<folder>-390.png`
   - `tools/eval/out/sheet/quiet/<folder>-1280.png`
   - `tools/eval/out/sheet/quiet/<folder>-390.png`
   - `tools/eval/out/sheet/soft/<folder>-1280.png`
   - `tools/eval/out/sheet/soft/<folder>-390.png`

   Look for:
   - awkward wraps
   - empty areas
   - text crowding a photo
   - misaligned edges
   - weak hierarchy
   - anything that looks like an existing variant

   Fix it and look again. Use at most 3 review rounds per block.
4. Log as before, and add `"previewRounds": <number>` and `"idea": "<the five-word idea of each variant>"` to the JSON.

Taste is Robert's final call. Your screenshots are for catching defects and for honest self-critique, not for declaring a design good.

## Report back

Give:

- each block and variant, with its five-word idea
- the check results
- your preview rounds
- anything you wanted that the kit lacks

Keep it under 200 words.
