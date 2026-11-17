// Photos for any business (docs/m0/17-photos.md). Three steps:
// 1. Candidates. Pixabay for the business's own world (place, people, detail), from searches for
//    things a camera can see. Wikimedia Commons for the town itself, when there is one: its
//    "quality images" of that town, kept only when the title or description names it.
// 2. A look. A small vision model sees every candidate and keeps only the ones that fit this
//    business, best first, plus a dark, moody one per subject for the low-key looks. It only
//    judges photos; it never makes them (Robert, 2026-11-17: no AI pictures).
// 3. Download. Pixabay forbids hotlinking, so the server downloads each chosen photo and hands it
//    to the page once; the page turns them into local blob links shared by every look.
// Nothing is borrowed: when nothing fits, the page is drawn without photos.
// Before real users: ask Pixabay about this volume (CLAUDE.md, "Test images"). Every photo keeps
// its credit, and Commons photos their licence.

export type FoundPhoto = {
  id: string
  /** Token placed in the page; the build page swaps it for a local link. */
  token: string
  alt: string
  width: number
  height: number
  credit: { photographer: string; page: string }
}
type Slots<T> = { place: T; people: T; detail: T }
export type Found = {
  natural: Slots<FoundPhoto[]>
  lowkey: Slots<FoundPhoto[]>
  /** id → data: URI, for the build page to turn into blob links. */
  images: Record<string, string>
  ms: number
  /** Pixabay refused a search for going over its rate limit (100 a minute). */
  limited: boolean
  /** How the photos were chosen, for the build page's notes. */
  judged: boolean
  commons: number
  costUsd: number
}

const SUBJECTS = ['place', 'people', 'detail'] as const
type Subject = (typeof SUBJECTS)[number]

/** A photo that might be used, from either source. */
type Candidate = {
  id: string
  /** Small version for the vision model to look at. */
  preview: string
  /** Large version to download if chosen. */
  full: string
  width: number
  height: number
  alt: string
  credit: { photographer: string; page: string }
}

/* --------------------------------------------------------------------------------- Pixabay */

type Hit = {
  id: number
  tags: string
  pageURL: string
  user: string
  imageWidth: number
  imageHeight: number
  webformatURL: string
  largeImageURL: string
}

const STOP = new Set(['a', 'an', 'the', 'of', 'in', 'on', 'at', 'and', 'with', 'for', 'to'])
const words = (s: string) =>
  s
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((w) => w.length > 2 && !STOP.has(w))

