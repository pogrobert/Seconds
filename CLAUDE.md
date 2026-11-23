# Builder (working name)

Status on 2026-11-14: idea and research only. There is no code, no git repository and no dependency installed yet.

## What this is

An AI website builder where the model never writes component code.

- The user sees a chat panel on the left and a live preview on the right, like Lovable.
- A decision model picks from a large library of ready-made blocks and styles. It answers multiple-choice questions; it does not write text or code.
- Its answers become a **site spec**: a plain data file that says which blocks, in what order, with what text, colors and fonts.
- Ordinary code renders the spec into the site. The same spec always gives the same site.
- Target: a complete, good-looking site about one second after the user presses Enter, at a cost of well under a cent.

The reason to build it: code-writing builders (Lovable, v0, Bolt, Replit) take minutes, burn credits, and break things when they edit. Robert tried Relume, which also assembles from components, and found it slow ("minutes") and unimpressive.

## Decided by Robert

- **Product shape** as described above.
- **The library is the heart.** It should be large, cover many tastes and directions, and keep growing.
- **Two headline features are in scope:** The Wall, and a whole business from one link (both described under Milestones).
- **Agent-ready sites wait.** Giving each site an MCP server and structured actions is a later idea, not part of the first version.
- **"Builder" is a placeholder name.** The real name is undecided. Do not choose, register or publish under any name.
- **No monetization for now.**
- **Reach (2026-11-14):** websites now. The design must leave room for apps (logins, databases, payments) later without a rewrite.
- **Where it runs (2026-11-14):** the first version is Robert's hosted copy only. Self-hosting is out of the first version; do not build a Docker image, self-host drivers or self-host docs. Keep it possible later by following the two cheap rules in `docs/technical/README.md` (only `env.ts` touches Cloudflare; the pipeline stays pure).
- **Who site code is for (2026-11-14):** people who never open code. Published pages should be as fast and light as possible. When code is exported, its reader is an LLM coding agent, not a human.
- **A hobby project (2026-11-17):** Builder is Robert's side project, not a startup. There are no customers to plan for; favour what makes the sites better and the work faster over scale, cost at volume and production polish.
- **React on published pages is allowed (2026-11-17):** Robert: "we can use react. the difference of speed isn't that much". Blocks may use React in the browser where they need it. This replaces the earlier rule of no React in the browser.
- **Block library from free MIT sources (2026-11-17):** use free blocks from the public GitHub repositories of Tailark (tailark/blocks) and Shadcn Space (shadcnspace/shadcnspace), plus shadcn/ui, themed by our colour and type rules. Never take from their paid Pro sets or from their websites, where free and Pro sit side by side. Record each block's source and keep its MIT notice. Our own hand-made layouts look generic too, so they can be dropped where a better block exists. *(2026-11-23: superseded. The product draws whole-page templates (`packages/library/src/templates`); the borrowed blocks and the block-era packages were deleted.)*
- **Stack (2026-11-14):** fixed. pnpm, TypeScript, React, TanStack Start, Tailwind v4, with Cloudflare as the default host for Robert's copy. Design around its limits; do not propose replacing a part without asking.
- **Published sites (2026-11-14):** stay frozen when a block improves, until the owner republishes.
- **Custom code (2026-11-14):** allowed only inside a sandbox. Not part of the first milestones.
- **Sign-in (2026-11-14):** a visitor can generate before signing in, with limits. Sign-in is needed to save or publish.
- **Content size (2026-11-14):** small lists only in the first year (menus, services, a few dozen posts). Reserve room to move large content out of the spec later.
- **First milestone (2026-11-14):** the taste-and-contract test (M0 below). It is about taste first: does the decision model make better-looking sites than sensible defaults written in code?
- **M0 pass mark (2026-11-14, set before any results):** the decision model earns its place if Robert prefers its site over the code defaults in at least 20 of the 30 blind pairs. It must also beat random choices.
- **Decision model (2026-11-14):** TypeSafe's Jev, called directly at `api.typesafe.ai` and pinned to `jev-1.14.0`, instead of Cloudflare's `clef-flash`. The key is `TYPESAFE_API_KEY` in `.env`. Cloudflare stays the host.
- **Taste lives in the library, not in the model (2026-11-15, after the M0 blind test):** every block, variant, style family and setting must already look good on its own, in any combination the rules allow. The decision model is never relied on for taste; at most it matches good options to a brief. An option that loses head to head is fixed or removed. Result: `docs/m0/07-blind-test.md`.
- **M0 business kinds (2026-11-14):** restaurant or café, hair and beauty salon, dental or medical clinic, trades (plumber, electrician, roofer…), fitness or yoga studio.
- **M0 style families (2026-11-14):** Poster, Quiet and Soft (`docs/decisions/0002-style-families.md`). Workshop and Deep stay as options outside M0.
- **Test images (2026-11-14):** licensed stock photos for M0's sample businesses and briefs. Pexels was chosen first but has paused new API keys, so the fetcher uses **Pixabay** (free account; licence allows using, storing and modifying without attribution; API forbids permanent hotlinking and mass downloads). Credit photographers anyway. Keep downloads small and hand-queried; ask the provider before bulk use or before offering stock photos in the product. Unsplash is out: its API requires hotlinking.
- **Ambition.** Robert does not accept "it is not possible". When something blocks the goal, find the strongest way around it. Still report honestly: say what is measured, what is estimated and what failed.

