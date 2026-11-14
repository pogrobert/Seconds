import type {
  Business,
  CollectionValue,
  FormRef,
  Location,
  NavItem,
  Price,
  SinglePrice,
} from '@repo/spec'
import { cx, type RenderCtx } from './core.ts'

// Facts are shown the same way by every block: prices, hours, addresses, contact links, menus, forms.
// Values come from the business record and collections, never from the text model.
// Formatting uses Intl with the site's locale, so it is the same on a Worker, in Node and in a browser.

/* ------------------------------------------------------------------ formatting (pure) */

export const formatMoney = (m: { amount: number; currency: string }, locale: string) =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: m.currency,
    minimumFractionDigits: m.amount % 100 === 0 ? 0 : 2,
  }).format(m.amount / 100)

const UNIT: Record<string, string> = {
  hour: 'hour',
  session: 'session',
  class: 'class',
  week: 'week',
  month: 'month',
  year: 'year',
  person: 'person',
  item: 'item',
}

/** One price as text: "£52", "from £165", "£10–£99", "£29 / month", "Price on request". */
export function formatSinglePrice(p: SinglePrice, locale: string): string {
  switch (p.type) {
    case 'fixed':
      return formatMoney(p.money, locale)
    case 'from':
      return `from ${formatMoney(p.money, locale)}`
    case 'range':
      return `${formatMoney(p.min, locale)}–${formatMoney(p.max, locale)}`
    case 'per':
      return `${formatMoney(p.money, locale)} / ${UNIT[p.unit]}`
    case 'on-request':
      return 'Price on request'
  }
}

/** A stored price, resolved against the collection's columns. */
export type PriceView =
  | { kind: 'single'; text: string }
  | { kind: 'options'; options: { label: string; text: string }[] }
  | { kind: 'columns'; cells: { column: string; label: string; text: string | null }[] }

export function viewPrice(
  p: Price,
  locale: string,
  columns?: CollectionValue['columns'],
): PriceView {
  if (p.type === 'options')
    return {
      kind: 'options',
      options: p.options.map((o) => ({ label: o.label, text: formatSinglePrice(o.price, locale) })),
    }
  if (p.type === 'columns')
    return {
      kind: 'columns',
      cells: (columns ?? []).map((c) => {
        const v = p.byColumn[c.id]
        return { column: c.id, label: c.label, text: v ? formatSinglePrice(v, locale) : null }
      }),
    }
  return { kind: 'single', text: formatSinglePrice(p, locale) }
}

// 2024-01-01 was a Monday, so day d (1 = Monday) is 2024-01-0d.
export const dayName = (day: number, locale: string, width: 'short' | 'long' = 'short') =>
  new Intl.DateTimeFormat(locale, { weekday: width, timeZone: 'UTC' }).format(
    new Date(Date.UTC(2024, 0, day)),
  )

export const formatTime = (hhmm: string, locale: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(2024, 0, 1, h ?? 0, m ?? 0)))
}

/** Opening hours as rows, with consecutive days that share the same times merged: "Mon–Fri". */
export function hoursRows(
  hours: Location['hours'],
  locale: string,
): { days: string; times: string }[] {
  const byDay = new Map<number, string>()
  for (let d = 1; d <= 7; d++) {
    const ranges = (hours ?? [])
      .filter((h) => h.day === d)
      .sort((a, b) => a.opens.localeCompare(b.opens))
      .map((h) => `${formatTime(h.opens, locale)}–${formatTime(h.closes, locale)}`)
    byDay.set(d, ranges.length ? ranges.join(', ') : 'Closed')
  }
  const rows: { days: string; times: string }[] = []
  let start = 1
  for (let d = 2; d <= 8; d++) {
    if (d <= 7 && byDay.get(d) === byDay.get(start)) continue
    const end = d - 1
    const days =
      start === end ? dayName(start, locale) : `${dayName(start, locale)}–${dayName(end, locale)}`
    rows.push({ days, times: byDay.get(start) ?? 'Closed' })
    start = d
  }
  return rows
}

/** "+441315550123" → "+44 131 555 0123": groups for reading; the link keeps the full number. */
export const formatPhone = (e164: string) =>
  e164.replace(/^(\+\d{1,3})(\d{3})(\d{3})(\d+)$/, '$1 $2 $3 $4')

/* ------------------------------------------------------------------ components */

