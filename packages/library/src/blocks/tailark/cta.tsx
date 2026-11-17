// Calls to action. Adapted from Tailark (MIT, see ../../../NOTICE.md): Mist call-to-action two and
// three, Veil call-to-action four, Dusk call-to-action one and two. Trial offers, plan prices and
// newsletter forms are removed; the button books or calls the business.

import { Check, ChevronRight, Phone } from 'lucide-react'
import { type BlockProps, Button, Container } from '../../ui.tsx'
import { tel } from './parts.tsx'

/** Heading on the left, buttons on the right (Mist, call-to-action two). */
export function CtaMistTwo({ c }: BlockProps) {
  return (
    <section className="py-12">
      <Container className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <h2 className="text-balance text-3xl lg:text-4xl">{c.cta.headline}</h2>
          <p className="text-muted-foreground mt-2">{c.cta.subhead}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {c.phone && (
            <Button href={tel(c.phone)} variant="outline" size="lg">
              <Phone className="size-4 opacity-50" />
              Call
            </Button>
          )}
          <Button href={c.book} size="lg">
            {c.cta.label}
          </Button>
        </div>
      </Container>
    </section>
  )
}

/** On a quiet band: a two-tone heading, words and buttons (Mist, call-to-action three). */
export function CtaMistThree({ c }: BlockProps) {
  return (
    <section className="bg-muted py-12 md:py-16">
      <Container>
        <h2 className="max-w-lg text-balance text-3xl lg:text-4xl">
          <span className="text-muted-foreground">{c.name}.</span> {c.cta.headline}
        </h2>
        <p className="mt-4 text-lg">{c.cta.subhead}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href={c.book}>
            {c.cta.label}
            <ChevronRight className="size-3.5 opacity-50" />
          </Button>
          {c.phone && (
            <Button href={tel(c.phone)} variant="outline">
              <Phone className="size-3.5 opacity-50" />
              {c.phone}
            </Button>
          )}
        </div>
      </Container>
    </section>
  )
}

/** A card: heading and reasons as ticks on one side, the button in a soft panel (Veil, four). */
export function CtaVeilFour({ c }: BlockProps) {
  return (
    <section className="bg-background @container py-24">
      <div className="mx-auto max-w-2xl px-6">
        <div className="grid gap-8 rounded-xl border p-6 @xl:grid-cols-2 md:p-8">
          <div>
            <h2 className="text-balance text-3xl">{c.cta.headline}</h2>
            <ul className="mt-6 space-y-2">
              {c.reasons.map((r) => (
                <li key={r.title} className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Check className="text-primary size-4 shrink-0" />
                  {r.title}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-muted/50 flex flex-col justify-center rounded-xl border p-6">
            <p className="text-muted-foreground text-sm">{c.cta.subhead}</p>
            <Button href={c.book} className="mt-6">
              {c.cta.label}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

/** A very large centred heading with two buttons (Dusk, call-to-action one). */
export function CtaDuskOne({ c }: BlockProps) {
  return (
    <section className="py-16 md:py-20">
      <Container wide>
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-balance text-4xl lg:text-5xl xl:text-6xl">{c.cta.headline}</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href={c.book} size="lg">
              {c.cta.label}
            </Button>
            {c.phone && (
              <Button href={tel(c.phone)} size="lg" variant="outline">
                Call
              </Button>
            )}
          </div>
        </div>
      </Container>
    </section>
  )
}

/** A very large heading with the button at its foot, right (Dusk, call-to-action two). */
export function CtaDuskTwo({ c }: BlockProps) {
  return (
    <section className="py-16 md:py-20">
      <Container wide>
        <div className="flex items-center justify-center gap-6 max-lg:flex-col max-lg:text-center lg:items-end lg:justify-between">
          <h2 className="max-w-4xl text-balance text-5xl xl:text-6xl">{c.cta.headline}</h2>
          <Button href={c.book} size="lg">
            {c.cta.label}
          </Button>
        </div>
      </Container>
    </section>
  )
}
