// Words for any business (docs/m0/15-any-business.md). The M0 writer (text.ts) fills a fixed set of
// slots for five sample kinds, from the sample's facts. This one takes only the owner's words and
// writes everything a home page needs for whatever the business is: what it is, what it offers,
// reasons, a call to action, and three photo searches for its own subject. It never invents facts:
// prices, hours, addresses, phone numbers and emails appear only if the owner gave them.

import type { DecisionCall, DecisionPort, Question } from './decide.ts'
import { tidy } from './text.ts'

/** Sections a page may add to its core (hero, about, offer, closing); Jev picks one or two. */
export const EXTRAS = ['reasons', 'steps', 'audience', 'faq', 'statement', 'gallery'] as const
export type Extra = (typeof EXTRAS)[number]

export type SiteCopy = {
  /**
   * The owner's words name a famous real person, a well-known fictional character or a famous
   * organisation the writer knows reliable facts about: those facts may be used (2026-11-24,
   * Robert: "do for both real and fictional"). Contact details still come only from the owner.
   */
  known?: boolean
  /** The owner's words do not say what it does, and it is not known: nothing is guessed. */
  unclear?: boolean
  /**
   * The concept, written first so every other field follows it (docs/m0/22-concept.md): the one
   * thought the page is built around, in a short phrase ("slow mornings by the sea").
   */
  idea: string
  /** How the words sound, in three plain adjectives ("unhurried, warm, exact"). */
  voice: string
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
  /**
   * Broad kinds of thing it offers, drawn only from the owner's words; the offer falls back to
   * these when the checks drop its made-up items (docs/m0/24-templates.md, round 4).
   */
  categories: { name: string; detail: string }[]
  /** Two more of each, for Jev to choose from (docs/m0/23-jev-does-more.md). */
  more: { names: string[]; headlines: string[]; offerTitles: string[] }
}

