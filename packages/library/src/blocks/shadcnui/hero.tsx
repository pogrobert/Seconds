// Openings adapted from Shadcn UI Blocks hero-01 to hero-08 (MIT, see ../../../NOTICE.md).
// Release badges, demo buttons, logo strips, particles and animated patterns are removed; the
// grey placeholder boxes become the business's own photo, and the colour washes use the theme.

import { ArrowUpRight } from 'lucide-react'
import { type BlockProps, Button, Container, cx, Eyebrow, Img, Nav } from '../../ui.tsx'
import { gridLines, MobileMenu } from './parts.tsx'

function Actions({ c, centre }: BlockProps & { centre?: boolean }) {
  return (
    <div className={cx('mt-10 flex flex-wrap items-center gap-4', centre && 'justify-center')}>
      <Button href={c.book} size="lg">
        {c.cta.label} <ArrowUpRight className="size-5 rtl:-scale-x-100" />
      </Button>
      <Button href="#offer" size="lg" variant="outline">
        {c.offerTitle}
      </Button>
    </div>
  )
}

function Words({ c, centre, gradient }: BlockProps & { centre?: boolean; gradient?: boolean }) {
  return (
    <>
      {gradient ? (
        // hero-03's GradientText: a slow gradient moving through the badge's words (motion.ts).
        <p
          data-m="gradient-text"
          className={cx(
            'border-border inline-block rounded-full border px-3 py-1 text-sm font-medium',
            centre ? 'mx-auto' : '',
          )}
          style={{
            backgroundImage:
              'linear-gradient(90deg, var(--foreground), var(--muted-foreground), var(--primary), var(--foreground))',
          }}
        >
          {c.tagline}
        </p>
      ) : (
        <Eyebrow
          className={cx(
            'bg-muted inline-block rounded-full border px-3 py-1',
            centre ? 'mx-auto' : '',
          )}
        >
          {c.tagline}
        </Eyebrow>
      )}
      <h1
        className={cx(
          'mt-6 text-4xl leading-[1.15] sm:text-5xl md:text-6xl',
          centre && 'mx-auto max-w-3xl',
        )}
      >
        {c.headline}
      </h1>
      <p
        className={cx(
          'text-muted-foreground mt-6 max-w-2xl text-lg sm:text-xl/normal',
          centre && 'mx-auto',
        )}
      >
        {c.subhead}
      </p>
    </>
  )
}

/** Centred words over two soft blurs of the brand colour (hero-01). */
export function Hero01({ c }: BlockProps) {
  return (
    <section
      id="top"
      className="relative isolate flex min-h-[80svh] items-center justify-center overflow-hidden px-6 py-24"
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="bg-primary/25 absolute start-[15%] top-[20%] size-[28rem] rounded-full blur-3xl" />
        <div className="bg-accent absolute end-[10%] bottom-[10%] size-[32rem] rounded-full opacity-70 blur-3xl" />
      </div>
      <div className="max-w-3xl text-center">
        <Words c={c} centre />
        <Actions c={c} centre />
      </div>
    </section>
  )
}

/** Words on the left, the photo on the right, low in the frame (hero-02). */
export function Hero02({ c }: BlockProps) {
  return (
    <section id="top" className="flex min-h-[80svh] items-center px-6 py-16">
      <div className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <Words c={c} />
          <Actions c={c} />
        </div>
        <div className="mt-auto aspect-video w-full overflow-hidden rounded-(--radius)">
          <Img photo={c.photos.hero} eager />
        </div>
      </div>
    </section>
  )
}

function PillBar({ c }: BlockProps) {
  return (
    <nav className="bg-background relative z-20 mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 rounded-full border px-4 ps-6 shadow-sm">
      <a href="#top" className="font-display truncate text-lg">
        {c.name}
      </a>
      <Nav c={c} className="hidden shrink-0 md:flex" />
      <div className="flex shrink-0 items-center gap-2">
        <Button href={c.book} className="max-sm:hidden">
          {c.cta.label}
        </Button>
        <MobileMenu c={c} className="md:hidden" />
      </div>
    </nav>
  )
}

/** A floating menu, centred words and the photo in a frame of the brand colour (hero-03). */
export function Hero03({ c }: BlockProps) {
  return (
    <section
      id="top"
      className="relative isolate flex w-full flex-col items-center overflow-hidden px-6 pt-6 pb-16"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(125% 125% at 50% 10%, var(--background) 40%, color-mix(in oklab, var(--primary) 35%, var(--background)) 100%)',
        }}
      />
      <PillBar c={c} />
      <div className="mt-16 max-w-3xl text-center md:mt-24">
        <Words c={c} centre gradient />
        <Actions c={c} centre />
      </div>
      <div className="from-primary/70 via-primary/30 to-primary/60 mx-auto mt-16 aspect-video w-full max-w-6xl rounded-2xl bg-gradient-to-br p-2 md:mt-20">
        <div className="size-full overflow-hidden rounded-(--radius)">
          <Img photo={c.photos.hero} eager />
        </div>
      </div>
    </section>
  )
}

