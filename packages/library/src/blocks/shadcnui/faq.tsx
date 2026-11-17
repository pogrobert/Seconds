// Questions and answers adapted from Shadcn UI Blocks faq-01, -02, -03, -06, -07, -08, -09, -10 and
// -14 (MIT, see ../../../NOTICE.md). Radix accordions become <details>, which open without a
// script; the topic icons, which would not match a real question, become one neutral mark.

import { ChevronDown, MessageCircleQuestion, Plus } from 'lucide-react'
import type { ReactNode } from 'react'
import { type BlockProps, cx } from '../../ui.tsx'
import { hatch, L } from './parts.tsx'

type QA = { q: string; a: string }

const SUMMARY =
  'flex cursor-pointer list-none items-center justify-between gap-4 text-start text-lg font-medium'

const Chevron = () => (
  <ChevronDown className="text-muted-foreground size-5 shrink-0 transition-transform group-open:rotate-180" />
)
const PlusMark = () => (
  <Plus className="text-muted-foreground size-5 shrink-0 transition-transform group-open:rotate-45" />
)

/** One question as a <details> row; `mark` sits at the end of the summary. */
function Row(p: {
  f: QA
  open?: boolean
  className?: string
  summary?: string
  answer?: string
  lead?: ReactNode
  mark?: ReactNode
}) {
  return (
    <details open={p.open} className={cx('group', p.className)}>
      <summary className={cx(SUMMARY, p.summary ?? 'py-4')}>
        <span className="flex items-center gap-3">
          {p.lead}
          <span>{p.f.q}</span>
        </span>
        {p.mark ?? <Chevron />}
      </summary>
      <p className={cx('pb-4 text-base', p.answer ?? 'text-muted-foreground')}>{p.f.a}</p>
    </details>
  )
}

const halves = (xs: QA[]) => {
  const h = Math.ceil(xs.length / 2)
  return [xs.slice(0, h), xs.slice(h)].filter((x) => x.length)
}

/** A narrow column, first answer open (faq-01). */
export function Faq01({ c }: BlockProps) {
  if (!c.faq?.length) return null
  return (
    <section className="px-6 py-20">
      <div className="mx-auto w-full max-w-xl">
        <h2 className="text-4xl leading-[1.15]">{L.faq}</h2>
        <div className="mt-6 divide-y border-b">
          {c.faq.map((f, n) => (
            <Row key={f.q} f={f} open={n === 0} />
          ))}
        </div>
      </div>
    </section>
  )
}

/** Heading on the left, the list on the right (faq-02). */
export function Faq02({ c }: BlockProps) {
  if (!c.faq?.length) return null
  return (
    <section className="px-6 py-20">
      <div className="mx-auto flex max-w-5xl flex-col items-start justify-center gap-x-12 gap-y-6 md:flex-row">
        <h2 className="shrink-0 text-[2.4rem]/[1.15] md:w-64">{L.faq}</h2>
        <div className="w-full max-w-xl divide-y border-b">
          {c.faq.map((f, n) => (
            <Row key={f.q} f={f} open={n === 0} />
          ))}
        </div>
      </div>
    </section>
  )
}

