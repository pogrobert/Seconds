// The decision interface (docs/technical/03, D2 and section 3.1, cut to what M0 needs).
// Our own small question and answer types, close to System One but not tied to one vendor: options
// are an ordered list with stable keys, and distributions may be missing. Adapters only translate.
// M0 has one real adapter (TypeSafe's Jev) and one stand-in that
// answers at random from a seed, which is also arm C of the test ("random valid choices").

export type ChoiceQuestion = {
  kind: 'choice'
  /** Stable id, used by code only; the model never sees it. */
  id: string
  /** The full question. */
  prompt: string
  /** Ordered. Keys are stable library keys; `text` is what the model reads. */
  options: { key: string; text: string }[]
}
export type BoolQuestion = { kind: 'bool'; id: string; prompt: string }
/** A position on an ordered scale. `levels` run from the low end to the high end (2 to 10). */
export type ScoreQuestion = { kind: 'score'; id: string; prompt: string; levels: string[] }
export type Question = ChoiceQuestion | BoolQuestion | ScoreQuestion

export type Dist = Record<string, number>
export type Answer =
  | { kind: 'choice'; id: string; top: string; dist: Dist | null; pTop: number; margin: number }
  | { kind: 'bool'; id: string; pTrue: number }
  /** `score` runs from 0 to levels − 1 and can fall between levels; `dist` is per level index. */
  | { kind: 'score'; id: string; score: number; dist: number[] | null }
  | { kind: 'missing'; id: string; reason: 'error' | 'unsupported' }

/** One call to a provider, kept whole in the generation record. */
export type DecisionCall = {
  adapter: string
  model: string
  /** As returned by the provider. */
  modelAnswered?: string
  request: unknown
  response: unknown
  latencyMs: number
  inputTokens?: number
  costUsd?: number
  error?: string
}

export type DecisionResult = { answers: Map<string, Answer>; calls: DecisionCall[] }

export interface DecisionPort {
  id: string
  model: string
  decide(state: unknown, questions: Question[], signal?: AbortSignal): Promise<DecisionResult>
}

/** Top option, its probability and the margin over the runner-up, from a distribution. */
export function summarise(dist: Dist): { top: string; pTop: number; margin: number } {
  const sorted = Object.entries(dist).sort((a, b) => b[1] - a[1])
  const [first, second] = sorted
  return {
    top: first?.[0] ?? '',
    pTop: first?.[1] ?? 0,
    margin: (first?.[1] ?? 0) - (second?.[1] ?? 0),
  }
}

/* ------------------------------------------------------------------ TypeSafe */

/** Jev's price per input token, in dollars (docs.typesafe.ai/models, read 2026-11-14). Output is free. */
const JEV_USD_PER_INPUT_TOKEN = 0.042 / 1_000_000

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 40)

/**
 * Wire names. Question names are plain counters, so ids never leak meaning to the model. Option
 * names carry their position (`o01_…`), so an alphabetical sort cannot reorder them.
 */
function toWire(questions: Question[]) {
  const qNames = new Map<string, Question>()
  const optionKeys = new Map<string, Map<string, string>>()
  const wire: Record<string, unknown> = {}
  questions.forEach((q, i) => {
    const name = `q${String(i + 1).padStart(3, '0')}`
    qNames.set(name, q)
    if (q.kind === 'bool') {
      wire[name] = { type: 'noul', instructions: q.prompt }
      return
    }
    if (q.kind === 'score') {
      wire[name] = { type: 'score', instructions: q.prompt, criteria: q.levels }
      return
    }
    const keys = new Map<string, string>()
    const criteria: Record<string, string> = {}
    q.options.forEach((o, k) => {
      const w = `o${String(k + 1).padStart(2, '0')}_${slug(o.key)}`
      keys.set(w, o.key)
      criteria[w] = o.text
    })
    optionKeys.set(name, keys)
    wire[name] = { type: 'choice', instructions: q.prompt, criteria }
  })
  return { wire, qNames, optionKeys }
}

type SystemOneAnswer =
  | { type: 'choice'; choice: string; confidence?: number; probabilities?: Record<string, number> }
  | { type: 'noul'; noul: number }
  | { type: 'score'; score: number; probabilities?: Record<string, number> }

