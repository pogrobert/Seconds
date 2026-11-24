// The chosen photos as files, served by GET /api/photo/:id (routes/api/photo.$id.ts). Pixabay
// forbids hotlinking, so the server downloads each photo once and the page fetches it from here as
// plain bytes: no base64 inside JSON, which made one line of the build stream several megabytes
// and had to be decoded in the browser before any photo could show.
//
// Three places hold a photo, fastest first: this worker's memory (the page usually asks the same
// worker a moment later), the Cache API (another worker in the same place), and the photo's source
// again (a cache miss elsewhere, or an old link). The source is passed in the link and only a few
// photo hosts are fetched, so the route is no open proxy.

/** Hosts the photos come from: Pixabay's download links and Wikimedia Commons' files. */
const SOURCES = [
  /^https:\/\/pixabay\.com\/get\//,
  /^https:\/\/cdn\.pixabay\.com\//,
  /^https:\/\/upload\.wikimedia\.org\//,
  // Commons' thumbnails moved here (2026-11-24): chosen Commons photos failed to download.
  /^https:\/\/thumb\.wikimedia\.org\//,
]

/** A photo's id as the photo step makes it: Pixabay's (p…) or Commons' (c…). */
const ID = /^[pc][A-Za-z0-9]{1,60}$/

// Commons asks automated clients for a descriptive User-Agent; a generic one, no personal details.
const UA = { 'user-agent': 'SecondsSiteMaker/0.1 (hobby project; small, hand-run builds)' }

type Kept = { body: ArrayBuffer; type: string }

/** The newest photos in this worker's memory: about 40 (each ~0.3–0.6 MB) stays well inside its limit. */
const recent = new Map<string, Kept>()
const KEEP = 40

/** The Cache API wants a URL for a key; this one is never fetched. */
const keyOf = (id: string) => `https://photos.builder.invalid/${id}`

async function cache(): Promise<Cache | null> {
  try {
    return typeof caches === 'undefined' ? null : await caches.open('photos')
  } catch {
    return null
  }
}

const reply = (k: Kept) =>
  new Response(k.body, {
    headers: {
      'content-type': k.type,
      // The same id is always the same photo.
      'cache-control': 'public, max-age=86400, immutable',
    },
  })

async function keep(id: string, k: Kept) {
  recent.delete(id)
  recent.set(id, k)
  while (recent.size > KEEP) {
    const oldest = recent.keys().next().value
    if (oldest === undefined) break
    recent.delete(oldest)
  }
  await (await cache())?.put(keyOf(id), reply(k)).catch(() => {})
}

async function download(source: string): Promise<Kept | null> {
  if (!SOURCES.some((s) => s.test(source))) return null
  const res = await fetch(source, { headers: UA }).catch(() => null)
  if (!res?.ok) return null
  const type = res.headers.get('content-type') ?? 'image/jpeg'
  if (!type.startsWith('image/')) return null
  return { body: await res.arrayBuffer().catch(() => new ArrayBuffer(0)), type }
}

/** The link the page fetches a photo by. */
export const photoLink = (id: string, source: string) =>
  `/api/photo/${id}?u=${encodeURIComponent(source)}`

/** Downloads a chosen photo and keeps it for its link; false when the download failed. */
export async function fetchPhoto(id: string, source: string): Promise<boolean> {
  if (recent.has(id)) return true
  const k = await download(source)
  if (!k?.body.byteLength) return false
  await keep(id, k)
  return true
}

/** The answer to GET /api/photo/:id?u=source. */
export async function servePhoto(id: string, source: string | null): Promise<Response> {
  if (!ID.test(id)) return new Response('Not found', { status: 404 })
  const mem = recent.get(id)
  if (mem) return reply(mem)
  const c = await cache()
  const hit = await c?.match(keyOf(id)).catch(() => undefined)
  if (hit) return hit
  // A miss (another place, or an old link): fetched again for this one answer and never stored.
  // Only the photo step stores a photo under its id (fetchPhoto); a link anyone can write must not,
  // or a made-up link could plant any picture under an id another visitor's page will ask for.
  const k = source ? await download(source) : null
  if (!k?.body.byteLength) return new Response('Not found', { status: 404 })
  return new Response(k.body, {
    headers: { 'content-type': k.type, 'cache-control': 'private, max-age=86400' },
  })
}
