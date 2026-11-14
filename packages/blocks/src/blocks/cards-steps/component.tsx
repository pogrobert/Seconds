import {
  Actions,
  type BlockProps,
  Container,
  cx,
  Eyebrow,
  Heading,
  Picture,
  type RenderCtx,
  RichText,
  Section,
  Text,
} from '../../kit/index.tsx'

type Content = BlockProps<'cards'>['content']
type Item = Content['items'][number]

/** An item title. Its level follows the section: h3 under a section headline, h2 without one. */
function ItemTitle(p: { level: 2 | 3; id: string; children: string }) {
  const Tag = `h${p.level}` as 'h2' | 'h3'
  return (
    <Tag id={p.id} className="type-h3 max-w-full text-balance">
      {p.children}
    </Tag>
  )
}

/** Eyebrow, title, text and link of one item. */
function ItemText(p: { ctx: RenderCtx; item: Item; level: 2 | 3 }) {
  const { ctx, item } = p
  const titleId = `${ctx.id}-${item.id}`
  return (
    <div className="flex min-w-0 flex-col gap-sm">
      <div className="flex flex-col gap-xs">
        {item.eyebrow && <p className="type-eyebrow text-fg-muted">{item.eyebrow}</p>}
        <ItemTitle level={p.level} id={titleId}>
          {item.title}
        </ItemTitle>
      </div>
      {item.body && <RichText ctx={ctx} value={item.body} slot="body" className="text-fg-muted" />}
      {item.link && (
        <a
          href={ctx.href(item.link.to)}
          aria-describedby={titleId}
          className="type-body inline-flex min-h-tap items-center self-start underline underline-offset-4"
        >
          {item.link.label}
        </a>
      )}
    </div>
  )
}

export default function CardsSteps({ content: c, variant, ctx }: BlockProps<'cards'>) {
  const level = c.headline ? 3 : 2
  const hasHeader = c.eyebrow || c.headline || c.subhead
  const header = hasHeader && (
    <div className="flex max-w-prose flex-col gap-sm">
      {c.eyebrow && <Eyebrow>{c.eyebrow}</Eyebrow>}
      {c.headline && (
        <Heading ctx={ctx} style="h2" slot="headline">
          {c.headline}
        </Heading>
      )}
      {c.subhead && (
        <Text style="lead" slot="subhead" muted>
          {c.subhead}
        </Text>
      )}
    </div>
  )
  const footer = (c.primaryCta || c.note) && (
    <div className="flex flex-col items-start gap-md">
      <Actions ctx={ctx} primary={c.primaryCta} />
      {c.note && (
        <Text style="small" slot="note" muted className="max-w-prose">
          {c.note}
        </Text>
      )}
    </div>
  )

  if (variant === 'rows') {
    return (
      <Section ctx={ctx}>
        <Container className="flex flex-col gap-xl">
          {header}
          <ul data-slot="items" className="flex flex-col gap-2xl">
            {c.items.map((item, i) => {
              const flip = i % 2 === 1
              return (
                <li
                  key={item.id}
                  data-item-id={item.id}
                  className={cx(
                    'grid items-center gap-columns',
                    item.media && '@md:grid-cols-2',
                    !item.media && 'max-w-prose',
                  )}
                >
                  {item.media && (
                    <Picture
                      ctx={ctx}
                      image={item.media}
                      share="half"
                      aspect={3 / 2}
                      className={cx('aspect-landscape w-full', flip && '@md:order-last')}
                    />
                  )}
                  <ItemText ctx={ctx} item={item} level={level} />
                </li>
              )
            })}
          </ul>
          {footer}
        </Container>
      </Section>
    )
  }

  // numbered: an ordered list of steps, beside the heading on wide screens.
  return (
    <Section ctx={ctx}>
      <Container className={cx('grid gap-xl', hasHeader && '@lg:grid-cols-3 @lg:gap-columns')}>
        {header}
        <div className={cx('flex max-w-prose flex-col gap-xl', hasHeader && '@lg:col-span-2')}>
          <ol data-slot="items" className="flex flex-col gap-lg">
            {c.items.map((item, i) => (
              <li key={item.id} data-item-id={item.id} className="flex items-start gap-md">
                <span
                  aria-hidden="true"
                  className="type-body inline-flex size-tap shrink-0 items-center justify-center rounded-full border border-border tabular-nums"
                >
                  {i + 1}
                </span>
                <div className="min-w-0 pt-xs">
                  <ItemText ctx={ctx} item={item} level={level} />
                </div>
              </li>
            ))}
          </ol>
          {footer}
        </div>
      </Container>
    </Section>
  )
}
