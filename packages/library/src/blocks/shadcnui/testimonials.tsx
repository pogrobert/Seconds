// What customers say, adapted from Shadcn UI Blocks testimonials-01 to -08 and -11 (MIT, see
// ../../../NOTICE.md). Only the owner's own quotes are shown. Social links, star ratings and stock
// portraits are removed (a rating is a fact we do not have); avatars show the person's initial;
// the marquee and carousels become a strip that scrolls sideways with no script.

import { Quote } from 'lucide-react'
import { type BlockProps, cx, type SiteContent } from '../../ui.tsx'
import { Initial, L } from './parts.tsx'

type T = NonNullable<SiteContent['testimonials']>[number]

function Head({ c }: BlockProps) {
  return (
    <>
      <h2 className="text-center text-4xl">{L.testimonials}</h2>
      <p className="text-muted-foreground mt-3.5 text-center text-xl md:text-2xl">{c.name}</p>
    </>
  )
}

function Person({ t, small }: { t: T; small?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Initial name={t.name} className={small ? 'size-9 text-lg' : undefined} />
      <div>
        <p className="font-medium">{t.name}</p>
        {t.role && <p className="text-muted-foreground text-sm">{t.role}</p>}
      </div>
    </div>
  )
}

function Masonry({ c, card, quote }: BlockProps & { card: string; quote?: boolean }) {
  if (!c.testimonials?.length) return null
  return (
    <section className="px-6 py-20">
      <Head c={c} />
      <div className="mx-auto mt-14 max-w-7xl columns-1 gap-8 md:columns-2 lg:mt-16 lg:columns-3">
        {c.testimonials.map((t) => (
          <figure
            key={t.name + t.quote}
            className={cx('relative mb-8 break-inside-avoid rounded-(--radius) p-6', card)}
          >
            {quote && (
              <Quote className="text-foreground/15 absolute end-4 top-4 size-12 fill-current stroke-0" />
            )}
            <figcaption>
              <Person t={t} />
            </figcaption>
            <blockquote className="mt-5 text-[17px]">{t.quote}</blockquote>
          </figure>
        ))}
      </div>
    </section>
  )
}

/** Muted cards in columns of uneven height (testimonials-01). */
export const Testimonials01 = ({ c }: BlockProps) => <Masonry c={c} card="bg-muted" />

/** Bordered cards in columns of uneven height (testimonials-02). */
export const Testimonials02 = ({ c }: BlockProps) => (
  <Masonry c={c} card="bg-card text-card-foreground border shadow-xs" />
)

/** Muted cards with a large quote mark in the corner (testimonials-03). */
export const Testimonials03 = ({ c }: BlockProps) => <Masonry c={c} card="bg-muted" quote />

