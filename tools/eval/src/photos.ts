// Picks and downloads licensed stock photos from Pixabay for the sample businesses.
// Pexels was chosen first (2026-11-14) but has paused new API keys, so Pixabay is used instead.
// Run from tools/eval:  pnpm photos            (fills slots that have no photo yet)
//                       pnpm photos --lowkey   (the low-key set, round 3)
//                       pnpm photos --refresh  (picks every slot again)
// Needs PIXABAY_API_KEY in the project's .env file (never in code or chat).
//
// Pixabay's licence allows using, copying and modifying photos commercially without attribution; its
// API terms forbid permanent hotlinking (download to your own server) and systematic mass downloads.
// So this takes a few hand-written queries per business, and every photo keeps its credit anyway.
// Files go to photos/ (gitignored); the manifest (ids and credits) is committed.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { KINDS, type Kind } from './businesses.ts'

export const SLOTS = ['hero', 'about', 'cta', 'detail-1', 'detail-2'] as const
export type Slot = (typeof SLOTS)[number]

/** What each photo should show. Plain scenes; no logos; people shown well (Pexels licence). */
export const QUERIES: Record<Kind, Record<Slot, string>> = {
  restaurant: {
    hero: 'restaurant dining room evening warm light',
    about: 'chef plating food restaurant kitchen',
    cta: 'restaurant table set for dinner',
    'detail-1': 'small plates tapas sharing dinner table',
    'detail-2': 'wine glasses bar counter',
  },
  salon: {
    hero: 'hair salon interior chairs mirrors',
    about: 'hairdresser styling hair client',
    cta: 'hair salon wash basin',
    'detail-1': 'hair colour balayage close up',
    'detail-2': 'hair styling tools brushes',
  },
  clinic: {
    hero: 'modern dental clinic treatment room',
    about: 'dentist talking with patient',
    cta: 'clinic reception waiting area',
    'detail-1': 'dental tools tray clean',
    'detail-2': 'smiling patient dental check up',
  },
  trades: {
    hero: 'electrician working on fuse box',
    about: 'electrician van tools',
    cta: 'electrician installing ceiling light',
    'detail-1': 'electrical wiring cables close up',
    'detail-2': 'electric car charger home',
  },
  fitness: {
    hero: 'reformer pilates studio',
    about: 'pilates instructor helping client',
    cta: 'pilates class indoor studio mat',
    'detail-1': 'pilates reformer close up',
    'detail-2': 'yoga mats rolled studio floor',
  },
}

/**
 * A second, low-key set per business (round 3, docs/m0/14-design-rules-3.md): atmospheric photos
 * with low, warm or coloured light on a deep ground, the look of every site Robert loved
 * (docs/research/2026-11-16-reference-library.md). Fetched with --lowkey.
 */
export const LOWKEY_SLOTS = ['lowkey-hero', 'lowkey-people', 'lowkey-detail'] as const
export type LowkeySlot = (typeof LOWKEY_SLOTS)[number]
export const LOWKEY_QUERIES: Record<Kind, Record<LowkeySlot, string>> = {
  restaurant: {
    'lowkey-hero': 'moody restaurant interior candlelight dark',
    'lowkey-people': 'chef portrait dark kitchen',
    'lowkey-detail': 'food plate dark background dramatic light',
  },
  salon: {
    'lowkey-hero': 'hair stylist hands scissors dark',
    'lowkey-people': 'hairdresser cutting hair client dark moody',
    'lowkey-detail': 'hair brush comb dark background',
  },
  clinic: {
    'lowkey-hero': 'dental clinic interior evening',
    'lowkey-people': 'woman calm portrait dark background natural light',
    'lowkey-detail': 'green leaves dark background calm',
  },
  trades: {
    'lowkey-hero': 'carpenter workshop warm light dark',
    'lowkey-people': 'craftsman working wood dark workshop',
    'lowkey-detail': 'old tools dark background',
  },
  fitness: {
    'lowkey-hero': 'gym interior dark dumbbells',
    'lowkey-people': 'athlete training dark background dramatic light',
    'lowkey-detail': 'kettlebell dark background',
  },
}

export type Photo = {
  provider: 'pixabay' | 'pexels'
  id: string
  page: string
  photographer: string
  photographerUrl?: string
  alt: string
  avgColor?: string
  width: number
  height: number
  /** Path under tools/eval/photos/. */
  file: string
  /** Light and busyness by third, from tasks/photo-tones.task.ts. */
  tone?: import('@repo/spec').Tone
}
export type Manifest = Partial<Record<Kind, Partial<Record<Slot | LowkeySlot, Photo>>>>

