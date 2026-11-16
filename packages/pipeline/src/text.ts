// The text interface (docs/technical/03, D9 and D10, cut down). A fast LLM writes the words of a
// site once, into typed slots with character limits. It never writes markup, styles or facts:
// prices, hours, addresses and phone numbers come from the business record, filled by code.
// M0 has one real adapter (OpenRouter, since Robert has no Cerebras or Groq account) and a stand-in.

import type { Brief } from './choose.ts'

/** The words of one site. Every M0 block's text comes from these slots or from the facts. */
export type Copy = {
  /** The business's name, written only when the brief has none on record (askName). */
  name?: string
  tagline: string
  headline: string
  subhead: string
  about: string
  /** How to find the place: shown beside the hours. */
  visit: string
  reasons: { title: string; body: string }[]
  steps?: { title: string; body: string }[]
  cta: { headline: string; subhead: string; label: string }
}

/**
 * Character limits per slot. Set so that every photo-led banner and most variants can hold the
 * words; the variant pick still checks each variant's own caps.
 */
export const COPY_LIMITS = {
  tagline: 32,
  headline: 40,
  subhead: 110,
  about: 480,
  visit: 160,
  itemTitle: 32,
  itemBody: 140,
  ctaHeadline: 28,
  ctaSubhead: 120,
  ctaLabel: 22,
} as const

/** Problems with a copy: missing slots and slots over their limit. Empty when it fits. */
export function checkCopy(c: Copy, needSteps: boolean): string[] {
  const p: string[] = []
  const L = COPY_LIMITS
  const len = (name: string, v: string | undefined, max: number) => {
    if (!v?.trim()) p.push(`${name} is empty`)
    else if ([...v].length > max)
      p.push(`${name} has ${[...v].length} characters; the limit is ${max}`)
  }
  len('tagline', c.tagline, L.tagline)
  len('headline', c.headline, L.headline)
  len('subhead', c.subhead, L.subhead)
  len('about', c.about, L.about)
  len('visit', c.visit, L.visit)
  if (c.reasons?.length !== 3) p.push('reasons must have 3 items')
  c.reasons?.forEach((r, i) => {
    len(`reasons[${i}].title`, r.title, L.itemTitle)
    len(`reasons[${i}].body`, r.body, L.itemBody)
  })
  if (needSteps) {
    if (c.steps?.length !== 3) p.push('steps must have 3 items')
    c.steps?.forEach((r, i) => {
      len(`steps[${i}].title`, r.title, L.itemTitle)
      len(`steps[${i}].body`, r.body, L.itemBody)
    })
  }
  len('cta.headline', c.cta?.headline, L.ctaHeadline)
  len('cta.subhead', c.cta?.subhead, L.ctaSubhead)
  len('cta.label', c.cta?.label, L.ctaLabel)
  return p
}

export type TextCall = {
  adapter: string
  model: string
  modelAnswered?: string
  provider?: string
  request: unknown
  response: unknown
  latencyMs: number
  inputTokens?: number
  outputTokens?: number
  costUsd?: number
  error?: string
}

export type TextInput = {
  brief: Brief
  /** Plain facts the words may mention but must not invent around: services, area. */
  facts: string
  /** Whether the site has a "how it works" section that needs three steps. */
  needSteps: boolean
  /** Take the name from the brief, or choose one, when no name is on record (the build page). */
  askName?: boolean
}

export interface TextPort {
  id: string
  model: string
  write(
    input: TextInput,
    signal?: AbortSignal,
  ): Promise<{ copy: Copy | null; problems: string[]; calls: TextCall[] }>
}

/* ------------------------------------------------------------------ OpenRouter */

const item = (L: typeof COPY_LIMITS) => ({
  type: 'object',
  additionalProperties: false,
  required: ['title', 'body'],
  properties: {
    title: { type: 'string', maxLength: L.itemTitle },
    body: { type: 'string', maxLength: L.itemBody },
  },
})

function schema(needSteps: boolean, askName = false) {
  const L = COPY_LIMITS
  const list = { type: 'array', minItems: 3, maxItems: 3, items: item(L) }
  return {
    type: 'object',
    additionalProperties: false,
    required: [
      ...(askName ? ['name'] : []),
      'tagline',
      'headline',
      'subhead',
      'about',
      'visit',
      'reasons',
      'cta',
      ...(needSteps ? ['steps'] : []),
    ],
    properties: {
      ...(askName ? { name: { type: 'string', maxLength: 40 } } : {}),
      tagline: { type: 'string', maxLength: L.tagline },
      headline: { type: 'string', maxLength: L.headline },
      subhead: { type: 'string', maxLength: L.subhead },
      about: { type: 'string', maxLength: L.about },
      visit: { type: 'string', maxLength: L.visit },
      reasons: list,
      ...(needSteps ? { steps: list } : {}),
      cta: {
        type: 'object',
        additionalProperties: false,
        required: ['headline', 'subhead', 'label'],
        properties: {
          headline: { type: 'string', maxLength: L.ctaHeadline },
          subhead: { type: 'string', maxLength: L.ctaSubhead },
          label: { type: 'string', maxLength: L.ctaLabel },
        },
      },
    },
  }
}

