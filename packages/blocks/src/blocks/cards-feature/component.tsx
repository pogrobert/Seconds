import {
  Actions,
  type BlockProps,
  Container,
  cx,
  Eyebrow,
  Heading,
  OnPhoto,
  PhotoShade,
  Picture,
  type RenderCtx,
  RichText,
  Section,
  Text,
} from '../../kit/index.tsx'

type Content = BlockProps<'cards'>['content']
type Item = Content['items'][number]
type Level = 2 | 3 | 4
type Surface = RenderCtx['surface']

// Four compositions for short items, each built around one idea:
// bento (one large lead tile), numbers (very large numerals on heavy rules), tiles (solid colour
// tiles taking turns) and accordion (large ruled rows that open with native <details>, no script).

/** A heading whose level follows the section: one below the section headline, or the section's own. */
function Title(p: { level: Level; id?: string; className: string; children: string }) {
  const Tag = `h${p.level}` as 'h2' | 'h3' | 'h4'
  return (
    <Tag id={p.id} className={p.className}>
      {p.children}
    </Tag>
  )
}

function ItemLink(p: { ctx: RenderCtx; item: Item; titleId: string; className?: string }) {
  if (!p.item.link) return null
  return (
    <a
      href={p.ctx.href(p.item.link.to)}
      aria-describedby={p.titleId}
      className={cx(
        'type-body inline-flex min-h-tap items-center self-start underline underline-offset-4',
        p.className,
      )}
    >
      {p.item.link.label}
    </a>
  )
}

/** Surfaces for tiles, never the section's own, so a tile always stands out from the page. */
const tileSurfaces = (own: Surface): Surface[] =>
  (['brand', 'muted', 'inverse', 'base'] as Surface[]).filter((s) => s !== own).slice(0, 3)

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

const pad = (n: number) => (n < 10 ? `0${n}` : String(n))

function Bento(p: { ctx: RenderCtx; items: Item[]; level: Level }) {
  const { ctx, items, level } = p
  const n = items.length
  const [lead, ...rest] = items
  if (!lead) return null
  const [leadSurface, restSurface] = tileSurfaces(ctx.surface)
  const leadId = `${ctx.id}-${lead.id}`
  const leadPlace = cx(
    'min-w-0 overflow-hidden rounded-card @md:col-span-2',
    n === 3 && '@lg:row-span-2',
    n === 4 && '@lg:row-span-3',
    n >= 5 && '@lg:row-span-2',
  )
  const leadText = (
    <>
      {lead.eyebrow && <p className="type-eyebrow">{lead.eyebrow}</p>}
      <Title level={level} id={leadId} className="type-h2 @lg:type-display max-w-full text-balance">
        {lead.title}
      </Title>
      {lead.body && <RichText ctx={ctx} value={lead.body} slot="body" className="max-w-prose" />}
      <ItemLink ctx={ctx} item={lead} titleId={leadId} />
    </>
  )
  return (
    <ul data-slot="items" className="grid gap-sm @md:grid-cols-2 @lg:grid-cols-3">
      {lead.media ? (
        <li data-item-id={lead.id} className={cx('grid', leadPlace)}>
          <Picture
            ctx={ctx}
            image={lead.media}
            share="full"
            aspect={4 / 5}
            className="col-start-1 row-start-1 h-full w-full aspect-portrait @md:aspect-landscape"
          />
          <PhotoShade from="bottom" className="col-start-1 row-start-1 rounded-media" />
          <OnPhoto className="col-start-1 row-start-1 flex flex-col gap-sm self-end p-md @md:p-lg">
            {leadText}
          </OnPhoto>
        </li>
      ) : (
        <li
          data-item-id={lead.id}
          data-surface={leadSurface}
          className={cx(
            'flex flex-col justify-end gap-sm bg-bg p-md text-fg @md:p-lg',
            leadPlace,
            '@md:aspect-wide',
          )}
        >
          {leadText}
        </li>
      )}
      {rest.map((item, i) => {
        const id = `${ctx.id}-${item.id}`
        const last = i === rest.length - 1
        return (
          <li
            key={item.id}
            data-item-id={item.id}
            data-surface={restSurface}
            className={cx(
              'flex min-w-0 flex-col justify-end gap-sm rounded-card bg-bg p-md text-fg',
              last && rest.length % 2 === 1 && '@md:col-span-2 @lg:col-span-1',
              last && n === 5 && '@lg:col-span-2',
            )}
          >
            {item.eyebrow && <p className="type-eyebrow text-fg-muted">{item.eyebrow}</p>}
            <Title level={level} id={id} className="type-h3 max-w-full text-balance">
              {item.title}
            </Title>
            {item.body && (
              <RichText ctx={ctx} value={item.body} slot="body" className="text-fg-muted" />
            )}
            <ItemLink ctx={ctx} item={item} titleId={id} />
          </li>
        )
      })}
    </ul>
  )
}

