// The build itself (server only: it reaches Cloudflare through env.ts). Called by the build
// page's server function (build.ts) and by POST /api/build (tools/bench).

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
import {
  blockText,
  describePlan,
  LIVE,
  type Plan,
  plans,
  REGISTRY,
  renderSite,
  renderTemplate,
  type Kind as SectionKind,
  theme,
} from '@repo/library'
import {
  type DecisionPort,
  type Dist,
  EXTRAS,
  type Extra,
  groundAnswers,
  KIND_LABEL,
  KINDS,
  type Kind,
  randomDecisions,
  type SiteCopy,
  typesafeDecisions,
  writePhotoQueries,
  writeSiteCopy,
} from '@repo/pipeline'
import libraryCss from '../generated/library.css?raw'
import { ART_STRENGTHS, ART_STYLES, type ArtStrength, type ArtStyle } from './art'
import { getEnv } from './env'
import { type FoundPhoto, findPhotos } from './photos'

// The build page's one server call, for any kind of business (docs/m0/15-any-business.md).
// 1. In parallel: the decision model reads the words (five scales and a direct pick in every layer
//    of design rules); the text model writes the whole page from the owner's words alone,
//    including three photo searches for the business's own world.
// 2. Live stock photos for those searches, natural and low-key (Pixabay).
// 3. Code draws three looks from the block library (docs/m0/16-block-library.md), in neutral
//    colours, with the type and photo treatment the reading chose. Switching needs no new call.
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

/** The photo step's answer: each slot token's image, by id, so a photo used twice is sent once. */
export type PhotoResult = {
  slots: Record<string, string>
  images: Record<string, string>
  credits: { photographer: string; page: string }[]
  notes: string[]
  ms: number
  costUsd: number
  /** How many spaces got drawn art (Surfaces) because no photo fitted. */
  art: number
}
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

