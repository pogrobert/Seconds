import {
  Actions,
  type BlockProps,
  Container,
  cx,
  Heading,
  type PriceView,
  type RenderCtx,
  Section,
  Text,
  viewPrice,
} from '../../kit/index.tsx'

// A price list drawn from a collection of menu items or services (decision 0001, answer 2).
// Prices are facts: every price goes through the kit's viewPrice, never formatted here.

type Collection = NonNullable<ReturnType<RenderCtx['collection']>>
type Offering = Extract<Collection, { kind: 'service' | 'menu-item' }>['items'][number]
type Price = Parameters<typeof viewPrice>[0]
type Columns = Collection['columns']
type Row = { label: string; text: string }
type Node = Parameters<typeof Section>[0]['children']
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
function Levels(p: { rows: Row[]; side?: boolean }) {
  return (
    <dl
      className={cx(
        'flex flex-col gap-2xs',
        p.side && '@md:grid @md:grid-flow-col @md:auto-cols-fr @md:gap-md',
      )}
    >
      {p.rows.map((r, i) => (
        <div
          key={i}
          className={cx(
            'flex flex-wrap items-baseline justify-between gap-x-md',
            p.side && '@md:flex-col @md:justify-start',
          )}
        >
          <dt className="type-small text-fg-muted">{r.label}</dt>
          <dd className="type-body tabular-nums">{r.text}</dd>
        </div>
      ))}
    </dl>
  )
}

/** A group heading, with the group's shared price beside it. */
function GroupHead(p: { name: string; price?: Price; level: 'h2' | 'h3'; ctx: RenderCtx }) {
  const H = p.level
  const v = p.price ? viewPrice(p.price, p.ctx.locale) : undefined
  return (
    <div className="flex flex-col gap-xs border-b border-border pb-xs">
      <div className="flex items-baseline justify-between gap-md">
        <H className="type-h3 min-w-0 grow break-words text-start">{p.name}</H>
        {v?.kind === 'single' && <p className="type-body shrink-0 tabular-nums">{v.text}</p>}
      </div>
      {v && v.kind !== 'single' && <Levels rows={rowsOf(v)} />}
    </div>
  )
}