### What we know about naming

- A name has to make sense without an explanation.
- "Monet" was Robert's first idea. It is taken: Monet.Design is a registry of 600+ React landing-page components, the npm name `monet` is used, and the main domains are registered.
- Offered and not taken up: Giverny, Pleinair, Haystacks, Swatches, Wallery, Sitewall.

## Recommended by the research, not yet confirmed by Robert

Treat each of these as a default to propose, and ask before relying on it.

- **Licence:** fully open source under Apache-2.0, with the repository kept private until the first demo works. Do not make anything public, push to a public remote or publish a package until Robert says so.
- **Money later:** if it ever charges, building and exporting stay free and publishing on a custom domain is paid. Polar is the likely payment route.
- **Library shape:** deep, not wide. A few hundred excellent blocks with several variants each, multiplied by a style space, instead of thousands of separate blocks.

## How it works (proposed)

Three roles, each doing only what it is good at:

1. **Code holds the defaults.** A default page per kind of site (sections, order, theme) and the rules for what is allowed.
2. **A decision model makes the judgments.** It adjusts the default: which kind of site, which tone and theme, which sections are relevant, and what each section should be like (image or none, alignment, density). Code then picks the variant that best matches. The model is never asked to choose from a list of every variant.
3. **A fast LLM writes the words.** It fills typed text slots in parallel. It never writes markup, styles or components.

Other parts:

- **Site spec.** Our own format, with a `specVersion` from the first commit. It is not json-render's format, and json-render is not used. It has four parts: structure, style, content, settings. It holds no CSS, HTML or code.
- **One list of content fields.** Fields such as `headline`, `body`, `primaryCta` and `media` are defined once, each with one shape. A section type (hero, FAQ, pricing…) is a named set of those fields. A block implements one section type and can never add a field of its own. So swapping a block or variant never loses text.
- **One command vocabulary.** Every change is a command (`addBlock`, `replaceVariant`, `moveBlock`, `removeBlock`, `setContent`, `setTheme`) that compiles to primitive operations, grouped into a transaction with its own undo. Blocks and list items are addressed by stable ids, never by position. The model, the editor, undo and import all use the same operations.
- **Block contract.** The rulebook each block follows. See Rules.
- **Publishing.** A site is rendered once to plain HTML and one small stylesheet, with no JavaScript by default.
- **Quality checks.** Each block is checked in a real browser before it enters the library: overflow, clipped text, accessibility, and the longest text each variant can hold. When a site is generated, code checks only that the spec is valid, the palette's contrast passes and text is within those limits. Vision models are used only to spot defects, because they agree with designers only about half the time on taste.
- **Misses.** When a request needs a block the library lacks, a coding agent writes it once in the background to the block contract. After it passes the checks it joins the library for everyone. This is the answer to "a library can only build what is in it". It is a later milestone.

**The technical design is in `docs/technical/README.md`.** It lists every decision that is expensive to change later, what an independent review changed, and what has been measured. Follow it. Where it and a numbered report disagree, it wins: the reports were written in parallel and contradict each other in places.

## Milestones (proposed order)

### M0: taste-and-contract test

Purpose: test the three riskiest assumptions before building on them. Does the decision model have taste? Does the section-type list fit real sites? Can blocks be written to the contract at a reasonable cost?

