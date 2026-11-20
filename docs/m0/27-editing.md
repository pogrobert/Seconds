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

## Not yet done

- **No undo:** an edit cannot be undone yet; the earlier versions stay only in the chat.
- **No clicking text to edit it:** the preview's text cannot be clicked and edited in place.
