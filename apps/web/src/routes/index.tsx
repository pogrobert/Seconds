import { createFileRoute } from '@tanstack/react-router'
import { type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from 'react'
import { type BuildResult, buildSite } from '../server/build'

// The build page: chat on the left, the live site on the right (like Lovable or Meerlume's
// builder). Each message rebuilds the site from everything said so far; the header switches
// between the directions, which are all drawn on every build, so switching is instant.

export const Route = createFileRoute('/')({ component: Build })

type Message =
  | { role: 'user'; text: string }
  | { role: 'assistant'; text: string; result?: BuildResult }
  | { role: 'error'; text: string }

const EXAMPLES = [
  'A calm, upmarket hair colour studio in Leith. Unhurried appointments and honest advice.',
  'We cook everything over open fire. Dark room, a long bar, evenings only, a bit theatrical.',
  'A family dentist by the sea. Children actually like coming here.',
  'Electricians in Bristol: tidy, qualified, clear written quotes, we turn up when we say.',
]

const seconds = (ms: number) => `${(ms / 1000).toFixed(1)} s`

function Build() {
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<BuildResult | null>(null)
  const [look, setLook] = useState<string | null>(null)
  const [device, setDevice] = useState<'desktop' | 'phone'>('desktop')
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' })
  }, [messages, busy])

  async function send(text: string) {
    const words = text.trim()
    if (!words || busy) return
    const history = [...messages, { role: 'user', text: words } as Message]
    setMessages(history)
    setDraft('')
    setBusy(true)
    try {
      const r = await buildSite({
        data: { messages: history.filter((m) => m.role === 'user').map((m) => m.text) },
      })
      setResult(r)
      setLook(r.suggested)
      const label = r.sites.find((s) => s.id === r.suggested)?.label ?? r.suggested
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          text: `Built ${r.name}, a ${r.kindLabel}. It suits ${label} best; the other looks are above the preview. Tell me what to change.`,
          result: r,
        },
      ])
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

  return (
    <div className="flex h-dvh flex-col bg-stone-100 text-stone-900 antialiased">
      <header className="relative flex h-13 shrink-0 items-center gap-4 px-4">
        <span className="text-[15px] font-semibold tracking-tight">Builder</span>
        {result && <span className="truncate text-sm text-stone-500">{result.name}</span>}
        {result && (
          <nav
            aria-label="Looks"
            className="absolute left-1/2 flex -translate-x-1/2 gap-1 rounded-full bg-stone-200/70 p-1"
          >
            {result.sites.map((s) => (
              <button
                key={s.id}
                type="button"
                aria-pressed={s.id === site?.id}
                onClick={() => setLook(s.id)}
                className="relative rounded-full px-3.5 py-1.5 text-[13px] font-medium text-stone-600 transition-colors hover:text-stone-900 aria-pressed:bg-white aria-pressed:text-stone-900 aria-pressed:shadow-sm"
              >
                {s.label}
                {s.id === result.suggested && (
                  <span
                    title="Suggested"
                    className="ml-1.5 inline-block size-1.5 -translate-y-0.5 rounded-full bg-emerald-600"
                  />
                )}
              </button>
            ))}
          </nav>
        )}
        <div className="ml-auto flex items-center gap-1 rounded-full bg-stone-200/70 p-1">
          {(['desktop', 'phone'] as const).map((d) => (
            <button
              key={d}
              type="button"
              aria-pressed={device === d}
              onClick={() => setDevice(d)}
              className="rounded-full px-3 py-1.5 text-[13px] font-medium capitalize text-stone-600 hover:text-stone-900 aria-pressed:bg-white aria-pressed:text-stone-900 aria-pressed:shadow-sm"
            >
              {d}
            </button>
          ))}
        </div>
      </header>

      <div className="flex min-h-0 flex-1 gap-3 px-3 pb-3">
        <aside className="flex w-[400px] shrink-0 flex-col overflow-hidden" aria-label="Chat">
          <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto px-2 pt-2 pb-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col justify-end gap-4 pb-2">
                <div>
                  <h1 className="text-xl font-semibold tracking-tight">Describe the business</h1>
                  <p className="mt-1 text-sm text-stone-600">
                    Who it is, what it does and how it should feel. The site appears on the right in
                    about a second.
                  </p>
                </div>
                <div className="flex flex-col items-start gap-1.5">
                  {EXAMPLES.map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => send(ex)}
                      className="rounded-xl px-3 py-2 text-left text-[13px] leading-snug text-stone-700 transition-colors hover:bg-stone-200/70"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <ol className="flex flex-col gap-4">
                {messages.map((m, i) => (
                  <li key={i} className={m.role === 'user' ? 'flex justify-end' : ''}>
                    {m.role === 'user' ? (
                      <p className="max-w-[85%] rounded-2xl bg-white px-4 py-2.5 text-sm leading-relaxed shadow-sm">
                        {m.text}
                      </p>
                    ) : m.role === 'error' ? (
                      <p className="px-1 text-sm text-red-700">{m.text}</p>
                    ) : (
                      <div className="px-1 text-sm leading-relaxed">
                        <p>{m.text}</p>
                        {m.result && (
                          <p className="mt-1.5 text-xs text-stone-500">
                            Ready in {seconds(m.result.ms.total)}: choices{' '}
                            {seconds(m.result.ms.decide)}, words {seconds(m.result.ms.text)},
                            drawing {seconds(m.result.ms.render)}. Models cost $
                            {m.result.costUsd.toFixed(4)}. Measured on this computer.
                          </p>
                        )}
                      </div>
                    )}
                  </li>
                ))}
                {busy && (
                  <li className="px-1 text-sm text-stone-500" aria-live="polite">
                    Building<span className="animate-pulse">…</span>
                  </li>
                )}
              </ol>
            )}
          </div>
          <form
            onSubmit={onSubmit}
            className="shrink-0 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-stone-200 focus-within:ring-stone-400"
          >
            <label htmlFor="composer" className="sr-only">
              Message
            </label>
            <textarea
              id="composer"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKey}
              rows={3}
              placeholder={
                result ? 'What should change?' : 'A pilates studio in Deptford, small classes…'
              }
              className="block w-full resize-none bg-transparent px-2 py-1.5 text-sm leading-relaxed outline-none placeholder:text-stone-400"
            />
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] text-stone-400">
                Enter to send, Shift+Enter for a new line
              </span>
              <button
                type="submit"
                disabled={busy || !draft.trim()}
                className="rounded-xl bg-stone-900 px-3.5 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-stone-700 disabled:bg-stone-300"
              >
                {busy ? 'Building…' : 'Send'}
              </button>
            </div>
          </form>
        </aside>

        <main className="relative flex min-w-0 flex-1 items-stretch justify-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200">
          {site ? (
            <iframe
              key={`${site.id}-${result?.name}`}
              title={`${result?.name} in ${site.label}`}
              srcDoc={site.html}
              className={
                device === 'phone'
                  ? 'my-4 h-[calc(100%-2rem)] w-[390px] rounded-[28px] ring-8 ring-stone-900'
                  : 'h-full w-full'
              }
            />
          ) : (
            <div className="grid flex-1 place-items-center text-sm text-stone-400">
              {busy ? 'Building your site…' : 'Your site appears here.'}
            </div>
          )}
          {busy && site && (
            <div className="pointer-events-none absolute inset-0 bg-white/50 backdrop-blur-[1px]" />
          )}
        </main>
      </div>
    </div>
  )
}