/**
 * TypeSafe's System One API (docs.typesafe.ai/api, read 2026-11-14): one request carries the state
 * and every question; they are answered in parallel. The model is pinned (CLAUDE.md).
 */
export function typesafeDecisions(o: {
  apiKey: string
  model?: string
  baseUrl?: string
  fetch?: typeof fetch
  /**
   * Each attempt's time limit: Jev answers in 0.2–1 s, so a slow one is better handed to the
   * backup (withBackup) than waited for.
   */
  timeoutMs?: number
}): DecisionPort {
  const model = o.model ?? 'jev-1.14.0'
  const doFetch = o.fetch ?? fetch
  const url = `${o.baseUrl ?? 'https://api.typesafe.ai'}/v1/systemone`
  return {
    id: 'typesafe',
    model,
    async decide(state, questions, signal) {
      const { wire, qNames, optionKeys } = toWire(questions)
      const request = { model, state, questions: wire }
      const calls: DecisionCall[] = []
      type Body = {
        model?: string
        answers?: Record<string, SystemOneAnswer>
        usage?: { input_tokens: number }
      }
      let body = null as Body | null
      for (let attempt = 0; attempt < 2 && !body; attempt++) {
        const t0 = performance.now()
        let response: unknown = null
        let error: string | undefined
        try {
          const res = await doFetch(url, {
            method: 'POST',
            headers: { authorization: `Bearer ${o.apiKey}`, 'content-type': 'application/json' },
            body: JSON.stringify(request),
            signal: signal
              ? AbortSignal.any([signal, AbortSignal.timeout(o.timeoutMs ?? 8000)])
              : AbortSignal.timeout(o.timeoutMs ?? 8000),
          })
          response = await res.json().catch(() => null)
          if (res.ok) body = response as Body
          else error = `HTTP ${res.status}`
          // Retry once on rate limits and server errors only.
          if (!res.ok && res.status !== 429 && res.status < 500) attempt = 2
        } catch (e) {
          error = e instanceof Error ? e.message : String(e)
        }
        const inputTokens = body?.usage?.input_tokens
        calls.push({
          adapter: 'typesafe',
          model,
          ...(body?.model ? { modelAnswered: body.model } : {}),
          request,
          response,
          latencyMs: Math.round(performance.now() - t0),
          ...(inputTokens !== undefined
            ? { inputTokens, costUsd: inputTokens * JEV_USD_PER_INPUT_TOKEN }
            : {}),
          ...(error ? { error } : {}),
        })
      }
      const answers = new Map<string, Answer>()
      for (const [name, q] of qNames) {
        const a = body?.answers?.[name]
        if (!a) {
          answers.set(q.id, { kind: 'missing', id: q.id, reason: 'error' })
          continue
        }
        if (q.kind === 'bool' && a.type === 'noul') {
          answers.set(q.id, { kind: 'bool', id: q.id, pTrue: a.noul })
          continue
        }
        if (q.kind === 'score' && a.type === 'score') {
          const dist = a.probabilities
            ? q.levels.map((_, i) => a.probabilities?.[String(i)] ?? 0)
            : null
          answers.set(q.id, { kind: 'score', id: q.id, score: a.score, dist })
          continue
        }
        if (q.kind === 'choice' && a.type === 'choice') {
          const keys = optionKeys.get(name) ?? new Map()
          const dist: Dist | null = a.probabilities
            ? Object.fromEntries(
                Object.entries(a.probabilities).map(([w, p]) => [keys.get(w) ?? w, p]),
              )
            : null
          const top = keys.get(a.choice) ?? a.choice
          const s = dist ? summarise(dist) : { top, pTop: 0.6, margin: 0 }
          answers.set(q.id, { kind: 'choice', id: q.id, dist, ...s, top })
          continue
        }
        answers.set(q.id, { kind: 'missing', id: q.id, reason: 'unsupported' })
      }
      return { answers, calls }
    },
  }
}

/* ---------------------------------------------------------------- the backup */

/**
 * The same questions answered by a text model on OpenRouter, for when Jev is down or slow
 * (2026-11-24, Robert: "a backup for Jev via OpenRouter"). One call carries every question; the
 * model gives a probability for each yes or no and its likeliest options, best first, for each
 * choice. Its probabilities are a model's estimate, not Jev's calibrated ones, so it stands in
 * only when Jev cannot answer (withBackup).
 */
