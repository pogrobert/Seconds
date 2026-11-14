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

// A classic price list, drawn from a collection of menu items or services (decision 0001, answer 2).
//   leaders     name and price joined by a dotted line; groups flow into two columns when wide
//   menu-board  a printed menu: centred, group names in spaced small capitals, price beneath
// Prices are facts: every price goes through the kit's viewPrice, never formatted here.

type Collection = NonNullable<ReturnType<RenderCtx['collection']>>
type Offering = Extract<Collection, { kind: 'service' | 'menu-item' }>['items'][number]
type Price = Parameters<typeof viewPrice>[0]
type Columns = Collection['columns']
type Row = { label: string; text: string }
type Entry = { item: Offering; price?: Price }
type Group = { name: string; price?: Price; items: Entry[] }
type Level = 'h2' | 'h3'

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
  return { columns: col?.columns, groups }
}

const rowsOf = (v: PriceView): Row[] =>
  v.kind === 'options'
    ? v.options
    : v.kind === 'columns'
      ? v.cells.flatMap((c) => (c.text === null ? [] : [{ label: c.label, text: c.text }]))
      : []

const minutes = (m: number, locale: string) =>
  new Intl.NumberFormat(locale, { style: 'unit', unit: 'minute', unitDisplay: 'short' }).format(m)

/** Duration and tags as one quiet line: "60 min · Popular". */
function Meta(p: { item: Offering; ctx: RenderCtx; className?: string }) {
  const parts = [
    ...(p.item.duration !== undefined ? [minutes(p.item.duration, p.ctx.locale)] : []),
    ...(p.item.tags ?? []),
  ]
  if (!parts.length) return null
  return (
    <p className={cx('type-small text-fg-muted break-words', p.className)}>{parts.join(' · ')}</p>
  )
}

/* ------------------------------------------------------------------ leaders */

/** A dotted line from the end of the name to the price, on the last line's baseline. */
function Leader() {
  return (
    <span
      aria-hidden="true"
      className="min-w-lg grow basis-0 border-b border-dotted border-fg-muted"
    />
  )
}

function LeaderLevels(p: { rows: Row[] }) {
  return (
    <dl className="flex flex-col gap-2xs ps-md">
      {p.rows.map((r, i) => (
        <div key={i} className="flex items-baseline-last gap-xs">
          <dt className="type-small min-w-0 text-fg-muted break-words">{r.label}</dt>
          <Leader />
          <dd className="type-small shrink-0 whitespace-nowrap tabular-nums">{r.text}</dd>
        </div>
      ))}
    </dl>
  )
}

function LeaderItem(p: Entry & { columns: Columns; ctx: RenderCtx }) {
  const { item } = p
  const v = p.price ? viewPrice(p.price, p.ctx.locale, p.columns) : undefined
  return (
    <li className="flex break-inside-avoid flex-col gap-2xs py-sm">
      <div className="flex items-baseline-last gap-xs">
        <p className="type-body min-w-0 break-words">{item.name}</p>
        {v?.kind === 'single' && (
          <>
            <Leader />
            <p className="type-body shrink-0 whitespace-nowrap tabular-nums">{v.text}</p>
          </>
        )}
      </div>
      {item.description && (
        <Text style="small" muted className="max-w-prose break-words">
          {item.description}
        </Text>
      )}
      <Meta item={item} ctx={p.ctx} />
      {v && v.kind !== 'single' && <LeaderLevels rows={rowsOf(v)} />}
    </li>
  )
}

