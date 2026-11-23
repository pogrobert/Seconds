// Shared parts of the whole-page templates (docs/m0/24-templates.md). A template is one page
// designed as a unit: one width, one spacing scale, one way of using colour and photos. Each sets
// its own CSS; this file holds only what reads the content the same way in all of them.

import type { ReactNode } from 'react'
import { hasVisit, items, type Photo, type SiteContent } from '../ui.tsx'

export type TemplateProps = { c: SiteContent; extras: Extra[] }
/** The optional sections a page may carry, picked by Jev (make-site.ts). */
export type Extra = 'reasons' | 'steps' | 'audience' | 'faq' | 'statement' | 'gallery'

export type Template = {
  id: string
  label: string
  /** What Jev reads when it picks a template for a business. */
  text: string
  /** Whether the page is dark (photo art and the build page's version dot follow it). */
  dark: boolean
  /** Not yet kept by the author: drawn by the gate and the wall, never offered to an owner. */
  draft?: boolean
  css: string
  Page: (p: TemplateProps) => ReactNode
  /** Its own variants, if any, on top of the shared ones (`variantsOf`, index.tsx). */
  variants?: Variant[]
}

/**
 * A variant of a template: a few CSS rules laid over its own, for more looks from one design
 * (docs/m0/25-template-plan.md). A variant marked `draft` is not reviewed yet and is never offered
 * to an owner.
 */
export type Variant = { id: string; label: string; css: string; draft?: boolean }

/**
 * Spacing variants for any template that sets its section spacing with `--sec` (38 of 47 do):
 * the same page with tighter or roomier sections and side margins, from the template's own values
 * scaled, so its proportions stay its own.
 */
export function spacingVariants(css: string): Variant[] {
  const sec = css.match(/--sec:([^;}]+)/)?.[1]
  if (!sec) return []
  const gut = css.match(/--gut:([^;}]+)/)?.[1]
  const scale = (v: string, k: number) =>
    v.replace(
      /(\d*\.?\d+)(rem|vw|px|em)/g,
      (_, n: string, u: string) => `${+(Number(n) * k).toFixed(3)}${u}`,
    )
  const at = (k: number, g: number) =>
    `:root{--sec:${scale(sec, k)}${gut ? `;--gut:${scale(gut, g)}` : ''}}`
  return [
    { id: 'snug', label: 'Snug', css: at(0.7, 0.85) },
    { id: 'roomy', label: 'Roomy', css: at(1.3, 1.25) },
  ]
}

/** The facts the owner gave, as label and value, in the order a visitor looks for them. */
export function facts(c: SiteContent): { label: string; value: string; href?: string }[] {
  const out: { label: string; value: string; href?: string }[] = []
  const hours = c.hours.map((h) => [h.days, h.time].filter(Boolean).join(' ')).join('; ')
  if (hours) out.push({ label: 'Hours', value: hours })
  // The address opens a map; Google's link works on every phone and
  // computer and needs no key. Only ever the owner's own address (site-text.ts groundContact).
  if (c.address.length) {
    const value = c.address.join(', ')
    out.push({
      label: 'Address',
      value,
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${c.name}, ${value}`)}`,
    })
  }
  if (c.phone)
    out.push({ label: 'Phone', value: c.phone, href: `tel:${c.phone.replace(/\s/g, '')}` })
  if (c.email) out.push({ label: 'Email', value: c.email, href: `mailto:${c.email}` })
  return out
}

/** The way to get in touch for a page's main button: a phone or email link, never the map. */
export const reachOf = <T extends { label: string; href?: string }>(f: T[]) =>
  f.find((x) => x.href && x.label !== 'Address')

export const offerItems = (c: SiteContent) => items(c)
export { hasVisit }

/** The section a list-shaped extra reads: its heading and its items. */
export function listOf(
  c: SiteContent,
  x: Extra,
): { title: string; items: { title: string; body: string }[] } | null {
  if (x === 'reasons' && c.reasons.length) return { title: c.reasonsTitle, items: c.reasons }
  if (x === 'steps' && c.steps?.items.length) return c.steps
  if (x === 'audience' && c.audience?.items.length) return c.audience
  return null
}

/** Only the extras the content can fill, in a fixed order so pages read the same way. */
export function present(c: SiteContent, extras: Extra[]): Extra[] {
  const order: Extra[] = ['statement', 'reasons', 'audience', 'steps', 'gallery', 'faq']
  return order.filter(
    (x) =>
      extras.includes(x) &&
      (x === 'statement'
        ? !!c.statement
        : x === 'faq'
          ? !!c.faq?.length
          : x === 'gallery'
            ? true
            : !!listOf(c, x)),
  )
}

/**
 * Sections' inner parts that read the content the same way in every template. Each draws only its
 * repeated items, with no wrapper and no class of its own (except the step number's `.n`), so the
 * template keeps its markup around them and all of its look in its own CSS.
 */

/** The contact details as `dt`/`dd` pairs, each in a `div`; a phone, email or address is a link. */
export function FactRows({ facts }: { facts: { label: string; value: string; href?: string }[] }) {
  return (
    <>
      {facts.map((x) => (
        <div key={x.label}>
          <dt>{x.label}</dt>
          <dd>{x.href ? <a href={x.href}>{x.value}</a> : x.value}</dd>
        </div>
      ))}
    </>
  )
}

