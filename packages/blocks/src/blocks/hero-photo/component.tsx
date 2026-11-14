import {
  Actions,
  type BlockProps,
  Container,
  cx,
  Eyebrow,
  FitLine,
  Heading,
  OnPhoto,
  Panel,
  PhotoShade,
  Picture,
  Section,
  Text,
} from '../../kit/index.tsx'

// Openings led by photos, each with a different shape:
// - half: edge to edge, the photo fills one half and a brand-coloured panel the other.
// - cover: a full-width photo with the business name across its top as a masthead (one line that
//   fills the width) and the words at its foot. Shaded at both ends, clear in the middle.
// - portrait: words with space around them; one tall photo runs off the top and the end edge.
// - triptych: the headline and buttons above two or three tall photos in a row.
// Full bleed: the section keeps its gutter for text; photos step out of it with negative margins.
export default function HeroPhoto({ content: c, variant, ctx }: BlockProps<'hero'>) {
  const proof = (muted: boolean) =>
    c.proof && (
      <p data-slot="proof" className={cx('type-small', muted && 'text-fg-muted')}>
        {c.proof.link ? <a href={ctx.href(c.proof.link)}>{c.proof.text}</a> : c.proof.text}
      </p>
    )
  const words = (o: { muted: boolean }) => (
    <>
      <div className="flex flex-col gap-sm">
        {c.eyebrow && <Eyebrow>{c.eyebrow}</Eyebrow>}
        <Heading ctx={ctx} style="display" slot="headline">
          {c.headline}
        </Heading>
        {c.subhead && (
          <Text style="lead" slot="subhead" muted={o.muted}>
            {c.subhead}
          </Text>
        )}
      </div>
      <Actions ctx={ctx} primary={c.primaryCta} secondary={c.secondaryCta} />
      {proof(o.muted)}
    </>
  )

  if (variant === 'triptych') {
    const images = (c.gallery ?? []).slice(0, 3)
    if (images.length < 2) return null
    return (
      <Section ctx={ctx}>
        <Container width="wide" className="flex flex-col gap-xl">
          <div className="grid gap-lg @lg:grid-cols-12 @lg:items-end">
            <div className="flex flex-col gap-sm @lg:col-span-7">
              {c.eyebrow && <Eyebrow>{c.eyebrow}</Eyebrow>}
              <Heading ctx={ctx} style="display" slot="headline">
                {c.headline}
              </Heading>
            </div>
            <div className="flex flex-col items-start gap-md @lg:col-span-4 @lg:col-start-9">
              {c.subhead && (
                <Text style="lead" slot="subhead" muted>
                  {c.subhead}
                </Text>
              )}
              <Actions ctx={ctx} primary={c.primaryCta} secondary={c.secondaryCta} />
              {proof(true)}
            </div>
          </div>
          <div
            data-slot="gallery"
            className={cx('grid gap-xs', images.length === 3 ? 'grid-cols-3' : 'grid-cols-2')}
          >
            {images.map((g, i) => (
              <Picture
                key={g.id}
                ctx={ctx}
                image={g.image}
                aspect={4 / 5}
                priority={i === 0}
                share={images.length === 3 ? 'quarter' : 'half'}
                className="aspect-portrait h-full w-full"
              />
            ))}
          </div>
        </Container>
      </Section>
    )
  }

  if (!c.media) return null

  if (variant === 'half') {
    return (
      <Section ctx={ctx} space="none">
        <div className="-mx-gutter grid grid-cols-1 @lg:grid-cols-2">
          <Picture
            ctx={ctx}
            image={c.media}
            slot="media"
            aspect={1}
            priority
            share="half"
            className="h-full w-full rounded-none aspect-landscape @lg:aspect-square"
          />
          <Panel
            surface="brand"
            className="flex min-w-0 flex-col items-start justify-end gap-md px-gutter py-section @lg:px-xl"
          >
            {words({ muted: false })}
          </Panel>
        </div>
      </Section>
    )
  }

  if (variant === 'cover') {
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
            className="col-start-1 row-start-1 h-full w-full rounded-none aspect-portrait @md:aspect-landscape @lg:aspect-wide"
          />
          <PhotoShade from="ends" className="col-start-1 row-start-1" />
          <OnPhoto className="col-start-1 row-start-1 flex min-w-0 flex-col justify-between gap-section px-gutter py-lg">
            <FitLine text={ctx.business.name} />
            <div className="flex max-w-prose flex-col items-start gap-md">
              {words({ muted: false })}
            </div>
          </OnPhoto>
        </div>
      </Section>
    )
  }

  // portrait
  return (
    <Section ctx={ctx} space="none">
      <div className="grid grid-cols-1 gap-xl @lg:grid-cols-12 @lg:gap-0">
        <div className="-mx-gutter @lg:col-span-5 @lg:col-start-8 @lg:row-start-1 @lg:ms-0">
          <Picture
            ctx={ctx}
            image={c.media}
            slot="media"
            aspect={4 / 5}
            priority
            share="half"
            className="h-full w-full rounded-none aspect-landscape @lg:aspect-portrait"
          />
        </div>
        <div className="flex min-w-0 flex-col items-start justify-center gap-md pb-section @lg:col-span-6 @lg:row-start-1 @lg:py-section">
          {words({ muted: true })}
        </div>
      </div>
    </Section>
  )
}
