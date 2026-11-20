# 25. The template plan

2026-11-20. Robert: "let's plan template types and then use subagents". We have six templates
(`24-templates.md`). The aim is 24 first, then a blind round. Grow towards 50 only while the blind
score keeps rising.

## What makes two templates different

A new template has to differ from every existing one on at least two of these:

| Axis | Values |
|---|---|
| Opening | colour field · full-bleed photo · split screen · type only · mosaic · framed card · panels |
| Mood | calm · warm · practical · loud · dark · playful · formal |
| Photo need | needs photos · uses some · needs none |
| Density | airy · balanced · packed |
| Type character | editorial serif · plain sans · tall condensed · rounded · classic serif |

Photos are our weakest part, so at least half the new templates must look finished with no photo
at all: led by type, colour or pattern, with photos as an extra when good ones exist.

## The six we have

| Template | Opening | Mood | Photo need | For |
|---|---|---|---|---|
| Field | colour field | calm, warm | some | studios, cafés, salons |
| Signal | type and facts | practical | some | trades, clinics, councils, firms |
| Low light | full-bleed photo | dark | needs | tattoo, bars, evening venues |
| Split | split screen | warm, practical | needs | restaurants, cafés, barbers |
| Poster | colour field, huge type | loud | some | gyms, barbers, trades |
| Album | mosaic | warm, airy | needs | B&Bs, venues, florists |

## Eighteen new types

**Batch 1:**

1. **Ledger.** The page reads as a printed price list or ledger: tabular columns, ruled lines,
   prices aligned. Type only, no photos needed. For barbers, cafés, accountants, repair shops.
2. **Civic.** Plain, accessible and structured. A directory of services as a clear grid of links,
   with big readable type and high contrast. No photos needed. For councils, charities, schools,
   libraries.
3. **Clinic.** Soft, rounded and reassuring. Lots of white, a clear "book" path, and a facts card
   with hours. Some photos. For dentists, physios, vets, opticians.
4. **Tiles.** A modular grid of squares mixing colour tiles and photos. With no photos, the tiles
   carry the page. For yoga, design studios, florists, nurseries.
5. **Editorial.** Magazine-like: a large serif headline, an introduction that opens with a large
   initial, two-column text and a pull quote. Some photos. For law firms, architects, galleries,
   consultants.
6. **Market.** Playful and warm: rounded shapes, sticker-like labels and bright friendly colour.
   Some photos. For bakeries, ice cream, children's activities, market stalls.
7. **Postcard.** The opening is a framed postcard with a stamp-like detail, and it feels like
   travel. Needs photos, with a drawn fallback. For B&Bs, holiday lets, tours, campsites.
8. **Card.** One centred card on a colour ground holds the whole business. Made for owners with
   little to say. No photos needed. For dog walkers, cleaners, tutors, sole traders.
9. **Heritage.** Traditional and established: centred, classic serif, fine ornamental rules.
   Some photos. For pubs, hotels, funeral directors, old family firms.

**Batch 2:**

10. **Panels.** Full-height panels in alternating colours, one idea each. No photos needed. For
    gyms, coaches, events.
11. **Cinema.** Dark, with wide letterboxed photos and a closing set like film credits. Needs
    photos. For cocktail bars, music venues, cinemas.
12. **Arches.** Arched photo frames, soft colour and a classic serif. Some photos. For florists,
    weddings, beauty salons.
13. **Workshop.** Technical and made: a faint grid ground, measured labels and plans-like rules.
    No photos needed. For joiners, builders, bike repair, makers.
14. **Story.** A vertical path down the page joins the steps of a job or a visit. Some photos.
    For removals, wedding services, trades with a process.
15. **Directory.** Dense and organised: three columns of services and facts. No photos needed.
    For practices with many services (garages, clinics, salons with long price lists).
16. **Type.** No photos at all: giant type in one or two colours carries the whole page. For
    tutors, music teachers, consultants.
17. **Salon hang.** Photos hung irregularly, like a gallery wall. Needs photos. For tattoo
    studios, artists, photographers.
