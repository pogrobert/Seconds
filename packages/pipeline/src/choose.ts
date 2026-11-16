import type { BlockManifest, SIGNATURE } from '@repo/blocks/manifest'
import { FAMILIES, type FamilyId, familyAxes, M0_FAMILIES } from '@repo/blocks/themes'
import { SECTION_TYPES, type SectionTypeName } from '@repo/spec'
import type { SectionPlan, SitePlan } from './assemble.ts'
import type { Answer, Question } from './decide.ts'
import { DEFAULT_PLANS, type Kind, PHOTO_HEROES } from './defaults.ts'
import { applyRhythm, RHYTHM_NAMES, RHYTHMS, type Rhythm } from './rhythm.ts'

// The question compiler and resolver for M0 (docs/technical/03, D5 and D7, cut down).
// Code holds the default page per kind of business. The decision model adjusts it: the style and
// its settings, light or dark, the page rhythm, which photo leads, which optional sections stay,
// which section comes first, and what each section is like (its attributes). Code then picks the
// variant whose attributes best match. The model is never shown a list of variants, so the number
// of questions stays the same as the library grows.
// The same questions answered at random are arm C, so the random arm draws from the same choices.

/** What an owner tells us. The facts (hours, prices, address) come from the business record. */
export type Brief = {
  id: string
  kind: Kind
  name: string
  /** Neighbourhood and town, as the owner would say it. */
  place: string
  /** The owner's own words: what they do, for whom, how it should feel. */
  words: string
  /** The owner's brand colour. Every arm uses it. */
  color: string
}

/** A photo the business has, by its number in the business's assets and what it shows. */
export type Photo = { n: number; shows: string }

/** Everything about a site that is not in the plan: what the content needs to know. */
export type Look = { leadPhoto: number; rhythm?: Rhythm }

export const KIND_LABEL: Record<Kind, string> = {
  restaurant: 'restaurant or café',
  salon: 'hair and beauty salon',
  clinic: 'dental or medical clinic',
  trades: 'local tradesperson (plumber, electrician, roofer)',
  fitness: 'fitness, pilates or yoga studio',
}

/** What the decision model reads. Questions point into it by path. */
export function decisionState(brief: Brief) {
  return {
    business: { name: brief.name, kind: KIND_LABEL[brief.kind], place: brief.place },
    brief: brief.words,
  }
}

/* ------------------------------------------------------------------ attributes */

type Attr = keyof typeof SIGNATURE
const ATTRS: Attr[] = ['media', 'arrangement', 'emphasis', 'density', 'align']
const VALUE_TEXT: Record<Attr, Record<string, string>> = {
  media: {
    none: 'No pictures: words only.',
    image: 'One picture, or one per item.',
    gallery: 'Several pictures shown together.',
  },
  arrangement: {
    stack: 'Stacked: everything in one column, one thing under another.',
    split: 'Split: words on one side, a picture or a panel on the other.',
    overlay: 'Overlay: words laid over a large photo.',
    grid: 'Grid: several items side by side in rows.',
    list: 'List: items one under another, like a menu.',
    rows: 'Rows: wide rows, each with a picture and words.',
    steps: 'Steps: numbered steps in order.',
    table: 'Table: rows and columns, easy to compare.',
    columns: 'Columns: the information in several columns.',
    bar: 'Bar: one compact strip.',
  },
  emphasis: {
    type: 'The words lead: large type, little or no picture.',
    image: 'The picture leads: large photos, few words.',
    balanced: 'Words and pictures share the space equally.',
  },
  density: {
    airy: 'Airy: lots of space and few things visible at once. Calm.',
    regular: 'Regular: a balance of space and content.',
    compact: 'Compact: dense, with a lot of information visible at once.',
  },
  align: {
    start: 'Aligned to the left edge.',
    center: 'Centred: formal and symmetrical.',
  },
}
const ATTR_PROMPT: Record<Attr, (what: string) => string> = {
  media: (w) =>
    `Given the owner's brief in \`brief\`, should ${w} on this business's website show pictures?`,
  arrangement: (w) =>
    `Given the owner's brief in \`brief\`, how should ${w} on this business's website be arranged?`,
  emphasis: (w) =>
    `Given the owner's brief in \`brief\`, what should lead in ${w} on this business's website?`,
  density: (w) =>
    `Given the owner's brief in \`brief\`, how much should ${w} on this business's website show at a glance?`,
  align: (w) =>
    `Given the owner's brief in \`brief\`, how should ${w} on this business's website be aligned?`,
}

/** A section's place on the page, stable within one kind's default plan. */
export const slotOf = (s: SectionPlan) =>
  s.navLabel ? `${s.sectionType}:${s.navLabel}` : s.sectionType