export const SITE_LIMITS = {
  idea: 80,
  voice: 60,
  // Long enough for a society's full name (edge bench: 125 characters were cut to 40).
  name: 130,
  kind: 40,
  tagline: 40,
  headline: 48,
  subhead: 120,
  about: 360,
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
    known: { type: 'boolean' },
    unclear: { type: 'boolean' },
    idea: str(L.idea),
    voice: str(L.voice),
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
    categories: {
      type: 'array',
      minItems: 2,
      maxItems: 5,
      items: obj({ name: str(L.offerName), detail: str(L.offerDetail) }),
    },
    more: obj({
      names: { type: 'array', minItems: 2, maxItems: 2, items: str(L.name) },
      headlines: { type: 'array', minItems: 2, maxItems: 2, items: str(L.headline) },
      offerTitles: { type: 'array', minItems: 2, maxItems: 2, items: str(L.offerTitle) },
    }),
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
    'First decide two things about who this is:',
    '- known: true only if the owner\'s words name a famous real person, a well-known fictional character (from a film, book, game or show) or a famous organisation that most people would recognise and that you know reliable facts about. An ordinary name you do not recognise is not known, even if it sounds familiar. The website must be for that person, character or organisation itself, or about them (a fan page, a tribute). A business that is only named after one, themed on one or shares a name with one is not known: write it as an ordinary business and add nothing about the famous one beyond what the owner wrote. Examples: "Harry Potter themed café in Leeds", "Paris Hilton cleaning services, Swansea" and "John Lewis, electrician" are not known; "Shrek fan page" and "website for Gandalf" are.',
    '- unclear: true if the owner\'s words do not say what this person or organisation does (their trade, craft, field, or what they make or offer) and known is false. "Portfolio for Anna Berg" is unclear; "portfolio for Anna Berg, wedding photographer" is not.',
    "If known: write their own website from what is widely and reliably known about them, as if the owner had written it: who they are, what they do or are known for, their story, the people and places tied to them. Use nothing you are unsure of. The contact details (address, opening hours, phone, email) and prices still come only from the owner's words, and contact.place only from a town the owner names.",
    'If unclear: do not guess a trade, craft, medium, subject or product. Write words that fit any line of work: the headline and introduction about the person or organisation by name, offer items such as "Recent work", "Earlier projects" and "Working together", reasons and steps that hold for anyone, and photo searches that fit any work, such as "desk with notebook", "person at work" and "hands writing".',
    '',
    'Then decide the concept; every other field follows it.',
    `- idea: the one thought this page is built around, in a short phrase drawn from the owner's words and the feel of the place, never a description of the business. A bakery that opens at dawn → "bread while the town sleeps"; a family vet → "the vet your dog doesn't mind" (at most ${L.idea}).`,
    `- voice: how the words sound, in three plain adjectives that fit this organisation, such as "unhurried, warm, exact" or "straight, quick, reassuring" (at most ${L.voice}). Write every other field in this voice.`,
    '',
    'Then the words. Every heading says something specific to this organisation in its voice. Never use stock headings such as "Welcome", "About us", "Our services", "Why choose us", "What we do", "Who we help", "How it works", "Get in touch" or "Contact us", nor a heading that only names the section. Show, do not describe: concrete things a visitor would see, hear or get, never adjectives about the business ("calm environment", "high-quality service", "friendly team").',
    `- name: the name exactly as given, never shortened. If none is given, a short, distinctive name an owner might really choose, one or two words that suit the idea, such as "Low Tide", "Hearth" or "Marrow & Vine"; never a description such as "Calm Yoga Studio" or "Bristol Emergency Plumbing".`,
    `- kind: what it is, in a few plain words, such as "tattoo studio" or "county council" (at most ${L.kind}).`,
    `- tagline: a short label such as "Tattoo studio in Leeds" or just "Tattoo studio" when no place is given (at most ${L.tagline}).`,
    `- headline: the idea in a few words with feeling, the line a visitor remembers; never the kind of business plus an adjective ("Gentle family dentistry"), never the owner's sentence repeated (at most ${L.headline}).`,
    `- subhead: one sentence under the headline that says plainly what and where, with one concrete detail from the owner's words (at most ${L.subhead}).`,
    `- about: a short paragraph in the organisation's own voice ("we"), two to four sentences: what a visitor finds here, told through concrete things, never a list of the brief's words; at least 160 characters, at most ${L.about}.`,
    `- reasonsTitle and reasons: a heading in the voice (not "Why choose us") and three reasons, each a concrete thing rather than a virtue; title at most ${L.itemTitle}, body at most ${L.itemBody}.`,
    `- offer: what it offers. title is a short heading in the voice that people would still recognise, such as "Mornings at the studio", "On the pass tonight" or "Boilers, leaks and pipes" (at most ${L.offerTitle}); items: every item the owner lists, in their order, with names and prices exactly as written (up to 30). If the owner lists none, 3 to 6 general kinds of thing such an organisation offers, as categories ("Scented candles", "Boiler repairs"), never invented product names, flavours or features. detail: one or two plain sentences on what it is and who it is for (at most ${L.offerDetail}), never inventing facts about this business; for an item the owner listed without describing it, a plain description of what such an item is. price: only if the owner gave it, else "".`,
    '- contact: address, hours, phone, email exactly as the owner gave them, else "". place: the town or city the owner names, also when it is only part of the name ("Zamość City Council" → "Zamość"), else "".',
    `- cta: a closing call to action that fits (book, visit, call, get in touch, donate, enquire); headline at most ${L.ctaHeadline}, subhead at most ${L.ctaSubhead}, button label at most ${L.ctaLabel}.`,
    '- Never mention a phone number, email or address the owner did not give (no "call the number on the site"); say "get in touch" instead. Steps and answers are about the organisation, never about using this website.',
    `- statement: one or two sentences in the organisation's own voice, set large on the page: what it stands for, drawn from the owner's words and the idea (at most ${L.statement}). No slogans, no claims to be the best.`,
    `- steps: how working with them goes. title in the voice, such as "Your first morning" or "From call to fixed" (at most ${L.sectionTitle}); 3 or 4 steps, each a short title and one sentence. Only steps that follow from the owner's words or that every such organisation shares; no promises (no "free quote", "same day", "within 24 hours") unless the owner said so.`,
    `- faq: 4 to 6 questions visitors ask such an organisation (question at most ${L.question}, answer at most ${L.answer}). Prefer questions the owner's words answer. Any answer about THIS organisation (what it does or does not do, who it serves, opening times, prices, parking, bookings, menus, policies) must come from the owner's words; if they do not say, answer only "Get in touch and we will tell you." or a close variant. General answers about the kind of service (what to bring, how long a treatment usually takes) are fine if true everywhere. Never send visitors to a website, page, section, form or document. Example: a vet asked "Do you offer emergency care?" without the owner saying → "Get in touch and we will tell you."`,
    `- audience: who it is for, described by what people need, never by guessed kinds of people. title in the voice, such as "When to ring us" (at most ${L.sectionTitle}); 3 or 4 needs, each a short title and one sentence, that follow from the owner's words or that every such organisation meets. Examples: a plumber → "A burst pipe or leak", "No heating or hot water"; a cat vet → "A first check-up for a new kitten". Never a group the owner did not name (no "landlords", "couples", "senior cats", "small businesses").`,
    `- photos: three short English stock-photo searches (2 to 4 words, at most ${L.photo} characters) for things a camera can see in this organisation's own world. No place names, no brand names, no abstract words (not "community", "information", "quality"): place = the room or setting where it works, such as "bakery counter" or "dental surgery"; people = someone doing its work, such as "baker kneading dough"; detail = a close-up object or material, such as "sourdough loaf".`,
    '',
    'An example of the quality wanted, for a different organisation (never reuse its words). Owner: "fishmonger in Whitstable, we buy off the boats every morning, closed Mondays".',
    'idea: "this morning\'s boats, on ice by nine". voice: "salty, direct, generous". name: "Tideline". headline: "Off the boat, on the ice by nine". subhead: "A fishmonger on Whitstable harbour, buying from the day boats every morning except Monday." about: "We meet the boats at first light and buy what came up: plaice, crab, sometimes a turbot worth ringing your friends about. What is on the ice depends on the sea. Tell us what you are cooking and we will clean, fillet and wrap it while you wait." offer title: "On the ice". reasonsTitle: "Why the queue forms early". A reason: "Filleted while you wait" / "Bones out, skin on or off, the way your recipe wants it."',
    'Note what it does: one idea carried through, concrete things a visitor would see, no invented times, prices or claims, no stock headings.',
    `- categories: 2 to 5 broad kinds of thing it offers, taken only from the owner's words, such as "Handmade pasta", "From the wood-fired oven" and "Sunday lunch" for a restaurant that said those; never a named dish, product, class or package. detail: one plain sentence that adds no fact the owner did not give (at most ${L.offerDetail}).`,
    '- more: two other names, two other headlines and two other offer titles, each as good as the first and different from it in approach, following the same rules. If the owner gave a name, both names repeat it exactly.',
    'Count characters carefully: every limit is a hard limit.',
  ].join('\n')
}

