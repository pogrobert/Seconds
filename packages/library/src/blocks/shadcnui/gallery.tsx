// Photo strips, adapted from Shadcn UI Blocks carousel-block-01 and -02 (MIT, see
// ../../../NOTICE.md). The demo 3D shapes become the business's photos and the carousel becomes a
// strip that scrolls sideways with no script.

import { type BlockProps, cx, Img } from '../../ui.tsx'

const SLOTS = ['d1', 'about', 'd2', 'cta', 'hero'] as const

function Strip({ c, className }: BlockProps & { className?: string }) {
  return (
    <ul className={cx('flex snap-x snap-mandatory gap-2 overflow-x-auto pb-3', className)}>
      {SLOTS.map((slot) => (
        <li
          key={slot}
          className="aspect-square w-[calc(50%-0.25rem)] shrink-0 snap-start overflow-hidden rounded-(--radius) md:w-[calc(33.333%-0.35rem)] lg:w-[calc(25%-0.4rem)]"
        >
          <Img photo={c.photos[slot]} />
        </li>
      ))}
    </ul>
  )
}

/** Heading and a link above a strip of square photos (carousel-block-01). */
export function Gallery01({ c }: BlockProps) {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <div className="flex items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl">{c.name}</h2>
          <p className="text-muted-foreground mt-2 text-lg leading-snug text-pretty">{c.tagline}</p>
        </div>
        <a
          href="#about"
          className="hover:bg-foreground/5 inline-flex h-8 shrink-0 items-center rounded-(--button-radius) border px-3 text-sm font-medium max-sm:hidden"
        >
          About
        </a>
      </div>
      <Strip c={c} className="mt-6" />
    </section>
  )
}

/** The same strip inside a raised card (carousel-block-02). */
export function Gallery02({ c }: BlockProps) {
  return (
    <section className="px-6 py-20">
      <div className="bg-card text-card-foreground ring-border/80 mx-auto w-full max-w-5xl rounded-xl p-6 shadow-xl ring-1">
        <div className="mb-5">
          <h2 className="text-3xl">{c.name}</h2>
          <p className="text-muted-foreground mt-2 text-lg leading-snug">{c.tagline}</p>
        </div>
        <Strip c={c} />
      </div>
    </section>
  )
}
