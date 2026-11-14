import {
  Actions,
  type BlockProps,
  Container,
  Eyebrow,
  Heading,
  Picture,
  RichText,
  Section,
} from '../../kit/index.tsx'

export default function TextMediaSplit({ content: c, variant, ctx }: BlockProps<'text-media'>) {
  const copy = (
    <div className="flex min-w-0 flex-col items-start gap-md">
      {(c.eyebrow || c.headline) && (
        <div className="flex flex-col gap-sm">
          {c.eyebrow && <Eyebrow>{c.eyebrow}</Eyebrow>}
          {c.headline && (
            <Heading ctx={ctx} style="h2" slot="headline">
              {c.headline}
            </Heading>
          )}
        </div>
      )}
      <RichText ctx={ctx} value={c.body} slot="body" className="max-w-prose" />
      <Actions ctx={ctx} primary={c.primaryCta} secondary={c.secondaryCta} className="pt-xs" />
    </div>
  )

  if (variant === 'text-only' || !c.media) {
    return (
      <Section ctx={ctx}>
        <Container width="prose">{copy}</Container>
      </Section>
    )
  }

  // Grid columns follow the writing direction, so "start" is on the right in right-to-left text.
  const picture = (
    <Picture
      ctx={ctx}
      image={c.media}
      slot="media"
      aspect={4 / 5}
      share="half"
      className="aspect-portrait w-full"
    />
  )
  return (
    <Section ctx={ctx}>
      <Container className="grid items-center gap-columns @lg:grid-cols-2">
        {variant === 'image-start' && picture}
        {copy}
        {variant === 'image-end' && picture}
      </Container>
    </Section>
  )
}
