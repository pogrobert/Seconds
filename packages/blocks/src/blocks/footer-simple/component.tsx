import {
  Address,
  type BlockProps,
  Container,
  cx,
  EmailLink,
  hoursRows,
  Logo,
  MapLink,
  PhoneLink,
  type RenderCtx,
  RichText,
  Section,
  SocialLinks,
} from '../../kit/index.tsx'

type Content = BlockProps<'footer'>['content']
type FactKey = NonNullable<Content['facts']>[number]
type Loc = RenderCtx['business']['locations'][number]
type Node = Parameters<typeof Section>[0]['children']

/**
 * Opening hours with a visible caption. The kit's Hours hides its caption with sr-only, which the
 * browser check reports as clipped text, so this draws the same rows (the kit's hoursRows) itself.
 */
function OpeningHours(p: { ctx: RenderCtx; place: Loc }) {
  const rows = hoursRows(p.place.hours, p.ctx.locale)
  return (
    <table data-slot="hours" className="type-body w-full border-collapse">
      <caption className="type-small pb-2xs text-fg-muted">Opening hours</caption>
      <tbody>
        {rows.map((r) => (
          <tr key={r.days} className="border-b border-border">
            <th scope="row" className="py-xs pe-md text-start">
              {r.days}
            </th>
            <td className="py-xs text-end tabular-nums">{r.times}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/** A row of contact links that wraps: phone, email, map. */
function LinkRow(p: { centered: boolean; children: Node[] }) {
  const items = p.children.filter(Boolean)
  if (items.length === 0) return null
  return (
    <ul
      className={cx(
        'flex flex-wrap gap-x-md gap-y-xs',
        p.centered ? 'justify-center' : '@lg:justify-end',
      )}
    >
      {items}
    </ul>
  )
}

/** One place: its name (when several are listed), address, contact links and hours. */
function Place(p: {
  ctx: RenderCtx
  place: Loc
  named: boolean
  centered: boolean
  show: { address: boolean; map: boolean; phone?: string; email?: string; hours: boolean }
}) {
  const { place, show } = p
  const map = show.map && Boolean(place.geo || place.address)
  return (
    <div
      className={cx(
        'flex w-full min-w-0 flex-col gap-sm',
        p.centered ? 'items-center' : '@lg:items-end',
      )}
    >
      {p.named && <h2 className="type-eyebrow">{place.name}</h2>}
      {show.address && <Address location={place} />}
      <LinkRow centered={p.centered}>
        {[
          show.phone && (
            <li key="phone">
              <PhoneLink phone={show.phone} />
            </li>
          ),
          show.email && (
            <li key="email" className="break-words">
              <EmailLink email={show.email} />
            </li>
          ),
          map && (
            <li key="map">
              <MapLink ctx={p.ctx} location={place} />
            </li>
          ),
        ]}
      </LinkRow>
      {show.hours && place.hours?.length ? <OpeningHours ctx={p.ctx} place={place} /> : null}
    </div>
  )
}

/** The facts the content asks for, drawn with the kit. Values come from the business record only. */
function Facts(p: { ctx: RenderCtx; facts: readonly FactKey[]; centered: boolean }) {
  const b = p.ctx.business
  const has = (f: FactKey) => p.facts.includes(f)
  const primary = b.locations[0]
  const phone = has('phone') ? (b.phone ?? primary?.phone) : undefined
  const email = has('email') ? (b.email ?? primary?.email) : undefined
  const licences = has('licence') ? (b.licences ?? []) : []
  const places = has('locations')
    ? b.locations.map((place) => (
        <Place
          key={place.id}
          ctx={p.ctx}
          place={place}
          named
          centered={p.centered}
          show={{
            address: true,
            map: true,
            phone: place.phone && place.phone !== phone ? place.phone : undefined,
            email: place.email && place.email !== email ? place.email : undefined,
            hours: true,
          }}
        />
      ))
    : primary && (has('address') || has('map') || has('hours'))
      ? [
          <Place
            key={primary.id}
            ctx={p.ctx}
            place={primary}
            named={false}
            centered={p.centered}
            show={{ address: has('address'), map: has('map'), hours: has('hours') }}
          />,
        ]
      : []
  const groups = [
    ...places,
    (phone || email) && (
      <LinkRow key="contact" centered={p.centered}>
        {[
          phone && (
            <li key="phone">
              <PhoneLink phone={phone} />
            </li>
          ),
          email && (
            <li key="email" className="break-words">
              <EmailLink email={email} />
            </li>
          ),
        ]}
      </LinkRow>
    ),
    has('social') && (
      <SocialLinks
        key="social"
        business={b}
        className={cx(p.centered ? 'justify-center' : '@lg:justify-end')}
      />
    ),
    licences.length > 0 && (
      <p key="licence" className="type-small text-fg-muted">
        {licences.map((l) => `${l.label} ${l.number}`).join(' · ')}
      </p>
    ),
  ].filter(Boolean)
  if (groups.length === 0) return null
  return (
    <div
      data-slot="facts"
      className={cx(
        'flex w-full min-w-0 flex-col gap-md',
        p.centered ? 'items-center' : 'items-start @lg:items-end @lg:text-end',
      )}
    >
      {groups}
    </div>
  )
}

export default function FooterSimple({ content: c, variant, ctx }: BlockProps<'footer'>) {
  const note = c.note && (
    <p data-slot="note" className="type-small text-fg-muted">
      {c.note}
    </p>
  )

  if (variant === 'centered') {
    return (
      <Section ctx={ctx}>
        <Container width="prose" className="flex flex-col items-center gap-lg text-center">
          <div className="flex w-full flex-col items-center gap-sm">
            <div className="break-words">
              <Logo ctx={ctx} />
            </div>
            {c.body && <RichText ctx={ctx} value={c.body} slot="body" className="text-fg-muted" />}
          </div>
          {c.facts && <Facts ctx={ctx} facts={c.facts} centered />}
          {note}
        </Container>
      </Section>
    )
  }

  const nav = c.nav ?? []
  return (
    <Section ctx={ctx}>
      <Container className="flex flex-col gap-lg @lg:flex-row @lg:items-start @lg:justify-between">
        <div className="flex min-w-0 flex-col gap-sm @lg:flex-1">
          <div className="break-words">
            <Logo ctx={ctx} />
          </div>
          {nav.length > 0 && (
            <nav data-slot="nav" aria-label="Footer">
              <ul className="flex flex-wrap gap-x-md">
                {nav.map((item) => (
                  <li key={item.id} className="min-w-0 break-words">
                    <a
                      href={ctx.href(item.to)}
                      className="type-body inline-flex min-h-tap items-center no-underline hover:underline"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
        {(c.facts || note) && (
          <div className="flex min-w-0 flex-col items-start gap-md @lg:max-w-md @lg:items-end @lg:text-end">
            {c.facts && <Facts ctx={ctx} facts={c.facts} centered={false} />}
            {note}
          </div>
        )}
      </Container>
    </Section>
  )
}
