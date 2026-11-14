# 03 — The generation pipeline as software

Date: 14 November 2026. Area 3 of 6 in the technical design. It turns the research proposal in `docs/research/04-decision-engine.md` (section 7) into an engineering design that can be built by one person with coding agents and changed later without rewrites.

**Evidence labels.** **[V]** verified: I read it at the primary source (vendor docs, API schema, source code, npm registry) on 2026-11-14. **[R]** reported: a vendor's claim about itself, a third party, or a community page I could not fully check. **[E]** my estimate or proposal. No paid model was called and no key was used, so **every latency and cost figure for our pipeline is an estimate**.

**Scope.** This report owns: the decision interface, the question compiler, candidate narrowing, the text writer, the edit router and slow path, The Wall's generation side, the server-to-browser stream, the generation record and replay, the evaluation harness, and key and abuse handling. It does not design the spec format (area 1), blocks and themes (area 2), runtime and storage (area 4), the editor and Wall UI (area 5) or forms and the foundry (area 6). Section 5 lists what this design needs from each of them.

---

## 0. The design in one page

**Shape: a functional core with models at the edges.** The whole pipeline is one pure async generator, `generate(input, deps) → AsyncIterable<GenEvent>`. Every model call goes through one of two narrow ports (`DecisionPort`, `TextPort`). Everything between the ports is deterministic code: compile questions, resolve answers into decisions, assemble spec operations, guard text. The same generator runs inside the Cloudflare Worker, inside a plain Node server for self-hosters, inside the evaluation CLI and inside tests with a mock port. This one choice makes replay, evaluation and provider swaps cheap.

```
brief ──► extract signals (code, ~5 ms)
      ├─► DecisionPort: Plan request (one request, chunked per provider caps)  ──┐
      └─► TextPort: wave 1 "brand kernel" (starts at t=0)                       │
                                                                                ▼
            resolve answers → Decisions (code) → assemble SpecOps (code) → stream "spec" event
                                                                                │
            TextPort: wave 2, sections grouped into ≤4 parallel calls ─► guards ─► stream "slot" events
                                                                                │
            GenerationRecord written in the background (waitUntil)  ◄───────────┘
```

**What changed since the research (all verified 2026-11-14):**

