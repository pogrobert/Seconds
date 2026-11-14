# 0001: Content fields and section types (draft)

**Status:** draft, waiting for Robert's review. No block may be written until this list is approved, because every block depends on it.
**Date:** 2026-11-14.
**What this is:** M0's paper step. 40 real small-business sites were cut into sections, and every section was mapped onto a draft list of section types built from one shared list of content fields.

## In short

- **85% of the sections map cleanly** onto the draft list: 599 of 701 counted sections *(measured in this sample)*. If third-party widgets and online shops are left out, because they are planned as later features, the figure is **88%** (599 of 681).
- The share is almost the same for every kind of business, 84% to 86%. Single sites range from 58% to 100%, with a median of 88%.
- **Only 5 sections (0.7%) had no section type at all.** Each of them is a site-level feature, not a section: a sticky phone bar, a pop-up, a sidebar, share buttons, a search filter.
- **The biggest pressure point is the one the review predicted (`07-review.md`, B1).** 36 sections pack something extra into a section, such as a strip of logos inside an "about us" text, statistics inside a hero, or badges and a licence number in a hero. That is the road to a `hero` with 30 optional fields. Question 1 below asks how to handle it.
- **Prices are the second gap.** 11 sections need more than one price per item: price tables with a column per stylist level, dental fees per payment plan, and prices per team member.
- **The draft has 21 section types built from 16 fields,** plus two types reserved for later (third-party embeds and a shop). The 8 most used types cover 72% of all sections (506 of 701) and are proposed for M0.

Every count on this page is **measured**: it was counted in this sample of 40 sites. The percentages describe this sample only. They are not an estimate for small-business sites in general (see "Limits" at the end).

## How it was done

1. **Five kinds of business, chosen by Robert:** restaurant or café, hair and beauty salon, dental or medical clinic, trades, fitness or yoga studio. That gave 8 sites each, 40 in all.
2. **Finding the sites.** Five research helpers, one per kind, each found 8 independent businesses on their own domains. No chains, directories or booking-marketplace pages. They covered six English-speaking countries (US, UK, Ireland, Canada, Australia, New Zealand), several builders (Squarespace, Wix, WordPress, Shopify, custom), and a mix of polished, average and basic sites. Sites that failed to load were replaced; the reasons are recorded in the data files.
3. **Recording the sections.** The helpers read the home page and up to two key inner pages per site: the menu, price list, team, timetable, service area or contact page, whichever mattered most for that kind of business. For every section, header and footer included, they wrote down what was visibly there, such as the headline, buttons, images, a list of items and what one item contains, prices, hours or a form. **They did not map anything.** The raw records are in `0001-data/sites/`.
4. **Mapping.** One person (Claude, in this session) mapped all 709 sections onto one draft list, so the same rule applied everywhere. Each section got one of five verdicts:

| Verdict | Meaning |
|---|---|
| **Clean** | Everything visible fits the fields of one draft section type, and the business record and collections hold the facts and list items. |
| **Stretch** | It fits one type, but something visible would be lost or needs a field the draft lacks. The missing piece is recorded. |
| **No type** | No draft section type fits. |
| **Later** | A third-party widget or an online shop. Out of scope for the first version by design. |
| **Skip** | Not a real section: empty (heading only), unreadable, or an overlay such as a cookie banner. 8 sections, left out of every count. |

The mapping is in `0001-data/map/` (one line per section) and the counts come from `0001-data/tally.py`, so every number here can be checked and re-run.

## Coverage by kind of business

| Kind | Sites | Sections counted | Clean | Stretch | No type | Later | Clean share | Range across its 8 sites |
|---|---|---|---|---|---|---|---|---|
| Restaurant or café | 8 | 111 | 96 | 11 | 0 | 4 | **86%** | 69% to 100% |
| Hair and beauty salon | 8 | 141 | 119 | 16 | 1 | 5 | **84%** | 58% to 100% |
| Dental or clinic | 8 | 162 | 140 | 17 | 2 | 3 | **86%** | 74% to 100% |
| Trades | 8 | 142 | 120 | 19 | 0 | 3 | **85%** | 69% to 100% |
| Fitness or yoga | 8 | 145 | 124 | 14 | 2 | 5 | **86%** | 64% to 94% |
| **All** | 40 | 701 | 599 | 77 | 5 | 20 | **85%** | 58% to 100% (median 88%) |