const dir = new URL('../photos/', import.meta.url)
const manifestUrl = new URL('manifest.json', dir)
/** Photos judged wrong by eye: never picked again. Committed with the manifest. */
const rejectedUrl = new URL('rejected.json', dir)

export const readManifest = (): Manifest =>
  existsSync(manifestUrl) ? (JSON.parse(readFileSync(manifestUrl, 'utf8')) as Manifest) : {}

type PixabayHit = {
  id: number
  pageURL: string
  user: string
  user_id: number
  tags: string
  imageWidth: number
  imageHeight: number
  /** Up to 1,280 px wide: the largest size every API account gets. */
  largeImageURL: string
}

async function main() {
  const key = process.env.PIXABAY_API_KEY
  if (!key) {
    console.error(
      'PIXABAY_API_KEY is not set. Add it to the .env file at the project root, then run again.',
    )
    process.exit(1)
  }
  const refresh = process.argv.includes('--refresh')
  const manifest = readManifest()
  // --redo kind/slot ...: reject the current photo for those slots and pick another.
  const redo = process.argv.includes('--redo')
    ? process.argv.filter((a) => /^[a-z]+\/[a-z0-9-]+$/.test(a))
    : []
  const rejected: string[] = existsSync(rejectedUrl)
    ? JSON.parse(readFileSync(rejectedUrl, 'utf8'))
    : []
  for (const r of redo) {
    const [k, sl] = r.split('/') as [Kind, Slot]
    const cur = manifest[k]?.[sl]
    if (cur) {
      rejected.push(cur.id)
      delete manifest[k]?.[sl]
    }
  }
  writeFileSync(rejectedUrl, `${JSON.stringify([...new Set(rejected)], null, 2)}\n`)
  const used = new Set([
    ...Object.values(manifest).flatMap((k) => Object.values(k ?? {}).map((p) => p?.id)),
    ...rejected,
  ])
  let requests = 0
  const lowkey = process.argv.includes('--lowkey')
  const slots: readonly (Slot | LowkeySlot)[] = lowkey ? LOWKEY_SLOTS : SLOTS
  const query = (kind: Kind, slot: Slot | LowkeySlot) =>
    lowkey ? LOWKEY_QUERIES[kind][slot as LowkeySlot] : QUERIES[kind][slot as Slot]
  for (const kind of KINDS) {
    for (const slot of slots) {
      const have = manifest[kind]?.[slot]
      if (!refresh && have && existsSync(new URL(have.file, dir))) continue
      const q = new URLSearchParams({
        key,
        q: query(kind, slot),
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: 'true',
        min_width: '1280',
        per_page: '20',
      })
      const res = await fetch(`https://pixabay.com/api/?${q}`)
      requests++
      if (!res.ok) throw new Error(`Pixabay search failed: ${res.status} ${res.statusText}`)
      const body = (await res.json()) as { hits: PixabayHit[] }
      const pick = body.hits.find((h) => !used.has(String(h.id)))
      if (!pick) {
        console.warn(`No photo found for ${kind}/${slot} ("${query(kind, slot)}")`)
        continue
      }
      used.add(String(pick.id))
      const img = await fetch(pick.largeImageURL)
      if (!img.ok) throw new Error(`Download failed for ${pick.id}: ${img.status}`)
      const file = `${kind}/${slot}-${pick.id}.jpg`
      mkdirSync(new URL(`${kind}/`, dir), { recursive: true })
      writeFileSync(new URL(file, dir), Buffer.from(await img.arrayBuffer()))
      const width = Math.min(1280, pick.imageWidth)
      manifest[kind] = {
        ...manifest[kind],
        [slot]: {
          provider: 'pixabay',
          id: String(pick.id),
          page: pick.pageURL,
          photographer: pick.user,
          photographerUrl: `https://pixabay.com/users/${encodeURIComponent(pick.user)}-${pick.user_id}/`,
          alt: query(kind, slot),
          width,
          height: Math.round((width * pick.imageHeight) / pick.imageWidth),
          file,
        },
      }
      console.log(`${kind}/${slot}: ${pick.id} by ${pick.user}`)
      // Stay far below the limit of 100 requests a minute.
      await new Promise((r) => setTimeout(r, 700))
    }
  }
  mkdirSync(dir, { recursive: true })
  writeFileSync(manifestUrl, `${JSON.stringify(manifest, null, 2)}\n`)
  console.log(`Done: ${requests} searches. Credits are in photos/manifest.json.`)
}

if (import.meta.url === `file://${process.argv[1]}`) await main()