- **Cloudflare's decision model `clef-flash` is open weights** (Apache-2.0, a Qwen3.5-9B fine-tune on Hugging Face) and is served with the same `/v1/systemone` request shape as Jev by SGLang and Ollaya ([model card](https://huggingface.co/Cloudflare/clef-flash)) [V]. So one model can run on the founder's Workers account (no extra key, $0.038 per million input tokens) *and* on a self-hoster's GPU. That makes it the natural default to test against Jev in M0.
- **The Vercel AI SDK 7 now has `experimental_decide`** with native decision adapters for TypeSafe, OpenAI, Google, Perplexity and HeyGen, a structured-output adapter for Anthropic, and a `baseURL` option that points the TypeSafe adapter at any System One-compatible server ([AI SDK decisions docs](https://ai-sdk.dev/docs/ai-sdk-core/decisions); `ai@7.0.172`, 13 Nov 2026) [V]. It is experimental and "may change in patch releases" [V], so it sits behind our own interface.
- **Gemini's Decisions API sorts option keys alphabetically before evaluation** ([Gemini docs, Limits and Choice](https://ai.google.dev/gemini-api/docs/decisions-api)) [V]. Order-bias rotation must therefore be done by naming keys, not by reordering JSON. The design below does that for every provider.
- **json-render's `experimental_createEvaluator` throws away the probability distributions**, keeping only the chosen option and a confidence ([source, v0.22.0](https://github.com/vercel-labs/json-render/blob/main/packages/core/src/experimental-evaluator.ts)) [V]. The Wall and the router need the distributions, so we do not build on the composer.

**One-way doors (decide right now, expensive to change):**

1. The **pipeline shape**: pure core plus two model ports, with one async generator as the only entry point.
2. Our own **decision IR** (question and answer types, with ordered options and nullable distributions), not any vendor's wire format.
3. **Questions are compiled from manifests**, never hand-written per request or per provider. Stable question IDs and template versions.
4. The **generation record**, written from the first commit, including every wire request and response, the seed, permutations and the library hash.
5. **Fact provenance**: slots declare a `factKind`; fact slots are filled by code from a facts ledger and never by the LLM.
6. **Text belongs to the section type's content model, not to the variant**, so text survives variant swaps and The Wall can share one text pass.
7. The **server-to-browser event protocol** (versioned NDJSON of spec operations and slot text).

Everything else is a two-way door: which provider, which LLM, thresholds, NDJSON over a route versus a server function, the Wall sampler, embeddings.

**Budget for the first site [E]:** complete structure on screen at ~0.35–0.5 s, generated text streaming into slots from ~0.45 s and finished by ~0.9–1.1 s, about $0.002–0.004 in model cost. Section 3.4 has the timed sequence.

---

## 1. Decisions table

| # | Decision | Recommendation | Door | Confidence |
|---|---|---|---|---|
| D1 | Overall architecture | Pure `generate()` async generator; models only behind `DecisionPort` and `TextPort`; injected `Deps` for storage, cache, clock, randomness | **One-way** | High |
| D2 | Decision interface | Own IR: `choice` (ordered options), `bool`, `score`; answers carry a normalized distribution or `null`; our own confidence (`pTop`, `margin`) computed from the distribution; provider confidence kept only in the record | **One-way** | High |
| D3 | Provider adapters | 4 adapters: `systemone` (raw fetch: TypeSafe, Ollaya, SGLang, Ollama, Cloudflare REST), `workers-ai` (clef-flash via `env.AI`), `ai-sdk-decide` (OpenAI, Google, Gateway, Anthropic, pinned exact version), `llm-emulated` (any chat LLM). Plus `mock` | Two-way | High |
| D4 | Default decision model for M0 | Measure Jev 1.14 and clef-flash (and Gemini Decision 1 if access works) on the golden briefs; pick by data. Expected default: clef-flash on the hosted copy because it needs no extra key and is open weights | Two-way | Medium |
| D5 | Where questions are defined | Three sources, all data: a global question bank, archetype manifests, block and theme manifests. A compiler turns brief + library into a `CompiledQuestionSet` | **One-way** | High |
| D6 | Order bias | Wire option keys carry a positional prefix (`o03_split_image`) so position is explicit on every provider; seeded permutations; high-stakes Choices asked 3× with cyclic rotations in the same request and averaged | Two-way (mechanism), one-way (record it) | Medium |
| D7 | Thresholds and fallbacks | A `Policy` table keyed by stakes and by model version; fallbacks: default from archetype, ask the user, or offer the runner-up | Two-way | Medium |
| D8 | Narrowing a big library | Now: tags and rules in code plus a hierarchy (archetype → sections → variants), all in one request by speculative fan-out. Next: a parallel Noul screen. Last: embeddings (EmbeddingGemma 2) with brute-force search, then Vectorize or pgvector | Two-way | High |
| D9 | Text writer SDK | AI SDK 7 `streamText` + `Output.object` + `partialOutputStream`; providers Cerebras, Groq, any OpenAI-compatible endpoint, Workers AI | Two-way | High |
| D10 | Length limits | In the prompt and schema descriptions; validate in code; trim if ≤15% over; otherwise one targeted rewrite call; never rely on `maxLength` in strict schemas | Two-way | High |
| D11 | No invented facts | Slots declare `factKind`; fact slots never reach the LLM; a facts ledger fills them or a placeholder chip shows; a number-and-quote guard checks free copy | **One-way** | High |
| D12 | Edit routing | One decision request per chat turn; router reads op/target probabilities plus `is_compound`, `is_vague`, `none_fits`; fast path applies ops; slow path is a tool-calling LLM | Two-way | Medium |
| D13 | Slow-path safety | Tools are spec operations only, with input schemas generated from the current spec and library (enums of real IDs); every call runs the shared `applyOp` on a draft and returns validation errors; one transaction at the end | **One-way** (ops as the only write path) | High |
| D14 | The Wall | One decision request, one text pass over the union of sampled section types; server samples N spec skeletons with a seeded diversity sampler and sends them; client renders and cross-breeds | Two-way | Medium |
| D15 | Transport | A TanStack Start server route `POST /api/generate` that streams NDJSON; the client reads it with `fetch`. No WebSockets | Two-way (transport), **one-way** (event protocol) | High |
| D16 | Speculation while typing | The client starts the real request early and aborts it if the brief changes; no server-side speculation cache | Two-way | High |
| D17 | Record and replay | `GenerationRecord` v1 per generation; `replay exact` re-runs code on recorded answers and must reproduce the spec hash; `regenerate` is a new generation linked by `parentGenId` | **One-way** | High |
| D18 | Caching | Only an exact decision-response cache keyed on (model version, wire request hash). No brief-embedding cache yet | Two-way | High |
| D19 | Evaluation harness (M0) | 20→50 golden briefs in YAML with assertions; `pnpm eval run/replay/compare`; repeat and permutation runs; latency and cost per stage; a local rating page | Two-way | High |
| D20 | Keys and abuse (hosted) | Keys as Worker secrets in `*.server.ts` only; Turnstile once per session; Workers rate-limit binding per session and IP; a Durable Object daily spend governor that degrades to demo mode | Two-way | High |
| D21 | Keys (self-hosted) | Environment variables validated at startup with zod; server-side only; an optional instance password so a public self-host cannot burn its owner's keys | Two-way | High |

---

## 2. Detail per decision

### 2.1 D1 — The pipeline is one pure async generator (one-way door)

**Options considered.**
- (a) Ad-hoc route handlers that call models and build the spec inline.
- (b) A workflow engine or queue (Cloudflare Workflows, a job system).
- (c) **One pure async generator over injected ports** (chosen).

**Why (c).** The founder's concern is "do it right from the beginning". The things that are hard to retrofit are replay, evaluation and provider swaps. All three need the model calls to be the *only* impure part. With (c):
- Replay is "run the generator with a `DecisionPort` that returns recorded responses".
- The evaluation harness is "run the generator in Node over 50 briefs".
- Self-hosting on Node is "wrap the generator in a Node route".
- Tests run with a mock port and need no key.

(a) welds transport to logic and makes replay a rewrite. (b) adds a moving part we do not need for a ~1 s request; Workers already allow unlimited wall time while the client is connected ([Workers limits](https://developers.cloudflare.com/workers/platform/limits/)) [V].

```ts
// packages/pipeline/src/generate.ts
export interface Deps {
  decide: DecisionPort;          // section 3.1
  write: TextPort;               // section 3.5
  library: LibrarySnapshot;      // immutable, content-hashed (area 2 builds it)
  records: RecordSink;           // R2/D1 on Workers, filesystem/SQLite on Node (area 4)
  cache?: DecisionCache;         // optional, section 2.17
  clock: () => number;           // injected for replay and tests
  rng: (purpose: string, key: string) => number; // seeded, section 2.17
  log: Logger;
}

export type GenInput =
  | { kind: "create"; brief: string; locale?: string; seed?: string }
  | { kind: "edit"; message: string; spec: Spec; selection?: Selection; seed?: string }
  | { kind: "wall"; brief: string; count: number; seed?: string };

export function generate(input: GenInput, deps: Deps, signal: AbortSignal): AsyncIterable<GenEvent>;
```

Rules that keep it pure: no `Date.now()`, `Math.random()` or `fetch` anywhere in `packages/pipeline` except through `Deps`. A lint rule enforces it (one `no-restricted-globals` entry).

### 2.2 D2 — Our own decision IR (one-way door)

**Options.** (a) Use TypeSafe's System One JSON as the internal format. (b) Use the AI SDK's `Experimental_DecisionQuestion` types. (c) **Our own small IR, deliberately close to System One** (chosen).

**Why.** Questions and answers end up in manifests, records and policies that live for years. (a) ties us to one vendor's naming, and its Choice options are a JSON map whose order the API does not promise to keep (Gemini sorts them [V]). (b) is labelled experimental and may change in patch releases [V]. Our IR is about 60 lines, maps to every provider in a few lines, and makes option order explicit.

Three choices inside the IR that matter later:
1. **Options are an ordered array**, each with a stable library key. Wire keys are generated per request (section 2.6).
2. **Distributions are nullable.** LLM emulation and some adapters return no distribution ([AI SDK: the Anthropic adapter "returns no probability distributions for Choice or Score"](https://ai-sdk.dev/docs/ai-sdk-core/decisions)) [V]. Every consumer must handle `null`.
3. **Confidence is ours.** Providers define it differently: TypeSafe computes it from the spread of the distribution ([Confidence](https://docs.typesafe.ai/confidence)) [V]; Gemini defines it as the top option's probability ([Gemini docs](https://ai.google.dev/gemini-api/docs/decisions-api)) [V]. Our policies use `pTop` and `margin = p1 − p2` computed from the distribution. The provider's own confidence is stored in the record only.

The full types are in section 3.1.

### 2.3 D3 — Provider adapters and how each maps

All decision providers in November 2026 share one model: a shared state, many independent typed questions, probabilities out, output tokens free.

| Provider (verified 2026-11-14) | Endpoint | bool / choice / score names | Max questions per request | Options per Choice | Score levels | Context | Option order | Distributions | Notes |
|---|---|---|---|---|---|---|---|---|---|
| **TypeSafe Jev 1.14** (`jev-1.14.0`) | `POST https://api.typesafe.ai/v1/systemone` | `noul` / `choice` (criteria map) / `score` (criteria array) | No count limit; bounded by 64k tokens per request and 32k per question | 1–255 | "up to 10" | 64k (262k with the "danger zone" header, "slower and less accurate") | JSON key order as sent [E: not documented] | Native, plus `confidence` | $0.042/M input; no cached-input discount [R, Airbnb via research]; 429 and 529 on overload. [Models](https://docs.typesafe.ai/models), [API](https://docs.typesafe.ai/api/system-one), [errors](https://docs.typesafe.ai/api/errors) [V] |
| **Cloudflare clef-flash** | `env.AI.run("@cf/cloudflare/clef-flash", …)` or REST `/ai/run/@cf/cloudflare/clef-flash` | `noul` / `choice` / `score` (System One shape) | **64** | 2–255 | 2–10 | **24,576 tokens; long text state is silently truncated** | As sent [E] | Native, plus `confidence` | $0.038/M input; zero data retention; open weights, Apache-2.0. [Model page](https://developers.cloudflare.com/workers-ai/models/clef-flash/), [input schema](https://developers.cloudflare.com/workers-ai/models/clef-flash/schema-input.json), [model card](https://huggingface.co/Cloudflare/clef-flash) [V] |
| **Gemini Decision 1** (`gemini-decision-1`) | `POST https://generativelanguage.googleapis.com/v1beta/decisions` | `noul` / `choice` / `score` | 1–1,000 | 2–255 | 2–255 (2–10 recommended) | 262,144 | **Alphabetical by key (UTF-8 byte order)**; ties go to the first key | Native; yes/no probabilities clipped to 0.01–0.99 | $0.10/M input; no context caching; a safety block fails the whole request with HTTP 400. [Docs](https://ai.google.dev/gemini-api/docs/decisions-api), [blog, 11 Nov 2026](https://blog.google/innovation-and-ai/technology/developers-tools/gemini-decisions-api/) [V]. The AI SDK says the endpoint "requires Decisions EAP access" [V], while Google's blog says anyone can start with an AI Studio key: **conflicting** |
| **OpenAI Decisions** (`gpt-6-luna`) | `POST /v1/decisions` | `predicate` / `choice` (array of `{value, description}`) / `score` (array of `{label, description}`) | 1–400 | 2–255 | not stated | not stated on the page; the Gateway lists 1.05M for `gpt-6-luna-decisions` | Array order | Native, plus `confidence`; **any single question may come back as `refusal`** | $0.10/M uncached; prompt caching on a ≥1,024-token shared prefix; US and EU processing. [Guide](https://developers.openai.com/api/docs/guides/decisions), [reference](https://developers.openai.com/api/reference/resources/decisions/methods/create) [V] |
| **Open servers**: Ollaya, SGLang, Ollama 0.40 | `/v1/systemone` (TypeSafe wire format) | as TypeSafe | Per model | **Per model** (e.g. `jevk5` up to 16, `snap` up to 26, `arbiter` 16 options and exactly 6 levels) | Per model | Per model | As sent | Each author's calibration (Ollaya); "raw softmax" on Ollama | Ollaya is Apache-2.0, 29 model families, runs on CPU (`laya`) or GPU. [Ollaya README](https://github.com/ollaya-dev/ollaya) [V for the README; R for its benchmarks] |
| **Vercel AI Gateway** | via `experimental_decide({ model: "typesafe-ai/jev-1.14.0" })` or the v4 evaluation endpoint | as the routed model | as the routed model | | | | | Native for native models | 21 "evaluation" models listed, including `typesafe-ai/jev-1.14.0`, `google/gemini-decision-1`, `openai/gpt-6-luna-decisions`, `perplexity/pplx-decider-flash-v1.3` ($0.01/M) ([Gateway model list](https://ai-gateway.vercel.sh/v1/models)) [V] |
| **Any chat LLM** (emulation) | our `llm-emulated` adapter over the AI SDK | emulated | ~70 per call on Cerebras strict mode (500 enum values in total) | ≤ 20 for the logprob mode | any | the model's | as sent | `null` (structured mode) or approximate (logprob mode) | See below |

**Adapters to build.**

| Adapter | Covers | Size [E] | When |
|---|---|---|---|
| `systemone` | TypeSafe direct, Ollaya, SGLang (clef-flash, others), Ollama, Cloudflare REST | ~120 lines of `fetch` + zod response parsing | M0 |
| `workers-ai` | clef-flash and clef through the `AI` binding (no key, no subrequest) | ~40 lines, reuses the `systemone` mapper | M0 |
| `mock` | tests, CI, replay | ~60 lines; returns recorded responses or rule-based answers | M0 |
| `ai-sdk-decide` | OpenAI, Google, Gateway, Anthropic, Perplexity | ~80 lines around `experimental_decide`, pinned exact `ai` version | M1 |
| `llm-emulated` | any chat model the self-hoster has | ~200 lines | M1 (structured mode), later (logprob mode) |

Each adapter declares its **capabilities**, and the executor (section 3.1) uses them to chunk requests, map score levels, and choose the order mechanism:

```ts
export interface ProviderCaps {
  maxQuestions: number;          // Jev: Infinity, clef-flash: 64, OpenAI: 400, Gemini: 1000
  maxOptions: number;            // 255 for the big four; per model on open servers
  maxScoreLevels: number;        // 10 (TypeSafe docs, clef), 255 (Gemini)
  contextTokens: number;         // 64_000 (Jev), 24_576 (clef-flash), 262_144 (Gemini)
  truncatesState: boolean;       // true for clef-flash: never rely on it, check before sending
  optionOrder: "as-sent" | "alphabetical-key";
  distributions: "native" | "approximate" | "none";
  perQuestionRefusal: boolean;   // OpenAI
  costPerMInputUsd: number;
}
```

**What a self-hoster with only an ordinary LLM key can do.** Four tiers, from best to simplest:

1. **A cheap decision key.** A Gemini AI Studio key, a TypeSafe key, or a Cloudflare account (clef-flash costs $0.038/M and runs from the same Worker) gives full quality. If they deploy to Cloudflare, they need no second account at all.
2. **A local open decision model.** Ollaya on CPU (`laya`, "five questions in 516 ms on a CPU") or on an NVIDIA GPU (`winnow:e4b`, "113 ms for five questions on an RTX 5090") [R, Ollaya README]. Ninety questions on a CPU will be several seconds [E]. clef-flash itself needs a GPU (tested on an H200 [V]; a 9B model in bf16 needs about 18–20 GB of memory [E]).
3. **LLM emulation, structured mode.** One call with a strict JSON schema: one enum field per question (Choice: the option codes; bool: `"yes" | "no"` plus a 0–100 `certainty` integer; score: level indices). Use the lowest reasoning setting (Cerebras accepts `reasoning_effort: "none"` ([API reference](https://inference-docs.cerebras.ai/api-reference/chat-completions)) [V]). About 8–10 output tokens per question, so ~900 for 90 questions: **~0.8–1.3 s** on Cerebras gpt-oss-120b and ~1.3–1.8 s on Groq gpt-oss-20b [E, from the research's speed figures]. Cerebras strict mode caps the schema at 500 enum values in total and 5,000 counted characters ([structured outputs](https://inference-docs.cerebras.ai/capabilities/structured-outputs)) [V], so the adapter chunks at ~70 questions. No distributions: The Wall falls back to rule-based diversity (section 2.14), and the router treats every answer as medium confidence.
4. **LLM emulation, logprob mode (later).** Where the endpoint returns `top_logprobs` (Cerebras up to 20 [V]; OpenAI chat models; vLLM and llama.cpp locally), code options as single-letter tokens, read the top-20 log-probabilities at each answer position, renormalize, and average two cyclic rotations. This is the "AnyJev" trick [R, community list]. Groq: "top_logprobs … is not yet supported by any of our models" ([Groq API reference](https://console.groq.com/docs/api-reference)) [V], so Groq gets structured mode only.

**Is emulation good enough?** For producing a sensible site, probably yes [E]: the questions are short gut checks and an LLM handles them. For thresholds tuned on a native model, no: LLM answers are not calibrated (the AI SDK says the Anthropic adapter's estimates "are not guaranteed to be calibrated" [V]), and TypeSafe's consistency cookbooks found "every LLM condition tested has an item that flips more than 10% of the time" [R, vendor]. **Treat tier 3 as a supported, slower, lower-quality mode with its own policy table**, not as equal.

A fifth, always-present tier: **no model at all.** The `mock` adapter with rule answers gives archetype defaults and the block's default copy. It costs nothing to keep because tests need it anyway.

### 2.4 D4 — Default decision model for M0 (two-way door)

Do not choose by reputation; M0 exists to measure. Run the 20 golden briefs (section 2.19) through Jev 1.14 and clef-flash, and Gemini Decision 1 if the key works.

What we know before measuring:
- Cloudflare's own Decision Index run puts clef-flash ahead of Jev on most rows and reports **median latency 38.8 ms and p95 122.4 ms for clef-flash against 524.1 ms for Jev** ([model card](https://huggingface.co/Cloudflare/clef-flash)) [R: a competitor's measurement, from its own network]. TypeSafe says "most calls complete in about 100 ms" [R, vendor].
- clef-flash's 64-question cap means our ~90-question Plan is two parallel calls; its 24,576-token context is ample for a ~250-token state plus ~45 questions per chunk.

Expected outcome [E]: clef-flash as the hosted default (no extra key, no subrequest, open weights), Jev or Gemini as the first fallback. Swapping is one config line, so this is a two-way door.

### 2.5 D5 — Where questions are defined (one-way door)

**Options.** (a) Hand-written questions in pipeline code. (b) Per-archetype question files only. (c) Per-block manifests only. (d) **Three data sources compiled together** (chosen).

| Source | Owns | Example |
|---|---|---|
| **Global question bank** (`library/questions/*.ts`) | Questions every brief needs: archetype, vertical, goal, audience, tone axes, theme facets, fact checks, entity picks | `q.archetype`, `q.tone.warmth`, `q.fact.has_physical_location` |
| **Archetype manifest** (area 2) | Default sections and order, min/max sections, which optional sections are candidates, order adjusters | `local-food-shop`: hero, about, menu-highlights, hours-location, gallery, testimonials?, faq?, contact |
| **Block and theme manifests** (area 2) | A relevance question for the section type, a fit description per variant, rules (`requires`, `excludes`), slots | `menu-highlights`: relevance "Does the business sell items a visitor would want to browse before coming?"; variants `card-grid` (fit: "6–12 items with photos"), `list` (fit: "many items, no photos") |

Why (d): a block written by the founder or, later, by the foundry agent becomes askable the moment its manifest is valid. No pipeline code changes when the library grows. (a) does not scale past a few blocks; (b) duplicates variant text across archetypes; (c) cannot express page-level questions.

Every question has a **stable ID** (`block:menu-highlights.variant`), a **template ID and version** (`tpl.variant-choice@2`), and a **binding** that says how its answer becomes a decision. Changing the words of a question bumps its template version; the record keeps both, so the harness can tell a model change from a wording change.

### 2.6 D6 — Order bias (two-way mechanism; recording it is one-way)

Evidence: Jev "leans toward the option that comes first" ([Model jaggedness](https://docs.typesafe.ai/model-jaggedness)) [V]; a small independent probe found 88% correct when first against ~57–62% later [R]. Gemini sorts keys alphabetically [V], so JSON order means nothing there.

**Mechanism.**
1. **Wire keys carry the position.** The compiler names each option on the wire `o{NN}_{slug}`, for example `o01_card_grid`, `o02_list`. Alphabetical order then equals intended order on Gemini, and the slug keeps the name readable for providers that read option names. The adapter maps wire keys back to library keys. Whether the `oNN_` prefix itself shifts answers is unknown; the permutation test in the harness measures it [E].
2. **Seeded permutation per question.** Position order is a permutation drawn from `rng("perm", questionId)`. Over many users, no option is systematically first. The permutation is recorded.
3. **Rotations for high stakes.** Questions marked `stakes: "high"` (archetype, palette family, hero variant) are sent `k = 3` times in the same request with cyclic shifts (`q#r0`, `q#r1`, `q#r2`). The executor averages the three distributions. Decision models evaluate questions independently ([Gemini: "adding or removing one doesn't change the other answers"](https://ai.google.dev/gemini-api/docs/decisions-api)) [V], so this costs tokens, not latency. Cost: ~3 × 500 tokens × 3 questions ≈ 4.5k extra tokens ≈ $0.0002 on Jev [E].
4. **Neutral option text.** Option descriptions come from manifests and describe concrete situations, as the Score docs advise [V].

### 2.7 D7 — Thresholds and fallbacks (two-way door)

A `Policy` is data, keyed by stakes and by model version, because calibration differs per provider. Starting values are guesses [E] to be tuned by the harness:

| Stakes | Accept when | Otherwise |
|---|---|---|
| `high` (archetype, page goal) | `pTop ≥ 0.55` and `margin ≥ 0.15` | If `margin < 0.05`: ask one clarifying question in chat ("A bakery shop, or a café with seating?") and build the top option meanwhile. Else: take the top option and offer the runner-up as an alternative |
| `medium` (variant, palette, type pairing) | `pTop ≥ 0.40` | Archetype default for that slot |
| `low` (density, corner style) | always take the top | — |
| `bool` add/remove section | add if `p ≥ 0.65`, drop optional if `p ≤ 0.30` | Keep the archetype default between those two |
| re-decision on edit or regenerate | change only if the new top beats the current value by `≥ 0.15` | Keep the current value (hysteresis, from the research) |
| `distribution = null` (emulation) | treat `pTop` as 0.6 | Same rules; The Wall uses rule-based diversity |

Every resolved decision records its `source`: `model`, `default`, `rule`, `user` or `fallback`, so the harness can count how often fallbacks fire.

### 2.8 D8 — Narrowing a big library (two-way door)

The question count must not grow with the library. The research's Plan request is ~90 questions at ~10k tokens; a library of 300 blocks × 5 variants = 1,500 variants would be far over budget if asked flat.

**Stage 0 (build now, good to ~300 blocks and ~12 variants per section type).** Rules plus hierarchy, all in **one request**:
1. **Rules in code** drop what cannot apply: blocks not tagged for the shortlisted archetypes, blocks whose `requires` facts are certainly false (a `booking-form` needs `fact.takes_bookings`), variants whose `fit` rules contradict the signals (a `gallery-masonry` needs ≥ 6 images when the user supplied images).
2. **Archetype shortlist.** Ask the archetype Choice over all archetypes (expected ~24, well under 255 options).
3. **Speculative fan-out.** For the top 2 archetypes' candidate sections (union, ~30), ask one relevance bool each and one variant Choice each (≤ 12 options after rules). This is TypeSafe's documented "speculative fan-out" pattern ([Fan-out](https://docs.typesafe.ai/patterns/fan-out)) [V]. Code ignores answers for sections that end up unused.

**Stage 1 (add when one section type has > ~12 variants or the archetype list passes ~40).** Two-level variant questions in the same request: a "family" Choice (hero: split, centered, full-bleed, video, collage) plus a within-family Choice for every family. Still one request.

**Stage 2 (add when candidates for one decision pass ~255, e.g. foundry-grown variants, a reference-site library, image picking).** A **parallel Noul screen**: one bool per candidate ("Does `{variant fit}` suit this brief?"), then a final Choice over the top 20. TypeSafe's own cookbook got the right film first 78% of the time this way, against 33% with an embedding shortlist ([Infinite cardinality](https://docs.typesafe.ai/cookbooks/infinite_cardinality_choice)) [V, vendor-run]. At ~40 tokens per candidate, 500 candidates ≈ 20k tokens ≈ $0.0008 on Jev [E].

**Stage 3 (add when candidates pass ~1,000 for one decision).** Embeddings first, then the Noul screen on the top 100:
- **Model:** EmbeddingGemma 2 (768 dimensions, 8,192-token context), `@cf/google/embeddinggemma-2` at $0.0017 per million tokens on Workers AI ([model page](https://developers.cloudflare.com/workers-ai/models/embeddinggemma-2/), [pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)) [V]. Self-hosters run the same weights: ONNX for transformers.js and GGUF for llama.cpp exist on Hugging Face (`onnx-community/embeddinggemma-2-ONNX`, `ggml-org/embeddinggemma-2-GGUF`) [V for existence].
- **Store:** library vectors are computed at library build time and shipped with the library snapshot. Brute-force cosine search in code up to ~20k vectors (as int8, 20k × 768 bytes ≈ 15 MB [E], acceptable inside a 128 MB isolate). Beyond that: Cloudflare Vectorize (up to 1,536 dimensions, `topK` 50 with metadata ([limits](https://developers.cloudflare.com/vectorize/platform/limits/))) [V] on the hosted copy and pgvector or sqlite-vec for self-hosters, behind a `CandidateIndex` interface.

**Recommendation:** build Stage 0 only. A decision model is a better narrower than embeddings at our sizes, and Stage 0 adds no moving parts.

### 2.9 D9 — The text writer SDK (two-way door)

**Options.** (a) Provider SDKs directly (Cerebras, Groq). (b) **AI SDK 7** (`ai@7.0.172` [V]) with `@ai-sdk/cerebras` 3.0.92, `@ai-sdk/groq` 4.0.83, `@ai-sdk/openai-compatible` 3.0.92 and `workers-ai-provider` 4.0.1 [V, npm]. (c) Raw `fetch` to OpenAI-compatible endpoints.

**Recommendation: (b).** `streamText` with `output: Output.object({ schema })` gives `partialOutputStream` for streaming partial objects, schema validation at the end, and the same call shape across Cerebras, Groq, OpenAI-compatible self-hosted servers and Workers AI ([Generating structured data](https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data)) [V]. Self-hosters plug in any model with an env var. Pin exact versions; the core text APIs are stable, unlike `experimental_decide`.

**Structured-output mechanism by provider:**
- Cerebras gpt-oss-120b and Groq gpt-oss-20b/120b: `strict: true` JSON schema, constrained decoding ([Cerebras](https://inference-docs.cerebras.ai/capabilities/structured-outputs), [Groq](https://console.groq.com/docs/structured-outputs)) [V].
- **Cerebras strict mode does not support `minItems`/`maxItems`, `pattern` or `format`, and "string-length support is model-dependent"** [V]. So list slots use fixed-arity objects (`item1`, `item2`, `item3`) or `prefixItems` tuples, and lengths are enforced in code (D10).
- Workers AI "JSON Mode" covers a short list of older models and "currently doesn't support streaming" ([JSON mode](https://developers.cloudflare.com/workers-ai/features/json-mode/)) [V]. On Workers AI-only self-hosts, use gpt-oss-120b in plain JSON-prompt mode with the AI SDK's validation, and accept non-streamed slots [E].

**Schema per section type** is generated from the manifest's content model (area 2), not written by hand:

```ts
// Generated from contentModel("menu-highlights")
z.object({
  heading:    z.string().describe("Section heading. 12–48 characters. No prices."),
  intro:      z.string().describe("One sentence. 60–140 characters."),
  item1_name: z.string().describe("Name of a product the business named in the brief, or a generic category. 3–32 characters."),
  item1_blurb:z.string().describe("20–90 characters. Do not state prices, awards, or numbers."),
  item2_name: z.string().describe("…"), item2_blurb: z.string().describe("…"),
  item3_name: z.string().describe("…"), item3_blurb: z.string().describe("…"),
}).strict()
```

**Streaming into slots.** `partialOutputStream` yields growing objects. The writer diffs each partial against the last emitted value and emits a `slot` event only when a slot's text grew by a whole word, so the client re-renders at word boundaries. When the stream ends, the final object is validated and guarded (D10, D11) and a `slot` event with `final: true` goes out for every slot.

**Running sections in parallel.** Workers allow six connections waiting for response headers at once; a seventh queues ([limits](https://developers.cloudflare.com/workers/platform/limits/#simultaneous-open-connections)) [V]. Streaming LLMs return headers at time-to-first-token (~0.2 s), so the slots free quickly, but Groq's developer tier is also limited to 1K requests per minute [V, research]. **Group wave 2 into at most 4 calls**, balanced by expected output tokens (a FAQ with 5 pairs is heavier than a CTA band). Each call's schema is the union of its sections' schemas.

**Two waves**, as the research proposed:
- **Wave 1, brand kernel, starts at t = 0** in parallel with the decision request: cleaned business name, tagline, hero headline and subhead, primary CTA label, 3 value props, a short about blurb, SEO title and description. It needs no decisions: the hero content model is the same for every hero variant.
- **Wave 2 starts when the Plan resolves** (~0.3 s). Its prompt includes the brief, the facts ledger, the resolved tone and a short "voice card" (tone values in words). It does **not** wait for wave 1 to finish; consistency of the business name comes from the facts ledger, not from wave 1 [E: simpler, saves ~0.25 s].

**Self-hosters** configure `TEXT_MODEL` as `provider:model` (`cerebras:gpt-oss-120b`, `groq:openai/gpt-oss-20b`, `openai-compatible:http://localhost:11434/v1#qwen3.8-27b`, `workers-ai:@cf/openai/gpt-oss-120b`). The provider registry resolves it.

### 2.10 D10 — Length limits and slot retries (two-way door)

1. Lengths live in the content model (`min`, `max` characters) and are rendered into the schema `.describe()` text and a one-line rule in the prompt.
2. After the call ends, each slot is checked:
   - Within limits: accept.
   - Over `max` by ≤ 15%: trim in code at the last sentence or word boundary that fits, without an ellipsis in headings.
   - Over by more, or under `min` by more than half: one **targeted rewrite** call for that slot only ("Rewrite to 40–60 characters, same meaning: …"), non-streaming, ~150–300 ms [E]. Meanwhile the trimmed text is shown.
   - The rewrite still fails: keep the trimmed text and add a `warn` to the record.
3. At most one retry per slot, at most 3 retries per generation. Retries run in the background and arrive as later `slot` events.

### 2.11 D11 — Keeping out facts the user did not supply (one-way door)

Fake reviews and invented prices are a trust problem and a legal one. Prompts alone do not prevent them. The design makes invention structurally impossible for the slots that matter:

1. **Every slot declares a `factKind`** in the content model (requirement on area 2): `copy` (free marketing text) or a fact kind: `price`, `hours`, `address`, `phone`, `email`, `testimonial`, `stat`, `award`, `person`, `date`, `link`.
2. **Fact slots never go to the LLM.** Code fills them from the **facts ledger**: values extracted from the brief by regex and by decision-model picks over extracted spans (TypeSafe's "pre-parsed value extraction" pattern [V, docs index]), later from a pasted business link (M2). If the ledger has no value, the slot gets a **placeholder chip** ("Add your opening hours"), or the block is not chosen when its manifest says it `requires` that fact.
3. **Free copy is guarded.** A number-and-quote guard scans each `copy` slot for currency amounts, percentages, counts ("500+ customers"), years ("since 1998"), star ratings and quoted speech. Anything not present in the ledger is removed by a rewrite call or, for a whole sentence, dropped. Optional later: one batched bool per slot on the decision model ("Does this text state a specific fact such as a price, number, award or customer quote that is not in `facts`?"), ~$0.0001 per site [E].
4. **Provenance is stored in the spec** (requirement on area 1): every slot value records `source: "user" | "fact" | "generated" | "placeholder" | "default"` and the `genId` that wrote it. Later regenerations never overwrite `user` or `fact` text.

This is a one-way door because it shapes the block manifest and the spec. Adding `factKind` to 300 blocks later is a painful migration.

### 2.12 D12 — The edit router (two-way door)

Each chat turn sends one **Edit request** to the decision model. State: the message, a compact outline of the spec (`[{id, type, variant, label}]`), a theme summary in words, and the selection if the user clicked something. Questions, all in one request:

| Question | Type | Options |
|---|---|---|
| `op` | Choice | add section, remove section, move section, change variant, restyle theme, change text, change image, undo, ask a question, other |
| `target` | Choice | the current section labels, plus "the whole site" |
| `new_section_type` | Choice | candidate section types for this archetype (~30) |
| `destination` | Choice | "before X" / "after X" for each section |
| `variant_for_{each section}` | Choice | that section's variants (speculative) |
| `theme_property` + `theme_direction` | Choice + Score | palette, type, density, corners, imagery / much less … much more |
| `style_word` | Choice | the style lexicon (~200 entries, research section 4) |
| `is_compound`, `is_vague`, `none_fits`, `needs_new_text`, `quotes_exact_text` | bool | — |

**Router (pure code):**

```ts
function route(a: EditAnswers, p: Policy): Route {
  if (a.op.top === "ask_a_question" && a.op.pTop >= 0.6) return { kind: "chat" };
  const opRisk = p.opRisk[a.op.top];                 // remove: 0.80, move: 0.65, text: 0.50 …
  const fastOk =
    a.op.pTop >= opRisk && a.target.pTop >= 0.55 &&
    a.is_compound < 0.30 && a.is_vague < 0.40 && a.none_fits < 0.30;
  const slowLikely = 1 - Math.min(1, (a.op.pTop + a.target.pTop) / 2) + a.is_compound * 0.5;
  if (fastOk && slowLikely < 0.3) return { kind: "fast" };
  if (fastOk) return { kind: "fast+speculative-slow" };   // apply fast; if slow disagrees, offer "Did you mean …"
  return { kind: "slow" };
}
```

Compound requests go straight to the slow path. The research's "LLM splitter then parallel fast paths" is deferred: it adds a moving part, and the slow path already handles several operations [E].

Latency [E]: fast path ~0.25–0.35 s; with new text +0.3–0.45 s; slow path ~0.8–1.5 s.

### 2.13 D13 — The slow path can only emit valid operations (one-way door)

The slow path is an LLM with tool calling (AI SDK `streamText` with `tools`, `toolChoice: "required"`, `stopWhen: stepCountIs(8)`). **Its only tools are spec operations.** It cannot return markup, styles or a free-form spec.

Safety comes from four layers:
1. **Schemas built per request from real IDs.** `blockId` is `z.enum([...current block IDs])`, `sectionType` is `z.enum([...section types allowed for this archetype])`, `variant` is `z.enum` over that type's variants, `slot` is `z.enum` over the target's slots. Constrained decoding (strict tools on Cerebras and Groq [V]) means the model cannot even name a block that does not exist.
2. **Every tool runs the shared `applyOp`** (area 1) on a **draft copy** of the spec and returns either `{ ok: true, outline }` or `{ ok: false, errors }`, so the model can correct itself.
3. **Text through the same guards.** `setText` is allowed only when `quotes_exact_text` is high (the user typed the words); otherwise the model calls `rewriteText`, which queues the text writer with its length and fact guards.
4. **Budgets.** Max 8 steps, max 12 operations, max 2,000 output tokens. The draft becomes one transaction (one undo step) only after `finish`.

```ts
// packages/pipeline/src/slow-path/tools.ts (shape; schemas are generated per request)
const tools = (ctx: SlowCtx) => ({
  addSection:     tool({ inputSchema: z.object({ sectionType: ctx.sectionTypeEnum, variant: ctx.variantEnumFor("*").optional(), position: ctx.positionEnum }),
                         execute: (i) => ctx.draft.apply({ op: "addBlock", ...i }) }),
  removeSection:  tool({ inputSchema: z.object({ blockId: ctx.blockIdEnum }), execute: (i) => ctx.draft.apply({ op: "removeBlock", ...i }) }),
  moveSection:    tool({ inputSchema: z.object({ blockId: ctx.blockIdEnum, position: ctx.positionEnum }), execute: (i) => ctx.draft.apply({ op: "moveBlock", ...i }) }),
  changeVariant:  tool({ inputSchema: z.object({ blockId: ctx.blockIdEnum, variant: ctx.allVariantsEnum }), execute: (i) => ctx.draft.apply({ op: "replaceVariant", ...i }) }),
  setTheme:       tool({ inputSchema: ctx.themePatchSchema /* enums of token presets */, execute: (i) => ctx.draft.apply({ op: "setTheme", patch: i }) }),
  setText:        tool({ inputSchema: z.object({ blockId: ctx.blockIdEnum, slot: ctx.slotEnum, text: z.string().max(400) }), execute: (i) => ctx.draft.setUserText(i) }),
  rewriteText:    tool({ inputSchema: z.object({ blockId: ctx.blockIdEnum, slots: z.array(ctx.slotEnum).max(6), instruction: z.string().max(300) }), execute: (i) => ctx.queueRewrite(i) }),
  finish:         tool({ inputSchema: z.object({ summary: z.string().max(200) }), execute: (i) => ctx.finish(i) }),
});
```

Cerebras warns not to combine `tools` and `response_format` unless the model documents it [V]; the slow path uses tools only.

### 2.14 D14 — The Wall (two-way door)

**Goal:** one brief gives 24–48 complete, different sites, quickly and cheaply.

**Sequence:**
1. **One Plan request** with the normal questions (the distributions are the raw material), plus a few Wall-only Choices that are cheap to add: a second palette question phrased for "an alternative direction", and the hero family Choice.
2. **Sampler on the server** (pure code, shared package, seeded). Inputs: decisions with distributions, the library, `count`, `seed`. Output: N spec skeletons (ops without text).
   - For each axis (section set, each section's variant, palette family, type pairing, density, corners, imagery), draw from the distribution sharpened by temperature `τ = 0.7`, ignoring options with `p < 0.05`.
   - Draw `4N` candidates, then select `N` by **greedy farthest-point sampling** on a feature vector (area 2 supplies a "layout signature" per variant and facet values per theme), with a quality floor: the joint log-probability must stay within a set distance of the best site.
   - Every candidate passes the spec validator; invalid ones are dropped.
   - When distributions are `null` (emulation), sample uniformly among options that pass the rules.
3. **One text pass** over the *union* of section types used by the N sites. Text is per section type (one-way door 6 in section 0), so every site uses the same words. A union is typically ~12–16 types instead of ~8 [E], so text costs ~1.5–2× one site, not N×.
4. **Stream:** the `wall` event (N skeletons, ~1–2 KB each) arrives at ~0.35–0.5 s; `slot` events then fill every site at once.

**Server or client:** the server samples (one source of truth, recorded and replayable, and the server must know the union to write text). The client renders, virtualizes and **cross-breeds**: "layout of A with the colors of B" is a pure spec operation on data the client already has. "More like this" re-runs the shared sampler in the browser, conditioned on the picked site's features, with no server call and no model cost (unless it introduces a section type without text, which then triggers one small text call).

**Precomputed archives** (the founder's curated, rated theme × layout pairs) are deferred until the rating page (section 2.19) has data. Then the sampler draws, say, half its candidates from the archive.

### 2.15 D15 — Transport: NDJSON from a server route (two-way transport, one-way protocol)

**Options.**
- (a) TanStack Start server function returning an async generator. Typed and supported: "the two most popular ways of streaming data from server functions are using `ReadableStream`-s or async generators" ([TanStack Start docs](https://github.com/TanStack/router/blob/main/docs/start/framework/react/guide/streaming-data-from-server-functions.md)) [V].
- (b) **A server route `POST /api/generate` that returns a `ReadableStream` of NDJSON** (chosen).
- (c) Server-Sent Events. `EventSource` is GET-only, so a POST with a brief needs a fetch-based SSE reader anyway, and SSE's reconnect behavior is not useful for a ~1 s request.
- (d) WebSockets. On Workers they need a Durable Object to hold state; that is a moving part for live collaboration, not for generation.

**Why (b) over (a):** the event protocol is the one-way part, and it should be ours, not the framework's serialization. The evaluation CLI, a future public API and tests all consume the same `POST /api/generate` stream. The route is about 20 lines around `generate()`. Both (a) and (b) run unchanged on Workers and on the Node target ([TanStack Start hosting](https://github.com/TanStack/router/blob/main/docs/start/framework/react/guide/hosting.md) lists `cloudflare-workers` and `node-server`) [V]. Switching later is cheap.

**Event protocol v1** (one JSON object per line):

```ts
export type GenEvent =
  | { v: 1; t: "start"; genId: string; kind: GenInput["kind"]; libraryVersion: string; seed: string }
  | { v: 1; t: "spec"; txId: string; ops: SpecOp[] }                 // initial assembly, or an edit transaction
  | { v: 1; t: "wall"; sites: { siteId: string; ops: SpecOp[]; features: Record<string, string> }[] }
  | { v: 1; t: "slot"; blockId: string; slot: string; text: string; final: boolean; source: SlotSource }
  | { v: 1; t: "ask"; question: string; options?: string[] }       // clarifying question from a fallback
  | { v: 1; t: "suggest"; label: string; ops: SpecOp[] }            // "Did you mean …", runner-up archetype
  | { v: 1; t: "warn"; code: string; detail?: string }
  | { v: 1; t: "error"; code: string; retryable: boolean }
  | { v: 1; t: "done"; usage: Usage; costUsd: number; timingsMs: Record<string, number> };
```

The client applies `spec` ops with the same `applyOp` as the server (area 1) and writes `slot` text through `setContent`.

**Worker limits that matter** ([limits page](https://developers.cloudflare.com/workers/platform/limits/)) [V]:
- **CPU time:** 10 ms on the Free plan, 30 s default on Paid. Partial-JSON parsing of 4–5 concurrent LLM streams plus spec assembly is likely to exceed 10 ms [E]. **The hosted copy needs the Workers Paid plan.**
- **Subrequests:** 50 per request on Free, 10,000 on Paid. A generation makes ~6–10 [E]. The `AI` binding is a Cloudflare service; its count against the limit is not stated on the page.
- **Six connections waiting for headers:** handled by grouping text calls (D9).
- **Client disconnect:** outstanding work may be cancelled; `ctx.waitUntil()` extends up to 30 s. The record write goes in `waitUntil`.
- **Memory:** 128 MB per isolate. Keep the library snapshot compact; Cloudflare advises zod ≥ 4.5.0 for memory ([limits page](https://developers.cloudflare.com/workers/platform/limits/#memory)) [V]; current zod is 4.6.7 [V, npm].

**Node for self-hosters:** the same route on the `node-server` target. `Deps` gets Node implementations (filesystem or SQLite record sink, in-memory rate limiter). Nothing in `packages/pipeline` imports a Cloudflare API.

### 2.16 D16 — Speculative work while typing (two-way door)

**Recommendation: the client starts the real request early and aborts it.** When the brief has ≥ 6 words and the user pauses for 400 ms, the client sends `POST /api/generate` with `speculative: true` and buffers the events without showing them. On Enter, if the brief is unchanged, it renders the buffer at once and keeps reading. If the user types more, it aborts with `AbortController` and the server's `signal` cancels pending model calls.

This needs no server cache and no session store. Costs [E]: aborted requests still pay for calls that already started, roughly ~$0.002 per brief at ~5 speculative starts (the research's figure). Limits: speculation only for sessions that passed Turnstile, at most 3 speculative starts per brief, and off when the spend governor reports a tight budget (D20).

### 2.17 D17 — Determinism, records and replay (one-way door)

**What is recorded per generation** (full type in section 3.6):
- Input: brief or message, locale, selection, a reference to the spec before the edit.
- Versions: app git SHA, compiler version, **library content hash**, policy version.
- **Seed.** One random 128-bit seed per generation. All randomness (option permutations, Wall sampling, tie breaks) comes from `rng(purpose, key) = hashToUnit(xxhash64(seed + purpose + key))`. The hash function is part of `compilerVersion`.
- Signals extracted from the brief, and the facts ledger.
- **Every decision call:** provider, model requested, **model that answered** (Jev returns the versioned ID even for an alias [V]), the exact wire request and wire response (as R2 blobs), latency, usage, cost, errors.
- Compiled questions: IDs, template versions, permutations, rotations, bindings.
- Resolved decisions with `source` and our confidence.
- The spec operations produced and the **spec hash** (canonical JSON, requirement on area 1).
- **Every text call:** provider, model, prompt hash and prompt blob, output, finish reason, usage, latency, retries; every guard action.
- Timings per stage and cost per stage.

Size: ~20–60 KB per generation, mostly wire payloads [E]. Hosted: index row in D1, payloads in R2, retention 30 days by default (a question for the founder). Self-hosted: JSONL files or SQLite.

**Replay modes:**

| Mode | Model calls | Uses | Must match |
|---|---|---|---|
| `exact` | none; the `mock` port returns recorded wire responses | debugging; CI after any code or library change | Same code and library: identical spec hash. Different code: a diff that shows the effect of the code change alone |
| `redecide` | decision calls again, same compiled questions; text replayed | comparing a new model version or provider | reports per-question flips and spec diff |
| `rewrite` | text calls again; decisions replayed | comparing text models or prompts | reports slot diffs and guard counts |

**Regenerate is not replay.** Regenerate is a user action: a new generation with a new seed, new calls and hysteresis against the current spec, linked by `parentGenId`. Replay never changes a user's site.

**Caching (D18).** Only an exact decision-response cache: key `sha256(adapterId, modelAnswered, canonical wire request)`, value the wire response, TTL 1 hour, in the Workers Cache API (per data center) or in memory on Node. It makes repeated Wall runs and eval reruns free. A cache hit is recorded as such. **Not built:** a cross-user brief-embedding cache. It risks showing one user's business details to another and needs privacy rules first.

### 2.18 Determinism limits to state plainly

- Decision providers have no seed. Jev's answers vary slightly between runs (vendor test: within 0.015 std dev) ([Parallel questions](https://docs.typesafe.ai/cookbooks/parallel_questions)) [V]. Hosted LLMs at temperature 0 are not reproducible (Thinking Machines got 80 unique completions from 1,000) [V, via research].
- So **the saved spec is the source of truth and replay uses recorded responses**. Nothing in the product depends on calling a model twice and getting the same answer.

### 2.19 D19 — The evaluation harness (smallest version worth building in M0)

**Build in M0:**

1. **Golden briefs:** `evals/briefs/*.yaml`, 20 at first, 50 by the end of M1. Each has assertions on the spec, not on wording:

```yaml
id: bakery-portland
brief: "Rosie's Bakery in Portland. Sourdough, croissants and custom cakes. Open Tue–Sun 7am–3pm. We want people to order cakes online."
expect:
  archetype: [local-food-shop, cafe-restaurant]
  sections_required: [hero, hours-location, contact]
  sections_any_of: [[order-form, contact]]
  sections_forbidden: [pricing-table, team, logo-cloud]
  facts: { hours: present, prices: absent }
  text_forbidden_patterns: ['\$\d', '\d+\+? (customers|reviews)', '★']
  max_ms: { first_spec: 600, text_done: 1500 }
```

2. **CLI:** `pnpm eval run --decide clef-flash --text cerebras:gpt-oss-120b --repeat 3` runs the real `generate()` in Node and writes every `GenerationRecord` to `evals/runs/<timestamp>/`. The summary table shows, per brief: assertions passed, p50 and p95 per stage, cost per site, the **flip rate across repeats** (self-consistency) and the **flip rate across permutation seeds** (order bias).
3. `pnpm eval replay <run>`: exact replay of every record; fails CI when a spec hash changes unexpectedly.
4. `pnpm eval compare <runA> <runB>`: which decisions changed, on which briefs, and the cost and latency difference.
5. **Rating page** (`/dev/rate`, local only): renders two sites side by side from records; keys `1`, `2`, `=` and an optional note; writes `evals/ratings.jsonl`. This is how the founder's taste becomes data.
6. **CI** runs `replay` and the assertions on recorded fixtures with the `mock` port, so no key is needed in CI.

**Defer:** a vision-model judge (the research found vision models agree with designers only about half the time), online A/B tests, a 300–500 brief set, automatic threshold tuning.

### 2.20 D20 and D21 — Keys, limits and abuse

**Hosted copy (founder's keys).**
1. **Keys** are Worker secrets read only in `*.server.ts` modules. TanStack Start's import protection denies `**/*.server.*` files in the client build by default and fails the build ([import protection](https://github.com/TanStack/router/blob/main/docs/start/framework/react/guide/import-protection.md)) [V]. No key, no provider URL with a key, and no raw provider error text is ever sent to the browser.
2. **Bot check:** Cloudflare Turnstile once per session before the first generation; on success the server sets a signed, HttpOnly session cookie carrying a session ID and a quota tier.
3. **Rate limits:** the Workers Rate Limiting binding, keyed by session ID and by IP, e.g. 6 generations per minute and 60 edits per minute. These limits are approximate and per data center ([rate limiting](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)) [V]; the period must be 10 or 60 seconds [V]. Daily per-session quotas live with the spend governor.
4. **Spend governor:** one Durable Object (strict and global, as Cloudflare recommends for upstream quotas [V]) holds today's estimated spend. Before a generation, the pipeline reserves its estimated cost (~$0.005); after `done`, it settles the real cost from usage. At 80% of the daily cap, speculation and The Wall shrink; at 100%, new generations run in **demo mode** (`mock` decisions plus default copy) with a notice, instead of failing.
5. **Provider-side caps:** set monthly budgets in each provider console, and a Workers spending limit ([limits page](https://developers.cloudflare.com/workers/platform/limits/)) [V].
6. **Input caps:** brief ≤ 2,000 characters, chat message ≤ 1,000, Wall size ≤ 48, slow-path budgets (D13). User text goes into prompts as data inside delimiters, never into system instructions.

**Self-hosted copy (the user's keys).**
- Keys come from environment variables (`DECISION_PROVIDER`, `DECISION_API_KEY`, `DECISION_BASE_URL`, `TEXT_MODEL`, `TEXT_API_KEY`, …), parsed with zod at startup into a typed config. A `/settings` page shows which providers are configured and their capabilities, never the values.
- An optional `INSTANCE_PASSWORD` puts the whole app behind a login, so a self-hoster who exposes it publicly does not burn their own keys. In-memory rate limits on Node.
- Keys never reach the browser here either: the browser talks only to the self-hosted server.

---

## 3. Interfaces and the worked example

### 3.1 The decision port

```ts
// packages/decide/src/types.ts
export type QuestionId = string;   // stable: "q.archetype", "block:menu-highlights.relevance"
export type OptionKey = string;    // stable library key: "local-food-shop", "menu-highlights/card-grid"

export interface ChoiceQuestion {
  kind: "choice";
  id: QuestionId;
  prompt: string;                                         // full question; models never see the id
  options: { key: OptionKey; label: string; description: string }[]; // ordered, 2..255
}
export interface BoolQuestion {
  kind: "bool";
  id: QuestionId;
  prompt: string;
  whenTrue?: string;
  whenFalse?: string;
}
export interface ScoreQuestion {
  kind: "score";
  id: QuestionId;
  prompt: string;
  levels: { label: string; description: string }[];      // ordered low → high, 2..10
}
export type Question = ChoiceQuestion | BoolQuestion | ScoreQuestion;

export type DecisionState = {
  brief: string;
  facts: Record<string, string | number | boolean>;
  context?: Record<string, unknown>;                     // e.g. spec outline for edits
};

export type Dist = Record<OptionKey, number>;            // sums to 1

export type Answer =
  | { kind: "choice"; id: QuestionId; top: OptionKey; dist: Dist | null; pTop: number; margin: number }
  | { kind: "bool";   id: QuestionId; pTrue: number }
  | { kind: "score";  id: QuestionId; expected: number; dist: number[] | null }
  | { kind: "missing"; id: QuestionId; reason: "refused" | "error" | "unsupported" | "timeout" };

export interface DecisionRequest {
  state: DecisionState;
  questions: WireReadyQuestion[];   // after permutation and rotation (section 3.2)
  deadlineMs: number;
}

export interface DecisionCallRecord {
  callId: string;
  adapter: string;                  // "systemone" | "workers-ai" | "ai-sdk-decide" | "llm-emulated" | "mock"
  modelRequested: string;
  modelAnswered: string;            // as returned by the provider
  wireRequest: unknown;             // stored as a blob reference in the record
  wireResponse: unknown;
  latencyMs: number;
  inputTokens?: number;
  costUsd?: number;
  error?: { code: string; message: string };
}

export interface DecisionResult {
  answers: Map<QuestionId, Answer>;
  calls: DecisionCallRecord[];      // one per chunk and per retry
}

/** One provider. Adapters only translate; they never chunk, retry across providers or debias. */
export interface DecisionAdapter {
  id: string;
  model: string;
  caps: ProviderCaps;               // section 2.3
  call(req: DecisionRequest, signal: AbortSignal): Promise<{ answers: Answer[]; record: DecisionCallRecord }>;
}

/** What the pipeline sees. The executor implements it on top of adapters. */
export interface DecisionPort {
  decide(state: DecisionState, set: CompiledQuestionSet, signal: AbortSignal): Promise<DecisionResult>;
}
```

**The executor** (`createDecisionPort({ primary, fallbacks, cache, policy })`) does, in order:
1. Expand rotations and permutations, assign wire keys `oNN_slug` (section 2.6).
2. Check token size with a conservative estimate (4 characters per token [E]); never rely on provider truncation.
3. Chunk to `caps.maxQuestions` and context. Chunks run in parallel.
4. Per chunk: call the primary; on 429, 529 or timeout, retry once with jitter, then call the first fallback for **that chunk only**.
5. On per-question refusals (OpenAI) or the AI SDK's whole-call `Experimental_DecisionRefusalError` (which lists the refused IDs [V]), resend the chunk without those questions; they become `missing`.
6. Map wire keys back, average rotations, compute `pTop` and `margin`.

**Mapping our IR to the System One wire format** (TypeSafe, clef, Ollaya, SGLang; Gemini is the same apart from `input` instead of `state`):

```ts
function toSystemOne(q: WireReadyQuestion) {
  switch (q.kind) {
    case "bool":   return { type: "noul", instructions: q.prompt,
                            criteria: q.whenTrue || q.whenFalse ? { true: q.whenTrue, false: q.whenFalse } : undefined };
    case "choice": return { type: "choice", instructions: q.prompt,
                            criteria: Object.fromEntries(q.wireOptions.map(o => [o.wireKey, `${o.label}. ${o.description}`])) };
    case "score":  return { type: "score", instructions: q.prompt,
                            criteria: q.levels.map(l => `${l.label}. ${l.description}`) };
  }
}
// OpenAI: predicate / choice with choices: [{ value: wireKey, description }] / score with levels: [{ label, description }]
```

### 3.2 The question compiler

```ts
// packages/compiler/src/types.ts
export type Stakes = "high" | "medium" | "low";

export interface QuestionTemplate<Ctx> {
  templateId: string;               // "tpl.variant-choice"
  version: number;                  // bump when wording changes
  build(ctx: Ctx): Question | null; // null = not applicable
}

export type Binding =
  | { to: "archetype" }
  | { to: "sectionRelevance"; sectionType: string }
  | { to: "variant"; sectionType: string }
  | { to: "themeFacet"; facet: string }
  | { to: "tone"; axis: string }
  | { to: "fact"; key: string }
  | { to: "entity"; key: string; spans: string[] }
  | { to: "orderAdjust"; before: string; after: string }
  | { to: "edit"; field: string };

export interface CompiledQuestion {
  question: Question;
  templateId: string;
  templateVersion: number;
  binding: Binding;
  stakes: Stakes;
  rotations: 1 | 3;
  speculativeFor?: string;          // e.g. "archetype=local-food-shop"
}

export interface WireReadyQuestion extends Question {
  wireId: string;                   // "q.archetype#r1"
  wireOptions?: { key: OptionKey; wireKey: string; label: string; description: string }[];
  permutation?: number[];           // recorded
}

export interface CompiledQuestionSet {
  compilerVersion: string;
  libraryVersion: string;
  questions: CompiledQuestion[];
}

export interface Signals {
  language: string;
  wordCount: number;
  spans: { kind: "name" | "city" | "phone" | "email" | "hours" | "price" | "url" | "date"; text: string; start: number }[];
}

export type FactsLedger = Record<string, { value: string; source: "brief" | "link" | "user"; span?: [number, number] }>;

export interface Decisions {
  archetype: Resolved<string>;
  sections: { type: string; variant: Resolved<string>; source: DecisionSource }[]; // ordered
  theme: Record<string, Resolved<string>>;
  tone: Record<string, Resolved<number>>;
  facts: FactsLedger;
  alternatives: { archetype?: string; hero?: string; palette?: string }; // runner-ups
}
export type DecisionSource = "model" | "default" | "rule" | "user" | "fallback";
export interface Resolved<T> { value: T; source: DecisionSource; pTop?: number; margin?: number; dist?: Record<string, number> | null }

// The four pure steps
export function extractSignals(brief: string): Signals;
export function compilePlan(brief: string, signals: Signals, lib: LibrarySnapshot): CompiledQuestionSet;
export function resolve(set: CompiledQuestionSet, res: DecisionResult, lib: LibrarySnapshot, policy: Policy): Decisions;
export function assemble(d: Decisions, lib: LibrarySnapshot): { ops: SpecOp[]; repairs: Repair[] };
```

`assemble` builds the spec from the archetype default, applies section adds and drops with min/max counts, orders by the archetype template plus order adjusters, sets variants and theme tokens through lookup tables, validates with the spec validator (area 1), and repairs invalid results by rule (drop the block, fall back to the default variant), recording each repair.

### 3.3 Worked example: a bakery brief, end to end

**Brief:** "Rosie's Bakery in Portland — sourdough, croissants and custom cakes. Open Tue–Sun 7am–3pm. We want people to order cakes online."

All probabilities below are **illustrative values I made up to show the mechanics. They are not model output.**

**Step 1. `extractSignals` (code, ~2 ms).** Language `en`, 23 words. Spans: name "Rosie's Bakery", city "Portland", hours "Tue–Sun 7am–3pm". No price, phone, email or URL. Facts ledger: `{ businessName: "Rosie's Bakery", city: "Portland", hours: "Tue–Sun 7:00–15:00" }` (the name and city get confirmed by entity questions below).

**Step 2. `compilePlan` (code, ~3 ms).** Rules: the brief mentions products and opening hours, so physical-business archetypes and their sections stay in. ~26 archetypes in the Choice. Candidate sections are the union for `local-food-shop` and `cafe-restaurant` (~22). Result: ~70 questions, ~7.5k tokens.

Excerpt of the wire request (System One format, as sent to clef-flash in chunk 1 of 2; clef-flash's 64-question cap forces two chunks):

```json
{
  "model": "clef-flash",
  "state": {
    "brief": "Rosie's Bakery in Portland — sourdough, croissants and custom cakes. Open Tue–Sun 7am–3pm. We want people to order cakes online.",
    "facts": { "hours_stated": true, "prices_stated": false, "images_supplied": 0 }
  },
  "questions": {
    "q.archetype#r0": {
      "type": "choice",
      "instructions": "Which kind of website fits this brief best?",
      "criteria": {
        "o01_local_food_shop": "Local food shop. A bakery, deli or grocer that customers visit to buy food to take away.",
        "o02_cafe_restaurant": "Café or restaurant. A place where customers sit down to eat or drink.",
        "o03_online_store": "Online store. Mainly sells products shipped to customers.",
        "o04_local_service": "Local service. A business that does work for customers, such as a plumber or salon."
      }
    },
    "q.archetype#r1": { "type": "choice", "instructions": "…same question…", "criteria": { "o01_cafe_restaurant": "…", "o02_online_store": "…", "o03_local_service": "…", "o04_local_food_shop": "…" } },
    "block:order-form.relevance": {
      "type": "noul",
      "instructions": "Should this website include a form where visitors place an order for collection or delivery?",
      "criteria": { "true": "The brief says customers order or pre-order products.", "false": "Ordering is not mentioned or happens elsewhere." }
    },
    "block:menu-highlights.variant": {
      "type": "choice",
      "instructions": "Which layout suits the products section of this website?",
      "criteria": {
        "o01_card_grid": "Card grid. 3–9 products with photos and a short line each.",
        "o02_simple_list": "Simple list. Many products, names and short lines, no photos.",
        "o03_feature_rows": "Feature rows. 2–4 signature products, each with a large photo and a paragraph."
      }
    },
    "q.tone.warmth": { "type": "score", "instructions": "How warm and personal should the website sound?", "criteria": ["Neutral and factual", "Friendly", "Warm and personal", "Very homely and intimate"] },
    "q.entity.business_name": { "type": "choice", "instructions": "Which text is the business's name?", "criteria": { "o01_rosie_s_bakery": "\"Rosie's Bakery\"", "o02_not_stated": "The brief does not state a name." } }
  }
}
```

(Real archetype lists are ~26 options. Four are shown.)

**Step 3. Execute (network, ~120–250 ms [E]).** Two chunks in parallel through the `workers-ai` adapter. Illustrative answers after un-rotating and averaging:

| Question | Result (illustrative) | Policy outcome |
|---|---|---|
| archetype (high, 3 rotations) | local-food-shop 0.71, cafe-restaurant 0.22 | accept (pTop 0.71, margin 0.49); runner-up stored as an alternative |
| order-form relevance | 0.93 | add (≥ 0.65) |
| testimonials relevance | 0.41 | keep default (optional, between 0.30 and 0.65): the archetype default for testimonials is *off* when no reviews are in the ledger (a `requires` rule) |
| pricing-table relevance | 0.12 | not added |
| menu-highlights variant | card-grid 0.58, feature-rows 0.31 | accept card-grid |
| hero variant (high) | split-image 0.46, full-bleed 0.38 | accept split-image; full-bleed goes to alternatives |
| tone.warmth | expected 2.3 of 3 | "warm and personal" |
| palette family (high) | warm-earth 0.52, pastel 0.27 | accept |
| entity.business_name | "Rosie's Bakery" 0.97 | confirmed into the facts ledger |

**Step 4. `resolve` + `assemble` (code, ~5 ms).** Spec operations:

```json
[
  { "op": "setTheme", "patch": { "palette": "warm-earth", "type": "serif-humanist", "density": "comfortable", "corners": "soft", "imagery": "photo-warm" } },
  { "op": "addBlock", "id": "b1", "type": "nav",              "variant": "simple-centered" },
  { "op": "addBlock", "id": "b2", "type": "hero",             "variant": "split-image" },
  { "op": "addBlock", "id": "b3", "type": "menu-highlights",  "variant": "card-grid" },
  { "op": "addBlock", "id": "b4", "type": "order-form",       "variant": "cake-order" },
  { "op": "addBlock", "id": "b5", "type": "about",            "variant": "story-photo" },
  { "op": "addBlock", "id": "b6", "type": "hours-location",   "variant": "split-map" },
  { "op": "addBlock", "id": "b7", "type": "footer",           "variant": "compact" },
  { "op": "setContent", "blockId": "b6", "slot": "hours", "value": "Tue–Sun 7:00–15:00", "source": "fact" },
  { "op": "setContent", "blockId": "b6", "slot": "address", "value": null, "source": "placeholder" }
]
```

The `spec` event goes out at ~0.3–0.45 s. The page renders with each block's default copy, which wave 1 is already replacing.

**Step 5. Text (in parallel).**
- Wave 1 started at t = 0: brand kernel (hero headline, subhead, CTA label, 3 value props, about blurb, SEO fields). On Cerebras gpt-oss-120b, ~1k input and ~450 output tokens; hero text from ~0.35 s, done ~0.55 s [E, research figures].
- Wave 2 starts at ~0.3 s: two grouped calls (`menu-highlights` + `order-form` labels; `about` long text + `hours-location` heading + footer line). Done by ~0.75–0.9 s [E].
- The fact slots (hours, address, prices in the order form) are not in any schema. The order form's "price" field shows the chip "Add your cake prices".
- Guards: say wave 2 writes "Loved by 500+ Portland families" in the about blurb. The number guard finds "500+", which is not in the ledger, and queues a one-slot rewrite (~0.25 s). Recorded as `guard: number-not-in-ledger → rewrite`.

**Step 6. `done` and the record.** Usage and cost go out in `done`; the record is written in `waitUntil`.

**Cost [E]:** decisions ~7.5k tokens + rotations ≈ 9k × $0.038/M ≈ $0.00034 (clef-flash) or $0.00038 (Jev). Text: kernel ≈ $0.0007; wave 2, two calls of ~1.2k in and ~350 out ≈ 2 × $0.00068 ≈ $0.0014; one rewrite ≈ $0.0002. **Total ≈ $0.0026 per site.**

### 3.4 Timed sequence for the first site [E]

| t (ms) | Server | Browser |
|---|---|---|
| −600…0 | (speculative request already running if the user paused) | user types |
| 0 | `extractSignals`, `compilePlan` (~5 ms); start decision chunks ×2 and text wave 1 | `start` event |
| ~150–250 | decision answers arrive | — |
| ~260 | `resolve`, `assemble`, validate (~5–10 ms); start wave 2 (2–4 calls) | `spec` event; renders all blocks with default copy |
| ~350 | wave 1 first tokens | hero headline streams in |
| ~550 | wave 1 done; guards | kernel slots final |
| ~750–900 | wave 2 done; guards; possible rewrites | remaining slots final |
| ~900–1,100 | `done`; record write in `waitUntil` | timer stops |

Add ~100–250 ms per model round trip for users far from the provider's region, until a nearer region is measured.

### 3.5 The text port

```ts
// packages/text/src/types.ts
export interface SlotSpec {
  slot: string;
  factKind: "copy" | "price" | "hours" | "address" | "phone" | "email" | "testimonial" | "stat" | "award" | "person" | "date" | "link";
  min: number; max: number;          // characters
  hint: string;                      // from the content model
}
export interface SectionTextJob {
  blockId: string;
  sectionType: string;
  slots: SlotSpec[];                 // only factKind === "copy" reach the model
}
export interface TextJob {
  jobId: string;
  wave: 1 | 2 | "rewrite";
  brief: string;
  facts: FactsLedger;
  voice: string;                     // "warm and personal; plain words; short sentences"
  sections: SectionTextJob[];
  locale: string;
}
export type TextEvent =
  | { t: "partial"; blockId: string; slot: string; text: string }
  | { t: "final"; blockId: string; slot: string; text: string; guards: GuardAction[] }
  | { t: "error"; jobId: string; code: string };

export interface TextPort {
  write(job: TextJob, signal: AbortSignal): AsyncIterable<TextEvent>;
}
```

### 3.6 The generation record

```ts
// packages/pipeline/src/record.ts
export interface GenerationRecord {
  recordVersion: 1;
  genId: string;
  parentGenId?: string;
  kind: "create" | "edit" | "wall" | "regenerate";
  createdAt: string;                         // from deps.clock
  input: { brief?: string; message?: string; locale: string; selection?: Selection; specBeforeHash?: string };
  versions: { app: string; compiler: string; library: string; policy: string; eventProtocol: 1 };
  seed: string;
  signals: Signals;
  facts: FactsLedger;
  compiled: { id: string; templateId: string; templateVersion: number; wireIds: string[]; permutations: Record<string, number[]> }[];
  decisionCalls: (DecisionCallRecord & { cacheHit: boolean })[];
  decisions: Decisions;
  route?: Route;                             // edits only
  ops: SpecOp[];
  repairs: Repair[];
  specHash: string;
  textCalls: { callId: string; jobId: string; provider: string; model: string; promptRef: string; outputRef: string;
               finishReason: string; inputTokens?: number; outputTokens?: number; latencyMs: number; retries: number }[];
  guards: GuardAction[];
  timingsMs: Record<"signals" | "compile" | "decide" | "assemble" | "firstSpec" | "wave1" | "wave2" | "done", number>;
  costUsd: { decide: number; text: number; total: number };
  outcome: "ok" | "partial" | "error" | "aborted";
}
```

---

## 4. What to defer

| Do not build yet | Build it when |
|---|---|
| Embeddings, a vector store, `CandidateIndex` backends | One decision has more than ~255 candidates and the Noul screen costs too much (Stage 3 of D8) |
| A cross-user brief-embedding cache | Privacy rules exist and measured cache-hit value justifies it |
| WebSockets or Durable Object sessions for generation | Live collaboration is in scope |
| An LLM splitter for compound edits | The slow path's measured latency on compound edits is too high |
| The logprob emulation mode | A self-hoster community asks for LLM-only use with better quality |
| More than one fallback provider per port | Measured provider outages justify it |
| The `ai-sdk-decide` and `llm-emulated` adapters | M1 (M0 needs `systemone`, `workers-ai`, `mock`) |
| Vision-model judging, online A/B tests | The rating page has a few hundred labels to calibrate against |
| Distilling decisions into a small fine-tuned model | There are thousands of user corrections to train on |
| Wall archives (curated theme × layout pairs) | The rating page has data |
| A pre-written "Layer 0" copy library (~120k snippets) | The founder decides it is wanted (question 4) |
| Visitor BYOK on the hosted copy | The founder decides it is wanted (question 3) |
| Region routing for decision calls | M0 measures latency from outside the US |

**M0 build list from this area:** the decision IR and executor; the `systemone`, `workers-ai` and `mock` adapters; the compiler with the global bank and manifest-driven questions; `resolve` and `assemble`; the text writer on one provider; the guards; `POST /api/generate` with NDJSON; the record writer; the eval CLI with 20 briefs and the rating page.

---

## 5. Requirements on the other five areas

**Area 1: spec format and operations.**
- A pure, shared `applyOp(spec, op) → { spec, errors }` used by the server, the client, the slow path's draft and replay.
- Operations at least: `addBlock`, `removeBlock`, `moveBlock`, `replaceVariant`, `setTheme`, `setContent` with `source` (`user | fact | generated | placeholder | default`) and `genId` per slot value.
- Transactions: an op batch with a `txId` is one undo step.
- Stable block instance IDs that survive variant swaps.
- A validator that returns structured errors (code, path, message), usable as tool results.
- A canonical JSON serialization and a `specHash`.
- A compact outline function (`[{id, type, variant, label}]`) for edit requests.
- `specVersion` from the first commit.

**Area 2: blocks, themes, rendering.**
- **Content models per section type, not per variant.** Every variant of a section type renders the same slots (it may hide optional ones).
- Each slot: `id`, `factKind`, `min`/`max` characters, `hint`, list arity (`minItems`/`maxItems`) and default copy.
- Each block manifest: `sectionType`, `archetypes` tags, a **relevance** question (prompt plus true/false descriptions), `requires`/`excludes` fact rules, version.
- Each variant: a **fit** description of at most ~40 words written as a concrete situation, rules (e.g. needs ≥ 6 images), and a **layout signature** (a few categorical features) for the Wall sampler.
- Each archetype: default sections and order, min/max counts, candidate optional sections, order adjusters.
- Theme facets as named presets with descriptions (no hex values in questions) and a facet-to-token lookup table.
- A library build that emits one immutable `LibrarySnapshot` with a **content hash** as `libraryVersion`.

**Area 4: repo, runtime, storage, hosting.**
- `packages/pipeline`, `packages/decide`, `packages/compiler`, `packages/text` free of Cloudflare and Node imports.
- `RecordSink` implementations: R2 for payloads and D1 for the index on Workers; filesystem JSONL or SQLite on Node. Retention setting.
- A Durable Object for the spend governor; the Rate Limiting binding; Turnstile; secrets; the Workers Paid plan.
- The `AI` binding for clef-flash and EmbeddingGemma.
- Node target with `Deps` implementations and env-var config.

**Area 5: editor client and The Wall UI.**
- A reader for the NDJSON event protocol v1, with the same `applyOp`.
- Speculative start and abort while typing.
- Rendering of placeholder chips for missing facts, and of `ask` and `suggest` events.
- Optimistic application of fast-path edits and reconciliation with the server's transaction.
- The Wall: render N skeletons from one shared text set, virtualize, cross-breed and "more like this" locally with the shared sampler package.
- The local `/dev/rate` page (or the harness provides it; agree who owns it).

**Area 6: room for apps, forms, the foundry.**
- Foundry blocks must ship the same manifest (relevance, fit, slots with `factKind`, rules), so the compiler asks about them without code changes.
- A "miss" signal: the companion bool `none_fits` on section and edit questions, plus slow-path failures, are logged as foundry candidates with the brief and the decisions.
- Form fields are structural slots (`factKind` "structure" or similar), never written by the text writer beyond labels.

---

## 6. Questions for the founder

1. **Must the self-hosted copy work with only an ordinary LLM key?**
   - *Yes:* build and maintain the `llm-emulated` adapter as a supported tier, with its own policy table and a harness run on every release. Cost: ~200 lines plus ongoing eval runs; quality and The Wall's variety are lower in that mode, and some users will judge the project by it.
   - *No:* require a decision provider (a free Gemini AI Studio key, a Cloudflare account, or a local Ollaya). Cost: one more setup step for self-hosters; less code and one quality bar.

2. **Can anyone use the hosted copy without signing in?**
   - *Yes:* lowest friction for demos; abuse defence rests on Turnstile, rate limits and the spend cap; expect the daily cap to be hit by scripts sometimes.
   - *No (sign-in first):* much stronger per-user quotas and easier abuse handling; costs an auth system (area 4) and loses casual visitors.

3. **Should visitors to the hosted copy be able to paste their own model keys?**
   - *Yes:* heavy users pay their own way; we must store keys encrypted, take on the liability, and never log them.
   - *No:* simpler and safer; heavy users self-host.

4. **What should the page show in the ~0.3 s before generated text arrives?**
   - *The blocks' own default copy* (generic, possibly off-topic for a moment, then replaced): no extra work.
   - *A pre-written copy library per vertical and tone* (the research's "Layer 0", ~120k snippets, ~$5–60 one-off to generate plus review): on-topic from the first frame; a large content effort to keep in sync with the library.
   - *Skeleton text bars:* honest but looks unfinished.

5. **Does The Wall use one set of words for every site, or a few voices?**
   - *One text pass:* cheapest and fastest; sites differ only in layout and style.
   - *2–3 tone variants of the kernel (e.g. warm, crisp, playful):* more variety at ~2× text cost (~$0.001 more per Wall [E]).

6. **May the hosted copy keep briefs and generation records for evaluation, and for how long?**
   - *Keep 30 days, opt-out:* the golden set grows from real use; needs a privacy notice.
   - *Keep nothing beyond the session:* the founder's own test briefs are the only eval data.

---

## 7. Risks

| Risk | Likelihood / impact | Mitigation in this design |
|---|---|---|
| **Decision quality on site composition is unmeasured.** Nobody has published accuracy for this task; the json-render composer itself says it "does not guarantee that Jev chose the right UI" [V, research]. If gut-check answers are mediocre, sites will look generic or wrong | High / high | Code owns defaults and stopping rules; the harness with golden briefs and the rating page from M0; provider swap is one line; distillation later |
| Thresholds do not transfer between providers or model versions | High / medium | Policy table keyed by model version; harness `compare` before switching; pinned versions |
| Order bias distorts choices | Medium / medium | Positional wire keys, seeded permutations, rotations for high stakes, permutation flip rate in the harness |
| Latency outside the US (TypeSafe is single-region, US-West [R, research]) | High / medium | Measure in M0; clef-flash runs on Cloudflare's network; Gemini and OpenAI have more regions |
| `experimental_decide` and json-render APIs change | Medium / low | Behind our own interface; exact version pins; only one adapter uses it |
| Provider rate limits at launch (Groq developer tier, opaque Jev limits) | Medium / medium | Grouped text calls; fallbacks per chunk; spend governor degrades to demo mode |
| clef-flash's 24,576-token context with silent state truncation | Low / medium | Executor counts tokens and chunks; states are small by design |
| LLM text invents facts despite guards (e.g. "family recipe since 1952" without digits written as "for three generations") | Medium / medium | Fact slots never reach the LLM; the guard catches numbers and quotes; an optional decision-model check per slot; the user sees provenance |
| The Workers Free plan's 10 ms CPU limit | Certain on Free / high | Paid plan for the hosted copy |
| Recording payloads leak personal data in briefs | Medium / medium | Retention limit; records never shared across users; question 6 |

**The biggest risk** is the first one: the whole product rests on decision models making good taste and structure calls, and that is unmeasured. The pipeline design does not remove the risk; it makes it cheap to measure (harness from day one), cheap to switch models (one interface, four adapters), and cheap to fall back to code defaults.

---

## 8. Not verified

- **Every latency and cost figure for our own pipeline** (no model was called). Includes the 0.35–0.5 s first spec, ~0.9–1.1 s text done, and ~$0.0026 per site.
- Jev's and clef-flash's latency for our request shape and from outside the US. The 38.8 ms vs 524.1 ms medians are Cloudflare's own run.
- Whether TypeSafe and clef-flash keep Choice criteria in the JSON key order sent. Not stated in their docs; the positional wire keys make it irrelevant.
- Whether the `oNN_` key prefix itself biases answers.
- Gemini Decisions access: Google's blog says anyone can start with an AI Studio key; the AI SDK docs say "Decisions EAP access" is required.
- OpenAI Decisions: maximum score levels and context size for `gpt-6-luna` on `/v1/decisions` (the Gateway lists 1.05M tokens; the guide does not state it).
- Whether `env.AI.run` calls count as subrequests, and whether they count toward the six-connection limit.
- Emulation quality and speed (structured mode and logprob mode) for our questions.
- That `@ai-sdk/cerebras` and `@ai-sdk/groq` pass `strict: true` for `Output.object` by default (to check in M0; otherwise set it through `providerOptions`).
- CPU time of partial-JSON parsing for 4–5 concurrent streams inside a Worker.
- Ollaya's benchmark figures (its own measurements), and the CPU latency of 90 questions on `laya`.
- Workers Paid plan price, Turnstile limits, and Cerebras and Groq production rate limits (not re-read for this report).
- The research's speed figures for Cerebras and Groq (Artificial Analysis medians, 13 Nov 2026) were reused, not re-measured.

**Sources read for this report on 2026-11-14:** [TypeSafe models](https://docs.typesafe.ai/models), [System One API and OpenAPI](https://docs.typesafe.ai/api/system-one), [errors](https://docs.typesafe.ai/api/errors), [Choice](https://docs.typesafe.ai/primitives/choice), [Score](https://docs.typesafe.ai/primitives/score), [JS SDK changelog](https://docs.typesafe.ai/sdk/javascript/changelog); [OpenAI Decisions guide](https://developers.openai.com/api/docs/guides/decisions) and [reference](https://developers.openai.com/api/reference/resources/decisions/methods/create); [Gemini Decisions API](https://ai.google.dev/gemini-api/docs/decisions-api) and [announcement](https://blog.google/innovation-and-ai/technology/developers-tools/gemini-decisions-api/); [clef-flash on Workers AI](https://developers.cloudflare.com/workers-ai/models/clef-flash/) and [model card](https://huggingface.co/Cloudflare/clef-flash); [Ollaya](https://github.com/ollaya-dev/ollaya); [AI SDK decisions](https://ai-sdk.dev/docs/ai-sdk-core/decisions) and [structured data](https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data); [json-render evaluator source](https://github.com/vercel-labs/json-render/blob/main/packages/core/src/experimental-evaluator.ts); [Vercel AI Gateway model list](https://ai-gateway.vercel.sh/v1/models); [Workers limits](https://developers.cloudflare.com/workers/platform/limits/), [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/), [JSON mode](https://developers.cloudflare.com/workers-ai/features/json-mode/), [EmbeddingGemma 2](https://developers.cloudflare.com/workers-ai/models/embeddinggemma-2/), [Vectorize limits](https://developers.cloudflare.com/vectorize/platform/limits/), [Rate Limiting binding](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/); [Cerebras structured outputs](https://inference-docs.cerebras.ai/capabilities/structured-outputs) and [chat completions](https://inference-docs.cerebras.ai/api-reference/chat-completions); [Groq structured outputs](https://console.groq.com/docs/structured-outputs) and [API reference](https://console.groq.com/docs/api-reference); TanStack Start docs on [streaming server functions](https://github.com/TanStack/router/blob/main/docs/start/framework/react/guide/streaming-data-from-server-functions.md), [hosting](https://github.com/TanStack/router/blob/main/docs/start/framework/react/guide/hosting.md) and [import protection](https://github.com/TanStack/router/blob/main/docs/start/framework/react/guide/import-protection.md). Versions from npm on 2026-11-14: `ai` 7.0.172, `@ai-sdk/typesafe-ai` 3.0.40, `@ai-sdk/cerebras` 3.0.92, `@ai-sdk/groq` 4.0.83, `@ai-sdk/openai-compatible` 3.0.92, `workers-ai-provider` 4.0.1, `@json-render/core` 0.22.0, `@typesafe-ai/sdk` 0.7.0, `@tanstack/react-start` 1.169.5, `zod` 4.6.7.
