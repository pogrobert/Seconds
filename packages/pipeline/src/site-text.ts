// Words for any business (docs/m0/15-any-business.md). The M0 writer (text.ts) fills a fixed set of
// slots for five sample kinds, from the sample's facts. This one takes only the owner's words and
// writes everything a home page needs for whatever the business is: what it is, what it offers,
// reasons, a call to action, and three photo searches for its own subject. It never invents facts:
// prices, hours, addresses, phone numbers and emails appear only if the owner gave them.

import type { DecisionCall, DecisionPort } from './decide.ts'
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
  /** Sections that make a page feel like a real site (docs/m0/19-fuller-pages.md); none invents. */
  /** One or two sentences in the owner's own voice, set large. */
  statement: string
  /** How working with them goes, in 3 or 4 steps. */
  steps: { title: string; items: { title: string; body: string }[] }
  /** Questions people ask such a place, answered only from the owner's words or general knowledge. */
  faq: { q: string; a: string }[]
  /** Who it is for, in 3 or 4 groups. */
  audience: { title: string; items: { title: string; body: string }[] }
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
  about: 560,
  reasonsTitle: 28,
  itemTitle: 32,
  itemBody: 120,
  offerTitle: 24,
  offerName: 48,
  offerDetail: 160,
  statement: 180,
  sectionTitle: 40,
  question: 90,
  answer: 260,
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
    statement: str(L.statement),
    steps: obj({
      title: str(L.sectionTitle),
      items: {
        type: 'array',
        minItems: 3,
        maxItems: 4,
        items: obj({ title: str(L.itemTitle), body: str(L.itemBody) }),
      },
    }),
    faq: {
      type: 'array',
      minItems: 4,
      maxItems: 6,
      items: obj({ q: str(L.question), a: str(L.answer) }),
    },
    audience: obj({
      title: str(L.sectionTitle),
      items: {
        type: 'array',
        minItems: 3,
        maxItems: 4,
        items: obj({ title: str(L.itemTitle), body: str(L.itemBody) }),
      },
    }),
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
    `- about: a full paragraph in the organisation's own voice ("we"): what it does, for whom, and how it works; at least 300 characters, at most ${L.about}.`,
    `- reasonsTitle and reasons: a short heading such as "Why choose us" that suits this organisation, and three reasons; title at most ${L.itemTitle}, body at most ${L.itemBody}.`,
    `- offer: what it offers. title is the section name people would expect here, such as "Services", "Menu", "Treatments", "What we do" (at most ${L.offerTitle}); items: every item the owner lists, in their order, with names and prices exactly as written (up to 30). If the owner lists none, 3 to 6 general kinds of thing such an organisation offers, as categories ("Scented candles", "Boiler repairs"), never invented product names, flavours or features. detail: one or two plain sentences on what it is and who it is for (at most ${L.offerDetail}), never inventing facts about this business; for an item the owner listed without describing it, a plain description of what such an item is. price: only if the owner gave it, else "".`,
    '- contact: address, hours, phone, email exactly as the owner gave them, else "". place: the town or city the owner names, also when it is only part of the name ("Zamość City Council" → "Zamość"), else "".',
    `- cta: a closing call to action that fits (book, visit, call, get in touch, donate, enquire); headline at most ${L.ctaHeadline}, subhead at most ${L.ctaSubhead}, button label at most ${L.ctaLabel}.`,
    '- Never mention a phone number, email or address the owner did not give (no "call the number on the site"); say "get in touch" instead. Steps and answers are about the organisation, never about using this website.',
    `- statement: one or two sentences in the organisation's own voice, set large on the page: what it stands for, drawn from the owner's words (at most ${L.statement}). No slogans, no claims to be the best.`,
    `- steps: how working with them goes. title such as "How it works", "Your first visit" or "How to book" (at most ${L.sectionTitle}); 3 or 4 steps, each a short title and one sentence. Only steps that follow from the owner's words or that every such organisation shares; no promises (no "free quote", "same day", "within 24 hours") unless the owner said so.`,
    `- faq: 4 to 6 questions visitors ask such an organisation (question at most ${L.question}, answer at most ${L.answer}). Prefer questions the owner's words answer. Any answer about THIS organisation (what it does or does not do, who it serves, opening times, prices, parking, bookings, menus, policies) must come from the owner's words; if they do not say, answer only "Get in touch and we will tell you." or a close variant. General answers about the kind of service (what to bring, how long a treatment usually takes) are fine if true everywhere. Never send visitors to a website, page, section, form or document. Example: a vet asked "Do you offer emergency care?" without the owner saying → "Get in touch and we will tell you."`,
    `- audience: who it is for, described by what people need, never by guessed kinds of people. title such as "Who we help" or "When to call us" (at most ${L.sectionTitle}); 3 or 4 needs, each a short title and one sentence, that follow from the owner's words or that every such organisation meets. Examples: a plumber → "A burst pipe or leak", "No heating or hot water"; a cat vet → "A first check-up for a new kitten". Never a group the owner did not name (no "landlords", "couples", "senior cats", "small businesses").`,
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
  // This page is the whole website: no "see our website", "Meetings section", "download the form".
  const elsewhere = JSON.stringify({ ...c, photos: undefined }).match(
    /\b(?:on|via|visit|see|check|from|using) (?:our|the|this) (?:website|site|web ?page|page|portal)\b|\b(?:listed|shown|found) on (?:our|the|this) (?:website|site|page)\b|\b\w+ (?:section|page|tab) (?:of|on) (?:our|the) (?:website|site)\b|\bthe ['‘’"]?\w+['‘’"]? section\b/i,
  )
  if (elsewhere)
    p.push(
      `remove "${elsewhere[0]}": this page is the whole website; do not send visitors elsewhere`,
    )
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
    // "remove …" problems are wording, never a reason to lose the business: keep the words.
    problems = checkSiteCopy(copy).filter((x) => !/^(name|headline) is |^remove "/.test(x))
  }
  return {
    copy: problems.length ? null : copy,
    problems,
    ms: Math.round(performance.now() - t0),
    costUsd,
  }
}

