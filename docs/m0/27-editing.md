# 27. Editing

2026-11-20. Robert: "editing does not work". A follow-up message rebuilt the whole site from all
messages, so every word, photo and choice could change, not only what was asked. Now a follow-up
changes only what it asks for and keeps the rest.

## How it works

1. **A build hands back its state** (`SiteState` in `make-site.ts`): the owner's words so far,
   the written words, the colour, the lettering, the three templates, the extra sections, the
   art pick and the seed. The page keeps it with the result.
2. **A follow-up sends the state with the message** to the same live stream
   (`/api/build-stream`). The edit is in `apps/web/src/server/edit.ts`.
3. **One Jev request** asks whether the message:
   - is a new business or "start again";
   - changes words or facts;
   - changes the colour;
   - changes the design or mood;
   - changes the lettering;
   - adds or removes parts of the page;
   - asks for new photos.

   The same request answers what each change would be: which named colour, which templates (all
   47 ranked), which lettering, and which extra sections. That takes about 0.3 s.
4. **The writer's edit mode** (`writeSiteCopy` with `edit`) runs alongside. It sees its earlier
   answer and the request, and changes only what is asked. All its rules still apply: a fact the
   owner states now may be used, but nothing is invented. Its answer is used only when Jev says
   the request is about the words.
5. **Only the flagged parts change.** Sections and design need Jev at over 0.75, because they
   change the whole page; an opening-hours message once added a section nobody asked for. The
   rest need over 0.5.
6. **New photos** happen only when asked. The message gets fresh searches, and the photo step
   runs on the server and streams in as for a new site.
7. **A new business or "start again"** builds from scratch with all messages.

**The page:**
- photos already shown are kept unless new ones were asked for;
- it stays on the design being looked at when that design is still one of the three;
- the reply says what changed ("Changed colour to forest and the words. Anything else?").

## Measured (laptop, one hair-colour studio, edits in a row)

| Request | Time | Changed |
|---|---|---|
| Make the headline shorter | 1.4 s | the words ("Your shade, your pace" became "Your shade") |
| Use a deep green instead | 0.3 s | colour to forest |
| Make it darker and more dramatic | 0.3 s | the designs (Low light first) |
| We are open Tuesday to Saturday, 10 till 6 | 1.2 s | the words (the hours) |
| Add a questions section (it had one) | 0.3 s | nothing |
| Remove the steps part | 1.0 s | the sections (and the words) |
| Different photos please, more of the salon chairs | 1.0 s, photos at 4.4 s | the photos |
| Actually make it a pizza place in Naples instead | 2.4 s, photos at 3.9 s | a new site, Forno Napoli |

- **In the browser:** a dentist's headline edit took 1.1 s, kept the design being viewed (Field)
  and kept all three photos.
- **Word edits take about 1–1.4 s:** the writer rewrites the whole set of words. Other edits take
  about 0.3 s.

## Blank questions after an edit (fixed, 2026-11-20)

**The bug:** Robert edited a dentist's site with "working 9-5 weekdays", and its steps and
questions showed empty boxes.

**The cause:**
- The new site's fact check had removed all its question answers.
- The writer's schema needs at least four questions, so in edit mode it filled them with
  blank strings.

**The fix:**
- Blank items are now dropped from every list (`dropEmpty` in `site-text.ts`).
- Questions an edit changes go through the same check as a new site's.
- An edit that leaves fewer than three steps or needs keeps the earlier ones.

**Checked:** in the browser, the same edit leaves no empty item in any of the three versions,
and the hours show.

**A limit, by design:** "Add a few questions people ask" changes nothing for a brief with no
facts to answer them with, because answers are never invented.

## Testing loop: 10 prompts with edits (2026-11-20)

Robert: "keep testing and keep improving … repeat for 10 random prompts".
`tools/bench/src/try-edits.ts` sends a prompt and its follow-ups exactly as the build page does,
and screenshots version 1 after every step (`runs/try-*`). The prompts were:
- a dog groomer, a vegan bakery, Kraków council, a jazz bar, a wedding photographer;
- a kids' coding club, a bike repair shop, an Indian takeaway, a physio clinic, a Berlin
  techno club;

