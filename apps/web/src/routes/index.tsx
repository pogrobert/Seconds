import {
  ArrowClockwiseIcon,
  ArrowSquareOutIcon,
  ArrowUpIcon,
  BatteryFullIcon,
  CellSignalFullIcon,
  ChatsIcon,
  CheckIcon,
  CircleIcon,
  DeviceMobileIcon,
  InfoIcon,
  LayoutIcon,
  MonitorIcon,
  PlayCircleIcon,
  TrashIcon,
  WarningCircleIcon,
  WifiHighIcon,
} from '@phosphor-icons/react'
import { createFileRoute } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'motion/react'
import {
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { flushSync } from 'react-dom'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Bubble, BubbleContent } from '@/components/ui/bubble'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from '@/components/ui/input-group'
import { Kbd } from '@/components/ui/kbd'
import { Marker, MarkerContent, MarkerIcon } from '@/components/ui/marker'
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
import { Suggestion, Suggestions } from '@/components/ui/suggestion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from '@/components/ui/trace'
import { EXAMPLES, type Example } from '../examples'
import { ago, listSites, loadSite, removeSite, type SiteSummary, saveSite } from '../history'
import type { BuildResult, PhotoJob, PhotoLanded, PhotoResult } from '../server/build'
import { suggestionsFor } from '../suggest'

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
  /** Each photo space as soon as its photo is ready, hero first, before `onPhotos`. */
  onPhoto: (p: PhotoLanded) => void = () => {},
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
          | ({ type: 'photo' } & PhotoLanded)
          | { type: 'photos'; photos: PhotoResult | null }
          | { type: 'error'; message: string }
        if (ev.type === 'step') {
          done[ev.step] = ev.ms
          onStep({ ...done })
        } else if (ev.type === 'result') {
          got = true
          resolve(ev.result)
        } else if (ev.type === 'photo') onPhoto(ev)
        else if (ev.type === 'photos') onPhotos(ev.photos)
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
 * Message limits. Every message stops at what the server accepts
 * (routes/api/build-stream.ts cuts at 1,500), with a counter near the end so nothing is cut
 * silently. The first message needs a few words about what the site is for: "hi" made a site from nothing,
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
  '<style>img[data-img]{background:linear-gradient(110deg,rgba(127,127,127,.10) 35%,rgba(127,127,127,.24) 50%,rgba(127,127,127,.10) 65%) 0 0/300% 100%;animation:img-wait 1.6s linear infinite}@keyframes img-wait{from{background-position:100% 0}to{background-position:-50% 0}}.img-in{animation:img-in .5s ease-out}img[data-empty]{background:rgba(127,127,127,.12)}@keyframes img-in{from{opacity:0}to{opacity:1}}@media (prefers-reduced-motion:reduce){img[data-img],.img-in{animation:none}}</style>'
const withSpaces = (html: string) =>
  html
    // React adds a preload link for the hero photo; with the token as its address the browser
    // asked for /__IMG_hero__ and got a 404 on every preview (prod smoke test, 2026-11-24).
    .replace(/<link rel="preload" as="image" href="__IMG_[A-Za-z0-9]+__"\/>/g, '')
    .replace(/src="__IMG_([A-Za-z0-9]+)__"/g, `src="${BLANK}" data-img="$1" data-slot="$1"`)
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

/**
 * Each space shows its link's photo. A page whose words did not change is not drawn again (an
 * edit asking for other photos, or undoing one), so a space already showing a photo takes the new
 * one, and goes back to waiting while its links are cleared for photos still to come.
 */
/** In a version's links: its photo step is over, so a space with no link will not get one. */
const DONE = 'done:'

