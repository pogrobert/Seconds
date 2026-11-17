// What the business offers, and why to choose it. Adapted from Tailark features blocks (MIT, see
// ../../../NOTICE.md): Mist one, two, three, five, six, nine, ten and eleven; Veil one, two and
// three; Dusk one to six. Illustrations, app screens, logos and invented figures are removed; the
// business's photos, offer and reasons take their place. Tabs and scroll-spy become static.

import { Check } from 'lucide-react'
import { type BlockProps, Button, Container, cx, Img, items, type SiteContent } from '../../ui.tsx'

const pics = (c: SiteContent) => [
  c.photos.d1,
  c.photos.d2,
  c.photos.about,
  c.photos.cta,
  c.photos.hero,
]
const pic = (c: SiteContent, i: number) => pics(c)[i % 5] ?? c.photos.hero

/** An offer item as one line: name, detail, price. */
function ItemLine(p: { i: ReturnType<typeof items>[number]; className?: string }) {
  return (
    <p className={cx('text-muted-foreground text-balance', p.className)}>
      <span className="text-foreground font-medium">{p.i.name}.</span>
      {p.i.detail && ` ${p.i.detail}`}
      {p.i.price && <span className="text-foreground ml-2 tabular-nums">{p.i.price}</span>}
    </p>
  )
}

/* ------------------------------------------------------------------ offer */