export function openrouterDecisions(o: {
  apiKey: string
  model?: string
  fetch?: typeof fetch
  timeoutMs?: number
}): DecisionPort {
  const model = o.model ?? 'openai/gpt-oss-120b'
  const doFetch = o.fetch ?? fetch
  return {
    id: 'openrouter',
    model,
    async decide(state, questions, signal) {
      const names = questions.map((_, i) => `q${String(i + 1).padStart(3, '0')}`)
      const lines = questions.map((q, i) => {
        const n = names[i]
        if (q.kind === 'bool') return `${n} (yes or no): ${q.prompt}`
        if (q.kind === 'score')
          return `${n} (a level from 0 to ${q.levels.length - 1}): ${q.prompt}\n${q.levels.map((l, k) => `  ${k}: ${l}`).join('\n')}`
        return `${n} (choose one option by its key): ${q.prompt}\n${q.options.map((x, k) => `  k${k + 1}: ${x.text}`).join('\n')}`
      })
      const props: Record<string, unknown> = {}
      questions.forEach((q, i) => {
        const n = names[i] ?? ''
        if (q.kind === 'bool')
          props[n] = {
            type: 'object',
            additionalProperties: false,
            required: ['p'],
            properties: { p: { type: 'number' } },
          }
        else if (q.kind === 'score')
          props[n] = {
            type: 'object',
            additionalProperties: false,
            required: ['level'],
            properties: { level: { type: 'number' } },
          }
        else
          props[n] = {
            type: 'object',
            additionalProperties: false,
            required: ['ranked'],
            properties: {
              ranked: {
                type: 'array',
                maxItems: 5,
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: ['key', 'p'],
                  properties: {
                    key: { type: 'string', enum: q.options.map((_, k) => `k${k + 1}`) },
                    p: { type: 'number' },
                  },
                },
              },
            },
          }
      })
      const request = {
        model,
        messages: [
          {
            role: 'system',
            content:
              'You answer judgement questions about the given state honestly and carefully. You answer with JSON only.',
          },
          {
            role: 'user',
            content: [
              'State:',
              JSON.stringify(state),
              '',
              'Answer every question. For a yes or no question give p, the probability from 0 to 1 that the answer is yes. For a choice give up to five likeliest options by key, best first, each with its probability; the probabilities add up to at most 1. For a level give the level.',
              '',
              ...lines,
            ].join('\n'),
          },
        ],
        temperature: 0,
        max_tokens: 6000,
        reasoning: { effort: 'low' },
        provider: { order: ['cerebras', 'groq'], allow_fallbacks: true },
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'answers',
            strict: true,
            schema: {
              type: 'object',
              additionalProperties: false,
              required: names,
              properties: props,
            },
          },
        },
        usage: { include: true },
      }
      const t0 = performance.now()
      let response: unknown = null
      let error: string | undefined
      let parsed: Record<
        string,
        { p?: number; level?: number; ranked?: { key: string; p: number }[] }
      > | null = null
      let costUsd = 0
      try {
        const res = await doFetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: { authorization: `Bearer ${o.apiKey}`, 'content-type': 'application/json' },
          body: JSON.stringify(request),
          signal: signal
            ? AbortSignal.any([signal, AbortSignal.timeout(o.timeoutMs ?? 15000)])
            : AbortSignal.timeout(o.timeoutMs ?? 15000),
        })
        response = await res.json().catch(() => null)
        const body = response as {
          choices?: { message?: { content?: string } }[]
          usage?: { cost?: number }
        } | null
        costUsd = body?.usage?.cost ?? 0
        if (!res.ok) error = `HTTP ${res.status}`
        else parsed = JSON.parse(body?.choices?.[0]?.message?.content ?? '')
      } catch (e) {
        error = e instanceof Error ? e.message : String(e)
      }
      const clamp = (x: unknown) =>
        typeof x === 'number' && Number.isFinite(x) ? Math.min(1, Math.max(0, x)) : null
      const answers = new Map<string, Answer>()
      questions.forEach((q, i) => {
        const a = parsed?.[names[i] ?? '']
        if (q.kind === 'bool') {
          const p = clamp(a?.p)
          answers.set(
            q.id,
            p === null
              ? { kind: 'missing', id: q.id, reason: 'error' }
              : { kind: 'bool', id: q.id, pTrue: p },
          )
          return
        }
        if (q.kind === 'score') {
          const level =
            typeof a?.level === 'number'
              ? Math.min(q.levels.length - 1, Math.max(0, a.level))
              : null
          answers.set(
            q.id,
            level === null
              ? { kind: 'missing', id: q.id, reason: 'error' }
              : { kind: 'score', id: q.id, score: level, dist: null },
          )
          return
        }
        const dist: Dist = {}
        for (const r of a?.ranked ?? []) {
          const key = q.options[Number(r.key.slice(1)) - 1]?.key
          const p = clamp(r.p)
          if (key && p !== null && !(key in dist)) dist[key] = p
        }
        if (!Object.keys(dist).length) {
          answers.set(q.id, { kind: 'missing', id: q.id, reason: 'error' })
          return
        }
        const sm = summarise(dist)
        answers.set(q.id, { kind: 'choice', id: q.id, dist, ...sm })
      })
      return {
        answers,
        calls: [
          {
            adapter: 'openrouter',
            model,
            request,
            response,
            latencyMs: Math.round(performance.now() - t0),
            costUsd,
            ...(error ? { error } : {}),
          },
        ],
      }
    },
  }
}

