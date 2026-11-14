# 07 · Style inspiration for local-business sites

Date: 2026-11-14. Research for M0's "3 style families" and the later style space.

Businesses in scope: restaurants and cafés, hair and beauty salons, dental and medical clinics, trades (plumbers, electricians, roofers, landscapers), fitness and yoga studios.

## How this was done, and how to read it

- I opened galleries and real sites in a browser on 2026-11-14, took screenshots, and ran a small script on each live page that reads the fonts, sizes, letter-spacing, colours, corner radius and button styles the browser actually applies.
- Labels used below:
  - **Measured**: read from the live page by that script on 2026-11-14 (fonts, px sizes, hex colours, radii).
  - **Seen**: looked at in a screenshot or gallery thumbnail; no numbers taken.
  - **Inferred**: my judgement, for example "this paid font is close to that free Google font", or "this would suit trades".
- Every Google Fonts family named in this report was checked on 2026-11-14: the Google Fonts CSS API returned 200 for it. As a control, it returned 400 for "Erode", "Messina Sans" and "Kommissar", which are not on Google Fonts.
- Contrast ratios were computed with the WCAG formula from the measured hex values.
- Nothing was copied: no code, images or font files. Only palettes, type pairings and layout patterns are recorded.
- Many examples are Framer or Squarespace **templates** (designer-made demos), not real businesses. They are marked "template". Real businesses are marked "real".

## What each source gave

| Source | What it was useful for | Notes (seen 2026-11-14) |
|---|---|---|
| recent.design | Little. Its "Food & Drink" filter held 1 site (Postevand); "Health" held 6, all tech or wellness brands, no local businesses. | Mostly startup and product sites. |
| godly.website | Nothing direct. | It now redirects to recent.design (`?ref=godly`). |
| Dribbble searches | Recurring trends in concept work per industry. | Shots are concepts, often generic stock-photo layouts. Good for spotting clichés. |
| Mobbin | Not used. | App screens behind a login; I did not sign in. |
| siteinspire.com | The best source of real, well-designed small businesses. Categories `food-and-drink`, `health-and-fitness`, `building-and-construction`. | Each entry links to the live site. |
| onepagelove.com | Real restaurant sites, and each review lists the **typefaces used**, colour tags and publish date. | Genre page: `/genre/restaurant` (152 examples). |
| Framer Marketplace | The current "default" look of template sites per industry (health, beauty, home services). | Live previews on `*.framer.website`. |
| Squarespace templates | Designer templates for health and beauty. | Live demos on `*-fluid-demo.squarespace.com`. |
| land-book.com, lapa.ninja | Not usable here. | Land-book's industry filter (it has "Local Business", "Medical", "Beauty", "Food & Drinks") would not open in this browser; lapa.ninja category URLs returned 404. Worth a manual look. |

## The look to avoid: the template default

Two Framer templates measured today share one recipe, and Dribbble's yoga and salon results repeat it:

- Carriage (pilates, template): Fraunces serif headings, DM Sans body, cream `#f6f1ea`, espresso `#2a201b`, terracotta `#b8643c`, pill buttons.
- Crown Cut (salon, template): serif headings (Erode), warm white `#f7f4ef`, orange pill buttons `#ff6a00`.

This is the "cream plus serif plus terracotta" look the brief asks us to avoid. It is everywhere in templates, so it reads as generic. Each family below says how it steers away. The section ideas from these templates are still good; only their skin is generic.

Accessibility notes from the measured colours (computed):