18. **Classic.** Calm, symmetrical and quietly formal, with centred columns. Some photos. For
    solicitors, accountants, private clinics.

Together the 24 cover:
- every opening;
- every mood;
- twelve templates that need no photos;
- each of the ten bench briefs, which should have at least four strong candidates.

## How each is built and checked

- **Built by helper agents** working to the template contract (`packages/library/src/templates/README.md`),
  three templates each, in parallel.
- **Checked by the quality gate** (`tools/bench/src/template-gate.ts`). Every template is drawn
  with three test contents (long, minimal, right-to-left), with and without photos, in a light,
  a mid and a near-black brand colour, at desktop and phone widths. It must pass the bench page
  checks: no sideways scroll, no empty section, no text cut off or off the edge, one main heading.
- **Shown to Robert on the review wall**: every template filled with the same three businesses,
  side by side. He keeps, fixes or drops each one. Only kept templates join `TEMPLATES`.
- **Blind round after each batch**, against Lovable and v0.

## Batch 1 (2026-11-20)

Three helper agents built nine templates in parallel, three each, to the contract. All fifteen
templates pass the gate (`runs/gate-2026-11-20-09-52`, wall at `wall.html` there).

| Template | The one idea | With no photos |
|---|---|---|
| Ledger | A double margin line in the brand colour down the page; section names left of it, prices on dotted leaders right of it | Type only; the hero shows small in the margin when it is a real photo |
| Civic | A solid name bar, big plain type, the offer as a directory of underlined links with details | Type only |
| Clinic | A white appointment card with hours and phone over the corner of a rounded hero photo | Hero art stays; the introduction goes full width |
| Tiles | A grid of squares in the brand colour and its tints, each colour tile with one plain shape | Photo tiles become shape tiles, so the grid stays whole |
| Editorial | A masthead between rules, a large initial letter, and the statement as a pull quote beside the introduction | Photos hide; all type |
| Market | A striped, scalloped awning, a round tilted button like a sticker, prices on small tilted tags | Photos go; the sticker moves beside the headline |
| Postcard | A postcard with a CSS stamp and postmark; the headline as the message beside the real address | Only the writing side shows |
| Card | One narrow white card on the brand colour holds everything, with contact details at the foot like a business card | Needs none |
| Heritage | A fine double frame round the page, centred type, hairlines broken by a small diamond, Roman numerals for steps | Type and ornament only |

**Fixes the helpers found, made in shared code:**
- **Stretched photos:** an image's height attribute could override its CSS shape (`height:auto`
  in the reset).
- **Dead menu link:** the menu linked to an offer section a business without offer items didn't
  have.
- **Empty wall sample:** the wall's trades sample had no offer, so the gate now gives it an
  electrician's usual four.

Sheets on the restaurant sample: `25-template-plan/batch1-a.jpg` (Ledger, Civic, Clinic, Tiles,
Editorial) and `batch1-b.jpg` (Market, Postcard, Card, Heritage).

**Next:** Robert reviews the wall and keeps, fixes or drops each one. Only kept templates lose
`draft: true` and are offered to owners.

**Kept (Robert, 2026-11-20): all nine.** Fifteen templates are now offered, and Jev ranks all
fifteen. On a test build of the Skye B&B, it put Postcard first, then Album and Split.

## Batch 2 (2026-11-20)

Three helpers built the other nine. All 24 templates pass the gate (`runs/gate-2026-11-20-10-20`,
`wall.html` there).

