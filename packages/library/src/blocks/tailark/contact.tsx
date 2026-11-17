// How to reach the business. Adapted from Tailark (MIT, see ../../../NOTICE.md): Mist contact one,
// Veil contact one and two. The enquiry forms are replaced by the owner's hours and a booking
// button, since a published page has nowhere to send a form; only details the owner gave appear.

import { type BlockProps, Button, hasVisit } from '../../ui.tsx'
import { HoursList, tel } from './parts.tsx'

function Details(p: BlockProps & { linkClassName: string; labelClassName: string }) {
  const { c } = p
  return (
    <>
      {c.phone && (
        <div>
          <h3 className={p.labelClassName}>Call</h3>
          <a href={tel(c.phone)} className={p.linkClassName}>
            {c.phone}
          </a>
        </div>
      )}
      {c.email && (
        <div>
          <h3 className={p.labelClassName}>Email</h3>
          <a href={`mailto:${c.email}`} className={`${p.linkClassName} break-all`}>
            {c.email}
          </a>
        </div>
      )}
      {c.address.length > 0 && (
        <div>
          <h3 className={p.labelClassName}>Address</h3>
          <address className="text-muted-foreground not-italic">{c.address.join(', ')}</address>
        </div>
      )}
    </>
  )
}

/** On a quiet band: contact details on the left, hours and booking in a card (Mist, contact one). */
export function ContactMistOne({ c }: BlockProps) {
  if (!hasVisit(c)) return null
  return (
    <section id="visit" className="bg-muted py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-4xl px-6 lg:px-0">
        <h2 className="text-4xl lg:text-5xl">Visit</h2>
        <p className="text-muted-foreground mt-4 text-lg">{c.name}</p>
        <div className="mt-12 grid gap-12 lg:grid-cols-5">
          <div className="grid grid-cols-2 gap-6 lg:col-span-2 lg:block lg:space-y-12">
            <Details
              c={c}
              labelClassName="mb-3 text-lg font-semibold"
              linkClassName="text-primary text-lg hover:underline"
            />
          </div>
          <div className="bg-card text-card-foreground rounded-xl p-8 shadow ring-1 ring-foreground/5 sm:p-12 lg:col-span-3">
            <h3 className="text-xl">{c.cta.headline}</h3>
            <p className="text-muted-foreground mt-4 text-sm">{c.cta.subhead}</p>
            <HoursList c={c} className="mt-8 space-y-3 border-t pt-6 text-sm" />
            <Button href={c.book} className="mt-8">
              {c.cta.label}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Serif heading, small labelled details beside an outlined card of hours (Veil, contact one). */
export function ContactVeilOne({ c }: BlockProps) {
  if (!hasVisit(c)) return null
  return (
    <section id="visit" className="bg-background @container py-24">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="text-balance text-4xl sm:text-5xl">Visit</h2>
        <p className="text-muted-foreground mt-4 max-w-md text-balance">{c.cta.subhead}</p>
        <div className="mt-12 grid gap-8 @xl:grid-cols-5">
          <div className="space-y-6 text-sm *:space-y-2 @xl:col-span-2">
            <Details
              c={c}
              labelClassName="text-foreground font-medium"
              linkClassName="text-muted-foreground hover:text-primary block"
            />
          </div>
          <div className="rounded-xl border p-6 @xl:col-span-3">
            {c.hours.length > 0 && (
              <>
                <h3 className="mb-4 text-sm font-medium">Hours</h3>
                <HoursList c={c} />
              </>
            )}
            <Button href={c.book} className="mt-6 w-full">
              {c.cta.label}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Centred heading over one outlined card with hours and details (Veil, contact two). */
export function ContactVeilTwo({ c }: BlockProps) {
  if (!hasVisit(c)) return null
  return (
    <section id="visit" className="bg-background @container py-24">
      <div className="mx-auto max-w-2xl px-6">
        <div className="text-center">
          <h2 className="text-balance text-4xl sm:text-5xl">Visit</h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-md text-balance">
            {c.cta.subhead}
          </p>
        </div>
        <div className="mt-12 grid gap-8 rounded-xl border p-8 @md:grid-cols-2">
          {c.hours.length > 0 && (
            <div>
              <h3 className="mb-4 text-sm font-medium">Hours</h3>
              <HoursList c={c} />
            </div>
          )}
          <div className="space-y-5 text-sm *:space-y-1">
            <Details
              c={c}
              labelClassName="text-foreground font-medium"
              linkClassName="text-muted-foreground hover:text-primary block"
            />
          </div>
          <Button href={c.book} className="w-full @md:col-span-2">
            {c.cta.label}
          </Button>
        </div>
      </div>
    </section>
  )
}
