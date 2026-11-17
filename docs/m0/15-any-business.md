# Any kind of business

**Date:** 2026-11-17.

**Why:** Robert typed "new mexico state council". The build page forced it into the nearest of five sample kinds (trades), which gave it:
- the trades sample's Bristol address
- a blacksmith photo
- a "Prices" link
- a muddy brown background

His words: "it should handle ANY kind of business you know. ANY." He also disliked how similar the stock photos and looks were across fields. He chose live stock photo search (option B).

## What changed

1. **Words from the owner alone** (`packages/pipeline/src/site-text.ts`, `writeSiteCopy`). The text model writes the whole page for any organisation, from the owner's words only:
   - what it is
   - its name
   - the section headings ("Menu", "Treatments", "What we do")
   - what it offers
   - three reasons
   - a call to action that fits ("Call now", "Enquire", "Book a visit")
   - three photo searches for its own world: the place, people at work, a close-up detail

   Prices, hours, addresses, phone numbers and emails appear only if the owner gave them. It never moves the business somewhere else.
2. **Layouts without facts** (`tools/eval/src/grammar/`):
   - Every layout now takes its section and menu names from the content.
   - The visit section, contact lines and price column appear only when there is something to show.
   - A long about paragraph steps down in size.
3. **Brand colour per business** (`NAMED_COLOURS` in `colour-rules.ts`). Jev picks one of 32 named colours from their names and moods (it is weak with hex codes).
4. **The muddy background fixed.** The "deep" strategy is no longer offered for orange, brown or yellow hues (OKLCH hue 30–105), which go muddy when taken that dark. Those get "night" or "brand ink" instead.
5. **Live photos** (`apps/web/src/server/photos.ts`):
   - **The searches:** three Pixabay searches (place, people, detail), each also in a "dark" version.
   - **Relevance:** only photos whose tags share a word with the subject count. The first try turned up an escalator for a tattoo studio.
   - **Fallbacks:** shorter searches when the precise phrase finds nothing.
   - **Rate limit:** recent searches are remembered, and the chat reports when Pixabay's limit (100 searches a minute) is hit.
   - **Delivery:** photos are downloaded by the server (Pixabay forbids hotlinking) and sent to the page once. The page turns them into local links shared by all four looks.
   - **Credits** appear in the chat.
   - **Before real users:** ask Pixabay about this volume (CLAUDE.md).

## Results *(measured on the local build page, 2026-11-17)*

| Description | Kind and colour chosen | Time | Cost | Photos |
|---|---|---|---|---|
| "new mexico state council" | state council, navy | 3.2 s | $0.0012 | found; no Bristol, no prices |
| Blackwork tattoo studio in Leeds | tattoo studio, black | 2.1 s | $0.0015 | tattooing (after the relevance fix) |
| Family vineyard in the Sussex Downs | family vineyard, bottle green | 2.3 s | $0.0012 | grapes (after the shorter-search fallback) |
| Family law firm in Manchester, with a phone number | family law firm, sage | 2.5 s | $0.0014 | handshake over paperwork; the phone shown, "Call now" |

- **Where the time goes:** choices and words run at the same time (about 1–1.8 s), then the photo search (about 1.2–1.4 s). Drawing the page takes under 0.1 s.
- **Checks:** the round 3 proof (64 pages) had 0 problems.
- **Code health:** lint and types are clean in all six packages, and the pipeline's 41 unit tests pass.

## Known limits

- **Speed:** about 2–3 s in total, not one second, because the photo search waits for the words. A next step could show the site with placeholders straight away and fade the photos in.
- **Photos:** stock search finds generic photos for rarer fields, and a few searches still return nothing (then sample photos show, with a note in the chat).
- **Web search:** not used. It would add little to the wording. Its real value is facts about a real, named business, taken from that business's own website; that is the "whole business from one link" milestone.
