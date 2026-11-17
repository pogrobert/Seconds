// Calls to action. Adapted from efferd (MIT, see ../../../NOTICE.md): call-to-action 1, 2, 3 and
// 4. Each keeps its frame (ruled strip, button band, plus-marked box, rounded card); the second
// button now leads to the visit details when there are any. Call-to-action 5 (a newsletter sign-up
// with stock avatars) is not ported.

import { ArrowRight } from 'lucide-react'
import { type BlockProps, Button, hasVisit } from '../../ui.tsx'
import { Corners } from './parts.tsx'

function Buttons({ c, second = 'outline' }: BlockProps & { second?: 'outline' | 'ghost' }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {hasVisit(c) && (
        <Button href="#visit" variant={second}>
          Visit
        </Button>
      )}
      <Button href={c.book}>
        {c.cta.label}
        <ArrowRight aria-hidden className="size-4 rtl:rotate-180" />
      </Button>
    </div>
  )
}

/** Lines that run the full width of the page, above and below. */
const Rules = () => (
  <>
    <div className="pointer-events-none absolute -top-px left-1/2 w-screen -translate-x-1/2 border-t" />
    <div className="pointer-events-none absolute -bottom-px left-1/2 w-screen -translate-x-1/2 border-b" />
  </>
)

/** Heading on the left, buttons on the right, between two page-wide rules (efferd cta 1). */
export function CtaStrip({ c }: BlockProps) {
  return (
    <section className="overflow-hidden px-4 py-16">
      <div className="relative mx-auto flex w-full max-w-3xl flex-col justify-between border-x md:flex-row">
        <Rules />
        <div className="border-b p-4 md:border-b-0">
          <h2 className="text-center text-xl md:text-start md:text-2xl">{c.cta.headline}</h2>
          <p className="text-muted-foreground mt-1 text-center text-sm md:text-start">
            {c.cta.subhead}
          </p>
        </div>
        <div className="flex shrink-0 items-center justify-center p-4 md:border-s">
          <Buttons c={c} />
        </div>
      </div>
    </section>
  )
}

/** Centred words above a soft band that holds the buttons (efferd cta 2). */
export function CtaBand({ c }: BlockProps) {
  return (
    <section className="overflow-hidden px-4 py-16">
      <div className="relative mx-auto flex w-full max-w-3xl flex-col justify-between border-x">
        <Rules />
        <div className="border-b px-4 py-10">
          <h2 className="text-center text-2xl md:text-3xl">{c.cta.headline}</h2>
          <p className="text-muted-foreground mt-2 text-balance text-center md:text-lg">
            {c.cta.subhead}
          </p>
        </div>
        <div className="bg-secondary/80 p-4">
          <Buttons c={c} />
        </div>
      </div>
    </section>
  )
}

/** A box with plus marks on its corners and a dashed centre line (efferd cta 3). */
export function CtaCorners({ c }: BlockProps) {
  return (
    <section className="overflow-hidden px-4 py-20">
      <div className="relative isolate mx-auto flex w-full max-w-3xl flex-col justify-between gap-y-4 border-y px-4 py-10">
        <Corners />
        <div className="pointer-events-none absolute -inset-y-6 left-0 w-px border-l" />
        <div className="pointer-events-none absolute -inset-y-6 right-0 w-px border-r" />
        <div className="absolute top-0 left-1/2 -z-10 h-full border-l border-dashed" />
        <h2 className="text-center text-2xl md:text-4xl">{c.cta.headline}</h2>
        <p className="text-muted-foreground mx-auto max-w-xl text-balance text-center font-medium md:text-lg">
          {c.cta.subhead}
        </p>
        <div className="mt-2">
          <Buttons c={c} />
        </div>
      </div>
    </section>
  )
}

/** A rounded card with a soft shadow (efferd cta 4). */
export function CtaRounded({ c }: BlockProps) {
  return (
    <section className="px-4 py-20">
      <div className="bg-card text-card-foreground relative mx-auto flex w-full max-w-3xl flex-col justify-between gap-y-6 rounded-[2rem] border px-4 py-10 shadow-sm md:py-12">
        <div className="space-y-2">
          <h2 className="text-center text-2xl md:text-3xl">{c.cta.headline}</h2>
          <p className="text-muted-foreground text-balance text-center md:text-lg">
            {c.cta.subhead}
          </p>
        </div>
        <Buttons c={c} second="ghost" />
      </div>
    </section>
  )
}
