import {
  Actions,
  type BlockProps,
  Container,
  cx,
  Heading,
  Picture,
  Section,
  Text,
} from '../../kit/index.tsx'

// Text over one full-width photo. The photo and the text share one grid cell, so the photo grows
// with the text and nothing is ever clipped. A shade in the section's own background colour sits
// between them: the kit's scrim (strongest at the foot) for `bottom`, an even shade for `center`.
// Text uses the full foreground colour, never the muted one, because it sits on a photo.
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
          <div aria-hidden="true" className="col-start-1 row-start-1 rounded-media bg-bg/65" />
        ) : (
          <>
            <div
              aria-hidden="true"
              className="col-start-1 row-start-1 rounded-media bg-bg/30 @lg:bg-transparent"
            />
            <div aria-hidden="true" className="col-start-1 row-start-1 rounded-media scrim" />
          </>
        )}
        <div
          className={cx(
            'col-start-1 row-start-1 flex max-w-prose flex-col gap-md p-md @md:p-xl text-fg',
            centered
              ? 'items-center self-center justify-self-center text-center'
              : 'self-end items-start',
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
        </div>
      </Container>
    </Section>
  )
}
