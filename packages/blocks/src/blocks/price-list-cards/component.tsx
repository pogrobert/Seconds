import {
  Actions,
  type BlockProps,
  Container,
  cx,
  Heading,
  Picture,
  type PriceView,
  type RenderCtx,
  Section,
  Text,
  viewPrice,
} from '../../kit/index.tsx'

// A price list as cards, drawn from a collection of menu items or services (decision 0001, answer 2).
// Prices are facts: every price goes through the kit's viewPrice, never formatted here.

type Collection = NonNullable<ReturnType<RenderCtx['collection']>>
type Offering = Extract<Collection, { kind: 'service' | 'menu-item' }>['items'][number]
type Price = Parameters<typeof viewPrice>[0]
type Columns = Collection['columns']
type Row = { label: string; text: string }
type Group = { name: string; price?: Price; items: { item: Offering; price?: Price }[] }

/** The collection's items, picked, limited and grouped as the source says. */
function resolve(content: BlockProps<'price-list'>['content'], ctx: RenderCtx) {
  const s = content.source
  const col = ctx.collection(s.collection)
  const all: Offering[] =
    col && (col.kind === 'service' || col.kind === 'menu-item') ? col.items : []
  let items = s.pick ? s.pick.flatMap((id) => all.filter((i) => i.id === id)) : all
  if (s.limit) items = items.slice(0, s.limit)
  const grouped = s.groupBy === 'group'
  const shared = col?.groupPrices ?? {}
  const groups: Group[] = []
  for (const item of items) {
    const name = grouped ? (item.group ?? '') : ''
    // Ungrouped, an item without its own price still shows its group's shared price.
    const price = item.price ?? (!grouped && item.group ? shared[item.group] : undefined)
    let g = groups.find((x) => x.name === name)
    if (!g) {
      g = { name, price: name ? shared[name] : undefined, items: [] }
      groups.push(g)
    }
    g.items.push({ item, price })
  }
  return { col, columns: col?.columns, groups }
}

const rowsOf = (v: PriceView): Row[] =>
  v.kind === 'options'
    ? v.options
    : v.kind === 'columns'
      ? v.cells.flatMap((c) => (c.text === null ? [] : [{ label: c.label, text: c.text }]))
      : []

const minutes = (m: number, locale: string) =>
  new Intl.NumberFormat(locale, { style: 'unit', unit: 'minute', unitDisplay: 'short' }).format(m)

/** Several prices for one item: one line per option or level, label first. */
function Levels(p: { rows: Row[] }) {
  return (
    <dl className="flex flex-col gap-2xs">
      {p.rows.map((r, i) => (
        <div key={i} className="flex flex-wrap items-baseline justify-between gap-x-md">
          <dt className="type-small text-fg-muted">{r.label}</dt>
          <dd className="type-body tabular-nums">{r.text}</dd>
        </div>
      ))}
    </dl>
  )
}

/** A name with its price at the end of the line, or its prices underneath. */
function NameAndPrice(p: {
  name: string
  price?: Price
  columns: Columns
  ctx: RenderCtx
  as?: 'h2' | 'h3'
}) {
  const v = p.price ? viewPrice(p.price, p.ctx.locale, p.columns) : undefined
  const Name = p.as ?? 'p'
  return (
    <>
      <div className="flex items-baseline justify-between gap-md">
        <Name className={cx('min-w-0 grow break-words text-start', p.as ? 'type-h3' : 'type-body')}>
          {p.as ? p.name : <strong>{p.name}</strong>}
        </Name>
        {v?.kind === 'single' && <p className="type-body shrink-0 tabular-nums">{v.text}</p>}
      </div>
      {v && v.kind !== 'single' && <Levels rows={rowsOf(v)} />}
    </>
  )
}

function Item(p: { item: Offering; price?: Price; columns: Columns; ctx: RenderCtx }) {
  const { item } = p
  const tags = item.tags ?? []
  return (
    <li className="flex flex-col gap-xs border-b border-border py-sm last:border-b-0 last:pb-0">
      <NameAndPrice name={item.name} price={p.price} columns={p.columns} ctx={p.ctx} />
      {item.description && (
        <Text style="small" muted className="break-words">
          {item.description}
        </Text>
      )}
      {(item.duration !== undefined || tags.length > 0) && (
        <div className="flex flex-wrap items-center gap-xs">
          {item.duration !== undefined && (
            <p className="type-small text-fg-muted">{minutes(item.duration, p.ctx.locale)}</p>
          )}
          {tags.length > 0 && (
            <ul className="flex flex-wrap gap-2xs">
              {tags.map((t) => (
                <li key={t} className="type-small rounded-control border border-border px-xs">
                  {t}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  )
}

export default function PriceListCards({ content: c, variant, ctx }: BlockProps<'price-list'>) {
  const { columns, groups } = resolve(c, ctx)
  const level = c.headline ? 'h3' : 'h2'
  const featured = variant === 'featured'
  const items = groups.flatMap((g) => g.items)
  return (
    <Section ctx={ctx}>
      <Container className="flex flex-col gap-lg">
        {(c.headline || c.subhead) && (
          <div className="flex max-w-prose flex-col gap-sm">
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
        {featured ? (
          <ul data-slot="source" className="grid gap-lg @md:grid-cols-2 @lg:grid-cols-3">
            {items.map(({ item, price }) => (
              <li
                key={item.id}
                className={cx(
                  'flex flex-col gap-sm',
                  !item.image && 'border-t border-border pt-md',
                )}
              >
                {item.image && (
                  <Picture
                    ctx={ctx}
                    image={item.image}
                    aspect={3 / 2}
                    share="third"
                    className="aspect-landscape w-full"
                  />
                )}
                <NameAndPrice
                  name={item.name}
                  price={price}
                  columns={columns}
                  ctx={ctx}
                  as={level}
                />
                {item.description && (
                  <Text style="small" muted className="break-words">
                    {item.description}
                  </Text>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div
            data-slot="source"
            className={cx(
              'grid items-start gap-md',
              groups.length > 1 && '@md:grid-cols-2',
              groups.length > 2 && '@lg:grid-cols-3',
            )}
          >
            {groups.map((g) => (
              <div
                key={g.name}
                className="flex min-w-0 flex-col gap-sm rounded-card border border-border p-md"
              >
                {g.name && (
                  <div className="flex flex-col gap-xs border-b border-border pb-sm">
                    <NameAndPrice
                      name={g.name}
                      price={g.price}
                      columns={undefined}
                      ctx={ctx}
                      as={level}
                    />
                  </div>
                )}
                <ul className="flex flex-col">
                  {g.items.map(({ item, price }) => (
                    <Item key={item.id} item={item} price={price} columns={columns} ctx={ctx} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
        {(c.note || c.primaryCta) && (
          <div className="flex max-w-prose flex-col items-start gap-md">
            {c.note && (
              <Text style="small" slot="note" muted>
                {c.note}
              </Text>
            )}
            <Actions ctx={ctx} primary={c.primaryCta} />
          </div>
        )}
      </Container>
    </Section>
  )
}
