# 01 — Competitor and product landscape

Research date: 13–14 November 2026. Scope: every product a user might pick instead of a builder where a model *selects* from a curated catalog of blocks, themes and variants, emits a JSON spec, and deterministic code renders it and exports source.

**How to read the labels**

- **[V]** verified from a primary source: the vendor's own docs, pricing page, changelog or repo, a filing, or a measurement I took (GitHub API, npm API).
- **[R]** reported: secondary press, analyst or review sites, *or* a vendor's own marketing claim (speed, user counts). Vendor marketing is also marked "(vendor)".
- **[I]** my inference. Treat it as a hypothesis.

**Limits of this pass.** The shared web-search budget ran out partway through. After that I could only fetch pages whose URLs I already had, plus the GitHub and npm APIs. Several product pages blocked automated fetches (Webflow, Webstudio, Morningstar, PetaPixel). The "Could not verify" section lists what is missing.

---

## 1. Summary

1. **Nobody is selling our exact product.** I found no commercial product that uses a decision model (or any non-generative selector) to build websites from a catalog in about a second. The architecture exists only in an experiment and three tiny demos:
   - Vercel's json-render **Jev composer**, an experimental playground [V].
   - **Instinct**, 7 stars [V].
   - **jev-uswds-voice**, 0 stars [V].
   - **OpenPage**, a JSON-first open-source site builder with 127 stars, where Gemini fills the JSON. No commits since March 2026 [V].
2. **The closest commercial competitor is Relume, not a vibe-coding company.** Relume's site says its AI "does not write raw code. It selects from components our designers built and maintain" [V].
   - It has 1,000+ components and exports to React (Tailwind + shadcn/ui), Webflow and Figma [V].
   - It claims 1M+ users and "2 million websites" (vendor) [R].
   - It now hosts sites through **Relume Publish** (beta, from $12 per site per month) [V].
   - It still uses an LLM, takes "minutes", and targets designers and agencies.
3. **Vercel holds every piece needed to ship our idea:**
   - json-render: 19.6k stars [V] and 10.9M npm downloads in the last month [V].
   - A working Jev composer [V].
   - AI Gateway serving `typesafe-ai/jev` [V].
   - v0's distribution [V].
   
   Vercel is the incumbent most able to ship this within a quarter.
4. **The counter-trend matters and is new.** In 2026, two structured no-code builders moved *away* from structured layers and toward code generation, and both cited quality:
   - **Glide** said coding agents "struggled to reliably produce good applications" when working through its JSON "app description". Output quality "improved substantially" once agents had direct access to full-stack code [V].
   - **Softr** launched AI-written custom frontends on 9 Nov 2026. It says blocks cover about 80% of business software, but only in predefined shapes [V].
   
   10Web now generates a React frontend [V], and Canva Code 2.0 writes code [R]. Our thesis has to answer this evidence directly. Section 6 gives the strongest answers I found.
5. **Code generators are large but slow and costly per action:**
   - Lovable reported $500M ARR in June 2026 and a $13.3B valuation [R].
   - Base44 reported about $150M ARR by May 2026 [R].
   - Replit raised at a $9B valuation [R].
   - A full first site takes them minutes. One April 2026 test measured prompt to deployed URL at about 4 minutes for Bolt, 8 for Lovable and 10 for Replit [R].
   - Lovable's own docs price "Build me a landing page, use images" at 1.70 credits. At the Pro rate of $0.25 per credit, that is about $0.43 per landing page at retail [V inputs, I arithmetic].

---

## 2. Comparison table

Abbreviations: **CG** = model writes code; **TF** = model fills a template or chooses from fixed templates; **BS** = model selects or arranges blocks from a library; **NC** = model edits a proprietary structured canvas. "First site" means time to a first usable site.

