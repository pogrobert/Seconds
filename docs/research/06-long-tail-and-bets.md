# 06: The ceiling. Beating the long-tail objection, and the breakthrough bets

Researched 13 November 2026. Scope: how far a "site as data, chosen from a catalog" builder can go, what only it can do, and which bets to make first.

**Labels used on every claim**
- **[V] verified**: read on the primary source (the company's own page, paper, spec or changelog). A vendor's claim about its own results is still a vendor claim, and that is said where it matters.
- **[R] reported**: secondary coverage, aggregator, or a search summary of a page I did not open myself.
- **[I] idea**: my own proposal or inference. No source; judge it on its reasoning.

**Limit on this research.** The shared web-search budget ran out partway through. Glide, Noloco, Budibase, Appsmith, Directus, PocketBase, Refine, RedwoodSDK, Convex, Supabase, JSON Forms, react-jsonschema-form and AutoForm are described from their public docs as I already knew them. Those are linked but **not re-checked for 2026 changes**, and they are marked [R].

---

## 0. The short answer to "it can only build what's in the catalog"

The objection assumes a catalog is fixed and code is open-ended. Both halves are weaker than they look in November 2026:

1. **The incumbents that matter already stopped generating backends.** Airtable's Omni, Retool's AppGen and Softr's 2026 relaunch all build apps by **assembling pre-built, tested parts**, not by writing a codebase ([Airtable](https://www.airtable.com/newsroom/introducing-the-ai-native-airtable) [V], [Maginative](https://www.maginative.com/article/airtable-bets-big-on-ai-agents-with-omni-reboots-as-an-ai-native-app-platform/) [R], [Retool](https://retool.com/blog/introducing-enterprise-appgen) [V], [Softr](https://www.softr.io/blog/beyond-building-blocks) [V]). Softr's stated line, published 9 Nov 2026: "We vibe code your frontend. We don't vibe code your backend." Even Lovable converged on a fixed built-in backend (database, storage, auth, realtime, functions) rather than inventing one per app ([Lovable docs](https://docs.lovable.dev/integrations/cloud) [V]).
2. **Generated backends are where code-writing builders fail in public.** CVE-2025-48757: insufficient row-level security in Lovable-built apps let unauthenticated attackers read or write arbitrary tables. A scan found 170 of 1,645 apps exposed ([CVE record via Intruder](https://cvemon.intruder.io/cves/CVE-2025-48757) [R], [Superblocks write-up](https://www.superblocks.com/blog/lovable-vulnerabilities) [R]). On a catalog system, an auth or payments block is written once, audited once and fixed once for everyone.
3. **The long tail is mostly presentation and glue, not new capability.** Softr reports that about 80% of business software is the same components (tables, forms, lists, charts). It also reports that when it shipped a "vibe coding" block for the other 20%, users **never** used it to build permissions, auth or databases ([Softr](https://www.softr.io/blog/beyond-building-blocks) [V, vendor claim]). The tail people actually ask for is a custom calculator, a barcode scanner or an odd layout: a single block, not a new architecture.

So the answer is not "we only do marketing sites". It is a layered system with a **ceiling that rises with use**:

| Layer | What it is | Who writes it | When |
|---|---|---|---|
| **Trust layer** | Data, auth, roles and permissions, payments, bookings, email, files, audit | Us, once, hand-verified | Never generated per request |
| **Capability blocks** | Forms, collections and CMS, gated pages, checkout, booking, search, dashboards, CRUD views, automations | Us plus the block foundry | Chosen per request (about 100 ms) |
| **Logic as data** | Typed actions, guards (a CEL or JSONLogic subset), statecharts, workflow graphs | Chosen and parameterized by the model | Per request |
| **Presentation** | Blocks, variants, themes, tokens | Catalog | Per request |
| **Foundry blocks** | New blocks written by a coding agent to a strict contract, verified, then shared | Background coding agent | Once per *new kind of need*, amortized across all users |
| **Escape hatches** | Code export, eject to a coding agent, bring-your-own component | User or their developer | When they graduate |

The pitch becomes: **"code is written once, verified and shared, never per request."** That is LATM's "tool maker / tool user" split ([arXiv 2305.17126](https://arxiv.org/abs/2305.17126v2) [V]) applied to a product.

---

## Part A: Beating the long-tail objection

### A1. How far declarative and configuration-driven systems have gone

**The pattern across 2025 and 2026: everyone with a real user base moved toward "AI configures parts" and away from "AI writes everything".**

| System | What is declared (data, not code) | How far it reaches | Notes |
|---|---|---|---|
| **Airtable Interfaces and Omni** | Bases (schema), interfaces, automations; Omni builds all three from a prompt | Internal apps, portals; Omni 2.0 reportedly takes spreadsheets, PDFs and decks as input | Omni assembles production-tested components; the CEO calls the platform a "parts bin" ([Airtable](https://www.airtable.com/newsroom/introducing-the-ai-native-airtable) [V], [createwith](https://createwith.com/tool/airtable/updates/airtable-launches-airtables-fall-release-for-agent-ready-work) [R]). AI-generated custom *elements* (code) are now GA inside interfaces ([Airtable community](https://community.airtable.com/announcements-6/new-ai-generated-custom-elements-are-out-of-beta-and-available-to-everyone-47849) [R]). This is the same hybrid we propose. |
| **Softr** | Native relational DB, auth, permissions, workflows, interface blocks | Client portals, internal tools, partner platforms; AI Co-Builder launched 31 Mar 2026 ([VentureBeat](https://venturebeat.com/technology/softr-launches-ai-native-platform-to-help-nontechnical-teams-build-business) [R]) | 1M+ builders (vendor). Backend is a fixed trust layer, frontend is generated. Users used the Vibe Coding block "for nearly everything", even standard tables ([Softr](https://www.softr.io/blog/beyond-building-blocks) [V]). **This is a warning for us; see section C3.** |
| **Retool (AppGen)** | Apps built from 100+ pre-built components plus queries, workflows, permissions | Enterprise internal tools | "Rely on pre-built, tested components rather than generating thousands of lines of boilerplate" ([Retool](https://retool.com/blog/introducing-enterprise-appgen) [V]). Retool's 2022 survey: 82% of respondents build internal tools directly on databases ([Retool](https://retool.com/blog/state-of-internal-tools-2022) [R]). |
| **Bubble** | Visual data types, workflows, privacy rules | Full SaaS apps | No code export; leaving means rebuilding the logic ([Bubble forum, staff answer](https://forum.bubble.io/t/migration-of-code-data-out-of-bubble/1126) [R]). This is the lock-in story that our code export must beat. |
| **Glide, Noloco, Budibase, Appsmith** | Data source → screens/components → actions → role rules | CRUD apps, portals, field apps ([glideapps.com](https://www.glideapps.com), [noloco.io](https://noloco.io), [budibase.com](https://budibase.com), [appsmith.com](https://www.appsmith.com)) [R] | Proof that "collections + views + actions + roles" covers most operational software. |
| **Directus, Payload** | Schema/config → admin UI + REST/GraphQL + access control | Headless CMS and app backends ([directus.io](https://directus.io) [R]) | Payload joined **Figma** on 17 Jun 2025 to close the design-to-code gap ([Payload](https://payloadcms.com/posts/blog/payload-is-joining-figma) [V]). Config-driven backends are now strategic assets. |
| **Supabase, PocketBase, InstantDB, Convex** | Tables + declarative permission rules (Postgres RLS, PocketBase API rules, InstantDB rules) | General backends ([supabase.com/docs/guides/auth/row-level-security](https://supabase.com/docs/guides/auth/row-level-security), [pocketbase.io](https://pocketbase.io), [convex.dev](https://www.convex.dev)) [R] | InstantDB pitches itself as "the best backend for AI-coded apps", with Zanzibar-style declarative permissions and Stripe payments. Its homepage now also says **Instant is sunsetting**, with service until 31 Aug 2027 ([instantdb.com](https://www.instantdb.com/) [V, fetched 13 Nov 2026]). A caution about depending on startup backends. |
| **Wasp** | One spec file (now `main.wasp.ts`) declares auth methods, routes with `authRequired`, jobs with cron, email sender, entities | Full-stack React/Node/Prisma SaaS | Compiles the spec into a full-stack app. Markets itself as ideal for AI because the spec stays small and checkable. Its Open SaaS starter claims 1k+ apps launched ([wasp.sh](https://wasp.sh/) [V]). **The closest existing proof that a declarative spec can describe a real full-stack app.** |
| **Refine, RedwoodSDK** | CRUD resource config (Refine); conventions over an app (Redwood) | Admin panels, dashboards ([refine.dev](https://refine.dev), [rwsdk.com](https://rwsdk.com)) [R] | Refine shows that "resources + views" generate most admin UIs. |
| **JSON Forms, react-jsonschema-form, AutoForm** | JSON Schema or Zod → complete validated form | Any form ([jsonforms.io](https://jsonforms.io), [rjsf](https://github.com/rjsf-team/react-jsonschema-form), [AutoForm](https://github.com/vantezzen/autoform)) [R] | The form layer is a solved, schema-driven problem. Forms should never be generated code. |
| **Power Apps / Power Fx** | Excel-style formulas: strongly typed, declarative, functional | Huge enterprise footprint; open-sourced under MIT in 2021 ([Microsoft](https://www.microsoft.com/en-us/power-platform/blog/power-apps/power-fx-open-source-now-available/) [R]) | Formulas are the best-tested declarative logic for non-programmers. |
| **Generative-UI specs (2025–26)** | A2UI: agents send declarative JSON, and the client renders only components from a trusted catalog, with catalog negotiation in v0.9 ([Google](https://developers.googleblog.com/introducing-a2ui-an-open-project-for-agent-driven-interfaces/) [V], [CopilotKit](https://www.copilotkit.ai/blog/a2ui-whats-new-in-google-generative-ui-spec) [R]). Vercel's json-render: "AI can only use components in your catalog", defined with Zod, rendering to React, Vue, Svelte, React Native, PDF, email and video ([GitHub](https://github.com/vercel-labs/json-render) [R], [InfoQ](https://www.infoq.com/news/2026/03/vercel-json-render) [R]). MCP Apps: official MCP extension, 26 Jan 2026 ([MCP blog](https://blog.modelcontextprotocol.io/posts/2026-01-26-mcp-apps/) [V]). | Runtime UI in chat and agents | **Google and Vercel both shipped our core idea (catalog-constrained JSON rendered deterministically) as open infrastructure.** It validates the approach and removes it as a moat. The moat has to be the catalog's quality, the trust layer, and what we do with the spec. |
| **Gamma** (closest commercial analog) | AI fills a structured card model, not code | $100M+ ARR profitably with about 50 staff ([Gamma](https://gamma.app/insights/how-we-built-a-usd100m-business-differently) [R], [AI Magazine](https://aimagazine.com/news/gamma-ai-presentations-for-100m-users-us-100m-arr-and-prof) [R]) | Shows that "structured document + AI" can be a huge business when output quality is high. |

**What share of real small-business and startup needs do a few dozen capability blocks cover?**

No primary dataset answers this directly. I looked and found only listicles ([example](https://www.housecallpro.com/resources/must-have-website-features/) [R]); a representative scrape of published Lovable or Bolt apps would be needed ([search found none](https://madewithlovable.com/) [R]). The best evidence is indirect:
- Softr: about 80% of business software is the same components, and users never generated auth, permissions or databases ([V, vendor](https://www.softr.io/blog/beyond-building-blocks)).
- Retool: 82% of respondents build internal tools directly on databases, which means CRUD over data ([R](https://retool.com/blog/state-of-internal-tools-2022)).
- Code-writing platforms themselves standardize on one backend set (Lovable: database, storage, auth, realtime, functions, jobs, secrets) ([V](https://docs.lovable.dev/integrations/cloud)). Durable relaunched in March 2026 as a "business builder": site + CRM + forms + hosting ([R](https://durable.com/blog/launch)).
- Lovable's own June 2026 survey: 54.6% of users are building businesses and 60.5% are not yet making money ([Dealroom summary](https://app.dealroom.co/news/feed/lovable-surpasses-500m-arr-as-report-reveals-60-of-users-aren-t-making-money-yet) [R]). The bulk of demand is early-stage business sites and MVPs, not novel software.

**My estimate [I]:** about 30 capability blocks plus about 150 presentation blocks cover **80–90% of small-business sites** (services, restaurants, clinics, creators, agencies, local retail) and **60–75% of early-startup MVPs**: landing page, waitlist, auth plus a gated dashboard, CRUD over 3–8 collections, Stripe subscriptions, email, admin, and simple automations. The startup gap is "the one weird core feature" (a custom editor, a matching algorithm, a domain calculation). That gap is exactly what the foundry (A3) and code blocks (A4) are for. The capability list I would build, in priority order:

1. Contact/lead forms (schema-driven) → CRM collection + email notify
2. CMS collections (blog, menu, services, team, portfolio, FAQ, testimonials, events, jobs, listings) with list and detail pages
3. Auth (magic link, OAuth) + roles + gated pages + member area
4. Payments: one-off checkout, subscriptions, donations, invoices (Stripe-backed)
5. Bookings: services × staff × availability × deposits
6. Simple store: products, variants, cart, shipping and tax via provider
7. Search and filter over collections
8. CRUD views: table, kanban, calendar, map, gallery, detail and edit forms
9. Dashboards and charts over collections
10. Email: transactional + newsletter + sequences
11. Automations: trigger → conditions → actions (A2)
12. Files and media, i18n, SEO and structured data, analytics, consent
13. Portals: client portal, partner portal, course and community (gated content + progress)
14. Integrations as typed connectors (Calendly, Google, HubSpot, Zapier/n8n webhooks)

### A2. Declarative logic that a choice-only model can produce

A decision model that cannot generate text can still produce logic if **every piece of logic is a tree of enumerable choices over a typed schema**. Literal values (prices, numbers, emails) come from slots filled by extraction or by the user. Options compared:

| Formalism | Prior art | Fit for a choose-only model | Fit for an LLM calling tools | Use it for |
|---|---|---|---|---|
| **Typed actions with parameters** | Retool queries/actions, Glide actions, MCP tool schemas, tldraw agent "actions" with per-action schemas and a `sanitizeAction()` repair step ([tldraw](https://tldraw.dev/starter-kits/agent) [V]) | **Excellent.** Pick an action from an enum, fill params from schema enums or entity refs | Excellent | Button and form behavior, "on submit → create record → send email → redirect" |
| **Guards and rules as ASTs** | JSONLogic: rules are JSON, no side effects, no loops, predictable runtime, shared front and back end ([jsonlogic.com](https://jsonlogic.com/) [V]). CEL: linear-time, mutation-free, not Turing-complete, designed for untrusted expressions ([cel-spec](https://github.com/google/cel-spec), [cel-go README](https://cdn.jsdelivr.net/gh/google/cel-go@master/README.md) [R]) | **Good.** Operator, field and comparator are all enums from the schema. Constants come from slots | Excellent; it can write CEL text, which we type-check | Visibility ("show if role = admin"), validation, pricing rules, permission rules |
| **Statecharts** | XState and Stately: machines as data. Stately had "generate flow from text" ([docs](https://stately.ai/docs/generate-flow) [R]). @statelyai/agent: "the machine decides which work is legal" ([Stately](https://stately.ai/docs/packages/agent/xstate-as-agent-workflow) [R]) | **Good via templates.** Pick a flow template (checkout, booking, onboarding, multi-step form, approval) and parameterize its states | Good | Multi-step flows whose correctness matters |
| **Workflow graphs** | n8n, Zapier, Pipedream. The n8n AI builder maps prompts to nodes. Validation rules include "exactly one trigger" ([3l3c guide](https://www.3l3c.ai/blog/vibe-marketing/n8n-ai-workflow) [R]). LLM-generated n8n JSON often fails import ([substack](https://karozieminski.substack.com/p/n8n-ai-agent-builder-for-claude-code) [R]), which argues for schema-checked graphs | **Good**: trigger enum + step enums + typed connectors | Good | Back-office automations, integrations, schedules |
| **Spreadsheet formulas** | Airtable formulas; Power Fx ([Microsoft](https://www.microsoft.com/en-us/power-platform/blog/power-apps/power-fx-open-source-now-available/) [R]) | **Weak**: needs free text. Offer a formula library (≈200 templates) with slot params | Good (with a type checker) | Computed fields, totals, derived values |
| **General code** | – | No | Possible, but only in sandboxed foundry blocks | The genuinely new |

**Recommendation [I]:** one logic intermediate representation (IR):
`event → guard (CEL subset as JSON AST) → action[] (typed) → optional statechart transition`, with automations as `trigger → step[]` graphs over the same action types. Every node is enumerable for the decision model, and it type-checks against the site's collection schema. Export compiles it to plain TypeScript. Permissions use the same guard language, so **"who can see this page" and "who can read this row" are one rule shown in one place**. That is what Lovable's RLS failure lacked.

### A3. The self-extending catalog (the "block foundry")

**The idea.** When a request misses the catalog, a coding agent writes a new block in the background to a strict contract. After verification it joins the catalog (private first, then public), so code generation is paid once and reused by everyone.

**Prior art for each piece**

| Piece | Prior art | Status |
|---|---|---|
| Agents that grow a reusable code library | **Voyager**: an "ever-growing skill library of executable code"; 3.1× more unique items, 15.3× faster milestones; the library transfers to new worlds ([arXiv 2305.16291](https://arxiv.org/abs/2305.16291) [V]). **LATM**: a strong model makes tools and a cheap model uses them, matching the strong model at much lower cost, with tools cached for reuse ([arXiv 2305.17126](https://arxiv.org/abs/2305.17126v2) [V]). **SkillWeaver**: web agents synthesize skills as APIs, +31.8% on WebArena, and APIs from strong agents lift weak agents by up to 54.3% ([arXiv 2504.07079](https://arxiv.org/abs/2504.07079) [V]) | Research-proven; no product does it for UI blocks yet as far as I found |
| AI generating components inside a no-code builder | **Framer Workshop** (May 2025): prompt → React component with property controls on canvas; output stays in Framer's runtime ([Framer](https://www.framer.com/updates/workshop) [R]). **Softr Vibe Coding block** ([V](https://www.softr.io/blog/beyond-building-blocks)). **Airtable AI custom elements** ([R](https://community.airtable.com/announcements-6/new-ai-generated-custom-elements-are-out-of-beta-and-available-to-everyone-47849)). **Wix Harmony** blends visual editing with vibe coding ([Yahoo Finance, Q4 call](https://finance.yahoo.com/news/wix-com-q4-earnings-call-165003576.html) [R]) | Shipped, but **per-user and not shared**: each user's generated block dies with their project. Sharing is the gap we would fill. |
| Component registries | shadcn registry: hosted JSON items, an MCP server over the registry, "Open in v0" ([shadcn docs](https://ui.shadcn.com/docs/registry/open-in-v0) [V], [Vercel template](https://vercel.com/templates/next.js/shadcn-ui-registry-starter) [R]). A2UI catalog negotiation ([CopilotKit](https://www.copilotkit.ai/blog/a2ui-whats-new-in-google-generative-ui-spec) [R]) | Format exists; adopt the shadcn registry item format for export compatibility [I] |
| Bring-your-own typed component | Webflow code components: wrap a React component in `.webflow.tsx` with `declareComponent`, share with `npx webflow library share`, then place it on canvas next to native components ([Webflow docs](https://developers.webflow.com/code-components/importing/quick-start) [V]) | This is the "re-import" mechanism, and the same contract a foundry block must meet |
| Sandboxing untrusted UI code | **Shopify Remote DOM**: extension code builds a DOM in a Web Worker or iframe and the host mirrors it with native components. No access to the page or payment data; 64 KB compiled cap ([GitHub](https://github.com/Shopify/remote-dom) [R], [Shopify engineering](https://shopify.engineering/remote-rendering-ui-extensibility) [R]). **Figma**: plugin logic in a QuickJS-in-WebAssembly sandbox after a Realms-shim issue, UI in an iframe ([Figma blog](https://www.figma.com/blog/how-we-built-the-figma-plugin-system/) [V], [Evan Wallace](https://madebyevan.com/figma/an-update-on-plugin-security/) [R]). **ShadowRealm** is still Stage 2.7, so not usable ([TC39 draft](https://tc39.es/proposal-shadowrealm) [V]). **MCP Apps** sandboxes UI in iframes over postMessage JSON-RPC ([MCP blog](https://blog.modelcontextprotocol.io/posts/2026-01-26-mcp-apps/) [V]) | Mature patterns: iframe or worker plus a typed bridge |
| Sandboxing server-side code | **Cloudflare Dynamic Workers** (open beta 24 Mar 2026): load code at runtime into a V8 isolate in milliseconds at a few MB. Capabilities passed as RPC bindings, `globalOutbound: null` blocks the network, credentials injected on egress. $0.002 per unique Worker per day, waived in beta. Zite's app builder is a named user ([Cloudflare](https://blog.cloudflare.com/dynamic-workers/) [V], [changelog](https://developers.cloudflare.com/changelog/post/2026-03-24-dynamic-workers-open-beta/) [V]). **Durable Object Facets** (13 Apr 2026): each dynamically loaded app gets its own isolated SQLite DB under a supervisor that meters and bills ([Cloudflare](https://blog.cloudflare.com/durable-object-facets-dynamic-workers/) [V]) | Production-grade, cheap, and almost exactly the shape a foundry needs for blocks with server logic |
| Verification | Automated accessibility testing catches 57.38% of issues (Deque, 13,000+ pages, about 300,000 issues) ([Deque](https://www.deque.com/automated-accessibility-testing-coverage/) [V]), so axe alone is not enough | Needs layered checks |
| Supply-chain risk | Shai-Hulud npm worm, Sep 2025: 500+ packages, self-propagating through stolen publish tokens. Source code released May 2026, variants hitting hundreds more packages ([BleepingComputer](https://www.bleepingcomputer.com/news/security/self-propagating-supply-chain-attack-hits-187-npm-packages/) [R], [ITPro](https://www.itpro.com/security/cyber-attacks/shai-hulud-malware-is-back-with-a-vengeance-and-hit-more-than-19-000-github-repositories-so-far-heres-what-developers-need-to-know) [R]) | The foundry must not `npm install` freely |

**The block contract [I]**
1. **Props schema** in Zod/JSON Schema, with every prop typed and enumerable where possible, so the decision model can choose it.
2. **Tokens only**: no raw colors, sizes or fonts. A lint step rejects literals. Must render correctly under every theme in the catalog.
3. **Slots and data bindings** declared, never fetched ad hoc. Server needs go through declared capabilities (the same binding model as Dynamic Workers).
4. **Dependency allowlist**: a vendored, pinned set (React, our primitives, about 30 vetted libraries). No install scripts, and no network access at build.
5. **Tests**: prop-fuzzing (does it render for every enum combination, plus worst-case text), unit tests for logic, SSR-safety.
6. **Visual checks**: screenshots across 3 viewports × N themes × LTR/RTL × light/dark. A vision model compares them against the request and against catalog siblings for style consistency.
7. **Accessibility**: axe (≈57% coverage) + keyboard traversal script + vision-model check for contrast and focus order. Promotion to public adds a human review.
8. **Budget**: size cap (Shopify uses 64 KB for checkout extensions) and a render-time cap.
9. **Trust tiers**: *draft* (sandboxed iframe or worker, this project only) → *private* (passed checks, owner's projects) → *public* (N independent uses + human review). Only public blocks run unsandboxed in the main render tree.

**How the hybrid feels [I]**
- **95% of requests:** nothing changes. A second or less, no waiting.
- **A miss:** the preview updates immediately with the **closest block plus a labeled placeholder island** ("Building: tip calculator with split by person, about 2 minutes"). The user keeps editing everything else. When the block passes, it slides in and a toast offers "Keep / Try another". If it fails verification twice, a human-readable "here is what I could build instead" appears. The user never sees a stack trace.
- **Second user anywhere with the same need:** instant. Amortization becomes visible: the product page can show a live counter ("4,812 blocks built by users, reused 1.3M times"), which doubles as a growth story.
- **Cost model [I]:** if a verified block costs roughly a few dollars of agent and CI compute, and each new block is reused even 50 times, the per-use cost is cents and falling. LATM is the formal version of this argument ([arXiv](https://arxiv.org/abs/2305.17126v2)).

### A4. Escape hatches that keep trust ("graduation")

| Platform | Graduation story | Lesson |
|---|---|---|
| Bubble | No code export; rebuild the logic to leave ([forum](https://forum.bubble.io/t/migration-of-code-data-out-of-bubble/1126) [R]). Agencies report clients now ask about lock-in up front ([WeWeb story](https://www.weweb.io/customer-stories/nocodeassistant) [R]) | Lock-in is now a sales objection |
| Lovable | Two-way GitHub sync on the active/default branch; edit in your IDE and push back ([Lovable docs](https://docs.lovable.dev/integrations/git-sync-overview) [V]) | The bar for "trust" is now a real repo |
| Webflow | Export: `webflow devlink export` produces self-contained React (CLI 1.19, 28 Apr 2026). Import: React code components ([changelog](https://developers.webflow.com/home/changelog/2026/4/28) [V], [import](https://developers.webflow.com/code-components/importing/quick-start) [V]) | Both directions, but at the component level |
| Plasmic | Two modes: loader (designs fetched as data at runtime) vs codegen (files in your repo). Generated wrappers are "owned by you"; Plasmic-owned files are regenerated ([Plasmic docs](https://docs.plasmic.app/learn/loader-vs-codegen/) [V]) | The **owned vs generated regions** split is the known way to round-trip |
| Relume | Exports to Figma, Webflow and React from a 1,000+ component library ([relume.io](https://relume.io/) [R]) | Export from a catalog is cheap when the blocks are already real code |
| Framer | Workshop components stay inside Framer's runtime ([superdesign review](https://superdesign.dev/blog/framer-ai-review) [R]) | No clean exit |

**Design for us [I]**
1. **Export is a compiler, not a dump.** Spec → idiomatic Next.js or Astro + Tailwind + shadcn-format components. Logic IR → plain TS. Trust layer → a chosen backend (Supabase/Postgres with generated RLS from the same guard rules, or Cloudflare D1). Export should also write `AGENTS.md`, the spec file and a test suite, so a coding agent (Claude Code, Cursor, Lovable) can pick it up. That is the **"eject to a coding agent"** path.
2. **Continuous export, not a one-time eject.** Keep a GitHub repo in sync, and mark every file *generated* (overwritten) or *owned* (never touched), as Plasmic does.
3. **Re-import without a parser:** a hand-edited component is re-imported as a **custom block** (Webflow `declareComponent`-style typed props). It then becomes data again and can be re-themed and placed by the model. Arbitrary re-parsing of edited code back into a spec is not worth attempting.
4. **Custom code blocks** (HTML/JS or React) in a sandboxed island as a power-user hatch. These are the same draft tier as foundry blocks, and they can be submitted to the foundry.
5. **Promise in public:** "Your site is a JSON file and a repo. Both are yours, always." This is cheap to keep and directly answers Bubble-style fear.

---

## Part B: What becomes possible when a whole site costs nothing and takes a second

Each idea lists who has shipped something close, the reaction, feasibility on our architecture, and why a code-writing builder cannot easily copy it.

**Baseline: what code-writing builders cost in time.** Google's Gemini-3-Pro generative UI "can sometimes take a minute or more", and raters still preferred human-expert sites over it ([Google Research](https://research.google/blog/generative-ui-a-rich-custom-visual-interactive-user-experience-for-any-prompt/) [V]). Lovable users create about 200,000 projects a day ([TechCrunch](https://techcrunch.com/2026/03/11/lovable-says-it-added-100m-in-revenue-last-month-alone-with-just-146-employees/) [R]), each generated by an LLM writing code. The speed gap is real *today*, but see section C3 for why it should not be the moat.

### B1. Live generation while typing or speaking
- **Close prior art:** Google's neural-OS demo, where every screen is generated live on Gemini 2.5 Flash-Lite ([Google Developers](https://developers.googleblog.com/en/simulating-a-neural-operating-system-with-gemini-2-5-flash-lite/) [V]). Gemini 3.1 Flash-Lite pseudo-browser (24 Mar 2026): 360+ tokens/s, but "content quickly drifts into nonsense" ([The Decoder](https://the-decoder.com/google-deepminds-gemini-3-1-flash-lite-generates-websites-almost-in-real-time/) [R]). Imagine with Claude (Sep 2025): software generated on the fly, reviewed as buggy ([DataCamp](https://datacamp.com/tutorial/imagine-with-claude) [R]). Websim: imagined sites from a URL or prompt ([Tom's Guide](https://www.tomsguide.com/ai/meet-websim-the-ai-playground-that-lets-you-make-anything-you-can-imagine-in-seconds) [R]).
- **Reaction:** fascination, then "it drifts or breaks". Every demo so far trades coherence for speed.
- **Ours [I]:** regenerate the spec on every pause in typing (~300 ms debounce). Because output is constrained to the catalog, it **cannot drift into nonsense**. Speech works the same way, via streaming ASR.
- **Why code builders can't copy:** each keystroke would cost a full code generation, and the result would flicker between broken states.

### B2. The Wall: dozens of complete, distinct sites to pick from
- **Close prior art:** Variant, an infinite scroll of UI design variations. Praised for "just scroll", but single screens only, no flows ([Product Hunt](https://www.producthunt.com/posts/1082680) [R], [Banani review](https://www.banani.co/blog/variant-ai-review-and-pricing) [R]). The Midjourney grid as the interaction model. Relume generates the sitemap first, then wireframes ([relume.io](https://relume.io/) [R]).
- **Ours [I]:** 48 complete, multi-page, working sites (real copy, real booking form, real menu) in a grid, generated in parallel for near-zero cost. Hover one to preview all of its pages. **Cross-breed:** take the layout of #7 with the type and colors of #31, which is a spec merge. Swipe to refine (tinder-style preference learning on spec features).
- **Why code builders can't copy:** 48 code generations means 48 × (tens of seconds to minutes, and real money). Diversity also has to be *guaranteed*, which is easy over a discrete spec space (maximize distance between specs) and hard in code.

### B3. Dials that regenerate continuously ("more playful ↔ more corporate")
- **Close prior art:** none shipped for whole sites that I found. Theme switchers are the nearest. [I]
- **Ours [I]:** each dial maps to a learned direction in spec space (block variant choices, token values, density, imagery style, copy tone). Dragging re-solves the spec at 10–30 fps with animated transitions (layout morph via FLIP or the View Transitions API).
- **Why code builders can't copy:** a dial that re-runs codegen is a dial with a 30-second lag.

### B4. Instant restyle of everything
- Already native to a token-based catalog. Show it as **"Try on"**: hold a brand (logo plus two colors) against 20 themes at once. [I]

### B5. Branches, time travel, merge, readable diffs; multiplayer with agents
- **Prior art:** Ink & Switch Patchwork: lightweight branches, diff visualization, history as chat, including a branching tldraw diagram editor. Its conclusion is that branching is "a powerful general primitive" for creative work ([Ink & Switch](https://www.inkandswitch.com/patchwork/notebook/2024-version-control/06/) [V], [project](https://www.inkandswitch.com/project/patchwork/) [V]). Built on Automerge ([automerge.org](https://automerge.org) [R]). v0 creates a new version per applied edit ([v0 docs](https://v0.app/docs/design-mode) [R]). The tldraw agent kit has agents editing the canvas through schema-checked structured actions with incremental streaming ([tldraw](https://tldraw.dev/starter-kits/agent) [V]).
- **Ours [I]:**
  - The spec is a CRDT document, so humans, the chat model and background agents (SEO agent, accessibility agent, conversion agent) all edit the same doc.
  - Agent changes arrive as **proposals on a branch**, with a diff a human can read: "Hero: headline changed, CTA moved above fold. Pricing: monthly/annual toggle added."
  - A time slider scrubs the site's history live. "What-if" branches can be previewed side by side or A/B-tested directly.
- **Why code builders can't copy:** text diffs of generated React are unreadable to non-developers, and three-way merges of generated code conflict constantly. Spec diffs are semantic by construction.

### B6. Per-visitor and per-segment personalization; self-optimizing sites; free localization
- **Prior art:** Coframe runs a modified multi-armed bandit, and when an arm is dropped a model generates a new variant conditioned on past performance ([Coframe docs](https://docs.coframe.com/optimization/optimizer-methodology) [V, vendor-reported lifts]). Unbounce Smart Traffic routes visitors by attributes and claims about 20–30% average lift; case studies vary ([Unbounce](https://unbounce.com/smart-traffic/) [R], [learn.unbounce](https://learn.unbounce.com/try-smart-traffic) [R]). Mutiny does B2B segment personalization; Amplitude reported a 30% lead-conversion lift ([Mutiny case](https://www.mutinyhq.com/customers/amplitude) [R]). No independent audits of any of these lifts were found.
- **Ours [I]:**
  - Variants are spec patches. The edge (a Worker) picks a variant per request and renders deterministically. No client flicker, no tag manager.
  - **The breakthrough is cross-site learning.** Small sites never have enough traffic for an A/B test. But every one of our sites is made of the *same blocks*, so we can learn priors across thousands of sites ("for restaurants, a reservations CTA above the fold beats a menu CTA by X") and run hierarchical bandits that start smart.
  - Localization: translate copy slots and flip direction with CSS logical properties ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_logical_properties_and_values) [R]). RTL becomes a theme property, verified once per block in the foundry's RTL screenshots.
- **Why code builders can't copy:** their sites share no common units, so there is nothing to pool across. Each Lovable app is a one-off codebase.

### B7. Whole business from one input
- **Prior art:** Google Labs **Pomelli** builds a "Business DNA" (tone, palette, fonts, imagery) from a URL, then campaigns and assets. Free beta in US, CA, AU and NZ ([Google](https://blog.google/technology/google-labs/pomelli/) [V]). **Durable**: a site in about 30 seconds, relaunched March 2026 as a business builder with CRM and forms ([TechRadar](https://www.techradar.com/pro/software-services/durable) [R]). **Airtable Omni 2.0** builds apps from spreadsheets, PDFs and decks ([createwith](https://createwith.com/tool/airtable/updates/airtable-launches-airtables-fall-release-for-agent-ready-work) [R]). Wix ADI (2016) built sites from questionnaires and was retired in November 2024 ([Wikipedia](https://en.wikipedia.org/wiki/Wix.com) [R]).
- **Ours [I]:** paste a Google Maps link, Instagram handle, PDF menu or old site. Extraction fills the spec (services, hours, menu items, photos, reviews, brand colors from the logo), and the capability blocks get wired: real booking with the real services, real menu, real hours. In the same second we generate the brand kit, social templates, email templates and the Google Business post, all from the same tokens.
- **Why code builders can't copy:** they can, slowly. The defensible part is that **every output shares one spec and one token set**, so changing the price of a haircut updates the site, booking widget, social image and email at once.

### B8. Programmatic and bulk: API/SDK, thousands of sites
- **Prior art:** Duda's white-label platform, with a Partner API to create, populate and publish sites from templates, serving 20,000+ agencies ([Duda blog](https://blog.duda.co/dudas-api-automate-agency) [R], [listing](https://www.openbankingtracker.com/embedded-finance/duda) [R]). v0 Platform API: prompt → project → files → deployment, embeddable in other products ([Vercel](https://vercel.com/blog/build-your-own-ai-app-builder-with-the-v0-platform-api) [R]).
- **Ours [I]:**
  - `POST /sites {source: "gbp:…", theme: "…"}` → a live site in about a second, for roughly the cost of storage.
  - Use cases: a site for every listing (real estate, Airbnb hosts), every franchise location, every Shopify merchant, every Google Business profile. Fan-out updates ("change the footer on all 3,000 franchise sites") are one spec patch applied to many.
- **Why code builders can't copy:** v0's API yields one codebase per call at LLM cost and latency, and 3,000 divergent codebases cannot be patched uniformly.

### B9. Agent-facing sites, generated from the spec
- **Prior art:**
  - **WebMCP** (`navigator.modelContext`): pages expose tools to in-browser agents. Chrome 146 early preview, Feb 2026 ([VentureBeat](https://venturebeat.com/infrastructure/google-chrome-ships-webmcp-in-early-preview-turning-every-website-into-a) [R], [Chrome guide](https://github.com/GoogleChrome/modern-web-guidance-src/blob/main/guides/webmcp/webmcp/guide.md) [R]).
  - **UCP**, Google and Shopify, 11 Jan 2026: an open standard for agent checkout, with Cart, Catalog and Identity Linking added in March ([Shopifreaks](https://www.shopifreaks.com/google-and-shopify-launch-universal-commerce-protocol/) [R], [Google](https://blog.google/products-and-platforms/products/shopping/shopping-updates-google-marketing-live) [R]).
  - **NLWeb**: each instance is also an MCP server ([GitHub README](https://cdn.jsdelivr.net/gh/nlweb-ai/nlweb@main/README.md) [R]).
  - **MCP Apps** for UI in agents ([MCP blog](https://blog.modelcontextprotocol.io/posts/2026-01-26-mcp-apps/) [V]).
  - **llms.txt is weak:** about 6–10% adoption, and Ahrefs saw 97% of files get zero requests ([SEJ](https://www.searchenginejournal.com/97-of-llms-txt-files-got-no-requests-ahrefs-data-shows/) [R], [Optimizely](https://www.optimizely.com/field-notes/articles/does-llms-txt-work/) [R]). Ship it, but don't sell it.
- **Ours [I]:** the spec already *knows* the typed actions (book appointment: service, staff, slot; order item; subscribe; ask a question). Generate automatically:
  - schema.org JSON-LD
  - WebMCP tool registrations
  - a remote MCP server per site (tools = actions, resources = collections)
  - UCP catalog/checkout endpoints for stores
  - an MCP App for the booking widget, so it renders inside ChatGPT or Claude
- **Why code builders can't copy:** in generated code the actions are implicit and buried, so there is nothing typed to expose. Ours are declared, so agent access comes for free and stays correct after every edit.

### B10. Direct manipulation plus chat; sketch to site; voice
- **Prior art:** tldraw Make Real, a viral Nov 2023 sketch-to-site demo that "broke the internet a little", with annotate-and-regenerate ([tldraw](https://tldraw.dev/blog/make-real-the-story-so-far) [V], [Ars Technica via mirror](https://hn.jakechampion.name/reader/https://arstechnica.com/information-technology/2023/11/ai-powered-drawing-app-stuns-developers-by-turning-sketches-into-functional-games) [R]). Lovable's preview toolbar: point at an element and describe the change ([Lovable docs](https://docs.lovable.dev/features/preview-toolbar) [R]). v0 Design Mode: select, tweak, then "Apply" converts the edit to code ([v0 docs](https://v0.app/docs/design-mode) [R]).
- **Ours [I]:**
  - Pointing at an element resolves to a spec node, so "make this a carousel" is a variant swap that lands in about 100 ms, not a code round trip.
  - Sketches classify into block types and layout (a vision model picks from the catalog), so a napkin drawing becomes a *working* site, not a static mock.
  - Voice and pointing together ("this… bigger… and this one in blue") work because both resolve to node IDs.
- **Why code builders can't copy:** they can match the gesture, but every edit is still a code generation with its latency and risk of breaking things.

### B11. Runtime generative pages
- **Prior art:** Google's generative UI in Gemini and AI Mode ([Google Research](https://research.google/blog/generative-ui-a-rich-custom-visual-interactive-user-experience-for-any-prompt/) [V]). Thesys C1 streams a UI representation and renders it with its own component library ([docs](https://docs.thesys.dev/guides/what-is-thesys-c1) [R], [New Stack](https://thenewstack.io/generative-ui-for-devs-more-than-ai-assisted-design/) [R]). A2UI and json-render as above.
- **Ours [I]:** a search results page, comparison page or "plan my visit" page composes itself per query from the catalog plus the site's collections, at the edge, in about 100 ms. It is cacheable by (intent, segment).
- **Why code builders can't copy:** generating code per request is too slow, too costly and unsafe at runtime.

### B12. Stronger ideas found along the way [I]
- **"Site physics" guarantees.** Because rendering is deterministic, we can *prove* properties for every page: accessibility checks passed, Core Web Vitals budget met, no layout shift, every link valid, every form wired. Publish a badge.
- **Replay as onboarding.** Every site's build is a sequence of spec ops, so a "how this site was made" replay is a shareable 15-second video. That is a growth loop like Midjourney's public feed.
- **Fork any site.** "Remix this" on any site built with us gives you its spec (minus data), so the gallery becomes the template library.

---

## Part C: The ranked bets

Scoring: Wow of demo (W) × user Value (V) × Feasibility for 2–4 people (F) × Defensibility vs Lovable, Vercel and Wix (D), each 1–5. These are my judgments [I].

| # | Bet | W | V | F | D | Score |
|---|---|---|---|---|---|---|
| 1 | **The Wall**: 48 complete, distinct, working sites from one prompt or link; hover to tour, cross-breed, swipe to refine | 5 | 4 | 4 | 4 | **320** |
| 2 | **Business from one link**: a Maps, Instagram or old-site URL becomes site + working bookings/menu + brand kit + social and email templates, all on one spec | 5 | 5 | 4 | 3 | **300** |
| 3 | **Agent-ready by construction**: every site auto-ships an MCP server, WebMCP tools, schema.org and UCP endpoints, and an MCP App widget | 4 | 4 | 4 | 4 | **256** |
| 4 | **Live dials**: continuous restyle and regeneration (playful↔corporate, dense↔airy, bold↔quiet) at interactive frame rates | 5 | 3 | 4 | 4 | **240** |
| 5 | **Self-optimizing sites with cross-site priors**: edge bandits over spec variants, with priors pooled across all sites using the same blocks | 3 | 5 | 3 | 5 | **225** |
| 6 | **Verified block foundry**: catalog misses become background-built, verified, shared blocks | 3 | 5 | 3 | 5 | **225** |
| 7 | **Branches, time travel and readable diffs**, with agents proposing changes as branches | 3 | 4 | 5 | 3 | **180** |
| 8 | **Bulk API**: a site for every listing, location or merchant; fan-out patches | 3 | 4 | 4 | 3 | **144** |
| 9 | **Edge personalization + one-click localization/RTL + runtime composed pages** | 3 | 4 | 4 | 3 | **144** |
| 10 | **Point, sketch and speak**: pointing, napkin sketch and voice resolve to spec nodes with about 100 ms edits | 4 | 4 | 4 | 2 | **128** |

Bet 6 ranks sixth on demo appeal but is the **strategic foundation**: it is the answer to the long-tail objection, and it makes 1, 2 and 5 keep getting better. Start building it in month two, behind the demos.

### Top three: the 60-second demos and the 1-month versions

#### #1 The Wall
**60-second demo [I]**
- 0–5 s: type "Neighborhood Georgian bakery in Brooklyn, khachapuri, catering, Saturday classes." Press Enter.
- 5–8 s: the screen fills, tile by tile, with 48 *different* finished sites. Different layouts, type, palettes and photography, all with real copy, a real menu and a working "Book a class" form.
- 8–25 s: hover over three of them and each one tours its pages. Drag #12's layout onto #33's palette to get a new hybrid in under a second.
- 25–45 s: swipe left on four. The wall reshuffles toward what you like, and a caption reads "You prefer warm serif, editorial layouts, photo-led."
- 45–60 s: click one. It's live at a URL, the booking form takes a real test booking, and a counter shows "Time: 41 seconds. Cost: $0.00."

**Why people share it:** nobody has seen *48 working sites* at once, and the cross-breed moment is new.

**One-month build [I]**
- Catalog of ~60 blocks × 3 variants, 12 themes.
- Diversity sampler: pick specs maximizing pairwise distance in variant/theme space, conditioned on the prompt.
- Copy filled once per site, then shared across tiles with tone variants.
- Static SSR thumbnails via an edge renderer, lazy full previews in iframes.
- Spec merge for "layout from A, style from B".
- Simple pairwise preference model on spec features for the swipe step.

Skip multi-page touring in v1 if needed; one page is enough to wow.

#### #2 Business from one link
**60-second demo [I]**
- 0–5 s: paste a Google Maps link for a real barbershop. Press Enter.
- 5–10 s: the site appears with the shop's real name, hours, address map, 5-star reviews, photos, and services with prices.
- 10–25 s: click "Book". It shows the real services, a real staff list (from reviews or photos), and a slot picker. Make a test booking and an email confirmation arrives in an inbox on screen.
- 25–40 s: open the "Brand kit" tab: logo-derived palette, fonts, 6 Instagram post templates, a promo email, a Google Business post, all matching.
- 40–55 s: change "Skin fade $35 → $40" in chat. The site, booking widget, Instagram price card and email all update in one beat.
- 55–60 s: "One link → whole business. 9 seconds of compute."

**Why people share it:** it uses *their* business, and the one-edit-updates-everything moment shows the data model.

**One-month build [I]**
- Extraction from Maps/Places-style data and Instagram public pages via a scraping API, plus an old-site HTML importer.
- Palette from the logo, structured services.
- Blocks needed: hero, services and prices, booking (single-staff), hours/map, reviews, gallery, contact.
- Brand kit: 3 social templates and 1 email template rendered from the same tokens with Satori-style image rendering.
- One booking capability block with Stripe deposit optional.

Respect platform terms; prefer official APIs and user-authorized connections where they exist.

#### #3 Agent-ready by construction
**60-second demo [I]**
- 0–10 s: generate a restaurant site (from #2).
- 10–20 s: a panel shows what the site exposes to agents: `book_table(party_size, time)`, `get_menu(dietary)`, `order_pickup(items)`, plus a JSON-LD validator turning green.
- 20–45 s: in Claude or ChatGPT with the site's MCP URL added, type "Book a table for 4 at Tamada at 8 pm Friday, someone is vegan." The agent calls `get_menu(vegan)` and `book_table`, and a booking widget renders *inside the chat* (MCP App). The reservation appears in the owner's dashboard.
- 45–60 s: back in the builder, rename "Dinner" to "Supper club" and add a field. Re-run the agent: it already knows the new action shape. Caption: "Your site is now an API. You didn't write one."

**Why people share it:** "my site works in ChatGPT" is a 2026 status symbol, and the round trip is visible.

**One-month build [I]**
- Derive tools from typed actions in the spec.
- One remote MCP server per site, multi-tenant on Workers.
- MCP App resource for the booking block.
- schema.org JSON-LD for LocalBusiness, Menu, Event, Product.
- WebMCP registration script behind a flag.
- Leave UCP for month two, for stores.

### The single most likely way this fails, and the countermeasure

**Failure mode [I, with evidence]: users hit the catalog's edge in their first session and leave, because "close enough" looks like a template and code-writing builders keep getting faster.**

Evidence it is real:
- Wix ADI assembled sites from components from 2016 and was retired in 2024 in favor of generative building ([Wikipedia](https://en.wikipedia.org/wiki/Wix.com) [R]).
- A Relume review: a fixed library means outputs follow common web patterns ([toolradar/review](https://enter.converge.ai/page/en-US/blog/relume-review) [R]).
- **Softr's users used the vibe-coded block for nearly everything, even standard tables and forms** ([Softr](https://www.softr.io/blog/beyond-building-blocks) [V]). Given the choice, people prefer "it made exactly what I said" over "it picked the nearest thing".
- The speed gap is closing: Gemini 3.1 Flash-Lite at 360+ tokens/s ([The Decoder](https://the-decoder.com/google-deepminds-gemini-3-1-flash-lite-generates-websites-almost-in-real-time/) [R]), diffusion LLMs at about 1,000 tokens/s ([Mercury paper](https://arxiv.org/abs/2506.17298) [R]).
- Google and Vercel open-sourced catalog-constrained UI (A2UI, json-render), so the core mechanism is not a moat.

**Countermeasure [I]:**
1. **Never say no and never show "nearest match" silently.** Every miss gets an immediate sandboxed draft block (a code island in a few seconds, labeled draft). The foundry then hardens it into a verified block that everyone gets. The user experiences "it made what I asked". The system experiences "the catalog grew".
2. **Make the catalog miss rate the north-star metric.** Log every miss, cluster them weekly, and let the foundry and the design team close the top clusters. Publish the curve.
3. **Win on what speed alone can't buy.** The moats are the *properties of a spec*, not the second of latency: the Wall, cross-site optimization, agent-readiness, one-edit-everywhere brand consistency, readable branches, bulk fan-out, safe trust layer. Pitch those, not "faster than Lovable".
4. **Invest in a large variant space with strong design taste.** Distinctiveness comes from many high-quality variants × tokens × art direction, not from more block types. Measure "two sites from the same prompt look different" automatically.

---

## What I could not verify
- **The share of real SMB and startup needs covered by N blocks.** No primary dataset exists. The 80–90% (SMB) and 60–75% (MVP) figures are my estimates, supported only by vendor claims (Softr's 80%, Retool's 82% on databases).
- **All conversion lifts** (Coframe, Unbounce, Mutiny) are vendor-reported; no independent audits were found.
- **WebMCP status** beyond the Chrome 146 early preview. A Chrome 149 origin trial was reported by one source only.
- **Lovable's current user count** (only 2025 figures) and the September 2026 ARR (Sacra estimate). Websim usage numbers. Durable's business count (claims range from 1M to 5M).
- **Framer Workshop's 2026 plan availability and export limits** (secondary sources only).
- **InstantDB's sunset notice** was read on its homepage on 13 Nov 2026; I found no press coverage confirming it, because the search budget was exhausted.
- **Platforms not re-checked for 2026** (search budget exhausted): Glide, Noloco, Budibase, Appsmith, Directus, PocketBase, Refine, RedwoodSDK, Convex, Supabase, JSON Forms, react-jsonschema-form, AutoForm. Descriptions are from their documentation as previously known, with links given.
- **Whether any product already shares AI-generated blocks across all users** (a cross-tenant foundry). I found per-user generation only (Framer, Softr, Airtable, Wix Harmony), but could not search exhaustively.