/** Problems with written copy, or none. */
/**
 * Claims the text model tends to add on its own (found by the bench, docs/m0/18-bench.md). Each
 * counts as invented unless the owner's words contain it.
 */
const CLAIMS =
  /\b(deliver(?:y|ed|s)? to your door|home delivery|free delivery|shipping|ships? (?:worldwide|nationwide|anywhere)|award[- ]winning|awards?|highly rated|five[- ]stars?|certified|accredited|since \d{4}|\d+\+? years|years of experience|online (?:form|booking)|book online|free (?:parking|wi-?fi|consultation|quotes?))\b/gi

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

/** Lower case, accents gone, so "Rua São Bento" and "rua sao bento" match. */
const plain = (x: string) => x.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase()

/**
 * Contact details only when the owner gave them ("we do not invent
 * addresses"). The prompt says so, but a rule in a prompt is a request, not a check: an address,
 * phone number or email the owner's words do not hold is taken off the page. An address passes
 * when every number in it and most of its words are the owner's (the writer may tidy "st" into
 * "Street"); a phone when its digits run in the owner's; an email only as written.
 */
export function groundContact(c: SiteCopy, words: string): SiteCopy {
  const said = plain(words)
  const saidWords = new Set(said.match(/[\p{L}\p{N}]+/gu) ?? [])
  const saidDigits = said.replace(/\D/g, '')
  const contact = { ...c.contact }
  if (contact.address.trim()) {
    const parts = plain(contact.address).match(/[\p{L}\p{N}]+/gu) ?? []
    const nums = parts.filter((t) => /\d/.test(t))
    const letters = parts.filter((t) => !/\d/.test(t) && t.length > 1)
    const known = letters.filter((t) => saidWords.has(t)).length
    if (
      !parts.length ||
      !nums.every((t) => saidWords.has(t)) ||
      known < Math.ceil(letters.length * 0.6)
    )
      contact.address = ''
  }
  if (contact.phone.trim()) {
    const digits = contact.phone.replace(/\D/g, '')
    if (digits.length < 5 || !saidDigits.includes(digits.replace(/^(?:00|0)?44/, '')))
      contact.phone = ''
  }
  if (contact.email.trim() && !said.includes(plain(contact.email.trim()))) contact.email = ''
  return { ...c, contact }
}

