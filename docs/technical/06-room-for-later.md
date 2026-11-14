# 06: Room for later. What to reserve now so apps, the foundry and "a business from one link" need no rewrite

Written 14 November 2026 by the "room for later" agent. Scope: the parts of today's website-only design that are expensive to change later, the first capability (forms), the capability contract, per-site data, logic as data, the business data model and its ingestion, the block foundry, the security baseline, escape hatches, and a list of things to reserve now.

**Labels on every claim**
- **[V] verified**: read at the primary source on 14 Nov 2026 (docs page, terms, source code, npm registry). Dates are the page's own "last updated" where it shows one.
- **[R] reported**: secondary source, or a page I did not re-read this session.
- **[P] proposal or estimate**: my design or arithmetic. Judge it on its reasoning.

**Door types.** A **one-way door** is expensive to reverse once real sites, published URLs or stored data depend on it. A **two-way door** can be changed later at the cost of a refactor. Depth below goes to one-way doors.

**Not legal advice.** Where terms of service are quoted, they are quoted to show what the text says. Have a lawyer read them before relying on any interpretation here.

---

## 1. Decisions table

| # | Decision | Recommendation | Door | Confidence |
|---|---|---|---|---|
| D1 | Origins and domains | Four separate origins from day one: builder app, published sites (a separate registrable domain, submitted to the Public Suffix List), a sandbox domain for untrusted code, and a user-content domain for uploads | **One-way** | High |
| D2 | What the spec may contain | The spec never holds secrets, form submissions or visitors' personal data. It references secrets by name and data by id | **One-way** | High |
| D3 | How capabilities attach to the spec | One top-level `capabilities` map (`{ forms: { v: 1, config, instances } }`), blocks declare `requires`, server actions are addressed as `capability.action` | **One-way** | High |
| D4 | Reserved URL space on every published host | `/_x/*` for platform endpoints (actions, tokens, webhooks), plus `/.well-known/*`. Users can never create a page whose path starts with `_` | **One-way** | High |
| D5 | Tenancy of dynamic data | Logical rule now: every dynamic row belongs to exactly one site, and code reaches data only through a site-scoped handle whose site id comes from the verified hostname. Physical layout: one SQLite-backed Durable Object per site on Cloudflare, behind a `SiteData` interface | Logical rule **one-way**; physical layout two-way if the interface holds | High (rule), medium-high (layout) |
| D6 | Identity realms | Two realms that never mix: platform users (people who build sites) and site members (visitors who later log in to a site). Different tables, different cookies, different origins | **One-way** | High |
| D7 | Logic representation | Keep json-render's `ActionBinding` and `VisibilityCondition` shapes for client behavior, extend the condition grammar additively (`$ctx`, `in`, `contains`), reserve `automations` (trigger → steps) and a `$cel` escape for later. No statecharts or workflow graphs in the spec now | **One-way** for the condition grammar's existing shape; extensions are two-way | Medium-high |
| D8 | Business data model | `spec.business` (or a sibling `business.json`), typed, aligned to schema.org, and every field wrapped in `Sourced<T>` with provenance, confidence, licence and confirmation status. Prices, hours, phones and URLs are bound data, never LLM prose | **One-way** (provenance cannot be recovered later) | High |
| D9 | Business-from-one-link sources, v1 | The business's own website, user uploads (PDF menu, photos, logo, pasted text), and Google Places used only to find the business and pre-fill suggestions the owner confirms. Store `place_id`, not Google content. Instagram, Facebook and Yelp: not in v1 | Two-way | Medium (depends on founder question Q1) |
| D10 | First capability: forms | Form definitions are data in the spec. One compile function turns a definition into the validator used in the browser and on the server. Submissions go to a same-origin `POST /_x/a/forms.submit`, are stored per site, and fan out to email and signed webhooks | Shape of `FormDef` and the endpoint: **one-way**. Everything behind them: two-way | High |
| D11 | Spam protection | A `HumanCheck` interface. Turnstile on the hosted copy's sites domain, ALTCHA (MIT, self-hosted proof of work) for self-hosters and custom domains, plus honeypot, time trap and rate limits on every form | Two-way | High |
| D12 | Email | An `EmailSender` interface. Cloudflare Email Service (beta, transactional only) on the hosted copy, SMTP or an API provider for self-hosters. Newsletters: collect sign-ups only, send nothing in v1 | Two-way | High |
| D13 | Block registry entries | Immutable, versioned, content-hashed entries with provenance, licence, trust tier and a declared fallback block. Specs reference `blockId@major`; a published build locks exact hashes | **One-way** | High |
| D14 | Running untrusted code (embeds, drafts, foundry) | Never in the builder's origin or the main render tree. Client code: cross-origin sandboxed iframe island on the sandbox domain. Server code (later): Cloudflare Dynamic Workers with no network and capabilities passed as bindings | Two-way, but needs D1's sandbox domain now | High |
| D15 | Escape hatches in v1 | Typed embed blocks for an allowlist of providers and typed analytics integrations. No raw HTML or JavaScript in v1 (founder question Q3). Export is the other agents' area; capabilities must declare how they export | Two-way | Medium |
| D16 | Security baseline before a public demo | The ten controls in section 2.8 marked "before demo" | Mostly two-way, but D1, D2 and D6 are one-way | High |

---

## 2. Detail per decision

### 2.1 The smallest dynamic layer: forms and submissions (D10, D11, D12)

**What websites need now.** Contact and lead forms, newsletter sign-up, a booking request (a form, not a calendar), a quote request, and a "shop" link (a button to a Stripe Payment Link, Shopify, Etsy or similar). Only forms need a server. Payment and real-time booking wait for their capabilities.

**Options considered for where the form lives**

| Option | For | Against |
|---|---|---|
| A. Form fields as block props only | Simplest for the renderer | The server cannot validate without re-parsing a block tree; a second block that shows the same form duplicates the fields |
| B. Third-party form service (Formspree-style) | No server code | Breaks self-hosting, sends visitors' data to another processor, cannot become the template for later capabilities |
| **C. Form definition as data in `capabilities.forms.instances`, blocks point at it by id** [P] | Server and browser read the same definition; the decision model picks presets; the shape generalizes to every later capability | One more indirection in the spec |

**Recommendation: C.** The definition, the validation, the endpoint and the storage are all owned by the forms capability. Blocks only render.

**End to end** [P]

1. **Declared.** `spec.capabilities.forms.instances.contact` holds a `FormDef` (schema in section 3.2). A block such as `ContactSection` has `props.form = "contact"` and declares `requires: ["forms"]`. Field labels and the submit label are content slots, so the text writer fills them.
2. **Compiled.** `compileFormSchema(def): StandardSchema` builds a Zod 4 schema (zod 4.6.7, MIT [V npm]) from the definition. The same function runs in the browser island and on the server. Bounds are hard caps set by the platform (for example, textarea at most 5,000 characters, at most 30 fields, total body at most 32 KB) so a spec cannot loosen them.
3. **Rendered.** The published page is static HTML. The form is a real `<form method="post" action="/_x/a/forms.submit">` with a hidden `formId`, so it works without JavaScript (the server answers with a 303 redirect to the success page). A small island adds inline validation, the human check and a no-reload submit.
4. **Submitted.** Same origin as the page, so it works on custom domains with `form-action 'self'` in the CSP and no CORS.
5. **Server pipeline**, in order:
   1. Resolve the site from the `Host` header through the hostname map. Never accept a site id from the body.
   2. Load the `FormDef` from the **published** spec snapshot (not the draft).
   3. Check method, content type, body size (32 KB) and the `Origin` header.
   4. Rate limit with the Workers rate-limit binding, keyed on `siteId:ip` (periods of 10 or 60 seconds are the only options [V](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)), plus a per-site daily cap stored in the site's Durable Object.
   5. Honeypot field, and a time trap: the island fetches a signed token from `/_x/t` when the form is first focused, and submits it; under 2 seconds or over 24 hours is suspicious.
   6. Human check through `HumanCheck.verify(token, hostname)`.
   7. Validate with the compiled schema. Return `{ ok: false, errors: { field: code } }` with stable error codes the island maps to messages.
   8. Cheap spam scoring (links in a name field, link count in the message, repeated body hash). Score high → store with `status: "spam"`, do not notify. Never silently drop.
   9. Store in the site's store (section 2.3): `submissions` row with the values, a hashed IP (salted per day), user agent, referrer, UTM fields and status.
   10. Emit `forms.submitted`. The site's automations run: email the owner, call webhooks. Delivery is retried from the Durable Object's alarm with backoff, and every attempt is logged in `deliveries`.
6. **Read.** The owner sees an inbox in the builder app (owned by the editor agent), which calls a platform API that checks ownership and then calls the site's store. CSV export and delete per submission and per form.
7. **Retention** [P]: default 12 months, configurable; a nightly alarm deletes older rows. A `forward_only` storage mode stores nothing beyond the delivery log (founder question Q5).

