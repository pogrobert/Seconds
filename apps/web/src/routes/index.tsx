import { createFileRoute } from '@tanstack/react-router'
import { type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from 'react'
import { type BuildResult, findSitePhotos, type PhotoResult } from '../server/build'

type Progress = { choices?: number; words?: number; check?: number }

/**
 * The build, read as it happens (routes/api/build-stream.ts): each part reports when it is done,
 * so the progress shows what is really finished, then the result.
 */
async function streamBuild(
  messages: string[],
  onStep: (p: Progress) => void,
  onPhotos: (p: PhotoResult | null) => void,
): Promise<BuildResult> {
  const res = await fetch('/api/build-stream', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ messages }),
  })
  if (!res.ok || !res.body) {
    const e = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(e?.error ?? `HTTP ${res.status}`)
  }
  const reader = res.body.getReader()
  const dec = new TextDecoder()
  const done: Progress = {}
  let resolve: (r: BuildResult) => void = () => {}
  let reject: (e: Error) => void = () => {}
  const result = new Promise<BuildResult>((ok, no) => {
    resolve = ok
    reject = no
  })
  // Read to the end: the page comes first, the photos (started early on the server) after it.
  ;(async () => {
    let buf = ''
    let got = false
    for (;;) {
      const { value, done: end } = await reader.read()
      if (value) buf += dec.decode(value, { stream: true })
      let nl = buf.indexOf('\n')
      while (nl >= 0) {
        const line = buf.slice(0, nl).trim()
        buf = buf.slice(nl + 1)
        nl = buf.indexOf('\n')
        if (!line) continue
        const ev = JSON.parse(line) as
          | { type: 'step'; step: keyof Progress; ms: number }
          | { type: 'result'; result: BuildResult }
          | { type: 'photos'; photos: PhotoResult | null }
          | { type: 'error'; message: string }
        if (ev.type === 'step') {
          done[ev.step] = ev.ms
          onStep({ ...done })
        } else if (ev.type === 'result') {
          got = true
          resolve(ev.result)
        } else if (ev.type === 'photos') onPhotos(ev.photos)
        else reject(new Error(ev.message))
      }
      if (end) {
        if (!got) reject(new Error('The build stopped before it finished.'))
        return
      }
    }
  })().catch((e) => reject(e instanceof Error ? e : new Error(String(e))))
  return result
}

// The build page: chat on the left, the live site on the right (like Lovable or Meerlume's
// builder). Each message rebuilds the site from everything said so far; the header switches
// between the directions, which are all drawn on every build, so switching is instant.

export const Route = createFileRoute('/')({ component: Build })

type Message =
  | { role: 'user'; text: string }
  | { role: 'assistant'; text: string; result?: BuildResult; photos?: PhotoResult | 'waiting' }
  | { role: 'error'; text: string }

const EXAMPLES = [
  'A calm, upmarket hair colour studio in Leith. Unhurried appointments and honest advice.',
  'We cook everything over open fire. Dark room, a long bar, evenings only, a bit theatrical.',
  'A family dentist by the sea. Children actually like coming here.',
  'Electricians in Bristol: tidy, qualified, clear written quotes, we turn up when we say.',
]

const seconds = (ms: number) => `${(ms / 1000).toFixed(1)} s`

// The page shows before its photos (docs/m0/17-photos.md): each photo space starts as a soft
// shimmer and the photo fades in when the photo step returns, without reloading the page.
const BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
const WAITING_CSS =
  '<style>img[data-img]{background:linear-gradient(110deg,rgba(127,127,127,.10) 35%,rgba(127,127,127,.24) 50%,rgba(127,127,127,.10) 65%) 0 0/300% 100%;animation:img-wait 1.6s linear infinite}@keyframes img-wait{from{background-position:100% 0}to{background-position:-50% 0}}.img-in{animation:img-in .5s ease-out}@keyframes img-in{from{opacity:0}to{opacity:1}}@media (prefers-reduced-motion:reduce){img[data-img],.img-in{animation:none}}</style>'
