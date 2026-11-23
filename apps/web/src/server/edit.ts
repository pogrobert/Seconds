// Editing a site (docs/m0/27-editing.md). A follow-up message changes only what it asks for and
// keeps the rest: the words, colour, lettering, templates, sections and photos the owner already
// has. Jev reads the request in one call that also answers what each change would be; the
// writer, in parallel, rewrites only the words asked for (its answer is used only when Jev says
// the request concerns the words). Photos already found are kept unless new ones are asked for.

import { NAMED_COLOURS } from '@repo/eval/grammar/colour-rules'
import { TYPE_RULES } from '@repo/eval/grammar/type-rules'
import { LIVE } from '@repo/library'
import {
  type Answer,
  type DecisionCall,
  type DecisionPort,
  EXTRAS,
  type Extra,
  groundAnswers,
  type Question,
  randomDecisions,
  type SiteCopy,
  typesafeDecisions,
  writePhotoQueries,
  writeSiteCopy,
} from '@repo/pipeline'
import { getEnv } from './env'
import {
  type BuildResult,
  type BuildStep,
  contentFor,
  drawTemplates,
  type PhotoLanded,
  type PhotoResult,
  type SiteState,
  sitePhotos,
} from './make-site'

/**
 * Jev's answers kept for one edit, by question: the same question about the same item, asked again
 * later in the edit, is answered from here, without another request. The checks after the writer
 * ask early, side by side (the items about to be removed, the grounding of the lists), and the
 * steps that run one after another later find their answers ready. Each question is answered on
 * its own, so an answer does not depend on the request it came in.
 */
function remembering(port: DecisionPort): DecisionPort {
  const kept = new Map<string, Promise<Answer>>()
  return {
    id: port.id,
    model: port.model,
    async decide(state, questions, signal) {
      const s = JSON.stringify(state)
      const keyOf = (q: Question) =>
        JSON.stringify([
          s,
          q.kind,
          q.prompt,
          q.kind === 'choice' ? q.options : q.kind === 'score' ? q.levels : null,
        ])
      const fresh = new Map<string, Question>()
      for (const q of questions) if (!kept.has(keyOf(q))) fresh.set(keyOf(q), q)
      let calls: DecisionCall[] = []
      if (fresh.size) {
        const asked = port.decide(state, [...fresh.values()], signal)
        for (const [k, q] of fresh)
          kept.set(
            k,
            asked.then(
              (r) => r.answers.get(q.id) ?? { kind: 'missing', id: q.id, reason: 'error' },
              (e) => {
                kept.delete(k)
                throw e
              },
            ),
          )
        calls = (await asked).calls
      }
      const answers = new Map<string, Answer>()
      for (const q of questions) {
        const a = await kept.get(keyOf(q))
        if (a) answers.set(q.id, { ...a, id: q.id })
      }
      return { answers, calls }
    },
  }
}

/** Words of four letters or more, by their first five letters. */
const stems = (x: unknown) =>
  new Set(
    (
      JSON.stringify(x)
        .toLowerCase()
        .match(/\p{L}{4,}/gu) ?? []
    ).map((t) => t.slice(0, 5)),
  )

/** First five letters of words about looks, never counted as the request's own words. */
const STYLE = new Set(
  'modern bolder louder darker light lighter minimal elegant playful calmer warmer cooler colour color colourful theme design style fonts lettering serif photos pictures black white brighter softer moody moodier trustworthy friendly'
    .split(' ')
    .map((w) => w.slice(0, 5)),
)
const COLOUR_WORDS = new Set(
  [
    ...NAMED_COLOURS.map((c) => c.key),
    'purple',
    'green',
    'yellow',
    'orange',
    'pink',
    'brown',
    'grey',
    'gray',
    'blue',
  ].map((w) => w.slice(0, 5)),
)

const EXTRA_TEXT: Record<Extra, string> = {
  reasons: 'reasons to choose it',
  steps: 'how a first visit or a job goes, step by step',
  audience: 'the needs it meets',
  faq: 'questions and answers',
  statement: 'one large line of what it stands for',
  gallery: 'a gallery of photos',
}