| Product | How it generates | Source of truth | First site | Pricing / metering | Export, lock-in, backend | Scale signals | Visibly bad at |
|---|---|---|---|---|---|---|---|
| **Our concept** | BS via decision model; LLM optional for copy | Typed JSON spec | ~1 s (target) | Near-zero marginal cost | Code export planned | n/a | Copy, long tail, variety (known gaps) |
| **Relume** | **BS (LLM)**: "does not write raw code" [V] | Relume project (sitemap → wireframe → components) | "Minutes" (vendor) [R] | Free; Starter from $18/mo; Pro from $40/mo; AI workspace from $24/mo; hosting from $12 per site per month [V] | Exports React (Tailwind + shadcn), Webflow, Figma [V]; Publish hosting in beta [V]; no app backend seen | 1M+ users, 2M sites (vendor) [R] | Designer-oriented; wireframe-first look (reported sameness) [R] |
| **Lovable** | CG (agent) | Code (TanStack Start since 13 May 2026; React + Vite before) + Postgres [V] | ~8 min to a deployed URL in one test [R] | Credits; Pro $0.25/credit; landing page 1.70 credits; small edit 0.50–0.90 [V] | Git sync, zip download [V]; auth, Postgres, payments built in [V] | $500M ARR (Jun 2026), $13.3B valuation, 60M projects [R] | Cost and time per edit; credit burn on fixes [R] |
| **v0 (Vercel)** | CG (composite: base LLM + Quick Edit + AutoFix) [V] | Code (Next.js / React) | Minutes [R] | Free $5 one-time; Plus $30/user; Business $100/user; token-metered ($2/$10 per M tokens on v0 Pro) [V] | Full code; Vercel hosting | 6M developers (one source) [R] | Backend depth; token costs [R] |
| **Bolt.new** | CG in browser WebContainers | Code | ~4 min to a deployed URL [R] | Free 1M tokens/mo; Pro $25 from 10M tokens; Teams $30 [V] | Code export; Bolt Cloud database and hosting [V] | ~$40M ARR (Mar 2025) [R]; Microsoft partnership May 2026 [R] | Token burn in debugging loops; Trustpilot 1.6 [R] |
| **Replit Agent** | CG (agent, effort-priced) | Code + Replit infra | ~10 min to a deployed URL [R] | Core $20, Pro $100; effort-based [R] | Full-stack, own hosting and DB | $9B valuation (Mar 2026); $1B ARR target for end of 2026 [R] | Unpredictable bills [R] |
| **Base44 (Wix)** | CG + managed backend (Deno TypeScript functions) [R] | Base44 platform | Minutes [I] | $16–$160/mo annual; message and integration credits [R] | Built-in DB, auth, permissions [R]; code access unclear | ~$100M ARR (Mar 2026), ~$150M (May 2026) [R]; $200M (Aug 2026, Sacra estimate) [R] | Credits spent fixing AI errors [R] |
| **Framer** | NC: agents edit "real, editable layers" [V]; LLM choice includes GPT, Sonnet, Opus | Proprietary canvas | "Seconds" (vendor) [R] | Free 500 credits; Basic $10 / 1,000; Pro $30 / 3,000 [V] | No code export listed [V]; Framer hosting and CMS; MCP | 188k companies, 4M+ sites (vendor) [R] | Lock-in; no app backend |
| **Webflow** | AI site builder (mechanics unverified); App Gen (CG) paused [R] | Proprietary canvas | Unverified | Basic ~$15, Premium ~$25 [R]; AI credit packs [R] | Webflow hosting; code export limited | n/a | App Gen being deprecated [R] |
| **Wix Harmony** | NC: Aria agent edits Wix's own architecture [R] | Proprietary Wix site | "A few minutes" [R] | Included in all plans, including free; paid ~$17–159/mo [R] | Locked in; Wix commerce and bookings; custom code restricted [R] | Wix is public; Base44 is its code-gen arm | Lock-in; limited code [R] |
| **Squarespace Blueprint** | TF/BS: questions, then designer-made sections [R] | Proprietary | Minutes [I] | Squarespace plans [R] | Locked in; commerce | n/a | Sites look alike [R] |
| **Durable** | TF: picks a template and fills it [R] | Proprietary | "30 seconds" (vendor) [V claim] | Free 300 credits; Launch $25 (or $22); Grow $49 (or $41) [V] | Locked in; CRM, bookings | "3,000,000+" businesses (vendor) [R] | Mostly one-page, generic output [R] |
| **10Web** | CG: React frontend on a WordPress backend [V] | WordPress + generated React | Unverified | From $10/mo yearly; 3-day trial [V] | WordPress plugins; API and white label [V] | 2M+ projects (vendor) [R] | Unverified |
| **Hostinger AI Builder** | Manual mode: 300 templates (TF). Agentic mode: generated designs, code editor, export [V] | Proprietary / code | "Seconds" to "minutes" (vendor) [R] | $1.99–$7.99/mo promotional for 48 months; 250–1,000 AI credits [V] | Commerce on higher tiers [V]; Horizons is a separate CG product [R] | n/a | Unverified |
| **Canva Code 2.0** | CG (multi-model routing) [R] | Code, editable inside Canva | Median prompt-to-publish down 30% (no absolute figure) [R] | All tiers, credit-scaled [R] | Canva hosting; not for complex backends [R] | 265M MAU with access; 6M sites in a year [R] | "We don't support moving elements around" (Canva) [R] |
| **Figma Make / Sites** | Make: CG [V]. Sites: design canvas → site (beta) [V] | Code (Make); Figma file (Sites) | Unverified | AI credits per seat; Make ~30–100+ credits per request [R] | Make publishes, custom domain, backend [V] | n/a | Credit cost; Sites is beta [V] |
| **Google Stitch** | Generates UI designs plus code export; Gemini models | Design canvas, DESIGN.md | Seconds to minutes [I] | Free Labs product with caps [R] | Export to HTML/Tailwind and other frameworks (conflicting lists) [R]; MCP [R] | n/a | Accessibility failures; hard to fine-tune [R] |
| **Builder.io Fusion** | CG on your repo, mapped to your design system [R] | Your codebase | Unverified | Free 60 credits; Pro $24/user; Team $40; $25 per 500 credits [V] | Your own code | n/a | ~70% automatic component mapping [R] |
| **Softr** | Blocks + AI Co-Builder (Mar 2026), then AI custom frontend code (Nov 2026) [V] | Postgres + permissions; generated frontend [V] | Unverified | From $19/mo [R] | Built-in DB, auth, permissions [V] | n/a | Blocks "only come in predefined shapes" [V] |
| **Glide (GlideOS)** | Moved from JSON "app description" to CG [V] | Full-stack code [V] | Unverified | Credits [V]; Plus $50 to publish [R] | Cloudflare runtime, Descope identity, Neon data [V] | n/a | Code visibility only on roadmap [V] |
| **Bubble** | AI generator + agent on Bubble's visual model [V] | Proprietary Bubble app | Unverified | Free 500 AI credits; $32 / $119 / $349 annual [V] | Locked in; full backend [V] | n/a | Workload-unit cost surprises [R] |
| **Plasmic** | Visual React builder; MCP agent control (May 2026) [V] | Plasmic project + React code | n/a | Open source (MIT) + cloud [V] | Code integration [V] | 7.2k GitHub stars [V] | Developer-centric |
| **Webstudio** | Visual builder; built-in AI reportedly dropped [R] | Webstudio project | n/a | From $15/mo [R] | Open source (AGPL-3.0), export [V] | 9.2k GitHub stars [V] | No AI generation [R] |
| **Anima** | CG: Figma → HTML/React, design agent [V] | Code | Unverified | Unverified | Code export, DB and auth [V] | "1.8M+ builders" (vendor) [R] | Unverified |
| **Gamma** | Prompt → decks, docs, simple sites; structured cards [I] | Gamma doc | Seconds to minutes [I] | Credit tiers [R] | Hosted only | $100M ARR, 70M users (Nov 2025); ~100M users (Mar 2026) [R] | Sites are simple one-pagers [R] |
| **Landingsite.ai** | Undisclosed | Proprietary | "~5 min" (vendor) [R] | Free start; 1% fee on top of Stripe for memberships [V] | Locked in | "1M+ websites" (vendor) [R] | Unverified |
| **Mixo** | Undisclosed | Proprietary | "Seconds" (vendor) [R] | $0–$6 (structured data) [R] | Locked in | 750k+ businesses / 3M+ sites (vendor, inconsistent) [R] | Unverified |
| **Unbounce AI (5 Nov 2026)** | Prompt, template or blank start; components [R] | Proprietary | Unverified | Credits added at no extra cost [R] | Locked in; A/B testing | 2.5B conversions dataset (vendor) [R] | n/a |
| **Coframe** | Agents plus a trained model generate and test page variants [R] | Customer's site | n/a | Enterprise | Overlays existing sites | $35M raised, $25M Series A (Nov 2026) [R] | Gains are self-reported [R] |
| **Dora** | AI text-to-site, 3D and animation [R] | Proprietary | Unverified | "Free during alpha" vs ~$14/mo (conflicting) [R] | Unverified | Unverified | Site unreachable from my environment |

