// Picks and downloads licensed stock photos from Pexels for the sample businesses (decided 2026-11-14).
// Run from tools/eval:  pnpm photos            (fills slots that have no photo yet)
//                       pnpm photos --refresh  (picks every slot again)
// Needs PEXELS_API_KEY in the project's .env file (never in code or chat).
//
// Pexels' licence allows storing and resizing; its API terms ask for a Pexels link and photographer
// credit, which manifest.json keeps. Its terms forbid bulk copying without permission, so this takes a
// few hand-written queries per business, not hundreds of photos. Files go to photos/ (gitignored);
// the manifest (ids and credits) is committed so anyone with a key gets the same photos.
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

type PexelsPhoto = {
  id: number
  url: string
  photographer: string
  photographer_url?: string
  alt?: string
  avg_color?: string
  width: number
  height: number
  src: { original: string }
}

async function main() {
  const key = process.env.PEXELS_API_KEY
  if (!key) {
    console.error(
      'PEXELS_API_KEY is not set. Add it to the .env file at the project root, then run again.',
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
      if (
        !refresh &&
        manifest[kind]?.[slot] &&
        existsSync(new URL(manifest[kind]?.[slot]?.file ?? '', dir))
      )
        continue
      const q = new URLSearchParams({
        query: QUERIES[kind][slot],
        orientation: 'landscape',
        per_page: '15',
      })
      const res = await fetch(`https://api.pexels.com/v1/search?${q}`, {
        headers: { Authorization: key },
      })
      requests++
      if (!res.ok) throw new Error(`Pexels search failed: ${res.status} ${res.statusText}`)
      const body = (await res.json()) as { photos: PexelsPhoto[] }
      const pick = body.photos.find((p) => !used.has(String(p.id)) && p.width >= 1600)
      if (!pick) {
        console.warn(`No photo found for ${kind}/${slot}`)
        continue
      }
      used.add(String(pick.id))
      // A web-sized copy: 1600 px wide, compressed by Pexels' own image service.
      const img = await fetch(`${pick.src.original}?auto=compress&cs=tinysrgb&w=1600`)
      if (!img.ok) throw new Error(`Download failed for ${pick.id}: ${img.status}`)
      const file = `${kind}/${slot}-${pick.id}.jpg`
      mkdirSync(new URL(`${kind}/`, dir), { recursive: true })
      writeFileSync(new URL(file, dir), Buffer.from(await img.arrayBuffer()))
      manifest[kind] = {
        ...manifest[kind],
        [slot]: {
          id: String(pick.id),
          page: pick.url,
          photographer: pick.photographer,
          ...(pick.photographer_url ? { photographerUrl: pick.photographer_url } : {}),
          alt: pick.alt?.trim() || QUERIES[kind][slot],
          ...(pick.avg_color ? { avgColor: pick.avg_color } : {}),
          width: 1600,
          height: Math.round((1600 * pick.height) / pick.width),
          file,
        },
      }
      console.log(`${kind}/${slot}: ${pick.id} by ${pick.photographer}`)
    }
  }
  mkdirSync(dir, { recursive: true })
  writeFileSync(manifestUrl, `${JSON.stringify(manifest, null, 2)}\n`)
  console.log(`Done: ${requests} searches. Credits are in photos/manifest.json.`)
}

if (import.meta.url === `file://${process.argv[1]}`) await main()