const ASKS = {
  // "We're called Bean There" scored over 0.5 and threw the site away (2026-11-21): a new name
  // is an edit; the bar is also 0.75 below.
  restart:
    'describe a different organisation altogether (not a new name, new facts or a correction for this one), or ask to start again from scratch',
  undo: 'ask to undo, revert or go back to how the website was before the last change',
  vague:
    'say they dislike it or want it different without saying what to change (the colour, design, words, photos or a part)',
  // "No more photos of food please" took every photo off (2026-11-23): that asks for other photos.
  noPhotos:
    'ask to take all photos off the website and show none at all (not to replace some photos with other ones)',
  // Jev gave this 0.79 to 0.94 for "remove the photos", "less text" and "I don't like it"
  // (2026-11-23): it acts only when the sections question agrees.
  fewerParts:
    'ask for fewer sections of the page in general, without naming which (not fewer words, not the photos, not one named thing)',
  remove:
    'ask to remove, drop or stop mentioning something, or say the organisation no longer does or offers something',
  words:
    'change any words on the site: its name, a heading, a description, prices, opening hours, an address, a phone number or other facts, or make the text shorter, longer, simpler, more direct, warmer or different in tone, or tell a new fact about the organisation that belongs on its website (what it offers, delivery, the area it serves, opening hours, prices, contact details)',
  // "Make it blue" on a navy site scored 0.49 as "a different colour" (2026-11-21): any colour
  // asked for counts, and one it already has is said back to the owner.
  colour:
    "ask for a colour or a change of colour (such as 'make it green', 'red and black', 'warmer colours'), even a colour it already has",
  look: 'ask for a different design, layout, style or mood (darker, lighter, bolder, calmer, more modern, more traditional and so on)',
  type: 'ask for different fonts or lettering',
  // "Remove anything about cats" scored 0.83 as removing a part and switched on two sections
  // (2026-11-21): facts inside a part are the words' business.
  sections:
    'ask to add or remove a whole section of the page, such as the questions and answers, the steps, the reasons or a gallery? Changing, adding or removing facts, services or mentions inside the page is not this',
  photos:
    "ask for different photos or pictures, more of them, or no more photos of one kind (such as 'no more photos of food')",
  // "Show different photos" scored 0.93 on "more photos" (2026-11-21); the gallery question must
  // agree too.
  morePhotos: 'ask for a larger number of photos on the page than now, not only different ones',
  allText:
    'ask to change all of the text at once: make it shorter, longer, simpler, plainer, a different tone or a different language, or say there is too much or too little text',
} as const

/** The parts of the words an edit may change, as Jev reads them. */
const PARTS: Partial<Record<keyof SiteCopy, string>> = {
  name: 'the name of the organisation',
  tagline: 'the short label under the name',
  headline: 'the main headline',
  subhead: 'the sentence under the headline',
  about: 'the introduction paragraph',
  reasonsTitle: 'the heading of the reasons',
  reasons: 'the reasons to choose it',
  offer: 'what it offers: the list of services, products or prices and its heading',
  contact: 'the contact details: address, opening hours, phone or email',
  cta: 'the closing call to action',
  statement: 'the one large line of what it stands for',
  steps: 'the steps of a first visit or a job',
  faq: 'the questions and answers',
  audience: 'the needs it meets',
}

/**
 * The writer, asked to change one thing, sometimes rewrites others too (a phone number changed
 * the offer's heading, 2026-11-20). Every part it changed is put to Jev: does the request ask for
 * this? Parts it does not ask for go back to how they were. When the name changes, the old name is
 * replaced in the parts that go back, so the page never shows both.
 */
