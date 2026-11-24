# Seconds

An AI builder that turns a few words into a website in seconds.

Try it at [seconds.pogrobert.com](https://seconds.pogrobert.com).

Type something like "a ramen bar in Leeds, open late, gyoza and tonkotsu". In about two seconds
you get a complete one-page site, shown in three different designs. Then change it by talking to
it: "make it green", "roomier", "our number is 0113 496 0123", "write it in Spanish", "undo".

## How it works

Most AI site builders have a model write the code. That takes minutes, and edits can break the
page. Seconds never lets a model write code. The work is split three ways:

1. **Ready-made designs.** 54 whole-page templates, each designed to look good for any small
   business, with any words, any colour and with or without photos. They come with 30-odd
   colours, 8 sets of lettering and 3 spacing levels.
2. **A decision model chooses.** [Jev](https://typesafe.ai) answers multiple-choice questions:
   what kind of business this is, which designs, colour, lettering and page sections suit it, and
   what an edit asks for. It never writes text or code.
3. **A text model writes the words.** `gpt-oss-120b` (through [OpenRouter](https://openrouter.ai))
   fills in typed fields: name, headline, services, questions and answers. It never writes
   markup or styles.

Ordinary code then draws the page from those choices and words. The same choices always give the
same page.

The safety rules are in code, not left to the models. For example, a phone number, address or
email appears only if the owner typed it, and every edit is checked so it changes only what was
asked.

**Photos** come from [Pixabay](https://pixabay.com). A small vision model (Gemini 2.5 Flash Lite,
with GPT-4.1 mini as a backup) looks at the candidates and keeps only real photos that fit the
business. Where nothing fits, the page uses drawn art from
[Surfaces](https://www.npmjs.com/package/@pogrobert/surfaces) instead.

## Numbers

Measured on a laptop against the live model APIs:

- **A new site:** the page in about 1.7 s (median of seven), its photos by about 4.4 s.
- **An edit:** colour, design and spacing in 0.3–0.4 s; changed words in 1–3 s.
- **Cost:** a test round of about 120 builds and edits used $0.40 of OpenRouter credit, well
  under a cent each. Jev adds a little on top (estimated from its per-token price, not measured).

## Run it locally

You need Node 25 or newer and pnpm 10.

```bash
pnpm install
cp apps/web/.dev.vars.example .env
ln -s ../../.env apps/web/.dev.vars
pnpm dev
```

Then open http://localhost:5173.

Put your keys in the root `.env`. The app reads them through `apps/web/.dev.vars`, which points to
it, and the tools in `tools/` read `.env` directly, so each key goes in once:

| Key                  | For                                                | Without it                                  |
| -------------------- | -------------------------------------------------- | ------------------------------------------- |
| `TYPESAFE_API_KEY`   | the decision model                                 | the backup on OpenRouter decides            |
| `OPENROUTER_API_KEY` | the words, the photo check and the decision backup | sample words are used                       |
| `PIXABAY_API_KEY`    | stock photos (free account)                        | drawn art only                              |
| `TMDB_TOKEN`         | film and TV stills for famous subjects (optional)  | no stills; stock and openly licensed photos |
| `RAWG_API_KEY`       | game screenshots for famous subjects (optional)    | no screenshots                              |

The app runs without any keys, just with worse results. On Cloudflare, the same keys are the
Worker's secrets.

Run every check (lint, types, tests) with:

```bash
pnpm check
```

## What's where

| Folder              | What it holds                                                                                                        |
| ------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `apps/web`          | The app: the chat and preview page, and the server that builds and edits sites. It runs on Cloudflare Workers.       |
| `packages/library`  | The 54 page templates and their shared parts. See [the template contract](packages/library/src/templates/README.md). |
| `packages/pipeline` | The calls to the decision and text models, and the checks on what they return.                                       |
| `packages/spec`     | The site spec's types and its list of content fields.                                                                |
| `tools/eval`        | Colour and lettering rules, and sample businesses.                                                                   |
| `tools/bench`       | Scripts that test builds and edits, compare designs and time everything.                                             |
| `docs`              | Notes written while building it: decisions, research, and a dated report for each round of work.                     |

To add a template:

```bash
pnpm --filter @repo/library new-template my-design "My design"
```

This writes a working draft that follows the contract and registers it. Then make it a design of
its own.

## Built with

- [TanStack Start](https://tanstack.com/start), React, Tailwind and [shadcn/ui](https://ui.shadcn.com)
  for the app ([MIT notice](apps/web/src/components/ui/NOTICE.md))
- [Phosphor icons](https://phosphoricons.com)
- [Cloudflare Workers](https://workers.cloudflare.com) for hosting
- Photos by Pixabay's photographers, credited by name under each site's details in the builder

## Status

A hobby project. It makes single-page sites for small businesses. It can't publish them yet, and
it has no sign-in, forms, booking or maps.

Made by [Robert Poghosyan](https://pogrobert.com).

## Licence

[MIT No Attribution](LICENSE). Third-party code keeps its own licence.