## Coverage by section type

| Section type | Sections | Clean | Stretch | Sites using it (of 40) | Kinds using it (of 5) |
|---|---|---|---|---|---|
| `cards` | 104 | 98 | 6 | 29 | 5 |
| `text-media` | 97 | 80 | 17 | 39 | 5 |
| `footer` | 74 | 70 | 4 | 40 | 5 |
| `cta` | 66 | 63 | 3 | 32 | 5 |
| `hero` | 48 | 31 | 17 | 35 | 5 |
| `header` | 47 | 36 | 11 | 39 | 5 |
| `price-list` | 44 | 35 | 9 | 18 | 4 |
| `contact` | 32 | 32 | 0 | 17 | 5 |
| `hours-location` | 26 | 25 | 1 | 18 | 5 |
| `team` | 24 | 22 | 2 | 14 | 4 |
| `testimonials` | 19 | 19 | 0 | 15 | 5 |
| `gallery` | 18 | 16 | 2 | 15 | 5 |
| `pricing-plans` | 15 | 14 | 1 | 8 | 2 |
| `logos` | 13 | 13 | 0 | 8 | 4 |
| `page-title` | 13 | 13 | 0 | 10 | 5 |
| `embed` | 13 | 0 | 0 | 11 | 4 |
| `faq` | 13 | 13 | 0 | 8 | 4 |
| `announcement` | 9 | 6 | 3 | 9 | 4 |
| `service-areas` | 8 | 8 | 0 | 5 | 2 |
| `products` | 7 | 0 | 0 | 3 | 3 |
| (no type) | 5 | 0 | 0 | 5 | 3 |
| `schedule` | 4 | 3 | 1 | 4 | 1 |
| `posts` | 2 | 2 | 0 | 2 | 2 |

"Sites using it" counts sites with at least one section of that type. `header` misses one site because a one-page Carrd site has no navigation.

## What did not fit

Grouped by cause. "Sections" is how many sections had that problem; "Kinds" is in how many of the 5 kinds of business it appeared. The full list, one line per section, is in `0001-data/map/`.

| Problem | Sections | Kinds | Examples |
|---|---|---|---|
| **Extra things packed into a section** | 36 | 5 | A logo strip inside an "about" text (5); business facts such as an address inside a text (4); statistics inside a text (4); trust badges and a licence number inside a hero (3); a rating or statistics in a hero (2); a form inside a hero or footer (2); a logo strip inside a CTA, cards or footer (3); app-store badges (1); lists inside a hero or text (3) |
| **Third-party widgets** (later) | 13 | 4 | Review widgets (6); Instagram feeds (3); booking, timetable and gift-voucher widgets from Mindbody, Wodify and others (4) |
| **Big navigation and in-page navigation** | 12 | 4 | Menus with 19 to 38 links or 3 levels (4); more than 8 top-level items (2); jump links to sections lower on the page (3); site search (1); a search filter (1); filter buttons on a timetable (1) |
| **More than one price per item** | 11 | 4 | Price tables with a column per stylist level or per payment plan (6); prices per team member (2); one price set for a whole group of classes (2); add-ons with extra charges (1) |
| **Slideshows and rotating content** | 8 | 4 | Hero slideshows (6); rotating announcement bars (2) |
| **Online shop** (later) | 7 | 3 | Product grids with basket buttons (coffee beans, hair products, a paid trial class) |
| **Site-level features, not sections** | 7 | 3 | Two separate salons on one site with a switcher (3); a sticky mobile bar with call, directions and book (1); a sidebar (1); a pop-up offer (1); share buttons (1) |
| **Media the draft lacks** | 4 | 3 | Video (1); a video gallery (1); before-and-after photo pairs (1); a hero that is only an image (1) |
| **One-offs** | 4 | 3 | A route-planner box; a list of 64 conditions in 8 groups; a terms checkbox per plan; a list of dated events |

