// Small pieces shared by the efferd ports: the grid pattern (efferd components/ui/grid-pattern,
// after Magic UI's free grid pattern), the plus marks at frame corners, a question that opens
// without script, and contact links. MIT, see ../../../NOTICE.md.

import { ChevronDown, Mail, MapPin, Menu, Phone, PlusIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { type BlockProps, Button, cx, hasVisit, Nav, type SiteContent } from '../../ui.tsx'

export const tel = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`
export const year = () => new Date().getFullYear()

/** The text colour at a given strength, for soft glows (inline: the class scanner skips commas). */
export const fg = (pct: number) => `color-mix(in oklab, var(--foreground) ${pct}%, transparent)`

/** Faint square grid, drawn once on the server. `id` must be unique on the page. */
export function GridPattern(p: {
  id: string
  size?: number
  x?: number
  y?: number
  className?: string
}) {
  const s = p.size ?? 40
  return (
    <svg
      aria-hidden="true"
      className={cx('pointer-events-none absolute inset-0 size-full fill-none', p.className)}
    >
      <defs>
        <pattern
          id={p.id}
          width={s}
          height={s}
          patternUnits="userSpaceOnUse"
          x={p.x ?? -1}
          y={p.y ?? -1}
        >
          <path d={`M.5 ${s}V.5H${s}`} fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${p.id})`} />
    </svg>
  )
}

/** A grid that fades out from the top of a card. */
export function CardGrid(p: { id: string; size?: number; className?: string }) {
  return (
    <div
      className="pointer-events-none absolute start-1/2 top-0 -ms-20 -mt-2 size-full"
      style={{ maskImage: 'radial-gradient(farthest-side at top, white, transparent)' }}
    >
      <GridPattern
        id={p.id}
        size={p.size}
        x={5}
        className={cx('stroke-foreground/15', p.className)}
      />
    </div>
  )
}

/** Plus marks on the four corners of a framed box (the box must be `relative`). */
export function Corners() {
  const c = 'absolute z-10 size-6 text-foreground/60'
  return (
    <>
      <PlusIcon aria-hidden className={cx(c, '-top-[12.5px] -left-[12.5px]')} strokeWidth={1} />
      <PlusIcon aria-hidden className={cx(c, '-top-[12.5px] -right-[12.5px]')} strokeWidth={1} />
      <PlusIcon aria-hidden className={cx(c, '-bottom-[12.5px] -left-[12.5px]')} strokeWidth={1} />
      <PlusIcon aria-hidden className={cx(c, '-right-[12.5px] -bottom-[12.5px]')} strokeWidth={1} />
    </>
  )
}

/** One question that opens and closes without script (in place of a Radix accordion). */
export function Question(p: {
  q: string
  a: string
  open?: boolean
  className?: string
  summaryClassName?: string
  answerClassName?: string
  children?: ReactNode
}) {
  return (
    <details className={cx('group', p.className)} open={p.open}>
      <summary
        className={cx(
          'flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 text-start text-[15px] font-medium leading-6 [&::-webkit-details-marker]:hidden',
          p.summaryClassName,
        )}
      >
        <span>{p.q}</span>
        <ChevronDown
          aria-hidden
          className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
        />
      </summary>
      <p className={cx('px-4 pb-4 text-muted-foreground', p.answerClassName)}>{p.a}</p>
      {p.children}
    </details>
  )
}

/** "Call … · Email …" under a list of questions, only with the details the owner gave. */
export function AskLine({ c, className }: BlockProps & { className?: string }) {
  if (!c.phone && !c.email) return null
  return (
    <p className={cx('flex flex-wrap gap-x-6 gap-y-1 text-muted-foreground', className)}>
      {c.phone && (
        <span>
          Call{' '}
          <a className="text-primary hover:underline" href={tel(c.phone)}>
            {c.phone}
          </a>
        </span>
      )}
      {c.email && (
        <span>
          Email{' '}
          <a className="text-primary break-all hover:underline" href={`mailto:${c.email}`}>
            {c.email}
          </a>
        </span>
      )}
    </p>
  )
}

/** The facts for a contact box: address, phone and email, each only when given. */
export function contactFacts(c: SiteContent) {
  const out: { key: string; icon: typeof Mail; label: string; value: string; href?: string }[] = []
  if (c.address.length)
    out.push({ key: 'address', icon: MapPin, label: 'Address', value: c.address.join(', ') })
  if (c.phone)
    out.push({ key: 'phone', icon: Phone, label: 'Call', value: c.phone, href: tel(c.phone) })
  if (c.email)
    out.push({
      key: 'email',
      icon: Mail,
      label: 'Email',
      value: c.email,
      href: `mailto:${c.email}`,
    })
  return out
}

/** Opening hours as a small definition list. */
export function HoursList({
  c,
  className,
  stacked,
}: BlockProps & { className?: string; stacked?: boolean }) {
  if (!c.hours.length) return null
  return (
    <dl className={cx('space-y-2 text-sm', className)}>
      {c.hours.map((h) => (
        <div key={h.days} className={stacked ? '' : 'flex justify-between gap-4'}>
          <dt>{h.days}</dt>
          <dd
            className={cx(
              'tabular-nums',
              stacked ? 'opacity-75' : 'text-muted-foreground shrink-0',
            )}
          >
            {h.time}
          </dd>
        </div>
      ))}
    </dl>
  )
}

/** The page links used by headers and footers. */
export function pageLinks(c: SiteContent) {
  const out = [
    { href: '#about', label: 'About' },
    { href: '#offer', label: c.offerTitle },
  ]
  if (hasVisit(c)) out.push({ href: '#visit', label: 'Visit' })
  return out
}

/** A menu that opens on small screens without script (in place of the portal menu). */
export function MobileMenu({ c, className }: BlockProps & { className?: string }) {
  return (
    <details className={cx('group md:hidden', className)}>
      <summary
        aria-label="Menu"
        className="flex size-10 cursor-pointer list-none items-center justify-center rounded-(--button-radius) border [&::-webkit-details-marker]:hidden"
      >
        <Menu aria-hidden className="size-5" />
      </summary>
      <div className="bg-background/95 absolute inset-x-0 top-full z-40 border-y p-4 backdrop-blur-lg">
        <Nav c={c} className="flex-col !items-start gap-y-4 text-base" />
        <Button href={c.book} className="mt-6 w-full">
          {c.cta.label}
        </Button>
      </div>
    </details>
  )
}
