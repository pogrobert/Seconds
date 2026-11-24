// Photos for any business (docs/m0/17-photos.md). Three steps:
// 1. Candidates. Pixabay for the business's own world (place, people, detail), from searches for
//    things a camera can see. Wikimedia Commons for the town itself, when there is one: its
//    "quality images" of that town, kept only when the title or description names it.
// 2. A look. A small vision model sees every candidate and keeps only the ones that fit this
//    business, best first. It only judges photos; it never makes them (no AI pictures).
// 3. Download. Pixabay forbids hotlinking, so the server downloads each photo a space will show
//    (make-site.ts, photo-store.ts) and the page fetches it from the server, once for every look.
// Nothing is borrowed: when nothing fits, the page is drawn without photos.
// Before real users: ask Pixabay about this volume (CLAUDE.md, "Test images"). Every photo keeps
// its credit, and Commons photos their licence.

export type FoundPhoto = {
  id: string
  /** Where to download it from, once it is chosen for a space. */
  source: string
  alt: string
  width: number
  height: number
  credit: { photographer: string; page: string }
}
type Slots<T> = { place: T; people: T; detail: T }
export type Found = {
  natural: Slots<FoundPhoto[]>
  /**
   * The vision model's next pick per subject, after the ones in `natural`: a checked photo held in
   * reserve for a space whose first choices are missing.
   */
  spare: Slots<FoundPhoto[]>
  ms: number
  /** Pixabay refused a search for going over its rate limit (100 a minute). */
  limited: boolean
  limitInfo: string
  /** How the photos were chosen, for the build page's notes. */
  judged: boolean
  commons: number
  costUsd: number
}

const SUBJECTS = ['place', 'people', 'detail'] as const

/**
 * The backup for the look and the town question: OpenRouter tries it in the same request when the
 * first model fails or is busy. Gemini 2.5 Flash Lite is served only by Google AI Studio, which
 * often answered "temporarily rate-limited upstream" (2026-11-24), and then spaces went without
 * photos. GPT-4.1 mini runs elsewhere (OpenAI) and was the steadiest of eight models tried on six
 * businesses: 4.4–5.6 s, about $0.0006, an answer every time, picks about as good
 * (tools/bench/src/photo-models.ts).
 */
const BACKUP = 'openai/gpt-4.1-mini'
const withBackup = (model: string) => (model === BACKUP ? [model] : [model, BACKUP])
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
  /** A real photo tied to the famous subject (commonsFor), preferred by the look when good. */
  fan?: boolean
}

/* --------------------------------------------------------------------------------- Pixabay */

