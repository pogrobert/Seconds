// Words for any business (docs/m0/15-any-business.md). The M0 writer (text.ts) fills a fixed set of
// slots for five sample kinds, from the sample's facts. This one takes only the owner's words and
// writes everything a home page needs for whatever the business is: what it is, what it offers,
// reasons, a call to action, and three photo searches for its own subject. It never invents facts:
// prices, hours, addresses, phone numbers and emails appear only if the owner gave them.

import { tidy } from './text.ts'

export type SiteCopy = {
  name: string
  /** What the business is, in a few plain words: "tattoo studio", "county council". */
  kind: string
  tagline: string
  headline: string
  subhead: string
  about: string
  reasonsTitle: string
  reasons: { title: string; body: string }[]
  offer: { title: string; items: { name: string; detail: string; price: string }[] }
  /** Only what the owner gave; empty strings otherwise. */
  contact: { place: string; address: string; hours: string; phone: string; email: string }
  cta: { headline: string; subhead: string; label: string }
  /** Stock photo searches for this business's own subject, in English. */
  photos: { place: string; people: string; detail: string }
}

export const SITE_LIMITS = {
  // Long enough for a society's full name (edge bench: 125 characters were cut to 40).
  name: 130,
  kind: 40,
  tagline: 40,
  headline: 48,
  subhead: 120,
  about: 420,
  reasonsTitle: 28,
  itemTitle: 32,
  itemBody: 120,
  offerTitle: 24,
  offerName: 48,
  offerDetail: 110,
  price: 24,
  ctaHeadline: 40,
  ctaSubhead: 110,
  ctaLabel: 24,
  photo: 60,
} as const

// The schema allows a third more than the prompt's limit: a hard cap at the limit stops the model
// mid-word ("a warm,-f"); checkSiteCopy then asks for a shorter version instead.
const capOf = (max: number) => Math.round(max * 1.34)
const str = (max: number) => ({ type: 'string', maxLength: capOf(max) })
const obj = (props: Record<string, unknown>) => ({
  type: 'object',
  additionalProperties: false,
  required: Object.keys(props),
  properties: props,
})

function schema() {
  const L = SITE_LIMITS
  return obj({
    name: str(L.name),
    kind: str(L.kind),
    tagline: str(L.tagline),
    headline: str(L.headline),
    subhead: str(L.subhead),
    about: str(L.about),
    reasonsTitle: str(L.reasonsTitle),
    reasons: {
      type: 'array',
      minItems: 3,
      maxItems: 3,
      items: obj({ title: str(L.itemTitle), body: str(L.itemBody) }),
    },
    offer: obj({
      title: str(L.offerTitle),
      items: {
        type: 'array',
        minItems: 3,
        // Every item an owner lists (edge bench: a 15-dish menu was cut to 8).
        maxItems: 30,
        items: obj({ name: str(L.offerName), detail: str(L.offerDetail), price: str(L.price) }),
      },
    }),
    contact: obj({
      place: str(60),
      address: str(120),
      hours: str(120),
      phone: str(30),
      email: str(60),
    }),
    cta: obj({ headline: str(L.ctaHeadline), subhead: str(L.ctaSubhead), label: str(L.ctaLabel) }),
    photos: obj({ place: str(L.photo), people: str(L.photo), detail: str(L.photo) }),
  })
}

