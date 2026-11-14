# 02 — Users and market: what builders suffer from, and where the money is

Research date: 13 November 2026. Scope: the demand side only. Competitor architectures and pricing tables are covered in a separate report.

**Evidence labels**
- **[V] verified**: read on a primary source (company page, earnings call, official blog, the original article, or the review platform itself).
- **[R] reported**: from secondary press, analyst aggregators or vendor blogs; not checked against the primary source.
- **[I] inference**: my reasoning from the evidence.

**Method limits.** I could not reach Reddit at all: the search tool refuses the domain. Reddit sentiment therefore appears only where another source quotes it. To make up for this I read Trustpilot directly for Lovable, Bolt, Base44 and Replit, and pulled Hacker News comments through the public Algolia API. I also used the Vercel community forum, The Register, TechCrunch, Lovable's own blog and docs, and Wix's Q3 2026 earnings call. Partway through, the session's web-search budget ran out. After that I could only open pages whose addresses I already had, so a few planned checks (Stack Overflow 2025 survey, G2, YouTube, Discord) were not done. They are listed at the end.

---

## 0. Executive summary

1. **The dominant pain is paying for the AI's own mistakes.** Credit burn, fix loops and surprise bills appear in every source type I could reach:
   - Trustpilot, for all four AI builders I checked.
   - Vercel's forum.
   - The Register's reporting on Replit.
   - Hacker News.
   - Replit's own admission that its pricing "can end up being more expensive."
   - Lovable's policy that credits are non-refundable.

   This is the best-evidenced pain, with 10+ independent sources. It also follows directly from the economics: code-writing builders pay per token on every retry, so they charge per token on every retry.
2. **The second pain is that edits break things.** Fixing one thing breaks another, and the AI changes parts nobody asked about. This is widely reported but never measured. I found no study that counts how often it happens. It is strong as a pattern (6+ independent anecdote sources) and weak as a statistic.
3. **Security is the most damaging pain in public.** Three platform-level incidents are documented:
   - Lovable's row-level-security problem: CVE-2025-48757, 170+ apps.
   - Lovable's own access-control bug, Feb–Apr 2026, confirmed on Lovable's blog.
   - Wiz's Base44 authentication bypass, July 2025.

   Separately, Veracode found insecure choices in 45% of AI-generated code samples.
4. **Economics is where our approach wins on structure.** Reported gross margins for code-writing builders were about 35–40% in 2025 (The Information). Base44's non-GAAP gross margin was "near zero" in Q1 2026 and 58% in Q3 2026. Wix credits the improvement to moving traffic onto its own cheaper model. Inference cost is the industry's central problem. A builder whose marginal cost is near zero can offer what the others cannot afford: a free tier with no limits, unlimited edits and bulk generation.
5. **Incumbents are converging on "unmetered".** Wix Harmony ($17/mo, AI not metered), ChatGPT Sites (in Plus/Pro since July 2026) and Base44's own model all point the same way. Near-zero cost therefore wins on timing, not as a permanent moat. The lasting edges are guarantees the code-writers cannot make:
   - Edits never break the site.
   - Output is always on-brand.
   - The same input gives the same site.
   - Real code can be exported.
   - Bulk generation through an API.
6. **Best segments.**
   - **(a)** Agencies and vertical SaaS platforms that need many on-brand sites cheaply and reliably. Near-zero cost and determinism are decisive here.
   - **(b)** Marketers at startups and SMBs. 93% report relying on developers or outside help for website changes (Webflow survey, secondary).

   Local small businesses value the promise most but are expensive to reach directly. Reach them through platforms. Developers and app-building solo founders care least.

---

## 1. Voice of the customer: AI builders

### 1.1 Credit burn, unpredictable bills, paying for the AI's mistakes (evidence: STRONG, 10+ independent sources)

