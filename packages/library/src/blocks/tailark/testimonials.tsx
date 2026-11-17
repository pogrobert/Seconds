// What people said. Adapted from Tailark (MIT, see ../../../NOTICE.md): Mist testimonials one, two,
// three and five; Veil testimonials one, two and four; Dusk testimonials one and two. Only words the
// owner gave appear; star ratings, company logos, videos and the carousel are removed, and each
// person is shown by their initials.

import { Quote } from 'lucide-react'
import { type BlockProps, Container, cx } from '../../ui.tsx'
import { Avatar } from './parts.tsx'

type T = NonNullable<BlockProps['c']['testimonials']>[number]

function Byline(p: { t: T; className?: string }) {
  return (
    <div className={cx('flex items-center gap-2 text-sm', p.className)}>
      <Avatar name={p.t.name} className="size-6 text-[0.6rem]" />
      <cite className="text-foreground font-medium not-italic">{p.t.name}</cite>
      {p.t.role && (
        <>
          <span aria-hidden className="bg-foreground/25 size-1 rounded-full" />
          <span className="text-muted-foreground">{p.t.role}</span>
        </>
      )}
    </div>
  )
}

/** Quotes with a primary rule down their side (Mist, testimonials one). */
export function TestimonialsMistOne({ c }: BlockProps) {
  if (!c.testimonials?.length) return null
  return (
    <section className="py-24">
      <Container className="grid gap-12 md:grid-cols-2">
        {c.testimonials.map((t) => (
          <blockquote
            key={t.quote}
            className="before:bg-primary relative max-w-xl pl-6 before:absolute before:inset-y-0 before:start-0 before:w-1 before:rounded-full"
          >
            <p className="text-lg">{t.quote}</p>
            <footer className="mt-4 flex items-center gap-2">
              <cite className="not-italic">{t.name}</cite>
              {t.role && (
                <>
                  <span aria-hidden className="bg-foreground/15 size-1 rounded-full" />
                  <span className="text-muted-foreground">{t.role}</span>
                </>
              )}
            </footer>
          </blockquote>
        ))}
      </Container>
    </section>
  )
}

/** Quotes as speech bubbles on a quiet band (Mist, testimonials two). */
export function TestimonialsMistTwo({ c }: BlockProps) {
  if (!c.testimonials?.length) return null
  return (
    <section className="bg-muted py-24">
      <Container className="@container">
        <div className="grid gap-6 @lg:grid-cols-2 @3xl:grid-cols-3">
          {c.testimonials.map((t) => (
            <figure key={t.quote}>
              <blockquote className="bg-background rounded-2xl rounded-bl px-4 py-3 ring-1 ring-foreground/10">
                <p>{t.quote}</p>
              </blockquote>
              <Byline t={t} className="mt-4" />
            </figure>
          ))}
        </div>
      </Container>
    </section>
  )
}

/** Plain quotes in three columns (Mist, testimonials three). */
export function TestimonialsMistThree({ c }: BlockProps) {
  if (!c.testimonials?.length) return null
  return (
    <section className="py-24">
      <Container className="@container">
        <div className="grid gap-6 @lg:grid-cols-2 @3xl:grid-cols-3 @3xl:gap-12">
          {c.testimonials.map((t) => (
            <figure key={t.quote}>
              <blockquote>
                <p className="my-4">{t.quote}</p>
              </blockquote>
              <Byline t={t} />
            </figure>
          ))}
        </div>
      </Container>
    </section>
  )
}

/** One quote centred on a quiet band, with a quote mark (Mist, testimonials five). */
export function TestimonialsMistFive({ c }: BlockProps) {
  const t = c.testimonials?.[0]
  if (!t) return null
  return (
    <section className="bg-muted py-24">
      <div className="mx-auto w-full max-w-2xl px-6 text-center">
        <Quote className="fill-background stroke-background mx-auto size-8 drop-shadow-sm" />
        <blockquote className="mt-6">
          <p className="text-xl">{t.quote}</p>
          <footer className="mt-6 flex flex-col items-center justify-center">
            <Avatar name={t.name} className="size-12 rounded-(--radius) text-sm" />
            <cite className="mt-2 text-lg font-medium not-italic">{t.name}</cite>
            {t.role && <span className="text-muted-foreground">{t.role}</span>}
          </footer>
        </blockquote>
      </div>
    </section>
  )
}

