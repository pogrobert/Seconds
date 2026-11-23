# 28. More templates (2026-11-24)

Robert: "let's do more templates". Before drawing anything: which templates does the design pick
actually choose, and which briefs fit none well?

## Measured: what the design pick chooses

`tools/bench/src/template-coverage.ts` asks Jev's design question (the build's own, through the
bench route `/api/template-pick`) for 237 briefs: the wide set (`wide.ts`, about 200 briefs
across trades, health, food, shops, education and more) and 42 more for areas it has little of
(night life, style, music, arts, stays, tech, people, events, kids, outdoors, famous names).
Decisions only: no words, no photos, almost no cost.

**One template is a magnet.** Field is in the top three for 95 of the 237 briefs (40%), Signal
for 62. Many quite different businesses would look alike.

**Some are never chosen.** Numbered, Glossary, Units and Bare are in nobody's top three;
Ticker, Sidebar, Directory, Answers and Postcard almost never.

**Dark is in demand with little supply.** Only 3 of 47 templates are dark. Low light is a first
pick 12 times and Cinema 5: cocktail bars, techno clubs, wine bars, tattoo studios, moody barbers,
DJs and comedy clubs all land on those two.

**Areas with no good fit:**

| Area | Briefs | Picked (probability) |
|---|---|---|
| Tech | "software startup making invoicing simple", "app to learn Spanish" | Field 0.17, Hub 0.17–0.27 |
| People | "portfolio for a freelance web developer", "life coach for new parents" | Tiles 0.35, Type 0.43 |
| Luxury | "fine jewellery maker", "small perfume house", "boutique hotel" | Arches 0.54, Label 0.40, Heritage 0.49 |
| Outdoors | "surf school in Newquay" | Timetable 0.30, Arcade 0.26, Panels 0.25 |

Well covered already: galleries (Hang), festivals and orchestras (Programme), campsites
(Postcard), climbing and escape rooms (Arcade), weddings (Arches), children's parties (Market).

## Chosen by Robert

All seven directions offered:

- dark: **Neon night** (clubs, bars, DJs, comedy, arcades), **Velvet** (cocktail bars,
  jewellers, perfumers, whisky bars), **Ink** (tattoo, photographers, galleries, bands);
- light: **Product** (software, apps, agencies), **Person** (portfolios, developers, writers,
  coaches, CVs, famous people), **Quiet luxe** (jewellers, boutique hotels, perfumers,
  wineries), **Outdoors** (surf, climbing, cabins, adventure trips).

Each starts as a draft (`new-template`), passes the gate, and joins the build only once Robert
keeps it.

## The seven drafts (measured)

Each was designed to the contract (`packages/library/src/templates/README.md`) by its own
designer, passes the gate (long, minimal and right-to-left content, three brand colours, desktop
and phone, with and without photos) and leaves every existing page unchanged (the fingerprint test:
0 of the old pages changed, 42 new ones).

The same 237 briefs again, with the drafts in the choice:

| Brief | Before | With the drafts |
|---|---|---|
| Software startup; language app | Field 0.17; Hub 0.27 | Product 1.00; 0.99 |
| Freelance web developer; nurse's CV | Tiles 0.35; Card 0.74 | Person 0.99; 0.99 |
| Surf school; Highland cabins | Timetable 0.30; Listing 0.46 | Outdoors 0.99; 0.83 |
| Boutique hotel; vineyard | Heritage 0.49; 0.35 | Quiet luxe 0.93; 0.79 |
| Comedy club; wedding DJ; retro arcade bar | Low light, Cinema | Neon night 0.94; 0.86; 0.91 |
| Tattoo studio; street photographer | Low light 0.60; Hang 0.86 | Ink 0.77; 0.92 |
| Moody barber; speakeasy | Low light 0.95; Cinema 0.74 | Velvet 0.70; 0.54 |

Field's pull eased (top three for 84 briefs, from 95), Signal's too (56, from 62). Still never
chosen: Numbered, Glossary, Units, Bare, Ticker.