const withSpaces = (html: string) =>
  html
    .replace(/src="__IMG_([A-Za-z0-9]+)__"/g, `src="${BLANK}" data-img="$1"`)
    .replace('</head>', `${WAITING_CSS}</head>`)

/** Puts the photos into a page already showing: each space gets its photo and fades in. */
/**
 * Links inside the preview. The page is drawn from a string, so "#visit" would resolve against
 * the builder's own address and load the builder inside the frame. Section links scroll the
 * preview instead; links to other places open in a new tab; phone and email links are left alone.
 */
function wireLinks(doc: Document | null | undefined) {
  if (!doc || doc.documentElement.dataset.wired) return
  doc.documentElement.dataset.wired = '1'
  doc.addEventListener('click', (e) => {
    const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
    if (!a) return
    const href = a.getAttribute('href') ?? ''
    if (/^(tel|mailto|sms):/i.test(href)) return
    e.preventDefault()
    if (href.startsWith('#')) {
      const id = decodeURIComponent(href.slice(1))
      const target = id ? doc.getElementById(id) : doc.body
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    if (/^https?:/i.test(href)) window.open(href, '_blank', 'noopener')
  })
}

function fillSpaces(doc: Document | null | undefined, links: Record<string, string>) {
  // Slots that got drawn art are listed under "art:<slot>"; templates hide some of those.
  if (!doc) return
  for (const img of Array.from(doc.querySelectorAll<HTMLImageElement>('img[data-img]'))) {
    const url = links[img.dataset.img ?? '']
    if (!url) continue
    img.addEventListener(
      'load',
      () => {
        img.removeAttribute('data-img')
        img.classList.add('img-in')
      },
      { once: true },
    )
    if (links[`art:${img.dataset.img ?? ''}`]) img.dataset.art = ''
    img.src = url
  }
}

function Build() {
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<BuildResult | null>(null)
  const [look, setLook] = useState<string | null>(null)
  const [device, setDevice] = useState<'desktop' | 'phone'>('desktop')
  const scroller = useRef<HTMLDivElement>(null)
  const photoUrls = useRef<string[]>([])
  const frame = useRef<HTMLIFrameElement>(null)
  /** Which build is current: photos from an older build are dropped. */
  const generation = useRef(0)
  const [links, setLinks] = useState<Record<string, string>>({})
  const [started, setStarted] = useState(0)
  const [progress, setProgress] = useState<Progress>({})
  const [now, setNow] = useState(0)
  const linksRef = useRef(links)
  linksRef.current = links
  const composer = useRef<HTMLTextAreaElement>(null)
  const [reloads, setReloads] = useState(0)

  // The message box grows with what is typed, up to its max height.
  useEffect(() => {
    const t = composer.current
    if (!t) return
    t.style.height = 'auto'
    t.style.height = `${t.scrollHeight}px`
  }, [draft])

  useEffect(() => {
    fillSpaces(frame.current?.contentDocument, links)
  }, [links])

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' })
  }, [messages, busy])

  // A running clock while the page or its photos are being made.
  const lastReply = [...messages].reverse().find((m) => m.role === 'assistant')
  const ticking = busy || (lastReply?.role === 'assistant' && lastReply.photos === 'waiting')
  useEffect(() => {
    if (!ticking) return
    const t = setInterval(() => setNow(performance.now()), 100)
    return () => clearInterval(t)
  }, [ticking])

  async function send(text: string) {
    const words = text.trim()
    if (!words || busy) return
    const history = [...messages, { role: 'user', text: words } as Message]
    setMessages(history)
    setDraft('')
    setBusy(true)
    setStarted(performance.now())
    setNow(performance.now())
    setProgress({})
    try {
      // Photos arrive on the same stream once found; they wait here until the page is in.
      let photos: (p: PhotoResult | null) => void = () => {}
      const photosIn = new Promise<PhotoResult | null>((ok) => {
        photos = ok
      })
      const built = await streamBuild(
        history.filter((m) => m.role === 'user').map((m) => m.text),
        setProgress,
        (p) => photos(p),
      )
      const mine = ++generation.current
      for (const u of photoUrls.current) URL.revokeObjectURL(u)
      photoUrls.current = []
      setLinks({})
      const r: BuildResult = {
        ...built,
        sites: built.sites.map((x) => ({ ...x, html: withSpaces(x.html) })),
      }
      setResult(r)
      setLook(r.suggested)
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          text: `Here is ${r.name}, ${/^[aeiou]/i.test(r.kindLabel) ? 'an' : 'a'} ${r.kindLabel}, in three versions to compare. Tell me what to change.`,
          result: r,
          ...(r.photoJob ? { photos: 'waiting' as const } : {}),
        },
      ])
      setBusy(false)
      // The photo step: the page is already showing; photos fill its spaces as they come.
      if (r.photoJob) {
        const found = await photosIn
        if (mine !== generation.current) return
        // The early photo step failed: ask for it now, the old way.
        const p = found ?? (await findSitePhotos({ data: r.photoJob }))
        const byId: Record<string, string> = {}
        await Promise.all(
          Object.entries(p.images).map(async ([id, data]) => {
            const url = URL.createObjectURL(await (await fetch(data)).blob())
            photoUrls.current.push(url)
            byId[id] = url
          }),
        )
        const bySlot = Object.fromEntries([
          ...Object.entries(p.slots).map(([slot, id]) => [slot, byId[id] ?? '']),
          ...Object.entries(p.slots)
            .filter(([, id]) => p.images[id]?.startsWith('data:image/svg'))
            .map(([slot]) => [`art:${slot}`, '1']),
        ])
        setLinks(bySlot)
        setMessages((m) =>
          m.map((x) => (x.role === 'assistant' && x.result === r ? { ...x, photos: p } : x)),
        )
      }
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: 'error', text: e instanceof Error ? e.message : String(e) },
      ])
    } finally {
      setBusy(false)
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    send(draft)
  }
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(draft)
    }
  }
  const site = result?.sites.find((s) => s.id === look) ?? result?.sites[0]
  const last = [...messages].reverse().find((m) => m.role === 'assistant')
  const photosWaiting = last?.role === 'assistant' && last.photos === 'waiting'

  // 1, 2 and 3 switch versions, unless typing.
  useEffect(() => {
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t?.closest('textarea, input') || e.metaKey || e.ctrlKey || e.altKey) return
      const s = result?.sites[Number(e.key) - 1]
      if (s) setLook(s.id)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [result])

  /** The current version on its own, with its photos, in a new tab. */
  const openPage = () => {
    if (!site) return
    const html = site.html.replace(
      /src="data:image\/gif;base64,[^"]+" data-img="([A-Za-z0-9]+)"/g,
      (t, slot: string) => (links[slot] ? `src="${links[slot]}"` : t),
    )
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }))
    window.open(url, '_blank', 'noopener')
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  }

  return (
    <div className="flex h-dvh flex-col bg-zinc-50 text-zinc-900 antialiased selection:bg-zinc-200">
      <header className="flex h-13 shrink-0 items-center gap-2.5 px-5">
        <span className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
          <Mark />
          Builder
        </span>
        {result && (
          <>
            <span aria-hidden className="text-zinc-300">
              /
            </span>
            <span className="truncate text-sm font-medium text-zinc-600">{result.name}</span>
            <span className="truncate text-sm text-zinc-400">· {result.kindLabel}</span>
          </>
        )}
        <span
          className="ml-auto flex items-center gap-1.5 text-xs text-zinc-500"
          aria-live="polite"
        >
          {busy ? (
            <>
              <Spinner /> Making…
            </>
          ) : photosWaiting ? (
            <>
              <span className="size-1.5 animate-pulse rounded-full bg-zinc-400" /> Photos coming
            </>
          ) : result ? (
            <>
              <span className="size-1.5 rounded-full bg-zinc-900" /> Ready
            </>
          ) : null}
        </span>
      </header>

      <div className="flex min-h-0 flex-1 gap-3 px-3 pb-3">
        <aside className="flex min-h-0 w-[400px] shrink-0 flex-col" aria-label="Chat">
          <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto px-2 pt-2 pb-5">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col justify-end gap-6 pb-1">
                <div className="px-1">
                  <h1 className="text-2xl font-semibold tracking-tight text-balance">
                    What should the site be for?
                  </h1>
                  <p className="mt-2 text-sm leading-relaxed text-pretty text-zinc-600">
                    Who it is, what it does and how it should feel. The page appears in about a
                    second; photos follow a few seconds later.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="px-1 text-xs font-medium text-zinc-500">Try one</p>
                  {EXAMPLES.map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => send(ex)}
                      className="group flex items-start gap-3 rounded-lg border border-zinc-200 bg-white px-3.5 py-3 text-left text-[13px] leading-snug text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
                    >
                      <span className="flex-1">{ex}</span>
                      <Icon
                        name="arrow"
                        className="mt-px size-4 shrink-0 text-zinc-300 transition-colors group-hover:text-zinc-600"
                      />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <ol className="flex flex-col gap-6">
                {messages.map((m, i) => (
                  <li key={i} className={m.role === 'user' ? 'flex justify-end' : ''}>
                    {m.role === 'user' ? (
                      <p className="max-w-[85%] rounded-2xl rounded-br-md bg-zinc-100 px-4 py-2.5 text-sm leading-relaxed text-zinc-900">
                        {m.text}
                      </p>
                    ) : m.role === 'error' ? (
                      <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-800 ring-1 ring-red-200">
                        Something went wrong: {m.text}
                      </p>
                    ) : (
                      <Reply
                        m={m}
                        photosFor={
                          m === lastReply && m.photos === 'waiting'
                            ? seconds(Math.max(0, now - started))
                            : undefined
                        }
                      />
                    )}
                  </li>
                ))}
                {busy && (
                  <li aria-live="polite" className="flex gap-3">
                    <Mark />
                    <div className="min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2.5">
                      <Steps steps={liveSteps(progress, Math.max(0, now - started))} />
                    </div>
                  </li>
                )}
              </ol>
            )}
          </div>
          <form
            onSubmit={onSubmit}
            className="shrink-0 rounded-xl border border-zinc-200 bg-white p-2 shadow-[0_1px_2px_rgba(9,9,11,.04)] transition-colors focus-within:border-zinc-400"
          >
            <label htmlFor="composer" className="sr-only">
              Message
            </label>
            <textarea
              id="composer"
              ref={composer}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKey}
              rows={2}
              placeholder={
                result ? 'What should change?' : 'A pilates studio in Deptford, small classes…'
              }
              className="block max-h-48 w-full resize-none bg-transparent px-2 py-1.5 text-sm leading-relaxed outline-none placeholder:text-zinc-400"
            />
            <div className="flex items-center justify-between gap-2 pl-2">
              <span className="text-[11px] text-zinc-400">
                <kbd className="font-sans">Enter</kbd> to send ·{' '}
                <kbd className="font-sans">Shift Enter</kbd> new line
                {result && (
                  <>
                    {' '}
                    · <kbd className="font-sans">1 2 3</kbd> versions
                  </>
                )}
              </span>
              <button
                type="submit"
                disabled={busy || !draft.trim()}
                aria-label={busy ? 'Making…' : 'Send'}
                title="Send"
                className="grid size-8 place-items-center rounded-full bg-zinc-900 text-white transition hover:bg-zinc-700 active:scale-95 disabled:bg-zinc-200 disabled:text-zinc-400"
              >
                {busy ? <Spinner /> : <Icon name="up" className="size-4" />}
              </button>
            </div>
          </form>
        </aside>

        <section
          aria-label="Preview"
          className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(9,9,11,.04)]"
        >
          <div className="flex h-12 shrink-0 items-center gap-3 border-b border-zinc-200 px-2.5">
            {result ? (
              // The three versions as one segmented switch, named after their design (keys 1, 2
              // and 3 switch too); a small square says whether the version is light or dark.
              <nav aria-label="Versions" className="flex gap-0.5 rounded-lg bg-zinc-100 p-0.5">
                {result.sites.map((s, i) => {
                  const dark = / night ·/.test(s.rules)
                  return (
                    <button
                      key={s.id}
                      type="button"
                      aria-pressed={s.id === site?.id}
                      title={`${looksOf(s.rules)} (key ${i + 1})`}
                      onClick={() => setLook(s.id)}
                      className="flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium text-zinc-500 outline-none transition-colors hover:text-zinc-900 focus-visible:ring-2 focus-visible:ring-zinc-400 aria-pressed:bg-white aria-pressed:text-zinc-950 aria-pressed:shadow-[0_1px_2px_rgba(9,9,11,.08),0_0_0_1px_rgba(9,9,11,.04)]"
                    >
                      <span
                        aria-hidden
                        className={`size-2.5 rounded-[3px] ${dark ? 'bg-zinc-800' : 'bg-white ring-1 ring-inset ring-zinc-300'}`}
                      />
                      {s.label.startsWith('Blocks') ? `Version ${i + 1}` : s.label}
                      <span className="sr-only">{dark ? '(dark)' : '(light)'}</span>
                    </button>
                  )
                })}
              </nav>
            ) : (
              <span className="flex items-center px-1.5 text-[13px] font-medium text-zinc-400">
                Preview
              </span>
            )}
            <div className="ml-auto flex items-center gap-1">
              <fieldset
                className="flex gap-0.5 rounded-lg bg-zinc-100 p-0.5"
                aria-label="Screen size"
              >
                {(['desktop', 'phone'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    aria-pressed={device === d}
                    aria-label={d === 'desktop' ? 'Desktop' : 'Phone'}
                    title={d === 'desktop' ? 'Desktop' : 'Phone'}
                    onClick={() => setDevice(d)}
                    className="grid size-7 place-items-center rounded-md text-zinc-400 transition-colors hover:text-zinc-900 aria-pressed:bg-white aria-pressed:text-zinc-900 aria-pressed:shadow-[0_1px_2px_rgba(9,9,11,.08)] aria-pressed:ring-1 aria-pressed:ring-zinc-900/[.06]"
                  >
                    <Icon name={d} className="size-4" />
                  </button>
                ))}
              </fieldset>
              <button
                type="button"
                onClick={() => setReloads((n) => n + 1)}
                disabled={!site}
                aria-label="Reload preview"
                title="Reload preview"
                className="grid size-8 place-items-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-40"
              >
                <Icon name="reload" className="size-4" />
              </button>
              <button
                type="button"
                onClick={openPage}
                disabled={!site}
                title="Open this version in a new tab"
                className="ml-1 flex h-8 items-center gap-1.5 rounded-lg bg-zinc-950 px-3 text-[13px] font-medium text-white transition-colors hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400"
              >
                Open <Icon name="out" className="size-3.5" />
              </button>
            </div>
          </div>
          <main
            className={`relative flex min-h-0 flex-1 items-stretch justify-center ${device === 'phone' ? 'bg-zinc-50' : ''}`}
          >
            {site ? (
              <iframe
                ref={frame}
                onLoad={() => {
                  wireLinks(frame.current?.contentDocument)
                  fillSpaces(frame.current?.contentDocument, linksRef.current)
                }}
                key={`${site.id}-${result?.name}-${reloads}`}
                title={`${result?.name}, version ${site.id.slice(1)}`}
                srcDoc={site.html}
                className={
                  device === 'phone'
                    ? 'my-6 h-[calc(100%-3rem)] w-[390px] rounded-[36px] bg-white shadow-2xl ring-[10px] ring-zinc-900'
                    : 'h-full w-full'
                }
              />
            ) : busy ? (
              <div className="flex flex-1 flex-col gap-5 p-8" aria-hidden>
                <div className="flex items-center justify-between">
                  <div className="h-4 w-28 animate-pulse rounded bg-zinc-100" />
                  <div className="h-7 w-24 animate-pulse rounded-full bg-zinc-100" />
                </div>
                <div className="mt-10 h-10 w-2/3 animate-pulse rounded-lg bg-zinc-100" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-100" />
                <div className="mt-4 aspect-[16/6] w-full animate-pulse rounded-2xl bg-zinc-100" />
              </div>
            ) : (
              <div className="grid flex-1 place-items-center p-8">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div aria-hidden className="w-56 rounded-xl p-3 ring-1 ring-zinc-900/[.06]">
                    <div className="flex gap-1">
                      <span className="size-1.5 rounded-full bg-zinc-200" />
                      <span className="size-1.5 rounded-full bg-zinc-200" />
                      <span className="size-1.5 rounded-full bg-zinc-200" />
                    </div>
                    <div className="mt-4 h-2.5 w-2/3 rounded bg-zinc-100" />
                    <div className="mt-2 h-2 w-1/2 rounded bg-zinc-100" />
                    <div className="mt-3 h-16 rounded-lg bg-zinc-100/70" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-700">Your site appears here</p>
                    <p className="mt-1 text-xs text-zinc-400">
                      Three versions, about a second after you press Enter.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {busy && site && (
              <div className="pointer-events-none absolute inset-0 bg-white/50">
                <div className="h-0.5 w-full overflow-hidden bg-zinc-100">
                  <div className="h-full w-1/3 animate-[slide_1.1s_ease-in-out_infinite] bg-zinc-900" />
                </div>
                <span className="absolute top-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs text-zinc-600 shadow-sm ring-1 ring-zinc-900/[.08]">
                  <Spinner /> Making the new version…
                </span>
              </div>
            )}
          </main>
          {site && (
            <p className="shrink-0 truncate border-t border-zinc-200 px-3.5 py-1.5 text-[11px] text-zinc-400">
              {looksOf(site.rules)}
            </p>
          )}
        </section>
      </div>
    </div>
  )
}