---

## 3. Per-product notes

### 3.1 Closest to our idea: catalog or structured selection

**Relume** — the closest commercial match.
- **Architecture.** Relume's homepage and Publish page both state: "The AI does not write raw code. It selects from components our designers built and maintain" [V]. The flow is brief or URL → sitemap → wireframe of real components → style → export.
  - The library has "1,000+ responsive components" and "1,000+ React components… coded with Tailwind CSS and shadcn/ui" [V].
  - The pricing page offers "Standard or Premium" AI models and a monthly capacity of "1–2 websites" on Pro [V]. That implies a meaningful LLM cost per site [I].
- **Speed.** Publish "gets you live in minutes" (vendor) [R].
- **Pricing** [V]:
  - Free, enough for one full site.
  - Starter from $18/mo; Pro from $40/mo; Team from $36 per user (minimum 3); Pro AI workspace from $24/mo.
  - Hosting: free subdomain (1,500 page views); Launch $12 per site per month yearly or $16 monthly.
- **Output.** Exports to Figma (auto-layout with variables), Webflow (Client-First classes) and React [V]. Publish hosting is in beta [V]. I saw no auth, database or payments.
- **Scale.** "Trusted by 1m+ Freelancers & Agencies"; "Component system behind 2 million websites" (vendor) [R]. Relume Studio (on-brand image generation) entered beta on 3 Nov 2026 [V].
- **Weakness.** It is built for professional web designers handing off to Figma or Webflow, not for end users who want a live site [R]. It is not instant. Copy comes from an LLM [I].
- **Why it matters.** Relume shows that catalog selection is viable at scale and that designers accept it. What Relume lacks is our differentiator: about one second, near-zero cost, a typed spec as the edit surface, and reproducibility.

**Vercel json-render + Jev composer** — the exact mechanism, but not a product.
- Repo: 19,616 stars; pushed 13 Nov 2026 [V]. `@json-render/core` had 10,903,181 npm downloads from 14 Oct to 12 Nov 2026 [V].
- **How the Jev composer works** (per the README in `apps/web/lib/jev`) [V]:
  - Jev answers Choice, Boolean or Score questions in two batched evaluations: membership first, then parent slots and positions. Code assembles the JSON; "Jev does not author the serialized JSON".
  - There are "no complete UI templates and no generative-model calls."
  - Limits: 14 elements per batch, 14 evaluation calls, nesting depth 4, 10 seconds per provider request, 55 seconds overall.
  - Stated weakness: "Root selection, grouping, and deciding when to stop require planning, which is a documented weakness of Jev." A short request such as "a dashboard with the table at the top" may select only a table.
  - Strings remain an open problem: "Repeating the same field in multiple forms and arbitrary new text/data are not supported." Apps must supply content candidates.
  - The APIs have been available since v0.21.0 as `experimental_` [V].
- Separately, Chat SDK agents gained json-render streaming on 6 Nov 2026 (LLM-authored specs) [V].
- **Read.** This is the reference implementation of our generation step. It is aimed at app UI (forms, dashboards), not marketing sites, and it has no catalog of designed sections, themes or copy.

**OpenPage** (`buildingopen/openpage`, MIT) [V].
- "JSON as the single source of truth."
- 19 block types, 42 layout variants, 10 theme presets.
- Gemini generates the whole JSON, including copy. Exports one HTML file.
- 127 stars; created 26 Feb 2026; last push 7 Mar 2026, so effectively dormant.
- A similar repo, `Siteable/siteable-core` ("19 typed blocks… JSON-as-source-of-truth, MIT"), had 1 star on 30 Oct 2026 [V].
- **Read.** The open-source JSON-first builder exists, but nobody has pushed it. Its model writes JSON rather than choosing, so it is neither instant nor near-zero cost.

**Jev demos** [V].
- **Instinct** (`joevidev/ui-generator-instinct-jev`, 7 stars): Jev picks among 48 shadcn components and 17 shadcn blocks in 2–3 calls. "Jev never generates a line of code or copy back."
- **jev-uswds-voice** (`ctrimm/jev-uswds-voice`, 0 stars): a voice-driven *website* builder.
  - One Jev call answers six questions (page, operation, section, position, component…) in "~200–1200ms round trip".
  - Choices become JSON patches over 62 USWDS components rendered by json-render.
  - Content comes from the transcript.
  - It is the purest public instance of our architecture, but it is a demo.

**Thesys OpenUI / OUI-1** [V].
- OpenUI: 15,188 stars; `@openuidev/react-lang` had 2.59M monthly downloads.
- OUI-1 (Sept 2026) "is a finetuned DiffusionGemma model that writes user interfaces in openui-lang": 26B parameters, 4B active, Apache 2.0.
- It was trained across 27 component libraries and is validated against the library schema.
- About 1.9 s per output on an A100. 71.7% on their Generative UI Benchmark.
- **Read.** This is constrained generation, not selection. It is open weights and fast, with no websites focus. It is a plausible alternative engine for us, and a competitor if Thesys turns to sites [I].

