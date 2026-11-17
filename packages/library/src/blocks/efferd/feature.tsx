// A ruled grid of cards, each with a faint grid fading from its top. Adapted from efferd (MIT, see
// ../../../NOTICE.md): feature 1 (feature-card and its page). The demo icons are replaced by a
// number, since nothing tells us which picture fits a reason; the same grid also lists the offer.

import type { BlockProps } from '../../ui.tsx'
import { items } from '../../ui.tsx'
import { CardGrid } from './parts.tsx'

const num = (i: number) => String(i + 1).padStart(2, '0')

/** The reasons in a ruled grid (efferd feature 1). */
export function ReasonsGrid({ c }: BlockProps) {
  return (
    <section className="py-24">
      <div className="mx-auto w-full max-w-5xl space-y-10 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-3xl md:text-4xl lg:text-5xl">{c.reasonsTitle}</h2>
        </div>
        <div className="grid grid-cols-1 border-s border-t sm:grid-cols-2 md:grid-cols-3">
          {c.reasons.map((r, i) => (
            <div key={r.title} className="relative overflow-hidden border-e border-b p-6">
              <CardGrid id={`ef-reason-grid-${i}`} />
              <span aria-hidden className="text-foreground/60 font-mono text-sm">
                {num(i)}
              </span>
              <h3 className="mt-10 text-base md:text-lg">{r.title}</h3>
              <p className="text-muted-foreground relative z-10 mt-2 text-sm">{r.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/** What is offered, in the same ruled grid, with prices (efferd feature 1). */
export function OfferGrid({ c }: BlockProps) {
  return (
    <section id="offer" className="py-24">
      <div className="mx-auto w-full max-w-5xl space-y-10 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-3xl md:text-4xl lg:text-5xl">{c.offerTitle}</h2>
        </div>
        <div className="grid grid-cols-1 border-s border-t sm:grid-cols-2 md:grid-cols-3">
          {items(c).map((it, i) => (
            <div
              key={it.name}
              className="relative flex flex-col overflow-hidden border-e border-b p-6"
            >
              <CardGrid id={`ef-offer-grid-${i}`} />
              <span className="text-foreground/75 relative z-10 font-mono text-sm tabular-nums">
                {it.price}
              </span>
              <h3 className="relative z-10 mt-10 text-base md:text-lg">{it.name}</h3>
              {it.detail && (
                <p className="text-muted-foreground relative z-10 mt-2 text-sm">{it.detail}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
