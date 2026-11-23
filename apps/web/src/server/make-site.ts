// The build itself (server only: it reaches Cloudflare through env.ts). Called by
// routes/api/build-stream.ts for the build page and by POST /api/build (tools/bench).

import { catalog, generate, toSvg } from '@pogrobert/surfaces'
import { SAMPLES } from '@repo/eval/businesses'
import {
  design,
  type Pick,
  pickDesigns,
  type RuleCache,
  readBrief,
  weigh,
} from '@repo/eval/grammar/choose'
import { COLOUR_RULES, NAMED_COLOURS } from '@repo/eval/grammar/colour-rules'
import { type Content, contentFromCopy, contentOf } from '@repo/eval/grammar/page'
import ruleProfiles from '@repo/eval/grammar/rule-profiles.json'
import { TYPE_RULES } from '@repo/eval/grammar/type-rules'
import photoManifest from '@repo/eval/photos/manifest.json'
import { LIVE, renderTemplate, theme, variantsOf } from '@repo/library'
import {
  type DecisionPort,
  EXTRAS,
  type Extra,
  groundAnswers,
  KIND_LABEL,
  KINDS,
  type Kind,
  randomDecisions,
  rng,
  type SiteCopy,
  typesafeDecisions,
  writePhotoQueries,
  writeSiteCopy,
} from '@repo/pipeline'
import { ART_STRENGTHS, ART_STYLES, type ArtStrength, type ArtStyle } from './art'
import { getEnv } from './env'
import { fetchPhoto, photoLink } from './photo-store'
import { type FoundPhoto, findPhotos, toDataUri } from './photos'

// One build, for any kind of organisation (docs/m0/15-any-business.md):
// 1. In parallel: the decision model (Jev) picks the art, colour, three templates, extra
//    sections and lettering; the text model writes the whole page from the owner's words alone,
//    including three photo searches for the organisation's own world.
// 2. Jev checks the answers against the owner's words.
// 3. Code draws the three templates with a token in each photo space; the photo step (Pixabay,
//    started early) fills them when it is done (docs/m0/24-templates.md, 26-speed.md).
// Nothing is invented: prices, hours, address and contact appear only if the owner gave them.

export type BuiltSite = { id: string; label: string; rules: string; html: string }
/** What the photo step needs, handed back by the page step (docs/m0/17-photos.md). */
export type PhotoJob = {
  queries: { place: string; people: string; detail: string }
  about: { name: string; kind: string; town: string }
  seed: string
  /** Jev's pick for drawn art, where no photo fits. */
  art: { style: ArtStyle; strength: ArtStrength }
  /** Photos the page shows now, left out when the owner asks for different ones. */
  avoid?: string[]
  /** The owner asked for no photos: every space shows drawn art. */
  none?: boolean
}

/**
 * The photo step's answer: each slot token's image, by id, so a photo used twice is sent once.
 * `images` holds links: /api/photo/… for photos (photo-store.ts), data: links for drawn art.
 */
export type PhotoResult = {
  slots: Record<string, string>
  images: Record<string, string>
  /** The searches the photos were found with (an edit asking for other photos writes new ones). */
  queries?: PhotoJob['queries']
  credits: { photographer: string; page: string }[]
  notes: string[]
  ms: number
  costUsd: number
  /** How many spaces got drawn art (Surfaces) because no photo fitted. */
  art: number
}
/** One photo space ready, sent to the build page as it lands, before the whole step is done. */
export type PhotoLanded = { slots: string[]; id: string; src: string }

export type BuildResult = {
  /** What the site was made from, for editing it (docs/m0/27-editing.md); null for the sample. */
  state: SiteState | null
  /** On an edit: what was changed, in plain words. */
  changed?: string[]
  /** On an edit: the owner asked to undo it; the build page brings back the version before. */
  undo?: boolean
  /** On an edit: the reply to show instead of the usual "Changed …" (a question back). */
  reply?: string
  /** On an edit: what was asked for but already so ("the colour is already navy"). */
  already?: string[]
  name: string
  kindLabel: string
  suggested: string
  sites: BuiltSite[]
  /** Photo id → data: URI; the page swaps each `__IMG_id__` token for a local link. */
  images: Record<string, string>
  credits: { photographer: string; page: string }[]
  /** The photo searches the words asked for. */
  photoSearches: string[]
  ms: {
    decide: number
    text: number
    /** Jev's check on the answers, after the words. */
    check: number
    photos: number
    render: number
    /** Jev picking which version shows first. */
    order: number
    total: number
  }
  costUsd: number
  notes: string[]
  /** The photo step to run next; null when the page already has its photos (the sample). */
  photoJob: PhotoJob | null
}

