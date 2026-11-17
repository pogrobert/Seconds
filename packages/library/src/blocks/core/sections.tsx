// Body sections. Adapted from Tailark (MIT, see ../../../NOTICE.md): content three and four, features
// two, call-to-action one, Veil call-to-action two, footer four, faqs one (layout only). Invented
// stats, testimonials and team members are removed: a section shows only what the owner gave.

import {
  type BlockProps,
  Button,
  Container,
  cx,
  Eyebrow,
  hasVisit,
  Img,
  items,
  Nav,
} from '../../ui.tsx'

/* ------------------------------------------------------------------ about */

/** A narrow column of words (Tailark Mist, content three). */
export function AboutColumn({ c }: BlockProps) {
  return (
    <section id="about" className="py-24">
      <Container>
        <div className="mx-auto max-w-2xl">
          <Eyebrow>About</Eyebrow>
          <p className="font-display mt-4 text-2xl leading-snug md:text-3xl">{c.about}</p>
        </div>
      </Container>
    </section>
  )
}

/** Photo and words side by side. */
export function AboutSplit({ c }: BlockProps) {
  return (
    <section id="about" className="py-24">
      <Container wide className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
        <div className="aspect-[4/3] overflow-hidden rounded-(--radius)">
          <Img photo={c.photos.about} />
        </div>
        <div>
          <h2 className="text-4xl">About {c.name}</h2>
          <p className="text-muted-foreground mt-6 text-lg leading-relaxed">{c.about}</p>
        </div>
      </Container>
    </section>
  )
}