type Hit = {
  id: number
  tags: string
  pageURL: string
  user: string
  imageWidth: number
  imageHeight: number
  previewURL: string
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
/**
 * Tags that mark an image as drawn or generated rather than photographed. Pixabay files some
 * AI-made images as photos (a cartoon groomer reached a dog groomer's page, 2026-11-20); the rule is no AI
 * pictures.
 */
const MADE =
  /\b(ai[- ]?generated|generated|ai|artificial intelligence|midjourney|stable diffusion|illustration|cartoon|drawing|render|3d|clipart|vector|digital art|painting)\b/i

function relevant(hits: Hit[], subject: string): Hit[] {
  const want = words(subject)
  const stem = (w: string) => w.replace(/(ing|ers|er|es|s)$/, '')
  const score = (h: Hit) => {
    const tags = words(h.tags).map(stem)
    return want.filter((w) => tags.some((t) => t === stem(w) || t.includes(stem(w)))).length
  }
  return hits
    .filter((h) => !MADE.test(h.tags))
    .map((h) => ({ h, s: score(h) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.h)
}

/** Recent searches, so a repeated build costs no requests (Pixabay allows 100 a minute). */
const cache = new Map<string, Hit[]>()
let limited = false
/** What Pixabay said when it refused, for the build's note. */
let limitInfo = ''
let searches = 0

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
  searches++
  const get = () => fetch(`https://pixabay.com/api/?${p}`, { headers: UA }).catch(() => null)
  let res = await get()
  // A 429 without Pixabay's rate-limit headers is not its 100-a-minute limit but a refusal in
  // front of it (bench, 2026-11-17: 4 to 6 searches a build were refused): wait and ask once more.
  if (res?.status === 429 && !res.headers.get('x-ratelimit-limit')) {
    await new Promise((r) => setTimeout(r, 1500))
    searches++
    res = await get()
  }
  if (res?.status === 429) {
    limited = true
    const h = (k: string) => res.headers.get(`x-ratelimit-${k}`) ?? '?'
    limitInfo = `${searches} searches this build; Pixabay: limit ${h('limit')}, remaining ${h('remaining')}, resets in ${h('reset')} s; server ${res.headers.get('server') ?? '?'}`
  }
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
  // At most two searches per subject: three hit Pixabay's 100-a-minute limit in the bench.
  const tries = [q, ws.slice(0, 2).join(' ')].filter((t, i, all) => t && all.indexOf(t) === i)
  let hits: Hit[] = []
  for (const t of tries) {
    hits = relevant(await search(key, t), q)
    if (hits.length >= 3) break
  }
  return hits.slice(0, n).map((h) => ({
    id: `p${h.id}`,
    // The 150px preview comes from Pixabay's CDN; webformat links (pixabay.com/get) seem to count
    // toward the 100-a-minute limit (bench, 2026-11-17).
    preview: h.previewURL,
    // The 1280px version: Pixabay's download links refuse other sizes such as 960px (HTTP 400).
    full: h.largeImageURL,
    width: h.imageWidth,
    height: h.imageHeight,
    alt: q,
    credit: { photographer: h.user, page: h.pageURL },
  }))
}

/* ------------------------------------------------------------------------ Wikimedia Commons */

// Commons asks automated clients for a descriptive User-Agent; a generic one, no personal details.
const UA = { 'user-agent': 'SecondsSiteMaker/0.1 (hobby project; small, hand-run builds)' }
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
    // Standard thumbnail widths are ready-made; other widths are drawn on request (~1 s, bench).
    iiurlwidth: '330',
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
      if (i?.mime !== 'image/jpeg' || i.width < 1280 || i.width < i.height * 1.2) return []
      if (!about.includes(want)) return []
      const artist = text(m.Artist?.value).slice(0, 60) || 'Wikimedia Commons'
      const licence = text(m.LicenseShortName?.value)
      return [
        {
          id: `c${pg.title.replace(/[^A-Za-z0-9]+/g, '').slice(4, 40)}`,
          preview: i.thumburl,
          full: i.thumburl.replace(/\/330px-/, '/1280px-'),
          width: 1280,
          height: Math.round((1280 * i.height) / i.width),
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

/**
 * Real photos tied to a famous subject (2026-11-24, Robert: Dutch van der Linde's page showed a
 * photo studio): Commons files for one search, such as "stormtrooper cosplay" or "Kualoa Ranch".
 * Freely licensed; logos, posters, screenshots and drawings are left out here, and the look
 * rejects photos of actors. Each keeps its author and licence for the credits.
 */
async function commonsFor(q: string, n: number): Promise<Candidate[]> {
  if (!q.trim()) return []
  const p = new URLSearchParams({
    action: 'query',
    format: 'json',
    generator: 'search',
    gsrnamespace: '6',
    gsrsearch: `${q} filetype:bitmap`,
    gsrlimit: '20',
    prop: 'imageinfo',
    iiprop: 'url|size|mime|extmetadata',
    iiurlwidth: '330',
    origin: '*',
  })
  const res = await fetch(`https://commons.wikimedia.org/w/api.php?${p}`, {
    headers: UA,
    signal: AbortSignal.timeout(4000),
  }).catch(() => null)
  if (!res?.ok) return []
  type Page = {
    index: number
    title: string
    imageinfo?: {
      thumburl: string
      descriptionurl: string
      width: number
      height: number
      mime: string
      extmetadata?: Record<string, { value?: string }>
    }[]
  }
  const body = (await res.json().catch(() => null)) as { query?: { pages?: Record<string, Page> } }
  const text = (s = '') => s.replace(/<[^>]+>/g, '').trim()
  const notPhoto =
    /\b(logo|poster|screenshot|screen ?shot|cover|icon|map|diagram|drawing|illustration|render|banner|sign ?in|svg)\b/i
  return Object.values(body?.query?.pages ?? {})
    .sort((a, b) => a.index - b.index)
    .flatMap((pg) => {
      const i = pg.imageinfo?.[0]
      const m = i?.extmetadata ?? {}
      if (i?.mime !== 'image/jpeg' || i.width < 1280) return []
      if (notPhoto.test(pg.title)) return []
      // Only free licences: no fair-use files (Commons holds none, but the field says so).
      const licence = text(m.LicenseShortName?.value)
      if (/fair use|non-free/i.test(licence)) return []
      const artist = text(m.Artist?.value).slice(0, 60) || 'Wikimedia Commons'
      return [
        {
          id: `c${pg.title.replace(/[^A-Za-z0-9]+/g, '').slice(4, 40)}`,
          preview: i.thumburl,
          full: i.thumburl.replace(/\/330px-/, '/1280px-'),
          width: 1280,
          height: Math.round((1280 * i.height) / i.width),
          alt: pg.title.replace(/^File:|\.\w+$/g, ''),
          credit: {
            photographer: licence ? `${artist} (${licence})` : artist,
            page: i.descriptionurl,
          },
          fan: true,
        },
      ]
    })
    .slice(0, n)
}

/* ---------------------------------------------------------------------------- The look */

type Choice = Slots<string[]> & { townFits: boolean }

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
        'Reject: anything that is not a real photograph (illustrations, cartoons, 3D renders, AI-generated images with their too-smooth, too-perfect look), the wrong trade or setting, a different country or city than the one named, staged or cheesy stock, text or watermarks, people in poor taste, blurry or dull pictures.',
        'Some photos may come from the world of a film, show, game or character this organisation is about or refers to: fans in costume, props, exhibits, filming locations or the real places it is set in. They are marked. fans = the ids of the marked photos that are good, sharp real photographs worth showing on this page (costumes, props, exhibits, places), even if they show the world it refers to rather than its work. Leave out logos, posters, screenshots, game or film stills, and any photo of an actor or other famous real person. Every photo, marked or not, must also fit the era and setting of that world: no modern offices, computers, bicycles or sports gear for a Wild West gang, a fantasy realm or a historical setting. Also reject in the lists logos, posters, screenshots, game or film stills, and any photo of an actor or other famous real person.',
        'place = the room or setting where it works; people = people doing its kind of work or being served; detail = a close-up object or material typical of it.',
        `townFits: true only if a photo of ${about.town || 'the town'} itself (its streets, square or buildings) would suit this organisation's home page, as for a council, a civic or tourist body, or a museum. False for a shop, clinic, studio, trade, firm or restaurant.`,
      ].join('\n'),
    },
  ]
  for (const { s, c } of all)
    content.push(
      {
        type: 'text',
        text: `id ${c.id} (offered for ${s}${c.fan ? '; a real photo from the world it refers to' : ''})`,
      },
      { type: 'image_url', image_url: { url: inline.get(c.id) } },
    )
  const ids = { type: 'array', items: { type: 'string' }, maxItems: 3 }
  const schema = {
    type: 'object',
    additionalProperties: false,
    required: ['townFits', 'fans', ...SUBJECTS],
    properties: {
      townFits: { type: 'boolean' },
      fans: { type: 'array', items: { type: 'string' }, maxItems: 9 },
      place: ids,
      people: ids,
      detail: ids,
    },
  }
  const ask = () =>
    fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        models: withBackup(model),
        messages: [{ role: 'user', content }],
        temperature: 0,
        // Without a cap OpenRouter reserves 65,535 tokens a call, and a key near its limit is
        // refused (402, 2026-11-21); the answer is a few hundred.
        max_tokens: 800,
        response_format: {
          type: 'json_schema',
          json_schema: { name: 'photos', strict: true, schema },
        },
        usage: { include: true },
      }),
      // A stuck provider once held an edit for five minutes (2026-11-21).
      signal: AbortSignal.timeout(20000),
    }).catch(() => null)
  let res = await ask()
  // "Temporarily rate-limited upstream" (429) passes in a moment; a refusal (502) does not.
  if (res?.status === 429) {
    await new Promise((r) => setTimeout(r, 1000))
    res = await ask()
  }
  const body = (await res?.json().catch(() => null)) as {
    choices?: { message?: { content?: string } }[]
    usage?: { cost?: number }
  } | null
  const costUsd = body?.usage?.cost ?? 0
  try {
    const choice = JSON.parse(body?.choices?.[0]?.message?.content ?? '') as Choice & {
      fans?: string[]
    }
    // A famous subject's own photos, when the look approves them, go first in their space: told
    // only to prefer them, the look still chose stock archery over cosplay for a retired
    // stormtrooper (2026-11-24).
    const fans = new Set(choice.fans ?? [])
    for (const s of SUBJECTS) {
      // One a space, so the page still shows the work itself beside it.
      const mine = pools[s]
        .filter((c) => c.fan && fans.has(c.id))
        .map((c) => c.id)
        .slice(0, 1)
      choice[s] = [...mine, ...(choice[s] ?? []).filter((id) => !mine.includes(id))].slice(0, 3)
    }
    return { choice, costUsd }
  } catch {
    console.error('photo look failed', res?.status, inline.size, JSON.stringify(body).slice(0, 300))
    return { choice: null, costUsd }
  }
}

