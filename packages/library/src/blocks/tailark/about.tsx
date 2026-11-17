// About sections and short lists of reasons. Adapted from Tailark (MIT, see ../../../NOTICE.md):
// Mist content one and three, Mist features eight; Veil content one, two and three; Dusk content
// one to four. Illustrations, app screens and invented figures are removed; the business's photos
// and its own reasons take their place.

import { Check } from 'lucide-react'
import { type BlockProps, Button, Container, cx, Img } from '../../ui.tsx'

/* ------------------------------------------------------------------ about */

/** Words on a quiet band, then the reasons in rows beside photos, alternating (Mist, content one). */
export function AboutMistOne({ c }: BlockProps) {
  const photos = [c.photos.d1, c.photos.d2]
  return (
    <section id="about" className="bg-muted/50 py-24">
      <Container>
        <span className="text-primary">About</span>
        <h2 className="mt-4 text-4xl">{c.name}</h2>
        <p className="text-muted-foreground mb-12 mt-4 text-lg">{c.about}</p>
        <div className="space-y-6 sm:space-y-0 sm:divide-y">
          {c.reasons.slice(0, 2).map((r, i) => (
            <div key={r.title} className="grid py-0 sm:grid-cols-5">
              <div
                className={cx(
                  'aspect-[4/3] overflow-hidden rounded-(--radius) sm:col-span-2 sm:my-12',
                  i % 2 === 1 ? 'sm:order-last sm:ms-12' : 'sm:me-12',
                )}
              >
                <Img photo={photos[i] ?? c.photos.d1} />
              </div>
              <div
                className={cx(
                  'mt-6 flex flex-col justify-center sm:col-span-3 sm:mt-0',
                  i % 2 === 1 ? 'sm:pe-12' : 'sm:ps-12',
                )}
              >
                <h3 className="text-xl">{r.title}</h3>
                <p className="text-muted-foreground mt-4 text-lg">{r.body}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

/** A narrow column of words above one photo framed inside another (Mist, content three). */
export function AboutMistThree({ c }: BlockProps) {
  return (
    <section id="about" className="py-24">
      <Container>
        <div className="mx-auto max-w-2xl">
          <h2 className="text-4xl">About {c.name}</h2>
          <p className="text-muted-foreground mt-4 text-xl">{c.about}</p>
          <div className="bg-muted relative mt-12 overflow-hidden rounded-3xl md:mt-16">
            <div className="absolute inset-0">
              <Img photo={c.photos.d1} />
            </div>
            <div className="bg-background relative m-4 aspect-[4/3] overflow-hidden rounded-(--radius) shadow-xl ring-1 shadow-foreground/15 ring-foreground/10 sm:m-8 md:m-12">
              <Img photo={c.photos.about} />
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

/** One wide card with the story and a photo, the reasons in cards below (Mist, features eight). */
export function AboutMistEight({ c }: BlockProps) {
  return (
    <section id="about" className="py-24">
      <Container>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-foreground/5 col-span-full overflow-hidden rounded-xl pl-6 pt-6">
            <h2 className="text-2xl">About {c.name}</h2>
            <p className="text-muted-foreground mt-3 max-w-xl pr-6 text-balance">{c.about}</p>
            <div className="bg-background relative mt-8 h-72 overflow-hidden rounded-tl-(--radius) shadow ring-1 ring-foreground/5 md:h-96">
              <Img photo={c.photos.about} />
            </div>
          </div>
          {c.reasons.map((r) => (
            <div key={r.title} className="bg-foreground/5 rounded-xl p-6">
              <Check className="text-primary size-5" />
              <h3 className="mt-5 text-lg">{r.title}</h3>
              <p className="text-muted-foreground mt-3 text-balance">{r.body}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

/** Heading and story, the reasons in ruled columns with small marks (Veil, content three). */
export function AboutVeilThree({ c }: BlockProps) {
  return (
    <section id="about" className="bg-background @container py-24">
      <div className="mx-auto max-w-2xl px-6">
        <div className="space-y-4">
          <h2 className="text-balance text-4xl">About {c.name}</h2>
          <p className="text-muted-foreground">{c.about}</p>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-6 text-sm @xl:grid-cols-3">
          {c.reasons.map((r) => (
            <div key={r.title} className="space-y-3 border-t pt-6">
              <Check className="text-muted-foreground size-4" />
              <p className="text-muted-foreground leading-5">
                <span className="text-foreground font-medium">{r.title}</span> {r.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/** A wide photo, then the heading on one side and the story on the other (Dusk, content one). */
export function AboutDuskOne({ c }: BlockProps) {
  return (
    <section id="about" className="py-16 md:py-20">
      <Container wide className="space-y-12 md:space-y-16">
        <div className="aspect-video overflow-hidden rounded-xl">
          <Img photo={c.photos.about} />
        </div>
        <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:gap-12">
          <h2 className="max-w-md text-balance text-4xl lg:text-5xl">About {c.name}</h2>
          <div className="space-y-6">
            <p className="text-muted-foreground text-balance text-lg">{c.about}</p>
            <Button href={c.book} variant="outline">
              {c.cta.label}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  )
}

/** Heading beside the story, the reasons in two short columns (Dusk, content two). */
export function AboutDuskTwo({ c }: BlockProps) {
  return (
    <section id="about" className="py-16 md:py-20">
      <Container wide>
        <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:gap-12">
          <h2 className="max-w-md text-balance text-4xl lg:text-5xl">{c.name}</h2>
          <div className="space-y-6 lg:space-y-12">
            <p className="text-muted-foreground text-balance text-lg">{c.about}</p>
            <div className="grid gap-4 pt-6 sm:grid-cols-2">
              {c.reasons.map((r) => (
                <p key={r.title} className="text-muted-foreground text-balance text-lg">
                  <span className="text-foreground font-medium">
                    <Check className="inline size-4 -translate-y-0.5" /> {r.title}.
                  </span>{' '}
                  {r.body}
                </p>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

/** A big heading, then a raised photo beside the story and reasons (Dusk, content three). */
export function AboutDuskThree({ c }: BlockProps) {
  return (
    <section id="about" className="overflow-hidden py-16 md:py-20">
      <Container wide className="space-y-8 md:space-y-16">
        <h2 className="max-w-2xl text-balance text-4xl md:text-5xl lg:text-6xl">
          {c.reasonsTitle}
        </h2>
        <div className="grid items-center gap-6 lg:grid-cols-3 lg:gap-20">
          <div className="lg:col-span-2">
            <div className="bg-background relative rounded-2xl p-2 shadow-xl ring-1 shadow-foreground/20 ring-foreground/10">
              <div className="aspect-[15/8] overflow-hidden rounded-xl">
                <Img photo={c.photos.about} />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-muted-foreground text-balance text-2xl">{c.about}</p>
            <div className="grid gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-1">
              {c.reasons.map((r) => (
                <p key={r.title} className="text-muted-foreground text-balance">
                  <span className="text-foreground font-medium">
                    <Check className="inline size-4 -translate-y-0.5" /> {r.title}.
                  </span>{' '}
                  {r.body}
                </p>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

/** Two-tone heading beside the story, the reasons as a ruled list (Dusk, content four). */
export function AboutDuskFour({ c }: BlockProps) {
  return (
    <section id="about" className="py-16 md:py-20">
      <Container wide>
        <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:gap-12">
          <h2 className="max-w-md text-balance text-4xl lg:text-5xl">
            <span className="text-muted-foreground">{c.tagline}</span> <br /> {c.name}
          </h2>
          <div className="space-y-4">
            <p className="text-muted-foreground text-balance text-lg">{c.about}</p>
            <div className="mt-12 flex flex-col gap-3 pt-6 *:not-last:border-b *:not-last:pb-3">
              {c.reasons.map((r) => (
                <p key={r.title} className="text-muted-foreground text-balance text-lg">
                  <span className="text-foreground font-medium">
                    <Check className="inline size-4 -translate-y-0.5" /> {r.title}.
                  </span>{' '}
                  {r.body}
                </p>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

/* ------------------------------------------------------------------ reasons */

/** Heading on one side, the reasons as short paragraphs on the other (Veil, content one). */
export function ReasonsVeilOne({ c }: BlockProps) {
  return (
    <section className="bg-background @container py-24">
      <div className="mx-auto grid max-w-3xl gap-6 px-6 @2xl:grid-cols-2">
        <h2 className="text-balance text-4xl">{c.reasonsTitle}</h2>
        <div className="flex flex-col gap-6">
          {c.reasons.map((r) => (
            <p key={r.title} className="text-muted-foreground">
              <span className="text-foreground font-medium">{r.title}</span> {r.body}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Heading above the reasons in two ruled columns (Veil, content two). */
export function ReasonsVeilTwo({ c }: BlockProps) {
  return (
    <section className="bg-background @container py-24">
      <div className="mx-auto max-w-2xl px-6">
        <h2 className="text-balance text-4xl">{c.reasonsTitle}</h2>
        <div className="mt-12 grid grid-cols-2 gap-6 @xl:gap-12">
          {c.reasons.map((r) => (
            <p key={r.title} className="text-muted-foreground border-t pt-6">
              <span className="text-foreground font-medium">{r.title}</span> {r.body}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}
