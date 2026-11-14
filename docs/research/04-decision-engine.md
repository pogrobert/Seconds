# 04 — The decision engine: brief to site spec in about one second

Research date: 13–14 November 2026. Every price and speed carries its source and the date it was read.

**Evidence labels**
- **[V] verified**: read on the primary source (vendor docs or pricing page, the paper itself, a standard, or the benchmark operator's own data).
- **[R] reported**: a secondary source, a vendor's claim about its own performance, or a community list I could not fully check.
- **[E] estimate**: my own calculation or judgment. The inputs are named.

**Limits of this research.** The shared web-search budget ran out partway through. After that I could only fetch URLs I already had, read primary docs with `curl`, and query public APIs (the OpenRouter catalog, Artificial Analysis page data, and GitHub). Section 9 lists what is still unverified. I made no paid model calls, so none of the Jev latency figures below are my own measurements.

---

## 0. The answer in one page

**Proposed architecture: "priors in code, judgments in Jev, prose in a fast LLM, and plans only on the slow path."**

1. **Jev never plans.** For each archetype, code holds a default page (section set, canonical order, theme). Jev *adjusts* that default by answering about 90 atomic questions in **one request**: archetype, vertical, tone, theme facets, a relevance Noul for each candidate section, and a speculative variant Choice for every candidate section. Code reads the probabilities and assembles the spec. This sidesteps Jev's documented weakness in "root selection, grouping, and deciding when to stop", which the json-render team hit in practice ([json-render Jev README](https://github.com/vercel-labs/json-render/tree/main/apps/web/lib/jev)) [V].
2. **Copy comes from a fast LLM in two waves, with an instant fallback.** Wave 1 (brand kernel: name, hero, CTA, value props) starts at t=0, in parallel with Jev. Wave 2 (section-specific slots) starts as soon as Jev answers. Until the generated copy arrives, slots hold entity-filled copy from a pre-written library, so the page looks finished from the first paint and then improves in place.
3. **Edits use a fast path (Jev classifies the operation, picks the target and parameters, and code applies a JSON Patch) and a slow path** (a fast reasoning LLM whose only tools are spec operations). The slow path runs speculatively in parallel whenever Jev's confidence or a "compound or vague" Noul says it might be needed.

**Budget (details in section 7)**

| | Wall clock (US user) | Marginal model cost | Basis |
|---|---|---|---|
| First site, complete structure with library copy | ~0.35–0.45 s | ~$0.0005 (Jev) | [E] from Jev's documented ~100 ms latency and fan-out docs |
| First site, bespoke copy streamed in | ~0.7–0.9 s | +$0.001 (Groq gpt-oss-20b) to $0.004 (Cerebras gpt-oss-120b) | [E] from Artificial Analysis medians and OpenRouter/Groq prices |
| Typical edit (fast path) | ~0.25–0.35 s | ~$0.0002 | [E] |
| Edit that needs new text | +0.3–0.45 s | +~$0.0005 | [E] |
| Slow-path edit (compound, vague, unknown reference) | ~0.8–1.5 s | ~$0.001–0.003 | [E] |

All-in model cost is roughly **half a cent per generated site** plus about $0.0002 per edit. That is low enough to give away. Infrastructure and images are not included.

**Jev in one line.** It is the right fast-path primitive: ~100 ms, flat latency as questions are added, free output, calibrated probabilities, and output that is type-safe by construction. But it is a two-month-old API with mid-tier accuracy, order bias, no seed, and a single US-West region at launch. Treat it as one interchangeable provider behind a `/v1/systemone`-shaped interface. By November 2026, OpenAI, Google, Cloudflare and others ship compatible or near-compatible decision APIs, so this is cheap to do (section 1.6).

---

## 1. Jev and TypeSafe in depth

### 1.1 What Jev is, with current numbers

| Property | Value | Source |
|---|---|---|
| Current model | `jev-1.14.0`, released 14 Oct 2026; `jev-1.13.0` still served | [Models](https://docs.typesafe.ai/models), [Changelog](https://docs.typesafe.ai/changelog) [V] |
| Price | $0.042 per million input tokens, output free | [Models](https://docs.typesafe.ai/models) [V], read 2026-11-13. The Vercel Gateway lists the same price ([Vercel](https://vercel.com/ai-gateway/models/jev)) [V] |
| Context | 64k per request and 32k per question (state plus one question). An opt-in `TypeSafe-Danger-Zone-Long-Context` header raises both to 262k, "slower and less accurate" | [Models](https://docs.typesafe.ai/models) [V] |
| Question types | Choice (up to 255 options), Score (2–10 levels), Noul (P(yes)), Box (images, 1.14 only) | [Choice](https://docs.typesafe.ai/primitives/choice), [Score](https://docs.typesafe.ai/primitives/score), [Primitives](https://docs.typesafe.ai/primitives) [V] |
| Questions per request | No limit other than the context limits. All questions are evaluated "in parallel and in isolation against the same state". "Adding questions barely changes the response time" | [Primitives](https://docs.typesafe.ai/primitives), [Introduction](https://docs.typesafe.ai/introduction) [V] |
| Latency | "Most calls complete in about 100 ms" ([How to build](https://docs.typesafe.ai/concepts/how-to-build-with-system-one)). "70ms–500ms" end to end, with evals "run from our laptops on the West Coast (this is where our service is currently based)" ([launch post](https://typesafe.ai/blog/introducing-system-one-models-and-jev), 15 Sep 2026) | [R] (vendor) |
| Request limits | 32 MiB body, 64 nesting levels, gzip/zstd accepted | [Errors](https://docs.typesafe.ai/api/errors) [V] |
| Rate limits | Per organization, in tokens/s and requests/s. Values appear only in the console; increases by form | [Models](https://docs.typesafe.ai/models) [V] |
| Pinning | Aliases `jev-latest` and `jev-preview` move. Pin the versioned ID; each response carries the versioned ID that answered | [Models](https://docs.typesafe.ai/models) [V] |
| Deprecation | "60 days warning before jev-1.13.0 is formally deprecated, and 30 days for jev-1.14.0. We'll release a deprecation policy prior to this" | [Jev 1.14 post](https://typesafe.ai/blog/jev-1-14), 14 Oct 2026 [V] |
| Customization | No fine-tuning or LoRA; the same weights for everyone; customize through state and criteria | [Models](https://docs.typesafe.ai/models) [V] |
| Data | Not trained on customer data; ZDR for enterprise | [Models](https://docs.typesafe.ai/models), [Legal](https://docs.typesafe.ai/legal) [V] |
| SDKs | Python and JS. JS v0.7.0 (14 Oct 2026) made breaking changes (requires Node 22, stopped exporting payload types) one month after the first public release on 11 Sep | [JS changelog](https://docs.typesafe.ai/sdk/javascript/changelog) [V] |
| Access paths | TypeSafe direct; Vercel AI Gateway (`typesafe-ai/jev`, providers listed as typesafe-ai and digitalocean); Cloudflare Workers binding `env.AI.run('typesafe/jev')`; OpenRouter decisions endpoint | [Vercel Gateway page](https://vercel.com/ai-gateway/models/jev) [V]; [Vercel "6 ways to integrate Jev"](https://vercel.com/i/jev-integrations), updated 16 Oct 2026 [V] |

**Documented failure modes** ([Model jaggedness](https://docs.typesafe.ai/model-jaggedness)) [V]: literal reading; math and counting; date comparison; indirection; large state full of irrelevant detail ("context rot"); adversarial content; contradictory instructions and criteria; **Choice option order** ("Jev leans toward the option that comes first"); and generation ("If you really need to generate text... there are other models for that").

**Confidence** is a deterministic function of the returned distribution. For a three-option Choice it is `(3 × max p − 1)/2`. Noul has no separate confidence ([Confidence](https://docs.typesafe.ai/confidence)) [V].

### 1.2 Lessons from the docs that shape the design

- **Speculative fan-out.** Ask every question you *might* need in one request and let code ignore the rest. In the smart-home demo, "what action on the lights?" is asked before anything has confirmed the request is about lights ([Fan-out](https://docs.typesafe.ai/patterns/fan-out), [Smart home](https://docs.typesafe.ai/demos/smart-home)) [V]. Speculative questions are "close to free" ([Primitives](https://docs.typesafe.ai/primitives)) [V].
- **Batching barely costs anything.** Thirteen questions over a ~54,000-character article took **0.24 s and $0.000497 batched**, against 2.81 s and $0.00609 as 13 sequential calls. Answers were identical or within 0.015 std dev ([Parallel questions](https://docs.typesafe.ai/cookbooks/parallel_questions), jev-1.14.0, Nov 2026) [V, vendor-run]. Dividing $0.000497 by $0.042/M gives about 11.8k billed tokens, so **the state is billed once per request, not once per question** [E].
- **Function calling as Choices.** Each closed-set argument becomes a Choice, so "whatever reaches the function is a value the function accepts" ([Function calling](https://docs.typesafe.ai/cookbooks/function_calling)) [V]. This is exactly the right shape for spec edit operations.
- **Multi-select through a shrinking-options loop.** A Choice returns one value. To find *all* items, the cart cookbook loops "which remaining item?" until `nothing_else` ([Shopping cart](https://docs.typesafe.ai/cookbooks/cart_from_primitives)) [V]. That loop is sequential, so for section membership use **one Noul per candidate in parallel** instead.
- **Companion Noul.** A Choice always picks something, so pair it with "does any option fit?" ([Companion Noul](https://docs.typesafe.ai/patterns/companion-noul), from the docs index) [V].
- **Large option spaces.** Above 255 options, or with long option texts (only "about forty" long plot summaries fit), use parallel Nouls, then re-read the top candidates, then a final Choice. The right film came first 78% of the time this way, against 33% for an embedding shortlist ([Infinite cardinality](https://docs.typesafe.ai/cookbooks/infinite_cardinality_choice)) [V, vendor-run].
- **Picking free text from extracted candidates.** Jev cannot write the business name, but it can pick the right span from regex or NER candidates ([Pre-parsed value extraction](https://docs.typesafe.ai/llms.txt), cookbook listed in the docs index) [V].
- **Cascades.** A cheap LLM answers, Jev checks each rule, and a reasoning model is called only when a check fires. Escalating 13% reached 96.5% accuracy at about ¼ of the reasoning model's cost; Jev's checks cost $0.04 per 1,000 tasks ([SDE cascade](https://docs.typesafe.ai/cookbooks/sde_cascade)) [V, vendor-run].
- **Compound requests.** The smart-home demo asks a Noul "is this more than one distinct action?" and, if so, has an LLM split the request into atomic commands that go back to Jev ([Smart home](https://docs.typesafe.ai/demos/smart-home)) [V]. This is the template for multi-step edits.

### 1.3 Decomposing "brief → site spec"

Design rules: (a) code owns the defaults and the stopping rules; (b) every judgment is a single gut-check; (c) one request for the whole page; (d) variants are asked speculatively for every candidate section; (e) **content models are defined per section *type*, not per variant**, so copy can be generated before the variant is known and survives variant swaps.

**Request A, "Plan" (one Jev call, sent on Enter or speculatively while the user types)**

State (~250 tokens): `{brief, locale, candidate_entities: [spans from regex/NER], known_facts: {...}}`.

| # | Question | Type | Count | ≈ tokens |
|---|---|---|---|---|
| 1 | Archetype (SaaS, local service, restaurant, portfolio, agency, event, single-product store, nonprofit, course, app, clinic, real estate, …; ~24 options with one-line criteria) | Choice | 1 | 480 |
| 2 | The same archetype question with the option order rotated (debiasing, section 1.5) | Choice | 1 | 480 |
| 3 | Vertical (~150 options from the internal taxonomy) plus a companion "none fits" Noul | Choice + Noul | 2 | 930 |
| 4 | Primary conversion goal (book, buy, sign up, call, visit, download, donate, contact) | Choice | 1 | 150 |
| 5 | Audience (consumers, businesses, both, donors, students, internal) | Choice | 1 | 100 |
| 6 | Tone axes: formality, playfulness, luxury, technicality, warmth, energy (5 described levels each) | Score | 6 | 500 |
| 7 | Theme facets: palette family (16), type pairing (12), density (Score), corner style (4), imagery style (8), dark-first (Noul) | mixed | 6 | 650 |
| 8 | Section relevance: "Should a site for this brief include {section, described}?" for ~30 candidates | Noul | 30 | 1,200 |
| 9 | Speculative variant for each candidate section (~6 described variants each) | Choice | 30 | 4,350 |
| 10 | Facts that drive rules: has pricing, physical location, booking, team, e-commerce, multilingual, regulated (medical, legal) | Noul | 8 | 240 |
| 11 | Entities: business name, city and primary service, each a Choice over extracted spans plus "not stated" | Choice | 3 | 300 |
| 12 | Order adjusters for the few genuinely ambiguous pairs (e.g. "is social proof the strongest argument here?" decides whether testimonials move up) | Noul | ~5 | 200 |
| | **Total** | | **~90 questions** | **~9.6k questions + 0.25k state ≈ 10k tokens** |

Code then (a) takes the archetype's default section list; (b) adds sections whose relevance Noul exceeds an add threshold and removes optional ones below a drop threshold, with minimum and maximum counts per archetype (10 sections for a landing page); (c) orders them by the archetype template plus the adjuster Nouls; (d) reads each chosen section's variant answer; (e) maps tone and theme facets to design tokens through a lookup table; (f) validates against the schema. All of this is deterministic code.

**Cost per Plan request:** 10k × $0.042/M = **$0.00042** [E, from the [V] price]. That is about 2,400 site plans per dollar.

**Latency per Plan request:** ~120–250 ms from a US region [E]. Evidence behind it: 13 questions over ~12k tokens took 0.24 s ([Parallel questions](https://docs.typesafe.ai/cookbooks/parallel_questions)) [V, vendor-run]. Vals measured a median of 0.10 s for a single call, 0.11 s under load, and "near 0.12 s" at 64 judgments per request ([Vals AI](https://www.vals.ai/blogs/independent-evaluation-of-jev), 6 Oct 2026) [R, third-party]. Our request is 90 questions at ~10k tokens, so it is not directly measured. Add 100–250 ms of round trip for users far from US-West [E].

**Optional Request B, "Fill" (after code has assembled the page, ~3–7k tokens, ~$0.0002, ~150 ms)**
- Choose an image for each section from 8–12 retrieved candidates, described by captions. Choices over text are cheaper and more reliable than image input, which is still behind a "danger zone" header ([Jev 1.14 post](https://typesafe.ai/blog/jev-1-14)) [V].
- Choose library copy: for each slot, a Choice over the top 20–30 retrieved library lines (section 3).

**Request E, "Edit" (each chat turn, ~3–5k tokens, ~$0.0002)**

State: `{message, spec_outline: [{id, type, variant, label}], theme_summary, selection (if the user clicked an element)}`.

Questions, all in one request:
- Operation (Choice): add section, remove, move, swap variant, restyle theme, edit copy, edit image, undo or revert, ask a question, other.
- Target section (Choice over the current section labels).
- New section type (Choice over ~30).
- Destination (Choice over before/after each section).
- Theme property (Choice) and direction (Score: much less … much more).
- Style lexicon match (Choice over ~200 style adjectives, section 4).
- Reference match (Choice over the reference-site library, plus a "none" companion Noul).
- `is_compound`, `needs_new_text`, `is_vague`, `mentions_external_site` (Nouls).

The json-render composer uses the same edit protocol: add, replace, remove, move, with "replacements and moves select a target, then choose a valid recipe or destination in a second evaluation" ([README](https://github.com/vercel-labs/json-render/tree/main/apps/web/lib/jev)) [V]. Unlike that composer, I would fold the second step into the first request by asking speculatively for every section, accepting slightly more tokens to save a round trip.

### 1.4 Accuracy evidence

| Evidence | Finding | Label |
|---|---|---|
| Vals AI, 12 systems, 6 Oct 2026, Jev 1.13 | Claim verification over 10-K filings: Jev 0.975, tied with GPT-6 Astra, GPT-6.1 Sol and GPT-6 Luna; best was Sonnet 5.5. LegalBench slice: **Jev last of 12** (0.730 class-balanced). Calibration excellent on one task (ECE 0.011) and the worst on the other (0.108) | [R] third-party, [vals.ai](https://www.vals.ai/blogs/independent-evaluation-of-jev) |
| Airbnb production classifier benchmark (Nov 2026) | Jev was "the most accurate off-the-shelf model we tested under 100ms". It costs about the same as GPT-6 Luna, and a long prompt quadruples its cost "because its API gives no cached-input discount". A fine-tuned Gemma4-E2B reached F1 0.902 at a 35 ms median and ~85 ms p99 | [R] third-party, [airbnb.tech](https://airbnb.tech/ai-ml/frontier-quality-at-1-of-the-cost-a-production-benchmark-of-llm-classifiers/) |
| Literature review on DEV (24 Sep 2026) | "Level with mid-price LLMs, 6.5 to 11.5 points behind the frontier". Weaker on multi-class, non-English, and answers not in the input. Swapping the rubric behind yes/no labels changed 32.5% of answers. Run-to-run changes of 0–2.2% | [R] secondary, [dev.to](https://dev.to/aws-builders/jev-after-eight-days-of-independent-tests-level-with-mid-price-llms-behind-the-frontier-1c60) |
| Independent order-bias probe on Jev 1.13 (arithmetic only, 432 calls) | Correct when the answer was first 88.0%; second 62.0%; third 59.3%; fourth 57.4% | [R] small study, [jev-behavior-study](https://github.com/RINNECODER/jev-behavior-study) |
| TypeSafe self-consistency cookbooks (jev-1.14.0) | On borderline items, Jev's least-stable decision flips 4.0% (Choice) and 3.8% (Noul) of the time. Every LLM condition tested has an item that flips more than 10% of the time | [R] vendor-run, [Choice](https://docs.typesafe.ai/cookbooks/consistency_choice_cookbook), [Noul](https://docs.typesafe.ai/cookbooks/consistency_noul_cookbook) |
| TypeSafe workflow evals | "193.6x faster, 444.6x cheaper" against LLMs, with the reference answers taken from GPT-6 Astra and Fable 5.1 averages. TypeSafe itself says these "are on the higher end of real world gains" | [R] vendor, [launch post](https://typesafe.ai/blog/introducing-system-one-models-and-jev), [evals.typesafe.ai](https://evals.typesafe.ai) |
| Skill selection (vendor) | Jev suggestions halved wrong skill loads (15.7% → 7.9%) for a Haiku 4.5 agent | [R] vendor-run, [Skill suggestion](https://docs.typesafe.ai/cookbooks/skill_suggestion) |
| **UI composition specifically** | The only public example is json-render's experimental composer, which states it "does not guarantee that Jev chose the right UI", that planning decisions are a weakness, and that a short request "can select only a table". No accuracy numbers exist | [V] [README](https://github.com/vercel-labs/json-render/tree/main/apps/web/lib/jev) |

**Bottom line:** nobody has measured Jev on site composition. Expect mid-tier LLM accuracy on individual judgments, better consistency than LLMs, and real weaknesses in planning and long multi-class lists. The design here moves the planning into code priors and keeps each Choice short and well described. We need our own golden-brief evaluation (section 6) before launch.

### 1.5 Mitigations specific to Jev

- **Order bias:** ask the high-stakes Choices (archetype, theme palette, variant of the hero) two or three times in the same request with cyclically rotated option orders, and average the probabilities. In a single request this costs tokens but no latency [E]. AnyJev uses the same "cyclic shifts and prior correction" trick on open LLMs ([awesome-system-one](https://github.com/andyrewlee/awesome-system-one)) [R]. Keep option *names* neutral, since label wording swings answers ([dev.to](https://dev.to/aws-builders/jev-after-eight-days-of-independent-tests-level-with-mid-price-llms-behind-the-frontier-1c60)) [R].
- **Literal reading:** write criteria as concrete situations ("a business customers visit in person"), not degrees ("very local"), as the Score docs advise ([Score](https://docs.typesafe.ai/primitives/score)) [V].
- **Context rot:** keep the state to the brief and the extracted facts. Never put the whole spec in the state for a Plan request. For Edit requests use a compact outline.
- **Non-English briefs:** 1.14 claims "better multilingual support" ([Changelog](https://docs.typesafe.ai/changelog)) [V], but independent reviews call it a weak spot [R]. Keep criteria in English and add a language-detection step.
- **Hysteresis on re-decisions:** when an edit causes a decision to be re-asked, keep the current value unless the new top option beats it by a margin (for example 0.15). This prevents flips from 0.01–0.015 sampling noise ([Parallel questions](https://docs.typesafe.ai/cookbooks/parallel_questions)) [V] [E for the margin].

### 1.6 Who TypeSafe is, and how stable it is as a dependency

- **Founders and history.** Founder and CEO Diogo Almeida says he worked on the instruction-following research behind ChatGPT at OpenAI ([launch post](https://typesafe.ai/blog/introducing-system-one-models-and-jev)) [V, self-description]. Sasha Sheng (COO, ex-Meta FAIR) and Erik Gafni (CTO) are named as co-founders by secondary sources; I read those only as search snippets and did not open the articles, e.g. [Yahoo Finance](https://finance.yahoo.com/technology/ai/articles/typesafe-ai-emerges-stealth-40m-190000776.html) [R]. Two years in stealth; public launch with early access on 15 Sep 2026 [V].
- **Funding.** A $40M seed led by DCVC was announced around launch [R] (same Yahoo source). A Series A of **$870M at a $7.5B valuation**, led by Andreessen Horowitz with Sequoia and DCVC, and Martin Casado joining the board, was announced 9 Oct 2026 ([TypeSafe](https://typesafe.ai/blog/series-ai)) [V]; also covered by [TechCrunch](https://techcrunch.com/2026/10/09/the-maker-of-non-text-ai-model-jev-valued-at-7-5b-just-weeks-after-launch/) [R]. TypeSafe claims "a third of the Fortune 500" use Jev [R, vendor].
- **Assessment [E].** Insolvency is not the risk. The risks are (1) **API and model churn**: an SDK breaking change in month one, aliases that move, 30–60 day deprecation notices, and a deprecation policy not yet published; (2) **a single region** at launch (US West); (3) **opaque rate limits**; (4) **no cached-input discount** (Airbnb) [R]; (5) a **crowded field** that may push TypeSafe toward enterprise. Mitigation: pin `jev-1.14.0`; keep all questions in a provider-neutral question-spec format; run the golden-brief suite against every new version before switching.

### 1.7 Other decision models ("System One"-style) as of November 2026

The category grew fast after Jev's launch. These alternatives matter for us:

| Offering | Shape | Price | Latency | Label |
|---|---|---|---|---|
| **Gemini Decision 1** (`gemini-decision-1`), announced 11 Nov 2026 | noul/choice (2–255)/score; up to 1,000 questions per pass; text, image, audio, video and PDF; 256K context | $0.10/M input, $0 output; shared input billed once; free tier in AI Studio | "150 to 250 ms end-to-end", 50–100 ms median model compute, "nearly flat from 1 to 100 questions" | [V] [Google blog](https://blog.google/innovation-and-ai/technology/developers-tools/gemini-decisions-api/) (latency is a vendor claim) |
| **OpenAI Decisions API** (`gpt-6-luna`, `POST /v1/decisions`), GA | predicate/choice/score; up to 400 questions per request; US and EU regional processing; implicit caching of shared input (≥1,024-token prefix; question content does not count toward it) | $0.10/M uncached input, cached at Luna's cache-read rate, output free | "about 10x faster than the Responses API" (no absolute figure on the page) | [V] [OpenAI docs](https://developers.openai.com/api/docs/guides/decisions) |
| **Cloudflare Clef-flash** (9B, multimodal) | noul/choice/score, up to 64 questions per request, 24,576-token context, System One-style request plus an `images` extension | $0.038/M input, output free | not stated | [V] [Cloudflare](https://developers.cloudflare.com/workers-ai/models/clef-flash/), [pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/) (page updated 12 Nov 2026) |
| **Inception Mercury Decide** (diffusion-based) | typed questions with calibrated probabilities | listed at $0.02/M input, $0 output ("50% off") | "up to 14 decisions per second" claim | [V] for the listing on [inceptionlabs.ai](https://www.inceptionlabs.ai/); [R] for the rest. The OpenRouter route was reportedly delisted on 12 Nov ([awesome-system-one](https://github.com/andyrewlee/awesome-system-one)); my fetch of the OpenRouter page returned 404 |
| **Open serving**: vLLM, SGLang, llama.cpp and Ollama reportedly expose `/v1/systemone` natively; open decision models such as Kev-4B, Laya and Decider-flash | prefill once, then score the label logits | self-hosted GPU | e.g. "sub-15 ms" claimed for `von` | [R] [awesome-system-one](https://github.com/andyrewlee/awesome-system-one) (community list; several of its links returned 404 for me) |
| **Paper "Releasing the Inner Jev"** | plain Gemma 4 31B read through its output logits, without training, scores close to Jev on a mirror of JevBench | — | — | [R] via the awesome list, arXiv 2610.17205 (not opened) |

Leaderboards exist ([Artificial Analysis Decision Index v2.1](https://artificialanalysis.ai/evaluations/artificial-analysis-decision-index), 19–22 decision models including Jev 1.14, Gemini Decision 1, GPT-6 Luna Decisions and Microsoft-Decision-1 [V for the roster]). The scores are in interactive charts I could not extract. The independent JevBench board ([benchmarkheaven.com](https://benchmarkheaven.com/jev-models)) was too large to fetch. **Rankings are unverified.**

**Implication [E]:** the decision-model interface has become a commodity with at least three hyperscaler-grade sources (Google, OpenAI, Cloudflare). Building on it is now *less* risky than depending on any single vendor. Jev remains the cheapest of the big three at $0.042/M, has the most cookbook material and has the fastest claimed latency. Gemini and OpenAI offer regions and caching that Jev lacks.

---

## 2. Alternatives for the deciding role

Target: emit a compact page spec (~400–600 output tokens without copy; ~1,500 with copy) in under a second.

### 2.1 Ultra-fast LLM inference: measured numbers

Third-party medians from **Artificial Analysis** page data (read 2026-11-13). I use the "1k input" workload, which is closest to our prompt sizes.

| Provider / model | Output speed (1k-input workload) | TTFT (1k input) | Price in / out per M | Price source |
|---|---|---|---|---|
| **Cerebras gpt-oss-120b** | **1,837 t/s** (headline 1,318) | **0.21 s** | $0.35 / $0.75 | [OpenRouter endpoints](https://openrouter.ai/api/v1/models/openai/gpt-oss-120b/endpoints) [V], 2026-11-13 |
| Groq gpt-oss-120b | 460 t/s | 0.24 s | $0.15 / $0.60 | [Groq models page](https://console.groq.com/docs/models) [V] |
| Groq gpt-oss-20b | 830 t/s | 0.20 s | $0.075 / $0.30 | [Groq](https://console.groq.com/docs/models) [V] |
| SambaNova gpt-oss-120b | 612 t/s | 1.36 s | $0.14 / $0.95 (OpenRouter) | [V] |
| Baseten gpt-oss-120b | 201 t/s | 0.22 s | $0.10 / $0.50 | [V] |
| Inception Mercury 2.5 (diffusion) | 727 t/s | 2.35 s (likely includes reasoning) | — | AA [V for the measurement] |

Speed sources: [AA gpt-oss-120b providers](https://artificialanalysis.ai/models/gpt-oss-120b/providers), [AA gpt-oss-20b providers](https://artificialanalysis.ai/models/gpt-oss-20b/providers), [AA Mercury 2.5](https://artificialanalysis.ai/models/mercury-2-5/providers) [V, third-party benchmark]. Vendor claims: Cerebras lists gpt-oss-120b at "~3000" t/s and Qwen 3.8 27B at "~1850" t/s ([Cerebras catalog](https://inference-docs.cerebras.ai/models/overview)) [R vendor]. Groq lists 500 and 1,000 t/s [R vendor]. Cerebras offers **Predicted Outputs** (gpt-oss-120b in public preview), useful for editing known text ([docs](https://inference-docs.cerebras.ai/dedicated/predicted-outputs)) [V].

**Rate-limit warning [V/R].** Groq's developer plan allows 1K RPM and **250K TPM** for gpt-oss-120b ([Groq](https://console.groq.com/docs/models)) [V]. That is about 25 sites per minute at ~10k tokens each, so production needs an enterprise tier. Cerebras's self-serve tier is "not intended for production use" ([Cerebras pricing](https://www.cerebras.ai/pricing)) [V]. Dedicated capacity is by agreement.

**Could a fast LLM emit the whole spec in under a second?** Yes [E]. On Cerebras gpt-oss-120b with low reasoning effort and a JSON schema: ~0.1 s network + 0.21 s TTFT + ~100 reasoning tokens + 500 structure tokens at ~1,800 t/s (~0.33 s) ≈ **0.65 s**; with full copy (~1,500 tokens) ≈ **1.2 s**. Cost ≈ 3k in × $0.35/M + 0.6k out × $0.75/M ≈ **$0.0015**, about 4× the Jev Plan. Trade-offs: better at planning and ordering than Jev [E]; but no calibrated alternatives, no confidence, and nondeterministic at temperature 0 (section 6). **Role in the pipeline: the slow-path planner and the copy writer, not the default decider.**

Hosted "mini" models such as Claude Haiku 5.5 ($0.10/$0.50) and GPT-6 Luna ($0.10/$0.50) ([OpenRouter catalog](https://openrouter.ai/api/v1/models), 2026-11-13) [V for prices] are cheap. Their Artificial Analysis TTFTs in default (reasoning) mode run to tens of seconds or more, so they need a non-reasoning setting, for which I have no current measurement. **Unverified for sub-second use.**

### 2.2 Diffusion language models

Inception lists **Mercury 3** at $0.10/$0.35 per M (marked 50% off) and claims "sub-300ms time to first token" ([inceptionlabs.ai](https://www.inceptionlabs.ai/)) [V for the listing; R for latency]. About 1,068 t/s is reported for Mercury 3, from Inception's own figures ([eesel](https://www.eesel.ai/blog/inception-mercury-3)) [R]. The only independent measurement I could extract is Mercury 2.5 at 727 t/s on the 1k workload [V, AA]. Diffusion LMs are the strongest candidates for **whole-section rewrites and edits** (parallel refinement of a known draft), but the evidence is still mostly vendor-supplied.

### 2.3 Small models with constrained decoding, hosted or self-hosted

- Grammar engines are mature and actively maintained: **XGrammar** v0.2.9 (9 Nov 2026), **llguidance** (pushed 11 Nov 2026), **Outlines** 1.3.3 (Aug 2026) ([xgrammar](https://github.com/mlc-ai/xgrammar), [llguidance](https://github.com/guidance-ai/llguidance), [outlines](https://github.com/dottxt-ai/outlines)) [V for repo activity]. Cerebras and Groq expose structured outputs [V, docs index].
- **Self-hosted decision serving:** SGLang and vLLM reportedly serve `/v1/systemone` by prefilling the state once and reading label log-probabilities, which turns any open chat model into a decision model with no training [R] ([awesome-system-one](https://github.com/andyrewlee/awesome-system-one)). This is the **sovereign fallback** for Jev.
- **Fine-tuned small classifiers:** Airbnb's fine-tuned Gemma4-E2B reached F1 0.902 at a 35 ms median ([Airbnb](https://airbnb.tech/ai-ml/frontier-quality-at-1-of-the-cost-a-production-benchmark-of-llm-classifiers/)) [R]. Once we have labeled data (user corrections are free labels), distilling the archetype, vertical and section-relevance decisions into a 1–4B model is realistic. TypeSafe's own AutoResearch cookbook trains CatBoost on Jev's answers ([docs index](https://docs.typesafe.ai/llms.txt)) [V].

### 2.4 Cloudflare Workers AI

The pricing page was updated 12 Nov 2026 [V] ([pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)). It lists gpt-oss-20b at $0.20/$0.30, Gemma 4 26B-A4B at $0.10/$0.30, Llama 3.2 3B at $0.051/$0.335 and Granite 4.0 H Micro at $0.017/$0.112, with 10k free neurons per day. It also lists the decision models **Clef-flash** ($0.038/M input) and **Clef** ($0.24/M), and the extraction model **Clairic** ($0.10/M). Jev itself is callable through the AI binding ([Vercel](https://vercel.com/i/jev-integrations)) [V]. Whether that runs at the edge or proxies to US-West is **unverified**. Strength: one Worker can do the cache lookup, the embedding, the decision call and the spec assembly without leaving Cloudflare's network.

### 2.5 Classic approaches

- **Embeddings plus nearest neighbor over a library of golden briefs → specs** is the zero-model fallback. It gives an instant spec in ~20–50 ms (embedding plus vector lookup) [E], with quality bounded by library coverage.
- **Rerankers:** Jev itself reranks; it lifted top-1 from 5% to 30% on CLERC legal passages ([Re-ranking](https://docs.typesafe.ai/cookbooks/rerank_typesafe)) [V, vendor-run]. An independent run found nDCG@10 "a tie, not a win" against Cohere Rerank 4 ([jev-rerank-bench, via awesome list](https://github.com/andyrewlee/awesome-system-one)) [R]. Rerankers suit choosing library copy and images.

### 2.6 In-browser inference

| Option | Status (Nov 2026) | Verdict |
|---|---|---|
| **Chrome Prompt API (Gemini Nano)** | Web availability listed for Chrome 148; JSON-Schema `responseConstraint`; **desktop only** (not Android or iOS); needs >4 GB VRAM, 16 GB RAM, 4+ cores and 22 GB free disk; model downloaded on first use; no latency figures published ([Chrome docs](https://developer.chrome.com/docs/ai/prompt-api), updated 21 Oct 2026) [V] | Progressive enhancement only: free speculative archetype guesses while typing on capable desktops. Cannot be the baseline |
| **WebLLM** (v0.2.88, 10 Nov 2026) | WebGPU; JSON mode with schemas; "up to 80% native performance" ([repo](https://github.com/mlc-ai/web-llm), [paper](https://arxiv.org/abs/2412.15803)) [V] | A model download of hundreds of MB to GB kills first-visit latency [E]. Viable later for returning power users |
| **transformers.js** (4.3.2, 28 Oct 2026) | WebGPU or WASM; q4/q8 quantization ([repo](https://github.com/huggingface/transformers.js)) [V] | Good for a **small in-browser embedding model** (tens of MB [E]) to drive prompt-cache lookups and suggestions while typing |

---

## 3. The copy problem

A decision model cannot write. The fastest *good* answer is a **three-layer, progressively upgraded** system.

**Layer 0: entity-filled copy library (0 ms, ~$0).** Pre-write copy offline for each (vertical × section type × tone × slot) with typed entity slots (`{business}`, `{city}`, `{service}`, `{cta_verb}`). Rough size: 150 verticals × 25 section types × 4 tones × ~8 alternatives ≈ 120k snippets [E]. Generated once by a frontier model in batch at about 100 output tokens per snippet (12M tokens) for **~$5–$60 one-off** at OpenRouter batch rates of $0.25–$5/M output ([OpenRouter catalog](https://openrouter.ai/api/v1/models)) [E from V prices]. Retrieve the top 20–30 per slot by embedding; Jev picks one with a Choice in Request B or in spare capacity of Request A. Entities come from Jev Choices over extracted spans (section 1.2). This copy is generic, but it is never broken, always on-brand for the vertical, and instant.

**Layer 1: fast LLM, two waves (bespoke copy by ~0.7–0.9 s).**
- *Wave 1 at t=0, in parallel with Jev:* the "brand kernel" every archetype needs: cleaned business name, hero headline and subhead, primary CTA label, 3–6 value propositions, about blurb, SEO title and description. One call, ~1k input and ~450 output tokens including low reasoning. On Cerebras gpt-oss-120b that is ≈ 0.1 s network + 0.21 s TTFT + 0.25 s generation ≈ **0.55 s**, and the streamed hero headline lands at ~0.35 s [E from AA [V]]. Cost ≈ $0.0007 [E].
- *Wave 2 after the Jev plan arrives (~0.25 s):* one parallel call per chosen section for its typed slots (features items, FAQ pairs, process steps, pricing-tier names and blurbs, alt text). Each call is ~700 input tokens (shared, cacheable prefix) and ~150–200 output, finishing at **~0.65–0.8 s** [E]. Cost on Cerebras ≈ 8 × $0.0004 ≈ $0.003; on Groq gpt-oss-20b ≈ $0.001 total [E].
- Constrain output with a JSON schema per section type so the text lands in typed slots and nothing else. Hard length limits (headline ≤ 60 characters and so on) are enforced in the schema, and code truncates if needed.
- **Never fabricate testimonials, stats, prices or awards.** Those slots get clearly marked placeholders unless the user's material provides them. This is both a trust and a legal issue (fake reviews).

**Layer 2: the user's own material (seconds, in the background).** If the user supplies a URL, document or profile: fetch it, extract readable text, have Jev classify passages to sections (the RAG-passages and line-by-line search patterns ([docs index](https://docs.typesafe.ai/llms.txt)) [V]), then re-run wave 2 grounded on those passages. Real reviews from a business profile can fill testimonial slots *with attribution*. This takes ~1.5–4 s [E] and is shown as "Using your existing site…" with in-place updates.

**Measurements found.** I found **no public measurement** of placeholder-then-upgrade copy in site builders, or of library copy against generated copy, within the search budget. The relevant anchors: Nielsen's limits of 0.1 s ("instantaneous"), 1 s ("flow of thought") and 10 s ([NN/g](https://www.nngroup.com/articles/response-times-3-important-limits/)) [V]; Cursor's speculative-edits "fast apply" at ~1,000 t/s, ~13× faster than vanilla inference ([Cursor](https://cursor.com/blog/instant-apply), May 2024) [R vendor]. **Recommendation:** A/B test three arms (library only; library then upgrade at about 0.8 s; wait for generated copy). Measure time to first edit, number of copy edits, publish rate and blind quality ratings.

---

## 4. The interpretation problem: vague requests, references, multi-step edits

**Principle: turn interpretation into a bounded lookup wherever possible, and pay for reasoning only on misses.**

1. **Vague style requests ("make it feel premium").** Keep a hand-built **style lexicon** of ~200 adjectives and phrases (premium, playful, editorial, brutalist, warm, clinical, techy, cozy, …). Each entry maps to theme-token deltas and a copy-tone delta. In the Edit request, Jev picks lexicon entries with a Choice (≤255 options fit) plus Nouls for secondary adjectives. Semantic matching of a phrase to a described option is the kind of single gut-check Jev is designed for ([Primitives](https://docs.typesafe.ai/primitives)) [V]. Code applies the deltas. Cost: about zero; latency: the fast path [E].
2. **References ("like Linear's site").** Keep a **reference library** of a few hundred well-known sites. Each has a precomputed style fingerprint (palette, type pairing, density, radius, motion, section patterns), built offline by a VLM from screenshots. Jev chooses the reference (a two-stage Noul-then-Choice if the library exceeds 255). If nothing matches (companion Noul "none fits"), take the slow path: fetch a screenshot, have a VLM extract the tokens, apply them, and cache the new fingerprint for the next user. That takes seconds and runs in the background with an optimistic status line [E]. Do not clone brand assets or copy; extract style parameters only.
3. **Compound and multi-step edits.** If the Noul `is_compound` is high, a fast LLM splits the request into atomic commands. On Cerebras that is ~0.3–0.5 s for a short output [E]. Each atomic command goes to Jev in parallel, and the ops are applied as one transaction (one undo step). This is TypeSafe's own smart-home pattern ([Smart home](https://docs.typesafe.ai/demos/smart-home)) [V].
4. **Genuinely open requests** ("rework this into a page for investors"): the slow path is a tool-calling LLM whose **only tools are spec operations** (`addSection`, `removeSection`, `moveSection`, `setVariant`, `setTheme`, `setCopy(slot, text)`, `regenerateCopy(section)`), all validated by the same code as the fast path. On Cerebras gpt-oss-120b at medium reasoning this takes ~0.8–1.5 s [E]. Show the steps as they stream.

**Routing.** Use Jev's own answers as the router: operation confidence, the probability that no option fits (companion Noul), and `is_vague`/`is_compound`. Thresholds scale with risk, as the docs recommend ([Confidence](https://docs.typesafe.ai/confidence), [Probability routing](https://docs.typesafe.ai/patterns/probability-routing)) [V]. **Speculative dual execution [E]:** if P(slow path needed) > 0.3, start the LLM at the same moment the Jev result arrives. Apply the Jev op optimistically when its confidence is high. If the LLM returns a different plan, show it as a one-click "Did you mean…" rather than silently replacing. Spending ~$0.001 on unused LLM calls is negligible.

**What production systems report.**
- RouteLLM: routing "reduces costs by over 2 times in certain cases without compromising quality" ([arXiv 2406.18665](https://arxiv.org/abs/2406.18665)) [V].
- TypeSafe cascade: 13% escalation reaches 96.5% at ¼ of the reasoning model's cost ([SDE cascade](https://docs.typesafe.ai/cookbooks/sde_cascade)) [R vendor].
- Google's Gemini Notebook uses Gemini Decision 1 for model routing, with "up to 40% lower latency on everyday queries" ([Google](https://blog.google/innovation-and-ai/technology/developers-tools/gemini-decisions-api/)) [R vendor].
- TypeSafe offers a "Jev Router" on OpenRouter that picks a model and reasoning effort per request ([OpenRouter catalog](https://openrouter.ai/api/v1/models) lists `typesafe/jev-router`) [V for its existence].

---

## 5. Perceived-speed techniques

| Technique | How it applies here | Cost | Label |
|---|---|---|---|
| **Speculation while typing** | Debounce 300–400 ms. Once the brief has ≥ 6 words, send the Plan request and copy wave 1. If the brief is unchanged at Enter, the site appears in **<100 ms** | ~$0.0004 per speculative Plan; ~5 per brief ≈ $0.002 | [E] |
| **Streaming partial specs** | Render as soon as the Jev plan exists, then stream copy into slots. json-render already streams JSONL spec patches and keeps the last valid preview on errors ([README](https://github.com/vercel-labs/json-render/tree/main/apps/web/lib/jev)) | 0 | [V] pattern |
| **Optimistic UI for edits** | Apply the fast-path op locally at once; reconcile if the server or slow path disagrees | 0 | [E] |
| **Alternatives from the distribution** | Jev already returns probabilities for every option. Build 2–3 complete alternative sites (second-best archetype or theme, second-best hero variant) with **no extra model call**. Copy is reused because content models are per section type | 0 model cost | [E] (design) on [V] API behavior |
| **Precomputed variant galleries** | For each section, render thumbnails of every variant with the current copy client-side, for the "swap layout" picker | 0 | [E] |
| **Prompt-embedding cache** | Embed the brief (in the browser with transformers.js or on Workers AI). On a close match to a past brief, show that spec immediately, then let the real plan replace it | ~$0.000002 | [E] |
| **Section skeletons and crossfades** | Never show an empty frame; the library copy *is* the skeleton | 0 | [E] |

---

## 6. Determinism and trust

- **The saved spec is the source of truth.** Rendering is pure code. Replay never calls a model.
- **Decision log for each version:** request payload hash, model ID as returned (e.g. `jev-1.14.0`, [Models](https://docs.typesafe.ai/models) [V]), every answer *with its probabilities*, thresholds, and the code version that assembled the spec. This makes any decision explainable ("we chose 'restaurant' at p=0.91") and lets a new model version be compared offline against the old.
- **Why not regenerate:** hosted LLMs at temperature 0 are not reproducible. Thinking Machines got **80 unique outputs from 1,000 temperature-0 completions**, traced the cause to batch-size variance, and fixed it with batch-invariant kernels at about 1.6–2× slower speed ([Thinking Machines](https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/), Sep 2025) [V]. Jev has no seed and shows small run-to-run noise (std dev ≤ 0.015 in the vendor's test) [V], so a re-decision can flip near ties. Hence the hysteresis rule in section 1.5.
- **Ops, diffs, undo and branching:** represent every change as an RFC 6902 JSON Patch ([RFC 6902](https://www.rfc-editor.org/rfc/rfc6902)) [V]. Versions form a DAG (branch = fork a version; compare = diff two specs). Undo applies the inverse patch. A compound edit is one transaction.
- **Evaluation harness:**
  1. **Golden briefs:** 300–500 briefs across archetypes, languages and vague phrasing, labeled by designers (archetype, required and forbidden sections, acceptable variants and themes). The 200–400 size follows Vals's advice to audit a held-out set before trusting a system ([Vals](https://www.vals.ai/blogs/independent-evaluation-of-jev)) [R].
  2. **Permutation consistency:** run every golden brief with shuffled option orders and report the flip rate per question.
  3. **Self-consistency:** repeat calls and measure the flip rate at our thresholds, as in TypeSafe's cookbook method ([consistency](https://docs.typesafe.ai/cookbooks/consistency_choice_cookbook)) [V].
  4. **Per-question observability:** log which question caused each bad outcome, as the hierarchical-classification cookbook recommends ([docs](https://docs.typesafe.ai/cookbooks/hierarchical_classification)) [V].
  5. **Visual judging:** render screenshots and score them with a frontier VLM using a fixed rubric and pairwise comparisons. Calibrate the judge against 100–200 human ratings before trusting it [E]. Jev with image input could serve as a cheap pre-filter (Score on a screenshot), but image support is still "danger zone" ([Jev 1.14](https://typesafe.ai/blog/jev-1-14)) [V].
  6. **Online signals:** undo rate, edits per site and publish rate, compared across model versions (A/B on pinned IDs).

---

## 7. Proposed pipeline with budget

Assumptions: user in the US; server on Cloudflare Workers or Vercel Edge; Jev called directly; copy on Cerebras gpt-oss-120b (Groq gpt-oss-20b as the cheaper alternative). Network ≈ 30–100 ms per hop [E]. Users outside the Americas: add ~100–250 ms to each Jev call until a non-US region or a regional fallback exists [E].

### 7.1 First site

| t (ms) | Stage | Model / provider (numbers, date, source) | Latency | Cost | Fallback | Basis |
|---|---|---|---|---|---|---|
| –(typing) | Speculative Plan and wave 1 on a stable partial brief | same as below | hides 300–600 ms | ~$0.002 per brief | skip speculation | [E] |
| 0 | Ingress, language detection, regex/NER entity spans, embedding-cache lookup | code; embedding on Workers AI or transformers.js in the browser | 20–50 | ~$0.000002 | skip cache | [E] |
| 0 → ~250 | **Request A, Plan** (~90 questions, ~10k tokens) | Jev 1.14: $0.042/M, ~100 ms typical ([TypeSafe](https://docs.typesafe.ai/models), 2026-11) | 150–250 | $0.00042 | ① Gemini Decision 1 ($0.10/M, 150–250 ms claimed, 11 Nov 2026); ② OpenAI Decisions/Luna ($0.10/M); ③ Cloudflare Clef-flash ($0.038/M, 64-question cap, so split into 2 parallel calls); ④ self-hosted SGLang/vLLM `/v1/systemone`; ⑤ embedding nearest-neighbor to golden specs | [R] latency, [V] prices |
| 0 → ~550 | **Copy wave 1** (brand kernel, streamed) | Cerebras gpt-oss-120b: 1,837 t/s, 0.21 s TTFT at 1k input (AA, 2026-11-13); $0.35/$0.75 (OpenRouter, 2026-11-13) | hero text at ~350; done ~550 | $0.0007 | Groq gpt-oss-20b (830 t/s, 0.20 s TTFT; $0.075/$0.30) → library copy | [V] inputs, [E] total |
| ~250 → ~280 | Assemble and validate the spec in code; library copy plus entities; image retrieval (vector KV) | code | 10–30 | ~0 | — | [E] |
| ~280 → ~380 | **First paint of a complete site** (client renders the spec) | — | 30–80 | 0 | — | [E] |
| ~250 → ~800 | **Copy wave 2**, ~8 parallel section calls, streamed into slots | Cerebras as above | done by ~650–800 | ~$0.003 (Cerebras) / ~$0.001 (Groq) | Groq → keep library copy | [E] |
| ~250 → ~400 | Optional Request B (image and library-copy choices, ~5k tokens) | Jev | ~150 | $0.0002 | top-1 by embedding | [E] |
| background | Alternatives from Jev's distributions; optional VLM quality check; grounding on user material | code / VLM / fetch | 1–4 s | $0–0.002 | skip | [E] |

**Total for the first site: a complete-looking site at ~0.35–0.45 s; bespoke copy at ~0.7–0.9 s; ≈ $0.002 (Groq copy) to $0.005 (Cerebras copy).** [E]

### 7.2 Typical edit

| Stage | Model | Latency | Cost | Fallback | Basis |
|---|---|---|---|---|---|
| Request E (op, target, params, lexicon or reference match, compound/vague Nouls; ~4k tokens) | Jev 1.14 | 150–250 ms | $0.00017 | the same chain as Plan | [E] |
| Apply JSON Patch, validate, diff-render | code | 20–50 ms | 0 | — | [E] |
| **Fast-path edit visible** | | **~0.25–0.35 s** | **~$0.0002** | | [E] |
| + New text in one slot (e.g. "punchier headline") | Cerebras gpt-oss-120b (Predicted Outputs for small rewrites, preview) | +0.3–0.45 s | +$0.0003–0.0005 | Groq gpt-oss-20b | [E] |
| Slow path (compound, vague with no lexicon hit, unknown reference, low confidence), started speculatively | Cerebras gpt-oss-120b with spec-op tools, medium reasoning | 0.8–1.5 s | $0.001–0.003 | Groq gpt-oss-120b (460 t/s) → ask a clarifying question | [E] |

**Expected mix [E]:** if ~75% of edits take the fast path, ~15% need new text and ~10% take the slow path, the average edit costs ≈ $0.0005 and has a median latency of ~0.3 s.

### 7.3 Unit economics [E]

A free user who creates 3 sites and makes 40 edits costs ≈ 3 × $0.004 + 40 × $0.0005 ≈ **$0.03** in model costs. Model cost is not what limits free tiers; images, hosting and abuse are.

---

## 8. Risks and the strongest workaround for each

| Obstacle | Strongest known workaround |
|---|---|
| Jev cannot plan or decide when to stop | Archetype defaults and min/max rules in code; Jev only adjusts |
| Jev cannot write | Library copy instantly, then fast-LLM copy in two waves |
| Order bias and option-name sensitivity | Rotated duplicates in the same request, averaged; neutral option labels; permutation tests in CI |
| Accuracy unknown for this task | Golden-brief suite before launch; user corrections become labels; later distill into a small fine-tuned model (the Airbnb pattern) |
| Single US region | Route non-US traffic to Gemini Decision 1 or OpenAI Decisions (EU processing available) or to self-hosted serving; measure first |
| Vendor churn | Pin the version; provider-neutral question specs; the `/v1/systemone` shape is shared by several providers |
| Unknown rate limits (Jev, Cerebras, Groq) | Ask for enterprise limits before launch; multi-provider copy pool; library copy as the floor |
| Nondeterminism | Spec as the source of truth, decision logs, hysteresis on re-decisions |

---

## 9. Not verified

- **Jev latency for our request shape** (~90 questions, ~10k tokens), from outside the US, and at p95. Published numbers are medians from the vendor or from Vals at up to 64 judgments. I made no paid calls.
- **Jev rate limits** (per-org values appear only in the console) and whether the Cloudflare `typesafe/jev` binding runs at the edge.
- **Decision-model rankings** on the Artificial Analysis Decision Index and JevBench (interactive charts not extractable). Hence no verified quality comparison of Jev against Gemini Decision 1 or OpenAI Decisions.
- **Mercury Decide's current price and availability** (OpenRouter page 404; the Inception listing shows $0.02/M), Morph Reflex (page 404), and most entries of the community awesome-system-one list.
- **Mercury 3 throughput** (vendor and secondary sources only). Haiku 5.5 and GPT-6 Luna TTFT in non-reasoning mode.
- **Cerebras pricing** comes from the OpenRouter endpoint listing; the Cerebras pricing page renders client-side.
- **Chrome Prompt API latency** (no published figures).
- **Any measurement of library copy against generated copy, or of placeholder-then-upgrade UX**, in site builders.
- Secondary details on TypeSafe's co-founders and seed round (only the Series A is confirmed on TypeSafe's own blog).
- The web-search budget ran out mid-task, so sections 2–5 rely on primary docs fetched directly and on public API data rather than broad searching.