/** Each list's items once, by name: the writer once returned "Portrait session" twice. */
export function dedupe(c: SiteCopy): SiteCopy {
  const once = <T>(xs: T[]) => {
    const seen = new Set<string>()
    return xs.filter((x) => {
      const k = itemKey(x)
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })
  }
  return {
    ...c,
    faq: once(c.faq),
    offer: { ...c.offer, items: once(c.offer.items) },
    reasons: once(c.reasons),
    steps: { ...c.steps, items: once(c.steps.items) },
    audience: { ...c.audience, items: once(c.audience.items) },
  }
}

/** A list item's identity: its name, title or question. */
export const itemKey = (x: unknown) => {
  const o = x as Record<string, unknown>
  return String(o?.name ?? o?.title ?? o?.q ?? JSON.stringify(x)).toLowerCase()
}

/**
 * Items the writer left blank. The schema asks for at least four questions and three steps, so
 * when it has nothing true to put there (an edit of a site whose questions the check removed),
 * it fills them with empty strings; those must never reach the page (docs/m0/27-editing.md).
 */
export function dropEmpty(c: SiteCopy): SiteCopy {
  const has = (...xs: (string | undefined)[]) => xs.every((x) => !!x?.trim())
  return {
    ...c,
    faq: c.faq.filter((f) => has(f.q, f.a)),
    reasons: c.reasons.filter((r) => has(r.title, r.body)),
    offer: { ...c.offer, items: c.offer.items.filter((i) => has(i.name)) },
    steps: { ...c.steps, items: c.steps.items.filter((i) => has(i.title, i.body)) },
    audience: { ...c.audience, items: c.audience.items.filter((i) => has(i.title, i.body)) },
    categories: (c.categories ?? []).filter((k) => has(k.name)),
  }
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
  return end > t.length / 3 ? t.slice(0, end + 1) : toClause(t)
}

/**
 * A one-sentence text cut short ends at its last clause break instead, with a full stop: "…to those
 * in need; you can donate food, money or volunteer your…" read as broken on a food bank's page
 * (2026-11-21). "…" only when no break is far enough in.
 */