each with 2–3 edits. A florist with two edits also went through the real build page in the
browser.

**Found and fixed:**

| Found | Fix |
|---|---|
| A cartoon, probably AI-made, reached a dog groomer's page as a "photo" | Pixabay results tagged as generated, illustration, cartoon, render and so on are dropped, and the vision check now rejects anything that is not a real photograph (`photos.ts`) |
| Edits changed parts nobody asked for (a phone number changed the offer's heading; opening hours replaced a council's services; a packages request rewrote a headline) | Every part the writer changed is checked: kept only if it carries the request's own words or numbers, or Jev is sure (over 0.75) the request asks for it; otherwise it goes back. A rename replaces the old name everywhere (`keepAsked` in `edit.ts`) |
| Jev judged "Packages: half day £900, full day £1,500" not to concern the offer (0.44), so the new prices were thrown away | The own-words rule above keeps them |
| An edited package description invented "up to four hours" | Edits that change questions, offer, reasons or steps get the same fact check as a new site |
| "Use navy blue" on a navy site replied "Nothing matched" | Edits say what is already so: "the colour is already navy", "Civic is already the closest design to that", "the words already say that" |
| "Less text, more direct" and "We deliver within 5 miles of Bath" were not read as being about the words | Jev's words question now covers tone, length and new facts |
| The writer would not mention delivery even when the owner stated it, because its standing rule forbids unasked delivery promises | In an edit, what the owner states is theirs to promise and goes where a visitor will see it |
| A change could land only in a part the page does not show | That part joins the page |
| A physio clinic's name was the brief itself ("Physiotherapy clinic for runners in Edinburgh") | Name options that only restate the brief are left out of the best-of-three |
| A club's line-up read "DJ A", "DJ B" | Placeholder items count as made up and go |

**Still weak:**
- **Photos:** home kitchens for an Indian takeaway; instruments rather than people for "more
  photos of musicians".
- **Run-to-run variation:** the same request can change slightly different parts.

**Timings (measured):**
- new sites: page and photos in 3–7.6 s;
- word edits: 1.2–2.8 s;
- colour, design and section edits: 0.2–0.4 s;
- new photos: about 3.5–4.7 s.

## Second testing loop (2026-11-21)

Twenty new businesses with two or three edits each (a dog groomer, Krakow council, a Lisbon record
bar, a Bristol plumber, a wedding photographer, a Berlin club, a physio, a Welsh school, a bakery,
a UX designer, then a ramen bar, a climbing gym, an accountant, a cat café, a bookshop, a roofer, a
jazz trio, a yoga studio, a food bank and a tattoo studio). The first ten found these; each was
fixed and run again.

| Found | Fix |
|---|---|
| "Make it blue" on a navy site did nothing: Jev gave "a different colour" 0.49 | The question asks for any colour, even one it has; the reply says "the colour is already navy" |
| "Less text" did nothing: the writer shortened every part, but no part was asked for on its own, so all went back | A new question, "change all the text at once"; when yes, every change the writer made stays |
| "Remove anything about cats" added steps and questions: Jev read it as removing a part (0.83) | The parts question excludes facts and mentions; only the part the request names follows Jev's lean, others move only on answers above 0.75 or below 0.25 |
| "Remove the steps" kept them (0.34 on keeping them) | When Jev is sure the request is about parts (over 0.85), the named part follows 0.5 |
| Adding a phone number replaced "Leak detection" with "Phone support" | Each list item the writer drops is put to Jev ("does the request take it off?") and comes back unless yes; offer items an edit adds must be ones the request names; the writer is told contact details are never offer items |
| "We stopped doing boiler installs" made up "Boiler servicing" | Same check on added offer items |
| "Rubbish collection days" brought "bins every Tuesday and Friday" | Items an edit adds get the made-up check at 0.5, with no minimum kept; what the page had, unchanged, is not asked again (Jev once dropped "Initial assessment" that way) |
| "Show more photos" and "different photos" showed the same photos | The build page sends the photo ids it shows; new searches leave them out. "More photos" adds a gallery only when the gallery question agrees |
| "Add a gallery" on a page that has one, "remove the steps" on one without: no reply | A question names the part; the reply says it is already there, or not there |
| "Add questions and answers" changed nothing: the check emptied every answer | One real answer is enough when asked for, the rest say "Get in touch"; with none, the reply asks the owner for them |
| "Add how to donate": the writer wrote "donations", which did not count as the request's own word | Words match on their first five letters |
| A subhead cut at its length limit read "…or volunteer your…" | One-sentence text cut short ends at its last clause, with a full stop |