/** The menu's links (see `links`), plain `a` elements. */
export function NavLinks({ links }: { links: { href: string; label: string }[] }) {
  return (
    <>
      {links.map((l) => (
        <a key={l.href} href={l.href}>
          {l.label}
        </a>
      ))}
    </>
  )
}

/** Questions as open reading: each a `div` with the question as `h3` and the answer as `p`. */
export function FaqList({ faq }: { faq?: { q: string; a: string }[] | undefined }) {
  return (
    <>
      {faq?.map((f) => (
        <div key={f.q}>
          <h3>{f.q}</h3>
          <p>{f.a}</p>
        </div>
      ))}
    </>
  )
}

/** Questions that open one at a time: `details` with the question as its `summary`. */
export function FaqDetails({ faq }: { faq?: { q: string; a: string }[] | undefined }) {
  return (
    <>
      {faq?.map((f) => (
        <details key={f.q}>
          <summary>{f.q}</summary>
          <p>{f.a}</p>
        </details>
      ))}
    </>
  )
}

/** A list section's items as `li`, title `h3` and body `p`; numbered (`span.n`) for steps. */
export function ListItems({
  items,
  numbered = false,
}: {
  items: { title: string; body: string }[]
  numbered?: boolean
}) {
  return (
    <>
      {items.map((it, i) => (
        <li key={it.title}>
          {numbered && <span className="n">{i + 1}</span>}
          <h3>{it.title}</h3>
          <p>{it.body}</p>
        </li>
      ))}
    </>
  )
}

export function Pic(p: { photo: Photo; className?: string; eager?: boolean }) {
  return (
    <img
      className={p.className}
      src={p.photo.src}
      alt={p.photo.alt}
      width={p.photo.w}
      height={p.photo.h}
      loading={p.eager ? 'eager' : 'lazy'}
    />
  )
}

/** The page's links: only to sections it has. */
export function links(c: SiteContent, extras: Extra[]) {
  // No offer items (a business that listed nothing and had none written): no link to an offer.
  const out = items(c).length ? [{ href: '#offer', label: c.offerTitle }] : []
  if (extras.includes('faq') && c.faq?.length) out.push({ href: '#questions', label: 'Questions' })
  out.push({ href: '#visit', label: hasVisit(c) ? 'Visit' : c.cta.label })
  return out
}

/**
 * A small reset every template starts from; each adds its own rules on top. It also hides a
 * secondary photo space that got drawn art because no fresh photo was left: in a pair or a
 * gallery, a missing photo reads better than a coloured blob (the hero keeps its art). The photos
 * left then share the row evenly, and a section with none left goes (round 4, docs/m0/24).
 */
export const RESET = `*,*::before,*::after{box-sizing:border-box}html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}body{margin:0;font-family:var(--font-body);-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}img{display:block;max-width:100%;height:auto}h1,h2,h3,p,dl,dd,ol,ul,figure{margin:0}ol,ul{padding:0;list-style:none}a{color:inherit}h1,h2,h3{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);text-transform:var(--heading-case);text-wrap:balance}p{text-wrap:pretty}:focus-visible{outline:2px solid currentColor;outline-offset:3px}details>summary{list-style:none;cursor:pointer}details>summary::-webkit-details-marker{display:none}.pair figure:has(img[data-art]),.pair figure:has(img[src^="data:image/svg"]),.gal figure:has(img[data-art]),.gal figure:has(img[src^="data:image/svg"]),.three figure:has(img[data-art]),.three figure:has(img[src^="data:image/svg"]),figure.bleed:has(img[data-art]),figure.bleed:has(img[src^="data:image/svg"]),.strip figure:has(img[data-art]),.strip figure:has(img[src^="data:image/svg"]){display:none}.pair:has(img[data-art],img[src^="data:image/svg"]),.gal:has(img[data-art],img[src^="data:image/svg"]),.three:has(img[data-art],img[src^="data:image/svg"]),.strip:has(img[data-art],img[src^="data:image/svg"]){grid-template-columns:none!important;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr)}.pair:has(img[data-art],img[src^="data:image/svg"]) figure,.gal:has(img[data-art],img[src^="data:image/svg"]) figure,.three:has(img[data-art],img[src^="data:image/svg"]) figure,.strip:has(img[data-art],img[src^="data:image/svg"]) figure{margin-top:0!important;grid-row:auto!important;grid-column:auto!important}.pair:has(img[data-art],img[src^="data:image/svg"]) img,.gal:has(img[data-art],img[src^="data:image/svg"]) img,.three:has(img[data-art],img[src^="data:image/svg"]) img{aspect-ratio:3/2!important;height:auto!important;min-height:0!important}section:has(.pair,.gal,.three):not(:has(img:not([data-art]):not([src^="data:image/svg"]))),section.pair:not(:has(img:not([data-art]):not([src^="data:image/svg"]))),section.strip:not(:has(img:not([data-art]):not([src^="data:image/svg"]))),section.gal:not(:has(img:not([data-art]):not([src^="data:image/svg"]))){display:none}@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}}`
