import { createFileRoute } from '@tanstack/react-router'
import {
  AlertCircleIcon,
  ArrowUpIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  LayoutTemplateIcon,
  MonitorIcon,
  RotateCwIcon,
  SmartphoneIcon,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Bubble, BubbleContent } from '@/components/ui/bubble'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from '@/components/ui/input-group'
import { Kbd } from '@/components/ui/kbd'
import { Message as ChatMessage } from '@/components/ui/message'
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from '@/components/ui/message-scroller'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { EXAMPLES, type Example } from '../examples'
import type { BuildResult, PhotoJob, PhotoResult } from '../server/build'

/** The photo step on its own, when the photos found during the build did not arrive. */
async function findSitePhotos(job: PhotoJob): Promise<PhotoResult> {
  const res = await fetch('/api/photos', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(job),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return (await res.json()) as PhotoResult
}

type Progress = { choices?: number; words?: number; check?: number }

/**
 * The build, read as it happens (routes/api/build-stream.ts): each part reports when it is done,
 * so the progress shows what is really finished, then the result.
 */
async function streamBuild(
  messages: string[],
  onStep: (p: Progress) => void,
  onPhotos: (p: PhotoResult | null) => void,
  /** The site so far: the last message is then an edit of it (docs/m0/27-editing.md). */
  state: BuildResult['state'] = null,
): Promise<BuildResult> {
  const res = await fetch('/api/build-stream', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ messages, state }),
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

/**
 * Message limits (Robert, 2026-11-23). Every message stops at what the server accepts
 * (routes/api/build-stream.ts cuts at 1,500), with a counter near the end so nothing is cut
 * silently. The first message needs a few words about the business: "hi" made a site from nothing,
 * at full cost. Edits have no minimum ("undo", "darker").
 */
const MAX_CHARS = 1500
const COUNT_FROM = 1200
const tooShort = (text: string) => {
  const t = text.trim()
  return t.length < 15 || t.split(/\s+/).length < 3
}

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
  const photoUrls = useRef<string[]>([])
  const frame = useRef<HTMLIFrameElement>(null)
  /** Which build is current: photos from an older build are dropped. */
  const generation = useRef(0)
  /** Each version shown, with its photo links, newest last: "undo" steps back one. */
  const versions = useRef<{ result: BuildResult; links: Record<string, string> }[]>([])
  const [links, setLinks] = useState<Record<string, string>>({})
  const [started, setStarted] = useState(0)
  const [progress, setProgress] = useState<Progress>({})
  const [now, setNow] = useState(0)
  const linksRef = useRef(links)
  linksRef.current = links
  const composer = useRef<HTMLTextAreaElement>(null)
  const [reloads, setReloads] = useState(0)

  // The first screen starts with the cursor in the message box.
  useEffect(() => {
    composer.current?.focus()
  }, [])

  // The message box grows with what is typed, up to its max height, and glides to its new height
  // (Robert, 2026-11-23): a hidden copy of the text, as wide as the box, says how tall it must be,
  // so the box itself never has to be reset to "auto", which would stop the transition.
  const mirror = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    const t = composer.current
    const m = mirror.current
    if (!t || !m) return
    m.style.width = `${t.clientWidth}px`
    m.value = t.value || t.placeholder
    const min = Number.parseFloat(getComputedStyle(t).minHeight) || 0
    t.style.height = `${Math.min(192, Math.max(min, m.scrollHeight))}px`
  }, [draft, messages.length === 0])

  useEffect(() => {
    fillSpaces(frame.current?.contentDocument, links)
  }, [links])

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
    if (!words || busy || (!result && tooShort(words))) return
    const history = [...messages, { role: 'user', text: words } as Message]
    const start = () => {
      setMessages(history)
      setDraft('')
      setBusy(true)
      setStarted(performance.now())
      setNow(performance.now())
      setProgress({})
    }
    // The first message moves the page from the centred start to the split view as one motion
    // (View Transitions; where the browser has none, or motion is reduced, it simply switches).
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!messages.length && document.startViewTransition && !still)
      document.startViewTransition(() => flushSync(start))
    else start()
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
        result?.state ?? null,
      )
      // "Undo": the version before comes back, photos and all.
      if (built.undo) {
        versions.current.pop()
        const before = versions.current[versions.current.length - 1]
        if (before) {
          ++generation.current
          setResult(before.result)
          setLinks(before.links)
          setLook(before.result.suggested)
        }
        setMessages((m) => [
          ...m,
          {
            role: 'assistant',
            text: before
              ? 'Went back to the version before. Anything else?'
              : 'There is nothing to undo yet.',
          },
        ])
        if (!before && result) versions.current.push({ result, links: linksRef.current })
        return
      }
      // An edit that keeps the photos keeps their links; a new site or new photos starts afresh.
      // Links stay alive while an earlier version may come back; a new site lets them all go.
      const edited = !!built.changed
      const mine = edited && !built.photoJob ? generation.current : ++generation.current
      if (!edited) {
        for (const u of photoUrls.current) URL.revokeObjectURL(u)
        photoUrls.current = []
        versions.current = []
      }
      if (!edited || built.photoJob) setLinks({})
      const r: BuildResult = {
        ...built,
        sites: built.sites.map((x) => ({ ...x, html: withSpaces(x.html) })),
      }
      // After an edit, stay on the design being looked at when it is still one of the three.
      const was = result?.sites.find((x) => x.id === look)?.label
      const same = edited ? r.sites.find((x) => x.label === was) : undefined
      setResult(r)
      setLook(same?.id ?? r.suggested)
      versions.current.push({
        result: r,
        links: edited && !built.photoJob ? linksRef.current : {},
      })
      const changes = r.changed ?? []
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          text: edited
            ? r.reply
              ? r.reply
              : changes.length
                ? `Changed ${changes.length > 1 ? `${changes.slice(0, -1).join(', ')} and ${changes[changes.length - 1]}` : changes[0]}. Anything else?`
                : r.already?.length
                  ? `Nothing to change: ${r.already.join('; ')}.`
                  : 'Nothing changed: I could not tell which part you meant. Try naming it: the headline, the colour, the photos, the design.'
            : `Here is ${r.name}, ${/^[aeiou]/i.test(r.kindLabel) ? 'an' : 'a'} ${r.kindLabel}, in three versions to compare. Tell me what to change.`,
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
        const p = found ?? (await findSitePhotos(r.photoJob))
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
        const top = versions.current[versions.current.length - 1]
        if (top?.result === r) top.links = bySlot
        // The server leaves these out when the owner later asks for different photos.
        const shown = Object.values(p.slots).filter(
          (id) => !p.images[id]?.startsWith('data:image/svg'),
        )
        // Kept on the version itself, so an undone-to version still knows its photos.
        if (r.state) r.state.shown = shown
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

  // The name and the site being made; no status on the right, so the preview can reach the top
  // of the window (Robert, 2026-11-23). In the split view it sits over the chat column.
  const top = (
    <header className="flex h-13 shrink-0 items-center gap-2.5 px-5 md:px-2">
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
        </>
      )}
    </header>
  )

  const composerBox = (big: boolean) => (
    <form
      onSubmit={onSubmit}
      // The first screen's box and the split view's are one box to the view transition: it glides
      // from the middle to the bottom left; the words typed in it fly up as the first message.
      style={{ viewTransitionName: 'composer' }}
      className="shrink-0"
    >
      <InputGroup
        // The send button is disabled while the box is empty; shadcn greys the whole group for any
        // disabled control inside, which here would grey the box the visitor is about to type in.
        className={`bg-white has-disabled:bg-white has-disabled:opacity-100 has-[[data-slot=input-group-control]:focus-visible]:border-zinc-300 has-[[data-slot=input-group-control]:focus-visible]:ring-[3px] has-[[data-slot=input-group-control]:focus-visible]:ring-zinc-900/[.04] ${big ? 'rounded-2xl p-1.5 shadow-[0_1px_2px_rgba(9,9,11,.04),0_12px_32px_-16px_rgba(9,9,11,.18)]' : 'rounded-xl p-0.5 shadow-[0_1px_2px_rgba(9,9,11,.04)]'}`}
      >
        <label htmlFor="composer" className="sr-only">
          Message
        </label>
        <InputGroupTextarea
          id="composer"
          maxLength={MAX_CHARS}
          aria-describedby="composer-note"
          ref={composer}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          rows={big ? 3 : 2}
          style={big ? { viewTransitionName: 'prompt' } : undefined}
          placeholder={
            result
              ? 'What should change?'
              : 'Describe a business: who it is, what it offers, how it should feel…'
          }
          className={`max-h-48 flex-none overflow-y-auto leading-relaxed field-sizing-fixed motion-safe:transition-[height] motion-safe:duration-150 motion-safe:ease-out ${big ? 'min-h-20 text-base md:text-base' : 'min-h-12 text-sm'}`}
        />
        <textarea
          ref={mirror}
          aria-hidden
          tabIndex={-1}
          readOnly
          rows={1}
          className={`pointer-events-none invisible absolute top-0 left-0 -z-10 resize-none overflow-hidden border-0 px-2.5 py-2 leading-relaxed field-sizing-fixed ${big ? 'text-base' : 'text-sm'}`}
        />
        {/* Enter sends and Shift Enter starts a new line, as in any chat; 1, 2 and 3 switch
            versions (shown on the versions' tooltips). No hints in the box (Robert, 2026-11-23). */}
        <InputGroupAddon align="block-end" className="justify-between">
          <span id="composer-note" aria-live="polite" className="text-xs font-normal text-zinc-400">
            {!result && draft.trim() && tooShort(draft)
              ? 'Add a few words about the business'
              : draft.length >= COUNT_FROM
                ? `${draft.length.toLocaleString('en-GB')} / ${MAX_CHARS.toLocaleString('en-GB')}`
                : ''}
          </span>
          <InputGroupButton
            type="submit"
            variant="default"
            size="icon-sm"
            disabled={busy || !draft.trim() || (!result && tooShort(draft))}
            aria-label={busy ? 'Making…' : 'Send'}
            className="rounded-full"
          >
            {busy ? <Spinner /> : <ArrowUpIcon />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </form>
  )

  // Before the first message: a centred start, the message box large in the middle and the
  // examples under it (launch, 2026-11-23); the split view with the preview comes with the first
  // site.
  if (messages.length === 0)
    return (
      <div className="flex h-dvh flex-col bg-zinc-50 text-zinc-900 antialiased selection:bg-zinc-200 md:[&>header]:px-5">
        {top}
        <main className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-5 pb-10">
          <div className="my-auto flex w-full max-w-2xl flex-col gap-7 pt-10">
            <div className="text-center">
              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                Websites in seconds.
              </h1>
            </div>
            {composerBox(true)}
            <TryRow
              onPick={(ex) => {
                setDraft(ex.prompt)
                composer.current?.focus()
              }}
            />
          </div>
        </main>
      </div>
    )

  return (
    <div className="flex h-dvh flex-col bg-zinc-50 text-zinc-900 antialiased selection:bg-zinc-200">
      <div className="md:hidden">{top}</div>
      <div className="flex min-h-0 flex-1 flex-col gap-3 px-3 pb-3 md:flex-row md:pt-3">
        <aside
          className="order-2 flex min-h-0 w-full flex-1 flex-col md:order-none md:w-[400px] md:flex-none md:shrink-0"
          aria-label="Chat"
        >
          <div className="-mt-3 hidden md:block">{top}</div>
          {/* The chat keeps the newest turn in view while it grows, and offers a button back down
              when the visitor has scrolled up (shadcn Message Scroller, launch 2026-11-23). */}
          <MessageScrollerProvider autoScroll>
            <MessageScroller className="min-h-0 flex-1">
              <MessageScrollerViewport aria-label="Conversation" className="px-2 pt-2 pb-5">
                <MessageScrollerContent>
                  {messages.map((m, i) => (
                    <MessageScrollerItem key={i} scrollAnchor={m.role === 'user'}>
                      {m.role === 'user' ? (
                        <ChatMessage align="end">
                          <Bubble variant="muted" align="end">
                            <BubbleContent
                              style={i === 0 ? { viewTransitionName: 'prompt' } : undefined}
                              className="rounded-2xl rounded-br-md px-4 py-2.5"
                            >
                              {m.text}
                            </BubbleContent>
                          </Bubble>
                        </ChatMessage>
                      ) : m.role === 'error' ? (
                        <Alert variant="destructive">
                          <AlertCircleIcon />
                          <AlertTitle>Something went wrong</AlertTitle>
                          <AlertDescription>{m.text}</AlertDescription>
                        </Alert>
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
                    </MessageScrollerItem>
                  ))}
                  {!busy && result && (
                    // What can be said next, one click each: shows that a site is edited by just
                    // saying it (launch, 2026-11-23).
                    <MessageScrollerItem>
                      <ul aria-label="Suggested changes" className="flex flex-wrap gap-1.5 pl-9">
                        {[
                          ...(versions.current.length > 1 ? ['Undo that'] : []),
                          'Warmer colours',
                          'Different photos',
                          'Less text',
                          'Write it in Spanish',
                        ].map((x) => (
                          <li key={x}>
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => send(x)}
                              className="rounded-full bg-white px-3 font-normal text-zinc-600"
                            >
                              {x}
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </MessageScrollerItem>
                  )}
                  {busy && (
                    <MessageScrollerItem>
                      <div aria-live="polite" className="flex gap-3">
                        <Mark />
                        <div className="min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2.5">
                          <Steps steps={liveSteps(progress, Math.max(0, now - started))} />
                        </div>
                      </div>
                    </MessageScrollerItem>
                  )}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton aria-label="Jump to the latest message" />
            </MessageScroller>
          </MessageScrollerProvider>
          {composerBox(false)}
        </aside>

        <section
          aria-label="Preview"
          className="order-1 flex min-w-0 flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(9,9,11,.04)] max-md:h-[58dvh] max-md:shrink-0 md:order-none md:flex-1"
        >
          <Tabs
            value={site?.id ?? ''}
            onValueChange={setLook}
            className="flex min-h-0 flex-1 flex-col gap-0"
          >
            <div className="flex h-12 shrink-0 items-center gap-2 border-b border-zinc-200 px-2.5">
              {result ? (
                // The three versions as tabs, named after their design (arrow keys move between
                // them; keys 1, 2 and 3 too); a small square says whether one is light or dark.
                <TabsList aria-label="Versions">
                  {result.sites.map((s, i) => {
                    const dark = / night ·/.test(s.rules)
                    return (
                      <Tooltip key={s.id}>
                        {/* A span between: tooltips and tabs both set data-state on their element. */}
                        <TooltipTrigger asChild>
                          <span className="flex">
                            <TabsTrigger
                              value={s.id}
                              className="gap-1.5 px-2.5 text-[13px] data-active:bg-white data-active:shadow-[0_1px_2px_rgba(9,9,11,.08)]"
                            >
                              <span
                                aria-hidden
                                className={`size-2.5 rounded-[3px] ${dark ? 'bg-zinc-800' : 'bg-white ring-1 ring-inset ring-zinc-300'}`}
                              />
                              {s.label.startsWith('Blocks') ? `Version ${i + 1}` : s.label}
                              <span className="sr-only">{dark ? '(dark)' : '(light)'}</span>
                            </TabsTrigger>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          Version {i + 1} <Kbd>{i + 1}</Kbd>
                        </TooltipContent>
                      </Tooltip>
                    )
                  })}
                </TabsList>
              ) : (
                <span className="flex items-center px-1.5 text-[13px] font-medium text-zinc-400">
                  Preview
                </span>
              )}
              <div className="ml-auto flex items-center gap-1">
                <ToggleGroup
                  type="single"
                  value={device}
                  onValueChange={(v) => v && setDevice(v as typeof device)}
                  aria-label="Screen size"
                  variant="outline"
                  size="sm"
                  // On a phone the preview already is a phone.
                  className="max-md:hidden"
                >
                  {(['desktop', 'phone'] as const).map((d) => (
                    <Tooltip key={d}>
                      <TooltipTrigger asChild>
                        <span className="flex">
                          <ToggleGroupItem
                            value={d}
                            aria-label={d === 'desktop' ? 'Desktop' : 'Phone'}
                          >
                            {d === 'desktop' ? <MonitorIcon /> : <SmartphoneIcon />}
                          </ToggleGroupItem>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>{d === 'desktop' ? 'Desktop' : 'Phone'}</TooltipContent>
                    </Tooltip>
                  ))}
                </ToggleGroup>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setReloads((n) => n + 1)}
                      disabled={!site}
                      aria-label="Reload preview"
                    >
                      <RotateCwIcon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Reload preview</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={openPage} disabled={!site} className="ml-1">
                      <span className="max-sm:sr-only">Open</span>
                      <ExternalLinkIcon data-icon="inline-end" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Open this version in a new tab</TooltipContent>
                </Tooltip>
              </div>
            </div>
            <main
              className={`relative flex min-h-0 flex-1 items-stretch justify-center ${device === 'phone' ? 'bg-zinc-50' : ''}`}
            >
              {site ? (
                <TabsContent value={site.id} className="flex min-h-0 flex-1 justify-center">
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
                </TabsContent>
              ) : busy ? (
                <div className="flex flex-1 flex-col gap-5 p-8" aria-hidden>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-7 w-24 rounded-full" />
                  </div>
                  <Skeleton className="mt-10 h-10 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="mt-4 aspect-[16/6] w-full rounded-2xl" />
                </div>
              ) : (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <LayoutTemplateIcon />
                    </EmptyMedia>
                    <EmptyTitle>Your site appears here</EmptyTitle>
                    <EmptyDescription>
                      Three versions, about a second after you press Enter.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
              {busy && site && (
                <div className="pointer-events-none absolute inset-0 bg-white/50">
                  <div className="h-0.5 w-full overflow-hidden bg-zinc-100">
                    <div className="h-full w-1/3 animate-[slide_1.1s_ease-in-out_infinite] bg-zinc-900 motion-reduce:animate-none" />
                  </div>
                  <span className="absolute top-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs text-zinc-600 shadow-sm ring-1 ring-zinc-900/[.08]">
                    <Spinner /> Making the new version…
                  </span>
                </div>
              )}
            </main>
          </Tabs>
        </section>
      </div>
    </div>
  )
}

/**
 * The "Try" row: a few example businesses at a time, changing every five seconds as a group (the
 * old names lift away, the new ones settle one after another), paused while the pointer is on
 * the row. A name fills the message box with its detailed prompt; nothing is sent until Enter.
 */
function TryRow({ onPick }: { onPick: (ex: Example) => void }) {
  // The first set is fixed so the server and the browser draw the same page; then random.
  const [shown, setShown] = useState(() => EXAMPLES.slice(0, 4))
  const paused = useRef(false)
  useEffect(() => {
    const next = () =>
      setShown((prev) => {
        const pool = EXAMPLES.filter((x) => !prev.includes(x))
        return [...pool].sort(() => Math.random() - 0.5).slice(0, 4)
      })
    const t = setInterval(() => {
      if (!paused.current && !document.hidden) next()
    }, 5000)
    return () => clearInterval(t)
  }, [])
  // The names' own width, so the row glides to a new width instead of jumping (Robert,
  // 2026-11-23). An empty moment between two sets is not a width.
  const names = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState<number | null>(null)
  useEffect(() => {
    const el = names.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      if (el.offsetWidth > 0) setWidth(el.offsetWidth)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: pausing on hover only, no action
    <div
      className="flex min-h-8 items-center justify-center gap-1 text-[13px] whitespace-nowrap"
      onMouseEnter={() => {
        paused.current = true
      }}
      onMouseLeave={() => {
        paused.current = false
      }}
    >
      <span className="mr-1 shrink-0 text-zinc-500">Try</span>
      <motion.div
        className="-my-1 overflow-hidden py-1"
        initial={false}
        animate={width === null ? {} : { width }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div ref={names} className="flex w-max">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={shown.map((x) => x.title).join('|')}
              className="flex min-w-0 items-center gap-1"
              initial="hidden"
              animate="show"
              exit="exit"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.07, delayChildren: 0.02 } },
                exit: {
                  opacity: 0,
                  y: -5,
                  filter: 'blur(3px)',
                  transition: { duration: 0.16, ease: 'easeIn' },
                },
              }}
            >
              {shown.map((x, i) => (
                <motion.span
                  key={x.title}
                  // Narrow screens show fewer names so the row never wraps.
                  className={`flex min-w-0 items-center ${i >= 2 ? 'max-sm:hidden' : ''} ${i >= 3 ? 'max-md:hidden' : ''}`}
                  variants={{
                    hidden: { opacity: 0, y: 6, filter: 'blur(3px)' },
                    show: {
                      opacity: 1,
                      y: 0,
                      filter: 'blur(0px)',
                      transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
                    },
                  }}
                >
                  {i > 0 && (
                    <span aria-hidden className="mr-1 text-zinc-300">
                      ·
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPick(x)}
                    className="min-w-0 truncate px-2.5 text-[13px] text-zinc-800 hover:bg-zinc-200/70 hover:text-zinc-950"
                  >
                    {x.title}
                  </Button>
                </motion.span>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
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
                  ? 'animate-pulse bg-zinc-300 motion-reduce:animate-none'
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
                ...(r.changed
                  ? [{ label: 'Edit', state: 'done' as const, note: seconds(r.ms.total) }]
                  : [
                      { label: 'Words', state: 'done' as const, note: seconds(r.ms.text) },
                      { label: 'Page', state: 'done' as const, note: seconds(r.ms.total) },
                    ]),
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
            <Collapsible className="mt-2 text-xs text-zinc-500">
              <CollapsibleTrigger className="group/details -ml-1 flex items-center gap-0.5 rounded-md px-1 text-zinc-400 outline-none transition-colors hover:text-zinc-700 focus-visible:ring-2 focus-visible:ring-ring/50">
                <ChevronRightIcon className="size-3 transition-transform group-data-[state=open]/details:rotate-90" />
                Details
              </CollapsibleTrigger>
              <CollapsibleContent>
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
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
      </div>
    </div>
  )
}
