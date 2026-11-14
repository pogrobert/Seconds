import {
  Actions,
  type BlockProps,
  Container,
  cx,
  Heading,
  OnPhoto,
  PhotoShade,
  Picture,
  Section,
  Text,
} from '../../kit/index.tsx'

// Text over one full-width photo. The photo, the kit's dark shade and the text share one grid cell,
// so the photo grows with the text and nothing is ever clipped. The shade comes from the inverse
// surface: strongest at the foot for `bottom`, even for `center`. OnPhoto switches the text to
// light-on-dark, so the photo keeps its own colour instead of being washed out.
export default function HeroOverlay({ content: c, variant, ctx }: BlockProps<'hero'>) {
  const centered = variant === 'center'
  if (!c.media) return null
  return (
    <Section ctx={ctx}>
      <Container width="wide" className="grid grid-cols-1">
        <Picture
          ctx={ctx}
          image={c.media}
          slot="media"
          aspect={3 / 2}
          priority
          share="full"
          className="col-start-1 row-start-1 h-full w-full aspect-portrait @md:aspect-landscape @lg:aspect-wide"
        />
        {centered ? (
          <PhotoShade from="even" className="col-start-1 row-start-1 rounded-media" />
        ) : (
          <PhotoShade from="bottom" className="col-start-1 row-start-1 rounded-media" />
        )}
        <OnPhoto
          className={cx(
            'col-start-1 row-start-1 flex max-w-prose flex-col gap-md p-md @md:p-xl',
            centered
              ? 'items-center self-center justify-self-center text-center'
              : 'self-end items-start pt-section',
          )}
        >
          <div className={cx('flex flex-col gap-sm', centered && 'items-center')}>
            {c.eyebrow && (
              <p data-slot="eyebrow" className="type-eyebrow">
                {c.eyebrow}
              </p>
            )}
            <Heading ctx={ctx} style="display" slot="headline">
              {c.headline}
            </Heading>
            {c.subhead && (
              <Text style="lead" slot="subhead">
                {c.subhead}
              </Text>
            )}
          </div>
          <Actions
            ctx={ctx}
            primary={c.primaryCta}
            secondary={c.secondaryCta}
            className={cx(centered && 'justify-center')}
          />
          {c.proof && (
            <p data-slot="proof" className="type-small">
              {c.proof.link ? <a href={ctx.href(c.proof.link)}>{c.proof.text}</a> : c.proof.text}
            </p>
          )}
        </OnPhoto>
      </Container>
    </Section>
  )
}