**Google A2UI 1.0** (11 Nov 2026) [V].
- Agents "place and configure only the components you register."
- Renderers: React, Angular, Lit, Flutter, SwiftUI, Compose.
- Named adopters are agent and chat surfaces (Alation, Atlassian, ByteDance Lynx, Gemini), not site builders.
- Repo: 17,303 stars. `@a2ui/react` had about 860k monthly downloads.

**Puck** (MIT): 13,699 stars; v0.24.0 on 29 Oct 2026; about 3.0M combined monthly downloads [V]. Its README makes no AI claims. It is a likely editor layer for our product or a competitor's [I].

**Template- and section-selection incumbents** (structured, but LLM-driven and locked in): Squarespace Blueprint, Durable, Hostinger manual mode, Unbounce AI, Wix (Harmony and the retired ADI). Notes are in 3.3.

### 3.2 Code-generating builders (the Lovable class)

**Lovable**
- **Architecture.** An agent writes code [V].
  - New apps since 13 May 2026 use "TanStack Start, which renders pages on the server"; older apps use React + Vite.
  - Every project uses PostgreSQL.
  - Auth covers email, Google, Apple, Microsoft and SAML SSO.
  - Built-in payments need a paid plan; free users can bring Stripe.
  - Git sync to GitHub, GitLab or Bitbucket; zip download on paid plans.
- **Cost per action** [V]:
  - Default-mode credits "vary based on task complexity"; Plan Mode costs 1 credit per message.
  - Examples: "Make the button gray" 0.50; "Remove the footer" 0.90; "Add authentication" 1.20; "Build me a landing page, use images" 1.70.
  - Credit rates: Pro $0.25 per credit; Business $0.50 per credit.
  - A landing page therefore costs about $0.43 retail and a trivial edit about $0.13 [I arithmetic].
  - Free tier: 5 daily credits, capped at 30 per month [V].
- **Scale** [R]:
  - $400M Series C at a $13.3B valuation on 12 Aug 2026 (co-led by Menlo Ventures and EQT's Scaleup Europe Fund); more than $930M raised in total.
  - $500M annualized revenue in June 2026, up from $200M in Nov 2025; the company expected $600M by end of August.
  - Enterprise contracts are only about $20M of that.
  - 60M+ projects; 900M monthly visits to apps built on Lovable.
- **Speed.** About 8 minutes to a deployed URL for a booking-SaaS brief (Tessellate Labs, April 2026) [R].
- **Weak at.** Cost and latency per edit; unpredictable credit burn [R]; output varies from run to run [I].

**v0 (Vercel)**
- **Architecture.** A composite model [V]: a frontier base model plus retrieval, a Quick Edit pipeline for small changes, and a custom AutoFix model (`vercel-autofixer-01`) that checks the output stream mid-generation. It is now a multi-step agent [R].
- **Pricing** [V]:
  - Free: 7 messages a day; $5 one-time credit for new users.
  - Plus: $30 per user per month. Business: $100 per user per month.
  - Token rates per M tokens: v0 Mini $0.20 in / $1.20 out; v0 Pro $2 / $10; v0 Max $5 / $25; Max Fast $10 / $50.
- **Scale.** "6M developers, 80,000 active teams" (Mar 2026; one third-party source) [R]. I found no revenue figure.
- **Note.** The Quick Edit route is the code-gen world's answer to slow edits. Our approach makes every edit a quick edit [I].

**Bolt.new (StackBlitz)**
- In-browser WebContainers code generation [R].
- **Pricing** [V]: Free 1M tokens per month (300k daily cap); Pro $25 from 10M tokens; Teams $30 per member.
- **Bolt Cloud** [V]: unlimited databases; hosting up to 333k requests (Free) or 1M (Pro); custom domains on Pro.
- **Scale** [R]: about $40M ARR by March 2025; Microsoft Azure / 365 partnership on 5 May 2026; total funding $135M as of Dec 2025; Bolt Forge on open-source models in Sept 2026.
- The open-source `bolt.diy` has 20,087 stars [V].
- **Weak at.** Token burn during debugging (anecdotes of more than $1,000 spent); Trustpilot 1.6 out of 5 [R].

**Replit Agent** [R]
- $400M Series D at a $9B valuation, 11 Mar 2026.
- ARR rose from $2.8M to $150M in under a year (reported). Target of $1B run-rate by end of 2026 (company target, not a result).
- Effort-based pricing since June 2025; a simple request can cost about $0.06. Core $20, Pro $100.
- About 10 minutes to a deployed URL in the Tessellate Labs test.

**Base44 (Wix)** [R]
- Generates "the frontend, backend, database, authentication, permissions, and hosting in one pass"; backend runs as TypeScript functions on Deno.
- Acquired by Wix on 18 June 2025 for about $80M plus earnouts, while bootstrapped.
- ARR: about $100M (early March 2026) and $150M (mid-May 2026), attributed to Wix disclosures; $200M in Aug 2026 is a Sacra estimate. Users: 2M (Nov 2025); 10M (Aug 2026, estimate).
- Pricing: $16 / $40 / $80 / $160 per month, annual.
- Weak at: credits consumed fixing AI errors (forum anecdotes).

**Canva Code 2.0** (VentureBeat, 14 Jul 2026) [R]
- Code generation routed across proprietary, OpenAI and Anthropic models.
- Average code-generation time fell 75%; median prompt-to-published time fell 30% (no absolute numbers).
- Click-to-edit text and images, but Canva says: "We don't support moving elements around. You still have to re-prompt for that."
- Can import HTML from ChatGPT, Claude, Lovable or Bolt and convert it into editable Canva designs.
- Scale: 265M MAU with access; 6M sites published in the past year (retention unknown).
- Canva says it is "probably not going to be suitable" for complex backends.

**Figma Make / Sites**
- **Make** generates code that is "viewable and editable in the Files tab", publishes to a URL or custom domain, and can add a backend [V].
- Credits: roughly 30–100+ per Make request; code layers about 250+ credits; Professional Full seat ~3,000 credits per month; add-on ~$0.03 per credit [R].
- **Sites** (beta) turns Figma Design frames into responsive sites with a CMS that keeps "design layout… locked" [V].

**Google Stitch** [R]
- Free Labs product on Gemini. The March 2026 "2.0" release added an infinite canvas, up to 5 linked screens, voice, MCP and DESIGN.md.
- Exports HTML/CSS and Tailwind plus other frameworks; the lists conflict across sources.
- Weak at: accessibility, and fine-tuning without re-prompting.

**Builder.io Fusion**
- An agent on your repository that maps to your design system [R].
- Pricing [V]: Free 60 credits per month (15 per day); Pro $24 per user with 500 credits; Team $40; extra credits $25 per 500.
- About 70% automatic component mapping, per vendor docs as reported [R].

**Anima** [V, vendor claims R]: Figma → HTML or React, design agent "Buddy", MCP, "Add database and authentication", "1.8M+ builders" (vendor).

**10Web** [V vendor page]: "WordPress backend… frontend is generated by AI as a React app"; custom features built as WordPress plugins; "2mln+ websites since 2017" (vendor); from $10/mo; white-label API. The company that started template-based has moved to code generation.

**Glide (GlideOS, 3 Aug 2026)** [V]
- Moved from the JSON "app description" to agents with "direct access to full-stack application code". Quality "improved substantially" (no metric given).
- Runtime on Cloudflare, Descope identity, Neon Postgres.
- Glide's Josh Johnson: GlideOS "is potentially no longer a no-code platform."

**Softr** [V]
- AI Co-Builder (31 Mar 2026, reported) builds the database, app and logic.
- On 9 Nov 2026 Softr launched AI-generated custom frontends on its fixed Postgres and permissions backend.
- Its reasoning: blocks handle about 80% "well and safely" but come only in predefined shapes. Users found describing faster than configuring blocks.
- Blocks remain, alongside a "Vibe Coding block" for custom components.

**Bubble** [V]
- AI agent, page generation and image generation run on AI credits; "app generation does not require credits."
- Free (500 AI credits, 50K WU); Starter $32; Growth $119; Team $349 (annual).
- The output is Bubble's proprietary visual app, a structured non-code target [I from Bubble's architecture].