/**
 * Jev matches drawn art and the site's colour to the business (one call, three questions). The
 * colour is a name with a mood (Jev reads names, never hex codes); code holds the values.
 */
async function pickArt(
  port: DecisionPort,
  words: string,
): Promise<PhotoJob['art'] & { brand: string; brandName: string }> {
  const looks = (st: string) => catalog.find((c) => c.style === st)?.looks ?? ''
  const res = await port.decide({ brief: words }, [
    {
      kind: 'choice',
      id: 'art',
      prompt:
        "Where no photo fits, this organisation's website shows drawn art instead. Which style suits its mood and its visitors best?",
      options: ART_STYLES.map((st) => ({ key: st, text: `${st}: ${looks(st)}` })),
    },
    {
      kind: 'choice',
      id: 'artColour',
      prompt: 'How much colour should that art have, for this organisation?',
      options: [
        { key: 'grey', text: 'Almost grey: very quiet, serious or formal.' },
        { key: 'muted', text: 'Muted: calm, with a hint of colour.' },
        { key: 'gentle', text: 'Gentle colour: warm and friendly.' },
        { key: 'clear', text: 'Clear colour: bright, lively or playful.' },
      ],
    },
    {
      kind: 'choice',
      id: 'brand',
      prompt:
        "Which one colour should this organisation's website use for its buttons, accents and colour bands, to suit its world, its mood and its visitors?",
      options: NAMED_COLOURS.map((c) => ({ key: c.key, text: `${c.key}: ${c.mood}` })),
    },
  ])
  const top = (id: string) => {
    const a = res.answers.get(id)
    return a?.kind === 'choice' ? a.top : ''
  }
  const style = (ART_STYLES as readonly string[]).includes(top('art'))
    ? (top('art') as ArtStyle)
    : 'underpaint'
  const strength = top('artColour') in ART_STRENGTHS ? (top('artColour') as ArtStrength) : 'muted'
  const named =
    NAMED_COLOURS.find((c) => c.key === top('brand')) ??
    NAMED_COLOURS.find((c) => c.key === 'forest')
  return { style, strength, brand: named?.hex ?? NEUTRAL_BRAND, brandName: named?.key ?? '' }
}

const EXTRA_TEXT: Record<Extra, string> = {
  reasons: 'Reasons to choose it, three short points.',
  steps: 'How a first visit or a job goes, in three or four steps.',
  audience: 'The needs it meets, three or four of them.',
  faq: 'Questions visitors ask, with short answers.',
  statement: 'One large line of what it stands for.',
  gallery: 'A gallery of photos of its world.',
}

/**
 * Jev picks the page's parts from the brief alone, in one request alongside the words
 * (docs/m0/23-jev-does-more.md): the templates, best fit first, and the one or two extra
 * sections visitors need most.
 */
async function pickParts(
  port: DecisionPort,
  words: string,
): Promise<{
  extras: Extra[]
  /** Template ids, best fit first (docs/m0/24-templates.md). */
  templates: string[]
  costUsd: number
}> {
  const res = await port.decide({ brief: words }, [
    {
      kind: 'choice' as const,
      id: 'template',
      prompt:
        "Which design for this organisation's whole website would its owner and its visitors like best?",
      options: LIVE.map((t) => ({ key: t.id, text: t.text })),
    },
    {
      kind: 'choice' as const,
      id: 'extras',
      prompt:
        "Besides the opening, introduction, offer and closing, which extra section would this organisation's visitors need most?",
      options: EXTRAS.map((x) => ({ key: x, text: EXTRA_TEXT[x] })),
    },
  ])
  const x = res.answers.get('extras')
  const ranked =
    x?.kind === 'choice' ? Object.entries(x.dist ?? { [x.top]: 1 }).sort((a, b) => b[1] - a[1]) : []
  // The top extra always; the second only when Jev rates it close.
  const extras = ranked
    .filter(([, p], i) => i === 0 || (i === 1 && p >= 0.2))
    .map(([key]) => key as Extra)
  const t = res.answers.get('template')
  const tdist = t?.kind === 'choice' ? (t.dist ?? { [t.top]: 1 }) : {}
  const templates = LIVE.map((x) => x.id).sort((a, b) => (tdist[b] ?? 0) - (tdist[a] ?? 0))
  return {
    extras,
    templates,
    costUsd: res.calls.reduce((s, c) => s + (c.costUsd ?? 0), 0),
  }
}