/** A data: link for some bytes, encoded in chunks: one spread of a large file overflows the stack. */
export function toDataUri(buf: ArrayBuffer | Uint8Array, type: string) {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  let bin = ''
  for (let i = 0; i < bytes.length; i += 0x8000)
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return `data:${type};base64,${btoa(bin)}`
}

/**
 * Whether a photo of the town itself suits this organisation: a text-only question, so Gemini
 * never refuses it and the photo fallback (Qwen) does not decide it (bench: Qwen put views of
 * Lisbon on a florist).
 */
async function townSuits(
  apiKey: string,
  about: { name: string; kind: string; town: string },
  model: string,
): Promise<{ fits: boolean; costUsd: number }> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      models: withBackup(model),
      temperature: 0,
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: `${about.name} is a ${about.kind} in ${about.town}. Would a photo of ${about.town} itself (its streets, square or buildings) suit its home page? Yes only for a council, a civic or tourist body, or a museum; no for a shop, clinic, studio, trade, firm or restaurant.`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'town',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['fits'],
            properties: { fits: { type: 'boolean' } },
          },
        },
      },
      usage: { include: true },
    }),
    signal: AbortSignal.timeout(8000),
  }).catch(() => null)
  const body = (await res?.json().catch(() => null)) as {
    choices?: { message?: { content?: string } }[]
    usage?: { cost?: number }
  } | null
  try {
    const fits = (JSON.parse(body?.choices?.[0]?.message?.content ?? '') as { fits: boolean }).fits
    return { fits: fits === true, costUsd: body?.usage?.cost ?? 0 }
  } catch {
    return { fits: false, costUsd: body?.usage?.cost ?? 0 }
  }
}