async function keepAsked(
  decide: DecisionPort,
  before: SiteCopy,
  after: SiteCopy,
  request: string,
  /** The request is about all the text (shorter, warmer…): every part the writer changed stays. */
  allText = false,
  /** The request removes something: items about it go even where the writer left them. */
  removing = false,
): Promise<SiteCopy> {
  if (removing) after = await removeItems(decide, after, request)
  const keys = (Object.keys(PARTS) as (keyof SiteCopy)[]).filter(
    (k) => JSON.stringify(before[k]) !== JSON.stringify(after[k]),
  )
  if (!keys.length || allText) return after
  // List items the writer dropped: each is put to Jev too. A phone number once replaced "Leak
  // detection", and "remove anything about cats" also dropped "Bath only" (2026-11-21).
  const dropped = keys.flatMap((k) => droppedItems(before[k], after[k]).map((x) => ({ k, x })))
  // Offer items the edit added must be ones the request itself names: a phone number became a
  // "Phone support" service, and "we stopped doing boiler installs" a "Boiler servicing" one
  // (2026-11-21).
  const oldItems = new Set(before.offer.items.map(itemKey))
  const added = after.offer.items.filter((x) => !oldItems.has(itemKey(x)))
  const res = await decide.decide({ request }, [
    ...added.map((x, i) => ({
      kind: 'bool' as const,
      id: `add${i}`,
      prompt: `A website owner sent \`request\`. Does it ask to add this to what the organisation offers, or say that it offers, does or sells it (with or without a price)? Item: ${JSON.stringify(x).slice(0, 300)}`,
    })),
    ...keys.map((k) => ({
      kind: 'bool' as const,
      id: k,
      prompt: `A website owner sent \`request\`. Does it ask for a change to ${PARTS[k]}, or give a fact that belongs there? Before: ${JSON.stringify(before[k]).slice(0, 400)} After: ${JSON.stringify(after[k]).slice(0, 400)}`,
    })),
    ...dropped.map(({ x }, i) => ({
      kind: 'bool' as const,
      id: `drop${i}`,
      prompt: `A website owner sent \`request\`. Does it ask for this item to be taken off their website, or say the organisation no longer does it? Item: ${JSON.stringify(x).slice(0, 300)}`,
    })),
  ])
  const unnamed = new Set(
    added
      .filter((_, i) => {
        const a = res.answers.get(`add${i}`)
        return !(a?.kind === 'bool' && a.pTrue > 0.5)
      })
      .map(itemKey),
  )
  if (unnamed.size)
    after = {
      ...after,
      offer: { ...after.offer, items: after.offer.items.filter((x) => !unnamed.has(itemKey(x))) },
    }
  const goes = new Set(
    dropped
      .filter((_, i) => {
        const a = res.answers.get(`drop${i}`)
        return a?.kind === 'bool' && a.pTrue > 0.5
      })
      .map(({ x }) => JSON.stringify(x)),
  )
  // A part that now carries the request's own words or numbers ("£900") was asked for, whatever
  // Jev says: it judged packages with prices not to concern the offer (0.44, 2026-11-20).
  // Words count by their first five letters, so "donations" carries "donate" (2026-11-21).
  const tokens = (x: unknown) =>
    new Set(
      (
        JSON.stringify(x)
          .toLowerCase()
          .match(/[£$€]?\d[\d,.:]*|\p{L}{4,}/gu) ?? []
      ).map((t) => (/^\p{L}/u.test(t) ? t.slice(0, 5) : t)),
    )
  // Style words belong to the colour and design, not the text: "make it purple, more modern"
  // once put "a modern purple setting" in a salon's subhead.
  const said = new Set([...tokens(request)].filter((t) => !STYLE.has(t) && !COLOUR_WORDS.has(t)))
  const carries = (k: keyof SiteCopy) => {
    const was = tokens(before[k])
    return [...tokens(after[k])].some((t) => said.has(t) && !was.has(t))
  }
  const asked = (k: keyof SiteCopy) => {
    const a = res.answers.get(k)
    // Without the request's own words, Jev must be sure: a packages request once also rewrote
    // the headline (Jev said yes to it).
    return carries(k) || (a?.kind === 'bool' && a.pTrue > 0.75)
  }
  const renamed = asked('name') && before.name !== after.name
  const out: SiteCopy = { ...after }
  for (const k of keys) {
    if (asked(k)) {
      ;(out as Record<string, unknown>)[k] = keepItems(before[k], after[k], goes)
      continue
    }
    const old = before[k]
    ;(out as Record<string, unknown>)[k] = renamed
      ? JSON.parse(rename(JSON.stringify(old), before.name, after.name))
      : old
  }
  // Parts the writer left alone may still carry the old name.
  return renamed
    ? {
        ...(JSON.parse(rename(JSON.stringify(out), before.name, after.name)) as SiteCopy),
        name: after.name,
      }
    : out
}

/**
 * "Remove the delivery stuff" took the delivery service off but left two delivery questions the
 * writer kept (2026-11-21): every list item is put to Jev, and those the request removes go.
 */
async function removeItems(
  decide: DecisionPort,
  copy: SiteCopy,
  request: string,
): Promise<SiteCopy> {
  const lists = {
    faq: copy.faq,
    offer: copy.offer.items,
    reasons: copy.reasons,
    steps: copy.steps.items,
    audience: copy.audience.items,
  }
  const all = Object.entries(lists).flatMap(([k, xs]) =>
    (xs as unknown[]).map((x, i) => ({ id: `${k}${i}`, x })),
  )
  if (!all.length) return copy
  const res = await decide.decide(
    { request },
    all.map(({ id, x }) => ({
      kind: 'bool' as const,
      id,
      prompt: `A website owner sent \`request\`. Is this item about what the request asks to remove, or about something the organisation no longer does? Item: ${JSON.stringify(x).slice(0, 300)}`,
    })),
  )
  const keep = (k: string) => (_: unknown, i: number) => {
    const a = res.answers.get(`${k}${i}`)
    // 0.5: "remove fault finding" left "Fault located and fixed" among the reasons at 0.6.
    return !(a?.kind === 'bool' && a.pTrue > 0.5)
  }
  return {
    ...copy,
    faq: copy.faq.filter(keep('faq')),
    offer: { ...copy.offer, items: copy.offer.items.filter(keep('offer')) },
    reasons: copy.reasons.filter(keep('reasons')),
    steps: { ...copy.steps, items: copy.steps.items.filter(keep('steps')) },
    audience: { ...copy.audience, items: copy.audience.items.filter(keep('audience')) },
  }
}

/**
 * The old name replaced by the new one, only where it stands as a whole name: "Marta Light Photo"
 * renamed "Marta Light Photography" became "…Photographyphotography" when every occurrence was
 * replaced, the new name included (2026-11-23).
 */
function rename(text: string, from: string, to: string): string {
  if (!from || from === to) return text
  const esc = (x: string) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // Not where the text already has the new name, and not inside a longer word.
  const re = new RegExp(`(?<![\\p{L}\\p{N}])${esc(from)}(?![\\p{L}\\p{N}])`, 'gu')
  const keep = '\u0000'
  return text.split(to).join(keep).replace(re, to).split(keep).join(to)
}