**Still weak:** photos (a wrecked camper van and a train station for a dog groomer, a home kitchen
for a food bank, 5 of 8 spaces with drawn art for a Brooklyn tattoo studio).

**Timings (measured):** new sites 2.7–6.4 s with photos; word edits 1.3–3.2 s; colour, design and
section edits 0.2–0.4 s; new photos 2.8–4.4 s.

## Third testing loop: messy edits (2026-11-21)

Ten more businesses with edits as people really type them: several changes in one message,
"undo that", "I don't like it", a language switch, "remove the photos", a fact taken back.

| Found | Fix | Checked again (2026-11-23)? |
|---|---|---|
| "We're called Bean There" threw the site away (start again scored over 0.5) | Starting again needs 0.75, and a new name or new facts is said not to count | Yes |
| "Undo that last change" did nothing | A question for undo; the build page keeps each version with its photo links and steps back one | Yes |
| "I don't like it" changed nothing, with no useful reply | A question for a vague dislike; the reply asks what to change and points to the other two designs | Yes |
| "Fewer sections", "remove the photos", "more trustworthy" changed nothing and said nothing | Fewer parts drops the one or two parts Jev wants least; no photos gives every space drawn art; the design needs 0.75 only beside another change (0.5 alone); any edit that changes nothing now gets a reply | Yes |
| "Write it in Irish" translated only the subhead | A language change counts as changing all the text; the writer is told every field changes language | Yes |
| "Make it purple, more modern" wrote "a modern purple setting" into the subhead; "red" got into a headline | Style words never count as the request's own words; the writer is told looks are not text | Yes |
| Adding opening hours added four questions, all "Get in touch" | The one-real-answer fallback runs only when questions were asked for, and never counts "Get in touch" as real | Yes |
| "Remove the delivery stuff" left two delivery questions | When a request removes something, every list item is put to Jev and those about it go | Yes |
| Steps of 15–20 s, then one edit stuck for five minutes | OpenRouter refused the photo check (402: the key was near its limit and each call reserved 65,535 tokens), and the slow backup model was rate-limited. Every OpenRouter call now has a token cap and a time limit | Yes: no 402 or stuck edit since |

Testing paused on 2026-11-21 when the OpenRouter key reached its $3 limit, and went on on
2026-11-23 with a new limit. The re-run found these, each fixed and run again:

| Found | Fix |
|---|---|
| "Fewer parts" scored 0.79–0.94 for "remove the photos", "less text" and "I don't like it" | It acts only when the sections question also agrees (over 0.7); a vague dislike never takes anything away |
| "I don't like it" took the photos off | Same: a vague dislike gets a question back |
| "Write it in Irish" left the steps in English: the strict check on new items took every translated item as new | A whole-text rewrite gets only the new site's check, and falls back to the writer's own (translated) list |
| "We deliver across Copenhagen…" once came back unchanged | When none of the request's new words reach the page, the writer is asked once more |
| "More premium", "calmer and more minimal": "already the closest design" | Asked only for a look, the owner gets the next-best designs |
| "No more photos of food please" took every photo off | That asks for other photos; no photos only for "none at all" |
| "Make the headline funnier" for a Dublin dog walker: "no leprechauns" | The writer is told humour never leans on stereotypes |
| A new hostel site said "Free Wi-Fi" nobody stated | The banned-phrase filter also catches "Wi-Fi" |

