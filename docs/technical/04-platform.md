# 04: Platform: repository, runtime, storage, hosting and developer workflow

Date: 14 November 2026. Area 4 of 6. Builds on `docs/research/03-libraries-and-stack.md` sections 7 and 8, which it does not repeat.

**Evidence labels**

- **[V] verified:** I read the primary source (official docs, source code, npm registry metadata) on 13–14 Nov 2026. The URL follows.
- **[M] measured:** I ran it myself in a throwaway spike (`scratchpad/tech-4/spike`, a minimal TanStack Start app, built and run locally on an Apple-silicon laptop). Numbers are from one machine and one run.
- **[R] reported:** a secondary source, a vendor claim, or my memory of a doc I did not re-read today.
- **[P] proposal or estimate:** my design or arithmetic.

**What the spike showed, in one paragraph [M].** A TanStack Start 1.169.5 app with the Cloudflare Vite plugin builds in about 3.5 s into `dist/server` (a Worker plus a generated `wrangler.json`) and `dist/client`. The client JavaScript for a hello-world page is **111.6 KB gzip** (React plus router plus Start runtime). The same unmodified server build runs in the standalone `workerd` binary (`workerd serve <wrangler.jsonc>`, version 2026-11-13) and serves SSR HTML. Under `wrangler dev -c dist/server/wrangler.json --persist-to <dir>` it ran with a D1 database and an R2 bucket stored as files in that folder, **kept the data across a restart**, and served about **317 requests per second** (10 concurrent clients, each request doing SSR, three D1 queries and an R2 put and get). Miniflare's own JavaScript API, by contrast, rejected the documented options: Wrangler 4.162 now depends on `miniflare@5.20261113.0-beta`, whose constructor takes a different shape than its README describes. TypeScript 7.0.2 type-checked the app in 0.13 s.

---

## 1. Decisions table

| # | Decision | Recommendation | Door | Confidence |
|---|---|---|---|---|
| P1 | Self-hosting strategy | **One runtime everywhere: the Cloudflare Workers runtime.** Hosted runs on Cloudflare; self-hosted runs the *same build* on `workerd` inside a Docker image (driven by `wrangler dev --local --persist-to /data` today; raw `workerd serve` later). **No Node port.** Code may use only bindings that also run locally (D1, R2, KV, Durable Objects, Queues, Workflows, rate limit, Cache). Remote-only services are optional capabilities | **One-way** (it shapes every server file) | Medium-high |
| P2 | Where data lives | **D1** (SQLite, through Drizzle) for small relational rows: accounts, projects, ops since last snapshot, sites, deploys, hostnames, generation index. **R2** for everything large or immutable: spec snapshots (content-addressed), generation payloads, published files, uploads. **KV** only for the hostname → deploy pointer read at the edge | **One-way** | High |
| P3 | Spec history shape | **Immutable snapshots in R2 + an op log in D1 that is pruned behind each snapshot.** A project's head is `(version, snapshotKey)`. Optimistic concurrency on `baseVersion`. A Durable Object per project only when live multi-user editing arrives | **One-way** (the shape); two-way (D1 vs DO for the log) | High |
| P4 | Publishing | **Render once at publish time to immutable static files** in R2 under `sites/{siteId}/{deployId}/`, served by **one small `sites` Worker** keyed by hostname. Zero JavaScript by default. Each deploy pins `libraryVersion`. No per-site build, no render-per-request | **One-way** | High |
| P5 | Domains and isolation | Separate registrable domains: the **app domain** and a **sites domain** (published sites and, at first, the preview), listed on the Public Suffix List. Add the sandbox and user-content domains that area 6 asks for when the foundry or uploads arrive. App cookies never reach those domains | **One-way** | High |
| P6 | Preview isolation | Preview in a **cross-origin iframe** on the sites domain, talking to the editor **only by `postMessage`**, with a strict CSP (`connect-src 'none'`). M0 may render in-page, but area 5 must already use the message protocol | **One-way** (protocol) | High |
| P7 | Accounts | **Anonymous first.** Better Auth 1.7 with the anonymous plugin, GitHub and Google OAuth, sessions in D1, cookie cache on. A visitor generates without signing in; signing in claims their projects. M0 has no auth | Two-way (library), **one-way** (anonymous-owned rows) | Medium-high |
| P8 | Repository shape | pnpm workspace: `apps/web`, later `apps/sites`; `packages/spec`, `blocks`, `render`, `pipeline`; `tools/eval`. Internal packages ship **TypeScript source with no build step**, scope **`@repo/*`** (never published, never renamed). No CLI package yet | One-way-ish (boundaries); two-way (names) | High |
| P9 | Build and tooling | Vite 8.3 (required by Start), TypeScript 7.0 for type-checking, **Biome 2.6** for lint and format, plain `pnpm -r` scripts (no Turborepo or Nx yet), no tsdown or changesets until something is published | Two-way | High |
| P10 | Database access | **Drizzle ORM 0.45 (sqlite dialect)** with SQL migration files applied by `wrangler d1 migrations apply` (locally and remotely). No Kysely, no Postgres | Two-way | High |
| P11 | Background work | **None in M0.** M1 uses `ctx.waitUntil` behind a one-function `enqueue()`. Cloudflare Queues when the first job outlives 30 s (publish checks); Workflows for link ingestion and the foundry. Real-browser checks run **in CI with Playwright** over blocks × variants × themes, and only optionally per publish with Browser Run | Two-way | High |
| P12 | Testing and CI | Vitest **4.1.x** (pinned: the Workers pool does not support Vitest 5 yet), `@cloudflare/vitest-pool-workers` for server code, Playwright 1.65 against the built app on local `workerd`, GitHub Actions for checks, **Workers Builds** for deploys and per-PR Previews | Two-way | High |
| P13 | Observability | Structured JSON `console.log` everywhere (Workers Logs and Traces on Cloudflare, stdout when self-hosted); Sentry optional via `SENTRY_DSN`; product metrics come from generation records, not logs | Two-way | High |
| P14 | Cost guard | Workers Paid ($5/month) from the first public deploy; a Workers **spending limit**; area 3's spend governor DO; the measured infra cost is small next to model cost | Two-way | High |

---

## 2. Detail per decision

### 2.1 P1: one runtime everywhere (one-way door)

The founder wants one web app, hosted by him on Cloudflare and self-hostable by anyone with their own model keys. The expensive question is what "self-hostable" runs on.

**Options considered**

| Option | What it means | Cost now | Cost forever |
|---|---|---|---|
| A. Node port | Build a second target with Nitro's node preset (`nitro/vite`); every binding (`env.DB`, `env.BLOBS`, DOs, Queues, rate limit) goes behind an interface with a Node implementation | High: interfaces for 8–10 seams; Durable Objects have no Node equivalent; two Vite configs (Cloudflare's guide says to *remove* `nitro()` when adding the Cloudflare plugin [V](https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/)) | Two test matrices; behaviour drifts (Node has no 6-connection or 128 MB isolate limits, so bugs hide); Nitro's Vite plugin is "still under active development" [V](https://tanstack.com/start/latest/docs/framework/react/guide/hosting); `nitro` is `3.0.261103-rc` [V npm] |
| B. Cloudflare runtime in a container | Ship the exact `dist/` that Cloudflare runs, plus Wrangler, in a Docker image; `wrangler dev --local --persist-to /data` serves it with D1, R2, KV, DO, Queues, Workflows, rate limits, assets and cache emulated on disk | Low: one Dockerfile, one smoke test | Wrangler/Miniflare are positioned as development tools; upgrades can change behaviour |
| C. Raw `workerd` | `workerd serve` with our own config; DOs on `localDisk`; bundled KV, Queues, cron and Workflows Workers (all `--experimental`); shim Workers for D1 and R2 | Medium: D1, R2 and static assets are not built in | Least moving parts at runtime; clusterable |

**Facts that decide it**

