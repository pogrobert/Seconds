// The design-rules proof (docs/m0/12-design-rules.md): a page is one composition (layer 1) drawn in
// one type system (layer 2). This file holds what every composition shares: the content they draw,
// the colours, the base styles and small helpers. Plain HTML and CSS, no JavaScript in the page.
// An experiment kept out of the library on purpose: if it works, it moves into the spec and blocks.

import type { Copy } from '@repo/pipeline'
import type { SampleBusiness } from '../businesses.ts'
import type { TypeRule } from './type-rules.ts'

export type Photo = { src: string; alt: string; w: number; h: number }
export type PriceRow = { name: string; detail?: string; time?: string; price: string }

export type Content = {
  name: string
  tagline: string
  headline: string
  subhead: string
  about: string
  proof?: string
  reasons: { title: string; body: string }[]
  prices: { group: string; items: PriceRow[] }[]
  hours: { days: string; time: string }[]
  address: string[]
  visit: string
  note?: string
  phone: string
  email: string
  book: string
  cta: { headline: string; subhead: string; label: string }
  photos: { hero: Photo; about: Photo; cta: Photo; d1: Photo; d2: Photo }
  brand: string
}

export type Composition = {
  key: string
  label: string
  /** What the decision model reads. */
  text: string
  css: string
  html: (c: Content) => string
}

/* ------------------------------------------------------------------ helpers */