/** Hits whose tags share a word with the subject, best match first (Pixabay ranks by popularity). */
function relevant(hits: Hit[], subject: string): Hit[] {
  const want = words(subject)
  const stem = (w: string) => w.replace(/(ing|ers|er|es|s)$/, '')
  const score = (h: Hit) => {
    const tags = words(h.tags).map(stem)
    return want.filter((w) => tags.some((t) => t === stem(w) || t.includes(stem(w)))).length
  }
  return hits
    .map((h) => ({ h, s: score(h) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.h)
}

/** Recent searches, so a repeated build costs no requests (Pixabay allows 100 a minute). */
const cache = new Map<string, Hit[]>()
let limited = false

async function search(key: string, q: string): Promise<Hit[]> {
  const cached = cache.get(q)
  if (cached) return cached
  const p = new URLSearchParams({
    key,
    q: q.slice(0, 100),
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: 'true',
    min_width: '1280',
    per_page: '30',
  })
  const res = await fetch(`https://pixabay.com/api/?${p}`).catch(() => null)
  if (res?.status === 429) limited = true
  if (!res?.ok) return []
  const body = (await res.json().catch(() => null)) as { hits?: Hit[] } | null
  const hits = body?.hits ?? []
  if (cache.size > 300) cache.clear()
  cache.set(q, hits)
  return hits
}

/** The phrase, then shorter versions of it, until a search finds a few that match. */
async function pixabay(key: string, q: string, n: number): Promise<Candidate[]> {
  const ws = words(q)
  const tries = [q, ws.slice(0, 2).join(' '), ws[0] ?? q].filter(
    (t, i, all) => t && all.indexOf(t) === i,
  )
  let hits: Hit[] = []
  for (const t of tries) {
    hits = relevant(await search(key, t), q)
    if (hits.length >= 3) break
  }
  return hits.slice(0, n).map((h) => ({
    id: `p${h.id}`,
    preview: h.webformatURL.replace('_640', '_180'),
    full: h.largeImageURL,
    width: h.imageWidth,
    height: h.imageHeight,
    alt: q,
    credit: { photographer: h.user, page: h.pageURL },
  }))
}

/* ------------------------------------------------------------------------ Wikimedia Commons */

// Commons asks automated clients for a descriptive User-Agent; a generic one, no personal details.
const UA = { 'user-agent': 'BuilderSiteMaker/0.1 (hobby project; small, hand-run builds)' }
const plain = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l').toLowerCase()

/** The town's own best photos: Commons "quality images" that name the town. */
async function commons(town: string, n: number): Promise<Candidate[]> {
  const p = new URLSearchParams({
    action: 'query',
    format: 'json',
    generator: 'search',
    gsrnamespace: '6',
    gsrsearch: `${town} filetype:bitmap incategory:Quality_images`,
    gsrlimit: '20',
    prop: 'imageinfo',
    iiprop: 'url|size|mime|extmetadata',
    iiurlwidth: '240',
    origin: '*',
  })
  const res = await fetch(`https://commons.wikimedia.org/w/api.php?${p}`, { headers: UA }).catch(
    () => null,
  )
  if (!res?.ok) return []
  type Page = {
    index: number
    title: string
    imageinfo?: {
      url: string
      thumburl: string
      descriptionurl: string
      width: number
      height: number
      mime: string
      extmetadata?: Record<string, { value?: string }>
    }[]
  }
  const body = (await res.json().catch(() => null)) as { query?: { pages?: Record<string, Page> } }
  const want = plain(town).slice(0, Math.max(4, plain(town).length - 1))
  const text = (s = '') => s.replace(/<[^>]+>/g, '').trim()
  return Object.values(body?.query?.pages ?? {})
    .sort((a, b) => a.index - b.index)
    .flatMap((pg) => {
      const i = pg.imageinfo?.[0]
      const m = i?.extmetadata ?? {}
      const about = plain(`${pg.title} ${text(m.ImageDescription?.value)}`)
      if (!i || i.mime !== 'image/jpeg' || i.width < 1600 || i.width < i.height * 1.2) return []
      if (!about.includes(want)) return []
      const artist = text(m.Artist?.value).slice(0, 60) || 'Wikimedia Commons'
      const licence = text(m.LicenseShortName?.value)
      return [
        {
          id: `c${pg.title.replace(/[^A-Za-z0-9]+/g, '').slice(4, 40)}`,
          preview: i.thumburl,
          full: i.thumburl.replace(/\/240px-/, '/1600px-'),
          width: 1600,
          height: Math.round((1600 * i.height) / i.width),
          alt: pg.title.replace(/^File:|\.\w+$/g, ''),
          credit: {
            photographer: licence ? `${artist} (${licence})` : artist,
            page: i.descriptionurl,
          },
        },
      ]
    })
    .slice(0, n)
}

/* ---------------------------------------------------------------------------- The look */

type Choice = Slots<string[]> & { dark: Slots<string>; townFits: boolean }

/**
 * One call: the vision model sees every candidate, numbered, and keeps only those that fit.
 * Measured 2026-11-17: about $0.0007 and 2–4 s a build with gemini-2.5-flash-lite (3.1 flash lite
 * chose as well but took 5–21 s and $0.006).
 */
async function judge(
  apiKey: string,
  about: { name: string; kind: string; town: string },
  pools: Slots<Candidate[]>,
  model: string,
): Promise<{ choice: Choice | null; costUsd: number }> {
  // Small copies go inside the request: letting the provider fetch ~30 links took ~5 s.
  const inline = new Map<string, string>()
  await Promise.all(
    SUBJECTS.flatMap((s) => pools[s]).map(async (c) => {
      const res = await fetch(c.preview, { headers: UA }).catch(() => null)
      if (res?.ok) inline.set(c.id, toDataUri(await res.arrayBuffer(), 'image/jpeg'))
    }),
  )
  const all = SUBJECTS.flatMap((s) =>
    pools[s].filter((c) => inline.has(c.id)).map((c) => ({ s, c })),
  )
  const content: unknown[] = [
    {
      type: 'text',
      text: [
        `Photos for the website of ${about.name}, a ${about.kind}${about.town ? ` in ${about.town}` : ''}.`,
        'Each photo below has an id. For each subject, list the ids of photos that clearly fit this organisation, best first, at most 3. Leave a list empty rather than include a photo that does not fit.',
        'Reject: the wrong trade or setting, a different country or city than the one named, staged or cheesy stock, text or watermarks, people in poor taste, blurry or dull pictures.',
        'place = the room or setting where it works; people = people doing its kind of work or being served; detail = a close-up object or material typical of it.',
        `townFits: true only if a photo of ${about.town || 'the town'} itself (its streets, square or buildings) would suit this organisation's home page, as for a council, a civic or tourist body, or a museum. False for a shop, clinic, studio, trade, firm or restaurant.`,
        'dark: for each subject, the id of one fitting photo that is dark and moody (mostly deep shadows), or "" if none.',
      ].join('\n'),
    },
  ]
  for (const { s, c } of all)
    content.push(
      { type: 'text', text: `id ${c.id} (offered for ${s})` },
      { type: 'image_url', image_url: { url: inline.get(c.id) } },
    )
  const ids = { type: 'array', items: { type: 'string' }, maxItems: 3 }
  const slots = (t: unknown) => ({
    type: 'object',
    additionalProperties: false,
    required: [...SUBJECTS],
    properties: { place: t, people: t, detail: t },
  })
  const schema = {
    type: 'object',
    additionalProperties: false,
    required: ['townFits', ...SUBJECTS, 'dark'],
    properties: {
      townFits: { type: 'boolean' },
      place: ids,
      people: ids,
      detail: ids,
      dark: slots({ type: 'string' }),
    },
  }
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content }],
      temperature: 0,
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'photos', strict: true, schema },
      },
      usage: { include: true },
    }),
  }).catch(() => null)
  const body = (await res?.json().catch(() => null)) as {
    choices?: { message?: { content?: string } }[]
    usage?: { cost?: number }
  } | null
  const costUsd = body?.usage?.cost ?? 0
  try {
    return { choice: JSON.parse(body?.choices?.[0]?.message?.content ?? '') as Choice, costUsd }
  } catch {
    console.error('photo look failed', res?.status, inline.size, JSON.stringify(body).slice(0, 300))
    return { choice: null, costUsd }
  }
}