**Plasmic** [V]: MIT, 7.2k stars; agents control Studio over MCP (May 2026); data queries v2 and RSC (July 2026).

**Webstudio** [V/R]: AGPL-3.0, 9.2k stars, active; built-in AI reportedly discontinued [R].

### 3.3 Template and section incumbents

**Wix Harmony / Aria** [R]
- Launched 21 Jan 2026. The Aria agent builds and edits inside Wix's own architecture.
- Wix's CEO: "We completely changed the architecture so that vibe coding and visual editing work harmoniously."
- Included in all plans, including free. One tester waited "a few minutes" for the first design.
- JavaScript and backend code are restricted; Wix Blocks apps are incompatible.
- **History: Wix ADI** ran from 2016 to 10 Nov 2024 [V].
  - It asked "Do you like this, or do you like that?" style questions and produced a mockup.
  - It was retired in favour of a chat-based AI builder; active ADI sites moved to the Wix Editor, and inactive unpublished ones were deleted [V].

**Squarespace Blueprint** [R, third-party only]
- A guided interview (business type, goals, style) produces a site "from sections and styles that Squarespace's designers already made," "which is why the output rarely looks broken… [and] two Blueprint sites for the same kind of business can look similar."
- Alternative section layouts are offered during setup.

**Durable**
- [V]: Free (300 AI credits, subdomain); Launch $25/m (table says $22); Grow $49/m (table says $41); CRM and paid bookings.
- [Vendor claims]: "Ready to go online in 30 seconds"; "3,000,000+" businesses.
- [R]: "The AI picks a template and fills it"; mostly one-page sites. Raised a $14M Series A in Dec 2023, $20.25M in total [V, Durable blog].

**Hostinger AI Website Builder** [V]
- Manual mode: AI plus drag-and-drop with 300 templates.
- Agentic mode: "Every design is generated uniquely", with a code editor and export.
- Promotional pricing: $1.99 / $2.79 / $7.99 per month on 48-month terms, with 250 / 500 / 1,000 AI credits.
- Hostinger Horizons is a separate vibe-coding app builder from $6.99 [R].

**Landingsite.ai** ("~5 min average build time", "1M+ websites created", vendor) and **Mixo** ("a complete business website in seconds", "3M+ websites", vendor, internally inconsistent) [R]. Neither discloses its mechanism.

**Unbounce AI landing page builder** (5 Nov 2026) [R, vendor PR]: prompt, template or blank start; components; A/B tests; AI credits added at no extra cost.

**Framer** [V]
- Framer Agents launched 16 June 2026 (press release) [R].
- The agent "creates editable pages, sections, copy, and visuals directly in your project… real, editable layers, not a fixed image or locked template"; it builds code components for interactivity; MCP for external agents; branching [V].
- Pricing: Free 500 credits; Basic $10 with 1,000; Pro $30 with 3,000; extra editors $20 [V].
- Framer cites 188k companies, 4M+ published sites and 364M monthly visitors (vendor) [R].
- Wireframer and Workshop appear folded into the Agent [R].

**Gamma** [R]
- Prompt → presentation, document or website.
- $68M Series B at $2.1B with $100M ARR and 70M users (Nov 2025); "approaching 100 million users" (Mar 2026).
- Websites are simple one-pagers. That Gamma renders structured cards rather than generated code is my inference [I].
- **Read.** Proof that a prompt → structured document → deterministic renderer product can reach $100M ARR, in decks [I].

**Coframe** [R, vendor PR]: $25M Series A (Khosla, Hanabi), $35M total, 9 Nov 2026. Agents plus "a specialized transformer model trained on user interactions" generate and test per-visitor page variants. Adjacent: it optimizes existing sites rather than building new ones.

**Dora** [R]: third-party listings disagree on alpha/beta status and pricing. dora.run resolved in DNS but did not connect from my environment on 14 Nov 2026. Status unverified.

---

## 4. Time and cost per generation