/**
 * Jev first; questions it leaves unanswered (an error, a time-out, a refusal) go to the backup in
 * one call. Answers either gave are kept as they are.
 */
export function withBackup(first: DecisionPort, backup: DecisionPort): DecisionPort {
  return {
    id: `${first.id}+${backup.id}`,
    model: first.model,
    async decide(state, questions, signal) {
      const a = await first
        .decide(state, questions, signal)
        .catch(() => ({ answers: new Map<string, Answer>(), calls: [] }) as DecisionResult)
      const left = questions.filter((q) => {
        const x = a.answers.get(q.id)
        return !x || x.kind === 'missing'
      })
      if (!left.length) return a
      const b = await backup
        .decide(state, left, signal)
        .catch(() => ({ answers: new Map<string, Answer>(), calls: [] }) as DecisionResult)
      const answers = new Map(a.answers)
      for (const q of left) {
        const x = b.answers.get(q.id)
        answers.set(q.id, x ?? { kind: 'missing', id: q.id, reason: 'error' })
      }
      return { answers, calls: [...a.calls, ...b.calls] }
    },
  }
}

/* ------------------------------------------------------------------ stand-in */

/**
 * Answers every question at random from a seed: one option with probability 1, or a coin flip.
 * Used in tests, when no key is set, and as arm C of M0 (random valid choices), so the random arm
 * draws from exactly the choices the model is offered.
 */
export function randomDecisions(seed: string): DecisionPort {
  return {
    id: 'random',
    model: `seed:${seed}`,
    async decide(_state, questions) {
      const rand = rng(seed)
      const answers = new Map<string, Answer>()
      for (const q of questions) {
        if (q.kind === 'bool') {
          answers.set(q.id, { kind: 'bool', id: q.id, pTrue: rand() < 0.5 ? 0.9 : 0.1 })
          continue
        }
        if (q.kind === 'score') {
          const level = Math.floor(rand() * q.levels.length)
          const dist = q.levels.map((_, i) => (i === level ? 1 : 0))
          answers.set(q.id, { kind: 'score', id: q.id, score: level, dist })
          continue
        }
        const pick = q.options[Math.floor(rand() * q.options.length)]?.key ?? ''
        const dist = Object.fromEntries(q.options.map((x) => [x.key, x.key === pick ? 1 : 0]))
        answers.set(q.id, { kind: 'choice', id: q.id, top: pick, dist, pTop: 1, margin: 1 })
      }
      return {
        answers,
        calls: [
          {
            adapter: 'random',
            model: `seed:${seed}`,
            request: { questions: questions.length },
            response: null,
            latencyMs: 0,
          },
        ],
      }
    },
  }
}

/** A small seeded random generator (mulberry32), so a random choice can be reproduced. */
export function rng(seed: string) {
  let h = 1779033703
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 3432918353)
  let a = h >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
