// Sections that make a page feel like a real site (docs/m0/19-fuller-pages.md): a statement in the
// owner's voice, how working with them goes, and who it is for. Our own blocks, in the Tailark
// patterns and tokens the rest of the library uses (MIT, see ../../../NOTICE.md). Each shows only
// what the words give and draws nothing without them.

import { type BlockProps, Container, cx, Eyebrow, Img } from '../../ui.tsx'

const pad = (i: number) => String(i + 1).padStart(2, '0')

/* -------------------------------------------------------------- statement */

/** Large words, centred, with the name under them. */
export function StatementLarge({ c }: BlockProps) {
  if (!c.statement) return null
  return (
    <section className="py-24 md:py-32">
      <Container>
        <blockquote className="mx-auto max-w-3xl text-center">
          <p className="font-display text-3xl leading-tight text-balance md:text-5xl">
            {c.statement}
          </p>
          <footer className="text-muted-foreground mt-8 text-sm">{c.name}</footer>
        </blockquote>
      </Container>
    </section>
  )
}

/** On the band colour, left-aligned, with a large quotation mark. */
export function StatementBand({ c }: BlockProps) {
  if (!c.statement) return null
  return (
    <section className="bg-band text-band-foreground py-20 md:py-28">
      <Container>
        <blockquote className="max-w-3xl">
          <span aria-hidden className="font-display block text-7xl leading-none opacity-40">
            “
          </span>
          <p className="font-display -mt-4 text-3xl leading-snug text-balance md:text-4xl">
            {c.statement}
          </p>
          <footer className="mt-8 text-sm opacity-70">{c.name}</footer>
        </blockquote>
      </Container>
    </section>
  )
}

/** Between two rules, beside a small photo. */
export function StatementPhoto({ c }: BlockProps) {
  if (!c.statement) return null
  return (
    <section className="py-20">
      <Container wide>
        <div className="grid items-center gap-10 border-y py-12 md:grid-cols-[1fr_2fr] md:gap-16">
          <div className="aspect-square max-w-xs overflow-hidden rounded-(--radius)">
            <Img photo={c.photos.d1} />
          </div>
          <blockquote>
            <p className="font-display text-2xl leading-snug text-balance md:text-4xl">
              {c.statement}
            </p>
            <footer className="text-muted-foreground mt-6 text-sm">{c.name}</footer>
          </blockquote>
        </div>
      </Container>
    </section>
  )
}

/* ------------------------------------------------------------------ steps */

/** Large numbers in a row. */
export function StepsNumbers({ c }: BlockProps) {
  const s = c.steps
  if (!s?.items.length) return null
  return (
    <section className="py-24">
      <Container wide>
        <h2 className="text-4xl">{s.title}</h2>
        <ol
          className={cx(
            'mt-12 grid gap-10 sm:grid-cols-2',
            s.items.length > 3 ? 'lg:grid-cols-4' : 'lg:grid-cols-3',
          )}
        >
          {s.items.map((x, i) => (
            <li key={x.title} className="border-t pt-6">
              <span className="font-display text-muted-foreground text-5xl">{pad(i)}</span>
              <h3 className="mt-4 text-xl">{x.title}</h3>
              <p className="text-muted-foreground mt-2 leading-relaxed">{x.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}

/** A line down the left, the heading beside it. */
export function StepsLine({ c }: BlockProps) {
  const s = c.steps
  if (!s?.items.length) return null
  return (
    <section className="py-24">
      <Container wide className="grid gap-12 md:grid-cols-[1fr_1.4fr]">
        <div>
          <h2 className="text-4xl md:sticky md:top-24">{s.title}</h2>
        </div>
        <ol className="relative border-s ps-8">
          {s.items.map((x, i) => (
            <li key={x.title} className="relative pb-10 last:pb-0">
              <span
                aria-hidden
                className="bg-primary text-primary-foreground absolute -start-[2.85rem] top-0 grid size-7 place-items-center rounded-full text-xs font-medium"
              >
                {i + 1}
              </span>
              <h3 className="text-xl">{x.title}</h3>
              <p className="text-muted-foreground mt-2 leading-relaxed">{x.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}

/** Cards on a quiet ground. */
export function StepsCards({ c }: BlockProps) {
  const s = c.steps
  if (!s?.items.length) return null
  return (
    <section className="bg-muted/60 py-24">
      <Container wide>
        <Eyebrow>{c.name}</Eyebrow>
        <h2 className="mt-2 text-4xl">{s.title}</h2>
        <ol
          className={cx(
            'mt-10 grid gap-4 sm:grid-cols-2',
            s.items.length > 3 ? 'lg:grid-cols-4' : 'lg:grid-cols-3',
          )}
        >
          {s.items.map((x, i) => (
            <li key={x.title} className="bg-background rounded-(--radius) border p-6">
              <span className="text-muted-foreground text-sm">Step {i + 1}</span>
              <h3 className="mt-3 text-lg">{x.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{x.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}

/* --------------------------------------------------------------- audience */

/** Two by two, in outlined boxes. */
export function AudienceGrid({ c }: BlockProps) {
  const a = c.audience
  if (!a?.items.length) return null
  return (
    <section className="py-24">
      <Container>
        <h2 className="text-4xl">{a.title}</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {a.items.map((x) => (
            <div key={x.title} className="rounded-(--radius) border p-6">
              <h3 className="text-xl">{x.title}</h3>
              <p className="text-muted-foreground mt-2 leading-relaxed">{x.body}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

/** The heading on the left, the groups listed between rules on the right. */
export function AudienceList({ c }: BlockProps) {
  const a = c.audience
  if (!a?.items.length) return null
  return (
    <section className="py-24">
      <Container wide className="grid gap-10 md:grid-cols-[1fr_1.6fr]">
        <h2 className="text-4xl">{a.title}</h2>
        <ul className="divide-y border-y">
          {a.items.map((x) => (
            <li key={x.title} className="grid gap-2 py-6 sm:grid-cols-[1fr_1.6fr] sm:gap-8">
              <h3 className="text-lg">{x.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{x.body}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}

/** A photo beside the groups. */
export function AudiencePhoto({ c }: BlockProps) {
  const a = c.audience
  if (!a?.items.length) return null
  return (
    <section className="py-24">
      <Container wide className="grid items-center gap-12 md:grid-cols-2">
        <div className="aspect-[4/5] overflow-hidden rounded-(--radius)">
          <Img photo={c.photos.d2} />
        </div>
        <div>
          <h2 className="text-4xl">{a.title}</h2>
          <ul className="mt-8 space-y-6">
            {a.items.map((x) => (
              <li key={x.title} className="border-s-2 ps-5">
                <h3 className="text-lg">{x.title}</h3>
                <p className="text-muted-foreground mt-1 leading-relaxed">{x.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  )
}
