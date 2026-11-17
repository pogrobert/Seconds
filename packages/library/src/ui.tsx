// Shared parts for library blocks: the content every block reads, and small building pieces
// (container, button, photo). Patterns adapted from Tailark (MIT, see ../NOTICE.md) and shadcn/ui.

import type { ReactNode } from 'react'

export type Photo = { src: string; alt: string; w: number; h: number }

/** What every block reads. Structurally the same as the rules engine's Content (grammar/page.ts). */
export type SiteContent = {
  name: string
  tagline: string
  headline: string
  subhead: string
  about: string
  reasons: { title: string; body: string }[]
  reasonsTitle: string
  offerTitle: string
  prices: { group: string; items: { name: string; detail?: string; price: string }[] }[]
  hours: { days: string; time: string }[]
  address: string[]
  phone: string
  email: string
  book: string
  cta: { headline: string; subhead: string; label: string }
  photos: { hero: Photo; about: Photo; cta: Photo; d1: Photo; d2: Photo }
  /**
   * Sections that need real facts. Each appears only when the owner gave them (or, for questions,
   * when the words could answer them truthfully); a block for these returns null without them.
   */
  faq?: { q: string; a: string }[]
  stats?: { value: string; label: string }[]
  testimonials?: { quote: string; name: string; role?: string }[]
  team?: { name: string; role: string; photo?: Photo }[]
}

export type BlockProps = { c: SiteContent }

export const cx = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(' ')

export const items = (c: SiteContent) => c.prices.flatMap((g) => g.items)
export const hasVisit = (c: SiteContent) =>
  !!(c.hours.length || c.address.length || c.phone || c.email)

export function Container(p: { children: ReactNode; className?: string; wide?: boolean }) {
  return (
    <div className={cx('mx-auto w-full px-6', p.wide ? 'max-w-7xl' : 'max-w-5xl', p.className)}>
      {p.children}
    </div>
  )
}

const BUTTON = {
  primary: 'bg-primary text-primary-foreground hover:opacity-90',
  outline: 'border border-foreground/20 bg-transparent text-foreground hover:bg-foreground/5',
  ghost: 'bg-transparent text-foreground hover:bg-foreground/5',
  light: 'bg-white text-neutral-900 hover:bg-white/90',
  glass: 'border border-white/60 bg-transparent text-white hover:bg-white/10',
}
export function Button(p: {
  href: string
  children: ReactNode
  variant?: keyof typeof BUTTON
  size?: 'md' | 'lg'
  className?: string
}) {
  return (
    <a
      href={p.href}
      className={cx(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors rounded-(--button-radius)',
        p.size === 'lg' ? 'h-12 px-6 text-base' : 'h-10 px-4 text-sm',
        BUTTON[p.variant ?? 'primary'],
        p.className,
      )}
    >
      {p.children}
    </a>
  )
}

export function Img(p: { photo: Photo; className?: string; eager?: boolean }) {
  return (
    <img
      className={cx('photo size-full object-cover', p.className)}
      src={p.photo.src}
      alt={p.photo.alt}
      width={p.photo.w}
      height={p.photo.h}
      loading={p.eager ? 'eager' : 'lazy'}
    />
  )
}

export const Eyebrow = (p: { children: ReactNode; className?: string }) => (
  <p className={cx('text-muted-foreground text-sm', p.className)}>{p.children}</p>
)

export function Nav(p: BlockProps & { className?: string }) {
  return (
    <ul className={cx('flex flex-wrap items-center gap-x-6 gap-y-2 text-sm', p.className)}>
      <li>
        <a href="#about" className="hover:text-primary transition-colors">
          About
        </a>
      </li>
      <li>
        <a href="#offer" className="hover:text-primary transition-colors">
          {p.c.offerTitle}
        </a>
      </li>
      {hasVisit(p.c) && (
        <li>
          <a href="#visit" className="hover:text-primary transition-colors">
            Visit
          </a>
        </li>
      )}
    </ul>
  )
}
