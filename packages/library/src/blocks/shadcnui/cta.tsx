// Calls to action adapted from Shadcn UI Blocks cta-02 to cta-07 (MIT, see ../../../NOTICE.md).
// App mock-ups and ASCII art become the business's photo; the hard-coded aurora gradient, the
// shader noise and the logo become washes and patterns in the theme's own colours.

import { ArrowUpRight } from 'lucide-react'
import { type BlockProps, Button, Img } from '../../ui.tsx'
import { gridLines } from './parts.tsx'

const Arrow = () => <ArrowUpRight className="size-5 rtl:-scale-x-100" />

/** Words over a photo darkened from one side (cta-02). */
export function Cta02({ c }: BlockProps) {
  return (
    <section className="px-0 py-20 sm:px-6">
      <div className="relative isolate mx-auto max-w-5xl overflow-hidden sm:rounded-(--radius) sm:shadow-lg">
        <div className="absolute inset-0 -z-10">
          <Img photo={c.photos.cta} />
        </div>
        <div className="bg-gradient-to-r from-black/85 to-black/40 px-10 py-14 rtl:bg-gradient-to-l md:py-20">
          <h2 className="max-w-xl text-4xl text-white sm:text-[2.6rem]">{c.cta.headline}</h2>
          <p className="mt-4 max-w-md text-lg text-white/85 md:text-xl/normal">{c.cta.subhead}</p>
          <Button href={c.book} size="lg" variant="light" className="mt-10 ring-4 ring-white/30">
            {c.cta.label} <Arrow />
          </Button>
        </div>
      </div>
    </section>
  )
}

/** A card shaded from muted, words left and a photo right (cta-03). */
export function Cta03({ c }: BlockProps) {
  return (
    <section className="px-0 py-16 sm:px-6">
      <div className="from-muted ring-border/60 relative mx-auto flex max-w-5xl flex-col justify-between gap-8 overflow-hidden bg-gradient-to-r px-10 ring-2 rtl:bg-gradient-to-l sm:rounded-(--radius) sm:shadow-lg md:flex-row">
        <div className="py-14">
          <h2 className="text-4xl lg:text-[2.5rem]">{c.cta.headline}</h2>
          <p className="text-muted-foreground mt-4 max-w-md text-xl/normal lg:text-2xl/normal">
            {c.cta.subhead}
          </p>
          <Button href={c.book} size="lg" className="mt-10">
            {c.cta.label} <Arrow />
          </Button>
        </div>
        <div className="-mx-10 aspect-[4/3] shrink-0 overflow-hidden md:mx-0 md:my-8 md:aspect-square md:h-72 md:rounded-(--radius)">
          <Img photo={c.photos.cta} />
        </div>
      </div>
    </section>
  )
}

/** A framed card on a faint circuit pattern, the photo fading out at the foot (cta-04). */
export function Cta04({ c }: BlockProps) {
  return (
    <section className="px-0 py-16 sm:px-6">
      <div className="bg-muted/50 mx-auto max-w-5xl border-y p-1 sm:rounded-xl sm:border-x">
        <div className="bg-background relative flex flex-col justify-between gap-8 overflow-hidden border px-10 sm:rounded-(--radius) md:flex-row">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-60"
            style={gridLines(20)}
          />
          <div className="relative isolate py-12">
            <h2 className="text-4xl lg:text-5xl/[1.2]">{c.cta.headline}</h2>
            <p className="text-muted-foreground mt-4 text-xl lg:text-2xl">{c.cta.subhead}</p>
            <Button href={c.book} size="lg" className="mt-10">
              {c.cta.label} <Arrow />
            </Button>
          </div>
          <div className="relative isolate -mx-10 aspect-[4/3] shrink-0 overflow-hidden mask-b-from-75% md:mx-0 md:mt-8 md:aspect-auto md:h-76 md:w-72 md:rounded-t-(--radius)">
            <Img photo={c.photos.cta} />
          </div>
        </div>
      </div>
    </section>
  )
}

/** A bright wash of the brand colour over a faint grid (cta-05). */
export function Cta05({ c }: BlockProps) {
  return (
    <section className="px-0 py-16 sm:px-6">
      <div className="relative isolate mx-auto max-w-5xl overflow-hidden border-y p-10 sm:rounded-(--radius) sm:border-x sm:p-14">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10"
          style={{
            background:
              'linear-gradient(150deg, color-mix(in oklab, var(--primary) 15%, var(--background)) 0%, var(--background) 45%, color-mix(in oklab, var(--primary) 45%, var(--background)) 100%)',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 opacity-60"
          style={gridLines(40)}
        />
        <h2 className="max-w-2xl text-4xl md:leading-tight lg:text-[2.75rem]">{c.cta.headline}</h2>
        <p className="text-muted-foreground mt-4 max-w-2xl text-xl/normal lg:text-[1.4rem]/normal">
          {c.cta.subhead}
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Button href={c.book} size="lg">
            {c.cta.label} <Arrow />
          </Button>
          <Button href="#offer" size="lg" variant="outline" className="bg-background/50">
            {c.offerTitle}
          </Button>
        </div>
      </div>
    </section>
  )
}

/** A bordered card with dots fading in from one side (cta-06). */
export function Cta06({ c }: BlockProps) {
  return (
    <section className="px-0 py-16 sm:px-6">
      <div className="relative isolate mx-auto max-w-5xl overflow-hidden border-y p-10 sm:rounded-(--radius) sm:border-x sm:p-14 sm:shadow-lg">
        <div
          aria-hidden="true"
          className="mask-l-from-10% absolute inset-0 -z-10"
          style={{
            backgroundImage:
              'radial-gradient(color-mix(in oklab, var(--foreground) 35%, transparent) 1px, transparent 1px)',
            backgroundSize: '12px 12px',
          }}
        />
        <h2 className="max-w-2xl text-4xl md:leading-tight lg:text-[2.75rem]">{c.cta.headline}</h2>
        <p className="text-muted-foreground mt-4 max-w-2xl text-xl/normal lg:text-[1.4rem]/normal">
          {c.cta.subhead}
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button href={c.book} size="lg">
            {c.cta.label} <Arrow />
          </Button>
          <Button href="#offer" size="lg" variant="outline">
            {c.offerTitle}
          </Button>
        </div>
      </div>
    </section>
  )
}

/** A rounded panel in the reverse of the page colours, centred (cta-07). */
export function Cta07({ c }: BlockProps) {
  return (
    <section className="px-4 py-16 sm:px-6">
      <div className="bg-foreground text-background mx-auto flex w-full max-w-5xl flex-col items-center justify-center rounded-2xl px-6 py-16 text-center">
        <p className="font-display text-lg opacity-70">{c.name}</p>
        <h2 className="mt-8 max-w-3xl text-5xl">{c.cta.headline}</h2>
        <p className="mx-auto mt-6 max-w-xl text-xl/normal opacity-70">{c.cta.subhead}</p>
        <a
          href={c.book}
          className="bg-background text-foreground mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-(--button-radius) px-6 font-medium transition-opacity hover:opacity-90"
        >
          {c.cta.label}
        </a>
      </div>
    </section>
  )
}