- Dentina's sky-blue text `#00a6f4` on white: 2.71:1. Fails WCAG AA for body text (needs 4.5:1).
- White text on the orange buttons `#ff6a00`: 2.87:1. Fails.
- Carriage's terracotta `#b8643c` on cream: 3.79:1. Passes only for large text.
- Maben's orange text `#ff5226` on off-white: 3.04:1. Large text only.
- Our palette check should catch these. Bright accents work as **fills behind dark text** (for example black on Dash Burger's pink `#f3c0db` is 13.37:1), not as text colours.

---

## Family 1: Poster

**Feel:** Loud and local: huge condensed capitals, two or three flat colours, square corners, a stamp or a drawing.

### Typography

| Seen on | Display (measured) | Body (measured) | Free match on Google Fonts |
|---|---|---|---|
| Tripletta pizza (real) | Oswald 700, uppercase, h1 270px, h2 65px, line-height 1.0 to 1.2 | Merriweather 300, 14 to 20px | Oswald + Merriweather are both Google Fonts (exact) |
| Dash Burger (real) | Kommissar XCond, 190px, line-height 0.79, letter-spacing -0.4px | Messina Sans 18px | Anton or Bebas Neue (display), Inter or Familjen Grotesk (body), inferred |
| Roofex (template, roofing) | Bebas Neue, h1 100px, line-height 0.9 | Inter 12 to 16px | Bebas Neue + Inter (exact) |
| Pluvex (template, plumbing) | Phudu 700, 169px, line-height 0.9; stats "99+" in Phudu 100px | Outfit 600 for subheads, Inter | Phudu + Outfit (exact) |
| Union Boulangerie (real, bakery) | Serial Blur, uppercase, 40 to 72px, letter-spacing -0.04em, line-height 1.0 | Shinka (typewriter-style) 16px | Archivo at narrow width, plus IBM Plex Mono or Sometype Mono, inferred |
| Madie (real, café) | Dazzle, wide uppercase, 60 to 72px; first two lines drawn as outlines, third line solid | Cottorway 17px, Inter 11px uppercase tracked +0.22em for small labels | Unbounded, or Archivo at width 125 (display), Inter (labels), inferred |

Habits: display text 100 to 270px on desktop, line-height 0.8 to 1.0, almost always uppercase. Body stays small (14 to 18px). Small labels in uppercase.

### Colour

Strategy: two or three saturated flat colours with high contrast, used as whole section backgrounds. No gradients.

| Example | Hex set (measured) |
|---|---|
| Tripletta | bottle green `#004632`, pale green `#bdd0a0`, orange `#ff6a00`, cream `#fef8dd`; also red `#b42318`, blue `#314b98` on other sections |
| Dash Burger | pink `#f3c0db`, black `#000000`, white `#ffffff`, off-white `#f9f6f0` |
| Union Boulangerie | cobalt `#2259ec`, orange `#f25a07`, brown `#55270a`, off-white `#f2f0ed` |
| Pluvex (template) | teal-black `#072324`, safety yellow `#f3bf09`, white |

Contrast (computed): Tripletta green on cream 10.24:1; pale green on green 6.60:1; white on Union cobalt 5.66:1; Pluvex yellow on teal-black 9.62:1.

### Shape and density

- Corners: square. Tripletta and Union buttons measured 0px. Template trades versions soften to 16px (Roofex) or pill 30px (Pluvex).
- Density: compact, big type fills the width.
- Borders: none; colour blocks do the separating.
- Buttons: solid colour blocks with uppercase labels (Tripletta "LA BOUTIQUE" in Oswald 24px; Union "NOUS CONTACTER" orange block).
- Extras seen: rotating circular stamp badges (Pluvex "Since 2010"; Tripletta "Mon restaurant"; Madie).

### Imagery

- Illustration: Tripletta uses a line-drawn character in brand green over a giant pale wordmark (seen).
- Full-bleed photos in a row as a strip (Tripletta, seen).
- Small round photo set inside a line of giant text (Tripletta location marquee, seen).
- Photos with square corners (measured 0px on Tripletta, Union, Dash Burger).

### Suits

Restaurants and cafés (casual: pizza, burgers, bakeries, coffee), barbers, boxing and bootcamp gyms, trades (inferred from the Roofex and Pluvex templates using the same recipe).

### Examples

- https://www.triplettapizza.com/ (real, pizzeria, via siteinspire): Oswald capitals, green, cream and orange blocks, location marquee with an inline plate photo.
- https://www.dashburger.ie/ (real, burgers, via siteinspire): extra-condensed capitals on flat pink, black and white.
- https://unionboulangerie.com/ (real, bakery, via siteinspire "a month ago"): cobalt and orange, tight uppercase grotesk, typewriter body, orange tag labels.
- https://madie.es/ (real, café, onepagelove 6 Jul 2026): wide outline capitals, oxblood with pink pill buttons.
- https://roofex.framer.website/ (template, roofing): Bebas Neue 100px, black, white and orange.
- https://pluvex.framer.website/ (template, plumbing): Phudu stacked words, teal-black and yellow, "Since 2010" stamp.

---

## Family 2: Quiet

**Feel:** Hushed and expensive: small type, wide margins, one dark ink on warm white, and big calm photos do the talking.

### Typography

| Seen on | Display (measured) | Labels and body (measured) | Free match on Google Fonts |
|---|---|---|---|
| Odyssée (real, aesthetic clinic) | psTimes serif, h1 only **18px**, letter-spacing +0.02em | baselGrotesk 12 to 15px; nav and labels uppercase, 12 to 14px, tracking +0.03em | Newsreader or Libre Caslon Text (serif), Inter Tight or Hanken Grotesk (grotesk), inferred |
| Atera (real, spa) | HW Atlantic 26px for headings, nav 32px | Lettera Text 14 to 16px; labels uppercase 14px, tracking +0.05em | Instrument Serif (headings), Geist Mono or DM Mono (typewriter-like text), inferred |

Habits: headings are small (18 to 32px) and not bold. Hierarchy comes from space and position, not size. Small uppercase labels with slight positive tracking.

### Colour

Strategy: neutral with one dark ink. No bright accent at all; photography carries the colour.

| Example | Hex set (measured) |
|---|---|
| Odyssée | navy ink `#1e305e`, warm white `#fffcf8`, stone grey `#a79f9c`, charcoal `#28292a` |
| Atera | espresso `#231e16`, ivory `#fffaf0`; the page then fades from ivory into a soft warm yellow (seen) |
| Tekt (real, home builder; cool version) | brown ink `#2d2012`, pale blue-grey `#ecf1f4`, `#d0dbe4` |

Contrast (computed): navy on warm white 12.52:1; espresso on ivory 15.91:1; Tekt brown on pale blue 13.91:1.

### Shape and density

- Corners: square (all images measured 0px on Odyssée and Atera).
- Density: very airy; text in one narrow column, often off-centre (Atera's "An elemental ethos" block sits in the right half, seen).
- Borders: none, or hairlines.
- Buttons: small outline box (Atera "Book now", seen) or underlined uppercase text link ("DISCOVER THE BATHHOUSE", seen).

### Imagery

- Full-bleed photos, calm and desaturated (Atera pool; Odyssée's grey-toned portrait that fades in, seen).
- Odyssée's images look near-monochrome grey (seen; could serve as a duotone setting for generated art, inferred).

### Suits

Aesthetic and premium dental clinics, spas, upmarket salons, fine dining and wine bars. Caution (inferred): tiny headings and low-contrast greys are hard for older patients; keep body text at 16px or more.

### Examples

- https://www.odysseeclinic.com.au/ (real, medical aesthetics, siteinspire "2 months ago"): 18px serif headline, navy on warm white, numbered tiles "01" with a "1 / 4" counter.
- https://atera.spa/ (real, spa, siteinspire "4 days ago"): espresso and ivory, full-bleed pool photo, hours as one uppercase line, outline "Book now".
- https://tekt.com.au/ (real, modular home builder, siteinspire): cool pale blue-grey and brown, hairline value list.
- https://www.siteinspire.com/website/13517-dix-hectares (real, wine, seen as thumbnail): full-bleed vineyard photo, giant thin wordmark across the bottom edge.

---

## Family 3: Workshop

**Feel:** Practical and precise: a plain grotesk with a typewriter (mono) face, hairline grids, square corners and one safety colour.

### Typography

| Seen on | Display (measured) | Body and labels (measured) | Free match on Google Fonts |
|---|---|---|---|
| Maben (real, construction) | ABC Repro 32 to 42px, letter-spacing -0.025em | ABC Repro Mono, **uppercase body**, 10 to 12px; section labels ABC Repro 12px bold uppercase | Schibsted Grotesk or Instrument Sans + IBM Plex Mono or DM Mono, inferred |
| Tekt (real, home builder) | af Another Sans 27 to 42px | Herbik (small serif) 14px for item headings | Instrument Sans + Newsreader, inferred |
| TAB Kitchen & Bakery (real, café) | Inria Serif 90px | **Sometype Mono** for small corner labels; also Bayon, Shrikhand | Inria Serif, Sometype Mono, Bayon, Shrikhand are all Google Fonts (exact) |
| Roofex (template, roofing) | Bebas Neue | Inter; section labels in square brackets "[ About Us ]" (seen) | exact |

Habits: medium-size headings (30 to 42px), sentence case. Mono text in small uppercase for labels, addresses and sometimes whole paragraphs. Labels like "HOW WE WORK" above headings.

### Colour

Strategy: off-white or pale tint with charcoal text and **one** safety or blueprint accent.

| Example | Hex set (measured) |
|---|---|
| Maben | safety orange `#ff5226`, off-white `#f8f8f2`, charcoal `#292728`, stone `#d8d5c9` |
| Tekt | pale blue-grey `#ecf1f4`, `#d0dbe4`, brown `#2d2012` |
| Union Boulangerie (blueprint version) | cobalt `#2259ec` on off-white `#f2f0ed` (4.98:1), orange `#f25a07` for tags |

### Shape and density

- Corners: square. Maben outline buttons measured 0px radius, 1px charcoal border.
- Density: medium; content sits in a visible grid.
- Borders: 1px hairlines. Tekt adds small tick marks at box corners and stacks values as a hairline list ("Value / Quality at Scale / Service / Fast Delivery / Sustainability", seen).
- Buttons: outline with an uppercase mono label and an arrow ("LEARN MORE →", "SEE OUR PROJECTS →" on Maben, measured).
- Maben runs a solid orange vertical bar down the left edge of the page (seen).

### Imagery

- Documentary photos of real work, square corners (Maben site photos, Tekt houses; seen).
- Works well with diagrams or plans (inferred).

### Suits

Trades of every kind, dental and medical (blue version), physiotherapy, bakeries and coffee roasters (Union, TAB).

### Examples

- https://maben.com.au/ (real, construction, siteinspire): safety orange, mono uppercase body, outline arrow buttons.
- https://tekt.com.au/ (real, builder, siteinspire): hairline boxes with corner ticks, pale blue-grey.
- https://tabkitchenbakery.com/ (real, café, onepagelove 24 Feb 2026): Sometype Mono labels pinned to the corners.
- https://unionboulangerie.com/ (real, bakery): mono body text with tight uppercase headings.
- https://roofex.framer.website/ (template): bracket labels, checklist plus a 3-number stat row.

---

## Family 4: Soft

**Feel:** Friendly and reassuring: light-weight sans, rounded cards, pill buttons, pale tinted backgrounds and small info chips floating over photos.

### Typography

| Seen on | Display (measured) | Body (measured) | Google Fonts |
|---|---|---|---|
| Dentina (template, dental) | Geist **300**, h1 72px, letter-spacing -0.02em | Geist 16px | Geist (exact) |
| Sabi (template, yoga) | Geologica **300**, h1 46px, letter-spacing -0.04em | Geologica | Geologica (exact) |
| Carriage (template, pilates) | Fraunces 400, h1 92px, letter-spacing -0.035em | DM Sans | Fraunces + DM Sans (exact), but see the warning above |

Habits: light weights (300) at large sizes with tight negative tracking; sentence case. Two-tone headlines: one word in the accent colour, the rest lighter (Dentina "**Caring** for your smile", seen).

### Colour

Strategy: tinted light background (cool sky, sage) with one calm accent. To stay away from the template default, prefer a cool tint and an all-sans pairing (inferred).

| Example | Hex set (measured) |
|---|---|
| Dentina | sky `#00a6f4`, pale sky `#f0f9ff`, white cards `#ffffff` (sky as text fails contrast at 2.71:1; use it as a fill) |
| Sabi | ink `#262b23`, button green `#2f3a2a`, sage `#c3c8b8`, warm white `#f9f8f4` (ink on warm white 13.61:1) |
| Carriage (the version to avoid) | cream `#f6f1ea`, espresso `#2a201b`, terracotta `#b8643c` |

### Shape and density

- Corners: round. Cards 16 to 24px; images 8 to 16px (Dentina); buttons pill (Dentina 40px, Carriage 999px) or soft 10 to 12px (Sabi).
- Arch crops: Carriage's hero image has a 200px top radius and 24px bottom radius (measured). Arch crops also recur in Dribbble yoga shots and the Framer "Therapist Practice" and "Lustre Studio" templates (seen). Sabi uses a full circle crop (measured 50%).
- Density: airy, centred content in places, but cards keep it organised.
- Borders: none; white cards on a tinted ground.
- Extras: address shown as a pill in the header (Dentina "123 Madison Ave, New York, NY", seen).

### Imagery

- Rounded photos, arch or circle crops, floating white chips over a photo (Carriage's "next class" card, seen).
- Inset hero: the photo sits inside the page with a rounded 20px frame and the headline at bottom-left (Crown Cut, measured 20px).

### Suits

Dental and GP clinics, physiotherapy, yoga and pilates, family hair salons, children's services.

### Examples

- https://dentina.framer.website/ (template, dental): Geist 300, sky and pale-sky, address pill, two-tone headline.
- https://sabi-yoga.framer.website/ (template, yoga): Geologica 300, sage and ink, circle crop.
- https://carriage-pilates.framer.website/ (template, pilates): arch image, next-class chip, week schedule strip. Good sections, generic skin.
- https://crowncut.framer.website/ (template, salon): inset rounded hero with a small "watch full tour" video card.
- https://www.framer.com/marketplace/templates/categories/health/ (gallery): many health templates share the full-bleed warm photo with a bottom-left headline (seen).

---

## Family 5: Deep

**Feel:** Moody and rich: a dark saturated background (forest, oxblood, espresso, teal-black), pale type, compressed or wide display, mono labels.

### Typography

| Seen on | Display (measured) | Body and labels (measured) | Free match on Google Fonts |
|---|---|---|---|
| Aurora (Squarespace template, wellness retreat) | compressed face, h1 204px, **letter-spacing -0.05em**, line-height 0.78 | **Oxygen Mono** 16 to 21px for body, nav and buttons | Oxygen Mono (exact); Six Caps or Antonio for the compressed display, inferred |
| Madie (real, café) | Dazzle wide uppercase 60 to 72px | Cottorway 17px; JetBrains Mono also loaded | Unbounded or Archivo (width 125) + JetBrains Mono, inferred |
| Pluvex (template, plumbing) | Phudu 700 | Outfit | exact |

Habits: either very compressed and very tight, or very wide; pale type on dark; mono for small text.

### Colour

Strategy: dark mode with jewel tones and one pale accent.

| Example | Hex set (measured) |
|---|---|
| Aurora | forest `#12281d`, straw `#efe4ae`, olive `#4d5226` (straw on forest 12.16:1) |
| Madie | oxblood `#3d0012`, wine `#63001e`, candy pink `#ff99d3`, cream `#f6efe6` (pink on oxblood 8.90:1) |
| Pluvex | teal-black `#072324` / `#091e1f`, yellow `#f3bf09` |
| Atera hero | espresso `#231e16`, ivory `#fffaf0` |

### Shape and density

- Corners: pill buttons (Aurora 300px radius, Madie fully round, measured). Madie frames the whole hero inside a rounded panel and uses wavy edges between sections (seen).
- Density: generous, with very large type.
- Borders: none.
- Buttons: solid pale pill on dark (Aurora straw "BOOK EXPERIENCE" in Oxygen Mono, measured).

### Imagery

- Full-bleed moody photos; dark sections alternating with pale ones (Aurora, seen).
- Line illustrations in the pale accent (Madie's dog drawing, seen).
- Stacked photo cards you can drag through (Madie, seen).

### Suits

Evening restaurants and bars, barbers, spas, yoga in the forest-green version, trades in the teal-and-yellow version (Pluvex).

### Examples

- https://aurora-fluid-demo.squarespace.com/ (template, wellness): compressed type, forest and straw, Oxygen Mono.
- https://madie.es/ (real, café): oxblood and pink, outline capitals, review line above the headline.
- https://pluvex.framer.website/ (template, plumbing): teal-black and yellow.
- https://atera.spa/ (real, spa): espresso hero opening into ivory.
- https://www.11elevenbar.com/ (real, bar; listed on onepagelove 11 Apr 2026 with colour tag "Dark" and typeface Optima; not opened).

---

## A possible sixth: Storybook (inferred, needs Robert's eye)

TAB Kitchen & Bakery (real, https://tabkitchenbakery.com/) is warm and illustrated: Inria Serif 90px, Sometype Mono labels, Shrikhand and Bayon; brick `#9c4f48`, saffron `#efb55b`, olive `#7a7a4f`, cream `#faf2e6` (measured); oval-framed illustration, botanical drawings at the edges, headline split across two staggered lines ("Here stands a Cafe" left, "That Feels Like Home." right, seen). It is charming but sits close to the cream-and-serif trap. It could be a variant of Poster rather than its own family.

---

## Which family for which business (inferred)

| | Restaurant / café | Salon | Dental / medical | Trades | Fitness / yoga |
|---|---|---|---|---|---|
| Poster | strong | barbers | weak | strong | bootcamp, boxing |
| Quiet | fine dining | upmarket | aesthetic, premium | weak | boutique pilates |
| Workshop | bakery, coffee | weak | strong (blue) | strong | physio |
| Soft | weak | family salons | strong | weak | strong |
| Deep | bars, evening | strong | weak | teal-and-yellow | yoga (forest) |

For M0's "3 style families", the widest cover with the most contrast between them is **Poster, Quiet and Soft** (inferred). Workshop is the best single fit for trades and could replace Quiet if trades matter more than spas.

---

## Section ideas worth taking (layouts only)

1. **Hero proof line.** A small line beside the call to action or above the headline: Google "G" + five stars + "102 reseñas" (Madie, seen); "4.9 ★ From 480 Google reviews | 12 Reformers per class, never more" as two figures split by a thin divider (Carriage, seen). Fits every business; the data is a natural field.
2. **Next-slot card over the hero photo.** A small white card floating on the photo: "Reformer Flow · Today 18:45 · With Maya · 4 spots left [Book]" (Carriage, seen). For salons: next free chair; for clinics: next appointment; for trades: "Available today".
3. **Week strip schedule.** Seven small day chips (Mon 3 … Sun 9), today filled dark; under it a list of rows: time, class with a level meter, teacher with avatar, "3 spots left", Book (Carriage, seen). Doubles as **opening hours** for any business.
4. **Hours in one line.** "OPEN DAILY: 7 AM – 9 PM (MON – FRI) / 8 AM …" as one small uppercase line near the top (Atera, measured as body text). The compact cousin of the week strip.
5. **Level meter on cards.** Three short bars, 1 to 3 filled, plus a word ("Light / Medium / Heavy") on each class card (Carriage, seen). Could show spice level on a menu or job size on a trade service (inferred).
6. **Problem → fix pairs.** Two columns: left lists the customer's problems with small icons ("Split ends", "Dull hair"), right lists the matching service ("Precision trims", "Gloss treatment") (Crown Cut, seen). Works for trades ("Burst pipe → same-day repair") and dental (inferred).
7. **Location marquee.** Town or branch names in giant capitals in one line, with a small round photo between words (Tripletta "VERSAILLES ● MONTROUGE", seen). Useful for multi-site cafés and service areas of trades.
8. **Trust checklist plus three numbers.** Three ticked lines ("Licensed, bonded & fully insured crews", "Factory-certified installers", "25-year written workmanship warranty") above a row of three figures with small captions: 10K / 25+ / 4.5 (Roofex, seen).
9. **Intro offer band.** A full-width coloured strip with a big price at left ("$59"), one line of terms, and one button ("Claim the intro offer") (Carriage, seen).
10. **Hairline list with corner ticks.** Services or values as stacked 1px-bordered rows; the first one open with a short paragraph, small tick marks at the box corners (Tekt, seen).
11. **Rotating stamp badge.** Circular text ring with a mark in the middle ("Since 2010" on Pluvex; Tripletta; Madie), placed overlapping the hero edge (seen). Pure CSS, no JavaScript needed (inferred).
12. **Corner labels.** Business name pinned top-left and neighbourhood pinned top-right in small mono capitals ("TAB KITCHEN/BAKERY" … "JP NAGAR", seen).

Not seen today: a price list with dotted leaders. It was the brief's example; I did not find it in today's sample, so it stays an idea, not evidence.

---

## Dribbble trends by industry (seen, popular shots, 2026-11-14)

- Restaurant (https://dribbble.com/search/restaurant-website): dark pages with food photos; one editorial take with burgundy and cream and a serif ("Drizzle", https://dribbble.com/shots/26722436-Drizzle-Restaurant-Website-Design); bright food-bowl layouts on white.
- Salon (https://dribbble.com/search/salon-website): muted beige and black editorial; one black-and-white bold grid ("Gallery / About"); one deep green.
- Dental (https://dribbble.com/search/dental-clinic-website): mostly blue with smiling stock photos; one standout in black and white with a large grotesk (a shot titled "Implant Dentistry" by Nixtio in the same results; I did not record its own URL).
- Plumber (https://dribbble.com/search/plumber-website): navy or dark green with orange or yellow, worker photos, badges; very uniform.
- Yoga (https://dribbble.com/search/yoga-studio-website): sage green and beige, arch-shaped photo crops, serif headings.
- Small business (https://dribbble.com/search/landing-page-small-business): no clear pattern.

Takeaway (inferred): concept shots per industry converge on one colour cliché each (blue dental, navy-and-orange plumber, sage yoga). Offering every family for every business, with the model choosing, is how we beat that sameness.

---

## Evidence log (measured 2026-11-14)

| Site | Type | Fonts (computed) | Main colours | Radius |
|---|---|---|---|---|
| triplettapizza.com | real pizzeria | Oswald, Merriweather | `#004632` `#bdd0a0` `#ff6a00` `#fef8dd` | 0 |
| dashburger.ie | real burgers | Kommissar XCond, Messina Sans | `#f3c0db` `#000000` `#ffffff` | 0 |
| unionboulangerie.com | real bakery | Serial Blur, Shinka, Kiddo | `#2259ec` `#f25a07` `#55270a` `#f2f0ed` | 0 (circle icon buttons 50%) |
| madie.es | real café | dazzle, cottorway, Inter, JetBrains Mono | `#3d0012` `#63001e` `#ff99d3` `#f6efe6` | pill |
| tabkitchenbakery.com | real café | Inria Serif, Sometype Mono, Shrikhand, Bayon, PP Editorial New | `#9c4f48` `#efb55b` `#7a7a4f` `#faf2e6` | 0 |
| odysseeclinic.com.au | real clinic | psTimes, baselGrotesk | `#1e305e` `#fffcf8` `#a79f9c` | 0 |
| atera.spa | real spa | HW Atlantic, Lettera Text LL | `#231e16` `#fffaf0` | 0 |
| maben.com.au | real construction | ABC Repro, ABC Repro Mono | `#ff5226` `#f8f8f2` `#292728` `#d8d5c9` | 0 |
| tekt.com.au | real builder | af Another Sans, Herbik | `#ecf1f4` `#d0dbe4` `#2d2012` | 0 |
| carriage-pilates.framer.website | template pilates | Fraunces, DM Sans | `#f6f1ea` `#2a201b` `#b8643c` | pill; arch 200/24 |
| dentina.framer.website | template dental | Geist | `#00a6f4` `#f0f9ff` `#ffffff` | cards 16, buttons 40 |
| sabi-yoga.framer.website | template yoga | Geologica | `#262b23` `#2f3a2a` `#c3c8b8` `#f9f8f4` | 10 to 12; circle crop |
| crowncut.framer.website | template salon | Erode, Inter Display | `#f7f4ef` `#ff6a00` | pill; hero 20 |
| roofex.framer.website | template roofing | Bebas Neue, Inter | `#000000` `#f7f7f4` `#f25912` | 16 |
| pluvex.framer.website | template plumbing | Phudu, Outfit, Inter | `#072324` `#f3bf09` | pill 30 |
| aurora-fluid-demo.squarespace.com | template wellness | compressed face, Oxygen Mono, Clarkson | `#12281d` `#efe4ae` `#4d5226` | pill |
| tiempo.fitness | real app (not a studio) | Apris, Tiempos Text | `#0a0a0a` `#f2e7df`, volt accent (seen) | not relevant |

Gallery and listing pages used: https://recent.design/websites?category=food-drink, https://recent.design/websites?category=health, https://www.siteinspire.com/websites/category/food-and-drink, https://www.siteinspire.com/websites/category/health-and-fitness, https://www.siteinspire.com/websites/category/building-and-construction, https://onepagelove.com/genre/restaurant, https://www.framer.com/marketplace/templates/categories/health/, https://www.framer.com/marketplace/templates/categories/beauty/, https://www.framer.com/marketplace/templates/categories/home-services/, https://www.squarespace.com/templates/browse/topic/health-beauty.

## Limits

- 16 sites measured. Several "real" examples are European or Australian design-led businesses, not typical small businesses; templates fill the gaps for dental, yoga and trades, where I found no strong real example today.
- The script reads the first visible heading and paragraph; a page with a loading screen can report a hidden element. Values were cross-checked against screenshots where possible.
- Paid fonts were matched to Google Fonts by eye. Those matches are inferred and should be checked side by side before Robert picks.
- Land-book's industry filters (which include "Local Business" and "Medical") and Mobbin were not reviewed.

## Questions for Robert

1. Which three families should M0 test? Proposed: Poster, Quiet, Soft. Alternative: swap Quiet for Workshop if trades matter more than spas.
2. Is Storybook worth a family of its own, or is it too close to the cream-and-serif look?
3. Should Deep be a family, or a dark setting that any family can switch on?