export function Hours(p: { location: Location; ctx: RenderCtx; slot?: string }) {
  const rows = hoursRows(p.location.hours, p.ctx.locale)
  return (
    <table data-slot={p.slot ?? 'hours'} className="type-body w-full border-collapse">
      <caption className="sr-only">Opening hours, {p.location.name}</caption>
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

export function Address(p: { location: Location; slot?: string }) {
  const a = p.location.address
  if (!a) return null
  return (
    <address data-slot={p.slot ?? 'address'} className="type-body not-italic">
      {a.lines.map((l) => (
        <span key={l} className="block">
          {l}
        </span>
      ))}
      <span className="block">{[a.locality, a.postalCode].filter(Boolean).join(' ')}</span>
    </address>
  )
}

export function PhoneLink(p: { phone: string; slot?: string }) {
  return (
    <a
      data-slot={p.slot ?? 'phone'}
      href={`tel:${p.phone}`}
      className="type-body underline underline-offset-4"
    >
      {formatPhone(p.phone)}
    </a>
  )
}

export function EmailLink(p: { email: string; slot?: string }) {
  return (
    <a
      data-slot={p.slot ?? 'email'}
      href={`mailto:${p.email}`}
      className="type-body underline underline-offset-4"
    >
      {p.email}
    </a>
  )
}

/** A map is a link, not an embed: no third-party script loads with the page (decision 0001, answer 5). */
export function MapLink(p: { location: Location; slot?: string }) {
  const g = p.location.geo
  const a = p.location.address
  const query = g
    ? `${g.lat},${g.lng}`
    : a
      ? [...a.lines, a.locality, a.postalCode].filter(Boolean).join(', ')
      : ''
  if (!query) return null
  return (
    <a
      data-slot={p.slot ?? 'map'}
      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`}
      className="type-body underline underline-offset-4"
    >
      Open in Maps
    </a>
  )
}

const NETWORK_LABEL: Record<string, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  x: 'X',
  linkedin: 'LinkedIn',
  pinterest: 'Pinterest',
  google: 'Google',
  yelp: 'Yelp',
  tripadvisor: 'Tripadvisor',
  other: 'Website',
}

export function SocialLinks(p: { business: Business; slot?: string; className?: string }) {
  if (!p.business.social?.length) return null
  return (
    <ul data-slot={p.slot ?? 'social'} className={cx('flex flex-wrap gap-sm', p.className)}>
      {p.business.social.map((s) => (
        <li key={s.url}>
          <a href={s.url} className="type-small underline underline-offset-4">
            {NETWORK_LABEL[s.network]}
          </a>
        </li>
      ))}
    </ul>
  )
}

/** The business name, or its logo when it has one. Always links home. */
export function Logo(p: { ctx: RenderCtx; className?: string }) {
  const b = p.ctx.business
  return (
    <a href="/" data-slot="logo" className={cx('type-h3 text-fg no-underline', p.className)}>
      {b.logo ? (
        <img
          src={p.ctx.image({ asset: b.logo, alt: b.name }, { sizes: '12rem' }).src}
          alt={b.name}
          className="block h-tap w-auto"
        />
      ) : (
        b.name
      )}
    </a>
  )
}

/**
 * Navigation: links visible on wide screens, a labelled "Menu" button on narrow ones (decision 0001,
 * answer 4). Dropdowns open on click (<details>), one level only. The phone menu is a native popover:
 * no script.
 */
export function NavMenu(p: { ctx: RenderCtx; nav: NavItem[]; className?: string }) {
  const menuId = `menu-${p.ctx.id}`
  const list = (mobile: boolean) => (
    <ul className={cx(mobile ? 'flex flex-col gap-xs' : 'flex flex-wrap items-center gap-md')}>
      {p.nav.map((item) => (
        <li key={item.id} className="relative">
          {item.children?.length ? (
            <details className="nav-dropdown">
              <summary className="type-body cursor-pointer">{item.label}</summary>
              <ul className={cx('flex flex-col gap-xs', mobile ? 'ps-md pt-xs' : 'dropdown-panel')}>
                <li>
                  <a href={p.ctx.href(item.to)} className="type-body">
                    {item.label}
                  </a>
                </li>
                {item.children.map((c) => (
                  <li key={c.id}>
                    <a href={p.ctx.href(c.to)} className="type-body">
                      {c.label}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          ) : (
            <a href={p.ctx.href(item.to)} className="type-body">
              {item.label}
            </a>
          )}
        </li>
      ))}
    </ul>
  )
  return (
    <nav data-slot="nav" aria-label="Main" className={p.className}>
      <div className="hidden @lg:block">{list(false)}</div>
      <div className="@lg:hidden">
        <button
          type="button"
          popoverTarget={menuId}
          className="btn type-button min-h-tap rounded-control px-md"
          data-button="outline"
        >
          Menu
        </button>
        <div id={menuId} popover="auto" className="menu-popover">
          {list(true)}
        </div>
      </div>
    </nav>
  )
}

/** A newsletter sign-up. A plain form that works without JavaScript; where it posts is set by the platform. */
export function NewsletterForm(p: { ctx: RenderCtx; form: FormRef; label?: string }) {
  const fieldId = `${p.form.form}-email`
  return (
    <form
      data-slot="form"
      method="post"
      action={p.ctx.formAction(p.form)}
      className="flex flex-wrap items-end gap-xs"
    >
      <div className="flex min-w-0 grow flex-col gap-2xs">
        <label htmlFor={fieldId} className="type-small">
          {p.label ?? 'Email address'}
        </label>
        <input
          id={fieldId}
          name="email"
          type="email"
          required
          autoComplete="email"
          className="min-h-tap w-full rounded-control border border-border bg-bg px-sm text-fg"
        />
      </div>
      <button
        type="submit"
        data-button={p.ctx.button}
        className="btn type-button min-h-tap rounded-control px-md"
      >
        Sign up
      </button>
    </form>
  )
}
