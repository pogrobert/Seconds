import {
  Actions,
  type BlockProps,
  Container,
  Eyebrow,
  Heading,
  Picture,
  Section,
  Text,
} from '../../kit/index.tsx'

// Editorial openings, each built on one big photo and one idea:
// - stacked: a jumbo headline across the page, then the photo as a full-bleed band.
// - framed: the photo set in towards the end edge; a solid panel in the page colour carries the
//   headline and cuts into the photo's lower start corner.
// - card: a full-bleed photo with every word on a solid card at its lower start corner. No shade
//   touches the photo. On phones the card sits under the photo and overlaps its foot.
// Full bleed: the section keeps its gutter for text; the photo's wrapper steps out of it with -mx-gutter.
export default function HeroEditorial({ content: c, variant, ctx }: BlockProps<'hero'>) {
  if (!c.media) return null
  const proof = c.proof && (
    <p data-slot="proof" className="type-small text-fg-muted">
      {c.proof.link ? <a href={ctx.href(c.proof.link)}>{c.proof.text}</a> : c.proof.text}
    </p>
  )

  if (variant === 'stacked') {
    return (
      <Section ctx={ctx} space="none" className="pt-section">
        <Container width="wide" className="flex flex-col gap-xl">
          <div className="flex flex-col gap-md">
            {c.eyebrow && <Eyebrow>{c.eyebrow}</Eyebrow>}
            <Heading ctx={ctx} style="jumbo" slot="headline" className="hyphens-auto break-words">
              {c.headline}
            </Heading>
          </div>
          <div className="grid gap-lg @lg:grid-cols-12 @lg:items-end">
            {c.subhead && (
              <Text style="lead" slot="subhead" className="@lg:col-span-6">
                {c.subhead}
              </Text>
            )}
            <div className="flex flex-col gap-md @lg:col-span-5 @lg:col-start-8 @lg:items-end">
              <Actions ctx={ctx} primary={c.primaryCta} secondary={c.secondaryCta} />
              {proof}
            </div>
          </div>
        </Container>
        <div className="-mx-gutter mt-xl">
          <Picture
            ctx={ctx}
            image={c.media}
            slot="media"
            aspect={16 / 9}
            priority
            share="full"
            className="w-full rounded-none aspect-square @md:aspect-landscape @lg:aspect-wide"
          />
        </div>
      </Section>
    )
  }

  if (variant === 'framed') {
    return (
      <Section ctx={ctx}>
        {/* Wide screens: the photo spans rows 1–2, the panel is row 2, so the panel's foot lines up
            with the photo's foot and the panel bites into its lower start corner. */}
        <Container width="wide" className="grid grid-cols-1 @lg:grid-cols-12">
          <Picture
            ctx={ctx}
            image={c.media}
            slot="media"
            aspect={16 / 9}
            priority
            share="full"
            className="h-full w-full aspect-landscape @lg:col-span-10 @lg:col-start-3 @lg:row-span-2 @lg:row-start-1 @lg:aspect-wide"
          />
          <div className="relative -mt-2xl me-lg flex flex-col gap-md bg-bg pe-lg pt-lg @md:-mt-section @lg:col-span-7 @lg:col-start-1 @lg:row-start-2 @lg:self-end @lg:me-0 @lg:mt-0 @lg:pe-xl @lg:pt-xl">
            {c.eyebrow && <Eyebrow>{c.eyebrow}</Eyebrow>}
            <Heading ctx={ctx} style="display" slot="headline">
              {c.headline}
            </Heading>
          </div>
          <div className="flex flex-col gap-md pt-lg @lg:col-span-6 @lg:col-start-1 @lg:row-start-3">
            {c.subhead && (
              <Text style="lead" slot="subhead" muted>
                {c.subhead}
              </Text>
            )}
            <Actions ctx={ctx} primary={c.primaryCta} secondary={c.secondaryCta} />
            {proof}
          </div>
        </Container>
      </Section>
    )
  }

  // card
  return (
    <Section ctx={ctx} space="none">
      <div className="-mx-gutter grid grid-cols-1">
        <Picture
          ctx={ctx}
          image={c.media}
          slot="media"
          aspect={16 / 9}
          priority
          share="full"
          className="col-start-1 row-start-1 h-full w-full rounded-none aspect-square @md:aspect-landscape @lg:aspect-wide"
        />
        <div className="relative col-start-1 row-start-2 mx-gutter -mt-2xl mb-section flex flex-col gap-md rounded-card bg-bg p-lg @md:row-start-1 @md:my-xl @md:max-w-prose @md:self-end @md:justify-self-start @lg:p-xl">
          <div className="flex flex-col gap-sm">
            {c.eyebrow && <Eyebrow>{c.eyebrow}</Eyebrow>}
            <Heading ctx={ctx} style="display" slot="headline">
              {c.headline}
            </Heading>
            {c.subhead && (
              <Text style="lead" slot="subhead" muted>
                {c.subhead}
              </Text>
            )}
          </div>
          <Actions ctx={ctx} primary={c.primaryCta} secondary={c.secondaryCta} />
          {c.proof && <div className="border-t border-border pt-md">{proof}</div>}
        </div>
      </div>
    </Section>
  )
}
