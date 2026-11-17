// The build itself (server only: it reaches Cloudflare through env.ts). Called by the build
// page's server function (build.ts) and by POST /api/build (tools/bench).
import { SAMPLES } from '@repo/eval/businesses'
import {
  ATMOSPHERIC,
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

const asPhoto = (p: FoundPhoto) => ({ src: p.token, alt: p.alt, w: p.width, h: p.height })

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

  // 2. Photos for the business's own world.
  let photosMs = 0
  let content: Content
  let images: Record<string, string> = {}
  let credits: BuildResult['credits'] = []
  let noPhotos = false
  const found = w.copy
    ? await findPhotos(
        {
          ...(env.PIXABAY_API_KEY ? { pixabay: env.PIXABAY_API_KEY } : {}),
          ...(env.OPENROUTER_API_KEY ? { openrouter: env.OPENROUTER_API_KEY } : {}),
        },
        w.copy.photos,
        { name: w.copy.name, kind: w.copy.kind, town: w.copy.contact.place },
      )
    : null
  const n = found?.natural
  const k = found?.lowkey
  const all =
    n && k ? [...n.place, ...n.people, ...n.detail, ...k.place, ...k.people, ...k.detail] : []
  if (w.copy && found && n && k && all.length) {
    photosMs = found.ms
    images = found.images
    const first = (...xs: (FoundPhoto | undefined)[]) =>
      asPhoto(xs.find(Boolean) ?? (all[0] as FoundPhoto))
    content = contentFromCopy(
      w.copy,
      {
        hero: first(n.place[0], k.place[0], n.people[0]),
        about: first(n.people[0], n.place[1], k.people[0]),
        cta: first(n.place[1], n.place[0], k.place[0]),
        d1: first(n.detail[0], k.detail[0], n.people[1]),
        d2: first(n.detail[1], n.people[1], n.detail[0]),
      },
      {
        brand: NEUTRAL_BRAND,
        lowkey: {
          hero: first(k.place[0], n.place[0]),
          people: first(k.people[0], n.people[0]),
          detail: first(k.detail[0], n.detail[0]),
        },
      },
    )
    const seen = new Set<string>()
    credits = all.filter((p) => !seen.has(p.id) && seen.add(p.id)).map((p) => p.credit)
    if (!found.judged)
      notes.push(
        env.OPENROUTER_API_KEY
          ? 'The photo check failed twice, so these photos were not checked for fit.'
          : 'Photos were not checked for fit (no OPENROUTER_API_KEY).',
      )
  } else if (w.copy) {
    // Nothing fitting: no photos at all, never another business's (docs/m0/17-photos.md).
    photosMs = found?.ms ?? 0
    noPhotos = true
    content = sampleContent(kind, NEUTRAL_BRAND, w.copy)
    if (!env.PIXABAY_API_KEY) notes.push('No PIXABAY_API_KEY, so the page has no photos.')
    else if (found?.limited)
      notes.push(
        `Pixabay limits searches to 100 a minute and that limit was reached, so the page has no photos. Try again in a minute. (${found.limitInfo})`,
      )
    else notes.push('No photo fitted this business, so the page has none.')
  } else {
    // No words were written: the sample business, with its own photos.
    content = sampleContent(kind, NEUTRAL_BRAND, null)
  }

  // 3. Looks: three from the block library.
  const tr = performance.now()
  const cache = ruleProfiles as RuleCache
  const seed = seedOf(words)
  const atmos = pickDesigns(
    weigh(reading.profile, reading.direct, cache, content, ATMOSPHERIC),
    seed,
    3,
  )
  const open = pickDesigns(weigh(reading.profile, reading.direct, cache, content, OPEN), seed, 1)
  // The block library (docs/m0/16-block-library.md): the same colours, fonts and photo
  // treatment Jev chose, on blocks from the whole library, so the comparison is about the blocks.
  const themes = [atmos[0], atmos[1], open[0]].filter((p): p is Pick => !!p)
  const layouts = plans(seed, themes.length, content, { photos: !noPhotos })
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
    images,
    credits,
    photoSearches: w.copy ? Object.values(w.copy.photos) : [],
    ms: {
      decide: decideMs,
      text: w.ms,
      photos: photosMs,
      render: renderMs,
      total: Math.round(performance.now() - t0),
    },
    costUsd: jevUsd + w.costUsd + (found?.costUsd ?? 0),
    notes,
  }
}