function prompt(words: string): string {
  const L = SITE_LIMITS
  return [
    'Write the words for the home page of the organisation described below. It can be any kind: a shop, a trade, a studio, a clinic, a charity, a council, a firm, a venue, a maker.',
    '',
    "The owner's words:",
    words,
    '',
    'Rules:',
    '- British English. Plain, warm, specific words in the tone the owner asks for. No clichés such as "elevate", "unlock", "nestled" or "passionate".',
    '- Never invent facts. Prices, opening hours, addresses, phone numbers, emails, years, awards, staff names and review counts appear only if the owner wrote them; otherwise leave those fields as empty strings and do not mention them in other fields either.',
    '- Never move the organisation somewhere else: name only the place the owner gave, or no place at all.',
    '- Promise nothing the owner did not: no delivery, shipping, online shop or checkout, online booking, parking, guarantees or opening times of your own. If the owner asks for something a simple website cannot do (such as taking payments), leave it out.',
    "- If the owner's words contradict each other, leave out everything they contradict, and do not mention the contradiction. Example: 'closed every day and open 24 hours' → say nothing about opening times; 'quiet, very loud' → describe neither.",
    '- Never claim to be the best, finest, number one or leading, even if the owner does: say what they actually do instead.',
    `- name: the name exactly as given, never shortened; if none, a short, plausible, ordinary name.`,
    `- kind: what it is, in a few plain words, such as "tattoo studio" or "county council" (at most ${L.kind}).`,
    `- tagline: a short label such as "Tattoo studio in Leeds" or just "Tattoo studio" when no place is given (at most ${L.tagline}).`,
    `- headline: the main promise, short and memorable (at most ${L.headline}).`,
    `- subhead: one sentence under the headline (at most ${L.subhead}).`,
    `- about: a paragraph in the organisation's own voice ("we") (at most ${L.about}).`,
    `- reasonsTitle and reasons: a short heading such as "Why choose us" that suits this organisation, and three reasons; title at most ${L.itemTitle}, body at most ${L.itemBody}.`,
    `- offer: what it offers. title is the section name people would expect here, such as "Services", "Menu", "Treatments", "What we do" (at most ${L.offerTitle}); items: every item the owner lists, in their order, with names and prices exactly as written (up to 30). If the owner lists none, 3 to 6 general kinds of thing such an organisation offers, as categories ("Scented candles", "Boiler repairs"), never invented product names, flavours or features. detail: a short plain description, or "" for a listed item the owner did not describe. price: only if the owner gave it, else "".`,
    '- contact: address, hours, phone, email exactly as the owner gave them, else "". place: the town or city the owner names, also when it is only part of the name ("Zamość City Council" → "Zamość"), else "".',
    `- cta: a closing call to action that fits (book, visit, call, get in touch, donate, enquire); headline at most ${L.ctaHeadline}, subhead at most ${L.ctaSubhead}, button label at most ${L.ctaLabel}.`,
    `- photos: three short English stock-photo searches (2 to 4 words, at most ${L.photo} characters) for things a camera can see in this organisation's own world. No place names, no brand names, no abstract words (not "community", "information", "quality"): place = the room or setting where it works, such as "bakery counter" or "dental surgery"; people = someone doing its work, such as "baker kneading dough"; detail = a close-up object or material, such as "sourdough loaf".`,
    'Count characters carefully: every limit is a hard limit.',
  ].join('\n')
}

/** Problems with written copy, or none. */
/**
 * Claims the text model tends to add on its own (found by the bench, docs/m0/18-bench.md). Each
 * counts as invented unless the owner's words contain it.
 */
const CLAIMS =
  /\b(deliver(?:y|ed|s)? to your door|home delivery|free delivery|shipping|ships? (?:worldwide|nationwide|anywhere)|award[- ]winning|awards?|highly rated|five[- ]stars?|certified|accredited|since \d{4}|\d+\+? years|years of experience|online (?:form|booking)|book online|free (?:parking|wifi|consultation|quotes?))\b/gi