/** The nearest of the sample kinds, asked only when the words could not be written. */
async function nearestKind(port: DecisionPort, words: string): Promise<Kind> {
  const res = await port.decide({ brief: words }, [
    {
      kind: 'choice',
      id: 'kind',
      prompt: 'Which kind of business is closest to the one the brief describes?',
      options: KINDS.map((k) => ({ key: k, text: `A ${KIND_LABEL[k]}.` })),
    },
  ])
  const a = res.answers.get('kind')
  const top = a?.kind === 'choice' ? a.top : ''
  return (KINDS as readonly string[]).includes(top) ? (top as Kind) : 'salon'
}

/** The fallback brand colour, when Jev picks none (and for the sample business). */
const NEUTRAL_BRAND = '#171717'

/**
 * The quiet colour rules only (tinted grounds and loud brand colours looked
 * cheap): a warm cream page with the colour on buttons and bands, or a near-black page.
 */
const COLOUR_CREAM = COLOUR_RULES.find((r) => r.key === 'cream') as (typeof COLOUR_RULES)[number]

const QUIET = { id: 'quiet', label: 'Quiet colour', only: { colour: ['cream', 'night'] } }

const seedOf = (s: string) => {
  let h = 0
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) | 0
  return `build-${h}`
}

type Shot = { file: string; alt: string; width: number; height: number }

/** The nearest sample's photos (and its words, when none could be written). */
function sampleContent(kind: Kind, brand: string, copy: SiteCopy | null): Content {
  const sample = SAMPLES[kind]
  const photos = (photoManifest as Record<string, Record<string, Shot>>)[kind] ?? {}
  const base = contentOf(sample, photos, '/photos/', { brand })
  if (!copy) return base
  return contentFromCopy(copy, base.photos, {
    brand,
    ...(base.lowkey ? { lowkey: base.lowkey } : {}),
  })
}

const darkTokens = (html: string, dark: boolean) =>
  dark ? html.replace(/__IMG_([A-Za-z0-9]+)__/g, '__IMG_$1dk__') : html

/**
 * The page's content from the words, with a token in each photo space; the photo step (or photos
 * already found, on an edit) fills them by slot.
 */
export function contentFor(copy: SiteCopy, brand: string): Content {
  const q = copy.photos
  const slot = (id: string, alt: string) => ({ src: `__IMG_${id}__`, alt, w: 1280, h: 853 })
  return contentFromCopy(
    copy,
    {
      hero: slot('hero', q.place),
      about: slot('about', q.people),
      cta: slot('cta', q.place),
      d1: slot('d1', q.detail),
      d2: slot('d2', q.detail),
    },
    { brand },
  )
}

/** Everything a site was made from, so an edit can change one part and keep the rest. */
export type SiteState = {
  /** The owner's messages so far. */
  words: string
  copy: SiteCopy
  brand: string
  brandName: string
  /** The type rule's key. */
  type: string
  /** The three templates shown, best first. */
  templates: string[]
  /** Each version's spacing, by position (absent: standard). See `spacingFor`. */
  spacing?: Spacing[]
  extras: Extra[]
  art: { style: ArtStyle; strength: ArtStrength }
  seed: string
  /** The photo ids the page shows, set by the build page when the photos arrive. */
  shown?: string[]
}

/**
 * How roomy each version's sections are: a reviewed variant of the template's own spacing
 * (`spacingVariants`, packages/library). More looks from the same three designs; code picks them
 * from the site's seed, half of them standard, and the owner can ask for more space or less.
 */
