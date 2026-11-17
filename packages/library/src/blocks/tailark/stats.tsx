// Figures the owner gave. Adapted from Tailark (MIT, see ../../../NOTICE.md): Mist stats one to
// four, Veil stats one, three and four, Dusk stats one and two. Every figure comes from the owner;
// none is shown when none was given. The globe image and bar decoration are removed.

import { ArrowRight } from 'lucide-react'
import { type BlockProps, Container, cx } from '../../ui.tsx'

/** Figures in one card, divided (Mist, stats one). */
export function StatsMistOne({ c }: BlockProps) {
  if (!c.stats?.length) return null
  return (
    <section className="bg-muted py-12 md:py-20">
      <Container>
        <h2 className="sr-only">{c.name}</h2>
        <div
          className={cx(
            'bg-card text-card-foreground grid gap-0.5 divide-y rounded-xl shadow ring-1 ring-foreground/5 *:py-8 *:text-center md:divide-x md:divide-y-0',
            c.stats.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2',
          )}
        >
          {c.stats.map((s) => (
            <div key={s.label}>
              <div className="text-4xl font-bold">{s.value}</div>
              <p className="text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

/** A heading and words, the figures in a row of four (Mist, stats two). */
export function StatsMistTwo({ c }: BlockProps) {
  if (!c.stats?.length) return null
  return (
    <section className="bg-muted/50 py-24">
      <Container>
        <h2 className="text-4xl lg:text-5xl">{c.name}</h2>
        <p className="text-muted-foreground mt-4 text-balance text-lg">{c.tagline}</p>
        <div className="mt-8 grid grid-cols-2 gap-4 md:mt-16 md:grid-cols-4">
          {c.stats.map((s) => (
            <div key={s.label}>
              <div className="text-4xl font-bold">{s.value}</div>
              <p className="text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

/** A short heading and the figures as a list with arrows (Mist, stats three). */
export function StatsMistThree({ c }: BlockProps) {
  if (!c.stats?.length) return null
  return (
    <section className="py-24">
      <Container>
        <h2 className="text-2xl">{c.name}</h2>
        <p className="text-muted-foreground mt-4 text-balance text-lg">{c.tagline}</p>
        <ul className="text-muted-foreground mt-8 space-y-2">
          {c.stats.map((s) => (
            <li key={s.label} className="-ml-0.5 flex items-center gap-1.5">
              <ArrowRight className="size-4 shrink-0 opacity-50" />
              <span className="text-foreground font-medium">{s.value}</span> {s.label}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}

/** The figures in primary colour beside a line of words (Mist, stats four). */
export function StatsMistFour({ c }: BlockProps) {
  if (!c.stats?.length) return null
  return (
    <section className="py-24">
      <Container>
        <h2 className="sr-only">{c.name}</h2>
        <div className="grid gap-8 md:grid-cols-[2fr_1fr] md:items-center">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {c.stats.map((s) => (
              <div key={s.label} className="space-y-0.5 md:text-center">
                <div className="text-primary text-4xl font-bold">{s.value}</div>
                <p className="text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 md:border-s md:border-t-0 md:ps-12 md:pt-0">
            <p className="text-muted-foreground text-balance text-lg">{c.tagline}</p>
          </div>
        </div>
      </Container>
    </section>
  )
}

/** Heading and words, the figures as ruled cells (Veil, stats one). */
export function StatsVeilOne({ c }: BlockProps) {
  if (!c.stats?.length) return null
  return (
    <section className="bg-background @container py-24">
      <div className="mx-auto max-w-2xl px-6">
        <div className="space-y-4">
          <h2 className="text-balance text-4xl">{c.name}</h2>
          <p className="text-muted-foreground text-balance">{c.tagline}</p>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-6 text-sm @xl:grid-cols-3">
          {c.stats.map((s) => (
            <div key={s.label} className="border-y py-6">
              <p className="text-muted-foreground text-xl">
                <span className="text-foreground font-medium">{s.value}</span> {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Heading and words, the figures in a single ruled row (Veil, stats three). */
export function StatsVeilThree({ c }: BlockProps) {
  if (!c.stats?.length) return null
  return (
    <section className="bg-background @container py-24">
      <div className="mx-auto max-w-2xl px-6">
        <div className="space-y-4">
          <h2 className="text-balance text-4xl">{c.name}</h2>
          <p className="text-muted-foreground text-balance">{c.tagline}</p>
        </div>
        <div className="mt-12 grid gap-6 text-sm @xl:grid-cols-3">
          {c.stats.map((s) => (
            <div key={s.label} className="border-t py-6">
              <p className="text-muted-foreground text-xl">
                <span className="text-foreground font-medium">{s.value}</span> {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Heading and words, the figures stacked as a ruled list (Veil, stats four). */
export function StatsVeilFour({ c }: BlockProps) {
  if (!c.stats?.length) return null
  return (
    <section className="bg-background @container border-b py-24">
      <div className="mx-auto max-w-2xl px-6">
        <div className="space-y-4">
          <h2 className="text-balance text-4xl">{c.name}</h2>
          <p className="text-muted-foreground text-balance">{c.tagline}</p>
        </div>
        <div className="mt-12 grid text-sm">
          {c.stats.map((s) => (
            <div key={s.label} className="border-t py-6">
              <p className="text-muted-foreground text-xl">
                <span className="text-foreground font-medium">{s.value}</span> {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Two-tone heading beside words, the figures low under a rule (Dusk, stats one). */
export function StatsDuskOne({ c }: BlockProps) {
  if (!c.stats?.length) return null
  return (
    <section className="py-16 md:py-20">
      <Container wide>
        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          <h2 className="text-muted-foreground max-w-4xl text-balance text-4xl lg:text-5xl">
            <span className="text-foreground">{c.name}.</span> <br /> {c.tagline}
          </h2>
          <div className="flex flex-col gap-16 md:mx-auto xl:gap-32">
            <p className="text-muted-foreground text-balance text-lg">{c.subhead}</p>
            <div className="grid gap-12 md:grid-cols-3">
              {c.stats.map((s) => (
                <div key={s.label} className="space-y-3 border-t pt-6">
                  <div className="text-4xl font-semibold tracking-tight">{s.value}</div>
                  <p className="text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

/** A large two-tone sentence, the figures far below it (Dusk, stats two). */
export function StatsDuskTwo({ c }: BlockProps) {
  if (!c.stats?.length) return null
  return (
    <section className="py-16 md:py-20">
      <Container wide>
        <p className="text-muted-foreground max-w-4xl text-balance text-4xl lg:text-5xl">
          <span className="text-foreground">{c.name}.</span> {c.tagline}
        </p>
        <div className="mt-24 grid gap-12 md:grid-cols-3 xl:mt-36">
          {c.stats.map((s) => (
            <div key={s.label} className="space-y-3 border-t pt-6">
              <div className="text-5xl font-semibold tracking-tight">{s.value}</div>
              <p className="text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