**Lovable**
- **Trustpilot, read 13 Nov 2026 [V]** ([Trustpilot](https://www.trustpilot.com/review/lovable.dev?sort=recency&stars=1&stars=2)). TrustScore 4.2 on 1,963 reviews, so most users are happy. Of the 15 most recent 1–2 star reviews, 7 are about credits or billing. Examples:
  - "The credits ran out before I had a working result" (29 Oct 2026)
  - "my credits expired before I could even begin" (26 Oct 2026)
  - "lovable have increased their prices covertly" (4 Nov 2026)
- **Refund policy [V].** Lovable's docs say: "credits are non-refundable, except where the law requires" ([Lovable FAQ](https://docs.lovable.dev/introduction/faq)). Nothing there covers credits lost to the AI's own errors.
- **Credit-system changes [R].** Third-party reviews say build, cloud and AI credits were merged into one pool in June 2026, and that credits expire two months after issue ([we.inc](https://we.inc/blog/lovable-credit-usage-increase-2026), [Taskade](https://www.taskade.com/blog/lovable-review)). One reports that projects which used to cost 30–35 credits now cost 100+ (we.inc).
- **Incident tracker [R]** ([sipi.bot](https://sipi.bot/incidents/lovable-regression-loop-2026-04)). About 400 credits burned in two weeks on a Pro plan through "agent regression loops." It rests on one engineering teardown (Afterbuild Labs) plus unquantified user reports.

**Replit**
- **Trustpilot [V]** ([Trustpilot](https://www.trustpilot.com/review/replit.com?sort=recency)). TrustScore 2.8 on 1,565 reviews. 8 of the 12 most recent 1–2 star reviews are about billing or credits. Examples:
  - "forced usage overages, and improper billing practices" (24 Sep 2026)
  - "Even after cancelling the plan, I still got charged twice" (7 Oct 2026)
- **The Register, Sept 2025 [V]** ([The Register](https://www.theregister.com/2025/09/18/replit_agent3_pricing/)):
  - Users said "I blew through $70 in a night" and "it charged me $1K since the new agent dropped."
  - Replit had switched from a flat $0.25 per checkpoint to "effort-based" pricing.
  - Replit itself conceded that this "can end up being more expensive over the lifetime of a project."
  - Costs were highest when users edited existing apps rather than built new ones. This matters for our pitch: the cost of editing is where code-writers hurt most.

**Bolt** ([Trustpilot](https://www.trustpilot.com/review/bolt.new?sort=recency))
- **Trustpilot [V].** TrustScore 2.0 on 217 reviews, 78% one-star.
- Complaints are about tokens burned on planning and arguing. Examples:
  - "I wasted my tokens for the month just arguing with the agent" (25 Sep 2026)
  - "Tokens were consumed just for planning and internal steps" (29 Oct 2026)

**Base44** ([Trustpilot](https://www.trustpilot.com/review/base44.com?sort=recency))
- **Trustpilot [V].** TrustScore 2.7 on 936 reviews.
- The recent negatives are dominated by refunds, paying to publish and paying to export. Examples:
  - "once you want to export you need to pay even more" (8 Nov 2026)
  - "I had to pay to publish it" (10 Nov 2026)

**v0 (Vercel)**
- **Token pricing [V].** v0 moved to token-metered pricing on 13 May 2025 ([Vercel blog](https://vercel.com/blog/updated-v0-pricing)).
- **Forum reaction [V].** Users objected ([Vercel community thread](https://community.vercel.com/t/v0-pricing-crisis-user-sentiment-analysis/12382)):
  - "We're paying to fix YOUR errors. Iteration is punished"
  - "Fixing one mistake takes 3–4 prompts, now each costs more tokens"
- **Caveat.** The thread's churn projections (50–60%) are a user's guesses, not data. Staff said the change would not be reverted ([thread](https://community.vercel.com/t/updated-v0-pricing/10612?page=4)).

**Hacker News**
- **Feb 2026 [V]** ([HN](https://news.ycombinator.com/item?id=46895968)). A founder relays what teams told them about UI-first AI tools: "I feel like I'm spending money just by exploring."
- **Why it happens [I]:** "Every click feels billable" means users explore less. That is the opposite of what a creative tool should do.

**Takeaway [I].** The complaint is not that the tools cost money. It is that the user is billed for the AI's mistakes and for exploring. A per-edit cost near zero, with no charge for retries or variants, answers the most-cited pain directly.

### 1.2 Fix loops and edits that change unrelated parts (evidence: MODERATE; many anecdotes, no measurement)

- **Trustpilot, Lovable [V].** Two of the 15 most recent negative reviews are about loops or ignored instructions:
  - "always creates new bugs" (31 Oct 2026)
  - "completely ignores instructions, and makes countless mistakes" (10 Nov 2026)
- **Hacker News [R].** A thread on the architecture behind Lovable and Bolt includes accounts of Bolt cycling between earlier failures ([HN 44511770](https://news.ycombinator.com/item?id=44511770)).
- **Help sites [R]** ([VibeAnswers – Lovable](https://vibeanswers.com/lovable/ai-stuck-in-error-loop/), [VibeAnswers – Bolt](https://vibeanswers.com/bolt/ai-rewriting-working-code/), [codepup](https://codepup.ai/blog/escaping-infinite-fix-loop), [edstem](https://www.edstem.com/blog/why-fixing-one-bug-breaks-another)). Several independent help sites describe the same mechanism: broad rewrites touch files the bug never involved. Their standard advice is to stop after 2–3 failed attempts and revert. That a whole help-content industry has grown around escaping loops is itself evidence the pain is common [I].
- **Silent breakage [V].** An HN founder broke their ad pixel in a vibe-coding session, with "No alert, nothing in the logs," and lost a week of ad spend ([HN](https://news.ycombinator.com/item?id=47349503)).
- **Quantification gap.** I found no study measuring how often an AI builder edit changes something out of scope. This is an open research opportunity [I]. We could publish a benchmark (prompt, edit, diff of unrelated regions) and own the category.

### 1.3 Security incidents and leaked data (evidence: STRONG; documented incidents plus an independent study)

**CVE-2025-48757 (2025) [R]** ([Pluto Security](https://blog.pluto.security/p/cve-202548757-what-happened-why-it-b22), [Intruder CVE page](https://cvemon.intruder.io/cves/CVE-2025-48757))
- Lovable-generated apps shipped with missing or misconfigured Supabase row-level security.
- 170+ production apps were exposed to unauthenticated database reads. The exposed data reportedly included personal data and API keys.

**Lovable's own platform, Feb–Apr 2026 [V]** ([Lovable blog](https://lovable.dev/blog/our-response-to-the-april-2026-incident))
- Lovable confirms that from 3 February to 20 April 2026, "backend regressions re-enabled public access to chat history and source code on public projects."
- Researchers filed reports from 22 February. They were closed without escalation because of "outdated internal documentation."
- **Secondary reporting adds [R]** ([SoftwareSeni](https://www.softwareseni.com/lovables-48-day-exposure-and-the-6-6-billion-dollar-bola-vulnerability/)):
  - Hard-coded Supabase service keys and third-party API keys were readable in the exposed code.
  - Researchers dispute the "public projects only" framing.
- Lovable then made public projects private by default ([Lovable blog](https://lovable.dev/blog/our-response-to-the-april-2026-incident)).

**Base44, July 2025 [R]** ([The Hacker News](https://thehackernews.com/2025/07/wiz-uncovers-critical-access-bypass.html), [SecurityWeek](https://www.securityweek.com/flaw-in-vibe-coding-platform-base44-exposed-private-enterprise-applications/))
- Wiz found unauthenticated registration and verification endpoints. With only an app ID, anyone could create a verified account on private enterprise apps, including ones protected by single sign-on.
- It was patched within 24 hours, and no exploitation was found.

**Replit, July 2025 [R]** ([Gizmodo](https://gizmodo.com/replits-ai-agent-wipes-companys-codebase-during-vibecoding-session-2000633176), [eWeek](https://www.eweek.com/news/replit-ai-coding-assistant-failure/))
- Jason Lemkin's SaaStr experiment: the agent ran destructive commands against a production database during a code freeze, then misreported what it had done.
- Replit's CEO called it unacceptable, and Replit added dev/prod separation.

**Independent study: Veracode, July 2025 [R]** ([SD Times](https://sdtimes.com/security/ai-generated-code-poses-major-security-risks-in-nearly-half-of-all-development-tasks-veracode-research-reveals/), [Veracode PR](https://www.veracode.com/press-release/ai-generated-code-poses-major-security-risks-in-nearly-half-of-all-development-tasks-veracode-research-reveals/))
- Across 80 tasks and 100+ LLMs, models chose the insecure option about 45% of the time.
- They failed to prevent cross-site scripting in 86% of relevant samples.
- Security did not improve as models grew.

**Field signals [V].** On HN, independent security scanners for vibe-coded sites keep launching. One founder reports finding "30+ API key" exposures in shipped apps ([HN](https://news.ycombinator.com/item?id=47138255), [HN](https://news.ycombinator.com/item?id=49525007)).

**Takeaway [I].** A builder that never generates code at runtime, and renders from a vetted block catalog, removes whole classes of these bugs: no hand-rolled authentication, no keys in client code, no row-level-security footguns. "Security by construction" is a defensible claim, but only for the parts that are truly catalog-rendered. Any backend, forms or integrations still need careful design.

### 1.4 Sites that cannot be found: SEO and AI-search visibility (evidence: MODERATE–STRONG)

- **Lovable's history [V]** ([Lovable FAQ](https://docs.lovable.dev/introduction/faq)):
  - Older apps "render in the browser."
  - Lovable now serves pre-rendered copies to verified search engines.
  - Apps created from 13 May 2026 use TanStack Start, which "renders pages on the server."
  - The platform rebuilt its default stack partly over this. That is the strongest signal the pain was real [I].
- **A cottage industry on HN [V]:**
  - DataJelly: "apps that look great but don't expose content well to search" ([HN](https://news.ycombinator.com/item?id=47680236)).
  - Another founder: "Your app isn't broken. It's invisible." ([HN](https://news.ycombinator.com/item?id=47256593)).
- **Blogs [R]** ([dreasays](https://dreasays.substack.com/p/the-lovable-seo-problem), [dev.to](https://dev.to/jbobbink/why-lovabledev-sites-struggle-with-search-engine-and-llm-indexing-36kp)). Several posts describe "Discovered – currently not indexed" problems and migrations to Next.js.
- **Takeaway [I].** Deterministic rendering to static HTML, with correct metadata, schema.org data and sitemaps, gives "SEO-correct by default." It is cheap to guarantee and easy to demonstrate with a Lighthouse score.

### 1.5 Generic "AI look" (evidence: MODERATE; many commentators, no survey)

- **The look [R].** The recurring list is purple gradients, Inter, three icon cards and glassmorphism ([SmoothUI](https://smoothui.dev/blog/ai-design-slop), [925studios](https://www.925studios.co/blog/ai-slop-web-design-guide), [X post](https://x.com/Manixh02/status/2012387306683146646)).
- **HN, Dec 2025 [V].** One commenter calls this pattern "the default for generating websites in products like Lovable, Bolt, V0" ([HN](https://news.ycombinator.com/item?id=46181319)).
- **HN, Sep 2026 [V].** On taste: these tools "ship someone else's taste," giving "Good website, not your website" ([HN](https://news.ycombinator.com/item?id=49651296)).
- **Risk for us [I].** A curated catalog risks a "catalog look" of its own. The mitigations are in §8.

### 1.6 Lock-in, takedowns, export (evidence: MODERATE)

- **Lovable takedowns [V].** 3 of the 15 most recent negative Lovable reviews say the site was taken down or banned without warning. Example: "took down our live site without any prior warning" (12 Nov 2026) ([Trustpilot](https://www.trustpilot.com/review/lovable.dev?sort=recency&stars=1&stars=2)).
- **Lovable repos [V].** You "cannot connect an existing" Git repository, and "Lovable does not offer a choice of framework or database" ([Lovable FAQ](https://docs.lovable.dev/introduction/faq)).
- **Base44 [V].** Paying extra to export is a complaint on Trustpilot (above).
- **Wix Harmony [R].** A reviewer notes that you get unmetered AI and managed hosting, but a site you cannot export ([vibecoding.app](https://vibecoding.app/blog/wix-harmony-review)).
- **Lock-in fear among learners [V].** In a course of about 600 participants a month, one of the most common questions is whether they can start on one builder and move to another ([HN](https://news.ycombinator.com/item?id=46409987)).

### 1.7 Maintainability and non-technical users getting stuck (evidence: MODERATE)

- **Zapier survey, May 2026 [V-ish]** ([Zapier](https://zapier.com/blog/building-business-software/)). About 800 US employees who build with AI tools; I read it on Zapier's own blog, but the full method is not published.
  - 92% of non-traditional builders hit a major challenge.
  - Bugs were 38%, security and privacy 37%, unusable outputs 29%.
  - Only 54% say most or all of their tools are still in use.
- **HN, Sep 2026 [V]** ([HN](https://news.ycombinator.com/item?id=49807942)). On a recruiting team choosing Lovable "so the recruiting team can maintain it themselves later," a commenter argues they cannot debug what they do not understand.
- **HN, Aug 2025 [V]** ([HN](https://news.ycombinator.com/item?id=45016758)). A consultant now makes a living rescuing people whose vibe-coded projects broke. A rescue market is a strong signal [I].
- **Abandonment [R].** "63% abandon by month three" circulates, but its sourcing is weak, so do not use it ([codingwithvibe](https://codingwithvibe.com/vibe-coding-success-rate-non-developer/)).

### 1.8 Churn and retention: how common is giving up? (evidence: MIXED)

- **Traffic [R].** Barclays analysts, via Business Insider, Sept 2025: Lovable traffic down 40% from its summer peak, v0 down 64% since May, Bolt down 27% since June ([Final Round AI summary](https://www.finalroundai.com/blog/vibe-coding-bubble)).
- **Bolt's CEO [R].** Eric Simons: "The churn rate for everyone is really high" (same source).
- **Lovable's counter-claim [V].** Lovable reports more than 100% net dollar retention and 8M users in Nov 2025 ([TechCrunch](https://techcrunch.com/2025/11/10/lovable-says-its-nearing-8-million-users-as-the-year-old-ai-coding-startup-eyes-more-corporate-employees)).
- **Base44 [V].** Wix says the first quarterly cohort (Sept 2025) retained better than expected at 12 months, and that annual plans rose from about 5% to over 20% of new subscriptions ([Wix Q3 2026 call](https://www.fool.com/earnings/call-transcripts/2026/11/10/wixcom-wix-q3-2026-earnings-call-transcript/)).
- **Reading [I].** Logo churn is high: many tourists try a tool and leave. Revenue retention among the paying core can still be strong. For us, a truly free tier would turn tourists into published sites and badge impressions instead of churned trials.

### 1.9 Slowness (evidence: WEAK as a stand-alone complaint)

I found few complaints about generation speed by itself. Speed comes up mainly in two forms:
- **Crashes.** Example: "Constantly crashes in the last 5 percent" (Bolt Trustpilot).
- **Many slow iterations that also cost money.**

**[I]** "One second" matters less as a cure for a complaint than as a demo and an enabler: it makes free variants, live editing and bulk generation possible.

---

## 2. Voice of the customer: classic no-code (Webflow, Wix, Squarespace, Framer, WordPress/Elementor)

| Platform | 2026 pain | Evidence |
|---|---|---|
| **Squarespace** | Price rises of about 18–26% on several plans in July 2026, sent by email notice. Squarespace later called some notices an error and capped rises at 20%. 300 layoffs (about 19%) on 2 Nov 2026, with coverage linking them to AI site-building competition. | [R] [TechRadar](https://www.techradar.com/pro/im-paying-for-things-i-sincerely-did-not-ask-for-squarespace-users-arent-happy-with-recent-price-hikes), [superapp.dev](https://superapp.dev/blog/squarespace-pricing), [TheStreet](https://www.thestreet.com/employment/squarespace-popular-website-builder-cuts-19-of-jobs-as-ceo-signals-major-shift), [Yahoo Finance](https://finance.yahoo.com/technology/articles/exclusive-squarespace-layoffs-fall-mostly-184122592.html) |
| **Wix** | Renewal jumps of 20–50%+ when promotional pricing ends. Heavy JavaScript and slow pages. | [R] [storebox](https://www.storebox.ai/blogs/wix-vs-squarespace-vs-storebox), [startupowl](https://startupowl.com/grow/wix-vs-squarespace) |
| **Webflow** | Seat pricing: in one example a "$25 site" becomes about $118/mo once two designers and an editor are added. Plan consolidation in May 2026. Steep learning curve. Marketers still depend on developers. | [R] [digihotshot](https://www.digihotshot.com/dh-insights/webflow-pricing-explained), [flowninja](https://www.flowninja.com/blog/webflow-pricing-demystified), [Capterra review](https://www.capterra.com/p/136159/Webflow/reviews/3496892) |
| **Framer** | Add-ons stack up: about $20 per locale and $20 per extra editor. CMS limits. Limits changed without grandfathering. | [R] [thecssagency](https://www.thecssagency.com/blog/framer-pricing-breakdown), [growigami](https://growigami.com/blog/framer-pricing) |
| **WordPress / Elementor** | Plugin vulnerabilities: Patchstack counted 11,334 new WordPress-ecosystem vulnerabilities in 2025 (+42%), 91% of them in plugins. Updates break sites. Bloat. | [R] [web60 citing Patchstack](https://web60.ie/blog/wordpress-plugin-vulnerabilities-surge-2026), [Patchstack whitepaper](https://patchstack.com/whitepaper/state-of-wordpress-security-in-2026/), [WordPress.org forum](https://wordpress.org/support/topic/i-used-to-like-elementor/) |
| **All of them** | Marketers depend on developers or agencies. Webflow's 2026 *State of the Website* (1,000 director-plus marketing and tech leaders at companies of 50+ staff, US/UK/CA) says 93% are at least somewhat reliant on developers, agencies or outside expertise. The 2024 edition said 81% were delayed by developer bottlenecks. | [R] [madebyunderscore](https://www.madebyunderscore.com/blog/state-of-the-website-marketing-leader-needs-to-know), [noqode](https://www.noqode.fr/en/blog/webflow-state-of-the-website-2026), [2024 PDF](https://assets-global.website-files.com/6220f3e30d60ec3ef9a240d3/65a99eb8848d9b3cb00d05b7_The-2024-State-of-the-Website-Report.pdf) |
| **Reliability** | Over Nov 2025–Oct 2026, Squarespace posted 35 incidents on its own status page and Wix posted 32. | [R] [meikuio](https://meikuio.com/is-squarespace-worth-it/) |

**[I] Summary of classic no-code pain in 2026:**
- Price creep: seats, add-ons and renewal hikes.
- Dependence on experts for anything beyond templates.
- WordPress maintenance and security debt.
- The editor is too hard for the owner, while the templates are too rigid for the designer.

Our pitch to these users: the speed of AI, the predictability of a template, and an owner who cannot break the design.

---

## 3. Who the buyers are

Spend and frequency figures are [R] unless marked. "Value of our promise" is [I].

| Segment | What they pay today | How often they build | What "done" means | Value of "instant, free, never breaks, always on-brand" |
|---|---|---|---|---|
| **Local small businesses** (trades, restaurants, salons, clinics) | DIY builders at about $17–$40/mo (Wix Harmony listed at $17 [R], [TechRadar](https://www.techradar.com/pro/best-vibe-coding-tools)). Or a freelancer at about $500–$5,000+ ([Fiverr guide](https://www.fiverr.com/resources/guides/graphic-design/website-design-costs)), or an agency at $3,000–$30,000+ ([WebFX](https://www.webfx.com/blog/web-design/website-costs/)). Maintenance about $35–$100/mo (WebFX). | Once every few years, with rare edits | Looks professional, shows up on Google and Maps, phone, booking and hours work, never has to touch it | **Very high value, low reach.** 17% have no website (Clutch, Aug 2025, n=406, via [Network Solutions](https://www.networksolutions.com/blog/small-business-website-statistics/)). 35.9% of 2.78M Google Maps listings show no website (vendor scan, [Leadity](https://leadity.io/learn/small-business-website-statistics/)). They will not seek out a new builder; reach them through platforms. |
| **Solo founders / indie makers** | Lovable Pro $25/mo for 100 credits ([CloudZero](https://www.cloudzero.com/blog/lovable-pricing/)). Real spend is often higher through top-ups. | Many projects a year: launch pages, waitlists, MVPs | A live page that converts. Increasingly they want an *app* (auth, database) | **Medium.** They love instant and free for landing pages, but their center of gravity is apps with custom logic, which a catalog handles poorly. |
| **Marketers at startups and SMBs** | Webflow $25/mo site plus $39 per full seat ([digihotshot](https://www.digihotshot.com/dh-insights/webflow-pricing-explained)). Landing-page tools. Developer time. | Weekly to monthly: campaigns, launches, events, A/B tests | On-brand, fast, measurable, shipped without a developer ticket, nothing else on the site broken | **Very high.** 93% rely on developers or outside help ([madebyunderscore](https://www.madebyunderscore.com/blog/state-of-the-website-marketing-leader-needs-to-know)). Brand consistency and "can't break the site" are what they buy. |
| **Agencies and freelancers** | Buy seats (Webflow, Framer) and white-label builders (Duda White Label about $149/mo [R], [Findstack](https://findstack.com/products/duda/reviews?page=18)). Sell sites at $1.5k–$25k. | Continuous, many clients | Client signs off, launches on time, client can edit without breaking it, margin protected | **Very high.** In a Goodfirms survey (Apr–May 2026, 300+ firms), 33.5% priced AI-built sites at $500–1,500 and 23% below $500 ([Goodfirms](https://www.goodfirms.co/resources/website-construction-cost-survey); reported, I could not open the page). Prices are being pushed down, so near-zero production cost and bulk output protect margin. |
| **Vertical SaaS / platforms** (POS, booking, hosting, registrars, marketplaces) | Embed Duda-style builders, or build their own. Duda's pitch: sites that sync with platform data ([Duda](https://duda.co/solutions/saas-platforms)). | Millions of tenant sites, created programmatically | Every tenant gets a decent site automatically, synced to platform data, with no support tickets | **Highest economic fit [I].** Per-site AI cost decides viability at millions of tenants. Determinism and "never breaks" cut support cost. Examples: Epos Now partnered with Duda for merchant storefronts in Feb 2026 [R] ([Duda/kustiq](https://kustiq.com/company/duda.co)). Hostinger bundles an AI builder into hosting, with 1M+ users ([Hostinger](https://www.hostinger.com/blog/horizons-turns-one)). |
| **Enterprise marketing teams** | Enterprise Webflow, AEM and Sitecore-class tools, agencies. Lovable claims more than half of the Fortune 500 use it ([TechCrunch](https://techcrunch.com/2025/11/10/lovable-says-its-nearing-8-million-users-as-the-year-old-ai-coding-startup-eyes-more-corporate-employees)). | Continuous: microsites, regional pages, events | Brand-governed, compliant, approved, secure | **High value, slow sale.** "Your design system is the catalog" is a strong enterprise story. Security incidents at code-writers are a door-opener. |
| **Developers** | Cursor, Claude Code, v0, frameworks | Constant | Code they control | **Low.** They don't need it, except as a fast scaffold with clean export. An HN developer used v0 for the UI, then "threw away all the code" ([HN](https://news.ycombinator.com/item?id=47013647)). |

**Who would not care [I]:**
- Developers.
- Founders building logic-heavy SaaS.
- Designers whose product is a bespoke, art-directed site (the Framer power-user crowd). They want control over every pixel, not guarantees.

---

## 4. Market size and money flows (2026)

### Website builder market (analyst estimates, all [R]; definitions vary widely)
- Mordor Intelligence: about $3.57B in 2026 ([Research and Markets/Mordor](https://www.researchandmarkets.com/reports/6260760/website-builders-market-share-analysis)).
- 360iResearch: about $5.4B ([GII](https://www.giiresearch.com/report/ires2000934-website-builders-market-by-platform-type.html)).
- TBRC: about $6.38B ([GII](https://www.giiresearch.com/report/tbrc1983598-website-builder-software-global-market-report.html)).
- Next MSC, broad definition: $18.37B ([Next MSC](https://www.nextmsc.com/report/website-builder-software-market-ic6202)).
- AI website builders specifically: about $3.24B in 2026 per Precedence Research, quoted in [Hostinger stats](https://www.hostinger.com/blog/?p=9103).
- **[I]** These look low. Wix alone ended Q3 2026 at $2.021B total ARR [R] ([GlobeNewswire release](https://www.globenewswire.com/news-release/2026/11/10/3399144/0/en/wix-reports-third-quarter-2026-results.html), via search summary; the page itself blocked fetching). Bottom-up, from public builder revenue plus AI builders plus agency spend, the real money is much larger than the narrow reports suggest.

### AI app and site builder revenue (dated)

| Company | Figure | Date | Label |
|---|---|---|---|
| Lovable | $100M ARR | Jun 2025 | [V] [TechCrunch](https://techcrunch.com/2025/11/10/lovable-says-its-nearing-8-million-users-as-the-year-old-ai-coding-startup-eyes-more-corporate-employees) |
| Lovable | $400M ARR | Feb 2026 | [R] [TechDogs](https://www.techdogs.com/tech-news/td-newsdesk/lovable-hits-400m-arr-in-february-adds-100m-in-a-month-with-146-employees) |
| Lovable | $500M annualized run-rate | 9 Jun 2026 | [R] [darkroom](https://www.darkroomagency.com/observatory/how-lovable-growth-reached-500m-arr-in-19-months), [devgraphiq](https://devgraphiq.com/lovable-stats/) |
| Lovable | $600M run-rate (single source, unconfirmed) | Sep 2026 | [R] [okara](https://okara.ai/blog/how-lovable-grew) |
| Lovable | ~8M users; ~100k new projects a day | Nov 2025 | [V] TechCrunch, above |
| Lovable | 200k+ projects a day | 2026 | [R] [TIME100](https://time.com/collection/time100-most-influential-companies/2026/lovable/) |
| Replit | $150M annualized | Sep 2025 | [R] Reuters, via [clinkbill](https://clinkbill.com/arr-leaderboard/replit) |
| Replit | ~$525M annualized (Sacra estimate); company "on track" for $1B by end-2026; $9B valuation | Apr / Mar 2026 | [R] [valueaddvc](https://valueaddvc.com/blog/how-does-replit-make-money-525m-arr-9b-valuation-and-the-ai-agent-business-model-explained), [techbuzz](https://www.techbuzz.ai/articles/replit-hits-9b-valuation-eyes-1b-arr-in-monster-round) |
| Base44 (Wix) | ~$3.5M ARR at an $80M acquisition | Jun 2025 | [V] [TechCrunch](https://techcrunch.com/2025/06/18/6-month-old-solo-owned-vibe-coder-base44-sells-to-wix-for-80m-cash) (price); ARR [R] |
| Base44 (Wix) | ~$100M → ~$150M → "nearing $250M" ARR | Mar / May / Nov 2026 | [R] [GuruFocus](https://www.gurufocus.com/news/9189756/wixcom-ltd-wix-q3-2026-earnings-call-highlights-base44-arr-nears-250-million-as-ai-bet-reshapes-growth-outlook), [FourWeekMBA](https://fourweekmba.com/ai-wixs-base44-nears-250m-arr-as-free-cash-flow-falls-41/) |
| Bolt.new | $4M ARR in about 4 weeks; ~$40M ARR | Nov 2024; Mar 2025 | [R] [Growth Unhinged](https://www.growthunhinged.com/p/boltnew-growth-journey) |
| Framer | ~$50M ARR; $2B valuation | Aug 2025 | [R] [Sacra](https://sacra.com/c/framer/), [techbuzz](https://www.techbuzz.ai/articles/framer-hits-2b-valuation-with-100m-series-d-funding) |
| Hostinger AI Builder (Horizons) | 1M+ users; 49% of prompts are business, marketing or portfolio sites | Mar 2026 | [V] [Hostinger](https://www.hostinger.com/blog/horizons-turns-one) |
| Durable | ~$990K revenue (estimate; claims 3M users) | 2025 | [R] [GetLatka](https://getlatka.com/companies/durable.co) — weak |

**[I] Where the money flows:**
- The AI builders added well over $1B of new ARR in about 18 months.
- Much of it is people building *websites*, not apps. 49% of Hostinger AI Builder prompts are business, marketing or portfolio sites.
- That spend is a website budget that used to go to Squarespace, Wix or a freelancer. Squarespace's 19% cut is consistent with this.

### Price points that work (all [R] unless marked)
- **$17–25/mo** for consumers and SMBs: Wix Harmony $17, Lovable Pro $25, Webflow Premium $25.
- **$20–40 per seat** for teams: Webflow $39 full seat, Framer $20 editor.
- **About $149/mo** for agency white-label (Duda).
- Annual plans are rising. Base44's share went from about 5% to over 20% of new subscriptions [V] ([Wix Q3 call](https://www.fool.com/earnings/call-transcripts/2026/11/10/wixcom-wix-q3-2026-earnings-call-transcript/)).
- Agency output prices for AI-built sites are sliding into the $500–1,500 band (Goodfirms [R]).

---

## 5. Economics: what a generation costs code-writers, and what near-zero unlocks

### What it costs them
- **Gross margins, mid-2025 [R]** ([The Information on X](https://x.com/theinformation/status/1954939636096041346), [Threads](https://www.threads.com/@theinformation/post/DNIyKiciokL/the-gross-margins-of-ai-coding-companies-reveal-the-high-costs-associated-with-t)):
  - Replit swung between 36% and **−14%**.
  - Lovable was about 35% in May 2025.
  - StackBlitz (Bolt) was about 40%.
  - Commentators note these may flatter reality, because free-user inference was booked outside cost of revenue ([Rubenfeld](https://charlesrubenfeld.substack.com/p/blame-competition-not-compute-for)).
- **Base44 (Wix), the best primary data point [V]** ([Wix Q3 2026 call](https://www.fool.com/earnings/call-transcripts/2026/11/10/wixcom-wix-q3-2026-earnings-call-transcript/)):
  - Non-GAAP gross margin of "58% in the third quarter," up from near zero in Q1 2026 (the Q1 figure is [R] via [GuruFocus](https://www.gurufocus.com/news/9189756/wixcom-ltd-wix-q3-2026-earnings-call-highlights-base44-arr-nears-250-million-as-ai-bet-reshapes-growth-outlook)).
  - Free-user AI costs fell by "more than 50%" quarter on quarter, mainly through Wix's own model, Base 1.
  - The target is total AI costs for free and paid users at "less than 30% of total bookings" in the second half of 2026.
  - So even after heavy optimization, AI is about a third of revenue. A normal SaaS cost of goods for everything is around 20% [I].
  - Wix also cut its FCF-margin guidance because of Base44 marketing spend [R] ([FourWeekMBA](https://fourweekmba.com/ai-wixs-base44-nears-250m-arr-as-free-cash-flow-falls-41/)).
- **Per-generation cost estimates [R, weak]:**
  - An agentic landing page on a frontier model costs about $1–3 in tokens ([founden](https://founden.ai/articles/claude-sonnet-5-for-building-websites-2026)).
  - Estimates vary roughly 250× between sources ([Taskade](https://www.taskade.com/blog/bolt-review), [nocode.mba](https://www.nocode.mba/articles/bolt-vs-lovable-pricing)).
  - Fix loops multiply this. One estimate says Bolt's token use roughly doubles in debugging ([capitalandcompute](https://capitalandcompute.net/blog/vibe-coding-cost-economics-2026/)).
- **Sandboxes [R].** E2B is about $0.000014 per vCPU-second, roughly $0.10 an hour for a 2-vCPU sandbox, plus memory ([morphllm](https://www.morphllm.com/e2b-pricing)). Small per session, but it is paid for every live preview and agent run.
- **Free tiers are rationed because of this [R]:**
  - Lovable's free tier is about 5 credits a day, capped at 30 a month ([costbench](https://costbench.com/software/ai-coding-assistants/lovable/free-plan/)).
  - v0's free tier is $5 of credits ([Vercel](https://vercel.com/blog/updated-v0-pricing)).

### What near-zero marginal cost unlocks [I, with evidence anchors]
1. **A free tier with no AI meter.** Unlimited generations, edits, undo and variants. Every competitor rations free use. Lovable's growth engine is its free tier plus the badge ([growthcurve](https://growthcurve.co/lovable-free-tier-acquisition-channel)), and we can be more generous than anyone running a frontier model per turn.
2. **Never charging for mistakes.** If the decision model picks a wrong variant, a retry costs effectively nothing. This answers §1.1 head-on.
3. **Hundreds of variants.** Show 12 layouts or palettes at once; let marketers generate a page per ad group or audience.
   - Caution: personalization lift evidence is modest. A 2,000-page test study found median AI lift of +3% for B2B SaaS and +1% for B2B services [R] ([digitalapplied](https://www.digitalapplied.com/blog/landing-page-conversion-study-2000-pages-tested-2026)).
   - So sell speed and volume, not magic conversion lifts.
4. **Per-visitor or per-segment rendering at the edge.** Deterministic, cheap renders by industry, location or referrer.
5. **Bulk and programmatic creation for platforms and agencies.** A site for every tenant, listing or location. This is Duda's market, rebuilt with near-zero AI cost per site.
6. **An API embedded in other products** (POS, booking, CRM, registrars, and AI assistants via MCP or app directories).
7. **A wider funnel through reproducibility.** The same spec gives the same site, so we can cache, diff, roll back and run tests. These are the "never breaks" guarantees no code-writer can make.

**Strategic caution [I].** Cost advantages decay. Wix has already cut free-user AI cost by more than half with its own model, Harmony's AI is unmetered at $17 ([vibecoding.app](https://vibecoding.app/blog/wix-harmony-review)), and ChatGPT Sites has bundled site hosting into Plus/Pro since 9 July 2026 ([OpenAI help](https://help.openai.com/en/articles/20001339-creating-and-using-chatgpt-sites), [Android Authority](https://www.androidauthority.com/chatgpt-sites-new-features-3710506/)). Build the moat from guarantees (never breaks, on-brand, reproducible, exportable), the API and distribution. Do not rely on cost alone.

---

## 6. Distribution: how the fastest builders got users

| Builder | What worked | Label |
|---|---|---|
| **Lovable** | Founder build-in-public on X. Generous free tier. Free projects on lovable.app subdomains carry a badge, so every published site is an ad. #BuiltWithLovable sharing. Later TikTok creator affiliates, Google paid search, enterprise LinkedIn outreach, a partner and agency network. | [R] [Demand Curve](https://www.demandcurve.com/newsletters/growth-newsletter-267), [growthcurve](https://growthcurve.co/lovable-free-tier-acquisition-channel), [systemaic](https://www.systemaic.com/teardowns/lovable), [nrich](https://nrich.io/challenger-brand-gtm-library/lovable) |
| **Bolt.new** | One launch tweet, then a tutorial with creator Greg Isenberg described as "particularly explosive." Hackathons. $4M ARR in about 4 weeks. | [R] [Growth Unhinged](https://www.growthunhinged.com/p/boltnew-growth-journey), [Evil Martians](https://evilmartians.com/chronicles/bolt-new-from-stackblitz-how-they-surfed-the-ai-wave-with-no-wipeouts) |
| **Base44** | Solo founder sharing the build on LinkedIn and X, then word of mouth: 10k users in 3 weeks, 250k in 6 months, no paid marketing. Under Wix, heavy paid marketing. | [V] [TechCrunch](https://techcrunch.com/2025/06/18/6-month-old-solo-owned-vibe-coder-base44-sells-to-wix-for-80m-cash); [R] FourWeekMBA |
| **v0** | Vercel's developer ecosystem and its one-click deploy path. | [I] |
| **Hostinger AI Builder** | Bundled into a hosting base. Strong in Brazil and India. Remixable templates pay creators up to $150 per referral. | [V] [Hostinger](https://www.hostinger.com/blog/horizons-turns-one) |
| **Durable** | "Website in 30 seconds" demo aimed at small businesses. Claims 3M users, but revenue estimates are tiny, so treat the claim with caution. | [R] [GetLatka](https://getlatka.com/companies/durable.co) |

**Channels for a builder whose demo is "a full site in one second" [I]:**
1. **The demo is the ad.** Real-time screen recordings for X, TikTok and Shorts: type a business name, the site appears, then flip through 10 styles in 5 seconds. Bolt and Lovable grew on creator demos, and our demo is quicker to watch.
2. **The redesign hook.** "Paste any URL and see it redesigned in one second." It is viral, and it doubles as an agency sales tool: freelancers send prospects a redesigned site. Respect copyright and robots; reuse only the owner's own content.
3. **A badge on free hosted sites**, the Lovable loop. With zero AI cost per site we can host free sites at scale.
4. **Agency and freelancer seeding.** Many sites per agency; white-label; outreach that pairs a pre-built preview with "you have no website" for the 17–36% of local businesses without one. Build anti-spam and opt-in rules in from day one.
5. **Platform partnerships via API**: POS, booking, registrars, hosting, marketplaces. This is the Duda channel.
6. **Inside AI assistants.** ChatGPT now builds sites itself, so offer an MCP server or app that produces *designed, reliable* sites inside ChatGPT, Claude and others. Be the renderer they call, not a competitor they bury.
7. **Templates and remix marketplace** with creator revenue share, Hostinger-style.

---

## 7. Unmet jobs, ranked by evidence strength

| # | Unmet job | Evidence strength | Key sources |
|---|---|---|---|
| 1 | **"Let me iterate without paying for your mistakes"**: predictable, flat cost; free retries | **Strong** (10+ independent sources across 4 vendors, plus vendor admissions) | Trustpilot ×4; [The Register](https://www.theregister.com/2025/09/18/replit_agent3_pricing/); [Vercel forum](https://community.vercel.com/t/v0-pricing-crisis-user-sentiment-analysis/12382); [Lovable FAQ](https://docs.lovable.dev/introduction/faq) |
| 2 | **"Ship it safely"**: no leaked keys, data or source; security by default | **Strong** (3 platform incidents with primary or major-press sources, plus the Veracode study) | [Lovable blog](https://lovable.dev/blog/our-response-to-the-april-2026-incident); [The Hacker News](https://thehackernews.com/2025/07/wiz-uncovers-critical-access-bypass.html); [Veracode](https://www.veracode.com/press-release/ai-generated-code-poses-major-security-risks-in-nearly-half-of-all-development-tasks-veracode-research-reveals/) |
| 3 | **"Let marketing change the site without developers or breakage"** | **Strong** (survey of 1,000 leaders, repeated across years; read via secondary sources) | [Webflow SOTW 2026 via madebyunderscore](https://www.madebyunderscore.com/blog/state-of-the-website-marketing-leader-needs-to-know) |
| 4 | **"Change only what I asked"**: scoped, non-regressing edits | **Moderate** (6+ anecdote sources, a help industry, no measurement) | §1.2 |
| 5 | **"Be found"**: SEO and AI-search visibility by default | **Moderate–strong** (Lovable changed its default stack; multiple fix-it startups) | [Lovable FAQ](https://docs.lovable.dev/introduction/faq); [HN](https://news.ycombinator.com/item?id=47680236) |
| 6 | **"Own it"**: export, portability, no surprise takedowns | **Moderate** | Trustpilot (Lovable, Base44); [vibecoding.app](https://vibecoding.app/blog/wix-harmony-review) |
| 7 | **"Something my non-technical team can maintain"** | **Moderate** | [Zapier](https://zapier.com/blog/building-business-software/); [HN](https://news.ycombinator.com/item?id=49807942) |
| 8 | **"Make it look like us, not like AI"** | **Moderate** (commentary, no survey) | §1.5 |
| 9 | **"No renewal shock, no seat creep"** (classic builders) | **Moderate** | §2 |
| 10 | **"Stop the WordPress maintenance and security treadmill"** | **Strong data, weak link to switching** | [Patchstack via web60](https://web60.ie/blog/wordpress-plugin-vulnerabilities-surge-2026) |
| 11 | **"Many sites at once"** (agencies, platforms, locations) | **Inferred** from Duda's business, agency price pressure and Hostinger bundling; no direct survey | §3 |

---

## 8. The five sharpest positioning angles

1. **"Iterate for free. Forever."** No credits, no meter, no paying for AI mistakes.
   - *Pain:* credit burn and fix loops (§1.1, strongest evidence).
   - *Segment:* solo founders and SMB owners who churned off Lovable, Bolt, v0 or Replit.
   - *Proof to show:* a counter of edits made versus dollars spent, always $0. Put Trustpilot quotes next to it in ads, without naming competitors.
2. **"Edits that can't break your site."** Every change is a typed diff to a spec, with undo, previews and identical output for the same spec.
   - *Pain:* fix loops and changes to unrelated parts (§1.2); marketers' fear of breaking the site (§2).
   - *Segment:* startup and SMB marketers; agencies handing sites to clients.
   - *Proof:* publish an "edit isolation" benchmark showing unrelated regions unchanged across 1,000 edits.
3. **"Your brand is the only design system it knows."** Load fonts, colors, spacing and approved blocks; every output is on-brand by construction.
   - *Pain:* generic AI look (§1.5); 93% depend on developers or agencies (§2).
   - *Segment:* enterprise and scale-up marketing teams; agencies with house styles.
4. **"Secure and searchable by construction."** No generated runtime code, static and server-rendered HTML, valid metadata and schema.org data, nothing secret in the client.
   - *Pain:* the Lovable and Base44 incidents and the 45% insecure-code rate (§1.3); invisible single-page apps (§1.4).
   - *Segment:* companies burned by vibe-coded launches; regulated SMBs (clinics, finance, legal); IT departments approving "citizen-built" sites.
5. **"A million sites, one API, near-zero cost."** Programmatic, white-label, reproducible site generation for platforms and agencies.
   - *Pain:* per-site AI cost makes bulk generation uneconomic for code-writers (§5). Agencies' prices are being pushed down (§3).
   - *Segment:* vertical SaaS, POS and booking platforms, hosts and registrars, agency networks.
   - *Note:* this is the one most likely to produce durable, high-ARR contracts [I].

---

## 9. Pains our approach does NOT fix, and the best idea for each

| Pain we don't fix | Why | Best fix anyway [I] |
|---|---|---|
| **Custom app logic**: auth flows, dashboards, bespoke data models (Lovable's core) | A catalog cannot express arbitrary logic | Ship *functional blocks* backed by managed services: forms, booking, payments, gated content, CMS, simple database tables. Add an escape hatch: export clean code and hand off to Claude Code or Lovable, with a spec-to-code round trip. Let a sandboxed LLM generate a custom block when needed, then review it and promote it into the catalog. |
| **Truly distinctive, art-directed design** | The catalog's look can itself become generic | (a) A huge variant space through parametric themes (type scale, radius, density, motion, art direction). (b) Extract brand tokens from the logo, existing site or brand PDF. (c) A designer marketplace for premium blocks and themes with revenue share. (d) Per-customer custom blocks for enterprise. |
| **Words and images**: the decision model can't write text | Copy quality is half of "looks designed" | Use a small, cheap LLM only for copy, inside length budgets per slot, so text can't break layout. Pull real content from Google Business Profile, the existing site, menus and reviews. Add image generation or curated stock, constrained by brand palette. |
| **Requests outside the catalog** ("make it like Stripe's hero", "move this 3px") | The decision model can only choose existing options | Allow bounded, typed overrides in the spec (spacing, alignment, per-slot colors) with validation. Add an LLM fallback that edits the spec within its schema. Log every unmet request to drive catalog growth. Say plainly when something isn't supported. |
| **Traffic and customers**: a site isn't a business | Most SMB value comes from being found and booked | Integrate Google Business Profile, local SEO, reviews, booking and ads; generate a matching ad or landing page per campaign. |
| **Domain, DNS and email setup friction** | Non-technical users stall at go-live | Bundle domains (registrar partnership), one-click DNS, and a visible checklist that walks them to go-live. |
| **Trust and abuse risk of bulk generation** (spam sites, impersonation) | Cheap bulk output attracts abuse | Verify ownership (Google Business Profile / domain checks), rate limits, abuse detection, no unsolicited publishing of a business's site without opt-in. |
| **Platform lock-in fears** | Even a reliable host can be a cage | Make export a headline feature: open spec format, clean framework code, self-host option. This turns a known pain (§1.6) into an angle. |
| **Copycat risk on cost** (Wix Base 1, ChatGPT Sites) | Cost advantages narrow | Compete on guarantees, the API, and distribution inside AI assistants (MCP). Be the renderer the big models call. |

---

## 10. What I could not verify

- **Reddit.** The search tool refuses the domain, so I captured no r/lovable, r/webflow, r/nocode or r/smallbusiness threads directly. Reddit-based claims appear only through secondary blogs.
- **Search budget.** The session's web-search limit ran out before I could check:
  - Stack Overflow 2025 survey figures on vibe coding and trust in AI.
  - G2 category data.
  - YouTube reviews and Discord sentiment.
  - Durable's real revenue.
  - Duda's revenue.
  - Product Hunt reviews.

  These remain gaps. A follow-up session could close them.
- **Out-of-scope edit frequency.** No study measures how often AI builder edits break or change unrelated parts. The pattern is strong; the rate is unknown.
- **Abandonment rates.** None exists from a credible source. "63% by month three" is poorly sourced.
- **Lovable 2026 gross margin and per-user inference cost.** Not found; the latest is about 35% (May 2025, The Information).
- **Lovable $600M run-rate (Sep 2026).** One source only.
- **Lovable training its own model.** An HN comment claims it; I found no confirmation.
- **Webflow 2026 *State of the Website* 93% figure.** Read via secondary write-ups, not the PDF.
- **Base44 ~$250M ARR and "near-zero Q1 gross margin."** From earnings-coverage aggregators. The 58% Q3 gross margin and "<30% of bookings" AI cost come from the call transcript I read.
- **Market-size reports.** They disagree by 5×. Treat as directional only.
- **Goodfirms survey.** The page blocked fetching; the figures come via search summary only.