/** The offer as a table on a soft panel, grouped (Mist, features one). */
export function OfferMistOne({ c }: BlockProps) {
  return (
    <section id="offer" className="bg-muted/50 py-24">
      <Container>
        <h2 className="text-4xl">{c.offerTitle}</h2>
        <div className="bg-foreground/5 mt-12 rounded-3xl p-3 sm:p-6">
          <div className="bg-background overflow-x-auto rounded-xl p-4 shadow-md ring-1 shadow-foreground/5 ring-foreground/5 sm:p-6">
            <table className="w-full table-auto border-collapse text-sm">
              {c.prices.map((g) => (
                <tbody key={g.group || 'all'}>
                  {g.group && (
                    <tr>
                      <th
                        colSpan={3}
                        className="bg-muted p-3 text-start text-sm font-medium first:rounded-md"
                      >
                        {g.group}
                      </th>
                    </tr>
                  )}
                  {g.items.map((i) => (
                    <tr key={i.name} className="*:border-b *:p-3">
                      <td className="text-foreground font-medium">{i.name}</td>
                      <td className="text-muted-foreground max-sm:hidden">{i.detail}</td>
                      <td className="text-end tabular-nums">{i.price}</td>
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
        </div>
      </Container>
    </section>
  )
}

/** Two photo cards, then everything offered as short lines in columns (Dusk, features one). */
export function OfferDuskOne({ c }: BlockProps) {
  return (
    <section id="offer" className="py-16 md:py-20">
      <Container wide>
        <h2 className="max-w-4xl text-balance text-4xl lg:text-5xl">{c.offerTitle}</h2>
        <div className="mt-8 grid gap-3 md:mt-16 md:grid-cols-2 lg:grid-cols-3">
          <div className="aspect-square overflow-hidden rounded-xl ring-1 ring-foreground/10 md:aspect-auto md:min-h-80">
            <Img photo={c.photos.d1} />
          </div>
          <div className="aspect-[4/3] overflow-hidden rounded-xl ring-1 ring-foreground/10 lg:col-span-2">
            <Img photo={c.photos.d2} />
          </div>
        </div>
        <div className="mt-12 grid gap-3 *:max-w-xs max-sm:*:not-last:border-b max-sm:*:not-last:pb-3 sm:grid-cols-2 md:mt-16 md:gap-y-6 lg:mt-24 lg:grid-cols-4 lg:gap-6">
          {items(c).map((i) => (
            <ItemLine key={i.name} i={i} />
          ))}
        </div>
      </Container>
    </section>
  )
}

/** A wide photo fading at its foot, the offer in columns beneath (Dusk, features six). */
export function OfferDuskSix({ c }: BlockProps) {
  return (
    <section id="offer" className="py-16 md:py-20">
      <Container wide className="space-y-12">
        <h2 className="relative z-10 max-w-4xl text-balance text-4xl lg:text-5xl">
          {c.offerTitle}
        </h2>
        <div className="relative aspect-[88/36] overflow-hidden rounded-t-3xl mask-b-from-75% mask-b-to-95%">
          <Img photo={c.photos.d1} />
        </div>
        <div className="mt-12 grid gap-3 *:max-w-xs max-sm:*:not-last:border-b max-sm:*:not-last:pb-3 sm:grid-cols-2 md:mt-16 md:gap-y-6 lg:grid-cols-4 lg:gap-6">
          {items(c).map((i) => (
            <ItemLine key={i.name} i={i} />
          ))}
        </div>
      </Container>
    </section>
  )
}

/** The offer in soft bordered cards, two across (Veil, features two). */
export function OfferVeilTwo({ c }: BlockProps) {
  return (
    <section id="offer" className="bg-background @container py-24">
      <div className="mx-auto max-w-2xl px-6">
        <h2 className="text-balance text-4xl">{c.offerTitle}</h2>
        <div className="mt-12 grid gap-3 @xl:grid-cols-2">
          {items(c).map((i) => (
            <div key={i.name} className="bg-foreground/5 border-foreground/5 rounded-xl border p-6">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-foreground font-medium">{i.name}</h3>
                {i.price && <span className="text-sm tabular-nums">{i.price}</span>}
              </div>
              {i.detail && <p className="text-muted-foreground mt-2 text-sm">{i.detail}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Heading and a list of what is offered on one side, a tall photo on the other (Veil, three). */
export function OfferVeilThree({ c }: BlockProps) {
  return (
    <section id="offer" className="bg-background @container py-24">
      <div className="mx-auto grid max-w-3xl gap-6 px-6 @2xl:grid-cols-2">
        <div>
          <h2 className="text-balance text-4xl">{c.offerTitle}</h2>
          <Button href={c.book} variant="outline" className="mt-6 h-8 px-3">
            {c.cta.label}
          </Button>
          <ul className="mt-12">
            {items(c).map((i) => (
              <li key={i.name} className="flex items-baseline gap-3 py-2 text-sm">
                <span className="flex -space-x-1.5" aria-hidden>
                  <span className="size-2.5 rounded-full border border-current" />
                  <span className="size-2.5 rounded-full border border-current" />
                </span>
                <span className="flex-1">
                  {i.name}
                  {i.detail && <span className="text-muted-foreground block">{i.detail}</span>}
                </span>
                {i.price && <span className="tabular-nums">{i.price}</span>}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-muted relative aspect-[4/5] overflow-hidden rounded-3xl @max-xl:-mx-6 @2xl:aspect-auto">
          <Img photo={c.photos.d1} />
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ reasons */

/** The reasons in cards, each with a photo set low inside it (Dusk, features two). */
export function ReasonsDuskTwo({ c }: BlockProps) {
  return (
    <section className="py-16 md:py-20">
      <Container wide>
        <h2 className="max-w-4xl text-balance text-4xl lg:text-5xl">{c.reasonsTitle}</h2>
        <div className="mt-8 grid gap-3 md:mt-16 md:grid-cols-2 lg:grid-cols-3">
          {c.reasons.map((r, i) => (
            <div
              key={r.title}
              className="bg-background flex flex-col overflow-hidden rounded-xl shadow ring-1 ring-foreground/5"
            >
              <p className="text-muted-foreground max-w-xs p-8 text-lg font-medium">
                <span className="text-foreground">{r.title}.</span> {r.body}
              </p>
              <div className="mt-auto px-8 mask-b-from-75%">
                <div className="aspect-square overflow-hidden rounded-t-xl ring-1 ring-foreground/10">
                  <Img photo={pic(c, i)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

/** Tall photos with a short caption under each (Dusk, features three). */
export function ReasonsDuskThree({ c }: BlockProps) {
  return (
    <section className="py-16 md:py-20">
      <Container wide>
        <h2 className="max-w-4xl text-balance text-4xl">{c.reasonsTitle}</h2>
        <div className="mt-8 grid gap-x-3 gap-y-8 md:mt-16 md:grid-cols-2 lg:grid-cols-3">
          {c.reasons.map((r, i) => (
            <div key={r.title} className="space-y-4">
              <div className="aspect-[9/12] overflow-hidden rounded-xl">
                <Img photo={pic(c, i)} />
              </div>
              <p className="text-muted-foreground text-balance">
                <span className="text-foreground">{r.title}. </span> {r.body}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

/** Two large cards with words over a faded photo (Dusk, features four). */
export function ReasonsDuskFour({ c }: BlockProps) {
  // Wide, narrow; narrow, wide; … and a last card alone on its row takes the whole row.
  const n = c.reasons.length
  const span = (i: number) =>
    i === n - 1 && i % 2 === 0 ? 'lg:col-span-3' : i % 4 === 0 || i % 4 === 3 ? 'lg:col-span-2' : ''
  return (
    <section className="py-16 md:py-20">
      <Container wide>
        <h2 className="max-w-4xl text-balance text-4xl">{c.reasonsTitle}</h2>
        <div className="mt-8 grid gap-6 md:mt-16 md:grid-cols-2 md:gap-3 lg:grid-cols-3">
          {c.reasons.map((r, i) => (
            <div
              key={r.title}
              className={cx(
                'bg-card relative min-h-96 overflow-hidden rounded-xl ring-1 ring-foreground/5',
                span(i),
              )}
            >
              <div className="absolute inset-0 opacity-40">
                <Img photo={pic(c, i)} />
              </div>
              <div className="from-card absolute inset-0 bg-gradient-to-b via-card/60 to-transparent" />
              <p className="text-foreground/75 relative z-10 max-w-md text-balance p-8 text-lg">
                <span className="text-foreground font-medium">{r.title}. </span> {r.body}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

/** A side list of the reasons, each told in a row beside a large photo (Dusk, features five). */
export function ReasonsDuskFive({ c }: BlockProps) {
  return (
    <section className="py-16 md:py-20">
      <Container wide>
        <h2 className="max-w-4xl text-balance text-4xl">{c.reasonsTitle}</h2>
        <div className="mt-16 grid gap-6 md:mt-24 lg:grid-cols-[auto_1fr]">
          <ul className="sticky top-24 h-fit w-56 space-y-3 text-sm max-lg:hidden">
            {c.reasons.map((r, i) => (
              <li key={r.title}>
                <a
                  href={`#reason-${i + 1}`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {r.title}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-16 md:gap-24">
            {c.reasons.map((r, i) => (
              <div
                key={r.title}
                id={`reason-${i + 1}`}
                className="grid scroll-mt-32 gap-6 sm:grid-cols-2 md:grid-cols-5 lg:gap-12"
              >
                <div className="pb-4 md:col-span-2">
                  <h3 className="text-muted-foreground mb-6 text-sm font-medium">
                    {String(i + 1).padStart(2, '0')}
                  </h3>
                  <p className="text-muted-foreground text-balance text-lg font-medium">
                    <span className="text-foreground">{r.title}.</span> {r.body}
                  </p>
                </div>
                <div className="border-border/50 bg-foreground/5 relative flex aspect-square rounded-3xl border p-3 md:col-span-3">
                  <div className="size-full overflow-hidden rounded-2xl">
                    <Img photo={pic(c, i)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}

/** On a quiet band, the reasons under photos in three columns (Mist, features two). */
export function ReasonsMistTwo({ c }: BlockProps) {
  return (
    <section className="bg-muted/50 py-24">
      <Container>
        <h2 className="text-4xl">{c.reasonsTitle}</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 md:mt-16 md:grid-cols-3">
          {c.reasons.map((r, i) => (
            <div key={r.title} className="space-y-4">
              <div className="bg-foreground/5 aspect-video overflow-hidden rounded-xl px-6">
                <div className="bg-card h-full translate-y-6 overflow-hidden rounded-xl shadow ring-1 ring-foreground/5">
                  <Img photo={pic(c, i)} />
                </div>
              </div>
              <div className="sm:max-w-sm">
                <h3 className="text-xl">{r.title}</h3>
                <p className="text-muted-foreground my-4 text-lg">{r.body}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

/** Soft cards, each a photo above a centred reason (Mist, features three). */
export function ReasonsMistThree({ c }: BlockProps) {
  return (
    <section className="py-24">
      <Container>
        <h2 className="text-4xl">{c.reasonsTitle}</h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {c.reasons.map((r, i) => (
            <div key={r.title} className="bg-foreground/5 rounded-xl p-6">
              <div className="aspect-video overflow-hidden rounded-(--radius)">
                <Img photo={pic(c, i)} />
              </div>
              <div className="mt-6 text-center">
                <h3 className="text-xl">{r.title}</h3>
                <p className="text-muted-foreground mt-4 text-balance text-lg">{r.body}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

/** Heading and button on the left, the reasons on the right, a framed photo below (Mist, five). */
export function ReasonsMistFive({ c }: BlockProps) {
  return (
    <section className="bg-muted/50 py-24">
      <Container>
        <div className="grid gap-12 md:grid-cols-5">
          <div className="md:col-span-2">
            <h2 className="text-balance text-4xl">{c.reasonsTitle}</h2>
            <Button href={c.book} variant="outline" className="mt-8">
              {c.cta.label}
            </Button>
          </div>
          <div className="space-y-6 md:col-span-3 md:space-y-10">
            {c.reasons.map((r) => (
              <div key={r.title}>
                <div className="flex items-center gap-2">
                  <Check className="size-5" />
                  <h3 className="text-lg">{r.title}</h3>
                </div>
                <p className="text-muted-foreground mt-3 text-balance">{r.body}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-background relative mx-auto mt-16 aspect-[16/7] overflow-hidden rounded-(--radius) shadow-lg ring-1 shadow-foreground/10 ring-foreground/10">
          <Img photo={c.photos.d1} />
        </div>
      </Container>
    </section>
  )
}

/** Heading above three soft cards with a small mark (Mist, features six). */
export function ReasonsMistSix({ c }: BlockProps) {
  return (
    <section className="py-24">
      <Container>
        <h2 className="max-w-2xl text-balance text-4xl">{c.reasonsTitle}</h2>
        <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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

/** Centred heading, then rows of a framed photo beside each reason (Mist, features nine). */
export function ReasonsMistNine({ c }: BlockProps) {
  return (
    <section className="py-24">
      <div className="mx-auto w-full max-w-2xl px-6 lg:px-0">
        <h2 className="text-balance text-center text-4xl">{c.reasonsTitle}</h2>
        <div className="mt-16 space-y-12">
          {c.reasons.map((r, i) => (
            <div key={r.title} className="grid items-center gap-6 sm:grid-cols-5">
              <div className="bg-foreground/5 rounded-xl p-3 sm:col-span-2">
                <div className="aspect-[4/3] overflow-hidden rounded-(--radius)">
                  <Img photo={pic(c, i)} />
                </div>
              </div>
              <div className="max-w-md sm:col-span-3">
                <h3 className="text-lg">{r.title}</h3>
                <p className="text-muted-foreground mt-3 text-balance">{r.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/** One reason wide with a photo, the others in two columns below (Mist, features ten). */
export function ReasonsMistTen({ c }: BlockProps) {
  const [first, ...rest] = c.reasons
  return (
    <section className="py-24">
      <div className="mx-auto w-full max-w-3xl px-6">
        <h2 className="text-balance text-3xl md:text-4xl">{c.reasonsTitle}</h2>
        <div className="mt-12 grid gap-12 sm:grid-cols-2">
          {first && (
            <div className="col-span-full space-y-4">
              <div className="bg-foreground/5 overflow-hidden rounded-xl px-6 pt-8">
                <div className="mx-auto aspect-[16/9] max-w-lg overflow-hidden rounded-t-xl mask-b-from-75%">
                  <Img photo={pic(c, 0)} />
                </div>
              </div>
              <div className="max-w-md">
                <h3 className="text-lg">{first.title}</h3>
                <p className="text-muted-foreground mt-3 text-balance">{first.body}</p>
              </div>
            </div>
          )}
          {rest.map((r, i) => (
            <div key={r.title} className="grid grid-rows-[1fr_auto] space-y-4">
              <div className="bg-foreground/5 rounded-xl p-6">
                <div className="aspect-[4/3] overflow-hidden rounded-(--radius)">
                  <Img photo={pic(c, i + 1)} />
                </div>
              </div>
              <div>
                <h3 className="text-lg">{r.title}</h3>
                <p className="text-muted-foreground mt-3 text-balance">{r.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/** A wide photo card, the reasons in plain columns below (Mist, features eleven). */
export function ReasonsMistEleven({ c }: BlockProps) {
  return (
    <section className="py-24">
      <div className="mx-auto w-full max-w-3xl px-6">
        <h2 className="text-balance text-3xl md:text-4xl">
          <span className="text-muted-foreground">{c.name}:</span> {c.reasonsTitle}
        </h2>
        <div className="@container mt-12 space-y-12">
          <div className="bg-foreground/5 relative aspect-[16/9] overflow-hidden rounded-xl">
            <Img photo={c.photos.d2} />
          </div>
          <div className="grid gap-6 @sm:grid-cols-2 @2xl:grid-cols-3">
            {c.reasons.map((r) => (
              <div key={r.title} className="space-y-2">
                <h3 className="text-xl">{r.title}</h3>
                <p className="text-muted-foreground">{r.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/** Outlined cards, each a reason with a photo strip at its foot (Veil, features one). */
export function ReasonsVeilFeaturesOne({ c }: BlockProps) {
  return (
    <section className="bg-background @container py-24">
      <div className="mx-auto max-w-2xl px-6">
        <h2 className="text-balance text-4xl">{c.reasonsTitle}</h2>
        <div className="mt-12 grid gap-3 @xl:grid-cols-2">
          {c.reasons.map((r, i) => (
            <div key={r.title} className="flex flex-col overflow-hidden rounded-xl border">
              <div className="space-y-2 p-6">
                <h3 className="text-foreground font-medium">{r.title}</h3>
                <p className="text-muted-foreground text-sm">{r.body}</p>
              </div>
              <div className="mt-auto h-44 overflow-hidden mask-t-from-50%">
                <Img photo={pic(c, i)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