Fresh round (barber, taverna, pilates, electrician, pottery, dog walker, recording studio, church,
farm software, hostel): undo, a rename with prices, "hmm not sure", Spanish, "too long", "remove the
FAQ", "less boring" and "I hate the colours" all did what was asked.

## Detailed prompts and no fake decorations (2026-11-23)

Robert: no drawn decorations like the postcard's stamp. Taken out: Postcard's stamp, postmark and
airmail edge; Atelier's card of fabric swatches over the opening photo; Clubhouse's made-up crest
(a club has its own). All three pass the template gate without them.

Six detailed prompts (a Thai takeaway with hours, prices and a phone number; a physio clinic with
fees, hours and insurers; a one-man electrician; a kids' coding club; a Porto wine bar; a
photographer), three edits each. Every stated fact reached the page. Found and fixed:

| Found | Fix |
|---|---|
| Renaming "Marta Light Photo" to "Marta Light Photography" gave "…Photographyphotography": the old name is inside the new one | The old name is replaced only as a whole name, never inside the new one |
| A price edit left "Portrait session" twice | Each list keeps an item once |
| "Remove fault finding" left "Fault located and fixed" among the reasons | The removal check drops items at 0.5 (was 0.6) |
| "Add a section about what to bring" on a page with steps: "steps already on the page" | A part that is already there gets the writer when the request also asks for words |