/** Two columns of questions with a plus that turns (faq-03). */
export function Faq03({ c }: BlockProps) {
  if (!c.faq?.length) return null
  return (
    <section className="px-6 py-20">
      <div className="mx-auto w-full max-w-5xl">
        <h2 className="text-[2.4rem]">{L.faq}</h2>
        <div className="mt-6 grid w-full gap-x-10 md:grid-cols-2">
          {halves(c.faq).map((col, n) => (
            <div key={n === 0 ? 'first' : 'second'} className="divide-y border-b">
              {col.map((f) => (
                <Row key={f.q} f={f} mark={<PlusMark />} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Rows stacked inside a muted frame (faq-06). */
export function Faq06({ c }: BlockProps) {
  if (!c.faq?.length) return null
  return (
    <section className="px-6 py-20">
      <div className="mx-auto w-full max-w-2xl">
        <h2 className="text-3xl/snug">{L.faq}</h2>
        <p className="text-muted-foreground mt-2 text-xl">{c.tagline}</p>
        <div className="bg-muted mt-8 rounded-xl border p-1 sm:mt-10">
          <div className="bg-border/20 space-y-px overflow-hidden rounded-(--radius) border">
            {c.faq.map((f, n) => (
              <Row
                key={f.q}
                f={f}
                open={n === 0}
                className="bg-background px-4"
                summary="pt-4 pb-3"
                mark={<PlusMark />}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/** Each question on its own muted card (faq-07). */
export function Faq07({ c }: BlockProps) {
  if (!c.faq?.length) return null
  return (
    <section className="px-6 py-20">
      <div className="mx-auto w-full max-w-2xl">
        <h2 className="text-4xl">{L.faq}</h2>
        <p className="text-muted-foreground mt-2 text-xl">{c.tagline}</p>
        <div className="mt-8 space-y-4 sm:mt-10">
          {c.faq.map((f, n) => (
            <Row
              key={f.q}
              f={f}
              open={n === 0}
              className="bg-muted rounded-(--radius) px-4"
              mark={<PlusMark />}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

/** Centred heading and numbered cards (faq-08). */
export function Faq08({ c }: BlockProps) {
  if (!c.faq?.length) return null
  return (
    <section className="px-6 py-12 sm:py-20">
      <h2 className="text-center text-[2.2rem]">{L.faq}</h2>
      <p className="text-muted-foreground mt-2 text-center text-lg md:text-2xl">{c.tagline}</p>
      <div className="mx-auto mt-16 max-w-3xl space-y-4">
        {c.faq.map((f, n) => (
          <Row
            key={f.q}
            f={f}
            className="bg-muted rounded-(--radius) px-5"
            answer="text-foreground"
            lead={<span className="hidden tabular-nums sm:inline-block">{n + 1}.</span>}
          />
        ))}
      </div>
    </section>
  )
}

/** Cards with a mark before each question and a dashed rule beside the answer (faq-09). */
export function Faq09({ c }: BlockProps) {
  if (!c.faq?.length) return null
  return (
    <section className="px-6 py-12 sm:py-20">
      <h2 className="text-center text-4xl">{L.faq}</h2>
      <p className="text-muted-foreground mt-3 text-center text-lg md:text-2xl">{c.tagline}</p>
      <div className="mx-auto mt-12 max-w-2xl space-y-4 sm:mt-16">
        {c.faq.map((f) => (
          <Row
            key={f.q}
            f={f}
            className="bg-muted rounded-(--radius) px-5"
            answer="text-foreground relative ms-2.5 border-s border-dashed border-foreground/15 ps-7"
            lead={<MessageCircleQuestion className="size-5 shrink-0" />}
          />
        ))}
      </div>
    </section>
  )
}

/** Two columns of cards tinted with the brand colour (faq-10). */
export function Faq10({ c }: BlockProps) {
  if (!c.faq?.length) return null
  return (
    <section className="px-6 py-12 sm:py-20">
      <h2 className="text-center text-4xl">{L.faq}</h2>
      <p className="text-muted-foreground mt-3 text-center text-lg md:text-2xl">{c.tagline}</p>
      <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 items-start gap-4 sm:mt-16 md:grid-cols-2">
        {halves(c.faq).map((col, n) => (
          <div key={n === 0 ? 'first' : 'second'} className="space-y-4">
            {col.map((f) => (
              <Row
                key={f.q}
                f={f}
                className="border-primary/20 bg-primary/10 rounded-(--radius) border px-5"
                answer="text-foreground ps-8"
                lead={<MessageCircleQuestion className="text-primary size-5 shrink-0" />}
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

/** Joined rows, each question behind a hatched box with a mark (faq-14). */
export function Faq14({ c }: BlockProps) {
  if (!c.faq?.length) return null
  return (
    <section className="px-6 py-12 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-3xl">{L.faq}</h2>
        <p className="text-muted-foreground mt-2.5 text-xl">{c.tagline}</p>
        <div className="mt-8">
          {c.faq.map((f, n) => (
            <details
              key={f.q}
              open={n === 0}
              className="group bg-muted/35 border border-b-0 last:border-b"
            >
              <summary className="flex cursor-pointer list-none items-stretch gap-2 font-medium group-open:border-b">
                <span
                  className="bg-muted/40 flex items-center justify-center border-e px-4"
                  style={hatch(n % 2 ? 45 : 315)}
                >
                  <MessageCircleQuestion className="fill-foreground/5 size-5" />
                </span>
                <span className="grow py-3.5 ps-2.5 text-start">{f.q}</span>
                <span className="flex items-center pe-5">
                  <Chevron />
                </span>
              </summary>
              <div className="bg-background relative px-5 py-5 ps-[4.5rem] text-base">
                <div className="border-foreground/10 absolute inset-y-0 start-[3.25rem] border-s border-dashed" />
                <p className="text-foreground/75">{f.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
