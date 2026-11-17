// Openings, each with its own menu bar. Adapted from Tailark hero-section blocks (MIT, see
// ../../../NOTICE.md): Mist one, three, four and five; Veil one, three, four and five; Dusk one to
// ten. App screenshots, chat mock-ups, badges, ratings and logo strips are removed; the business's
// own photos sit where the screenshots were, and the menu bar is the business's name and links.

import { ArrowRight, ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { type BlockProps, Button, Container, cx, Eyebrow, Img, items } from '../../ui.tsx'
import { Bar, Nav2, Wordmark } from './parts.tsx'

/* ------------------------------------------------------------------ mist */

/** Words on the left over a soft fade, the photo leaning in from the right (Mist, hero one). */
export function HeroMistOne({ c }: BlockProps) {
  return (
    <div id="top" className="overflow-hidden">
      <Bar c={c} />
      <section className="from-background to-muted bg-gradient-to-b">
        <div className="relative py-20 md:py-36">
          <Container className="relative z-10">
            <div className="md:w-1/2">
              <Eyebrow>{c.tagline}</Eyebrow>
              <h1 className="mt-4 max-w-md text-balance text-5xl md:text-6xl">{c.headline}</h1>
              <p className="text-muted-foreground my-8 max-w-2xl text-balance text-xl">
                {c.subhead}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button href={c.book} size="lg">
                  {c.cta.label}
                  <ChevronRight className="size-4 opacity-50" />
                </Button>
                <Button href="#offer" size="lg" variant="outline">
                  {c.offerTitle}
                </Button>
              </div>
            </div>
          </Container>
          <div className="mt-16 translate-x-12 px-6 md:absolute md:-right-6 md:bottom-16 md:left-1/2 md:top-28 md:mt-0 md:translate-x-0 md:px-0">
            <div className="before:border-foreground/5 before:bg-foreground/5 relative h-full before:absolute before:-inset-x-4 before:bottom-7 before:top-0 before:skew-x-6 before:rounded-[calc(var(--radius)+1rem)] before:border">
              <div className="bg-background relative aspect-[4/3] h-full -translate-y-12 skew-x-6 overflow-hidden rounded-(--radius) shadow-md ring-1 shadow-foreground/10 ring-foreground/5 md:aspect-auto">
                <Img photo={c.photos.hero} eager className="-skew-x-6 scale-110" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

/** Large left-aligned words on a quiet band, a wide framed photo below (Mist, hero three). */
export function HeroMistThree({ c }: BlockProps) {
  return (
    <div id="top" className="bg-muted/50 overflow-hidden">
      <Bar c={c} />
      <section className="py-16 md:py-24">
        <Container>
          <Eyebrow>{c.tagline}</Eyebrow>
          <h1 className="mt-6 max-w-2xl text-balance text-5xl lg:text-6xl">{c.headline}</h1>
          <p className="text-foreground my-6 max-w-2xl text-balance text-2xl">{c.subhead}</p>
          <div className="flex flex-col items-center gap-3 *:w-full sm:flex-row sm:*:w-fit">
            <Button href={c.book} size="lg">
              {c.cta.label}
            </Button>
            <Button href="#about" size="lg" variant="outline">
              About
            </Button>
          </div>
          <div className="relative mt-16">
            <div className="bg-background relative mx-auto aspect-[16/9] overflow-hidden rounded-(--radius) shadow-lg ring-1 shadow-foreground/10 ring-foreground/10">
              <Img photo={c.photos.hero} eager />
            </div>
          </div>
        </Container>
      </section>
    </div>
  )
}

/** Centred words, then one photo framed inside another (Mist, hero four). */
export function HeroMistFour({ c }: BlockProps) {
  return (
    <div id="top" className="overflow-hidden">
      <Bar c={c} />
      <section className="py-16 md:py-28">
        <Container className="relative z-10">
          <div className="text-center">
            <Eyebrow>{c.tagline}</Eyebrow>
            <h1 className="mx-auto mt-5 max-w-2xl text-balance text-4xl md:text-5xl">
              {c.headline}
            </h1>
            <p className="text-muted-foreground mx-auto my-6 max-w-2xl text-balance text-xl">
              {c.subhead}
            </p>
            <div className="flex flex-col items-center justify-center gap-3 *:w-full sm:flex-row sm:*:w-auto">
              <Button href={c.book} size="lg">
                {c.cta.label}
              </Button>
              <Button href="#offer" size="lg" variant="outline">
                {c.offerTitle}
              </Button>
            </div>
          </div>
          <div className="bg-muted relative mx-auto mt-12 overflow-hidden rounded-3xl md:mt-20">
            <div className="absolute inset-0">
              <Img photo={c.photos.hero} eager />
            </div>
            <div className="bg-background relative m-4 aspect-[16/10] overflow-hidden rounded-(--radius) shadow-xl ring-1 shadow-foreground/15 ring-foreground/10 sm:m-8 md:m-12">
              <Img photo={c.photos.about} />
            </div>
          </div>
        </Container>
      </section>
    </div>
  )
}

/** A narrow centred column: the name as the mark, words, then the framed photo (Mist, hero five). */
export function HeroMistFive({ c }: BlockProps) {
  return (
    <section id="top" className="py-12 md:py-20">
      <div className="relative z-10 mx-auto w-full max-w-2xl px-6 lg:px-0">
        <div className="text-center">
          <Wordmark c={c} className="text-2xl" />
          <Nav2 c={c} className="mt-4 justify-center" />
          <h1 className="mx-auto mt-16 max-w-xl text-balance text-5xl">{c.headline}</h1>
          <p className="text-muted-foreground mx-auto mb-6 mt-4 text-balance text-xl">
            {c.subhead}
          </p>
          <div className="flex flex-col items-center gap-2 *:w-full sm:flex-row sm:justify-center sm:*:w-auto">
            <Button href={c.book}>{c.cta.label}</Button>
            <Button href="#about" variant="ghost">
              About
            </Button>
          </div>
        </div>
        <div className="bg-muted relative mt-12 overflow-hidden rounded-3xl md:mt-16">
          <div className="absolute inset-0">
            <Img photo={c.photos.d1} eager />
          </div>
          <div className="bg-background relative m-4 aspect-[4/3] overflow-hidden rounded-(--radius) shadow-xl ring-1 shadow-foreground/15 ring-foreground/10 sm:m-8 md:m-12">
            <Img photo={c.photos.hero} eager />
          </div>
        </div>
        <p className="text-muted-foreground mt-8 text-center">{c.tagline}</p>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ veil */

/** A soft photo fading out at the top, serif words centred, the offer as small cards (Veil, one). */
export function HeroVeilOne({ c }: BlockProps) {
  const chips = items(c).slice(0, 6)
  return (
    <div id="top" className="overflow-hidden">
      <Bar c={c} />
      <section className="bg-background">
        <div className="relative pb-24 pt-20 md:pt-28">
          <div className="absolute inset-0 aspect-square opacity-60 mask-radial-[75%_100%] mask-radial-from-45% mask-radial-to-75% mask-radial-at-top lg:aspect-[9/4]">
            <Img photo={c.photos.hero} eager className="object-top" />
          </div>
          <Container className="relative z-10">
            <div className="mx-auto max-w-md text-center">
              <h1 className="text-balance text-4xl sm:text-5xl">{c.headline}</h1>
              <p className="text-muted-foreground mt-4 text-balance">{c.subhead}</p>
              <Button href={c.book} className="mt-6">
                {c.cta.label}
                <ChevronRight className="size-4 opacity-50" />
              </Button>
            </div>
            {chips.length > 0 && (
              <ul className="mx-auto mt-20 flex max-w-xl flex-wrap justify-center gap-3">
                {chips.map((i) => (
                  <li
                    key={i.name}
                    className="bg-card text-card-foreground flex h-10 items-center rounded-xl px-4 text-sm font-medium shadow-sm ring-1 shadow-foreground/10 ring-foreground/5"
                  >
                    {i.name}
                  </li>
                ))}
              </ul>
            )}
          </Container>
        </div>
      </section>
    </div>
  )
}

/** Words on the left, the offer fading in a column on the right (Veil, hero three). */
export function HeroVeilThree({ c }: BlockProps) {
  const list = items(c).slice(0, 8)
  return (
    <div id="top" className="overflow-hidden">
      <Bar c={c} />
      <section className="bg-background">
        <div className="relative py-24 md:py-32">
          <div className="absolute inset-0 aspect-[2/3] opacity-60 blur-xl mask-radial-[75%_100%] mask-radial-from-45% mask-radial-to-75% mask-radial-at-top md:aspect-square lg:aspect-video">
            <Img photo={c.photos.hero} eager className="object-top" />
          </div>
          <Container className="relative z-10 flex items-center justify-between gap-12 max-md:flex-col">
            <div className="max-w-md">
              <Eyebrow>{c.tagline}</Eyebrow>
              <h1 className="mt-4 text-balance text-4xl sm:text-5xl">{c.headline}</h1>
              <p className="text-muted-foreground mt-4 text-balance">{c.subhead}</p>
              <Button href={c.book} className="mt-6">
                {c.cta.label}
                <ChevronRight className="size-4 opacity-50" />
              </Button>
            </div>
            <div className="relative w-full max-w-sm">
              <ul className="pb-16 mask-y-from-50%">
                {list.map((i) => (
                  <li
                    key={i.name}
                    className="text-muted-foreground flex items-baseline justify-between gap-4 px-6 py-2 text-sm"
                  >
                    <span>{i.name}</span>
                    {i.price && <span className="tabular-nums">{i.price}</span>}
                  </li>
                ))}
              </ul>
              <a
                href={c.book}
                className="bg-card text-card-foreground absolute inset-x-2 bottom-0 flex items-center justify-between gap-3 rounded-full p-2 pl-5 text-sm shadow-xl ring-1 shadow-foreground/10 ring-border"
              >
                <span className="truncate">{c.cta.subhead}</span>
                <span className="bg-primary text-primary-foreground flex size-9 shrink-0 rounded-full">
                  <ArrowRight className="m-auto size-4" />
                </span>
              </a>
            </div>
          </Container>
        </div>
      </section>
    </div>
  )
}

/** A tilted photo card above serif words, centred (Veil, hero four). */
export function HeroVeilFour({ c }: BlockProps) {
  return (
    <div id="top" className="overflow-hidden">
      <Bar c={c} look="float" />
      <section className="bg-background">
        <div className="relative py-16 md:py-24">
          <Container className="relative z-10">
            <div aria-hidden className="mx-auto mb-12 max-w-2xl py-8 perspective-near lg:mb-16">
              <div className="bg-muted relative mx-auto aspect-[16/10] max-w-xl -rotate-6 overflow-hidden rounded-3xl border p-3 shadow-xl rotate-x-12 shadow-foreground/10">
                <div className="size-full overflow-hidden rounded-2xl">
                  <Img photo={c.photos.hero} eager />
                </div>
              </div>
            </div>
            <div className="mx-auto max-w-md text-center">
              <h1 className="text-balance text-4xl sm:text-5xl">{c.headline}</h1>
              <p className="text-muted-foreground mt-4 text-balance">{c.subhead}</p>
              <Button href={c.book} className="mt-6">
                {c.cta.label}
                <ChevronRight className="size-4 opacity-50" />
              </Button>
            </div>
          </Container>
        </div>
      </section>
    </div>
  )
}

/** A floating pill for the menu, a soft photo, centred words (Veil, hero five). */
export function HeroVeilFive({ c }: BlockProps) {
  return (
    <div id="top" className="overflow-hidden">
      <Bar c={c} look="pill" />
      <section className="bg-background">
        <div className="relative pb-24 pt-12">
          <Container className="relative z-10">
            <div className="relative mx-auto aspect-[3/2] max-w-xl overflow-hidden mask-radial-from-35% mask-radial-to-75%">
              <Img photo={c.photos.hero} eager />
            </div>
            <div className="mx-auto mt-6 max-w-md text-center">
              <h1 className="text-balance text-4xl sm:text-5xl">{c.headline}</h1>
              <p className="text-muted-foreground mt-4 text-balance">{c.subhead}</p>
              <Button href={c.book} className="mt-6">
                {c.cta.label}
                <ChevronRight className="size-4 opacity-50" />
              </Button>
            </div>
          </Container>
        </div>
      </section>
    </div>
  )
}

/* ------------------------------------------------------------------ dusk */

/** A photo on a thin raised plate, as Dusk frames its screens. */
function Plate(p: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cx(
        'bg-background relative rounded-2xl p-2 shadow-xl ring-1 shadow-foreground/20 ring-foreground/10',
        p.className,
      )}
    >
      <div className="relative aspect-[15/8] overflow-hidden rounded-xl">{p.children}</div>
    </div>
  )
}

/** Big centred words, the photo on a raised plate with a fading rim (Dusk, hero one). */
export function HeroDuskOne({ c }: BlockProps) {
  return (
    <div id="top" className="overflow-hidden">
      <Bar c={c} look="rule" />
      <section className="pt-16 md:pt-28">
        <Container wide className="px-0">
          <div className="px-6 text-center">
            <Eyebrow>{c.tagline}</Eyebrow>
            <h1 className="mx-auto mt-8 max-w-4xl text-balance text-5xl md:text-6xl xl:text-7xl">
              {c.headline}
            </h1>
            <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-balance md:text-lg">
              {c.subhead}
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-2 md:flex-row">
              <Button href={c.book}>{c.cta.label}</Button>
              <Button href="#offer" variant="ghost">
                {c.offerTitle}
              </Button>
            </div>
          </div>
          <div className="relative mt-8 overflow-hidden p-6 sm:mt-16">
            <div className="from-background to-muted absolute inset-0 rounded-[2rem] border bg-gradient-to-b mask-t-from-25% mask-t-to-65%" />
            <Plate>
              <Img photo={c.photos.hero} eager />
            </Plate>
          </div>
        </Container>
      </section>
    </div>
  )
}

/** Words and button on one line, the photo in a dark frame below (Dusk, hero two). */
export function HeroDuskTwo({ c }: BlockProps) {
  return (
    <div id="top" className="overflow-hidden">
      <Bar c={c} look="rule" />
      <section className="pb-12 pt-16 md:pt-28">
        <Container wide>
          <div className="flex justify-between gap-6 max-md:flex-col md:items-end">
            <div>
              <h1 className="max-w-2xl text-balance text-5xl md:text-6xl">{c.headline}</h1>
              <p className="text-muted-foreground mt-4 max-w-xl text-balance text-lg">
                {c.subhead}
              </p>
            </div>
            <Button href={c.book} size="lg" className="w-fit">
              {c.cta.label}
            </Button>
          </div>
          <div className="bg-foreground relative -mx-2 mt-8 overflow-hidden rounded-3xl p-2 sm:mt-12">
            <Plate className="shadow-2xl">
              <Img photo={c.photos.hero} eager />
            </Plate>
          </div>
        </Container>
      </section>
    </div>
  )
}

/** Two-tone words centred, the photo wide with a tall framed second photo (Dusk, hero three). */
export function HeroDuskThree({ c }: BlockProps) {
  return (
    <div id="top" className="overflow-hidden">
      <Bar c={c} look="rule" />
      <section className="px-4 pb-4 pt-16 lg:pt-28">
        <Container wide>
          <h1 className="relative z-10 mx-auto max-w-2xl text-balance text-center text-4xl md:text-5xl">
            <span className="text-muted-foreground">{c.tagline}</span> {c.headline}
          </h1>
          <p className="text-muted-foreground mx-auto mt-6 max-w-xl text-balance text-center text-lg">
            {c.subhead}
          </p>
          <div className="mt-8 flex justify-center">
            <Button href={c.book}>{c.cta.label}</Button>
          </div>
        </Container>
        <div className="relative mt-12 overflow-hidden rounded-2xl py-16 md:py-20">
          <div className="absolute inset-0">
            <Img photo={c.photos.hero} eager />
          </div>
          <div className="relative z-10 mx-auto aspect-[27/48] max-w-60 overflow-hidden rounded-[2rem] shadow-2xl ring-1 ring-foreground/15 sm:max-w-72">
            <Img photo={c.photos.about} />
          </div>
        </div>
      </section>
    </div>
  )
}

/** Words on the left, a photo on the right with a booking card floating over it (Dusk, four). */
export function HeroDuskFour({ c }: BlockProps) {
  return (
    <div id="top" className="overflow-x-hidden">
      <Bar c={c} look="rule" />
      <section className="pt-12 lg:pt-16">
        <Container wide className="grid items-center md:grid-cols-2 md:gap-12">
          <div className="text-center md:text-left">
            <Eyebrow>{c.tagline}</Eyebrow>
            <h1 className="mb-6 mt-4 text-balance text-5xl">{c.headline}</h1>
            <p className="text-muted-foreground mb-10 text-balance text-lg">{c.subhead}</p>
            <div className="flex gap-2 max-md:justify-center">
              <Button href={c.book}>{c.cta.label}</Button>
              <Button href="#offer" variant="ghost">
                {c.offerTitle}
              </Button>
            </div>
          </div>
          <div className="relative flex h-[26rem] items-center max-md:mt-12 md:h-[40rem]">
            <div className="absolute inset-0 overflow-hidden rounded-3xl mask-b-from-65%">
              <Img photo={c.photos.hero} eager />
            </div>
            <div className="relative z-10 m-auto w-full px-6 md:-translate-y-7 md:px-12">
              <a
                href={c.book}
                className="bg-card text-card-foreground block rounded-3xl p-3 shadow-xl ring-1 shadow-foreground/25 ring-foreground/15"
              >
                <span className="text-muted-foreground block p-2 pb-3 text-sm">
                  {c.cta.subhead}
                </span>
                <span className="flex items-center justify-between gap-3">
                  <span className="px-2 text-sm font-medium">{c.cta.label}</span>
                  <span className="bg-foreground text-background flex size-7 rounded-full">
                    <ArrowRight className="m-auto size-4" />
                  </span>
                </span>
              </a>
            </div>
          </div>
        </Container>
      </section>
    </div>
  )
}

/** The photo fills the opening and fades into the page; words sit low on it (Dusk, hero five). */
export function HeroDuskFive({ c }: BlockProps) {
  return (
    <div id="top" className="overflow-x-hidden">
      <Bar c={c} look="rule" />
      <section className="relative mx-auto flex aspect-square flex-col justify-end sm:aspect-[3/2] lg:aspect-auto lg:min-h-[50rem] xl:aspect-video">
        <div className="pointer-events-none absolute inset-0 mask-y-from-45% mask-b-to-90%">
          <Img photo={c.photos.hero} eager />
          <div className="from-background via-background/70 absolute inset-0 bg-gradient-to-t to-transparent to-60%" />
        </div>
        <Container wide className="relative z-10 pb-6 lg:pb-12">
          <div className="flex flex-wrap items-end justify-between gap-4 lg:w-2/3">
            <div>
              <h1 className="max-w-md text-balance text-5xl md:text-6xl">{c.headline}</h1>
              <p className="text-muted-foreground mt-4 max-w-md text-balance">{c.subhead}</p>
            </div>
            <Button href={c.book}>
              {c.cta.label}
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </Container>
      </section>
    </div>
  )
}

/** Headline and words in two columns, a wide photo with a second photo inset (Dusk, hero six). */
export function HeroDuskSix({ c }: BlockProps) {
  return (
    <div id="top" className="overflow-hidden">
      <Bar c={c} look="rule" />
      <section className="pt-16 lg:pt-28">
        <div className="space-y-12 md:space-y-16">
          <Container wide>
            <Eyebrow>{c.tagline}</Eyebrow>
            <div className="mt-8 grid items-end gap-4 md:grid-cols-2 md:gap-6">
              <h1 className="text-balance text-5xl md:text-6xl xl:text-7xl">{c.headline}</h1>
              <div className="mx-auto flex max-w-md flex-col gap-6">
                <p className="text-muted-foreground text-balance text-lg">{c.subhead}</p>
                <Button href={c.book} className="w-fit">
                  {c.cta.label}
                </Button>
              </div>
            </div>
          </Container>
          <div className="mx-auto max-w-7xl max-xl:px-2">
            <div className="bg-muted relative aspect-square overflow-hidden rounded-3xl md:aspect-[5/3] lg:aspect-video">
              <Img photo={c.photos.hero} eager />
              <div className="bg-background absolute bottom-4 right-4 z-10 aspect-[4/3] w-1/2 overflow-hidden rounded-2xl p-2 shadow-lg ring-1 ring-foreground/10 lg:bottom-12 lg:right-12 lg:w-2/5">
                <div className="size-full overflow-hidden rounded-xl">
                  <Img photo={c.photos.about} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

/** Words on the left, a rounded photo on the right with a second photo inset (Dusk, seven). */
export function HeroDuskSeven({ c }: BlockProps) {
  return (
    <div id="top" className="overflow-hidden">
      <Bar c={c} look="rule" />
      <section className="pb-16 pt-16 md:pt-28 lg:pb-20">
        <Container wide className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow>{c.tagline}</Eyebrow>
            <div className="mt-8 flex max-w-md flex-col gap-4">
              <h1 className="text-balance text-5xl md:text-6xl">{c.headline}</h1>
              <p className="text-muted-foreground">{c.subhead}</p>
              <div className="mt-2 flex flex-wrap gap-3">
                <Button href={c.book}>{c.cta.label}</Button>
                <Button href="#offer" variant="outline">
                  {c.offerTitle}
                </Button>
              </div>
            </div>
          </div>
          <div className="relative aspect-square overflow-hidden rounded-3xl sm:aspect-[5/3] lg:ml-auto lg:aspect-[5/4] lg:w-full lg:max-w-xl">
            <Img photo={c.photos.hero} eager />
            <div className="bg-background absolute left-6 top-6 z-10 aspect-[4/3] w-3/5 overflow-hidden rounded-2xl p-2 shadow-lg ring-1 ring-foreground/10 lg:left-8 lg:top-8">
              <div className="size-full overflow-hidden rounded-xl">
                <Img photo={c.photos.about} />
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  )
}

/** Two-line centred headline over a photo that fades at its edges (Dusk, hero eight). */
export function HeroDuskEight({ c }: BlockProps) {
  return (
    <div id="top" className="overflow-hidden">
      <Bar c={c} look="rule" />
      <section className="pb-24 pt-20 md:pt-32">
        <Container wide className="relative">
          <h1 className="mx-auto max-w-3xl text-balance text-center text-4xl md:text-5xl">
            {c.headline} <br />
            <span className="text-muted-foreground">{c.subhead}</span>
          </h1>
          <div className="mt-8 flex justify-center">
            <Button href={c.book} size="lg">
              {c.cta.label}
            </Button>
          </div>
          <div className="relative mx-auto mt-8 aspect-square max-w-4xl overflow-hidden mask-x-from-80% mask-y-from-80% sm:aspect-[3/2]">
            <Img photo={c.photos.hero} eager />
          </div>
          <p className="text-muted-foreground mt-8 text-center text-lg">{c.tagline}</p>
        </Container>
      </section>
    </div>
  )
}

/** Centred words above a soft panel holding the photo on a raised plate (Dusk, hero nine). */
export function HeroDuskNine({ c }: BlockProps) {
  return (
    <div id="top" className="overflow-hidden">
      <Bar c={c} look="rule" />
      <section className="pt-16 lg:pt-28">
        <Container wide>
          <p className="text-muted-foreground mx-auto w-fit text-center font-medium">{c.tagline}</p>
          <div className="mx-auto mb-12 mt-8 flex max-w-3xl flex-col justify-center gap-6 text-center md:gap-8">
            <h1 className="text-balance text-4xl md:text-5xl">{c.headline}</h1>
            <p className="text-muted-foreground mx-auto max-w-xl text-balance text-lg">
              {c.subhead}
            </p>
            <Button href={c.book} size="lg" className="mx-auto w-fit">
              {c.cta.label}
            </Button>
          </div>
          <div className="bg-muted relative overflow-hidden rounded-3xl px-4 pt-4 max-lg:-mx-4 md:px-6 md:pt-6 lg:px-8 lg:pt-8">
            <div className="absolute inset-0">
              <Img photo={c.photos.d1} />
            </div>
            <div className="bg-background relative z-10 rounded-t-2xl p-2 pb-0 shadow-lg ring-1 ring-foreground/10">
              <div className="relative aspect-[15/8] overflow-hidden rounded-t-xl">
                <Img photo={c.photos.hero} eager />
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  )
}

/** Headline and words in two columns, two photos overlapping on a landscape (Dusk, hero ten). */
export function HeroDuskTen({ c }: BlockProps) {
  return (
    <div id="top" className="overflow-hidden">
      <Bar c={c} look="rule" />
      <section className="pt-16 xl:pt-28">
        <Container wide>
          <div className="grid items-end gap-4 md:grid-cols-2 md:gap-6">
            <h1 className="text-balance text-4xl md:text-5xl">{c.headline}</h1>
            <div className="flex max-w-md flex-col gap-4 md:mx-auto">
              <p className="text-muted-foreground text-balance text-lg">{c.subhead}</p>
              <Button href={c.book} className="w-fit">
                {c.cta.label}
              </Button>
            </div>
          </div>
          <div className="bg-muted relative mt-16 overflow-hidden rounded-xl px-4 pt-6 max-lg:-mx-4 md:px-6 lg:px-8 lg:pt-16">
            <div className="absolute inset-0">
              <Img photo={c.photos.hero} eager />
            </div>
            <div className="relative z-10 mx-auto flex aspect-[3/2] max-w-5xl -space-x-12 sm:aspect-video lg:-space-x-56">
              <div className="w-2/3 pt-6 lg:pt-16">
                <div className="bg-card h-full overflow-hidden rounded-t-2xl shadow-2xl ring-1 shadow-foreground/35 ring-foreground/10">
                  <Img photo={c.photos.d1} />
                </div>
              </div>
              <div className="bg-card relative h-full w-2/3 overflow-hidden rounded-t-2xl shadow-2xl ring-1 shadow-foreground/35 ring-foreground/10">
                <Img photo={c.photos.about} />
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  )
}