| Template | The one idea | With no photos |
|---|---|---|
| Panels | Full-screen sheets dealt on top of each other, rounded at the top, each a shade from a fixed set made from the brand colour | Real photos only; the sheets carry it |
| Type | Two colours and two sizes: enormous headings in the brand colour, everything else small on one indented line | Uses none |
| Workshop | Drafting paper: headings inside dimension lines, a title block with the facts, a ruled parts list, a blueprint closing | Real photos as taped-up prints; art hidden |
| Story | A thick track down the left like a line on a transit map; sections are stops, steps are filled numbered stops | The track and type carry it |
| Directory | Three panes: contents, a ruled price table with sticky group headings, a sticky card with the hours | Needs none |
| Cinema | Every photo letterboxed between black bars, the headline like a title, a closing like film credits | A wide title card in a deep shade of the brand colour |
| Salon hang | A gallery wall tinted by the brand colour: framed photos at different sizes and heights, offer items as wall labels | Frames removed; a calm type-led wall |
| Arches | Photos in round-topped arches with an outline arch behind, the offer and closing in wide arched panels | Outline arches and the two panels carry it |
| Classic | A centred masthead and mirrored spreads about one fine centre rule | One centred column of type |

**Weak spots the helpers named:**
- **Panels:** sheets with little content are mostly empty, and with charcoal two shades are close.
- **Salon hang:** a very long headline is cramped.
- **Cinema:** reasons, audience and steps all look alike.
- **Classic:** with 20+ services the mirrored list is long.
- **Directory:** on phones the contents list is hidden.

Sheets: `25-template-plan/batch2-a.jpg` (Panels, Type, Workshop, Story, Directory, on the clinic
sample) and `batch2-b.jpg` (Cinema, Salon hang, Arches, Classic, on the salon sample).

**Kept (Robert, 2026-11-20): all nine.** All 24 templates are now offered, and Jev ranks all 24
in its first request, alongside the words.

## Batch 3: twelve more (2026-11-20)

Robert: "more templates." Twelve new types take the library to 36. Each must differ from all 24
on at least two axes.

1. **Board.** A café or pub menu board: a dark board in a deep shade of the brand colour, the offer
   written large on it in panels, framed in a thin edge. No photos needed. For cafés, pubs, food
   trucks, bakeries.
2. **Ticket.** The opening is a ticket with a torn stub (perforations drawn in CSS), and facts are
   set like ticket details. Some photos. For events, tours, venues, cinemas, attractions.
3. **Enamel.** Old enamel shop signs: rounded plates with thick borders and inner lines carry the
   name and each section heading, on a plain ground. No photos needed. For traditional trades,
   pubs, hardware shops, garages.
4. **Timetable.** A weekly grid is the opening: the offer items laid out like a class timetable
   or a list of sessions. Some photos. For yoga, gyms, swimming, dance, tutoring.
5. **Soft.** Organic blob shapes made from the brand colour and its tints, generous curves, a
   gentle rounded feel. Some photos (in blob masks). For therapists, wellness, nurseries,
   midwives.
6. **Cover.** The opening is a magazine cover: the name as the masthead across the top, the hero
   photo full height, cover lines taken from the offer and reasons. Needs photos, with a type-only
   cover as fallback. For salons, fashion, gyms, barbers.
7. **Swiss.** A strict asymmetric grid, a big plain sans, generous white, the brand colour used
   in one or two solid blocks. No photos needed. For architects, designers, engineers.
8. **Spec.** Facts first, like a product specification sheet: a large table of what, when, how
   much and where, with plain rules. No photos needed. For garages, MOT centres, cleaners,
   locksmiths.
9. **Brochure.** On desktop the page opens as a three-panel folded leaflet side by side, then
   continues below. Some photos. For councils' services, charities, clinics, events.
10. **Index.** Stacked index cards with tabs (CSS), one card per section, slightly offset. No photos
    needed. For tutors, libraries, bookshops, archives.
11. **Map.** A stylised map drawn in CSS (streets as lines, blocks as tints) with a pin for the
    place, the address as the hero fact. No photos needed. For local shops, garden centres, B&Bs,
    markets.
12. **Pattern.** Each section sits on a band of a different simple CSS pattern (stripes, checks,
    dots) in brand tints, calm enough to read on. Some photos. For bakeries, children's shops,
    craft shops, sweet shops.

Helpers, three each:
- **Helper 1:** Board, Ticket, Enamel.
- **Helper 2:** Timetable, Soft, Cover.
- **Helper 3:** Swiss, Spec, Brochure.
- **Helper 4:** Index, Map, Pattern.

