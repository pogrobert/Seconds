import {
  Actions,
  Address,
  type BlockProps,
  Container,
  cx,
  dayName,
  EmailLink,
  formatTime,
  Heading,
  hoursRows,
  MapLink,
  PhoneLink,
  type RenderCtx,
  Section,
  strings,
} from '../../kit/index.tsx'

// Opening hours as the design. Every value comes from the business record; the model only chooses
// which facts to show. `strip`: the week as seven day columns, Monday to Sunday, each with its own
// hours. `statement`: the open days and times set large in display type, the rest small beneath.
// A static page cannot know today's date, so neither variant marks a day as today or says "open now".

type Loc = RenderCtx['business']['locations'][number]
type Show = ReadonlySet<string>

/** A place's phone and email; with one place, the business's own details fill the gaps. */
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

/** Each day of the week, Monday first, with its time ranges (none when closed). */
const week = (l: Loc, locale: string) =>
  [1, 2, 3, 4, 5, 6, 7].map((day) => ({
    day,
    name: dayName(day, locale),
    ranges: (l.hours ?? [])
      .filter((h) => h.day === day)
      .sort((a, b) => a.opens.localeCompare(b.opens))
      .map((h) => `${formatTime(h.opens, locale)}–${formatTime(h.closes, locale)}`),
  }))

/** Dates with different hours, as a short list. Nothing when there are none. */
function SpecialHours(p: { ctx: RenderCtx; location: Loc }) {
  const special = p.location.specialHours ?? []
  if (!special.length) return null
  const t = strings(p.ctx.locale)
  return (
    <ul className="type-small flex flex-wrap gap-x-md gap-y-2xs text-fg-muted">
      {special.map((s) => (
        <li key={s.date} className="max-w-full wrap-anywhere">
          <span className="tabular-nums">{formatDate(s.date, p.ctx.locale)}</span>
          {': '}
          {s.closed || !s.opens || !s.closes
            ? t.closed
            : `${formatTime(s.opens, p.ctx.locale)}–${formatTime(s.closes, p.ctx.locale)}`}
          {s.note ? ` · ${s.note}` : ''}
        </li>
      ))}
    </ul>
  )
}

/** Cells that take a full row on phones: an address or an email address is too long for half. */
const WIDE = new Set(['address', 'email'])

/**
 * Address, phone, email and directions as labelled cells: a small label over each value.
 * The access note sits under the address (or under directions when the address is not shown).
 */