/** How a section is described to the model. */
function sectionWords(s: SectionPlan): string {
  if (s.sectionType === 'cards')
    return s.type === 'cards/steps'
      ? 'the "how it works" section (three numbered steps)'
      : s.navLabel === 'Services'
        ? 'the services section (short cards, one per service)'
        : 'the "why choose us" section (three short reasons)'
  if (s.sectionType === 'text-media') return 'the "about us" section (a paragraph and a photo)'
  const t = SECTION_TYPES[s.sectionType as SectionTypeName]
  return `the ${t.label.toLowerCase()} (${t.purpose.replace(/\.$/, '').toLowerCase()})`
}

/**
 * Rules in code: what may fill a slot before any taste is applied. A business with photos opens
 * with a photo-led banner (Robert's picks: docs/m0/04 and 05), in every arm.
 */
export function allowedVariants(
  s: SectionPlan,
  manifests: readonly BlockManifest[],
): { m: BlockManifest; variant: string }[] {
  return manifests
    .filter((m) => m.sectionType === s.sectionType)
    .flatMap((m) => Object.keys(m.variants).map((variant) => ({ m, variant })))
    .filter(
      ({ m, variant }) =>
        s.sectionType !== 'hero' ||
        (PHOTO_HEROES as readonly string[]).includes(`${m.type}#${variant}`) ||
        m.type === 'hero/photo',
    )
}

/** Sections that may be left out. The banner, prices, visit and call to action always stay. */
const OPTIONAL: readonly SectionTypeName[] = ['cards', 'text-media']
/** Sections that close a page; never moved to the top. */
const CLOSING: readonly SectionTypeName[] = ['cta', 'hours-location']

/* ------------------------------------------------------------------ compile */

export type Binding =
  | { to: 'family' }
  | { to: 'axis'; family: FamilyId; axis: 'type' | 'palette' }
  | { to: 'mode' }
  | { to: 'frame' }
  | { to: 'photo' }
  | { to: 'rhythm' }
  | { to: 'leadPhoto' }
  | { to: 'keep'; slot: string }
  | { to: 'first' }
  | { to: 'attr'; slot: string; attr: Attr }

export type Compiled = { question: Question; binding: Binding }

/** Bump when the wording of any question changes, so records can tell a wording change apart. */
export const QUESTIONS_VERSION = 2