### Revised after web research (2026-11-20)

Robert: "perhaps do web research before doing the next batch". A research helper read curated
galleries and real sites. It could read text only, not see pages, so its patterns are leads, not
verified looks. Examples: Tòpas (bar-topas.ch), Qissa (qissa.co.uk), Casa Momo (casamomo.at),
Studenterkilden, Perennial, Hanamizuki, Two Hands, Café No Sé.

**Its verdict:**
- **Blobs read as the generic AI look.** Soft is dropped.
- **Overlap:** Cover, Enamel, Pattern and Map overlap existing templates or have no real-site
  support.
- **Unproven:** Ticket, Brochure and Swiss.

**Left out because they need content or scripts we don't have:**
- live open/closed countdowns (pages carry no scripts);
- review and rating blocks (we never invent reviews);
- news feeds.

The revised twelve:

1. **Hours first.** The opening hours and how to get in touch are the opening, set large: the
   facts a visitor came for. When the owner gave none, it falls back to a large headline. For
   cafés, trades, clinics, councils.
2. **Numbered.** Sections numbered 00 to 06, used both as the menu and as section headings, with
   small label tags on items. Not steps, but a contents. For any business.
3. **Glossary.** The opening sets the name like a dictionary entry (name, a word class in
   italics, the tagline as the definition); then the introduction as a usage note; steps (when
   present) as numbered senses. For cafés, bakeries, trades, law.
4. **Answers.** The page is built as questions with short answers. The FAQ leads when present.
   Otherwise each section heading reads as the question it answers, using only the existing
   headings. For trades, councils, charities, law, B&Bs.
5. **Units.** The offer items as specification cards, each with its details and price as
   labelled fields, like rooms, classes or packages. For B&Bs, gyms, salons, clinics, garages.
6. **Hub.** The first screen is the name and a few big rounded buttons (to the offer, questions
   and visit), like a front door; the sections follow below. For cafés, florists, barbers.
7. **Bare.** Only the name, the offer list and one contact line on a plain page, set with great
   care; everything else small. For cafés, bakeries, barbers, sole traders.
8. **Ticker.** Bands of repeated words (the offer item names) slide slowly across between
   sections (CSS only; still when reduced motion is asked for). For cafés, bars, gyms, tattoo
   studios.
9. **Sidebar.** A fixed list of the offer on the left, the detail and the rest of the page on
   the right. For restaurants, salons, clinics.
10. **Board.** A menu board: a deep shade of the brand colour, the offer written large in framed
    panels. For cafés, pubs, food trucks, bakeries.
11. **Timetable.** The offer laid out like a weekly timetable or a list of sessions, as the
    opening. For yoga, gyms, swimming, dance, tutoring.
12. **Label.** Physical and printed: grain drawn in CSS, type set like printed labels and
    stamped prices, slightly imperfect edges. The research's counter-trend: physical details
    and a personal voice. For bakeries, coffee roasters, makers, delis.

Helpers, three each:
- **Helper 1:** Hours first, Hub, Bare.
- **Helper 2:** Numbered, Glossary, Answers.
- **Helper 3:** Units, Sidebar, Timetable.
- **Helper 4:** Ticker, Board, Label.

## Batch 3 built (2026-11-20)

Four helpers built the twelve. All 36 templates pass the gate (`runs/gate-2026-11-20-10-41`). The
wall's clinic sample now carries questions and steps, so Answers, Numbered and Story show their
idea. Sheets: `25-template-plan/batch3-a.jpg` (Hours first, Hub, Bare, Numbered, Glossary,
Answers, on the clinic sample) and `batch3-b.jpg` (Units, Sidebar, Timetable, Ticker, Board,
Label, on the restaurant sample). Still drafts until Robert keeps them.

## Coverage test (2026-11-20)

Robert: "whether i say a nightclub website, bristol electricians, or krakow city council, jev has
a template to pick for it". A development route (`/api/template-pick`) asks Jev the build's own
question over all 36 templates, drafts included, for one brief. That costs $0.00015 a brief.