| Product | First site | Cost per first site | Cost per edit | Basis |
|---|---|---|---|---|
| Our concept (Jev) | ~0.2–1.2 s per Jev call in a public demo [V]; 2–3 calls per composition [V] | ~$0.002 at $0.042 per M input, assuming ~40k input tokens [I] | Similar | json-render README; jev-uswds-voice README; user-provided price |
| Lovable | ~8 min (one test) [R] | 1.70 credits ≈ $0.43 retail [V/I] | 0.50–1.20 credits ≈ $0.13–$0.30 [V/I] | Lovable docs |
| Bolt | ~4 min (one test) [R] | Tokens (10M per month on Pro) | Tokens | Bolt pricing |
| Replit | ~10 min (one test) [R] | Effort-based, $0.06 up to several dollars [R] | Same | — |
| v0 | Minutes [R] | e.g. 30k in + 10k out on v0 Pro ≈ $0.16 [I] | Quick Edit route | v0 pricing |
| Durable | "30 s" (vendor) | Inside the plan | Inside the plan | — |
| Landingsite | "~5 min" (vendor) | Inside the plan | — | — |
| Relume | "Minutes" (vendor) | Pro covers "1–2 websites per month" [V] | — | Relume pricing |
| Wix Harmony | "A few minutes" (one test) [R] | Free | Free | — |

Two inferences follow:
- Selection is two orders of magnitude cheaper per generation than code generation.
- Only selection makes free, unlimited generation and showing many variants at once economically possible.

Several incumbents (Wix, Canva, Stitch) already give generation away free. Our cost advantage is therefore about *margin and instant variants*, not about price to the end user [I].

---

## 5. The four answers

### 5.1 Who is closest to our idea, and how are they doing?

1. **Relume** is closest in architecture *and* traction.
   - Selection from a designer-maintained catalog, with no raw code [V].
   - Code export to React with shadcn [V].
   - 1M+ users (vendor).
   - It is pushing downstream into hosting (Publish beta) and image generation (Studio beta, Nov 2026) [V].
   - It is doing well, but in the designer and agency segment.
   - What it lacks: speed (minutes), a chat-first live-edit experience, a typed spec exposed to users and agents, and determinism.
2. **Vercel json-render's Jev composer** is closest in mechanism. It is an experiment with documented limits (planning weakness, bounded size, no free text) [V], plus large developer distribution (10.9M monthly npm downloads) [V]. Vercel has not productized it.
3. **Squarespace Blueprint, Durable, Hostinger manual mode and Unbounce** are the commercial template/section selectors. They are fast-ish, locked in, LLM-driven for copy, and criticized for sameness [R].
4. **Framer Agents and Wix Aria** edit a *structured proprietary document* instead of code. This is philosophically close (structure as source of truth), but they are LLM agents taking seconds to minutes, with no export (Framer [V]) or restricted code (Wix [R]).
5. **Open-source and demos:** OpenPage (dormant), Siteable, Instinct, jev-uswds-voice. None has traction.

### 5.2 White space nobody occupies

1. **Instant (≤1 s), deterministic, reproducible generation with real code export.**
   - Code generators export but are slow and non-deterministic.
   - Selectors are fast-ish but locked in (Durable, Squarespace, Wix), or slow and designer-only (Relume).
   - Nobody offers "same input, same site, and you own the code" [I from the table].
2. **Many variants at once, free.** Because selection costs about $0.002, one prompt can produce 10–50 distinct, valid designs to browse and remix. LLM builders cannot afford this. Wix and Canva give single generations away free but do not do mass variants [I].
3. **A typed spec as a public contract for both humans and agents.** Framer and Plasmic expose proprietary canvases over MCP. Nobody offers an open, versionable JSON site spec (diffable, mergeable, testable) as the product. OpenPage tried with no distribution [V/I].
4. **Instant site plus escape hatch.** The pattern exists piecemeal: Framer code components, the Softr Vibe Coding block, Hostinger's two modes. No one makes the instant structured path the default and code generation the exception, per block, with typed props and a sandbox [I].
5. **Generation that holds up under evaluation.** Determinism allows golden-set regression tests across thousands of prompts. Code generators cannot guarantee that a site "always looks designed" [I].

### 5.3 Which incumbents could ship our idea in a quarter, and what would stop them?

| Incumbent | What they already have | What would stop them |
|---|---|---|
| **Vercel** | json-render + Jev composer + AI Gateway serving Jev + v0 users + hosting [V] | v0's identity and metering are code generation; the composer is aimed at app UI with no designed section catalog, themes or copy; Jev's planning weakness is documented [V]; Vercel sells infrastructure to developers, not sites to SMBs [I] |
| **Relume** | 1,000+ designer components, a selection architecture, React export, hosting [V] | Its audience wants a Figma/Webflow handoff; copy still needs an LLM; swapping to a decision model is a model change, not a rewrite, so this is the **most dangerous fast follower** [I] |
| **Wix** | Harmony + Aria on a proprietary structure, a vast section library, Base44 for the long tail [R] | Export and reproducibility work against lock-in economics; Harmony already takes minutes and the bet is on agents [I] |
| **Framer** | Native structured canvas, template marketplace (7,000+ creators), agents, MCP [R] | Credit-metered agents are a revenue line; no code export by design [V/I] |
| **Squarespace** | Blueprint already selects designer sections [R] | Product velocity; no export [I] |
| **Google** | A2UI 1.0, Stitch, Gemini [V/R] | Stitch is a Labs design tool, and A2UI is aimed at agent surfaces [V] |
| **Canva** | 265M MAU, 120M+ templates and assets [R] | Chose code generation for Code 2.0 [R] |

Note for the founder: the decision-model layer itself is commoditizing. Open "Jev-compatible" models and servers appeared within weeks of Jev's launch:
- Ollaya: 1,460 stars, serves "29 model families" behind `/v1/systemone`.
- von: "sub-15ms… local drop-in alternative".
- Kev and Jeff: small Qwen-based decision models [V repos].

The moat is the catalog, the variant design system, the evaluation harness and the editor, not access to Jev [I].

### 5.4 What did earlier constrained or rule-based builders get wrong or right?