/** Words over a quiet band, with the reasons beneath (Tailark Mist, content four). */
export function AboutBand({ c }: BlockProps) {
  return (
    <section id="about" className="bg-muted py-24">
      <Container>
        <div className="max-w-2xl">
          <h2 className="text-4xl">{c.reasonsTitle}</h2>
          <p className="text-muted-foreground mt-4 text-lg">{c.about}</p>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {c.reasons.map((r) => (
            <div key={r.title} className="space-y-2">
              <h3 className="text-xl">{r.title}</h3>
              <p className="text-muted-foreground">{r.body}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

/* ------------------------------------------------------------------ offer */

/** Cards in a grid (Tailark Mist, features two). */
export function OfferCards({ c }: BlockProps) {
  return (
    <section id="offer" className="bg-muted/50 py-24">
      <Container>
        <h2 className="text-4xl">{c.offerTitle}</h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {items(c).map((i) => (
            <div
              key={i.name}
              className="bg-card text-card-foreground rounded-(--radius) p-6 ring-1 ring-foreground/5"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-lg">{i.name}</h3>
                {i.price && (
                  <span className="text-muted-foreground shrink-0 text-sm">{i.price}</span>
                )}
              </div>
              {i.detail && <p className="text-muted-foreground mt-3">{i.detail}</p>}
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

/** A list with rules between rows, like a menu or price list. */
export function OfferList({ c }: BlockProps) {
  return (
    <section id="offer" className="py-24">
      <Container className="grid gap-10 md:grid-cols-[1fr_2fr]">
        <h2 className="text-4xl">{c.offerTitle}</h2>
        <ul className="divide-border divide-y border-y">
          {items(c).map((i) => (
            <li key={i.name} className="flex items-baseline justify-between gap-6 py-5">
              <div>
                <h3 className="text-lg">{i.name}</h3>
                {i.detail && <p className="text-muted-foreground mt-1 text-sm">{i.detail}</p>}
              </div>
              {i.price && <span className="shrink-0 tabular-nums">{i.price}</span>}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}

/** Large photo beside a short list. */
export function OfferPhoto({ c }: BlockProps) {
  return (
    <section id="offer" className="py-24">
      <Container wide className="grid items-start gap-10 md:grid-cols-2 md:gap-16">
        <div>
          <h2 className="text-4xl">{c.offerTitle}</h2>
          <ul className="mt-8 space-y-6">
            {items(c).map((i) => (
              <li key={i.name} className="border-l-2 border-primary pl-4">
                <h3 className="text-lg">
                  {i.name}
                  {i.price && <span className="text-muted-foreground ml-3 text-sm">{i.price}</span>}
                </h3>
                {i.detail && <p className="text-muted-foreground mt-1">{i.detail}</p>}
              </li>
            ))}
          </ul>
        </div>
        <div className="aspect-[4/5] overflow-hidden rounded-(--radius) md:sticky md:top-8">
          <Img photo={c.photos.d1} />
        </div>
      </Container>
    </section>
  )
}

/* ------------------------------------------------------------------ reasons */

/** Three reasons in columns. */
export function ReasonsColumns({ c }: BlockProps) {
  return (
    <section className="py-24">
      <Container>
        <h2 className="text-4xl">{c.reasonsTitle}</h2>
        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {c.reasons.map((r) => (
            <div key={r.title} className="border-t pt-6">
              <h3 className="text-xl">{r.title}</h3>
              <p className="text-muted-foreground mt-3">{r.body}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

/** Three reasons on a band of the brand colour. */
export function ReasonsBand({ c }: BlockProps) {
  return (
    <section className="bg-band text-band-foreground py-24">
      <Container>
        <h2 className="text-4xl">{c.reasonsTitle}</h2>
        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {c.reasons.map((r) => (
            <div key={r.title}>
              <h3 className="text-xl">{r.title}</h3>
              <p className="mt-3 opacity-85">{r.body}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

/* ------------------------------------------------------------------ gallery */

/** Three photos in an uneven grid. */
export function GalleryMosaic({ c }: BlockProps) {
  return (
    <section className="py-12">
      <Container wide className="grid gap-4 md:grid-cols-3 md:grid-rows-2">
        <div className="aspect-[4/3] overflow-hidden rounded-(--radius) md:col-span-2 md:row-span-2 md:aspect-auto">
          <Img photo={c.photos.d1} />
        </div>
        <div className="aspect-[4/3] overflow-hidden rounded-(--radius)">
          <Img photo={c.photos.d2} />
        </div>
        <div className="aspect-[4/3] overflow-hidden rounded-(--radius)">
          <Img photo={c.photos.cta} />
        </div>
      </Container>
    </section>
  )
}

/** Two photos edge to edge. */
export function GalleryPair({ c }: BlockProps) {
  return (
    <section className="grid md:grid-cols-2">
      <div className="aspect-[4/3] overflow-hidden">
        <Img photo={c.photos.d1} />
      </div>
      <div className="aspect-[4/3] overflow-hidden">
        <Img photo={c.photos.d2} />
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ visit */

/** Hours, address and contact, only what the owner gave. */
export function Visit({ c }: BlockProps) {
  if (!hasVisit(c)) return null
  return (
    <section id="visit" className="py-24">
      <Container className="grid gap-10 md:grid-cols-3">
        <h2 className="text-4xl">Visit</h2>
        {c.hours.length > 0 && (
          <dl className="space-y-2">
            {c.hours.map((h) => (
              <div key={h.days} className="flex justify-between gap-4 border-b pb-2">
                <dt>{h.days}</dt>
                <dd className="text-muted-foreground tabular-nums">{h.time}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className="text-muted-foreground space-y-2">
          {c.address.length > 0 && <address className="not-italic">{c.address.join(', ')}</address>}
          {c.phone && (
            <p>
              <a
                className="text-foreground hover:underline"
                href={`tel:${c.phone.replace(/\s/g, '')}`}
              >
                {c.phone}
              </a>
            </p>
          )}
          {c.email && (
            <p>
              <a className="text-foreground hover:underline" href={`mailto:${c.email}`}>
                {c.email}
              </a>
            </p>
          )}
        </div>
      </Container>
    </section>
  )
}

/* ------------------------------------------------------------------ call to action */

/** Centred heading and one button (Tailark Mist, call-to-action one). */
export function CtaCentre({ c }: BlockProps) {
  return (
    <section className="py-24">
      <Container className="space-y-6 text-center">
        <h2 className="text-4xl lg:text-5xl">{c.cta.headline}</h2>
        <p className="text-muted-foreground mx-auto max-w-xl">{c.cta.subhead}</p>
        <Button href={c.book} size="lg">
          {c.cta.label}
        </Button>
      </Container>
    </section>
  )
}

/** A card with the call to action (Tailark Veil, call-to-action two). */
export function CtaCard({ c }: BlockProps) {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-2xl px-6">
        <div className="rounded-(--radius) border p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl">{c.cta.headline}</h2>
          <p className="text-muted-foreground mt-4 max-w-md">{c.cta.subhead}</p>
          <Button href={c.book} className="mt-8">
            {c.cta.label}
          </Button>
        </div>
      </div>
    </section>
  )
}

/** The call to action over a photo. */
export function CtaPhoto({ c }: BlockProps) {
  return (
    <section className="relative isolate overflow-hidden py-32 text-white">
      <div className="absolute inset-0 -z-10">
        <Img photo={c.photos.cta} />
        <div className="absolute inset-0 bg-black/55" />
      </div>
      <Container className="text-center">
        <h2 className="text-4xl lg:text-5xl">{c.cta.headline}</h2>
        <p className="mx-auto mt-4 max-w-xl text-white/90">{c.cta.subhead}</p>
        <Button href={c.book} size="lg" variant="light" className="mt-8">
          {c.cta.label}
        </Button>
      </Container>
    </section>
  )
}

/* ------------------------------------------------------------------ footer */

/** Name and links on one line (Tailark Mist, footer four). */
export function FooterSimple({ c }: BlockProps) {
  return (
    <footer className="border-t py-12">
      <Container className="flex flex-wrap items-center justify-between gap-8">
        <span className="text-muted-foreground text-sm">
          © {new Date().getFullYear()} {c.name}
        </span>
        <Nav c={c} className="text-muted-foreground" />
      </Container>
    </footer>
  )
}

/** The name large, with contact details beside it. */
export function FooterLarge({ c }: BlockProps) {
  const contact = [c.phone, c.email].filter(Boolean)
  return (
    <footer className="bg-band text-band-foreground py-16">
      <Container wide className="grid gap-10 md:grid-cols-[2fr_1fr]">
        <div>
          <p className="font-display text-4xl md:text-6xl">{c.name}</p>
          <p className="mt-3 opacity-80">{c.tagline}</p>
        </div>
        <div className={cx('space-y-2 text-sm opacity-90', !contact.length && 'self-end')}>
          {contact.map((x) => (
            <p key={x}>{x}</p>
          ))}
          <p>
            © {new Date().getFullYear()} {c.name}
          </p>
        </div>
      </Container>
    </footer>
  )
}

export const ABOUT = { column: AboutColumn, split: AboutSplit, band: AboutBand }
export const OFFER = { cards: OfferCards, list: OfferList, photo: OfferPhoto }
export const REASONS = { columns: ReasonsColumns, band: ReasonsBand }
export const GALLERY = { mosaic: GalleryMosaic, pair: GalleryPair }
export const CTA = { centre: CtaCentre, card: CtaCard, photo: CtaPhoto }
export const FOOTER = { simple: FooterSimple, large: FooterLarge }