function toClause(t: string): string {
  const end = Math.max(...['; ', ' – ', ' — ', ', ', ': '].map((m) => t.lastIndexOf(m)))
  if (end > t.length / 2) {
    const head = t
      .slice(0, end)
      .replace(/\s+(and|or|but|with|so|to|for|the|a|an|of|in)$/i, '')
      .trim()
    return /[.!?]$/.test(head) ? head : `${head}.`
  }
  return t.replace(/[\s,;:-]*\S*$/, '…')
}

function fitLengths(c: SiteCopy): SiteCopy {
  const fit = (s: string, max: number) => {
    if (s.length <= max) return s
    const cut = s.slice(0, max)
    const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '))
    return end > max / 3 ? cut.slice(0, end + 1) : toClause(cut)
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
  /**
   * The writer's reasoning effort. Low since docs/m0/26-speed.md: 1.5–1.7 s against 2.0–3.7 s at
   * medium, most of medium's output being hidden thinking.
   */
  effort?: 'low' | 'medium' | 'high'
  /**
   * An edit (docs/m0/27-editing.md): the site's current words and the owner's new request. The
   * writer sees its earlier answer and changes only what the request asks for.
   */
  edit?: { copy: SiteCopy; request: string }
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
    ...(o.edit
      ? [
          { role: 'assistant' as const, content: JSON.stringify(o.edit.copy) },
          {
            role: 'user' as const,
            content: [
              'The owner has seen the website and now asks:',
              o.edit.request,
              '',
              'Answer with the whole JSON again, changed only as this asks. Keep every other field exactly as it is, word for word. All the rules above still apply, with one exception: what the owner states in this request is theirs to promise and must be used, even where the rules above forbid it unasked (delivery, online booking, an area served, hours, prices, an address, a name). Put it where a visitor will see it: the subhead, the introduction, the offer or the contact details. When the owner asks to remove something, or says the organisation does not do or offer something, take it out of every field, questions and answers included, and do not write about what it does not do. Requests about the colour, design, fonts or photos are handled elsewhere: never write them into the text (no "a modern purple setting"), and a headline asked to be "about fire" is about fire, not about a colour named in the same request. A request to write in another language means every field in that language. Humour never leans on national, ethnic or regional stereotypes (no leprechauns for Dublin). A phone number, email, address or opening hours go in the contact details (and may be mentioned in a sentence), never as an item of the offer. When the owner asks to add something, add it in full where it fits best, even if a field is already near its limit: shorten the other sentences of that field to make room rather than squeezing the addition into a few words. People, places, works or things listed fit best as items of the offer or as reasons, each with its own short description. If the website is for a known person, character or organisation (known is true), answer a request about them from what is widely and reliably known, and be specific: name the people, places and works it concerns, never "the people who rode with him" or "his many works" in general. For example, on a site for Dutch van der Linde, "add something about the people in his gang" adds Arthur Morgan, John Marston, Hosea Matthews and others by name, each with a short line on who they are. If the request does not concern the words at all, return them unchanged.',
            ].join('\n'),
          },
        ]
      : []),
  ]
  const t0 = performance.now()
  let copy: SiteCopy | null = null
  let problems: string[] = ['not written']
  let costUsd = 0
  // A second try only for answers that cannot be used: no answer, broken JSON, or an empty name
  // or headline. Wording and length problems are fixed below without asking again: a second call
  // costs about 1.2 s (measured 2026-11-20, docs/m0/26-speed.md).
  const hard = (ps: string[]) => ps.some((x) => !/ characters; the limit is |^remove "/.test(x))
  for (let attempt = 0; attempt < 2 && hard(problems); attempt++) {
    let text = ''
    try {
      const res = await doFetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { authorization: `Bearer ${o.apiKey}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          // A cap keeps a key near its credit limit usable (402 without one, 2026-11-21); a site's
          // words and low-effort thinking take about 3,000.
          max_tokens: 12000,
          reasoning: { effort: o.effort ?? 'low' },
          provider: { order: ['cerebras', 'groq'], allow_fallbacks: true },
          response_format: {
            type: 'json_schema',
            json_schema: { name: 'site', strict: true, schema: schema() },
          },
          usage: { include: true },
        }),
        // A stuck provider must not hold the page (2026-11-21).
        signal: o.signal ?? AbortSignal.timeout(25000),
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
      copy = groundContact(dropEmpty(wholeSentences(tidy(JSON.parse(text) as SiteCopy))), o.words)
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
  // Too long: cut the long paragraphs at a sentence rather than lose the business (the bench found
  // the sample restaurant shown for a library).
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
  /** Jev's probability that each item is a guess, by id (faq0…, item0…, detail0…, reason0…). */
  scores: Record<string, number>
  calls: DecisionCall[]
}> {
  const said =
    'The owner of an organisation described it only in `owner_words`. A website was written from them.'
  // Best of three (docs/m0/23-jev-does-more.md): the writer's first choice and its two others.
  const options = {
    name: [copy.name, ...(copy.more?.names ?? [])],
    headline: [copy.headline, ...(copy.more?.headlines ?? [])],
    offerTitle: [copy.offer.title, ...(copy.more?.offerTitles ?? [])],
  }
  const distinct = (xs: string[]) => [...new Set(xs.map((x) => x.trim()).filter(Boolean))]
  // A name that only restates the brief ("Physiotherapy clinic for runners in Edinburgh") is no
  // name: when the owner gave none (the writer's three differ), those options are left out.
  const owner = new Set(words.toLowerCase().match(/\p{L}{3,}/gu) ?? [])
  const restates = (n: string) => {
    const ws = n.toLowerCase().match(/\p{L}{3,}/gu) ?? []
    return ws.length >= 3 && ws.filter((w) => owner.has(w)).length / ws.length >= 0.6
  }
  if (distinct(options.name).length > 1) {
    const named = options.name.filter((n) => !restates(n))
    if (named.length) options.name = named
  }
  const WHAT = {
    name: 'name for it, if the owner gave none: the one an owner would really choose, distinctive and fitting',
    headline: "headline: the most specific and memorable, true to the owner's words, never generic",
    offerTitle:
      'heading for the list of what it offers: specific to it and in its voice, yet clear',
  }
  const questions: Question[] = [
    ...copy.faq.map((f, i) => ({
      kind: 'bool' as const,
      id: `faq${i}`,
      prompt: `The owner of an organisation described it only in \`owner_words\`. A website answers a visitor's question. Does the answer state anything specific about this organisation that \`owner_words\` do not say: what it does or does not offer, who it serves, fees or prices, times, forms, programmes, policies or promises? General facts true of any such organisation do not count. Question: "${f.q}" Answer: "${f.a}"`,
    })),
    // Made-up offer items and details: the bench found a "Private session", an "Evening class"
    // and a "15-minute" sauna that no owner mentioned.
    ...copy.offer.items.map((it, i) => ({
      kind: 'bool' as const,
      id: `item${i}`,
      prompt: `${said} Is this item of its offer a specific service, product, session or class that \`owner_words\` do not mention, rather than something the owner named or a general kind of thing every such organisation offers? Item: "${it.name}"`,
    })),
    // Named dishes and products the owner never wrote (round 4: "Spaghetti Bolognese" and
    // "Risotto ai Funghi" for a restaurant that named none); code checks the words themselves.
    ...copy.offer.items.map((it, i) => ({
      kind: 'bool' as const,
      id: `named${i}`,
      prompt: `Is "${it.name}" a specific named item, such as a particular dish, drink, product, treatment, class or package, rather than a broad category such as "Pasta", "Coffee", "Haircuts", "Boiler repair" or "Family dentistry"?`,
    })),
    ...copy.offer.items.map((it, i) => ({
      kind: 'bool' as const,
      id: `detail${i}`,
      prompt: `${said} Does this description state a specific fact about this organisation that \`owner_words\` do not give, such as a length of time, a time of day, a number, a size, a price, a method, a guarantee or who it is for? Description of "${it.name}": "${it.detail}"`,
    })),
    ...copy.reasons.map((r, i) => ({
      kind: 'bool' as const,
      id: `reason${i}`,
      prompt: `${said} Does this reason to choose it claim something specific about this organisation that \`owner_words\` do not say or clearly imply? Reason: "${r.title}: ${r.body}"`,
    })),
    ...copy.steps.items.map((st, i) => ({
      kind: 'bool' as const,
      id: `step${i}`,
      prompt: `${said} Does this step state a specific fact about this organisation that \`owner_words\` do not give, such as a length of time, a time of day, a number, a price, a form or a promise? General steps true of any such organisation do not count. Step: "${st.title}: ${st.body}"`,
    })),
    ...(Object.keys(options) as (keyof typeof options)[])
      .filter((k) => distinct(options[k]).length > 1)
      .map((k) => ({
        kind: 'choice' as const,
        id: `best:${k}`,
        prompt: `${said} Which ${WHAT[k]}?`,
        options: distinct(options[k]).map((t, i) => ({ key: String(i), text: t })),
      })),
  ]
  const res = await port.decide({ owner_words: words }, questions)
  // A known person, character or organisation: the writer may use what is known about them, so a
  // fact the owner did not write is no guess (2026-11-24). groundContact still keeps contact
  // details to the owner's words.
  const trust = copy.known === true
  const scores: Record<string, number> = {}
  if (!trust) for (const [id, a] of res.answers) if (a.kind === 'bool') scores[id] = a.pTrue
  // The FAQ check keeps its 0.5 (docs/m0/19). For items, details, reasons and steps 0.5 dropped
  // general things every such place offers ("Filter coffee", a plumber's "Leak detection"
  // description) and left the offer bare (round 3, docs/m0/23): those need Jev to be surer.
  const guess = (id: string) => (scores[id] ?? 0) > (id.startsWith('faq') ? 0.5 : 0.75)
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
  /** Keeps the items Jev does not take for guesses, and at least `min` (the least likely guesses). */
  const keep = <T>(xs: T[], prefix: string, min: number): T[] => {
    const ok = xs.filter((_, i) => !guess(`${prefix}${i}`))
    if (ok.length >= min) return ok
    return xs
      .map((x, i) => ({ x, i, p: scores[`${prefix}${i}`] ?? 0 }))
      .sort((a, b) => a.p - b.p)
      .slice(0, Math.min(min, xs.length))
      .sort((a, b) => a.i - b.i)
      .map((y) => y.x)
  }
  // A specific named item counts as made up when its words are not in the owner's (stems of four
  // letters, so "fades" matches "fade"). Those go first; then Jev's general check.
  const stems = new Set(
    words
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .split(/[^a-z]+/)
      .filter((w) => w.length >= 4)
      .map((w) => w.slice(0, 4)),
  )
  const unsaid = (name: string) =>
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .split(/[^a-z]+/)
      .filter((w) => w.length >= 4)
      .some((w) => !stems.has(w.slice(0, 4)))
  // Placeholders the writer fills a list with ("DJ A", "Artist 1", "Package B") are made up too.
  const placeholder = (n: string) =>
    /^(dj|artist|band|act|guest|item|service|product|option|package|class|course|room|speaker|tutor|stylist)\s+([a-z]|\d+)$/i.test(
      n.trim(),
    )
  const invented = (i: number) =>
    (!trust && placeholder(copy.offer.items[i]?.name ?? '')) ||
    ((scores[`named${i}`] ?? 0) > 0.6 && unsaid(copy.offer.items[i]?.name ?? ''))
  const genuine = copy.offer.items
    .map((it, i) => ({ it: guess(`detail${i}`) ? { ...it, detail: '' } : it, i }))
    .filter((x) => !invented(x.i))
  // Fewer than two real items: the owner's own broad categories instead of made-up names.
  const fallback = (copy.categories ?? []).map((k) => ({
    name: k.name,
    detail: k.detail,
    price: '',
  }))
  const ok = genuine.filter((x) => !guess(`item${x.i}`)).map((x) => x.it)
  const items =
    ok.length >= 2 ? ok : fallback.length >= 2 ? fallback : keep(copy.offer.items, 'item', 2)
  const reasons = keep(copy.reasons, 'reason', 2)
  // A step with a made-up fact goes; with fewer than three left, the section goes (Jev picks
  // another extra only at the next build, so the page simply has one section fewer).
  const steps = copy.steps.items.filter((_, i) => !guess(`step${i}`))
  const best = (k: keyof typeof options) => {
    const a = res.answers.get(`best:${k}`)
    const xs = distinct(options[k])
    return a?.kind === 'choice' ? (xs[Number(a.top)] ?? xs[0] ?? '') : (xs[0] ?? '')
  }
  const dropped = judged.length - faq.length + copy.offer.items.length - items.length
  return {
    copy: {
      ...copy,
      faq,
      name: best('name'),
      headline: best('headline'),
      offer: { ...copy.offer, title: best('offerTitle'), items },
      reasons,
      steps: { ...copy.steps, items: steps.length >= 3 ? steps : [] },
    },
    replaced,
    dropped,
    scores,
    calls: res.calls,
  }
}

