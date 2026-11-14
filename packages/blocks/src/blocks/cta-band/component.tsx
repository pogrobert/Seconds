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

export default function CtaBand({ content: c, variant, ctx }: BlockProps<'cta'>) {
  const centered = variant !== 'split' || !c.media
  const copy = (
    <div
      className={cx(
        'flex min-w-0 flex-col gap-md',
        centered ? 'items-center text-center' : 'items-start',
      )}
    >
      <div className={cx('flex flex-col gap-sm', centered && 'items-center')}>
        <Heading ctx={ctx} style="h2" slot="headline">
          {c.headline}
        </Heading>
        {c.subhead && (
          <Text style="lead" slot="subhead" muted>
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
    </div>
  )

  if (centered) {
    return (
      <Section ctx={ctx}>
        <Container width="prose" className="flex flex-col items-center">
          {copy}
        </Container>
      </Section>
    )
  }

  return (
    <Section ctx={ctx}>
      <Container className="grid items-center gap-columns @lg:grid-cols-2">
        {copy}
        {c.media && (
          <Picture
            ctx={ctx}
            image={c.media}
            slot="media"
            aspect={3 / 2}
            share="half"
            className="aspect-landscape w-full"
          />
        )}
      </Container>
    </Section>
  )
}
