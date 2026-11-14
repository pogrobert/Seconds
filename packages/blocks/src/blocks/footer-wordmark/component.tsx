import {
  Address,
  type BlockProps,
  Container,
  cx,
  EmailLink,
  hoursRows,
  MapLink,
  NewsletterForm,
  PhoneLink,
  type RenderCtx,
  RichText,
  Section,
  SocialLinks,
  strings,
} from '../../kit/index.tsx'

type Content = BlockProps<'footer'>['content']
type FactKey = NonNullable<Content['facts']>[number]
type Loc = RenderCtx['business']['locations'][number]
type Node = Parameters<typeof Section>[0]['children']

/**
 * The business name as a wordmark. Jumbo type for short names; longer names step down a size so
 * they never become a wall of giant lines. Always the name as text (not the logo image): the type
 * is the design.
 */
function Wordmark(p: { ctx: RenderCtx }) {
  const name = p.ctx.business.name
  const n = name.length
  return (
    <p
      className={cx(
        'min-w-0 max-w-full break-words text-balance',
        n <= 18 ? 'type-jumbo' : n <= 44 ? 'type-display' : 'type-h2',
      )}
    >
      <a href="/" data-slot="logo" className="text-fg no-underline">
        {name}
      </a>
    </p>
  )
}

/** Opening hours as compact rows (the kit's hoursRows), small enough for a ledger column. */
function HoursRows(p: { ctx: RenderCtx; place: Loc }) {
  const rows = hoursRows(p.place.hours, p.ctx.locale)
  return (
    <table data-slot="hours" className="type-small w-full border-collapse">
      <tbody>
        {rows.map((r) => (
          <tr key={r.days} className="align-top">
            <th scope="row" className="py-2xs pe-sm text-start text-fg-muted">
              {r.days}
            </th>
            <td className="py-2xs text-end tabular-nums">{r.times}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/** One cell of the ledger: a small label on a tap-high line, then its value. */
const cell = 'flex min-w-0 flex-col'
const label = 'type-eyebrow flex min-h-tap items-center text-fg-muted'

/** One place: address, its own contact links, a map link and hours. */
function PlaceGroup(p: {
  ctx: RenderCtx
  place: Loc
  title: string
  show: { address: boolean; map: boolean; phone?: string; email?: string; hours: boolean }
}) {
  const { place, show } = p
  const map = show.map && Boolean(place.geo || place.address)
  const hours = show.hours && Boolean(place.hours?.length)
  if (!show.address && !map && !show.phone && !show.email && !hours) return null
  return (
    <div className={cx(cell, hours && 'col-span-2 @md:col-span-1')}>
      <dt className={label}>{p.title}</dt>
      <dd
        className={cx(
          'flex min-w-0 flex-col gap-xs break-words',
          // Plain text first: drop it to the text line of the tap-high links in the next cells.
          (show.address || (!show.phone && !show.email && !map)) && 'pt-xs',
        )}
      >
        {show.address && <Address location={place} />}
        {show.phone && <PhoneLink phone={show.phone} />}
        {show.email && <EmailLink email={show.email} />}
        {map && <MapLink ctx={p.ctx} location={place} />}
        {hours && <HoursRows ctx={p.ctx} place={place} />}
      </dd>
    </div>
  )
}

/** The facts as labelled ledger cells. Social links and licences go to the legal row instead. */
function FactCells(p: { ctx: RenderCtx; facts: readonly FactKey[] }) {
  const b = p.ctx.business
  const t = strings(p.ctx.locale)
  const has = (f: FactKey) => p.facts.includes(f)
  const primary = b.locations[0]
  const phone = has('phone') ? (b.phone ?? primary?.phone) : undefined
  const email = has('email') ? (b.email ?? primary?.email) : undefined
  const groups: Node[] = []
  if (has('locations'))
    for (const place of b.locations)
      groups.push(
        <PlaceGroup
          key={place.id}
          ctx={p.ctx}
          place={place}
          title={place.name}
          show={{
            address: true,
            map: true,
            phone: place.phone && place.phone !== phone ? place.phone : undefined,
            email: place.email && place.email !== email ? place.email : undefined,
            hours: true,
          }}
        />,
      )
  else if (primary) {
    if (has('address') || has('map'))
      groups.push(
        <PlaceGroup
          key="address"
          ctx={p.ctx}
          place={primary}
          title={has('address') ? t.address : t.directions}
          show={{ address: has('address'), map: has('map'), hours: false }}
        />,
      )
  }
  if (phone)
    groups.push(
      <div key="phone" className={cell}>
        <dt className={label}>{t.phone}</dt>
        <dd>
          <PhoneLink phone={phone} />
        </dd>
      </div>,
    )
  if (email)
    groups.push(
      <div key="email" className={cx(cell, 'col-span-2 @md:col-span-1')}>
        <dt className={label}>{t.email}</dt>
        <dd className="min-w-0 break-words">
          <EmailLink email={email} />
        </dd>
      </div>,
    )
  // Hours last: on phones they take a full row, so the short cells above pair up.
  if (!has('locations') && primary && has('hours'))
    groups.push(
      <PlaceGroup
        key="hours"
        ctx={p.ctx}
        place={primary}
        title={t.openingHours}
        show={{ address: false, map: false, hours: true }}
      />,
    )
  if (groups.length === 0) return null
  return (
    <dl data-slot="facts" className="contents">
      {groups}
    </dl>
  )
}

/** Site links as ledger cells: one cell per group with sub-links, one shared cell for plain links. */
function NavCells(p: { ctx: RenderCtx; nav: NonNullable<Content['nav']> }) {
  const plain = p.nav.filter((i) => !i.children?.length)
  const grouped = p.nav.filter((i) => i.children?.length)
  const link =
    'type-body inline-flex min-h-tap items-center no-underline hover:underline underline-offset-4'
  return (
    <nav data-slot="nav" aria-label="Footer" className="contents">
      {plain.length > 0 && (
        <ul className={cell}>
          {plain.map((item) => (
            <li key={item.id} className="min-w-0 break-words">
              <a href={p.ctx.href(item.to)} className={link}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      )}
      {grouped.map((item) => (
        <div key={item.id} className={cell}>
          <h2 className="type-eyebrow min-w-0 break-words">
            <a
              href={p.ctx.href(item.to)}
              className="inline-flex min-h-tap items-center text-fg-muted no-underline hover:text-fg"
            >
              {item.label}
            </a>
          </h2>
          <ul className="flex flex-col">
            {(item.children ?? []).map((c) => (
              <li key={c.id} className="min-w-0 break-words">
                <a href={p.ctx.href(c.to)} className={link}>
                  {c.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

/** The legal line, small, with social links and licence numbers opposite. */
function LegalRow(p: { ctx: RenderCtx; content: Content }) {
  const b = p.ctx.business
  const facts = p.content.facts ?? []
  const social = facts.includes('social') && Boolean(b.social?.length)
  const licences = facts.includes('licence') ? (b.licences ?? []) : []
  if (!p.content.note && !social && licences.length === 0) return null
  return (
    <div className="flex flex-col gap-sm border-t border-border pt-sm @md:flex-row @md:items-baseline @md:justify-between">
      {p.content.note && (
        <p data-slot="note" className="type-small min-w-0 text-fg-muted @md:max-w-prose">
          {p.content.note}
        </p>
      )}
      {(social || licences.length > 0) && (
        <div data-slot="facts" className="flex min-w-0 flex-col gap-2xs @md:items-end @md:text-end">
          {social && <SocialLinks business={b} className="gap-x-md" />}
          {licences.length > 0 && (
            <p className="type-small text-fg-muted">
              {licences.map((l) => `${l.label} ${l.number}`).join(' · ')}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default function FooterWordmark({ content: c, variant, ctx }: BlockProps<'footer'>) {
  const nav = c.nav ?? []
  const facts = c.facts ?? []
  const hasCells = nav.length > 0 || facts.some((f) => f !== 'social' && f !== 'licence')

  if (variant === 'signup' && c.form) {
    return (
      <Section ctx={ctx} as="footer" space="none">
        <Container width="wide" className="flex flex-col gap-lg pt-section pb-md">
          <Wordmark ctx={ctx} />
          <div className="grid gap-x-columns gap-y-xl border-t border-border pt-xl @lg:grid-cols-5">
            <div className="flex min-w-0 flex-col gap-md @lg:col-span-2">
              {c.body && <RichText ctx={ctx} value={c.body} slot="body" className="max-w-prose" />}
              <div className="min-w-0 max-w-prose">
                <NewsletterForm ctx={ctx} form={c.form} />
              </div>
            </div>
            {hasCells && (
              <div className="grid min-w-0 grid-cols-2 content-start gap-x-md gap-y-lg @md:grid-cols-3 @lg:col-span-3">
                <NavCells ctx={ctx} nav={nav} />
                <FactCells ctx={ctx} facts={facts} />
              </div>
            )}
          </div>
          <LegalRow ctx={ctx} content={c} />
        </Container>
      </Section>
    )
  }

  return (
    <Section ctx={ctx} as="footer" space="none">
      <Container width="wide" className="flex flex-col pt-section pb-md">
        {c.body && (
          <RichText
            ctx={ctx}
            value={c.body}
            slot="body"
            className="max-w-prose pb-xl text-fg-muted"
          />
        )}
        {hasCells && (
          <div className="grid grid-cols-2 gap-x-md gap-y-lg @md:grid-cols-3 @lg:grid-cols-5">
            {nav.length > 0 && <NavCells ctx={ctx} nav={nav} />}
            <FactCells ctx={ctx} facts={facts} />
          </div>
        )}
        <div className={cx('pb-sm', hasCells || c.body ? 'pt-2xl' : 'pt-0')}>
          <Wordmark ctx={ctx} />
        </div>
        <LegalRow ctx={ctx} content={c} />
      </Container>
    </Section>
  )
}
