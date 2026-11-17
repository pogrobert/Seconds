# 16. The block library: three free collections ported

Date: 2026-11-17. Follows Robert's decisions of the same day: React on published pages is fine, and
blocks come from free MIT repositories (never Pro sets, never the websites).

## What is there now

`packages/library` holds **199 blocks** (counted from the registry):

| Source | Blocks | Licence | Commit |
|---|---|---|---|
| core (our first hand ports, Tailark-based) | 21 | MIT (Tailark) | 8139698 |
| Tailark (Mist, Veil, Dusk) | 96 | MIT | 8139698 |
| Shadcn UI Blocks (akash3444/shadcn-ui-blocks) | 58 | MIT | 73a69e9 |
| Efferd (shabanhr/efferd-ui) | 24 | MIT | d0748f4 |

All three notices are in `packages/library/NOTICE.md`. Every entry records the file it came from.

Kinds of section: header, hero, about, offer, reasons, gallery, stats, testimonials, team, faq,
contact, cta, footer.

## How a page is put together

- `src/registry.ts` joins the four folders' lists. Each entry has an id (`tailark/hero-veil-four`), its
  kind, its source file, and three flags:
  - `needs`: facts it cannot show without (faq, stats, testimonials, team);
  - `includesHeader`: an opening with its own menu bar;
  - `covers`: other sections it already shows (an about block that lists the reasons).
- `plans(seed, n, content)` picks one block per section. Each plan opens with a different hero. A
  section is left out when the content cannot fill it (no contact details means no visit section;
  no testimonials means no testimonial section) or when a chosen block already covers it.
- The build page draws its three "Blocks" versions this way, in the colours and fonts Jev chose.

## How the ports were made

Three agents worked in parallel, one per collection, each writing only to its own folder. Rules
they followed:

- **Content:** words come only from the site's content. Demo copy, brand logos, app screenshots,
  star ratings and social links are removed. No stats, testimonials or team members are invented.
- **Interactivity:** accordions became `<details>`, carousels became strips that scroll sideways,
  and phone menus became `<details>` menus. No script is needed on the page.
- **Forms:** contact forms became hours, phone and a booking button, since a published page has
  nowhere to send them.
- **Colours:** only theme tokens are used, so every block takes the business's colours.

Left out on purpose: pricing tiers, logo clouds, sign-in pages, timelines (they need dated
history), and blocks built around dashboards or charts.

## Checks (measured)

- **Unit tests: 800 pass.** Every block is rendered with three test contents: full, minimal and
  right-to-left. For each block the tests check that:
  - it does not crash;
  - it shows no demo words and no literal colours;
  - every image has alt text;
  - it declares any other section it shows.
- **Browser:**
  - **Phone width:** no sideways scroll on any of the three versions, for a Lisbon bakery and a
    Leeds dental clinic.
  - **Speed:** the clinic built in 2.2 s and cost $0.0012.
  - **Agent checks:** each agent also looked at its own blocks at desktop and phone width and
    fixed what it found.
- **Not done:** no one has rated these by eye yet.

## Fixed along the way

- **Missing styles.** The stylesheet scanner dropped classes that contain `&`, `,` or `+`, and in
  some runs `bg-white` too. That made the light buttons see-through.
- **Hover colour.** `--accent` was mapped to the strong brand colour. shadcn uses it as the soft
  hover ground, so hover states came out dark on dark. It now maps to the tint colour.
- **Cut-off words.** The word model's length limit could cut a paragraph mid-word ("a warm,-f").
  Paragraphs are now cut back to the last full sentence.
- **Repeated sections.** An "about" block that lists the reasons was followed by a reasons section
  with the same words. Blocks now declare what they cover, and a test enforces it.

## Open points

- **Headings.** Stats and testimonials have no heading field yet, so the blocks borrow the name and
  tagline. Optional `statsTitle` and `testimonialsTitle` fields would fix it.
- **Fixed labels.** A few labels are fixed English: About, Visit, Hours, Call, Email, Questions.
  Non-English sites need them as content.
- **FAQ, stats, testimonials and team never appear yet.** The word model does not fill them, and
  it must not invent them. They wait for facts from the owner, or for the online facts lookup.
- **Menus on phones.** Core heroes and the Tailark headers hide their links on phones and have no
  phone menu.
- **Local-business sections.** None of the collections has a menu with prices, opening hours with
  a map, or booking. We still write those ourselves.

## Later the same day: neutral colours, rules looks removed

- **Neutral colours.** Robert found the colour rules' tinted grounds and brand colours bad. Every
  block site is now neutral (shadcn's neutral scale): white or near-black, greys, and black or
  white buttons. A colour rule only decides light or dark. The photos carry the colour.
- **Fewer choices.** The question that made Jev pick a brand colour is gone.
- **Old looks removed.** The "Rules" looks are gone from the build page. Robert: "it's really
  bad". The rules engine still picks the type and the photo treatment for the three block versions.