function ListItem(p: { item: Offering; price?: Price; columns: Columns; ctx: RenderCtx }) {
  const { item } = p
  const v = p.price ? viewPrice(p.price, p.ctx.locale, p.columns) : undefined
  const tags = item.tags ?? []
  return (
    <li className="flex flex-col gap-xs border-b border-border py-md">
      <div className="flex items-baseline justify-between gap-md">
        <p className="type-body min-w-0 grow break-words">
          <strong>{item.name}</strong>
        </p>
        {v?.kind === 'single' && <p className="type-body shrink-0 tabular-nums">{v.text}</p>}
      </div>
      {v && v.kind !== 'single' && <Levels rows={rowsOf(v)} side={v.kind === 'columns'} />}
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

/** A real table. With named columns it stacks on phones: each item lists its levels underneath. */
function PriceTable(p: {
  group: Group
  columns: Columns
  kind: Collection['kind']
  caption: Node
  ctx: RenderCtx
}) {
  const cols = p.columns ?? []
  const wide = cols.length > 0
  return (
    <div className="overflow-x-auto">
      <table className={cx('type-body w-full border-collapse', wide && 'block @md:table')}>
        <caption className={cx('pb-sm text-start', wide && 'block @md:table-caption')}>
          {p.caption}
        </caption>
        <thead className={cx(wide && 'hidden @md:table-header-group')}>
          <tr className="border-b border-border">
            <th
              scope="col"
              className="type-small text-fg-muted py-xs pe-md text-start align-bottom @md:sticky @md:start-0 @md:bg-bg"
            >
              {p.kind === 'menu-item' ? 'Item' : 'Service'}
            </th>
            {wide ? (
              cols.map((c) => (
                <th
                  key={c.id}
                  scope="col"
                  className="type-small text-fg-muted py-xs ps-sm text-end align-bottom"
                >
                  {c.label}
                </th>
              ))
            ) : (
              <th
                scope="col"
                className="type-small text-fg-muted py-xs ps-md text-end align-bottom"
              >
                Price
              </th>
            )}
          </tr>
        </thead>
        <tbody className={cx(wide && 'block @md:table-row-group')}>
          {p.group.items.map(({ item, price }) => {
            const v = price ? viewPrice(price, p.ctx.locale, p.columns) : undefined
            return (
              <tr
                key={item.id}
                className={cx(
                  'border-b border-border',
                  wide && 'flex flex-col gap-2xs py-sm @md:table-row @md:py-0',
                )}
              >
                <th
                  scope="row"
                  className={cx(
                    'text-start align-top',
                    wide
                      ? 'block @md:table-cell @md:sticky @md:start-0 @md:bg-bg @md:py-sm @md:pe-md'
                      : 'py-sm pe-md',
                  )}
                >
                  <strong className="break-words">{item.name}</strong>
                  {item.duration !== undefined && (
                    <span className="type-small text-fg-muted block">
                      {minutes(item.duration, p.ctx.locale)}
                    </span>
                  )}
                </th>
                {v?.kind === 'columns' && wide ? (
                  v.cells.map((cell) => (
                    <td
                      key={cell.column}
                      className={cx(
                        'align-top tabular-nums @md:table-cell @md:py-sm @md:ps-sm @md:text-end',
                        cell.text === null
                          ? 'hidden'
                          : 'flex flex-wrap items-baseline justify-between gap-x-md',
                      )}
                    >
                      <span className="type-small text-fg-muted @md:hidden">{cell.label}</span>
                      <span>{cell.text ?? '–'}</span>
                    </td>
                  ))
                ) : (
                  <td
                    colSpan={wide ? cols.length : 1}
                    className={cx(
                      'align-top tabular-nums',
                      wide ? 'block @md:table-cell @md:py-sm @md:ps-sm' : 'py-sm ps-md',
                      'text-end',
                    )}
                  >
                    {v?.kind === 'single' && v.text}
                    {v && v.kind !== 'single' && <Levels rows={rowsOf(v)} />}
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default function PriceListMenu({ content: c, variant, ctx }: BlockProps<'price-list'>) {
  const { col, columns, groups } = resolve(c, ctx)
  const table = variant === 'table'
  const level = c.headline ? 'h3' : 'h2'
  const wide = table && (columns?.length ?? 0) > 0
  const header = (c.headline || c.subhead) && (
    <div className="flex flex-col gap-sm">
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
  // A table needs a visible caption: a lone table takes the section's own heading as its caption.
  const lone = groups.length === 1 && !groups[0]?.name
  const headInCaption = table && lone && !!header
  return (
    <Section ctx={ctx}>
      <Container width={wide ? 'content' : 'prose'} className="flex flex-col gap-lg">
        {!headInCaption && header}
        <div data-slot="source" className="flex flex-col gap-xl">
          {groups.map((g) =>
            table ? (
              <PriceTable
                key={g.name}
                group={g}
                columns={columns}
                kind={col?.kind ?? 'service'}
                caption={
                  g.name ? (
                    <GroupHead name={g.name} price={g.price} level={level} ctx={ctx} />
                  ) : headInCaption ? (
                    header
                  ) : (
                    <span className="type-small text-fg-muted">{col?.name ?? 'Prices'}</span>
                  )
                }
                ctx={ctx}
              />
            ) : (
              <div key={g.name} className="flex flex-col">
                {g.name && <GroupHead name={g.name} price={g.price} level={level} ctx={ctx} />}
                <ul className="flex flex-col">
                  {g.items.map(({ item, price }) => (
                    <ListItem key={item.id} item={item} price={price} columns={columns} ctx={ctx} />
                  ))}
                </ul>
              </div>
            ),
          )}
        </div>
        {(c.note || c.primaryCta) && (
          <div className="flex flex-col items-start gap-md">
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
