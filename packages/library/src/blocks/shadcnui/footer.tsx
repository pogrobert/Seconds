// Footers adapted from Shadcn UI Blocks footer-01 to footer-05 (MIT, see ../../../NOTICE.md).
// The demo link columns become the business's own pages, hours, address and contact; the logo
// becomes its name; social icons and the newsletter form (which would have nowhere to send) are
// removed, the newsletter's place taken by the booking button or the opening hours.

import type { ReactNode } from 'react'
import { type BlockProps, Button, Container, cx, Nav } from '../../ui.tsx'
import { contacts, L, links } from './parts.tsx'

const year = () => new Date().getFullYear()

function Column(p: { title: string; children: ReactNode; tight?: boolean }) {
  return (
    <div>
      <h3 className="font-sans text-base font-medium [letter-spacing:normal] [text-transform:none]">
        {p.title}
      </h3>
      <ul className={cx('text-muted-foreground mt-6', p.tight ? 'space-y-1' : 'space-y-4')}>
        {p.children}
      </ul>
    </div>
  )
}

/** The columns a business can fill: its pages, hours, address and contact. */
function Columns({ c }: BlockProps) {
  const reach = contacts(c)
  return (
    <>
      <Column title={L.pages}>
        {links(c).map((l) => (
          <li key={l.href}>
            <a className="hover:text-foreground" href={l.href}>
              {l.label}
            </a>
          </li>
        ))}
      </Column>
      {c.hours.length > 0 && (
        <Column title={L.hours}>
          {c.hours.map((h) => (
            <li key={h.days}>
              <span className="text-foreground block">{h.days}</span>
              <span className="tabular-nums">{h.time}</span>
            </li>
          ))}
        </Column>
      )}
      {c.address.length > 0 && (
        <Column title={L.address} tight>
          {c.address.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </Column>
      )}
      {reach.length > 0 && (
        <Column title={L.contact}>
          {reach.map((r) => (
            <li key={r.href}>
              <a className="hover:text-foreground break-words" href={r.href}>
                {r.value}
              </a>
            </li>
          ))}
        </Column>
      )}
    </>
  )
}

function Bottom({ c, children, bare }: BlockProps & { children?: ReactNode; bare?: boolean }) {
  return (
    <div className="border-t">
      <Container
        wide
        className="flex flex-col-reverse items-center justify-between gap-x-2 gap-y-5 py-8 sm:flex-row"
      >
        <span className="text-muted-foreground">
          &copy; {year()}
          {!bare && ` ${c.name}`}
        </span>
        {children}
      </Container>
    </div>
  )
}

const Name = ({ c, className }: BlockProps & { className?: string }) => (
  <a href="#top" className={cx('font-display block text-2xl', className)}>
    {c.name}
  </a>
)

/** Columns across the top, the name and copyright beneath a rule (footer-01). */
export function Footer01({ c }: BlockProps) {
  return (
    <footer className="border-t">
      <Container wide className="grid grid-cols-2 gap-x-8 gap-y-10 py-12 md:grid-cols-4">
        <Columns c={c} />
      </Container>
      <Bottom c={c} bare>
        <Name c={c} className="text-xl" />
      </Bottom>
    </footer>
  )
}

/** The name and tagline in a wide first column, then the columns (footer-02). */
export function Footer02({ c }: BlockProps) {
  return (
    <footer className="border-t">
      <Container
        wide
        className="grid grid-cols-2 gap-x-8 gap-y-10 py-12 sm:grid-cols-3 lg:grid-cols-6"
      >
        <div className="col-span-full lg:col-span-2">
          <Name c={c} />
          <p className="text-muted-foreground mt-4 max-w-xs">{c.tagline}</p>
        </div>
        <Columns c={c} />
      </Container>
      <Bottom c={c} />
    </footer>
  )
}

/** Name and tagline, the columns, and a closing call to book (footer-03). */
export function Footer03({ c }: BlockProps) {
  return (
    <footer className="border-t">
      <Container
        wide
        className="grid grid-cols-2 gap-x-8 gap-y-10 py-12 sm:grid-cols-3 lg:grid-cols-4"
      >
        <div className="col-span-full">
          <Name c={c} />
          <p className="text-muted-foreground mt-4 max-w-md">{c.tagline}</p>
        </div>
        <Columns c={c} />
      </Container>
      <Bottom c={c}>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <span className="font-medium">{c.cta.headline}</span>
          <Button href={c.book}>{c.cta.label}</Button>
        </div>
      </Bottom>
    </footer>
  )
}

/** Name and links in a row on the left, hours on the right (footer-04). */
export function Footer04({ c }: BlockProps) {
  return (
    <footer className="border-t">
      <Container
        wide
        className="flex flex-col items-start justify-between gap-x-8 gap-y-10 py-12 sm:flex-row"
      >
        <div>
          <Name c={c} />
          <Nav c={c} className="text-muted-foreground mt-6 gap-x-4" />
        </div>
        {c.hours.length > 0 && (
          <div className="w-full max-w-xs">
            <h3 className="font-sans text-base font-medium [letter-spacing:normal] [text-transform:none]">
              {L.hours}
            </h3>
            <dl className="text-muted-foreground mt-6 space-y-2">
              {c.hours.map((h) => (
                <div key={h.days} className="flex justify-between gap-4">
                  <dt>{h.days}</dt>
                  <dd className="tabular-nums">{h.time}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </Container>
      <Bottom c={c}>
        <div className="text-muted-foreground flex flex-wrap gap-x-5 gap-y-2">
          {contacts(c).map((r) => (
            <a key={r.href} className="hover:text-foreground" href={r.href}>
              {r.value}
            </a>
          ))}
        </div>
      </Bottom>
    </footer>
  )
}

/** The name and links centred (footer-05). */
export function Footer05({ c }: BlockProps) {
  return (
    <footer className="border-t">
      <div className="flex flex-col items-center px-6 py-12 text-center">
        <Name c={c} />
        <Nav c={c} className="text-muted-foreground mt-6 justify-center gap-x-4" />
      </div>
      <Bottom c={c}>
        <div className="text-muted-foreground flex flex-wrap justify-center gap-x-5 gap-y-2">
          {contacts(c).map((r) => (
            <a key={r.href} className="hover:text-foreground" href={r.href}>
              {r.value}
            </a>
          ))}
        </div>
      </Bottom>
    </footer>
  )
}
