// Picks and downloads licensed stock photos from Pixabay for the sample businesses.
// Pexels was chosen first (2026-11-14) but has paused new API keys, so Pixabay is used instead.
// Run from tools/eval:  pnpm photos            (fills slots that have no photo yet)
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
    'detail-1': 'small plates sharing food table',
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
    cta: 'electrician installing light fitting',
    'detail-1': 'electrical wiring cables close up',
    'detail-2': 'electric car charger home',
  },
  fitness: {
    hero: 'reformer pilates studio',
    about: 'pilates instructor helping client',
    cta: 'pilates class small group',
    'detail-1': 'pilates reformer close up',
    'detail-2': 'studio lockers towels',
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
}
export type Manifest = Partial<Record<Kind, Partial<Record<Slot, Photo>>>>

const dir = new URL('../photos/', import.meta.url)
const manifestUrl = new URL('manifest.json', dir)

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
  const used = new Set(
    Object.values(manifest).flatMap((k) => Object.values(k ?? {}).map((p) => p?.id)),
  )
  let requests = 0
  for (const kind of KINDS) {
    for (const slot of SLOTS) {
      const have = manifest[kind]?.[slot]
      if (!refresh && have && existsSync(new URL(have.file, dir))) continue
      const q = new URLSearchParams({
        key,
        q: QUERIES[kind][slot],
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
        console.warn(`No photo found for ${kind}/${slot} ("${QUERIES[kind][slot]}")`)
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
          alt: QUERIES[kind][slot],
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
