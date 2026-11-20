// A page from library blocks (docs/m0/16-block-library.md): one block per section, drawn from the
// whole registry (core, Tailark, Shadcn UI Blocks, Efferd), the business's theme as shadcn tokens,
// rendered on the server to finished HTML.

import { renderToStaticMarkup } from 'react-dom/server'
import { motionFor } from './motion.ts'
import { type Entry, fits, KINDS, type Kind, REGISTRY } from './registry.ts'
import type { Theme } from './theme.ts'
import { hasVisit, type SiteContent } from './ui.tsx'

/** Which block (by registry id) fills each section; a missing kind is left out of the page. */
export type Plan = Partial<Record<Kind, string>>

const byId = new Map(REGISTRY.map((e) => [e.id, e]))

/** Sections every page has; the others appear only when the content can fill them. */
const ALWAYS: Kind[] = ['hero', 'about', 'offer', 'reasons', 'gallery', 'cta', 'footer']
/** Sections a concept may add or leave out; the rest of a page is always there. */
const OPTIONAL: Kind[] = ['reasons', 'gallery', 'statement', 'steps', 'audience', 'faq']

function random(seed: string) {
  let h = 2166136261
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    h ^= h >>> 16
    return (h >>> 0) / 4294967296
  }
}

/** Whether a block shows a photo (drawn once with this content and looked at). */
const showsPhoto = (e: Entry, c: SiteContent) =>
  renderToStaticMarkup(<e.component c={c} />).includes('<img')

/**
 * Plans drawn from a seed for this content: every plan opens with a different hero. With
 * `photos: false` (nothing fitting was found) only blocks without photos are used, and sections
 * that have none, such as galleries, are left out: a wrong photo is worse than none.
 */
export function plans(
  seed: string,
  n: number,
  c: SiteContent,
  o: {
    photos?: boolean
    extras?: Kind[]
    /**
     * Jev's fit for each block, by kind and id (docs/m0/23-jev-does-more.md). With it, the first
     * plan takes the best-fitting block for every section and the others draw by fit; without
     * it, blocks are drawn at random.
     */
    weights?: Partial<Record<Kind, Record<string, number>>>
  } = {},
): Plan[] {
  const rand = random(seed)
  const w = (k: Kind, e: Entry) => o.weights?.[k]?.[e.id] ?? 0
  const pick = (xs: Entry[], k: Kind, first: boolean) => {
    if (!o.weights?.[k] || !xs.length) return xs[Math.floor(rand() * xs.length)]
    if (first) return [...xs].sort((a, b) => w(k, b) - w(k, a))[0]
    const ws = xs.map((e) => w(k, e) + 1e-6)
    let r = rand() * ws.reduce((a, b) => a + b, 0)
    for (const [i, e] of xs.entries()) {
      r -= ws[i] ?? 0
      if (r <= 0) return e
    }
    return xs[0]
  }
  // With `extras` (the concept's pick, docs/m0/22-concept.md), the optional sections appear only
  // when picked, and no block brings one in that was not.
  const left = (k: Kind) => !!o.extras && OPTIONAL.includes(k) && !o.extras.includes(k)
  const of = (k: Kind) =>
    REGISTRY.filter(
      (e) =>
        e.kind === k &&
        fits(e, c) &&
        !(e.covers ?? []).some(left) &&
        (o.photos !== false || !showsPhoto(e, c)),
    )
  // Openings in order of use: the best fit first, then a draw weighted by fit (or at random).
  const heroes = o.weights?.hero
    ? of('hero')
        .map((e) => ({ e, key: rand() ** (1 / (w('hero', e) ** 2 + 1e-6)) }))
        .sort((a, b) => b.key - a.key)
        .map((x) => x.e)
    : of('hero').sort(() => rand() - 0.5)
  if (o.weights?.hero) {
    const best = [...heroes].sort((a, b) => w('hero', b) - w('hero', a))[0]
    if (best) {
      heroes.splice(heroes.indexOf(best), 1)
      heroes.unshift(best)
    }
  }
  const wanted = (k: Kind) =>
    !left(k) &&
    (ALWAYS.includes(k) ||
      (k === 'contact' && hasVisit(c)) ||
      ((k === 'faq' || k === 'stats' || k === 'testimonials' || k === 'team') && !!c[k]?.length) ||
      (k === 'statement' && !!c.statement) ||
      ((k === 'steps' || k === 'audience') && !!c[k]?.items.length))

  return Array.from({ length: n }, (_, i) => {
    const plan: Plan = {}
    const hero = heroes[i % heroes.length]
    if (hero) plan.hero = hero.id
    const skip = new Set<Kind>(hero?.covers ?? [])
    if (hero?.includesHeader) skip.add('header')
    for (const k of KINDS) {
      if (k === 'hero' || skip.has(k) || (k !== 'header' && !wanted(k))) continue
      const e = pick(of(k), k, i === 0)
      if (!e) continue
      plan[k] = e.id
      for (const s of e.covers ?? []) skip.add(s)
    }
    return plan
  })
}

export const describePlan = (p: Plan) =>
  KINDS.filter((k) => p[k])
    .map((k) => p[k])
    .join(' · ')

export function renderSite(
  c: SiteContent,
  plan: Plan,
  t: Theme,
  o: { css: string; grade?: boolean },
): string {
  const block = (k: Kind) => {
    const id = plan[k]
    const C = id ? byId.get(id)?.component : undefined
    return C ? <C key={k} c={c} /> : null
  }
  const body = renderToStaticMarkup(
    <>
      {block('header')}
      {block('hero')}
      <main>{KINDS.filter((k) => !['header', 'hero', 'footer'].includes(k)).map(block)}</main>
      {block('footer')}
    </>,
  )
  const esc = (s: string) => s.replace(/[&<>"]/g, (x) => `&#${x.charCodeAt(0)};`)
  // Motion only for pages with a moving block (motion.ts); none otherwise.
  const m = motionFor(body)
  return `<!doctype html><html lang="en"${t.dark ? ' class="dark"' : ''}><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(c.name)}: ${esc(c.tagline)}</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="${t.fontsHref}"><style>${o.css}${t.css}</style>${m.head}</head><body${o.grade ? ' class="photo-grade"' : ''}>${body}${m.end}</body></html>`
}