/** A strip of cards that scrolls sideways, fading at both edges (testimonials-04). */
export function Testimonials04({ c }: BlockProps) {
  if (!c.testimonials?.length) return null
  return (
    <section className="py-20">
      <div className="px-6">
        <Head c={c} />
      </div>
      <div className="mt-14 mask-x-from-90%">
        <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-[10%] pb-4">
          {c.testimonials.map((t) => (
            <li
              key={t.name + t.quote}
              className="bg-accent text-accent-foreground w-80 shrink-0 snap-center rounded-(--radius) p-6 sm:w-96"
            >
              <Person t={t} />
              <blockquote className="mt-5 text-[17px]">{t.quote}</blockquote>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/** Centred quotes in a grid with dashed rules between them (testimonials-05). */
export function Testimonials05({ c }: BlockProps) {
  if (!c.testimonials?.length) return null
  return (
    <section className="px-6 py-20">
      <Head c={c} />
      <div className="mx-auto mt-8 grid max-w-7xl grid-cols-1 overflow-hidden sm:mt-14 md:grid-cols-2 lg:mt-16 lg:grid-cols-3">
        {c.testimonials.map((t) => (
          <figure
            key={t.name + t.quote}
            className="relative flex flex-col px-6 py-10 before:absolute before:inset-0 before:-m-px before:border-e before:border-b before:border-dashed"
          >
            <Quote className="text-primary mx-auto size-6 fill-current stroke-0" />
            <blockquote className="mx-auto my-6 max-w-md text-center text-[17px] text-pretty">
              {t.quote}
            </blockquote>
            <figcaption className="mt-auto flex justify-center">
              <Person t={t} small />
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

/** The first quote large on a soft card with a quote badge, the rest smaller below (testimonials-06). */
export function Testimonials06({ c }: BlockProps) {
  const [first, ...rest] = c.testimonials ?? []
  if (!first) return null
  return (
    <section className="px-6 py-20">
      <Head c={c} />
      <div className="mx-auto mt-14 w-full max-w-5xl lg:mt-16">
        <figure className="bg-accent text-accent-foreground relative rounded-(--radius) px-6 pt-14 pb-8 sm:px-10">
          <span className="bg-primary text-primary-foreground absolute start-6 -top-6 flex size-12 items-center justify-center rounded-full sm:start-10">
            <Quote className="size-6 fill-current stroke-0" />
          </span>
          <blockquote className="text-lg leading-normal font-medium sm:text-2xl lg:text-[1.75rem]">
            {first.quote}
          </blockquote>
          <figcaption className="mt-10">
            <Person t={first} />
          </figcaption>
        </figure>
        {rest.length > 0 && (
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {rest.map((t) => (
              <figure key={t.name + t.quote} className="bg-muted rounded-(--radius) p-6">
                <blockquote>{t.quote}</blockquote>
                <figcaption className="mt-4">
                  <Person t={t} small />
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function Cards({ c, muted }: BlockProps & { muted?: boolean }) {
  if (!c.testimonials?.length) return null
  return (
    <section className="mx-auto max-w-7xl px-6 py-12 sm:py-20">
      <Head c={c} />
      <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {c.testimonials.map((t) => (
          <figure
            key={t.name + t.quote}
            className={cx(
              'relative flex flex-col rounded-(--radius) border',
              muted ? 'bg-muted/70 px-5 pt-10 pb-1' : 'bg-card text-card-foreground pb-1 shadow-xs',
            )}
          >
            {muted && (
              <span
                aria-hidden="true"
                className="font-display text-foreground/30 absolute start-4 top-2 text-8xl leading-none"
              >
                &ldquo;
              </span>
            )}
            <blockquote className={cx('grow py-6 text-lg font-medium', !muted && 'px-5')}>
              {t.quote}
            </blockquote>
            <figcaption className={cx('border-t py-3.5', !muted && 'px-5')}>
              <Person t={t} />
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

/** Cards with the quote above a rule and the person below (testimonials-07). */
export const Testimonials07 = ({ c }: BlockProps) => <Cards c={c} />

/** The same on muted cards with a large opening quote mark (testimonials-08). */
export const Testimonials08 = ({ c }: BlockProps) => <Cards c={c} muted />

/** Large quotes one per slide, sliding sideways with no script (testimonials-11). */
export function Testimonials11({ c }: BlockProps) {
  if (!c.testimonials?.length) return null
  return (
    <section className="mx-auto max-w-7xl px-6 py-12 sm:py-20">
      <Head c={c} />
      <ul className="mx-auto mt-16 flex max-w-5xl snap-x snap-mandatory gap-6 overflow-x-auto pb-4">
        {c.testimonials.map((t) => (
          <li
            key={t.name + t.quote}
            className="bg-muted/70 relative w-full shrink-0 snap-center rounded-(--radius) border p-8"
          >
            <figure className="flex flex-col gap-6">
              <blockquote className="text-xl leading-relaxed font-medium sm:text-2xl sm:leading-[1.45] lg:text-3xl">
                {t.quote}
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <Initial name={t.name} className="size-12 text-xl" />
                <div>
                  <p className="text-lg font-medium">{t.name}</p>
                  {t.role && <p className="text-muted-foreground">{t.role}</p>}
                </div>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  )
}
