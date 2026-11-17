// Small pieces shared by the Tailark ports: menu bars, a vertical link list, contact lines, initials
// and a static accordion. Adapted from the header and accordion patterns in Tailark Mist, Veil and
// Dusk (MIT, see ../../../NOTICE.md); the menus and accordions there use client state, these do not.

import { ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'
import { type BlockProps, Button, Container, cx, hasVisit, type SiteContent } from '../../ui.tsx'

export const tel = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`

/** Two letters from a person's name, for a quiet circle where no photo was given. */
export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')

export function Avatar(p: {
  name: string
  photo?: SiteContent['photos']['hero']
  className?: string
}) {
  return (
    <div
      className={cx(
        'bg-muted text-muted-foreground relative flex shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-medium ring-1 ring-foreground/10',
        p.className ?? 'size-10',
      )}
    >
      {p.photo ? (
        <img
          className="photo size-full object-cover"
          src={p.photo.src}
          alt={p.photo.alt}
          width={p.photo.w}
          height={p.photo.h}
          loading="lazy"
        />
      ) : (
        <span aria-hidden>{initials(p.name)}</span>
      )}
    </div>
  )
}

/** The menu links as a column or a row, for footers and side lists. */
export function Links(p: BlockProps & { className?: string; linkClassName?: string }) {
  const link = cx('text-muted-foreground hover:text-foreground transition-colors', p.linkClassName)
  return (
    <ul className={p.className ?? 'space-y-3 text-sm'}>
      <li>
        <a href="#about" className={link}>
          About
        </a>
      </li>
      <li>
        <a href="#offer" className={link}>
          {p.c.offerTitle}
        </a>
      </li>
      {hasVisit(p.c) && (
        <li>
          <a href="#visit" className={link}>
            Visit
          </a>
        </li>
      )}
    </ul>
  )
}

/** Phone, email and address as lines; nothing for what the owner did not give. */
export function ContactLines(p: BlockProps & { className?: string; linkClassName?: string }) {
  const { c } = p
  if (!c.phone && !c.email && !c.address.length) return null
  const link = cx('hover:text-foreground transition-colors', p.linkClassName)
  return (
    <div className={p.className ?? 'text-muted-foreground space-y-2 text-sm'}>
      {c.address.length > 0 && <address className="not-italic">{c.address.join(', ')}</address>}
      {c.phone && (
        <p>
          <a href={tel(c.phone)} className={link}>
            {c.phone}
          </a>
        </p>
      )}
      {c.email && (
        <p>
          <a href={`mailto:${c.email}`} className={cx(link, 'break-all')}>
            {c.email}
          </a>
        </p>
      )}
    </div>
  )
}

/** Opening hours as a list of rows. */
export function HoursList(p: BlockProps & { className?: string }) {
  if (!p.c.hours.length) return null
  return (
    <dl className={p.className ?? 'space-y-2 text-sm'}>
      {p.c.hours.map((h) => (
        <div key={h.days} className="flex justify-between gap-4">
          <dt>{h.days}</dt>
          <dd className="text-muted-foreground tabular-nums">{h.time}</dd>
        </div>
      ))}
    </dl>
  )
}

/** A line under a list of questions: how to ask something else. */
export function AskMore(p: BlockProps & { className?: string }) {
  const { c } = p
  if (!c.phone && !c.email) return null
  return (
    <p className={p.className ?? 'text-muted-foreground mt-6'}>
      {c.phone && (
        <a href={tel(c.phone)} className="text-primary font-medium hover:underline">
          {c.phone}
        </a>
      )}
      {c.phone && c.email && <span className="mx-2">·</span>}
      {c.email && (
        <a
          href={`mailto:${c.email}`}
          className="text-primary font-medium break-all hover:underline"
        >
          {c.email}
        </a>
      )}
    </p>
  )
}

/** One question that opens without script (the static form of Tailark's accordion item). */
export function Question(p: {
  q: string
  a: string
  className?: string
  summaryClassName?: string
  answerClassName?: string
}) {
  return (
    <details className={cx('group', p.className)}>
      <summary
        className={cx(
          'flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium [&::-webkit-details-marker]:hidden',
          p.summaryClassName ?? 'text-base',
        )}
      >
        {p.q}
        <ChevronDown className="text-muted-foreground size-4 shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <p className={cx('pb-4', p.answerClassName ?? 'text-muted-foreground text-base')}>{p.a}</p>
    </details>
  )
}

/** The business name where a logo would be. */
export const Wordmark = (p: BlockProps & { className?: string }) => (
  <a href="#top" className={cx('font-display text-xl tracking-tight', p.className)}>
    {p.c.name}
  </a>
)

/**
 * Menu bars after the Tailark hero headers: "centre" puts the links in the middle (Mist and Veil),
 * "rule" sits on a bottom border (Dusk), "pill" floats as a small rounded bar (Veil hero five).
 */
export function Bar(
  p: BlockProps & {
    look?: 'centre' | 'rule' | 'pill' | 'float'
    wide?: boolean
    children?: ReactNode
  },
) {
  const { c } = p
  if (p.look === 'float')
    // Veil hero four's header: fixed at the top; once the page scrolls it draws in to a floating
    // pill with a ring and a blur behind it, and the links fade out (motion.ts, scroll-header).
    return (
      <>
        <div aria-hidden className="h-20" />
        <header data-m="scroll-header" className="group fixed inset-x-0 top-0 z-30 px-4 pt-3">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 rounded-xl px-5 py-3 transition-all duration-500 group-data-[scrolled]:bg-background/80 group-data-[scrolled]:max-w-3xl group-data-[scrolled]:shadow-lg group-data-[scrolled]:ring-1 group-data-[scrolled]:ring-border group-data-[scrolled]:backdrop-blur">
            <Wordmark c={c} className="truncate" />
            <Nav2
              c={c}
              className="transition duration-200 max-lg:hidden group-data-[scrolled]:opacity-0 group-data-[scrolled]:blur-xs"
            />
            <Button href={c.book}>{c.cta.label}</Button>
          </div>
        </header>
      </>
    )
  if (p.look === 'pill')
    return (
      <header className="relative z-20 pt-4">
        <div className="bg-foreground/5 mx-auto flex w-fit max-w-[calc(100%-2rem)] items-center gap-6 rounded-full py-2 pl-5 pr-2">
          <Wordmark c={c} className="truncate text-base" />
          <Nav2 c={c} className="max-md:hidden" />
          <Button href={c.book} variant="outline" className="h-8 rounded-full px-3">
            {c.cta.label}
          </Button>
        </div>
      </header>
    )
  return (
    <header className={cx('relative z-20', p.look === 'rule' && 'bg-background border-b')}>
      <Container
        wide={p.wide ?? p.look === 'rule'}
        className={cx(
          'relative flex flex-wrap items-center justify-between gap-6',
          p.look === 'rule' ? 'py-4' : 'py-5',
        )}
      >
        <Wordmark c={c} />
        <Nav2 c={c} className="max-lg:hidden" />
        <Button href={c.book}>{c.cta.label}</Button>
      </Container>
    </header>
  )
}

/** The menu links in a row with Tailark's muted tone. */
export function Nav2(p: BlockProps & { className?: string }) {
  return (
    <Links
      c={p.c}
      className={cx('flex flex-wrap items-center gap-x-8 gap-y-2 text-sm', p.className)}
    />
  )
}