function fillSpaces(doc: Document | null | undefined, links: Record<string, string>) {
  // Slots that got drawn art are listed under "art:<slot>"; templates hide some of those.
  if (!doc) return
  // Pages kept in Recent before spaces carried their slot name.
  for (const img of Array.from(doc.querySelectorAll<HTMLImageElement>('img[data-img]')))
    img.dataset.slot ??= img.dataset.img
  for (const img of Array.from(doc.querySelectorAll<HTMLImageElement>('img[data-slot]'))) {
    const slot = img.dataset.slot ?? ''
    const url = links[slot]
    if (!url && links[DONE]) {
      // The photo step is over and this space got nothing (a site kept in Recent before its
      // photos were saved, or a photo that failed to download): it stops waiting.
      img.removeAttribute('data-img')
      img.dataset.empty = ''
      img.src = BLANK
      continue
    }
    delete img.dataset.empty
    if (!url) {
      if (img.hasAttribute('data-img')) continue
      img.dataset.img = slot
      img.classList.remove('img-in')
      delete img.dataset.art
      img.src = BLANK
      continue
    }
    // Photos land one at a time: a space already showing or loading its photo is left alone.
    if (img.getAttribute('src') === url) continue
    img.addEventListener(
      'load',
      () => {
        img.removeAttribute('data-img')
        img.classList.remove('img-in')
        void img.offsetWidth
        img.classList.add('img-in')
      },
      { once: true },
    )
    if (links[`art:${slot}`]) img.dataset.art = ''
    else delete img.dataset.art
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
  /** Which conversation is current: the name in the corner starts a new one, and late answers are dropped. */
  const session = useRef(0)
  /** The site being made, for the Recent list (history.ts); a new one per new site. */
  const siteId = useRef<string | null>(null)
  /** Each photo's file, by its link, so the photos can be kept with the site. */
  const photoBlobs = useRef(new Map<string, Blob>())
  const [recent, setRecent] = useState<SiteSummary[]>([])
  const [allRecent, setAllRecent] = useState(false)
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
  /** The page's top colour, for the phone's status bar. */
  const [tone, setTone] = useState<Tone>(LIGHT)

  // The first screen starts with the cursor in the message box.
  const onStart = messages.length === 0
  // On a phone the preview and the chat take turns on the whole screen (2026-11-24, Robert:
  // "on mobile we need two tabs - chat and preview"). From md up both show side by side.
  const [pane, setPane] = useState<'preview' | 'chat'>('preview')
  useEffect(() => {
    if (onStart) composer.current?.focus()
  }, [onStart])

  // The message box grows with what is typed, up to its max height, and glides to its new height
  //: a hidden copy of the text, as wide as the box, says how tall it must be,
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
    const run = session.current
    const start = () => {
      setMessages(history)
      setDraft('')
      setBusy(true)
      setStarted(performance.now())
      setNow(performance.now())
      setProgress({})
    }
    // The first message dissolves the centred start into the split view (picked from four
    // tried): nothing travels, the start blurs away and the split view comes into
    // focus (View Transitions, styles.css; where the browser has none, or motion is reduced, it
    // simply switches).
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
      const early: PhotoLanded[] = []
      let landed = (p: PhotoLanded) => {
        early.push(p)
      }
      const built = await streamBuild(
        history.filter((m) => m.role === 'user').map((m) => m.text),
        setProgress,
        (p) => photos(p),
        // Which design is being looked at: "something more premium" is about that one.
        result?.state
          ? {
              ...result.state,
              viewing: result.state.templates[result.sites.findIndex((x) => x.id === look)],
            }
          : null,
        (p) => landed(p),
      )
      if (run !== session.current) return
      // "Undo": the version before comes back, photos and all.
      if (built.undo) {
        versions.current.pop()
        const before = versions.current[versions.current.length - 1]
        if (before) {
          ++generation.current
          setResult(before.result)
          setLinks(before.links)
          setLook(before.result.suggested)
          setPane('preview')
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
        photoBlobs.current.clear()
        versions.current = []
        siteId.current = crypto.randomUUID()
      }
      if (!edited || built.photoJob) setLinks({})
      const r: BuildResult = {
        ...built,
        sites: built.sites.map((x) => ({ ...x, html: withSpaces(x.html) })),
      }
      // After an edit, stay on the design being looked at when it is still one of the three,
      // unless the edit asked for other designs: then the best new one.
      const was = result?.sites.find((x) => x.id === look)?.label
      const same = edited ? r.sites.find((x) => x.label === was) : undefined
      setResult(r)
      setPane('preview')
      setLook(r.show ?? same?.id ?? r.suggested)
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
                ? // What was asked for but already so is said too: "make it pink and more spacious"
                  // on a roomy site said only "Changed colour to rose" (2026-11-24).
                  `Changed ${changes.length > 1 ? `${changes.slice(0, -1).join(', ')} and ${changes[changes.length - 1]}` : changes[0]}${r.already?.length ? `; ${r.already.join('; ')}` : ''}. Anything else?`
                : r.already?.length
                  ? `Nothing to change: ${r.already.join('; ')}.`
                  : 'Nothing changed: I could not tell which part you meant. Try naming it: the headline, the colour, the photos, the design.'
            : `Here is ${r.name}, ${/^[aeiou]/i.test(r.kindLabel) ? 'an' : 'a'} ${r.kindLabel}, in three versions to compare. ${r.ask ?? 'Tell me what to change.'}`,
          result: r,
          ...(r.photoJob ? { photos: 'waiting' as const } : {}),
        },
      ])
      setBusy(false)
      // The photo step: the page is already showing; each space fills as its photo lands (hero
      // first), fetched as a file and kept as a local link, so the photos can be saved with the
      // site (history.ts).
      if (r.photoJob) {
        const current = () => mine === generation.current && run === session.current
        const files = new Map<string, Promise<string>>()
        const file = (id: string, src: string) => {
          let f = files.get(id)
          if (!f) {
            f = (async () => {
              // One retry: the photo is on the server already, so a miss is a passing hiccup.
              const res = await fetch(src).then((x) => (x.ok ? x : fetch(src)))
              if (!res.ok) throw new Error(`photo ${id}: HTTP ${res.status}`)
              const blob = await res.blob()
              const url = URL.createObjectURL(blob)
              photoUrls.current.push(url)
              photoBlobs.current.set(url, blob)
              return url
            })()
            files.set(id, f)
          }
          return f
        }
        // Each version starts from no photos: an edit that brings photos replaces them all.
        let mineLinks: Record<string, string> = {}
        const put = async ({ slots, id, src }: PhotoLanded) => {
          const url = await file(id, src).catch(() => '')
          if (!url || !current()) return
          const add: Record<string, string> = {}
          for (const slot of slots) {
            add[slot] = url
            if (src.startsWith('data:image/svg')) add[`art:${slot}`] = '1'
          }
          mineLinks = { ...mineLinks, ...add }
          setLinks((l) => ({ ...l, ...add }))
          const top = versions.current[versions.current.length - 1]
          if (top?.result === r) top.links = mineLinks
        }
        const puts: Promise<void>[] = []
        landed = (p) => {
          puts.push(put(p))
        }
        for (const p of early.splice(0)) landed(p)
        const found = await photosIn
        if (!current()) return
        // The early photo step failed: ask for it now, the old way.
        const p = found ?? (await findSitePhotos(r.photoJob))
        // Spaces that did not come one by one (the old way above) fill now.
        for (const [slot, id] of Object.entries(p.slots))
          if (!mineLinks[slot]) landed({ slots: [slot], id, src: p.images[id] ?? '' })
        await Promise.all(puts)
        if (!current()) return
        mineLinks = { ...mineLinks, [DONE]: '1' }
        setLinks((l) => ({ ...l, [DONE]: '1' }))
        const last = versions.current[versions.current.length - 1]
        if (last?.result === r) last.links = mineLinks
        // The server leaves these out when the owner later asks for different photos.
        const shown = Object.values(p.slots).filter(
          (id) => !p.images[id]?.startsWith('data:image/svg'),
        )
        // Kept on the version itself, so an undone-to version still knows its photos, and the
        // searches they came from (an edit asking for other photos writes new ones).
        if (r.state) {
          r.state.shown = shown
          if (p.queries) r.state.copy = { ...r.state.copy, photos: p.queries }
        }
        setMessages((m) =>
          m.map((x) => (x.role === 'assistant' && x.result === r ? { ...x, photos: p } : x)),
        )
      }
    } catch (e) {
      if (run !== session.current) return
      setMessages((m) => [
        ...m,
        { role: 'error', text: e instanceof Error ? e.message : String(e) },
      ])
    } finally {
      if (run === session.current) setBusy(false)
    }
  }

  /**
   * The name in the corner: back to the first screen for a new site. The
   * site is not kept; a build still under way is let go. Dissolves, as the way in does.
   */
  function startOver() {
    session.current++
    generation.current++
    const reset = () => {
      for (const u of photoUrls.current) URL.revokeObjectURL(u)
      photoUrls.current = []
      photoBlobs.current.clear()
      siteId.current = null
      versions.current = []
      setMessages([])
      setResult(null)
      setLook(null)
      setLinks({})
      setProgress({})
      setBusy(false)
      setDraft('')
    }
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (document.startViewTransition && !still) document.startViewTransition(() => flushSync(reset))
    else reset()
  }

  // Each finished step is kept in this browser (history.ts), shortly after it lands: the chat,
  // the versions undo can reach, and the photos as files. Photos still on their way are left out
  // and saved when they arrive.
  useEffect(() => {
    const id = siteId.current
    if (busy || !result || !id) return
    const t = setTimeout(() => {
      const kept = new Set<string>()
      for (const l of [links, ...versions.current.map((v) => v.links)])
        for (const u of Object.values(l)) if (u.startsWith('blob:')) kept.add(u)
      const photos: Record<string, Blob> = {}
      for (const u of kept) {
        const b = photoBlobs.current.get(u)
        if (b) photos[u] = b
      }
      void saveSite<Kept>({
        id,
        name: result.name,
        kind: result.kindLabel,
        updated: Date.now(),
        data: {
          messages: messages.map((m) =>
            m.role !== 'assistant' || !m.photos
              ? m
              : m.photos === 'waiting'
                ? { role: m.role, text: m.text, ...(m.result ? { result: m.result } : {}) }
                : { ...m, photos: { ...m.photos, images: {} } },
          ),
          versions: versions.current,
          result,
          look,
          links,
        },
        photos,
      })
    }, 400)
    return () => clearTimeout(t)
  }, [busy, result, messages, look, links])

  // The Recent list, read whenever the first screen shows.
  useEffect(() => {
    if (onStart) void listSites().then(setRecent)
  }, [onStart])

  /** Brings a kept site back as it was left, ready to edit, dissolving in as a new one does. */
  async function reopen(id: string) {
    const saved = await loadSite<Kept>(id)
    if (!saved) return setRecent(await listSites())
    session.current++
    generation.current++
    const swap: Record<string, string> = {}
    for (const [old, blob] of Object.entries(saved.photos)) {
      const url = URL.createObjectURL(blob)
      photoUrls.current.push(url)
      photoBlobs.current.set(url, blob)
      swap[old] = url
    }
    // Links to photos that were not kept point nowhere now: their spaces stay empty.
    const relink = (l: Record<string, string>) => ({
      ...Object.fromEntries(
        Object.entries(l).map(([k, v]) => [k, v.startsWith('blob:') ? (swap[v] ?? '') : v]),
      ),
      [DONE]: '1',
    })
    const d = saved.data
    const apply = () => {
      siteId.current = saved.id
      versions.current = d.versions.map((v) => ({ result: v.result, links: relink(v.links) }))
      setMessages(d.messages)
      setResult(d.result)
      setLook(d.look)
      setLinks(relink(d.links))
      setBusy(false)
      setDraft('')
    }
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (document.startViewTransition && !still) document.startViewTransition(() => flushSync(apply))
    else apply()
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
  // of the window. In the split view it sits over the chat column.
  const top = (
    <header className="flex h-13 shrink-0 items-center gap-2.5 px-5 md:px-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={startOver}
            className="-mx-1 flex shrink-0 items-center gap-2 transition-transform duration-150 ease-out active:scale-[0.97] rounded-lg px-1 text-[15px] font-semibold tracking-tight outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Mark />
            Seconds
          </button>
        </TooltipTrigger>
        <TooltipContent>Start a new site</TooltipContent>
      </Tooltip>
      {result && (
        <>
          {/* Neither the name nor the slash may shrink: Safari squeezed "Seconds" over the slash
              when the site's name was long (2026-11-24); only the site's name is cut short. */}
          <span aria-hidden className="shrink-0 text-zinc-300">
            /
          </span>
          <span className="truncate text-sm font-medium text-zinc-600">{result.name}</span>
        </>
      )}
    </header>
  )

  const composerBox = (big: boolean) => (
    <form onSubmit={onSubmit} className="shrink-0">
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
          placeholder={big ? "What's the site for?" : 'What should change?'}
          className={`max-h-48 flex-none overflow-y-auto leading-relaxed field-sizing-fixed motion-safe:transition-[height] motion-safe:duration-160 motion-safe:ease-[cubic-bezier(0.23,1,0.32,1)] ${big ? 'h-20 min-h-20 text-base md:text-base' : 'h-12 min-h-12 text-sm'}`}
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
            versions (shown on the versions' tooltips). No hints in the box. */}
        <InputGroupAddon align="block-end" className="justify-between">
          <span id="composer-note" aria-live="polite" className="text-xs font-normal text-zinc-400">
            {/* The note eases in, barely; the counter just updates. */}
            <AnimatePresence initial={false}>
              {!result && draft.trim() && tooShort(draft) ? (
                <motion.span
                  key="short"
                  className="inline-block"
                  initial={{ opacity: 0, y: 2 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.12 } }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                  Add a few more words
                </motion.span>
              ) : draft.length >= COUNT_FROM ? (
                `${draft.length.toLocaleString('en-GB')} / ${MAX_CHARS.toLocaleString('en-GB')}`
              ) : null}
            </AnimatePresence>
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
      // Nothing above the headline on the first screen: the name appears with
      // the split view.
      <div className="flex h-dvh flex-col bg-zinc-50 text-zinc-900 antialiased selection:bg-teal-600/25">
        <main className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-5 pb-10">
          <div className="relative my-auto flex w-full max-w-2xl flex-col gap-7 pt-10">
            <div className="text-center">
              <h1 className="text-[2rem] leading-tight font-medium tracking-[-0.02em] text-balance sm:text-[2.5rem]">
                Websites in seconds
              </h1>
            </div>
            {composerBox(true)}
            <TryRow
              typing={!!draft.trim()}
              onPick={(ex) => {
                setDraft(ex.prompt)
                composer.current?.focus()
              }}
            />
            {recent.length > 0 && (
              // Sites made here before, newest first (history.ts); kept only in this browser.
              // As wide as the message box, its text lined up with the box's.
              // It hangs below the centred block instead of joining it: the list is read after
              // the page loads, and joining would push the headline and box up (a layout shift).
              <section
                aria-labelledby="recent-title"
                className={`absolute inset-x-0 top-full mt-7 pb-10 ${ENTER}`}
              >
                <h2 id="recent-title" className="mb-1 px-4 text-xs font-medium text-zinc-400">
                  Recent
                </h2>
                <ul className="flex flex-col">
                  {recent.slice(0, allRecent ? undefined : 4).map((x) => (
                    <li
                      key={x.id}
                      // A press shrinks the row a touch, as buttons do; on a row this wide 0.985
                      // reads like their 0.97.
                      className="group relative flex items-center rounded-lg transition-[background-color,transform] duration-150 ease-out hover:bg-zinc-200/50 active:scale-[0.985]"
                    >
                      <button
                        type="button"
                        onClick={() => void reopen(x.id)}
                        className="flex min-w-0 flex-1 items-baseline gap-2 rounded-lg px-4 py-2 text-left text-sm pointer-coarse:pr-12 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        <span className="truncate font-medium text-zinc-800">{x.name}</span>
                        <span className="truncate text-zinc-500">{x.kind}</span>
                        <span className="ml-auto shrink-0 pl-2 text-xs text-zinc-400 tabular-nums transition-opacity pointer-fine:group-focus-within:opacity-0 pointer-fine:group-hover:opacity-0">
                          {ago(x.updated)}
                        </span>
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${x.name}`}
                        onClick={async () => {
                          await removeSite(x.id)
                          setRecent(await listSites())
                        }}
                        // With a mouse it takes the time's place on hover; on touch both show.
                        className="absolute top-1/2 right-1.5 grid size-7 -translate-y-1/2 place-items-center rounded-md text-zinc-400 transition-colors outline-none hover:bg-zinc-200 hover:text-zinc-700 focus-visible:ring-3 focus-visible:ring-ring/50 pointer-fine:opacity-0 pointer-fine:group-focus-within:opacity-100 pointer-fine:group-hover:opacity-100"
                      >
                        <TrashIcon className="size-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
                {recent.length > 4 && !allRecent && (
                  <button
                    type="button"
                    onClick={() => setAllRecent(true)}
                    className="mt-0.5 rounded-md px-4 py-1 text-xs text-zinc-500 outline-none hover:text-zinc-800 focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    Show {recent.length - 4} more
                  </button>
                )}
              </section>
            )}
          </div>
        </main>
        {/* Who made it, on the first screen only (2026-11-24): one quiet word, linking to the
            author's site in the same tab, as the author's Portfolio and Surfaces link (nothing is
            built yet on this screen; a new tab until 2026-11-24). */}
        <footer className="flex shrink-0 justify-center px-5 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))] text-xs">
          <a
            href="https://pogrobert.com"
            className="rounded-sm text-zinc-400 underline-offset-4 outline-none transition-colors hover:text-zinc-800 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Author
          </a>
        </footer>
      </div>
    )

  return (
    <div className="flex h-dvh flex-col bg-zinc-50 text-zinc-900 antialiased selection:bg-teal-600/25">
      <div className="md:hidden">{top}</div>
      {/* On a phone, Chat and Preview as a tab bar under the top bar, in Meerlume's style
          (2026-11-24, Robert: "Match the bar"). Preview shows first and after each change. */}
      <div
        role="tablist"
        aria-label="Show"
        className="flex shrink-0 border-b border-zinc-200 bg-zinc-50 px-2 md:hidden"
      >
        {(
          [
            { value: 'chat', label: 'Chat', Icon: ChatsIcon },
            { value: 'preview', label: 'Preview', Icon: PlayCircleIcon },
          ] as const
        ).map(({ value, label, Icon }) => {
          const on = pane === value
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setPane(value)}
              className={`relative flex flex-1 items-center justify-center gap-1.5 px-3 py-3 text-[12px] font-medium tracking-[0.04em] uppercase outline-none transition-colors duration-200 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset ${on ? 'text-zinc-900' : 'text-zinc-500'}`}
            >
              <Icon size={14} weight={on ? 'bold' : 'regular'} />
              {label}
              {on && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-3 -bottom-px h-0.5 rounded-t-full bg-zinc-900 motion-safe:animate-[tab-line_0.22s_ease_both]"
                />
              )}
            </button>
          )
        })}
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-3 px-3 pb-3 pt-3 md:flex-row">
        <aside
          className={`order-2 flex min-h-0 w-full flex-1 flex-col md:order-none md:w-[400px] md:flex-none md:shrink-0 ${pane === 'chat' ? '' : 'max-md:hidden'}`}
          aria-label="Chat"
        >
          <div className="-mt-3 hidden md:block">{top}</div>
          {/* The chat keeps the newest turn in view while it grows, and offers a button back down
              when the visitor has scrolled up (shadcn Message Scroller, launch 2026-11-23). */}
          <MessageScrollerProvider autoScroll>
            <MessageScroller className="min-h-0 flex-1">
              {/* The list can take focus so keys can scroll it; a click shows no ring, keys a faint one. */}
              <MessageScrollerViewport
                aria-label="Conversation"
                className="rounded-lg px-2 pt-2 pb-5 outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/10"
              >
                <MessageScrollerContent>
                  {messages.map((m, i) => (
                    <MessageScrollerItem
                      key={i}
                      scrollAnchor={m.role === 'user'}
                      // Its paint is clipped to its box (content-visibility: auto), so a little
                      // room below keeps the focus ring on Details whole.
                      // A reply takes the place of the progress below, which already eased in,
                      // so it shows at once (a second rise and fade read as a jump).
                      className="pb-1"
                    >
                      {m.role === 'user' ? (
                        <ChatMessage align="end">
                          <Bubble variant="muted" align="end">
                            <BubbleContent className="rounded-2xl rounded-br-md px-4 py-2.5">
                              {m.text}
                            </BubbleContent>
                          </Bubble>
                        </ChatMessage>
                      ) : m.role === 'error' ? (
                        <Alert variant="destructive">
                          <WarningCircleIcon />
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
                  {busy && (
                    <MessageScrollerItem className={ENTER}>
                      {/* Laid out as the reply that replaces it, with the same rows, so nothing
                          jumps when the result comes in (until 2026-11-24 a boxed list of four
                          steps, Design and Check among them, became the reply's three). */}
                      <div aria-live="polite" className="flex gap-3 text-sm leading-relaxed">
                        <Mark />
                        <div className="min-w-0 flex-1 pt-0.5">
                          <p className="text-zinc-500">
                            {result ? 'Changing it…' : 'Making three versions…'}
                          </p>
                          <div className="mt-2">
                            <Steps
                              steps={liveSteps(progress, Math.max(0, now - started), !!result)}
                            />
                          </div>
                        </div>
                      </div>
                    </MessageScrollerItem>
                  )}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton aria-label="Jump to the latest message" />
            </MessageScroller>
          </MessageScrollerProvider>
          {!busy && result && (
            // What can be said next, one click each, just above the box as in shadcn's AI
            // Elements (under the reply they scrolled away and were always the
            // same). Chosen from the site as it stands (suggest.ts); a missing fact starts a
            // message to finish instead of sending.
            <Suggestions aria-label="Suggested changes" className="-mx-3 mb-1 px-3 py-1">
              {suggestionsFor(result, {
                canUndo: versions.current.length > 1,
                said: messages.flatMap((m) => (m.role === 'user' ? [m.text] : [])),
              }).map((x, i) => (
                <Suggestion
                  key={x.label}
                  // The row arrives one chip after another, 40ms apart (animation review).
                  style={{ animationDelay: `${i * 40}ms` }}
                  suggestion={x.text}
                  onClick={(text) => {
                    if (x.send) return send(text)
                    setDraft(text)
                    requestAnimationFrame(() => {
                      const box = composer.current
                      box?.focus()
                      box?.setSelectionRange(text.length, text.length)
                    })
                  }}
                  className={`h-7 bg-white text-xs font-normal text-zinc-600 ${ENTER}`}
                >
                  {x.send ? x.label : `${x.label}…`}
                </Suggestion>
              ))}
            </Suggestions>
          )}
          {composerBox(false)}
        </aside>

        <section
          aria-label="Preview"
          // The border is drawn on top, not around: a site clipped to the rounded corner leaves
          // half-covered pixels where the panel's own colour showed as a light rim;
          // the border laid over them covers exactly those pixels.
          className={`relative order-1 flex min-w-0 flex-col overflow-hidden rounded-xl bg-white shadow-[0_1px_2px_rgba(9,9,11,.04)] after:pointer-events-none after:absolute after:inset-0 after:z-10 after:rounded-[inherit] after:border after:border-zinc-200 md:order-none max-md:flex-1 md:flex-1 ${pane === 'preview' ? '' : 'max-md:hidden'}`}
        >
          <Tabs
            value={site?.id ?? ''}
            onValueChange={setLook}
            // Every version is its own Tab stop, so focus alone must not
            // switch: Tab passing over them would land on the last. Enter or Space picks one;
            // arrows and 1, 2, 3 still work.
            activationMode="manual"
            className="flex min-h-0 flex-1 flex-col gap-0"
          >
            <div className="flex h-12 shrink-0 items-center gap-2 border-b border-zinc-200 px-2.5">
              {result ? (
                // The three versions as tabs, named after their design (arrow keys move between
                // them; keys 1, 2 and 3 too). Screen readers also hear whether one is light or
                // dark; the small squares that showed it were dropped (2026-11-24).
                <TabsList
                  aria-label="Versions"
                  variant="line"
                  // Names with a line under the one shown. The
                  // list fills the bar's height; each tab is a small box in the middle, so its
                  // focus ring has room, and its line reaches down onto the bar's bottom edge.
                  className="h-auto! gap-1 self-stretch p-0"
                >
                  {result.sites.map((s, i) => {
                    const dark = / night ·/.test(s.rules)
                    return (
                      <Tooltip key={s.id}>
                        {/* A span between: tooltips and tabs both set data-state on their element. */}
                        <TooltipTrigger asChild>
                          <span className="flex">
                            <TabsTrigger
                              value={s.id}
                              tabIndex={0}
                              className="h-8 flex-none px-1.5 text-[13px] text-zinc-500 hover:text-zinc-800 group-data-horizontal/tabs:after:inset-x-1.5 group-data-horizontal/tabs:after:bottom-[-8.5px] data-active:text-zinc-900"
                            >
                              {s.label}
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
                  // One joined pair, not two buttons.
                  spacing={0}
                  // Both reachable with Tab, not only with arrows.
                  rovingFocus={false}
                  // On a phone the preview already is a phone. Each item sits in a span for its
                  // tooltip, so the group's own first/last rounding can't see them as a row.
                  className="max-md:hidden [&>span:not(:first-child)>*]:rounded-l-none! [&>span:not(:first-child)>*]:border-l-0! [&>span:not(:last-child)>*]:rounded-r-none!"
                >
                  {(['desktop', 'phone'] as const).map((d) => (
                    <Tooltip key={d}>
                      <TooltipTrigger asChild>
                        <span className="flex">
                          <ToggleGroupItem
                            value={d}
                            aria-label={d === 'desktop' ? 'Desktop' : 'Phone'}
                          >
                            {d === 'desktop' ? <MonitorIcon /> : <DeviceMobileIcon />}
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
                      <ArrowClockwiseIcon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Reload preview</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={openPage} disabled={!site} className="ml-1">
                      <span className="max-sm:sr-only">Open</span>
                      <ArrowSquareOutIcon data-icon="inline-end" />
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
                <TabsContent
                  value={site.id}
                  className="flex min-h-0 flex-1 items-center justify-center"
                >
                  {(() => {
                    const page = (
                      <iframe
                        ref={frame}
                        onLoad={() => {
                          const doc = frame.current?.contentDocument
                          wireLinks(doc)
                          fillSpaces(doc, linksRef.current)
                          setTone(toneOf(doc))
                        }}
                        key={`${site.id}-${result?.name}-${reloads}-${device}`}
                        title={`${result?.name}, version ${site.id.slice(1)}`}
                        srcDoc={site.html}
                        className="h-full w-full bg-[#fff]"
                      />
                    )
                    return device === 'phone' ? <Phone tone={tone}>{page}</Phone> : page
                  })()}
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
                      <LayoutIcon />
                    </EmptyMedia>
                    <EmptyTitle>Your site appears here</EmptyTitle>
                    <EmptyDescription>
                      Three versions, about a second after you press Enter.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
              {/* While an edit is made: a veil and one pill, eased in after 100ms so quick edits
                  don't flash, and out a little faster (animation review, 2026-11-23). */}
              <AnimatePresence>
                {busy && site && (
                  <motion.div
                    key="making"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: 1,
                      transition: { delay: 0.1, duration: 0.15, ease: [0.23, 1, 0.32, 1] },
                    }}
                    exit={{ opacity: 0, transition: { duration: 0.12, ease: 'easeOut' } }}
                    className="pointer-events-none absolute inset-0 bg-white/50"
                  >
                    <span className="absolute top-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs text-zinc-600 shadow-sm ring-1 ring-zinc-900/[.08]">
                      <Spinner /> Making the new version…
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
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
function TryRow({ onPick, typing }: { onPick: (ex: Example) => void; typing: boolean }) {
  // The first set is fixed so the server and the browser draw the same page; then random.
  const [shown, setShown] = useState(() => EXAMPLES.slice(0, 4))
  const paused = useRef(false)
  // Still while the visitor writes: motion under the box pulls the eye away (Emil Kowalski review).
  const still = useRef(typing)
  still.current = typing
  useEffect(() => {
    const next = () =>
      setShown((prev) => {
        const pool = EXAMPLES.filter((x) => !prev.includes(x))
        return [...pool].sort(() => Math.random() - 0.5).slice(0, 4)
      })
    const t = setInterval(() => {
      if (!paused.current && !still.current && !document.hidden) next()
    }, 5000)
    return () => clearInterval(t)
  }, [])
  return (
    // From the message box's text edge, like Recent below: "Try" never moves
    // when the names change, and the two lists share one edge.
    // biome-ignore lint/a11y/noStaticElementInteractions: pausing on hover only, no action
    <div
      className="flex min-h-9 items-center gap-1 px-4 text-sm whitespace-nowrap"
      onMouseEnter={() => {
        paused.current = true
      }}
      onMouseLeave={() => {
        paused.current = false
      }}
    >
      <span className="mr-1 shrink-0 cursor-default text-zinc-500 select-none">Try</span>
      <div className="-my-1 py-1">
        <div className="flex w-max">
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
                  transition: { duration: 0.15, ease: 'easeOut' },
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
                      transition: { duration: 0.26, ease: [0.23, 1, 0.32, 1] },
                    },
                  }}
                >
                  {i > 0 && (
                    <span aria-hidden className="mr-1 cursor-default text-zinc-300 select-none">
                      ·
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPick(x)}
                    className="min-w-0 truncate px-2.5 text-sm text-zinc-800 hover:bg-zinc-200/70 hover:text-zinc-950"
                  >
                    {x.title}
                  </Button>
                </motion.span>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

/** The mark: the small logo (public/icon-96.png, drawn from icon.svg), and the assistant's avatar in the chat. */
function Mark() {
  return <img src="/icon-96.png" alt="" width={24} height={24} className="size-6 shrink-0" />
}

/** How chat replies and chips arrive: a 4px rise and a fade, 200ms, strong ease-out. */
const ENTER =
  'motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 animation-duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] fill-mode-both'

/** What is kept of a site in this browser (history.ts). */
type Kept = {
  messages: Message[]
  versions: { result: BuildResult; links: Record<string, string> }[]
  result: BuildResult
  look: string | null
  links: Record<string, string>
}

type Tone = { bg: string; dark: boolean }
const LIGHT: Tone = { bg: '#ffffff', dark: false }

/** The colour along the top edge of a page, and whether it is dark. */
function toneOf(doc: Document | null | undefined): Tone {
  const view = doc?.defaultView
  if (!doc?.body || !view) return LIGHT
  let el: Element | null = doc.elementFromPoint(view.innerWidth / 2, 1) ?? doc.body
  for (; el; el = el.parentElement) {
    const [r = 255, g = 255, b = 255, a = 1] = (
      view.getComputedStyle(el).backgroundColor.match(/[\d.]+/g) ?? []
    ).map(Number)
    if (a === 0) continue
    return { bg: `rgb(${r} ${g} ${b})`, dark: 0.2126 * r + 0.7152 * g + 0.0722 * b < 140 }
  }
  return LIGHT
}

/**
 * The phone preview as a real phone: an iPhone-sized screen (393 by 852,
 * the width sites are laid out at), its bezel, side buttons, Dynamic Island, a status bar in the
 * page's own top colour, and the home bar. It is scaled down as one piece when the window is
 * shorter, so the page inside keeps the phone's true width.
 */
const SCREEN = { w: 393, h: 852 }
const BEZEL = 11
function Phone({ tone, children }: { tone: Tone; children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const W = SCREEN.w + BEZEL * 2
  const H = SCREEN.h + BEZEL * 2
  useLayoutEffect(() => {
    const area = box.current?.parentElement
    if (!area) return
    const fit = () =>
      setScale(
        Math.max(0.35, Math.min(1, (area.clientHeight - 48) / H, (area.clientWidth - 48) / W)),
      )
    fit()
    const watch = new ResizeObserver(fit)
    watch.observe(area)
    return () => watch.disconnect()
  }, [H, W])
  const ink = tone.dark ? 'text-[#fff]' : 'text-black'
  return (
    <div ref={box} className="relative shrink-0" style={{ width: W * scale, height: H * scale }}>
      <div
        className="absolute top-0 left-0 origin-top-left rounded-[64px] bg-[#0b0b0a] shadow-[0_0_0_1.5px_#5b5b57,0_0_0_3px_#1c1c1a,0_40px_80px_-30px_rgb(9_9_11/0.45)]"
        style={{ width: W, height: H, padding: BEZEL, transform: `scale(${scale})` }}
      >
        {/* Side buttons: action and volume on the left, power on the right. */}
        <span
          aria-hidden
          className="absolute top-[118px] -left-[4px] h-[34px] w-[4px] rounded-l-sm bg-[#262624]"
        />
        <span
          aria-hidden
          className="absolute top-[178px] -left-[4px] h-[62px] w-[4px] rounded-l-sm bg-[#262624]"
        />
        <span
          aria-hidden
          className="absolute top-[254px] -left-[4px] h-[62px] w-[4px] rounded-l-sm bg-[#262624]"
        />
        <span
          aria-hidden
          className="absolute top-[212px] -right-[4px] h-[96px] w-[4px] rounded-r-sm bg-[#262624]"
        />
        <div
          className="relative size-full overflow-hidden rounded-[53px]"
          style={{ background: tone.bg }}
        >
          <div
            aria-hidden
            className={`flex h-[54px] items-center justify-between pr-7 pl-12 text-[16px] font-semibold tracking-tight ${ink}`}
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
            <span>9:41</span>
            <span className="flex items-center gap-1.5">
              <CellSignalFullIcon weight="fill" className="size-[17px]" />
              <WifiHighIcon weight="bold" className="size-[17px]" />
              <BatteryFullIcon weight="fill" className="size-[25px]" />
            </span>
          </div>
          <span
            aria-hidden
            className="absolute top-[11px] left-1/2 h-[36px] w-[124px] -translate-x-1/2 rounded-full bg-black"
          />
          <div className="absolute inset-x-0 top-[54px] bottom-0">{children}</div>
          <span
            aria-hidden
            className={`pointer-events-none absolute bottom-2 left-1/2 h-[5px] w-[136px] -translate-x-1/2 rounded-full ${tone.dark ? 'bg-[#fff]/90' : 'bg-black/85'}`}
          />
        </div>
      </div>
    </div>
  )
}

/** "Heritage lettering, navy" from a version's rules ("Atelier template · Heritage type · navy · …"). */
const styleOf = (rules: string) => {
  const parts = rules.split(' · ')
  const at = parts.findIndex((x) => x.endsWith(' type'))
  if (at < 0) return ''
  const type = `${parts[at]?.replace(/ type$/, '')} lettering`
  const colour = parts[at + 1]?.replace(/^neutral\b ?/, '').trim()
  return colour ? `${type}, ${colour}` : type
}

type StepState = 'done' | 'active' | 'todo'

/**
 * The build's steps as they stand (from the stream), in the rows the finished reply shows: the
 * words, then the page (the design choices and the check run alongside), then the photos. An edit
 * is one row.
 */
function liveSteps(p: Progress, elapsed: number, editing: boolean) {
  const now = seconds(elapsed)
  if (editing) return [{ label: 'Edit', state: 'active' as const, note: now }]
  return [
    p.words !== undefined
      ? { label: 'Words', state: 'done' as const, note: seconds(p.words) }
      : { label: 'Words', state: 'active' as const, note: now },
    p.words !== undefined
      ? { label: 'Page', state: 'active' as const, note: now }
      : { label: 'Page', state: 'todo' as const },
    { label: 'Photos', state: 'todo' as const },
  ]
}
/** The build's steps as a trace: done with a check, running with a spinner, waiting dimmed. */
function Steps({ steps }: { steps: { label: string; state: StepState; note?: string }[] }) {
  return (
    <Trace className="gap-1">
      {steps.map((s) => (
        <TraceLine
          key={s.label}
          className="text-xs"
          {...(s.state === 'active'
            ? { status: 'running' as const }
            : s.state === 'todo'
              ? { status: 'pending' as const }
              : {})}
        >
          <TraceIcon>
            {s.state === 'done' ? (
              <CheckIcon />
            ) : s.state === 'active' ? (
              <Spinner />
            ) : (
              <CircleIcon />
            )}
          </TraceIcon>
          <TraceTitle>{s.label}</TraceTitle>
          {s.note && <TraceDescription className="tabular-nums">{s.note}</TraceDescription>}
          <span className="sr-only">
            {s.state === 'done' ? ', done' : s.state === 'active' ? ', in progress' : ', waiting'}
          </span>
        </TraceLine>
      ))}
    </Trace>
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
              <Marker variant="border" className="mt-2 text-xs">
                <MarkerIcon>
                  <InfoIcon />
                </MarkerIcon>
                <MarkerContent>{notes.join(' ')}</MarkerContent>
              </Marker>
            )}
            {/* For someone new: how this was made, in plain rows. */}
            <TraceCollapsible className="mt-2 text-xs text-zinc-500">
              <TraceCollapsibleTrigger className="text-xs">
                <TraceTitle>Details</TraceTitle>
              </TraceCollapsibleTrigger>
              <TraceCollapsibleContent>
                <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
                  <dt className="text-zinc-400">Made in</dt>
                  <dd className="text-zinc-700 tabular-nums">
                    {seconds(r.ms.total)}
                    {p ? `, then photos in ${seconds(p.ms)}` : ''}
                  </dd>
                  <dt className="text-zinc-400">Cost</dt>
                  <dd className="text-zinc-700 tabular-nums">
                    ${(r.costUsd + (p?.costUsd ?? 0)).toFixed(4)}
                  </dd>
                  <dt className="text-zinc-400">Designs</dt>
                  <dd className="text-zinc-700">
                    {r.sites
                      .map((s) => {
                        const tags = [
                          / night ·/.test(s.rules) && 'dark',
                          s.rules.match(/ (snug|roomy) spacing/)?.[1],
                        ].filter(Boolean)
                        return tags.length ? `${s.label} (${tags.join(', ')})` : s.label
                      })
                      .join(', ')}
                  </dd>
                  {styleOf(r.sites[0]?.rules ?? '') && (
                    <>
                      <dt className="text-zinc-400">Style</dt>
                      <dd className="text-zinc-700">{styleOf(r.sites[0]?.rules ?? '')}</dd>
                    </>
                  )}
                  {p && p.credits.length > 0 && (
                    <>
                      <dt className="text-zinc-400">Photos by</dt>
                      <dd className="text-zinc-700">
                        {p.credits.map((c, i) => (
                          <span key={c.page}>
                            {i > 0 && ', '}
                            <a
                              href={c.page}
                              target="_blank"
                              rel="noreferrer"
                              className="underline decoration-zinc-300 underline-offset-2 hover:text-zinc-900"
                            >
                              {c.photographer}
                            </a>
                          </span>
                        ))}{' '}
                        <span className="text-zinc-400">on Pixabay</span>
                      </dd>
                    </>
                  )}
                </dl>
              </TraceCollapsibleContent>
            </TraceCollapsible>
          </div>
        )}
      </div>
    </div>
  )
}