export const SPACINGS = ['standard', 'snug', 'roomy'] as const
export type Spacing = (typeof SPACINGS)[number]
export function spacingFor(seed: string, n: number): Spacing[] {
  const r = rng(`${seed}-spacing`)
  const pool: Spacing[] = ['standard', 'standard', 'snug', 'roomy']
  return Array.from({ length: n }, () => pool[Math.floor(r() * pool.length)] ?? 'standard')
}
/** A version's spacing, when its template has that variant; otherwise standard. */
const spacingOf = (state: SiteState, i: number, id: string): Spacing => {
  const s = state.spacing?.[i] ?? 'standard'
  return s !== 'standard' && variantsOf(id).some((v) => v.id === s) ? s : 'standard'
}

/** The three versions: one template each, in the site's type and colour. */
export function drawTemplates(
  state: SiteState,
  content = contentFor(state.copy, state.brand),
): BuiltSite[] {
  const type =
    TYPE_RULES.find((t) => t.key === state.type) ?? (TYPE_RULES[0] as (typeof TYPE_RULES)[number])
  const t = theme(COLOUR_CREAM.palette(content.brand), type)
  return state.templates
    .map((id) => LIVE.find((x) => x.id === id))
    .filter((x): x is (typeof LIVE)[number] => !!x)
    .map((tpl, i) => {
      const spacing = spacingOf(state, i, tpl.id)
      return {
        id: `b${i + 1}`,
        label: tpl.label,
        rules: `${tpl.label} template · ${type.label} type · ${state.brandName || 'neutral'} · ${state.extras.join(', ') || 'no extras'} · ${spacing} spacing${tpl.dark ? ' · night ·' : ''}`,
        html: darkTokens(
          renderTemplate(
            content,
            tpl.id,
            t,
            state.extras,
            spacing === 'standard' ? undefined : spacing,
          ),
          tpl.dark,
        ),
      }
    })
}

/** A step of the build finishing, for the build page's live progress (routes/api/build-stream.ts). */
export type BuildStep = { step: 'choices' | 'words' | 'check'; ms: number }