/** Words beside a tall photo that runs off the edge (hero-04). */
export function Hero04({ c }: BlockProps) {
  return (
    <section id="top" className="flex min-h-[85svh] items-center overflow-hidden">
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-12 lg:grid-cols-2 lg:py-8">
        <div className="my-auto">
          <Words c={c} />
          <Actions c={c} />
        </div>
        <div className="aspect-video w-full overflow-hidden rounded-(--radius) lg:aspect-auto lg:h-[calc(85svh-4rem)] lg:w-[1000px]">
          <Img photo={c.photos.hero} eager />
        </div>
      </div>
    </section>
  )
}

/** Words beside a photo that fills the whole right half, edge to edge (hero-05). */
export function Hero05({ c }: BlockProps) {
  return (
    <section id="top" className="flex min-h-svh items-center overflow-hidden">
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-12 lg:grid-cols-2 lg:py-0">
        <div className="my-auto">
          <Words c={c} />
          <Actions c={c} />
        </div>
        <div className="aspect-video w-full overflow-hidden rounded-(--radius) lg:aspect-auto lg:h-svh lg:w-[1000px] lg:rounded-none">
          <Img photo={c.photos.hero} eager />
        </div>
      </div>
    </section>
  )
}

/** Centred words on a field of dots that fades at the middle (hero-06). */
export function Hero06({ c }: BlockProps) {
  return (
    <section
      id="top"
      className="relative isolate flex min-h-[80svh] items-center justify-center overflow-hidden px-6 py-24"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: 'radial-gradient(var(--muted-foreground) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          opacity: 0.5,
          maskImage: 'radial-gradient(ellipse, rgba(0, 0, 0, 0.3) 30%, black 60%)',
        }}
      />
      <div className="max-w-3xl text-center">
        <Words c={c} centre />
        <Actions c={c} centre />
      </div>
    </section>
  )
}

/** Centred words on a tilted grid that fades out from the middle (hero-07). */
export function Hero07({ c }: BlockProps) {
  return (
    <section
      id="top"
      className="relative isolate flex min-h-[80svh] items-center justify-center overflow-hidden px-6 py-24"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 skew-y-12"
        style={{
          ...gridLines(40),
          maskImage: 'radial-gradient(500px circle at center, white, transparent)',
        }}
      />
      {/* hero-07's AnimatedGridPattern: squares of the grid light up and fade (motion.ts). */}
      <div
        aria-hidden="true"
        data-m="grid"
        className="text-foreground absolute inset-0 -z-10 skew-y-12"
        style={{ maskImage: 'radial-gradient(500px circle at center, white, transparent)' }}
      />
      <div className="max-w-3xl text-center">
        <Words c={c} centre />
        <Actions c={c} centre />
      </div>
    </section>
  )
}

/** A plain menu bar, big centred words and a wide photo below (hero-08). */
export function Hero08({ c }: BlockProps) {
  return (
    <div id="top">
      <div className="bg-background h-16 border-b px-6">
        <nav className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4">
          <a href="#top" className="font-display truncate text-xl">
            {c.name}
          </a>
          <Nav c={c} className="hidden shrink-0 md:flex" />
          <div className="flex shrink-0 items-center gap-2">
            <Button href={c.book} className="max-sm:hidden">
              {c.cta.label} <ArrowUpRight className="size-4 rtl:-scale-x-100" />
            </Button>
            <MobileMenu c={c} className="md:hidden" />
          </div>
        </nav>
      </div>
      <section className="py-16 md:py-20">
        <Container className="flex flex-col items-center text-center">
          <Eyebrow>{c.tagline}</Eyebrow>
          <h1 className="mt-6 text-4xl leading-[1.2] sm:text-5xl md:text-6xl lg:text-7xl">
            {c.headline}
          </h1>
          <p className="text-muted-foreground mt-6 max-w-3xl text-xl sm:text-2xl/normal">
            {c.subhead}
          </p>
          <div className="mt-10 flex w-full max-w-xs flex-col items-center justify-center gap-4 sm:max-w-none sm:flex-row">
            <Button href={c.book} size="lg" className="w-full sm:w-auto">
              {c.cta.label} <ArrowUpRight className="size-5 rtl:-scale-x-100" />
            </Button>
            <Button href="#about" size="lg" variant="outline" className="w-full sm:w-auto">
              About
            </Button>
          </div>
        </Container>
        <Container wide className="mt-16">
          <div className="aspect-[21/9] overflow-hidden rounded-(--radius)">
            <Img photo={c.photos.hero} eager />
          </div>
        </Container>
      </section>
    </div>
  )
}
