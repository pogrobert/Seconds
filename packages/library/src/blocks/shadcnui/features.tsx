// What the business offers and why to choose it, adapted from Shadcn UI Blocks features-03, -04,
// -05, -11, -12, -14, -17, -18 and -19 (MIT, see ../../../NOTICE.md). Product illustrations become
// the business's photos; the per-feature icons, which would not match real services, become one
// neutral mark or a number; "Learn more" links become the booking link.

import { ArrowRight, ArrowUpRight, Check, CircleCheck, Plus } from 'lucide-react'
import { type BlockProps, Button, Container, cx, Img, items } from '../../ui.tsx'
import { gridLines, hatch } from './parts.tsx'

const num = (i: number) => (i + 1).toString().padStart(2, '0')

/* ------------------------------------------------------------------ offer */

/** Two muted cards of services, each beside a photo, crossing over (features-03). */
export function Features03({ c }: BlockProps) {
  const all = items(c)
  const half = Math.ceil(all.length / 2)
  const groups = [
    { key: 'first', list: all.slice(0, half), photo: c.photos.d1 },
    { key: 'second', list: all.slice(half), photo: c.photos.d2 },
  ].filter((g) => g.list.length)
  return (
    <section id="offer" className="py-20">
      <Container wide>
        <h2 className="text-4xl">{c.offerTitle}</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-5 lg:grid-cols-3">
          {groups.map((g, gi) => {
            const card = (
              <div
                key={`card-${g.key}`}
                className="bg-muted col-span-1 rounded-(--radius) p-6 md:col-span-2 lg:col-span-1"
              >
                <div className="mb-6 aspect-video overflow-hidden rounded-(--radius) md:hidden">
                  <Img photo={g.photo} />
                </div>
                <ul className="space-y-5">
                  {g.list.map((i) => (
                    <li key={i.name} className="flex items-start gap-3">
                      <Check className="text-primary mt-0.5 size-5 shrink-0" />
                      <div className="min-w-0 grow">
                        <div className="flex items-baseline justify-between gap-3">
                          <h3 className="text-lg">{i.name}</h3>
                          {i.price && <span className="shrink-0 tabular-nums">{i.price}</span>}
                        </div>
                        {i.detail && <p className="text-muted-foreground mt-1">{i.detail}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
                <Button href={c.book} className="mt-8 w-full">
                  {c.cta.label} <ArrowRight className="size-4 rtl:-scale-x-100" />
                </Button>
              </div>
            )
            const photo = (
              <div
                key={`photo-${g.key}`}
                className="col-span-1 hidden min-h-72 overflow-hidden rounded-(--radius) md:col-span-3 md:block lg:col-span-2"
              >
                <Img photo={g.photo} />
              </div>
            )
            return gi % 2 === 0 ? [card, photo] : [photo, card]
          })}
        </div>
      </Container>
    </section>
  )
}

/** Services in cards set inside a soft frame, each with a booking button (features-11). */
export function Features11({ c }: BlockProps) {
  return (
    <section id="offer" className="py-20">
      <Container wide>
        <h2 className="text-center text-4xl">{c.offerTitle}</h2>
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items(c).map((i) => (
            <div key={i.name} className="bg-muted/75 rounded-(--radius) border p-1 shadow-xs">
              <div className="bg-background flex h-full flex-col rounded-[calc(var(--radius)-4px)] border px-6 py-7">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-lg">{i.name}</h3>
                  {i.price && <span className="text-primary shrink-0 tabular-nums">{i.price}</span>}
                </div>
                <p className="text-foreground/80 mt-4 grow">{i.detail}</p>
                <a
                  href={c.book}
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/80 me-auto mt-6 inline-flex h-8 items-center gap-1.5 rounded-(--button-radius) px-3 text-sm font-medium transition-colors"
                >
                  {c.cta.label} <ArrowUpRight className="size-4 rtl:-scale-x-100" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

/** Numbered services in a tight grid inside a muted frame (features-17). */
export function Features17({ c }: BlockProps) {
  return (
    <section id="offer" className="py-20">
      <Container wide>
        <h2 className="text-center text-4xl">{c.offerTitle}</h2>
        <div className="bg-muted mt-16 grid grid-cols-1 gap-1.5 border p-1.5 sm:grid-cols-2 lg:grid-cols-3">
          {items(c).map((i, n) => (
            <div key={i.name} className="bg-background relative -m-px border px-5 py-7">
              <span className="bg-muted/30 absolute end-0 top-0 border-s border-b px-2 py-0.5 font-mono text-xs">
                {num(n)}
              </span>
              <h3 className="pe-10 text-lg">{i.name}</h3>
              {i.detail && <p className="text-foreground/80 mt-2">{i.detail}</p>}
              {i.price && <p className="text-primary mt-4 font-medium tabular-nums">{i.price}</p>}
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

/** Centred services in a ruled grid with dashed guide lines running past it (features-18). */
export function Features18({ c }: BlockProps) {
  return (
    <section id="offer" className="overflow-clip px-8 py-24 text-center">
      <h2 className="mx-auto max-w-4xl text-4xl leading-[1.3]">{c.offerTitle}</h2>
      <div className="relative mx-auto mt-16 grid max-w-5xl grid-cols-1 border sm:grid-cols-2 lg:grid-cols-3">
        <div className="absolute -inset-y-14 start-0 -translate-x-px border-s border-dashed mask-y-from-95%" />
        <div className="absolute -inset-y-14 end-0 translate-x-px border-e border-dashed mask-y-from-95%" />
        <div className="absolute -inset-x-14 top-0 -translate-y-px border-t border-dashed mask-x-from-95%" />
        <div className="absolute -inset-x-14 bottom-0 translate-y-px border-b border-dashed mask-x-from-95%" />
        {items(c).map((i, n) => (
          <div
            key={i.name}
            className={cx(
              'relative -mt-px flex w-full flex-col items-center gap-2 border-t p-6 pt-9',
              n % 2 === 0 && 'bg-muted/40 sm:max-lg:border-e',
              n % 3 !== 2 && 'lg:border-e',
            )}
          >
            <h3 className="text-lg">{i.name}</h3>
            {i.detail && <p className="text-muted-foreground text-balance">{i.detail}</p>}
            {i.price && <p className="mt-auto pt-4 font-medium tabular-nums">{i.price}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}

/** A rounded muted panel: heading and button on top, services in a fine grid below (features-19). */
export function Features19({ c }: BlockProps) {
  return (
    <section id="offer" className="px-6 py-20 sm:py-28">
      <div className="bg-muted mx-auto max-w-5xl overflow-hidden rounded-2xl p-7 sm:p-12">
        <div className="flex flex-col gap-6 px-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-muted-foreground text-xs tracking-[0.15em] uppercase">{c.name}</p>
            <h2 className="mt-5 max-w-[18ch] text-4xl sm:text-5xl/[1.15]">{c.offerTitle}</h2>
          </div>
          <Button href={c.book} size="lg" className="self-start sm:self-auto">
            {c.cta.label} <ArrowRight className="size-4 rtl:-scale-x-100" />
          </Button>
        </div>
        <div className="bg-border/50 -mx-4 mt-12 -mb-4 grid gap-px overflow-hidden rounded-(--radius) sm:grid-cols-2 lg:grid-cols-3">
          {items(c).map((i) => (
            <article key={i.name} className="bg-background p-8">
              <CircleCheck aria-hidden="true" className="text-primary size-5" />
              <h3 className="mt-8 text-lg">{i.name}</h3>
              {i.detail && <p className="mt-2 text-sm leading-relaxed">{i.detail}</p>}
              {i.price && (
                <p className="text-muted-foreground mt-3 text-sm tabular-nums">{i.price}</p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ reasons */

/** Reasons as an open-and-close list beside a tall photo; the first is open (features-04). */
export function Features04({ c }: BlockProps) {
  return (
    <section className="py-20">
      <Container>
        <h2 className="max-w-lg text-4xl/snug">{c.reasonsTitle}</h2>
        <div className="mt-8 grid w-full gap-12 md:mt-12 md:grid-cols-2">
          <div className="divide-y border-b">
            {c.reasons.map((r, n) => (
              <details
                key={r.title}
                open={n === 0}
                className="group open:border-primary py-4 open:border-b-2 first:pt-0"
              >
                <summary className="flex cursor-pointer list-none items-center gap-4 text-lg">
                  <span className="text-muted-foreground font-mono text-sm">{num(n)}</span>
                  <h3 className="grow text-lg">{r.title}</h3>
                  <Plus className="text-muted-foreground size-5 shrink-0 transition-transform group-open:rotate-45" />
                </summary>
                <p className="text-muted-foreground ps-10 pt-3 text-[17px] leading-relaxed">
                  {r.body}
                </p>
              </details>
            ))}
          </div>
          <div className="hidden min-h-80 overflow-hidden rounded-(--radius) md:block">
            <Img photo={c.photos.about} />
          </div>
        </div>
      </Container>
    </section>
  )
}

/** Reasons in cards, each ending in a photo tucked into its corner (features-05). */
export function Features05({ c }: BlockProps) {
  const photos = [c.photos.d1, c.photos.d2, c.photos.about, c.photos.cta, c.photos.hero]
  return (
    <section className="px-6 py-20">
      <div className="mx-auto w-full max-w-5xl">
        <h2 className="text-center text-4xl">{c.reasonsTitle}</h2>
        <p className="text-muted-foreground mt-3 text-center text-lg md:text-2xl">{c.tagline}</p>
        <div
          className={cx(
            'mx-auto mt-16 grid w-full gap-x-6 gap-y-8',
            c.reasons.length > 1 && 'md:grid-cols-2',
            c.reasons.length > 2 && 'lg:grid-cols-3',
          )}
        >
          {c.reasons.map((r, n) => (
            <div
              key={r.title}
              className="bg-card text-card-foreground flex flex-col overflow-hidden rounded-(--radius) border"
            >
              <div className="p-6">
                <CircleCheck className="text-primary size-6" />
                <h3 className="mt-3 text-xl">{r.title}</h3>
                <p className="text-muted-foreground mt-2 text-[17px]">{r.body}</p>
              </div>
              <div className="ms-6 mt-auto h-40 overflow-hidden rounded-ss-(--radius)">
                <Img photo={photos[n % photos.length] ?? c.photos.d1} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Reasons in a ruled grid, opened by a title cell and a hatched cell (features-12). */
export function Features12({ c }: BlockProps) {
  return (
    <section className="py-20">
      <Container wide>
        <h2 className="text-center text-4xl">{c.reasonsTitle}</h2>
        <p className="text-muted-foreground mt-3 text-center text-xl sm:text-2xl">{c.tagline}</p>
        <div className="bg-card text-card-foreground mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <div className="-me-px flex min-h-16 items-center border px-6 text-lg font-medium sm:col-span-2 md:col-span-1">
            <CircleCheck className="text-primary me-4 shrink-0" /> {c.name}
          </div>
          <div
            className="-me-px hidden h-16 border md:block lg:col-span-2"
            style={hatch(315, 'var(--muted-foreground)')}
          />
          {c.reasons.map((r, n) => (
            <div key={r.title} className="-me-px -mt-px border px-5 pt-7 pb-5">
              <div className="flex items-center gap-3">
                <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-(--radius) font-mono text-sm">
                  {num(n)}
                </span>
                <h3 className="text-lg">{r.title}</h3>
              </div>
              <p className="text-foreground/80 mt-4">{r.body}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

/** Centred reason cards with a large mark on a fine grid that fades down (features-14). */
export function Features14({ c }: BlockProps) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 text-center">
      <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">{c.name}</p>
      <h2 className="mx-auto mt-5 max-w-[32ch] text-4xl/tight">{c.reasonsTitle}</h2>
      <p className="text-muted-foreground mt-5 text-xl sm:text-2xl">{c.tagline}</p>
      <div className="mt-16 flex flex-wrap justify-center gap-4">
        {c.reasons.map((r) => (
          <div
            key={r.title}
            className="from-foreground/[0.03] relative w-full overflow-hidden rounded-(--radius) border bg-gradient-to-b px-6 py-10 sm:max-w-xs"
          >
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                ...gridLines(20),
                maskImage:
                  'radial-gradient(ellipse 70% 60% at 50% 0%, black 40%, transparent 100%)',
              }}
            />
            <div className="isolate flex flex-col items-center gap-2">
              <CircleCheck className="text-foreground size-14 stroke-[1.5px]" />
              <h3 className="mt-8 text-xl">{r.title}</h3>
              <p className="text-muted-foreground text-balance">{r.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