export const esc = (s: string) =>
  s.replace(
    /[&<>"]/g,
    (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch] ?? ch,
  )

const longest = (s: string) => Math.max(4, ...s.split(/\s+/).map((w) => [...w].length))

/**
 * A heading capped so its longest word always fits the column it sits in (`--long` × the type
 * system's advance, against the container width). Classes: d1, d2, d3 or name.
 */
export const fit = (tag: string, cls: string, text: string, attrs = '') =>
  `<${tag} class="${cls}" style="--long:${longest(text)};--chars:${[...text].length}"${attrs}>${esc(text)}</${tag}>`

/** The hero headline, with its last word set in the type system's emphasis. */
export const headline = (tag: string, cls: string, text: string) => {
  const words = text.trim().split(/\s+/)
  const last = words.pop() ?? ''
  return `<${tag} class="${cls}" data-slot="headline" style="--long:${longest(text)}">${esc(words.join(' '))} <em>${esc(last)}</em></${tag}>`
}

export const img = (p: Photo, cls = '', eager = false) =>
  `<img class="${cls}" src="${p.src}" alt="${esc(p.alt)}" width="${p.w}" height="${p.h}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'}>`

export const btn = (c: Content, cls = '') =>
  `<a class="btn ${cls}" data-slot="primaryCta" href="${c.book}">${esc(c.cta.label)}</a>`

export const nav = (c: Content, cls = '') =>
  `<nav class="nav ${cls}" aria-label="Main"><a href="#about">About</a><a href="#prices">Prices</a><a href="#visit">Visit</a>${btn(c, 'small')}</nav>`

export const priceRows = (c: Content, leaders = false) =>
  c.prices
    .map(
      (g) =>
        `<div class="pgroup"><h3 class="lab">${esc(g.group)}</h3><ul class="plist${leaders ? ' leaders' : ''}">${g.items
          .map(
            (i) =>
              `<li><span class="pname">${esc(i.name)}${i.detail ? `<small>${esc(i.detail)}</small>` : ''}</span>${leaders ? '<span class="dots" aria-hidden="true"></span>' : ''}${i.time ? `<span class="ptime">${esc(i.time)}</span>` : leaders ? '' : '<span class="ptime"></span>'}<span class="pprice">${esc(i.price)}</span></li>`,
          )
          .join('')}</ul></div>`,
    )
    .join('')

export const hoursList = (c: Content) =>
  `<dl class="hours">${c.hours.map((h) => `<div><dt>${esc(h.days)}</dt><dd>${esc(h.time)}</dd></div>`).join('')}</dl>`

export const addressBlock = (c: Content) => `<address>${c.address.map(esc).join('<br>')}</address>`

export const contact = (c: Content) =>
  `<p class="contact"><a href="tel:${c.phone.replace(/\s/g, '')}">${esc(c.phone)}</a><br><a href="mailto:${c.email}">${esc(c.email)}</a></p>`

/* ------------------------------------------------------------------ colour */

const hex = (h: string) => [1, 3, 5].map((i) => Number.parseInt(h.slice(i, i + 2), 16))
const toHex = (rgb: number[]) =>
  `#${rgb
    .map((v) =>
      Math.round(Math.max(0, Math.min(255, v)))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`
const mix = (a: string, b: string, t: number) => {
  const x = hex(a)
  const y = hex(b)
  return toHex(x.map((v, i) => v + ((y[i] ?? 0) - v) * t))
}

/** One palette from the brand colour: warm paper, near-black ink with a hint of the brand. */
export function palette(brand: string) {
  return {
    '--brand': brand,
    '--on-brand': '#ffffff',
    '--ground': mix('#f7f4ef', brand, 0.02),
    '--tint': mix('#f7f4ef', brand, 0.1),
    '--ink': mix('#1c1a1d', brand, 0.12),
    '--muted': mix('#57535a', brand, 0.1),
    '--line': mix('#d9d4cd', brand, 0.12),
    '--night': mix('#18161a', brand, 0.18),
  }
}

/* ------------------------------------------------------------------ base CSS */

const BASE = `
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;text-size-adjust:100%}
body{margin:0;background:var(--ground);color:var(--ink);font-family:var(--f-b);font-size:var(--size-b);line-height:var(--lh-b);font-weight:400;-webkit-font-smoothing:antialiased;overflow-x:clip}
img{display:block;max-width:100%;height:auto}
a{color:inherit;text-underline-offset:0.2em;text-decoration-thickness:1px}
p,h1,h2,h3,ul,dl,dd,figure,address{margin:0;padding:0}
ul{list-style:none}
address{font-style:normal}
:focus-visible{outline:2px solid var(--brand);outline-offset:3px}
.cq{container-type:inline-size;min-width:0}
.d1,.d2,.d3,.name{font-family:var(--f-d);font-weight:var(--w-d);letter-spacing:var(--t-d);text-transform:var(--c-d);line-height:var(--lh-d);text-wrap:balance}
.d1{font-size:min(var(--d1),calc(94cqi / (var(--long) * var(--adv))))}
.d2{font-size:min(var(--d2),calc(94cqi / (var(--long) * var(--adv))))}
.d3{font-size:var(--d3);line-height:1.15}
header .name,.bar .name{white-space:nowrap}
.d1 em,.d2 em{font-style:var(--em-style);color:var(--em-color)}
.st{font-family:var(--f-st);font-weight:var(--w-st);letter-spacing:var(--t-st,-0.01em);font-size:var(--st);line-height:1.28;text-wrap:pretty}
.lead{font-size:var(--lead);line-height:1.5;text-wrap:pretty}
.lab{font-family:var(--f-l);font-weight:var(--w-l);letter-spacing:var(--t-l);text-transform:var(--c-l);font-variant-caps:var(--var-l,normal);font-size:var(--size-l);line-height:1.3}
.muted{color:var(--muted)}
.btn{display:inline-flex;align-items:center;justify-content:center;min-height:50px;padding:0 26px;border-radius:var(--radius);background:var(--brand);color:var(--on-brand);text-decoration:none;font-family:var(--f-btn);font-weight:600;text-transform:var(--c-btn,none);letter-spacing:var(--t-btn,0);font-size:var(--size-btn);line-height:1;white-space:nowrap}
.btn.small{min-height:40px;padding:0 18px}
.btn.light{background:var(--on-brand);color:var(--brand)}
.nav{display:flex;align-items:center;gap:clamp(14px,2.2vw,32px);font-size:15px}
.nav a:not(.btn){text-decoration:none}
.nav a:not(.btn):hover{text-decoration:underline}
@media (max-width:700px){.nav a:not(.btn){display:none}}
.cover{width:100%;height:100%;object-fit:cover}
.pgroup{display:grid;gap:10px}
.pgroup + .pgroup{margin-top:clamp(28px,3vw,44px)}
.plist li{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:4px 18px;align-items:baseline;padding:14px 0;border-top:1px solid var(--line)}
.plist li:last-child{border-bottom:1px solid var(--line)}
.plist.leaders li{grid-template-columns:auto minmax(16px,1fr) auto auto;border:0;padding:7px 0}
.plist.leaders li:last-child{border:0}
.plist .dots{border-bottom:1px dotted var(--muted);transform:translateY(-0.3em)}
.pname small{display:block;font-size:0.85em;color:var(--muted);line-height:1.45;margin-top:2px}
.ptime{color:var(--muted);font-size:0.9em}
.pprice{font-variant-numeric:tabular-nums lining-nums;text-align:right;white-space:nowrap}
.hours{display:grid;gap:0}
.hours div{display:flex;justify-content:space-between;gap:18px;padding:10px 0;border-top:1px solid var(--line)}
.hours div:last-child{border-bottom:1px solid var(--line)}
.hours dd{font-variant-numeric:tabular-nums lining-nums;white-space:nowrap}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
`

export function renderPage(
  c: Content,
  comp: Composition,
  type: TypeRule,
  o: { title?: string } = {},
): string {
  const vars = { ...palette(c.brand), ...type.vars, '--adv': String(type.advance) }
  const root = `:root{${Object.entries(vars)
    .map(([k, v]) => `${k}:${v}`)
    .join(';')};--g:clamp(20px,4.4vw,72px);--sp:clamp(72px,9vw,148px)}`
  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(o.title ?? `${c.name}: ${c.tagline}`)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${type.fonts}&display=swap">
<style>${root}${BASE}${comp.css}</style>
</head>
<body class="c-${comp.key} t-${type.key}">
${comp.html(c)}
</body>
</html>`
}

/* ------------------------------------------------------------------ content */

const DAY = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const pounds = (m: { amount: number }) => `£${(m.amount / 100).toFixed(m.amount % 100 ? 2 : 0)}`
const minutes = (n: number) =>
  n < 60 ? `${n} min` : `${Math.floor(n / 60)} hr${n % 60 ? ` ${n % 60} min` : ''}`

type Price =
  | { type: 'fixed' | 'from'; money: { amount: number } }
  | { type: 'columns'; byColumn: Record<string, { money: { amount: number } }> }
  | { type: 'on-request' }

function priceText(p: Price): string {
  if (p.type === 'fixed') return pounds(p.money)
  if (p.type === 'from') return `from ${pounds(p.money)}`
  if (p.type === 'columns') {
    const all = Object.values(p.byColumn).map((x) => x.money.amount)
    return `from ${pounds({ amount: Math.min(...all) })}`
  }
  return 'On request'
}

function ukPhone(e164: string) {
  const n = `0${e164.replace(/^\+44/, '')}`
  return `${n.slice(0, 4)} ${n.slice(4, 7)} ${n.slice(7)}`
}

type ManifestPhoto = { file: string; alt: string; width: number; height: number }

/** Content for a sample business, with its stand-in words and its five photos. */
export function contentOf(
  s: SampleBusiness,
  photos: Record<string, ManifestPhoto>,
  photoBase: string,
  o: { name?: string; brand?: string; copy?: Copy } = {},
): Content {
  const w = o.copy ?? s.standIn
  const b = s.business
  const loc = b.locations[0]
  if (!loc) throw new Error('no location')
  const ph = (k: string): Photo => {
    const p = photos[k]
    if (!p) throw new Error(`missing photo ${k}`)
    return { src: `${photoBase}${p.file}`, alt: p.alt, w: p.width, h: p.height }
  }
  // Hours grouped by identical times, days in week order.
  const byTime = new Map<string, number[]>()
  for (const h of loc.hours ?? []) {
    const k = `${h.opens}–${h.closes}`
    byTime.set(k, [...(byTime.get(k) ?? []), h.day])
  }
  const hours = [...byTime.entries()]
    .sort((a, b) => Math.min(...a[1]) - Math.min(...b[1]))
    .map(([time, days]) => ({ days: days.map((d) => DAY[d]).join(', '), time }))
  const open = new Set((loc.hours ?? []).map((h) => h.day))
  const closed = [1, 2, 3, 4, 5, 6, 7].filter((d) => !open.has(d)).map((d) => DAY[d])
  if (closed.length) hours.push({ days: closed.join(', '), time: 'Closed' })

  const items = (s.collections[0]?.items ?? []) as {
    group?: string
    name: string
    description?: string
    duration?: number
    price: Price
  }[]
  const groups = new Map<string, PriceRow[]>()
  for (const i of items) {
    const g = i.group ?? 'Services'
    groups.set(g, [
      ...(groups.get(g) ?? []),
      {
        name: i.name,
        ...(i.description ? { detail: i.description } : {}),
        ...(i.duration ? { time: minutes(i.duration) } : {}),
        price: priceText(i.price),
      },
    ])
  }
  const a = loc.address
  return {
    name: o.name ?? b.name,
    tagline: w.tagline,
    headline: w.headline,
    subhead: w.subhead,
    about: w.about,
    ...(b.proof?.text ? { proof: b.proof.text } : {}),
    reasons: w.reasons,
    prices: [...groups.entries()].map(([group, items]) => ({ group, items })),
    hours,
    address: a ? [...a.lines, `${a.locality} ${a.postalCode}`] : [],
    visit: w.visit,
    ...(loc.note ? { note: loc.note } : {}),
    phone: ukPhone(loc.phone ?? b.phone ?? ''),
    email: b.email ?? '',
    book: b.bookingUrl ?? '#',
    cta: w.cta,
    photos: {
      hero: ph('hero'),
      about: ph('about'),
      cta: ph('cta'),
      d1: ph('detail-1'),
      d2: ph('detail-2'),
    },
    brand: o.brand ?? s.palette,
  }
}
