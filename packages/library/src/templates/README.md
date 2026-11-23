# Template contract

A template is one whole website page designed as a unit (docs/m0/24-templates.md,
docs/m0/25-template-plan.md). It has one width, one spacing scale, one way of using the
business's colour, one recurring detail, and a fixed plan for its photos. The same template must
look good for any small business, with any words, any brand colour, and with or without photos.
Taste lives here: the decision model only chooses between templates. So every template must be
good on its own.

## The file

One file per template, `src/templates/<id>.tsx`, shaped like `field.tsx`:

- `const CSS = `${RESET} ...`` holds all its styles. Plain CSS, no Tailwind, no other stylesheet.
  The page is drawn as static HTML with no JavaScript.
- `function Page({ c, extras }: TemplateProps)` returns the whole page:
  - the header with the name and `links(c, extras)`;
  - the opening (`c.tagline`, `c.headline`, `c.subhead`, a button `c.cta.label`);
  - the introduction `c.about`;
  - the offer (`c.offerTitle`, `offerItems(c)`: name, optional detail, optional price), with
    `id="offer"`;
  - the extras from `present(c, extras)`, in the order given;
  - a closing with `id="visit"`: `c.cta.headline`, `c.cta.subhead`, `facts(c)` when
    `hasVisit(c)`, and the footer with the name and tagline.
- Extras and what each needs:
  - `statement`: `c.statement`, one large line;
  - `reasons`, `audience`, `steps`: use `listOf(c, x)` for its title and 2–4 items. Steps are
    the only ones numbered;
  - `faq`: `c.faq`, with the heading "Questions" and `id="questions"`;
  - `gallery`: photos.
- Export `const <id>: Template = { id, label, text, dark, draft: true, css: CSS, Page }`.
  `text` is what the decision model reads when it picks a template: one sentence on the look and
  feel, ending with the kinds of business it suits, in the style of the existing templates.

## Rules

1. **Words only from the content.** Never write marketing words into the template. The only
   fixed words allowed are plain labels: "Questions", "Hours", "Address", "Phone", "Email" (from
   `facts`). Never invent a heading.
2. **Colour comes from the theme.** Use `var(--band)` (the business's colour, deep enough for
   white text) and `var(--band-foreground)`. Derive every other colour from them with
   `color-mix(in oklab, ...)`, as the existing templates do. No literal brand colours. It must
   work for a deep green, a near-black charcoal and a bright coral. A dark template sets
   `dark: true` and `color-scheme:dark`.
3. **Type comes from the theme.** Use `var(--font-heading)`, `var(--font-body)`,
   `var(--heading-weight)`, `var(--heading-tracking)` and `var(--heading-case)`. You choose sizes,
   line heights and the scale. Never load fonts yourself. Never force upper case: the type rule
   decides that.
4. **Corners:** `var(--radius)` and `var(--button-radius)`, or none at all if the design is square.
5. **Photos, each used once:** `c.photos.hero`, `about`, `d1`, `d2`, `cta`. Use `Pic` for every
   image. Never show the same slot twice on one page.
6. **Pages without photos must look finished.**
   - Any photo can be drawn art instead: an `<img>` whose `src` starts with `data:image/svg`, or
     that has a `data-art` attribute.
   - Group secondary photos in an element with the class `pair`, `gal`, `three` or `strip`, or
     use `figure.bleed`. The shared rules in `shared.tsx` then hide art in those groups, let the
     remaining photos share the row, and hide the section when none are left.
   - If your layout needs other rules for this, write them with the same `:has()` selectors.
   - A template planned as needing no photos may use none, or only the hero.
7. **Phone width (390px) must work:** no sideways scroll, nothing cut off, menus may hide.
8. **One `<h1>`** (the headline). Sections are `<section>` elements inside `<main>`.
9. **Avoid the common tells of generated pages:**
   - capital-letter labels above every heading;
   - one word in a headline set in italic or another colour;
   - "→" added to buttons;
   - middle dots joining facts;
   - a grid of identical rounded cards with soft shadows;
   - decorative gradients;
   - numbered markers on things that are not steps.

   Spend boldness in one place.
10. **Accessibility:** readable contrast in every brand colour, visible focus (the reset has
    it), and text in a readable measure (under about 75 characters a line).

## Checking

The dev server must be running (`pnpm --filter @repo/web dev`, port 5173). From `tools/bench`:

    PLAYWRIGHT_BROWSERS_PATH=$PWD/.browsers node src/template-gate.ts --only <id>

- **What the gate does:** it draws the template with long, minimal and right-to-left test
  content, with and without photos, in three brand colours, at 1280px and 390px, and runs the
  page checks. It also writes a wall of screenshots on four sample businesses to
  `runs/gate-*/wall.html`.
- **When you are done:** the gate reports "passes", and you have looked at the wall screenshots
  (the `.jpg` files) yourself and fixed what looks wrong. Taste is judged by eye; the gate only
  catches breakage.
- **Then:** Robert reviews the wall, and only kept templates lose `draft: true`.

## Licences

Designs are original. Do not copy markup or CSS from Tailwind Plus, Aceternity, shadcnblocks,
Relume, Untitled UI Pro, Flowbite Pro, Magic UI Pro, React Bits, Monet.Design or any site's
paid set. Ideas from MIT sources (such as scala-sites) are fine; copied code needs its licence notice in a `NOTICE.md`
beside it.