**What fitted better than expected:**

- One `price-list` type covers a restaurant menu, a salon price list, dental fees and clinic visit prices. In each case it is a list of items with a name, description, price and tags, grouped under headings.
- Small print such as service charges, allergy notes, "prices may change" or deposit rules always fitted a single `note` field.
- No site had a section made only of statistics. Statistics always appeared inside another section, which bears on Question 1.

## The draft content fields

Each field is defined once, with one shape. A section type is a named subset of these. A block may use fewer, but can never add one. Character limits are set per section type and can be tightened per variant (review B2).

| Field | Shape | What it is |
|---|---|---|
| `eyebrow` | short text | Small label above a headline ("Since 1978") |
| `headline` | short text | The main line of a section. One field for every section's title, in place of a separate `heading` |
| `subhead` | text | One or two sentences under the headline |
| `body` | rich text: paragraphs, bullet lists, bold and italic, links | Longer text |
| `note` | short text | Small print: service charge, allergy notice, "prices may change", deposits |
| `primaryCta`, `secondaryCta` | `{label, to}` where `to` is a page, an item, a URL, a phone, email or directions link, or a file such as a PDF menu | Buttons |
| `media` | `{asset, alt, focal}` | One image |
| `gallery` | list of `{id, image, caption?}` | Several images |
| `items` | list of `{id, title, body?, eyebrow?, icon?, media?, link?, group?}` | Cards, reasons, steps, policies and FAQs (title is the question, body the answer) |
| `logos` | list of `{id, image, name, link?}` | Partner, press, insurer and accreditation logos |
| `stats` | list of `{id, value, label}` | "20+ years", "5,000 clients". In the list, but used by no section type yet: see Question 1 |
| `nav` | list of `{id, label, to, children?}`, one level of children | Menus |
| `source` | `{collection, pick?, groupBy?, limit?}` | Which collection items a section shows |
| `facts` | list of keys: `hours`, `address`, `map`, `phone`, `email`, `social`, `locations`, `serviceAreas`, `licence` | Which business facts a section shows. The values come from the business record and are never written by a model |
| `form` | a form id: contact, quote, booking request, call-back, newsletter | Which form a section shows |

**Not text fields.** Two other things hold the facts. Their shapes belong to the business-schema work and are listed here only because sections need them:

- **The business record:** name, logo, phone, email, social links, licence or registration numbers, and **a list of locations**, each with its own address, map position, phone, opening hours (several time ranges per day allowed, such as lunch and dinner) and special hours. Also a list of service areas, each optionally in a region.
- **Collections:** lists of items with ids.

| Collection | Item shape |
|---|---|
| Menu item or service | name, description, price, duration, tags (V, GF, "Popular"), image, group |
| Team member | name, role, credentials or registration number, bio, photo, links, location |
| Testimonial | quote, name, detail, rating |
| Plan | name, price, billing period, list of inclusions, highlight, button |
| Class session | class name, weekday, start, end, level, teacher, location |
| Post | title, date, summary, image |

**Price** is one shape everywhere: fixed, "from", a range, per unit (hour, month, session) or "on request", plus optional named options such as short / medium / long or standard / student.

## The draft section types

21 types for blocks, plus 2 reserved for later. "Required" fields must be filled; the rest are optional.