export function compileQuestions(
  kind: Kind,
  photos: Photo[],
  manifests: readonly BlockManifest[],
): Compiled[] {
  const out: Compiled[] = []
  const add = (binding: Binding, question: Question) => out.push({ question, binding })
  const fam = (f: FamilyId) => FAMILIES[f]

  add(
    { to: 'family' },
    {
      kind: 'choice',
      id: 'style.family',
      prompt:
        "Given the owner's brief in `brief` and the kind of business, which overall visual style suits this business's website best?",
      options: M0_FAMILIES.map((f) => ({ key: f, text: `${fam(f).label}. ${fam(f).feel}` })),
    },
  )
  // Speculative: one question per family; only the chosen family's answers are used.
  for (const f of M0_FAMILIES) {
    add(
      { to: 'axis', family: f, axis: 'type' },
      {
        kind: 'choice',
        id: `style.${f}.type`,
        prompt: `Suppose this business's website uses the ${fam(f).label} style (${fam(f).feel.replace(/\.$/, '')}). Given the owner's brief in \`brief\`, which typeface suits it best?`,
        options: Object.entries(fam(f).pairings).map(([key, p]) => ({
          key,
          text: `${p.label}. ${p.feel}`,
        })),
      },
    )
    add(
      { to: 'axis', family: f, axis: 'palette' },
      {
        kind: 'choice',
        id: `style.${f}.palette`,
        prompt: `Suppose this business's website uses the ${fam(f).label} style. Given the owner's brief in \`brief\`, which page background suits it best?`,
        options: Object.entries(fam(f).palettes).map(([key, p]) => ({
          key,
          text: `${p.label}.`,
        })),
      },
    )
  }
  add(
    { to: 'mode' },
    {
      kind: 'choice',
      id: 'style.mode',
      prompt:
        "Given the owner's brief in `brief` and the kind of business, should this business's website be light or dark overall?",
      options: [
        { key: 'light', text: 'Light: dark text on a pale page. Open, fresh and daytime.' },
        { key: 'dark', text: 'Dark: pale text on a near-black page. Moody, dramatic and evening.' },
      ],
    },
  )
  add(
    { to: 'frame' },
    {
      kind: 'choice',
      id: 'style.frame',
      prompt:
        "Given the owner's brief in `brief`, how should the coloured sections sit on this business's website?",
      options: [
        {
          key: 'bleed',
          text: 'As full-width bands of colour from edge to edge: bold and graphic.',
        },
        {
          key: 'inset',
          text: 'As rounded panels set in from the page edge: softer and contained.',
        },
      ],
    },
  )
  add(
    { to: 'photo' },
    {
      kind: 'choice',
      id: 'style.photo',
      prompt:
        "Given the owner's brief in `brief`, how should the photos on this business's website be treated?",
      options: [
        { key: 'natural', text: 'In natural colour, as taken: warm and real.' },
        { key: 'mono', text: 'In black and white: timeless, editorial and serious.' },
        { key: 'tint', text: "Softly washed in the brand's colour: stylish and coordinated." },
      ],
    },
  )
  add(
    { to: 'rhythm' },
    {
      kind: 'choice',
      id: 'page.rhythm',
      prompt:
        "Given the owner's brief in `brief`, how should background colours change down this business's website?",
      options: RHYTHM_NAMES.map((r) => ({ key: r, text: `${RHYTHMS[r]}.` })),
    },
  )
  add(
    { to: 'leadPhoto' },
    {
      kind: 'choice',
      id: 'page.leadPhoto',
      prompt:
        "Given the owner's brief in `brief`, which of the business's photos should open the website, in the top banner?",
      options: photos.map((p) => ({ key: String(p.n), text: `A photo of ${p.shows}.` })),
    },
  )

  const base = DEFAULT_PLANS[kind]
  const middle = base.sections.slice(1)
  for (const s of middle.filter((x) => OPTIONAL.includes(x.sectionType)))
    add(
      { to: 'keep', slot: slotOf(s) },
      {
        kind: 'bool',
        id: `keep.${slotOf(s)}`,
        prompt: `Given the owner's brief in \`brief\`, would ${sectionWords(s)} help this business's website?`,
      },
    )
  add(
    { to: 'first' },
    {
      kind: 'choice',
      id: 'page.first',
      prompt:
        "Given the owner's brief in `brief`, which section should come first on this business's website, straight after the top banner?",
      // Content sections only: the call to action and the visit details belong lower down.
      options: middle
        .filter((s) => !CLOSING.includes(s.sectionType))
        .map((s) => ({ key: slotOf(s), text: `${cap(sectionWords(s))}.` })),
    },
  )

  for (const s of [...base.before, ...base.sections, ...base.after]) {
    const candidates = allowedVariants(s, manifests)
    for (const attr of ATTRS) {
      const values = [
        ...new Set(
          candidates.map(
            ({ m, variant }) => m.variants[variant]?.signature[attr] as string | undefined,
          ),
        ),
      ].filter((v): v is string => !!v)
      if (values.length < 2) continue
      add(
        { to: 'attr', slot: slotOf(s), attr },
        {
          kind: 'choice',
          id: `section.${slotOf(s)}.${attr}`,
          prompt: ATTR_PROMPT[attr](sectionWords(s)),
          options: values.map((v) => ({ key: v, text: VALUE_TEXT[attr][v] ?? v })),
        },
      )
    }
  }
  return out
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/* ------------------------------------------------------------------ resolve */

export type Decided = {
  binding: Binding
  value: string
  source: 'model' | 'default' | 'rule'
  pTop?: number
  margin?: number
}

/**
 * Answers to a plan. Missing answers take the default. `eligible` says whether a variant can show
 * the content written for this site (requires and character caps).
 */
export function resolveSite(
  kind: Kind,
  compiled: Compiled[],
  answers: Map<string, Answer>,
  manifests: readonly BlockManifest[],
  eligible: (s: SectionPlan) => boolean,
): { plan: SitePlan; look: Look; decided: Decided[] } {
  const base = DEFAULT_PLANS[kind]
  const decided: Decided[] = []
  const byBinding = (pred: (b: Binding) => boolean) => compiled.find((c) => pred(c.binding))
  const choice = (c: Compiled | undefined, fallback: string): string => {
    if (!c) return fallback
    const a = answers.get(c.question.id)
    if (a?.kind === 'choice' && a.top) {
      decided.push({
        binding: c.binding,
        value: a.top,
        source: 'model',
        pTop: a.pTop,
        margin: a.margin,
      })
      return a.top
    }
    decided.push({ binding: c.binding, value: fallback, source: 'default' })
    return fallback
  }
  const baseFamily = base.style.family.split('@')[0] as FamilyId

  const family = choice(
    byBinding((b) => b.to === 'family'),
    baseFamily,
  ) as FamilyId
  const lists = familyAxes(family)
  const axes: Record<string, string> = {
    type: choice(
      byBinding((b) => b.to === 'axis' && b.family === family && b.axis === 'type'),
      lists.type[0] as string,
    ),
    palette: choice(
      byBinding((b) => b.to === 'axis' && b.family === family && b.axis === 'palette'),
      lists.palette[0] as string,
    ),
    frame: choice(
      byBinding((b) => b.to === 'frame'),
      'bleed',
    ),
    photo: choice(
      byBinding((b) => b.to === 'photo'),
      'natural',
    ),
  }
  const mode = choice(
    byBinding((b) => b.to === 'mode'),
    'light',
  ) as 'light' | 'dark'
  const rhythm = choice(
    byBinding((b) => b.to === 'rhythm'),
    'calm',
  ) as Rhythm
  const leadPhoto = Number(
    choice(
      byBinding((b) => b.to === 'leadPhoto'),
      '1',
    ),
  )

  // Sections: drop optional ones the model clearly does not want (D7: drop when p <= 0.30), but
  // keep at least one (the likeliest), so a page never shrinks to banner, prices and visit only.
  const pKeep = new Map<string, number>()
  for (const s of base.sections.slice(1)) {
    const c = byBinding((b) => b.to === 'keep' && b.slot === slotOf(s))
    if (!c) continue
    const a = answers.get(c.question.id)
    pKeep.set(slotOf(s), a?.kind === 'bool' ? a.pTrue : 1)
  }
  const likeliest = [...pKeep.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
  let middle = base.sections.slice(1).filter((s) => {
    const p = pKeep.get(slotOf(s))
    if (p === undefined) return true
    const keep = p > 0.3 || slotOf(s) === likeliest
    const c = byBinding((b) => b.to === 'keep' && b.slot === slotOf(s)) as Compiled
    const a = answers.get(c.question.id)
    decided.push({
      binding: c.binding,
      value: String(keep),
      source: a?.kind !== 'bool' ? 'default' : keep && p <= 0.3 ? 'rule' : 'model',
      ...(a?.kind === 'bool' ? { pTop: a.pTrue } : {}),
    })
    return keep
  })
  const first = choice(
    byBinding((b) => b.to === 'first'),
    slotOf(middle[0] ?? (base.sections[0] as SectionPlan)),
  )
  const k = middle.findIndex((s) => slotOf(s) === first)
  if (k > 0) middle = [middle[k] as SectionPlan, ...middle.filter((_, i) => i !== k)]

  // Variants: the eligible variant whose attributes best match the answers, weighted by probability.
  const pickVariant = (s: SectionPlan): SectionPlan => {
    const slot = slotOf(s)
    const asked = compiled.filter((c) => c.binding.to === 'attr' && c.binding.slot === slot)
    const options = allowedVariants(s, manifests).filter(({ m, variant }) =>
      eligible({ ...s, type: m.type, variant }),
    )
    if (!options.length) {
      decided.push({
        binding: { to: 'attr', slot, attr: 'arrangement' },
        value: `${s.type}#${s.variant}`,
        source: 'rule',
      })
      return s
    }
    let best = options[0] as (typeof options)[number]
    let bestScore = -1
    for (const o of options) {
      const sig = o.m.variants[o.variant]?.signature as Record<Attr, string>
      let score = 0
      for (const c of asked) {
        if (c.binding.to !== 'attr') continue
        const a = answers.get(c.question.id)
        if (a?.kind !== 'choice') continue
        score += a.dist ? (a.dist[sig[c.binding.attr]] ?? 0) : a.top === sig[c.binding.attr] ? 1 : 0
      }
      // Ties go to the default plan's variant, then to library order.
      const isDefault = o.m.type === s.type && o.variant === s.variant
      if (score > bestScore + 1e-9 || (Math.abs(score - bestScore) < 1e-9 && isDefault)) {
        best = o
        bestScore = score
      }
    }
    for (const c of asked) {
      const a = answers.get(c.question.id)
      if (a?.kind === 'choice')
        decided.push({
          binding: c.binding,
          value: a.top,
          source: 'model',
          pTop: a.pTop,
          margin: a.margin,
        })
    }
    return { ...s, type: best.m.type, variant: best.variant }
  }

  const hero = base.sections[0] as SectionPlan
  const plan = applyRhythm(
    {
      before: base.before.map(pickVariant),
      sections: [pickVariant(hero), ...middle.map(pickVariant)],
      after: base.after.map(pickVariant),
      style: { family: `${family}@1`, axes, mode },
    },
    rhythm,
  )
  return { plan, look: { leadPhoto, rhythm }, decided }
}

/** Arm B: the code defaults, with no model. */
export function defaultSite(kind: Kind): { plan: SitePlan; look: Look } {
  return { plan: DEFAULT_PLANS[kind], look: { leadPhoto: 1 } }
}

export { RHYTHM_NAMES }