**The Grid / Molly (2014–~2019)**
- **Wrong:**
  - Presold "founding memberships" years before shipping [R].
  - No user control: "there's absolutely nothing I can do to change Molly's artificial mind"; layouts were "chosen entirely by Molly, without my guidance or consent."
  - Output was "bland — and often identical."
  - Changing a design meant you had to "start all over again" (CMSWire, June 2017) [R].
  - Satisfaction was 60% on Wise Buyer, second lowest [R]. Sites were reportedly taken down by 2019 (competitor source) [R].
- **Right:** nothing durable apart from the vision.
- **Lessons for us:** expose every choice as editable, keep edits local (no regenerate-everything), and never promise an "AI designer."

**Wix ADI (2016 – 10 Nov 2024)** [V]
- **Right:** a preference Q&A produced a usable mockup fast, and handed off to a full editor (ADI sites now open in the Wix Editor).
- **Wrong:** a fixed question flow. Wix replaced it with a chat builder that "took things one step further," and then with Harmony.
- **Lesson:** the structured core can survive; the *interaction* must be conversational and iterative.

**Durable**
- **Right:** speed claim, bundled business tools (CRM, bookings), cheap plans, and a claimed 3M businesses (vendor) [V/R].
- **Wrong:** template sameness and one-page sites [R].
- **Lesson:** distribution to SMBs works, but variety and depth are the ceiling.

**10Web, Softr, Glide (2026)**
- **Right:** structure gave safety and governance. Softr kept its fixed backend and permissions [V].
- **Wrong (by their own account):** fixed shapes capped the frontend. Glide found its JSON intermediate layer limited agent quality [V]. All three moved toward generated frontends [V].
- **Important nuance [I]:** Glide's failure was LLM *coding agents authoring* a JSON DSL they had never seen. That differs from a decision model *choosing* among pre-built, designed variants. Softr's "80%" figure is the real number to beat: a selection engine must cover the common 80% so well that the remaining 20% can be served by a sandboxed code-generation block.

**Squarespace Blueprint / Relume**
- **Right:** designer-made sections give a quality floor ("rarely looks broken") [R]. A curated catalog can scale to 1,000+ components and millions of sites [R].
- **Wrong:** sameness across same-vertical sites [R].

---

## 6. Obstacles and the strongest known way around each

| Obstacle | Evidence | Strongest known workaround |
|---|---|---|
| Decision models cannot write copy | Jev returns only Choice, Boolean or Score; json-render: "arbitrary new text/data are not supported" [V] | A hybrid used in the Jev ecosystem: Jev decides structure, and a small LLM is called only where text is needed. Examples: browser-use's Jev Ultrafast ("a small LLM types only when the action is TYPE_TEXT") [V repo listing] and typesafe-computer-use ("calling a text model only when writing is needed") [V]. Render the layout instantly with recipe or placeholder copy, then stream LLM copy into the slots [I]. |
| Planning, completeness, knowing when to stop | Documented Jev weakness; short prompts under-select [V] | Expand the brief into a required-sections checklist by code (per vertical), so Jev only fills slots. Use Instinct's speculative fan-out plus a tie-break call [V]. |
| Sameness | Grid, Squarespace and Durable criticism [R] | Combinatorial variants (section × variant × theme tokens × imagery). Show many variants at once, since it is cheap. Train choice priors on user picks [I]. |
| Long tail (auth, data, payments) | Softr and Glide moved to code generation [V] | A sandboxed code-gen block behind typed props (the Softr Vibe Coding block and Framer code components are precedents [V]). Integrate fixed backends such as Stripe and auth as catalog blocks rather than generated code [I]. |
| Expressiveness ceiling of a JSON layer | Glide [V] | Keep the spec close to the components (json-render-style catalogs). Allow escape-hatch nodes. Export to real code so users are never trapped [I]. |

---

## 7. Could not verify

- Any **commercial** product using a decision model for site building. None found, but the web-search budget ran out mid-research.
- **Webflow AI site builder mechanics** (page fetches failed). The App Gen pause comes from a search summary of Webflow's help center; the direct fetch returned 403.
- **Squarespace Blueprint internals**: third-party sources only.
- **Durable's mechanism**: reviews only.
- **Gamma's rendering architecture**: inference.
- **Dora's status**: site unreachable from my environment; listings conflict.
- **Revenue figures:**
  - Lovable's $600M ARR is the company's stated expectation, not a reported result.
  - Base44's $200M is a Sacra estimate.
  - Replit's ARR figures conflict ($150M / $265M / $525M).
  - Bolt has no 2026 ARR figure.
  - v0 has no revenue figure; "6M developers" comes from one source.
- **Time-to-first-site:** the only measured comparisons are single-operator blog tests (Tessellate Labs, April 2026). Vendor speed claims are unbenchmarked.
- **Jev accuracy:** independent figures come via awesome-list summaries (e.g. 67.8% aggregate vs Opus 5 at 73.1% from Agentpedia). I did not read the primary posts.
- **Not covered for lack of search budget:** Shopify (Horizon / Sidekick AI blocks), GoDaddy Airo, Elementor / WordPress.com AI, Jimdo, B12, Design.com, Mobirise AI, Typedream, Readdy, Same, Emergent, Rocket, YouWare.

---

## 8. Sources