- On paper first: map 40 real small-business sites onto a draft section-type list.
- 8 section types, about 20 blocks with 2 or 3 variants each, 3 style families, images from Surfaces.
- 30 briefs, each built three ways: the decision model chooses, defaults in code choose, random valid choices.
- Robert rates the pairs blind.
- Measure speed and cost on a deployed Cloudflare address, not on a laptop.

Done when there is a table showing how often the model wins a blind pair, how much of the real sites the section types cover, the time and failure rate per block, and the time and cost per site. The full steps are in `docs/technical/README.md` under "Build order".

If the model does not clearly beat the code defaults, the product still works, and the effort moves from the decision machinery to the library and the defaults.

### M1: The Wall

One prompt fills the screen with dozens of complete, different sites to choose from. It is cheap because the text is written once and rendered in many layout and style combinations. Later steps: drag one site's layout onto another's colors, and learn taste from what the user picks.

### M2: a whole business from one link

Paste a link to a business and get a site with its real name, hours, services and prices.

Google's terms forbid storing business names, addresses and reviews taken from Maps (checked 2026-11-14). So use Google only to find the business, take the facts from the business's own website and from uploads, and have the owner confirm them. Every fact records where it came from.

### Later

The block foundry for misses, the visual editor, code export, hosting on custom domains, agent-ready sites.

## First session: do this

1. Read `docs/technical/README.md`, then `docs/research/README.md`. Open the numbered reports only for the part you are working on; they are long.
2. Ask Robert the open questions that block M0: what blind-rating result would convince him the model earns its place, and which model providers he has keys for.
3. Run `git init` and scaffold the project with the fixed stack.
4. Do M0's paper step first: the section-type list checked against real sites. Then write the field list, the section types and the block contract as types and lint rules, so the first block already follows them.
5. Build the rest of M0 and report measured numbers, not expectations.

Keys you will need and must not create yourself:

- A decision model. Cloudflare's `@cf/cloudflare/clef-flash` needs only a Cloudflare account. Others: Jev through Vercel AI Gateway (`typesafe-ai/jev`; pin `jev-1.14.0` when calling TypeSafe directly), Google's `gemini-decision-1`, OpenAI's Decisions API.
- A fast LLM for text. The research suggests Cerebras or Groq serving `gpt-oss-120b` or `gpt-oss-20b`.

Keep the questions to the decision model provider-neutral so the provider can be swapped.

## Rules

- **No component code from a model at request time.** A model may choose, and may write words into text slots. Nothing else.
- **The spec is the source of truth.** Never patch rendered output; change the spec and render again.
- **Every block follows the contract:**
  - It implements one section type and names the fields it uses. It never adds a field of its own.
  - It has several variants. Each states the longest text it can hold per field and what it is like (image or none, alignment, density).
  - It uses theme tokens only: no literal colors, sizes or radii.
  - Every variant that shows an image must look right with generated art, and every section type has a version with no image.
  - Test content for the shortest, longest and right-to-left cases is written once per section type, and every block is tested against it.
- **Licences.** Take blocks only from MIT, Apache-2.0, ISC or BSD sources, and keep their notices. Never copy from Tailwind Plus, Aceternity, shadcnblocks, Relume, Untitled UI Pro, Flowbite Pro, Magic UI Pro, React Bits or Monet.Design. Avoid Webstudio and Plasmic's platform code (AGPL), tldraw (licence key) and WebContainers (commercial licence).
- **json-render** is not used. The spec is our own format. If code is ever copied from it, that code stays Apache-2.0 with its notices.
- **React on published pages is allowed** (decided 2026-11-17, see above). Prefer blocks that render well on the server; ship browser code only where a block needs it.
- **Numbers.** Label every speed, cost or quality figure as measured or estimated. All figures in this file and in the research are estimates until M0 measures them.
- **Secrets.** Keys live in environment variables, never in code, commits or chat.
- **Design choices are Robert's.** Show visual options for him to pick from. Do not lock a look without asking.
- **Explain in simple terms.** Plain words, short points, no jargon without a definition.
- **Other projects are off limits.** Do not edit anything else in `~/Documents/Projects`. Surfaces (`@pogrobert/surfaces`, Robert's library that draws pictures from a seed and one color) can supply imagery, used as a normal npm dependency.

## Research

- `docs/technical/`: the architecture (`README.md`) and six design reports from 2026-11-14.
- `docs/research/`: six market and feasibility reports from 2026-11-13, with a summary and a list of what was re-checked in `README.md`.