It was run on 75 briefs: Robert's three, the bench's ten, and the 62 kinds of the wide set.
Results are in `25-template-plan/coverage-75.json`.

**Fits well** (my reading):

| Brief | Jev's first pick |
|---|---|
| Nightclub | Cinema (0.82), then Low light |
| Bristol electricians | Signal (0.65), then Workshop |
| Kraków council | Civic (0.94) |
| Taco food truck | Board |
| Removals | Story |
| Carpenter | Workshop |
| Funeral director | Heritage |
| Maths tutor | Type |
| Dog walker | Card |
| Wedding caterer | Arches |
| Art gallery | Salon hang |
| Swimming lessons | Timetable |
| Italian deli | Label |

**Thin** (Jev's top pick below 0.4, or a pick that fits badly):

| Brief | Pick | Score |
|---|---|---|
| Amateur football club | Civic | 0.19 |
| Community choir | Civic | 0.36 |
| Parish church | Civic | 0.48 |
| Butcher | Label | 0.19 |
| Independent bookshop | Label | 0.25 |
| Tailor | Field | 0.29 |
| Dog groomer | Split | 0.29 |
| Barber | Split | 0.26 |
| Escape room | Low light | 0.35 |
| Climbing wall | Poster | 0.39 |
| Estate agent | Album | 0.41 |
| Interior designer | Salon hang | 0.31 |

**What this shows:**

- **Gaps:**
  - community clubs and societies (sports clubs, choirs, churches, village halls);
  - independent shops that sell things (bookshops, butchers, record shops, hardware);
  - repair and alteration services (tailors, shoe and phone repair);
  - energetic leisure (escape rooms, climbing, bowling);
  - property.
- **Concentration:** Clinic is the first pick for nine of the 75: every health business gets the
  same page first. The second and third versions still differ. Templates that are never first:
  Hub, Bare, Hours first, Numbered, Glossary, Answers, Units, Sidebar, Ticker, Editorial,
  Directory, Postcard (first once).

**Batch 3 kept (Robert, 2026-11-20): all twelve.** 36 templates are live.

## Batch 4: filling the gaps (2026-11-20)

Robert: "Keep and fill gaps". Eleven templates aimed at the gaps the coverage test found, plus one
alternative to Clinic so health businesses don't all open the same way:

1. **Clubhouse.** A sports or social club: the name as a crest-like mark, stripes in kit colours
   from the brand colour, sessions as fixtures, joining as steps. For football, cricket, running
   and rowing clubs.
2. **Noticeboard.** A community board: sections as notices pinned on a board, plain and friendly.
   For churches, village halls, community centres, mosques.
3. **Programme.** A printed concert or event programme: a cover, then the offer as the running
   order. For choirs, amateur theatre, societies, orchestras.
4. **Shopfront.** An independent shop: a shop sign over a window-like opening, the offer as
   shelves of stock by category. For bookshops, hardware stores, gift shops, record shops.
5. **Price tickets.** A butcher's or greengrocer's window: each item on a big bold price ticket.
   For butchers, fishmongers, greengrocers, delis.
6. **Spines.** The offer as spines on a shelf: names set sideways like books or record sleeves.
   For bookshops, record shops, libraries, collectors.
7. **Repair ticket.** The page as a repair job ticket: fields, a tear-off stub, steps as the job's
   progress. For phone and computer repair, tailors, shoe repair, bike shops.
8. **Arcade.** Energetic leisure: bold angled panels and big contrasts, fun but readable. For
   escape rooms, climbing walls, bowling, trampoline parks.
9. **Listing.** Property-listing style: large feature panels with key facts in strips. For estate
   and letting agents, holiday cottages, venues for hire.
10. **Care.** Warm, quiet and spacious, with large readable type for older readers and
    reassuring calm. For care homes, counsellors, midwives, hospices.
11. **Atelier.** Crafted and personal: swatches in brand tints, fabric-tag labels, a maker's
    hand. For tailors, interior designers, dog groomers, upholsterers.

Helpers:
- **Helper 1:** Clubhouse, Noticeboard, Programme.
- **Helper 2:** Shopfront, Price tickets, Spines.
- **Helper 3:** Repair ticket, Arcade, Listing.
- **Helper 4:** Care, Atelier.

Afterwards the 75-brief coverage test runs again.

## Batch 4 built, coverage test again (2026-11-20)

Four helpers built the eleven. All 47 templates pass the gate (`runs/gate-2026-11-20-11-08`).
Sheets: `25-template-plan/batch4-a.jpg` (Clubhouse, Noticeboard, Programme, Shopfront, Price
tickets, Spines, on the restaurant sample) and `batch4-b.jpg` (Repair ticket, Arcade, Listing,
Care, Atelier, on the salon sample). They are drafts in the build until kept, but the coverage
test includes them.

The same 75 briefs again (`coverage-75-after-gaps.json`). Every gap now has a fitting first pick,
mostly with high confidence:

| Brief | Before | After |
|---|---|---|
| Amateur football club | Civic 0.19 | Clubhouse 1.00 |
| Community choir | Civic 0.36 | Programme 0.98 |
| Parish church | Civic 0.48 | Noticeboard 1.00 |
| Butcher | Label 0.19 | Price tickets 1.00 |
| Independent bookshop | Label 0.25 | Spines 0.55 |
| Vinyl record shop | Album 0.42 | Spines 0.79 |
| Hardware store | Workshop 0.46 | Shopfront 0.99 |
| Phone repair | Signal 0.33 | Repair ticket 1.00 |
| Tailor | Field 0.29 | Atelier 0.67 |
| Escape room | Low light 0.35 | Arcade 1.00 |
| Climbing wall | Poster 0.39 | Arcade 1.00 |
| Estate agent | Album 0.41 | Listing 1.00 |
| Care home | Clinic 0.64 | Care 1.00 |
| Midwife | Clinic 0.48 | Care 0.97 |

**Spread:**
- **First picks:** 32 different templates are first for at least one brief. Clinic is first for 6
  (was 9). No template is first for more than 6.
- **Still below 0.4:** café, barber, pharmacy, painter and decorator, garden maintenance, ramen
  bar, brewery. For these several templates fit about equally (the café's top three are Split,
  Field and Board), so the low score shows a close choice, not a gap.

**Kept (Robert, 2026-11-20): all eleven.** 47 templates are live.

## Round 5 (measured, laptop, 2026-11-20)

All 47 templates; bench run `runs/2026-11-20-11-44-only-round5`, the same eight briefs.

- **Speed:** page shows at a median of 3.7 s (p90 4.8 s); page and photos take 6.9 s.
- **Cost:** $0.0070 a site.
- **Problems:** 0 page problems, 0 fact flags.
- **Jev's first picks:**
  - Split: café, Osteria Nonna, barber;
  - Clinic: dentist;
  - Signal: plumber;
  - Field: yoga;
  - Civic: Zamość;
  - Low light: tattoo.

  These are mostly the same as round 4's set, so this round mainly tests the templates written
  since round 4, the later fixes, and Split.
- **Rating:** Jev's first pick against the same Lovable and v0 pages, at `/vs.html?set=vs5`.

### Round 5 result (Robert's rankings, 2026-11-20)

| | Best | Middle | Worst |
|---|---|---|---|
| Builder | 4 | 2 | 2 |
| Lovable | 3 | 4 | 1 |
| v0 | 1 | 2 | 5 |

- **Head to head:** Builder tied Lovable 4–4 and beat v0 6–2.
- **Trend:** Builder lost 0–8 to both in round 1; in round 4 it lost 3–5 to Lovable and beat v0
  5–3.
- **Builder best:** barber (Split), dentist (Clinic), plumber (Signal), yoga (Field).
- **Builder second:** café, Osteria Nonna.
- **Builder worst:** tattoo studio (Low light) and Zamość council (Civic; its page was the
  shortest, at 1,790px).
- As before, Robert had seen the rival pages, so this round was less blind than round 1.
