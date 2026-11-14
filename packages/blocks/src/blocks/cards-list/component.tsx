import {
  Actions,
  type BlockProps,
  Container,
  cx,
  Eyebrow,
  Heading,
  type RenderCtx,
  RichText,
  Section,
  Text,
} from '../../kit/index.tsx'

type Content = BlockProps<'cards'>['content']
type Item = Content['items'][number]
type Level = 2 | 3 | 4

/** A heading at a level that follows the section's own headings. `strong` bolds a body-size title. */
function Title(p: {
  level: Level
  id?: string
  strong?: boolean
  className: string
  children: string
}) {
  const Tag = `h${p.level}` as 'h2' | 'h3' | 'h4'
  return (
    <Tag id={p.id} className={p.className}>
      {p.strong ? <strong>{p.children}</strong> : p.children}
    </Tag>
  )
}

/** Items in the order given, gathered under their group names in order of first appearance. */
function byGroup(items: Item[]) {
  const groups: { name?: string; items: Item[] }[] = []
  for (const item of items) {
    const g = groups.find((x) => x.name === item.group)
    if (g) g.items.push(item)
    else groups.push({ name: item.group, items: [item] })
  }
  return groups
}

function Row(p: { ctx: RenderCtx; item: Item; level: Level; wide: boolean }) {
  const { ctx, item } = p
  const titleId = `${ctx.id}-${item.id}`
  return (
    <li
      data-item-id={item.id}
      className={cx(
        'grid min-w-0 gap-2xs border-b border-border py-sm',
        p.wide && '@md:grid-cols-3 @md:gap-md',
      )}
    >
      <div className="flex min-w-0 flex-col gap-2xs">
        {item.eyebrow && <p className="type-eyebrow text-fg-muted">{item.eyebrow}</p>}
        <Title level={p.level} id={titleId} strong className="type-body max-w-full text-pretty">
          {item.title}
        </Title>
      </div>
      {(item.body || item.link) && (
        <div className={cx('flex min-w-0 flex-col gap-2xs', p.wide && '@md:col-span-2')}>
          {item.body && (
            <RichText ctx={ctx} value={item.body} slot="body" className="text-fg-muted" />
          )}
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
      )}
    </li>
  )
}

export default function CardsList({ content: c, variant, ctx }: BlockProps<'cards'>) {
  const two = variant === 'two-column'
  const base: Level = c.headline ? 3 : 2
  const groups = byGroup(c.items)
  const hasHeader = c.eyebrow || c.headline || c.subhead
  return (
    <Section ctx={ctx}>
      <Container className="flex flex-col gap-xl">
        {hasHeader && (
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
        )}
        <div data-slot="items" className="flex flex-col gap-xl">
          {groups.map((g) => {
            const level: Level = g.name ? (base === 2 ? 3 : 4) : base
            return (
              <div key={g.name ?? g.items[0]?.id} className="flex flex-col gap-sm">
                {g.name && (
                  <Title level={base} className="type-h3 max-w-full text-balance">
                    {g.name}
                  </Title>
                )}
                <ul
                  className={cx(
                    'grid border-t border-border',
                    two && '@md:grid-cols-2 @md:gap-x-columns',
                  )}
                >
                  {g.items.map((item) => (
                    <Row key={item.id} ctx={ctx} item={item} level={level} wide={!two} />
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
        {(c.primaryCta || c.note) && (
          <div className="flex flex-col items-start gap-md">
            <Actions ctx={ctx} primary={c.primaryCta} />
            {c.note && (
              <Text style="small" slot="note" muted className="max-w-prose">
                {c.note}
              </Text>
            )}
          </div>
        )}
      </Container>
    </Section>
  )
}
