import {
  Actions,
  type BlockProps,
  ButtonLink,
  Container,
  cx,
  Heading,
  OnPhoto,
  PhotoShade,
  Picture,
  Section,
  Text,
} from '../../kit/index.tsx'

// Three ideas for one ask:
// photo-banner: the photo is the band; headline at its foot, one button at the far side.
// jumbo: one short line in the largest type, a ruled line, then a quiet sentence and the buttons.
// split-panel: two colour panels; the headline on the brand colour, the rest on a lighter surface.
export default function CtaFeature({ content: c, variant, ctx }: BlockProps<'cta'>) {
  if (variant === 'photo-banner' && c.media) {
    return (
      <Section ctx={ctx}>
        <Container width="wide" className="grid grid-cols-1">
          <Picture
            ctx={ctx}
            image={c.media}
            slot="media"
            aspect={16 / 9}
            share="full"
            className="col-start-1 row-start-1 h-full w-full aspect-portrait @md:aspect-landscape @lg:aspect-wide"
          />
          <PhotoShade from="bottom" className="col-start-1 row-start-1 rounded-media" />
          <OnPhoto className="col-start-1 row-start-1 flex flex-col gap-lg self-end p-md @md:p-xl @lg:flex-row @lg:items-end @lg:gap-2xl">
            <Heading ctx={ctx} style="display" slot="headline" className="min-w-0 flex-1">
              {c.headline}
            </Heading>
            {c.primaryCta && (
              <div className="shrink-0">
                <ButtonLink ctx={ctx} cta={c.primaryCta} slot="primaryCta" priority="primary" />
              </div>
            )}
          </OnPhoto>
        </Container>
      </Section>
    )
  }

  const rest = Boolean(c.subhead || c.primaryCta || c.secondaryCta)

  if (variant === 'split-panel') {
    const lead = ctx.surface === 'brand' ? 'inverse' : 'brand'
    const side = ctx.surface === 'muted' ? 'base' : 'muted'
    return (
      <Section ctx={ctx}>
        <Container
          width="wide"
          className={cx('grid overflow-hidden rounded-card', rest && '@lg:grid-cols-5')}
        >
          <div
            data-surface={lead}
            className={cx(
              'flex min-w-0 flex-col justify-end bg-bg p-lg text-fg @md:p-xl @lg:py-2xl',
              rest && '@lg:col-span-3',
            )}
          >
            <Heading ctx={ctx} style="display" slot="headline" className="wrap-break-word">
              {c.headline}
            </Heading>
          </div>
          {rest && (
            <div
              data-surface={side}
              className="flex min-w-0 flex-col justify-between gap-lg bg-bg p-lg text-fg @md:p-xl @lg:col-span-2 @lg:py-2xl"
            >
              {c.subhead && (
                <Text style="lead" slot="subhead">
                  {c.subhead}
                </Text>
              )}
              <Actions ctx={ctx} primary={c.primaryCta} secondary={c.secondaryCta} />
            </div>
          )}
        </Container>
      </Section>
    )
  }

  // jumbo, and photo-banner without its photo: its own fields only, at display size.
  const jumbo = variant === 'jumbo'
  const subhead = jumbo ? c.subhead : undefined
  const secondary = jumbo ? c.secondaryCta : undefined
  return (
    <Section ctx={ctx}>
      <Container width="wide" className="flex flex-col gap-xl">
        {jumbo ? (
          <Heading ctx={ctx} style="jumbo" slot="headline" className="wrap-break-word">
            {c.headline}
          </Heading>
        ) : (
          <Heading ctx={ctx} style="display" slot="headline" className="wrap-break-word">
            {c.headline}
          </Heading>
        )}
        {(subhead || c.primaryCta || secondary) && (
          <div className="grid items-start gap-lg border-t border-border pt-md @lg:grid-cols-2">
            {subhead ? (
              <Text style="lead" slot="subhead" muted className="max-w-prose">
                {subhead}
              </Text>
            ) : (
              <span aria-hidden="true" />
            )}
            <Actions
              ctx={ctx}
              primary={c.primaryCta}
              secondary={secondary}
              className="@lg:justify-end"
            />
          </div>
        )}
      </Container>
    </Section>
  )
}