Still weak: photos (a home kitchen for a takeaway, Bitcoin coins for a kids' coding club).
OpenRouter spent on this round: about $0.08 (measured).

## Fourth testing loop: contact details, spacing and things it cannot do (2026-11-24)

Robert: "try editing different things and see if it works", with a $1 limit. Ten businesses, four
edits each (`tools/bench/runs/edits-2026-11-24.json`), then the same 50 steps again after the
fixes, and a few edits in the real build page. `tools/bench/src/probe-edit.ts` asks Jev only the
"what does the request ask for" questions, to see the scores behind a wrong edit.

Worked first time: adding a phone number and address and then removing the address; prices added
and changed; a rename with typos ("chnage teh name to Splash Kids pls"); a new service; Georgian
and back; opening hours added and removed; an Instagram handle; a review quote; "start over";
undo.

| Found | Fix |
|---|---|
| The spacing changed when nobody asked: "remove the questions and answers", "make the headline shorter", "less text", "remove the opening hours" (Jev 0.65–0.88 on the spacing question) | The question now asks about empty space in the layout, "as opposed to changing what is on the page or how much text there is": those score 0.03–0.05, real spacing requests (German too) 0.93–0.97 |
| "No more photos of kids please" took every photo off (0.62) | The no-photos question excludes photos of one kind: 0.08, while "remove the photos" stays 0.82–0.90 |
| "Make it pink and roomier…" gave tangerine: the owner had said "use orange" before, and the pink vote split between rose and hot pink | A plain colour word in the request keeps the choice to colours of that hue |
| "Make it blue", "more spacious" also said "Clinic is already the closest design to that" | That is said only when the design was the only thing asked for |
| "Can you add a map?", "add a contact form": "I could not tell what to change" | A plain answer for maps, forms, booking and selling online |
| "Remove anything about used bikes" left them in the intro, the closing line and a reason | A removal's change counts as asked for when it takes the request's words out; a list left short by a removal no longer falls back to the old list |
| "Make it pink and more spacious" on a roomy site said only "Changed colour to rose" | Replies add what was already so: "…; the spacing is already roomy" |
| A pottery studio's offer listed "Beginner wheel class" three times | New sites keep each list item once, as edits did |

**Not changed (photos are on hold):** the photo check (Gemini 2.5 Flash Lite through OpenRouter)
was often refused with "temporarily rate-limited upstream" by Google AI Studio during the run, so
some spaces got no photo. A second provider or model for that call would fix it.

**Still weak:** "remove anything about used bikes" can leave a heading in other words ("Second-hand
rides"); "move the questions to the top" and "make the logo bigger" pick other designs instead of
saying they cannot be done; after "no more photos of kids", "remove the photos" is read as
"remove those photos" (Jev 0.33 with that history, 0.85 without).

**Timings (measured, laptop):** word edits 1.0–3.0 s; colour, design, spacing edits 0.3–0.4 s. Four
steps of 17–46 s were the bench waiting out the site's own 10-a-minute limit, not the edit; the
bench now leaves the wait out. OpenRouter spent on this round: $0.40 (measured).

## Famous names, unclear briefs and "add something about…" (2026-11-24)

"Portfolio page for Dutch van der Linde" made him a photographer "across Europe" (then a painter,
then an illustrator): the brief never said what he does, so the writer guessed and built on the
guess. Robert: do both fixes, "for both real and fictional", no middle path.

- **Unclear briefs:** the writer now first decides `unclear` (the words do not say what the
  person or organisation does). Then it guesses no trade, medium or product, writes neutral words,
  and the reply asks: "What does Anna Berg do? Tell me and I will fill it in."
- **Famous names:** it also decides `known` (a famous real person, a well-known fictional
  character or a famous organisation it knows reliable facts about) and then writes their site
  from what is known: Dutch "the gang leader from Red Dead Redemption", Sherlock Holmes at 221B
  Baker Street, Taylor Swift's albums. The made-up-item checks stand down for these sites; contact
  details (address, hours, phone, email) still come only from the owner.
- **Namesakes and themes are not famous sites:** the first version made a "Harry Potter themed
  café" a site about Harry Potter, with a made-up menu, and had Paris Hilton run a Swansea cleaning
  firm. The rule now says the site must be for or about the famous one itself; "John Lewis,
  electrician", "Tom Ford, hairdresser" and "Batman barbers" stay ordinary businesses.
- The writer decides both itself, in the same call: it is the one that knows whether it knows
  someone, and no extra step waits before the words.

Making "add something about the people in his gang" work took four fixes, each measured:

| Found | Fix |
|---|---|
| The writer had no room: the introduction was near its limit, so it squeezed "and his crew" into the subhead | The edit prompt says to add in full and shorten the field's other sentences to make room; lists of people, places or works go in the offer or the reasons |
| It wrote "the men who rode with him" | On a known site it names them: Arthur Morgan, John Marston, Hosea Matthews… (5 of 5 runs) |
| The part check undid it: "does it ask for a change to the introduction?" 0.71, under 0.75 | The question judges the change itself ("does this change do what the request asks?"): 0.92, an unasked headline change 0.54. When nothing passes, the likeliest part keeps its change |
| Gang members added to the offer were taken off as made-up services (0.24) | The new-item question also asks "is it one of the people, places or things the request asks to add?": 0.76, a team member 0.96, "Phone support" for a phone number still 0.31. On known sites it stands down (album titles 0.42–0.55) |
| "List her albums" changed nothing: the words question gave 0.49 | It now covers listing or describing people, works, products, places or history, and rules out colour, design, space, photos and whole parts: 0.78–0.96 for word requests, 0.04–0.14 for the rest |

**The look, too.** The words for Dutch were right, but the page was a light editorial portfolio
with a photo studio, laptops and a man pinning prints: the photo searches and the design pick both
run beside the words, from the brief alone ("portfolio page"). Now the early photo call has the
same famous-name rule (Dutch: a campfire, cowboys on horseback, a gunslinger, a revolver), and on a
known site Jev picks the designs, colour and lettering again with who they are, beside the fact
check (Dutch: Cinema, dark; Taylor Swift: Cinema, Programme, Album in rose; page 1.4–2.1 s).
Ordinary and themed businesses are unchanged.

Also found in the re-run: **"start over: a dog daycare in Austin"** kept the old site's name
("Splash Kids") from earlier messages, then was named "start over". A fresh start now builds from
the new message alone, without the "start over:" words; a bare "start over" rebuilds the first
brief.

The 50-step set showed no regressions. OpenRouter spent on this round: about $0.76 (measured),
most of it on repeated runs of the same edits.

## Not yet done

- **Undo goes back one version at a time,** and only within the open page: a reload forgets the versions.
- **No clicking text to edit it:** the preview's text cannot be clicked and edited in place.
