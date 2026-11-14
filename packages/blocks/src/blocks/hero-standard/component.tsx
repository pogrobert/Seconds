import {
  Actions,
  type BlockProps,
  Container,
  cx,
  Eyebrow,
  Heading,
  Picture,
  Section,
  Text,
} from '../../kit/index.tsx'

export default function HeroStandard({ content: c, variant, ctx }: BlockProps<'hero'>) {
  const centered = variant === 'centered'
  const copy = (
    <div
      className={cx('flex flex-col gap-md', centered ? 'items-center text-center' : 'items-start')}
    >
      <div className={cx('flex flex-col gap-sm', centered && 'items-center')}>
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
      {c.proof && (
        <p data-slot="proof" className="type-small text-fg-muted">
          {c.proof.link ? <a href={ctx.href(c.proof.link)}>{c.proof.text}</a> : c.proof.text}
        </p>
      )}
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

  const images = variant === 'collage' ? (c.gallery ?? []) : []
  return (
    <Section ctx={ctx}>
      <Container className="grid items-center gap-columns @lg:grid-cols-2">
        {copy}
        {variant === 'split' && c.media && (
          <Picture
            ctx={ctx}
            image={c.media}
            slot="media"
            aspect={4 / 5}
            priority
            share="half"
            className="aspect-portrait w-full"
          />
        )}
        {variant === 'collage' && images.length > 0 && (
          <div data-slot="gallery" className="grid grid-cols-2 gap-xs">
            {images.map((g, i) => (
              <Picture
                key={g.id}
                ctx={ctx}
                image={g.image}
                aspect={i === 0 && images.length === 3 ? 2 / 5 : 4 / 5}
                priority={i === 0}
                share="quarter"
                className={cx(
                  'w-full',
                  i === 0 && images.length === 3 ? 'row-span-2 h-full' : 'aspect-portrait',
                )}
              />
            ))}
          </div>
        )}
      </Container>
    </Section>
  )
}
