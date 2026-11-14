import {
  Actions,
  Address,
  type BlockProps,
  Container,
  cx,
  EmailLink,
  formatTime,
  Heading,
  hoursRows,
  MapLink,
  PhoneLink,
  type RenderCtx,
  Section,
} from '../../kit/index.tsx'

// Opening hours and where to find a place. Every value comes from the business record; the model
// only chooses which facts to show. `single`: each place as hours beside address and contacts.
// `locations`: a card per place in a grid.

type Loc = RenderCtx['business']['locations'][number]
type Show = ReadonlySet<string>

/**
 * A place's phone and email. When the business has one place, the business's own details are that
 * place's, so they fill in what the location leaves out. With several places they never do.
 */
const contactOf = (ctx: RenderCtx, l: Loc) => {
  const only = ctx.business.locations.length === 1
  return {
    phone: l.phone ?? (only ? ctx.business.phone : undefined),
    email: l.email ?? (only ? ctx.business.email : undefined),
  }
}

/** "Sat 24 Dec" from an ISO date, in the site's locale, the same on every machine. */
const formatDate = (iso: string, locale: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(Date.UTC(y ?? 2024, (m ?? 1) - 1, d ?? 1))
}

/**
 * The weekly hours as a real table, built from the kit's `hoursRows`. The same markup as the kit's
 * `Hours`, except that the caption is visible: the kit's screen-reader-only caption is reported as
 * clipped text by the browser check, so `Hours` cannot pass the gate today.
 */
function HoursTable(p: { ctx: RenderCtx; location: Loc }) {
  const rows = hoursRows(p.location.hours, p.ctx.locale)
  return (
    <table data-slot="hours" className="type-body w-full border-collapse">
      <caption className="type-small pb-xs text-start text-fg-muted">Opening hours</caption>
      <tbody>
        {rows.map((r) => (
          <tr key={r.days} className="border-b border-border">
            <th scope="row" className="py-xs pe-md text-start align-top">
              {r.days}
            </th>
            <td className="py-xs text-end tabular-nums">{r.times}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/** The weekly hours table, then any special dates. Nothing when the place has no hours. */
function HoursFacts(p: { ctx: RenderCtx; location: Loc }) {
  const l = p.location
  const special = l.specialHours ?? []
  if (!l.hours?.length && !special.length) return null
  return (
    <div className="flex min-w-0 flex-col gap-sm">
      {l.hours?.length ? <HoursTable location={l} ctx={p.ctx} /> : null}
      {special.length > 0 && (
        <div className="flex flex-col gap-2xs">
          <p className="type-small text-fg-muted">Special hours</p>
          <ul className="type-small flex flex-col gap-2xs">
            {special.map((s) => (
              <li key={s.date} className="wrap-anywhere">
                <span className="tabular-nums">{formatDate(s.date, p.ctx.locale)}</span>
                {': '}
                {s.closed || !s.opens || !s.closes
                  ? 'Closed'
                  : `${formatTime(s.opens, p.ctx.locale)}–${formatTime(s.closes, p.ctx.locale)}`}
                {s.note ? ` · ${s.note}` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

/** The address with the place's access note (parking, step-free entrance) under it. */
function PlaceFacts(p: { location: Loc; show: Show }) {
  const l = p.location
  const address = p.show.has('address') && l.address
  const note = (p.show.has('address') || p.show.has('map')) && l.note
  if (!address && !note) return null
  return (
    <div className="flex min-w-0 flex-col gap-xs">
      {address && <Address location={l} />}
      {note && <p className="type-small text-fg-muted text-pretty wrap-anywhere">{l.note}</p>}
    </div>
  )
}

/** Phone, email, map and booking links in one wrapping row. */
function ContactFacts(p: { ctx: RenderCtx; location: Loc; show: Show }) {
  const l = p.location
  const { phone, email } = contactOf(p.ctx, l)
  const items = [
    p.show.has('phone') && phone && <PhoneLink key="phone" phone={phone} />,
    p.show.has('email') && email && <EmailLink key="email" email={email} />,
    p.show.has('map') && (l.geo || l.address) && <MapLink ctx={p.ctx} key="map" location={l} />,
    (p.show.has('phone') || p.show.has('email')) && l.bookingUrl && (
      <a key="book" href={l.bookingUrl} className="type-body underline underline-offset-4">
        Book online
      </a>
    ),
  ].filter(Boolean)
  if (!items.length) return null
  return (
    <ul className="flex flex-wrap gap-x-md">
      {items.map((item, i) => (
        <li key={i} className="flex min-h-tap max-w-full items-center wrap-anywhere">
          {item}
        </li>
      ))}
    </ul>
  )
}

export default function HoursLocationPanel({
  content: c,
  variant,
  ctx,
}: BlockProps<'hours-location'>) {
  const show: Show = new Set(c.facts)
  const all = ctx.business.locations
  const locs = show.has('locations') ? all : all.slice(0, 1)
  const many = locs.length > 1
  const cards = variant === 'locations'
  // Place names sit under the section headline; without one, they are the section's headings.
  const NameTag = c.headline ? 'h3' : 'h2'
  const List = many || cards ? 'ul' : 'div'
  const Item = many || cards ? 'li' : 'div'
  const details = ['address', 'map', 'phone', 'email'].some((f) => show.has(f))

  return (
    <Section ctx={ctx}>
      <Container className="flex flex-col gap-xl">
        {c.headline && (
          <Heading ctx={ctx} style="h2" slot="headline" className="max-w-prose">
            {c.headline}
          </Heading>
        )}
        <List
          data-slot="facts"
          className={cx('grid', cards ? 'gap-lg @md:grid-cols-2 @md:gap-columns' : 'gap-xl')}
        >
          {locs.map((l) => (
            <Item
              key={l.id}
              className={cx(
                'flex min-w-0 flex-col gap-md',
                cards && 'rounded-card border border-border p-md @md:p-lg',
                !cards && many && 'border-t border-border pt-lg',
              )}
            >
              <NameTag className="type-h3 text-balance wrap-anywhere">{l.name}</NameTag>
              {cards ? (
                <>
                  {show.has('hours') && <HoursFacts ctx={ctx} location={l} />}
                  <PlaceFacts location={l} show={show} />
                  <ContactFacts ctx={ctx} location={l} show={show} />
                </>
              ) : (
                <div className="grid gap-lg @md:grid-cols-2 @md:gap-columns">
                  {show.has('hours') && <HoursFacts ctx={ctx} location={l} />}
                  {details && (
                    <div className="flex min-w-0 flex-col gap-md">
                      <PlaceFacts location={l} show={show} />
                      <ContactFacts ctx={ctx} location={l} show={show} />
                    </div>
                  )}
                </div>
              )}
            </Item>
          ))}
        </List>
        <Actions ctx={ctx} primary={c.primaryCta} />
      </Container>
    </Section>
  )
}