| Section type | Required | Optional | Covers |
|---|---|---|---|
| `header` | `nav` | `primaryCta`, `facts` | Logo, menu and a button; a top bar with phone and address |
| `footer` | | `nav`, `body`, `facts`, `form`, `note` | Link columns, contact, hours, newsletter, legal line |
| `announcement` | `headline` | `primaryCta` | One-line bar across the top |
| `hero` | `headline` | `eyebrow`, `subhead`, `primaryCta`, `secondaryCta`, `media` | The opening of a page |
| `page-title` | `headline` | `eyebrow`, `subhead`, `media` | A plain title banner on an inner page |
| `text-media` | `body` | `eyebrow`, `headline`, `media` or `gallery`, `primaryCta`, `secondaryCta` | About us, story, intro, teaser, disclaimer, long local text |
| `cards` | `items` (2 to 30) | `eyebrow`, `headline`, `subhead`, `primaryCta`, `note` | Services overview, reasons to choose us, process steps, values, policies, quick links. Steps and alternating rows are variants |
| `cta` | `headline` | `subhead`, `primaryCta`, `secondaryCta`, `media`, `form` | A call-to-action band; newsletter sign-up |
| `gallery` | `gallery` | `headline`, `subhead`, `primaryCta` | Photos, project examples with captions |
| `logos` | `logos` | `headline` | Partners, press, insurers, accreditations |
| `faq` | `items` | `headline`, `subhead` | Questions and answers |
| `testimonials` | `source` (testimonials) | `headline`, `primaryCta` | Reviews and quotes |
| `price-list` | `source` (menu items or services) | `headline`, `subhead`, `note`, `primaryCta` | Menus, price lists, fee guides; grouped by category |
| `pricing-plans` | `source` (plans) | `headline`, `subhead`, `note` | Memberships, class packs, service tiers |
| `team` | `source` (team members) | `headline`, `subhead`, `primaryCta` | Staff, practitioners, coaches |
| `hours-location` | `facts` | `headline`, `body`, `primaryCta` | Opening hours, address, map, several locations |
| `contact` | | `headline`, `body`, `facts`, `form`, `media` | Contact details and a form (at least one of the two) |
| `service-areas` | `facts` (service areas) | `headline`, `body`, `primaryCta` | "Areas we serve", towns grouped by region |
| `schedule` | `source` (class sessions) | `headline`, `subhead`, `note`, `primaryCta` | A weekly timetable as a real table, not a picture |
| `posts` | `source` (posts) | `headline`, `primaryCta` | Latest news or blog posts |
| `embed` (later) | | | Third-party widgets: booking, timetable, reviews, Instagram |
| `products` (later) | | | An online shop |

The two `(later)` types reserve the names only. Nothing is built for them in M0 (the "Do not build yet" list).

## Proposed for M0: 8 section types

M0 needs 8 section types (`docs/technical/README.md`, Build order). By use in this sample, the 8 below cover 72% of all counted sections (506 of 701), and each is used by all 5 kinds of business except `price-list`, which trades sites did not use.

| Section type | Sections | Sites using it |
|---|---|---|
| `cards` | 104 | 29 |
| `text-media` | 96 | 39 |
| `footer` | 74 | 40 |
| `cta` | 66 | 32 |
| `hero` | 48 | 35 |
| `header` | 47 | 39 |
| `price-list` | 44 | 18 |
| `hours-location` | 26 | 18 |

**Why these.** Together they make a believable one-page site for every kind of business: a header, a hero, an about text, a services or reasons section, a price list, hours and location, a call to action and a footer. They test the two hardest content shapes: plain text slots (hero, text-media, cta) and a section filled from a collection (price-list). The next candidates are `testimonials` (19 sections, all 5 kinds) and `contact` (32 sections, all 5 kinds). Swapping one of them in is cheap.

## Questions for Robert

These change the list, so they need an answer before the first block.

1. **Extras inside a section (36 sections, all 5 kinds).** Should sections be able to hold small extras such as a logo strip or a few statistics?
   - (a) Keep every section type pure. A block that wants logos under an about text becomes two sections side by side (`text-media` then `logos`). Simple and strict, but some real designs become two separate bands.
   - (b) Allow exactly two shared optional fields, `stats` and `logos`, on `hero`, `text-media` and `cta` only. This would make about 16 of the 36 clean. The rest stay split.
   - (c) Allow extras freely. Not recommended: this is how `hero` ends up with 30 optional fields.
   - Recommendation: **(b)**, with a hard rule that adding a third shared extra needs your approval.
