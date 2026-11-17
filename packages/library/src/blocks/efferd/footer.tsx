// Footers. Adapted from efferd (MIT, see ../../../NOTICE.md): footer 1 to 5. Link columns now hold
// the page links, the address, the hours and the contact details, each only when given. Social
// buttons, app-store badges, logos and the fade-in animation are removed. Footer 5 keeps its
// height and corner light but not its fixed-position reveal, which breaks in previews and thumbnails.

import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { type BlockProps, cx, type SiteContent } from '../../ui.tsx'
import { fg, HoursList, pageLinks, tel, year } from './parts.tsx'

type Group = { label: string; body: ReactNode }

/** The columns every footer draws from: pages, address, hours and contact. */
function groups(c: SiteContent, linkClass: string): Group[] {
  const out: Group[] = [
    {
      label: c.name,
      body: (
        <ul className="space-y-2">
          {pageLinks(c).map((l) => (
            <li key={l.href}>
              <a className={linkClass} href={l.href}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      ),
    },
  ]
  if (c.address.length)
    out.push({
      label: 'Visit',
      body: (
        <address className="not-italic">
          {c.address.map((l) => (
            <span key={l} className="block">
              {l}
            </span>
          ))}
        </address>
      ),
    })
  if (c.hours.length) out.push({ label: 'Hours', body: <HoursList c={c} stacked /> })
  if (c.phone || c.email)
    out.push({
      label: 'Contact',
      body: (
        <ul className="space-y-2">
          {c.phone && (
            <li>
              <a className={linkClass} href={tel(c.phone)}>
                {c.phone}
              </a>
            </li>
          )}
          {c.email && (
            <li>
              <a className={cx(linkClass, 'break-all')} href={`mailto:${c.email}`}>
                {c.email}
              </a>
            </li>
          )}
        </ul>
      ),
    })
  return out
}

const Copy = ({ c, className }: BlockProps & { className?: string }) => (
  <p className={className}>
    © {year()} {c.name}
  </p>
)

/** Name and tagline on the left, short columns on the right, inside side rules (efferd footer 1). */
export function FooterRuled({ c }: BlockProps) {
  const cols = groups(c, 'hover:underline').slice(1)
  return (
    <footer className="relative">
      <div className="mx-auto max-w-5xl lg:border-x">
        <div className="bg-border absolute inset-x-0 h-px w-full" />
        <div className="grid gap-8 p-4 py-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
            <a className="font-display max-w-md text-xl" href="#top">
              {c.name}
            </a>
            <p className="text-muted-foreground max-w-sm text-balance text-sm">{c.tagline}</p>
            <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {pageLinks(c).map((l) => (
                <li key={l.href}>
                  <a className="hover:underline" href={l.href}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          {cols.map((g) => (
            <div key={g.label} className="min-w-0 text-sm">
              <span className="text-muted-foreground text-xs">{g.label}</span>
              <div className="mt-2">{g.body}</div>
            </div>
          ))}
        </div>
        <div className="bg-border absolute inset-x-0 h-px w-full" />
        <div className="py-4">
          <Copy c={c} className="text-muted-foreground text-center text-sm font-light" />
        </div>
      </div>
    </footer>
  )
}

/** A rounded top edge with a soft glow, name and copyright beside link columns (efferd footer 2). */
export function FooterGlow({ c }: BlockProps) {
  const cols = groups(c, 'hover:text-foreground transition-colors').slice(1)
  return (
    <footer
      className="relative mx-auto mt-8 flex w-full max-w-5xl flex-col items-center justify-center rounded-t-[2rem] border-t px-4 py-10 md:rounded-t-[3rem] md:px-6"
      style={{ background: `radial-gradient(35% 128px at 50% 0%, ${fg(6)}, transparent)` }}
    >
      <div className="bg-foreground/20 absolute top-0 right-1/2 left-1/2 h-px w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full blur" />
      <div className="grid w-full gap-8 xl:grid-cols-3">
        <div data-m="reveal" data-m-delay={100} className="space-y-4">
          <p className="font-display text-xl">{c.name}</p>
          <Copy c={c} className="text-muted-foreground text-sm" />
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {pageLinks(c).map((l) => (
              <li key={l.href}>
                <a className="hover:text-primary transition-colors" href={l.href}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 xl:col-span-2">
          {cols.map((g, i) => (
            <div key={g.label} data-m="reveal" data-m-delay={200 + i * 100} className="min-w-0">
              <h3 className="text-xs">{g.label}</h3>
              <div className="text-muted-foreground mt-4 text-sm">{g.body}</div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}

/** Ruled columns, each topped by a link bar with an arrow (efferd footer 3). */
export function FooterCells({ c }: BlockProps) {
  const links = [...pageLinks(c), { href: c.book, label: c.cta.label }]
  const cols = groups(c, 'hover:text-foreground').slice(1)
  return (
    <footer
      className="border-t"
      style={{ background: `radial-gradient(35% 128px at 50% 0%, ${fg(5)}, transparent)` }}
    >
      <div className="relative mx-auto max-w-5xl px-4">
        <div
          className={cx(
            'relative grid grid-cols-1 border-x md:divide-x md:rtl:divide-x-reverse',
            links.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-4',
          )}
        >
          {links.map((l, i) => (
            <div key={l.href + l.label}>
              <a
                className={cx(
                  'hover:bg-foreground/5 flex items-center justify-between border-y p-2 text-sm md:border-t-0',
                  i === 0 && 'border-t-0',
                )}
                href={l.href}
              >
                <span className="font-medium">{l.label}</span>
                <ArrowRight aria-hidden className="size-4 rtl:rotate-180" />
              </a>
              {cols[i] && (
                <div className="p-2 pb-4">
                  <h3 className="text-foreground/75 mt-2 mb-4 text-xs font-medium tracking-wider uppercase">
                    {cols[i].label}
                  </h3>
                  <div className="text-muted-foreground text-xs">{cols[i].body}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center border-t p-3">
        <Copy c={c} className="text-muted-foreground text-xs" />
      </div>
    </footer>
  )
}

/** Up to four columns, a rule, then the copyright (efferd footer 4). */
export function FooterColumns({ c }: BlockProps) {
  const cols = groups(c, 'hover:text-foreground')
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <div className="grid grid-cols-1 gap-8 py-10 sm:grid-cols-2 md:grid-cols-4">
          {cols.map((g) => (
            <div key={g.label} className="min-w-0">
              <h3 className="mb-4 text-xs">{g.label}</h3>
              <div className="text-muted-foreground text-sm">{g.body}</div>
            </div>
          ))}
        </div>
        <div className="bg-border h-px" />
        <div className="text-muted-foreground py-4 text-center text-xs">
          <Copy c={c} />
        </div>
      </div>
    </footer>
  )
}

/** A tall footer with soft light in one corner (efferd footer 5, without the reveal). */
export function FooterLight({ c }: BlockProps) {
  const cols = groups(c, 'hover:text-foreground transition-colors').slice(1)
  return (
    <footer className="relative flex min-h-[28rem] w-full flex-col justify-between gap-5 overflow-hidden border-t px-4">
      <div aria-hidden className="absolute inset-0 isolate z-0 overflow-hidden">
        <div
          className="absolute top-0 left-0 h-[40rem] w-[17.5rem] -translate-y-1/2 -rotate-45 rounded-full"
          style={{
            background: `radial-gradient(68.54% 68.72% at 55.02% 31.46%, ${fg(6)} 0, ${fg(2)} 50%, ${fg(1)} 80%)`,
          }}
        />
        <div
          className="absolute top-0 left-0 h-[40rem] w-[7.5rem] -translate-y-1/2 -rotate-45 rounded-full"
          style={{
            background: `radial-gradient(50% 50% at 50% 50%, ${fg(4)} 0, ${fg(1)} 80%, transparent 100%)`,
          }}
        />
      </div>
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 pt-12 md:flex-row">
        <div data-m="reveal" data-m-delay={100} className="w-full max-w-sm space-y-4">
          <p className="font-display text-2xl">{c.name}</p>
          <p className="text-muted-foreground text-sm">{c.tagline}</p>
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {pageLinks(c).map((l) => (
              <li key={l.href}>
                <a className="hover:underline" href={l.href}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        {cols.map((g, i) => (
          <div
            key={g.label}
            data-m="reveal"
            data-m-delay={200 + i * 100}
            className="w-full min-w-0"
          >
            <h3 className="text-sm uppercase">{g.label}</h3>
            <div className="text-muted-foreground mt-4 text-sm">{g.body}</div>
          </div>
        ))}
      </div>
      <div className="text-muted-foreground relative mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 border-t py-4 text-sm md:flex-row">
        <Copy c={c} />
        <a className="hover:text-foreground" href={c.book}>
          {c.cta.label}
        </a>
      </div>
    </footer>
  )
}