/** Builder's mark: the small square logo, also the assistant's avatar in the chat. */
function Mark() {
  return (
    <span aria-hidden className="grid size-6 shrink-0 place-items-center rounded-lg bg-zinc-900">
      <span className="size-2.5 rounded-[3px] bg-white" />
    </span>
  )
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="inline-block size-3.5 animate-spin rounded-full border-[1.5px] border-current border-r-transparent opacity-70"
    />
  )
}

const PATHS: Record<string, string> = {
  arrow: 'M7 17 17 7M8 7h9v9',
  up: 'M12 19V5M5 12l7-7 7 7',
  out: 'M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6',
  reload: 'M3 12a9 9 0 0 1 15.5-6.2L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.2L3 16M3 21v-5h5',
  desktop: 'M3 4h18v12H3zM8 20h8M12 16v4',
  phone: 'M7 2h10v20H7zM11 18h2',
}

/** Simple line icons, drawn here (no icon package). */
function Icon({ name, className }: { name: keyof typeof PATHS; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={PATHS[name]} />
    </svg>
  )
}

/** "Heritage type · neutral light · Natural photos" from a version's rules (blocks left out). */
const looksOf = (rules: string) =>
  rules
    .split(' · ')
    .filter((x) => !x.includes('/'))
    .join(' · ')