const ASK = 'Get in touch and we will tell you.'

/**
 * The second check on the questions and answers (docs/m0/19-fuller-pages.md): prompt rules alone
 * still let made-up answers through ("We do not charge an adoption fee"). Jev judges each answer
 * against the owner's words; one that adds anything about this organisation becomes "Get in
 * touch", and at most two such answers stay (a list of "get in touch" reads as empty). With fewer
 * than two real answers left, the page has no questions section. Checking "who we help" and the
 * statement the same way failed: Jev's scores did not separate guesses from fair lines (the
 * restaurant's "couples" 0.72, the plumber's "landlords" 0.68), so those are written by need.
 */
export async function groundAnswers(
  port: DecisionPort,
  words: string,
  copy: SiteCopy,
): Promise<{
  copy: SiteCopy
  replaced: number
  dropped: number
  /** Jev's probability that each item is a guess, by id (faq0…, aud0…, statement). */
  scores: Record<string, number>
  calls: DecisionCall[]
}> {
  const questions = [
    ...copy.faq.map((f, i) => ({
      kind: 'bool' as const,
      id: `faq${i}`,
      prompt: `The owner of an organisation described it only in \`owner_words\`. A website answers a visitor's question. Does the answer state anything specific about this organisation that \`owner_words\` do not say: what it does or does not offer, who it serves, fees or prices, times, forms, programmes, policies or promises? General facts true of any such organisation do not count. Question: "${f.q}" Answer: "${f.a}"`,
    })),
  ]
  if (!questions.length)
    return {
      copy,
      replaced: 0,
      dropped: 0,
      scores: {},
      calls: [],
    }
  const res = await port.decide({ owner_words: words }, questions)
  const scores: Record<string, number> = {}
  for (const [id, a] of res.answers) if (a.kind === 'bool') scores[id] = a.pTrue
  const guess = (id: string) => (scores[id] ?? 0) > 0.5
  let replaced = 0
  const judged = copy.faq.map((f, i) => {
    if (guess(`faq${i}`) && f.a !== ASK) {
      replaced++
      return { ...f, a: ASK }
    }
    return f
  })
  const asks = judged.filter((f) => f.a === ASK)
  const real = judged.filter((f) => f.a !== ASK)
  // Fewer than two real answers: no questions section at all.
  const faq = real.length >= 2 ? [...real, ...asks.slice(0, 2)] : []
  return {
    copy: { ...copy, faq },
    replaced,
    dropped: judged.length - faq.length,
    scores,
    calls: res.calls,
  }
}