export function checkSiteCopy(c: SiteCopy, words = ''): string[] {
  const L = SITE_LIMITS
  const p: string[] = []
  if (words) {
    const said = words.toLowerCase()
    const all = JSON.stringify({ ...c, photos: undefined })
    for (const m of new Set([...all.matchAll(CLAIMS)].map((x) => x[0].toLowerCase())))
      if (!said.includes(m)) p.push(`remove "${m}": the owner never said it`)
  }
  // A simple website takes no payments, whatever the owner asks (edge bench: candle shop).
  const pay = JSON.stringify({ ...c, photos: undefined }).match(
    /\b(check ?out|card payments?|pay (?:securely|online|by card)|add [\w ]{0,24}to (?:a |your |the )?(?:shopping )?(?:basket|cart)|(?:your|a|the) (?:shopping )?(?:basket|cart)\b|shop now|buy now|order online|online (?:shop|store))/i,
  )
  if (pay) p.push(`remove "${pay[0]}": this website cannot take orders or payments`)
  // Superlatives are never stated as fact, even the owner's own (edge bench: "best pizza in town").
  const boast = JSON.stringify({ ...c, photos: undefined }).match(
    /\b(?:the )?(?:best|finest|greatest|number one|no\.? ?1|#1|leading)\b[^."]{0,40}\b(?:in|of|around)\b/i,
  )
  if (boast) p.push(`remove "${boast[0]}": say what they do instead of claiming to be the best`)
  const over = (field: string, v: string, max: number) => {
    if (v.length > max) p.push(`${field} is ${v.length} characters; the limit is ${max}`)
  }
  over('name', c.name, L.name)
  over('headline', c.headline, L.headline)
  over('subhead', c.subhead, L.subhead)
  over('about', c.about, L.about)
  if (!c.name.trim()) p.push('name is empty')
  if (!c.headline.trim()) p.push('headline is empty')
  if (c.reasons.length !== 3) p.push('reasons must have three items')
  if (c.offer.items.length < 3) p.push('offer needs at least three items')
  return p
}

/** OpenRouter with a strict JSON schema, one retry when the words break a limit. */
/**
 * The schema's length cap can stop the model mid-word ("a warm,-f"). A paragraph that does not end
 * like a sentence is cut back to its last full sentence.
 */
export function cutToSentence(s: string, cap = 0): string {
  const t = s.trim()
  // Only text that reached the schema's cap was stopped by it; a short phrase without a full
  // stop is finished (the bench found "…" added to whole phrases).
  if (!t || /[.!?…"”')]$/.test(t) || (cap && t.length < cap)) return t
  const end = Math.max(...['. ', '! ', '? '].map((m) => t.lastIndexOf(m)))
  return end > t.length / 3 ? t.slice(0, end + 1) : t.replace(/[\s,;:-]*\S*$/, '…')
}

function fitLengths(c: SiteCopy): SiteCopy {
  const fit = (s: string, max: number) => {
    if (s.length <= max) return s
    const cut = s.slice(0, max)
    const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '))
    return end > max / 3 ? cut.slice(0, end + 1) : `${cut.replace(/[\s,;:-]*\S*$/, '')}…`
  }
  return {
    ...c,
    subhead: fit(c.subhead, SITE_LIMITS.subhead),
    about: fit(c.about, SITE_LIMITS.about),
  }
}

function wholeSentences(c: SiteCopy): SiteCopy {
  return {
    ...c,
    subhead: cutToSentence(c.subhead, capOf(SITE_LIMITS.subhead)),
    about: cutToSentence(c.about, capOf(SITE_LIMITS.about)),
    reasons: c.reasons.map((r) => ({
      ...r,
      body: cutToSentence(r.body, capOf(SITE_LIMITS.itemBody)),
    })),
  }
}

export async function writeSiteCopy(o: {
  apiKey: string
  words: string
  model?: string
  fetch?: typeof fetch
  signal?: AbortSignal
}): Promise<{ copy: SiteCopy | null; problems: string[]; ms: number; costUsd: number }> {
  const doFetch = o.fetch ?? fetch
  const model = o.model ?? 'openai/gpt-oss-120b'
  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    {
      role: 'system',
      content:
        'You write short, specific website copy for any kind of organisation. You answer with JSON only.',
    },
    { role: 'user', content: prompt(o.words) },
  ]
  const t0 = performance.now()
  let copy: SiteCopy | null = null
  let problems: string[] = ['not written']
  let costUsd = 0
  for (let attempt = 0; attempt < 2 && problems.length; attempt++) {
    let text = ''
    try {
      const res = await doFetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { authorization: `Bearer ${o.apiKey}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          reasoning: { effort: 'low' },
          provider: { order: ['cerebras', 'groq'], allow_fallbacks: true },
          response_format: {
            type: 'json_schema',
            json_schema: { name: 'site', strict: true, schema: schema() },
          },
          usage: { include: true },
        }),
        ...(o.signal ? { signal: o.signal } : {}),
      })
      const body = (await res.json().catch(() => null)) as {
        choices?: { message?: { content?: string } }[]
        usage?: { cost?: number }
      } | null
      costUsd += body?.usage?.cost ?? 0
      if (!res.ok) {
        problems = [`HTTP ${res.status}`]
        continue
      }
      text = body?.choices?.[0]?.message?.content ?? ''
      copy = wholeSentences(tidy(JSON.parse(text) as SiteCopy))
      problems = checkSiteCopy(copy, o.words)
    } catch (e) {
      problems = [e instanceof Error ? e.message : String(e)]
    }
    if (problems.length && text)
      messages.push(
        { role: 'assistant', content: text },
        {
          role: 'user',
          content: `Fix these and answer with the whole JSON again:\n- ${problems.join('\n- ')}`,
        },
      )
  }
  // Still too long after a second try: cut the long paragraphs at a sentence rather than lose the
  // business (the bench found the sample restaurant shown for a library).
  if (
    copy &&
    problems.length &&
    problems.every((x) => / characters; the limit is |^remove "/.test(x))
  ) {
    copy = fitLengths(copy)
    problems = checkSiteCopy(copy).filter((x) => !/^(name|headline) is /.test(x))
  }
  return {
    copy: problems.length ? null : copy,
    problems,
    ms: Math.round(performance.now() - t0),
    costUsd,
  }
}
