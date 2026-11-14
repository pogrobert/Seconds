import {
  Address,
  type BlockProps,
  Container,
  cx,
  EmailLink,
  hoursRows,
  Logo,
  MapLink,
  NewsletterForm,
  PhoneLink,
  type RenderCtx,
  RichText,
  Section,
  SocialLinks,
} from '../../kit/index.tsx'

type Content = BlockProps<'footer'>['content']
type FactKey = NonNullable<Content['facts']>[number]
type Loc = RenderCtx['business']['locations'][number]

/**
 * Opening hours with a visible caption. The kit's Hours hides its caption with sr-only, which the
 * browser check reports as clipped text, so this draws the same rows (the kit's hoursRows) itself.
 */
function OpeningHours(p: { ctx: RenderCtx; place: Loc }) {
  const rows = hoursRows(p.place.hours, p.ctx.locale)
  return (
    <table data-slot="hours" className="type-body w-full border-collapse">
      <caption className="type-small pb-2xs text-start text-fg-muted">Opening hours</caption>
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

/** One place: its name (when several are listed), address, map link, contact links and hours. */
function Place(p: {
  ctx: RenderCtx
  place: Loc
  named: boolean
  show: { address: boolean; map: boolean; phone?: string; email?: string; hours: boolean }
}) {
  const { place, show } = p
  const map = show.map && Boolean(place.geo || place.address)
  return (
    <div className="flex min-w-0 flex-col gap-sm">
      {p.named && <h2 className="type-eyebrow">{place.name}</h2>}
      {show.address && <Address location={place} />}
      {(map || show.phone || show.email) && (
        <ul className="flex flex-col gap-xs">
          {show.phone && (
            <li>
              <PhoneLink phone={show.phone} />
            </li>
          )}
          {show.email && (
            <li className="break-words">
              <EmailLink email={show.email} />
            </li>
          )}
          {map && (
            <li>
              <MapLink ctx={p.ctx} location={place} />
            </li>
          )}
        </ul>
      )}
      {show.hours && place.hours?.length ? <OpeningHours ctx={p.ctx} place={place} /> : null}
    </div>
  )
}

/** The facts the content asks for, drawn with the kit. Values come from the business record only. */
function Facts(p: { ctx: RenderCtx; facts: readonly FactKey[]; spread: boolean }) {
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
            show={{ address: has('address'), map: has('map'), hours: has('hours') }}
          />,
        ]
      : []
  const contact = (phone || email) && (
    <ul key="contact" className="flex flex-col gap-xs">
      {phone && (
        <li>
          <PhoneLink phone={phone} />
        </li>
      )}
      {email && (
        <li className="break-words">
          <EmailLink email={email} />
        </li>
      )}
    </ul>
  )
  const groups = [
    ...places,
    contact,
    has('social') && <SocialLinks key="social" business={b} />,
    licences.length > 0 && (
      <ul key="licence" className="type-small flex flex-col gap-2xs text-fg-muted">
        {licences.map((l) => (
          <li key={`${l.label} ${l.number}`}>
            {l.label} {l.number}
          </li>
        ))}
      </ul>
    ),
  ].filter(Boolean)
  if (groups.length === 0) return null
  return (
    <div
      data-slot="facts"
      className={cx(
        'min-w-0',
        p.spread ? 'grid gap-lg @md:grid-cols-2 @lg:grid-cols-3' : 'flex flex-col gap-lg',
      )}
    >
      {groups}
    </div>
  )
}

export default function FooterColumns({ content: c, variant, ctx }: BlockProps<'footer'>) {
  const nav = c.nav ?? []
  const form = variant === 'signup' ? c.form : undefined
  const brand = (
    <div className="flex min-w-0 flex-col gap-lg">
      <div className="flex flex-col gap-sm">
        <div className="break-words">
          <Logo ctx={ctx} />
        </div>
        {c.body && <RichText ctx={ctx} value={c.body} slot="body" className="text-fg-muted" />}
      </div>
      {c.facts && <Facts ctx={ctx} facts={c.facts} spread={nav.length === 0} />}
    </div>
  )

  return (
    <Section ctx={ctx}>
      <Container className="flex flex-col gap-xl">
        {form && (
          <div className="grid items-end gap-md border-b border-border pb-xl @lg:grid-cols-2">
            <h2 className="type-h3">Newsletter</h2>
            <div className="min-w-0">
              <NewsletterForm ctx={ctx} form={form} />
            </div>
          </div>
        )}
        <div className={cx('grid gap-columns', nav.length > 0 && '@lg:grid-cols-3')}>
          {brand}
          {nav.length > 0 && (
            <nav
              data-slot="nav"
              aria-label="Footer"
              className="grid min-w-0 grid-cols-2 gap-x-md gap-y-lg @md:grid-cols-3 @lg:col-span-2"
            >
              {nav.map((item) => (
                <div key={item.id} className="flex min-w-0 flex-col gap-xs">
                  <h2 className="type-eyebrow break-words">
                    <a
                      href={ctx.href(item.to)}
                      className="inline-flex min-h-tap items-center no-underline hover:underline"
                    >
                      {item.label}
                    </a>
                  </h2>
                  {item.children?.length ? (
                    <ul className="flex flex-col">
                      {item.children.map((link) => (
                        <li key={link.id} className="break-words">
                          <a
                            href={ctx.href(link.to)}
                            className="type-body inline-flex min-h-tap items-center text-fg-muted no-underline hover:text-fg hover:underline"
                          >
                            {link.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </nav>
          )}
        </div>
        {c.note && (
          <p data-slot="note" className="type-small border-t border-border pt-md text-fg-muted">
            {c.note}
          </p>
        )}
      </Container>
    </Section>
  )
}
