// Editing a site (docs/m0/27-editing.md). A follow-up message changes only what it asks for and
// keeps the rest: the words, colour, lettering, templates, sections and photos the owner already
// has. Jev reads the request in one call that also answers what each change would be; the
// writer, in parallel, rewrites only the words asked for (its answer is used only when Jev says
// the request concerns the words). Photos already found are kept unless new ones are asked for.

import { NAMED_COLOURS } from '@repo/eval/grammar/colour-rules'
import { TYPE_RULES } from '@repo/eval/grammar/type-rules'
import { LIVE } from '@repo/library'
import {
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
  type PhotoResult,
  type SiteState,
  sitePhotos,
} from './make-site'

const EXTRA_TEXT: Record<Extra, string> = {
  reasons: 'reasons to choose it',
  steps: 'how a first visit or a job goes, step by step',
  audience: 'the needs it meets',
  faq: 'questions and answers',
  statement: 'one large line of what it stands for',
  gallery: 'a gallery of photos',
}

const ASKS = {
  restart: 'describe a different organisation, or ask to start again from scratch',
  words:
    'change any words on the site: its name, a heading, a description, prices, opening hours, an address, a phone number or other facts, or make the text shorter, longer, simpler, more direct, warmer or different in tone, or tell a new fact about the organisation that belongs on its website (what it offers, delivery, the area it serves, opening hours, prices, contact details)',
  colour: 'ask for a different colour',
  look: 'ask for a different design, layout, style or mood (darker, lighter, bolder, calmer, more modern, more traditional and so on)',
  type: 'ask for different fonts or lettering',
  sections: 'ask to add or remove a part of the page, such as questions, steps or a gallery',
  photos: 'ask for different photos or pictures',
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
  decide: ReturnType<typeof typesafeDecisions>,
  before: SiteCopy,
  after: SiteCopy,
  request: string,
): Promise<SiteCopy> {
  const keys = (Object.keys(PARTS) as (keyof SiteCopy)[]).filter(
    (k) => JSON.stringify(before[k]) !== JSON.stringify(after[k]),
  )
  if (!keys.length) return after
  const res = await decide.decide(
    { request },
    keys.map((k) => ({
      kind: 'bool' as const,
      id: k,
      prompt: `A website owner sent \`request\`. Does it ask for a change to ${PARTS[k]}, or give a fact that belongs there? Before: ${JSON.stringify(before[k]).slice(0, 400)} After: ${JSON.stringify(after[k]).slice(0, 400)}`,
    })),
  )
  // A part that now carries the request's own words or numbers ("£900") was asked for, whatever
  // Jev says: it judged packages with prices not to concern the offer (0.44, 2026-11-20).
  const tokens = (x: unknown) =>
    new Set(
      JSON.stringify(x)
        .toLowerCase()
        .match(/[£$€]?\d[\d,.:]*|\p{L}{4,}/gu) ?? [],
    )
  const said = tokens(request)
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
    if (asked(k)) continue
    const old = before[k]
    ;(out as Record<string, unknown>)[k] = renamed
      ? JSON.parse(JSON.stringify(old).split(before.name).join(after.name))
      : old
  }
  // Parts the writer left alone may still carry the old name.
  return renamed
    ? {
        ...(JSON.parse(JSON.stringify(out).split(before.name).join(after.name)) as SiteCopy),
        name: after.name,
      }
    : out
}

export type EditOutcome = { restart: true } | { restart: false; result: BuildResult }

export async function edit(
  state: SiteState,
  request: string,
  onStep: (s: BuildStep) => void = () => {},
  onPhotos?: (p: PhotoResult | null) => void,
): Promise<EditOutcome> {
  const t0 = performance.now()
  const env = getEnv()
  const decide = env.TYPESAFE_API_KEY
    ? typesafeDecisions({ apiKey: env.TYPESAFE_API_KEY })
    : randomDecisions(request)
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
  const sure = (id: string) => (/^asks:(sections|look)$/.test(id) ? 0.75 : 0.5)
  const yes = (id: string) => {
    const a = r.answers.get(id)
    return a?.kind === 'bool' && a.pTrue > sure(id)
  }
  const top = (id: string) => {
    const a = r.answers.get(id)
    return a?.kind === 'choice' ? a : null
  }
  if (yes('asks:restart')) return { restart: true }

  const next: SiteState = { ...state, words: `${state.words}\n${request}` }
  const changed: string[] = []
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
    const extras = EXTRAS.filter((x) => yes(`has:${x}`))
    if ([...extras].sort().join() !== [...state.extras].sort().join()) {
      next.extras = extras
      changed.push('the parts of the page')
    }
  }
  if (yes('asks:words') && rewritten) {
    const w = await rewritten
    if (w.copy) {
      // The photo searches stay unless new photos are asked for: changing them would not change
      // the photos already shown.
      let copy = await keepAsked(
        decide,
        state.copy,
        { ...w.copy, photos: state.copy.photos },
        request,
      )
      // Questions, offer items, reasons or steps the edit changed get the same check as a new
      // site's (docs/m0/19, 23): an edit once added "up to four hours" to a package.
      const moved = (['faq', 'offer', 'reasons', 'steps'] as const).some(
        (k) => JSON.stringify(copy[k]) !== JSON.stringify(state.copy[k]),
      )
      if (moved) copy = (await groundAnswers(decide, next.words, copy)).copy
      // Fewer than three steps or needs is no section: keep the earlier ones instead of a stub.
      if (copy.steps.items.length < 3) copy = { ...copy, steps: state.copy.steps }
      if (copy.audience.items.length < 3) copy = { ...copy, audience: state.copy.audience }
      if (JSON.stringify(copy) === JSON.stringify(state.copy))
        already.push('the words already say that')
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

  // New photos: new searches from the request, and the photo step again.
  let photoJob: BuildResult['photoJob'] = null
  if (yes('asks:photos') && env.OPENROUTER_API_KEY) {
    const q = await writePhotoQueries({
      apiKey: env.OPENROUTER_API_KEY,
      words: `${next.words}\nPhotos wanted now: ${request}`,
    })
    if (q) {
      next.copy = { ...next.copy, photos: q.queries }
      next.seed = `${state.seed}-${Date.now() % 100000}`
      photoJob = {
        queries: q.queries,
        about: { name: next.copy.name, kind: next.copy.kind, town: next.copy.contact.place },
        seed: next.seed,
        art: next.art,
      }
      changed.push('the photos')
      if (onPhotos)
        sitePhotos(photoJob).then(
          (p) => onPhotos({ ...p, ms: Math.round(performance.now() - t0) }),
          () => onPhotos(null),
        )
    }
  }

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
      photoJob,
    },
  }
}