/**
 * The photo searches alone, asked at the start in parallel with the words, so the photo step can
 * begin about 1 s in instead of after the page (docs/m0/26-speed.md). Same rules as the writer's
 * own photos field; also the kind of business and the town, which the photo check reads.
 */
export async function writePhotoQueries(o: {
  apiKey: string
  words: string
  fetch?: typeof fetch
}): Promise<{
  queries: { place: string; people: string; detail: string }
  kind: string
  town: string
  ms: number
  costUsd: number
} | null> {
  const t0 = performance.now()
  const L = SITE_LIMITS
  const res = await (o.fetch ?? fetch)('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { authorization: `Bearer ${o.apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model: 'openai/gpt-oss-120b',
      messages: [
        { role: 'system', content: 'You answer with JSON only.' },
        {
          role: 'user',
          content: [
            "An organisation's owner described it:",
            o.words,
            '',
            `kind: what it is in a few plain words, such as "tattoo studio" or "county council" (at most ${L.kind}).`,
            'town: the town or city the owner names, also when it is only part of the name, else "".',
            `photos: three short English stock-photo searches (2 to 4 words, at most ${L.photo} characters) for things a camera can see in this organisation's own world. No place names, no brand names, no abstract words (not "community", "information", "quality"): place = the room or setting where it works, such as "bakery counter" or "dental surgery"; people = someone doing its work, such as "baker kneading dough"; detail = a close-up object or material, such as "sourdough loaf".`,
          ].join('\n'),
        },
      ],
      temperature: 0.4,
      max_tokens: 3000,
      reasoning: { effort: 'low' },
      provider: { order: ['cerebras', 'groq'], allow_fallbacks: true },
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'photos',
          strict: true,
          schema: obj({
            kind: str(L.kind),
            town: str(60),
            photos: obj({ place: str(L.photo), people: str(L.photo), detail: str(L.photo) }),
          }),
        },
      },
      usage: { include: true },
    }),
    signal: AbortSignal.timeout(10000),
  }).catch(() => null)
  const body = (await res?.json().catch(() => null)) as {
    choices?: { message?: { content?: string } }[]
    usage?: { cost?: number }
  } | null
  try {
    const a = JSON.parse(body?.choices?.[0]?.message?.content ?? '') as {
      kind: string
      town: string
      photos: { place: string; people: string; detail: string }
    }
    if (!a.photos?.place) return null
    return {
      queries: a.photos,
      kind: a.kind,
      town: a.town,
      ms: Math.round(performance.now() - t0),
      costUsd: body?.usage?.cost ?? 0,
    }
  } catch {
    return null
  }
}