function prompt(input: TextInput): string {
  const L = COPY_LIMITS
  const b = input.brief
  return [
    b.name
      ? `Write the words for the home page of ${b.name}, a business in ${b.place}.`
      : 'Write the words for the home page of the business described below.',
    '',
    "The owner's brief, in their own words:",
    b.words,
    '',
    'Facts you may mention (do not invent others):',
    input.facts,
    '',
    'Rules:',
    '- British English. Plain, warm, specific words in the tone the brief asks for. No clichés such as "elevate", "unlock" or "nestled".',
    '- Never invent prices, opening hours, phone numbers, addresses, awards, years, names of staff or numbers of reviews. The site shows those from the business record.',
    ...(input.askName
      ? [
          "- name: the business's name exactly as the brief gives it; if it gives none, a short, plausible, ordinary name for such a business (at most 40 characters).",
        ]
      : []),
    `- tagline: a short label shown above the headline, such as "Hair salon in Leith" (at most ${L.tagline} characters).`,
    `- headline: the main promise, short and memorable (at most ${L.headline} characters).`,
    `- subhead: one sentence under the headline (at most ${L.subhead} characters).`,
    `- about: a paragraph about the business, in the owner's voice ("we") (at most ${L.about} characters).`,
    `- visit: one or two sentences on finding or reaching the business, from the facts only (at most ${L.visit} characters).`,
    `- reasons: three reasons to choose the business; title at most ${L.itemTitle} characters, body at most ${L.itemBody}.`,
    ...(input.needSteps
      ? [
          `- steps: three steps of how working with the business goes; title at most ${L.itemTitle}, body at most ${L.itemBody}.`,
        ]
      : []),
    `- cta: a closing call to action; headline at most ${L.ctaHeadline} characters, subhead at most ${L.ctaSubhead}, button label at most ${L.ctaLabel}.`,
    'Count characters carefully: every limit is a hard limit.',
  ].join('\n')
}

/**
 * OpenRouter's chat completions with a strict JSON schema (openrouter.ai/docs). Fast providers first.
 * One retry when the words break a limit, telling the model what to shorten.
 */
export function openRouterText(o: {
  apiKey: string
  model?: string
  providers?: string[]
  fetch?: typeof fetch
}): TextPort {
  const model = o.model ?? 'openai/gpt-oss-120b'
  const doFetch = o.fetch ?? fetch
  return {
    id: 'openrouter',
    model,
    async write(input, signal) {
      const calls: TextCall[] = []
      const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
        {
          role: 'system',
          content:
            'You write short, specific website copy for small local businesses. You answer with JSON only.',
        },
        { role: 'user', content: prompt(input) },
      ]
      let copy: Copy | null = null
      let problems: string[] = ['not written']
      for (let attempt = 0; attempt < 2 && problems.length; attempt++) {
        const request = {
          model,
          messages,
          temperature: 0.7,
          reasoning: { effort: 'low' },
          provider: { order: o.providers ?? ['cerebras', 'groq'], allow_fallbacks: true },
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'copy',
              strict: true,
              schema: schema(input.needSteps, input.askName),
            },
          },
          usage: { include: true },
        }
        const t0 = performance.now()
        let response: unknown = null
        let error: string | undefined
        let text = ''
        try {
          const res = await doFetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: { authorization: `Bearer ${o.apiKey}`, 'content-type': 'application/json' },
            body: JSON.stringify(request),
            ...(signal ? { signal } : {}),
          })
          response = await res.json().catch(() => null)
          if (!res.ok) error = `HTTP ${res.status}`
          const r = response as {
            choices?: { message?: { content?: string } }[]
          } | null
          text = r?.choices?.[0]?.message?.content ?? ''
        } catch (e) {
          error = e instanceof Error ? e.message : String(e)
        }
        const r = response as {
          model?: string
          provider?: string
          usage?: { prompt_tokens?: number; completion_tokens?: number; cost?: number }
        } | null
        calls.push({
          adapter: 'openrouter',
          model,
          ...(r?.model ? { modelAnswered: r.model } : {}),
          ...(r?.provider ? { provider: r.provider } : {}),
          request,
          response,
          latencyMs: Math.round(performance.now() - t0),
          ...(r?.usage?.prompt_tokens !== undefined ? { inputTokens: r.usage.prompt_tokens } : {}),
          ...(r?.usage?.completion_tokens !== undefined
            ? { outputTokens: r.usage.completion_tokens }
            : {}),
          ...(r?.usage?.cost !== undefined ? { costUsd: r.usage.cost } : {}),
          ...(error ? { error } : {}),
        })
        if (error) {
          problems = [error]
          continue
        }
        try {
          copy = tidy(JSON.parse(text) as Copy)
          problems = checkCopy(copy, input.needSteps)
        } catch {
          problems = ['the answer was not valid JSON']
        }
        if (problems.length)
          messages.push(
            { role: 'assistant', content: text },
            {
              role: 'user',
              content: `Fix these and answer with the whole JSON again:\n- ${problems.join('\n- ')}`,
            },
          )
      }
      return { copy: problems.length ? null : copy, problems, calls }
    },
  }
}

/**
 * Plain characters in place of typographic ones some fonts lack: the non-breaking hyphen (U+2011)
 * and the narrow and thin spaces that some models emit.
 */
export function tidy<T>(value: T): T {
  if (typeof value === 'string')
    return value.replace(/\u2011/g, '-').replace(/[\u202f\u2009]/g, ' ') as T
  if (Array.isArray(value)) return value.map(tidy) as T
  if (value && typeof value === 'object')
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, tidy(v)])) as T
  return value
}

/** Returns a fixed copy: for tests and for runs without a key. */
export function fixedText(copy: (input: TextInput) => Copy): TextPort {
  return {
    id: 'fixed',
    model: 'stand-in',
    async write(input) {
      const c = copy(input)
      return {
        copy: c,
        problems: checkCopy(c, input.needSteps),
        calls: [
          { adapter: 'fixed', model: 'stand-in', request: null, response: null, latencyMs: 0 },
        ],
      }
    },
  }
}
