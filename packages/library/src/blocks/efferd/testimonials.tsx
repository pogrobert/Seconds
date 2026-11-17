// What people say. Adapted from efferd (MIT, see ../../../NOTICE.md): testimonials 1 (columns of
// cards) and 2 (a grid of cards with a faint grid). The scrolling animation and the stock portraits
// are removed; a person's initials stand in for a photo. Only quotes the owner gave are shown.

import type { CSSProperties } from 'react'
import type { BlockProps, SiteContent } from '../../ui.tsx'
import { CardGrid } from './parts.tsx'

type T = NonNullable<SiteContent['testimonials']>[number]

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

function Badge({ name, size }: { name: string; size: string }) {
  return (
    <span
      aria-hidden
      className={`bg-muted text-muted-foreground flex shrink-0 items-center justify-center rounded-full text-xs font-medium ${size}`}
    >
      {initials(name)}
    </span>
  )
}

/** Cards stacked in up to three columns (efferd testimonials 1, standing still). */
export function TestimonialsColumns({ c }: BlockProps) {
  const list = c.testimonials ?? []
  if (!list.length) return null
  const n = Math.min(3, list.length)
  const cols: T[][] = Array.from({ length: n }, () => [])
  list.forEach((t, i) => {
    cols[i % n]?.push(t)
  })
  return (
    <section className="py-24">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mx-auto flex max-w-sm flex-col items-center justify-center gap-4">
          <h2 className="rounded-(--radius) border px-4 py-1 text-base">Testimonials</h2>
        </div>
        {/* testimonials 1's TestimonialsColumn: each column scrolls up without end, at its own
            speed, fading out at top and bottom (motion.ts, marquee-y). */}
        <div className="mt-10 flex max-h-[740px] flex-col items-center justify-center gap-6 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)] md:flex-row md:items-start">
          {cols.map((col, ci) => (
            <div
              key={col[0]?.name ?? ci}
              data-m="marquee-y"
              className="w-full max-w-xs"
              style={{ '--m-duration': `${15 + ci * 4}s` } as CSSProperties}
            >
              <div className="m-track gap-6 pb-6">
                {[0, 1].flatMap((copy) =>
                  col.map((t) => (
                    <figure
                      aria-hidden={copy === 1 || undefined}
                      key={`${copy}${t.quote}`}
                      className="bg-card text-card-foreground w-full rounded-3xl border p-8 shadow-lg"
                    >
                      <blockquote>{t.quote}</blockquote>
                      <figcaption className="mt-5 flex items-center gap-2">
                        <Badge name={t.name} size="size-10" />
                        <div className="flex flex-col">
                          <span className="font-medium leading-5 tracking-tight">{t.name}</span>
                          {t.role && (
                            <span className="leading-5 tracking-tight opacity-60">{t.role}</span>
                          )}
                        </div>
                      </figcaption>
                    </figure>
                  )),
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Small cards in a grid, each with a faint grid fading from its top (efferd testimonials 2). */
export function TestimonialsGrid({ c }: BlockProps) {
  const list = c.testimonials ?? []
  if (!list.length) return null
  return (
    <section className="relative w-full px-4 py-24">
      <div className="mx-auto max-w-5xl space-y-8">
        <h2 className="text-balance text-3xl md:text-4xl lg:text-5xl">Testimonials</h2>
        <div className="relative grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((t, i) => (
            <figure
              key={t.quote}
              data-m="reveal"
              data-m-delay={50 * i}
              className="bg-card text-card-foreground relative grid grid-cols-[auto_1fr] gap-x-3 overflow-hidden rounded-(--radius) border p-4 shadow"
            >
              <CardGrid id={`ef-quote-grid-${i}`} size={25} className="stroke-border" />
              <Badge name={t.name} size="size-9" />
              <div className="relative">
                <figcaption className="-mt-0.5 -space-y-0.5">
                  <p className="text-sm md:text-base">{t.name}</p>
                  {t.role && (
                    <span className="text-muted-foreground block text-xs tracking-tight">
                      {t.role}
                    </span>
                  )}
                </figcaption>
                <blockquote className="mt-3 text-sm tracking-wide">{t.quote}</blockquote>
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