/** Each list's items once, by name: the writer once returned "Portrait session" twice. */
function dedupe(c: SiteCopy): SiteCopy {
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
const itemKey = (x: unknown) => {
  const o = x as Record<string, unknown>
  return String(o?.name ?? o?.title ?? o?.q ?? JSON.stringify(x)).toLowerCase()
}

/** Items in `before`'s lists (also one level down, as the offer's items) that `after` lacks. */
function droppedItems(before: unknown, after: unknown): unknown[] {
  if (Array.isArray(before) && Array.isArray(after)) {
    const have = new Set(after.map(itemKey))
    return before.filter((x) => !have.has(itemKey(x)))
  }
  if (before && after && typeof before === 'object' && typeof after === 'object')
    return Object.entries(before).flatMap(([k, v]) =>
      Array.isArray(v) ? droppedItems(v, (after as Record<string, unknown>)[k]) : [],
    )
  return []
}

/** Dropped items go back in, after the ones `after` has, unless they are in `goes`. */
function keepItems(before: unknown, after: unknown, goes: Set<string>): unknown {
  if (Array.isArray(before) && Array.isArray(after)) {
    const have = new Set(after.map(itemKey))
    return [
      ...after,
      ...before.filter((x) => !have.has(itemKey(x)) && !goes.has(JSON.stringify(x))),
    ]
  }
  if (before && after && typeof before === 'object' && typeof after === 'object') {
    const o: Record<string, unknown> = { ...(after as Record<string, unknown>) }
    for (const [k, v] of Object.entries(before))
      if (Array.isArray(v)) o[k] = keepItems(v, o[k], goes)
    return o
  }
  return after
}

/** Whether an extra part has enough words to show (as the templates' `present` decides). */
function visible(x: Extra, c: SiteCopy): boolean {
  if (x === 'faq') return c.faq.length >= 2
  if (x === 'reasons') return c.reasons.length >= 2
  if (x === 'steps') return c.steps.items.length >= 3
  if (x === 'audience') return c.audience.items.length >= 3
  if (x === 'statement') return !!c.statement
  return true
}

/**
 * The new site's check on questions, offer, reasons and steps, plus a stricter one for what the
 * edit added: a new site keeps at least two reasons even when Jev doubts them, but an edit has the
 * old ones to fall back on. An edit asked for "rubbish collection days" and got "bins every Tuesday
 * and Friday" (2026-11-21): a new item Jev more likely than not takes for a guess goes.
 */
async function groundNew(
  decide: DecisionPort,
  words: string,
  before: SiteCopy,
  copy: SiteCopy,
  /** The owner asked for questions and answers. */
  faqAsked = false,
  /**
   * The whole text was rewritten (a language or tone): every item is "new", so the strict check
   * on new items would drop translated steps for the English ones (2026-11-23). Only the new
   * site's check applies.
   */
  allText = false,
): Promise<SiteCopy> {
  const g = await groundAnswers(decide, words, copy)
  const was = (xs: unknown[]) => new Set(xs.map((x) => JSON.stringify(x)))
  const oldReasons = was(before.reasons)
  const oldSteps = was(before.steps.items)
  const oldItems = was(before.offer.items)
  const guessed = (xs: unknown[], old: Set<string>, prefix: string) =>
    new Set(
      xs
        .map((x, i) => ({ x, p: g.scores[`${prefix}${i}`] ?? 0 }))
        .filter(({ x, p }) => !old.has(JSON.stringify(x)) && p > 0.5)
        .map(({ x }) => JSON.stringify(x)),
    )
  const none = new Set<string>()
  const badReasons = allText ? none : guessed(copy.reasons, oldReasons, 'reason')
  const badSteps = allText ? none : guessed(copy.steps.items, oldSteps, 'step')
  const badDetails = new Set(
    copy.offer.items
      .map((x, i) => ({ x, p: g.scores[`detail${i}`] ?? 0 }))
      .filter(({ x, p }) => !allText && !oldItems.has(JSON.stringify(x)) && p > 0.5)
      .map(({ x }) => x.name),
  )
  // A rewrite of the whole text carries the checked items over in new words: too few left after
  // the check means the writer's own (translated) list, never the old language's.
  const fallback = allText ? copy : before
  const out = g.copy
  // Questions the owner asked for, when the check leaves fewer than two real answers: one real
  // answer is enough, with the rest left for the owner to fill ("add a section with questions and
  // answers" changed nothing for a climbing gym, 2026-11-21).
  const askedFaq = () => {
    const ask = (a: string) => /get in touch and we will tell you/i.test(a)
    const real = copy.faq.filter((f, i) => !ask(f.a) && (g.scores[`faq${i}`] ?? 0) <= 0.5)
    const open = copy.faq
      .filter((_, i) => (g.scores[`faq${i}`] ?? 0) > 0.5)
      .slice(0, 2)
      .map((f) => ({ ...f, a: 'Get in touch and we will tell you.' }))
    return real.length ? [...real, ...open] : []
  }
  // What the page already had, unchanged, passed this check before and stays: asked again, Jev
  // once dropped a physio's "Initial assessment" after "we also do sports massage" (2026-11-21).
  const merge = <T>(mine: T[], grounded: T[], old: Set<string>, bad = new Set<string>()) => {
    const byKey = new Map(grounded.map((x) => [itemKey(x), x]))
    return mine.flatMap((x) => {
      if (old.has(JSON.stringify(x))) return [x]
      const y = byKey.get(itemKey(x))
      return y && !bad.has(JSON.stringify(x)) ? [y] : []
    })
  }
  const reasons = merge(copy.reasons, out.reasons, oldReasons, badReasons)
  const steps = merge(copy.steps.items, out.steps.items, oldSteps, badSteps)
  const items = merge(copy.offer.items, out.offer.items, oldItems)
  const faq = merge(copy.faq, out.faq, was(before.faq))
  return {
    ...out,
    // The best-of pick is a new site's: an edit keeps the name, headline and heading it settled.
    name: copy.name,
    headline: copy.headline,
    faq:
      faq.length >= 2
        ? faq
        : out.faq.length || before.faq.length || !faqAsked
          ? out.faq
          : askedFaq(),
    reasons: reasons.length >= 2 ? reasons : fallback.reasons,
    steps: { ...out.steps, items: steps.length >= 3 ? steps : fallback.steps.items },
    offer: {
      ...out.offer,
      title: copy.offer.title,
      items: (items.length >= 2 ? items : out.offer.items).map((x) =>
        badDetails.has(x.name) ? { ...x, detail: '' } : x,
      ),
    },
  }
}

export type EditOutcome =
  | { restart: true }
  | { undo: true; restart: false }
  | { restart: false; result: BuildResult }

export async function edit(
  state: SiteState,
  request: string,
  onStep: (s: BuildStep) => void = () => {},
  onPhotos?: (p: PhotoResult | null) => void,
  /** Each space's new photo as it lands (make-site.ts, sitePhotos). */
  onPhoto?: (p: PhotoLanded) => void,
): Promise<EditOutcome> {
  const t0 = performance.now()
  const env = getEnv()
  const decide = remembering(
    env.TYPESAFE_API_KEY
      ? typesafeDecisions({ apiKey: env.TYPESAFE_API_KEY })
      : randomDecisions(request),
  )
  const type = TYPE_RULES.find((t) => t.key === state.type)
  const site = [
    `Name: ${state.copy.name}, a ${state.copy.kind}.`,
    `Colour: ${state.brandName}.`,
    `Designs shown: ${state.templates.map((id) => LIVE.find((t) => t.id === id)?.label ?? id).join(', ')}.`,
    `Lettering: ${type?.label ?? state.type}.`,
    `Extra parts of the page: ${state.extras.map((x) => EXTRA_TEXT[x]).join('; ') || 'none'}.`,
  ].join(' ')

  // One Jev request: what the owner asks to change, and what each change would be.
  const questions: Question[] = [
    ...(Object.entries(ASKS) as [keyof typeof ASKS, string][]).map(([id, what]) => ({
      kind: 'bool' as const,
      id: `asks:${id}`,
      prompt: `An organisation's owner has a website (\`website\`) and now sends \`request\`. Does the request ${what}?`,
    })),
    {
      kind: 'choice',
      id: 'colour',
      prompt:
        "Which one colour should this organisation's website use now, after the owner's request?",
      options: NAMED_COLOURS.map((c) => ({ key: c.key, text: `${c.key}: ${c.mood}` })),
    },
    {
      kind: 'choice',
      id: 'look',
      prompt:
        "After the owner's request, which design for this organisation's whole website would its owner and its visitors like best?",
      options: LIVE.map((t) => ({ key: t.id, text: t.text })),
    },
    {
      kind: 'choice',
      id: 'type',
      prompt: "Which lettering should the website use now, after the owner's request?",
      options: TYPE_RULES.map((t) => ({ key: t.key, text: t.text })),
    },
    {
      kind: 'choice',
      id: 'part',
      prompt: 'Which part of the page does the request name, if any?',
      options: [
        ...EXTRAS.map((x) => ({ key: x, text: EXTRA_TEXT[x] })),
        { key: 'none', text: 'none of these' },
      ],
    },
    ...EXTRAS.map((x) => ({
      kind: 'bool' as const,
      id: `has:${x}`,
      prompt: `After the owner's request, should the website have a part with ${EXTRA_TEXT[x]}? It has one now: ${state.extras.includes(x) ? 'yes' : 'no'}.`,
    })),
  ]
  const judged = decide
    .decide({ owner_words: state.words, website: site, request }, questions)
    .then((r) => {
      onStep({ step: 'choices', ms: Math.round(performance.now() - t0) })
      return r
    })
  const rewritten = env.OPENROUTER_API_KEY
    ? writeSiteCopy({
        apiKey: env.OPENROUTER_API_KEY,
        words: `${state.words}\n${request}`,
        edit: { copy: state.copy, request },
      }).then((w) => {
        onStep({ step: 'words', ms: w.ms })
        return w
      })
    : null

  const r = await judged
  // Sections and the design change the whole page, so Jev must be surer before they move: an
  // opening-hours message once also added a statement nobody asked for.
  const p = (id: string) => {
    const a = r.answers.get(id)
    return a?.kind === 'bool' ? a.pTrue : 0
  }
  // The design needs 0.75 only beside another change: alone, "more trustworthy" (0.61) is a
  // design request (2026-11-21).
  // Mood words ("calmer and more minimal") brush the words question (0.54): only a clear other
  // request makes the design one change among several.
  const alone = !['words', 'colour', 'type', 'sections', 'photos'].some((x) => p(`asks:${x}`) > 0.6)
  const sure = (id: string) =>
    id === 'asks:restart' || id === 'asks:sections' || (id === 'asks:look' && !alone) ? 0.75 : 0.5
  const yes = (id: string) => p(id) > sure(id)
  const top = (id: string) => {
    const a = r.answers.get(id)
    return a?.kind === 'choice' ? a : null
  }
  if (yes('asks:undo')) return { undo: true, restart: false }
  if (yes('asks:restart')) return { restart: true }
  // Questions asked ahead only to have their answers ready (remembering): a failed one is asked
  // again where it is needed.
  const ahead = (p: Promise<unknown>) => void p.catch(() => {})
  // Removing something: the page's list items are put to Jev now, while the writer still works;
  // the removal after it then asks only about items the writer changed (removeItems).
  if (yes('asks:remove') && rewritten) ahead(removeItems(decide, state.copy, request))

  const next: SiteState = { ...state, words: `${state.words}\n${request}` }
  const changed: string[] = []
  let wordsSame = false
  let needWords = false
  /** Asked for, but already so: said back to the owner instead of "nothing changed". */
  const already: string[] = []
  if (yes('asks:colour')) {
    const c = NAMED_COLOURS.find((x) => x.key === top('colour')?.top)
    if (c && c.key !== state.brandName) {
      next.brand = c.hex
      next.brandName = c.key
      changed.push(`colour to ${c.key}`)
    } else if (c) already.push(`the colour is already ${c.key}`)
  }
  if (yes('asks:look')) {
    const a = top('look')
    const dist = a?.dist ?? (a ? { [a.top]: 1 } : {})
    const ranked = LIVE.map((t) => t.id).sort((x, y) => (dist[y] ?? 0) - (dist[x] ?? 0))
    if (ranked.length >= 3 && ranked[0] !== state.templates[0]) {
      next.templates = ranked.slice(0, 3)
      changed.push('the designs')
    } else if (alone && ranked.length >= 4) {
      // Asked only for a different look ("more premium", "calmer and more minimal"), the owner
      // wants a change: the next-best designs, not "already the closest" (2026-11-23). Beside a
      // colour or words, the current design stays.
      next.templates = ranked.filter((id) => id !== state.templates[0]).slice(0, 3)
      changed.push('the designs')
    } else
      already.push(
        `${LIVE.find((t) => t.id === state.templates[0])?.label ?? 'the first design'} is already the closest design to that`,
      )
  }
  if (yes('asks:type')) {
    const t = TYPE_RULES.find((x) => x.key === top('type')?.top)
    if (t && t.key !== state.type) {
      next.type = t.key
      changed.push(`lettering to ${t.label}`)
    } else if (t) already.push(`the lettering is already ${t.label}`)
  }
  if (yes('asks:sections')) {
    // Only decisive answers move a section: one Jev is unsure about stays as it is.
    const p = (x: Extra) => {
      const a = r.answers.get(`has:${x}`)
      return a?.kind === 'bool' ? a.pTrue : 0.5
    }
    // The part the request names follows Jev's lean when Jev is sure the request is about parts
    // of the page: "remove the steps" scored 0.93 on sections but only 0.34 on keeping steps
    // (2026-11-21). Other parts move only on decisive answers.
    const sure = (r.answers.get('asks:sections') as { pTrue?: number })?.pTrue ?? 0
    const named = top('part')?.top as Extra | 'none' | undefined
    const bounds = (x: Extra) =>
      sure > 0.85 && x === named ? ([0.5, 0.5] as const) : ([0.25, 0.75] as const)
    const extras = EXTRAS.filter((x) =>
      state.extras.includes(x) ? p(x) >= bounds(x)[0] : p(x) > bounds(x)[1],
    )
    if ([...extras].sort().join() !== [...state.extras].sort().join()) {
      next.extras = extras
      changed.push('the parts of the page')
    } else if (named && named !== 'none') {
      // Nothing moved: the named part is already as asked. On, but with no words yet (questions
      // the check emptied), it needs the writer.
      const on = state.extras.includes(named) && visible(named, state.copy)
      // "Add a section about what to bring" on a page with steps asks for new words in that part
      // (2026-11-23): the writer runs, and "already" is said only if nothing comes of it.
      const words = r.answers.get('asks:words')
      if (p(named) > 0.5 && on && words?.kind === 'bool' && words.pTrue > 0.4) needWords = true
      else if (p(named) > 0.5 && on)
        already.push(`${EXTRA_TEXT[named]} ${named === 'faq' ? 'are' : 'is'} already on the page`)
      else if (p(named) > 0.5) needWords = true
      else if (!on) already.push(`there is no part with ${EXTRA_TEXT[named]} on the page`)
    }
  }
  // "Fewer sections": the one or two extra parts Jev least wants go.
  // A vague dislike ("I don't like it") is answered with a question, never by taking things away.
  const vague = yes('asks:vague')
  if (
    !vague &&
    yes('asks:fewerParts') &&
    p('asks:sections') > 0.7 &&
    !changed.includes('the parts of the page')
  ) {
    const has = (x: Extra) => {
      const a = r.answers.get(`has:${x}`)
      return a?.kind === 'bool' ? a.pTrue : 0.5
    }
    const on = next.extras.filter((x) => visible(x, next.copy))
    if (on.length) {
      const go = [...on].sort((a, b) => has(a) - has(b)).slice(0, on.length > 2 ? 2 : 1)
      next.extras = next.extras.filter((x) => !go.includes(x))
      changed.push(`the parts of the page (without ${go.map((x) => EXTRA_TEXT[x]).join(' or ')})`)
    } else already.push('the page shows only its main parts already')
  }
  if ((yes('asks:words') || needWords) && rewritten) {
    let w = await rewritten
    // A new fact the writer left out altogether ("we deliver across Copenhagen same day" once came
    // back unchanged, 2026-11-23): one more try, told plainly. Not for whole-text changes, whose
    // words ("less text") need not appear.
    const fresh = [...stems(request)].filter(
      (t) => !STYLE.has(t) && !COLOUR_WORDS.has(t) && !stems(state.copy).has(t),
    )
    if (
      env.OPENROUTER_API_KEY &&
      w.copy &&
      !yes('asks:allText') &&
      fresh.length >= 2 &&
      !fresh.some((t) => stems(w.copy).has(t))
    )
      w = await writeSiteCopy({
        apiKey: env.OPENROUTER_API_KEY,
        words: `${state.words}\n${request}`,
        edit: {
          copy: state.copy,
          request: `${request}\n(This is new and true. Put it on the website where a visitor will see it.)`,
        },
      })
    if (w.copy) {
      // The photo searches stay unless new photos are asked for: changing them would not change
      // the photos already shown.
      const after = { ...w.copy, photos: state.copy.photos }
      // The lists the writer changed get the new site's check below (groundNew), on items from
      // the old and the new words: asked now, beside the check of what was asked for, rather than
      // after it.
      if (
        (['faq', 'offer', 'reasons', 'steps'] as const).some(
          (k) => JSON.stringify(after[k]) !== JSON.stringify(state.copy[k]),
        )
      ) {
        // The old words' other names and headlines are not asked about: an edit keeps its own.
        const none = { names: [], headlines: [], offerTitles: [] }
        ahead(groundAnswers(decide, next.words, after))
        ahead(groundAnswers(decide, next.words, { ...state.copy, more: none }))
      }
      let copy = await keepAsked(
        decide,
        state.copy,
        after,
        request,
        yes('asks:allText'),
        yes('asks:remove'),
      )
      // Questions, offer items, reasons or steps the edit changed get the same check as a new
      // site's (docs/m0/19, 23): an edit once added "up to four hours" to a package.
      const moved = (['faq', 'offer', 'reasons', 'steps'] as const).some(
        (k) => JSON.stringify(copy[k]) !== JSON.stringify(state.copy[k]),
      )
      if (moved)
        copy = await groundNew(
          decide,
          next.words,
          state.copy,
          copy,
          top('part')?.top === 'faq',
          yes('asks:allText'),
        )
      copy = dedupe(copy)
      // Fewer than three steps or needs is no section: keep the earlier ones instead of a stub.
      if (copy.steps.items.length < 3) copy = { ...copy, steps: state.copy.steps }
      if (copy.audience.items.length < 3) copy = { ...copy, audience: state.copy.audience }
      if (JSON.stringify(copy) === JSON.stringify(state.copy)) wordsSame = true
      else {
        next.copy = copy
        changed.push('the words')
        // A change that landed only in a part the page does not show would be invisible: that
        // part joins the page (a florist's delivery area went into the steps, 2026-11-20).
        const shown = ['name', 'tagline', 'headline', 'subhead', 'about', 'offer', 'contact', 'cta']
        const moved = (Object.keys(copy) as (keyof SiteCopy)[]).filter(
          (k) => JSON.stringify(copy[k]) !== JSON.stringify(state.copy[k]),
        )
        const extraOf: Partial<Record<keyof SiteCopy, Extra>> = {
          steps: 'steps',
          audience: 'audience',
          faq: 'faq',
          statement: 'statement',
          reasons: 'reasons',
        }
        const seen = (k: keyof SiteCopy) => {
          const x = extraOf[k]
          return shown.includes(k) || (!!x && next.extras.includes(x))
        }
        if (!moved.some(seen))
          for (const k of moved) {
            const x = extraOf[k]
            if (x && !next.extras.includes(x)) next.extras = [...next.extras, x]
          }
      }
    }
  }

  // More photos: the gallery joins the page (the photos found already fill it).
  const gallery = r.answers.get('has:gallery')
  if (
    yes('asks:morePhotos') &&
    gallery?.kind === 'bool' &&
    gallery.pTrue > 0.75 &&
    !next.extras.includes('gallery')
  ) {
    next.extras = [...next.extras, 'gallery']
    if (!changed.includes('the parts of the page')) changed.push('the parts of the page')
  }
  // "The words already say that" only when nothing else changed: said beside a new colour it
  // reads as a refusal.
  // A part asked for that still has no words: the check found nothing true to put in it. Ask the
  // owner rather than show an empty part or made-up answers.
  if (needWords)
    for (const x of next.extras.filter((x) => !visible(x, next.copy)))
      already.push(
        x === 'faq'
          ? 'questions and answers need facts from you: tell me what visitors ask and how you answer'
          : `${EXTRA_TEXT[x]} needs a few facts from you first`,
      )
  if (wordsSame && !changed.length && !already.length) already.push('the words already say that')

  // New photos: new searches from the request, and the photo step again.
  let photoJob: BuildResult['photoJob'] = null
  if (!vague && yes('asks:noPhotos')) {
    // No photos: the photo step with nothing to search, so every space gets drawn art.
    next.seed = `${state.seed}-${Date.now() % 100000}`
    photoJob = {
      queries: next.copy.photos,
      about: { name: next.copy.name, kind: next.copy.kind, town: next.copy.contact.place },
      seed: next.seed,
      art: next.art,
      none: true,
    }
    changed.push('the photos (taken off)')
    if (onPhotos)
      sitePhotos(photoJob, onPhoto).then(
        (p) => onPhotos({ ...p, ms: Math.round(performance.now() - t0) }),
        () => onPhotos(null),
      )
  } else if (yes('asks:photos') && env.OPENROUTER_API_KEY) {
    // The new searches are written in the background with the photo step, so the page comes back
    // without waiting for them; the build page keeps them on the site when the photos arrive. If
    // they cannot be written, the old searches still bring other photos (the shown ones are
    // avoided).
    next.seed = `${state.seed}-${Date.now() % 100000}`
    const job: NonNullable<BuildResult['photoJob']> = {
      queries: next.copy.photos,
      about: { name: next.copy.name, kind: next.copy.kind, town: next.copy.contact.place },
      seed: next.seed,
      art: next.art,
      avoid: state.shown ?? [],
    }
    photoJob = job
    changed.push('the photos')
    if (onPhotos) {
      const apiKey = env.OPENROUTER_API_KEY
      writePhotoQueries({ apiKey, words: `${next.words}\nPhotos wanted now: ${request}` })
        .catch(() => null)
        .then(async (q) => {
          const p = await sitePhotos(q ? { ...job, queries: q.queries } : job, onPhoto)
          return { ...p, costUsd: p.costUsd + (q?.costUsd ?? 0) }
        })
        .then(
          (p) => onPhotos({ ...p, ms: Math.round(performance.now() - t0) }),
          () => onPhotos(null),
        )
    }
  }

  // Nothing changed and nothing to say back: ask what to change instead of a silent reply.
  const reply =
    changed.length || already.length
      ? undefined
      : yes('asks:vague')
        ? 'Tell me what you would like different: the colour, the design, the words, the photos or a part of the page. The other two versions are different designs too.'
        : 'I could not tell what to change. Try naming the colour, the design, the words, the photos or a part of the page.'
  const content = contentFor(next.copy, next.brand)
  const sites = drawTemplates(next, content)
  const total = Math.round(performance.now() - t0)
  return {
    restart: false,
    result: {
      state: next,
      changed,
      name: next.copy.name,
      kindLabel: next.copy.kind,
      suggested: sites[0]?.id ?? 'b1',
      sites,
      images: {},
      credits: [],
      photoSearches: Object.values(next.copy.photos),
      ms: { decide: total, check: 0, text: 0, photos: 0, render: 0, order: 0, total },
      costUsd: r.calls.reduce((s, c) => s + (c.costUsd ?? 0), 0),
      notes: [],
      already,
      ...(reply ? { reply } : {}),
      photoJob,
    },
  }
}
