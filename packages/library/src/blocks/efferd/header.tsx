// Menu bars. Adapted from efferd (MIT, see ../../../NOTICE.md): header 1, 2 and 3. The scroll
// effect and the portal menu need script, so the bar is always solid and the small-screen menu is
// a <details> toggle. Sign-in buttons and product menus are removed; header 3's drop-down now lists
// what the business offers.

import { ChevronDown } from 'lucide-react'
import { type BlockProps, Button, hasVisit, items, Nav } from '../../ui.tsx'
import { MobileMenu } from './parts.tsx'

/** Full-width bar: name, links and the booking button (efferd header 1). */
export function HeaderBar({ c }: BlockProps) {
  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/70 sticky top-0 z-50 w-full border-b backdrop-blur-lg">
      <nav className="relative mx-auto flex min-h-14 w-full max-w-5xl items-center justify-between gap-4 px-4">
        <a
          href="#top"
          className="font-display hover:bg-foreground/5 rounded-md p-2 text-lg leading-tight"
        >
          {c.name}
        </a>
        <div className="hidden items-center gap-6 md:flex">
          <Nav c={c} />
          <Button href={c.book}>{c.cta.label}</Button>
        </div>
        <MobileMenu c={c} />
      </nav>
    </header>
  )
}

/** A floating rounded bar, narrower than the page (efferd header 2). */
export function HeaderFloat({ c }: BlockProps) {
  return (
    <div className="sticky top-0 z-50 w-full md:top-4 md:px-4">
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/70 relative mx-auto w-full max-w-4xl border-b backdrop-blur-lg md:rounded-(--radius) md:border md:shadow-sm">
        <nav className="flex min-h-14 w-full items-center justify-between gap-4 px-4 md:min-h-12 md:px-2">
          <a
            href="#top"
            className="font-display hover:bg-foreground/5 rounded-md p-2 leading-tight"
          >
            {c.name}
          </a>
          <div className="hidden items-center gap-6 md:flex">
            <Nav c={c} />
            <Button href={c.book}>{c.cta.label}</Button>
          </div>
          <MobileMenu c={c} />
        </nav>
      </header>
    </div>
  )
}

/** Name with links beside it and a drop-down of what is offered (efferd header 3). */
export function HeaderMenu({ c }: BlockProps) {
  const list = items(c).slice(0, 6)
  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/70 sticky top-0 z-50 w-full border-b backdrop-blur-lg">
      <nav className="relative mx-auto flex min-h-14 w-full max-w-5xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-5">
          <a
            href="#top"
            className="font-display hover:bg-foreground/5 rounded-md p-2 text-lg leading-tight"
          >
            {c.name}
          </a>
          <ul className="hidden items-center gap-1 text-sm md:flex">
            <li>
              <a href="#about" className="hover:bg-foreground/5 rounded-md px-3 py-2">
                About
              </a>
            </li>
            <li>
              <details className="group">
                <summary className="hover:bg-foreground/5 flex cursor-pointer list-none items-center gap-1 rounded-md px-3 py-2 [&::-webkit-details-marker]:hidden">
                  {c.offerTitle}
                  <ChevronDown
                    aria-hidden
                    className="size-3 transition-transform group-open:rotate-180"
                  />
                </summary>
                <div className="bg-muted/50 absolute start-4 top-full z-50 mt-2 rounded-(--radius) p-1">
                  <ul className="bg-card text-card-foreground grid w-[32rem] max-w-[80vw] grid-cols-2 gap-1 rounded-(--radius) border p-2 shadow">
                    {list.map((i) => (
                      <li key={i.name}>
                        <a
                          href="#offer"
                          className="hover:bg-foreground/5 flex flex-col rounded-md p-3 leading-snug"
                        >
                          <span className="font-medium">{i.name}</span>
                          {(i.detail || i.price) && (
                            <span className="text-muted-foreground text-xs">
                              {[i.detail, i.price].filter(Boolean).join(' · ')}
                            </span>
                          )}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </details>
            </li>
            {hasVisit(c) && (
              <li>
                <a href="#visit" className="hover:bg-foreground/5 rounded-md px-3 py-2">
                  Visit
                </a>
              </li>
            )}
          </ul>
        </div>
        <div className="hidden md:block">
          <Button href={c.book}>{c.cta.label}</Button>
        </div>
        <MobileMenu c={c} />
      </nav>
    </header>
  )
}