function Leaders(p: { groups: Group[]; columns: Columns; level: Level; ctx: RenderCtx }) {
  const H = p.level
  const several = p.groups.length > 1
  const long = p.groups.length === 1 && (p.groups[0]?.items.length ?? 0) > 6
  return (
    <div data-slot="source" className={cx('gap-x-columns', several && '@lg:columns-2')}>
      {p.groups.map((g) => {
        const v = g.price ? viewPrice(g.price, p.ctx.locale) : undefined
        return (
          <div
            key={g.name}
            className={cx('flex flex-col', several && 'break-inside-avoid pb-xl last:pb-0')}
          >
            {g.name && (
              <div className="flex flex-col gap-xs border-b border-fg pb-xs">
                <div className="flex items-baseline-last gap-xs">
                  <H className="type-h3 min-w-0 break-words text-start">{g.name}</H>
                  {v?.kind === 'single' && (
                    <>
                      <Leader />
                      <p className="type-body shrink-0 whitespace-nowrap tabular-nums">{v.text}</p>
                    </>
                  )}
                </div>
                {v && v.kind !== 'single' && <LeaderLevels rows={rowsOf(v)} />}
              </div>
            )}
            <ul
              className={cx('flex flex-col pt-xs', long && '@lg:block @lg:columns-2 gap-x-columns')}
            >
              {g.items.map(({ item, price }) => (
                <LeaderItem
                  key={item.id}
                  item={item}
                  price={price}
                  columns={p.columns}
                  ctx={p.ctx}
                />
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ menu board */

/** Levels or options centred on one line each pair: "Stylist £52   Senior £62". */
function BoardLevels(p: { rows: Row[] }) {
  return (
    <dl className="flex flex-wrap justify-center gap-x-md gap-y-2xs">
      {p.rows.map((r, i) => (
        <div key={i} className="flex min-w-0 flex-wrap items-baseline justify-center gap-x-xs">
          <dt className="type-small text-fg-muted break-words">{r.label}</dt>
          <dd className="type-body tabular-nums">{r.text}</dd>
        </div>
      ))}
    </dl>
  )
}

function BoardItem(p: Entry & { columns: Columns; ctx: RenderCtx }) {
  const { item } = p
  const v = p.price ? viewPrice(p.price, p.ctx.locale, p.columns) : undefined
  return (
    <li className="flex flex-col items-center gap-xs text-center">
      <p className="type-h3 max-w-full break-words text-balance">{item.name}</p>
      {item.description && (
        <Text style="small" muted className="max-w-full break-words">
          {item.description}
        </Text>
      )}
      {v?.kind === 'single' && <p className="type-body tabular-nums">{v.text}</p>}
      {v && v.kind !== 'single' && <BoardLevels rows={rowsOf(v)} />}
      <Meta item={item} ctx={p.ctx} />
    </li>
  )
}

function Board(p: { groups: Group[]; columns: Columns; level: Level; ctx: RenderCtx }) {
  const H = p.level
  return (
    <div data-slot="source" className="flex flex-col gap-2xl">
      {p.groups.map((g) => {
        const v = g.price ? viewPrice(g.price, p.ctx.locale) : undefined
        return (
          <div key={g.name} className="flex flex-col items-center gap-xl">
            {g.name && (
              <div className="flex w-full flex-col items-center gap-xs">
                <div className="flex w-full items-center gap-md">
                  <span aria-hidden="true" className="h-px min-w-md grow basis-0 bg-border" />
                  <H className="type-eyebrow min-w-0 max-w-full break-words text-center text-fg">
                    {g.name}
                  </H>
                  <span aria-hidden="true" className="h-px min-w-md grow basis-0 bg-border" />
                </div>
                {v?.kind === 'single' && <p className="type-body tabular-nums">{v.text}</p>}
                {v && v.kind !== 'single' && <BoardLevels rows={rowsOf(v)} />}
              </div>
            )}
            <ul className="flex w-full flex-col gap-xl">
              {g.items.map(({ item, price }) => (
                <BoardItem
                  key={item.id}
                  item={item}
                  price={price}
                  columns={p.columns}
                  ctx={p.ctx}
                />
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ block */

export default function PriceListClassic({ content: c, variant, ctx }: BlockProps<'price-list'>) {
  const { columns, groups } = resolve(c, ctx)
  const board = variant === 'menu-board'
  // Group names sit one level below the section's heading, or take its place when there is none.
  const level: Level = c.headline && ctx.headingLevel === 2 ? 'h3' : 'h2'
  const head = (c.headline || c.subhead) && (
    <div className={cx('flex flex-col gap-sm', board ? 'items-center text-center' : 'max-w-prose')}>
      {c.headline && (
        <Heading ctx={ctx} style="display" slot="headline">
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
  const foot = (c.note || c.primaryCta) && (
    <div
      className={cx(
        'flex flex-col gap-md',
        board
          ? 'items-center text-center'
          : 'items-start border-t border-border pt-md @md:flex-row @md:items-center @md:justify-between',
      )}
    >
      {c.note && (
        <Text style="small" slot="note" muted className="max-w-prose">
          {c.note}
        </Text>
      )}
      <Actions ctx={ctx} primary={c.primaryCta} className="shrink-0" />
    </div>
  )
  return (
    <Section ctx={ctx}>
      {board ? (
        <Container width="prose" className="flex flex-col gap-2xl">
          {head}
          <Board groups={groups} columns={columns} level={level} ctx={ctx} />
          {foot}
        </Container>
      ) : (
        <Container className="flex flex-col gap-xl">
          {head}
          <Leaders groups={groups} columns={columns} level={level} ctx={ctx} />
          {foot}
        </Container>
      )}
    </Section>
  )
}