/** What each section kind is, for Jev's question about its blocks. */
const SECTION_NAMES: Partial<Record<SectionKind, string>> = {
  header: 'the menu bar at the top',
  hero: 'the opening screen',
  about: 'the introduction',
  offer: 'the list of what it offers',
  reasons: 'the reasons to choose it',
  gallery: 'the photo gallery',
  statement: 'the one large line of what it stands for',
  steps: 'how a first visit or a job goes, step by step',
  audience: 'the needs it meets',
  faq: 'the questions people ask',
  contact: 'the hours, address and contact details',
  cta: 'the closing call to action',
  footer: 'the footer',
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
 * (docs/m0/23-jev-does-more.md): the block for every section (it reads each block's one-line
 * look) and the one or two extra sections visitors need most.
 */
async function pickParts(
  port: DecisionPort,
  words: string,
): Promise<{
  weights: Partial<Record<SectionKind, Dist>>
  extras: Extra[]
  /** Template ids, best fit first (docs/m0/24-templates.md). */
  templates: string[]
  costUsd: number
}> {
  const kinds = Object.keys(SECTION_NAMES) as SectionKind[]
  const res = await port.decide({ brief: words }, [
    ...kinds.map((k) => ({
      kind: 'choice' as const,
      id: `block:${k}`,
      prompt: `On this organisation's website, which design for ${SECTION_NAMES[k]} would suit it, its mood and its visitors best?`,
      options: REGISTRY.filter((e) => e.kind === k).map((e) => ({ key: e.id, text: blockText(e) })),
    })),
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
  const weights: Partial<Record<SectionKind, Dist>> = {}
  for (const k of kinds) {
    const a = res.answers.get(`block:${k}`)
    if (a?.kind === 'choice') weights[k] = a.dist ?? { [a.top]: 1 }
  }
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
    weights,
    extras,
    templates,
    costUsd: res.calls.reduce((s, c) => s + (c.costUsd ?? 0), 0),
  }
}

/** The nearest of the sample kinds, only for falling back to sample photos and words. */
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
 * The quiet colour rules only (Robert, 2026-11-17: tinted grounds and loud brand colours looked
 * cheap): a warm cream page with the colour on buttons and bands, or a near-black page.
 */
/** Whole-page templates instead of pages drawn block by block (docs/m0/24-templates.md). */
const USE_TEMPLATES = true
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
    {
      brand,
      lowkey: {
        hero: slot('lkhero', q.place),
        people: slot('lkpeople', q.people),
        detail: slot('lkdetail', q.detail),
      },
    },
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
  extras: Extra[]
  art: { style: ArtStyle; strength: ArtStrength }
  seed: string
  /** The photo ids the page shows, set by the build page when the photos arrive. */
  shown?: string[]
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
    .map((tpl, i) => ({
      id: `b${i + 1}`,
      label: tpl.label,
      rules: `${tpl.label} template · ${type.label} type · ${state.brandName || 'neutral'} · ${state.extras.join(', ') || 'no extras'}${tpl.dark ? ' · night ·' : ''}`,
      html: darkTokens(renderTemplate(content, tpl.id, t, state.extras), tpl.dark),
    }))
}

/** One build from the owner's messages. Used by the build page and by /api/build (tools/bench). */
/** A step of the build finishing, for the build page's live progress (routes/api/build-stream.ts). */
export type BuildStep = { step: 'choices' | 'words' | 'check'; ms: number }

export async function build(
  messages: string[],
  onStep: (s: BuildStep) => void = () => {},
  opts: {
    /**
     * When given, the photo step starts here as soon as the photo searches are known (about 1 s
     * in, docs/m0/26-speed.md), runs alongside the words, and its result is handed over when ready
     * (null if it failed). Its `ms` is then the time since the build began. Without it (the bench,
     * the server function) the caller runs the photo step after the page, as before.
     */
    onPhotos?: (p: PhotoResult | null) => void
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
    nearestKind(decide, words),
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
        const a = d.r[2]
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
        const p = await sitePhotos(job)
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
  const [reading, kind, art, parts] = r
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
    // No words were written: the sample business, with its own photos.
    content = sampleContent(kind, NEUTRAL_BRAND, null)
  }

  // 3. Looks: three from the block library.
  const tr = performance.now()
  const cache = ruleProfiles as RuleCache
  const seed = seedOf(words)
  // Three of Jev's free picks (the open direction). The dark, low-key atmospheric direction from
  // Robert's reference picks lost every time on real briefs: "blocks 3 were better on each run"
  // (2026-11-17), and Blocks 3 was the only free pick (light and natural photos, 28 of 30).
  const themes = pickDesigns(
    weigh(reading.profile, reading.direct, cache, content, QUIET),
    seed,
    3,
  ).filter((p): p is Pick => !!p)
  // Jev's blocks and the one or two extra sections it picked (docs/m0/23-jev-does-more.md).
  const layouts = plans(seed, themes.length, content, {
    weights: parts.weights,
    ...(parts.extras.length ? { extras: parts.extras as SectionKind[] } : {}),
  })
  // Whole-page templates (docs/m0/24-templates.md): each version is one template, in Jev's type
  // and colour, with Jev's extra sections. The block-by-block pages remain below, unused.
  const best = design(themes[0] as Pick)
  const tplTheme = theme(COLOUR_CREAM.palette(content.brand), best.type)
  const extrasOf = parts.extras
  // The three templates Jev rates best for this business, best first.
  const chosenTemplates = parts.templates
    .slice(0, 3)
    .map((id) => LIVE.find((t) => t.id === id))
    .filter((t): t is (typeof LIVE)[number] => !!t)
  const state: SiteState | null = w.copy
    ? {
        words,
        copy: w.copy,
        brand: art.brand,
        brandName: art.brandName,
        type: best.type.key,
        templates: chosenTemplates.map((t) => t.id),
        extras: extrasOf,
        art: { style: art.style, strength: art.strength },
        seed,
      }
    : null
  const fromTemplates: BuiltSite[] = state
    ? drawTemplates(state, content)
    : chosenTemplates.map((tpl, i) => ({
        id: `b${i + 1}`,
        label: tpl.label,
        rules: `${tpl.label} template · ${best.type.label} type · neutral · ${extrasOf.join(', ') || 'no extras'}${tpl.dark ? ' · night ·' : ''}`,
        html: darkTokens(renderTemplate(content, tpl.id, tplTheme, extrasOf), tpl.dark),
      }))
  const fromBlocks: BuiltSite[] = themes.map((p, i) => {
    const d = design(p)
    const plan = layouts[i] as Plan
    const k = d.photo?.lowkey ? content.lowkey : undefined
    const c: Content = k
      ? {
          ...content,
          photos:
            d.photo?.lead === 'people'
              ? { ...content.photos, hero: k.people, about: k.hero, d1: k.detail }
              : { ...content.photos, hero: k.hero, about: k.people, d1: k.detail },
        }
      : content
    return {
      id: `b${i + 1}`,
      label: `Blocks ${i + 1}`,
      rules: `${describePlan(plan)} · ${d.type.label} type · ${art.brandName || 'neutral'} ${d.colour.label.toLowerCase()} · ${d.photo?.label ?? 'Natural'} photos`,
      // A dark version gets its own photo tokens, so drawn art comes in Surfaces' dark theme there.
      html: darkTokens(
        renderSite(c, plan, theme(d.colour.palette(content.brand), d.type), {
          css: libraryCss,
          grade: !!d.photo?.lowkey,
        }),
        theme(d.colour.palette(content.brand), d.type).dark,
      ),
    }
  })
  const blocks = USE_TEMPLATES ? fromTemplates : fromBlocks
  const renderMs = Math.round(performance.now() - tr)
  // Jev picks the version to show first from what makes each one look different: its opening,
  // type and colour (docs/m0/23-jev-does-more.md). The others keep their order.
  const to = performance.now()
  const looks = (USE_TEMPLATES ? [] : themes).map((p, i) => {
    const d = design(p)
    const hero = REGISTRY.find((e) => e.id === layouts[i]?.hero)
    return `Opening: ${hero ? blockText(hero) : 'plain'}. Type: ${d.type.text}. Colour: ${art.brandName} on ${d.colour.text}.`
  })
  const first = USE_TEMPLATES
    ? { i: 0, costUsd: 0 }
    : await decide
        .decide({ brief: words }, [
          {
            kind: 'choice',
            id: 'first',
            prompt:
              "Three versions of this organisation's website were made. Which would its owner and its visitors like best?",
            options: (USE_TEMPLATES ? LIVE.map((t) => t.text) : looks).map((text, i) => ({
              key: String(i),
              text,
            })),
          },
        ])
        .then((r) => {
          const a = r.answers.get('first')
          return {
            i: a?.kind === 'choice' ? Number(a.top) || 0 : 0,
            costUsd: r.calls.reduce((t, c) => t + (c.costUsd ?? 0), 0),
          }
        })
        .catch(() => ({ i: 0, costUsd: 0 }))
  const ordered = [blocks[first.i], ...blocks.filter((_, i) => i !== first.i)].filter(
    (x): x is BuiltSite => !!x,
  )
  const sites = ordered.map((x, i) => ({
    ...x,
    id: `b${i + 1}`,
    label: x.label.startsWith('Blocks') ? `Blocks ${i + 1}` : x.label,
  }))
  const orderMs = Math.round(performance.now() - to)
  const jevUsd =
    [...reading.calls, ...(grounded?.calls ?? [])].reduce((s, c) => s + (c.costUsd ?? 0), 0) +
    parts.costUsd +
    first.costUsd
  return {
    state,
    name: content.name,
    kindLabel: w.copy?.kind || KIND_LABEL[kind],
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
      order: orderMs,
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
  lkhero: 'place',
  lkpeople: 'people',
  lkdetail: 'detail',
} as const

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
 * The photo step: finds and checks photos for the page's spaces (photos.ts). A space no photo
 * fits gets drawn art from Surfaces instead: never another business's photo, never unchecked.
 */
export async function sitePhotos(job: PhotoJob): Promise<PhotoResult> {
  const t0 = performance.now()
  const env = getEnv()
  const notes: string[] = []
  const empty = { place: [], people: [], detail: [] }
  const found = job.none
    ? {
        natural: empty,
        lowkey: empty,
        images: {},
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
  const k = found.lowkey
  // Each space a photo no other space shows (Robert, 2026-11-20: "repeating images"); a space
  // with no fresh photo left gets its own drawn art. The low-key spaces may repeat: a page shows
  // either those or the natural ones.
  const taken = new Set<string>()
  const pick = (...xs: (FoundPhoto | undefined)[]) => {
    const p = xs.find((x) => x && !taken.has(x.id))
    if (p) taken.add(p.id)
    return p
  }
  const any = (...xs: (FoundPhoto | undefined)[]) => xs.find(Boolean)
  const chosen: Record<keyof typeof SLOTS, FoundPhoto | undefined> = {
    hero: pick(n.place[0], k.place[0], n.people[0], ...n.place),
    about: pick(n.people[0], n.place[1], k.people[0], ...n.people, ...n.place),
    d1: pick(n.detail[0], k.detail[0], n.detail[1], ...n.detail, ...n.people),
    d2: pick(n.detail[1], n.people[1], n.detail[2], ...n.detail, ...n.people, ...n.place),
    cta: pick(n.place[1], n.place[2], k.place[1], n.people[2], ...n.place, ...n.people),
    lkhero: any(k.place[0], n.place[0]),
    lkpeople: any(k.people[0], n.people[0]),
    lkdetail: any(k.detail[0], n.detail[0]),
  }
  const slots: Record<string, string> = {}
  const images: Record<string, string> = {}
  let art = 0
  for (const [slot, subject] of Object.entries(SLOTS) as [keyof typeof SLOTS, string][]) {
    const p = chosen[slot]
    if (p && found.images[p.id]) {
      // A photo is the same in light and dark versions.
      slots[slot] = p.id
      slots[`${slot}dk`] = p.id
      images[p.id] = found.images[p.id] ?? ''
      continue
    }
    // Drawn art in Jev's style and colour strength, in each version's own theme; the same for
    // the same business every time.
    for (const dark of [false, true]) {
      // One drawing per space, so two spaces never show the same art.
      const id = `art${slot}${dark ? 'dk' : ''}`
      if (!images[id]) {
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
        images[id] =
          `data:image/svg+xml;base64,${btoa(String.fromCharCode(...new TextEncoder().encode(svg)))}`
      }
      slots[`${slot}${dark ? 'dk' : ''}`] = id
    }
    if (!slot.startsWith('lk')) art++
  }
  const used = new Set(Object.values(slots))
  const seen = new Set<string>()
  const credits = [...n.place, ...n.people, ...n.detail, ...k.place, ...k.people, ...k.detail]
    .filter((p) => used.has(p.id) && !seen.has(p.id) && seen.add(p.id))
    .map((p) => p.credit)
  if (art && !job.none) {
    if (!env.PIXABAY_API_KEY) notes.push('No PIXABAY_API_KEY, so the photo spaces show drawn art.')
    else if (found.limited)
      notes.push(
        `Pixabay refused the searches, so ${art} photo spaces show drawn art. Try again in a minute. (${found.limitInfo})`,
      )
    else notes.push(`No photo fitted ${art} of the photo spaces, so they show drawn art.`)
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
    ms: Math.round(performance.now() - t0),
    costUsd: found.costUsd,
    art,
  }
}