export async function build(
  messages: string[],
  onStep: (s: BuildStep) => void = () => {},
  opts: {
    /**
     * When given, the photo step starts here as soon as the photo searches are known (about 1 s
     * in, docs/m0/26-speed.md), runs alongside the words, and its result is handed over when ready
     * (null if it failed). Its `ms` is then the time since the build began. Without it (the bench)
     * the caller runs the photo step after the page.
     */
    onPhotos?: (p: PhotoResult | null) => void
    /** Each space's photo as soon as it is ready, hero first; `onPhotos` still ends the step. */
    onPhoto?: (p: PhotoLanded) => void
  } = {},
): Promise<BuildResult> {
  const t0 = performance.now()
  const env = getEnv()
  const words = messages.join('\n')
  const notes: string[] = []
  const decide = env.TYPESAFE_API_KEY
    ? typesafeDecisions({ apiKey: env.TYPESAFE_API_KEY })
    : randomDecisions(words)
  if (!env.TYPESAFE_API_KEY) notes.push('No TYPESAFE_API_KEY: design choices are random.')

  // 1. Reading and words, in parallel.
  const td = performance.now()
  const decided = Promise.all([
    readBrief(decide, { business: 'organisation', name: '', place: '', words }),
    pickArt(decide, words),
    pickParts(decide, words),
  ]).then((r) => {
    const ms = Math.round(performance.now() - td)
    onStep({ step: 'choices', ms })
    return { r, ms }
  })
  const written = (
    env.OPENROUTER_API_KEY
      ? writeSiteCopy({ apiKey: env.OPENROUTER_API_KEY, words })
      : Promise.resolve({
          copy: null as SiteCopy | null,
          problems: ['no OPENROUTER_API_KEY'],
          ms: 0,
          costUsd: 0,
        })
  ).then((w) => {
    onStep({ step: 'words', ms: w.ms })
    return w
  })
  // The photo step, started early: a small call for the searches alone runs at the start; with
  // Jev's art pick (about 0.35 s) the photo step begins without waiting for the words. If that
  // call fails, it starts from the words' own searches instead.
  if (opts.onPhotos) {
    const onPhotos = opts.onPhotos
    const early = env.OPENROUTER_API_KEY
      ? writePhotoQueries({ apiKey: env.OPENROUTER_API_KEY, words }).catch(() => null)
      : Promise.resolve(null)
    Promise.all([early, decided])
      .then(async ([e, d]) => {
        const a = d.r[1]
        const style = { style: a.style, strength: a.strength }
        const job: PhotoJob | null = e
          ? {
              queries: e.queries,
              about: { name: 'this organisation', kind: e.kind, town: e.town },
              seed: seedOf(words),
              art: style,
            }
          : await written.then((x) =>
              x.copy
                ? {
                    queries: x.copy.photos,
                    about: { name: x.copy.name, kind: x.copy.kind, town: x.copy.contact.place },
                    seed: seedOf(words),
                    art: style,
                  }
                : null,
            )
        if (!job) return null
        const p = await sitePhotos(job, opts.onPhoto)
        return {
          ...p,
          ms: Math.round(performance.now() - t0),
          costUsd: p.costUsd + (e?.costUsd ?? 0),
        }
      })
      .then(
        (p) => onPhotos(p),
        () => onPhotos(null),
      )
  }
  const [{ r, ms: decideMs }, w] = await Promise.all([decided, written])
  const [reading, art, parts] = r
  // Jev checks each answer against the owner's words (docs/m0/19-fuller-pages.md).
  const tg = performance.now()
  const grounded = w.copy ? await groundAnswers(decide, words, w.copy) : null
  if (grounded) w.copy = grounded.copy
  const groundMs = Math.round(performance.now() - tg)
  onStep({ step: 'check', ms: groundMs })
  if (!w.copy)
    notes.push(
      `The words could not be written (${w.problems.join('; ')}); showing a sample business instead.`,
    )

  // 2. Photo spaces. The page is drawn now with a token in each space; the photo step
  // (sitePhotos) fills them afterwards, so the page shows in ~2 s instead of waiting for photos.
  let content: Content
  let photoJob: PhotoJob | null = null
  let kind: Kind | null = null
  if (w.copy) {
    const q = w.copy.photos
    content = contentFor(w.copy, art.brand)
    photoJob = {
      queries: q,
      about: { name: w.copy.name, kind: w.copy.kind, town: w.copy.contact.place },
      seed: seedOf(words),
      art: { style: art.style, strength: art.strength },
    }
  } else {
    // No words were written: the nearest sample business, with its own photos.
    kind = await nearestKind(decide, words).catch(() => 'salon' as const)
    content = sampleContent(kind, NEUTRAL_BRAND, null)
  }

  // 3. The three templates Jev rates best, in the lettering the reading chose (the design rules'
  // first pick, docs/m0/12-design-rules.md; only its type is used, the colour stays quiet).
  const tr = performance.now()
  const seed = seedOf(words)
  const themes = pickDesigns(
    weigh(reading.profile, reading.direct, ruleProfiles as RuleCache, content, QUIET),
    seed,
    3,
  ).filter((p): p is Pick => !!p)
  const type = design(themes[0] as Pick).type
  const extras = parts.extras
  const chosen = parts.templates
    .slice(0, 3)
    .map((id) => LIVE.find((t) => t.id === id))
    .filter((t): t is (typeof LIVE)[number] => !!t)
  const state: SiteState | null = w.copy
    ? {
        words,
        copy: w.copy,
        brand: art.brand,
        brandName: art.brandName,
        type: type.key,
        templates: chosen.map((t) => t.id),
        spacing: spacingFor(seed, chosen.length),
        extras,
        art: { style: art.style, strength: art.strength },
        seed,
      }
    : null
  const sites: BuiltSite[] = state
    ? drawTemplates(state, content)
    : chosen.map((tpl, i) => ({
        id: `b${i + 1}`,
        label: tpl.label,
        rules: `${tpl.label} template · ${type.label} type · neutral · ${extras.join(', ') || 'no extras'}${tpl.dark ? ' · night ·' : ''}`,
        html: darkTokens(
          renderTemplate(content, tpl.id, theme(COLOUR_CREAM.palette(content.brand), type), extras),
          tpl.dark,
        ),
      }))
  const renderMs = Math.round(performance.now() - tr)
  const jevUsd =
    [...reading.calls, ...(grounded?.calls ?? [])].reduce((s, c) => s + (c.costUsd ?? 0), 0) +
    parts.costUsd
  return {
    state,
    name: content.name,
    kindLabel: w.copy?.kind || (kind ? KIND_LABEL[kind] : 'organisation'),
    suggested: sites[0]?.id ?? 'b1',
    sites,
    images: {},
    credits: [],
    photoSearches: w.copy ? Object.values(w.copy.photos) : [],
    ms: {
      decide: decideMs,
      check: groundMs,
      text: w.ms,
      photos: 0,
      render: renderMs,
      order: 0,
      total: Math.round(performance.now() - t0),
    },
    costUsd: jevUsd + w.costUsd,
    notes,
    photoJob,
  }
}

