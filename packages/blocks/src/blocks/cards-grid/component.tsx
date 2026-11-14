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
  type Share,
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

function Card(p: { ctx: RenderCtx; item: Item; level: 2 | 3; variant: string; share: Share }) {
  const { ctx, item } = p
  const titleId = `${ctx.id}-${item.id}`
  const showImage = p.variant === 'images' && item.media
  const boxed = p.variant === 'bordered'
  return (
    <li
      data-item-id={item.id}
      className={cx(
        'flex min-w-0 flex-col gap-sm',
        boxed && 'rounded-card border border-border p-md',
      )}
    >
      {showImage && item.media && (
        <Picture
          ctx={ctx}
          image={item.media}
          share={p.share}
          aspect={3 / 2}
          className="aspect-landscape w-full"
        />
      )}
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
          className="type-body mt-auto inline-flex min-h-tap items-center self-start underline underline-offset-4"
        >
          {item.link.label}
        </a>
      )}
    </li>
  )
}

export default function CardsGrid({ content: c, variant, ctx }: BlockProps<'cards'>) {
  const n = c.items.length
  const level = c.headline ? 3 : 2
  const share: Share = n === 2 ? 'half' : n === 4 ? 'quarter' : 'third'
  const hasHeader = c.eyebrow || c.headline || c.subhead
  const hasFooter = c.primaryCta || c.note
  const plain = variant === 'plain'
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
        <ul
          data-slot="items"
          className={cx(
            'grid @md:grid-cols-2',
            plain && 'gap-x-columns gap-y-xl',
            !plain && 'gap-lg',
            n === 4 && '@lg:grid-cols-4',
            n !== 2 && n !== 4 && '@lg:grid-cols-3',
          )}
        >
          {c.items.map((item) => (
            <Card
              key={item.id}
              ctx={ctx}
              item={item}
              level={level}
              variant={variant}
              share={share}
            />
          ))}
        </ul>
        {hasFooter && (
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