/** Small outlined cards: name and role above the quote (Veil, testimonials one). */
export function TestimonialsVeilOne({ c }: BlockProps) {
  if (!c.testimonials?.length) return null
  return (
    <section className="bg-background @container py-24">
      <div className="mx-auto max-w-2xl px-6">
        <div className="grid gap-3 @xl:grid-cols-2">
          {c.testimonials.map((t) => (
            <figure key={t.quote} className="space-y-3 rounded-2xl border p-4 text-sm">
              <figcaption className="flex gap-3">
                <Avatar name={t.name} className="size-5 text-[0.5rem]" />
                <p className="font-medium">
                  {t.name}
                  {t.role && (
                    <span className="text-muted-foreground ml-2 font-normal">{t.role}</span>
                  )}
                </p>
              </figcaption>
              <blockquote className="text-muted-foreground">{t.quote}</blockquote>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Outlined cards with a larger quote and the name at the foot (Veil, testimonials two). */
export function TestimonialsVeilTwo({ c }: BlockProps) {
  if (!c.testimonials?.length) return null
  return (
    <section className="bg-background @container py-24">
      <div className="mx-auto max-w-2xl px-6">
        <div className="grid gap-3 @xl:grid-cols-2">
          {c.testimonials.map((t) => (
            <figure key={t.quote} className="flex items-end gap-3 rounded-2xl border p-4 text-sm">
              <Avatar name={t.name} className="size-5 text-[0.5rem]" />
              <div className="space-y-6">
                <blockquote className="text-lg">{t.quote}</blockquote>
                <figcaption className="space-y-1">
                  <p className="text-muted-foreground text-sm font-medium">{t.name}</p>
                  {t.role && <p className="text-muted-foreground text-xs">{t.role}</p>}
                </figcaption>
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Quotes centred one after another, name beneath each (Veil, testimonials four). */
export function TestimonialsVeilFour({ c }: BlockProps) {
  if (!c.testimonials?.length) return null
  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-2xl space-y-16 px-6 text-center">
        {c.testimonials.map((t) => (
          <figure key={t.quote}>
            <blockquote className="text-balance text-xl">{t.quote}</blockquote>
            <figcaption className="mt-8 flex flex-col items-center justify-center gap-3">
              <Avatar name={t.name} />
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{t.name}</p>
                {t.role && <p className="text-muted-foreground text-xs">{t.role}</p>}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

/** One large quote card and the rest on the brand colour beside it (Dusk, testimonials one). */
export function TestimonialsDuskOne({ c }: BlockProps) {
  const [first, ...rest] = c.testimonials ?? []
  if (!first) return null
  return (
    <section className="py-16 md:py-20">
      <Container wide>
        <div className="grid gap-3 lg:grid-cols-5">
          <figure
            className={cx(
              'bg-muted relative flex min-h-96 flex-col justify-between gap-8 rounded-xl p-8 ring-1 ring-foreground/10',
              rest.length ? 'lg:col-span-3' : 'lg:col-span-full',
            )}
          >
            <blockquote className="max-w-lg text-3xl">{first.quote}</blockquote>
            <figcaption className="border-foreground/10 border-s ps-4">
              <p className="text-sm font-medium">{first.name}</p>
              {first.role && (
                <span className="text-muted-foreground block text-sm">{first.role}</span>
              )}
            </figcaption>
          </figure>
          {rest.length > 0 && (
            <div className="grid gap-3 lg:col-span-2">
              {rest.map((t) => (
                <figure
                  key={t.quote}
                  className="bg-primary text-primary-foreground flex flex-col justify-between gap-8 rounded-xl p-8"
                >
                  <blockquote className="max-w-lg text-balance text-2xl">{t.quote}</blockquote>
                  <figcaption className="border-primary-foreground/20 border-s ps-4">
                    <p className="text-sm font-medium">{t.name}</p>
                    {t.role && <span className="block text-sm opacity-65">{t.role}</span>}
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}

/** Large muted quotes, one under another, with a ruled byline (Dusk, testimonials two). */
export function TestimonialsDuskTwo({ c }: BlockProps) {
  if (!c.testimonials?.length) return null
  return (
    <section className="py-16 md:py-20">
      {/* Dusk two's AnimatePresence: one quote at a time, changing every few seconds (motion.ts,
          rotate); without the script every quote shows. */}
      <div data-m="rotate" className="mx-auto max-w-3xl space-y-20 px-6">
        {c.testimonials.map((t) => (
          <figure key={t.quote} data-m-item>
            <blockquote className="text-muted-foreground mb-10 text-2xl font-medium leading-snug md:text-4xl md:leading-tight">
              <span className="text-foreground">{t.quote}</span>
            </blockquote>
            <figcaption className="flex items-center gap-4">
              <Avatar name={t.name} />
              <div className="border-s ps-4">
                <p className="font-medium">{t.name}</p>
                {t.role && <p className="text-muted-foreground text-sm">{t.role}</p>}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