**Spam protection (D11)** — two-way, so the simplest thing that works:
- Turnstile is free with unlimited challenges, but the free plan allows 20 widgets and 10 hostnames per widget; "any hostname" widgets are Enterprise only [V](https://developers.cloudflare.com/turnstile/plans/) (updated 14 Aug 2026). Adding a hostname "automatically authorizes all of its subdomains" [V](https://developers.cloudflare.com/turnstile/additional-configuration/hostname-management/). So **one widget covers every site on the sites domain**, but custom domains do not scale on the free plan.
- ALTCHA is an MIT-licensed, self-hostable proof-of-work challenge, `altcha` 3.6.0 published 12 Nov 2026 [V npm]. Use it for custom domains and as the self-hosted default. Cap (`@cap.js/widget` 0.1.63, Apache-2.0 [V npm]) is an alternative.
- Honeypot, time trap and rate limits on every form regardless of provider.

**Email (D12)** — two-way:
- Cloudflare Email Service: "Email Sending" is **Beta**, Workers Paid only, 3,000 emails a month included then $0.35 per 1,000 [V](https://developers.cloudflare.com/email-service/platform/pricing/) (updated 9 Jun 2026). New accounts start with a conservative daily quota that grows with reputation [V](https://developers.cloudflare.com/email-service/platform/limits/). "Can I use Email Service for marketing emails? No. Email Service supports transactional email only." [V](https://developers.cloudflare.com/email-service/reference/faq/). Sends to verified destination addresses are free [V](https://developers.cloudflare.com/email-service/).
- Therefore: owner notifications and double-opt-in confirmations are transactional and fit. **Newsletters are not sent in v1**: sign-ups are collected, exported as CSV, and later forwarded to a newsletter tool through a connector.
- Notification email: plain text plus a minimal HTML template built by our code with every value escaped; `From` is our sending domain, `Reply-To` is the submitter's validated email. Never let submitted text control headers.
- Self-hosted: `EmailSender` adapters for SMTP and for one API provider.

**Webhooks**: signed with the Standard Webhooks scheme (`webhook-id`, `webhook-timestamp`, `webhook-signature` headers, key rotation by sending two signatures) [V](https://github.com/standard-webhooks/standard-webhooks/blob/main/spec/standard-webhooks.md). The signing secret is generated by us per site and stored encrypted in the site store, never in the spec. Outbound webhook URLs go through the same SSRF guard as ingestion (section 2.8).

**Cost on the hosted copy** [P from V rates]: a submission is about 3 Durable Object requests and a few rows written; at $0.15 per million DO requests and $1 per million rows written beyond the included amounts ([DO pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)), forms cost effectively nothing. Email is the only real cost: $0.35 per 1,000 beyond 3,000 a month.

**Why this is the template.** Forms already have every part a later capability has: a site-level config, named instances, a data table, a server action with typed params, an event, automations, blocks that require it, a secret (webhook key), an admin view and an export story. Section 3.1 turns those parts into the contract.

### 2.2 The capability block contract (D3, D4)

**How others structure this, and the lesson for us**

| Platform | Structure | Lesson for us |
|---|---|---|
| **Shopify app blocks** [V](https://shopify.dev/docs/apps/build/online-store/theme-app-extensions/configuration) | A theme app extension is "a bundle of app blocks, app embed blocks, assets, and snippets". Each block has a schema with typed `settings`, a `target`, placement limits (`enabled_on` / `disabled_on`), and `available_if`, a flag the app controls through an app-data metafield. Enforced limit of 100 KB of Liquid; suggested 10 KB of compressed JS | Typed settings, declared placement rules, an availability gate owned by the capability (a block hides itself until the capability is configured), and size budgets |
| **WordPress plugins** [R](https://developer.wordpress.org/plugins/hooks/) | Plugins run in the same PHP process with full database access and hook into anything. Patchstack counted 11,334 new ecosystem vulnerabilities in 2025, 91% in plugins (report 02, §2) | Never run capability or third-party server code in-process with full access. A capability gets a narrow, site-scoped handle |
| **Retool** [V](https://docs.retool.com/permissions/guides/current-user) | "`current_user` values are computed server-side from the authenticated session and injected into query parameters before execution" | Identity and context values in rules come from the server (`$ctx`), never from the client's state |
| **Softr** [V](https://docs.softr.io/user-groups-and-permissions/block-visibility), [V](https://docs.softr.io/user-groups-and-permissions/record-filters) | Block visibility (logged in, user groups, device) is separate from global data restrictions, which "apply app-wide rules first", with record filters layered on top | Keep **visibility** (UI, cosmetic) and **permission** (data, enforced on the server) as two different things in the spec, even if both use the same condition grammar |
| **Airtable Interfaces** [R](https://community.airtable.com/announcements-6/new-ai-generated-custom-elements-are-out-of-beta-and-available-to-everyone-47849) | Interfaces over a base with permissions; AI-generated custom elements on top | The foundry layer sits on top of the trust layer, not beside it |
| **Glide** [V, report 01](https://www.glideapps.com/blog/glideos-launch-recap) | Moved from a JSON app description to code because coding agents "struggled" to author the JSON | Our model *chooses* from enumerated options; it never authors a DSL. Keep every capability's choice surface small and enumerable |

**Recommendation** (contract in section 3.1) [P]:
- A capability is a **package** with: a manifest (id, version, trust tier), config and instance schemas, logical tables with migrations, typed server actions, events, blocks it provides, secrets it needs, permissions it declares, network egress it needs, decision-model questions, admin views and an export hook.
- **Enabled per site** by an entry in `spec.capabilities`. Absent entry means disabled. Blocks that `require` a disabled capability fail spec validation (the editor offers "enable forms").
- **Isolated per site** by construction: a capability's handler receives `ctx.data`, a handle already bound to one site's store. It cannot name another site. It receives only the secrets it declared, decrypted for this site only. Its outbound `fetch` is wrapped by an egress guard limited to its declared hosts plus user-configured webhook URLs.
- **Chosen by the decision model** through questions the capability contributes, each with enumerated options and a pure function `applyAnswers(answers, business) → CapabilityUse`. Literal values (an owner's email, a price) never come from the model: they come from the account, the business model or the user.
- **Addressed** as `capability.action` (`forms.submit`, later `auth.signIn`, `payments.createCheckout`, `bookings.hold`). The endpoint is `POST /_x/a/{capability}.{action}` on the site's own host (D4).
- **Versioned** by major (`v: 1`) in the spec. A capability ships migrations for its config shape and its tables.

**How each later capability fits without changing the spec format or the renderer** [P]

| Capability | Config / instances | Tables | Actions | Blocks | Secrets |
|---|---|---|---|---|---|
| Forms (v1) | forms by id | submissions, deliveries | submit | form sections | webhook signing key |
| CMS collections | collections by id with a field schema | one table per collection, versions | list, get (public), create/update (owner) | list, detail, grid | none |
| Auth | providers (magic link, Google), roles | members, sessions, invites | signIn, signOut, verify | sign-in, account, gated page wrapper | OAuth client secrets |
| Payments | products, prices (or Stripe-hosted) | orders, payment events | createCheckout, webhook | buy button, pricing, cart | Stripe account link (Connect), webhook secret |
| Bookings | services, staff, availability rules | bookings, holds | listSlots, hold, confirm, cancel | booking flow, calendar | calendar OAuth token |
| Search | indexed collections | index (FTS5 in SQLite) | query | search box, results | none |

All six fit `capabilities.{id}`, `automations`, `requires`, `/_x/a/*` and `SiteData`. None needs a new top-level key.

### 2.3 Per-site data (D5)

**Current facts**

| Option | Facts | Source |
|---|---|---|
| SQLite-backed Durable Objects | Unlimited objects; 10 GB per object; unlimited storage per account on Workers Paid; 100 columns per table; 100 bound parameters per query; soft limit about 1,000 requests per second per object; 30 s CPU per request by default, up to 5 min | [V](https://developers.cloudflare.com/durable-objects/platform/limits/) (updated 13 Nov 2026) |
| | Pricing: 1M requests a month included then $0.15/M; rows read and written priced like D1; storage 5 GB-month included then $0.20 per GB-month; storage billing began January 2026 | [V](https://developers.cloudflare.com/durable-objects/platform/pricing/) |
| | Point-in-time recovery of the object's SQLite to any moment in the past 30 days | [V](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/) |
| D1 | Up to 1,000,000 databases per account on Workers Paid; the first 100,000 included, then $0.10 per database per month "even when it is empty"; 10 GB per database and "the 10 GB limit … cannot be further increased"; about 5,000 bindings per Worker script | [V](https://developers.cloudflare.com/d1/platform/limits/), [V](https://developers.cloudflare.com/d1/platform/pricing/) (updated 30 Oct 2026) |
| Self-hosted | `workerd` (Apache-2.0) stores every Durable Object in SQLite, supports `durableObjectStorage.localDisk`, a `workerLoader` binding, and an `--experimental` cluster mode that distributes objects across instances using a shared bucket | [V](https://github.com/cloudflare/workerd/blob/main/src/workerd/server/workerd.capnp) |

**Options compared** [P]

| | Shared tables with `site_id` (one D1) | D1 per site | **DO (SQLite) per site** |
|---|---|---|---|
| Isolation | Only as good as every `WHERE site_id = ?` (the class of bug behind Lovable's CVE-2025-48757, report 02) | Physical | Physical |
| Ceiling | One 10 GB database for all tenants, hard cap | 10 GB per site | 10 GB per site |
| Reaching it from a Worker | One binding | Bindings are per script (about 5,000), so per-site D1 needs the REST API or per-site deploys | `env.SITE.idFromName(siteId)`: no per-site configuration |
| Cost of idle sites | None | $0.10/month each beyond 100,000 | None (storage only) |
| Cross-site queries | Easy | Hard | Hard (by design) |
| Later foundry blocks with storage | Need their own tables | — | Durable Object Facets give each loaded block its own isolated SQLite under our supervisor [V](https://developers.cloudflare.com/dynamic-workers/usage/durable-object-facets/) |
| Export one site's data | Filtered dump | Dump | Dump |
| Self-hosted equivalent | Postgres with row-level security | One SQLite file per site | `workerd` with `localDisk`, or one SQLite file per site in a Node adapter |

**Recommendation.**
- **One-way part, decide now**: the logical tenancy rule (D5 in the table). Every dynamic row belongs to exactly one site. Capability code and platform code get data only through `SiteData`, obtained from a site id that the platform derived from the verified hostname or from an authenticated owner session. No capability ever writes SQL that mentions another site.
- **Physical layout**: one SQLite-backed Durable Object class `SiteStore`, one object per site, named by the opaque site id. The platform's own data (accounts, sites, hostnames, billing later, abuse reports) lives in one platform D1 database. Specs and published artifacts live in R2 and KV (the storage agent's call).
- **Public reads never hit the site's Durable Object.** Published pages are static or cached. Dynamic public data (a CMS list later) is materialized into the published snapshot at publish time or cached at the edge, so one object's 1,000 requests a second is never the bottleneck for page views.
- **Migrations**: each capability's tables carry a `schema_version` per capability in a `_meta` table. `SiteStore` runs pending migrations lazily when it wakes, inside a transaction. Reserve this runner now; it is small.
- **Cross-site needs** (abuse search, platform analytics) go to the platform database through explicit, logged events, never by scanning site stores.
- **What not to decide now**: Postgres for self-hosters, sharding, read replicas. Behind `SiteData` these are adapter work.

### 2.4 Declarative logic (D7)

**What json-render already has** (v0.22.0, 4 Nov 2026) [V](https://github.com/vercel-labs/json-render/blob/v0.22.0/packages/core/src/types.ts):
- `UIElement.on: Record<event, ActionBinding | ActionBinding[]>`, where `ActionBinding = { action, params?: Record<string, DynamicValue>, confirm?, onSuccess?: { navigate } | { set } | { action, params }, onError?, preventDefault? }`.
- `visible: VisibilityCondition`, which is `boolean`, a single condition on `$state`, `$item` or `$index` with one of `eq, neq, gt, gte, lt, lte` and optional `not`, an implicit-AND array, `$and` or `$or`.
- `watch` (state path → actions), `repeat`, and prop expressions `$state`, `$bindState`, `$item`, `$bindItem`, `$index`, `$cond/$then/$else`, `$template`, `$computed` (counted in `props.ts`).
- Validation `checks` with built-ins `required, email, minLength, maxLength, pattern, min, max, numeric, url, matches, equalTo, lessThan, greaterThan, requiredIf`, and `validateOn: change | blur | submit` [V](https://github.com/vercel-labs/json-render/blob/v0.22.0/packages/core/src/validation.ts).
- Two hazards in that code for us: `pattern` runs `new RegExp(pattern)` on a spec-supplied string (line 125), a regular-expression denial-of-service risk if a model or user supplies the pattern; and `onSuccess.navigate` is a free string, an open-redirect risk. **Requirement**: our validator rejects `pattern` unless it comes from our named-format list, and `navigate` must be an internal route id.

**Options for guards and rules**

| Option | Facts | Fit |
|---|---|---|
| json-render conditions | Already in the renderer; enumerable; no arithmetic, no `in`, no string operators | Good for choose-only, too small alone |
| JSONLogic | `json-logic-js` 2.0.5, last published July 2024 [V npm] | Enumerable, but the reference implementation is stale and implementations differ in edge cases |
| CEL | `@marcbachmann/cel-js` 8.0.0 (MIT, July 2026), `@bufbuild/cel` 0.6.2 (Apache-2.0, 4 Nov 2026) [V npm]; linear-time, no side effects (report 06, A2) | Best for an LLM that writes text we type-check; a choose-only model cannot write CEL text |
| JSONata | 2.2.2 (MIT, July 2026) [V npm] | A query and transform language with functions; too powerful for untrusted guards |
| Statecharts (XState 5.33.4, MIT [V npm]) | Mature | Booking and checkout flows are internal to their capability, written by us; they do not need to be spec data |
| Workflow graphs | n8n-style | The automation need in v1 is "on event, do these steps" — a list, not a graph |

**Recommendation** [P]
- **Reserve now, in the spec**:
  - `on` and `visible` exactly as json-render defines them (no forked shapes).
  - An additive extension of the condition grammar: sources `$ctx` (server-provided context: `/now`, `/locale`, later `/member/role`) beside `$state`; operators `in`, `contains`, `exists`. A versioned evaluator in one pure TypeScript module, used in the browser and on the server.
  - Top-level `automations: Automation[]` where `Automation = { id, on: { event, where?: Condition }, steps: Step[] }` and `Step = { action: "capability.action", params }`. In v1 only the forms capability writes them (email owner, webhook).
  - Top-level `permissions` key, reserved and empty, for later data rules in the same condition grammar (D7 plus Softr's lesson: visibility and permission are separate keys).
  - A reserved expression form `{ "$cel": "…" }`, rejected by the v1 validator, so a later LLM path can author guards that we type-check against the site's schema.
- **Not now**: statecharts, workflow graphs, formulas, `$cel` evaluation, branching inside automations.
- **Growth path**: v1 events and steps → v2 `where` conditions on automations and `permissions` rules → v3 `$cel` for LLM-written guards → foundry blocks for anything that needs real code.

### 2.5 The business data model (D8)

**Principles** [P]
1. **Every fact is `Sourced<T>`**: value, status, and one or more provenance records (source, method, time, confidence, evidence, licence, whether we may store it, when it expires).
2. **Nothing invented is shown as fact.** A fact appears on a published page only if its status is `owner_entered` or `confirmed`. During generation, `suggested` facts may appear in the preview, visibly marked in the editor; publishing requires one confirmation screen.
3. **Hard facts are bound, not written.** Prices, hours, phone numbers, addresses, emails and URLs are rendered from `business.*` by blocks. The text writer writes prose around them and is not allowed to produce them (a post-check strips any phone, URL, email, currency amount or time that is not in the business model).
4. **Aligned with schema.org** so a site emits correct JSON-LD for free (mapping in section 3.4).
5. **Typed primitives**: money as integer minor units plus ISO 4217 currency; phone in E.164; address structured; hours as ISO weekday plus local `HH:MM` and an IANA time zone; dates as ISO 8601.

**Structured-data constraint worth knowing now**: Google's review-snippet rules say "If the entity that's being reviewed controls the reviews about itself, their pages that use LocalBusiness or any other type of Organization structured data are ineligible for star review feature" [V](https://developers.google.com/search/docs/appearance/structured-data/review-snippet) (updated 8 Sep 2026). So a business's own site should **not** emit `aggregateRating` or `review` in JSON-LD; it gains nothing and risks a manual action [P]. Testimonials are shown as content only. Special hours use `openingHoursSpecification` with `validFrom` and `validThrough` in Google's LocalBusiness guide [V](https://developers.google.com/search/docs/appearance/structured-data/local-business).

**Where it lives** (requirement on the spec agent): either `spec.business` or a sibling document `business.json` referenced by the spec. Recommend the sibling document [P]: it is shared by the site, the brand kit, emails and social templates (report 06, B7), it carries provenance that pages do not need, and it can be large (a full menu). Blocks bind to it with `{ "$business": "/services/0/price" }`-style references resolved at render, or the spec agent's chosen binding form.

### 2.6 Getting the data, legally and technically (D9)

**Per source**

| Source | Official route and price | Storage and display terms (quoted briefly) | Scraping | Upload alternative | v1? |
|---|---|---|---|---|---|
| **Google Maps / Places** | Places API (New). Per 1,000 calls after the monthly free cap: Place Details Pro $17 (5,000 free), Enterprise $20 (1,000 free; includes hours, phone, website, rating), Enterprise + Atmosphere $25 (1,000 free; includes reviews), Photos $7 (1,000 free); Place Details "IDs Only" unlimited free [V](https://developers.google.com/maps/billing-and-pricing/pricing), field tiers [V](https://developers.google.com/maps/documentation/places/web-service/data-fields) | Terms: "Customer will not … copy and save business names, addresses, or user reviews" and "will not cache Google Maps Content except as expressly permitted" [V](https://cloud.google.com/maps-platform/terms) (last modified 26 Aug 2026). Exemptions: `place_id` may be cached; lat/lng for up to 30 consecutive days [V](https://cloud.google.com/maps-platform/terms/maps-service-terms) (28 Oct 2026). Policies: "You must not pre-fetch, cache, or store Places API content beyond the allowed exceptions"; attributions for reviews and photos must be shown [V](https://developers.google.com/maps/documentation/places/web-service/policies) | Prohibited by the same terms ("No Scraping"). Providers sell it anyway: Apify's Google Maps Scraper charges $0.004 per place on its free tier [V](https://apify.com/compass/crawler-google-places) | The owner types or confirms facts; uploads photos | **Lookup and suggestion only**, storing `place_id` |
| **Google Business Profile API** (owner's own listing) | Free, but access requires an application and approval [V](https://developers.google.com/my-business/content/prereqs) | "You cannot pre-fetch, cache, index, or store any content provided through the Business Profile APIs … except for limited amounts … no more than 30 calendar days"; no automated edits "without the user's prior specific and express consent" [V](https://developers.google.com/my-business/content/policies) (updated 28 Aug 2026) | — | — | Later, with approval |
| **Instagram** | Instagram Platform serves **professional** (business and creator) accounts only, via user login; Advanced Access needs Business Verification [V](https://developers.facebook.com/docs/instagram-platform/overview) (updated 29 Oct 2026). The old Basic Display API URL now redirects to the platform overview [V, observed redirect] | Meta Platform Terms (updated 3 Feb 2026) govern Platform Data, including sharing only with user consent and keeping proof [V](https://developers.facebook.com/terms/dfc_platform_terms/) | Meta v. Bright Data (N.D. Cal., 23 Jan 2024): Meta's terms did not cover logged-out scraping of public data; Meta dropped the case and waived appeal, so it is not appellate precedent [R](https://blog.ericgoldman.org/archives/2024/01/game-on-bright-data-scores-major-victory-in-web-scraping-dispute-with-meta-guest-blog-post.htm), [R](https://techcrunch.com/2024/02/26/meta-drops-lawsuit-against-web-scraping-firm-bright-data-that-sold-millions-of-instagram-records/), [R](https://www.quinnemanuel.com/the-firm/news-events/client-alert-meta-v-bright-data-significant-decision-for-web-scraping-industry/). Apify's Instagram Profile Scraper: $0.0026 per profile on its free tier [V](https://apify.com/apify/instagram-profile-scraper) | The owner uploads photos or connects their professional account later | No (later via official login) |
| **Facebook Pages** | Graph API with Page access granted by the Page admin; public-content access needs app review [R, not re-read] | Same Meta Platform Terms | Same legal picture as Instagram | Upload | No |
| **Yelp** | Yelp Places API: plans from $299/month (Enhanced) to $643/month (Premium) plus per-call fees, 30-day trial, "business email required" [V](https://business.yelp.com/data/resources/pricing/) | Display requirements forbid storing data "longer than 24 hours" and require Yelp attribution and links back [V](https://www.yelp.com/developers/display_requirements) | Against Yelp's terms | Owner pastes testimonials | No |
| **The business's own website** | Plain HTTP fetch; Cloudflare Browser Run (`/markdown`, `/content`, `/json`) only for pages that render with JavaScript [V](https://developers.cloudflare.com/browser-run/) | The owner (or someone acting for them) asks us to reuse their own content. Lowest legal risk of all sources [P, not legal advice] | — | — | **Yes, primary** |
| **PDF menu or price list** | `unpdf` 2.1.0 (MIT) or `pdfjs-dist` 6.5.438 (Apache-2.0) for text [V npm]; a vision model for scanned PDFs | User upload: user asserts the right to use it | — | It is the upload | **Yes** |

**Recommendation for v1** [P]
1. **The business's own website** (fetch up to 5 same-site pages: home, and links whose text or path matches menu, services, prices, contact, about, team).
2. **Uploads and paste**: PDF menu, photos, logo, any text.
3. **Google Places as a finder**: Text Search "IDs Only" and Place Details used to show the owner what Google lists, as **suggestions** on the confirmation screen. Persist only `place_id` (allowed) and what the owner then types or explicitly confirms as their own business facts. Whether "confirm" turns Google's content into the owner's own assertion is a legal question I cannot settle: it is founder question Q1, with the conservative path being "the owner retypes or edits; we never auto-fill from Google".
4. **Reviews**: v1 shows owner-provided testimonials (pasted or uploaded, marked `owner_testimonial`). Live Google reviews are a later choice (Q1 path B).
5. **Not in v1**: Instagram, Facebook, Yelp, scraping providers.

**This weakens the 60-second demo in report 06** (paste a Google Maps link, get real reviews). The strongest legal version of the demo: paste the business's **website** link or a Maps link; Maps resolves to the business's own website through `websiteUri` (a Place Details Enterprise field), and the site is built from the website, the owner's confirmations and live Google data shown only through Google's own components if Q1 path B is chosen [P].

**The ingestion pipeline** [P]

```
input (URL | uploads | text)
  → classify input (own site? maps link? social? pdf?)          deterministic
  → resolve (maps link → place_id → websiteUri; never store Google fields)
  → fetch (SSRF guard, ≤5 pages, ≤2 MB each, ≤10 s total)          Worker
  → deterministic extract: JSON-LD, microdata, OpenGraph, <a tel:/mailto:>,
    <address>, hours tables, <img> with alt, favicon/logo, theme-color
  → readable text (linkedom 0.18.15 + @mozilla/readability 0.6.0 → Markdown)
  → LLM extract into BusinessProfile JSON Schema, every field with an
    evidence quote ≤300 chars                                         structured output
  → verify: evidence must be a verbatim substring of the fetched text;
    re-parse phones (E.164), prices, hours; cross-source agreement raises
    confidence; anything without evidence is dropped, not stored
  → images: copy to our asset store with licence "owner_site"; never hotlink
  → brand: palette from logo and theme-color (code, not a model)
  → confirmation screen: grouped facts with source badges; one "Looks right"
    plus per-field edit; publish blocked until confirmed
```

- **Where it runs**: a Cloudflare Workflow or a per-job Durable Object on the hosted copy (durable steps and retries); the same module runs in `workerd` or Node for self-hosters. Browser Run is optional and behind a flag; its guardrails restrict a session to allowed hostnames [V](https://developers.cloudflare.com/browser-run/features/guardrails/).
- **Confidence** [P]: deterministic extraction from structured data 0.95; LLM value with verified evidence 0.8; inferred (category, tone) 0.5 and always `suggested`; LLM value without evidence: discarded.
- **Speed** [P, estimate]: own website 2 to 5 seconds end to end, dominated by the site's own response time. The page can render from the decision model's defaults immediately and swap in facts as they arrive (the Wall and speed targets are unaffected).

### 2.7 The block foundry, designed now, built later (D13, D14)

**What exists in late 2026**

| Mechanism | Facts | Use |
|---|---|---|
| Cross-origin sandboxed iframe | Standard; the pattern Figma and MCP Apps use for plugin UI (report 06, A3) | **Draft client blocks, embeds, custom code** |
| Shadow DOM | Style encapsulation only; scripts in it share the page's JavaScript realm | **Not a security boundary**; use only for style isolation of trusted blocks |
| ShadowRealm | Still Stage 2.7 (report 06, A3) | Not usable |
| Cloudflare Dynamic Workers | Run code supplied at runtime in a new isolate; Workers Paid only; 1,000 unique Dynamic Workers a month included, then $0.002 per Worker per day, billed since 26 May 2026; requests and CPU at standard Workers rates [V](https://developers.cloudflare.com/dynamic-workers/pricing/). `globalOutbound: null` makes every `fetch()` and `connect()` throw; or route egress through a gateway entrypoint that can inject credentials [V](https://developers.cloudflare.com/dynamic-workers/usage/egress-control/). At most 4 distinct Dynamic Workers in flight per Worker request, 10 per Durable Object [V](https://developers.cloudflare.com/dynamic-workers/platform/limits/) | **Server parts of foundry blocks** |
| Durable Object Facets | Dynamic code runs as a child of our Durable Object with its own SQLite, which cannot read the supervisor's [V](https://developers.cloudflare.com/dynamic-workers/usage/durable-object-facets/) | **Storage for foundry blocks, inside `SiteStore`** |
| Workers for Platforms | Whole-tenant scripts, $25/month base (report 03, §7) | Not needed: tenants do not deploy code |
| `workerd` self-hosted | Has `workerLoader`, but its README warns "`workerd` is not a hardened sandbox … When using `workerd` to run possibly-malicious code, you must run it inside an appropriate secure sandbox, such as a virtual machine" [V](https://github.com/cloudflare/workerd) | Self-hosters run only verified blocks unless they add a VM sandbox |

**Lifecycle** [P]

```
miss → foundry job (coding agent, offline, no network except our registry mirror)
     → build in isolation (pinned toolchain, import allowlist, no install scripts)
     → verification gate → status "draft" (this project only, sandboxed island)
     → owner keeps it → "private" (owner's projects, still sandboxed on publish)
     → N independent uses + human review → "public" (main render tree, everyone)
     → problem found → "revoked": registry flag flips, renderer substitutes the
       declared fallback, affected sites republish automatically
```

**Verification gate** (all automated except the last step to public):
1. Contract lint: props schema present and enumerable where possible; tokens only (no literal colors, sizes, radii); declared slots with min and max lengths; `requires` only lists existing capabilities.
2. Import allowlist: React, our primitives and a vendored list; no dynamic `import()`, no `eval`, no `new Function`, no `fetch` in client code, no direct DOM access outside the block root.
3. Render matrix: every enum combination × shortest, longest and right-to-left fixtures × every theme × three viewports × light and dark; server-side rendering must not throw.
4. Budgets: compressed JS size (Shopify suggests 10 KB for app blocks [V](https://shopify.dev/docs/apps/build/online-store/theme-app-extensions/configuration); we propose 15 KB per foundry block [P]) and render time.
5. Accessibility: axe plus keyboard traversal (axe alone catches about 57% of issues, report 06, A3).
6. Visual and taste check by a vision model against siblings (defects only, report 05).
7. Licence and provenance record written; artifact content-hashed and signed with the platform key.
8. Promotion to public: human review.

**Supply chain** [P, tools V]:
- pnpm 12.18 has `minimumReleaseAge`, `trustPolicy`, `blockExoticSubdeps` and `allowBuilds` / `strictDepBuilds` settings [V](https://pnpm.io/settings). Use them in the main repo from the first commit: a minimum release age of several days, builds allowed only for named packages, exotic sources blocked.
- The foundry never runs `npm install` from the internet. It builds against a vendored, pinned module set served from our registry mirror.
- Every published site build records a lockfile of block hashes, so a revoked or compromised block can be found in every site that uses it.

### 2.8 Security baseline (D16)

| Threat (exists from day one) | Controls | Before public demo? |
|---|---|---|
| **Stored XSS through content slots** | Text slots are plain strings rendered as React text (escaped). Rich text, if any, is a small structured tree (paragraph, bold, italic, link, list), never HTML. No `dangerouslySetInnerHTML` in any block (lint rule). JSON-LD serialized with `<`, `>` and `&` escaped as `<` etc. (a `</script>` inside a business name otherwise breaks out) | **Yes** |
| **XSS and open redirect through URLs** | One `safeUrl()` used by every block: allow `https:`, `http:`, `mailto:`, `tel:` and internal route ids; reject `javascript:`, `data:`, `vbscript:` and protocol-relative tricks after normalization. `onSuccess.navigate` must be a route id | **Yes** |
| **CSS and theme injection** | Theme tokens are typed values (colors parsed as OKLCH or hex, lengths from a scale, fonts from an allowlist), compiled by our code; never raw strings into `<style>` | **Yes** |
| **Uploads (SVG with script, HTML disguised as image)** | Serve uploads only from the user-content domain with `Content-Disposition` where needed and `X-Content-Type-Options: nosniff`; sanitize or rasterize SVG; re-encode images | **Yes** |
| **Session theft across sites** | D1: builder app, sites, sandbox and uploads on different registrable domains; the sites domain and sandbox domain submitted to the Public Suffix List (as `pages.dev`, `workers.dev`, `github.io`, `lovable.app`, `vercel.app` and `webflow.io` are [V](https://publicsuffix.org/list/public_suffix_list.dat)) so one site cannot set cookies for another | **Yes** (submit early; review takes time [R]) |
| **Missing browser policies** | Published sites: strict CSP without inline scripts (`script-src 'self'`, hashes for anything inline, `object-src 'none'`, `base-uri 'none'`, `form-action 'self'`, `frame-src` generated from the site's typed embeds), `Referrer-Policy`, HSTS on our domains. Builder app: CSP with nonces plus Trusted Types | **Yes** for sites; app Trusted Types can follow |
| **SSRF in link ingestion and webhooks** | One `safeFetch()` for every outbound URL a user influences: `http(s)` only, ports 80 and 443, no credentials in URLs, resolve DNS and reject private, loopback, link-local and metadata ranges on every redirect hop (max 3), 10 s timeout, 2 MB cap, content-type allowlist. On Workers, outbound requests leave from Cloudflare's network, which removes most internal-network targets [R]; on self-hosted Node the DNS check is essential (`request-filtering-agent` 3.2.1, MIT [V npm], or `ipaddr.js` 2.5.0 [V npm]) | **Yes** |
| **Prompt injection from ingested pages** | The extractor has no tools and must return the schema; every value needs a verbatim evidence quote; URLs, emails and phones in output must already appear in the source; the text writer gets facts as data in delimited fields and has no tools; a post-check removes contact details and amounts not in the business model; the owner confirms facts. The decision model only picks enums, so injection cannot change structure beyond the allowed options | **Yes** |
| **Abuse of free generation** | Per-IP and per-account rate limits; Turnstile before anonymous generation; daily model-spend cap per account and a global circuit breaker that degrades to defaults-only generation | **Yes** |
| **Phishing and spam pages on our sites domain** | Publishing requires a verified email; forms cannot have password, card or one-time-code fields (field type enum has none, and labels are checked); brand-impersonation check on site names, subdomains and rendered text at publish (name list plus a classifier); outbound links checked against Google Web Risk (the Safe Browsing API "is for non-commercial use only" [V](https://developers.google.com/safe-browsing)); "Report abuse" link on free sites; one-click unpublish and an abuse queue; new sites `noindex` for their first days [P]. Risk: one bad site can get the whole sites domain flagged | Verified email, field restrictions, unpublish and the report link: **yes**. Classifier and Web Risk: before opening sign-ups widely |
| **Secrets** | Platform secrets in Worker secrets or Secrets Store (open beta [V](https://developers.cloudflare.com/secrets-store/)); per-site secrets (webhook keys, later OAuth tokens) envelope-encrypted in `SiteStore` with a key derived per site from a platform master key; never in the spec, never sent to a model, never returned to the browser after creation. Prefer OAuth connections (Stripe Connect, Google) over pasted keys | **Yes** (for webhook keys) |
| **Visitors' personal data** | Submissions in the site store only; retention default; export and delete; privacy notice template for site owners; the hosted copy acts as processor for site owners (see Q5) | **Yes** for retention and delete |

### 2.9 Escape hatches (D15)

**Options for v1**

| Option | Speed | Safety | Edits that never break |
|---|---|---|---|
| Raw HTML and JS pasted into the page | Unbounded | Breaks every guarantee; XSS by design | No |
| **Typed embed blocks for an allowlist** [P] | Lazy-loaded iframe, facade until click | Provider iframe on its own origin; CSP `frame-src` generated | Yes: props are typed |
| **Typed site integrations** (analytics) [P] | Our loader, deferred | We generate the script tag and the CSP entry | Yes |
| Raw code in a sandboxed cross-origin iframe island | Cost of one iframe | Contained; cannot touch the page | Mostly (fixed height, resize messages) |
| Eject to a coding agent | n/a | User's own responsibility | The exported code leaves our guarantees |

**Recommendation for v1** [P]: typed embeds for YouTube, Vimeo, Google Maps embed, Calendly, Cal.com, Spotify, SoundCloud and a generic "booking or ordering link" button; typed analytics for Cloudflare Web Analytics, Plausible, Umami and Google Analytics 4 (the user supplies only an id, validated by pattern). Raw code waits for the sandbox island (Q3). Export and "eject to a coding agent" belong to the repo and export areas; the requirement from this area is that each capability declares an `export` hook (generated server code, or "this capability stays hosted; here is its API") so export never silently drops a form.

---

## 3. Schemas and contracts

All TypeScript below is a proposal [P]. Types use Zod or any Standard Schema implementation at runtime.

### 3.1 Capability contract

```ts
// packages/capabilities/src/contract.ts
import type { StandardSchemaV1 } from "@standard-schema/spec";

export type TrustTier = "core" | "verified" | "draft";

export interface CapabilityDefinition<Config, Instance = never> {
  id: string;                       // "forms" — lowercase, stable forever
  version: number;                  // major; spec stores { v }
  trust: TrustTier;                 // core = written and audited by us
  configSchema: StandardSchemaV1<Config>;
  instanceSchema?: StandardSchemaV1<Instance>;
  migrateConfig?: Record<number, (old: unknown) => unknown>; // from major n-1

  data: {
    tables: TableDef[];             // logical; adapter maps to SQLite/Postgres
    migrations: Migration[];        // ordered, idempotent, per capability
  };

  actions: Record<string, ServerAction<any, any>>;   // "submit" → /_x/a/forms.submit
  events: Record<string, StandardSchemaV1<unknown>>; // "submitted"
  steps?: Record<string, StepHandler<any>>;          // usable in automations

  blocks: string[];                 // registry ids of blocks this capability provides
  secrets: SecretDecl[];
  permissions: PermissionDecl[];    // resources and default rules (later)
  egress: EgressDecl;               // hosts it may call

  questions: DecisionQuestion[];    // for the decision model (choose-only)
  applyAnswers(a: Answers, b: BusinessProfile | undefined): CapabilityUse<Config, Instance>;

  admin?: AdminViewDecl[];          // e.g. submissions inbox, declared as data
  export?: (ctx: ExportCtx) => Promise<ExportResult>; // code, or "stays hosted"
}

export interface ServerAction<P, R> {
  params: StandardSchemaV1<P>;
  result: StandardSchemaV1<R>;
  access: "public" | "owner" | { condition: Condition }; // evaluated server-side
  rateLimit?: { key: "ip" | "site" | "member"; perMinute: number };
  humanCheck?: "required" | "auto" | "off";
  handler(params: P, ctx: ActionCtx): Promise<R>;
}

export interface ActionCtx {
  siteId: string;                   // from verified hostname or owner session ONLY
  publishedSpec: SiteSpecSnapshot;  // read-only
  data: SiteData;                   // already scoped to siteId
  secrets: { get(name: string): Promise<string> }; // only declared names
  emit(event: string, payload: unknown): Promise<void>;
  fetch: typeof fetch;              // wrapped by safeFetch + egress allowlist
  now(): Date;
  request: { ip: string; userAgent: string; locale: string };
  member?: { id: string; roles: string[] }; // later, from auth capability
}

export interface SiteData {                // the only door to dynamic data
  query<T>(table: string, q: QuerySpec): Promise<T[]>;
  insert(table: string, row: Record<string, unknown>): Promise<string>;
  update(table: string, id: string, patch: Record<string, unknown>): Promise<void>;
  delete(table: string, id: string): Promise<void>;
  tx<T>(fn: (d: SiteData) => Promise<T>): Promise<T>;
}

export interface SecretDecl { name: string; scope: "site" | "platform"; generated?: boolean; required: boolean }
export interface EgressDecl { hosts: string[]; userConfiguredUrls?: boolean }
export interface DecisionQuestion {
  id: string;                       // "forms.contact.preset"
  appliesWhen?: Condition;          // e.g. site kind in [...]
  options: { id: string; label: string }[]; // enumerated only
  multi?: boolean;
}
```

Spec side:

```ts
// in SiteSpec (spec agent owns the file; these keys are reserved by this report)
interface SiteSpec {
  specVersion: string;
  siteId: string;                    // opaque ULID, never derived from a name
  business?: BusinessRef;            // see 3.3
  capabilities?: Record<string, CapabilityUse<unknown, unknown>>;
  automations?: Automation[];
  permissions?: PermissionRule[];    // reserved, must be empty in v1
  integrations?: Integration[];      // typed analytics, embeds config
  extensions?: Record<`x-${string}`, unknown>; // namespaced, ignored by renderer
  // … theme, assets, content, routes, layouts (other agents)
}
interface CapabilityUse<C, I> { v: number; config: C; instances?: Record<string, I> }
interface Automation {
  id: string;
  on: { event: `${string}.${string}`; where?: Condition };
  steps: { action: `${string}.${string}`; params: Record<string, DynamicValue> }[];
}
```

Block registry side (requirement on the blocks agent):

```ts
interface BlockManifestMeta {
  requires?: string[];               // capability ids
  binds?: { capability: string; instanceProp: string }[]; // props.form → forms.instances
  serverNeeds?: never;               // blocks never declare server code; capabilities do
}
```

### 3.2 Forms capability

```ts
type FieldType =
  | "text" | "email" | "tel" | "url" | "textarea" | "number"
  | "select" | "radio" | "checkboxes" | "checkbox"
  | "date" | "time" | "datetime" | "consent" | "hidden";
// Deliberately absent: password, card, otp, file (file is reserved for a later version).

interface FormField {
  name: string;                      // ^[a-z][a-z0-9_]{0,39}$
  type: FieldType;
  label: ContentRef;                 // content slot, filled by the text writer
  help?: ContentRef;
  required?: boolean;
  options?: { value: string; label: ContentRef }[];  // ≤ 50
  optionsFrom?: "business.services" | "business.staff" | "business.locations";
  minLength?: number; maxLength?: number;            // clamped to platform caps
  min?: number; max?: number;
  format?: "person_name" | "postcode" | "company";   // named formats; no raw regex
  autocomplete?: "name" | "email" | "tel" | "organization" | "street-address" | "off";
  hiddenSource?: "utm_source" | "utm_medium" | "utm_campaign" | "page_path";
  personal?: boolean;                // drives retention and export labelling
}

interface FormDef {
  id: string;
  purpose: "contact" | "lead" | "newsletter" | "booking_request" | "quote" | "waitlist" | "custom";
  fields: FormField[];               // ≤ 30
  submitLabel: ContentRef;
  success: { kind: "message"; message: ContentRef } | { kind: "route"; routeId: string };
  storage: "store" | "forward_only";
  doubleOptIn?: boolean;             // newsletter only
  humanCheck: "auto" | "off";        // "off" only for self-hosters
}

interface FormsConfig {
  notify: { ownerEmail: boolean };   // recipient comes from the account, not the spec
  retentionDays: number;             // default 365
}
```

Example (contact form for a barbershop):

```json
{
  "capabilities": {
    "forms": {
      "v": 1,
      "config": { "notify": { "ownerEmail": true }, "retentionDays": 365 },
      "instances": {
        "booking": {
          "id": "booking",
          "purpose": "booking_request",
          "fields": [
            { "name": "name", "type": "text", "label": { "$content": "/forms/booking/name" }, "required": true, "autocomplete": "name", "personal": true },
            { "name": "phone", "type": "tel", "label": { "$content": "/forms/booking/phone" }, "required": true, "personal": true },
            { "name": "service", "type": "select", "label": { "$content": "/forms/booking/service" }, "optionsFrom": "business.services", "required": true },
            { "name": "preferred_date", "type": "date", "label": { "$content": "/forms/booking/date" } },
            { "name": "notes", "type": "textarea", "label": { "$content": "/forms/booking/notes" }, "maxLength": 1000 }
          ],
          "submitLabel": { "$content": "/forms/booking/submit" },
          "success": { "kind": "message", "message": { "$content": "/forms/booking/thanks" } },
          "storage": "store",
          "humanCheck": "auto"
        }
      }
    }
  },
  "automations": [
    { "id": "notify-owner", "on": { "event": "forms.submitted" },
      "steps": [ { "action": "email.notifyOwner", "params": { "template": "submission" } } ] }
  ]
}
```

Endpoint contract:

```
POST /_x/a/forms.submit
Content-Type: application/json   (or application/x-www-form-urlencoded without JS)
{ "formId": "booking", "values": { … }, "hc": "<human-check token>", "t": "<time token>" }

200 { "ok": true, "id": "sub_01J…" }
422 { "ok": false, "errors": { "phone": "invalid_tel" } }
429 { "ok": false, "error": "rate_limited", "retryAfter": 30 }
```

Site store tables (logical):

```sql
CREATE TABLE submissions (
  id TEXT PRIMARY KEY, form_id TEXT NOT NULL, created_at INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('new','read','archived','spam')),
  data TEXT NOT NULL,            -- JSON of validated values
  meta TEXT NOT NULL,            -- JSON: ip_hash, ua, referrer, utm, spec_version
  expires_at INTEGER NOT NULL
);
CREATE INDEX submissions_form_created ON submissions(form_id, created_at);
CREATE TABLE deliveries (
  id TEXT PRIMARY KEY, event_id TEXT NOT NULL, step TEXT NOT NULL,
  target TEXT NOT NULL, attempt INTEGER NOT NULL, status TEXT NOT NULL,
  next_at INTEGER, last_error TEXT
);
CREATE TABLE audit (id TEXT PRIMARY KEY, at INTEGER, actor TEXT, action TEXT, detail TEXT);
CREATE TABLE _meta (capability TEXT PRIMARY KEY, schema_version INTEGER NOT NULL);
```

Platform interfaces (self-host adapters behind each):

```ts
interface HumanCheck { widget(hostname: string): WidgetConfig; verify(token: string, hostname: string, ip: string): Promise<boolean> }
interface EmailSender { send(m: { to: string; from: string; replyTo?: string; subject: string; text: string; html?: string }): Promise<{ id: string }> }
interface SiteStoreFactory { forSite(siteId: string): SiteData }
```

### 3.3 Business data model

```ts
type SourceKind =
  | "owner_input" | "owner_upload" | "owner_website"
  | "google_places" | "google_business_profile"
  | "instagram" | "facebook" | "yelp" | "other_web";

interface Provenance {
  source: { kind: SourceKind; url?: string; ref?: string };   // ref: place_id, upload id
  method: "api" | "html_structured" | "html_text_llm" | "pdf_text" | "ocr_vision"
        | "inferred" | "user_typed" | "user_confirmed";
  at: string;                         // ISO time of extraction
  confidence: number;                 // 0..1, rules in 2.6
  evidence?: { quote?: string; page?: number; selector?: string };  // quote ≤ 300 chars
  licence: "owner_asserted" | "provider_terms" | "cc_by" | "cc0" | "unknown";
  mayStore: boolean;                  // false for Google content except place_id
  expiresAt?: string;                 // e.g. lat/lng from Places: +30 days
}

interface Sourced<T> {
  value: T;
  status: "suggested" | "confirmed" | "owner_entered" | "rejected";
  prov: Provenance[];
}

interface Money { amountMinor: number; currency: string }           // ISO 4217
type Price =
  | { kind: "fixed"; price: Money }
  | { kind: "from"; price: Money }
  | { kind: "range"; min: Money; max: Money }
  | { kind: "free" } | { kind: "on_request" };

interface Hours { day: 1|2|3|4|5|6|7; opens: string; closes: string }   // ISO weekday, "HH:MM"
interface SpecialHours { from: string; through: string; closed: boolean; hours?: Omit<Hours,"day">[]; note?: string }

interface BusinessProfile {
  schemaVersion: 1;
  id: string;
  identity: {
    name: Sourced<string>;
    legalName?: Sourced<string>;
    schemaType: Sourced<string>;       // "HairSalon", "Restaurant", "Dentist" …
    tagline?: Sourced<string>;
    description?: Sourced<string>;
    foundedYear?: Sourced<number>;
    logo?: Sourced<AssetRef>;
    brandColors?: Sourced<string[]>;   // hex, from logo/theme-color by code
    languages?: Sourced<string[]>;     // BCP 47
  };
  contact: {
    phones?: Sourced<{ e164: string; label?: "main" | "mobile" | "whatsapp" }>[];
    emails?: Sourced<string>[];
    address?: Sourced<{ street: string; locality: string; region?: string; postalCode?: string; country: string }>;
    geo?: Sourced<{ lat: number; lng: number }>;
    serviceArea?: Sourced<string[]>;
    googlePlaceId?: string;            // cache-exempt identifier
  };
  hours?: { timeZone: string; regular: Sourced<Hours[]>; special?: Sourced<SpecialHours>[] };
  services?: Sourced<{
    id: string; name: string; description?: string; category?: string;
    price?: Price; durationMin?: number; staffIds?: string[]; bookable?: boolean;
  }>[];
  menu?: { sections: Sourced<{
    id: string; name: string;
    items: { id: string; name: string; description?: string; price?: Price;
             dietary?: ("vegan"|"vegetarian"|"gluten_free"|"halal"|"kosher"|"spicy")[];
             allergens?: string[] }[];
  }>[] };
  staff?: Sourced<{ id: string; name: string; role?: string; photo?: AssetRef; bio?: string; consent: boolean }>[];
  testimonials?: Sourced<{ author: string; text: string; rating?: 1|2|3|4|5; date?: string;
                           permission: "owner_testimonial" | "live_embed_only" }>[];
  photos?: Sourced<{ asset: AssetRef; alt?: string; credit?: string; subject?: "interior"|"exterior"|"product"|"team"|"food"|"work" }>[];
  social?: Sourced<{ platform: "instagram"|"facebook"|"tiktok"|"youtube"|"x"|"linkedin"|"google"|"yelp"|"tripadvisor"|"other"; url: string }>[];
  links?: { booking?: Sourced<string>; ordering?: Sourced<string>; shop?: Sourced<string> };
  attributes?: Sourced<{ key: "wheelchair_accessible"|"parking"|"wifi"|"outdoor_seating"|"accepts_cards"|"accepts_cash"; value: boolean }>[];
  policies?: { cancellation?: Sourced<string>; deposit?: Sourced<Price> };
}
```

Example fragment:

```json
{
  "identity": {
    "name": { "value": "Fade Street Barbers", "status": "confirmed",
      "prov": [{ "source": { "kind": "owner_website", "url": "https://fadestreet.example/" },
                 "method": "html_structured", "at": "2026-11-14T10:02:11Z", "confidence": 0.95,
                 "evidence": { "selector": "script[type=application/ld+json] name" },
                 "licence": "owner_asserted", "mayStore": true }] }
  },
  "services": [
    { "value": { "id": "skin-fade", "name": "Skin fade", "durationMin": 40,
                 "price": { "kind": "fixed", "price": { "amountMinor": 3500, "currency": "USD" } } },
      "status": "suggested",
      "prov": [{ "source": { "kind": "owner_website", "url": "https://fadestreet.example/prices" },
                 "method": "html_text_llm", "at": "2026-11-14T10:02:13Z", "confidence": 0.8,
                 "evidence": { "quote": "Skin fade ........ $35 (40 min)" },
                 "licence": "owner_asserted", "mayStore": true }] }
  ]
}
```

### 3.4 schema.org mapping (for the JSON-LD emitter)

| Business model | schema.org | Notes |
|---|---|---|
| `identity.schemaType` | `@type` (a `LocalBusiness` subtype: `HairSalon`, `Restaurant`, `Dentist`, …) | Enum from schema.org's LocalBusiness subtypes; the decision model chooses |
| `identity.name`, `legalName`, `description`, `logo`, `foundedYear` | `name`, `legalName`, `description`, `logo`, `foundingDate` | |
| `contact.phones[0]`, `emails[0]` | `telephone`, `email` | |
| `contact.address`, `geo` | `address` (`PostalAddress`), `geo` (`GeoCoordinates`) | Omit `geo` if it came from Places and expired |
| `contact.serviceArea` | `areaServed` | |
| `hours.regular` | `openingHoursSpecification[]` (`dayOfWeek`, `opens`, `closes`) | |
| `hours.special` | `openingHoursSpecification` with `validFrom` / `validThrough` | As in Google's LocalBusiness guide [V](https://developers.google.com/search/docs/appearance/structured-data/local-business) |
| `services[]` | `hasOfferCatalog` → `OfferCatalog` → `Offer` → `itemOffered: Service`, `priceSpecification` | `from` → `minPrice`; `range` → `minPrice`/`maxPrice` |
| `menu` | `hasMenu` → `Menu` → `MenuSection` → `MenuItem` with `offers`, `suitableForDiet` | Restaurants only |
| `staff[]` | `employee` → `Person` | Only with `consent: true` |
| `photos[]` | `image` | |
| `social[]` | `sameAs` | |
| `links.booking` / form | `potentialAction` → `ReserveAction` | |
| `testimonials[]` | **not emitted** | Self-serving reviews are ineligible for star snippets [V](https://developers.google.com/search/docs/appearance/structured-data/review-snippet) |
| only `confirmed` / `owner_entered` values | — | The emitter skips `suggested` values |

### 3.5 Block registry entry (requirement on the blocks agent)

```ts
interface RegistryEntry {
  id: string;                        // "core/hero-split"
  version: string;                   // semver; spec references "core/hero-split@2"
  hash: string;                      // sha256 of the built artifact; immutable
  status: "draft" | "private" | "public" | "deprecated" | "revoked";
  trust: "core" | "vendored" | "foundry" | "community";
  fallback: string;                  // block id used if this one is revoked or fails
  requires?: string[];               // capability ids
  provenance: {
    origin: "handwritten" | "vendored" | "foundry";
    sourceUrl?: string; upstreamLicence?: string; notices?: string[];
    generatedBy?: { agent: string; model: string; requestHash: string; at: string };
    verifiedBy?: { gateVersion: string; reportHash: string; at: string; reviewer?: string };
  };
  licence: string;                   // SPDX of our block, e.g. "Apache-2.0"
  budgets: { jsGzipBytes: number; cssGzipBytes: number };
  render: "static" | "island" | "sandboxed-island"; // draft/private foundry blocks: sandboxed-island
  signature: string;                 // platform key over hash + status
}
```

---

## 4. What to defer (do not build yet)

- **Auth, site members, roles and gated pages.** Reserve the realm separation (D6) and the `permissions` key; build nothing.
- **Payments and carts.** A "shop" in v1 is a link button. When payments come, use Stripe-hosted Checkout and Connect (OAuth), never pasted secret keys [P].
- **Real bookings with availability.** v1 is a booking *request* form.
- **CMS collections, search, CRUD views, dashboards.**
- **Newsletter sending.** Collect and export only.
- **File uploads in forms.** Reserve `file` in the field enum as rejected.
- **Statecharts, workflow graphs, formulas, `$cel` evaluation, branching automations.**
- **The foundry itself**, Dynamic Workers, Durable Object Facets. Build only the registry fields, the fallback rule and the sandbox origin.
- **Raw custom code embeds** (unless Q3 says yes; then only as a sandboxed island).
- **Instagram, Facebook, Yelp and Business Profile integrations, and all scraping providers.**
- **Live Google reviews widgets** (unless Q1 path B).
- **Per-site D1, Workers for Platforms, Postgres adapter, multi-region anything.**
- **MCP servers and agent-facing actions** (CLAUDE.md: agent-ready sites wait). The typed `capability.action` design is what makes them cheap later.

---

## 5. Requirements on the other five areas

### (1) Spec format and operations
1. Reserve top-level keys: `siteId`, `business` (or a reference to `business.json`), `capabilities`, `automations`, `permissions` (must be empty in v1), `integrations`, `extensions` (only `x-` keys).
2. `siteId` is an opaque ULID, never derived from a name or slug; hostnames map to it.
3. The validator rejects: any secret-looking value, any submission or visitor data, `pattern` checks not from the named-format list, `onSuccess.navigate` that is not a route id, any `$cel` expression (reserved), blocks whose `requires` capability is not enabled, route paths beginning with `_`.
4. Keep json-render's `on`, `visible`, `ActionBinding` and `VisibilityCondition` shapes unchanged; extensions (`$ctx`, `in`, `contains`, `exists`) are additive and versioned.
5. Operations: add `enableCapability(id, use)`, `disableCapability(id)`, `setCapabilityInstance(id, instanceId, value)`, `setBusinessFact(path, Sourced)`, `confirmBusinessFacts(paths)`. They are ordinary JSON patches like the other operations.
6. Content slots for form labels live in the content pack like any other slot.
7. Every key above is covered by `specVersion` migrations; capability configs migrate by their own major.

### (2) Blocks, themes and rendering
1. Block manifest gains `requires`, `binds` and `render: static | island | sandboxed-island`; registry entries carry the fields in section 3.5, including a mandatory `fallback`.
2. No `dangerouslySetInnerHTML`, no raw URLs without `safeUrl()`, no literal styles from data; a lint rule enforces each.
3. Hard facts (price, hours, phone, address, email, URL) render from `business` bindings, never from text slots.
4. A JSON-LD emitter from the business model per section 3.4, with script-safe escaping, and only confirmed facts.
5. Form blocks render real `<form method="post">` elements that work without JavaScript; the island enhances.
6. Embed blocks are typed per provider and lazy-load behind a facade; each contributes its origin to the CSP.
7. The renderer must handle a revoked block by substituting its fallback without failing the page.
8. The renderer never loads code from the network at runtime except registry artifacts by hash.

### (3) Decision and text pipeline
1. The question builder accepts questions contributed by capability packages (`DecisionQuestion[]`) and calls `applyAnswers`; literal values (owner email, prices) never come from the model.
2. The text writer receives business facts as delimited data, has no tools, and must not output phone numbers, URLs, emails, prices or times. A post-check removes any that are not present in the business model.
3. The extraction model (ingestion) uses structured output against the `BusinessProfile` schema with an evidence quote per value; values without verifiable evidence are dropped.
4. Spend controls: per-account daily cap, global circuit breaker that falls back to defaults-only generation.
5. Prompts never contain secrets or submission data.

### (4) Repo, runtime, storage and hosting
1. Domains (D1): builder app, sites domain, sandbox domain, user-content domain, each a separate registrable domain; submit the sites and sandbox domains to the Public Suffix List as soon as the domains exist.
2. Reserve `/_x/*` and `/.well-known/*` on every published host, including custom domains.
3. Provide `SiteStore` (one SQLite Durable Object per site) behind `SiteData`, with the per-capability migration runner and an `audit` table; the platform D1 holds accounts, sites and hostnames.
4. Provide `safeFetch`, `HumanCheck`, `EmailSender`, the rate-limit binding, and envelope encryption for per-site secrets.
5. Published pages: strict CSP without inline scripts, HSTS, `nosniff`, `Referrer-Policy`; uploads only from the user-content domain.
6. Self-hosted parity: the same code on `workerd` (Durable Objects on `localDisk`) or a Node adapter with one SQLite file per site; adapters for SMTP email and ALTCHA.
7. pnpm settings from the first commit: `minimumReleaseAge`, `trustPolicy`, `blockExoticSubdeps`, allowlisted builds.
8. Two identity realms (D6): platform sessions on the app domain only; nothing on the sites domain reads platform cookies.

### (5) Editor client and The Wall
1. Never execute embed, custom or draft-block code in the editor's origin; render them as cross-origin iframe islands even in preview.
2. The confirmation screen for business facts: grouped, with source badges ("from your website", "you typed this", "suggested by Google"), per-field edit, one confirm; publish is blocked while hard facts are `suggested`.
3. A submissions inbox, CSV export, delete, retention setting and a "forward only" switch.
4. Show capability enablement as a user-level choice ("Add a booking request form") that maps to the spec operations in (1).5.
5. The Wall: forms and business facts are shared across all variants (one `capabilities` and one `business` per brief); variants differ only in presentation.

---

## 6. Reserved-now table

| # | Item (exists in v1, even if empty) | Kind | Owner |
|---|---|---|---|
| 1 | `siteId` (opaque ULID) in the spec and as the tenancy key everywhere | Field | (1) spec |
| 2 | `capabilities: Record<id, { v, config, instances }>` | Key | (1) spec |
| 3 | `automations: Automation[]` (trigger → steps) | Key | (1) spec |
| 4 | `permissions: []` (must be empty in v1) | Key | (1) spec |
| 5 | `integrations: []` (typed analytics and embed providers) | Key | (1) spec |
| 6 | `extensions` with `x-` keys only | Key | (1) spec |
| 7 | `business` or `business.json` with `Sourced<T>` on every fact | Document | (1) spec + (6) this area |
| 8 | Condition grammar extensions `$ctx`, `in`, `contains`, `exists`; `$cel` reserved and rejected | Grammar | (1) spec |
| 9 | Validator rules: no secrets, no PII, no raw regex, internal `navigate` only, no `_` routes | Rule | (1) spec |
| 10 | Operations `enableCapability`, `disableCapability`, `setCapabilityInstance`, `setBusinessFact`, `confirmBusinessFacts` | Interface | (1) spec |
| 11 | Block manifest `requires`, `binds`, `render` | Fields | (2) blocks |
| 12 | Registry entry: `version`, `hash`, `status`, `trust`, `fallback`, `provenance`, `licence`, `budgets`, `signature` | Fields | (2) blocks |
| 13 | Renderer: fallback substitution for revoked blocks | Behavior | (2) blocks |
| 14 | JSON-LD emitter from the business model, confirmed facts only | Module | (2) blocks |
| 15 | `safeUrl()` and the no-`dangerouslySetInnerHTML` lint rule | Module + lint | (2) blocks |
| 16 | Capability-contributed `DecisionQuestion[]` and `applyAnswers` | Interface | (3) decision |
| 17 | Text-writer post-check for contact details and amounts | Module | (3) decision |
| 18 | Four separate registrable domains; Public Suffix List submission | Boundary | (4) platform |
| 19 | `/_x/*` and `/.well-known/*` reserved on every host | Boundary | (4) platform |
| 20 | `POST /_x/a/{capability}.{action}` endpoint shape | Interface | (4) platform + (6) |
| 21 | `SiteStore` Durable Object per site behind `SiteData`; `_meta` and `audit` tables; migration runner | Interface + storage | (4) platform |
| 22 | Platform D1 with accounts, sites, hostnames | Storage | (4) platform |
| 23 | Separate identity realms (platform users vs site members) | Boundary | (4) platform |
| 24 | `safeFetch`, `HumanCheck`, `EmailSender`, per-site envelope encryption | Interfaces | (4) platform |
| 25 | CSP and security headers on published sites | Policy | (4) platform |
| 26 | pnpm supply-chain settings | Config | (4) platform |
| 27 | Sandboxed iframe island host on the sandbox domain, with a typed `postMessage` bridge (resize, props in, events out) | Boundary | (4) platform + (5) editor |
| 28 | Editor never runs untrusted code in its origin | Rule | (5) editor |
| 29 | Business-fact confirmation screen; publish gate on `suggested` hard facts | UI | (5) editor |
| 30 | Submissions inbox, export, delete, retention | UI | (5) editor |
| 31 | `CapabilityDefinition` contract and the forms capability package | Package | (6) this area |
| 32 | `FormDef` schema and `compileFormSchema()` shared by browser and server | Package | (6) this area |
| 33 | Ingestion pipeline module (`fetch → extract → verify → confirm`) | Package | (6) this area |
| 34 | Capability `export` hook | Interface | (6) this area + (4) export |

---

## 7. Questions for the founder

**Q1. Google data in "a business from one link".** Google's terms forbid copying and saving business names, addresses and reviews from Maps, and allow caching only `place_id` (section 2.6).
- *Path A (conservative):* Google is used only to find the business and show suggestions; the owner types or edits each fact; reviews are owner-provided testimonials. Cost: $0 to a few dollars a month in API calls; the demo is less magical (no instant real reviews).
- *Path B (live Google content):* additionally show Google rating and reviews live, through Google's own Places UI Kit components with attribution, never stored. Cost: Places UI Kit Pro is $5 per 1,000 loads after 5,000 free a month [V](https://developers.google.com/maps/billing-and-pricing/pricing), paid on every page view of every site that uses it (by the founder's key on the hosted copy, or each self-hoster's key); plus the legal review of whether Path A's "owner confirms" step is enough.

**Q2. Scraping providers (Instagram, Maps) for the demo.**
- *Path A:* none. Only official APIs, the business's own website and uploads. Cost: weaker demo for businesses that have no website.
- *Path B:* a scraping provider for suggestions only, never stored without owner confirmation. Cost: about $0.003 to $0.004 per lookup [V Apify], and legal risk that this report cannot size (Google's terms prohibit scraping; Meta v. Bright Data is a district-court ruling on Meta's terms only).

**Q3. Custom code in v1.**
- *Path A:* typed embeds and analytics only. Cost: some users cannot add their exotic widget.
- *Path B:* also a raw HTML/JS block, always in a sandboxed cross-origin iframe. Cost: about a week more for the island and its resize bridge [P], and a new abuse surface (phishing kits in iframes) on the hosted copy.

**Q4. The published-sites domain.** The Public Suffix List entry and every free site's URL depend on it, and naming is undecided. *Path A:* buy a neutral throwaway domain for sites now and accept a later migration of free sites' URLs. *Path B:* wait for the real name. Cost of B: the PSL submission and the cookie isolation it gives are delayed.

**Q5. Holding visitors' data on the hosted copy.** Storing form submissions makes the founder's service a processor of personal data for every site owner. *Path A:* store (inbox, export) with a privacy policy, retention defaults and a data processing agreement template. *Path B:* forward-only on the hosted copy (email and webhook, store nothing but a delivery log); storage only for self-hosters. Cost of A: legal paperwork and support for deletion requests; cost of B: owners lose submissions if email fails.

**Q6. A legal entity.** Instagram Advanced Access needs Meta Business Verification [V], and Google Business Profile API access needs an approved application [V]. Both are later items, but the founder should know they likely require a registered business.

---

## 8. Risks

1. **The headline demo depends on data Google forbids storing** (section 2.6). If Path A of Q1 is chosen, "paste a Maps link, get real reviews" becomes "paste your website or Maps link, confirm your facts". This is the largest risk to the plan as written in report 06 [P].
2. **Abuse can take down every site at once.** One phishing page can get the shared sites domain flagged by browsers or reported to Cloudflare. A solo founder has no abuse team. Controls in 2.8 reduce, not remove, this; the Public Suffix List entry limits cookie damage, not reputation damage [P].
3. **Email Sending is beta and quota-limited for new accounts** [V]. If notifications fail silently, owners lose leads. Mitigation: the inbox is the source of truth, and a banner shows failed deliveries.
4. **Turnstile on custom domains** does not scale on the free plan [V]; ALTCHA is weaker against determined bots [P].
5. **The capability contract may be wrong in ways only the second capability reveals.** Mitigation: before freezing it, sketch the CMS-collections capability on paper against the contract (one day of work) [P].
6. **Durable Object per site makes cross-site analytics and support queries harder.** Mitigation: an explicit event stream to the platform database [P].
7. **json-render is 0.x with one main maintainer** (report 03); its condition and action shapes, which this report adopts, could change. Mitigation: we own the spec types; json-render shapes are copied into our schema, not imported as the source of truth [P].
8. **Self-hosted `workerd` is not a hardened sandbox** [V]; self-hosters who enable draft foundry blocks without a VM are at risk. Mitigation: self-hosted builds refuse draft and private foundry blocks by default.

---

## 9. Not verified

- Facebook Pages API access rules and app-review requirements: not re-read this session.
- Whether Cloudflare Workers' outbound `fetch` can reach any private or internal address: I found no statement in the Workers fetch docs; treat SSRF controls as required on every runtime.
- Public Suffix List review time: reported, not measured.
- Meta v. Bright Data: from secondary sources (Goldman's blog, TechCrunch, Quinn Emanuel); I did not read the opinion.
- WordPress plugin architecture and Airtable custom elements: described from docs I did not re-read this session.
- Whether the Places UI Kit components satisfy the "no storage" rule when rendered on a third party's site, and their exact attribution rules: not read.
- Whether React escapes or blocks `javascript:` URLs in the current version: not checked; the design does not rely on it.
- `node:sqlite` stability for a Node adapter: not checked.
- All speed and cost figures marked [P] are estimates; nothing was run or measured, and no paid API was called.
