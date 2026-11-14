# M0 result 1: blocks written by coding agents

**Date:** 2026-11-14. **Question:** can blocks be written to the strict contract at a reasonable cost? (`docs/technical/README.md`, Build order, step 2.)

## Answer in short

- **Yes, quickly.** 8 agents wrote 16 blocks in parallel in under 8 minutes of wall time. With `hero/standard`, the library has 17 blocks: 2 or 3 per M0 section type, 37 variants in all. *(counted)*
- **Cost per block:** about 73,000 model tokens. *(measured: 1.17 million tokens over 8 agents and 16 blocks)*
- **Failure rate:** 11 of 56 test runs failed (20%). Most failures came from flaws in the checks, not from the blocks. *(measured, as the agents logged them)*
- **All 17 blocks pass every check:** the fast contract checks (290 tests) and the real-browser check (148 cases in Chromium, at 360, 768 and 1280 px, with axe accessibility rules). *(measured after the coordinator's fixes)*
- **The agents pushed against the contract in useful ways.** They asked for 49 things, and none of them broke a rule to get one. The asks found 4 real flaws in the checks, 1 in the contract and 9 gaps in the kit, all fixed the same day.

## How it ran

- **One brief:** `tools/eval/block-brief.md` (what to read, the rules, the checks and the log format), plus one short assignment per agent naming the blocks and variants.
- **8 agents in parallel**, one per M0 section type, in the same checkout, each writing only its own folders.
- **Model:** the session's default model for helper agents. Which exact model ran was not recorded; record it next time.
- **Logs:** each agent logged its own start and finish times, its test runs and the reason for each failure, in `tools/eval/block-log/<block>.json`. The harness separately measured each agent's total run time and tokens.

## Per block (as the agents logged it)

| Block | Minutes | Test runs | Failed runs | Failures by check |
|---|---|---|---|---|
| `cards/grid` | 3 | 4 | 1 | classes ×1 |
| `cards/list` | 1 | 3 | 0 | none |
| `cards/steps` | 3 | 2 | 0 | none |
| `cta/band` | 1 | 2 | 0 | none |
| `cta/signup` | 0 | 2 | 0 | none |
| `footer/columns` | 5 | 6 | 3 | browser-overflow ×3 |
| `footer/simple` | 2 | 5 | 1 | classes ×1 |
| `header/classic` | 5 | 6 | 2 | render ×2 |
| `header/utility` | 2 | 4 | 0 | none |
| `hero/overlay` | 5 | 4 | 0 | none |
| `hours-location/panel` | 5 | 5 | 2 | browser-overflow ×1 |
| `hours-location/split` | 1 | 2 | 0 | none |
| `price-list/cards` | 1 | 2 | 0 | none |
| `price-list/menu` | 6 | 4 | 1 | browser-overflow ×1 |
| `text-media/editorial` | 0 | 2 | 0 | none |
| `text-media/split` | 2 | 3 | 1 | render ×1 |
| **All 16** | median 2, max 6 | 56 | 11 (20%) | browser-overflow ×5, render ×3, classes ×2 |

The agents' minutes are rough. Some wrote both of their blocks before logging the first start time, so one block carries both blocks' work and the other shows 0 or 1 minutes. The harness times below are more reliable.

| Agent (section type) | Blocks | Harness time, s | Tokens |
|---|---|---|---|
| cta | 2 | 97 | 112,689 |
| text-media | 2 | 150 | 114,554 |
| hero (overlay) | 1 | 291 | 138,266 |
| header | 2 | 328 | 151,754 |
| hours-location | 2 | 379 | 158,191 |
| cards | 3 | 414 | 178,858 |
| footer | 2 | 417 | 145,332 |
| price-list | 2 | 446 | 173,083 |
| **All** | **16** | **median 354; all 8 at once: 446** | **1,172,727** |

*All figures measured on 2026-11-14 on one laptop. The time includes reading the brief, the contract and the kit, which a later agent with the same brief would read again.*

## What the agents found, and what was done

| Found by agents | Count | Done |
|---|---|---|
| The browser check's stylesheet missed classes picked in conditions, so headings were tested at body size | 3 agents | Fixed in two steps. The first fix, reading every quoted string, still failed: an apostrophe in a comment shifted the quote pairs. It was caught by looking at a rendered sample site, not by a test. The scanner now reads every class-like word, and a new test fails if any text style is missing. All 17 blocks re-passed with real heading sizes |
| The class check stopped at the first `)` inside `cx(…)`, hiding later classes | 1 | Fixed: brackets are balanced |
| The browser check counted screen-reader-only text as clipped | 4 | Fixed: visually hidden elements are skipped |
| One agent's empty folder broke everyone's browser run | 5 | Fixed: folders without a component are skipped |
| Item images (cards, menu items) did not count as images, so three signatures had to say "no image" | 3 | Fixed in the contract; the three signatures now say image |
| A section heading could not be the page's h1 | 5 | Fixed: the heading level follows the page |
| `Section` could not be a `<header>` or `<footer>`, and had no compact spacing | 3 | Fixed: `as` and `space` options |
| Fixed labels were English only | 5 | Fixed for the kit's own labels (English and Arabic). Labels written inside blocks are still English: open |
| A one-line address; contact-link sizes; a duration format; an even scrim | 5 | Fixed in the kit |
| Test content too thin (forms, galleries, facts and menu photos only in the longest case) | 5 | Fixed: typical and right-to-left cases now include them |
| Shared helpers between blocks of one section type (hours tables were copied) | 2 | Open: the footer and hours blocks still draw their own hours table; they can now use the kit's `Hours` |
| An icon set | 2 | Open |
| Special hours that drop past dates (a static page cannot know today's date) | 1 | Open: needs a decision on rebuilding sites daily |
| A way for a variant to require item images | 2 | Open |

## Caveats

- **The checks were weaker while the agents worked.** They passed against checks that missed heading sizes and clipped some text. After the checks were fixed, every block passed again without changes to its layout.
- **Coordinator changes after the agents finished:** a new argument to `MapLink` in 4 blocks; corrected signatures and comments in 3 manifests; formatting.
- **Nobody has looked at these blocks with a designer's eye yet.** The checks prove they don't break; they don't prove they look good. That is what the blind rating is for.
- **One run, one model, one brief.** A different model or a shorter brief would give different numbers.
