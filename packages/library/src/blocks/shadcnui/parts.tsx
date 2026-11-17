// Small pieces shared by the Shadcn UI Blocks ports (MIT, see ../../../NOTICE.md): the plain labels
// a section may carry, a letter avatar in place of shadcn's Avatar, a mobile menu that needs no
// script, and a phone link.

import { Menu } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'
import { type BlockProps, Button, cx, hasVisit, type SiteContent } from '../../ui.tsx'

/** The only fixed words these blocks show. */
export const L = {
  about: 'About',
  visit: 'Visit',
  hours: 'Hours',
  address: 'Address',
  call: 'Call',
  email: 'Email',
  contact: 'Contact',
  faq: 'Questions',
  testimonials: 'Testimonials',
  team: 'Team',
  gallery: 'Gallery',
  pages: 'Pages',
} as const

export const tel = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`

/** The first letter of a name in a circle (shadcn Avatar with its fallback). */
export function Initial(p: { name: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        'bg-primary text-primary-foreground inline-flex shrink-0 items-center justify-center rounded-full font-medium',
        p.className ?? 'size-10 text-lg',
      )}
    >
      {p.name.trim().charAt(0)}
    </span>
  )
}

/** Links to the sections a page has, as a list (used by headers and footers). */
export function links(c: SiteContent) {
  return [
    { href: '#about', label: L.about },
    { href: '#offer', label: c.offerTitle },
    ...(hasVisit(c) ? [{ href: '#visit', label: L.visit }] : []),
  ]
}

/** A menu that opens with no script: a <details> with the links (replaces shadcn's Sheet). */
export function MobileMenu({ c, className }: BlockProps & { className?: string }) {
  return (
    <details className={cx('group relative', className)}>
      <summary
        aria-label="Menu"
        className="hover:bg-foreground/5 flex size-10 cursor-pointer list-none items-center justify-center rounded-(--button-radius) border"
      >
        <Menu className="size-5" />
      </summary>
      <div className="bg-background absolute end-0 top-12 z-30 w-60 rounded-(--radius) border p-4 shadow-lg">
        <ul className="space-y-3">
          {links(c).map((l) => (
            <li key={l.href}>
              <a href={l.href} className="hover:text-primary block transition-colors">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <Button href={c.book} className="mt-4 w-full">
          {c.cta.label}
        </Button>
      </div>
    </details>
  )
}

/** Plus icon that turns when its <details> opens. */
export function Toggle(p: { children?: ReactNode }) {
  return (
    <span className="text-muted-foreground shrink-0 transition-transform group-open:rotate-45">
      {p.children}
    </span>
  )
}

/** A fine grid of lines in a theme colour, as an inline style (the class scanner cannot read commas). */
export const gridLines = (size: number, color = 'var(--border)'): CSSProperties => ({
  backgroundImage: `linear-gradient(to right, ${color} 1px, transparent 1px), linear-gradient(to bottom, ${color} 1px, transparent 1px)`,
  backgroundSize: `${size}px ${size}px`,
})

/** Diagonal hatching in a theme colour. */
export const hatch = (deg: number, color = 'var(--border)'): CSSProperties => ({
  backgroundImage: `repeating-linear-gradient(${deg}deg, ${color} 0, ${color} 1px, transparent 0, transparent 50%)`,
  backgroundSize: '10px 10px',
})

/** The contact lines a business gave, as label and link pairs. */
export function contacts(c: SiteContent) {
  return [
    ...(c.phone ? [{ label: L.call, value: c.phone, href: tel(c.phone) }] : []),
    ...(c.email ? [{ label: L.email, value: c.email, href: `mailto:${c.email}` }] : []),
  ]
}