const blocksOf = (rules: string) => rules.split(' · ').filter((x) => x.includes('/'))

type StepState = 'done' | 'active' | 'todo'

/**
 * The build's steps as they stand (from the stream): the design choices and the words run at
 * the same time, then the check on the words, then the page is drawn.
 */
function liveSteps(p: Progress, elapsed: number) {
  const run = (doneMs: number | undefined, ready = true) =>
    doneMs !== undefined
      ? { state: 'done' as const, note: seconds(doneMs) }
      : ready
        ? { state: 'active' as const, note: seconds(elapsed) }
        : { state: 'todo' as const }
  const both = p.choices !== undefined && p.words !== undefined
  return [
    { label: 'Design', ...run(p.choices) },
    { label: 'Words', ...run(p.words) },
    { label: 'Check', ...run(p.check, both) },
    {
      label: 'Page',
      ...(p.check !== undefined ? { state: 'active' as const } : { state: 'todo' as const }),
    },
  ]
}
function Steps({ steps }: { steps: { label: string; state: StepState; note?: string }[] }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
      {steps.map((s) => (
        <li
          key={s.label}
          className={`flex items-center gap-1.5 ${s.state === 'todo' ? 'text-zinc-400' : 'text-zinc-600'}`}
        >
          <span
            aria-hidden
            className={`grid size-3.5 place-items-center rounded-full text-[9px] ${
              s.state === 'done'
                ? 'bg-zinc-900 text-white'
                : s.state === 'active'
                  ? 'animate-pulse bg-zinc-300'
                  : 'ring-1 ring-zinc-300'
            }`}
          >
            {s.state === 'done' ? '✓' : ''}
          </span>
          {s.label}
          {s.note && <span className="text-zinc-400 tabular-nums">{s.note}</span>}
        </li>
      ))}
    </ol>
  )
}

