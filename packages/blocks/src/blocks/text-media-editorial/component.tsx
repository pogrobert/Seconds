import {
  Actions,
  type BlockProps,
  Container,
  cx,
  Eyebrow,
  Heading,
  Picture,
  RichText,
  Section,
} from '../../kit/index.tsx'

export default function TextMediaEditorial({ content: c, variant, ctx }: BlockProps<'text-media'>) {
  const heading = (c.eyebrow || c.headline) && (
    <div className="flex flex-col gap-sm">
      {c.eyebrow && <Eyebrow>{c.eyebrow}</Eyebrow>}
      {c.headline && (
        <Heading ctx={ctx} style="h2" slot="headline">
          {c.headline}
        </Heading>
      )}
    </div>
  )
  const body = (
    <div className="flex min-w-0 flex-col items-start gap-md">
      <RichText ctx={ctx} value={c.body} slot="body" className="max-w-prose" />
      <Actions ctx={ctx} primary={c.primaryCta} secondary={c.secondaryCta} className="pt-xs" />
    </div>
  )

  const images = variant === 'gallery' ? (c.gallery ?? []) : []
  if (images.length === 0) {
    // heading-aside: a narrow heading column and a wider text column, side by side on wide screens.
    return (
      <Section ctx={ctx}>
        <Container className="grid gap-lg @lg:grid-cols-5 @lg:gap-columns">
          {/* Two fifths, not a third: wide enough for long words in the largest capitals. */}
          <div className="min-w-0 @lg:col-span-2">{heading}</div>
          <div className="min-w-0 @lg:col-span-3">{body}</div>
        </Container>
      </Section>
    )
  }

  // gallery: 2 side by side, 3 as one wide over two square, 4 as a square grid.
  const odd = images.length === 3
  return (
    <Section ctx={ctx}>
      <Container className="grid items-center gap-columns @lg:grid-cols-2">
        <div className="flex min-w-0 flex-col items-start gap-md">
          {heading}
          {body}
        </div>
        <ul data-slot="gallery" className="grid grid-cols-2 gap-xs">
          {images.map((g, i) => {
            const wide = odd && i === 0
            const tall = images.length === 2
            return (
              <li key={g.id} className={cx('min-w-0', wide && 'col-span-2')}>
                <figure className="flex flex-col gap-2xs">
                  <Picture
                    ctx={ctx}
                    image={g.image}
                    aspect={wide ? 3 / 2 : tall ? 4 / 5 : 1}
                    share={wide ? 'half' : 'quarter'}
                    className={cx(
                      'w-full',
                      wide ? 'aspect-landscape' : tall ? 'aspect-portrait' : 'aspect-square',
                    )}
                  />
                  {g.caption && (
                    <figcaption className="type-small text-fg-muted text-pretty">
                      {g.caption}
                    </figcaption>
                  )}
                </figure>
              </li>
            )
          })}
        </ul>
      </Container>
    </Section>
  )
}