const SLOTS = {
  hero: 'place',
  about: 'people',
  cta: 'place',
  d1: 'detail',
  d2: 'detail',
} as const
type Slot = keyof typeof SLOTS

/** The order spaces choose their photos in: each takes the best one no earlier space took. */
const PICK_ORDER: Slot[] = ['hero', 'about', 'd1', 'd2', 'cta']

/** A quiet colour for drawn art, one per business: low saturation, mid tone (neutral sites). */
function artColour(seed: string, s: number = ART_STRENGTHS.muted) {
  let h = 0
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  const hue = h % 360
  const l = 0.46
  const f = (n: number) => {
    const k = (n + hue / 30) % 12
    const c = l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1))
    return Math.round(c * 255)
      .toString(16)
      .padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

/**
 * Which photo each space shows. Each space a photo no other space shows ("repeating images"); a
 * space with no fresh photo left gets drawn art (undefined). Spares (each subject's next pick)
 * only stand in for a first choice that is missing. Only photos that `ok` accepts count (those
 * that downloaded), and they are asked about lazily, in each space's own order, so a space waits
 * only for the downloads ahead of it.
 */
async function assignPhotos(
  found: { natural: Record<string, FoundPhoto[]>; spare: Record<string, FoundPhoto[]> },
  ok: (p: FoundPhoto) => Promise<boolean>,
  onSpace: (slot: Slot, p: FoundPhoto | undefined) => void = () => {},
): Promise<Record<Slot, FoundPhoto | undefined>> {
  const n = found.natural as Record<'place' | 'people' | 'detail', FoundPhoto[]>
  const spare = found.spare as Record<'place' | 'people' | 'detail', FoundPhoto[]>
  /** The i-th photo of a list that downloaded. */
  const at = (xs: FoundPhoto[], i: number) => async () => {
    let k = 0
    for (const x of xs) if ((await ok(x)) && k++ === i) return [x]
    return []
  }
  /** Every photo of a list that downloaded. */
  const all = (xs: FoundPhoto[]) => async () => {
    const out: FoundPhoto[] = []
    for (const x of xs) if (await ok(x)) out.push(x)
    return out
  }
  const prefs: Record<Slot, (() => Promise<FoundPhoto[]>)[]> = {
    hero: [at(n.place, 0), at(spare.place, 0), at(n.people, 0), all(n.place)],
    about: [at(n.people, 0), at(n.place, 1), at(spare.people, 0), all(n.people), all(n.place)],
    d1: [at(n.detail, 0), at(spare.detail, 0), at(n.detail, 1), all(n.detail), all(n.people)],
    d2: [
      at(n.detail, 1),
      at(n.people, 1),
      at(n.detail, 2),
      all(n.detail),
      all(n.people),
      all(n.place),
    ],
    cta: [at(n.place, 1), at(n.place, 2), at(n.people, 2), all(n.place), all(n.people)],
  }
  const taken = new Set<string>()
  const chosen = {} as Record<Slot, FoundPhoto | undefined>
  for (const slot of PICK_ORDER) {
    let p: FoundPhoto | undefined
    for (const pref of prefs[slot]) {
      p = (await pref()).find((x) => !taken.has(x.id))
      if (p) break
    }
    if (p) taken.add(p.id)
    chosen[slot] = p
    onSpace(slot, p)
  }
  return chosen
}

/**
 * The photo step: finds and checks photos for the page's spaces (photos.ts). A space no photo
 * fits gets drawn art from Surfaces instead: never another business's photo, never unchecked.
 * Each space is handed to `onPhoto` as soon as its photo has downloaded, hero first, so the page
 * fills while later photos are still on their way.
 */