function FactCells(p: { ctx: RenderCtx; location: Loc; show: Show; className?: string }) {
  const l = p.location
  const t = strings(p.ctx.locale)
  const { phone, email } = contactOf(p.ctx, l)
  const address = p.show.has('address') && l.address
  const map = p.show.has('map') && (l.geo || l.address)
  const note = l.note && (address || map) ? l.note : undefined
  const cells = [
    address && {
      key: 'address',
      label: t.address,
      value: (
        <>
          <Address location={l} />
          {note && (
            <p className="type-small pt-xs text-fg-muted text-pretty wrap-anywhere">{note}</p>
          )}
        </>
      ),
    },
    p.show.has('phone') &&
      phone && { key: 'phone', label: t.phone, value: <PhoneLink phone={phone} /> },
    p.show.has('email') &&
      email && {
        key: 'email',
        label: t.email,
        value: (
          <span className="block max-w-full wrap-anywhere">
            <EmailLink email={email} />
          </span>
        ),
      },
    map && {
      key: 'map',
      label: t.directions,
      value: (
        <>
          <MapLink ctx={p.ctx} location={l} />
          {note && !address && (
            <p className="type-small pt-xs text-fg-muted text-pretty wrap-anywhere">{note}</p>
          )}
        </>
      ),
    },
  ].filter((x) => !!x)
  if (!cells.length) return null
  return (
    <dl className={cx('grid grid-cols-2 gap-x-md gap-y-lg', p.className)}>
      {cells.map((cell) => (
        <div
          key={cell.key}
          className={cx(
            'flex min-w-0 flex-col gap-2xs',
            WIDE.has(cell.key) && 'col-span-2 @lg:col-span-1',
          )}
        >
          <dt className="type-eyebrow text-fg-muted">{cell.label}</dt>
          <dd className="min-w-0">{cell.value}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Seven day columns. A dark rule over open days, a faint one over closed days. */
function WeekStrip(p: { ctx: RenderCtx; location: Loc }) {
  const t = strings(p.ctx.locale)
  return (
    <ol
      data-slot="hours"
      aria-label={`${t.openingHours}, ${p.location.name}`}
      className="grid grid-cols-2 gap-x-md gap-y-lg @md:grid-cols-4 @lg:grid-cols-7 @lg:gap-x-sm"
    >
      {week(p.location, p.ctx.locale).map((d) => {
        const open = d.ranges.length > 0
        return (
          <li
            key={d.day}
            className={cx(
              'flex min-w-0 flex-col gap-xs border-t pt-sm',
              open ? 'border-fg' : 'border-border',
            )}
          >
            <span className={cx('type-h2 wrap-anywhere', !open && 'text-fg-muted')}>{d.name}</span>
            {open ? (
              <span className="type-body flex flex-col tabular-nums">
                {d.ranges.map((r) => (
                  <span key={r} className="block">
                    {r}
                  </span>
                ))}
              </span>
            ) : (
              <span className="type-body text-fg-muted">{t.closed}</span>
            )}
          </li>
        )
      })}
    </ol>
  )
}

/** The open days and times in display type; the closed days in one small line after them. */
function HoursStatement(p: { ctx: RenderCtx; location: Loc }) {
  const t = strings(p.ctx.locale)
  const rows = hoursRows(p.location.hours, p.ctx.locale)
  const open = rows.filter((r) => r.times !== t.closed)
  const closed = rows.filter((r) => r.times === t.closed)
  if (!open.length) return null
  return (
    <div data-slot="hours" className="flex flex-col gap-md">
      <dl className="flex flex-col gap-md @md:gap-sm">
        {open.map((r) => (
          <div
            key={r.days}
            className="grid min-w-0 gap-2xs @md:grid-cols-4 @md:items-baseline @md:gap-md"
          >
            <dt className="type-eyebrow text-fg-muted">{r.days}</dt>
            <dd className="type-display min-w-0 tabular-nums @md:col-span-3">
              {r.times.split(', ').map((range) => (
                <span key={range} className="block">
                  {range}
                </span>
              ))}
            </dd>
          </div>
        ))}
      </dl>
      {closed.length > 0 && (
        <p className="type-small text-fg-muted @md:grid @md:grid-cols-4 @md:gap-md">
          <span className="@md:col-start-2">
            {closed.map((r) => r.days).join(' · ')}: {t.closed}
          </span>
        </p>
      )}
    </div>
  )
}

export default function HoursLocationWeek({
  content: c,
  variant,
  ctx,
}: BlockProps<'hours-location'>) {
  const show: Show = new Set(c.facts)
  const all = ctx.business.locations
  const locs = show.has('locations') ? all : all.slice(0, 1)
  const many = locs.length > 1
  // Place names sit under the section headline; without one, they are the section's headings.
  const NameTag = c.headline ? 'h3' : 'h2'
  const List = many ? 'ul' : 'div'
  const Item = many ? 'li' : 'div'

  if (variant === 'statement') {
    // The headline is a small label: the hours are the big type. It keeps the page's heading level.
    const Title = ctx.headingLevel === 1 ? 'h1' : 'h2'
    return (
      <Section ctx={ctx}>
        <Container className="flex flex-col gap-xl">
          {c.headline && (
            <Title
              data-slot="headline"
              className="type-eyebrow max-w-prose text-balance wrap-anywhere"
            >
              {c.headline}
            </Title>
          )}
          <List data-slot="facts" className="flex flex-col gap-2xl">
            {locs.map((l, i) => {
              const big = show.has('hours') && !!l.hours?.length
              return (
                <Item
                  key={l.id}
                  className={cx(
                    'flex min-w-0 flex-col gap-xl',
                    i > 0 && 'border-t border-border pt-xl',
                  )}
                >
                  {(many || !c.headline) && (
                    <NameTag className="type-h3 text-balance wrap-anywhere">{l.name}</NameTag>
                  )}
                  {big && <HoursStatement ctx={ctx} location={l} />}
                  {show.has('hours') && <SpecialHours ctx={ctx} location={l} />}
                  <FactCells
                    ctx={ctx}
                    location={l}
                    show={show}
                    className="border-t border-border pt-md @lg:grid-cols-4"
                  />
                </Item>
              )
            })}
          </List>
          <Actions ctx={ctx} primary={c.primaryCta} />
        </Container>
      </Section>
    )
  }

  return (
    <Section ctx={ctx}>
      <Container className="flex flex-col gap-xl">
        {(c.headline || c.primaryCta) && (
          <div className="flex flex-col items-start gap-md @lg:flex-row @lg:items-end @lg:justify-between @lg:gap-columns">
            {c.headline && (
              <Heading ctx={ctx} style="h2" slot="headline" className="max-w-prose">
                {c.headline}
              </Heading>
            )}
            <Actions ctx={ctx} primary={c.primaryCta} className="shrink-0" />
          </div>
        )}
        <List data-slot="facts" className="flex flex-col gap-2xl">
          {locs.map((l) => (
            <Item key={l.id} className="flex min-w-0 flex-col gap-lg">
              {(many || !c.headline) && (
                <NameTag className="type-h3 text-balance wrap-anywhere">{l.name}</NameTag>
              )}
              {show.has('hours') && !!l.hours?.length && <WeekStrip ctx={ctx} location={l} />}
              {show.has('hours') && <SpecialHours ctx={ctx} location={l} />}
              <FactCells ctx={ctx} location={l} show={show} className="@lg:grid-cols-4" />
            </Item>
          ))}
        </List>
      </Container>
    </Section>
  )
}