function Reply({
  m,
  photosFor,
}: {
  m: Extract<Message, { role: 'assistant' }>
  /** Time since the build began, while the photos are still coming. */
  photosFor?: string | undefined
}) {
  const r = m.result
  const p = m.photos && m.photos !== 'waiting' ? m.photos : null
  const notes = [...(r?.notes ?? []), ...(p?.notes ?? [])]
  return (
    <div className="flex gap-3 text-sm leading-relaxed">
      <Mark />
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-zinc-800">{m.text}</p>
        {r && (
          <div className="mt-2">
            <Steps
              steps={[
                { label: 'Words', state: 'done', note: seconds(r.ms.text) },
                { label: 'Page', state: 'done', note: seconds(r.ms.total) },
                ...(r.photoJob
                  ? [
                      p
                        ? { label: 'Photos', state: 'done' as const, note: seconds(p.ms) }
                        : {
                            label: 'Photos',
                            state: 'active' as const,
                            ...(photosFor ? { note: photosFor } : {}),
                          },
                    ]
                  : []),
              ]}
            />
            {notes.length > 0 && (
              <p className="mt-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
                {notes.join(' ')}
              </p>
            )}
            <details className="group mt-2 text-xs text-zinc-500">
              <summary className="cursor-pointer list-none select-none text-zinc-400 transition-colors hover:text-zinc-700 [&::-webkit-details-marker]:hidden">
                <span className="inline-block transition-transform group-open:rotate-90">›</span>{' '}
                Details
              </summary>
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 rounded-xl bg-white/70 p-3 ring-1 ring-zinc-900/[.06]">
                <dt className="text-zinc-400">Time</dt>
                <dd>
                  choices {seconds(r.ms.decide)} and words {seconds(r.ms.text)} at once, answers
                  checked {seconds(r.ms.check ?? 0)}, drawing {seconds(r.ms.render)}
                  {p ? `, photos ${seconds(p.ms)} after` : ''} (measured on this computer)
                </dd>
                <dt className="text-zinc-400">Cost</dt>
                <dd>${(r.costUsd + (p?.costUsd ?? 0)).toFixed(4)} for the models</dd>
                {r.sites.map((s, i) => (
                  <div key={s.id} className="contents">
                    <dt className="text-zinc-400">Version {i + 1}</dt>
                    <dd>
                      {looksOf(s.rules)}
                      <br />
                      <span className="text-zinc-400">{blocksOf(s.rules).join(', ')}</span>
                    </dd>
                  </div>
                ))}
                {r.photoSearches.length > 0 && (
                  <>
                    <dt className="text-zinc-400">Searches</dt>
                    <dd>{r.photoSearches.join('; ')}</dd>
                  </>
                )}
                {p && p.credits.length > 0 && (
                  <>
                    <dt className="text-zinc-400">Photos</dt>
                    <dd>
                      {p.credits.map((c, i) => (
                        <span key={c.page}>
                          {i > 0 && ', '}
                          <a
                            href={c.page}
                            target="_blank"
                            rel="noreferrer"
                            className="underline decoration-zinc-300 underline-offset-2 hover:text-zinc-800"
                          >
                            {c.photographer}
                          </a>
                        </span>
                      ))}
                    </dd>
                  </>
                )}
              </dl>
            </details>
          </div>
        )}
      </div>
    </div>
  )
}