function Numbers(p: { ctx: RenderCtx; items: Item[]; level: Level }) {
  const { ctx, items, level } = p
  const n = items.length
  return (
    <ol
      data-slot="items"
      className={cx(
        'grid gap-x-columns gap-y-2xl @md:grid-cols-2',
        n === 4 && '@lg:grid-cols-4',
        n !== 2 && n !== 4 && '@lg:grid-cols-3',
      )}
    >
      {items.map((item, i) => {
        const id = `${ctx.id}-${item.id}`
        return (
          <li
            key={item.id}
            data-item-id={item.id}
            className="flex min-w-0 flex-col gap-sm border-t-2 border-fg pt-sm"
          >
            <span aria-hidden="true" className="type-jumbo tabular-nums">
              {pad(i + 1)}
            </span>
            <div className="flex flex-col gap-xs pt-sm">
              {item.eyebrow && <p className="type-eyebrow text-fg-muted">{item.eyebrow}</p>}
              <Title level={level} id={id} className="type-h3 max-w-full text-balance">
                {item.title}
              </Title>
            </div>
            {item.body && (
              <RichText ctx={ctx} value={item.body} slot="body" className="text-fg-muted" />
            )}
            <ItemLink ctx={ctx} item={item} titleId={id} />
          </li>
        )
      })}
    </ol>
  )
}

function Tiles(p: { ctx: RenderCtx; items: Item[]; level: Level }) {
  const { ctx, items, level } = p
  const n = items.length
  const surfaces = tileSurfaces(ctx.surface)
  return (
    <ul
      data-slot="items"
      className={cx(
        'grid gap-sm @md:grid-cols-2',
        n === 4 && '@lg:grid-cols-4',
        n !== 2 && n !== 4 && '@lg:grid-cols-3',
      )}
    >
      {items.map((item, i) => {
        const id = `${ctx.id}-${item.id}`
        return (
          <li
            key={item.id}
            data-item-id={item.id}
            data-surface={surfaces[i % surfaces.length]}
            className={cx(
              'flex min-w-0 flex-col justify-end gap-sm rounded-card bg-bg p-md text-fg aspect-landscape @md:aspect-square @md:p-lg',
              n === 2 && '@lg:aspect-landscape',
            )}
          >
            {item.eyebrow && <p className="type-eyebrow mb-auto pb-lg">{item.eyebrow}</p>}
            <Title level={level} id={id} className="type-h2 max-w-full text-balance">
              {item.title}
            </Title>
            {item.body && <RichText ctx={ctx} value={item.body} slot="body" />}
            <ItemLink ctx={ctx} item={item} titleId={id} />
          </li>
        )
      })}
    </ul>
  )
}

function Accordion(p: { ctx: RenderCtx; items: Item[]; level: Level }) {
  const { ctx, level } = p
  const groups = byGroup(p.items)
  const first = p.items[0]?.id
  return (
    <div data-slot="items" className="flex flex-col gap-xl">
      {groups.map((g) => {
        const itemLevel: Level = g.name ? (level === 2 ? 3 : 4) : level
        return (
          <div key={g.name ?? g.items[0]?.id} className="flex flex-col gap-sm">
            {g.name && (
              <Title level={level} className="type-eyebrow max-w-full text-fg-muted">
                {g.name}
              </Title>
            )}
            <ul className="border-t-2 border-fg">
              {g.items.map((item) => {
                const id = `${ctx.id}-${item.id}`
                const hasMore = item.body || item.link
                const head = (
                  <div className="flex min-w-0 flex-col gap-2xs">
                    {item.eyebrow && <p className="type-eyebrow text-fg-muted">{item.eyebrow}</p>}
                    <Title level={itemLevel} id={id} className="type-h2 max-w-full text-balance">
                      {item.title}
                    </Title>
                  </div>
                )
                return (
                  <li key={item.id} data-item-id={item.id} className="border-b border-border">
                    {hasMore ? (
                      <details open={item.id === first} className="nav-dropdown">
                        <summary className="type-h2 flex min-h-tap cursor-pointer items-center justify-between gap-md py-md">
                          {head}
                        </summary>
                        <div className="flex max-w-prose flex-col gap-sm pb-lg">
                          {item.body && (
                            <RichText
                              ctx={ctx}
                              value={item.body}
                              slot="body"
                              className="text-fg-muted"
                            />
                          )}
                          <ItemLink ctx={ctx} item={item} titleId={id} />
                        </div>
                      </details>
                    ) : (
                      <div className="py-md">{head}</div>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

export default function CardsFeature({ content: c, variant, ctx }: BlockProps<'cards'>) {
  const level: Level = c.headline ? 3 : 2
  const hasHeader = c.eyebrow || c.headline || c.subhead
  const list =
    variant === 'numbers' ? (
      <Numbers ctx={ctx} items={c.items} level={level} />
    ) : variant === 'tiles' ? (
      <Tiles ctx={ctx} items={c.items} level={level} />
    ) : variant === 'accordion' ? (
      <Accordion ctx={ctx} items={c.items} level={level} />
    ) : (
      <Bento ctx={ctx} items={c.items} level={level} />
    )
  return (
    <Section ctx={ctx}>
      <Container className="flex flex-col gap-xl @lg:gap-2xl">
        {hasHeader && (
          <div
            className={cx(
              'grid gap-md',
              c.subhead && '@lg:grid-cols-3 @lg:items-end @lg:gap-columns',
            )}
          >
            <div className="flex min-w-0 flex-col gap-sm @lg:col-span-2">
              {c.eyebrow && <Eyebrow>{c.eyebrow}</Eyebrow>}
              {c.headline && (
                <Heading ctx={ctx} style="display" slot="headline">
                  {c.headline}
                </Heading>
              )}
            </div>
            {c.subhead && (
              <Text style="lead" slot="subhead" muted className="max-w-prose">
                {c.subhead}
              </Text>
            )}
          </div>
        )}
        {list}
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