export async function findPhotos(
  keys: { pixabay?: string; openrouter?: string },
  q: Slots<string>,
  about: { name: string; kind: string; town: string },
  o: {
    model?: string
    perSubject?: number
    avoid?: string[]
    /** Commons searches for a famous subject, per space (commonsFor). */
    commons?: Slots<string>
  } = {},
): Promise<Found> {
  const per = o.perSubject ?? 6
  const t0 = performance.now()
  limited = false
  limitInfo = ''
  searches = 0
  const model = o.model ?? 'google/gemini-2.5-flash-lite'
  // The town runs on its own, beside the look: the question (does a photo of the town suit this
  // organisation?) and Commons' quality images of it. They are not shown to the vision model:
  // they already name the town, and waiting for them held the look back (~0.5 s, bench).
  const townP: Promise<[{ fits: boolean; costUsd: number }, Candidate[]]> =
    about.town && keys.openrouter
      ? Promise.all([townSuits(keys.openrouter, about, model), commons(about.town, 2)])
      : Promise.resolve([{ fits: false, costUsd: 0 }, []])
  const [found, fans] = await Promise.all([
    Promise.all(SUBJECTS.map((s) => (keys.pixabay ? pixabay(keys.pixabay, q[s], per) : []))),
    // Commons for a famous subject, beside Pixabay: never unchecked, so only with the look.
    Promise.all(
      SUBJECTS.map((s) => (o.commons?.[s] && keys.openrouter ? commonsFor(o.commons[s], 3) : [])),
    ),
  ])
  // Photos the page shows already go when the owner asks for different ones ("show more
  // photos" brought back the same three, 2026-11-21).
  const avoid = new Set(o.avoid ?? [])
  for (const [i, f] of found.entries()) found[i] = f.filter((c) => !avoid.has(c.id))
  for (const [i, f] of fans.entries()) fans[i] = f.filter((c) => !avoid.has(c.id))
  // A famous subject's own photos first, so the look sees them beside the stock ones.
  const pools: Slots<Candidate[]> = {
    place: [...(fans[0] ?? []), ...(found[0] ?? [])],
    people: [...(fans[1] ?? []), ...(found[1] ?? [])],
    detail: [...(fans[2] ?? []), ...(found[2] ?? [])],
  }
  const byId = new Map(SUBJECTS.flatMap((s) => pools[s].map((c) => [c.id, c] as const)))
  const suits = { fits: false, costUsd: 0 }

  // Without the vision model, the first matches as before (and no Commons photos, unchecked).
  let looked: { choice: Choice | null; costUsd: number } = { choice: null, costUsd: 0 }
  if (keys.openrouter && byId.size) {
    const key = keys.openrouter
    const first = await judge(key, about, pools, model)
    looked = { choice: first.choice, costUsd: first.costUsd }
    const townFits = false
    // Gemini refuses some photo sets outright ("blocked: OTHER", the same set every time; bench,
    // 2026-11-17), so asking again is useless. Ask once per subject instead, at the same time:
    // the subjects without the photo it objects to come back; a subject refused again is split in
    // halves; Qwen3-VL (answers every set, but takes 9 to 18 s) is the last resort.
    if (!looked.choice) {
      const alone = (s: Subject): Slots<Candidate[]> => ({
        place: [],
        people: [],
        detail: [],
        [s]: pools[s],
      })
      const parts = await Promise.all(
        SUBJECTS.filter((s) => pools[s].length).map(async (s) => {
          const first = await judge(key, about, alone(s), model)
          if (first.choice) return { s, ...first }
          // Still refused: one photo in this subject is the cause. Ask about each half at the same
          // time (about 2 s); Qwen (9 to 18 s) only if both halves are refused.
          const half = Math.ceil(pools[s].length / 2)
          const halves = [pools[s].slice(0, half), pools[s].slice(half)].filter((h) => h.length)
          const tries = await Promise.all(
            halves.map((h) => judge(key, about, { ...alone(s), [s]: h }, model)),
          )
          let costUsd = first.costUsd + tries.reduce((n, t) => n + t.costUsd, 0)
          const ok = tries.flatMap((t) => (t.choice ? [t.choice] : []))
          if (ok.length) {
            const choice: Choice = { place: [], people: [], detail: [], townFits: false }
            choice[s] = ok.flatMap((c) => c[s]).slice(0, 3)
            return { s, choice, costUsd }
          }
          const last = await judge(key, about, alone(s), 'qwen/qwen3-vl-30b-a3b-instruct')
          costUsd += last.costUsd
          return { s, choice: last.choice, costUsd }
        }),
      )
      const costUsd = looked.costUsd + parts.reduce((n, x) => n + x.costUsd, 0)
      if (parts.some((x) => x.choice)) {
        // A subject that no model would look at stays empty: unchecked photos are what this avoids.
        const merged: Choice = { place: [], people: [], detail: [], townFits }
        for (const x of parts) if (x.choice) merged[x.s] = x.choice[x.s]
        looked = { choice: merged, costUsd }
      } else looked = { choice: null, costUsd }
    }
  }
  const [townAnswer, townFound] = await townP
  suits.fits = townAnswer.fits
  suits.costUsd = townAnswer.costUsd
  looked.costUsd += townAnswer.costUsd
  const choice: Choice = looked.choice ?? {
    place: (found[0] ?? []).slice(0, 2).map((c) => c.id),
    people: (found[1] ?? []).slice(0, 2).map((c) => c.id),
    detail: (found[2] ?? []).slice(0, 2).map((c) => c.id),
    townFits: false,
  }
  // Town photos first, only where the town itself is the subject (councils, civic and tourist
  // bodies).
  if (suits.fits)
    for (const c of townFound) {
      byId.set(c.id, c)
      pools.place.unshift(c)
      choice.place.unshift(c.id)
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
  // Each subject's next pick, kept in reserve for a space whose first choices are missing (no
  // template has low-key spaces, so no dark photo is asked for). Taken after every subject's first
  // two, so those stay as they were.
  const spare = Object.fromEntries(SUBJECTS.map((s) => [s, take(s, choice[s], 1)])) as Slots<
    string[]
  >

  // Nothing is downloaded here: the photo step downloads only the photos its spaces show, best
  // space first, and falls back to the next pick when a download fails.
  const wanted = [...new Set([...SUBJECTS.flatMap((s) => [...natural[s], ...spare[s]])])]
  const photo = (id: string): FoundPhoto[] => {
    const c = byId.get(id)
    if (!c) return []
    const width = Math.min(1600, c.width)
    return [
      {
        id,
        source: c.full,
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
    spare: set(spare),
    ms: Math.round(performance.now() - t0),
    limited,
    limitInfo,
    judged: !!looked.choice,
    commons: wanted.filter((id) => id.startsWith('c')).length,
    costUsd: looked.costUsd,
  }
}