**Catalog, generative UI and decision models**
- json-render Jev README: https://github.com/vercel-labs/json-render/tree/main/apps/web/lib/jev
- json-render repo: https://github.com/vercel-labs/json-render
- json-render PR #418: https://github.com/vercel-labs/json-render/pull/418
- Vercel changelog (json-render + Chat SDK): https://vercel.com/changelog/json-render-and-chat-sdk-agents
- npm downloads API: https://api.npmjs.org/downloads/point/last-month/@json-render/core (also @puckeditor/core, @measured/puck, @a2ui/react, @openuidev/react-lang, @thesysai/genui-sdk)
- A2UI 1.0: https://developers.googleblog.com/a2ui-10-build-delightful-fast-reliable-agentic-experiences/
- OUI-1: https://www.openui.com/blog/oui-1
- OpenUI repo: https://github.com/thesysdev/openui
- OpenPage: https://github.com/buildingopen/openpage
- Instinct: https://github.com/joevidev/ui-generator-instinct-jev
- jev-uswds-voice: https://github.com/ctrimm/jev-uswds-voice
- Siteable: https://github.com/Siteable/siteable-core
- Jev ecosystem lists: https://github.com/heyjunpenn/awesome-jev, https://github.com/AbdelStark/awesome-typesafe-jev, https://github.com/AnotiaWang/awesome-decision-models
- Open decision models: https://github.com/ollaya-dev/ollaya, https://github.com/wfzyx/von
- Jev 1.14: https://typesafe.ai/blog/jev-1-14
- Jev launch on HN: https://news.ycombinator.com/item?id=49717558
- Puck: https://github.com/puckeditor/puck
- Plasmic: https://github.com/plasmicapp/plasmic and https://forum.plasmic.app/t/give-plasmic-access-to-an-ai-agent-using-mcp/11564
- Webstudio: https://github.com/webstudio-is/webstudio

**Relume**
- https://www.relume.ai/
- https://www.relume.ai/pricing
- https://www.relume.ai/publish

**Code generators**
- Lovable pricing: https://lovable.dev/pricing
- Lovable credit rates: https://docs.lovable.dev/introduction/plans-and-credits
- Lovable FAQ: https://docs.lovable.dev/introduction/faq
- Lovable Series C: https://siliconangle.com/2026/08/12/vibe-coding-startup-lovable-doubles-valuation-13-3b-400m-raise/
- v0 pricing: https://v0.app/pricing
- v0 composite model: https://vercel.com/blog/v0-composite-model-family
- v0 users (secondary): https://humantestsai.net/tools/v0/
- Bolt pricing: https://bolt.new/pricing
- Bolt and Microsoft (secondary): https://aiunpacking.com/review/bolt-new/ and https://vmblog.com/news/agentic-building-across-the-enterprise-with-bolt-new-on-microsoft-azure-and-microsoft-365/
- bolt.diy: https://github.com/stackblitz-labs/bolt.diy
- Bolt Trustpilot and token figures (secondary): https://superdesign.dev/blog/bolt-review
- Replit (secondary): https://www.techbuzz.ai/articles/replit-hits-9b-valuation-eyes-1b-arr-in-monster-round
- Base44 (Sacra): https://sacra.com/c/base44/
- Canva Code 2.0: https://venturebeat.com/technology/canva-launches-code-2-0-offering-ai-website-building-to-every-user-including-free-accounts
- Figma Make: https://help.figma.com/hc/en-us/articles/31304412302231-Explore-Figma-Make
- Figma Sites: https://www.figma.com/sites/
- Figma credits (secondary): https://uxmagic.ai/blog/figma-pricing
- Google Stitch (secondary): https://tech-insider.org/google-stitch-ai-design-tool-march-2026-update/
- Builder.io pricing: https://www.builder.io/pricing
- Builder.io mapping accuracy (secondary): https://www.rfp.wiki/it-security/software-development/design-to-code-tools/builder-io-visual-copilot
- Anima: https://www.animaapp.com/
- 10Web: https://10web.io/
- Glide: https://www.glideapps.com/blog/glideos-launch-recap
- Softr: https://www.softr.io/blog/beyond-building-blocks
- Softr Co-Builder (secondary): https://enterprisedna.co/resources/news/softr-ai-co-builder-no-code-platform-2026/
- Bubble pricing: https://bubble.io/pricing
- Speed test: https://tessellatelabs.com/knowledge/lovable-vs-bolt-vs-replit-2026

**Template, section and canvas incumbents**
- Wix Harmony (secondary): https://www.websitebuilderexpert.com/news/wix-harmony-launch/ and https://tech.co/news/wix-harmony-ai-website-builder-what-how-get
- Wix ADI history: https://www.wix.com/blog/wix-artificial-design-intelligence
- Squarespace Blueprint (secondary): https://www.feisworld.com/blog/squarespace-blueprint-ai-builder-review and https://ecomm.design/using-squarespace-blueprint-ai/
- Durable pricing: https://durable.com/pricing
- Durable Series A: https://durable.com/blog/series-a
- Durable review: https://we.inc/blog/durable-ai-website-builder-review
- Hostinger: https://www.hostinger.com/ai-website-builder
- Hostinger Horizons (secondary): https://www.websitebuilderexpert.com/vibe-coding/hostinger-horizons-pricing/
- Framer AI: https://www.framer.com/ai/
- Framer pricing: https://www.framer.com/pricing
- Framer Agents press release: https://finance.yahoo.com/technology/ai/articles/framer-launches-ai-agents-170000931.html
- Webflow (secondary): https://webyansh.com/post/webflow-pricing-plans-guide (App Gen pause reported from https://help.webflow.com/hc/en-us/articles/46332369065875-Build-full-stack-web-apps-with-Webflow-AI, which returned 403 to me)
- Gamma: https://techcrunch.com/2026/03/17/gamma-adds-ai-image-generation-tools-in-bid-to-take-on-canva-and-adobe/
- Landingsite: https://www.landingsite.ai/
- Mixo: https://www.mixo.io/
- Unbounce: https://www.prnewswire.com/news-releases/unbounce-launches-new-ai-powered-landing-page-builder-built-on-2-5-billion-conversions-302929541.html
- Coframe: https://www.prnewswire.com/news-releases/coframe-raises-35-million-to-build-the-living-internet-302933460.html
- Dora (secondary): https://opentools.ai/tools/dorarun and https://www.conversiongems.com/tools/dora

**Historical**
- The Grid: https://www.cmswire.com/digital-experience/the-grid-ai-powered-website-builder-doesnt-check-enough-boxes/
- The Grid satisfaction: https://www.sitebuilderreport.com/blog/the-grid-a-much-hyped-ai-website-builder-is-near-industry-low-in-customer-satisfaction
- The Grid shutdown (competitor account): https://pagecloud.com/blog/what-happened-to-the-grid