2. **More than one price per item (11 sections, 4 kinds).** Should a price list support columns, such as one price per stylist level or one per payment plan? Recommendation: **yes**. A price list may name up to 4 columns, and each item gives one price per column. It goes into the price shape from the first version, because changing that shape later means migrating every saved site.
3. **Slideshows (8 sections, 4 kinds).** Should heroes rotate? Recommendation: **no rotating slides**. A slideshow becomes one image, or a hero variant that shows several images side by side. This is your design call; it can be shown as options.
4. **Big menus (6 sections).** Recommendation: up to 8 top-level links with one level of dropdowns. Deeper menus are flattened, and a "mega-menu" is not supported in the first version.
5. **Third-party widgets (13 sections) and shops (7).** Confirm these stay "later". Note: review widgets showing Google reviews cannot be copied into our storage (Google's terms, checked 2026-11-14), so they could only ever be a live embed.
6. **Several businesses on one site (1 site, 3 sections).** Confirm this is out of scope. Several *locations* of one business are in scope and are in the business record.
7. **Names.** Are the section-type names clear to you? They will appear in the builder's chat. For example: `text-media` could be "Text and image", `cards` could be "Cards", `cta` could be "Call to action".

## Limits of this study

- **One mapper.** Every verdict is one judgment, applied the same way throughout. A second person would move some sections between "clean" and "stretch".
- **Text, not pixels.** The helpers read pages through a text extractor, not a browser. Layout, carousels and widgets that load later can be missed, and the quality labels are guesses from content. A few sites were only partly read; this is noted in each site's record.
- **Not a random sample.** Search results are full of directory listings, so sites were found by trial and picked by the helpers. All are English-language; there are no right-to-left or non-Latin sites.
- **Part of each site.** Only the home page plus up to two inner pages were read, not every page.
- **Edge of "small".** Two trades firms (Turpin, Gas Safe Bristol) may have more than 30 staff. One clinic (CityMed) was read without its home page.
- **What it does not show.** That a section maps to a type says the content fits. It says nothing about whether a block can draw it well. That is M0's next step.

## The 40 sites

"Clean" is that site's share of its counted sections.

| Kind | Site | Country | Quality (helper's guess) | Pages read | Sections counted | Clean |
|---|---|---|---|---|---|---|
| Restaurant or café | [Gallagher's Boxty House](https://www.boxtyhouse.ie/) | Ireland | average | 3 | 13 | 85% |
| Restaurant or café | [The Hardwick](http://www.thehardwick.co.uk/) | UK | basic | 2 | 19 | 84% |
| Restaurant or café | [Chez Panisse](https://www.chezpanisse.com/) | USA | polished | 3 | 7 | 86% |
| Restaurant or café | [Superiority Burger](https://www.superiorityburger.com/) | USA | basic | 3 | 7 | 86% |
| Restaurant or café | [Market Square Bakehouse](https://www.marketsquarebakehouse.com/) | USA | average | 3 | 21 | 90% |
| Restaurant or café | [Patricia Coffee Brewers](https://patriciacoffee.com.au/) | Australia | polished | 3 | 16 | 69% |
| Restaurant or café | [Laneway Espresso](https://lanewayespresso.co.nz/) | New Zealand | basic | 3 | 13 | 100% |
| Restaurant or café | [Sidewalk Citizen Bakery](https://www.sidewalkcitizenbakery.com/) | Canada | average | 3 | 15 | 93% |
| Hair and beauty salon | [North Laine Hair Company](https://www.northlainehairco.co.uk/) | UK | average | 3 | 26 | 73% |
| Hair and beauty salon | [Vantage Barbers](https://vantagebarbers.com.au/) | Australia | basic | 1 | 7 | 100% |
| Hair and beauty salon | [Roy Hair Design](https://royhairdesign.co.nz) | New Zealand | basic | 1 | 11 | 91% |
| Hair and beauty salon | [Throne Traditional Barbershop](https://thronepdx.com/) | USA | polished | 1 | 14 | 93% |
| Hair and beauty salon | [Cool Kind Nails](https://coolkindnails.com/) | Canada | average | 3 | 15 | 93% |
| Hair and beauty salon | [Q Nails](https://qnailsyeg.com/) | Canada | average | 2 | 20 | 90% |
| Hair and beauty salon | [Bellissimo Hair & Beauty (Galway and Limerick)](https://bellissimo.ie/) | Ireland | average | 2 | 19 | 58% |
| Hair and beauty salon | [Fix Salon](https://www.fixsalonseattle.com/) | USA | polished | 3 | 29 | 93% |
| Dental or clinic | [Hebden Bridge Dental Care](https://hebdenbridgedentalcare.co.uk/) | UK | average | 4 | 22 | 91% |
| Dental or clinic | [Roscam Family Dental Practice](https://roscamdental.ie/) | Ireland | polished | 3 | 22 | 91% |
| Dental or clinic | [Bend Family Dentistry](https://bendfamilydentistry.com/) | USA (3 locations) | average | 3 | 12 | 83% |
| Dental or clinic | [Scotia Dental](https://scotiadental.com/) | Canada | average | 3 | 22 | 77% |
| Dental or clinic | [Active Chiropractic](https://activechiro.ca/) | Canada | polished | 3 | 23 | 74% |
| Dental or clinic | [CityMed Physio and Massage](https://www.citymedphysio.co.nz/) | New Zealand | basic | 2 | 13 | 100% |
| Dental or clinic | [Eyespire Optometrist](https://eyespire.com.au/) | Australia | average | 3 | 23 | 96% |
| Dental or clinic | [Rixis Dermatology](https://rixisdermatology.com/) | USA (2 locations) | average | 3 | 25 | 84% |
| Trades | [T. Simpson Roofing](https://www.tsimpsonroofing.ca/) | Canada | polished | 3 | 34 | 88% |
| Trades | [Clash Plumbing & Heating Ltd](https://clashheating.ie/) | Ireland | basic | 3 | 13 | 92% |
| Trades | [SEQ Sparky](https://seqsparky.com.au/) | Australia | polished | 3 | 33 | 85% |
| Trades | [L & J Sharpline Painters](https://www.sharplinepainters.co.nz/) | New Zealand | average | 3 | 13 | 69% |
| Trades | [The Painting Guru](http://thepaintingguru.co.nz/) | New Zealand | basic | 2 | 10 | 100% |
| Trades | [Late Night Locksmith](https://latenightlocksmithharrisonburg.carrd.co/) | USA | basic | 1 | 6 | 83% |
| Trades | [Turpin Landscape Design Build](https://turpinlandscapedesign.com/) | USA | polished | 1 | 12 | 75% |
| Trades | [Gas Safe Bristol Ltd](https://www.gassafe-bristol.com/) | UK | average | 3 | 21 | 81% |
| Fitness or yoga | [Chapter 2 Fitness](https://chapter2fitness.ie/) | Ireland | polished | 3 | 20 | 90% |
| Fitness or yoga | [Yemaso BJJ](https://www.yemasobjj.com/) | USA | polished | 3 | 16 | 94% |
| Fitness or yoga | [The Ring Boxing Club](https://theringboxingclub.com/) | UK | basic | 3 | 14 | 64% |
| Fitness or yoga | [Debbie Wyer Pilates](https://debbiewyerpilates.com/) | UK | basic | 3 | 16 | 94% |
| Fitness or yoga | [Adult Ballet Centre](https://adult-ballet-tfg8.squarespace.com/) | Australia | average | 3 | 28 | 79% |
| Fitness or yoga | [CrossFit Limitless](https://www.crossfitlimitless.ie/) | Ireland | average | 3 | 17 | 94% |
| Fitness or yoga | [The Yoga Studio of Calgary](https://www.theyogastudiocalgary.com/) | Canada | average | 3 | 17 | 88% |
| Fitness or yoga | [arc Wellness Studios](https://arcwellness.nz/) | New Zealand | average | 2 | 17 | 82% |

## Data

- `0001-data/sites/<kind>.json`: what each section contains, as recorded by the helpers.
- `0001-data/map/<kind>.tsv`: one line per section: site number, page, order, section type, verdict and missing piece.
- `0001-data/tally.py` and `0001-data/groups.py`: recount everything. Run `python3 tally.py .` then `python3 groups.py .` inside `0001-data/`.
