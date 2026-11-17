// The build itself (server only: it reaches Cloudflare through env.ts). Called by the build
// page's server function (build.ts) and by POST /api/build (tools/bench).

import { generate, toSvg } from '@pogrobert/surfaces'
import { SAMPLES } from '@repo/eval/businesses'
import {
  design,
  OPEN,
  type Pick,
  pickDesigns,
  type RuleCache,
  readBrief,
  weigh,
} from '@repo/eval/grammar/choose'
import { type Content, contentFromCopy, contentOf } from '@repo/eval/grammar/page'
import ruleProfiles from '@repo/eval/grammar/rule-profiles.json'
import photoManifest from '@repo/eval/photos/manifest.json'
import { describePlan, type Plan, plans, renderSite, theme } from '@repo/library'
import {
  type DecisionPort,
  KIND_LABEL,
  KINDS,
  type Kind,
  randomDecisions,
  type SiteCopy,
  typesafeDecisions,
  writeSiteCopy,
} from '@repo/pipeline'
import libraryCss from '../generated/library.css?raw'
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
  name: string
  kindLabel: string
  suggested: string
  sites: BuiltSite[]
  /** Photo id → data: URI; the page swaps each `__IMG_id__` token for a local link. */
  images: Record<string, string>
  credits: { photographer: string; page: string }[]
  /** The photo searches the words asked for. */
  photoSearches: string[]
  ms: { decide: number; text: number; photos: number; render: number; total: number }
  costUsd: number
  notes: string[]
  /** The photo step to run next; null when the page already has its photos (the sample). */
  photoJob: PhotoJob | null
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

/** Sites are neutral (theme.ts); the rules still want a brand colour, so they get near-black. */
const NEUTRAL_BRAND = '#171717'

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

/** One build from the owner's messages. Used by the build page and by /api/build (tools/bench). */
export async function build(messages: string[]): Promise<BuildResult> {
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
  ]).then((r) => ({ r, ms: Math.round(performance.now() - td) }))
  const written = env.OPENROUTER_API_KEY
    ? writeSiteCopy({ apiKey: env.OPENROUTER_API_KEY, words })
    : Promise.resolve({
        copy: null as SiteCopy | null,
        problems: ['no OPENROUTER_API_KEY'],
        ms: 0,
        costUsd: 0,
      })
  const [{ r, ms: decideMs }, w] = await Promise.all([decided, written])
  const [reading, kind] = r
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
    const slot = (id: string, alt: string) => ({ src: `__IMG_${id}__`, alt, w: 1280, h: 853 })
    content = contentFromCopy(
      w.copy,
      {
        hero: slot('hero', q.place),
        about: slot('about', q.people),
        cta: slot('cta', q.place),
        d1: slot('d1', q.detail),
        d2: slot('d2', q.detail),
      },
      {
        brand: NEUTRAL_BRAND,
        lowkey: {
          hero: slot('lkhero', q.place),
          people: slot('lkpeople', q.people),
          detail: slot('lkdetail', q.detail),
        },
      },
    )
    photoJob = {
      queries: q,
      about: { name: w.copy.name, kind: w.copy.kind, town: w.copy.contact.place },
      seed: seedOf(words),
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
    weigh(reading.profile, reading.direct, cache, content, OPEN),
    seed,
    3,
  ).filter((p): p is Pick => !!p)
  const layouts = plans(seed, themes.length, content)
  const blocks: BuiltSite[] = themes.map((p, i) => {
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
      rules: `${describePlan(plan)} · ${d.type.label} type · neutral ${theme(d.colour.palette(content.brand), d.type).dark ? 'dark' : 'light'} · ${d.photo?.label ?? 'Natural'} photos`,
      html: renderSite(c, plan, theme(d.colour.palette(content.brand), d.type), {
        css: libraryCss,
        grade: !!d.photo?.lowkey,
      }),
    }
  })
  const sites = blocks
  const renderMs = Math.round(performance.now() - tr)
  const jevUsd = reading.calls.reduce((s, c) => s + (c.costUsd ?? 0), 0)
  return {
    name: content.name,
    kindLabel: w.copy?.kind || KIND_LABEL[kind],
    suggested: sites[0]?.id ?? 'b1',
    sites,
    images: {},
    credits: [],
    photoSearches: w.copy ? Object.values(w.copy.photos) : [],
    ms: {
      decide: decideMs,
      text: w.ms,
      photos: 0,
      render: renderMs,
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
function artColour(seed: string) {
  let h = 0
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  const hue = h % 360
  const [s, l] = [0.16, 0.46]
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
  const found = await findPhotos(
    {
      ...(env.PIXABAY_API_KEY ? { pixabay: env.PIXABAY_API_KEY } : {}),
      ...(env.OPENROUTER_API_KEY ? { openrouter: env.OPENROUTER_API_KEY } : {}),
    },
    job.queries,
    job.about,
  )
  const n = found.natural
  const k = found.lowkey
  const pick = (...xs: (FoundPhoto | undefined)[]) => xs.find(Boolean)
  const chosen: Record<keyof typeof SLOTS, FoundPhoto | undefined> = {
    hero: pick(n.place[0], k.place[0], n.people[0]),
    about: pick(n.people[0], n.place[1], k.people[0], n.place[0]),
    cta: pick(n.place[1], n.place[0], k.place[0], n.people[1]),
    d1: pick(n.detail[0], k.detail[0], n.people[1], n.detail[1]),
    d2: pick(n.detail[1], n.people[1], n.detail[0]),
    lkhero: pick(k.place[0], n.place[0]),
    lkpeople: pick(k.people[0], n.people[0]),
    lkdetail: pick(k.detail[0], n.detail[0]),
  }
  const slots: Record<string, string> = {}
  const images: Record<string, string> = {}
  let art = 0
  for (const [slot, subject] of Object.entries(SLOTS) as [keyof typeof SLOTS, string][]) {
    const p = chosen[slot]
    if (p && found.images[p.id]) {
      slots[slot] = p.id
      images[p.id] = found.images[p.id] ?? ''
      continue
    }
    // Drawn art in a quiet colour, the same for the same business every time.
    const id = `art${subject}`
    if (!images[id]) {
      const svg = toSvg(
        generate({
          style: 'underpaint',
          seed: `${job.seed}-${subject}`,
          color: artColour(job.seed),
          width: 1200,
          height: 800,
          mood: 'calm',
        }),
      )
      images[id] =
        `data:image/svg+xml;base64,${btoa(String.fromCharCode(...new TextEncoder().encode(svg)))}`
    }
    slots[slot] = id
    if (!slot.startsWith('lk')) art++
  }
  const used = new Set(Object.values(slots))
  const seen = new Set<string>()
  const credits = [...n.place, ...n.people, ...n.detail, ...k.place, ...k.people, ...k.detail]
    .filter((p) => used.has(p.id) && !seen.has(p.id) && seen.add(p.id))
    .map((p) => p.credit)
  if (art) {
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