export async function sitePhotos(
  job: PhotoJob,
  onPhoto: (p: PhotoLanded) => void = () => {},
): Promise<PhotoResult> {
  const t0 = performance.now()
  const env = getEnv()
  const notes: string[] = []
  const empty = { place: [], people: [], detail: [] }
  const found = job.none
    ? {
        natural: empty,
        spare: empty,
        ms: 0,
        limited: false,
        limitInfo: '',
        judged: true,
        commons: 0,
        costUsd: 0,
      }
    : await findPhotos(
        {
          ...(env.PIXABAY_API_KEY ? { pixabay: env.PIXABAY_API_KEY } : {}),
          ...(env.OPENROUTER_API_KEY ? { openrouter: env.OPENROUTER_API_KEY } : {}),
        },
        job.queries,
        job.about,
        { avoid: job.avoid ?? [] },
      )
  const n = found.natural
  const spare = found.spare
  // Download only what the spaces will show if every download works, all at once, hero first;
  // a failed one sends its space down its own list, and only then is the next photo downloaded.
  const downloads = new Map<string, Promise<boolean>>()
  const ready = (p: FoundPhoto) => {
    let d = downloads.get(p.id)
    if (!d) {
      d = fetchPhoto(p.id, p.source)
      downloads.set(p.id, d)
    }
    return d
  }
  const hoped = await assignPhotos(found, async () => true)
  for (const slot of PICK_ORDER) {
    const p = hoped[slot]
    if (p) void ready(p)
  }
  const slots: Record<string, string> = {}
  const images: Record<string, string> = {}
  let art = 0
  const fill = (slot: Slot, p: FoundPhoto | undefined) => {
    if (p) {
      // A photo is the same in light and dark versions.
      images[p.id] = photoLink(p.id, p.source)
      slots[slot] = p.id
      slots[`${slot}dk`] = p.id
      onPhoto({ slots: [slot, `${slot}dk`], id: p.id, src: images[p.id] ?? '' })
      return
    }
    // Drawn art in Jev's style and colour strength, in each version's own theme; the same for
    // the same business every time.
    for (const dark of [false, true]) {
      // One drawing per space, so two spaces never show the same art.
      const id = `art${slot}${dark ? 'dk' : ''}`
      const svg = toSvg(
        generate({
          style: job.art.style,
          seed: `${job.seed}-${slot}`,
          color: artColour(job.seed, ART_STRENGTHS[job.art.strength]),
          width: 1200,
          height: 800,
          mood: 'calm',
          theme: dark ? 'dark' : 'light',
        }),
      )
      images[id] = toDataUri(new TextEncoder().encode(svg), 'image/svg+xml')
      slots[`${slot}${dark ? 'dk' : ''}`] = id
      onPhoto({ slots: [`${slot}${dark ? 'dk' : ''}`], id, src: images[id] ?? '' })
    }
    art++
  }
  await assignPhotos(found, ready, fill)
  const used = new Set(Object.values(slots))
  const seen = new Set<string>()
  const credits = [
    ...n.place,
    ...n.people,
    ...n.detail,
    ...spare.place,
    ...spare.people,
    ...spare.detail,
  ]
    .filter((p) => used.has(p.id) && !seen.has(p.id) && seen.add(p.id))
    .map((p) => p.credit)
  if (art && !job.none) {
    if (!env.PIXABAY_API_KEY) notes.push('No PIXABAY_API_KEY, so the page goes without photos.')
    else if (found.limited)
      notes.push(
        `The photo search was busy, so ${art} ${art === 1 ? 'spot goes' : 'spots go'} without a photo. Try again in a minute. (${found.limitInfo})`,
      )
    // Most templates close up a spot without a photo (pairs, galleries, strips: shared.tsx RESET);
    // a few keep a Surfaces pattern there. Said plainly to the owner (the old
    // "they show drawn art" was not what he saw).
    else
      notes.push(
        `No good photo found for ${art} ${art === 1 ? 'spot' : 'spots'}, so the page does without. Ask for different photos to try again.`,
      )
  }
  if (credits.length && !found.judged)
    notes.push(
      env.OPENROUTER_API_KEY
        ? 'The photo check failed, so these photos were not checked for fit.'
        : 'Photos were not checked for fit (no OPENROUTER_API_KEY).',
    )
  return {
    slots,
    images,
    credits,
    notes,
    queries: job.queries,
    ms: Math.round(performance.now() - t0),
    costUsd: found.costUsd,
    art,
  }
}