- `workerd` is Apache-2.0 and its README lists "self-host applications designed for Cloudflare Workers" as a use [V](https://github.com/cloudflare/workerd). It warns that it "is not a hardened sandbox" for untrusted code [V same], which does not matter here because we run only our own code.
- Since 5–13 Nov 2026 `workerd` gained, in standalone mode and in a new cluster mode: `workerd deploy`, built-in KV namespaces, cron triggers, Queues and Workflows, all experimental [V commits on `src/workerd/server/cli/wrangler.rs`](https://github.com/cloudflare/workerd/commits/main/src/workerd/server/cli/wrangler.rs). `workerd serve wrangler.jsonc` accepts `name, main, compatibility_date, compatibility_flags, vars, durable_objects, exports, migrations, kv_namespaces, triggers, queues, workflows, no_bundle`; **any other field is an error**, so D1, R2 and `assets` are not supported there [V source header of `wrangler.rs`]. Durable Objects are stored as SQLite files under `.wrangler/state/workerd/` [V same]. The cluster mode distributes DOs across instances using an S3-compatible bucket for leases [V `workerd.capnp` `ClusterConfig`](https://github.com/cloudflare/workerd/blob/main/src/workerd/server/workerd.capnp).
- Miniflare (MIT) already implements D1, R2, KV, Queues, Workflows, rate limits, assets, cache, images and browser rendering as Workers that run inside `workerd`; its plugin folder lists all of them [V installed `miniflare@5.20261113.0-beta`]. Wrangler 4.162.0 depends on that beta [V `npm view wrangler@4.162.0 dependencies`].
- [M] The unmodified TanStack Start build ran under `workerd serve` (SSR only, assets not served) and fully under `wrangler dev` with D1 and R2 persisted to a folder, surviving a restart, at about 317 req/s.
- [M] Miniflare 5's constructor rejected the README's documented options (`workers[0].config` is now required). So the self-host image must drive the **Wrangler CLI**, a stable surface, not Miniflare's JS API.
- `wrangler dev` has the flags a server needs: `--ip`, `--port`, `--local` (remote bindings off), `--persist-to`, `--env-file`, `--var` [V `wrangler dev --help`, 4.162.0]. `wrangler d1 migrations apply --local --persist-to` applies migrations to the same folder [V].

**Recommendation: B now, C as the hardening path [P].** Self-hosters run one container; the founder maintains one codebase and one test matrix. When `workerd`'s standalone KV/Queues/Workflows lose the experimental flag, swap the container's entrypoint to `workerd serve` with a generated config and two small shim Workers (D1 over a SQLite Durable Object, R2 over a disk directory, both adaptable from Miniflare's MIT sources). App code does not change between B and C.

**Rules that keep the door from closing on a Node port later [P]:**

1. Only `apps/*/src/server/env.ts` imports `cloudflare:workers`. Everything else receives typed dependencies. TanStack's docs say to read env per request, and that `cloudflare:workers` `env` is the canonical way on Workers [V](https://tanstack.com/start/latest/docs/framework/react/guide/environment-variables).
2. Packages (`spec`, `blocks`, `render`, `pipeline`) import neither `cloudflare:*` nor `node:*`. Area 3 asks for the same [V `docs/technical/03-generation-pipeline.md` §5].
3. All SQL goes through Drizzle's sqlite dialect, so a Node port would swap the driver, not the queries.
4. Storage calls live in named functions (`putSnapshot`, `getDeployFile`), not scattered `env.X.put` calls. That is code organisation, not an abstraction layer.
5. Remote-only services (Browser Run in production, Images transformations, Vectorize, Workers AI, Turnstile, Cloudflare for SaaS) are **optional capabilities**: the code checks `if (env.BROWSER)` and degrades. Do not use Vectorize at all: a library of a few hundred blocks fits an in-memory cosine scan.

**What hurts [P].** Self-hosters run a runtime Cloudflare labels a development tool. Mitigations: pin Wrangler exactly; a CI job that builds the image, applies migrations, and runs the Playwright smoke test against it; document backups as "stop the container, copy `/data`" (D1 and DOs are SQLite files). Area 3 asked for a Node target with `Deps` implementations; under this decision the pure `pipeline` package still runs in Node for the eval CLI and tests, but the *server* never needs a Node build.

### 2.2 P2: where data lives (one-way door)

**Options:** D1 for everything; a Durable Object per project (SQLite inside the object); Postgres through Hyperdrive.

**Facts.** D1: 10 GB per database, a hard cap; databases are single-threaded, "if your average query takes 1 ms, you can run at most 1,000 queries per second"; 2 MB per row; 100 bound parameters per query; 30-day Time Travel on Paid [V](https://developers.cloudflare.com/d1/platform/limits/). Each D1 database is backed by one Durable Object [V same]. SQLite-backed DOs: 10 GB per object, unlimited objects, a soft limit of 1,000 requests per second per object [V](https://developers.cloudflare.com/durable-objects/platform/limits/). Pricing for D1 and DO SQLite rows is identical (25 B reads and 50 M writes included, then $0.001 and $1.00 per million); storage differs: D1 $0.75/GB-month after 5 GB, DO SQLite $0.20/GB-month after 5 GB [V](https://developers.cloudflare.com/workers/platform/pricing/). R2 Standard: $0.015/GB-month, Class A $4.50/M, Class B $0.36/M, free egress, 10 GB and 1 M/10 M operations free each month [V](https://developers.cloudflare.com/r2/pricing/).

**The size arithmetic that rules out "specs in D1" [P].** A spec is roughly 20–50 KB of JSON. At 1 M generated sites a month, specs alone would fill a 10 GB D1 database in under a month. Op logs at 20–30 ops × 300 B per site do the same in about a month. So D1 must hold only small rows and pointers.

**Recommendation [P]:**

| Data | Store | Why |
|---|---|---|
| Users, sessions, OAuth accounts | D1 (Better Auth tables, generated into the Drizzle schema) | Relational, small, Better Auth supports it |
| Projects (owner, title, head version, head snapshot key, expiry) | D1 | Listing "my projects" is a query |
| Ops since the last snapshot | D1, pruned when a snapshot is written | Bounded size: at most ~50 rows per active project |
| Spec snapshots | R2 `private/specs/{projectId}/{sha256}.json` | Immutable, content-addressed, cheap |
| Generation records | Index row in D1 (ids, timings, cost, hashes), payload in R2 `private/gen/{yyyy-mm}/{genId}.json` | Area 3's `RecordSink`; prune index after 90 days |
| Sites, deploys, hostnames | D1 | Small, relational, needed for routing and rollback |
| Published files and uploads | R2 `sites` bucket | Public content in its own bucket, so the `sites` Worker binds only that |
| Hostname → current deploy | KV `HOSTS` | Read on every page view at the edge |
| Spend counter | Durable Object (area 3's governor) | Needs a strict global count; the rate-limit binding is per location and approximate [V](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/) |
| Per-site form and app data (later) | One SQLite DO per site, area 6's `SiteStore` | Unlimited objects, 10 GB each, isolation per site |

**Postgres is rejected** for now [P]: it adds a paid external vendor to the hosted copy and a second database to the self-host image, for no feature we need.

**IDs [P].** Entity ids are text, a type prefix plus a time-ordered random part (UUIDv7 encoded base32, e.g. `prj_01jc…`). They appear in URLs and R2 keys, so this is one-way. Spec-internal ids (block instance ids) are area 1's. Timestamps are integer milliseconds.

**Scale steps, in order, when needed [P]:** move the generation index to its own D1 database (one more binding); expire unclaimed anonymous projects after 30 days (founder question 6); move the op log into a DO per project. Each is a migration job, not a rewrite.

### 2.3 P3: spec history shape (one-way door for the shape)

**Options:** save the whole spec on every change; event log only; snapshots plus a pruned op log; CRDT document (Yjs or Automerge).

**Recommendation [P]: snapshots plus a pruned op log.** It matches area 1's "every change is an operation" and area 3's `applyOp`, and it supports undo, history and later collaboration without a CRDT.

- **While editing**, the authoritative working copy is in the browser. The editor applies ops instantly and sends them in debounced batches (about 1 s) to `POST /api/projects/:id/ops` with `baseVersion`.
- The server checks `baseVersion == head.version`, writes the ops and the new head in one `DB.batch()` (D1 batches are transactional [R]), and returns the new version. On a mismatch it returns `409` with the ops the client missed; a second tab reloads. Live merging is out of scope until collaboration.
- A **snapshot** is written to R2 every 50 ops, on publish, and on an explicit "save version". Then ops older than the snapshot are deleted. Named versions are just snapshot rows.
- **Wall candidates are never persisted.** They live in the browser until the user keeps one; only then does a project exist.
- **When published**, a deploy row pins the snapshot key, `specVersion`, `libraryVersion` and renderer version.

**Durable Object per project: deferred, and how to switch [P].** When live multi-user editing is wanted, a `ProjectRoom` DO (SQLite op log, WebSocket hibernation so idle sockets cost nothing [V](https://developers.cloudflare.com/durable-objects/platform/pricing/)) takes over the op log. The snapshot format and the HTTP API stay. This is why the op-log endpoint is the only write path for specs.

### 2.4 P4: publishing (one-way door)

**Options**

| Option | Per view cost | Library fix reaches old sites | Self-host | Risk |
|---|---|---|---|---|
| Render per request from the spec (one renderer Worker, research 03's first idea) | CPU per uncached view; startup cost grows with the block library (Worker startup limit is 1 s [V](https://developers.cloudflare.com/workers/platform/limits/)) | Automatically, which also means silently | Same | A block regression breaks every live site at once |
| **Render once at publish to static files in R2** | One small Worker request; no rendering | Only on re-publish or a deliberate batch re-render | A folder of files | Re-render job needed when a library fix must go out |
| A build per site (Vite or Start per tenant) | Static | Re-build | Heavy | Minutes, not seconds; per-site Worker scripts; TanStack Start's client runtime is 111.6 KB gzip [M] |
| Workers static assets per site | Free | — | — | Assets are per Worker version (100,000 files per version [V limits]); not built for per-tenant uploads |

**Recommendation: render once at publish [P].**

1. Publishing calls `render.renderStatic(spec, library)` (area 2) in the app Worker. It returns files: `index.html` per route, one CSS file, island scripts if any, `manifest.json`.
2. Files go to R2 `sites/{siteId}/{deployId}/…`, immutable, with long cache headers on hashed assets.
3. The deploy row is written; KV `host:{hostname}` is set to `{siteId, deployId}`. KV writes are visible at once where they were written and reach other locations within about 60 s [R], and the minimum `cacheTtl` is 30 s [V](https://developers.cloudflare.com/kv/platform/limits/). The publisher sees the new version immediately; visitors elsewhere within a minute. Rollback re-points KV.
4. The **`sites` Worker** (plain TypeScript, no React, no TanStack) maps hostname → deploy, streams the file from R2, sets CSP and cache headers, and caches in the Cache API.

**Published pages must be as light as possible.** The spike's hello-world TanStack Start page ships 111.6 KB gzip of JavaScript [M]. Published pages ship **none by default**. Interactivity comes from HTML (`<details>`, `<dialog>`, the Popover API, CSS scroll-snap) and, where unavoidable, small per-block island scripts (area 2).

**CSS without Tailwind at runtime [P].** Blocks are fixed code, so every class they use is known at library build time. The blocks package builds per-block CSS once; a site's CSS is the concatenation of the blocks it uses plus its theme as CSS custom properties. No Tailwind compiler runs in a Worker. That also keeps Lightning CSS's native code out of the Worker bundle.

**Subdomains and custom domains.**

- Subdomains: `{slug}.{sites-domain}`. A wildcard DNS record and a Worker route `*.{sites-domain}/*`; routes support a leading hostname wildcard [V](https://developers.cloudflare.com/workers/configuration/routing/routes/). Universal SSL covers one level of wildcard [R].
- Custom domains (later): **Cloudflare for SaaS** on the sites zone. 100 hostnames included, then $0.10 each per month, up to 50,000 on Free/Pro/Business; wildcard custom hostnames and apex proxying are Enterprise-only [V](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/plans/) (page dated 14 Aug 2026). Cloudflare's documented pattern: a `*/*` route on the SaaS zone to one Worker, a dummy fallback origin record, and hostname lookups in KV [V](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/configuration/hostname-routing/). Apex domains need the customer's DNS to support CNAME flattening.
- **Self-hosted:** the same `sites` Worker runs in the container. If the self-hoster has a second hostname with wildcard DNS (Caddy's on-demand TLS works well [R]), sites get subdomains; otherwise path mode `/_s/{slug}/`, with a warning that path mode shares the app's origin. "Download as folder" exports `sites/{siteId}/{deployId}/` as a zip.

### 2.5 P5: domains and isolation (one-way door)

- **App domain** (the brand, undecided): editor, API, auth cookies. Cookies use the `__Host-` prefix, `Secure`, `HttpOnly`, `SameSite=Lax`.
- **Sites domain**, a different registrable domain: published sites and, until the foundry, the preview. Submit it to the **Public Suffix List** so one site cannot set cookies for others. The PSL asks for at least two years of registration and a `_psl` TXT record kept in place, and changes take time to reach browsers [V](https://github.com/publicsuffix/list/wiki/Guidelines).
- Area 6 asks for four domains in the end state: app, sites, sandbox (untrusted code), user content (uploads) [V `06-room-for-later.md` §5]. I agree with that end state; M1 needs only the first two [P].
- **Abuse isolation [P].** Free hosting of generated sites attracts phishing pages. Put the sites zone, and ideally the whole user-content side, in a separate Cloudflare account from the app, so an abuse action against user content cannot take the app down. Founder question 4.
- **Published page headers [P]:** `Content-Security-Policy: default-src 'self'; img-src 'self' https: data:; style-src 'self'; script-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'`, plus HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`. Reserve `/_x/*` and `/.well-known/*` on every published host (area 6).

### 2.6 P6: preview isolation (one-way door for the protocol)

**Options:** render in the editor's own DOM; same-origin iframe (research 03's suggestion, easy overlays); cross-origin iframe; opaque-origin iframe (`sandbox` without `allow-same-origin`).

**Recommendation [P]:** a cross-origin iframe served from `preview.{sites-domain}`, `sandbox="allow-scripts allow-same-origin"` (safe because its origin differs from the app's), and a CSP on the preview document of `default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src https: data: blob:; font-src 'self'; connect-src 'none'; frame-ancestors {app origin}`. With `connect-src 'none'`, even a successful injection cannot send anything anywhere.

- The preview receives specs and patches **only** through `postMessage`, checks `event.origin` against the app origin, and reports hover, selection and measurements back the same way. It has no URL parameters that load content.
- Today the risk is small, since blocks are our code and text is escaped by React. It grows with the foundry (agent-written blocks), embeds and custom code, and retrofitting a message protocol into an editor built on direct DOM access is a rewrite. So the protocol is required from the first editor code, even in M0 where the preview may be in-page.
- When foundry blocks arrive, move draft and foundry blocks to per-project subdomains on the sandbox domain.

### 2.7 P7: accounts (two-way for the library, one-way for anonymous rows)

**Does the public copy need accounts on day one?** No [P]. The product's promise is a site one second after Enter; a sign-in wall before that defeats the demo. But every generation costs money, so anonymous use needs guards.

**Library.** Better Auth: MIT, 30.7k stars, pushed 13 Nov 2026, latest 1.7.23, 1.8 in beta [V `gh api`, `npm view`]. Its anonymous plugin creates a user without PII; when that user signs in with another method, `onLinkAccount({ anonymousUser, newUser })` runs and the anonymous user is deleted by default [V](https://better-auth.com/docs/plugins/anonymous). It has a TanStack Start integration with a `tanstackStartCookies` plugin [V](https://better-auth.com/docs/integrations/tanstack) and a Drizzle adapter with `provider: "sqlite"` [V](https://better-auth.com/docs/adapters/drizzle); D1 is reached through Drizzle's D1 driver [R]. Alternatives considered: Clerk and WorkOS are hosted services (no self-host); Lucia is retired as a library [R]; rolling our own is risky.

**Flow [P]:**

1. First visit: nothing. On the first generation, a Turnstile check (free, unlimited challenges, 20 widgets, 10 hostnames each [V](https://developers.cloudflare.com/turnstile/plans/)) then `signIn.anonymous()`, which sets a session cookie.
2. Generation is rate-limited per session and per IP (rate-limit binding, 10 s or 60 s windows, per location [V](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)) and counted by area 3's spend governor.
3. Projects are owned by `userId` whether anonymous or not. Anonymous projects expire after N days unless claimed.
4. Signing in with GitHub or Google calls `onLinkAccount`, which runs `UPDATE projects SET owner_id = :new WHERE owner_id = :anon` (and the same for sites).
5. Session cookie cache on, so most requests do not read D1. No passwords on the hosted copy, which avoids password-hashing CPU and email sending.

**Self-hosted:** `AUTH_MODE=none` (single user; put it behind your own proxy or Tailscale) or `oauth` with the self-hoster's own OAuth app. Founder question 3 covers whether the public copy instead requires sign-in.

### 2.8 P8: repository shape

**Directory tree (M0 creates the starred entries; the rest arrive with their milestone) [P]:**

```
builder/                                   repo root (name is a placeholder)
├── AGENTS.md *                            rules for coding agents; CLAUDE.md imports it with "@AGENTS.md"
├── CLAUDE.md *                            exists today
├── README.md *
├── LICENSE, NOTICE                        when Apache-2.0 is confirmed
├── THIRD_PARTY_NOTICES.md                 generated by tools/scripts/notices.ts
├── package.json *                         private root: scripts only
├── pnpm-workspace.yaml *                  workspace, catalog, supply-chain settings
├── biome.json *
├── tsconfig.base.json *
├── .node-version *                        26 (Active LTS "Lithium")
├── .github/workflows/ci.yml               M1
├── docs/
│   ├── research/ *  technical/ *
│   └── decisions/                         short ADRs: NNNN-title.md
├── apps/
│   ├── web/ *                             TanStack Start → Worker "seconds" on the app domain
│   │   ├── AGENTS.md *
│   │   ├── vite.config.ts *  wrangler.jsonc *  .dev.vars.example *
│   │   ├── migrations/                    D1 SQL files (M1)
│   │   ├── e2e/                           Playwright (M1)
│   │   └── src/
│   │       ├── routes/ *                  __root.tsx, index.tsx (brief box + timer), api/generate.ts
│   │       ├── server/ *                  *.server.ts only; env.ts is the ONLY importer of cloudflare:workers
│   │       │   ├── env.ts *  deps.ts *    builds area 3's Deps from bindings
│   │       │   ├── db/ (M1)  auth.ts (M1)  storage.ts (M1)  guard.ts (M1)
│   │       └── client/ *
│   └── sites/                             M1.5: plain Worker "builder-sites" on the sites domain
│       ├── AGENTS.md  wrangler.jsonc
│       └── src/index.ts                   hostname → deploy → R2 → response; serves preview runtime assets
├── packages/
│   ├── spec/ *      @repo/spec            types, Zod schemas, applyOp, specHash, migrations (area 1)
│   ├── blocks/ *    @repo/blocks          ./manifest (data only), ./components (React), ./css (area 2)
│   ├── render/ *    @repo/render          spec → React tree; renderStatic(spec) → files (area 2)
│   └── pipeline/ *  @repo/pipeline        generate(), DecisionPort, TextPort, compiler, text (area 3)
├── tools/
│   ├── eval/ *                            M0 harness: briefs → timing and cost table, screenshots (area 3)
│   └── scripts/                           check-licences.ts, notices.ts, new-block.ts
└── selfhost/                              Dockerfile, entrypoint.sh, README (when self-hosting ships)
```

**Dependency direction (enforced by Biome `noRestrictedImports` per package, plus a test that parses `package.json` files) [P]:**

```
spec  ←  blocks/manifest  ←  pipeline           (pure: no react, no cloudflare:*, no node:*)
spec  ←  blocks/components ←  render            (react, react-dom/server; no cloudflare:*)
apps/web, apps/sites  →  anything               (only apps touch bindings)
```

`pipeline` must never import `blocks/components`: the decision pipeline needs block *data* (manifests, slots, fit descriptions), not React code. That keeps the Worker's generation path small and its startup fast.

**Why these packages and not more [P].** Each one has two or more consumers or a hard purity boundary: `spec` (editor, server, pipeline, render), `blocks` (render, pipeline via manifests, CI checks), `render` (preview, publish, eval screenshots), `pipeline` (server, eval CLI, tests). Area 3's internal split (`decide`, `compiler`, `text`) can start as folders inside `pipeline` with an import rule between them, and split when a second consumer appears; if area 3 prefers four packages from day one, the layout allows it. **Premature:** a CLI package, a `db` package (until `apps/sites` needs the schema), a `platform` or `adapters` package, a UI kit package, a `config` package.

**Internal packages without a build step [P].** Each package's `package.json` exports TypeScript source:

```json
{
  "name": "@repo/spec",
  "private": true,
  "type": "module",
  "exports": { ".": "./src/index.ts", "./ops": "./src/ops.ts" },
  "scripts": { "typecheck": "tsc --noEmit", "test": "vitest run" }
}
```

Vite compiles them inside the app build; Vitest runs them directly. Nothing to watch, nothing stale. Add tsdown (0.23.7 [V npm]) only to a package the day it is published to npm.

**Naming and npm scope [P].** Internal packages use `@repo/*`, a neutral convention that never needs renaming because it is not branding. Every package is `"private": true`, so nothing can be published by accident. When the product has a name and a package is worth publishing (the spec types, a block-contract kit), it gets the real scope then. Do not register an npm scope or domain until the founder names the product (CLAUDE.md).

**`pnpm-workspace.yaml` [P; setting names V at https://pnpm.io/settings; check value formats against the docs when writing it]:**

```yaml
packages: [apps/*, packages/*, tools/*]
catalog:                      # one version per dependency, referenced as "catalog:"
  react: 19.3.1
  react-dom: 19.3.1
  '@tanstack/react-start': 1.169.5
  '@tanstack/react-router': 1.170.46
  vite: 8.3.8
  '@vitejs/plugin-react': <pin at scaffold>
  '@cloudflare/vite-plugin': 1.69.1
  wrangler: 4.162.0
  tailwindcss: 4.3.5
  '@tailwindcss/vite': 4.3.5
  typescript: 7.0.2
  zod: 4.6.7
  vitest: 4.1.12
  '@cloudflare/vitest-pool-workers': 0.23.0
  '@playwright/test': 1.65.0
  '@biomejs/biome': 2.6.7
minimumReleaseAge: 4320        # minutes; skip versions younger than 3 days
trustPolicy: no-downgrade
blockExoticSubdeps: true
allowBuilds:                   # only these may run install scripts
  esbuild: true
  workerd: true
```

Versions: all [V `npm view`, 14 Nov 2026]. `@tanstack/react-start@1.169.5` requires `vite >=8.0.0` [V peerDependencies]; `@cloudflare/vite-plugin@1.69.1` accepts Vite 6–8 and requires `wrangler ^4.160.0` [V].

**Licence and notices [P].** Root `LICENSE` (Apache-2.0) and `NOTICE` once the founder confirms the licence. No licence header on every file (Apache-2.0 does not require one). Files derived from third-party blocks keep their original copyright and an SPDX line, and each block's manifest records `license` and `source`. `tools/scripts/notices.ts` builds `THIRD_PARTY_NOTICES.md` from `pnpm licenses list --json` [R] plus block manifests; CI fails on any dependency outside an allowlist (MIT, Apache-2.0, ISC, BSD-2-Clause, BSD-3-Clause, 0BSD, BlueOak-1.0.0, CC0-1.0, Unicode-3.0). Exported sites and the self-host image carry the generated notices.

**Release flow.** Nothing is published, so no changesets [P]. The app deploys continuously from `main`. The self-host image is tagged by date (`2026.11.14`) from `main` when self-hosting ships. Add changesets the day the first npm package ships.

### 2.9 P9: build and tooling (two-way doors; simplest choice)

| Tool | Choice | Why | Source |
|---|---|---|---|
| Package manager | pnpm (12.18.0 latest; the founder's machine has 10.29.3). Pin with `packageManager` in the root `package.json` | Fixed by the founder | [V npm] |
| Node | 26 LTS (26.13.1, 10 Nov 2026) for dev, CI and the self-host image | Active LTS | [V nodejs.org/dist/index.json] |
| Bundler | Vite 8.3.8 (Rolldown) through TanStack Start | Required | [V] |
| Task runner | `pnpm -r --parallel` scripts | Five packages do not need Turborepo or Nx; add Turborepo when CI passes ~5 min | [P] |
| Type-check | **TypeScript 7.0.2** (the native compiler) | 0.13 s on the spike [M]. TS 7's main export is only a version string; the old JS compiler API is gone (only `typescript/unstable/*`) [V package exports]. Nothing in this stack calls that API (Biome and oxlint are native; no typescript-eslint). If a tool ever needs it, use TS 6.0.3 | [V][M] |
| Lint and format | **Biome 2.6.7** | One tool, one config, stable major. oxlint 1.93 is a fine linter, but its formatter `oxfmt` is 0.78 | [V npm] |
| Block-contract checks | Vitest tests over the block manifests (and a Biome restricted-import rule), not a custom lint plugin | Easier for agents to read and fix | [P] |
| Library builds | none (TS source); tsdown when publishing | — | [P] |

Tailwind v4.3.5 through `@tailwindcss/vite` in the app; the blocks package builds its CSS with the Tailwind CLI or Vite at library build time (area 2).

### 2.10 TanStack Start today

- **Status.** "TanStack Start is stable" [V](https://tanstack.com/start/latest/docs/framework/react/overview); `@tanstack/react-start` 1.169.5, published 8 Nov 2026 [V npm]. Releases are frequent; pin exact versions.
- **Features:** server functions, middleware, server routes, streaming, selective SSR (`ssr: true | false | 'data-only'`), static prerendering, SPA mode, ISR through cache headers [V docs index](https://tanstack.com/start/latest/llms.txt). **React Server Components are experimental** and "will remain so into early v1" [V](https://tanstack.com/start/latest/docs/framework/react/guide/server-components). **Deferred hydration** (`<Hydrate when={visible()}>`) is experimental [V](https://tanstack.com/start/latest/docs/framework/react/guide/deferred-hydration). Rsbuild is supported, but **Cloudflare does not support Start projects built with Rsbuild** [V CF guide].
- **Cloudflare path** [V](https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/) (updated 5 Nov 2026): `cloudflare({ viteEnvironment: { name: 'ssr' } })` before `tanstackStart()`; `main: "@tanstack/react-start/server-entry"`; bindings via `import { env } from "cloudflare:workers"`; a custom `src/server.ts` entry to add `queue`, `scheduled`, Durable Object and Workflow exports; `vite dev` runs Worker code in local `workerd` with local bindings. The build writes `dist/server/wrangler.json` and `.wrangler/deploy/config.json`; do not pass `--config wrangler.jsonc` to `wrangler deploy`, and keep both outputs when build and deploy are separate CI jobs [V TanStack hosting guide]. [M] The generated config contained `no_bundle: true` and `assets.directory: "../client"`. The `nodejs_compat` flag became default on 2026-08-04 [M workerd log].
- **Node and Docker path:** Nitro's Vite plugin, `node .output/server/index.mjs` [V hosting guide]. Not used under P1.
- **Open issues that matter here** [V GitHub search, open on 14 Nov 2026]: [#8825](https://github.com/TanStack/router/issues/8825) prerender ignores Vite's `root` when building from another folder (run builds inside `apps/web`); [#8139](https://github.com/TanStack/router/issues/8139) SSR bundle calls `createServerFn` before initialisation with pnpm's symlinked layout; [#8687](https://github.com/TanStack/router/issues/8687) bots get Suspense fallbacks instead of full HTML since 1.170.37 (matters for the landing page's SEO); [#7527](https://github.com/TanStack/router/issues/7527) ISR cannot work on Cloudflare because Workers run in front of the CDN; [#8280](https://github.com/TanStack/router/issues/8280) and [#8333](https://github.com/TanStack/router/issues/8333) server functions resolve instead of rejecting on some non-OK responses (check `ok` explicitly); [#8521](https://github.com/TanStack/router/issues/8521) client aborts logged as 500s (noise once generation requests are aborted while typing, area 3's D16); [#8483](https://github.com/TanStack/router/issues/8483) prerender concurrency does not parallelise CPU-bound rendering.
- **How we use Start [P]:** the landing page prerendered (static assets are free [V](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)); editor routes `ssr: false` (an app, not a document: less Worker CPU, no hydration mismatches); generation as a server route streaming NDJSON (area 3's D15); auth as a server route mounting Better Auth's handler. No RSC.

### 2.11 Hosted and self-hosted seams

| Seam | Cloudflare (hosted) | Self-hosted container | Interface now? |
|---|---|---|---|
| Relational DB | D1 `app` | D1 emulated: SQLite under `/data` | **No.** Drizzle's sqlite dialect is the seam |
| Object storage | R2 `private`, R2 `sites` | R2 emulated on disk under `/data` | **No.** Named functions in `server/storage.ts` |
| Key-value | KV `HOSTS` | Emulated | No |
| Durable Objects | SQLite DOs | `workerd` SQLite files | No |
| Background jobs | `waitUntil` → Queues → Workflows | Emulated Queues and Workflows | **Yes, one function**: `enqueue(kind, payload)` so M1 can run inline and switch later |
| Vector search | Do not use Vectorize | — | No; in-memory scan over manifest embeddings if area 3 needs it |
| Images | Images transformations: 5,000 unique free per month, then $0.50 per 1,000 [V](https://developers.cloudflare.com/images/pricing/) | Originals served as-is | **Yes, one function**: `imageUrl(asset, width)` |
| Auth | Better Auth + D1 + OAuth | Same, or `AUTH_MODE=none` | No |
| Abuse guard | Turnstile + rate-limit binding + spend DO | Turnstile off unless keys are set; rate limit emulated | One function: `guard(req, kind)` |
| Real browser | Browser Run (optional) | Optional Playwright sidecar via `BROWSER_WS_ENDPOINT`, or off | Capability flag |
| Model providers | Secrets; Workers AI binding (area 3) | Env vars; Workers AI is not available locally [R] | Area 3's ports |
| Custom domains | Cloudflare for SaaS API | The self-hoster's reverse proxy | Hosted-only module |
| Email | Deferred | Deferred | — |

Three one-function seams and Drizzle. Nothing else gets an interface until someone asks for a second implementation.

### 2.12 P11: background work

- **M0:** none. Generation is one request; Workers allow unlimited wall time while the client stays connected, and `waitUntil` adds up to 30 s after the response [V limits].
- **Quality checks that need a real browser [P].** Most defects are properties of a block with given content, not of a site. So the main gate runs **in CI**: Playwright renders every block × variant × theme with the shortest, longest and right-to-left test content and checks overflow, clipping, contrast and tap targets. That costs nothing per site. Per-publish checks are optional: a Browser Run Quick Action screenshot (it also gives a thumbnail).
- **Browser Run** (Browser Rendering's new name): Paid includes 10 browser hours a month, then $0.09 per hour; sessions also bill concurrent browsers beyond 10 at $2.00 each (monthly average of daily peaks); Quick Actions bill hours only [V](https://developers.cloudflare.com/browser-run/pricing/) (updated 21 Apr 2026). Paid limits: 60 s browser timeout, 3 new browsers per second, 30 Quick Action requests per second, 200 concurrent browsers [V](https://developers.cloudflare.com/browser-run/limits/). Use Quick Actions to avoid concurrency charges.
- **Link ingestion (M2)** and the **foundry (later):** Cloudflare Workflows, multi-step with retries. Workflows bills like Workers plus steps (500,000 included, then $0.80 per 100,000) and storage; step and storage billing starts on a date in the Workflows changelog [V pricing page]. Both are emulated locally, and `workerd` gained standalone Workflows on 13 Nov 2026 [V]. The foundry's coding agent needs a sandbox (Cloudflare Containers or similar); that is area 6's.
- **Keeping it optional [P]:** every job goes through `enqueue()`. With no `JOBS` binding it runs in `waitUntil`; with one it sends to the queue. The consumer is a `queue()` export in the custom server entry [V CF guide].

### 2.13 P12: testing, CI, previews, secrets

- **Local dev mirrors production:** `pnpm dev` runs `vite dev` in `apps/web`; Worker code runs in local `workerd` with local D1, R2 and KV [V CF guide]. Secrets in `apps/web/.dev.vars` (gitignored; `.dev.vars.example` committed). `pnpm db:migrate` wraps `wrangler d1 migrations apply app --local`.
- **Testing layers [P]:**
  1. Unit (Vitest 4.1.12, Node): `spec`, `pipeline` (with mock ports), `render` (render to string, snapshot HTML). Fast, no network.
  2. Worker integration: `@cloudflare/vitest-pool-workers` 0.23.0, which peers on `vitest ^4.1.0` [V npm], so **do not take Vitest 5.1 yet**. Real local D1 and R2: op append, 409 on stale version, publish writes files.
  3. End to end: Playwright 1.65 against `vite build && vite preview` (the built Worker on local `workerd`): brief → result under a time budget with mock model ports; publish → page served by `sites`.
  4. Block matrix (area 2's checks) in Playwright, sharded in CI.
  5. Eval (area 3): manual or nightly, with real model keys, never on every push.
- **CI on GitHub Actions [P]:** one workflow. `check` job: `pnpm install --frozen-lockfile`, `biome ci`, `pnpm -r typecheck`, `pnpm -r test` (target under 2 minutes). `e2e` job: build plus Playwright (cache browsers). `selfhost` job (once it ships): build the image, run migrations, run the smoke test against it. Eval runs on `workflow_dispatch` with keys from GitHub secrets.
- **Deploys and previews:** Workers Builds deploys `main` (the founder's portfolio already deploys this way). Workers **Previews** create an isolated copy per branch or PR; Durable Objects get a fresh namespace per Preview automatically, while D1, R2, KV and Queues are shared unless bound to separate resources [V](https://developers.cloudflare.com/workers/previews/resources/) (updated 9 Nov 2026). So create one `app-preview` D1 database and `*-preview` buckets for all Previews. Preview URLs can be put behind Cloudflare Access [V Workers docs index].
- **Secrets:** production with `wrangler secret put` or the dashboard; never in `wrangler.jsonc`. Local in `.dev.vars`. Self-hosted through `--env-file /data/.env`. Env vars are limited to 128 per Worker and 5 KB each [V limits].
- **Dependency updates:** Renovate weekly, grouped (TanStack together, Cloudflare together), respecting `minimumReleaseAge`.

### 2.14 P13: observability

- `observability.enabled: true` in each `wrangler.jsonc`; one `log(event, fields)` helper writing JSON with `genId`, `projectId`, `route`, `ms`. Workers Logs and Traces capture it on Cloudflare; the container prints it to stdout.
- **Price change on 1 Dec 2026:** Workers Logs moves to Cloudflare Observability pricing: Paid includes 50 GB ingestion and 10 GB-month storage per billing cycle, then $0.25 per GB and $0.10 per GB-month [V](https://developers.cloudflare.com/observability/pricing/) (updated 11 Nov 2026). Until then: 20 M log events included, then $0.60 per million [V pricing]. Sample successful-request logs at 10% from M1.
- Errors: `@sentry/cloudflare` 11.12.0 [V npm] in Workers and Sentry's React SDK in the browser, both off unless `SENTRY_DSN` is set. Sentry's TanStack Start SDK is alpha [V TanStack partners page]; use the plain Cloudflare and React SDKs. Self-hosters can point the DSN at GlitchTip, which speaks Sentry's protocol [R].
- Product numbers (latency per stage, cost per site) come from area 3's generation records, not from logs.

### 2.15 Making the repo work well for coding agents [P]

- Root `AGENTS.md` (CLAUDE.md includes it): what the product is in five lines, the rules from CLAUDE.md, the dependency-direction table, the commands, and "never edit generated files" (`routeTree.gen.ts`, `worker-configuration.d.ts`, migrations once applied).
- One `AGENTS.md` per package and app, under 60 lines: purpose, public exports, invariants (for example "`pipeline` imports no `cloudflare:*`"), how to test, owner area.
- Scripts an agent can run without thinking: `pnpm check` (Biome, typecheck, unit tests; the single gate, under 60 s), `pnpm test`, `pnpm e2e`, `pnpm dev`, `pnpm eval`, `pnpm new-block <name>` (scaffolds a block with manifest, three test contents and a test).
- Determinism: no network in unit tests; fixtures in `test/fixtures`; mock model ports by default; `wrangler types` output committed so typecheck needs no account.
- Decisions recorded as short ADRs in `docs/decisions/`, so agents do not relitigate them.

---

## 3. Directory tree, binding list, cost table

### 3.1 Directory tree

See section 2.8.

### 3.2 Binding list

**M0 (`apps/web` only):** no data bindings. Secrets for the model keys area 3 chooses; the `AI` binding only if `clef-flash` through Workers AI is in the M0 comparison (area 3). Note that the `AI` binding calls Cloudflare even in local dev [R], so it needs the founder's account.

**M1 and later [P]:**

`apps/web/wrangler.jsonc`:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "seconds",
  "main": "src/server.ts",                       // custom entry: fetch + queue + DO exports
  "compatibility_date": "2026-11-13",
  "observability": { "enabled": true, "head_sampling_rate": 0.1 },
  "upload_source_maps": true,
  "limits": { "cpu_ms": 30000 },
  "d1_databases": [{ "binding": "DB", "database_name": "app", "database_id": "…",
                     "migrations_dir": "migrations" }],
  "r2_buckets": [
    { "binding": "PRIVATE", "bucket_name": "builder-private" },   // specs, generation payloads
    { "binding": "SITES",   "bucket_name": "builder-sites" }      // deploy files, uploads
  ],
  "kv_namespaces": [{ "binding": "HOSTS", "id": "…" }],
  "durable_objects": { "bindings": [{ "name": "SPEND", "class_name": "SpendGovernor" }] },
  "migrations": [{ "tag": "v1", "new_sqlite_classes": ["SpendGovernor"] }],
  "ratelimits": [
    { "name": "RL_GENERATE", "namespace_id": "1001", "simple": { "limit": 20, "period": 60 } },
    { "name": "RL_AUTH",     "namespace_id": "1002", "simple": { "limit": 10, "period": 60 } }
  ],
  "queues": { "producers": [{ "binding": "JOBS", "queue": "builder-jobs" }],      // M1.5
              "consumers": [{ "queue": "builder-jobs", "max_batch_size": 10 }] },
  "browser": { "binding": "BROWSER" },                                            // optional, M1.5+
  "ai": { "binding": "AI" },                                                      // area 3, optional
  "vars": { "APP_ORIGIN": "https://app.example", "SITES_DOMAIN": "example-sites.app",
            "PREVIEW_ORIGIN": "https://preview.example-sites.app", "DEPLOY_TARGET": "cloudflare" }
  // secrets: BETTER_AUTH_SECRET, GITHUB_CLIENT_ID/SECRET, GOOGLE_CLIENT_ID/SECRET,
  //          TURNSTILE_SECRET_KEY, model keys (area 3), SENTRY_DSN, CF_SAAS_API_TOKEN (later)
}
```

`apps/sites/wrangler.jsonc`: `SITES` (R2, read by convention), `HOSTS` (KV), `assets` (the preview runtime bundle), route `*.{sites-domain}/*`, later a `*/*` route on the SaaS zone. Area 6's `SiteStore` DO class lives here when forms arrive.

Self-host container [P]:

```dockerfile
FROM node:26-bookworm-slim                 # glibc 2.36; workerd needs ≥ 2.35 [V workerd README]
WORKDIR /app
COPY selfhost/package.json selfhost/pnpm-lock.yaml ./     # wrangler pinned exactly, nothing else
RUN corepack disable; npm i -g pnpm@12 && pnpm install --prod --frozen-lockfile
COPY apps/web/dist ./web/dist              # built in CI by the same `vite build`
COPY apps/web/migrations ./web/migrations
COPY apps/sites/dist ./sites/dist
ENV WRANGLER_SEND_METRICS=false
VOLUME /data
EXPOSE 8787
ENTRYPOINT ["/app/entrypoint.sh"]          # 1) d1 migrations apply --local --persist-to /data
                                           # 2) wrangler dev --local -c web/dist/server/wrangler.json
                                           #    -c sites/dist/wrangler.json --ip 0.0.0.0 --port 8787
                                           #    --persist-to /data --env-file /data/.env
```

### 3.3 Cost table for the hosted copy

Prices as published on 30 Oct to 13 Nov 2026 (sources in section 2). **Every quantity below is an assumption [P]; the M0 eval replaces them with measured numbers.**

Assumptions per generated site (one generation request that returns a spec):

| Quantity | Per generated site | Basis |
|---|---|---|
| App Worker requests | 10 | 1 generation, 1 page load (assets are free), ~8 op saves and reads |
| App Worker CPU | 40 ms | Model calls are waiting, not CPU; JSON, Zod, applyOp |
| Saved as a project | 30% | Wall candidates are not saved |
| Published | 10% | |
| Views per published site per month | 100 | So 10 `sites` Worker requests per generated site, 1 ms CPU each |
| D1 rows written / read | 10 / 50 | Generation index, project, ops |
| R2 Class A / Class B | 1 / 3 | Snapshots, deploy files; view misses after cache |
| R2 storage added | 24 KB | 30% × 2 snapshots × 30 KB + 10% × 60 KB |
| Browser Run per publish | 5 s | Quick Action screenshot, so 0.5 s per generated site |
| Queue messages | 0.1 | One check job per publish |
| Custom hostnames | 1% of published sites | Only if custom domains are free (founder question 7) |

Monthly cost (USD):

| Line | 100 sites | 10,000 sites | 1,000,000 sites | Arithmetic at 1 M |
|---|---|---|---|---|
| Workers Paid base | 5.00 | 5.00 | 5.00 | |
| Requests (app + sites) | 0 | 0 (200 k) | 3.00 | (20 M − 10 M) × $0.30/M |
| CPU | 0 | 0 (0.5 M ms) | 0.40 | (50 M − 30 M ms) × $0.02/M |
| D1 rows and storage | 0 | 0 | 0 | 10 M writes ≤ 50 M; 50 M reads ≤ 25 B; < 5 GB |
| R2 operations | 0 | 0 | 0 | 1 M Class A ≤ 1 M; 3 M Class B ≤ 10 M |
| R2 storage (grows monthly) | 0 | 0 | 0.21 in month 1, ~4.20 by month 12 | 24 GB/month cumulative, first 10 GB free, $0.015/GB |
| KV | 0 | 0 | 0 | 0.1 M writes ≤ 1 M; ~2 M reads ≤ 10 M |
| Browser Run | 0 | 0 (1.4 h) | 11.61 | (139 h − 10 h) × $0.09 |
| Queues | 0 | 0 | 0 | 0.3 M ops ≤ 1 M |
| Spend governor DO | 0 | 0 | ~0.15 | ~2 M requests, 1 M included, $0.15/M |
| Logs and traces (from 1 Dec 2026) | 0 | 0 | ~0 | ~20 GB ingestion ≤ 50 GB included |
| **Infra subtotal, no custom domains** | **~5** | **~5** | **~20–25** | |
| Custom hostnames | 0 | 0 (10) | 90.00 | (1,000 − 100) × $0.10, and it grows each month |
| **Infra with custom domains** | **~5** | **~5** | **~110–115** | |
| Model calls (area 3; research estimate $0.002–0.005 per site, not measured) | 0.20–0.50 | 20–50 | 2,000–5,000 | |

Reading the table [P]: hosting is not the cost problem; model calls are 95–99% of spend at every scale, and the 50,000-hostname cap on Cloudflare for SaaS (non-Enterprise) is reached long before money is. The Free plan could carry 100 sites a month, but its 10 ms CPU limit per invocation is too tight for SSR plus validation, and Browser Run on Free is 10 minutes a day; start on Paid at the first public deploy.

### 3.4 Worker limits most likely to bite, ranked [V limits page, updated 13 Nov 2026, unless noted]

1. **Six simultaneous outgoing connections waiting for headers per invocation** (fetch, KV, R2, Queues, Cache all count; a seventh waits). A text pipeline that fans out 15 slot calls in parallel gets six at a time. Streaming responses free their slot once headers arrive. Applies to Durable Objects too.
2. **Worker startup time: 1 second** (global-scope evaluation). Hundreds of blocks imported eagerly would hit it long before the **64 MiB uncompressed** size limit. Server code imports manifests (data) eagerly and components only lazily, per block used.
3. **Memory: 128 MB per isolate, shared by concurrent requests.** Do not hold caches of specs or embeddings in globals without a bound. Cloudflare's own page says Zod before 4.5.0 "use[s] substantially more memory per schema"; the catalog pins Zod 4.6.7.
4. **D1: 10 GB per database (hard), one query at a time per database, 100 bound parameters per query** (chunk bulk op inserts), 2 MB per row [V D1 limits]. Handled by P2.
5. **KV: one write per second per key, ~60 s propagation [R], 30 s minimum `cacheTtl`.** Fine for hostname pointers, wrong for anything read straight after writing elsewhere.
6. **CPU per request:** Free 10 ms (too tight); Paid default 30 s, up to 5 min. Not an issue on Paid.
7. **Request body:** 100 MB on Free and Pro zones. Uploads above that go direct to R2 with presigned URLs.
8. **Subrequests:** 10,000 per invocation on Paid (50 on Free). D1 allows 1,000 queries per invocation on Paid [V D1 limits].
9. **Static assets:** 100,000 files per Worker version, 25 MiB per file. Irrelevant if published sites stay in R2 as recommended.

---

## 4. What to defer

**M0 (speed spike) needs only [P]:** the workspace skeleton (root `package.json`, `pnpm-workspace.yaml` with catalog and supply-chain settings, `biome.json`, `tsconfig.base.json`, root and per-package `AGENTS.md`); `packages/spec`, `blocks` (about 15), `render`, `pipeline`; `apps/web` with one route (brief box, timer, in-page or same-origin preview that already uses the message protocol), one streaming server route `POST /api/generate`, model keys in `.dev.vars`; `tools/eval` producing the timing and cost table and screenshots; `pnpm check`. Running locally with `vite dev` already measures inside `workerd`, including the six-connection limit. Deploying M0 to a `workers.dev` URL to measure real edge latency is optional and needs the founder's account.

**M0 must not build:** accounts, D1, R2, KV, Durable Objects, publishing, the `sites` Worker, the cross-origin preview host, Queues, Workflows, Browser Run, Turnstile, rate limits, the Docker image, custom domains, CI deploys, Sentry, Renovate, Turborepo, tsdown, changesets, a CLI, the PSL submission.

**M1 (public The Wall or editor):** D1 + Drizzle + migrations, Better Auth (anonymous plus OAuth), project persistence (P3), cross-origin preview on the sites domain, Turnstile, rate limits, spend governor, CI workflow, Workers Builds deploys and Previews, Workers Paid, a spending limit.

**M1.5 (publishing):** `apps/sites`, R2 deploys, KV pointers, subdomains, PSL submission, the `enqueue()` path to Queues, optional Browser Run check.

**When the first outsider asks, or before going public (founder question 2):** the self-host image and its CI smoke test.

**Later:** custom domains (Cloudflare for SaaS), DO per project for collaboration, Workflows for link ingestion and the foundry, the sandbox and user-content domains, raw-`workerd` self-host, splitting D1 by table, email sign-in, npm publishing.

---

## 5. Requirements on the other five areas

**Area 1 (spec format and operations)**

- `applyOp` and the validator are pure (no `cloudflare:*`, `node:*` or React) and run in Worker, browser and Node.
- Ops are JSON and small (target under 1 KB each); a batch carries `txId` and is one write.
- A canonical serialisation and `specHash` (SHA-256 over canonical JSON), used for R2 snapshot keys.
- `specVersion` plus migration functions, so a deploy can pin its spec version and an old snapshot can be upgraded on load.
- A conflict rule for a stale `baseVersion` (reject is fine for M1).

**Area 2 (blocks, themes, rendering)**

- `@repo/blocks` exposes `./manifest` (pure data, importable by `pipeline` and the Worker without React) and `./components` (React), plus a lazy registry `Record<blockType, () => import(...)>` so the server and the preview load only blocks in use.
- **No class names computed from spec data.** All classes are static in block source; theme values arrive as CSS custom properties. The library build emits per-block CSS, so publishing never runs Tailwind.
- `renderStatic(spec, library) → { path, contentType, body }[]`, deterministic, with zero JavaScript unless a block declares an island; interactivity from native HTML first.
- Published page budget [P]: under 30 KB gzip for HTML plus CSS on a typical landing page; 0 KB JavaScript baseline.
- Each block manifest records `license` and `source` for notices.
- The block matrix (variants × themes × shortest, longest and right-to-left content) is runnable in Playwright in CI.
- A `libraryVersion` content hash per library build (area 3 asks for the same).

**Area 3 (decision and text pipeline)**

- Plan for **six concurrent outgoing requests per invocation**: batch slots into at most six calls, or one structured call, and stream.
- Never import block components in `pipeline`; manifests only.
- `RecordSink`: index row in D1 (`generations`), payload in R2 `private/gen/{yyyy-mm}/{genId}.json`; retention 90 days for the index unless the founder says otherwise.
- The spend governor DO lives in the `apps/web` Worker's custom entry; `apps/web/src/server/deps.ts` builds `Deps` from bindings.
- No Node server target is needed under P1; the pure `pipeline` still runs in Node for `tools/eval` and tests. The Workers AI adapter is optional because self-hosters do not have that binding.
- Do not depend on Vectorize.

**Area 5 (editor client and The Wall)**

- Talk to the preview **only through a typed `postMessage` protocol** (load spec, apply patch, highlight, select, measure, report errors), with an origin check on both ends, from the first editor commit.
- The Wall may render all candidates inside one cross-origin preview frame (they are all our own blocks); isolation is between editor and user content, not between candidates.
- Send ops in debounced batches with `baseVersion`; handle `409` by reloading.
- Editor routes use `ssr: false`; the landing page is prerendered.

**Area 6 (room for apps, forms, foundry)**

- Agreed: the four-domain end state, reserved `/_x/*` and `/.well-known/*`, platform cookies never on site domains, pnpm supply-chain settings from the first commit, `SiteStore` as a SQLite DO per site in the `sites` Worker.
- Self-host parity is the container (P1), not a Node adapter with a SQLite file per site; DOs on disk come with it.
- Foundry jobs run through `enqueue()` and Workflows; the coding agent's sandbox (Containers or external) is area 6's choice and must be optional for self-hosters.

---

## 6. Questions for the founder

1. **The sites domain.** Publishing on subdomains needs a second registrable domain, registered for at least two years and submitted to the Public Suffix List, which is hard to undo. (a) Buy a neutral domain now, independent of the future brand: publishing can ship in M1.5, and moving to a branded domain later means redirects. (b) Wait for the product name: publishing waits too. Cost is about $10–30 a year either way.
2. **How serious is self-hosting, and when?** (a) The recommended container that runs the Cloudflare runtime (Wrangler today, `workerd` later): about a day to build plus a CI job; a self-hoster runs a tool Cloudflare calls a development tool. (b) A true Node build: weeks of adapter work, Durable Objects re-implemented, two test matrices for the life of the project. Also: ship it with the first public release, or when the first outsider asks?
3. **Accounts on the public copy.** (a) Anonymous generation with sign-in to keep a site (recommended; needs Turnstile, rate limits and a daily spend cap). (b) Sign-in before the first generation: simplest abuse control, but the "one second after Enter" demo starts behind a login. Either way: what daily model-spend cap is acceptable for the public copy (a number only you can pick)?
4. **One Cloudflare account or two?** Putting user-published sites in a separate account protects the app (and your portfolio, if it shares the account) from abuse actions against a phishing page. Costs a second Workers Paid plan ($5/month) once publishing ships.
5. **When the repository goes public and under which licence.** Already a recommendation in CLAUDE.md (Apache-2.0, private until the first demo). Needed before the self-host image is published.
6. **How long unclaimed anonymous projects and sites live.** 30 days keeps storage flat; longer is friendlier. Affects D1 size planning.
7. **Custom domains: free or a future paid feature?** Each one beyond 100 costs $0.10 a month on Cloudflare for SaaS, with a 50,000 cap below Enterprise.

---

## 7. Risks

1. **Biggest: denial-of-wallet and abuse on an anonymous public copy.** Hosting costs tens of dollars a month even at 1 M sites; model calls cost thousands, and free hosting of generated pages attracts phishing. Mitigations: Turnstile, per-session and per-IP rate limits, a strict global spend governor with a demo-mode fallback, a Workers spending limit [V pricing page], a report-abuse link and takedown flag on every published site, user content in a separate account.
2. **Self-hosting rides on development tools.** Wrangler's local mode and Miniflare are not marketed for production; Miniflare's JS API already changed shape in the 5.x beta [M]. Mitigations: drive only the CLI, pin exactly, CI smoke test of the image, and the raw-`workerd` path that Cloudflare is actively building out [V commits Nov 2026].
3. **TanStack Start churn.** Frequent releases and the open issues listed in 2.10, some touching monorepos and pnpm layouts. Pin exact versions, upgrade weekly on a branch with e2e tests.
4. **TypeScript 7 tooling gaps.** Any future tool that needs the classic compiler API will not work with TS 7; fall back to TS 6.0.3 for that tool.
5. **D1 ceilings.** 10 GB per database and single-threaded writes. Handled by keeping only small rows in D1 and the scale steps in 2.2, but a mistake (storing specs or payloads in D1) would surface only at scale.
6. **Cloudflare pricing and product changes.** Workers Logs pricing changes on 1 Dec 2026; Workflows step billing starts later; Browser Rendering was renamed Browser Run. Re-check the cost table yearly.
7. **Lock-in grows with each Cloudflare primitive.** The rules in 2.1 keep a Node port possible, but every new DO or Queue use makes it costlier. Add a new primitive only when `wrangler dev --local` emulates it.
8. **Published sites are pinned to an old library.** Render-once means a block bug fix does not reach live sites until re-render. Mitigation: a batch re-render job by `libraryVersion`, run deliberately after visual diff checks.

---

## 8. Not verified

- Long-running behaviour of `wrangler dev --local` as a server: memory over days, behaviour without network (whether it fetches Cloudflare's `cf.json` at start), log volume. I ran it for minutes on one laptop.
- The self-host Dockerfile above was not built; the `entrypoint.sh` steps were run by hand outside Docker only, and with one Worker. Running two configs in one `wrangler dev` (`-c web -c sites`) is reported, not tried.
- The `wrangler.jsonc` snippet in 3.2 was not validated with `wrangler deploy --dry-run`; field names (`migrations_dir`, `head_sampling_rate`, `new_sqlite_classes`, `browser`, `ratelimits`) are from memory of the schema, except the `ratelimits` `name` rule, which the Previews page states.
- Better Auth end to end on Workers with D1 (anonymous sign-in, OAuth linking, cookie cache). Docs read; not run.
- That D1 `batch()` is transactional (reported, not re-read today).
- Cloudflare for SaaS with a Worker as origin, end to end; Universal SSL's one-level wildcard coverage; KV's ~60 s propagation figure.
- Browser Run and Images emulation in local mode (Miniflare has the plugins; I did not exercise them). Whether the `AI` binding works in `--local` mode (I believe it is remote-only).
- `pnpm licenses list --json` output format, the exact value formats for `minimumReleaseAge`, `trustPolicy` and `allowBuilds`, and pnpm 12 behaviour (the founder's machine has pnpm 10.29.3; the spike used it).
- TypeScript 7 with project references and with every config option the repo will use; only a single small project was checked.
- Every cost-table quantity (requests, CPU, rows, views, publish rate); the prices are verified, the usage is assumed.
- The DO soft limit of 1,000 requests per second as it applies to the spend governor under bursts.
- GlitchTip compatibility with current Sentry SDKs; Caddy on-demand TLS for self-hosted subdomains.
- Whether Lucia is formally retired (memory only; irrelevant to the recommendation).
