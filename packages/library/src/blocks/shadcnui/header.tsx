// Menu bars adapted from Shadcn UI Blocks navbar-01 to navbar-04 (MIT, see ../../../NOTICE.md).
// The logo becomes the business name, "Sign in" and "Get started" become the booking button,
// and the mobile sheet becomes a <details> menu that needs no script.

import { ArrowUpRight } from 'lucide-react'
import { type BlockProps, Button, Nav } from '../../ui.tsx'
import { MobileMenu } from './parts.tsx'

const Name = ({ c }: BlockProps) => (
  <a href="#top" className="font-display truncate text-xl">
    {c.name}
  </a>
)

function Right({ c, arrow }: BlockProps & { arrow?: boolean }) {
  return (
    <div className="flex shrink-0 items-center gap-3">
      <Button href={c.book} className="max-sm:hidden">
        {c.cta.label}
        {arrow && <ArrowUpRight className="size-4 rtl:-scale-x-100" />}
      </Button>
      <MobileMenu c={c} className="md:hidden" />
    </div>
  )
}

/** Name left, links centred, button right (navbar-01). */
export function Header01({ c }: BlockProps) {
  return (
    <header className="bg-background h-16 border-b">
      <nav className="mx-auto flex h-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Name c={c} />
        <Nav c={c} className="hidden shrink-0 md:flex" />
        <Right c={c} />
      </nav>
    </header>
  )
}

/** Name and links together on the left, button right (navbar-02). */
export function Header02({ c }: BlockProps) {
  return (
    <header className="bg-background h-16 border-b">
      <nav className="mx-auto flex h-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-12">
          <Name c={c} />
          <Nav c={c} className="hidden shrink-0 md:flex" />
        </div>
        <Right c={c} />
      </nav>
    </header>
  )
}

/** The same on a narrower measure, with an arrow on the button (navbar-03). */
export function Header03({ c }: BlockProps) {
  return (
    <header className="bg-background h-16 border-b">
      <nav className="mx-auto flex h-full max-w-5xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-8">
          <Name c={c} />
          <Nav c={c} className="text-muted-foreground hidden shrink-0 md:flex" />
        </div>
        <Right c={c} arrow />
      </nav>
    </header>
  )
}

/** A floating rounded bar that stays at the top while scrolling (navbar-04). */
export function Header04({ c }: BlockProps) {
  return (
    <header className="sticky top-0 z-40 px-4 pt-4">
      <nav className="bg-background/90 mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 rounded-full border px-4 ps-6 backdrop-blur">
        <Name c={c} />
        <Nav c={c} className="hidden shrink-0 md:flex" />
        <Right c={c} />
      </nav>
    </header>
  )
}
