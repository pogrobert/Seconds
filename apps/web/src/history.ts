// Recent sites, kept in the visitor's own browser (IndexedDB), never on a server (a reload or "Builder" in the corner used to lose the site). The ten newest are
// kept; each holds the chat, every version still reachable by undo, and the photos as files.
// Where the browser keeps nothing (a private window, storage blocked), it all just does nothing.

const DB = 'builder'
const STORE = 'sites'
export const KEEP = 10

export type SavedSite<T> = {
  id: string
  /** For the list: the site's name and what it is. */
  name: string
  kind: string
  updated: number
  /** Everything needed to show and keep editing it; shared objects stay shared. */
  data: T
  /** The photos, by the link the page used for each. */
  photos: Record<string, Blob>
}

export type SiteSummary = { id: string; name: string; kind: string; updated: number }

/**
 * A photo as stored: its bytes and type. Safari will not store a Blob in IndexedDB ("Error
 * preparing Blob/File data to be stored in object store", WebKit, 2026-11-24): every save that
 * carried photos failed, and a site reopened from Recent showed a broken image. Bytes store
 * everywhere. Sites saved before keep Blobs, read below.
 */
type StoredPhoto = { type: string; bytes: ArrayBuffer }
type Stored<T> = Omit<SavedSite<T>, 'photos'> & { photos: Record<string, StoredPhoto | Blob> }

/** A stored photo as a Blob again, or null when it cannot be read (it then stays out). */
async function toBlob(p: StoredPhoto | Blob): Promise<Blob | null> {
  try {
    if (p instanceof Blob) return new Blob([await p.arrayBuffer()], { type: p.type })
    return new Blob([p.bytes], { type: p.type })
  } catch {
    return null
  }
}

let opening: Promise<IDBDatabase | null> | null = null
function open(): Promise<IDBDatabase | null> {
  opening ??= new Promise((done) => {
    try {
      const req = indexedDB.open(DB, 1)
      req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' })
      req.onsuccess = () => done(req.result)
      req.onerror = () => done(null)
      req.onblocked = () => done(null)
    } catch {
      done(null)
    }
  })
  return opening
}

function run<R>(mode: IDBTransactionMode, work: (s: IDBObjectStore) => IDBRequest<R>) {
  return open().then(
    (db) =>
      new Promise<R | null>((done) => {
        if (!db) return done(null)
        try {
          const req = work(db.transaction(STORE, mode).objectStore(STORE))
          req.onsuccess = () => done(req.result)
          req.onerror = () => done(null)
        } catch {
          done(null)
        }
      }),
  )
}

export async function listSites(): Promise<SiteSummary[]> {
  const all = ((await run('readonly', (s) => s.getAll())) ?? []) as SavedSite<unknown>[]
  return all
    .map(({ id, name, kind, updated }) => ({ id, name, kind, updated }))
    .sort((a, b) => b.updated - a.updated)
}

export async function loadSite<T>(id: string): Promise<SavedSite<T> | null> {
  const stored = (await run('readonly', (s) => s.get(id))) as Stored<T> | undefined
  if (!stored) return null
  const photos: Record<string, Blob> = {}
  for (const [link, p] of Object.entries(stored.photos ?? {})) {
    const blob = await toBlob(p)
    if (blob) photos[link] = blob
  }
  return { ...stored, photos }
}

export async function saveSite<T>(site: SavedSite<T>) {
  const photos: Record<string, StoredPhoto> = {}
  for (const [link, blob] of Object.entries(site.photos)) {
    const bytes = await blob.arrayBuffer().catch(() => null)
    if (bytes) photos[link] = { type: blob.type, bytes }
  }
  await run('readwrite', (s) => s.put({ ...site, photos } satisfies Stored<T>))
  const old = (await listSites()).slice(KEEP)
  for (const x of old) await removeSite(x.id)
}

export async function removeSite(id: string) {
  await run('readwrite', (s) => s.delete(id))
}

/** "just now", "5 min ago", "3 h ago", "yesterday", or the date. */
export function ago(t: number, now = Date.now()) {
  const min = Math.round((now - t) / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min} min ago`
  const h = Math.round(min / 60)
  if (h < 24) return `${h} h ago`
  if (h < 48) return 'yesterday'
  return new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