function toDataUri(buf: ArrayBuffer, type: string) {
  const bytes = new Uint8Array(buf)
  let bin = ''
  for (let i = 0; i < bytes.length; i += 0x8000)
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return `data:${type};base64,${btoa(bin)}`
}

export async function findPhotos(
  keys: { pixabay?: string; openrouter?: string },
  q: Slots<string>,
  about: { name: string; kind: string; town: string },
  o: { model?: string; perSubject?: number } = {},
): Promise<Found> {
  const per = o.perSubject ?? 6
  const t0 = performance.now()
  limited = false
  const [found, town] = await Promise.all([
    Promise.all(SUBJECTS.map((s) => (keys.pixabay ? pixabay(keys.pixabay, q[s], per) : []))),
    about.town ? commons(about.town, 3) : Promise.resolve([]),
  ])
  const pools: Slots<Candidate[]> = {
    place: [...town, ...(found[0] ?? [])],
    people: found[1] ?? [],
    detail: found[2] ?? [],
  }
  const byId = new Map(SUBJECTS.flatMap((s) => pools[s].map((c) => [c.id, c] as const)))

  // Without the vision model, the first matches as before (and no Commons photos, unchecked).
  const look = () =>
    judge(keys.openrouter ?? '', about, pools, o.model ?? 'google/gemini-2.5-flash-lite')
  let looked: { choice: Choice | null; costUsd: number } = { choice: null, costUsd: 0 }
  if (keys.openrouter && byId.size) {
    looked = await look()
    // One retry: an unchecked photo is how wrong pictures got in before.
    if (!looked.choice) {
      const again = await look()
      looked = { choice: again.choice, costUsd: looked.costUsd + again.costUsd }
    }
  }
  const choice: Choice = looked.choice ?? {
    place: (found[0] ?? []).slice(0, 2).map((c) => c.id),
    people: (found[1] ?? []).slice(0, 2).map((c) => c.id),
    detail: (found[2] ?? []).slice(0, 2).map((c) => c.id),
    dark: { place: '', people: '', detail: '' },
    townFits: false,
  }
  // Town photos only where the town itself is the subject (councils, civic and tourist bodies).
  if (!choice.townFits)
    for (const s of SUBJECTS) {
      choice[s] = choice[s].filter((id) => !id.startsWith('c'))
      if (choice.dark[s].startsWith('c')) choice.dark[s] = ''
    }

  // Each photo once across subjects; the model may only name ids it was shown for that subject.
  const used = new Set<string>()
  const take = (s: Subject, ids: string[], n: number) =>
    ids
      .filter((id) => pools[s].some((c) => c.id === id) && !used.has(id) && used.add(id))
      .slice(0, n)
  const natural = { place: take('place', choice.place, 2), people: [], detail: [] } as Slots<
    string[]
  >
  natural.people = take('people', choice.people, 2)
  natural.detail = take('detail', choice.detail, 2)
  const dark = Object.fromEntries(
    SUBJECTS.map((s) => {
      const id = choice.dark[s]
      return [s, id && pools[s].some((c) => c.id === id) ? [id] : []]
    }),
  ) as Slots<string[]>

  const images: Record<string, string> = {}
  const wanted = [...new Set([...SUBJECTS.flatMap((s) => [...natural[s], ...dark[s]])])]
  await Promise.all(
    wanted.map(async (id) => {
      const c = byId.get(id)
      const res = c ? await fetch(c.full, { headers: UA }).catch(() => null) : null
      if (!res?.ok) return
      images[id] = toDataUri(
        await res.arrayBuffer(),
        res.headers.get('content-type') ?? 'image/jpeg',
      )
    }),
  )
  const photo = (id: string): FoundPhoto[] => {
    const c = byId.get(id)
    if (!c || !images[id]) return []
    const width = Math.min(1600, c.width)
    return [
      {
        id,
        token: `__IMG_${id}__`,
        alt: c.alt,
        width,
        height: Math.round((width * c.height) / c.width),
        credit: c.credit,
      },
    ]
  }
  const set = (x: Slots<string[]>) =>
    Object.fromEntries(SUBJECTS.map((s) => [s, x[s].flatMap(photo)])) as Slots<FoundPhoto[]>
  return {
    natural: set(natural),
    lowkey: set(dark),
    images,
    ms: Math.round(performance.now() - t0),
    limited,
    judged: !!looked.choice,
    commons: wanted.filter((id) => id.startsWith('c') && images[id]).length,
    costUsd: looked.costUsd,
  }
}
