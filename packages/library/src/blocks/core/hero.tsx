// Openings, each with its own menu bar. Adapted from Tailark (MIT, see ../../../NOTICE.md):
// "plate" from Mist hero two, "stack" from Mist hero six, "card" from Veil call-to-action two;
// "cover" and "split" follow the same tokens and spacing. App screenshots, badges and logo strips
// are removed; photos are the business's own.

import { type BlockProps, Button, Container, cx, Eyebrow, Img, Nav } from '../../ui.tsx'

function Bar(p: BlockProps & { onPhoto?: boolean; centred?: boolean }) {
  return (
    <header
      className={cx(
        'relative z-20',
        p.onPhoto ? 'text-white' : 'text-foreground',
        p.centred ? 'py-6' : 'py-5',
      )}
    >
      <Container
        wide
        className={cx(
          'flex items-center gap-6',
          p.centred ? 'flex-col justify-center' : 'justify-between',
        )}
      >
        <a href="#top" className="font-display text-xl tracking-tight">
          {p.c.name}
        </a>
        <div className="flex flex-wrap items-center gap-6">
          <Nav c={p.c} className="max-sm:hidden" />
          <Button href={p.c.book} variant={p.onPhoto ? 'light' : 'primary'}>
            {p.c.cta.label}
          </Button>
        </div>
      </Container>
    </header>
  )
}

/** Centred words on a soft plate, the photo framed below (Tailark Mist, hero two). */
export function HeroPlate({ c }: BlockProps) {
  return (
    <div id="top">
      <Bar c={c} />
      <section className="before:bg-muted relative overflow-hidden before:absolute before:inset-1 before:h-[calc(100%-8rem)] before:rounded-2xl sm:before:inset-2 md:before:rounded-[2rem] lg:before:h-[calc(100%-14rem)]">
        <div className="py-20 md:py-32">
          <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
            <Eyebrow>{c.tagline}</Eyebrow>
            <h1 className="mx-auto mt-6 max-w-3xl text-4xl sm:text-6xl">{c.headline}</h1>
            <p className="text-muted-foreground mx-auto my-6 max-w-xl text-balance text-lg">
              {c.subhead}
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button href={c.book} size="lg">
                {c.cta.label}
              </Button>
              <Button href="#about" size="lg" variant="outline">
                About us
              </Button>
            </div>
          </div>
          <div className="relative z-10 mx-auto mt-12 max-w-5xl px-6 md:mt-16">
            <div className="bg-background relative mx-auto aspect-[16/9] overflow-hidden rounded-(--radius) shadow-lg shadow-black/10 ring-1 ring-black/10">
              <Img photo={c.photos.hero} eager />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

/** Left-aligned words over a wide photo with a second photo framed inside (Tailark Mist, six). */
export function HeroStack({ c }: BlockProps) {
  return (
    <div id="top">
      <Bar c={c} />
      <section className="py-16 md:py-24">
        <Container>
          <Eyebrow>{c.tagline}</Eyebrow>
          <h1 className="mt-6 max-w-3xl text-5xl md:text-7xl">{c.headline}</h1>
          <p className="text-muted-foreground mb-8 mt-5 max-w-xl text-balance text-xl">
            {c.subhead}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button href={c.book} size="lg">
              {c.cta.label}
            </Button>
            <Button href="#offer" size="lg" variant="ghost">
              {c.offerTitle}
            </Button>
          </div>
          <div className="relative mt-12 overflow-hidden rounded-3xl md:mt-16">
            <div className="absolute inset-0">
              <Img photo={c.photos.hero} eager />
            </div>
            <div className="bg-background relative m-4 aspect-[16/10] overflow-hidden rounded-(--radius) shadow-xl shadow-black/20 ring-1 ring-black/10 sm:m-8 md:m-12 md:ml-[40%]">
              <Img photo={c.photos.about} />
            </div>
          </div>
        </Container>
      </section>
    </div>
  )
}

/** Words on one side, the photo on the other. */
export function HeroSplit({ c }: BlockProps) {
  return (
    <div id="top">
      <Bar c={c} />
      <section className="pb-16 pt-8 md:pb-24 md:pt-16">
        <Container wide className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
          <div>
            <Eyebrow>{c.tagline}</Eyebrow>
            <h1 className="mt-5 text-5xl md:text-6xl">{c.headline}</h1>
            <p className="text-muted-foreground mt-5 max-w-lg text-balance text-lg">{c.subhead}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={c.book} size="lg">
                {c.cta.label}
              </Button>
            </div>
          </div>
          <div className="aspect-[4/5] overflow-hidden rounded-(--radius) md:aspect-[5/6]">
            <Img photo={c.photos.hero} eager />
          </div>
        </Container>
      </section>
    </div>
  )
}

/** The photo across the whole screen, words low on a soft shade. */
export function HeroCover({ c }: BlockProps) {
  return (
    <section id="top" className="relative isolate flex min-h-svh flex-col overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <Img photo={c.photos.hero} eager />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />
      </div>
      <Bar c={c} onPhoto />
      <Container wide className="mt-auto pb-16 text-white md:pb-24">
        <p className="text-sm text-white/80">{c.tagline}</p>
        <h1 className="mt-4 max-w-4xl text-5xl md:text-7xl">{c.headline}</h1>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
          <p className="max-w-xl text-balance text-lg text-white/90">{c.subhead}</p>
          <Button href={c.book} size="lg" variant="light">
            {c.cta.label}
          </Button>
        </div>
      </Container>
    </section>
  )
}

/** The name centred above, words in a card over the photo (after Tailark Veil, cta two). */
export function HeroCard({ c }: BlockProps) {
  return (
    <div id="top">
      <Bar c={c} centred />
      <section className="px-2 pb-10 sm:px-4">
        <div className="relative isolate overflow-hidden rounded-[calc(var(--radius)+12px)]">
          <div className="absolute inset-0 -z-10">
            <Img photo={c.photos.hero} eager />
          </div>
          <div className="mx-auto flex min-h-[80svh] max-w-7xl items-end p-4 sm:p-8 md:p-12">
            <div className="bg-background max-w-lg rounded-(--radius) p-8 shadow-xl md:p-10">
              <Eyebrow>{c.tagline}</Eyebrow>
              <h1 className="mt-4 text-4xl md:text-5xl">{c.headline}</h1>
              <p className="text-muted-foreground mt-4 text-balance">{c.subhead}</p>
              <Button href={c.book} className="mt-8">
                {c.cta.label}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export const HEROES = {
  plate: HeroPlate,
  stack: HeroStack,
  split: HeroSplit,
  cover: HeroCover,
  card: HeroCard,
}
